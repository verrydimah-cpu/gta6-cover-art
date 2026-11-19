// VICE COVER STUDIO — the one canvas renderer. renderCover draws a complete
// cover into any 2D context at any size, so the live preview and the PNG
// export are the same picture. State: {layout, grade, caption, divider,
// title, subtitle, photos:[{img,dx,dy,zoom,punch}], grain, sharp}.
import { layoutById } from './layouts.js';
import { gradeById, skyGradient } from './grades.js';
import { drawPanelDecor } from './decor.js';

function panelPath(ctx, panel, w, h) {
  ctx.beginPath();
  panel.pts.forEach(([px, py], i) => {
    if (i === 0) ctx.moveTo(px * w, py * h); else ctx.lineTo(px * w, py * h);
  });
  ctx.closePath();
}
function drawPhotoCover(ctx, img, box, pos) {
  const scale = Math.max(box.w / img.width, box.h / img.height) * (pos.zoom || 1);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = box.x + (box.w - dw) / 2 + (pos.dx || 0) * box.w * 0.4;
  const dy = box.y + (box.h - dh) / 2 + (pos.dy || 0) * box.h * 0.4;
  ctx.drawImage(img, dx, dy, dw, dh);
}
function applySharp(ctx, w, h, amount) {
  if (!amount) return;
  const img = ctx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(img.data);
  const d = img.data;
  const k = amount;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const blur = (src[i - w * 4 + c] + src[i + w * 4 + c] + src[i - 4 + c] + src[i + 4 + c]) / 4;
        d[i + c] = Math.max(0, Math.min(255, src[i + c] + (src[i + c] - blur) * k));
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}
function applyFinish(ctx, w, h, grainAmt, seed) {
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(5,0,16,0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  if (grainAmt > 0) {
    let s = seed * 7919 + 13;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const n = Math.floor(w * h * 0.012 * grainAmt);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < n; i++) ctx.fillRect(rnd() * w, rnd() * h, 1.4, 1.4);
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let i = 0; i < n; i++) ctx.fillRect(rnd() * w, rnd() * h, 1.4, 1.4);
  }
}
function drawCaption(ctx, state, grade, w, h) {
  const title = (state.title || 'VICE CITY').toUpperCase();
  const sub = (state.subtitle || '').toUpperCase();
  ctx.save();
  ctx.textAlign = 'center';
  let size = w * 0.135;
  ctx.font = `${size}px Anton, sans-serif`;
  while (ctx.measureText(title).width > w * 0.92 && size > 24) {
    size *= 0.94;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  const ty = h - (sub ? h * 0.145 : h * 0.07);
  ctx.fillStyle = 'rgba(8,2,20,0.55)';
  ctx.fillRect(w * 0.04, ty - size * 1.02, w * 0.92, size * (sub ? 1.75 : 1.3));
  ctx.shadowColor = grade.accent;
  ctx.shadowBlur = size * 0.32;
  if (state.caption === 'outline') {
    ctx.lineWidth = Math.max(2, size * 0.045);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeText(title, w / 2, ty);
  } else if (state.caption === 'chrome') {
    const g = ctx.createLinearGradient(0, ty - size, 0, ty);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, '#ffd9ec');
    g.addColorStop(0.52, grade.accent);
    g.addColorStop(1, '#fff7ae');
    ctx.fillStyle = g;
    ctx.fillText(title, w / 2, ty);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, w / 2, ty);
    ctx.shadowBlur = 0;
    ctx.fillStyle = grade.accent2;
    ctx.fillText(title, w / 2 + size * 0.02, ty + size * 0.03);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, w / 2, ty);
  }
  if (sub) {
    ctx.shadowColor = grade.accent2;
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffe9f6';
    const spaced = sub.split('').join('  ');
    let ss = w * 0.032;
    ctx.font = `${ss}px Anton, sans-serif`;
    while (ctx.measureText(spaced).width > w * 0.9 && ss > 10) {
      ss *= 0.94;
      ctx.font = `${ss}px Anton, sans-serif`;
    }
    ctx.fillText(spaced, w / 2, ty + size * 0.52);
  }
  ctx.restore();
}
export function renderCover(ctx, state, w, h) {
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);
  ctx.save();
  ctx.fillStyle = skyGradient(ctx, grade, w, h);
  ctx.fillRect(0, 0, w, h);
  for (const panel of layout.panels) {
    ctx.save();
    panelPath(ctx, panel, w, h);
    ctx.clip();
    if (panel.sky) {
      ctx.fillStyle = skyGradient(ctx, grade, w, h);
      ctx.fillRect(0, 0, w, h);
      drawPanelDecor(ctx, panel, w, h, grade, true);
    } else {
      const slot = state.photos[panel.photo || 0];
      ctx.filter = `saturate(${grade.sat}) contrast(${grade.con})`;
      if (slot && slot.img) {
        const xs = panel.pts.map((p) => p[0] * w);
        const ys = panel.pts.map((p) => p[1] * h);
        const box = { x: Math.min(...xs), y: Math.min(...ys),
          w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
        const punch = 1 + (slot.punch || 0) * 0.25;
        drawPhotoCover(ctx, slot.img, box, { dx: slot.dx, dy: slot.dy, zoom: (slot.zoom || 1) * punch });
      } else {
        ctx.fillStyle = skyGradient(ctx, grade, w, h);
        ctx.fillRect(0, 0, w, h);
      }
      ctx.filter = 'none';
      ctx.fillStyle = grade.tint;
      ctx.fillRect(0, 0, w, h);
      drawPanelDecor(ctx, panel, w, h, grade, false);
    }
    ctx.restore();
    if (state.divider !== 'none') {
      panelPath(ctx, panel, w, h);
      if (state.divider === 'neon') {
        ctx.strokeStyle = grade.accent;
        ctx.lineWidth = Math.max(3, w * 0.006);
        ctx.shadowColor = grade.accent;
        ctx.shadowBlur = 14;
      } else if (state.divider === 'paper') {
        ctx.strokeStyle = '#fff7ea';
        ctx.lineWidth = Math.max(3, w * 0.007);
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = 'rgba(10,2,24,0.55)';
        ctx.lineWidth = Math.max(5, w * 0.01);
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 10;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
  drawCaption(ctx, state, grade, w, h);
  applyFinish(ctx, w, h, state.grain ?? 0.45, (state.title || '').length + 3);
  ctx.restore();
  if (state.sharp) applySharp(ctx, w, h, state.sharp);
}
export function exportCover(state, size) {
  const c = document.createElement('canvas');
  c.width = size.w;
  c.height = size.h;
  renderCover(c.getContext('2d'), state, size.w, size.h);
  return c;
}
