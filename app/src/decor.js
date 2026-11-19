// decor.js — procedural poster decor for Vice Cover Studio.
//
// When a panel has no photo (or behind one, at its edges) the renderer
// asks this module for a little coastal scene: a retro sun disc cut by
// slats, a skyline silhouette, filled-leaf palms, distant birds, a
// plane crossing the sky and a lifeguard tower on the sand line. All of
// it is drawn with canvas paths — no image assets — and everything is
// placed from a seeded random stream so a given cover renders the same
// way every time, on the preview and on the export alike.

// Small deterministic PRNG (mulberry32). The seed is folded from the
// panel index and a salt the caller picks, so decor is stable per
// panel but different between panels.
export function seeded(seed) {
  let t = (seed >>> 0) || 1;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pathPoly(ctx, poly, W, H) {
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H)));
  ctx.closePath();
}

// A palm frond: a curved rib with filled leaflets, drawn as one filled
// shape so it reads as a silhouette at any size.
function frond(ctx, x, y, len, angle, width, colour) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -width * 1.6, len, width * 0.4);
  ctx.quadraticCurveTo(len * 0.55, width * 0.5, 0, width * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawPalm(ctx, x, y, s, colour, lean = 0.22) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = s * 0.09;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * lean * 0.4, y - s * 0.6, x + s * lean, y - s);
  ctx.stroke();
  const topX = x + s * lean, topY = y - s;
  for (let i = 0; i < 6; i++) {
    frond(ctx, topX, topY, s * (0.62 + (i % 3) * 0.1), -2.6 + i * 0.52, s * 0.1, colour);
  }
  ctx.restore();
}

export function drawSun(ctx, cx, cy, r, colour, bandColour) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
  // slats cut across the lower half, widening as they fall
  ctx.globalCompositeOperation = 'destination-out';
  let gap = r * 0.05;
  for (let y = cy + r * 0.08; y < cy + r; y += gap * 2.4) {
    ctx.fillRect(cx - r, y, r * 2, gap);
    gap *= 1.45;
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
  void bandColour;
}

export function drawSkyline(ctx, baseY, W, H, colour, rand) {
  ctx.fillStyle = colour;
  let x = -W * 0.02;
  while (x < W * 1.02) {
    const bw = W * (0.04 + rand() * 0.07);
    const bh = H * (0.1 + rand() * 0.26);
    ctx.fillRect(x, baseY - bh, bw, bh);
    if (rand() > 0.6) ctx.fillRect(x + bw * 0.3, baseY - bh - H * 0.03, bw * 0.16, H * 0.03); // rooftop block
    x += bw + W * (0.005 + rand() * 0.02);
  }
  ctx.fillRect(0, baseY, W, H - baseY + 2);
}

export function drawBirds(ctx, x, y, s, colour, count) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.2, s * 0.08);
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const bx = x + i * s * 1.7, by = y + (i % 2) * s * 0.5;
    ctx.beginPath();
    ctx.moveTo(bx - s * 0.5, by);
    ctx.quadraticCurveTo(bx - s * 0.15, by - s * 0.45, bx, by);
    ctx.quadraticCurveTo(bx + s * 0.15, by - s * 0.45, bx + s * 0.5, by);
    ctx.stroke();
  }
}

export function drawPlane(ctx, x, y, s, colour) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = colour;
  ctx.beginPath(); // fuselage
  ctx.ellipse(0, 0, s, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath(); // main wing
  ctx.moveTo(-s * 0.05, 0);
  ctx.lineTo(-s * 0.42, s * 0.52);
  ctx.lineTo(-s * 0.12, s * 0.52);
  ctx.lineTo(s * 0.18, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath(); // tail fin
  ctx.moveTo(-s * 0.82, -s * 0.05);
  ctx.lineTo(-s * 0.98, -s * 0.4);
  ctx.lineTo(-s * 0.66, -s * 0.4);
  ctx.lineTo(-s * 0.55, -s * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawTower(ctx, x, baseY, s, colour) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  ctx.lineWidth = s * 0.07;
  // legs
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, baseY); ctx.lineTo(x - s * 0.12, baseY - s * 0.55);
  ctx.moveTo(x + s * 0.3, baseY); ctx.lineTo(x + s * 0.12, baseY - s * 0.55);
  ctx.moveTo(x - s * 0.24, baseY - s * 0.28); ctx.lineTo(x + s * 0.24, baseY - s * 0.28);
  ctx.stroke();
  // hut and pitched roof
  ctx.fillRect(x - s * 0.3, baseY - s * 0.92, s * 0.6, s * 0.38);
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, baseY - s * 0.92);
  ctx.lineTo(x, baseY - s * 1.14);
  ctx.lineTo(x + s * 0.4, baseY - s * 0.92);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Paint the full backdrop for one panel inside its (already clipped)
// bounding box: graded sky, a slatted sun, skyline, then the edge decor
// chosen by the seeded stream. bx/by/bw/bh are pixel bounds.
export function drawBackdrop(ctx, grade, bx, by, bw, bh, panelIndex) {
  const rand = seeded(1237 + panelIndex * 977);
  const sky = ctx.createLinearGradient(0, by, 0, by + bh);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(1, grade.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(bx, by, bw, bh);
  const horizon = by + bh * (0.62 + rand() * 0.1);
  drawSun(ctx, bx + bw * (0.3 + rand() * 0.4), by + bh * (0.3 + rand() * 0.14), Math.min(bw, bh) * 0.26, grade.sun);
  drawSkyline(ctx, horizon, bx + bw, bh * 0.9, grade.silhouette, rand);
  ctx.fillStyle = grade.silhouette;
  ctx.fillRect(bx, horizon, bw, by + bh - horizon);
  drawPalm(ctx, bx + bw * 0.08, by + bh * 1.0, bh * 0.52, grade.silhouette, 0.3);
  drawPalm(ctx, bx + bw * 0.97, by + bh * 1.0, bh * 0.44, grade.silhouette, -0.34);
  drawBirds(ctx, bx + bw * (0.55 + rand() * 0.2), by + bh * (0.1 + rand() * 0.08), bw * 0.035, grade.silhouette, 3);
  if (rand() > 0.45) drawPlane(ctx, bx + bw * (0.2 + rand() * 0.5), by + bh * 0.16, bw * 0.06, grade.silhouette);
  if (rand() > 0.5) drawTower(ctx, bx + bw * (0.68 + rand() * 0.18), by + bh * 0.99, bh * 0.2, grade.silhouette);
  void pathPoly;
}

// Light corner dressing over a photo panel: palm leaves reaching in
// from a top corner and a few birds, kept strictly to the edges so a
// face in the middle of the panel is never crossed.
export function drawCornerDressing(ctx, grade, bx, by, bw, bh, panelIndex) {
  const rand = seeded(551 + panelIndex * 331);
  ctx.save();
  ctx.globalAlpha = 0.8;
  // a palm crown tucked into one top corner: short trunk hugging the
  // panel edge, fronds fanning along the top — never into the middle
  // of the panel where a face would sit
  if (rand() > 0.35) drawPalm(ctx, bx + bw * 0.015, by + bh * 0.2, bh * 0.19, grade.silhouette, 0.34);
  if (rand() > 0.5) drawPalm(ctx, bx + bw * 0.985, by + bh * 0.17, bh * 0.16, grade.silhouette, -0.34);
  if (rand() > 0.4) drawBirds(ctx, bx + bw * (0.6 + rand() * 0.18), by + bh * 0.07, bw * 0.028, grade.silhouette, 2);
  ctx.restore();
}
