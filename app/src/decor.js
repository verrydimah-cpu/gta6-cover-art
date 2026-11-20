// VICE COVER STUDIO — poster furniture.
//
// Everything in this module is original art drawn with canvas primitives:
// the five-star review line, the VOL. 1 corner box, the retro-chrome main
// title, the neon script subtitle, the gold ribbon tagline, the COMING SOON
// block, the tiny fictional billing block, the BEST CAST seal and the
// barcode. No logos, artwork or lettering are copied from any real poster —
// the words, names and credits below are invented for this studio.

export const DEFAULT_TEXT = {
  titleTop: 'VICE',
  titleBottom: 'COVER',
  subtitle: 'Sunset City Stories',
  tagline: 'EVERYBODY WANTS A PIECE OF THE SUNSET',
  review: 'PURE SUNSET ADRENALINE — THE RIDE OF THE YEAR',
  studio: 'PALM SHADOW PICTURES PRESENTS',
  billing:
    'A SUNSET CITY STORY  STARRING THE DRIVER · THE RIDER · THE CAPTAIN · THE FIXER  ' +
    'MUSIC BY THE BOARDWALK KINGS  COSTUMES BY M. SOLANO  EDITED BY R. VANCE  ' +
    'DIRECTOR OF PHOTOGRAPHY L. MARLOWE  PRODUCED BY A. DELMAR  DIRECTED BY J. CALLOWAY',
};

const GOLD = '#e8b84b';
const GOLD_LIGHT = '#ffe9a8';
const CREAM = '#fdf6e3';

// Deterministic PRNG (mulberry32) so preview and exports agree exactly.
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function star(ctx, cx, cy, r, color) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// Five gold stars with the review line set beneath them, top centre.
export function drawReview(ctx, W, text) {
  const cy = W * 0.03;
  const r = W * 0.011;
  const gap = W * 0.032;
  const startX = W / 2 - gap * 2;
  for (let i = 0; i < 5; i++) star(ctx, startX + i * gap, cy, r, GOLD);
  ctx.font = `600 ${Math.round(W * 0.016)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = CREAM;
  ctx.fillText(text, W / 2, cy + r * 1.6, W * 0.9);
}

// VOL. 1 box in the top-left corner, like a magazine issue marker.
export function drawVolBox(ctx, W) {
  const s = W * 0.052;
  const x = W * 0.028;
  const y = W * 0.02;
  ctx.fillStyle = '#12060d';
  ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(1.5, W * 0.0022);
  ctx.strokeRect(x, y, s, s);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.textAlign = 'center';
  ctx.font = `${Math.round(s * 0.34)}px Anton, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('VOL.', x + s / 2, y + s * 0.32);
  ctx.font = `${Math.round(s * 0.44)}px Anton, sans-serif`;
  ctx.fillText('1', x + s / 2, y + s * 0.68);
}

// Retro-chrome stacked title: heavy outline, stacked offset shadows, and a
// vertical orange-to-pink gradient split by a bright chrome band. The size
// is capped by canvas height as well as width, so two stacked lines always
// fit the furniture band in portrait, square and landscape alike.
export function drawTitle(ctx, W, y, top, bottom, H = W * 1.25, capH = 0.088) {
  const size = Math.min(W * 0.148, H * capH);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `${Math.round(size)}px Anton, sans-serif`;
  const lines = [top, bottom].filter((t) => t && t.trim().length > 0);
  lines.forEach((line, i) => {
    const ly = y + i * size * 0.94;
    const grad = ctx.createLinearGradient(0, ly, 0, ly + size);
    grad.addColorStop(0, '#fff7d6');
    grad.addColorStop(0.34, '#ffb03a');
    grad.addColorStop(0.47, '#f2762e');
    grad.addColorStop(0.5, '#fff3c4');
    grad.addColorStop(0.53, '#e84e8a');
    grad.addColorStop(0.78, '#c72b6e');
    grad.addColorStop(1, '#7a1e5e');
    // Stacked shadows first, walking down-right.
    for (let s = 5; s >= 1; s--) {
      ctx.fillStyle = s % 2 ? '#2a0a1e' : '#48102f';
      ctx.fillText(line, W / 2 + s * (W * 0.0022), ly + s * (W * 0.0022), W * 0.94);
    }
    ctx.lineWidth = Math.max(2, W * 0.0075);
    ctx.strokeStyle = '#1c0512';
    ctx.lineJoin = 'round';
    ctx.strokeText(line, W / 2, ly, W * 0.94);
    ctx.fillStyle = grad;
    ctx.fillText(line, W / 2, ly, W * 0.94);
  });
  return y + lines.length * size * 0.94;
}

// Neon-pink script subtitle with a soft glow pass underneath.
export function drawScript(ctx, W, y, text) {
  if (!text || !text.trim()) return y;
  const size = W * 0.052;
  ctx.font = `italic 700 ${Math.round(size)}px "Segoe Script", "Brush Script MT", cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(255,45,150,0.85)';
  ctx.shadowBlur = W * 0.02;
  ctx.fillStyle = '#ff5fa8';
  ctx.fillText(text, W / 2, y, W * 0.9);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffd7ec';
  ctx.fillText(text, W / 2, y, W * 0.9);
  return y + size * 1.25;
}

// Gold-bordered ribbon carrying the tagline.
export function drawRibbon(ctx, W, y, text, H = W * 1.25) {
  if (!text || !text.trim()) return y;
  const h = Math.min(W * 0.042, H * 0.036);
  const w = W * 0.86;
  const x = (W - w) / 2;
  ctx.fillStyle = 'rgba(14,4,10,0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(1.5, W * 0.0024);
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = `${Math.round(h * 0.46)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, y + h / 2 + 1, w * 0.94);
  return y + h;
}

// COMING SOON release block, sized to sit just above the billing block.
// In compact mode only the headline is drawn, for the crowded Chrome Block
// stack at the foot of the ensemble cover.
export function drawComingSoon(ctx, W, y, compact = false, H = W * 1.25) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = CREAM;
  ctx.font = `${Math.round(Math.min(W * 0.024, H * 0.02))}px Anton, sans-serif`;
  ctx.fillText('COMING SOON', W / 2, y, W * 0.6);
  if (compact) return y + H * 0.02;
  ctx.fillStyle = GOLD;
  ctx.font = `${Math.round(Math.min(W * 0.012, H * 0.01))}px Anton, sans-serif`;
  ctx.fillText('ONE CITY · ONE SUMMER · NO BRAKES', W / 2, y + Math.min(W * 0.028, H * 0.024), W * 0.6);
  return y + W * 0.044;
}

// Tiny fictional billing block, set small and wide like real credit blocks.
export function drawBilling(ctx, W, y, studio, billing, H = W * 1.25) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(253,246,227,0.85)';
  ctx.font = `${Math.round(Math.min(W * 0.013, H * 0.011))}px Anton, sans-serif`;
  ctx.fillText(studio, W / 2, y, W * 0.9);
  ctx.fillStyle = 'rgba(253,246,227,0.62)';
  ctx.font = `${Math.round(Math.min(W * 0.0095, H * 0.008))}px Anton, sans-serif`;
  ctx.fillText(billing, W / 2, y + Math.min(W * 0.017, H * 0.014), W * 0.94);
  return y + W * 0.032;
}

// Circular gold BEST CAST seal.
export function drawSeal(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#160a12';
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.07);
  ctx.strokeStyle = GOLD;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.stroke();
  star(ctx, cx, cy - r * 0.34, r * 0.2, GOLD);
  ctx.fillStyle = GOLD_LIGHT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(r * 0.34)}px Anton, sans-serif`;
  ctx.fillText('BEST', cx, cy + r * 0.12);
  ctx.fillText('CAST', cx, cy + r * 0.46);
}

// Barcode block: seeded bars of varying width above a fake number string.
export function drawBarcode(ctx, x, y, w, h) {
  ctx.fillStyle = '#fdfdf8';
  ctx.fillRect(x, y, w, h);
  const rand = seededRandom(20261120);
  ctx.fillStyle = '#101010';
  let bx = x + w * 0.06;
  const bottom = y + h * 0.78;
  while (bx < x + w * 0.92) {
    const bw = (0.5 + rand() * 2.2) * (w / 90);
    if (rand() > 0.32) ctx.fillRect(bx, y + h * 0.1, bw, bottom - y - h * 0.1);
    bx += bw + (0.4 + rand() * 1.4) * (w / 90);
  }
  ctx.font = `${Math.round(h * 0.17)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('8 904211 620261', x + w / 2, y + h * 0.89);
}

// Black slash-tag with a gold rule: the role label pinned to a panel.
// Drawn as a parallelogram so it reads as a slashed sticker, with the tag
// text in Anton and a short gold bar above the type.
export function drawRoleTag(ctx, px, py, pw, W, tag) {
  if (!tag || !tag.trim()) return;
  const size = Math.max(9, W * 0.0175);
  ctx.font = `${Math.round(size)}px Anton, sans-serif`;
  const tw = ctx.measureText(tag).width;
  const padX = size * 0.65;
  const w = tw + padX * 2;
  const h = size * 1.62;
  const x = px + W * 0.008;
  const y = py - h - W * 0.008;
  const slant = h * 0.32;
  ctx.beginPath();
  ctx.moveTo(x + slant, y);
  ctx.lineTo(x + w + slant, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8,4,8,0.92)';
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.fillRect(x + slant * 0.55, y + h * 0.16, w * 0.3, Math.max(1.5, h * 0.07));
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, x + padX + slant * 0.28, y + h * 0.58);
}
