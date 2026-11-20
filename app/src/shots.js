// VICE COVER STUDIO — sample library and Surprise Me recipes.
//
// The sample strip offers every bundled photograph for any panel, plus a
// painted sunset-gradient "photo" for graphic panels. Eight portraits and
// scenes are studio-generated samples; the two garage-rider entries are
// real photographs of a weathered cruiser motorcycle in a graffiti-walled
// garage, contributed from the editor's own camera roll — which is the
// whole point of the studio: your cast, your machines, your cover.
//
// Recipes are nine one-click moods for the Surprise Me button. Each sets a
// layout, grade, caption style, divider and headline in one go; panels keep
// whatever photographs they already hold.

export const SAMPLES = [
  { id: 'neon-woman', name: 'Neon Portrait', src: 'samples/neon-woman.webp' },
  { id: 'speedboat', name: 'Speedboat Chase', src: 'samples/speedboat.webp' },
  { id: 'sunset-car', name: 'Sunset Car', src: 'samples/sunset-car.webp' },
  { id: 'yacht-man', name: 'Yacht Captain', src: 'samples/yacht-man.webp' },
  { id: 'silver-fixer', name: 'The Fixer', src: 'samples/silver-fixer.webp' },
  { id: 'street-racer', name: 'Street Racer', src: 'samples/street-racer.webp' },
  { id: 'bodyguard', name: 'The Muscle', src: 'samples/bodyguard.webp' },
  { id: 'glamour-insider', name: 'The Insider', src: 'samples/glamour-insider.webp' },
  { id: 'garage-rider', name: 'Garage Rider — Side', src: 'samples/garage-rider.webp' },
  { id: 'garage-rider-2', name: 'Garage Rider — Rear', src: 'samples/garage-rider-2.webp' },
  { id: 'sunset-gradient', name: 'Sunset Gradient', src: null },
];

export const RECIPES = [
  {
    name: 'Opening Weekend',
    layoutId: 'ensemble', gradeId: 'vice-sunset', captionId: 'chrome-block', dividerId: 'gold',
    titleTop: 'VICE', titleBottom: 'COVER',
    tagline: 'EVERYBODY WANTS A PIECE OF THE SUNSET',
  },
  {
    name: 'Midnight Run',
    layoutId: 'duo', gradeId: 'neon-night', captionId: 'top-banner', dividerId: 'neon',
    titleTop: 'NEON', titleBottom: 'HOURS',
    tagline: 'THE CITY NEVER SLEEPS — IT SCHEMES',
  },
  {
    name: 'Golden Boys',
    layoutId: 'trio', gradeId: 'golden-hour', captionId: 'masthead', dividerId: 'gold',
    titleTop: 'GOLDEN', titleBottom: 'HOUR',
    tagline: 'EVERY SCORE SETTLES AT SUNDOWN',
  },
  {
    name: 'Harbour Kings',
    layoutId: 'grid', gradeId: 'ocean-drive', captionId: 'chrome-block', dividerId: 'chrome',
    titleTop: 'OCEAN', titleBottom: 'DRIVE',
    tagline: 'FAST BOATS · SLOW BETRAYALS',
  },
  {
    name: 'One Woman Army',
    layoutId: 'hero', gradeId: 'vice-sunset', captionId: 'top-banner', dividerId: 'gold',
    titleTop: 'HER', titleBottom: 'CITY',
    tagline: 'SHE CAME BACK FOR EVERYTHING',
  },
  {
    name: 'Garage Royalty',
    layoutId: 'strip', gradeId: 'golden-hour', captionId: 'chrome-block', dividerId: 'gold',
    titleTop: 'STEEL', titleBottom: 'HORSES',
    tagline: 'RUST IS JUST CHROME WITH A PAST LIFE',
  },
  {
    name: 'The Full Cast',
    layoutId: 'mosaic', gradeId: 'ocean-drive', captionId: 'masthead', dividerId: 'neon',
    titleTop: 'SUNSET', titleBottom: 'CITY',
    tagline: 'TEN STORIES · ONE LAST SUMMER',
  },
  {
    name: 'After Dark',
    layoutId: 'ensemble', gradeId: 'neon-night', captionId: 'chrome-block', dividerId: 'neon',
    titleTop: 'VICE', titleBottom: 'COVER',
    tagline: 'WHEN THE NEON HUMS, EVERYBODY RUNS',
  },
  {
    name: 'Last Light',
    layoutId: 'duo', gradeId: 'golden-hour', captionId: 'masthead', dividerId: 'chrome',
    titleTop: 'LAST', titleBottom: 'LIGHT',
    tagline: 'ONE RIDE BEFORE THE SUN GIVES UP',
  },
];
