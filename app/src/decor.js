// decor.js — original poster furniture for VICE COVER STUDIO.
// Stars, review line, corner box, chrome title, script subtitle,
// ribbon, seal, barcode and billing block. All text is original to
// this studio; no third-party logos, wordmarks or artwork are used.
// Round 8 lettering finish: the chrome title is stroked with round
// joins at a finer weight for cleaner anti-aliased edges, and the
// script subtitle glow is built from several soft, even passes.

import { seededRandom } from './grades.js';

export const GOLD = '#f5c542';
export const GOLD_DEEP = '#c9932b';
export const CREAM = '#fdf6e3';

export function drawStars(ctx, cx, y, size) {
  ctx.save();
  ctx.fillStyle = GOLD;
  ctx.shadowColor = 'rgba(245,197,66,0.65)';
  ctx.shadowBlur = size * 0.35;
  for (let i = -2; i <= 2; i++) {
    star(ctx, cx + i * size * 2.15, y, size);
  }
  ctx.restore();
}

function star(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

export function drawReviewLine(ctx, W, y, text) {
  ctx.save();
  ctx.font = `700 ${Math.round(W * 0.0165)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = W * 0.006;
  ctx.shadowOffsetY = W * 0.002;
  ctx.fillStyle = CREAM;
  ctx.fillText(text, W / 2, y);
  ctx.restore();
}

export function drawVolBox(ctx, x, y, s) {
  ctx.save();
  ctx.fillStyle = '#0d0714';
  ctx.fillRect(x, y, s, s);
  ctx.lineWidth = Math.max(2, s * 0.055);
  ctx.strokeStyle = GOLD;
  ctx.strokeRect(x, y, s, s);
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'center';
  ctx.font = `${Math.round(s * 0.30)}px Anton, sans-serif`;
  ctx.fillText('VOL.', x + s / 2, y + s * 0.36);
  ctx.font = `${Math.round(s * 0.52)}px Anton, sans-serif`;
  ctx.fillText('1', x + s / 2, y + s * 0.82);
  ctx.restore();
}

// Retro-chrome stacked title: orange-to-pink gradient with a bright
// chrome band across the middle, a heavy dark outline and a stacked
// offset shadow. Round joins keep the outline smooth at any size.
export function drawChromeTitle(ctx, cx, topY, W, line1, line2, sizeOverride) {
  const size = sizeOverride || W * 0.098;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `${Math.round(size)}px Anton, sans-serif`;
  const lineH = size * 0.80;
  [line1, line2].forEach((line, i) => {
    if (!line) return;
    const y = topY + i * lineH;
    // stacked shadow
    ctx.fillStyle = 'rgba(20,4,24,0.9)';
    for (let s = 1; s <= 3; s++) ctx.fillText(line, cx + s * size * 0.016, y + s * size * 0.02);
    // gradient body with chrome band
    const grad = ctx.createLinearGradient(0, y, 0, y + size);
    grad.addColorStop(0, '#ffe259');
    grad.addColorStop(0.34, '#ffa751');
    grad.addColorStop(0.50, '#fff6d8');
    grad.addColorStop(0.55, '#ffd166');
    grad.addColorStop(0.70, '#ff5e8a');
    grad.addColorStop(1, '#e0218a');
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = size * 0.085;
    ctx.strokeStyle = '#1c0b1e';
    ctx.strokeText(line, cx, y);
    ctx.fillStyle = grad;
    ctx.fillText(line, cx, y);
    // fine top sheen for a cleaner letter edge
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = size * 0.018;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.strokeText(line, cx, y - size * 0.012);
    ctx.restore();
  });
  ctx.restore();
  // Report the true glyph bottom (second line top + full font size),
  // so whatever is stacked beneath the title never touches it.
  return topY + lineH + size;
}

// Neon-pink script subtitle: layered low-alpha strokes give a soft,
// even glow with no hot spots.
export function drawScriptSubtitle(ctx, cx, y, W, text) {
  if (!text) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const size = W * 0.052;
  ctx.font = `italic 700 ${Math.round(size)}px "Segoe Script", "Brush Script MT", cursive`;
  ctx.shadowColor = 'rgba(255,64,150,0.85)';
  for (const blur of [0.030, 0.020, 0.011]) {
    ctx.shadowBlur = W * blur;
    ctx.fillStyle = 'rgba(255,110,180,0.55)';
    ctx.fillText(text, cx, y);
  }
  ctx.shadowBlur = W * 0.006;
  ctx.fillStyle = '#ffd7ec';
  ctx.fillText(text, cx, y);
  ctx.restore();
}

export function drawRibbon(ctx, x, y, w, h, text) {
  ctx.save();
  ctx.fillStyle = 'rgba(10,5,16,0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = Math.max(2, h * 0.07);
  ctx.strokeStyle = GOLD;
  ctx.strokeRect(x, y, w, h);
  ctx.font = `${Math.round(h * 0.44)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CREAM;
  ctx.fillText(text, x + w / 2, y + h * 0.54);
  ctx.restore();
}

export function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,5,16,0.85)';
  ctx.fill();
  ctx.lineWidth = r * 0.07;
  ctx.strokeStyle = GOLD;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.lineWidth = r * 0.03;
  ctx.stroke();
  star(ctx, cx, cy - r * 0.38, r * 0.22);
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'center';
  ctx.font = `${Math.round(r * 0.34)}px Anton, sans-serif`;
  ctx.fillText('BEST', cx, cy + r * 0.22);
  ctx.fillText('CAST', cx, cy + r * 0.58);
  ctx.restore();
}

// Fictional barcode: seeded bar widths, quiet white plate.
export function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  const rand = seededRandom(904211);
  ctx.fillStyle = '#111111';
  let bx = x + w * 0.06;
  while (bx < x + w * 0.92) {
    const bw = (0.008 + rand() * 0.02) * w;
    if (rand() > 0.35) ctx.fillRect(bx, y + h * 0.08, bw, h * 0.68);
    bx += bw + (0.006 + rand() * 0.012) * w;
  }
  ctx.font = `${Math.round(h * 0.20)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('8 904211 620261', x + w / 2, y + h * 0.94);
  ctx.restore();
}

export function drawComingSoon(ctx, cx, y, unit, compact) {
  // `unit` is a height-aware scale passed by the renderer, so the
  // block stays proportional in wide, short exports as well as tall
  // portrait ones. Top-baseline drawing keeps the stack predictable;
  // in compact mode (tight footers) only the COMING SOON line is set.
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = CREAM;
  ctx.font = `${Math.round(unit * (compact ? 0.022 : 0.026))}px Anton, sans-serif`;
  ctx.fillText('COMING SOON', cx, y);
  if (!compact) {
    ctx.font = `${Math.round(unit * 0.0165)}px Anton, sans-serif`;
    ctx.fillStyle = GOLD;
    ctx.fillText('PALM SHADOW PICTURES PRESENTS', cx, y + unit * 0.034);
  }
  ctx.restore();
}

export function drawBilling(ctx, W, H) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(253,246,227,0.75)';
  ctx.font = `${Math.max(7, Math.round(W * 0.0105))}px Anton, sans-serif`;
  const line = 'A SUNSET CITY STORY  STARRING THE DRIVER · THE RIDER · THE CAPTAIN · THE FIXER  MUSIC BY THE BOARDWALK KINGS  COSTUMES BY M. SOLANO  EDITED BY R. VANCE  DIRECTOR OF PHOTOGRAPHY L. MARLOWE  PRODUCED BY A. DELMAR  DIRECTED BY J. GALLOWAY';
  ctx.fillText(line, W / 2, H - W * 0.012, W * 0.96);
  ctx.restore();
}
