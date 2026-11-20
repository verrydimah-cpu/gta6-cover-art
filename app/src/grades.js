// grades.js — the colour grades and the film finish. A grade is one pass
// over the pixels (temperature, contrast, saturation, shadow and highlight
// tints) with an ordered Bayer dither folded in so long sunset gradients
// never band; the finish then sharpens, vignettes and lays a fine
// luminance grain over the art before any lettering is drawn.

export const GRADES = [
  { id: 'vice-sunset', name: 'Vice Sunset', temp: 14, sat: 1.18, con: 1.06, shadow: [38, 10, 44], highlight: [255, 176, 120] },
  { id: 'neon-nights', name: 'Neon Nights', temp: -6, sat: 1.28, con: 1.10, shadow: [6, 34, 44], highlight: [255, 140, 210] },
  { id: 'ocean-drive', name: 'Ocean Drive', temp: 2, sat: 1.12, con: 1.03, shadow: [10, 40, 52], highlight: [190, 245, 255] },
  { id: 'golden-hour', name: 'Golden Hour', temp: 24, sat: 1.10, con: 1.02, shadow: [44, 22, 10], highlight: [255, 205, 130] },
];

export const gradeById = (id) => GRADES.find((g) => g.id === id) || GRADES[0];

// The finish the studio opens with: a confident Sharp and a whisper of
// grain. The editor's sliders write straight into these two numbers.
export const DEFAULT_FINISH = { sharp: 0.62, grain: 0.16 };

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

// One pass: contrast around mid-grey, saturation against luma, a warm or
// cool temperature shift, and the grade's tints weighted by how deep a
// pixel sits in shadow or highlight. The dither offset is added last, a
// fraction of a step, purely to break up banding in smooth skies.
export function applyColourGrade(data, w, h, grade) {
  const { temp, sat, con, shadow, highlight } = grade;
  const d = data.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      let r = d[i], g = d[i + 1], b = d[i + 2];
      r = (r - 128) * con + 128; g = (g - 128) * con + 128; b = (b - 128) * con + 128;
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = luma + (r - luma) * sat; g = luma + (g - luma) * sat; b = luma + (b - luma) * sat;
      r += temp; b -= temp * 0.8;
      const sh = Math.max(0, 1 - luma / 160) * 0.16;
      const hi = Math.max(0, (luma - 170) / 85) * 0.12;
      r += (shadow[0] - r) * sh + (highlight[0] - r) * hi;
      g += (shadow[1] - g) * sh + (highlight[1] - g) * hi;
      b += (shadow[2] - b) * sh + (highlight[2] - b) * hi;
      const dit = (BAYER4[(x & 3) | ((y & 3) << 2)] / 16 - 0.5) * 1.6;
      d[i] = clamp255(r + dit); d[i + 1] = clamp255(g + dit); d[i + 2] = clamp255(b + dit);
    }
  }
}

// A true 3×3 unsharp convolution: each pixel is pushed away from the mean
// of its neighbours by the Sharp amount, which is what crispens print.
export function sharpenPixels(data, w, h, amount) {
  if (amount <= 0.01) return;
  const src = new Uint8ClampedArray(data.data);
  const d = data.data;
  const a = amount;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const xm = x > 0 ? -4 : 0, xp = x < w - 1 ? 4 : 0;
      const ym = y > 0 ? -w * 4 : 0, yp = y < h - 1 ? w * 4 : 0;
      for (let c = 0; c < 3; c++) {
        const centre = src[i + c];
        const cross = src[i + c + xm] + src[i + c + xp] + src[i + c + ym] + src[i + c + yp];
        d[i + c] = clamp255(centre + a * (4 * centre - cross) * 0.25);
      }
    }
  }
}

// A small tile of grayscale noise, generated once and reused as a pattern;
// drawn with 'overlay' it lightens and darkens by luminance only.
let grainTile = null;
export function makeGrainTile(size = 256) {
  if (grainTile) return grainTile;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  let seed = 987654321;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const v = 108 + (seed % 40);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grainTile = c;
  return c;
}

// The finish, in order: grade, sharpen, a gentle vignette whose falloff
// only begins past 0.42 of the radius, and the fine grain at low alpha.
export function applyFinish(ctx, w, h, grade, finish) {
  const img = ctx.getImageData(0, 0, w, h);
  applyColourGrade(img, w, h, grade);
  sharpenPixels(img, w, h, finish.sharp * 0.9);
  ctx.putImageData(img, 0, 0);
  const r = Math.hypot(w, h) / 2;
  const vig = ctx.createRadialGradient(w / 2, h / 2, r * 0.42, w / 2, h / 2, r);
  vig.addColorStop(0, 'rgba(12,2,10,0)');
  vig.addColorStop(1, 'rgba(12,2,10,0.40)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  if (finish.grain > 0.005) {
    ctx.save();
    ctx.globalAlpha = finish.grain;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(makeGrainTile(), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
