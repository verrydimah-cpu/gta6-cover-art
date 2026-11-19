// grades.js — colour grades for VICE COVER STUDIO.
// A grade drives three things: the canvas filter applied to photos,
// the gradient used on empty / gradient panels, and the accent
// colours used by the title, subtitle glow and divider strokes.
// "sky" lists gradient stops from the top of a panel to its foot.

export const GRADES = [
  {
    id: 'vice-sunset', name: 'Vice Sunset',
    filter: 'saturate(1.35) contrast(1.08) brightness(1.02)',
    sky: ['#2b1055', '#7597de', '#ff7e5f', '#feb47b'],
    tint: 'rgba(255,110,80,0.10)',
    accent: '#ff2e88', accent2: '#ffd23f', titleFill: '#ffffff',
    titleStroke: '#1b0533', glow: '#ff2e88',
  },
  {
    id: 'neon-night', name: 'Neon Night',
    filter: 'saturate(1.5) contrast(1.18) brightness(0.94)',
    sky: ['#02010a', '#0d1b4c', '#3a0ca3', '#7209b7'],
    tint: 'rgba(40,60,255,0.12)',
    accent: '#00e5ff', accent2: '#ff2e88', titleFill: '#eafcff',
    titleStroke: '#01020f', glow: '#00e5ff',
  },
  {
    id: 'golden-hour', name: 'Golden Hour',
    filter: 'saturate(1.2) contrast(1.05) brightness(1.08) sepia(0.22)',
    sky: ['#3a1c71', '#d76d77', '#ffaf7b', '#ffe3a3'],
    tint: 'rgba(255,170,40,0.12)',
    accent: '#ffb703', accent2: '#fb7185', titleFill: '#fff7e0',
    titleStroke: '#331a00', glow: '#ffb703',
  },
  {
    id: 'coral-dawn', name: 'Coral Dawn',
    filter: 'saturate(1.28) contrast(1.02) brightness(1.1)',
    sky: ['#1d3557', '#457b9d', '#f4a261', '#ffd6a5'],
    tint: 'rgba(255,140,90,0.08)',
    accent: '#ff6b4a', accent2: '#2ec4b6', titleFill: '#ffffff',
    titleStroke: '#10222e', glow: '#2ec4b6',
  },
];

export function getGrade(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}
