// Vice Cover Studio — canvas decor.
// All decor is drawn with paths on the 2D canvas: palm silhouettes, a
// scanline-cut sun disc, stars, shore waves, birds and a perspective
// grid horizon. Photo-less panels get the full scene; photo panels get
// only a small, quiet corner cluster so the photograph stays the hero.
// A tiny seeded random keeps every render of the same state identical.

'use strict';

// Deterministic pseudo-random source (mulberry32) so decor never
// flickers between the preview and the exported PNG.
function vcsSeededRandom(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// A palm silhouette: a curved trunk and seven drooping fronds, drawn in
// one ink colour. Size is the trunk length in pixels.
function vcsDrawPalm(ctx, x, y, size, ink, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2, size * 0.045);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.10 * lean, -size * 0.5, size * 0.30 * lean, -size * 0.92);
  ctx.stroke();
  const topX = size * 0.30 * lean;
  const topY = -size * 0.92;
  const fronds = [-2.6, -2.0, -1.45, -0.85, -0.25, 0.35, 0.95];
  ctx.lineWidth = Math.max(1.6, size * 0.03);
  for (const angle of fronds) {
    const reach = size * (0.52 + 0.10 * Math.cos(angle));
    const endX = topX + Math.cos(angle) * reach;
    const endY = topY + Math.abs(Math.sin(angle)) * size * 0.30 + size * 0.10;
    const midX = topX + Math.cos(angle) * reach * 0.5;
    const midY = topY - size * 0.16 + Math.sin(angle) * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(topX - size * 0.05, topY + size * 0.05, size * 0.045, 0, Math.PI * 2);
  ctx.arc(topX + size * 0.06, topY + size * 0.07, size * 0.038, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// The poster sun: a filled disc sliced by horizontal scanline cuts that
// grow wider toward the bottom, exactly the retro poster gesture.
function vcsDrawSunDisc(ctx, cx, cy, radius, grade) {
  const sun = grade.sun;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  const disc = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
  disc.addColorStop(0, sun.colour);
  disc.addColorStop(1, sun.rim);
  ctx.fillStyle = disc;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.globalCompositeOperation = 'destination-out';
  let cutY = cy + radius * 0.08;
  let cutH = radius * 0.03;
  for (let i = 0; i < sun.cutLines; i++) {
    ctx.fillRect(cx - radius, cutY, radius * 2, cutH);
    cutY += cutH + radius * (0.16 - i * 0.012);
    cutH *= 1.45;
  }
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = sun.rim;
  ctx.lineWidth = Math.max(1.5, radius * 0.02);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.restore();
}

// A scatter of small stars in the upper part of a rect.
function vcsDrawStars(ctx, x, y, w, h, count, rand, ink) {
  ctx.save();
  ctx.fillStyle = ink;
  for (let i = 0; i < count; i++) {
    const sx = x + rand() * w;
    const sy = y + rand() * h * 0.45;
    const r = 0.8 + rand() * 1.9;
    ctx.globalAlpha = 0.25 + rand() * 0.65;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
    if (rand() > 0.82) {
      ctx.fillRect(sx - r * 3, sy - 0.6, r * 6, 1.2);
      ctx.fillRect(sx - 0.6, sy - r * 3, 1.2, r * 6);
    }
  }
  ctx.restore();
}

// Layered shore waves along the bottom of a rect.
function vcsDrawWaves(ctx, x, y, w, h, ink) {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineCap = 'round';
  for (let row = 0; row < 3; row++) {
    const baseY = y + h * (0.86 + row * 0.05);
    ctx.globalAlpha = 0.5 - row * 0.13;
    ctx.lineWidth = Math.max(1.4, h * 0.006) + row * 0.7;
    ctx.beginPath();
    const amp = h * 0.012;
    const wavelength = w / (5 + row);
    for (let px = 0; px <= w; px += 6) {
      const py = baseY + Math.sin((px / wavelength) * Math.PI * 2 + row * 1.7) * amp;
      if (px === 0) ctx.moveTo(x + px, py);
      else ctx.lineTo(x + px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// Two or three simple gull marks: short double arcs.
function vcsDrawBirds(ctx, x, y, w, h, count, rand, ink) {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.3, w * 0.0035);
  for (let i = 0; i < count; i++) {
    const bx = x + (0.15 + rand() * 0.7) * w;
    const by = y + (0.10 + rand() * 0.25) * h;
    const s = w * (0.016 + rand() * 0.014);
    ctx.globalAlpha = 0.55 + rand() * 0.3;
    ctx.beginPath();
    ctx.moveTo(bx - s, by);
    ctx.quadraticCurveTo(bx - s * 0.4, by - s * 0.7, bx, by);
    ctx.quadraticCurveTo(bx + s * 0.4, by - s * 0.7, bx + s, by);
    ctx.stroke();
  }
  ctx.restore();
}

// A perspective grid running from the horizon to the bottom edge, the
// synthwave floor that anchors the empty panels.
function vcsDrawGridHorizon(ctx, x, y, w, h, horizonY, ink) {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.30;
  ctx.lineWidth = Math.max(1, w * 0.0022);
  const vanishX = x + w * 0.5;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(vanishX, horizonY);
    ctx.lineTo(x + w * 0.5 + i * w * 0.16, y + h);
    ctx.stroke();
  }
  let t = 0;
  for (let row = 0; row < 6; row++) {
    t += (row + 1) * 0.055;
    const gy = horizonY + (y + h - horizonY) * Math.min(1, t);
    ctx.globalAlpha = 0.16 + row * 0.035;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }
  ctx.restore();
}

// A low skyline silhouette sitting on the horizon: uneven towers with
// a few lit windows, kept dark so the sun stays the brightest shape.
function vcsDrawSkyline(ctx, x, y, w, horizonY, rand, ink) {
  ctx.save();
  ctx.fillStyle = ink;
  let cx = x - w * 0.02;
  while (cx < x + w) {
    const bw = w * (0.05 + rand() * 0.09);
    const bh = (horizonY - y) * (0.18 + rand() * 0.3);
    ctx.fillRect(cx, horizonY - bh, bw, bh);
    if (rand() > 0.6) ctx.fillRect(cx + bw * 0.3, horizonY - bh - bw * 0.18, bw * 0.4, bw * 0.18);
    ctx.fillStyle = 'rgba(255,210,62,0.75)';
    for (let win = 0; win < 3; win++) {
      if (rand() > 0.5) {
        ctx.fillRect(cx + bw * (0.2 + rand() * 0.6), horizonY - bh * (0.25 + rand() * 0.6), 2.2, 3);
      }
    }
    ctx.fillStyle = ink;
    cx += bw + w * 0.012;
  }
  ctx.restore();
}

// The full scene for a photo-less panel. The caller clips to the panel
// first; bounds are the panel's bounding box in canvas pixels and seed
// varies per panel so no two skies are quite the same.
function vcsDrawFullDecor(ctx, bounds, grade, seed) {
  const x = bounds.x, y = bounds.y, w = bounds.w, h = bounds.h;
  const rand = vcsSeededRandom(seed * 7919 + 17);
  const ink = 'rgba(12,2,24,0.85)';
  const horizonY = y + h * grade.sun.y;
  vcsDrawStars(ctx, x, y, w, h, Math.round(w / 26), rand, '#ffffff');
  vcsDrawSkyline(ctx, x, y, w, horizonY, rand, 'rgba(16,4,30,0.8)');
  vcsDrawSunDisc(ctx, x + w * (0.34 + rand() * 0.32), horizonY, Math.min(w, h) * grade.sun.radius, grade);
  vcsDrawGridHorizon(ctx, x, y, w, h, horizonY, grade.horizon);
  vcsDrawPalm(ctx, x + w * 0.10, y + h * 0.97, h * 0.52, ink, 1);
  if (w > 260) vcsDrawPalm(ctx, x + w * 0.94, y + h * 0.99, h * 0.40, ink, -1);
  vcsDrawBirds(ctx, x, y, w, h, 3, rand, 'rgba(10,4,20,0.8)');
  vcsDrawWaves(ctx, x, y, w, h, grade.horizon);
}

// The quiet corner cluster allowed on photo panels: one small palm and
// a few stars at low opacity in the panel's emptiest corner.
function vcsDrawCornerDecor(ctx, bounds, grade, seed) {
  const x = bounds.x, y = bounds.y, w = bounds.w, h = bounds.h;
  const rand = vcsSeededRandom(seed * 104729 + 5);
  // Kept deliberately small and faint: sized from the panel's smaller
  // dimension so tall wedge panels never grow a giant palm, and light
  // enough to read as a printed watermark rather than a scribble.
  const palmSize = Math.min(w, h) * 0.34;
  ctx.save();
  ctx.globalAlpha = 0.16;
  vcsDrawPalm(ctx, x + w * 0.05, y + h * 0.995, palmSize, 'rgba(8,2,16,0.9)', 1);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.45;
  vcsDrawStars(ctx, x + w * 0.55, y, w * 0.45, h * 0.5, 6, rand, '#ffffff');
  ctx.restore();
}
