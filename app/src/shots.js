// shots.js — bundled sample cast, balanced panel tuning and the nine
// Surprise Me recipes for VICE COVER STUDIO.
// Panel balance (round 8): every sample carries a small punch trim so
// all ten ensemble panels share one contrast family — no panel reads
// harsher or flatter than its neighbours and skin tones stay natural.

export const SAMPLES = [
  { file: 'samples/speedboat.webp', name: 'Speedboat chase', punch: 0.97, focusY: 0.50 },
  { file: 'samples/sunset-car.webp', name: 'Sunset supercar', punch: 1.01, focusY: 0.55 },
  { file: 'samples/silver-fixer.webp', name: 'Silver fixer', punch: 1.03, focusY: 0.28 },
  { file: 'samples/street-racer.webp', name: 'Street racer', punch: 1.00, focusY: 0.16 },
  { file: 'samples/neon-woman.webp', name: 'Neon driver', punch: 1.00, focusY: 0.32 },
  { file: 'samples/yacht-man.webp', name: 'Yacht captain', punch: 0.98, focusY: 0.26 },
  { file: 'samples/bodyguard.webp', name: 'The muscle', punch: 1.02, focusY: 0.26 },
  { file: 'samples/glamour-insider.webp', name: 'Glamour insider', punch: 1.00, focusY: 0.28 },
  { file: 'samples/garage-rider.webp', name: 'Garage cruiser', punch: 0.99, focusY: 0.50 },
  { file: 'samples/garage-rider-2.webp', name: 'Garage cruiser two', punch: 0.99, focusY: 0.50 },
];

// Default cast for the Ensemble Poster, by panel index.
export const ENSEMBLE_CAST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const RECIPES = [
  { name: 'Sunset Premiere', layout: 'ensemble', grade: 'sunset', caption: 'chrome', divider: 'gold', title1: 'VICE', title2: 'COVER', subtitle: 'Sunset City Stories', ribbon: 'EVERYBODY WANTS A PIECE OF THE SUNSET', review: 'PURE SUNSET ADRENALINE — THE RIDE OF THE YEAR' },
  { name: 'Neon Confidential', layout: 'mosaic', grade: 'neon', caption: 'magazine', divider: 'gold', title1: 'NEON', title2: 'NIGHTS', subtitle: 'After Dark Confidential', ribbon: 'THE CITY NEVER SLEEPS — IT GLOWS', review: 'A NEON FEVER DREAM — FIVE STARS' },
  { name: 'Golden Hour Heist', layout: 'classic', grade: 'golden', caption: 'chrome', divider: 'gold', title1: 'GOLDEN', title2: 'HOUR', subtitle: 'One Last Golden Run', ribbon: 'EVERY SCORE SETTLES AT SUNDOWN', review: 'PURE GOLD — THE RIDE OF THE YEAR' },
  { name: 'Ocean Drive Duo', layout: 'duo', grade: 'ocean', caption: 'magazine', divider: 'white', title1: 'OCEAN', title2: 'DRIVE', subtitle: 'Partners In Shine', ribbon: 'TWO DRIVERS — ONE LONG SUMMER', review: 'SUN-SOAKED AND UTTERLY COOL' },
  { name: 'Solo Spotlight', layout: 'solo', grade: 'sunset', caption: 'minimal', divider: 'black', title1: 'THE', title2: 'DRIVER', subtitle: 'A Sunset City Story', ribbon: 'SHE OWNS EVERY STREET IN TOWN', review: 'AN INSTANT ICON — UNMISSABLE' },
  { name: 'Trio Trouble', layout: 'trio', grade: 'neon', caption: 'chrome', divider: 'gold', title1: 'TRIPLE', title2: 'THREAT', subtitle: 'Three Crews Collide', ribbon: 'THREE CREWS — ONE CITY LIMIT', review: 'TRIPLE THE TROUBLE, TRIPLE THE FUN' },
  { name: 'Quad Squad', layout: 'quad', grade: 'golden', caption: 'magazine', divider: 'white', title1: 'QUAD', title2: 'SQUAD', subtitle: 'Four Corners Of The City', ribbon: 'FOUR FACES — FOUR HIDDEN AGENDAS', review: 'A PERFECT SQUARE OF MAYHEM' },
  { name: 'Classic Collage', layout: 'classic', grade: 'ocean', caption: 'chrome', divider: 'gold', title1: 'VICE', title2: 'CLASSIC', subtitle: 'The Original Crew Returns', ribbon: 'THE CREW THAT STARTED IT ALL', review: 'A TIMELESS COLLAGE OF TROUBLE' },
  { name: 'Mosaic Nights', layout: 'mosaic', grade: 'sunset', caption: 'minimal', divider: 'black', title1: 'MOSAIC', title2: 'NIGHTS', subtitle: 'Six Stories, One Sunset', ribbon: 'SIX STORIES — ONE LONG SUNSET', review: 'EVERY TILE HIDES A SECRET' },
];

export function sampleForPanel(panelIndex, panelCount) {
  if (panelCount >= 10) return ENSEMBLE_CAST[panelIndex % ENSEMBLE_CAST.length];
  const order = [4, 5, 1, 0, 2, 3, 7, 6, 8, 9];
  return order[panelIndex % order.length];
}
