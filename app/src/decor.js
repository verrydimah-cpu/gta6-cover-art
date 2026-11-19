// Vector decor motifs drawn straight onto the cover canvas.
// Full-strength decor dresses gradient panels; photo panels receive
// the same motifs as quiet corner dressing at low opacity so the
// photography stays the hero of every panel.

function tracePath(ctx, pts, close) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  if (close) ctx.closePath();
}

export function drawPalmFrond(ctx, x, y, size, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -1 : 1, 1);
  ctx.lineWidth = size * 0.045;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const a = -0.25 - i * 0.32;
    const len = size * (0.72 + 0.28 * Math.sin(i * 1.7));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      Math.cos(a) * len * 0.55, Math.sin(a) * len * 0.55 - size * 0.1,
      Math.cos(a) * len, Math.sin(a) * len + size * 0.16,
    );
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSunDisc(ctx, cx, cy, r) {
  ctx.save();
  for (let i = 0; i < 7; i++) {
    const y = cy - r + (i * 2 * r) / 7;
    if (i > 3) continue;
    ctx.beginPath();
    ctx.arc(cx, y, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawStar(ctx, cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.34;
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  tracePath(ctx, pts, true);
  ctx.fill();
}

export function drawWaves(ctx, x, y, w, rows) {
  ctx.save();
  ctx.lineWidth = Math.max(2, w * 0.008);
  for (let r = 0; r < rows; r++) {
    ctx.beginPath();
    const yy = y + r * w * 0.045;
    for (let px = 0; px <= w; px += w / 24) {
      const py = yy + Math.sin((px / w) * Math.PI * 4 + r) * w * 0.012;
      if (px === 0) ctx.moveTo(x + px, py); else ctx.lineTo(x + px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export function drawBirds(ctx, x, y, s) {
  ctx.save();
  ctx.lineWidth = Math.max(1.6, s * 0.09);
  ctx.lineCap = 'round';
  const bird = (bx, by, bs) => {
    ctx.beginPath();
    ctx.moveTo(bx - bs, by);
    ctx.quadraticCurveTo(bx - bs * 0.3, by - bs * 0.7, bx, by);
    ctx.quadraticCurveTo(bx + bs * 0.3, by - bs * 0.7, bx + bs, by);
    ctx.stroke();
  };
  bird(x, y, s);
  bird(x + s * 2.4, y + s * 0.7, s * 0.7);
  bird(x + s * 1.1, y - s * 0.9, s * 0.55);
  ctx.restore();
}

// Corner dressing for a photo panel: a palm silhouette tucked into
// the lower corner plus two small sparkles, kept whisper-quiet at
// roughly a fifth opacity so it reads as print texture, not clip art.
export function drawPanelCornerDecor(ctx, b, seed, colour) {
  ctx.save();
  const s = Math.min(b.w, b.h);
  const left = seed % 2 === 0;
  // The palm reads as a deep plum silhouette against bright skies;
  // a cream stroke would vanish on a sunlit photograph.
  ctx.globalAlpha = 0.24;
  ctx.strokeStyle = '#20082e';
  drawPalmFrond(ctx, left ? b.minX + s * 0.06 : b.maxX - s * 0.06, b.maxY - s * 0.04, s * 0.52, !left);
  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  drawStar(ctx, b.minX + b.w * (0.14 + (seed % 3) * 0.06), b.minY + b.h * 0.16, s * 0.035);
  drawStar(ctx, b.maxX - b.w * 0.12, b.minY + b.h * (0.3 + (seed % 2) * 0.12), s * 0.025);
  ctx.restore();
}

// Full decor for panels without a photo: sun, palms, waves, birds.
export function drawPanelFullDecor(ctx, b, gradeGlow) {
  ctx.save();
  ctx.strokeStyle = gradeGlow;
  ctx.fillStyle = gradeGlow;
  ctx.globalAlpha = 0.85;
  const s = Math.min(b.w, b.h);
  drawSunDisc(ctx, b.minX + b.w * 0.5, b.minY + b.h * 0.52, s * 0.3);
  ctx.globalAlpha = 0.9;
  drawPalmFrond(ctx, b.minX + s * 0.1, b.maxY - s * 0.05, s * 0.85, false);
  drawPalmFrond(ctx, b.maxX - s * 0.1, b.maxY - s * 0.05, s * 0.7, true);
  ctx.globalAlpha = 0.65;
  drawWaves(ctx, b.minX + b.w * 0.12, b.maxY - b.h * 0.16, b.w * 0.76, 3);
  drawBirds(ctx, b.minX + b.w * 0.62, b.minY + b.h * 0.18, s * 0.07);
  ctx.restore();
}
