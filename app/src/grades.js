// Colour grades for VICE COVER STUDIO. A grade is a recipe the renderer applies to every photo panel:
// a CSS filter string while the photo is drawn (saturation, contrast, brightness), a duotone gradient
// washed over the panel in 'overlay' blending, the sky colours used behind empty panels, the frame
// colour of the panel dividers, and the colours the caption lettering is filled with. Three grades
// ship: the Vice City sunset, a neon night, and a clean daylight look.

export const GRADES = {
  sunset: {
    name: 'Vice Sunset',
    filter: 'saturate(1.38) contrast(1.09) brightness(1.03)',
    // Duotone wash, top to bottom: violet dusk, clear middle, hot coral foot.
    wash: [
      [0, 'rgba(58, 26, 128, 0.62)'],
      [0.45, 'rgba(255, 94, 58, 0.10)'],
      [1, 'rgba(255, 38, 128, 0.55)'],
    ],
    sky: ['#2a1660', '#7a1e6e', '#e8487a', '#ff8a4a', '#ffc93e'],
    sun: '#ffd23e',
    silhouette: '#1c0f38',
    frame: '#f7ead9',
    titleFill: ['#fff6d8', '#ffc93e', '#ff7a3e'],
    subtitle: '#ffe9c9',
    band: 'rgba(24, 6, 44, 0.55)',
  },
  neon: {
    name: 'Neon Night',
    filter: 'saturate(1.5) contrast(1.16) brightness(0.96)',
    // Duotone wash: electric cyan over a magenta underglow.
    wash: [
      [0, 'rgba(0, 190, 255, 0.42)'],
      [0.5, 'rgba(20, 0, 60, 0.12)'],
      [1, 'rgba(255, 0, 150, 0.52)'],
    ],
    sky: ['#04041c', '#0d1440', '#3a1060', '#8a1470', '#ff2e88'],
    sun: '#7df9ff',
    silhouette: '#05030f',
    frame: '#dfe9ff',
    titleFill: ['#eafcff', '#4de3ff', '#ff4dd8'],
    subtitle: '#c9f4ff',
    band: 'rgba(2, 4, 26, 0.6)',
  },
  clean: {
    name: 'Clean Daylight',
    filter: 'saturate(1.12) contrast(1.05) brightness(1.04)',
    // A whisper of warm light, nothing more.
    wash: [
      [0, 'rgba(70, 120, 200, 0.16)'],
      [0.6, 'rgba(255, 255, 255, 0.02)'],
      [1, 'rgba(255, 170, 80, 0.18)'],
    ],
    sky: ['#274b8f', '#4d84c4', '#8fc3e8', '#d9ecf7', '#ffe9bd'],
    sun: '#fff3b0',
    silhouette: '#27435f',
    frame: '#ffffff',
    titleFill: ['#ffffff', '#ffe9a8', '#ffb35c'],
    subtitle: '#ffffff',
    band: 'rgba(10, 24, 44, 0.45)',
  },
};

/** The grade with the given id, or the sunset grade when the id is unknown. */
export function gradeById(id) {
  return GRADES[id] ?? GRADES.sunset;
}
