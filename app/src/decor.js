// Procedural decoration for VICE COVER STUDIO: every ornament on a cover is drawn here from paths and
// gradients — a striped retro sun, a city skyline silhouette with lit windows, palm silhouettes and a
// halftone dot patch. Nothing is an image file, so the art stays original and works offline. A small
// seeded random generator keeps the skyline and windows identical on every render.

/** A deterministic random source (mulberry32), so decorative details never flicker between renders. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fills a rectangle with the grade's sky: a vertical gradient through its colour stops. */
export function paintSky(ctx, x, y, w, h, grade) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + h);
  const stops = grade.sky;
  stops.forEach((colour, i) => gradient.addColorStop(i / (stops.length - 1), colour));
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
}

/** A retro sun disc: a filled circle cut by widening horizontal slits toward its foot. */
export function drawSunDisc(ctx, cx, cy, r, colour) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = colour;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  // Slits are cleared with destination-out, growing taller toward the bottom of the disc.
  ctx.globalCompositeOperation = 'destination-out';
  let slitY = cy + r * 0.08;
  let slitH = r * 0.03;
  while (slitY < cy + r) {
    ctx.fillRect(cx - r, slitY, r * 2, slitH);
    slitY += slitH + r * 0.09;
    slitH *= 1.45;
  }
  ctx.restore();
}

/** A skyline silhouette along the foot of a rectangle: uneven towers with a scatter of lit windows. */
export function drawSkyline(ctx, x, y, w, h, grade, seed) {
  const rand = seededRandom(seed);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = grade.silhouette;
  let cursor = x - w * 0.02;
  const base = y + h;
  const towers = [];
  while (cursor < x + w) {
    const towerW = w * (0.05 + rand() * 0.09);
    const towerH = h * (0.3 + rand() * 0.62);
    ctx.fillRect(cursor, base - towerH, towerW, towerH);
    if (rand() > 0.6) ctx.fillRect(cursor + towerW * 0.35, base - towerH - h * 0.08, towerW * 0.3, h * 0.08);
    towers.push([cursor, base - towerH, towerW, towerH]);
    cursor += towerW + w * (0.005 + rand() * 0.02);
  }
  // Lit windows: tiny warm rectangles dotted over the towers.
  ctx.fillStyle = 'rgba(255, 214, 120, 0.85)';
  for (const [tx, ty, tw, th] of towers) {
    const cols = Math.max(1, Math.floor(tw / (w * 0.02)));
    const rows = Math.max(1, Math.floor(th / (h * 0.09)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() > 0.42) continue;
        ctx.fillRect(tx + (c + 0.3) * (tw / cols), ty + (r + 0.3) * (th / rows), tw / cols * 0.4, th / rows * 0.4);
      }
    }
  }
  ctx.restore();
}

/** One palm silhouette: a tapered trunk, a crown of filled drooping fronds and two coconuts. */
export function drawPalm(ctx, x, y, size, colour, flip = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip * size, size);
  ctx.fillStyle = colour;
  // Trunk: a filled, tapered curve leaning as it rises to the crown.
  ctx.beginPath();
  ctx.moveTo(-0.05, 0);
  ctx.quadraticCurveTo(0.02, -0.5, 0.3, -0.9);
  ctx.lineTo(0.39, -0.9);
  ctx.quadraticCurveTo(0.17, -0.48, 0.05, 0);
  ctx.closePath();
  ctx.fill();
  // Fronds: filled tapered leaves fanning from the crown, each drooping at its tip.
  const crownX = 0.345;
  const crownY = -0.9;
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const angle = Math.PI * (0.05 + t * 0.9);
    const len = 0.44 + Math.sin(t * Math.PI) * 0.16;
    const tipX = crownX + Math.cos(angle) * len;
    const tipY = crownY - Math.sin(angle) * len * 0.6 + len * len * 0.52;
    const midX = crownX + Math.cos(angle) * len * 0.52;
    const midY = crownY - Math.sin(angle) * len * 0.52;
    const nx = -(tipY - crownY);
    const ny = tipX - crownX;
    const nl = Math.hypot(nx, ny) || 1;
    const ox = (nx / nl) * 0.034;
    const oy = (ny / nl) * 0.034;
    ctx.beginPath();
    ctx.moveTo(crownX + ox, crownY + oy);
    ctx.quadraticCurveTo(midX + ox * 0.6, midY + oy * 0.6, tipX, tipY);
    ctx.quadraticCurveTo(midX - ox * 0.6, midY - oy * 0.6, crownX - ox, crownY - oy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0.3, -0.855, 0.043, 0, Math.PI * 2);
  ctx.arc(0.4, -0.84, 0.036, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A halftone patch: rows of dots that shrink toward one corner, a print-shop accent for a corner. */
export function drawHalftonePatch(ctx, x, y, w, h, colour, seed) {
  const rand = seededRandom(seed);
  ctx.save();
  ctx.fillStyle = colour;
  const step = w / 9;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 9; col++) {
      const fade = 1 - (col + row) / 15;
      const r = step * 0.34 * Math.max(0, fade) * (0.85 + rand() * 0.3);
      if (r < 0.4) continue;
      ctx.beginPath();
      ctx.arc(x + col * step + step / 2, y + row * step + step / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** The full decorative scene painted inside an empty panel: sky, sun, skyline and a palm. */
export function paintEmptyPanelArt(ctx, bounds, grade, seed) {
  paintSky(ctx, bounds.x, bounds.y, bounds.w, bounds.h, grade);
  drawSunDisc(ctx, bounds.x + bounds.w * 0.68, bounds.y + bounds.h * 0.4, bounds.h * 0.26, grade.sun);
  drawSkyline(ctx, bounds.x, bounds.y + bounds.h * 0.55, bounds.w, bounds.h * 0.45, grade, seed);
  drawPalm(ctx, bounds.x + bounds.w * 0.1, bounds.y + bounds.h * 0.99, bounds.h * 0.44, grade.silhouette, 1);
}
