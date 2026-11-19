// decor.js — seeded procedural decoration for Vice Cover Studio.
//
// Each panel may carry one or two small motifs: a slatted retro sun,
// a skyline, palm silhouettes, a flight of birds, a plane with a
// contrail, a lifeguard tower. The rules that keep them tasteful:
//
//   * a motif is always anchored to a panel EDGE or corner — it is
//     clipped by the panel polygon and pushed against its bounds, so
//     it never wanders over the centre of a photo, where faces live;
//   * the choice and placement come from a seeded RNG, so a cover
//     renders identically every time it is drawn (preview == export);
//   * motifs are flat silhouettes in one ink colour at modest alpha,
//     printed-poster style, never photoreal clutter.

// Small deterministic RNG (mulberry32). Same seed, same stream.
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MOTIFS = ['sun', 'skyline', 'palms', 'birds', 'plane', 'tower'];

// Pick this panel's motifs: the first panel of a cover always gets
// the slatted sun (it is the studio's signature), the rest draw from
// the seeded stream. Roughly one panel in three stays clean.
export function motifsFor(seed, panelIndex) {
  const stream = rng(seed * 7919 + panelIndex * 131 + 17);
  if (panelIndex === 0) return ['sun'];
  const roll = stream();
  if (roll < 0.34) return [];
  const first = MOTIFS[Math.floor(stream() * MOTIFS.length)];
  if (roll > 0.86) {
    const second = MOTIFS[Math.floor(stream() * MOTIFS.length)];
    if (second !== first) return [first, second];
  }
  return [first];
}

// --- the motifs ------------------------------------------------------
// All drawing happens in pixel space inside the panel's bounds box;
// the caller has already clipped to the panel polygon.

function drawSun(ctx, b, ink) {
  // Slatted retro sun sitting on the top-right corner: a half-disc
  // whose lower bands are cut away with widening gaps.
  const r = Math.min(b.w, b.h) * 0.34;
  const cx = b.maxX - r * 0.35;
  const cy = b.minY + r * 0.3;
  ctx.save();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // The slats are painted back in deep shade rather than erased:
  // erasing would punch transparent holes through the photo and out
  // of the exported PNG, while shade stripes read as the classic
  // venetian-blind sun and keep the sheet fully opaque.
  ctx.fillStyle = 'rgba(18, 5, 34, 0.55)';
  let y = cy + r * 0.08;
  let gap = r * 0.05;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, gap);
    y += gap + r * 0.13;
    gap *= 1.55;
  }
  ctx.restore();
}

function drawSkyline(ctx, b, ink, stream) {
  // A row of towers along the bottom edge, heights from the stream,
  // a few windows left un-inked so they read as lit.
  ctx.save();
  ctx.fillStyle = ink;
  const base = b.maxY;
  let x = b.minX - b.w * 0.04;
  while (x < b.maxX) {
    const w = b.w * (0.07 + stream() * 0.09);
    const h = b.h * (0.1 + stream() * 0.17);
    ctx.fillRect(x, base - h, w, h);
    if (stream() > 0.55) ctx.fillRect(x + w * 0.3, base - h - b.h * 0.035, w * 0.4, b.h * 0.035);
    x += w + b.w * 0.012;
  }
  ctx.restore();
}

function drawPalms(ctx, b, ink, stream) {
  // Two palm silhouettes leaning in from the left edge: a curved
  // trunk and a crown of arcing fronds.
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = 'round';
  for (let i = 0; i < 2; i += 1) {
    const baseX = b.minX + b.w * (0.02 + i * 0.1);
    const baseY = b.maxY;
    const topX = baseX + b.w * (0.1 + stream() * 0.05);
    const topY = b.maxY - b.h * (0.42 + stream() * 0.14);
    ctx.lineWidth = Math.max(2, b.w * 0.016);
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(baseX + b.w * 0.015, (baseY + topY) / 2, topX, topY);
    ctx.stroke();
    for (let f = 0; f < 6; f += 1) {
      const ang = Math.PI * (0.08 + f * 0.17);
      const len = Math.min(b.w, b.h) * (0.16 + stream() * 0.05);
      ctx.lineWidth = Math.max(1.4, b.w * 0.009);
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.quadraticCurveTo(
        topX + Math.cos(ang) * len * 0.6,
        topY - Math.sin(ang) * len * 0.75,
        topX + Math.cos(ang) * len,
        topY - Math.sin(ang) * len * 0.35 + len * 0.3,
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBirds(ctx, b, ink, stream) {
  // A loose flight of birds near the top edge: little two-arc gulls.
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineCap = 'round';
  const n = 3 + Math.floor(stream() * 3);
  for (let i = 0; i < n; i += 1) {
    const cx = b.minX + b.w * (0.12 + stream() * 0.7);
    const cy = b.minY + b.h * (0.05 + stream() * 0.12);
    const s = Math.min(b.w, b.h) * (0.028 + stream() * 0.02);
    ctx.lineWidth = Math.max(1.2, s * 0.22);
    ctx.beginPath();
    ctx.moveTo(cx - s, cy);
    ctx.quadraticCurveTo(cx - s * 0.4, cy - s * 0.8, cx, cy);
    ctx.quadraticCurveTo(cx + s * 0.4, cy - s * 0.8, cx + s, cy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlane(ctx, b, ink, stream) {
  // A small jet crossing the top edge with a fading contrail.
  ctx.save();
  const y = b.minY + b.h * (0.07 + stream() * 0.06);
  const x0 = b.minX + b.w * 0.08;
  const x1 = b.minX + b.w * (0.55 + stream() * 0.2);
  const grad = ctx.createLinearGradient(x0, 0, x1, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(255,255,255,0.55)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = Math.max(1.4, b.h * 0.008);
  ctx.beginPath();
  ctx.moveTo(x0, y + b.h * 0.012);
  ctx.lineTo(x1, y);
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.translate(x1, y);
  const s = Math.min(b.w, b.h) * 0.05;
  ctx.beginPath(); // simple jet silhouette: fuselage, wing, tail
  ctx.moveTo(s, 0);
  ctx.lineTo(-s * 0.4, -s * 0.22);
  ctx.lineTo(-s * 0.1, -s * 0.95);
  ctx.lineTo(s * 0.28, -s * 0.2);
  ctx.lineTo(s * 0.75, -s * 0.16);
  ctx.lineTo(s * 0.75, s * 0.16);
  ctx.lineTo(s * 0.28, s * 0.2);
  ctx.lineTo(-s * 0.1, s * 0.95);
  ctx.lineTo(-s * 0.4, s * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawTower(ctx, b, ink) {
  // A lifeguard tower standing in the bottom-right corner: hut on
  // crossed legs with a little roof.
  ctx.save();
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  const w = Math.min(b.w, b.h) * 0.2;
  const h = w * 1.5;
  const x = b.maxX - w * 1.25;
  const base = b.maxY;
  const hutY = base - h;
  ctx.fillRect(x - w * 0.08, hutY - h * 0.1, w * 1.16, h * 0.09); // roof
  ctx.fillRect(x, hutY, w, h * 0.34); // hut
  ctx.lineWidth = Math.max(1.6, w * 0.07);
  ctx.beginPath(); // crossed legs
  ctx.moveTo(x + w * 0.08, hutY + h * 0.34);
  ctx.lineTo(x + w * 0.86, base);
  ctx.moveTo(x + w * 0.92, hutY + h * 0.34);
  ctx.lineTo(x + w * 0.14, base);
  ctx.moveTo(x + w * 0.05, base - h * 0.3);
  ctx.lineTo(x + w * 0.95, base - h * 0.3);
  ctx.stroke();
  ctx.restore();
}

const DRAW = {
  sun: drawSun, skyline: drawSkyline, palms: drawPalms,
  birds: drawBirds, plane: drawPlane, tower: drawTower,
};

// Draw one panel's decoration. `boundsPx` is the panel bounds in
// pixels; the caller clips to the polygon before calling.
export function drawDecor(ctx, boundsPx, seed, panelIndex, ink) {
  const motifs = motifsFor(seed, panelIndex);
  if (!motifs.length) return;
  const stream = rng(seed * 31 + panelIndex * 977 + 5);
  ctx.save();
  ctx.globalAlpha = 0.5;
  for (const motif of motifs) DRAW[motif](ctx, boundsPx, ink, stream);
  ctx.restore();
}
