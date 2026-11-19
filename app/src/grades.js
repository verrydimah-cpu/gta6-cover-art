// Vice Cover Studio — colour grades.
// A grade is pure data plus one treatment function. The same grade drives
// three things so a cover always feels unified:
//   1. the gradient painted into panels that hold no photo,
//   2. the colour treatment laid over panels that do hold a photo,
//   3. the sun disc, vignette and grain of the film finish.
// Everything here is computed locally on canvas; nothing is fetched.

'use strict';

// Small colour helpers shared by the grades and the renderer.
function vcsHexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function vcsRgba(hex, alpha) {
  const c = vcsHexToRgb(hex);
  return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
}

function vcsMix(hexA, hexB, t) {
  const a = vcsHexToRgb(hexA);
  const b = vcsHexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return 'rgb(' + r + ',' + g + ',' + bl + ')';
}

// The four house grades. skyStops run top to bottom of a photo-less panel.
// wash is the translucent colour laid over a photo, glow the highlight tint,
// shade the shadow tint, sun describes the disc decor, and finish carries
// the vignette strength and grain amount for the final pass.
const VCS_GRADES = [
  {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    blurb: 'Magenta-orange sky, teal shadows, pure poster hour.',
    skyStops: [
      [0.0, '#2b0a4a'],
      [0.34, '#8e1e63'],
      [0.58, '#e8447c'],
      [0.78, '#ff7a3d'],
      [1.0, '#ffc44d'],
    ],
    horizon: '#ffd98a',
    wash: '#ff5e7a',
    washAlpha: 0.16,
    glow: '#ffb347',
    glowAlpha: 0.14,
    shade: '#0e5f6b',
    shadeAlpha: 0.22,
    contrast: 1.08,
    sun: { colour: '#ffd23e', rim: '#ff7a3d', radius: 0.30, cutLines: 5, y: 0.62 },
    finish: { vignette: 0.42, grain: 0.05 },
    captionInk: '#ffffff',
    accent: '#ffd23e',
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    blurb: 'Deep blue dark with hot pink and cyan signage light.',
    skyStops: [
      [0.0, '#03061a'],
      [0.38, '#0a1440'],
      [0.66, '#1b2a6b'],
      [0.86, '#3d1e63'],
      [1.0, '#0a0a24'],
    ],
    horizon: '#37e0ff',
    wash: '#2745c9',
    washAlpha: 0.20,
    glow: '#ff3ea5',
    glowAlpha: 0.16,
    shade: '#02030f',
    shadeAlpha: 0.30,
    contrast: 1.14,
    sun: { colour: '#37e0ff', rim: '#ff3ea5', radius: 0.22, cutLines: 3, y: 0.34 },
    finish: { vignette: 0.55, grain: 0.07 },
    captionInk: '#f4f8ff',
    accent: '#37e0ff',
  },
  {
    id: 'chrome-dusk',
    name: 'Chrome Dusk',
    blurb: 'Steel blue panels cut with amber streetlight.',
    skyStops: [
      [0.0, '#10161f'],
      [0.36, '#243447'],
      [0.62, '#3d5a74'],
      [0.84, '#8a6a3b'],
      [1.0, '#d99a3d'],
    ],
    horizon: '#e8b45a',
    wash: '#33506e',
    washAlpha: 0.18,
    glow: '#e8a33d',
    glowAlpha: 0.13,
    shade: '#0a0f16',
    shadeAlpha: 0.26,
    contrast: 1.10,
    sun: { colour: '#f0b95a', rim: '#8a6a3b', radius: 0.25, cutLines: 4, y: 0.55 },
    finish: { vignette: 0.48, grain: 0.06 },
    captionInk: '#ffffff',
    accent: '#e8b45a',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    blurb: 'Warm gold light, soft contrast, long shadows.',
    skyStops: [
      [0.0, '#4a2408'],
      [0.30, '#9c5410'],
      [0.55, '#e08a1e'],
      [0.78, '#ffb84d'],
      [1.0, '#ffe3a1'],
    ],
    horizon: '#fff0bd',
    wash: '#ff9d2e',
    washAlpha: 0.15,
    glow: '#ffd76e',
    glowAlpha: 0.18,
    shade: '#5e3410',
    shadeAlpha: 0.16,
    contrast: 0.98,
    sun: { colour: '#ffe9a8', rim: '#ff9d2e', radius: 0.34, cutLines: 6, y: 0.66 },
    finish: { vignette: 0.36, grain: 0.04 },
    captionInk: '#ffffff',
    accent: '#ffe3a1',
  },
];

function vcsGradeById(id) {
  for (const grade of VCS_GRADES) {
    if (grade.id === id) return grade;
  }
  return VCS_GRADES[0];
}

// Paints the grade's sky into the rectangle the caller has already clipped
// to one panel. A soft horizon glow sits where the sun would meet the sea.
function vcsPaintGradeSky(ctx, x, y, w, h, grade) {
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  for (const stop of grade.skyStops) {
    sky.addColorStop(stop[0], stop[1]);
  }
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  const horizonY = y + h * grade.sun.y;
  const glow2 = ctx.createRadialGradient(
    x + w * 0.5, horizonY, 0,
    x + w * 0.5, horizonY, w * 0.55
  );
  glow2.addColorStop(0, vcsHexGlow(grade.horizon, 0.5));
  glow2.addColorStop(1, vcsHexGlow(grade.horizon, 0));
  ctx.fillStyle = glow2;
  ctx.fillRect(x, y, w, h);
  return horizonY;
}

function vcsHexGlow(hex, alpha) {
  return vcsRgba(hex, alpha);
}

// The LUT-ish treatment for a photo panel: a colour wash in overlay mode,
// a warm glow lifted into the highlights, cool shade sunk into the shadows
// and a whisper of contrast. Cheap, deterministic and fully offline.
function vcsApplyGradeToPhoto(ctx, x, y, w, h, grade) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = grade.washAlpha;
  ctx.fillStyle = grade.wash;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = grade.glowAlpha;
  const glowGrad = ctx.createLinearGradient(x, y, x, y + h);
  glowGrad.addColorStop(0, grade.glow);
  glowGrad.addColorStop(1, grade.shade);
  ctx.fillStyle = glowGrad;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = grade.shadeAlpha;
  const shadeGrad = ctx.createLinearGradient(x, y + h * 0.4, x, y + h);
  shadeGrad.addColorStop(0, '#ffffff');
  shadeGrad.addColorStop(1, grade.shade);
  ctx.fillStyle = shadeGrad;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  if (grade.contrast !== 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = Math.min(0.22, Math.abs(grade.contrast - 1) * 1.6);
    ctx.fillStyle = grade.contrast > 1 ? '#808080' : '#9a9a9a';
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}
