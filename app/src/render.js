// The cover renderer for VICE COVER STUDIO: one function paints a whole cover onto a 2D context at any
// pixel size, so the live preview and the exported PNG are the same drawing. A cover is the layout's
// photo panels (each photo cover-fitted into its panel's bounding box, then clipped to the angled
// polygon), the grade's duotone wash over each photo — deepened or softened per panel by that panel's
// punch — dividers between the panels in cream, chrome or neon, palm and halftone accents over the
// corners, a vignette, a film finish of grain and light leak, the caption lettering in Anton (a
// gradient, chrome or neon-glow fill, an outline whose weight the editor sets, and a hard shadow),
// and finally a sharp finish: an unsharp mask over the whole painting, the same blur-difference
// arithmetic as a photo editor's, run at the render's own scale.
import { layoutById, polygonBounds } from './layouts.js';
import { gradeById } from './grades.js';
import { paintEmptyPanelArt, drawPalm, drawHalftonePatch, seededRandom } from './decor.js';

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

/** Returns an rgba() colour string with its alpha multiplied by `factor`, clamped to 0..1. */
function scaleAlpha(colour, factor) {
  const match = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/.exec(colour);
  if (!match) return colour;
  const alpha = Math.max(0, Math.min(1, Number.parseFloat(match[4]) * factor));
  return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
}

/**
 * Draws one photo panel: the photo cover-fits the polygon's bounding box at the panel's zoom, centred
 * with the panel's pan offsets (dx, dy in -1..1, scaled by the slack the zoom leaves), clipped to the
 * polygon, graded by the CSS filter and the duotone wash. The panel's punch (1 = the grade as mixed,
 * above 1 hotter, below 1 softer) scales the extra saturation and the wash's strength.
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
  const punch = Math.max(0.2, Math.min(2, panel.punch ?? 1));
  ctx.filter = punch === 1
    ? grade.filter
    : `${grade.filter} saturate(${punch}) contrast(${1 + (punch - 1) * 0.45})`;
  ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.filter = 'none';
  // Duotone wash: the grade's colours blended over the photo, deepened by the panel's punch.
  const wash = ctx.createLinearGradient(0, by, 0, by + bh);
  for (const [stop, colour] of grade.wash) wash.addColorStop(stop, scaleAlpha(colour, punch));
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

/** The chrome divider's metal: bright faces, a dark heart line and bright edges, running diagonally. */
function chromeGradient(ctx, w, h) {
  const metal = ctx.createLinearGradient(0, 0, w * 0.35, h);
  metal.addColorStop(0, '#f7fafc');
  metal.addColorStop(0.28, '#aeb8c2');
  metal.addColorStop(0.5, '#eef2f6');
  metal.addColorStop(0.72, '#79838e');
  metal.addColorStop(1, '#d9dfe6');
  return metal;
}

/**
 * Strokes every panel outline, then a frame around the whole cover, in the chosen divider style:
 * 'cream' is the grade's frame colour, flat and warm; 'chrome' is a band of brushed metal with a
 * dark seam down its middle; 'neon' is a tube of the grade's glow colour, bloomed, with a white core.
 */
function drawDividers(ctx, w, h, layout, grade, style) {
  const width = Math.max(5, w * 0.009);
  ctx.save();
  ctx.lineJoin = 'miter';
  const strokeAll = (lineWidth) => {
    ctx.lineWidth = lineWidth;
    for (const polygon of layout.panels) {
      tracePolygon(ctx, polygon, w, h);
      ctx.stroke();
    }
    ctx.lineWidth = lineWidth * 1.4;
    ctx.strokeRect(lineWidth * 0.7, lineWidth * 0.7, w - lineWidth * 1.4, h - lineWidth * 1.4);
  };
  if (style === 'chrome') {
    ctx.strokeStyle = chromeGradient(ctx, w, h);
    strokeAll(width);
    ctx.strokeStyle = 'rgba(18, 20, 34, 0.4)';
    strokeAll(width * 0.22);
  } else if (style === 'neon') {
    ctx.strokeStyle = grade.glow;
    ctx.globalAlpha = 0.5;
    ctx.shadowColor = grade.glow;
    ctx.shadowBlur = width * 2.4;
    strokeAll(width * 1.7);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#ffffff';
    strokeAll(width * 0.62);
  } else {
    ctx.strokeStyle = grade.frame;
    strokeAll(width);
  }
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

/** The chrome lettering's metal, top to bottom: sky-bright, a dark waist, then a bright bounce. */
const CHROME_FILL = ['#fdfeff', '#c9d1da', '#78828d', '#f2f5f8', '#98a2ac', '#f7fafc'];

/**
 * The pen a caption style writes with: the title and subtitle fills, the outline colour and how
 * heavy an outline the style wears (before the editor's own outline weight), and — for Neon Glow —
 * the colour the letters burn in. 'sunset' is the grade's own gradient; 'chrome' is liquid metal;
 * 'neon' is the grade's neon fill lit from inside, with a slimmer outline and a bloom.
 */
function captionPen(style, grade) {
  if (style === 'chrome') {
    return { titleFill: CHROME_FILL, subtitleFill: ['#f4f7fa', '#aeb8c2'], outline: '#131824', outlineScale: 0.92, glow: null };
  }
  if (style === 'neon') {
    return { titleFill: grade.neonFill, subtitleFill: [grade.neonFill[0], grade.neonFill[1]], outline: '#0d0518', outlineScale: 0.6, glow: grade.glow };
  }
  return { titleFill: grade.titleFill, subtitleFill: [grade.subtitle, grade.subtitle], outline: '#160a2e', outlineScale: 1, glow: null };
}

/**
 * Draws one line of display lettering at the render's own scale: a hard offset shadow, a dark outline
 * (its width scaled by the style and the editor's outline weight), the pen's gradient fill and, for a
 * glowing pen, a bloom under the fill. Centred at x with its top at y. Returns the line's height.
 */
function drawDisplayLine(ctx, text, x, y, size, pen, tracking, outlineWeight) {
  const family = `Anton, 'Arial Narrow', sans-serif`;
  ctx.save();
  try { ctx.letterSpacing = `${tracking}px`; } catch { /* older engines: no tracking */ }
  ctx.font = `${size}px ${family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  const fill = ctx.createLinearGradient(0, y, 0, y + size);
  pen.titleFill.forEach((colour, i) => fill.addColorStop(i / (pen.titleFill.length - 1), colour));
  ctx.shadowColor = 'rgba(8, 0, 20, 0.55)';
  ctx.shadowOffsetX = size * 0.045;
  ctx.shadowOffsetY = size * 0.07;
  ctx.strokeStyle = pen.outline;
  ctx.lineWidth = size * 0.16 * pen.outlineScale * outlineWeight;
  ctx.strokeText(text, x, y);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  if (pen.glow) {
    ctx.shadowColor = pen.glow;
    ctx.shadowBlur = size * 0.42;
  }
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  if (pen.glow) ctx.fillText(text, x, y); // a second pass deepens the bloom
  ctx.restore();
  return size;
}

/** Draws the caption block: the big title line and the smaller subtitle, at the top or the foot. */
function drawCaption(ctx, w, h, state, grade) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  if (!title && !subtitle) return;
  const pen = captionPen(state.captionStyle, grade);
  const outlineWeight = Math.max(0.4, Math.min(2.2, state.outlineWeight ?? 1));
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
  const subBase = subtitle ? fitFontSize(ctx, subtitle, h * 0.037, w * 0.9, family) : 0;
  const subSize = subBase * Math.max(0.7, Math.min(1.8, state.subtitleScale ?? 1));
  const gap = h * 0.014;
  const blockH = titleSize + (subtitle ? gap + subSize * 1.1 : 0);
  let y = atBottom ? h - h * 0.038 - blockH : h * 0.038;
  if (title) y += drawDisplayLine(ctx, title, w / 2, y, titleSize, pen, titleSize * 0.02, outlineWeight) + gap;
  if (subtitle) {
    const subPen = { ...pen, titleFill: pen.subtitleFill };
    drawDisplayLine(ctx, subtitle, w / 2, y, subSize, subPen, subSize * 0.3, outlineWeight);
  }
}

/** The film grain tile: a seeded 256px square of mid-grey noise, built once and reused as a pattern. */
let grainTile = null;
function grainPattern(ctx) {
  if (!grainTile) {
    grainTile = document.createElement('canvas');
    grainTile.width = 256;
    grainTile.height = 256;
    const g = grainTile.getContext('2d');
    const image = g.createImageData(256, 256);
    const rand = seededRandom(90210);
    for (let i = 0; i < image.data.length; i += 4) {
      const v = 88 + Math.floor(rand() * 80);
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
    g.putImageData(image, 0, 0);
  }
  return ctx.createPattern(grainTile, 'repeat');
}

/**
 * The film finish, laid over the collage before the lettering so the type stays crisp: an optional
 * light leak — warm emulsion burns blooming from the top-left and lower-right corners, screened over
 * the art — and optional grain, the seeded noise tile laid in overlay at a whisper of alpha.
 */
function drawFilmFinish(ctx, w, h, state) {
  if (state.lightLeak) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const reach = Math.max(w, h);
    const leakA = ctx.createRadialGradient(w * 0.04, h * 0.02, 0, w * 0.04, h * 0.02, reach * 0.55);
    leakA.addColorStop(0, 'rgba(255, 128, 56, 0.5)');
    leakA.addColorStop(0.45, 'rgba(255, 62, 96, 0.22)');
    leakA.addColorStop(1, 'rgba(255, 62, 96, 0)');
    ctx.fillStyle = leakA;
    ctx.fillRect(0, 0, w, h);
    const leakB = ctx.createRadialGradient(w * 0.97, h * 0.9, 0, w * 0.97, h * 0.9, reach * 0.42);
    leakB.addColorStop(0, 'rgba(255, 46, 136, 0.34)');
    leakB.addColorStop(1, 'rgba(255, 46, 136, 0)');
    ctx.fillStyle = leakB;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  if (state.grain) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

/**
 * The sharp finish: an unsharp mask over the whole painting — out = original + amount × (original −
 * blurred) — the same arithmetic as OpenCV's addWeighted(original, k, blur, −(k−1), 0) with
 * k = 1 + amount and a Gaussian blur whose sigma scales with the render (about 3px at poster size).
 * The blur is taken on a scratch canvas with the 2D filter, the difference is applied per pixel, and
 * any failure (a canvas the browser will not read back) simply skips the pass.
 */
function drawSharpFinish(ctx, w, h, amount) {
  const original = ctx.getImageData(0, 0, w, h);
  const scratch = document.createElement('canvas');
  scratch.width = w;
  scratch.height = h;
  const sctx = scratch.getContext('2d');
  const sigma = Math.max(1, Math.round(Math.min(w, h) / 360));
  sctx.filter = `blur(${sigma}px)`;
  sctx.drawImage(ctx.canvas, 0, 0);
  sctx.filter = 'none';
  const blurred = sctx.getImageData(0, 0, w, h);
  const data = original.data;
  const soft = blurred.data;
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = data[i + c] + amount * (data[i + c] - soft[i + c]);
      data[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  ctx.putImageData(original, 0, 0);
}

/**
 * Paints the whole cover described by `state` onto ctx at w × h pixels. `state` carries the layout id,
 * the grade id, the divider style, the panel assignments ({image, dx, dy, zoom, punch} or null per
 * panel), the caption words, style, position, outline weight and subtitle scale, the film finish
 * switches (grain, lightLeak), the halftone strength and the sharp finish (sharp, sharpAmount),
 * plus the editor-only extras: `selected` (a panel index to outline, or -1) and `showHints`.
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
  drawDividers(ctx, w, h, layout, grade, state.dividerStyle);
  // Corner accents over the panels: palms rising from the foot, halftone at the top corner.
  const palmSize = h * 0.3;
  drawPalm(ctx, w * 0.008, h * 1.004, palmSize, grade.silhouette, 1);
  drawPalm(ctx, w * 0.992, h * 1.004, palmSize * 0.8, grade.silhouette, -1);
  const halftone = Math.max(0, Math.min(1, state.halftone ?? 0.5));
  if (halftone > 0) {
    ctx.save();
    ctx.globalAlpha = 0.34 * halftone;
    drawHalftonePatch(ctx, w * 0.86, h * 0.012, w * 0.13, w * 0.13, '#ffffff', 42);
    ctx.restore();
  }
  // Vignette: darkened edges pull the eye to the middle of the poster.
  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78);
  vignette.addColorStop(0, 'rgba(10, 0, 22, 0)');
  vignette.addColorStop(1, 'rgba(10, 0, 22, 0.36)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  drawFilmFinish(ctx, w, h, state);
  drawCaption(ctx, w, h, state, grade);
  // Sharp finish last, over art and lettering alike — skipped quietly if the canvas cannot be read.
  const sharpAmount = state.sharp === false ? 0 : Math.max(0, Math.min(1, state.sharpAmount ?? 0.35));
  if (sharpAmount > 0) {
    try { drawSharpFinish(ctx, w, h, sharpAmount); } catch { /* an unreadable canvas keeps the soft painting */ }
  }
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
