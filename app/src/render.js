// VICE COVER STUDIO — the cover renderer.
//
// One function, renderCover, paints a complete poster onto any canvas at
// any size. The live preview and all three PNG exports call it, so the
// grade, grain, sharpening and furniture are identical everywhere — the
// editor is honest about what will ship.
//
// Painting order:
//   1. poster backdrop (dark plum-brown field, or the grade sky),
//   2. photo panels with per-panel crop, zoom and gentle punch,
//   3. a shared sun glow screened across the panels so separate photos
//      feel lit by the same sunset,
//   4. split toning, vignette and seeded luminance-only film grain,
//   5. poster furniture (stars, title, script, ribbon, seal, barcode),
//   6. the Sharp finish — an unsharp pass shared by preview and exports.

import { gradeById } from './grades.js';
import {
  DEFAULT_TEXT,
  drawBarcode,
  drawBilling,
  drawComingSoon,
  drawReview,
  drawRibbon,
  drawRoleTag,
  drawScript,
  drawSeal,
  drawTitle,
  drawVolBox,
  seededRandom,
} from './decor.js';

export const CAPTION_STYLES = [
  { id: 'chrome-block', name: 'Chrome Block' },
  { id: 'top-banner', name: 'Top Banner' },
  { id: 'masthead', name: 'Magazine Masthead' },
];

export const DIVIDER_STYLES = [
  { id: 'gold', name: 'Gold Keyline' },
  { id: 'neon', name: 'Neon Pink' },
  { id: 'chrome', name: 'Chrome' },
  { id: 'shadow', name: 'Soft Shadow' },
];

const DIVIDER_COLORS = {
  gold: '#e8b84b',
  neon: '#ff2e93',
  chrome: '#e8ecf2',
  shadow: 'rgba(0,0,0,0)',
};

function drawSkyPanel(ctx, x, y, w, h, grade) {
  const grad = ctx.createLinearGradient(0, y, 0, y + h);
  const stops = grade.sky;
  stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c));
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  // A low sun disc baked into gradient panels.
  const sunR = Math.min(w, h) * 0.26;
  const sg = ctx.createRadialGradient(x + w * 0.5, y + h * 0.62, 0, x + w * 0.5, y + h * 0.62, sunR);
  sg.addColorStop(0, 'rgba(255,236,180,0.95)');
  sg.addColorStop(0.55, 'rgba(255,190,110,0.55)');
  sg.addColorStop(1, 'rgba(255,190,110,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(x, y, w, h);
}

function drawPhotoPanel(ctx, img, p, x, y, w, h, grade) {
  // Punch stays gentle: a whisper of contrast and saturation so skin,
  // paintwork and chrome still read as a photograph, not a cartoon.
  const punch = p.punch ?? 0.35;
  const sat = grade.sat * (1 + punch * 0.22);
  const con = grade.con * (1 + punch * 0.16);
  const bri = 1 + punch * 0.03;
  const filter = `saturate(${sat.toFixed(3)}) contrast(${con.toFixed(3)}) brightness(${bri.toFixed(3)})`;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (p.fit === 'letterbox') {
    // For a very wide panel holding a squarer photograph: fill the panel
    // with a dark, blurred cover-fit of the same photo, then lay the whole
    // photograph over it fitted by width, so the full subject — the whole
    // motorcycle, nose to tail — survives instead of being sliced away.
    const bs = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    ctx.filter = 'blur(10px) brightness(0.5) saturate(1.1)';
    ctx.drawImage(img, x + (w - img.naturalWidth * bs) / 2, y + (h - img.naturalHeight * bs) / 2, img.naturalWidth * bs, img.naturalHeight * bs);
    // Contain fit: the whole photograph inside the panel, centred by the
    // panel's focal offsets, over its own blurred backdrop.
    const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight) * (p.zoom || 1);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = x + (w - dw) * (p.ox ?? 0.5);
    const dy = y + (h - dh) * (p.oy ?? 0.5);
    ctx.filter = filter;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    // Cover-fit with the panel's zoom, then slide by its focal offsets.
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * (p.zoom || 1);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = x + (w - dw) * (p.ox ?? 0.5);
    const dy = y + (h - dh) * (p.oy ?? 0.5);
    ctx.filter = filter;
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  ctx.filter = 'none';
  // Grade tint wash so every source leans the same way.
  ctx.fillStyle = grade.tint;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function framePanel(ctx, x, y, w, h, W, divider) {
  if (divider === 'shadow') {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = W * 0.012;
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = Math.max(1, W * 0.002);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
    return;
  }
  ctx.strokeStyle = DIVIDER_COLORS[divider] || DIVIDER_COLORS.gold;
  ctx.lineWidth = Math.max(1.5, W * 0.0032);
  ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = Math.max(1, W * 0.0012);
  const inset = W * 0.0042;
  ctx.strokeRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
}

// Seeded luminance-only grain: the same noise field at every size, and it
// shifts brightness only, never hue, so colours stay clean.
function applyGrain(ctx, W, H, amount, seed) {
  if (amount <= 0) return;
  const img = ctx.getImageData(0, 0, W, H);
  const data = img.data;
  const rand = seededRandom(seed);
  const strength = amount * 255;
  for (let i = 0; i < data.length; i += 4) {
    const n = (rand() - 0.5) * strength;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function applyVignette(ctx, W, H, strength) {
  if (strength <= 0) return;
  const r = Math.hypot(W, H) / 2;
  const grad = ctx.createRadialGradient(W / 2, H / 2, r * 0.42, W / 2, H / 2, r * 1.02);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${strength.toFixed(3)})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

// The Sharp finish: a classic unsharp mask. The canvas is blurred onto a
// scratch surface, then recombined as original + k * (original - blur).
// Preview and exports share this exact pass and the same default strength.
export function applySharpen(canvas, amount) {
  if (!amount || amount <= 0) return;
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const scratch = document.createElement('canvas');
  scratch.width = W;
  scratch.height = H;
  const sctx = scratch.getContext('2d');
  sctx.filter = 'blur(2px)';
  sctx.drawImage(canvas, 0, 0);
  sctx.filter = 'none';
  const src = ctx.getImageData(0, 0, W, H);
  const blur = sctx.getImageData(0, 0, W, H);
  const a = src.data;
  const b = blur.data;
  for (let i = 0; i < a.length; i += 4) {
    a[i] = a[i] + (a[i] - b[i]) * amount;
    a[i + 1] = a[i + 1] + (a[i + 1] - b[i + 1]) * amount;
    a[i + 2] = a[i + 2] + (a[i + 2] - b[i + 2]) * amount;
  }
  ctx.putImageData(src, 0, 0);
}

// Paint the whole cover. `images` maps a sample id to a loaded Image (or a
// canvas); the special id "sunset-gradient" needs no image at all.
export function renderCover(canvas, state, images) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const grade = gradeById(state.gradeId);
  const text = { ...DEFAULT_TEXT, ...state.text };

  // 1 — Backdrop: a deep plum-brown field with a whisper of the grade sky
  // bleeding down from the top, darker at the edges.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, grade.sky[1]);
  bg.addColorStop(0.22, grade.backdrop);
  bg.addColorStop(1, grade.backdropEdge);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 2 — Panels.
  for (const p of state.panels) {
    const x = p.x * W;
    const y = p.y * H;
    const w = p.w * W;
    const h = p.h * H;
    const img = images[p.sample];
    if (p.sample === 'sunset-gradient' || !img) drawSkyPanel(ctx, x, y, w, h, grade);
    else drawPhotoPanel(ctx, img, p, x, y, w, h, grade);
  }

  // 3 — One sun, shared by every panel: a soft glow screened across the
  // whole poster so the cast feels photographed in the same light.
  const sunX = grade.sun.x * W;
  const sunY = grade.sun.y * H;
  const sunR = Math.max(W, H) * 0.55;
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
  glow.addColorStop(0, `rgba(${grade.sun.color},${(grade.sun.strength * 0.5).toFixed(3)})`);
  glow.addColorStop(0.5, `rgba(${grade.sun.color},${(grade.sun.strength * 0.18).toFixed(3)})`);
  glow.addColorStop(1, `rgba(${grade.sun.color},0)`);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Frames and role tags sit above the glow so they stay crisp.
  for (const p of state.panels) {
    const x = p.x * W;
    const y = p.y * H;
    const w = p.w * W;
    const h = p.h * H;
    framePanel(ctx, x, y, w, h, W, state.dividerId);
    drawRoleTag(ctx, x, y + h, w, W, p.tag);
  }

  // 4 — Split toning, feathered so no hard seam crosses a face, then the
  // vignette.
  const shadowGrad = ctx.createLinearGradient(0, H * 0.35, 0, H);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
  shadowGrad.addColorStop(0.45, grade.split.shadow);
  shadowGrad.addColorStop(1, grade.split.shadow);
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(0, H * 0.35, W, H * 0.65);
  const highGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  highGrad.addColorStop(0, grade.split.highlight);
  highGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = highGrad;
  ctx.fillRect(0, 0, W, H * 0.5);
  applyVignette(ctx, W, H, grade.vignette);

  // 5 — Furniture. Placement follows the chosen caption style. Every stack
  // is budgeted against the canvas height so nothing falls off the foot of
  // the poster in any aspect.
  const style = state.captionId;
  let billingY = H * 0.97;
  if (style === 'top-banner') {
    drawReview(ctx, W, text.review);
    drawVolBox(ctx, W);
    const after = drawTitle(ctx, W, H * 0.06, text.titleTop, text.titleBottom, H);
    drawScript(ctx, W, after + H * 0.004, text.subtitle);
    drawRibbon(ctx, W, H * 0.845, text.tagline, H);
    drawComingSoon(ctx, W, H * 0.898, false, H);
  } else if (style === 'masthead') {
    drawReview(ctx, W, text.review);
    const after = drawTitle(ctx, W, H * 0.078, text.titleTop, text.titleBottom, H);
    drawScript(ctx, W, after + H * 0.002, text.subtitle);
    drawRibbon(ctx, W, H * 0.85, text.tagline, H);
    drawComingSoon(ctx, W, H * 0.902, false, H);
  } else {
    // Chrome Block (default): stars and review up top with the neon script
    // riding just beneath them over the panels' sky; then, below the
    // panels, the gold ribbon, the chrome title standing proud, a compact
    // COMING SOON and the billing block — each budgeted its own band.
    drawReview(ctx, W, text.review);
    drawVolBox(ctx, W);
    drawScript(ctx, W, H * 0.058, text.subtitle);
    drawRibbon(ctx, W, H * 0.783, text.tagline, H);
    drawTitle(ctx, W, H * 0.821, text.titleTop, text.titleBottom, H, 0.0728);
    drawComingSoon(ctx, W, H * 0.961, true, H);
    billingY = H * 0.98;
  }

  // Seal, barcode and billing anchor the foot of every style.
  drawSeal(ctx, W * 0.925, H * 0.9, W * 0.048);
  drawBarcode(ctx, W * 0.028, H * 0.9, W * 0.105, H * 0.052);
  drawBilling(ctx, W, billingY, text.studio, text.billing, H);

  // 6 — Grain over the photography and furniture alike, then the finish.
  applyGrain(ctx, W, H, grade.grain, 1337);
  applySharpen(canvas, state.sharp ?? 0.62);
  return canvas;
}
