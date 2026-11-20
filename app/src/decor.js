// decor.js — the poster furniture, all of it drawn by the renderer: gold
// panel frames, cast role tags on a shared baseline grid, the retro-chrome
// title with round joins and a top sheen, the neon script subtitle, and
// the small print of a cinema one-sheet — stars, a review line, a ribbon
// tagline, a VOL. 1 box, a gold BEST CAST seal, a billing block and a
// barcode whose bars are seeded from the title so they never change.

export const GOLD = '#d9a441';
export const GOLD_LIGHT = '#f6d789';
export const INK = '#17060f';

export function panelPath(ctx, x, y, w, h, slant) {
  const s = slant * h;
  ctx.beginPath();
  ctx.moveTo(x + s, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - s, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

export function drawPanelFrame(ctx, x, y, w, h, slant, unit) {
  panelPath(ctx, x, y, w, h, slant);
  ctx.strokeStyle = 'rgba(10,2,6,0.85)';
  ctx.lineWidth = unit * 7;
  ctx.stroke();
  panelPath(ctx, x, y, w, h, slant);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = unit * 2.4;
  ctx.stroke();
  panelPath(ctx, x + unit * 3.4, y + unit * 3.4, w - unit * 6.8, h - unit * 6.8, slant);
  ctx.strokeStyle = 'rgba(246,215,137,0.55)';
  ctx.lineWidth = unit * 0.9;
  ctx.stroke();
}

// Role tags sit on a baseline grid: the tag's baseline is snapped to a
// whole number of grid steps so every panel in a column lines up.
export function drawRoleTag(ctx, text, x, y, size, grid) {
  const snappedY = Math.round(y / grid) * grid;
  ctx.save();
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(text).width;
  ctx.fillStyle = 'rgba(12,2,8,0.72)';
  ctx.fillRect(x - size * 0.22, snappedY - size * 0.98, w + size * 0.44, size * 1.24);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = size * 0.06;
  ctx.strokeText(text, x, snappedY);
  ctx.fillText(text, x, snappedY);
  ctx.restore();
  return snappedY;
}

// The chrome title: a vertical metal gradient (sky at the top, a hot pink
// band, deep plum at the foot), a dark outline drawn with round joins so
// no letter spikes, and a soft white sheen clipped to the top half.
export function drawChromeTitle(ctx, text, cx, y, size) {
  ctx.save();
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const grad = ctx.createLinearGradient(0, y - size, 0, y + size * 0.12);
  grad.addColorStop(0, '#fdfdff');
  grad.addColorStop(0.34, '#a8d8ff');
  grad.addColorStop(0.52, '#ff5e8a');
  grad.addColorStop(0.72, '#ff9a5a');
  grad.addColorStop(1, '#571b4d');
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1c0518';
  ctx.lineWidth = size * 0.16;
  ctx.strokeText(text, cx, y);
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, y);
  ctx.save();
  ctx.beginPath();
  const w = ctx.measureText(text).width;
  ctx.rect(cx - w / 2, y - size, w, size * 0.42);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText(text, cx, y);
  ctx.restore();
  ctx.restore();
}

// The script subtitle in neon pink: three even glow passes, then a pale
// core, so the halo is smooth instead of blotchy.
export function drawScriptSubtitle(ctx, text, cx, y, size) {
  ctx.save();
  ctx.font = `italic 700 ${size}px "Segoe Script", "Snell Roundhand", cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (const blur of [size * 0.55, size * 0.3, size * 0.14]) {
    ctx.shadowColor = 'rgba(255,46,136,0.85)';
    ctx.shadowBlur = blur;
    ctx.fillStyle = 'rgba(255,46,136,0.55)';
    ctx.fillText(text, cx, y);
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffd7ea';
  ctx.fillText(text, cx, y);
  ctx.restore();
}

function starPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawStars(ctx, cx, y, size, count = 5) {
  ctx.save();
  ctx.fillStyle = GOLD;
  const step = size * 1.45;
  for (let i = 0; i < count; i++) {
    starPath(ctx, cx + (i - (count - 1) / 2) * step, y, size * 0.5);
    ctx.fill();
  }
  ctx.restore();
}

export function drawReviewLine(ctx, text, cx, y, size) {
  ctx.save();
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f3e2c2';
  ctx.fillText(`“${text}”`, cx, y);
  ctx.restore();
}

export function drawVolBox(ctx, x, y, size) {
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = size * 0.05;
  ctx.strokeRect(x, y, size, size);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = `${size * 0.34}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('VOL.', x + size / 2, y + size * 0.44);
  ctx.fillText('1', x + size / 2, y + size * 0.82);
  ctx.restore();
}

export function drawRibbon(ctx, text, cx, y, w, size) {
  ctx.save();
  const h = size * 1.5;
  ctx.fillStyle = '#8c1d5d';
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, y);
  ctx.lineTo(cx + w / 2, y);
  ctx.lineTo(cx + w / 2 - size * 0.5, y + h / 2);
  ctx.lineTo(cx + w / 2, y + h);
  ctx.lineTo(cx - w / 2, y + h);
  ctx.lineTo(cx - w / 2 + size * 0.5, y + h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = size * 0.07;
  ctx.stroke();
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe9f4';
  ctx.fillText(text, cx, y + h * 0.68);
  ctx.restore();
}

export function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = GOLD;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
  ctx.strokeStyle = '#7a5514';
  ctx.lineWidth = r * 0.06;
  ctx.stroke();
  starPath(ctx, cx, cy - r * 0.28, r * 0.3);
  ctx.fillStyle = '#7a5514';
  ctx.fill();
  ctx.font = `${r * 0.3}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('BEST', cx, cy + r * 0.28);
  ctx.fillText('CAST', cx, cy + r * 0.58);
  ctx.restore();
}

// Fictional small print: the billing block every one-sheet carries, in
// condensed lines nobody is meant to read. The compact footer asks for a
// single line; the full footer takes all three.
export function drawBilling(ctx, cx, y, w, size, lineCount = 3) {
  const lines = [
    'SUNDOWN PICTURES PRESENTS A VICE COVER STUDIO PRODUCTION',
    'CASTING BY THE CREW · MUSIC BY THE HARBOUR BAND · COSTUMES BY NEON ATELIER',
    'DIRECTED BY THE DRIVER · PRODUCED SOMEWHERE PAST THE CAUSEWAY',
  ].slice(0, lineCount);
  ctx.save();
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(243,226,194,0.75)';
  lines.forEach((line, i) => ctx.fillText(line, cx, y + i * size * 1.35, w));
  ctx.restore();
}

function seededBars(text, count) {
  let seed = 7;
  for (const ch of text) seed = (seed * 31 + ch.charCodeAt(0)) & 0x7fffffff;
  const bars = [];
  for (let i = 0; i < count; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    bars.push(1 + (seed % 4));
  }
  return bars;
}

export function drawBarcode(ctx, x, y, w, h, seedText) {
  ctx.save();
  ctx.fillStyle = '#f7f2e7';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#14100c';
  const bars = seededBars(seedText, 42);
  const total = bars.reduce((a, b) => a + b, 0) + bars.length;
  let bx = x + w * 0.06;
  const unitW = (w * 0.88) / total;
  bars.forEach((b, i) => {
    if (i % 2 === 0) ctx.fillRect(bx, y + h * 0.12, b * unitW, h * 0.62);
    bx += (b + 1) * unitW;
  });
  ctx.font = `${h * 0.16}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('8 901357 202611', x + w / 2, y + h * 0.92);
  ctx.restore();
}
