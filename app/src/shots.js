// shots.js — the studio's catalogue: sample photographs, export sizes and
// the Surprise Me recipe book. Pure data plus tiny lookup helpers; the
// renderer and the editor both read from here so a panel, a strip button
// and a recipe can never disagree about what a photograph is called.

export const SAMPLES = [
  { id: 'neon-woman', file: 'samples/neon-woman.webp', name: 'Neon Woman', role: 'THE DRIVER', punch: 1.03, focus: { x: 0.50, y: 0.36 } },
  { id: 'speedboat', file: 'samples/speedboat.webp', name: 'Speedboat', role: 'THE GETAWAY', punch: 1.00, focus: { x: 0.50, y: 0.52 } },
  { id: 'sunset-car', file: 'samples/sunset-car.webp', name: 'Sunset Car', role: 'THE RIDE', punch: 1.01, focus: { x: 0.50, y: 0.58 } },
  { id: 'silver-fixer', file: 'samples/silver-fixer.webp', name: 'The Fixer', role: 'THE FIXER', punch: 0.98, focus: { x: 0.50, y: 0.34 } },
  { id: 'street-racer', file: 'samples/street-racer.webp', name: 'Street Racer', role: 'THE RACER', punch: 1.00, focus: { x: 0.50, y: 0.34 } },
  { id: 'yacht-man', file: 'samples/yacht-man.webp', name: 'Yacht Captain', role: 'THE CAPTAIN', punch: 1.02, focus: { x: 0.50, y: 0.40 } },
  { id: 'bodyguard', file: 'samples/bodyguard.webp', name: 'The Muscle', role: 'THE MUSCLE', punch: 0.99, focus: { x: 0.50, y: 0.38 } },
  { id: 'glamour-insider', file: 'samples/glamour-insider.webp', name: 'The Insider', role: 'THE INSIDER', punch: 1.01, focus: { x: 0.50, y: 0.34 } },
  { id: 'garage-rider', file: 'samples/garage-rider.webp', name: 'Garage Rider', role: 'THE RIDER', punch: 0.97, focus: { x: 0.46, y: 0.52 } },
  { id: 'garage-rider-2', file: 'samples/garage-rider-2.webp', name: 'Garage Lookout', role: 'THE LOOKOUT', punch: 0.97, focus: { x: 0.50, y: 0.50 } },
  { id: 'sunset-sky', file: null, name: 'Sunset Sky', role: 'THE CITY', punch: 1.00, focus: { x: 0.50, y: 0.42 }, gradient: true },
];

export const sampleById = (id) => SAMPLES.find((s) => s.id === id) || SAMPLES[0];

// The photographs proper (the sunset sky is a drawing, not a photograph).
export const PHOTO_COUNT = SAMPLES.filter((s) => s.file).length;

export const EXPORT_SIZES = [
  { id: 'post', label: 'Post · 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide · 1920 × 1080', w: 1920, h: 1080 },
];

export const exportSizeById = (id) => EXPORT_SIZES.find((s) => s.id === id) || EXPORT_SIZES[1];

// Nine house recipes for the Surprise Me button: a layout, a grade, a
// caption style and the words that go with them, tuned as a set.
export const RECIPES = [
  { name: 'Opening Night', layout: 'ensemble', grade: 'vice-sunset', style: 'chrome', title: 'SUNDOWN CITY', subtitle: 'the whole crew', tagline: 'EVERYBODY WANTS A PIECE OF THE SUNSET' },
  { name: 'Neon Confession', layout: 'hero', grade: 'neon-nights', style: 'neon', title: 'AFTER MIDNIGHT', subtitle: 'she never looked back', tagline: 'THE CITY KEEPS ITS SECRETS' },
  { name: 'Harbour Money', layout: 'trio', grade: 'ocean-drive', style: 'chrome', title: 'OCEAN LEDGER', subtitle: 'cash, salt and horsepower', tagline: 'EVERY DOCK HAS A PRICE' },
  { name: 'Golden Alibi', layout: 'duo', grade: 'golden-hour', style: 'bold', title: 'GOLDEN ALIBI', subtitle: 'two stories, one sunset', tagline: 'NEITHER ONE IS TELLING' },
  { name: 'Six Bad Decisions', layout: 'six', grade: 'vice-sunset', style: 'chrome', title: 'SIX BAD DECISIONS', subtitle: 'and one good car', tagline: 'COUNT THEM IF YOU CAN' },
  { name: 'Strip Run', layout: 'strips', grade: 'neon-nights', style: 'neon', title: 'STRIP RUN', subtitle: 'four lanes, no brakes', tagline: 'RUN THE LIGHTS WITH US' },
  { name: 'The Crew Grid', layout: 'quad', grade: 'ocean-drive', style: 'bold', title: 'CREW SEASON', subtitle: 'four faces of the take', tagline: 'LOYALTY IS A SPLIT, NOT A PROMISE' },
  { name: 'Garage Gospel', layout: 'ensemble', grade: 'golden-hour', style: 'chrome', title: 'GARAGE GOSPEL', subtitle: 'chrome, rust and thunder', tagline: 'SHE RIDES OUT AT DUSK' },
  { name: 'Vice Standard', layout: 'ensemble', grade: 'neon-nights', style: 'chrome', title: 'VICE STANDARD', subtitle: 'the night shift', tagline: 'PRINTED IN NEON, BOUND IN GOLD' },
];
