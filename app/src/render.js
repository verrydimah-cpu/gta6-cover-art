// render.js — one canvas renderer used for BOTH live preview and export.
// Round-8 polish: dithered multi-stop sky, shared sun glow, split toning,
// fine soft luminance-only grain (seeded), gentle vignette, balanced gentle punch,
// tight Anton letterfit with deep stroke + soft pink glow, micro-spaced
// furniture on even optical margins, role tags on a consistent baseline grid.
import { getGrade } from "./grades.js";
import { LAYOUTS } from "./layouts.js";
import { seeded, drawStars, drawBarcode, drawSeal, roundRect } from "./decor.js";

function ditheredSky(ctx, W, H, grade, seedN) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  grade.sky.forEach((c, i) => g.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // band-breaking dither: seeded fine noise at very low alpha
  const rnd = seeded(seedN);
  ctx.save(); ctx.globalAlpha = 0.05;
  for (let i = 0; i < W * 2; i++) { ctx.fillStyle = rnd() > 0.5 ? "#fff" : "#000"; ctx.fillRect(rnd() * W, rnd() * H, 1.4, 1.4); }
  ctx.restore();
}
function sunGlow(ctx, W, H, grade) {
  ctx.save(); ctx.globalCompositeOperation = "screen";
  const r = W * 0.55, g = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, r);
  g.addColorStop(0, grade.glow); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function drawPanel(ctx, img, slot, W, H, panel, grade, dividerColor) {
  const x = slot.x * W, y = slot.y * H, w = slot.w * W, h = slot.h * H;
  ctx.save(); roundRect(ctx, x, y, w, h, W * 0.006); ctx.clip();
  if (img) {
    const zoom = (panel.zoom || 1) * 1.02, punch = 1 + (panel.punch ?? 0.35) * 0.12;
    const scale = Math.max(w / img.width, h / img.height) * zoom;
    const dw = img.width * scale * punch, dh = img.height * scale * punch;
    const cx = x + w / 2 + (panel.cx || 0) * w * 0.2, cy = y + h / 2 + (panel.cy || 0) * h * 0.2;
    ctx.filter = `saturate(${1.08 + (panel.punch ?? 0.35) * 0.25}) contrast(${1.04 + (panel.punch ?? 0.35) * 0.10}) brightness(1.03)`;
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh); ctx.filter = "none";
  } else { ctx.fillStyle = "#44283d"; ctx.fillRect(x, y, w, h); }
  // shared sun glow screened across every panel so the cast feels in one world
  ctx.globalCompositeOperation = "screen";
  const g = ctx.createRadialGradient(x + w * 0.5, y + h * 0.3, 0, x + w * 0.5, y + h * 0.3, w * 0.8);
  g.addColorStop(0, grade.glow.replace(/[\d.]+\)$/, "0.18)")); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.globalCompositeOperation = "source-over";
  ctx.restore();
  // gold frame
  ctx.save(); roundRect(ctx, x, y, w, h, W * 0.006); ctx.lineWidth = Math.max(2, W * 0.0035); ctx.strokeStyle = "#e8c15a"; ctx.stroke();
  ctx.lineWidth = 1; ctx.strokeStyle = dividerColor; ctx.stroke(); ctx.restore();
  // role tag: black slash-tag with gold rule, on the shared baseline (panel bottom)
  if (panel.role) {
    const th = Math.max(16, H * 0.026), tw = Math.min(w * 0.92, panel.role.length * th * 0.52 + W * 0.03);
    const tx = x + W * 0.006, ty = y + h - th - H * 0.006;
    ctx.save(); ctx.beginPath(); ctx.moveTo(tx, ty + th); ctx.lineTo(tx + W * 0.012, ty); ctx.lineTo(tx + tw, ty); ctx.lineTo(tx + tw - W * 0.012, ty + th); ctx.closePath();
    ctx.fillStyle = "rgba(8,4,10,0.88)"; ctx.fill(); ctx.fillStyle = "#e8c15a"; ctx.fillRect(tx + W * 0.012, ty, tw - W * 0.012, 2);
    ctx.fillStyle = "#fff"; ctx.font = `${Math.round(th * 0.58)}px Anton, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(panel.role, tx + W * 0.016, ty + th * 0.58); ctx.restore();
  }
}
function chromeTitle(ctx, text, cx, y, size, grade) {
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `${size}px Anton, sans-serif`;
  try { ctx.letterSpacing = `${Math.round(size * 0.02)}px`; } catch (e) {}
  // stacked shadow
  for (let i = 5; i >= 1; i--) { ctx.fillStyle = `rgba(20,4,24,${0.16 + i * 0.05})`; ctx.fillText(text, cx + i * 1.6, y + i * 1.8); }
  const g = ctx.createLinearGradient(0, y - size * 0.55, 0, y + size * 0.55);
  grade.chrome.forEach((c, i) => g.addColorStop(i / (grade.chrome.length - 1), c));
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = "#180818"; ctx.lineJoin = "round"; ctx.strokeText(text, cx, y);
  ctx.fillStyle = g; ctx.fillText(text, cx, y);
  ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fillRect(cx - ctx.measureText(text).width / 2, y - size * 0.30, ctx.measureText(text).width, size * 0.07);
  ctx.restore();
}
function grainAndVignette(ctx, W, H, state) {
  // split toning
  const grade = getGrade(state.grade);
  ctx.save(); ctx.fillStyle = grade.shadowTone; ctx.fillRect(0, 0, W, H * 0.5);
  ctx.fillStyle = grade.highlightTone; ctx.fillRect(0, H * 0.5, W, H * 0.5); ctx.restore();
  // fine soft luminance-only grain, seeded so exports are deterministic
  const amt = (state.grain ?? 0.5) * 0.09, rnd = seeded(1234);
  const gw = 180, gh = Math.round(180 * H / W), off = document.createElement("canvas"); off.width = gw; off.height = gh;
  const octx = off.getContext("2d"), id = octx.createImageData(gw, gh);
  for (let i = 0; i < id.data.length; i += 4) { const v = 118 + rnd() * 90; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  octx.putImageData(id, 0, 0);
  ctx.save(); ctx.globalAlpha = amt; ctx.globalCompositeOperation = "overlay"; ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, W, H); ctx.restore();
  // gentle vignette, slow falloff
  const v = (state.vignette ?? 0.5), rg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.36, W / 2, H / 2, Math.max(W, H) * 0.78);
  rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, `rgba(10,2,12,${0.42 * v})`); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
}
export function renderCover(ctx, W, H, state, images) {
  const grade = getGrade(state.grade);
  const layout = LAYOUTS[state.layout] || LAYOUTS.ensemble;
  const ensemble = state.layout === "ensemble";
  ctx.save(); ctx.fillStyle = "#241019"; ctx.fillRect(0, 0, W, H);
  if (ensemble) { // dark plum-brown backdrop with a soft sky wash at top
    ditheredSky(ctx, W, H * 0.20, grade, 7); ctx.fillStyle = "#2a1622"; ctx.fillRect(0, H * 0.20, W, H * 0.80);
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "rgba(0,0,0,0)"); bg.addColorStop(1, "rgba(0,0,0,0.35)"); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  } else ditheredSky(ctx, W, H, grade, 7);
  sunGlow(ctx, W, H, grade);
  const dividerColor = { gold: "#e8c15a", pink: "#ff5e8a", teal: "#3fc1b0", plain: "#dddddd" }[state.divider] || "#e8c15a";
  layout.slots.forEach((slot, i) => { const p = state.panels[i]; if (p) drawPanel(ctx, images[p.key] || images._upload || null, slot, W, H, p, grade, dividerColor); });
  // ---- furniture, micro-spaced with even optical margins ----
  const m = W * 0.035;
  drawStars(ctx, W, H * 0.028, "#f5c542");
  ctx.save(); ctx.fillStyle = "#ffe9a8"; ctx.font = `${Math.round(W * 0.016)}px sans-serif`; ctx.textAlign = "center";
  ctx.fillText("PURE SUNSET ADRENALINE — THE RIDE OF THE YEAR", W / 2, H * 0.052); ctx.restore();
  // VOL. 1 corner box
  ctx.save(); ctx.strokeStyle = "#e8c15a"; ctx.lineWidth = 2; ctx.strokeRect(m, H * 0.018, W * 0.062, H * 0.052);
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = `${Math.round(W * 0.018)}px Anton, sans-serif`;
  ctx.fillText("VOL. 1", m + W * 0.031, H * 0.038); ctx.font = `${Math.round(W * 0.011)}px sans-serif`; ctx.fillText("ISSUE 001", m + W * 0.031, H * 0.058); ctx.restore();
  ctx.save(); ctx.fillStyle = "#fff"; ctx.textAlign = "right"; ctx.font = `${Math.round(W * 0.013)}px sans-serif`;
  ctx.fillText("SUNSET CITY • EST. 2026", W - m, H * 0.034); ctx.fillText("COLLECTOR EDITION", W - m, H * 0.054); ctx.restore();
  // title + script subtitle
  const title = (state.title || "VICE COVER").toUpperCase();
  chromeTitle(ctx, title, W / 2, H * 0.115, Math.round(W * 0.088), grade);
  ctx.save(); ctx.textAlign = "center";
  ctx.shadowColor = "rgba(255,46,166,0.85)"; ctx.shadowBlur = W * 0.018;
  ctx.fillStyle = "#ff7ad9"; ctx.font = `italic ${Math.round(W * 0.034)}px Georgia, serif`;
  ctx.fillText(state.subtitle || "Tales from the Sunset Strip", W / 2, H * 0.168);
  ctx.shadowBlur = 0; ctx.lineWidth = 1; ctx.strokeStyle = "rgba(90,0,60,0.6)"; ctx.strokeText(state.subtitle || "Tales from the Sunset Strip", W / 2, H * 0.168); ctx.restore();
  if (state.caption === "neon") { ctx.save(); ctx.fillStyle = "#37e0ff"; ctx.font = `${Math.round(W * 0.015)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("★ A LOVE LETTER TO THE GOLDEN COAST ★", W / 2, H * 0.192); ctx.restore(); }
  if (state.caption === "classic") { ctx.save(); ctx.fillStyle = "#f5e6c8"; ctx.font = `italic ${Math.round(W * 0.015)}px Georgia, serif`; ctx.textAlign = "center"; ctx.fillText("A love letter to the golden coast", W / 2, H * 0.192); ctx.restore(); }
  // ribbon tagline
  const ry = H * 0.878, rw = W * 0.62;
  ctx.save(); ctx.fillStyle = "#160a18"; ctx.strokeStyle = "#e8c15a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2 - rw / 2, ry); ctx.lineTo(W / 2 + rw / 2, ry); ctx.lineTo(W / 2 + rw / 2 - W * 0.02, ry + H * 0.032); ctx.lineTo(W / 2 - rw / 2 + W * 0.02, ry + H * 0.032); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffe9a8"; ctx.textAlign = "center"; ctx.font = `${Math.round(W * 0.019)}px Anton, sans-serif`;
  ctx.fillText((state.tagline || "EVERYONE WANTS A PIECE OF THE SUNSET"), W / 2, ry + H * 0.021); ctx.restore();
  // COMING SOON + billing + seal + barcode along the bottom baseline
  ctx.save(); ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.font = `${Math.round(W * 0.024)}px Anton, sans-serif`;
  ctx.fillText("COMING SOON", m, H * 0.945); ctx.font = `${Math.round(W * 0.0105)}px sans-serif`; ctx.fillStyle = "#d8c8d8";
  ctx.fillText("SUNSET PICTURES PRESENTS A VICE COVER PRODUCTION • STARRING THE DRIVER • THE GETAWAY • THE RIDE", m, H * 0.966);
  ctx.fillText("THE FIXER • THE RACER • THE CAPTAIN • THE MUSCLE • THE INSIDER • THE RIDER • THE LOOKOUT", m, H * 0.982); ctx.restore();
  drawSeal(ctx, W * 0.845, H * 0.935, W * 0.038);
  drawBarcode(ctx, W * 0.895, H * 0.905, W * 0.072, H * 0.062);
  grainAndVignette(ctx, W, H, state);
  ctx.restore();
  return { width: W, height: H, layout: state.layout, grade: state.grade };
}
