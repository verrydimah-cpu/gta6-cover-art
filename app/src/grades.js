'use strict';
/* VICE COVER STUDIO — colour grades and the film finish.
   One deterministic pass over the finished cover: unsharp, the grade's
   colour science, a fine luminance grain and a gentle vignette. Same
   numbers in, same pixels out — the preview and the export never drift. */
window.VCS = window.VCS || {};

VCS.GRADES = {
  vice:  { label: 'Vice Sunset',  contrast: 1.07, saturation: 1.16, warmth: 9,  shadowTint: [26, 8, 34],  highTint: [255, 176, 92] },
  ocean: { label: 'Ocean Drive',  contrast: 1.05, saturation: 1.10, warmth: -4, shadowTint: [6, 22, 38],  highTint: [168, 226, 255] },
  neon:  { label: 'Neon Night',   contrast: 1.11, saturation: 1.22, warmth: 2,  shadowTint: [18, 4, 40],  highTint: [255, 110, 199] },
  gold:  { label: 'Golden Hour',  contrast: 1.04, saturation: 1.08, warmth: 14, shadowTint: [30, 16, 8],  highTint: [255, 205, 120] },
};

/* A small deterministic hash so the grain is identical on every run. */
function grainHash(x, y) {
  let h = (x * 374761393 + y * 668265263) ^ 0x5bf03635;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

/* The finish: canvas in, finished canvas out (in place).
   opts: { grade, sharp (0..1.2), grain (0..0.4) } */
VCS.applyFinish = function (canvas, opts) {
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext('2d');
  const g = VCS.GRADES[opts.grade] || VCS.GRADES.vice;

  /* A blurred twin for the unsharp mask. */
  const blurC = document.createElement('canvas');
  blurC.width = w; blurC.height = h;
  const bctx = blurC.getContext('2d');
  bctx.filter = 'blur(3px)';
  bctx.drawImage(canvas, 0, 0);
  bctx.filter = 'none';

  const src = ctx.getImageData(0, 0, w, h);
  const blur = bctx.getImageData(0, 0, w, h);
  const d = src.data, b = blur.data;
  const sharpK = (opts.sharp || 0) * 0.9;
  const grainAmt = (opts.grain || 0) * 255;
  const con = g.contrast, sat = g.saturation, warm = g.warmth;
  const sT = g.shadowTint, hT = g.highTint;
  const cx = w / 2, cy = h / 2;
  const invR2 = 1 / (cx * cx + cy * cy);

  for (let y = 0; y < h; y++) {
    const dy = y - cy;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      /* unsharp */
      let r = d[i] + (d[i] - b[i]) * sharpK;
      let gg = d[i + 1] + (d[i + 1] - b[i + 1]) * sharpK;
      let bb = d[i + 2] + (d[i + 2] - b[i + 2]) * sharpK;
      /* contrast around mid grey */
      r = (r - 128) * con + 128;
      gg = (gg - 128) * con + 128;
      bb = (bb - 128) * con + 128;
      /* saturation around luminance */
      const lum = 0.2126 * r + 0.7152 * gg + 0.0722 * bb;
      r = lum + (r - lum) * sat;
      gg = lum + (gg - lum) * sat;
      bb = lum + (bb - lum) * sat;
      /* the grade's two-tint wash: shadows lean one way, highlights the other */
      const lt = lum / 255;
      const sw = (1 - lt) * 0.16, hw = lt * 0.12;
      r += (sT[0] - r) * sw + (hT[0] - r) * hw + warm;
      gg += (sT[1] - gg) * sw + (hT[1] - gg) * hw;
      bb += (sT[2] - bb) * sw + (hT[2] - bb) * hw - warm * 0.6;
      /* fine luminance grain, shy in the mid-tones' extremes */
      if (grainAmt > 0) {
        const n = (grainHash(x, y) - 0.5) * 2 * grainAmt * (0.35 + 0.65 * (1 - Math.abs(lt - 0.5) * 2));
        r += n; gg += n; bb += n;
      }
      /* vignette: nothing until 0.42 of the corner radius, then a soft fall */
      const dx = x - cx;
      const d2 = (dx * dx + dy * dy) * invR2;
      if (d2 > 0.1764) {
        let t = (d2 - 0.1764) / (1.21 - 0.1764);
        if (t > 1) t = 1;
        const f = 1 - 0.33 * t * t * (3 - 2 * t);
        r *= f; gg *= f; bb *= f;
      }
      d[i] = clamp255(r); d[i + 1] = clamp255(gg); d[i + 2] = clamp255(bb);
    }
  }
  ctx.putImageData(src, 0, 0);
};

/* A panel's private punch trim: contrast and saturation by its factor,
   applied to a small offscreen before the panel is placed. */
VCS.punchPanel = function (img, w, h, punch) {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h));
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, c.width, c.height);
  if (punch && Math.abs(punch - 1) > 0.001) {
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const d = data.data;
    const sat = 0.9 + punch * 0.1 + (punch - 1) * 0.8;
    for (let i = 0; i < d.length; i += 4) {
      let r = (d[i] - 128) * punch + 128;
      let gg = (d[i + 1] - 128) * punch + 128;
      let bb = (d[i + 2] - 128) * punch + 128;
      const lum = 0.2126 * r + 0.7152 * gg + 0.0722 * bb;
      d[i] = clamp255(lum + (r - lum) * sat);
      d[i + 1] = clamp255(lum + (gg - lum) * sat);
      d[i + 2] = clamp255(lum + (bb - lum) * sat);
    }
    ctx.putImageData(data, 0, 0);
  }
  return c;
};
