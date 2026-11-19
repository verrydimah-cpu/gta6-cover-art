// render.js — the single cover renderer for VICE COVER STUDIO.
// renderCover() draws a complete cover onto any 2D context; the live
// preview and every PNG export call this exact function, so what you
// see in the studio is byte-for-byte the art you download.
// Draw order: background, panels, dividers, title block, film finish.

import { getLayout, panelBounds } from './layouts.js';
import { getGrade } from './grades.js';
import { drawDecor, drawStarField } from './decor.js';

function panelPath(ctx, panel, W, H) {
  ctx.beginPath();
  panel.points.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x * W, y * H); else ctx.lineTo(x * W, y * H);
  });
  ctx.closePath();
}

// Draw an image so it covers the panel bounds, honouring the panel
// punch: zoom plus a focal point (0..1) that stays centred.
function drawPhotoCover(ctx, img, bounds, W, H, punch) {
  const bw = bounds.w * W, bh = bounds.h * H;
  const scale = Math.max(bw / img.width, bh / img.height) * (punch.zoom || 1);
  const dw = img.width * scale, dh = img.height * scale;
  const fx = punch.fx != null ? punch.fx : 0.5;
  const fy = punch.fy != null ? punch.fy : 0.5;
  let dx = bounds.minX * W + bw / 2 - fx * dw;
  let dy = bounds.minY * H + bh / 2 - fy * dh;
  dx = Math.min(bounds.minX * W, Math.max(bounds.minX * W + bw - dw, dx));
  dy = Math.min(bounds.minY * H, Math.max(bounds.minY * H + bh - dh, dy));
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPanelGradient(ctx, bounds, W, H, grade, index) {
  const g = ctx.createLinearGradient(bounds.minX * W, bounds.minY * H, bounds.maxX * W, bounds.maxY * H);
  const stops = grade.sky;
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(bounds.minX * W, bounds.minY * H, bounds.w * W, bounds.h * H);
  if (index === 0) drawStarField(ctx, W, H * 0.7, '#ffffff', 26, 13 + index);
}

function drawDividers(ctx, layout, W, H, grade, styleId) {
  const base = Math.max(4, W * 0.008);
  for (const panel of layout.panels) {
    panelPath(ctx, panel, W, H);
    if (styleId === 'shadow') {
      ctx.save();
      ctx.translate(base * 0.7, base * 0.9);
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = base;
      ctx.stroke();
      ctx.restore();
      panelPath(ctx, panel, W, H);
    }
    ctx.strokeStyle = styleId === 'clean' ? '#0b0b12' : grade.accent;
    ctx.lineWidth = styleId === 'chrome' ? base * 0.7 : base;
    ctx.stroke();
    if (styleId === 'chrome') {
      panelPath(ctx, panel, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = base * 0.22;
      ctx.stroke();
    }
    if (styleId === 'neon') {
      panelPath(ctx, panel, W, H);
      ctx.save();
      ctx.shadowColor = grade.glow;
      ctx.shadowBlur = base * 2.4;
      ctx.strokeStyle = grade.accent;
      ctx.lineWidth = base * 0.45;
      ctx.stroke();
      ctx.restore();
    }
  }
}

// Deterministic grain: a small seeded noise tile, tiled at low alpha.
let grainTile = null;
function getGrainTile() {
  if (grainTile) return grainTile;
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  const img = g.createImageData(128, 128);
  let s = 424243;
  for (let i = 0; i < img.data.length; i += 4) {
    s = (s * 16807) % 2147483647;
    const v = 96 + (s % 128);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grainTile = c;
  return c;
}

function applyFilmFinish(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.07;
  const tile = getGrainTile();
  for (let x = 0; x < W; x += 128) {
    for (let y = 0; y < H; y += 128) ctx.drawImage(tile, x, y);
  }
  ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.78);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(5,0,16,0.42)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

// In-app "Sharp finish": a true unsharp mask. Blur a copy, then add
// back (original - blurred) * amount via ImageData arithmetic.
export function applySharpFinish(canvas, amount) {
  if (!amount || amount <= 0) return;
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext('2d');
  const blurred = document.createElement('canvas');
  blurred.width = w; blurred.height = h;
  const bctx = blurred.getContext('2d');
  bctx.filter = 'blur(2px)';
  bctx.drawImage(canvas, 0, 0);
  const src = ctx.getImageData(0, 0, w, h);
  const blr = bctx.getImageData(0, 0, w, h);
  const d = src.data, b = blr.data;
  for (let i = 0; i < d.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      const j = i + ch;
      d[j] = Math.max(0, Math.min(255, d[j] + (d[j] - b[j]) * amount));
    }
  }
  ctx.putImageData(src, 0, 0);
}

function spaced(text) {
  return text.split('').join('  ');
}

function drawTitle(ctx, state, W, H, grade) {
  const title = (state.title || 'VICE CITY').toUpperCase();
  const words = title.split(' ');
  const style = state.captionStyle || 'stacked';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fontSize = W * 0.13;
  const fit = (text, size) => {
    ctx.font = `${size}px Anton, sans-serif`;
    return ctx.measureText(text).width;
  };
  while (words.length && Math.max(...words.map((w) => fit(w, fontSize))) > W * 0.92 && fontSize > 20) fontSize -= 4;
  const lineH = fontSize * 1.04;
  const blockH = lineH * words.length;
  const hasSub = (state.subtitle || '').trim().length > 0;
  const subSize = Math.max(15, W * 0.026);
  let startY;
  if (style === 'banner') {
    const bannerH = blockH + H * 0.075 + (hasSub ? subSize * 2.1 : 0);
    ctx.fillStyle = 'rgba(6,2,18,0.82)';
    ctx.fillRect(0, H - bannerH, W, bannerH);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(0, H - bannerH, W, Math.max(3, H * 0.006));
    startY = H - bannerH + H * 0.026 + lineH / 2;
  } else {
    // Reserve room under the block so the subtitle never clips.
    startY = H - blockH - (hasSub ? subSize * 2.3 : H * 0.05) + lineH / 2;
  }
  words.forEach((word, i) => {
    const y = startY + i * lineH;
    ctx.font = `${fontSize}px Anton, sans-serif`;
    ctx.lineWidth = fontSize * 0.16;
    ctx.strokeStyle = grade.titleStroke;
    ctx.lineJoin = 'round';
    ctx.strokeText(word, W / 2, y);
    if (style === 'outline') {
      ctx.lineWidth = fontSize * 0.045;
      ctx.strokeStyle = grade.accent;
      ctx.save();
      ctx.shadowColor = grade.glow;
      ctx.shadowBlur = fontSize * 0.35;
      ctx.strokeText(word, W / 2, y);
      ctx.restore();
    } else {
      ctx.fillStyle = i % 2 === 1 ? grade.accent2 : grade.titleFill;
      ctx.fillText(word, W / 2, y);
    }
  });
  // Subtitle accent: spaced small caps on a dark underlay, neon glow.
  const sub = (state.subtitle || '').trim();
  if (sub) {
    const subText = spaced(sub.toUpperCase());
    ctx.font = `${subSize}px Anton, sans-serif`;
    const tw = ctx.measureText(subText).width;
    const y = style === 'banner'
      ? H - subSize * 1.15
      : startY - lineH / 2 + blockH + subSize * 1.05;
    ctx.save();
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(4,0,14,0.78)';
    ctx.fillRect(W / 2 - tw / 2 - 18, y - subSize * 0.85, tw + 36, subSize * 1.7);
    ctx.restore();
    ctx.fillStyle = grade.accent;
    ctx.fillRect(W / 2 - tw / 2 - 18, y - subSize * 0.85, tw + 36, 3);
    ctx.save();
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(subText, W / 2, y);
    ctx.restore();
  }
  ctx.restore();
}

// The one renderer. `images` maps sample index -> HTMLImageElement
// (or null); state.panelPhotos picks an image per panel, -1 = none.
export function renderCover(ctx, W, H, state, images) {
  const layout = getLayout(state.layoutId);
  const grade = getGrade(state.gradeId);
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  grade.sky.forEach((c, i) => bg.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  layout.panels.forEach((panel, i) => {
    const bounds = panelBounds(panel);
    panelPath(ctx, panel, W, H);
    ctx.save();
    ctx.clip();
    const photoIdx = state.panelPhotos ? state.panelPhotos[i] : -1;
    const img = photoIdx != null && photoIdx >= 0 ? images[photoIdx] : null;
    if (img) {
      ctx.filter = grade.filter;
      drawPhotoCover(ctx, img, bounds, W, H, (state.punches && state.punches[i]) || { zoom: 1, fx: 0.5, fy: 0.5 });
      ctx.filter = 'none';
      ctx.fillStyle = grade.tint;
      ctx.fillRect(bounds.minX * W, bounds.minY * H, bounds.w * W, bounds.h * H);
      // Tasteful corner decor ghosted over photo panels.
      drawDecor(ctx, panel.motif, bounds.minX * W + bounds.w * W * 0.86, bounds.minY * H + bounds.h * H * 0.16,
        Math.min(bounds.w * W, bounds.h * H) * 0.30, '#ffffff', 0.16);
    } else {
      drawPanelGradient(ctx, bounds, W, H, grade, i);
      drawDecor(ctx, panel.motif, (bounds.minX + bounds.w / 2) * W, (bounds.minY + bounds.h / 2) * H,
        Math.min(bounds.w * W, bounds.h * H) * 0.52, 'rgba(255,255,255,0.9)', 0.5);
    }
    ctx.restore();
  });

  drawDividers(ctx, layout, W, H, grade, state.divider || layout.divider);
  drawTitle(ctx, state, W, H, grade);
  applyFilmFinish(ctx, W, H);
  ctx.restore();
}
