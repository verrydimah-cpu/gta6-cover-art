// render.js — the one renderer of Vice Cover Studio.
//
// renderCover(canvas, state, images) paints a complete cover onto
// any canvas at whatever size that canvas is. The live preview and
// the PNG export call this exact function, so what the user sees is
// byte-for-byte the composition they download — only the resolution
// changes. Everything is drawn from `state`; nothing is read from
// the DOM, which keeps the renderer testable and deterministic.

import { layoutById, panelBounds } from './layouts.js';
import { gradeById, filterFor, rgb } from './grades.js';
import { drawDecor } from './decor.js';

export const EXPORT_SIZES = [
  { id: 'square', name: 'Square post', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait post', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide / landscape', w: 1920, h: 1080 },
];

export const DIVIDERS = [
  { id: 'cream', name: 'Cream' },
  { id: 'chrome', name: 'Chrome' },
  { id: 'neon', name: 'Neon glow' },
];

export const LETTERING = [
  { id: 'sunset', name: 'Sunset Gradient' },
  { id: 'chrome', name: 'Chrome' },
  { id: 'neon', name: 'Neon Glow' },
];

function tracePath(ctx, points, W, H) {
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x * W, p.y * H);
    else ctx.lineTo(p.x * W, p.y * H);
  });
  ctx.closePath();
}

// The backdrop a panel shows before a photo lands in it: the grade's
// sunset sky, top colour to bottom colour.
function paintSky(ctx, grade, x, y, w, h) {
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  grade.sky.forEach((colour, i) => {
    grad.addColorStop(i / (grade.sky.length - 1), colour);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}

// Draw one photo into one panel: cover-fit the image over the panel
// bounds, then let the crop (dx, dy in -1..1, zoom >= 0.35) slide and
// scale it. The polygon clip does the shaping.
function paintPhoto(ctx, img, bounds, crop, W, H) {
  const bw = bounds.w * W;
  const bh = bounds.h * H;
  const bx = bounds.minX * W;
  const by = bounds.minY * H;
  const zoom = Math.max(0.35, crop.zoom || 1);
  const scale = Math.max(bw / img.naturalWidth, bh / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const slackX = Math.max(0, dw - bw);
  const slackY = Math.max(0, dh - bh);
  const dx = bx + (bw - dw) / 2 + (crop.dx || 0) * slackX * 0.5;
  const dy = by + (bh - dh) / 2 + (crop.dy || 0) * slackY * 0.5;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// The duotone wash: shadow colour multiplied into the whole panel,
// highlight colour screened back, each at the grade's strength. Two
// full-bounds fills — cheap, and they tie every photo together.
function paintWash(ctx, grade, bounds, W, H) {
  const x = bounds.minX * W;
  const y = bounds.minY * H;
  const w = bounds.w * W;
  const h = bounds.h * H;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = grade.tint;
  ctx.fillStyle = rgb(grade.shadow);
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = grade.tint * 0.8;
  ctx.fillStyle = rgb(grade.highlight);
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function strokeDivider(ctx, points, W, H, style, grade) {
  tracePath(ctx, points, W, H);
  const unit = Math.min(W, H);
  if (style === 'chrome') {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.35, '#94a3b8');
    grad.addColorStop(0.55, '#e2e8f0');
    grad.addColorStop(0.75, '#64748b');
    grad.addColorStop(1, '#f1f5f9');
    ctx.strokeStyle = grad;
    ctx.lineWidth = Math.max(5, unit * 0.009);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.lineWidth = Math.max(1.2, unit * 0.0018);
    ctx.stroke();
  } else if (style === 'neon') {
    ctx.save();
    ctx.shadowColor = grade.glow || '#ff5fa2';
    ctx.shadowBlur = unit * 0.03;
    ctx.strokeStyle = '#fdf4ff';
    ctx.lineWidth = Math.max(3.4, unit * 0.0055);
    ctx.stroke();
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = grade.glow || '#ff5fa2';
    ctx.lineWidth = Math.max(1.4, unit * 0.0022);
    ctx.stroke();
  } else { // cream
    ctx.strokeStyle = '#fff6df';
    ctx.lineWidth = Math.max(4.4, unit * 0.0075);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(88, 28, 60, 0.35)';
    ctx.lineWidth = Math.max(1.1, unit * 0.0016);
    ctx.stroke();
  }
}

// Seeded film grain: one small noise tile, generated from the cover
// seed, stamped across the frame with 'overlay' so it sits in the
// print rather than on it.
function paintGrain(ctx, W, H, seed) {
  const tile = document.createElement('canvas');
  tile.width = 180; tile.height = 180;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(180, 180);
  let a = (seed >>> 0) * 2654435761 % 4294967296 || 97;
  for (let i = 0; i < data.data.length; i += 4) {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    const v = 96 + (a % 64);
    data.data[i] = v; data.data[i + 1] = v; data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// A soft wedge of warm light leaking in from the top-left corner.
function paintLightLeak(ctx, W, H) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(W, H) * 0.85);
  grad.addColorStop(0, 'rgba(255, 166, 88, 0.55)');
  grad.addColorStop(0.35, 'rgba(255, 94, 98, 0.28)');
  grad.addColorStop(1, 'rgba(255, 94, 98, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Halftone dots, strongest toward the corners: a screen-print echo.
function paintHalftone(ctx, W, H, strength) {
  if (strength <= 0.01) return;
  const step = Math.max(9, Math.min(W, H) * 0.016);
  ctx.save();
  ctx.fillStyle = 'rgba(24, 6, 38, 0.5)';
  ctx.globalAlpha = Math.min(0.5, strength * 0.55);
  const cx = W / 2; const cy = H / 2;
  const maxDist = Math.hypot(cx, cy);
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      const d = Math.hypot(x - cx, y - cy) / maxDist;
      const r = step * 0.3 * d * d;
      if (r < 0.4) continue;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function paintVignette(ctx, W, H) {
  const grad = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.78,
  );
  grad.addColorStop(0, 'rgba(16, 2, 28, 0)');
  grad.addColorStop(1, 'rgba(16, 2, 28, 0.34)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

// Canvas unsharp mask: out = orig + amount * (orig - blur). The blur
// comes from a half-size copy blurred by the canvas filter, which is
// fast enough at export sizes and needs no pixel-loop convolution.
export function sharpen(canvas, amount) {
  if (!amount || amount <= 0) return;
  const W = canvas.width;
  const H = canvas.height;
  const blurred = document.createElement('canvas');
  blurred.width = W; blurred.height = H;
  const bctx = blurred.getContext('2d');
  bctx.filter = `blur(${Math.max(1.2, W / 640).toFixed(1)}px)`;
  bctx.drawImage(canvas, 0, 0);
  const ctx = canvas.getContext('2d');
  const src = ctx.getImageData(0, 0, W, H);
  const blurData = bctx.getImageData(0, 0, W, H).data;
  const px = src.data;
  for (let i = 0; i < px.length; i += 4) {
    px[i] = px[i] + amount * (px[i] - blurData[i]);
    px[i + 1] = px[i + 1] + amount * (px[i + 1] - blurData[i + 1]);
    px[i + 2] = px[i + 2] + amount * (px[i + 2] - blurData[i + 2]);
  }
  ctx.putImageData(src, 0, 0);
}

// --- captions ---------------------------------------------------------

function letteringFill(ctx, style, y0, y1, grade) {
  if (style === 'chrome') {
    const grad = ctx.createLinearGradient(0, y0, 0, y1);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.42, '#c3ccd6');
    grad.addColorStop(0.55, '#f4f7fa');
    grad.addColorStop(0.72, '#7d8896');
    grad.addColorStop(1, '#e8edf2');
    return grad;
  }
  if (style === 'neon') return '#ffffff';
  const grad = ctx.createLinearGradient(0, y0, 0, y1);
  grad.addColorStop(0, '#ffe259');
  grad.addColorStop(0.55, '#ff7518');
  grad.addColorStop(1, '#ff2e88');
  return grad;
}

function fitFontSize(ctx, text, weight, maxWidth, startSize) {
  let size = startSize;
  while (size > 12) {
    ctx.font = `${weight} ${size}px Anton, 'Arial Narrow', sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  }
  return size;
}

function paintCaption(ctx, state, W, H, grade) {
  const title = (state.title || '').trim();
  const subtitle = (state.subtitle || '').trim();
  if (!title && !subtitle) return;
  const unit = Math.min(W, H);
  const atTop = state.captionPos !== 'bottom';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  try { ctx.letterSpacing = '1px'; } catch { /* older engines */ }

  const outline = Math.max(0, (state.outline ?? 0.55)) * unit * 0.016;
  const titleSize = fitFontSize(ctx, title || ' ', 400, W * 0.92, unit * 0.155);
  const subScale = state.subSize ?? 0.34;
  const subSize = Math.max(11, titleSize * subScale);
  const blockH = (title ? titleSize : 0) + (subtitle ? subSize * 1.55 : 0);
  const margin = unit * 0.045;
  const top = atTop ? margin : H - margin - blockH;
  let cursor = top;

  if (title) {
    ctx.font = `400 ${titleSize}px Anton, 'Arial Narrow', sans-serif`;
    const baseline = cursor + titleSize * 0.88;
    if (state.lettering === 'neon') {
      ctx.shadowColor = grade.glow || '#22d3ee';
      ctx.shadowBlur = unit * 0.035;
    } else {
      ctx.shadowColor = 'rgba(20, 4, 30, 0.45)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = unit * 0.006;
    }
    if (outline > 0.2) {
      ctx.lineWidth = outline;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = state.lettering === 'neon' ? '#d6246e' : '#2a0a2e';
      ctx.strokeText(title, W / 2, baseline);
      if (state.lettering === 'neon') ctx.strokeText(title, W / 2, baseline);
    }
    ctx.fillStyle = letteringFill(ctx, state.lettering, cursor, cursor + titleSize, grade);
    ctx.fillText(title, W / 2, baseline);
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetY = 0;
    cursor += titleSize * 1.04;
  }
  if (subtitle) {
    ctx.font = `400 ${subSize}px Anton, 'Arial Narrow', sans-serif`;
    try { ctx.letterSpacing = `${Math.max(2, subSize * 0.22)}px`; } catch { /* fine */ }
    const baseline = cursor + subSize * 1.25;
    ctx.lineWidth = Math.max(1, outline * 0.4);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(26, 6, 34, 0.8)';
    if (outline > 0.2) ctx.strokeText(subtitle, W / 2, baseline);
    ctx.fillStyle = state.lettering === 'chrome' ? '#eef2f6' : '#fff6df';
    ctx.fillText(subtitle, W / 2, baseline);
    // A hairline rule under the subtitle, in the grade's glow
    // colour, ties the caption block to the poster's palette.
    if (grade.glow) {
      const ruleW = Math.min(W * 0.34, ctx.measureText(subtitle).width * 0.8);
      ctx.fillStyle = grade.glow;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(W / 2 - ruleW / 2, baseline + subSize * 0.42, ruleW, Math.max(2, unit * 0.004));
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}

// --- the cover itself --------------------------------------------------

export function renderCover(canvas, state, images) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);

  paintSky(ctx, grade, 0, 0, W, H);

  layout.panels.forEach((points, i) => {
    const bounds = panelBounds(points);
    const panel = state.panels[i] || {};
    const img = panel.photo != null ? images[panel.photo] : null;
    ctx.save();
    tracePath(ctx, points, W, H);
    ctx.clip();
    paintSky(ctx, grade, bounds.minX * W, bounds.minY * H, bounds.w * W, bounds.h * H);
    if (img) {
      ctx.save();
      ctx.filter = filterFor(grade, panel.punch ?? 1);
      paintPhoto(ctx, img, bounds, panel, W, H);
      ctx.restore();
      paintWash(ctx, grade, bounds, W, H);
    }
    if (state.decor !== false) {
      const ink = i === 0 && !img ? 'rgba(255, 246, 223, 0.9)' : 'rgba(22, 8, 40, 0.62)';
      drawDecor(ctx, {
        minX: bounds.minX * W, minY: bounds.minY * H,
        maxX: bounds.maxX * W, maxY: bounds.maxY * H,
        w: bounds.w * W, h: bounds.h * H,
      }, state.seed || 7, i, ink);
    }
    ctx.restore();
  });

  // Dividers are stroked after all panels so seams sit on top.
  layout.panels.forEach((points) => strokeDivider(ctx, points, W, H, state.divider, grade));

  // The grade's printed frame around the whole sheet.
  if (grade.frame) {
    ctx.save();
    ctx.strokeStyle = grade.frame;
    ctx.lineWidth = Math.max(6, Math.min(W, H) * 0.014);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
    ctx.restore();
  }

  paintVignette(ctx, W, H);
  if (state.leak) paintLightLeak(ctx, W, H);
  paintHalftone(ctx, W, H, state.halftone ?? 0);
  paintCaption(ctx, state, W, H, grade);
  if (state.grain !== false) paintGrain(ctx, W, H, state.seed || 7);
  if (state.sharp) sharpen(canvas, state.sharpAmount ?? 0.6);
  return canvas;
}
