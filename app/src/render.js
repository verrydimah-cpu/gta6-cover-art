// Vice Cover Studio — the renderer.
// One function, renderCover, draws a complete cover onto any 2D canvas
// context at any size. The live preview and every exported PNG call this
// exact code path, so what the visitor sees is what they download.
// State shape (built by main.js and by the screenshot presets):
//   { layoutId, gradeId, caption, subtitle, captionStyle, divider,
//     sharp, panels: [{ photo: Image|null, zoom, fx, fy }, ...] }

'use strict';

const VCS_FONT_STACK = '"Vice Anton", "Arial Narrow", sans-serif';

// Draws an image cover-fitted into a box: scaled until the box is full,
// then positioned by the focal point (0..1) and the punch zoom (1..2.6).
function vcsDrawPhotoCover(ctx, img, x, y, w, h, punch) {
  const zoom = punch && punch.zoom ? punch.zoom : 1;
  const fx = punch && typeof punch.fx === 'number' ? punch.fx : 0.5;
  const fy = punch && typeof punch.fy === 'number' ? punch.fy : 0.5;
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = x + (w - dw) * fx;
  const dy = y + (h - dh) * fy;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Strokes every divider segment in the chosen style. Interior segments
// get the full treatment; the outer frame gets a slimmer version.
function vcsDrawDividers(ctx, layout, W, H, style, grade) {
  const segments = vcsDividerSegments(layout, W, H);
  const unit = Math.min(W, H);
  for (const seg of segments) {
    if (style === 'neon') {
      ctx.save();
      ctx.strokeStyle = grade.accent;
      ctx.shadowColor = grade.accent;
      ctx.shadowBlur = unit * 0.018;
      ctx.lineWidth = seg.outer ? unit * 0.004 : unit * 0.007;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = unit * 0.0016;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.restore();
    } else if (style === 'chrome') {
      ctx.save();
      ctx.strokeStyle = 'rgba(8,10,14,0.92)';
      ctx.lineWidth = seg.outer ? unit * 0.006 : unit * 0.011;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(235,242,250,0.95)';
      ctx.lineWidth = unit * 0.0035;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.restore();
    } else {
      // Torn white edge: a bright ragged line made of short dashes with
      // a whisper of jitter, like ripped poster paper.
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = seg.outer ? unit * 0.005 : unit * 0.009;
      ctx.setLineDash([unit * 0.05, unit * 0.012]);
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = unit * 0.016;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

// Splits a caption into lines that fit maxWidth at the current font.
function vcsWrapCaption(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines = [];
  let line = words[0];
  for (let i = 1; i < words.length; i++) {
    const trial = line + ' ' + words[i];
    if (ctx.measureText(trial).width <= maxWidth) line = trial;
    else { lines.push(line); line = words[i]; }
  }
  lines.push(line);
  return lines;
}

// Draws the subtitle: letter-spaced small caps over a dark translucent
// strip, with a soft neon glow in the grade's accent colour.
function vcsDrawSubtitle(ctx, text, cx, y, maxWidth, grade, unit) {
  if (!text) return;
  const spaced = text.toUpperCase().split('').join('  ');
  ctx.save();
  ctx.font = '600 ' + Math.round(unit * 0.030) + 'px ' + VCS_FONT_STACK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = Math.min(maxWidth, ctx.measureText(spaced).width);
  const padX = unit * 0.028;
  const stripH = unit * 0.052;
  ctx.fillStyle = 'rgba(8,2,18,0.55)';
  ctx.fillRect(cx - tw / 2 - padX, y - stripH / 2, tw + padX * 2, stripH);
  ctx.shadowColor = grade.accent;
  ctx.shadowBlur = unit * 0.016;
  ctx.fillStyle = grade.accent;
  ctx.fillText(spaced, cx, y + unit * 0.002);
  ctx.restore();
}

// The three caption treatments. Title is Anton, uppercase, with a hard
// poster shadow; placement and furniture change per style.
function vcsDrawCaption(ctx, W, H, state, grade) {
  const caption = (state.caption || '').trim().toUpperCase();
  if (!caption && !state.subtitle) return;
  const unit = Math.min(W, H);
  ctx.save();
  if (state.captionStyle === 'banner') {
    // Diagonal banner: a rotated dark band across the lower third.
    const bandY = H * 0.80;
    ctx.translate(W * 0.5, bandY);
    ctx.rotate(-0.055);
    ctx.fillStyle = 'rgba(6,2,14,0.72)';
    ctx.fillRect(-W * 0.56, -unit * 0.115, W * 1.12, unit * 0.23);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(-W * 0.56, -unit * 0.115, W * 1.12, unit * 0.012);
    ctx.fillRect(-W * 0.56, unit * 0.103, W * 1.12, unit * 0.012);
    let fontSize = unit * 0.115;
    ctx.font = fontSize + 'px ' + VCS_FONT_STACK;
    while (ctx.measureText(caption).width > W * 0.92 && fontSize > 20) {
      fontSize *= 0.94;
      ctx.font = fontSize + 'px ' + VCS_FONT_STACK;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillText(caption, unit * 0.006, -unit * 0.012 + unit * 0.006);
    ctx.fillStyle = grade.captionInk;
    ctx.fillText(caption, 0, -unit * 0.012);
    ctx.restore();
    vcsDrawSubtitle(ctx, state.subtitle, W * 0.5, H * 0.925, W * 0.9, grade, unit);
    return;
  }
  if (state.captionStyle === 'bar') {
    // Bottom bar: a solid strip holding title left, subtitle right.
    const barH = unit * 0.155;
    ctx.fillStyle = 'rgba(5,2,12,0.88)';
    ctx.fillRect(0, H - barH, W, barH);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(0, H - barH, W, unit * 0.008);
    let fontSize = unit * 0.088;
    ctx.font = fontSize + 'px ' + VCS_FONT_STACK;
    while (ctx.measureText(caption).width > W * 0.60 && fontSize > 18) {
      fontSize *= 0.94;
      ctx.font = fontSize + 'px ' + VCS_FONT_STACK;
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = grade.captionInk;
    ctx.fillText(caption, W * 0.045, H - barH / 2 + unit * 0.004);
    if (state.subtitle) {
      ctx.font = '600 ' + Math.round(unit * 0.026) + 'px ' + VCS_FONT_STACK;
      ctx.textAlign = 'right';
      ctx.shadowColor = grade.accent;
      ctx.shadowBlur = unit * 0.012;
      ctx.fillStyle = grade.accent;
      ctx.fillText(state.subtitle.toUpperCase().split('').join(' '), W * 0.955, H - barH / 2);
    }
    ctx.restore();
    return;
  }
  // Stacked block (default): big wrapped title low-left, subtitle under.
  let fontSize = unit * 0.128;
  ctx.font = fontSize + 'px ' + VCS_FONT_STACK;
  let lines = vcsWrapCaption(ctx, caption, W * 0.86);
  while (lines.length > 3 && fontSize > 22) {
    fontSize *= 0.92;
    ctx.font = fontSize + 'px ' + VCS_FONT_STACK;
    lines = vcsWrapCaption(ctx, caption, W * 0.86);
  }
  const lineH = fontSize * 0.98;
  const blockH = lines.length * lineH;
  // The title block sits above the subtitle accent line, which runs
  // under it near the poster's bottom edge.
  const baseY = H * (state.subtitle ? 0.90 : 0.965) - blockH;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  lines.forEach(function (line, i) {
    const y = baseY + i * lineH + fontSize * 0.82;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillText(line, W * 0.048 + unit * 0.007, y + unit * 0.007);
    ctx.fillStyle = grade.captionInk;
    ctx.fillText(line, W * 0.048, y);
  });
  ctx.restore();
  if (state.subtitle) {
    const subY = H * 0.945;
    ctx.save();
    ctx.font = '600 ' + Math.round(unit * 0.030) + 'px ' + VCS_FONT_STACK;
    const spaced = state.subtitle.toUpperCase().split('').join(' ');
    const tw = ctx.measureText(spaced).width;
    ctx.fillStyle = 'rgba(8,2,18,0.55)';
    ctx.fillRect(W * 0.048 - unit * 0.014, subY - unit * 0.026, tw + unit * 0.028, unit * 0.052);
    ctx.shadowColor = grade.accent;
    ctx.shadowBlur = unit * 0.014;
    ctx.fillStyle = grade.accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(spaced, W * 0.048, subY);
    ctx.restore();
  }
}

// Film finish: a vignette that darkens the corners and a fine grain
// pass. The grain tile is built once and reused at any size.
let vcsGrainTile = null;
function vcsGetGrainTile() {
  if (vcsGrainTile) return vcsGrainTile;
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(128, 128);
  const rand = vcsSeededRandom(4242);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rand() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  vcsGrainTile = tile;
  return tile;
}

function vcsApplyFilmFinish(ctx, W, H, grade) {
  const unit = Math.min(W, H);
  const vig = ctx.createRadialGradient(
    W * 0.5, H * 0.46, unit * 0.42,
    W * 0.5, H * 0.5, unit * 0.95
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(2,0,8,' + grade.finish.vignette + ')');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = grade.finish.grain;
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(vcsGetGrainTile(), 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// The in-app Sharp finish: an unsharp-style pass. The finished canvas is
// drawn back over itself in overlay mode, nudged by a pixel, which lifts
// edge contrast the way an unsharp mask does, at slider strength.
function vcsApplySharpFinish(ctx, W, H, amount) {
  if (!amount || amount <= 0) return;
  const copy = document.createElement('canvas');
  copy.width = W;
  copy.height = H;
  copy.getContext('2d').drawImage(ctx.canvas, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = Math.min(0.55, amount * 0.55);
  ctx.drawImage(copy, 1, 0);
  ctx.drawImage(copy, -1, 0);
  ctx.globalAlpha = Math.min(0.3, amount * 0.3);
  ctx.drawImage(copy, 0, 1);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = Math.min(0.25, amount * 0.22);
  ctx.drawImage(copy, 0, 0);
  ctx.restore();
}

// The one renderer: preview and export share it, pixel for pixel.
function renderCover(ctx, W, H, state) {
  const grade = vcsGradeById(state.gradeId);
  const layout = vcsLayoutById(state.layoutId);
  ctx.save();
  ctx.fillStyle = '#0a0616';
  ctx.fillRect(0, 0, W, H);
  layout.panels.forEach(function (panel, index) {
    const slot = state.panels[index] || {};
    const boundsN = vcsPolyBounds(panel.poly);
    const bounds = {
      x: boundsN.x * W, y: boundsN.y * H,
      w: boundsN.w * W, h: boundsN.h * H,
    };
    ctx.save();
    vcsTracePanel(ctx, panel.poly, W, H);
    ctx.clip();
    // Slight bleed so angled edges never show hairline gaps.
    const bleed = Math.min(W, H) * 0.004;
    const bx = bounds.x - bleed, by = bounds.y - bleed;
    const bw = bounds.w + bleed * 2, bh = bounds.h + bleed * 2;
    if (slot.photo) {
      vcsDrawPhotoCover(ctx, slot.photo, bx, by, bw, bh, slot);
      vcsApplyGradeToPhoto(ctx, bx, by, bw, bh, grade);
      vcsDrawCornerDecor(ctx, bounds, grade, index + 3);
    } else {
      vcsPaintGradeSky(ctx, bx, by, bw, bh, grade);
      vcsDrawFullDecor(ctx, bounds, grade, index + 3);
    }
    ctx.restore();
  });
  vcsDrawDividers(ctx, layout, W, H, state.divider || 'neon', grade);
  vcsDrawCaption(ctx, W, H, state, grade);
  vcsApplyFilmFinish(ctx, W, H, grade);
  ctx.restore();
  vcsApplySharpFinish(ctx, W, H, typeof state.sharp === 'number' ? state.sharp : 0.6);
}
