// decor.js — canvas-drawn decorative motifs for VICE COVER STUDIO.
// Palms, suns, stars and waves are drawn with paths only, so covers
// stay fully offline and resolution independent. Every motif takes
// (ctx, x, y, s, color): an anchor point, a size and a paint colour.

function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.09;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.55, x + s * 0.3, y - s * 0.95);
  ctx.stroke();
  const tx = x + s * 0.3, ty = y - s * 0.95;
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.08 + i * 0.17);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(
      tx + Math.cos(a) * s * 0.42, ty - Math.sin(a) * s * 0.42 - s * 0.1,
      tx + Math.cos(a) * s * 0.72, ty - Math.sin(a) * s * 0.30 + s * 0.16);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(tx - s * 0.07, ty + s * 0.06, s * 0.07, 0, Math.PI * 2);
  ctx.arc(tx + s * 0.08, ty + s * 0.09, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSun(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const r = s * 0.32;
  // Retro banded sun: full top, sliced lower half.
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0);
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    const yy = y + r * (0.12 + i * 0.22);
    const half = Math.sqrt(Math.max(0, r * r - (yy - y) * (yy - y)));
    ctx.fillRect(x - half, yy, half * 2, r * 0.1);
  }
  ctx.lineWidth = s * 0.045;
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + (Math.PI * i) / 8;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 1.18, y + Math.sin(a) * r * 1.18);
    ctx.lineTo(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStar(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const rO = s * 0.5, rI = s * 0.21;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rO : rI;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawWaves(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.07;
  ctx.lineCap = 'round';
  for (let row = 0; row < 3; row++) {
    ctx.beginPath();
    const yy = y + row * s * 0.3;
    for (let px = 0; px <= s; px += s / 24) {
      const py = yy + Math.sin((px / s) * Math.PI * 2 + row) * s * 0.09;
      if (px === 0) ctx.moveTo(x + px, py); else ctx.lineTo(x + px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

const MOTIFS = { palm: drawPalm, sun: drawSun, star: drawStar, wave: drawWaves };

// Draw one motif centred in a box. `alpha` lets photo panels carry a
// tasteful ghost of decor in a corner while empty panels go full.
export function drawDecor(ctx, motif, cx, cy, size, color, alpha) {
  const fn = MOTIFS[motif] || drawStar;
  ctx.save();
  ctx.globalAlpha = alpha;
  fn(ctx, cx, cy, size, color);
  ctx.restore();
}

// Scatter a few small stars across a gradient sky area.
export function drawStarField(ctx, w, h, color, count, seed) {
  let s = seed || 7;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = rnd() * w, y = rnd() * h * 0.6, r = 1 + rnd() * 2.2;
    ctx.globalAlpha = 0.25 + rnd() * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
