// VICE COVER STUDIO — export sizes, caption styles and Surprise Me recipes.
export const SIZES = [
  { id: 'square', name: 'Square 1080×1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait 1080×1350', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide 1920×1080', w: 1920, h: 1080 },
];
export const CAPTION_STYLES = [
  { id: 'poster', name: 'Poster Bold' },
  { id: 'chrome', name: 'Chrome Shine' },
  { id: 'outline', name: 'Neon Outline' },
];
export const DIVIDERS = [
  { id: 'neon', name: 'Neon edge' },
  { id: 'paper', name: 'Paper white' },
  { id: 'shadow', name: 'Soft shadow' },
  { id: 'none', name: 'No divider' },
];
// Nine hand-tuned recipes: layout, grade, caption style, divider, finish.
// Each one was checked on the bundled samples so no recipe lands flat.
export const RECIPES = [
  { layout: 'hero-trio', grade: 'vice-sunset', caption: 'poster', divider: 'neon', grain: 0.5, sharp: 0.6 },
  { layout: 'quad-grid', grade: 'neon-night', caption: 'chrome', divider: 'paper', grain: 0.35, sharp: 0.7 },
  { layout: 'slash-duo', grade: 'golden-hour', caption: 'poster', divider: 'shadow', grain: 0.6, sharp: 0.5 },
  { layout: 'skyline-stack', grade: 'midnight-mint', caption: 'outline', divider: 'neon', grain: 0.4, sharp: 0.8 },
  { layout: 'fan-five', grade: 'vice-sunset', caption: 'chrome', divider: 'paper', grain: 0.3, sharp: 0.6 },
  { layout: 'center-stage', grade: 'neon-night', caption: 'poster', divider: 'neon', grain: 0.55, sharp: 0.6 },
  { layout: 'hero-trio', grade: 'golden-hour', caption: 'outline', divider: 'shadow', grain: 0.45, sharp: 0.7 },
  { layout: 'quad-grid', grade: 'midnight-mint', caption: 'poster', divider: 'paper', grain: 0.5, sharp: 0.5 },
  { layout: 'fan-five', grade: 'golden-hour', caption: 'chrome', divider: 'neon', grain: 0.38, sharp: 0.75 },
];
export function sizeById(id) {
  return SIZES.find((s) => s.id === id) || SIZES[0];
}
