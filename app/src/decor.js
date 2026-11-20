// decor.js — quiet printed-poster dressing for VICE COVER STUDIO.
// Everything here is drawn at low opacity, underneath the lettering:
// a ringed sun disc, leaning palm silhouettes in two corners, a thin
// horizon glow and a scatter of small stars for the night grades.
// The decor is seasoning, not the meal — on photo panels it stays
// faint enough that the photograph always wins.

function tracePalm(ctx, x, y, s, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(lean);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -34, 16, -62);
  ctx.lineTo(21, -60);
  ctx.quadraticCurveTo(12, -32, 7, 0);
  ctx.closePath();
  ctx.fill();
  ctx.translate(18, -62);
  for (let i = 0; i < 6; i += 1) {
    const a = -0.25 - i * 0.42;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(20, -7, 40, 3);
    ctx.quadraticCurveTo(20, -2, 0, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function traceSunDisc(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Retro banding: three thin cuts across the lower half of the disc.
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 3; i += 1) {
    const y = cy + r * (0.18 + i * 0.24);
    ctx.fillRect(cx - r, y, r * 2, r * 0.055);
  }
  ctx.restore();
}

function scatterStars(ctx, W, H, count, seed) {
  let s = seed;
  const next = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const x = next() * W;
    const y = next() * H * 0.42;
    const r = 0.6 + next() * 1.3;
    ctx.globalAlpha = 0.25 + next() * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Draw the full decor layer for a cover of W x H in the given grade.
// Called once per render, after panels and before lettering.
export function drawDecor(ctx, W, H, grade) {
  const unit = Math.min(W, H);
  ctx.save();
  ctx.fillStyle = '#ffffff';
  if (grade.id === 'neon-night') {
    ctx.globalAlpha = 0.5;
    scatterStars(ctx, W, H, 46, 1234567);
  }
  // Ringed sun, upper right, mostly hidden behind the panels' art.
  ctx.globalAlpha = grade.id === 'ocean-drive' ? 0.1 : 0.16;
  ctx.fillStyle = '#ffd98a';
  traceSunDisc(ctx, W * 0.84, H * 0.16, unit * 0.13);
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#ffd98a';
  ctx.lineWidth = Math.max(1.5, unit * 0.004);
  ctx.beginPath();
  ctx.arc(W * 0.84, H * 0.16, unit * 0.165, 0, Math.PI * 2);
  ctx.stroke();
  // Palms: bottom-left reaches up, top-left leans in, both subtle.
  ctx.fillStyle = '#12081f';
  ctx.globalAlpha = 0.15;
  tracePalm(ctx, W * 0.045, H * 1.01, unit / 340, -0.06);
  ctx.globalAlpha = 0.11;
  tracePalm(ctx, W * 0.97, H * 1.02, unit / 430, 0.1);
  ctx.restore();
}

// A soft horizontal glow along a seam, used under the caption block
// so lettering sits on a calm patch of the artwork.
export function drawCaptionGlow(ctx, x, y, w, h, rgb, alpha) {
  const grad = ctx.createRadialGradient(
    x + w / 2, y + h / 2, 4,
    x + w / 2, y + h / 2, Math.max(w, h) / 1.6,
  );
  grad.addColorStop(0, 'rgba(' + rgb + ',' + alpha + ')');
  grad.addColorStop(1, 'rgba(' + rgb + ',0)');
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(x - w * 0.2, y - h * 0.4, w * 1.4, h * 1.8);
  ctx.restore();
}
