// decor.js — hand-drawn canvas ornament for Vice Cover Studio panels.
//
// The decor is the quiet layer that makes a plain gradient panel feel like
// poster art and ties photo panels to the same world: a slatted retro sun,
// palm fronds curling in from a corner, thin art-deco arcs and a scatter of
// four-point sparkles. It is drawn twice per cover — faintly over photos,
// at full strength on gradient panels — always in the grade's own colours,
// and it is all original vector work: no artwork is copied from anywhere.

function frond(ctx, x, y, length, angle, curl, colour) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = colour;
  ctx.lineCap = 'round';
  // The rib of the frond.
  ctx.lineWidth = length * 0.045;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.55, -length * curl * 0.4, length, length * curl);
  ctx.stroke();
  // Leaflets stepping down the rib, shorter as they near the tip.
  ctx.lineWidth = length * 0.02;
  const steps = 7;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / (steps + 1);
    const px = length * (1 - (1 - t) * (1 - t)) * 0.92;
    const py = length * curl * t * t + length * 0.02;
    const leaf = length * 0.3 * (1 - t * 0.55);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + leaf * 0.4, py + leaf * 0.36, px + leaf * 0.72, py + leaf * 0.78);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPalmCorner(ctx, rect, colour, flip = false) {
  const { x, y, w, h } = rect;
  const baseX = flip ? x + w : x;
  const dir = flip ? -1 : 1;
  const reach = Math.min(w, h) * 0.62;
  ctx.save();
  // A short trunk leaning in from the corner.
  ctx.strokeStyle = colour;
  ctx.lineCap = 'round';
  ctx.lineWidth = reach * 0.07;
  ctx.beginPath();
  ctx.moveTo(baseX, y + reach * 0.72);
  ctx.quadraticCurveTo(baseX + dir * reach * 0.1, y + reach * 0.34, baseX + dir * reach * 0.3, y + reach * 0.14);
  ctx.stroke();
  const crownX = baseX + dir * reach * 0.3;
  const crownY = y + reach * 0.14;
  const angles = flip
    ? [2.75, 2.3, 1.85, 1.45, 1.05]
    : [-0.35, 0.1, 0.55, 0.95, 1.35];
  angles.forEach((angle, i) => {
    frond(ctx, crownX, crownY, reach * (0.52 + (i % 3) * 0.12), angle, 0.34, colour);
  });
  ctx.restore();
}

export function drawRetroSun(ctx, cx, cy, radius, colour) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = colour;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  // Slats cut from the lower half, widening as they fall — the retro sun.
  ctx.globalCompositeOperation = 'destination-out';
  let slatY = cy + radius * 0.08;
  let slatH = radius * 0.045;
  while (slatY < cy + radius) {
    ctx.fillRect(cx - radius, slatY, radius * 2, slatH);
    slatY += slatH + radius * 0.14;
    slatH *= 1.45;
  }
  ctx.restore();
}

export function drawDecoArcs(ctx, rect, colour) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.strokeStyle = colour;
  const cx = x + w * 0.86;
  const cy = y + h * 0.1;
  [0.16, 0.26, 0.36].forEach((r, i) => {
    ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.006) * (i === 1 ? 0.6 : 1);
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

export function drawSparkles(ctx, rect, colour, seed = 7) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.fillStyle = colour;
  // A tiny deterministic scatter, so preview and export agree exactly.
  let s = seed * 2654435761 % 4294967296;
  const next = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = 0; i < 9; i += 1) {
    const px = x + w * (0.08 + next() * 0.84);
    const py = y + h * (0.08 + next() * 0.5);
    const r = Math.min(w, h) * (0.012 + next() * 0.016);
    ctx.beginPath();
    ctx.moveTo(px, py - r);
    ctx.quadraticCurveTo(px, py, px + r, py);
    ctx.quadraticCurveTo(px, py, px, py + r);
    ctx.quadraticCurveTo(px, py, px - r, py);
    ctx.quadraticCurveTo(px, py, px, py - r);
    ctx.fill();
  }
  ctx.restore();
}

// The whole decor pass for one panel. `strength` is 1 on gradient panels
// and a whisper over photographs, where the photo must stay believable.
// Palms are drawn in a deep plum ink so they silhouette against both the
// bright sky grades and the darker night grade. The slatted retro sun is
// deliberately not part of this pass: its destination-out slats would cut
// holes in a photograph, and gradient panels already get a sun disc and
// glow from the grade itself.
export function drawPanelDecor(ctx, rect, grade, strength, variant = 0) {
  ctx.save();
  ctx.globalAlpha = strength;
  const ink = 'rgba(24, 8, 28, 0.85)';
  if (strength > 0.5) {
    // Deco corner rings belong to empty sky panels; over a photograph
    // they read as machinery, so photo panels skip them.
    drawDecoArcs(ctx, rect, grade.accent);
  }
  if (variant % 2 === 0) {
    drawPalmCorner(ctx, rect, ink, variant % 4 === 2);
  }
  drawSparkles(ctx, rect, grade.sun, 11 + variant * 5);
  ctx.restore();
}
