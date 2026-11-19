// The one render path for Vice Cover Studio.
// renderCover paints a complete cover into any 2d context at the
// requested pixel size; the live preview and every PNG export call
// this same function, so what you see is exactly what you download.

import { getLayout, panelBounds } from './layouts.js';
import { getGrade } from './grades.js';
import { drawPanelCornerDecor, drawPanelFullDecor } from './decor.js';

export const EXPORT_SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

const DIVIDER_STYLES = {
  cream: { stroke: '#fff3d6', width: 0.011, shadow: 'rgba(0,0,0,0.35)' },
  chrome: { stroke: '#e8eef4', width: 0.009, shadow: 'rgba(20,30,50,0.55)' },
  neon: { stroke: '#ff5e9c', width: 0.01, shadow: 'rgba(55,224,255,0.8)' },
};

function clipPoly(ctx, poly, W, H) {
  ctx.beginPath();
  poly.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x * W, y * H); else ctx.lineTo(x * W, y * H);
  });
  ctx.closePath();
  ctx.clip();
}

function drawPhotoCover(ctx, img, b, focusX, focusY, zoom, filter, punch) {
  const bw = b.w, bh = b.h;
  const scale = Math.max(bw / img.naturalWidth, bh / img.naturalHeight) * (zoom || 1);
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  const dx = b.minX + (bw - dw) * (focusX ?? 0.5);
  const dy = b.minY + (bh - dh) * (focusY ?? 0.42);
  ctx.save();
  ctx.filter = filter + ' brightness(' + (0.97 + punch * 0.05) + ')';
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function seededNoise(seed) {
  let s = seed * 2654435761 % 4294967296;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function applyFilmFinish(ctx, W, H, state) {
  const rnd = seededNoise(7 + state.title.length * 13);
  // Grain: a sparse field of light and dark specks.
  const specks = Math.floor(W * H / 2600);
  ctx.save();
  for (let i = 0; i < specks; i++) {
    const v = rnd();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(rnd() * W, rnd() * H, 1.6, 1.6);
  }
  ctx.restore();
  // Halftone dots gathering toward the lower edge.
  const ht = Number(state.halftone) || 0;
  if (ht > 0.02) {
    ctx.save();
    ctx.fillStyle = 'rgba(10,6,24,0.5)';
    const gap = Math.max(9, W * 0.011);
    for (let y = H * 0.62; y < H; y += gap) {
      const t = (y - H * 0.62) / (H * 0.38);
      for (let x = 0; x < W; x += gap) {
        ctx.globalAlpha = ht * t * 0.5;
        ctx.beginPath();
        ctx.arc(x + ((y / gap) % 2) * gap * 0.5, y, gap * 0.16 * (0.5 + t), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  // Light leak blooming from the top corner.
  if (Number(state.leak) > 0) {
    ctx.save();
    const leak = ctx.createRadialGradient(W * 0.92, -H * 0.05, 0, W * 0.92, -H * 0.05, W * 0.75);
    leak.addColorStop(0, 'rgba(255,170,80,0.34)');
    leak.addColorStop(0.5, 'rgba(255,90,120,0.12)');
    leak.addColorStop(1, 'rgba(255,90,120,0)');
    ctx.fillStyle = leak;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // Vignette to seat the lettering.
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.78);
  vg.addColorStop(0, 'rgba(8,4,20,0)');
  vg.addColorStop(1, 'rgba(8,4,20,0.34)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

// Convolution sharpen blended by amount (0..1): the Sharp finish.
export function sharpenCanvas(canvas, amount) {
  if (!amount || amount <= 0) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const src = ctx.getImageData(0, 0, W, H);
  const out = ctx.createImageData(W, H);
  const d = src.data, o = out.data, a = Math.min(1, amount);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) {
        o[i] = d[i]; o[i + 1] = d[i + 1]; o[i + 2] = d[i + 2]; o[i + 3] = d[i + 3];
        continue;
      }
      for (let c = 0; c < 3; c++) {
        const lap = 4 * d[i + c] - d[i - 4 + c] - d[i + 4 + c] - d[i - W * 4 + c] - d[i + W * 4 + c];
        o[i + c] = Math.max(0, Math.min(255, d[i + c] + lap * a * 0.6));
      }
      o[i + 3] = d[i + 3];
    }
  }
  ctx.putImageData(out, 0, 0);
}

function letterFill(ctx, style, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  if (style === 'chrome') {
    g.addColorStop(0, '#fdfdff'); g.addColorStop(0.45, '#aeb9c6');
    g.addColorStop(0.55, '#5d6b7d'); g.addColorStop(1, '#eef3f8');
  } else if (style === 'neon') {
    g.addColorStop(0, '#a8f6ff'); g.addColorStop(0.5, '#37b6ff'); g.addColorStop(1, '#ff5e9c');
  } else {
    g.addColorStop(0, '#ffe259'); g.addColorStop(0.55, '#ff7518'); g.addColorStop(1, '#ff2e88');
  }
  return g;
}

function drawLettering(ctx, W, H, state, grade) {
  const title = (state.title || '').trim();
  if (!title) return;
  const top = state.pos !== 'bottom';
  const baseY = top ? H * 0.055 : H * 0.8;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let size = Math.min(W, H) * 0.155;
  ctx.font = size + 'px Anton, sans-serif';
  const words = title.split(/\s+/);
  const lines = words.length > 1 && ctx.measureText(title).width > W * 0.92
    ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
    : [title];
  while (lines.some((l) => ctx.measureText(l).width > W * 0.94) && size > 24) {
    size *= 0.94;
    ctx.font = size + 'px Anton, sans-serif';
  }
  lines.forEach((line, li) => {
    const y = baseY + li * size * 1.04;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(16,6,28,0.9)';
    ctx.lineWidth = size * 0.16;
    if (state.lettering === 'neon') {
      ctx.shadowColor = grade.glow;
      ctx.shadowBlur = size * 0.35;
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = size * 0.08;
      ctx.shadowOffsetY = size * 0.05;
    }
    ctx.strokeText(line, W / 2, y);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = letterFill(ctx, state.lettering, W / 2, y, 0, size);
    ctx.fillText(line, W / 2, y);
  });
  // Accent subtitle: spaced small caps breathing under the title,
  // lit by a soft neon glow in the grade colour. It is painted twice
  // — a wide halo pass, then a tighter pass — so the glow feels like
  // real neon spill rather than a flat drop shadow.
  const sub = (state.subtitle || '').trim().toUpperCase();
  if (sub) {
    const subY = baseY + lines.length * size * 1.04 + size * 0.16;
    const spaced = sub.split('').join('  ');
    let subSize = Math.min(W, H) * 0.036;
    ctx.font = '600 ' + subSize + 'px Verdana, sans-serif';
    while (ctx.measureText(spaced).width > W * 0.9 && subSize > 10) {
      subSize *= 0.92;
      ctx.font = '600 ' + subSize + 'px Verdana, sans-serif';
    }
    // A soft dark underlay first, so the line stays legible where it
    // crosses a bright street or sky, then the neon glow passes.
    ctx.shadowColor = 'rgba(10,4,20,0.85)';
    ctx.shadowBlur = subSize * 0.55;
    ctx.shadowOffsetY = subSize * 0.09;
    ctx.fillStyle = '#fff6ec';
    ctx.fillText(spaced, W / 2, subY);
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = subSize * 0.9;
    ctx.fillText(spaced, W / 2, subY);
    ctx.shadowBlur = subSize * 0.4;
    ctx.fillText(spaced, W / 2, subY);
  }
  ctx.restore();
}

export function renderCover(ctx, state, images, W, H) {
  const grade = getGrade(state.grade);
  const panels = getLayout(state.layout);
  const punch = Number(state.punch) || 1;
  // Backdrop ramp so empty panels still read as a poster sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.55, '#7597de');
  sky.addColorStop(1, '#ff6e7f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  panels.forEach((p, idx) => {
    const unit = panelBounds({ poly: p.poly });
    const b = { minX: unit.minX * W, minY: unit.minY * H, maxX: unit.maxX * W, maxY: unit.maxY * H, w: unit.w * W, h: unit.h * H };
    ctx.save();
    clipPoly(ctx, p.poly, W, H);
    const img = images[p.slot] || images[idx] || null;
    if (img && img.naturalWidth) {
      drawPhotoCover(ctx, img, b, p.focusX, p.focusY, p.zoom, grade.filter, punch);
      // Grade wash clipped inside this panel.
      const wash = ctx.createLinearGradient(0, b.minY, 0, b.maxY);
      wash.addColorStop(0, grade.ramp[0]);
      wash.addColorStop(0.55, grade.ramp[1]);
      wash.addColorStop(1, grade.ramp[2]);
      ctx.fillStyle = wash;
      ctx.fillRect(b.minX, b.minY, b.w, b.h);
      ctx.fillStyle = grade.tint;
      ctx.fillRect(b.minX, b.minY, b.w, b.h);
      drawPanelCornerDecor(ctx, b, idx + 1, '#fff3d6');
    } else {
      const fill = ctx.createLinearGradient(0, b.minY, 0, b.maxY);
      fill.addColorStop(0, grade.ramp[0]);
      fill.addColorStop(1, grade.ramp[2]);
      ctx.fillStyle = fill;
      ctx.fillRect(b.minX, b.minY, b.w, b.h);
      drawPanelFullDecor(ctx, b, grade.glow);
    }
    ctx.restore();
  });

  // Angled divider strokes between panels.
  const div = DIVIDER_STYLES[state.divider] || DIVIDER_STYLES.cream;
  ctx.save();
  ctx.strokeStyle = div.stroke;
  ctx.lineWidth = Math.max(3, Math.min(W, H) * div.width);
  ctx.shadowColor = div.shadow;
  ctx.shadowBlur = ctx.lineWidth * 0.7;
  ctx.lineJoin = 'round';
  for (const p of panels) {
    ctx.beginPath();
    p.poly.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x * W, y * H); else ctx.lineTo(x * W, y * H);
    });
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  // Outer frame to finish the poster edge.
  ctx.save();
  ctx.strokeStyle = 'rgba(12,5,24,0.85)';
  ctx.lineWidth = Math.max(6, Math.min(W, H) * 0.014);
  ctx.strokeRect(0, 0, W, H);
  ctx.restore();

  applyFilmFinish(ctx, W, H, state);
  drawLettering(ctx, W, H, state, grade);
}
