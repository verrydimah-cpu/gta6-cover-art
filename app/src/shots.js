// shots.js — "Surprise Me" recipes and screenshot states.
// A recipe is a complete cover state: layout, grade, caption style,
// which sample photo sits in each panel, per-panel punch, wording
// and finish settings. Sample indexes: 0 neon-woman, 1 speedboat,
// 2 sunset-car, 3 yacht-man. Punch is { zoom, fx, fy } per panel.

export const SAMPLES = [
  { id: 'neon-woman', name: 'Neon Woman', src: 'samples/neon-woman.webp' },
  { id: 'speedboat', name: 'Speedboat', src: 'samples/speedboat.webp' },
  { id: 'sunset-car', name: 'Sunset Car', src: 'samples/sunset-car.webp' },
  { id: 'yacht-man', name: 'Yacht Man', src: 'samples/yacht-man.webp' },
];

export const CAPTION_STYLES = [
  { id: 'stacked', name: 'Stacked Block' },
  { id: 'banner', name: 'Bottom Banner' },
  { id: 'outline', name: 'Hollow Outline' },
];

const P = (zoom, fx, fy) => ({ zoom, fx, fy });

export const RECIPES = [
  { name: 'Vice Heat', layoutId: 'quad-cross', gradeId: 'vice-sunset', captionStyle: 'stacked',
    title: 'VICE CITY HEAT', subtitle: 'One city · No brakes',
    panelPhotos: [0, 1, 2, 3], punches: [P(1.15, 0.5, 0.35), P(1.05, 0.5, 0.5), P(1.2, 0.45, 0.55), P(1.1, 0.5, 0.4)], divider: 'neon', sharp: 0.6 },
  { name: 'Midnight Run', layoutId: 'quad-cross', gradeId: 'neon-night', captionStyle: 'banner',
    title: 'MIDNIGHT RUN', subtitle: 'Neon never sleeps',
    panelPhotos: [3, 0, 1, 2], punches: [P(1.1, 0.5, 0.4), P(1.25, 0.5, 0.3), P(1.0, 0.5, 0.5), P(1.15, 0.55, 0.5)], divider: 'chrome', sharp: 0.7 },
  { name: 'Golden Getaway', layoutId: 'hero-side', gradeId: 'golden-hour', captionStyle: 'stacked',
    title: 'GOLDEN GETAWAY', subtitle: 'Chase the last light',
    panelPhotos: [2, 3, 1], punches: [P(1.05, 0.45, 0.5), P(1.2, 0.5, 0.35), P(1.1, 0.5, 0.45)], divider: 'neon', sharp: 0.6 },
  { name: 'Coral Kings', layoutId: 'five-star', gradeId: 'coral-dawn', captionStyle: 'outline',
    title: 'CORAL KINGS', subtitle: 'Five crews · One crown',
    panelPhotos: [1, 0, 2, 3, 0], punches: [P(1.1, 0.5, 0.5), P(1.2, 0.5, 0.35), P(1.05, 0.5, 0.55), P(1.15, 0.5, 0.4), P(1.3, 0.5, 0.3)], divider: 'chrome', sharp: 0.5 },
  { name: 'Harbor Vice', layoutId: 'diagonal-duo', gradeId: 'vice-sunset', captionStyle: 'banner',
    title: 'HARBOR VICE', subtitle: 'Fast boats · Slow law',
    panelPhotos: [1, 3], punches: [P(1.05, 0.5, 0.45), P(1.15, 0.5, 0.4)], divider: 'shadow', sharp: 0.6 },
  { name: 'Neon Confidential', layoutId: 'trio-slash', gradeId: 'neon-night', captionStyle: 'outline',
    title: 'NEON CONFIDENTIAL', subtitle: 'Trust no reflection',
    panelPhotos: [0, 3, 1], punches: [P(1.3, 0.5, 0.3), P(1.1, 0.5, 0.4), P(1.05, 0.5, 0.5)], divider: 'neon', sharp: 0.8 },
  { name: 'Sunset Syndicate', layoutId: 'solo-strip', gradeId: 'golden-hour', captionStyle: 'stacked',
    title: 'SUNSET SYNDICATE', subtitle: 'Loyalty is currency',
    panelPhotos: [2, 0, 1], punches: [P(1.0, 0.5, 0.45), P(1.2, 0.5, 0.35), P(1.1, 0.5, 0.5)], divider: 'clean', sharp: 0.6 },
  { name: 'Dawn Patrol', layoutId: 'quad-cross', gradeId: 'coral-dawn', captionStyle: 'stacked',
    title: 'DAWN PATROL', subtitle: 'First light · Last word',
    panelPhotos: [1, 2, 3, 0], punches: [P(1.05, 0.5, 0.5), P(1.15, 0.5, 0.4), P(1.1, 0.5, 0.45), P(1.2, 0.5, 0.35)], divider: 'neon', sharp: 0.55 },
  { name: 'Yacht Club Riot', layoutId: 'hero-side', gradeId: 'neon-night', captionStyle: 'banner',
    title: 'YACHT CLUB RIOT', subtitle: 'Rich deck · Poor choices',
    panelPhotos: [3, 1, 0], punches: [P(1.15, 0.5, 0.35), P(1.05, 0.5, 0.5), P(1.25, 0.5, 0.3)], divider: 'chrome', sharp: 0.65 },
];

export function recipeToState(recipe) {
  return {
    layoutId: recipe.layoutId,
    gradeId: recipe.gradeId,
    captionStyle: recipe.captionStyle,
    title: recipe.title,
    subtitle: recipe.subtitle,
    panelPhotos: [...recipe.panelPhotos],
    punches: recipe.punches.map((p) => ({ ...p })),
    divider: recipe.divider,
    sharp: recipe.sharp,
  };
}

export function randomRecipe(rng) {
  const pick = typeof rng === 'function' ? rng : Math.random;
  return RECIPES[Math.floor(pick() * RECIPES.length)];
}

// Named states the screenshot harness (shots.json) asks the app to
// present: cover showcase, editor, alternate collage and export view.
export const SHOT_STATES = {
  cover: { recipe: 0, view: 'showcase', exportSize: '1080x1350' },
  editor: { recipe: 1, view: 'editor', exportSize: '1080x1080' },
  collage: { recipe: 3, view: 'editor', exportSize: '1080x1080' },
  export: { recipe: 0, view: 'export', exportSize: '1080x1350' },
};
