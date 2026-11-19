// VICE COVER STUDIO — colour grades.
// A grade is a sky gradient (top/mid/bottom stops), a photo treatment
// (saturation, contrast, warmth tint) and the neon accent pair used by the
// caption glow and the divider strokes. Midnight Mint is the cool counterpoint
// to the three warm grades: deep teal sky, mint sun, magenta sparkle.
export const GRADES = [
  { id: 'vice-sunset', name: 'Vice Sunset',
    sky: ['#2b1055', '#c33c8a', '#ff9a3d'], sat: 1.22, con: 1.08,
    tint: 'rgba(255,110,64,0.14)', accent: '#ff2e88', accent2: '#22d3ee' },
  { id: 'neon-night', name: 'Neon Night',
    sky: ['#050514', '#3b0f4f', '#0ea5b7'], sat: 1.3, con: 1.14,
    tint: 'rgba(34,211,238,0.12)', accent: '#22d3ee', accent2: '#ff2e88' },
  { id: 'golden-hour', name: 'Golden Hour',
    sky: ['#3b1d5e', '#b3541e', '#ffd166'], sat: 1.12, con: 1.05,
    tint: 'rgba(255,190,60,0.16)', accent: '#ffd166', accent2: '#ff6b35' },
  { id: 'midnight-mint', name: 'Midnight Mint',
    sky: ['#02141f', '#065f46', '#5eead4'], sat: 1.18, con: 1.1,
    tint: 'rgba(45,212,191,0.12)', accent: '#2dd4bf', accent2: '#f0abfc' },
];
export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}
export function skyGradient(ctx, grade, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, grade.sky[0]);
  g.addColorStop(0.55, grade.sky[1]);
  g.addColorStop(1, grade.sky[2]);
  return g;
}
