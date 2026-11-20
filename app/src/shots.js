// shots.js — screenshot automation hooks for Vice Cover Studio.
//
// The editor works entirely by hand, but the maker's screenshot session
// needs to drive it precisely: load the samples, apply a recipe, render an
// export and hold that export full-screen while the camera fires. This
// module installs a small `window.__vcs` handle for that session. It only
// ever calls the same functions the buttons call, so a screenshot taken
// through these hooks is a screenshot of the real app at work.

export function installShotsHooks(api) {
  const hooks = {
    // Resolves once samples are loaded and the first preview is drawn.
    ready: api.ready,
    // The live editor state, for the session log.
    state() {
      return api.getState();
    },
    // Apply any patch the controls understand: layout, grade, captions,
    // divider style, caption style, fill mode, sharpness.
    apply(patch) {
      api.applyPatch(patch);
      return api.getState();
    },
    // Run one of the Surprise Me recipes by number (1..9).
    surprise(n) {
      api.applyRecipe(n);
      return api.getState();
    },
    // Render a real export at an exact size and hand back its PNG bytes
    // as a data URL, exactly as the Export buttons produce them.
    exportPNG(w, h) {
      return api.exportDataURL(w, h);
    },
    // Hold an exported cover full-screen (the app's own PNG, scaled to
    // fit) so it can be photographed as the cover screenshot. The veil is
    // a plain flex layer styled in style.css; the image in it is the
    // untouched export, never composited or edited.
    showExport(w, h) {
      const url = api.exportDataURL(w, h);
      let veil = document.getElementById('vcs-export-veil');
      if (!veil) {
        veil = document.createElement('div');
        veil.id = 'vcs-export-veil';
        const img = document.createElement('img');
        img.id = 'vcs-export-img';
        img.alt = 'Exported Vice Cover Studio cover';
        veil.appendChild(img);
        document.body.appendChild(veil);
      }
      veil.querySelector('img').src = url;
      veil.style.display = 'flex';
      return url.slice(0, 32);
    },
    hideExport() {
      const veil = document.getElementById('vcs-export-veil');
      if (veil) veil.style.display = 'none';
    },
    // The status line text, so the session can prove an export happened.
    status() {
      const el = document.getElementById('status-line');
      return el ? el.textContent : '';
    },
  };
  window.__vcs = hooks;
  return hooks;
}
