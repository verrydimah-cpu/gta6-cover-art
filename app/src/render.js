// render.js — the one canvas renderer of Vice Cover Studio.
//
// renderCover draws a complete cover onto any 2D context at any size. The
// live preview and the exported PNG call this same function with the same
// state, so what the maker sees is byte-for-byte the drawing they export —
// only the canvas size changes. Everything is drawn from the state and the
// loaded photographs: panels with their grade and decor, slash role tags,
// the caption lettering, the ensemble poster's furniture, and the film
// finish (grain, vignette and the in-app Sharp pass) baked in last.

import { skyGradient, sunGlowGradient } from './grades.js';
import { drawPanelDecor } from './decor.js';

export const CAPTION_STYLES = [
  { id: 'chrome', name: 'Chrome poster' },
  { id: 'neon', name: 'Neon glow' },
  { id: 'caps', name: 'Gallery caps' },
];

export const DIVIDER_STYLES = [
  { id: 'gold', name: 'Thin gold frames' },
  { id: 'neon', name: 'Neon glow' },
  { id: 'slash', name: 'Angled slashes' },
  { id: 'white', name: 'Clean white' },
];

export const EXPORT_SIZES = [
  { id: 'square', name: 'Square', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide', w: 1920, h: 1080 },
];

const ANTON = '"Anton", "Arial Narrow", sans-serif';
// The script face for subtitles. Note the canvas font shorthand wants
// style and weight before the size, so this is a builder, not a suffix.
const scriptFont = (size) => `italic 600 ${size}px Georgia, "Times New Roman", serif`;

// Shrink a font size until the text fits the width the poster allows.
function fitSize(ctx, text, family, maxWidth, startSize, minSize = 10) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size *= 0.94;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

function setSpacing(ctx, value) {
  try {
    ctx.letterSpacing = value;
  } catch (err) {
    // Older engines ignore letterfit spacing; the layout still holds.
  }
}

// The panel outline: a plain rectangle, or a parallelogram when the
// layout or the divider style asks for angled cuts.
function panelPath(ctx, rect, slantPx) {
  const { x, y, w, h } = rect;
  ctx.beginPath();
  if (Math.abs(slantPx) < 0.5) {
    ctx.rect(x, y, w, h);
  } else {
    ctx.moveTo(x + slantPx, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - slantPx, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  }
}

function drawPhoto(ctx, rect, img, punch, view) {
  const grade = view.grade;
  const scale = Math.max(rect.w / img.width, rect.h / img.height) * punch.zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = rect.x + (rect.w - dw) * punch.fx + (punch.ox || 0) * rect.w;
  const dy = rect.y + (rect.h - dh) * punch.fy + (punch.oy || 0) * rect.h;
  ctx.save();
  ctx.filter = grade.filter;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  // The grade's light: a sun glow where the grade puts its sun, a warm
  // wash over everything, and a deepening toward the panel's foot.
  const glow = sunGlowGradient(
    ctx, grade,
    rect.x + rect.w * grade.sunX, rect.y + rect.h * grade.sunY,
    Math.max(rect.w, rect.h) * 0.85,
  );
  ctx.fillStyle = glow;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = grade.wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const foot = ctx.createLinearGradient(0, rect.y + rect.h * 0.55, 0, rect.y + rect.h);
  foot.addColorStop(0, 'rgba(0,0,0,0)');
  foot.addColorStop(1, grade.washBottom);
  ctx.fillStyle = foot;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function drawGradientPanel(ctx, rect, grade) {
  ctx.fillStyle = skyGradient(ctx, grade, rect.x, rect.y, rect.w, rect.h);
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  const glow = sunGlowGradient(
    ctx, grade,
    rect.x + rect.w * grade.sunX, rect.y + rect.h * grade.sunY,
    Math.max(rect.w, rect.h) * 0.9,
  );
  ctx.fillStyle = glow;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  // A low sun disc sitting on the panel's horizon.
  ctx.save();
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(rect.x + rect.w * grade.sunX, rect.y + rect.h * grade.sunY, Math.min(rect.w, rect.h) * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFrame(ctx, rect, slantPx, view, scale) {
  const grade = view.grade;
  panelPath(ctx, rect, slantPx);
  if (view.dividers === 'neon') {
    ctx.save();
    ctx.shadowColor = grade.neon;
    ctx.shadowBlur = 14 * scale;
    ctx.strokeStyle = grade.neon;
    ctx.lineWidth = 3 * scale;
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();
  } else if (view.dividers === 'slash') {
    ctx.strokeStyle = grade.backdrop[1];
    ctx.lineWidth = 12 * scale;
    ctx.stroke();
    ctx.strokeStyle = grade.frame;
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
  } else if (view.dividers === 'white') {
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();
  } else {
    // Thin gold frames: a dark keyline outside, brass, then a hair of cream.
    ctx.strokeStyle = 'rgba(16, 6, 14, 0.9)';
    ctx.lineWidth = 5 * scale;
    ctx.stroke();
    ctx.strokeStyle = grade.frame;
    ctx.lineWidth = 2.4 * scale;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 240, 200, 0.55)';
    ctx.lineWidth = 0.9 * scale;
    ctx.stroke();
  }
}

// The small angled black slash tag with white caps that names a panel's
// role — THE DRIVER, THE RIDE — tipped with a gold underline tick.
function drawRoleTag(ctx, rect, text, scale) {
  // The rect is already in device pixels, so the type size keys off it
  // directly — but a full-bleed collage panel is far bigger than a cast
  // panel, so the size is also capped against the cover's own scale or
  // the tags would shout over the photographs.
  const size = Math.max(11, Math.min(rect.w * 0.062, rect.h * 0.14, 34 * scale));
  ctx.save();
  ctx.font = `${size}px ${ANTON}`;
  const tw = ctx.measureText(text).width;
  const padX = size * 0.55;
  const tagW = tw + padX * 2;
  const tagH = size * 1.5;
  const tx = rect.x + rect.w * 0.045;
  const ty = rect.y + rect.h * 0.04;
  const skew = tagH * 0.32;
  ctx.beginPath();
  ctx.moveTo(tx + skew, ty);
  ctx.lineTo(tx + tagW, ty);
  ctx.lineTo(tx + tagW - skew, ty + tagH);
  ctx.lineTo(tx, ty + tagH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8, 5, 10, 0.92)';
  ctx.fill();
  ctx.fillStyle = '#ffb52e';
  ctx.fillRect(tx + skew * 0.4, ty + tagH - size * 0.16, tagW - skew * 0.8, size * 0.16);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, tx + tagW / 2, ty + tagH / 2 - size * 0.05);
  ctx.restore();
}

// The big display title. Chrome lettering is a warm metallic gradient —
// cream at the crown, apricot through the waist, hot pink at the foot —
// over a heavy plum outline with a soft drop shadow for depth.
function drawTitle(ctx, cx, baseline, maxWidth, view, sizeHint) {
  const text = (view.title || '').toUpperCase();
  if (!text) return 0;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const size = fitSize(ctx, text, ANTON, maxWidth, sizeHint);
  ctx.font = `${size}px ${ANTON}`;
  setSpacing(ctx, `${-size * 0.01}px`);
  if (view.captionStyle === 'neon') {
    ctx.shadowColor = view.grade.neon;
    ctx.shadowBlur = size * 0.32;
    ctx.lineWidth = size * 0.1;
    ctx.strokeStyle = view.grade.neon;
    ctx.strokeText(text, cx, baseline);
    ctx.fillStyle = '#fff2f8';
    ctx.fillText(text, cx, baseline);
  } else if (view.captionStyle === 'caps') {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.1;
    ctx.shadowOffsetY = size * 0.05;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, cx, baseline);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = view.grade.frame;
    const tw = ctx.measureText(text).width;
    ctx.fillRect(cx - tw / 2, baseline + size * 0.14, tw, size * 0.07);
  } else {
    ctx.shadowColor = 'rgba(10, 2, 12, 0.65)';
    ctx.shadowBlur = size * 0.06;
    ctx.shadowOffsetY = size * 0.07;
    ctx.lineWidth = size * 0.17;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2a0a24';
    ctx.strokeText(text, cx, baseline);
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetY = 0;
    const grad = ctx.createLinearGradient(0, baseline - size, 0, baseline);
    grad.addColorStop(0, '#fff3c4');
    grad.addColorStop(0.38, '#ffc46b');
    grad.addColorStop(0.55, '#ff8a5c');
    grad.addColorStop(0.78, '#ff5e8a');
    grad.addColorStop(1, '#e0218a');
    ctx.fillStyle = grad;
    ctx.fillText(text, cx, baseline);
    // A soft chrome sheen across the waist of the letters: the title is
    // filled a second time with a banded white gradient, so the highlight
    // lives inside the glyphs and never reads as a line across them.
    const sheen = ctx.createLinearGradient(0, baseline - size, 0, baseline);
    sheen.addColorStop(0, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.44, 'rgba(255,255,255,0)');
    sheen.addColorStop(0.52, 'rgba(255,255,255,0.38)');
    sheen.addColorStop(0.6, 'rgba(255,255,255,0)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillText(text, cx, baseline);
  }
  ctx.restore();
  return size;
}

// The script subtitle on its dark underlay, with a neon glow — the accent
// line that sits under the title on every cover this studio makes.
function drawSubtitle(ctx, cx, cy, maxWidth, view, sizeHint) {
  const text = view.subtitle || '';
  if (!text) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = sizeHint;
  ctx.font = scriptFont(size);
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size *= 0.94;
    ctx.font = scriptFont(size);
  }
  const tw = ctx.measureText(text).width;
  ctx.beginPath();
  ctx.ellipse(cx, cy, tw / 2 + size * 0.9, size * 1.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(16, 5, 18, 0.62)';
  ctx.fill();
  ctx.shadowColor = view.grade.neon;
  ctx.shadowBlur = size * 0.5;
  ctx.fillStyle = '#ffd7ec';
  ctx.fillText(text, cx, cy);
  ctx.shadowBlur = size * 0.22;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

// The ribbon tagline strip: dark band, brass border, spaced Anton caps.
function drawRibbon(ctx, cx, cy, maxWidth, view, sizeHint) {
  const text = (view.tagline || '').toUpperCase();
  if (!text) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setSpacing(ctx, `${sizeHint * 0.16}px`);
  const size = fitSize(ctx, text, ANTON, maxWidth * 0.9, sizeHint);
  ctx.font = `${size}px ${ANTON}`;
  const tw = ctx.measureText(text).width;
  const w = Math.min(maxWidth, tw + size * 2.4);
  const h = size * 1.9;
  ctx.fillStyle = 'rgba(10, 5, 14, 0.88)';
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  ctx.strokeStyle = view.grade.frame;
  ctx.lineWidth = Math.max(1.4, size * 0.07);
  ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  ctx.fillStyle = '#ffe9b0';
  ctx.fillText(text, cx, cy + size * 0.04);
  ctx.restore();
}

function drawStars(ctx, cx, cy, size, colour) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px Georgia, serif`;
  ctx.fillText('★ ★ ★ ★ ★', cx, cy);
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#f7f3ea';
  ctx.fillRect(x, y, w, h);
  let s = 987654321;
  const next = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  ctx.fillStyle = '#14100c';
  let bx = x + w * 0.06;
  while (bx < x + w * 0.9) {
    const bw = 1 + next() * w * 0.035;
    if (next() > 0.42) ctx.fillRect(bx, y + h * 0.08, bw, h * 0.68);
    bx += bw + w * 0.018;
  }
  ctx.font = `${h * 0.2}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText('8 901234 567890', x + w / 2, y + h * 0.9);
  ctx.restore();
}

function drawSeal(ctx, cx, cy, r, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(12, 6, 12, 0.55)';
  ctx.fill();
  ctx.lineWidth = r * 0.09;
  ctx.strokeStyle = grade.frame;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.lineWidth = r * 0.045;
  ctx.stroke();
  ctx.fillStyle = grade.frame;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${r * 0.52}px Georgia, serif`;
  ctx.fillText('★', cx, cy - r * 0.44);
  ctx.font = `${r * 0.42}px ${ANTON}`;
  ctx.fillText('BEST', cx, cy + r * 0.08);
  ctx.fillText('CAST', cx, cy + r * 0.48);
  ctx.restore();
}

// All the printed furniture of the ensemble poster: review strip up top,
// billing block, COMING SOON, the seal and the barcode down below. Every
// word is this studio's own, written for a fictional picture.
function drawEnsembleFurniture(ctx, W, H, view, scale) {
  const grade = view.grade;
  ctx.save();
  drawStars(ctx, W * 0.44, H * 0.03, H * 0.026, grade.frame);
  ctx.fillStyle = 'rgba(255, 244, 214, 0.95)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const quote = '“PURE SUNSET ADRENALINE — THE RIDE OF THE YEAR”';
  const qs = fitSize(ctx, quote, ANTON, W * 0.62, H * 0.021);
  ctx.font = `${qs}px ${ANTON}`;
  setSpacing(ctx, `${qs * 0.08}px`);
  ctx.fillText(quote, W * 0.44, H * 0.056);
  // The VOL. 1 corner box.
  ctx.strokeStyle = grade.frame;
  ctx.lineWidth = 2 * scale;
  ctx.strokeRect(W * 0.9, H * 0.014, W * 0.068, H * 0.036);
  ctx.fillStyle = grade.frame;
  ctx.font = `${H * 0.02}px ${ANTON}`;
  ctx.fillText('VOL. 1', W * 0.934, H * 0.033);
  // Title block overlapping the foot of the panels.
  const titleSize = drawTitle(ctx, W / 2, H * 0.775, W * 0.94, view, H * 0.185);
  drawSubtitle(ctx, W / 2, H * 0.822, W * 0.8, view, H * 0.037);
  // The ribbon is held right of the COMING SOON block so the two never
  // print over each other, however long the tagline runs.
  drawRibbon(ctx, W * 0.51, H * 0.878, W * 0.55, view, H * 0.02);
  // Coming soon, bottom left.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffe9b0';
  ctx.font = `${H * 0.02}px ${ANTON}`;
  ctx.fillText('COMING SOON', W * 0.038, H * 0.862);
  ctx.font = `${H * 0.011}px ${ANTON}`;
  ctx.fillStyle = 'rgba(255, 233, 176, 0.7)';
  ctx.fillText('A SUNSET REEL PRODUCTION', W * 0.038, H * 0.886);
  // The seal, bottom right.
  drawSeal(ctx, W * 0.918, H * 0.878, H * 0.036, grade);
  // The billing block: tiny condensed caps, fictional names only.
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 240, 205, 0.78)';
  const bill = fitSize(
    ctx,
    'VICE COVER STUDIO presents a SUNSET REEL production — a picture made of light',
    ANTON, W * 0.86, H * 0.0125,
  );
  ctx.font = `${bill}px ${ANTON}`;
  setSpacing(ctx, `${bill * 0.06}px`);
  ctx.fillText('VICE COVER STUDIO presents a SUNSET REEL production “VICE CITY”', W / 2, H * 0.922);
  ctx.fillText('starring MARA VOSS · JULES KANE · RIO DELMAR · SADIE LUX · music by THE PALM CLUB · edited by N. OKAFOR', W / 2, H * 0.944);
  ctx.fillText('director of photography L. MARSH · produced by T. IBARRA · directed by C. VALENTINE', W / 2, H * 0.964);
  drawBarcode(ctx, W * 0.9, H * 0.938, W * 0.07, H * 0.034);
  ctx.restore();
  return titleSize;
}

// Film grain: one deterministic noise tile, laid over the whole cover.
let grainTile = null;
function getGrainTile() {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 240;
  tile.height = 240;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(240, 240);
  let s = 123456789;
  const next = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(next() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  grainTile = tile;
  return tile;
}

function applyFinish(ctx, W, H, view) {
  // Grain that reads as photo texture, not dirt: fine tile, low alpha.
  ctx.save();
  ctx.globalAlpha = 0.075;
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(getGrainTile(), 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // Vignette: the corners fall away so the centre of the poster glows.
  const vg = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.78,
  );
  vg.addColorStop(0, 'rgba(8, 2, 10, 0)');
  vg.addColorStop(1, 'rgba(8, 2, 10, 0.4)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  // The in-app Sharp finish: a gentle contrast-and-colour pass that makes
  // edges and lettering read crisp at feed sizes.
  if (view.sharp > 0.02) {
    const tmp = document.createElement('canvas');
    tmp.width = W;
    tmp.height = H;
    tmp.getContext('2d').drawImage(ctx.canvas, 0, 0);
    ctx.save();
    ctx.filter = `contrast(${1 + 0.16 * view.sharp}) saturate(${1 + 0.12 * view.sharp}) brightness(${1 + 0.02 * view.sharp})`;
    ctx.drawImage(tmp, 0, 0);
    ctx.restore();
  }
}

// The whole cover. `view.panels` pairs each layout panel with the photo
// chosen for it (an image, or null for a gradient panel) and the maker's
// drag/zoom adjustments layered over the panel's tuned punch.
export function renderCover(ctx, W, H, view) {
  const grade = view.grade;
  const layout = view.layout;
  // `scale` ties every stroke and glow to the output size, so a 1080-wide
  // export and the small live preview draw the same poster, not two.
  const scale = Math.min(W, H) / 1080;
  ctx.save();
  // Backdrop: the ensemble sits on dark plum-brown; collages are full-bleed.
  if (layout.ensemble) {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, grade.backdrop[0]);
    bg.addColorStop(1, grade.backdrop[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = 2 * scale;
    [0.52, 0.62, 0.72].forEach((r) => {
      ctx.beginPath();
      ctx.arc(W * 0.97, H * 0.05, Math.min(W, H) * r * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  } else {
    ctx.fillStyle = skyGradient(ctx, grade, 0, 0, W, H);
    ctx.fillRect(0, 0, W, H);
  }

  const useSlash = view.dividers === 'slash';
  layout.panels.forEach((p, i) => {
    const rect = { x: p.x * W, y: p.y * H, w: p.w * W, h: p.h * H };
    const slantPx = (useSlash || layout.ensemble === false) && p.slant
      ? p.slant * rect.w
      : 0;
    const cell = view.panels[i] || { img: null };
    ctx.save();
    panelPath(ctx, rect, slantPx);
    ctx.clip();
    if (cell.img) {
      const punch = {
        fx: p.punch.fx, fy: p.punch.fy,
        zoom: p.punch.zoom * (cell.zoom || 1),
        ox: cell.ox || 0, oy: cell.oy || 0,
      };
      drawPhoto(ctx, rect, cell.img, punch, view);
      drawPanelDecor(ctx, rect, grade, 0.14, i);
    } else {
      drawGradientPanel(ctx, rect, grade);
      drawPanelDecor(ctx, rect, grade, 0.9, i);
    }
    ctx.restore();
    drawFrame(ctx, rect, slantPx, view, scale);
  });

  if (layout.ensemble) {
    layout.panels.forEach((p, i) => {
      const rect = { x: p.x * W, y: p.y * H, w: p.w * W, h: p.h * H };
      if (p.tag) drawRoleTag(ctx, rect, p.tag, scale);
    });
    drawEnsembleFurniture(ctx, W, H, view, scale);
  } else {
    // Collage caption: a dusk underlay rising from the foot, then the
    // title, subtitle accent line and ribbon stacked over the panels.
    const under = ctx.createLinearGradient(0, H * 0.58, 0, H);
    under.addColorStop(0, 'rgba(10, 3, 14, 0)');
    under.addColorStop(0.55, 'rgba(10, 3, 14, 0.34)');
    under.addColorStop(1, 'rgba(10, 3, 14, 0.62)');
    ctx.fillStyle = under;
    ctx.fillRect(0, H * 0.58, W, H * 0.42);
    layout.panels.forEach((p, i) => {
      const rect = { x: p.x * W, y: p.y * H, w: p.w * W, h: p.h * H };
      if (p.tag && view.showTags) drawRoleTag(ctx, rect, p.tag, scale);
    });
    const titleSize = drawTitle(ctx, W / 2, H * 0.9, W * 0.92, view, H * 0.16);
    drawSubtitle(ctx, W / 2, H * 0.955, W * 0.78, view, H * 0.032);
    // The ribbon rides above the title, never across it: its centre is
    // set from the title's actual drawn size.
    if (view.tagline) drawRibbon(ctx, W / 2, H * 0.9 - titleSize * 1.12, W * 0.66, view, H * 0.017);
  }

  applyFinish(ctx, W, H, view);
  ctx.restore();
}
