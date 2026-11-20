'use strict';
/* VICE COVER STUDIO — the one renderer.
   Preview and export call this same function with the same state; the
   only difference is the canvas size handed in. */
window.VCS = window.VCS || {};

let skyCache = null;
function sky() {
  if (!skyCache) skyCache = VCS.skyTile();
  return skyCache;
}

/* Panel settings start from the layout's casting and the photo's own
   balance sheet; whatever the user edits lives on top of that. */
VCS.freshPanels = function (layoutId) {
  const out = {};
  for (const p of VCS.layoutById(layoutId).panels) {
    const s = VCS.sampleById(p.sample);
    out[p.id] = { sample: p.sample, role: p.role, punch: s.punch, zoom: 1, fx: s.fx, fy: s.fy };
  }
  return out;
};

VCS.defaultState = function () {
  return {
    layout: 'ensemble',
    grade: 'vice',
    caption: 'chrome',
    divider: 'gold',
    title: 'SUNDOWN CITY',
    subtitle: 'every saint has a past',
    tagline: 'EVERYBODY WANTS A PIECE OF THE SUNSET',
    review: 'PURE SUNSET ADRENALINE — THE RIDE OF THE YEAR',
    sharp: 0.62,
    grain: 0.16,
    panels: VCS.freshPanels('ensemble'),
  };
};

/* Cover-fit one photo into a panel rect, honouring focus and zoom, then
   give it its punch trim and place it. */
function placePhoto(ctx, img, cfg, x, y, w, h) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih) * (cfg.zoom || 1);
  const vw = w / scale, vh = h / scale;
  let sx = cfg.fx * iw - vw / 2;
  let sy = cfg.fy * ih - vh / 2;
  sx = Math.min(Math.max(sx, 0), iw - vw);
  sy = Math.min(Math.max(sy, 0), ih - vh);
  const crop = document.createElement('canvas');
  crop.width = Math.max(2, Math.round(w)); crop.height = Math.max(2, Math.round(h));
  crop.getContext('2d').drawImage(img, sx, sy, vw, vh, 0, 0, crop.width, crop.height);
  ctx.drawImage(VCS.punchPanel(crop, w, h, cfg.punch), x, y, w, h);
}

VCS.renderCover = function (canvas, state, images) {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const layout = VCS.layoutById(state.layout);
  const skyImg = sky();

  VCS.paintBackdrop(ctx, W, H, skyImg);

  /* header: the VOL. 1 box, the headline, the script line */
  ctx.save();
  ctx.strokeStyle = GOLD_FRAME;
  ctx.lineWidth = Math.max(1.5, W * 0.0022);
  const boxW = W * 0.085, boxH = H * 0.034;
  ctx.strokeRect(W - boxW - W * 0.03, H * 0.016, boxW, boxH);
  ctx.fillStyle = '#f3d489';
  ctx.font = `700 ${boxH * 0.52}px Anton, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('VOL. 1', W - boxW / 2 - W * 0.03, H * 0.016 + boxH * 0.54);
  ctx.restore();

  /* the cast */
  for (const p of layout.panels) {
    const cfg = (state.panels && state.panels[p.id]) || { sample: p.sample, role: p.role, punch: 1, zoom: 1, fx: 0.5, fy: 0.5 };
    const x = p.x * W, y = p.y * H, w = p.w * W, h = p.h * H;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (cfg.sample === 'sunset-sky') {
      ctx.drawImage(skyImg, x, y, w, h);
    } else {
      const img = images[cfg.sample];
      if (img && (img.complete === undefined || img.complete)) placePhoto(ctx, img, cfg, x, y, w, h);
      else { ctx.drawImage(skyImg, x, y, w, h); }
    }
    ctx.restore();
    VCS.drawFrame(ctx, x, y, w, h, state.divider);
    VCS.drawRoleTag(ctx, cfg.role, x, y, w, h);
  }

  /* the headline rides over the cast, the way a real poster stacks its
     title over the art */
  const titleSize = VCS.drawTitle(ctx, state.title, state.caption, W / 2, H * 0.014, W * 0.80);
  VCS.drawScript(ctx, state.subtitle, W / 2, H * 0.014 + titleSize * 1.06, titleSize * 0.32);

  /* footer furniture — full dress on portrait and square, a compact
     rhythm when the cover goes wide */
  const wide = W / H >= 1.25;
  ctx.save();
  if (!wide) {
    VCS.drawStars(ctx, W * 0.5, H * 0.862, W * 0.020);
    ctx.fillStyle = 'rgba(243,212,137,0.92)';
    ctx.font = `italic 600 ${W * 0.0165}px Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`“${state.review}”`, W * 0.5, H * 0.884);
    VCS.drawRibbon(ctx, state.tagline, W * 0.5, H * 0.902, W * 0.60, H * 0.030);
    VCS.drawBilling(ctx, W * 0.5, H * 0.946, W * 0.56);
    VCS.drawSeal(ctx, W * 0.072, H * 0.928, W * 0.031);
    VCS.drawBarcode(ctx, state.title, W * 0.878, H * 0.912, W * 0.094, H * 0.058);
    ctx.fillStyle = 'rgba(240,220,190,0.75)';
    ctx.font = `700 ${W * 0.013}px Anton, sans-serif`;
    ctx.fillText('COMING SOON', W * 0.915, H * 0.884);
  } else {
    VCS.drawStars(ctx, W * 0.115, H * 0.905, W * 0.013);
    ctx.fillStyle = 'rgba(243,212,137,0.92)';
    ctx.font = `700 ${W * 0.0145}px Anton, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(state.tagline, W * 0.5, H * 0.905);
    ctx.font = `italic 600 ${W * 0.0115}px Georgia, serif`;
    ctx.fillStyle = 'rgba(240,220,190,0.7)';
    ctx.fillText(`“${state.review}”`, W * 0.5, H * 0.938);
    VCS.drawSeal(ctx, W * 0.845, H * 0.912, W * 0.020);
    VCS.drawBarcode(ctx, state.title, W * 0.888, H * 0.878, W * 0.082, H * 0.075);
  }
  ctx.restore();

  VCS.applyFinish(canvas, { grade: state.grade, sharp: state.sharp, grain: state.grain });
};

const GOLD_FRAME = '#d9a441';
