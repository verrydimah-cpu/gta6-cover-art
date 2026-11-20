// shots.js — the nine "Surprise Me" shot recipes of VICE COVER STUDIO.
// Each recipe is one complete, art-directed cover: a layout, a grade,
// a caption style, a divider treatment and a mood line for the title.
// Applying one sets every control at once, so a single click takes a
// photo from raw to a finished, balanced poster.

export const RECIPES = [
  {
    name: 'Sunset Boulevard',
    layout: 'vice-classic', grade: 'vice-sunset', caption: 'poster',
    divider: 'gold', mode: 'spread', punch: 1.05, sharp: 0.62,
    title: 'VICE CITY', subtitle: 'Sunset Boulevard',
  },
  {
    name: 'Neon Confession',
    layout: 'duo-feature', grade: 'neon-night', caption: 'top',
    divider: 'neon', mode: 'spread', punch: 1.15, sharp: 0.65,
    title: 'NEON NIGHTS', subtitle: 'Ocean Drive After Dark',
  },
  {
    name: 'Golden Getaway',
    layout: 'top-strip', grade: 'golden-hour', caption: 'poster',
    divider: 'chrome', mode: 'spread', punch: 0.95, sharp: 0.55,
    title: 'GOLDEN HOUR', subtitle: 'One Last Ride West',
  },
  {
    name: 'Pastel Morning',
    layout: 'quad-grid', grade: 'ocean-drive', caption: 'banner',
    divider: 'chrome', mode: 'spread', punch: 1.0, sharp: 0.6,
    title: 'OCEAN DRIVE', subtitle: 'Pastel Morning Edition',
  },
  {
    name: 'Harbour Run',
    layout: 'vice-classic', grade: 'ocean-drive', caption: 'poster',
    divider: 'ink', mode: 'spread', punch: 1.1, sharp: 0.7,
    title: 'HARBOUR RUN', subtitle: 'Fast Boats, Slow Law',
  },
  {
    name: 'Strip Reel',
    layout: 'story-strips', grade: 'vice-sunset', caption: 'top',
    divider: 'neon', mode: 'single', punch: 1.1, sharp: 0.6,
    title: 'VICE CITY', subtitle: 'Four Frames Of Trouble',
  },
  {
    name: 'Midnight Mosaic',
    layout: 'mosaic-six', grade: 'neon-night', caption: 'banner',
    divider: 'neon', mode: 'spread', punch: 1.2, sharp: 0.65,
    title: 'MIDNIGHT CITY', subtitle: 'Every Corner Has A Story',
  },
  {
    name: 'Amber Classic',
    layout: 'duo-feature', grade: 'golden-hour', caption: 'banner',
    divider: 'ink', mode: 'single', punch: 1.0, sharp: 0.5,
    title: 'VICE CITY', subtitle: 'The Amber Classic',
  },
  {
    name: 'Grand Collage',
    layout: 'mosaic-six', grade: 'vice-sunset', caption: 'poster',
    divider: 'chrome', mode: 'spread', punch: 1.08, sharp: 0.62,
    title: 'GRAND VICE', subtitle: 'The Whole City In One Frame',
  },
];

export function recipeAt(index) {
  const n = RECIPES.length;
  return RECIPES[((index % n) + n) % n];
}
