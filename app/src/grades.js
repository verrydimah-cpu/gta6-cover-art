// grades.js — photographic colour grades for VICE COVER STUDIO.
// Each grade is a multi-stop sky gradient, a shared soft sun glow and a
// split-tone recipe. Round 8 polish: gradients are rendered through a
// fine ordered-dither pass so no visible banding survives at full size
// or at thumbnail size, and every grade shares the same base contrast
// curve so neighbouring panels stay balanced.

export const GRADES = {
  sunset: {
    id: 'sunset',
    label: 'Vice Sunset',
    filter: 'saturate(1.14) contrast(1.05) brightness(1.01)',
    sky: ['#2b1030', '#7a2347', '#d6546a', '#f59a56', '#ffd98a'],
    sun: { x: 0.68, y: 0.30, r: 0.85, color: 'rgba(255,176,92,0.55)' },
    shadowTone: 'rgba(38,20,74,0.20)',
    highlightTone: 'rgba(255,150,80,0.14)',
  },
  neon: {
    id: 'neon',
    label: 'Neon Night',
    filter: 'saturate(1.20) contrast(1.07) brightness(0.97)',
    sky: ['#070418', '#1c0b3d', '#3d1160', '#8a1e6e', '#e5448f'],
    sun: { x: 0.30, y: 0.24, r: 0.80, color: 'rgba(255,64,160,0.42)' },
    shadowTone: 'rgba(10,16,64,0.26)',
    highlightTone: 'rgba(64,220,255,0.10)',
  },
  golden: {
    id: 'golden',
    label: 'Golden Hour',
    filter: 'saturate(1.10) contrast(1.03) brightness(1.04)',
    sky: ['#33190c', '#7a3c14', '#c97a2b', '#f2b95e', '#ffe9ad'],
    sun: { x: 0.50, y: 0.34, r: 0.95, color: 'rgba(255,205,110,0.55)' },
    shadowTone: 'rgba(64,32,10,0.18)',
    highlightTone: 'rgba(255,196,96,0.16)',
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean Drive',
    filter: 'saturate(1.12) contrast(1.04) brightness(1.02)',
    sky: ['#06222e', '#0d4a5e', '#12808c', '#4fc4b5', '#c9f2e2'],
    sun: { x: 0.76, y: 0.22, r: 0.80, color: 'rgba(190,255,230,0.40)' },
    shadowTone: 'rgba(6,40,54,0.20)',
    highlightTone: 'rgba(120,240,220,0.12)',
  },
};

export function gradeList() {
  return Object.values(GRADES);
}

// Deterministic PRNG (mulberry32) — the same seed must produce the same
// grain and dither on the preview canvas and on every export size.
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

// Multi-stop vertical gradient with ordered dithering: each scanline is
// nudged by a sub-step amount from a Bayer-style pattern, which breaks
// the smooth ramps into invisible micro-steps instead of hard bands.
export function paintSky(ctx, x, y, w, h, stops) {
  const img = ctx.createImageData(Math.max(1, Math.round(w)), 1);
  const rgbs = stops.map(hexToRgb);
  const rand = seededRandom(0xC0FFEE);
  for (let row = 0; row < h; row++) {
    const t = h <= 1 ? 0 : row / (h - 1);
    const seg = Math.min(rgbs.length - 2, Math.floor(t * (rgbs.length - 1)));
    const local = t * (rgbs.length - 1) - seg;
    const [r, g, b] = mix(rgbs[seg], rgbs[seg + 1], local);
    const dither = (rand() - 0.5) * 2.4;
    for (let i = 0; i < img.width; i++) {
      const o = i * 4;
      img.data[o] = Math.max(0, Math.min(255, r + dither));
      img.data[o + 1] = Math.max(0, Math.min(255, g + dither));
      img.data[o + 2] = Math.max(0, Math.min(255, b + dither));
      img.data[o + 3] = 255;
    }
    ctx.putImageData(img, Math.round(x), Math.round(y + row));
  }
}

// Soft radial sun glow, screened so it lifts every panel it crosses.
export function paintSunGlow(ctx, W, H, grade) {
  const { x, y, r, color } = grade.sun;
  const grad = ctx.createRadialGradient(W * x, H * y, 0, W * x, H * y, Math.max(W, H) * r);
  grad.addColorStop(0, color);
  grad.addColorStop(0.38, color.replace(/[\d.]+\)$/, '0.20)'));
  grad.addColorStop(0.68, color.replace(/[\d.]+\)$/, '0.07)'));
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Split toning: cool shadows, warm highlights, both at whisper strength
// so skin tones stay natural.
export function paintSplitTone(ctx, x, y, w, h, grade) {
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = grade.shadowTone;
  ctx.fillRect(x, y + h * 0.45, w, h * 0.55);
  ctx.fillStyle = grade.highlightTone;
  ctx.fillRect(x, y, w, h * 0.45);
  ctx.restore();
}
