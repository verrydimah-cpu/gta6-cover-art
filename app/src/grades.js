// grades.js — the four photographic colour grades of Vice Cover Studio.
//
// Every grade is a small bundle of believable photographic decisions: a sky
// gradient for empty panels, a sun position and glow colour, a camera-style
// filter string used while a photo is drawn, a translucent wash laid over
// the photo afterwards, and the backdrop / accent colours the poster
// furniture is printed in. One grade drives the whole cover, so panels shot
// on different phones still feel like one poster photographed at one hour.

export const GRADES = [
  {
    id: 'vice-sunset',
    name: 'Vice Sunset',
    // Deep Vice sunset: believable sky, plum zenith melting through rose
    // and apricot into a hot horizon line.
    sky: ['#2b1b4d', '#7a2d63', '#c7437d', '#f0766b', '#ffb36b', '#ffd98f'],
    skyStops: [0, 0.34, 0.55, 0.72, 0.88, 1],
    sun: '#fff3c4',
    sunGlow: 'rgba(255, 176, 92, 0.55)',
    sunX: 0.68,
    sunY: 0.66,
    filter: 'saturate(1.14) contrast(1.07) brightness(1.02) sepia(0.16)',
    wash: 'rgba(255, 110, 90, 0.10)',
    washBottom: 'rgba(43, 16, 53, 0.28)',
    backdrop: ['#38202e', '#241019'],
    accent: '#ffb36b',
    neon: '#ff5e9c',
    frame: '#d9a441',
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    sky: ['#070a24', '#14235c', '#3b1d6e', '#8a2470', '#e83e8c', '#ff7ab0'],
    skyStops: [0, 0.3, 0.52, 0.7, 0.86, 1],
    sun: '#ffe6f4',
    sunGlow: 'rgba(255, 62, 140, 0.5)',
    sunX: 0.3,
    sunY: 0.6,
    filter: 'saturate(1.22) contrast(1.12) brightness(0.97) hue-rotate(-8deg)',
    wash: 'rgba(64, 32, 160, 0.12)',
    washBottom: 'rgba(4, 4, 24, 0.34)',
    backdrop: ['#1c1030', '#0d0719'],
    accent: '#7ae7ff',
    neon: '#ff3e8c',
    frame: '#c9d1e8',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    sky: ['#4a2c14', '#8a4d1d', '#cf7a2c', '#f2a54a', '#ffcf7d', '#ffe9ae'],
    skyStops: [0, 0.32, 0.54, 0.72, 0.88, 1],
    sun: '#fff8dc',
    sunGlow: 'rgba(255, 196, 86, 0.6)',
    sunX: 0.76,
    sunY: 0.58,
    filter: 'saturate(1.1) contrast(1.05) brightness(1.05) sepia(0.28)',
    wash: 'rgba(255, 170, 60, 0.12)',
    washBottom: 'rgba(58, 28, 8, 0.26)',
    backdrop: ['#3a2415', '#221206'],
    accent: '#ffd98f',
    neon: '#ff9c5b',
    frame: '#e3b34e',
  },
  {
    id: 'ocean-drive',
    name: 'Ocean Drive',
    sky: ['#0d2b4d', '#17557e', '#2e86a8', '#63b8c9', '#a8e0d8', '#f4e8c0'],
    skyStops: [0, 0.3, 0.52, 0.7, 0.86, 1],
    sun: '#fffbe8',
    sunGlow: 'rgba(150, 220, 220, 0.45)',
    sunX: 0.5,
    sunY: 0.64,
    filter: 'saturate(1.12) contrast(1.06) brightness(1.03) hue-rotate(6deg)',
    wash: 'rgba(46, 140, 170, 0.10)',
    washBottom: 'rgba(6, 30, 52, 0.28)',
    backdrop: ['#14303e', '#0a1c26'],
    accent: '#a8e0d8',
    neon: '#ffb36b',
    frame: '#d9c98a',
  },
];

export function gradeById(id) {
  return GRADES.find((grade) => grade.id === id) || GRADES[0];
}

// A vertical sky gradient for a rectangle, built from the grade's stops.
export function skyGradient(ctx, grade, x, y, w, h) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grade.sky.forEach((colour, i) => grad.addColorStop(grade.skyStops[i], colour));
  return grad;
}

// The warm radial glow around the grade's sun, clipped by the caller.
// The mid stop is derived from the core glow so every grade keeps the same
// soft falloff shape, only its colour changes.
export function sunGlowGradient(ctx, grade, cx, cy, radius) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, grade.sunGlow);
  grad.addColorStop(0.45, grade.sunGlow.replace(/[\d.]+\)$/, '0.18)'));
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  return grad;
}
