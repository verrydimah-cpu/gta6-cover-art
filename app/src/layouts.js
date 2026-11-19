// VICE COVER STUDIO — collage layouts.
// Each layout is a list of panels in unit space (0..1). A panel is a polygon
// (pts), an optional gradient sky panel (sky:true) or a photo panel (photo:n
// indexes the photo slots). Angled dividers come free from the polygons, and
// every layout keeps at least one sky panel so the grade always shows.
export const LAYOUTS = [
  { id: 'hero-trio', name: 'Hero Trio', panels: [
    { pts: [[0, 0], [1, 0], [1, 0.52], [0, 0.62]], photo: 0 },
    { pts: [[0, 0.62], [1, 0.52], [1, 1], [0.52, 1]], photo: 1 },
    { pts: [[0.52, 1], [1, 1], [0, 1]], sky: true },
  ] },
  { id: 'quad-grid', name: 'Quad Grid', panels: [
    { pts: [[0, 0], [0.54, 0], [0.5, 0.5], [0, 0.54]], photo: 0 },
    { pts: [[0.54, 0], [1, 0], [1, 0.5], [0.5, 0.5]], photo: 1 },
    { pts: [[0, 0.54], [0.5, 0.5], [0.54, 1], [0, 1]], photo: 2 },
    { pts: [[0.5, 0.5], [1, 0.5], [1, 1], [0.54, 1]], sky: true },
  ] },
  { id: 'slash-duo', name: 'Slash Duo', panels: [
    { pts: [[0, 0], [0.72, 0], [0.4, 1], [0, 1]], photo: 0 },
    { pts: [[0.72, 0], [1, 0], [1, 1], [0.4, 1]], photo: 1 },
  ] },
  { id: 'skyline-stack', name: 'Skyline Stack', panels: [
    { pts: [[0, 0], [1, 0], [1, 0.34], [0, 0.4]], sky: true },
    { pts: [[0, 0.4], [1, 0.34], [1, 0.72], [0, 0.78]], photo: 0 },
    { pts: [[0, 0.78], [1, 0.72], [1, 1], [0, 1]], photo: 1 },
  ] },
  { id: 'fan-five', name: 'Fan Five', panels: [
    { pts: [[0, 0], [0.36, 0], [0.3, 0.55], [0, 0.6]], photo: 0 },
    { pts: [[0.36, 0], [0.68, 0], [0.62, 0.55], [0.3, 0.55]], photo: 1 },
    { pts: [[0.68, 0], [1, 0], [1, 0.6], [0.62, 0.55]], photo: 2 },
    { pts: [[0, 0.6], [0.46, 0.55], [0.5, 1], [0, 1]], sky: true },
    { pts: [[0.46, 0.55], [1, 0.6], [1, 1], [0.5, 1]], photo: 3 },
  ] },
  { id: 'center-stage', name: 'Center Stage', panels: [
    { pts: [[0, 0], [1, 0], [0.78, 0.42], [0.22, 0.42]], sky: true },
    { pts: [[0, 0], [0.22, 0.42], [0.3, 1], [0, 1]], photo: 1 },
    { pts: [[1, 0], [1, 1], [0.7, 1], [0.78, 0.42]], photo: 2 },
    { pts: [[0.22, 0.42], [0.78, 0.42], [0.7, 1], [0.3, 1]], photo: 0 },
  ] },
];
export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}
