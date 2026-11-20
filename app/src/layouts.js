'use strict';
/* VICE COVER STUDIO — panel geometry.
   Every layout speaks in fractions of the cover, so the same arrangement
   lands identically on a square, a portrait and a wide export. A panel
   names its default photo and the cast role it plays. */
window.VCS = window.VCS || {};

function panel(id, sample, role, x, y, w, h) {
  return { id, sample, role, x, y, w, h };
}

VCS.LAYOUTS = {
  ensemble: {
    label: 'Ensemble Poster',
    panels: [
      panel('driver',  'neon-woman',     'THE DRIVER',  0.312, 0.118, 0.376, 0.600),
      panel('getaway', 'speedboat',      'THE GETAWAY', 0.035, 0.118, 0.252, 0.140),
      panel('ride',    'sunset-car',     'THE RIDE',    0.035, 0.268, 0.252, 0.140),
      panel('fixer',   'silver-fixer',   'THE FIXER',   0.035, 0.418, 0.252, 0.140),
      panel('racer',   'street-racer',   'THE RACER',   0.035, 0.568, 0.252, 0.148),
      panel('captain', 'yacht-man',      'THE CAPTAIN', 0.713, 0.118, 0.252, 0.192),
      panel('muscle',  'bodyguard',      'THE MUSCLE',  0.713, 0.320, 0.252, 0.192),
      panel('insider', 'glamour-insider', 'THE INSIDER', 0.713, 0.522, 0.252, 0.194),
      panel('rider',   'garage-rider',   'THE RIDER',   0.035, 0.728, 0.458, 0.118),
      panel('lookout', 'garage-rider-2', 'THE LOOKOUT', 0.507, 0.728, 0.458, 0.118),
    ],
  },
  six: {
    label: 'Grid Six',
    panels: [
      panel('g1', 'neon-woman',     'THE DRIVER',  0.035, 0.130, 0.301, 0.345),
      panel('g2', 'sunset-car',     'THE RIDE',    0.350, 0.130, 0.301, 0.345),
      panel('g3', 'speedboat',      'THE GETAWAY', 0.664, 0.130, 0.301, 0.345),
      panel('g4', 'yacht-man',      'THE CAPTAIN', 0.035, 0.489, 0.301, 0.345),
      panel('g5', 'garage-rider',   'THE RIDER',   0.350, 0.489, 0.301, 0.345),
      panel('g6', 'glamour-insider', 'THE INSIDER', 0.664, 0.489, 0.301, 0.345),
    ],
  },
  quad: {
    label: 'Quad Cast',
    panels: [
      panel('q1', 'neon-woman',  'THE DRIVER',  0.035, 0.130, 0.458, 0.345),
      panel('q2', 'sunset-car',  'THE RIDE',    0.507, 0.130, 0.458, 0.345),
      panel('q3', 'speedboat',   'THE GETAWAY', 0.035, 0.489, 0.458, 0.345),
      panel('q4', 'garage-rider', 'THE RIDER',  0.507, 0.489, 0.458, 0.345),
    ],
  },
  trio: {
    label: 'Trio',
    panels: [
      panel('t1', 'neon-woman', 'THE DRIVER',  0.035, 0.130, 0.450, 0.704),
      panel('t2', 'speedboat',  'THE GETAWAY', 0.507, 0.130, 0.458, 0.345),
      panel('t3', 'sunset-car', 'THE RIDE',    0.507, 0.489, 0.458, 0.345),
    ],
  },
  duo: {
    label: 'Duo',
    panels: [
      panel('d1', 'neon-woman', 'THE DRIVER', 0.035, 0.130, 0.458, 0.704),
      panel('d2', 'sunset-car', 'THE RIDE',   0.507, 0.130, 0.458, 0.704),
    ],
  },
  solo: {
    label: 'Solo Portrait',
    panels: [
      panel('s1', 'neon-woman', 'THE DRIVER', 0.060, 0.115, 0.880, 0.700),
    ],
  },
  strip: {
    label: 'Cast Strip',
    panels: [
      panel('c1', 'neon-woman',   'THE DRIVER', 0.035, 0.130, 0.224, 0.704),
      panel('c2', 'street-racer', 'THE RACER',  0.271, 0.130, 0.224, 0.704),
      panel('c3', 'sunset-car',   'THE RIDE',   0.507, 0.130, 0.224, 0.704),
      panel('c4', 'garage-rider', 'THE RIDER',  0.743, 0.130, 0.222, 0.704),
    ],
  },
};

VCS.layoutById = function (id) {
  return VCS.LAYOUTS[id] || VCS.LAYOUTS.ensemble;
};
