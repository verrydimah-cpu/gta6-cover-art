// decor.js — poster furniture drawing helpers, all original text and artwork
export function seeded(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function star(ctx, cx, cy, r, color) {
  ctx.save(); ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
export function drawStars(ctx, W, y, color) { for (let i = 0; i < 5; i++) star(ctx, W * (0.40 + i * 0.05), y, W * 0.016, color); }
export function drawBarcode(ctx, x, y, w, h) {
  ctx.save(); ctx.fillStyle = "#fff"; ctx.fillRect(x, y, w, h); ctx.fillStyle = "#111";
  const rnd = seeded(42); let cx = x + w * 0.06;
  while (cx < x + w * 0.92) { const bw = 1 + rnd() * 3; ctx.fillRect(cx, y + h * 0.08, bw, h * 0.68); cx += bw + 1 + rnd() * 3; }
  ctx.font = `${Math.round(h * 0.13)}px monospace`; ctx.textAlign = "center"; ctx.fillText("781234 567890", x + w / 2, y + h * 0.94); ctx.restore();
}
export function drawSeal(ctx, cx, cy, r) {
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = "#c9a227"; ctx.fill();
  ctx.lineWidth = r * 0.08; ctx.strokeStyle = "#7a5c00"; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2); ctx.strokeStyle = "#fff2b0"; ctx.stroke();
  ctx.fillStyle = "#2a1a00"; ctx.textAlign = "center"; ctx.font = `bold ${Math.round(r * 0.34)}px Anton, sans-serif`;
  ctx.fillText("BEST", cx, cy - r * 0.12); ctx.fillText("CAST", cx, cy + r * 0.28);
  ctx.font = `${Math.round(r * 0.20)}px sans-serif`; ctx.fillText("★ ★ ★", cx, cy + r * 0.55); ctx.restore();
}
export function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
