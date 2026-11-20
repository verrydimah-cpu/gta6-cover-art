// render.js — the single renderCover pipeline for VICE COVER STUDIO.
// The live preview and every PNG export call this exact function, so
// what you see is byte-for-byte the composition you download.
// Round 8 finish: ordered-dithered gradients, finer and softer
// luminance-only grain, a gentler vignette with a slow falloff, and a
// shared unsharp "Sharp" finish (default 0.62).

import { GRADES, paintSky, paintSunGlow, paintSplitTone, seededRandom } from './grades.js';
import { getLayout, TAG_BASELINE } from './layouts.js';
import { GOLD, drawStars, drawReviewLine, drawVolBox, drawChromeTitle, drawScriptSubtitle, drawRibbon, drawSeal, drawBarcode, drawComingSoon, drawBilling } from './decor.js';

export const DIVIDERS = {
  gold: { label: 'Gold Keyline', outer: '#f5c542', inner: '#7a5a17', width: 0.006 },
  white: { label: 'White Keyline', outer: '#ffffff', inner: '#9a9a9a', width: 0.005 },
  black: { label: 'Black Keyline', outer: '#0a0a0a', inner: '#3a3a3a', width: 0.007 },
  none: { label: 'No Divider', outer: null, inner: null, width: 0 },
};

const work = document.createElement('canvas');
const blurWork = document.createElement('canvas');

function drawCoverImage(ctx, img, x, y, w, h, slot) {
  const zoom = slot.zoom || 1;
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  // Focus point picks which part of the overflow survives the crop
  // (0 = top/left edge, 0.5 = centre, 1 = bottom/right edge); the
  // user's shift sliders then nudge from that anchored position.
  const fx = slot.focusX !== undefined ? slot.focusX : 0.5;
  const fy = slot.focusY !== undefined ? slot.focusY : 0.5;
  const dx = x + (w - dw) * fx + (slot.x || 0) * w * 0.15;
  const dy = y + (h - dh) * fy + (slot.y || 0) * h * 0.15;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPlaceholder(ctx, x, y, w, h, grade, role) {
  paintSky(ctx, x, y, w, h, grade.sky);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.font = `${Math.round(w * 0.09)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(role || 'EMPTY', x + w / 2, y + h / 2);
  ctx.restore();
}

// Black slash-tag with a gold rule, pinned to the shared baseline grid.
function drawRoleTag(ctx, px, py, pw, ph, W, role) {
  if (!role) return;
  const tagH = Math.max(14, W * 0.026);
  const y = py + ph - TAG_BASELINE * W * 1.4 - tagH + TAG_BASELINE * W;
  const baseY = py + ph - Math.max(10, W * 0.014) - tagH;
  const ty = Math.min(y, baseY + tagH * 0.2);
  ctx.save();
  ctx.font = `${Math.round(tagH * 0.58)}px Anton, sans-serif`;
  const tw = ctx.measureText(role).width + tagH * 1.15;
  const x = px + W * 0.010;
  const slant = tagH * 0.42;
  ctx.beginPath();
  ctx.moveTo(x + slant, ty);
  ctx.lineTo(x + tw + slant, ty);
  ctx.lineTo(x + tw, ty + tagH);
  ctx.lineTo(x, ty + tagH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(5,3,8,0.92)';
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.fillRect(x + slant, ty + tagH - Math.max(2, tagH * 0.10), tw, Math.max(2, tagH * 0.10));
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(role, x + slant + tagH * 0.42, ty + tagH * 0.46);
  ctx.restore();
}

function framePanel(ctx, x, y, w, h, W, divider) {
  if (!divider.outer) return;
  const lw = Math.max(2, W * divider.width);
  ctx.save();
  ctx.lineWidth = lw;
  ctx.strokeStyle = divider.outer;
  ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
  ctx.lineWidth = Math.max(1, lw * 0.28);
  ctx.strokeStyle = divider.inner;
  ctx.strokeRect(x + lw * 1.15, y + lw * 1.15, w - lw * 2.3, h - lw * 2.3);
  ctx.restore();
}

// Finer, softer luminance-only grain: a small seeded noise tile,
// drawn at low opacity in overlay so chroma and faces stay clean.
let grainTile = null;
function grain(ctx, W, H, amount) {
  if (!grainTile) {
    grainTile = document.createElement('canvas');
    grainTile.width = 180; grainTile.height = 180;
    const g = grainTile.getContext('2d');
    const img = g.createImageData(180, 180);
    const rand = seededRandom(0x6A17);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 118 + Math.round((rand() - 0.5) * 74);
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = 'overlay';
  const pat = ctx.createPattern(grainTile, 'repeat');
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Gentle vignette: wide, slow falloff — edges deepen, faces never crush.
function vignette(ctx, W, H) {
  const r = Math.max(W, H) * 0.92;
  const grad = ctx.createRadialGradient(W / 2, H * 0.46, r * 0.42, W / 2, H * 0.52, r);
  grad.addColorStop(0, 'rgba(8,2,10,0)');
  grad.addColorStop(0.72, 'rgba(8,2,10,0.10)');
  grad.addColorStop(1, 'rgba(8,2,10,0.34)');
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Unsharp finish: blurred copy differenced back at whisper strength.
function sharpen(ctx, W, H, amount) {
  if (amount <= 0.01) return;
  work.width = W; work.height = H;
  work.getContext('2d').drawImage(ctx.canvas, 0, 0);
  blurWork.width = W; blurWork.height = H;
  const b = blurWork.getContext('2d');
  b.filter = `blur(${Math.max(1, Math.round(W * 0.0016))}px)`;
  b.drawImage(work, 0, 0);
  ctx.save();
  ctx.globalAlpha = Math.min(0.5, amount * 0.55);
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(work, 0, 0);
  ctx.globalAlpha = Math.min(0.5, amount * 0.55);
  ctx.drawImage(blurWork, 0, 0);
  ctx.restore();
}

export function renderCover(ctx, W, H, state) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const layout = getLayout(state.layout);
  const divider = DIVIDERS[state.divider] || DIVIDERS.gold;
  const panels = layout.build(W, H);

  // Backdrop: deep plum-brown, dithered so it never bands.
  paintSky(ctx, 0, 0, W, H * 0.30, ['#4a1030', '#33102a', '#241022', '#180a18']);
  ctx.fillStyle = '#180a18';
  ctx.fillRect(0, Math.round(H * 0.30), W, H - Math.round(H * 0.30));

  // Panels.
  panels.forEach((p, i) => {
    const x = p.x * W, y = p.y * H, w = p.w * W, h = p.h * H;
    const slot = state.slots[i] || {};
    ctx.save();
    ctx.beginPath();
    if (state.layout === 'classic' && i > 0) {
      const s = W * 0.018;
      ctx.moveTo(x + s, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - s, y + h); ctx.lineTo(x, y + h);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.clip();
    if (slot.img) {
      const punch = Math.max(0.7, Math.min(1.4, slot.punch || 1));
      ctx.filter = grade.filter.replace('contrast(1.05)', `contrast(${(1.05 * punch).toFixed(3)})`).replace('contrast(1.07)', `contrast(${(1.07 * punch).toFixed(3)})`).replace('contrast(1.03)', `contrast(${(1.03 * punch).toFixed(3)})`).replace('contrast(1.04)', `contrast(${(1.04 * punch).toFixed(3)})`);
      drawCoverImage(ctx, slot.img, x, y, w, h, slot);
      ctx.filter = 'none';
      paintSplitTone(ctx, x, y, w, h, grade);
    } else {
      drawPlaceholder(ctx, x, y, w, h, grade, slot.role || p.role);
    }
    ctx.restore();
    framePanel(ctx, x, y, w, h, W, divider);
    drawRoleTag(ctx, x, y, w, h, W, slot.role !== undefined ? slot.role : p.role);
  });

  // One shared sun glow screened across the whole composition.
  paintSunGlow(ctx, W, H, grade);

  const ensemble = state.layout === 'ensemble';
  const chrome = state.caption === 'chrome';
  const magazine = state.caption === 'magazine';

  if (chrome || ensemble) {
    drawStars(ctx, W / 2, H * 0.026, W * 0.011);
    drawReviewLine(ctx, W, H * 0.047, state.review);
    drawVolBox(ctx, W * 0.018, H * 0.016, W * 0.062);
    if (ensemble) drawScriptSubtitle(ctx, W / 2, H * 0.096, W, state.subtitle);
    // Micro-spacing (round 8): ribbon, title, coming-soon and billing
    // share one optical rhythm down the footer, sized to fit the
    // space the layout actually leaves at any aspect.
    if (!ensemble) {
      // Collage layouts run their panels lower: ribbon beneath them,
      // no stacked title block competing with the collage itself.
      drawScriptSubtitle(ctx, W / 2, H * 0.115, W, state.subtitle);
      drawRibbon(ctx, W * 0.075, H * 0.866, W * 0.85, H * 0.032, state.ribbon);
      drawBilling(ctx, W, H);
    } else {
      const ribbonY = H * 0.792;
      drawRibbon(ctx, W * 0.075, ribbonY, W * 0.85, H * 0.032, state.ribbon);
      const titleTop = ribbonY + H * 0.040;
      const footerRoom = H - titleTop - H * 0.030;
      const titleSize = Math.min(W * 0.098, footerRoom * 0.40);
      let titleBottom;
      if (magazine) {
        titleBottom = drawChromeTitle(ctx, W / 2, H * 0.055, W, state.title1, state.title2);
      } else {
        titleBottom = drawChromeTitle(ctx, W / 2, titleTop, W, state.title1, state.title2, titleSize);
      }
      drawComingSoon(ctx, W / 2, titleBottom + H * 0.008, Math.min(W, H * 1.25), footerRoom < 160);
      drawSeal(ctx, W * 0.905, titleTop + (titleBottom - titleTop) * 0.52, Math.min(W * 0.052, H * 0.085));
      drawBarcode(ctx, W * 0.028, titleTop + (titleBottom - titleTop) * 0.30, W * 0.115, Math.min(H * 0.052, W * 0.045));
      drawBilling(ctx, W, H);
    }
  } else if (magazine) {
    drawChromeTitle(ctx, W / 2, H * 0.045, W, state.title1, state.title2);
    drawScriptSubtitle(ctx, W / 2, H * 0.235, W, state.subtitle);
    drawRibbon(ctx, W * 0.075, H * 0.866, W * 0.85, H * 0.032, state.ribbon);
    drawBilling(ctx, W, H);
  } else {
    // Minimal: quiet title low-left, subtitle beneath it.
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = `${Math.round(W * 0.055)}px Anton, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = W * 0.008;
    ctx.fillText(`${state.title1} ${state.title2}`.trim(), W * 0.035, H * 0.905);
    ctx.restore();
    drawScriptSubtitle(ctx, W * 0.30, H * 0.945, W, state.subtitle);
  }
  // Film finish.
  vignette(ctx, W, H);
  grain(ctx, W, H, 0.16);
  sharpen(ctx, W, H, state.sharp !== undefined ? state.sharp : 0.62);
}
