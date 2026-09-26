/**
 * modals.js - Modales compartidos de fondo + ayuda para páginas secundarias.
 * Guarda en las mismas claves localStorage del home (se ven al instante
 * al abrir una pestaña nueva). Solo incluir en pages/*.html.
 * Usa tP() (i18n-pages) con respaldo a t() y a español.
 * Expone window.DS_openWallpaper() y window.DS_openHelp().
 */

(function () {
  function tr(key) {
    if (typeof tP === 'function') {
      const v = tP(key);
      if (v !== key) return v;
    }
    if (typeof t === 'function') {
      const v = t(key);
      if (v !== key) return v;
    }
    return key;
  }

  function basePath() {
    const p = window.location.pathname.replace(/\\/g, '/');
    return p.indexOf('/pages/') !== -1 ? '../' : '';
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function iconImg(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    return img;
  }

  // Preguntar si quitar la nieve para mejorar el ambiente del fondo
  async function askSnow() {
    let snowOn = true;
    try {
      const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
      snowOn = s.snow !== false;
    } catch (e) {}
    if (!snowOn) return;
    let yes = false;
    try {
      if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
        yes = await DSDialogs.confirm(tr('snowAsk'), {
          title: tr('wpTitle'),
          confirmText: tr('yesBtn'),
          cancelText: tr('noBtn')
        });
      } else {
        yes = confirm(tr('snowAsk'));
      }
    } catch (e) {
      yes = false;
    }
    if (yes) {
      try {
        const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
        s.snow = false;
        localStorage.setItem('darkSnowFConfig', JSON.stringify(s));
      } catch (e) {}
    }
  }

  function buildWallpaper(base, ui) {
    const overlay = el('div', 'ds-modal-overlay');
    const modal = el('div', 'ds-modal');
    modal.appendChild(el('h2', null, tr('wpTitle')));

    const form = el('form', 'ds-modal-form');

    // Predefinidos
    const g1 = el('div', 'ds-form-group');
    const l1 = el('label', null, tr('wpPreset'));
    const preset = document.createElement('select');
    const presets = [
      ['', tr('wpSelect')],
      ['default', tr('wpDefault')],
      ['assets/Texturas/backgrounds/noche-montanas.jpg', tr('wpMountains')],
      ['assets/Texturas/backgrounds/aurora.jpg', tr('wpAurora')],
      ['assets/Texturas/backgrounds/montanas-nevadas.jpg', tr('wpSnow')],
      ['assets/Texturas/backgrounds/paisaje-nevado.jpg', tr('wpSpace')],
      ['assets/Texturas/backgrounds/tierra-espacio.jpg', tr('wpEarth')],
      ['assets/Texturas/backgrounds/noche-estrellas.jpg', tr('wpStarry')],
      ['assets/Texturas/backgrounds/lago-montana.jpg', tr('wpLake')],
      ['assets/Texturas/backgrounds/bmw-m4.jpg', tr('wpBmw')]
    ];
    presets.forEach(([v, label]) => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = label;
      preset.appendChild(o);
    });
    g1.appendChild(l1);
    g1.appendChild(preset);
    form.appendChild(g1);

    // URL
    const g3 = el('div', 'ds-form-group');
    const l3 = el('label', null, tr('wpUrlLabel'));
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.placeholder = 'https://ejemplo.com/imagen.jpg';
    g3.appendChild(l3);
    g3.appendChild(urlInput);
    g3.appendChild(el('small', null, tr('wpUrlHint')));
    form.appendChild(g3);

    // Archivo
    const g4 = el('div', 'ds-form-group');
    g4.appendChild(el('label', null, tr('wpUpload')));
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    const fileBtn = el('button', 'ds-file-btn', tr('wpChooseFile'));
    fileBtn.type = 'button';
    fileBtn.addEventListener('click', () => fileInput.click());
    const fileName = el('small', null, '');
    fileInput.addEventListener('change', () => {
      const f = fileInput.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          localStorage.setItem('wallpaper', ev.target.result);
          localStorage.setItem('wallpaperSize', 'cover');
          fileName.textContent = f.name;
          preview.style.backgroundImage = "url('" + ev.target.result + "')";
          previewBox.style.display = 'block';
          note.textContent = tr('wpSaved');
        } catch (err) {}
      };
      reader.readAsDataURL(f);
    });
    g4.appendChild(fileInput);
    g4.appendChild(fileBtn);
    g4.appendChild(fileName);
    form.appendChild(g4);

    // Tamaño
    const g5 = el('div', 'ds-form-group');
    g5.appendChild(el('label', null, tr('wpSize')));
    const size = document.createElement('select');
    [['cover', tr('wpCover')], ['contain', tr('wpContain')], ['auto', tr('wpOriginal')], ['custom', tr('wpCustom')]].forEach(([v, label]) => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = label;
      size.appendChild(o);
    });
    g5.appendChild(size);
    form.appendChild(g5);

    // Tamaño personalizado
    const gCustom = el('div', 'ds-form-group');
    gCustom.style.display = 'none';
    gCustom.appendChild(el('label', null, tr('wpCustomSize')));
    const row = el('div', null, '');
    row.style.display = 'flex';
    row.style.gap = '10px';
    const wInput = document.createElement('input');
    wInput.type = 'number';
    wInput.placeholder = '1920';
    wInput.min = '100';
    const hInput = document.createElement('input');
    hInput.type = 'number';
    hInput.placeholder = '1080';
    hInput.min = '100';
    row.appendChild(wInput);
    row.appendChild(hInput);
    gCustom.appendChild(row);
    gCustom.appendChild(el('small', null, tr('wpCustomHint')));
    form.appendChild(gCustom);

    size.addEventListener('change', () => {
      gCustom.style.display = size.value === 'custom' ? 'flex' : 'none';
      gCustom.style.flexDirection = 'column';
    });

    // Vista previa + nota
    const previewBox = el('div', 'ds-form-group');
    previewBox.style.display = 'none';
    previewBox.appendChild(el('label', null, tr('wpPreview')));
    const preview = el('div', 'ds-wallpaper-preview');
    previewBox.appendChild(preview);
    form.appendChild(previewBox);
    const note = el('div', 'ds-saved-note', '');

    function showPreview(url) {
      if (url && url !== 'default') {
        const full = (typeof resolveWp === 'function') ? resolveWp(url) : url;
        preview.style.backgroundImage = "url('" + full + "')";
        previewBox.style.display = 'block';
      } else {
        previewBox.style.display = 'none';
      }
    }

    preset.addEventListener('change', () => {
      urlInput.value = '';
      fileInput.value = '';
      fileName.textContent = '';
      showPreview(preset.value);
    });
    urlInput.addEventListener('input', () => {
      const v = urlInput.value.trim();
      if (v) {
        preset.value = '';
        fileInput.value = '';
        fileName.textContent = '';
        showPreview(v);
      }
    });

    // Acciones
    const actions = el('div', 'ds-modal-actions');
    const resetBtn = el('button', 'ds-modal-btn secondary');
    resetBtn.type = 'button';
    resetBtn.appendChild(iconImg(ui + 'Devolver.svg'));
    const resetSpan = el('span', null, tr('wpReset'));
    resetBtn.appendChild(resetSpan);
    resetBtn.addEventListener('click', async () => {
      const confirmed = await DSDialogs.confirm(tr('wpConfirmReset'), {
        title: tr('wpTitle'),
        confirmText: tr('wpReset'),
        isDanger: true
      });
      if (!confirmed) return;
      localStorage.removeItem('wallpaper');
      localStorage.removeItem('wallpaperSize');
      localStorage.removeItem('wallpaperWidth');
      localStorage.removeItem('wallpaperHeight');
      localStorage.removeItem('wallpaperAnimated');
      form.reset();
      previewBox.style.display = 'none';
      gCustom.style.display = 'none';
      note.textContent = tr('wpSaved');
    });

    const cancelBtn = el('button', 'ds-modal-btn secondary');
    cancelBtn.type = 'button';
    cancelBtn.appendChild(iconImg(ui + 'Cancelar.svg'));
    cancelBtn.appendChild(el('span', null, tr('cancelBtn')));
    cancelBtn.addEventListener('click', close);

    const applyBtn = el('button', 'ds-modal-btn primary', tr('wpApply'));
    applyBtn.type = 'submit';

    actions.appendChild(resetBtn);
    actions.appendChild(cancelBtn);
    actions.appendChild(applyBtn);
    form.appendChild(actions);
    form.appendChild(note);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (fileInput.files[0] && !urlInput.value.trim() && !preset.value) return; // ya guardado al elegir
      const val = urlInput.value.trim() || preset.value;
      if (!val) return;
      const sz = size.value;
      const w = wInput.value || '1920';
      const h = hInput.value || '1080';
      if (val === 'default') {
        localStorage.removeItem('wallpaper');
        localStorage.removeItem('wallpaperSize');
        localStorage.removeItem('wallpaperWidth');
        localStorage.removeItem('wallpaperHeight');
      } else {
        try {
          localStorage.setItem('wallpaper', val);
          localStorage.setItem('wallpaperSize', sz === 'custom' ? 'custom' : sz);
          if (sz === 'custom') {
            localStorage.setItem('wallpaperWidth', w);
            localStorage.setItem('wallpaperHeight', h);
          }
        } catch (err) {}
      }
      note.textContent = tr('wpSaved');
      try {
        if (typeof trackWallpaper === 'function') trackWallpaper(val);
      } catch (err2) {}
      try {
        await askSnow();
      } catch (errA) {}
      try {
        if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
          await DSDialogs.confirm(tr('wpDone'), { title: tr('wpTitle'), confirmText: tr('infoOk') });
        }
      } catch (err3) {}
      close();
      setTimeout(() => {
        try {
          window.location.reload();
        } catch (err4) {}
      }, 350);
    });

    modal.appendChild(form);
    overlay.appendChild(modal);

    function open() {
      overlay.classList.add('active');
    }
    function close() {
      overlay.classList.remove('active');
    }
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) close();
    });

    document.body.appendChild(overlay);
    return { open, close };
  }

  function buildHelp() {
    const overlay = el('div', 'ds-modal-overlay');
    const modal = el('div', 'ds-modal');
    modal.appendChild(el('h2', null, tr('helpTitle')));
    const content = el('div', 'ds-help-grid');
    ['helpH1', 'helpH2', 'helpH3', 'helpH4', 'helpH5', 'helpH6', 'helpH7', 'helpH8'].forEach((k) => {
      content.appendChild(el('div', 'ds-help-item', tr(k)));
    });
    modal.appendChild(content);
    const actions = el('div', 'ds-modal-actions');
    const closeBtn = el('button', 'ds-modal-btn primary', tr('helpClose'));
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', close);
    actions.appendChild(closeBtn);
    modal.appendChild(actions);
    overlay.appendChild(modal);

    function open() {
      overlay.classList.add('active');
    }
    function close() {
      overlay.classList.remove('active');
    }
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) close();
    });

    document.body.appendChild(overlay);
    return { open, close };
  }

  function build() {
    const base = basePath();
    const ui = base + 'assets/Texturas/UI/';
    const wp = buildWallpaper(base, ui);
    const hp = buildHelp(base, ui);
    window.DS_openWallpaper = wp.open;
    window.DS_openHelp = hp.open;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
