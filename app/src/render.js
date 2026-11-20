// render.js — the one render path. Preview and every export call the same
// renderCover, so what the editor shows is byte-for-byte the cover the
// studio exports: panels first (each photo cover-fitted to its panel with
// its own zoom, offset and punch trim), then the grade and film finish,
// then the poster furniture and lettering on top, crisp and ungraded.

import { panelsFor } from './layouts.js';
import { sampleById } from './shots.js';
import { gradeById, applyFinish } from './grades.js';
import {
  panelPath, drawPanelFrame, drawRoleTag, drawChromeTitle, drawScriptSubtitle,
  drawStars, drawReviewLine, drawVolBox, drawRibbon, drawSeal, drawBilling, drawBarcode,
} from './decor.js';

export const DEFAULT_TITLE = 'SUNDOWN CITY';
export const DEFAULT_REVIEW = 'PURE SUNSET ADRENALINE — THE RIDE OF THE YEAR';

// The sunset the CITY panel and empty panels fall back to: a multi-stop
// sky drawn in thin bands so the steps stay invisible even before the
// grade's dither pass smooths them further.
function drawSunsetSky(ctx, x, y, w, h) {
  const stops = [
    [0, '#1a0533'], [0.3, '#7b2ff7'], [0.55, '#ff5e8a'], [0.78, '#ff9a5a'], [1, '#ffd76a'],
  ];
  const bands = 48;
  for (let i = 0; i < bands; i++) {
    const t0 = i / bands, t1 = (i + 1) / bands;
    ctx.fillStyle = mixStops(stops, (t0 + t1) / 2);
    ctx.fillRect(x, y + t0 * h, w, (t1 - t0) * h + 1);
  }
  const sunR = Math.min(w, h) * 0.26;
  const sun = ctx.createRadialGradient(x + w * 0.5, y + h * 0.72, 0, x + w * 0.5, y + h * 0.72, sunR);
  sun.addColorStop(0, 'rgba(255,236,170,0.95)');
  sun.addColorStop(0.55, 'rgba(255,170,90,0.55)');
  sun.addColorStop(1, 'rgba(255,150,80,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(x, y, w, h);
}

function mixStops(stops, t) {
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      const f = (t - t0) / (t1 - t0);
      const a = [1, 3, 5].map((o) => parseInt(c0.slice(o, o + 2), 16));
      const b = [1, 3, 5].map((o) => parseInt(c1.slice(o, o + 2), 16));
      return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',')})`;
    }
  }
  return stops[stops.length - 1][1];
}

// Cover-fit one photograph into its panel: scale to fill, centre on the
// sample's focus point, then let the panel's own zoom and drag offset
// refine the crop. Punch is the panel's contrast/saturation trim.
function drawPanelPhoto(ctx, img, panel, px, trim) {
  const zoom = trim.zoom || 1;
  const scale = Math.max(px.w / img.width, px.h / img.height) * zoom;
  const dw = img.width * scale, dh = img.height * scale;
  const fx = (trim.focusX ?? 0.5) + (trim.ox || 0);
  const fy = (trim.focusY ?? 0.5) + (trim.oy || 0);
  const dx = px.x + (px.w - dw) * Math.min(1, Math.max(0, fx));
  const dy = px.y + (px.h - dh) * Math.min(1, Math.max(0, fy));
  ctx.save();
  const punch = trim.punch ?? 1;
  ctx.filter = `saturate(${(punch * 100).toFixed(1)}%) contrast(${((0.96 + punch * 0.05) * 100).toFixed(1)}%)`;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

export function renderCover(ctx, W, H, state, images) {
  const unit = Math.min(W, H) / 1080;
  ctx.fillStyle = '#22101d';
  ctx.fillRect(0, 0, W, H);
  const panels = panelsFor(state.layout, W / H);
  const grid = Math.max(4, Math.round(H * 0.008));

  for (const p of panels) {
    const px = { x: p.x * W, y: p.y * H, w: p.w * W, h: p.h * H };
    const sampleId = (state.assign && state.assign[p.key]) || p.sample;
    const sample = sampleById(sampleId);
    const saved = (state.panels && state.panels[p.key]) || {};
    const trim = {
      zoom: saved.zoom ?? 1,
      ox: saved.ox ?? 0,
      oy: saved.oy ?? 0,
      punch: (sample.punch ?? 1) + (saved.punch ?? 0),
      focusX: sample.focus ? sample.focus.x : 0.5,
      focusY: sample.focus ? sample.focus.y : 0.5,
    };
    ctx.save();
    panelPath(ctx, px.x, px.y, px.w, px.h, p.slant);
    ctx.clip();
    const img = images[sampleId];
    if (img && !sample.gradient) drawPanelPhoto(ctx, img, p, px, trim);
    else drawSunsetSky(ctx, px.x - 2, px.y - 2, px.w + 4, px.h + 4);
    ctx.restore();
    drawPanelFrame(ctx, px.x, px.y, px.w, px.h, p.slant, unit);
    const role = (state.roles && state.roles[p.key]) || sample.role;
    const tagSize = Math.max(11, unit * 21);
    drawRoleTag(ctx, role, px.x + unit * 12, px.y + px.h - unit * 12, tagSize, grid);
  }

  applyFinish(ctx, W, H, gradeById(state.grade), state.finish);
  drawFurniture(ctx, W, H, state, unit);
}

// The furniture layer: a scrim first so the lettering reads over any
// photograph, then the one-sheet dressing on one optical rhythm — stars,
// review line, chrome title with the script subtitle tucked over its
// right shoulder, ribbon, billing small print, COMING SOON at the left
// foot and the barcode at the right. Wide and square exports use the
// compact footer: the same rhythm compressed, one billing line.
function drawFurniture(ctx, W, H, state, unit) {
  const aspect = W / H;
  const compact = aspect >= 0.95;
  const bandTop = H * 0.845;
  const scrim = ctx.createLinearGradient(0, bandTop - H * 0.1, 0, H);
  scrim.addColorStop(0, 'rgba(16,3,12,0)');
  scrim.addColorStop(0.45, 'rgba(16,3,12,0.72)');
  scrim.addColorStop(1, 'rgba(16,3,12,0.94)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandTop - H * 0.1, W, H - bandTop + H * 0.1);

  drawVolBox(ctx, W * 0.02, H * 0.02, unit * (compact ? 54 : 62));
  drawSeal(ctx, W * (compact ? 0.945 : 0.935), H * (compact ? 0.075 : 0.085), unit * (compact ? 40 : 46));

  if (state.style === 'neon') {
    drawScriptSubtitle(ctx, state.title, W / 2, H * 0.935, unit * 92);
    drawStars(ctx, W / 2, H * 0.862, unit * 17);
    return;
  }
  if (state.style === 'bold') {
    ctx.save();
    ctx.fillStyle = '#12040d';
    ctx.fillRect(0, H * 0.845, W, H * 0.155);
    ctx.restore();
    drawChromeTitle(ctx, state.title, W / 2, H * 0.945, unit * (compact ? 74 : 84));
    drawRibbon(ctx, state.tagline, W / 2, H * 0.856, W * 0.62, unit * 19);
    return;
  }

  if (compact) {
    drawStars(ctx, W / 2, H * 0.872, unit * 14);
    drawChromeTitle(ctx, state.title, W / 2, H * 0.945, unit * 64);
    drawScriptSubtitle(ctx, state.subtitle, W * 0.67, H * 0.898, unit * 27);
    drawBilling(ctx, W / 2, H * 0.978, W * 0.9, unit * 10, 1);
  } else {
    drawStars(ctx, W / 2, H * 0.8615, unit * 15);
    drawReviewLine(ctx, state.review || DEFAULT_REVIEW, W / 2, H * 0.884, unit * 16.5);
    drawChromeTitle(ctx, state.title, W / 2, H * 0.939, unit * 76);
    drawScriptSubtitle(ctx, state.subtitle, W * 0.685, H * 0.902, unit * 30);
    drawRibbon(ctx, state.tagline, W / 2, H * 0.947, W * 0.56, unit * 13.5);
    drawBilling(ctx, W / 2, H * 0.972, W * 0.92, unit * 9.5, 3);
  }
  ctx.save();
  ctx.font = `${unit * 13}px Anton, sans-serif`;
  ctx.fillStyle = '#f6d789';
  ctx.fillText('COMING SOON', W * 0.02, H * 0.988);
  ctx.restore();
  drawBarcode(ctx, W - unit * 104, H * 0.955, unit * 92, unit * 40, state.title);
}
