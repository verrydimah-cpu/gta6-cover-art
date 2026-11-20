// render.js — the single canvas renderer of VICE COVER STUDIO.
// renderCover paints a complete cover at any size: backdrop, graded
// photo panels, dividers, decor, role tags, lettering and the film
// finish. The live preview and every PNG export call this same
// function, so what the user sees is exactly what they download.

import { layoutById, layoutPanels } from './layouts.js';
import { gradeById, photoFilter } from './grades.js';
import { drawDecor, drawCaptionGlow } from './decor.js';

let noiseCanvas = null;

// Fine luminance grain: every pixel is a shade of grey, so laid over
// the art at low opacity with overlay blending it reads as film
// texture instead of coloured television static.
function grainPattern(ctx) {
  if (!noiseCanvas) {
    noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 256;
    noiseCanvas.height = 256;
    const nctx = noiseCanvas.getContext('2d');
    const img = nctx.createImageData(256, 256);
    let seed = 987654321;
    for (let i = 0; i < img.data.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const v = 96 + Math.floor((seed / 2147483647) * 64);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    nctx.putImageData(img, 0, 0);
  }
  return ctx.createPattern(noiseCanvas, 'repeat');
}

function skyGradient(ctx, grade, x, y, w, h) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  for (const [pos, color] of grade.sky) grad.addColorStop(pos, color);
  return grad;
}

function tracePath(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}

// Cover-fit one photo into a panel box, honouring the per-panel
// transform: zoom multiplies the fitted size, dx and dy slide the
// photo inside the frame in fractions of the overflow.
function drawPhoto(ctx, img, box, t) {
  const scale = Math.max(box.w / img.naturalWidth, box.h / img.naturalHeight) * t.zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = box.x + (box.w - dw) / 2 + t.dx * (dw - box.w) * 0.5;
  const dy = box.y + (box.h - dh) / 2 + t.dy * (dh - box.h) * 0.5;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawPanel(ctx, panel, state, photos, grade, W, H) {
  const photoIndex = state.panelPhoto[panel.index];
  const img = photoIndex >= 0 ? photos[photoIndex] : null;
  ctx.save();
  tracePath(ctx, panel.points);
  ctx.clip();
  ctx.fillStyle = skyGradient(ctx, grade, panel.box.x, panel.box.y, panel.box.w, panel.box.h);
  ctx.fillRect(panel.box.x - 2, panel.box.y - 2, panel.box.w + 4, panel.box.h + 4);
  if (img && img.naturalWidth) {
    ctx.filter = photoFilter(grade, state.punches[panel.index] || 1);
    drawPhoto(ctx, img, panel.box, state.transforms[panel.index]);
    ctx.filter = 'none';
    // Split toning: tinted shadows settle at the foot of the panel,
    // warm highlights breathe at the top, both at overlay strength.
    const tone = ctx.createLinearGradient(0, panel.box.y, 0, panel.box.y + panel.box.h);
    tone.addColorStop(0, 'rgba(' + grade.highlightTint + ',' + grade.tintStrength + ')');
    tone.addColorStop(0.55, 'rgba(0,0,0,0)');
    tone.addColorStop(1, 'rgba(' + grade.shadowTint + ',' + grade.tintStrength * 1.25 + ')');
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = tone;
    ctx.fillRect(panel.box.x - 2, panel.box.y - 2, panel.box.w + 4, panel.box.h + 4);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

function strokePanels(ctx, panels, style, unit) {
  for (const panel of panels) {
    tracePath(ctx, panel.points);
    if (style === 'gold') {
      ctx.strokeStyle = 'rgba(20,10,8,0.9)';
      ctx.lineWidth = Math.max(3, unit * 0.009);
      ctx.stroke();
      tracePath(ctx, panel.points);
      ctx.strokeStyle = '#d8ab54';
      ctx.lineWidth = Math.max(1.4, unit * 0.0038);
      ctx.stroke();
    } else if (style === 'neon') {
      ctx.strokeStyle = 'rgba(10,4,20,0.92)';
      ctx.lineWidth = Math.max(4, unit * 0.012);
      ctx.stroke();
      tracePath(ctx, panel.points);
      ctx.strokeStyle = '#ff5ca8';
      ctx.shadowColor = '#ff2e88';
      ctx.shadowBlur = unit * 0.02;
      ctx.lineWidth = Math.max(1.6, unit * 0.004);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (style === 'chrome') {
      ctx.strokeStyle = 'rgba(12,8,14,0.95)';
      ctx.lineWidth = Math.max(5, unit * 0.014);
      ctx.stroke();
      tracePath(ctx, panel.points);
      ctx.strokeStyle = 'rgba(240,244,250,0.95)';
      ctx.lineWidth = Math.max(1.6, unit * 0.004);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(10,6,12,0.96)';
      ctx.lineWidth = Math.max(5, unit * 0.015);
      ctx.stroke();
      tracePath(ctx, panel.points);
      ctx.strokeStyle = 'rgba(255,246,230,0.9)';
      ctx.lineWidth = Math.max(1.2, unit * 0.003);
      ctx.stroke();
    }
  }
}

// The little black slash-tag that names a cast member's role, tipped
// a few degrees against the panel's top-left corner.
function drawRoleTag(ctx, panel, label, unit) {
  if (!label) return;
  const size = Math.max(10, unit * 0.026);
  ctx.save();
  ctx.font = size + 'px Anton, sans-serif';
  const w = ctx.measureText(label).width + size * 1.5;
  const h = size * 1.62;
  const x = panel.box.x + unit * 0.014;
  const y = panel.box.y + unit * 0.014;
  ctx.translate(x, y);
  ctx.rotate(-0.045);
  ctx.fillStyle = 'rgba(8,5,10,0.92)';
  ctx.beginPath();
  ctx.moveTo(size * 0.35, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w - size * 0.35, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d8ab54';
  ctx.fillRect(size * 0.42, h - size * 0.22, w - size * 0.9, size * 0.09);
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, size * 0.78, h / 2 - size * 0.04);
  ctx.restore();
}

function fitSize(ctx, text, weight, family, maxWidth, start) {
  let size = start;
  ctx.font = weight + ' ' + size + 'px ' + family;
  while (size > 8 && ctx.measureText(text).width > maxWidth) {
    size *= 0.94;
    ctx.font = weight + ' ' + size + 'px ' + family;
  }
  return size;
}

function drawStar(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Printed-poster furniture for the ensemble layout: review strip at
// the top, billing block, seal and barcode along the bottom. Every
// word is this studio's own invention.
function drawPosterFurniture(ctx, W, H, state) {
  const unit = Math.min(W, H);
  ctx.save();
  ctx.textAlign = 'center';
  // Review strip: five gold stars over a critic's shout line.
  const starY = H * 0.032;
  for (let i = 0; i < 5; i += 1) {
    drawStar(ctx, W * (0.5 + (i - 2) * 0.035), starY, unit * 0.013, '#e9bc63');
  }
  ctx.fillStyle = 'rgba(255,240,214,0.92)';
  ctx.font = Math.max(9, unit * 0.02) + 'px Anton, sans-serif';
  try { ctx.letterSpacing = '3px'; } catch (e) { /* older canvas */ }
  ctx.fillText('“PURE SUNSET ADRENALINE — THE RIDE OF THE YEAR”', W / 2, starY + unit * 0.038);
  try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
  // VOL. 1 corner box, top right.
  const bw = unit * 0.085;
  const bh = unit * 0.045;
  ctx.strokeStyle = '#d8ab54';
  ctx.lineWidth = Math.max(1.2, unit * 0.0028);
  ctx.strokeRect(W - bw - unit * 0.02, unit * 0.016, bw, bh);
  ctx.fillStyle = '#e9bc63';
  ctx.font = Math.max(8, unit * 0.02) + 'px Anton, sans-serif';
  ctx.fillText('VOL. 1', W - bw / 2 - unit * 0.02, unit * 0.016 + bh / 2 + unit * 0.007);
  // Coming soon, bottom left.
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,240,214,0.9)';
  ctx.font = Math.max(9, unit * 0.024) + 'px Anton, sans-serif';
  ctx.fillText('COMING SOON', W * 0.035, H * 0.9);
  ctx.font = Math.max(7, unit * 0.014) + 'px Anton, sans-serif';
  ctx.fillStyle = 'rgba(255,240,214,0.55)';
  ctx.fillText('A SUNSET REEL PRODUCTION', W * 0.035, H * 0.922);
  // Billing block: tiny condensed credits, fictional names only.
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,244,220,0.66)';
  const bill = Math.max(6.5, unit * 0.0135);
  ctx.font = bill + 'px "Arial Narrow", Arial, sans-serif';
  ctx.fillText(
    'VICE COVER STUDIO presents a SUNSET REEL production “' + (state.title || 'VICE CITY') + '”',
    W / 2, H * 0.96,
  );
  ctx.fillText(
    'starring MARA VOSS · JULES KANE · RIO DELMAR · SADIE LUX · music by THE PALM CLUB · edited by N. OKAFOR',
    W / 2, H * 0.977,
  );
  ctx.fillText(
    'director of photography L. MARSH · produced by T. IBARRA · directed by C. VALENTINE',
    W / 2, H * 0.993,
  );
  // Best Cast seal: a gold ring with a star, bottom right.
  const sx = W * 0.925;
  const sy = H * 0.885;
  const sr = unit * 0.042;
  ctx.strokeStyle = '#e9bc63';
  ctx.lineWidth = Math.max(1.4, unit * 0.0035);
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sx, sy, sr * 0.8, 0, Math.PI * 2);
  ctx.stroke();
  drawStar(ctx, sx, sy - sr * 0.34, sr * 0.2, '#e9bc63');
  ctx.fillStyle = '#e9bc63';
  ctx.font = Math.max(7, unit * 0.016) + 'px Anton, sans-serif';
  ctx.fillText('BEST', sx, sy + sr * 0.18);
  ctx.fillText('CAST', sx, sy + sr * 0.48);
  // Barcode block, bottom-right corner.
  const bx = W * 0.9;
  const by = H * 0.945;
  const bw2 = W * 0.075;
  const bh2 = H * 0.038;
  ctx.fillStyle = 'rgba(250,246,238,0.94)';
  ctx.fillRect(bx, by, bw2, bh2);
  ctx.fillStyle = '#14100e';
  let seed = 424243;
  let cx = bx + 2;
  while (cx < bx + bw2 - 3) {
    seed = (seed * 16807) % 2147483647;
    const barW = 1 + (seed % 3);
    if (seed % 2 === 0) ctx.fillRect(cx, by + 2, barW, bh2 - 6);
    cx += barW + 1;
  }
  ctx.font = Math.max(6, unit * 0.011) + 'px Arial, sans-serif';
  ctx.fillText('8 901234 567890', bx + bw2 / 2, by + bh2 - 1.5);
  ctx.restore();
}

// The chrome title treatment: a hot orange-to-pink gradient with a
// bright chrome band through its middle, a heavy dark outline and a
// stacked shadow, so it reads like printed foil at thumbnail size.
function drawChromeTitle(ctx, text, cx, baseline, maxWidth, unit) {
  const size = fitSize(ctx, text, '', 'Anton, sans-serif', maxWidth, unit * 0.19);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = size + 'px Anton, sans-serif';
  try { ctx.letterSpacing = Math.round(size * -0.01) + 'px'; } catch (e) { /* ok */ }
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(10,2,12,0.85)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = size * 0.075;
  ctx.strokeStyle = '#180812';
  ctx.lineWidth = size * 0.16;
  ctx.strokeText(text, cx, baseline);
  ctx.shadowColor = 'rgba(255,46,136,0.55)';
  ctx.shadowBlur = unit * 0.03;
  ctx.shadowOffsetY = 0;
  const grad = ctx.createLinearGradient(0, baseline - size, 0, baseline);
  grad.addColorStop(0, '#fff3c4');
  grad.addColorStop(0.32, '#ffb35c');
  grad.addColorStop(0.52, '#ffffff');
  grad.addColorStop(0.58, '#ff8a5c');
  grad.addColorStop(0.8, '#ff5c8a');
  grad.addColorStop(1, '#c73e7e');
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, baseline);
  ctx.shadowBlur = 0;
  // Neon script subtitle on a dark underlay, glowing pink.
  ctx.restore();
  return size;
}

function drawScriptSubtitle(ctx, text, cx, y, unit) {
  if (!text) return;
  ctx.save();
  ctx.textAlign = 'center';
  const size = Math.max(12, unit * 0.052);
  ctx.font = 'italic ' + size + 'px "Segoe Script", "Brush Script MT", cursive';
  const w = ctx.measureText(text).width;
  ctx.fillStyle = 'rgba(10,4,14,0.55)';
  ctx.beginPath();
  ctx.ellipse(cx, y - size * 0.32, w / 2 + size * 0.7, size * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = unit * 0.022;
  ctx.fillStyle = '#ff8ac2';
  ctx.fillText(text, cx, y);
  ctx.shadowBlur = unit * 0.008;
  ctx.fillStyle = '#ffd7ec';
  ctx.fillText(text, cx, y);
  ctx.restore();
}

function drawRibbon(ctx, text, cx, y, unit) {
  if (!text) return;
  ctx.save();
  ctx.textAlign = 'center';
  const size = Math.max(9, unit * 0.023);
  ctx.font = size + 'px Anton, sans-serif';
  try { ctx.letterSpacing = '4px'; } catch (e) { /* ok */ }
  const w = ctx.measureText(text).width + size * 2.4;
  const h = size * 1.9;
  ctx.translate(cx, y);
  ctx.rotate(-0.012);
  ctx.fillStyle = '#180812';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = '#d8ab54';
  ctx.lineWidth = Math.max(1.2, unit * 0.003);
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = '#ffe9b0';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, size * 0.05);
  ctx.restore();
}

function drawLettering(ctx, W, H, state, layout) {
  const unit = Math.min(W, H);
  const title = (state.title || 'VICE CITY').toUpperCase();
  const poster = layout.poster;
  ctx.save();
  if (state.captionStyle === 'banner') {
    const bh = unit * 0.17;
    const y = H - bh * 0.92;
    ctx.save();
    ctx.translate(0, y);
    ctx.rotate(-0.018);
    ctx.fillStyle = 'rgba(10,5,14,0.88)';
    ctx.fillRect(-unit * 0.05, 0, W + unit * 0.1, bh);
    ctx.fillStyle = '#d8ab54';
    ctx.fillRect(-unit * 0.05, 0, W + unit * 0.1, Math.max(2, unit * 0.006));
    ctx.restore();
    const size = fitSize(ctx, title, '', 'Anton, sans-serif', W * 0.9, unit * 0.115);
    ctx.font = size + 'px Anton, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowOffsetY = size * 0.05;
    ctx.fillStyle = '#fff6e6';
    ctx.fillText(title, W / 2, y + bh * 0.62);
    ctx.shadowColor = 'transparent';
    if (state.subtitle) {
      ctx.font = Math.max(9, unit * 0.021) + 'px Anton, sans-serif';
      try { ctx.letterSpacing = '5px'; } catch (e) { /* ok */ }
      ctx.fillStyle = '#ff8ac2';
      ctx.fillText(state.subtitle.toUpperCase(), W / 2, y + bh * 0.88);
    }
  } else if (state.captionStyle === 'top') {
    drawCaptionGlow(ctx, W * 0.1, -H * 0.04, W * 0.8, H * 0.3, '10,4,18', 0.5);
    const size = drawChromeTitle(ctx, title, W / 2, H * 0.155, W * 0.92, unit);
    drawScriptSubtitle(ctx, state.subtitle, W / 2, H * 0.155 + size * 0.52, unit);
  } else {
    // Poster style: the full chrome treatment, low on the cover.
    const base = poster ? H * 0.815 : H * 0.9;
    drawCaptionGlow(ctx, W * 0.06, base - unit * 0.24, W * 0.88, unit * 0.3, '16,5,20', 0.46);
    const size = drawChromeTitle(ctx, title, W / 2, base, W * 0.94, unit);
    drawScriptSubtitle(ctx, state.subtitle, W / 2, base + size * 0.48, unit);
    drawRibbon(ctx, state.tagline, W / 2, base + size * 0.48 + unit * 0.05, unit);
  }
  ctx.restore();
}

// Paint the whole cover. photos is an array of images (or nulls) in
// sample order; state.panelPhoto maps panels onto that array.
export function renderCover(ctx, W, H, state, photos) {
  const layout = layoutById(state.layoutId);
  const grade = gradeById(state.gradeId);
  const panels = layoutPanels(layout, W, H);
  const unit = Math.min(W, H);
  // Backdrop: the grade sky for collages; a dark plum-brown wall for
  // the ensemble poster, so its gold frames sit on something rich.
  if (layout.poster) {
    const wall = ctx.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#3a1c2a');
    wall.addColorStop(0.55, '#2a1420');
    wall.addColorStop(1, '#1c0d16');
    ctx.fillStyle = wall;
  } else {
    ctx.fillStyle = skyGradient(ctx, grade, 0, 0, W, H);
  }
  ctx.fillRect(0, 0, W, H);
  for (const panel of panels) drawPanel(ctx, panel, state, photos, grade, W, H);
  // The grade's sun glow, screened over the whole collage so every
  // panel shares one light.
  if (grade.sun && grade.sun.alpha > 0) {
    const sx = grade.sun.x * W;
    const sy = grade.sun.y * H;
    const sr = grade.sun.r * Math.max(W, H);
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    glow.addColorStop(0, 'rgba(' + grade.sun.color + ',' + grade.sun.alpha + ')');
    glow.addColorStop(1, 'rgba(' + grade.sun.color + ',0)');
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  drawDecor(ctx, W, H, grade);
  strokePanels(ctx, panels, state.divider, unit);
  panels.forEach((panel, i) => drawRoleTag(ctx, panel, state.panelLabels[i], unit));
  if (layout.poster) drawPosterFurniture(ctx, W, H, state);
  drawLettering(ctx, W, H, state, layout);
  // Film finish: vignette first, then the grain over everything.
  const vg = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.36,
    W / 2, H / 2, Math.max(W, H) * 0.78,
  );
  vg.addColorStop(0, 'rgba(8,2,10,0)');
  vg.addColorStop(1, 'rgba(8,2,10,' + grade.vignette + ')');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  const grainAlpha = grade.grain * (state.grain == null ? 1 : state.grain);
  if (grainAlpha > 0.003) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.4, grainAlpha * 2.4);
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // A final printed edge: a hairline of warm light inside the trim.
  ctx.strokeStyle = 'rgba(255,220,160,0.28)';
  ctx.lineWidth = Math.max(1, unit * 0.002);
  ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, W - ctx.lineWidth * 2, H - ctx.lineWidth * 2);
}
