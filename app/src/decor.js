// VICE COVER STUDIO — decor motifs drawn in canvas: palm silhouettes, a low
// sun disc with scanline cuts, five-point stars and rolling wave lines.
// Gradient panels get the full set; photo panels get a faint corner motif.
export function drawSun(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, Math.PI, 0);
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    const yy = y - r * (0.18 + i * 0.2);
    ctx.fillRect(x - r, yy, r * 2, r * 0.055 * (i + 1));
  }
  ctx.restore();
}
export function drawPalm(ctx, x, y, s, color, flip) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -70, 34, -118);
  ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * (0.08 + i * 0.17);
    ctx.beginPath();
    ctx.moveTo(34, -118);
    ctx.quadraticCurveTo(34 + Math.cos(a) * 52, -118 - Math.sin(a) * 30 + 16,
      34 + Math.cos(a) * 84, -118 - Math.sin(a) * 44 + 42);
    ctx.stroke();
  }
  ctx.restore();
}
export function drawStar(ctx, x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
export function drawWaves(ctx, w, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (let row = 0; row < 3; row++) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const yy = y + row * 16 + Math.sin(x / 46 + row) * 6;
      if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}
export function drawPanelDecor(ctx, panel, w, h, grade, full) {
  const xs = panel.pts.map((p) => p[0] * w);
  const ys = panel.pts.map((p) => p[1] * h);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const top = Math.min(...ys);
  const bot = Math.max(...ys);
  ctx.save();
  ctx.globalAlpha = full ? 0.9 : 0.16;
  if (full) {
    drawSun(ctx, cx, bot - (bot - top) * 0.12, (bot - top) * 0.34, grade.accent2);
    drawPalm(ctx, Math.min(...xs) + w * 0.05, bot, h / 900, '#12041f', false);
    drawPalm(ctx, Math.max(...xs) - w * 0.05, bot, h / 1100, '#12041f', true);
    drawStar(ctx, cx + w * 0.14, top + (bot - top) * 0.2, 13, '#ffffff');
    drawStar(ctx, cx - w * 0.17, top + (bot - top) * 0.32, 9, grade.accent);
    drawWaves(ctx, w, bot - 44, grade.accent);
  } else {
    drawPalm(ctx, Math.max(...xs) - 6, bot, h / 1500, '#0b0218', true);
    drawStar(ctx, Math.min(...xs) + 26, top + 26, 9, '#ffffff');
  }
  ctx.restore();
}
