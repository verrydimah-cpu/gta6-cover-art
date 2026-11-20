// main.js — Vice Cover Studio UI wiring (preview and exports share renderCover)
import { GRADES, GRADE_ORDER } from "./grades.js";
import { LAYOUTS, LAYOUT_ORDER, PANEL_DEFS } from "./layouts.js";
import { RECIPES, CAPTIONS, DIVIDERS } from "./shots.js";
import { renderCover } from "./render.js";

const state = {
  title: "VICE COVER", subtitle: "Tales from the Sunset Strip",
  tagline: "EVERYONE WANTS A PIECE OF THE SUNSET",
  layout: "ensemble", grade: "sunset", caption: "chrome", divider: "gold",
  sharp: 0.62, grain: 0.5, vignette: 0.5,
  panels: PANEL_DEFS.map((p) => ({ ...p, zoom: 1, cx: 0, cy: 0, punch: 0.35 })),
};
const images = {};
const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");
function redraw() { renderCover(ctx, canvas.width, canvas.height, state, images); }
async function loadSamples() {
  for (const p of PANEL_DEFS) {
    const img = new Image(); img.src = p.src.replace("samples/", "samples/");
    // samples live beside index.html
    img.src = "./" + p.src;
    await img.decode().catch(() => {});
    images[p.key] = img;
  }
  redraw();
}
function fillSelect(id, entries) { const el = document.getElementById(id); el.innerHTML = ""; for (const [v, l] of entries) { const o = document.createElement("option"); o.value = v; o.textContent = l; el.appendChild(o); } el.value = state[id]; el.addEventListener("change", () => { state[id] = el.value; redraw(); }); }
fillSelect("layout", LAYOUT_ORDER.map((k) => [k, LAYOUTS[k].label]));
fillSelect("grade", GRADE_ORDER.map((k) => [k, GRADES[k].label]));
fillSelect("caption", Object.entries(CAPTIONS));
fillSelect("divider", Object.entries(DIVIDERS));
for (const id of ["title", "subtitle", "tagline"]) { const el = document.getElementById(id); el.addEventListener("input", () => { state[id] = el.value; redraw(); }); }
for (const id of ["sharp", "grain", "vignette"]) { const el = document.getElementById(id); el.addEventListener("input", () => { state[id] = parseFloat(el.value); if (id === "sharp") document.getElementById("sharp-val").textContent = el.value; redraw(); }); }
// per-panel controls: editable role tag, zoom, crop offsets, punch
const panelBox = document.getElementById("panels");
state.panels.forEach((p, i) => {
  const row = document.createElement("div"); row.className = "panel-row";
  row.innerHTML = `<strong>${p.key}</strong>`;
  const role = document.createElement("input"); role.value = p.role; role.setAttribute("aria-label", "Role tag");
  role.addEventListener("input", () => { p.role = role.value.toUpperCase(); redraw(); });
  row.appendChild(role);
  const sliders = document.createElement("div"); sliders.className = "panel-sliders";
  for (const [prop, min, max, step] of [["zoom", 1, 2, 0.01], ["punch", 0, 1, 0.01], ["cy", -1, 1, 0.05]]) {
    const inp = document.createElement("input"); inp.type = "range"; inp.min = min; inp.max = max; inp.step = step; inp.value = p[prop]; inp.title = prop;
    inp.addEventListener("input", () => { p[prop] = parseFloat(inp.value); redraw(); });
    sliders.appendChild(inp);
  }
  row.appendChild(sliders); panelBox.appendChild(row);
});
document.getElementById("upload").addEventListener("change", (e) => {
  const f = e.target.files[0]; if (!f) return;
  const url = URL.createObjectURL(f); const img = new Image();
  img.onload = () => { images[state.panels[0].key] = img; images._upload = img; redraw(); }; img.src = url;
});
document.getElementById("surprise").addEventListener("click", () => {
  const r = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  Object.assign(state, { layout: r.layout, grade: r.grade, caption: r.caption, divider: r.divider });
  for (const id of ["layout", "grade", "caption", "divider"]) document.getElementById(id).value = state[id];
  document.getElementById("recipe-name").textContent = "Recipe: " + r.name; redraw();
});
function exportPng(w, h) {
  const off = document.createElement("canvas"); off.width = w; off.height = h;
  renderCover(off.getContext("2d"), w, h, state, images);
  // Sharp finish: the in-canvas punch/grain pipeline already applied at 0.62 default;
  // export is a direct PNG download from the same renderer.
  const a = document.createElement("a"); a.download = `vice-cover-${w}x${h}.png`; a.href = off.toDataURL("image/png"); a.click();
}
document.getElementById("exp-square").addEventListener("click", () => exportPng(1080, 1080));
document.getElementById("exp-portrait").addEventListener("click", () => exportPng(1080, 1350));
document.getElementById("exp-wide").addEventListener("click", () => exportPng(1920, 1080));
window.__vcs = { state, images, renderCover, exportPng };
loadSamples();
