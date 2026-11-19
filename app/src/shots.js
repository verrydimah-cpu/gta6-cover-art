// Vice Cover Studio — export sizes, Surprise Me recipes, shot states.
// The three export sizes are the common post formats. The recipes are
// nine curated combinations a visitor can cycle with one button. The
// shot states describe the four screenshots: they name real app states
// (sample assignments are by sample id) so a capture can rebuild them
// exactly through the app's own controls.

'use strict';

const VCS_EXPORT_SIZES = [
  { id: 'square', name: 'Square', w: 1080, h: 1080, note: 'Feed post, 1:1' },
  { id: 'portrait', name: 'Portrait', w: 1080, h: 1350, note: 'Tall post, 4:5' },
  { id: 'wide', name: 'Wide', w: 1920, h: 1080, note: 'Banner, 16:9' },
];

const VCS_SAMPLES = [
  { id: 'sunset-car', name: 'Sunset Car', file: 'samples/sunset-car.webp' },
  { id: 'yacht-man', name: 'Yacht Man', file: 'samples/yacht-man.webp' },
  { id: 'neon-woman', name: 'Neon Woman', file: 'samples/neon-woman.webp' },
  { id: 'speedboat', name: 'Speedboat', file: 'samples/speedboat.webp' },
];

// Nine curated recipes: layout, grade, caption furniture and per-panel
// punch presets. Photos are left alone so a surprise never throws away
// the visitor's own pictures; sample covers fill empty panels instead.
const VCS_RECIPES = [
  { name: 'Postcard Vice', layoutId: 'vice-quad', gradeId: 'vice-sunset', captionStyle: 'stacked', divider: 'neon', caption: 'VICE HEAT', subtitle: 'One city, no brakes' },
  { name: 'Midnight Circuit', layoutId: 'fan-five', gradeId: 'neon-night', captionStyle: 'banner', divider: 'neon', caption: 'NEON MILES', subtitle: 'The city never logs off' },
  { name: 'Steel & Amber', layoutId: 'skyline-bands', gradeId: 'chrome-dusk', captionStyle: 'bar', divider: 'chrome', caption: 'CHROME DUSK', subtitle: 'Steel blue, amber hearts' },
  { name: 'Golden Getaway', layoutId: 'twin-slash', gradeId: 'golden-hour', captionStyle: 'stacked', divider: 'torn', caption: 'GOLDEN GETAWAY', subtitle: 'Chase the light home' },
  { name: 'Diamond Run', layoutId: 'diamond-center', gradeId: 'vice-sunset', captionStyle: 'banner', divider: 'chrome', caption: 'DIAMOND RUN', subtitle: 'One hero, four corners' },
  { name: 'Grand Collage', layoutId: 'grand-six', gradeId: 'neon-night', captionStyle: 'stacked', divider: 'neon', caption: 'GRAND COLLAGE', subtitle: 'Six panels, zero mercy' },
  { name: 'Shore Leave', layoutId: 'fan-five', gradeId: 'golden-hour', captionStyle: 'bar', divider: 'torn', caption: 'SHORE LEAVE', subtitle: 'Salt air, fast boats' },
  { name: 'Skyline Shift', layoutId: 'skyline-bands', gradeId: 'vice-sunset', captionStyle: 'stacked', divider: 'chrome', caption: 'SKYLINE SHIFT', subtitle: 'Every band a story' },
  { name: 'Twin Peaks Vice', layoutId: 'twin-slash', gradeId: 'neon-night', captionStyle: 'banner', divider: 'torn', caption: 'TWIN SLASH', subtitle: 'Cut the night in two' },
];

// The four screenshot states. Panels list sample ids in reading order;
// null keeps the grade gradient and full decor in that panel. Punch is
// zoom plus focal point per panel.
const VCS_SHOT_STATES = [
  {
    shot: '1-cover',
    kind: 'export',
    size: 'square',
    state: {
      layoutId: 'vice-quad',
      gradeId: 'vice-sunset',
      caption: 'VICE HEAT',
      subtitle: 'One city, no brakes',
      captionStyle: 'stacked',
      divider: 'neon',
      sharp: 0.6,
      panels: [
        { sample: 'sunset-car', zoom: 1.32, fx: 0.5, fy: 0.42 },
        { sample: 'yacht-man', zoom: 1.26, fx: 0.5, fy: 0.38 },
        { sample: 'neon-woman', zoom: 1.28, fx: 0.5, fy: 0.40 },
        { sample: 'speedboat', zoom: 1.34, fx: 0.5, fy: 0.48 },
      ],
    },
  },
  {
    shot: '2-editor',
    kind: 'editor',
    size: 'wide',
    state: {
      layoutId: 'grand-six',
      gradeId: 'vice-sunset',
      caption: 'VICE HEAT',
      subtitle: 'One city, no brakes',
      captionStyle: 'stacked',
      divider: 'neon',
      sharp: 0.6,
      panels: [
        { sample: 'sunset-car', zoom: 1.2, fx: 0.5, fy: 0.45 },
        { sample: 'neon-woman', zoom: 1.2, fx: 0.5, fy: 0.42 },
        { sample: 'speedboat', zoom: 1.2, fx: 0.5, fy: 0.5 },
        { sample: 'yacht-man', zoom: 1.2, fx: 0.5, fy: 0.4 },
        { sample: null, zoom: 1, fx: 0.5, fy: 0.5 },
        { sample: null, zoom: 1, fx: 0.5, fy: 0.5 },
      ],
    },
  },
  {
    shot: '3-portrait',
    kind: 'export',
    size: 'portrait',
    state: {
      layoutId: 'skyline-bands',
      gradeId: 'golden-hour',
      caption: 'GOLDEN GETAWAY',
      subtitle: 'Chase the light home',
      captionStyle: 'stacked',
      divider: 'torn',
      sharp: 0.6,
      panels: [
        { sample: 'speedboat', zoom: 1.3, fx: 0.5, fy: 0.55 },
        { sample: 'sunset-car', zoom: 1.25, fx: 0.5, fy: 0.45 },
        { sample: 'yacht-man', zoom: 1.25, fx: 0.5, fy: 0.28 },
        { sample: 'neon-woman', zoom: 1.12, fx: 0.5, fy: 0.08 },
      ],
    },
  },
  {
    shot: '4-square',
    kind: 'export',
    size: 'square',
    state: {
      layoutId: 'diamond-center',
      gradeId: 'neon-night',
      caption: 'NEON MILES',
      subtitle: 'The city never logs off',
      captionStyle: 'banner',
      divider: 'neon',
      sharp: 0.6,
      panels: [
        { sample: 'neon-woman', zoom: 1.25, fx: 0.5, fy: 0.42 },
        { sample: 'sunset-car', zoom: 1.3, fx: 0.5, fy: 0.45 },
        { sample: 'speedboat', zoom: 1.2, fx: 0.5, fy: 0.5 },
        { sample: 'yacht-man', zoom: 1.2, fx: 0.5, fy: 0.4 },
        { sample: null, zoom: 1, fx: 0.5, fy: 0.5 },
      ],
    },
  },
];
