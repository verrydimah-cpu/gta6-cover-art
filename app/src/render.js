// render.js — the one canvas renderer of Vice Cover Studio.
//
// A single function paints a whole cover — panels, grades, dividers,
// film finish and lettering — and it drives both the on-screen preview
// and the PNG export, so what the editor shows is exactly what the
// download contains. Everything is drawn from the plain state object
// the editor keeps; nothing here reads the DOM.

import { GRADES, filterFor } from './grades.js';
import { LAYOUTS, panelBBox } from './layouts.js';
import { drawBackdrop, drawCornerDressing, seeded } from './decor.js';

export const EXPORT_SIZES = {
  square: { id: 'square', name: 'Square 1080 × 1080', w: 1080, h: 1080 },
  portrait: { id: 'portrait', name: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  wide: { id: 'wide', name: 'Wide 1920 × 1080', w: 1920, h: 1080 },
};

function tracePoly(ctx, poly, W, H) {
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H)));
  ctx.closePath();
}

function shadeAlpha(rgba, scale) {
  const m = rgba.match(/rgba?\(([^)]+)\)/);
  if (!m) return rgba;
  const parts = m[1].split(',').map((s) => s.trim());
  const a = parts.length > 3 ? parseFloat(parts[3]) : 1;
  return `rgba(${parts[0]},${parts[1]},${parts[2]},${(a * scale).toFixed(3)})`;
}

// Draw one photo into a panel box with cover-fit maths: the photo is
// scaled to cover the box, then the panel's zoom and drag offsets move
// the crop window. dx/dy are fractions of the overflow.
export function drawPhotoCover(ctx, img, bx, by, bw, bh, crop) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const zoom = Math.max(1, crop.zoom || 1);
  const scale = Math.max(bw / iw, bh / ih) * zoom;
  const dw = iw * scale, dh = ih * scale;
  const ox = bx - (dw - bw) * (0.5 + (crop.dx || 0));
  const oy = by - (dh - bh) * (0.5 + (crop.dy || 0));
  ctx.drawImage(img, ox, oy, dw, dh);
}

function paintPanel(ctx, state, grade, layout, index, W, H, photos) {
  const poly = layout.panels[index];
  const panel = state.panels[index] || {};
  const bb = panelBBox(poly);
  const bx = bb.x0 * W, by = bb.y0 * H, bw = bb.w * W, bh = bb.h * H;
  const punch = panel.punch ?? 1;
  ctx.save();
  tracePoly(ctx, poly, W, H);
  ctx.clip();
  drawBackdrop(ctx, grade, bx, by, bw, bh, index);
  const photo = panel.photo ? photos.get(panel.photo) : null;
  if (photo && photo.img) {
    ctx.save();
    ctx.filter = filterFor(grade, punch);
    drawPhotoCover(ctx, photo.img, bx, by, bw, bh, panel);
    ctx.restore();
    // duotone wash over the photograph, alpha breathing with punch
    const wash = ctx.createLinearGradient(0, by, 0, by + bh);
    const scale = 0.45 + 0.55 * punch;
    for (const [stop, colour] of grade.wash) wash.addColorStop(stop, shadeAlpha(colour, scale));
    ctx.fillStyle = wash;
    ctx.fillRect(bx, by, bw, bh);
    drawCornerDressing(ctx, grade, bx, by, bw, bh, index);
  }
  ctx.restore();
}

function strokeDividers(ctx, state, grade, layout, W, H) {
  const lw = Math.max(3, W * 0.011);
  ctx.save();
  ctx.lineJoin = 'round';
  for (const poly of layout.panels) {
    tracePoly(ctx, poly, W, H);
    if (state.divider === 'chrome') {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#f8f8fa'); g.addColorStop(0.28, '#8a8f9c');
      g.addColorStop(0.5, '#e8ecf2'); g.addColorStop(0.72, '#565b68');
      g.addColorStop(1, '#dfe3ea');
      ctx.strokeStyle = g;
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(10,10,16,0.55)';
      ctx.lineWidth = Math.max(1, lw * 0.18);
      ctx.stroke();
    } else if (state.divider === 'neon') {
      ctx.shadowColor = grade.glow;
      ctx.shadowBlur = lw * 2.4;
      ctx.strokeStyle = grade.glow;
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      ctx.lineWidth = Math.max(1.2, lw * 0.32);
      ctx.stroke();
    } else {
      ctx.strokeStyle = grade.frame;
      ctx.lineWidth = lw;
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Seeded grain: one small noise tile, generated once per render size
// family, laid over the collage as a whisper before the lettering.
let grainTile = null;
function makeGrainTile() {
  const c = document.createElement('canvas');
  c.width = 140; c.height = 140;
  const g = c.getContext('2d');
  const img = g.createImageData(140, 140);
  const rand = seeded(20261118);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 118 + Math.floor(rand() * 120);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

function applyFilmFinish(ctx, state, grade, W, H) {
  if (state.grain) {
    if (!grainTile) grainTile = makeGrainTile();
    ctx.save();
    ctx.globalAlpha = 0.055;
    ctx.globalCompositeOperation = 'overlay';
    const pat = ctx.createPattern(grainTile, 'repeat');
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (state.leak) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const burn = (x, y, r, colour) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, colour);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };
    burn(W * 0.04, H * 0.02, W * 0.55, 'rgba(255,120,60,0.34)');
    burn(W * 0.98, H * 0.96, W * 0.5, 'rgba(255,46,136,0.26)');
    ctx.restore();
  }
  const ht = state.halftone || 0;
  if (ht > 0) {
    // halftone dots marching across the bottom-left corner patch
    ctx.save();
    ctx.fillStyle = grade.frame;
    const cell = W * 0.016;
    const rows = 9;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < rows - r; c++) {
        const x = c * cell + cell * 0.6, y = H - r * cell - cell * 0.6;
        const rad = cell * 0.34 * ht * (1 - r / (rows + 2));
        if (rad < 0.4) continue;
        ctx.globalAlpha = 0.5 * ht;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

function gradientFrom(ctx, stops, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((colour, i) => g.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), colour));
  return g;
}

const CHROME_STOPS = ['#fdfdff', '#aeb6c4', '#f4f6fa', '#6d7484', '#e8ecf4', '#3f4450'];

function drawLettering(ctx, state, grade, W, H) {
  const title = (state.title || '').trim();
  if (!title) return;
  const bottom = state.captionPos !== 'top';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  // backing band so the type sits on the art like a printed cover
  const bandH = H * (state.subtitle ? 0.24 : 0.17);
  const bandY = bottom ? H - bandH : 0;
  const bandGrad = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  bandGrad.addColorStop(bottom ? 0 : 1, 'rgba(0,0,0,0)');
  bandGrad.addColorStop(bottom ? 1 : 0, grade.band);
  ctx.fillStyle = bandGrad;
  ctx.fillRect(0, bandY, W, bandH);

  let size = H * 0.115;
  const fontFor = (s) => `400 ${s}px Anton, 'Arial Black', sans-serif`;
  ctx.font = fontFor(size);
  const maxW = W * 0.92;
  const tw = ctx.measureText(title.toUpperCase()).width;
  if (tw > maxW) { size *= maxW / tw; ctx.font = fontFor(size); }
  const titleY = bottom ? H - H * 0.085 : size + H * 0.045;

  const style = state.captionStyle || 'sunset';
  let fill;
  if (style === 'chrome') fill = gradientFrom(ctx, CHROME_STOPS, 0, titleY - size, 0, titleY);
  else if (style === 'neon') fill = gradientFrom(ctx, grade.neonFill, 0, titleY - size, 0, titleY);
  else fill = gradientFrom(ctx, grade.titleFill, 0, titleY - size, 0, titleY);

  const outlineScale = style === 'neon' ? 0.55 : 1;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  if (style === 'neon') { ctx.shadowColor = grade.glow; ctx.shadowBlur = size * 0.32; }
  ctx.strokeStyle = '#160a2a';
  ctx.lineWidth = size * 0.1 * (state.outline ?? 1) * outlineScale;
  ctx.strokeText(title.toUpperCase(), W / 2, titleY);
  ctx.fillStyle = fill;
  ctx.fillText(title.toUpperCase(), W / 2, titleY);
  ctx.shadowBlur = 0;

  const sub = (state.subtitle || '').trim();
  if (sub) {
    const subSize = size * 0.34 * (state.subSize ?? 1);
    ctx.font = `400 ${subSize}px Anton, 'Arial Black', sans-serif`;
    const subY = bottom ? titleY + subSize * 1.25 : titleY + subSize * 1.5;
    ctx.lineWidth = subSize * 0.14 * (state.outline ?? 1) * outlineScale;
    ctx.strokeStyle = '#160a2a';
    ctx.strokeText(sub.toUpperCase(), W / 2, subY);
    ctx.fillStyle = grade.subtitle;
    ctx.fillText(sub.toUpperCase(), W / 2, subY);
  }
  ctx.restore();
}

// Canvas unsharp mask over the finished painting, lettering included:
// out = orig + amount * (orig - blur). The blur comes from drawing the
// canvas onto a scratch canvas through a blur filter. Any failure to
// read pixels back (a tainted canvas) skips the finish quietly.
export function applySharp(ctx, W, H, amount) {
  if (!amount || amount <= 0) return;
  try {
    const src = ctx.getImageData(0, 0, W, H);
    const scratch = document.createElement('canvas');
    scratch.width = W; scratch.height = H;
    const sctx = scratch.getContext('2d');
    sctx.filter = `blur(${Math.max(1, Math.round(W / 360))}px)`;
    sctx.drawImage(ctx.canvas, 0, 0);
    const blurred = sctx.getImageData(0, 0, W, H);
    const a = src.data, b = blurred.data;
    for (let i = 0; i < a.length; i += 4) {
      for (let k = 0; k < 3; k++) {
        const v = a[i + k] + amount * (a[i + k] - b[i + k]);
        a[i + k] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
    ctx.putImageData(src, 0, 0);
  } catch (err) {
    void err; // finish is optional; the cover is already painted
  }
}

// Paint the whole cover described by state into ctx at W x H.
export function renderCover(ctx, state, W, H, photos) {
  const grade = GRADES[state.grade] || GRADES.vice;
  const layout = LAYOUTS[state.layout] || LAYOUTS.hero;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = grade.sky[0];
  ctx.fillRect(0, 0, W, H);
  const count = layout.panels.length;
  for (let i = 0; i < count; i++) paintPanel(ctx, state, grade, layout, i, W, H, photos);
  strokeDividers(ctx, state, grade, layout, W, H);
  applyFilmFinish(ctx, state, grade, W, H);
  // outer frame in the grade's frame colour
  ctx.strokeStyle = grade.frame;
  ctx.lineWidth = Math.max(4, W * 0.014);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
  // a hairline just inside the frame, the way printed covers keyline art
  ctx.strokeStyle = 'rgba(10,4,24,0.35)';
  ctx.lineWidth = Math.max(1, W * 0.002);
  const inset = W * 0.017;
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  drawLettering(ctx, state, grade, W, H);
  ctx.restore();
  if (state.sharp) applySharp(ctx, W, H, state.sharpAmt ?? 0.6);
}
