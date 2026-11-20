'use strict';
/* VICE COVER STUDIO — shot catalogue.
   Every photo the studio ships with, the cast role it plays by default and
   the gentle punch trim that balances it against its neighbours. The last
   entry is not a photo at all: a sunset sky the renderer paints itself. */
window.VCS = window.VCS || {};

VCS.SAMPLES = [
  { id: 'neon-woman',     file: 'samples/neon-woman.webp',     label: 'Neon Woman',    role: 'THE DRIVER',  punch: 1.02, fx: 0.50, fy: 0.34 },
  { id: 'speedboat',      file: 'samples/speedboat.webp',      label: 'Speedboat',     role: 'THE GETAWAY', punch: 1.00, fx: 0.50, fy: 0.55 },
  { id: 'sunset-car',     file: 'samples/sunset-car.webp',     label: 'Sunset Car',    role: 'THE RIDE',    punch: 1.03, fx: 0.50, fy: 0.60 },
  { id: 'silver-fixer',   file: 'samples/silver-fixer.webp',   label: 'Silver Fixer',  role: 'THE FIXER',   punch: 0.99, fx: 0.50, fy: 0.38 },
  { id: 'street-racer',   file: 'samples/street-racer.webp',   label: 'Street Racer',  role: 'THE RACER',   punch: 1.01, fx: 0.50, fy: 0.40 },
  { id: 'yacht-man',      file: 'samples/yacht-man.webp',      label: 'Yacht Man',     role: 'THE CAPTAIN', punch: 1.00, fx: 0.50, fy: 0.44 },
  { id: 'bodyguard',      file: 'samples/bodyguard.webp',      label: 'Bodyguard',     role: 'THE MUSCLE',  punch: 0.98, fx: 0.50, fy: 0.38 },
  { id: 'glamour-insider', file: 'samples/glamour-insider.webp', label: 'Insider',     role: 'THE INSIDER', punch: 1.02, fx: 0.50, fy: 0.38 },
  { id: 'garage-rider',   file: 'samples/garage-rider.webp',   label: 'Garage Rider',  role: 'THE RIDER',   punch: 1.00, fx: 0.50, fy: 0.55 },
  { id: 'garage-rider-2', file: 'samples/garage-rider-2.webp', label: 'Garage Lookout', role: 'THE LOOKOUT', punch: 0.99, fx: 0.50, fy: 0.50 },
  { id: 'sunset-sky',     file: null,                          label: 'Sunset Sky',    role: 'THE CITY',    punch: 1.00, fx: 0.50, fy: 0.50 },
];

VCS.sampleById = function (id) {
  for (const s of VCS.SAMPLES) if (s.id === id) return s;
  return VCS.SAMPLES[0];
};

/* Surprise Me: nine house recipes — a layout, a grade, a caption voice and
   a headline that already know they look good together. */
VCS.RECIPES = [
  { name: 'Premiere Night', layout: 'ensemble', grade: 'vice',  caption: 'chrome', divider: 'gold', title: 'SUNDOWN CITY' },
  { name: 'Ocean Drive',    layout: 'ensemble', grade: 'ocean', caption: 'chrome', divider: 'gold', title: 'SUNDOWN CITY' },
  { name: 'Neon Confession', layout: 'six',     grade: 'neon',  caption: 'neon',   divider: 'neon', title: 'MIDNIGHT LEDGER' },
  { name: 'Golden Hour',    layout: 'trio',     grade: 'gold',  caption: 'chrome', divider: 'gold', title: 'LAST LIGHT BANDITS' },
  { name: 'The Getaway',    layout: 'duo',      grade: 'vice',  caption: 'block',  divider: 'gold', title: 'NO BRAKES' },
  { name: 'Cast of Sinners', layout: 'strip',   grade: 'vice',  caption: 'chrome', divider: 'neon', title: 'THE USUAL SAINTS' },
  { name: 'Harbour Kings',  layout: 'quad',     grade: 'ocean', caption: 'block',  divider: 'gold', title: 'HARBOUR KINGS' },
  { name: 'One Last Score', layout: 'solo',     grade: 'gold',  caption: 'chrome', divider: 'gold', title: 'ONE LAST SCORE' },
  { name: 'Vice Versa',     layout: 'six',      grade: 'vice',  caption: 'neon',   divider: 'gold', title: 'VICE VERSA' },
];
