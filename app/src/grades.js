// grades.js — the four colour grades of Vice Cover Studio.
//
// A grade is a complete little colour script for a cover: the filter
// applied to each photo while it is drawn, a duotone wash that melts
// over the panels, the sky and sun colours used by the procedural
// backdrops, the frame and caption colours, and the gradient stops for
// the lettering. Everything is plain data so the renderer stays honest
// and the editor can offer a grade as a single click.

export const GRADES = {
  vice: {
    id: 'vice',
    name: 'Vice Sunset',
    sat: 1.46, con: 1.13, bri: 1.03, sep: 0,
    wash: [
      [0.0, 'rgba(58,26,128,0.62)'],
      [0.52, 'rgba(58,26,128,0.0)'],
      [1.0, 'rgba(255,38,128,0.55)'],
    ],
    sky: ['#2a1660', '#ffc93e'],
    sun: '#ffd76a',
    silhouette: '#1c0f38',
    frame: '#f7ead9',
    titleFill: ['#ffe259', '#ffa751', '#ff2e88', '#7b2ff7'],
    subtitle: '#ffe9f4',
    band: 'rgba(20,6,44,0.55)',
    glow: '#ff2e88',
    neonFill: ['#aefcff', '#26e6ff', '#ff2e88'],
  },
  neon: {
    id: 'neon',
    name: 'Neon Night',
    sat: 1.5, con: 1.16, bri: 0.96, sep: 0,
    wash: [
      [0.0, 'rgba(38,230,255,0.38)'],
      [0.5, 'rgba(10,10,40,0.05)'],
      [1.0, 'rgba(255,38,200,0.54)'],
    ],
    sky: ['#050914', '#123a6e'],
    sun: '#26e6ff',
    silhouette: '#04060f',
    frame: '#dff8ff',
    titleFill: ['#aefcff', '#26e6ff', '#7b2ff7', '#ff2ec4'],
    subtitle: '#d8fbff',
    band: 'rgba(2,6,20,0.62)',
    glow: '#26e6ff',
    neonFill: ['#ffffff', '#26e6ff', '#ff2ec4'],
  },
  clean: {
    id: 'clean',
    name: 'Clean Daylight',
    sat: 1.12, con: 1.05, bri: 1.06, sep: 0.05,
    wash: [
      [0.0, 'rgba(255,214,150,0.16)'],
      [0.55, 'rgba(255,255,255,0.0)'],
      [1.0, 'rgba(255,170,90,0.14)'],
    ],
    sky: ['#7ec8f7', '#eaf7ff'],
    sun: '#fff3b0',
    silhouette: '#274b63',
    frame: '#ffffff',
    titleFill: ['#ffffff', '#ffe9b8', '#ffb347'],
    subtitle: '#ffffff',
    band: 'rgba(10,30,50,0.42)',
    glow: '#ffb347',
    neonFill: ['#ffffff', '#bffcff', '#ffb347'],
  },
  golden: {
    id: 'golden',
    name: 'Golden Hour',
    sat: 1.22, con: 1.09, bri: 1.02, sep: 0.16,
    wash: [
      [0.0, 'rgba(14,70,78,0.48)'],
      [0.5, 'rgba(14,70,78,0.0)'],
      [1.0, 'rgba(255,148,56,0.46)'],
    ],
    sky: ['#14424e', '#ffb056'],
    sun: '#ffcf7d',
    silhouette: '#12303a',
    frame: '#fdf3df',
    titleFill: ['#fff0c0', '#ffb056', '#ff7847'],
    subtitle: '#fff4dc',
    band: 'rgba(24,20,8,0.5)',
    glow: '#ff9438',
    neonFill: ['#fff6d8', '#ffb056', '#ff5e3a'],
  },
};

export const GRADE_ORDER = ['vice', 'neon', 'clean', 'golden'];

// Build the canvas filter string for a grade at a given punch (1 = as
// authored). Punch pushes saturation and contrast away from neutral.
export function filterFor(grade, punch = 1) {
  const push = (v) => 1 + (v - 1) * punch;
  const parts = [
    `saturate(${push(grade.sat).toFixed(3)})`,
    `contrast(${push(grade.con).toFixed(3)})`,
    `brightness(${push(grade.bri).toFixed(3)})`,
  ];
  if (grade.sep > 0) parts.push(`sepia(${(grade.sep * punch).toFixed(3)})`);
  return parts.join(' ');
}
