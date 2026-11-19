// Colour grades for Vice Cover Studio.
// A grade is a sky-to-ground overlay ramp plus the canvas filter
// treatment applied while a photo is drawn, so previews and exports
// share exactly the same look. The glow colour also lights the
// subtitle accent line, tying the lettering to the grade.

export const GRADE_ORDER = ['vice-sunset', 'neon-night', 'golden-hour', 'teal-haze'];

export const GRADE_LABELS = {
  'vice-sunset': 'Vice Sunset',
  'neon-night': 'Neon Night',
  'golden-hour': 'Golden Hour',
  'teal-haze': 'Teal Haze',
};

export const GRADES = {
  'vice-sunset': {
    ramp: ['rgba(255,94,98,0.34)', 'rgba(255,154,86,0.16)', 'rgba(38,16,64,0.30)'],
    filter: 'saturate(1.28) contrast(1.08)',
    tint: 'rgba(255,120,90,0.10)',
    glow: '#ff5e9c',
  },
  'neon-night': {
    ramp: ['rgba(20,10,70,0.36)', 'rgba(150,30,160,0.18)', 'rgba(4,20,44,0.42)'],
    filter: 'saturate(1.35) contrast(1.14) brightness(0.96)',
    tint: 'rgba(40,120,255,0.10)',
    glow: '#37e0ff',
  },
  'golden-hour': {
    ramp: ['rgba(255,196,86,0.30)', 'rgba(255,140,60,0.14)', 'rgba(70,32,10,0.26)'],
    filter: 'saturate(1.18) contrast(1.05) brightness(1.03)',
    tint: 'rgba(255,180,80,0.12)',
    glow: '#ffc44d',
  },
  'teal-haze': {
    ramp: ['rgba(30,200,190,0.26)', 'rgba(20,120,150,0.14)', 'rgba(6,40,52,0.34)'],
    filter: 'saturate(1.12) contrast(1.07)',
    tint: 'rgba(30,200,190,0.10)',
    glow: '#2ee6c8',
  },
};

export function getGrade(id) {
  return GRADES[id] || GRADES['vice-sunset'];
}
