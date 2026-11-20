'use strict';
/* VICE COVER STUDIO — the poster's furniture.
   Chrome lettering, gold frames, stars, ribbon, seal and barcode: every
   ornament is drawn by the renderer, nothing is a borrowed picture. */
window.VCS = window.VCS || {};

const GOLD = '#d9a441';
const GOLD_PALE = '#f3d489';
const PLUM = '#170a12';

/* The sunset itself, painted on a small tile with an ordered Bayer dither
   in the mix so the big smooth gradient never bands when it is scaled up. */
VCS.skyTile = function () {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(S, S);
  const stops = [
    [0.00, 38, 16, 54], [0.34, 122, 32, 84], [0.58, 232, 84, 92],
    [0.78, 255, 148, 66], [1.00, 255, 205, 110],
  ];
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = 0; y < S; y++) {
    const t = y / (S - 1);
    let a = stops[0], b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s][0] && t <= stops[s + 1][0]) { a = stops[s]; b = stops[s + 1]; break; }
    }
    const f = (t - a[0]) / Math.max(0.0001, b[0] - a[0]);
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const dith = (bayer[(y % 4) * 4 + (x % 4)] / 16 - 0.5) * 7;
      img.data[i] = a[1] + (b[1] - a[1]) * f + dith;
      img.data[i + 1] = a[2] + (b[2] - a[2]) * f + dith;
      img.data[i + 2] = a[3] + (b[3] - a[3]) * f + dith;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  /* a low sun, slightly left of centre */
  const sun = ctx.createRadialGradient(S * 0.42, S * 0.72, 4, S * 0.42, S * 0.72, S * 0.36);
  sun.addColorStop(0, 'rgba(255,236,170,0.95)');
  sun.addColorStop(0.25, 'rgba(255,190,90,0.55)');
  sun.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, S, S);
  return c;
};

/* The cover's base coat: deep plum with a dusk glow breathing behind the
   top of the frame. */
VCS.paintBackdrop = function (ctx, W, H, sky) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#33152a');
  g.addColorStop(0.45, '#22101e');
  g.addColorStop(1, PLUM);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.drawImage(sky, 0, 0, W, H * 0.30);
  ctx.restore();
  /* melt the sky band's lower edge into the plum so no hard line shows
     in the gaps between panels */
  const melt = ctx.createLinearGradient(0, H * 0.16, 0, H * 0.32);
  melt.addColorStop(0, 'rgba(34,16,30,0)');
  melt.addColorStop(1, 'rgba(34,16,30,0.85)');
  ctx.fillStyle = melt;
  ctx.fillRect(0, H * 0.16, W, H * 0.16);
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.10, 10, W * 0.5, H * 0.10, W * 0.62);
  glow.addColorStop(0, 'rgba(255,140,80,0.20)');
  glow.addColorStop(1, 'rgba(255,140,80,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H * 0.5);
};

/* A panel's frame: the divider styles share one geometry. */
VCS.drawFrame = function (ctx, x, y, w, h, style) {
  ctx.save();
  if (style === 'neon') {
    ctx.shadowColor = 'rgba(255,64,170,0.85)';
    ctx.shadowBlur = Math.max(6, w * 0.03);
    ctx.strokeStyle = '#ff4fae';
    ctx.lineWidth = Math.max(2, w * 0.008);
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,220,240,0.9)';
    ctx.lineWidth = Math.max(1, w * 0.003);
    ctx.strokeRect(x, y, w, h);
  } else if (style === 'plain') {
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = Math.max(2, w * 0.010);
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  } else { /* gold */
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.lineWidth = Math.max(3, w * 0.016);
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = Math.max(2, w * 0.009);
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = GOLD_PALE;
    ctx.lineWidth = Math.max(1, w * 0.003);
    const inset = Math.max(2, w * 0.014);
    ctx.strokeRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
  }
  ctx.restore();
};

/* The cast member's name, on a chip that sits on the shared baseline grid:
   every tag in a row hangs the same distance above its panel's floor. */
VCS.drawRoleTag = function (ctx, role, x, y, w, h) {
  if (!role) return;
  const fs = Math.max(10, Math.min(h * 0.11, w * 0.075));
  ctx.save();
  ctx.font = `700 ${fs}px Anton, 'Arial Narrow', sans-serif`;
  const tw = ctx.measureText(role).width;
  const padX = fs * 0.55;
  const chipW = tw + padX * 2;
  const chipH = fs * 1.62;
  const chipX = x + w * 0.045;
  const chipY = y + h - chipH - h * 0.05;
  ctx.fillStyle = 'rgba(10,4,10,0.78)';
  ctx.fillRect(chipX, chipY, chipW, chipH);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(1, fs * 0.07);
  ctx.strokeRect(chipX, chipY, chipW, chipH);
  ctx.fillStyle = GOLD_PALE;
  ctx.textBaseline = 'middle';
  ctx.fillText(role, chipX + padX, chipY + chipH * 0.54);
  ctx.restore();
};

/* The headline. Three voices: retro chrome, neon tube, or a block plate. */
VCS.drawTitle = function (ctx, title, style, cx, top, maxW) {
  const text = (title || 'SUNDOWN CITY').toUpperCase();
  let fs = maxW / Math.max(4.4, text.length * 0.62);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  if (style === 'neon') {
    ctx.font = `${fs}px Anton, 'Arial Narrow', sans-serif`;
    for (let pass = 0; pass < 3; pass++) {
      ctx.shadowColor = 'rgba(255,64,170,0.9)';
      ctx.shadowBlur = 26 - pass * 7;
      ctx.fillStyle = pass === 2 ? '#ffd7ef' : '#ff4fae';
      ctx.fillText(text, cx, top);
    }
  } else if (style === 'block') {
    ctx.font = `${fs}px Anton, 'Arial Narrow', sans-serif`;
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(8,3,8,0.88)';
    ctx.fillRect(cx - tw / 2 - fs * 0.35, top - fs * 0.12, tw + fs * 0.7, fs * 1.34);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = Math.max(1.5, fs * 0.045);
    ctx.strokeRect(cx - tw / 2 - fs * 0.35, top - fs * 0.12, tw + fs * 0.7, fs * 1.34);
    ctx.fillStyle = '#ffe9b0';
    ctx.fillText(text, cx, top);
  } else { /* chrome */
    ctx.font = `${fs}px Anton, 'Arial Narrow', sans-serif`;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2b0f22';
    ctx.lineWidth = fs * 0.16;
    ctx.strokeText(text, cx, top);
    const grad = ctx.createLinearGradient(0, top, 0, top + fs);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.38, '#ffd9ec');
    grad.addColorStop(0.52, '#ff5fa8');
    grad.addColorStop(0.75, '#ffb35c');
    grad.addColorStop(1, '#ff7847');
    ctx.fillStyle = grad;
    ctx.fillText(text, cx, top);
    /* the sheen: a soft white pass clipped to the letters' top half */
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - maxW / 2, top, maxW, fs * 0.42);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.fillText(text, cx, top);
    ctx.restore();
  }
  ctx.restore();
  return fs;
};

/* The neon script line under the title. */
VCS.drawScript = function (ctx, line, cx, y, size) {
  if (!line) return;
  ctx.save();
  ctx.font = `italic 700 ${size}px 'Segoe Script', 'Brush Script MT', cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let pass = 0; pass < 3; pass++) {
    ctx.shadowColor = 'rgba(64,224,255,0.9)';
    ctx.shadowBlur = 18 - pass * 5;
    ctx.fillStyle = pass === 2 ? '#e8fbff' : '#57d7ff';
    ctx.fillText(line, cx, y);
  }
  ctx.restore();
};

VCS.drawStars = function (ctx, cx, y, size) {
  ctx.save();
  ctx.fillStyle = GOLD;
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ ★ ★ ★ ★', cx, y);
  ctx.restore();
};

/* The tagline ribbon across the footer's rhythm. */
VCS.drawRibbon = function (ctx, text, cx, y, w, h) {
  if (!text) return;
  ctx.save();
  ctx.fillStyle = '#8c1d4f';
  ctx.fillRect(cx - w / 2, y, w, h);
  ctx.fillStyle = '#5e1034';
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, y); ctx.lineTo(cx - w / 2 - h * 0.5, y + h / 2); ctx.lineTo(cx - w / 2, y + h); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + w / 2, y); ctx.lineTo(cx + w / 2 + h * 0.5, y + h / 2); ctx.lineTo(cx + w / 2, y + h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = GOLD_PALE;
  ctx.lineWidth = Math.max(1, h * 0.05);
  ctx.strokeRect(cx - w / 2, y, w, h);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = `700 ${h * 0.44}px Anton, 'Arial Narrow', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, y + h * 0.54);
  ctx.restore();
};

/* The gold BEST CAST seal. */
VCS.drawSeal = function (ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = GOLD; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.fillStyle = '#8c1d4f'; ctx.fill();
  ctx.fillStyle = GOLD_PALE;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${r * 0.34}px Anton, sans-serif`;
  ctx.fillText('BEST', cx, cy - r * 0.20);
  ctx.fillText('CAST', cx, cy + r * 0.18);
  ctx.font = `${r * 0.30}px sans-serif`;
  ctx.fillText('★', cx, cy + r * 0.52);
  ctx.restore();
};

/* A seeded barcode — the same cover always grows the same stripes. */
VCS.drawBarcode = function (ctx, seedText, x, y, w, h) {
  let seed = 7;
  for (const ch of seedText || '') seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  ctx.save();
  ctx.fillStyle = '#f5efe2';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#14100c';
  let bx = x + w * 0.06;
  const unit = w * 0.012;
  while (bx < x + w * 0.92) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const bars = 1 + (seed % 3);
    if ((seed >> 4) % 3 !== 0) ctx.fillRect(bx, y + h * 0.10, unit * bars, h * 0.68);
    bx += unit * (bars + 1);
  }
  ctx.font = `${h * 0.13}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('VOL 1 · LEONIDA', x + w / 2, y + h * 0.90);
  ctx.restore();
};

/* The fictional billing block, set small and wide like a real poster. */
VCS.drawBilling = function (ctx, cx, y, w) {
  const lines = [
    'SUNDOWN PICTURES PRESENTS A VICE COVER STUDIO PRODUCTION',
    'CASTING BY THE NEIGHBOURHOOD · MUSIC BY THE HARBOUR BAND · COSTUMES BY PALM & CHROME',
    'FILMED ON LOCATION IN LEONIDA · NO SAINTS WERE HARMED',
  ];
  ctx.save();
  ctx.fillStyle = 'rgba(240,220,190,0.66)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const fs = w * 0.021;
  ctx.font = `${fs}px 'Arial Narrow', Arial, sans-serif`;
  lines.forEach((line, i) => ctx.fillText(line, cx, y + i * fs * 1.5));
  ctx.restore();
};
