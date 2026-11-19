// The cover renderer for VICE COVER STUDIO: one function paints a whole cover onto a 2D context at any
// pixel size, so the live preview and the exported PNG are the same drawing. A cover is the layout's
// photo panels (each photo cover-fitted into its panel's bounding box, then clipped to the angled
// polygon), the grade's duotone wash over each photo, cream dividers between the panels, palm and
// halftone accents over the corners, a vignette, and the caption lettering in Anton with a heavy
// outline, a gradient fill and a hard drop shadow.
import { layoutById, polygonBounds } from './layouts.js';
import { gradeById } from './grades.js';
import { paintEmptyPanelArt, drawPalm, drawHalftonePatch } from './decor.js';

/** The export sizes the studio offers, in pixels: the common post sizes. */
export const EXPORT_SIZES = [
  { id: 'square', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
];

/** The export size with the given id, or the square size when the id is unknown. */
export function exportSizeById(id) {
  return EXPORT_SIZES.find((size) => size.id === id) ?? EXPORT_SIZES[0];
}

/** Traces a polygon (normalised points) onto the context as a path, scaled to the cover's pixels. */
function tracePolygon(ctx, polygon, w, h) {
  ctx.beginPath();
  polygon.forEach(([px, py], i) => {
    if (i === 0) ctx.moveTo(px * w, py * h);
    else ctx.lineTo(px * w, py * h);
  });
  ctx.closePath();
}

/**
 * Draws one photo panel: the photo cover-fits the polygon's bounding box at the panel's zoom, centred
 * with the panel's pan offsets (dx, dy in -1..1, scaled by the slack the zoom leaves), clipped to the
 * polygon, graded by the CSS filter and the duotone wash. Returns nothing; the context is restored.
 */
function drawPhotoPanel(ctx, w, h, polygon, panel, grade) {
  const b = polygonBounds(polygon);
  const bx = b.x * w, by = b.y * h, bw = b.w * w, bh = b.h * h;
  ctx.save();
  tracePolygon(ctx, polygon, w, h);
  ctx.clip();
  const img = panel.image;
  const baseScale = Math.max(bw / img.naturalWidth, bh / img.naturalHeight);
  const scale = baseScale * Math.max(1, panel.zoom || 1);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const slackX = Math.max(0, (dw - bw) / 2);
  const slackY = Math.max(0, (dh - bh) / 2);
  const cx = bx + bw / 2 + (panel.dx || 0) * slackX;
  const cy = by + bh / 2 + (panel.dy || 0) * slackY;
  ctx.filter = grade.filter;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.filter = 'none';
  // Duotone wash: the grade's colours blended over the photo.
  const wash = ctx.createLinearGradient(0, by, 0, by + bh);
  for (const [stop, colour] of grade.wash) wash.addColorStop(stop, colour);
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(bx, by, bw, bh);
  ctx.globalCompositeOperation = 'source-over';
  // A soft shade at the panel's foot keeps the collage grounded.
  const shade = ctx.createLinearGradient(0, by + bh * 0.62, 0, by + bh);
  shade.addColorStop(0, 'rgba(16, 2, 34, 0)');
  shade.addColorStop(1, 'rgba(16, 2, 34, 0.28)');
  ctx.fillStyle = shade;
  ctx.fillRect(bx, by, bw, bh);
  ctx.restore();
}

/** Draws an empty panel: the decorative sky scene, plus a hint label when the editor asks for one. */
function drawEmptyPanel(ctx, w, h, polygon, grade, seed, showHint) {
  const b = polygonBounds(polygon);
  ctx.save();
  tracePolygon(ctx, polygon, w, h);
  ctx.clip();
  paintEmptyPanelArt(ctx, { x: b.x * w, y: b.y * h, w: b.w * w, h: b.h * h }, grade, seed);
  if (showHint) {
    const size = Math.min(w, h) * 0.032;
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 246, 226, 0.92)';
    ctx.shadowColor = 'rgba(10, 0, 24, 0.6)';
    ctx.shadowBlur = size * 0.3;
    ctx.fillText('ADD A PHOTO', (b.x + b.w / 2) * w, (b.y + b.h / 2) * h);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

/** Strokes every panel outline in the frame colour, then a frame around the whole cover. */
function drawDividers(ctx, w, h, layout, grade) {
  const width = Math.max(5, w * 0.009);
  ctx.save();
  ctx.strokeStyle = grade.frame;
  ctx.lineWidth = width;
  ctx.lineJoin = 'miter';
  for (const polygon of layout.panels) {
    tracePolygon(ctx, polygon, w, h);
    ctx.stroke();
  }
  ctx.lineWidth = width * 1.4;
  ctx.strokeRect(width * 0.7, width * 0.7, w - width * 1.4, h - width * 1.4);
  ctx.restore();
}

/** Outlines the selected panel in bright cyan, for the editor only (never on an export). */
function drawSelection(ctx, w, h, polygon) {
  ctx.save();
  tracePolygon(ctx, polygon, w, h);
  ctx.strokeStyle = 'rgba(38, 230, 255, 0.95)';
  ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.shadowColor = 'rgba(38, 230, 255, 0.8)';
  ctx.shadowBlur = Math.max(6, w * 0.01);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(38, 230, 255, 0.10)';
  ctx.fill();
  ctx.restore();
}

/** Fits a font size down until the text fits the given width; returns the size that fits. */
function fitFontSize(ctx, text, startSize, maxWidth, fontFamily) {
  let size = startSize;
  ctx.font = `${size}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size *= 0.94;
    ctx.font = `${size}px ${fontFamily}`;
  }
  return size;
}

/**
 * Draws one line of display lettering: a hard offset shadow, a heavy dark outline and a gradient fill,
 * centred at x with its top at y. Returns the line's height in pixels.
 */
function drawDisplayLine(ctx, text, x, y, size, fillStops, tracking) {
  const family = `Anton, 'Arial Narrow', sans-serif`;
  ctx.save();
  try { ctx.letterSpacing = `${tracking}px`; } catch { /* older engines: no tracking */ }
  ctx.font = `${size}px ${family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  const fill = ctx.createLinearGradient(0, y, 0, y + size);
  fillStops.forEach((colour, i) => fill.addColorStop(i / (fillStops.length - 1), colour));
  ctx.shadowColor = 'rgba(8, 0, 20, 0.55)';
  ctx.shadowOffsetX = size * 0.045;
  ctx.shadowOffsetY = size * 0.07;
  ctx.strokeStyle = '#160a2e';
  ctx.lineWidth = size * 0.16;
  ctx.strokeText(text, x, y);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
  return size;
}

/** Draws the caption block: the big title line and the smaller subtitle, at the top or the foot. */
function drawCaption(ctx, w, h, state, grade) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  if (!title && !subtitle) return;
  const atBottom = state.captionPos !== 'top';
  // A soft dark band behind the lettering keeps it readable over any photo.
  const bandH = h * 0.34;
  const band = atBottom
    ? ctx.createLinearGradient(0, h - bandH, 0, h)
    : ctx.createLinearGradient(0, 0, 0, bandH);
  band.addColorStop(0, 'rgba(0,0,0,0)');
  band.addColorStop(1, grade.band);
  ctx.fillStyle = band;
  ctx.fillRect(0, atBottom ? h - bandH : 0, w, bandH);

  const family = `Anton, 'Arial Narrow', sans-serif`;
  const titleSize = title ? fitFontSize(ctx, title, h * 0.118, w * 0.92, family) : 0;
  const subSize = subtitle ? fitFontSize(ctx, subtitle, h * 0.037, w * 0.9, family) : 0;
  const gap = h * 0.014;
  const blockH = titleSize + (subtitle ? gap + subSize * 1.1 : 0);
  let y = atBottom ? h - h * 0.038 - blockH : h * 0.038;
  if (title) y += drawDisplayLine(ctx, title, w / 2, y, titleSize, grade.titleFill, titleSize * 0.02) + gap;
  if (subtitle) {
    ctx.save();
    drawDisplayLine(ctx, subtitle, w / 2, y, subSize, [grade.subtitle, grade.subtitle], subSize * 0.3);
    ctx.restore();
  }
}

/**
 * Paints the whole cover described by `state` onto ctx at w × h pixels. `state` carries the layout id,
 * the grade id, the panel assignments ({image, dx, dy, zoom} or null per panel), the caption words and
 * position, and the editor-only extras: `selected` (a panel index to outline, or -1) and `showHints`.
 */
export function renderCover(ctx, w, h, state) {
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);
  // Backdrop: the grade's sky, mostly hidden by the panels but filling any gap.
  ctx.fillStyle = grade.sky[0];
  ctx.fillRect(0, 0, w, h);
  layout.panels.forEach((polygon, i) => {
    const panel = state.panels[i];
    if (panel && panel.image) drawPhotoPanel(ctx, w, h, polygon, panel, grade);
    else drawEmptyPanel(ctx, w, h, polygon, grade, 1234 + i * 777, state.showHints);
  });
  drawDividers(ctx, w, h, layout, grade);
  // Corner accents over the panels: palms rising from the foot, halftone at the top corner.
  const palmSize = h * 0.3;
  drawPalm(ctx, w * 0.008, h * 1.004, palmSize, grade.silhouette, 1);
  drawPalm(ctx, w * 0.992, h * 1.004, palmSize * 0.8, grade.silhouette, -1);
  ctx.save();
  ctx.globalAlpha = 0.16;
  drawHalftonePatch(ctx, w * 0.86, h * 0.012, w * 0.13, w * 0.13, '#ffffff', 42);
  ctx.restore();
  // Vignette: darkened edges pull the eye to the middle of the poster.
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78);
  vignette.addColorStop(0, 'rgba(10, 0, 22, 0)');
  vignette.addColorStop(1, 'rgba(10, 0, 22, 0.36)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  drawCaption(ctx, w, h, state, grade);
  if (state.selected >= 0 && layout.panels[state.selected]) {
    drawSelection(ctx, w, h, layout.panels[state.selected]);
  }
}

/** Renders the cover onto a fresh canvas of the given pixel size and returns the canvas. */
export function renderCoverToCanvas(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  renderCover(canvas.getContext('2d'), w, h, { ...state, selected: -1, showHints: false });
  return canvas;
}
