/**
 * Página "Perfil ajustes" de DarkSnowF.
 *
 * Permite descargar uno, varios o todos los perfiles (enlaces, grupos,
 * iconos, ajustes y fondo en un JSON) y subirlos en otro PC con modos
 * fusionar, reemplazar o crear como perfil nuevo.
 *
 * @module PerfilesPage
 */
(function () {
  'use strict';

  // Fondo global (igual que en el resto de HTML).
  (function applyWallpaper() {
    try {
      let wp = null;
      try {
        if (typeof getRotatedWallpaper === 'function') wp = getRotatedWallpaper();
      } catch (e) {}
      if (!wp) {
        try { wp = localStorage.getItem('wallpaper'); } catch (e) {}
      }
      if (!wp && typeof defaultWallpaper === 'function') wp = defaultWallpaper();
      if (!wp || wp === 'default') return;
      const full = (typeof resolveWp === 'function') ? resolveWp(wp) : wp;
      const size = (function () { try { return localStorage.getItem('wallpaperSize') || 'cover'; } catch (e) { return 'cover'; } })();
      document.body.style.backgroundImage = "url('" + full + "')";
      if (size === 'custom') {
        let w = null;
        let h = null;
        try {
          w = localStorage.getItem('wallpaperWidth');
          h = localStorage.getItem('wallpaperHeight');
        } catch (e) {}
        document.body.style.backgroundSize = (w && h) ? (w + 'px ' + h + 'px') : 'cover';
      } else {
        document.body.style.backgroundSize = size;
      }
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
    } catch (e) {}
  })();

  function getProfiles() {
    try {
      if (typeof DSAlmacen !== 'undefined' && DSAlmacen.obtenerPerfiles) {
        return DSAlmacen.obtenerPerfiles().map((p) => ({ id: p.id, name: p.nombre, icon: p.icono || '' }));
      }
    } catch (e) {}
    try {
      const p = JSON.parse(localStorage.getItem('profiles') || '[]');
      if (Array.isArray(p) && p.length > 0) {
        return p.map((x) => ({
          id: String(x.id),
          name: String(x.name || x.nombre || 'Personal').slice(0, 20),
          icon: typeof (x.icon || x.icono) === 'string' ? (x.icon || x.icono) : ''
        }));
      }
    } catch (e) {}
    return [{ id: 'personal', name: 'Personal', icon: '' }];
  }

  function countsOf(pid) {
    let links = 0;
    let cats = 0;
    try {
      const a = JSON.parse(localStorage.getItem('shortcuts_' + pid) || '[]');
      if (Array.isArray(a)) links = a.length;
    } catch (e) {}
    try {
      const c = JSON.parse(localStorage.getItem('shortcutCategories_' + pid) || '[]');
      if (Array.isArray(c)) cats = c.length;
    } catch (e) {}
    return { links, cats };
  }

  function avatarFor(icon) {
    if (icon && String(icon).trim()) return String(icon).trim();
    return '../assets/Texturas/UI/Usuario.svg';
  }

  function cleanName(s) {
    return String(s || 'perfil').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'perfil';
  }

  async function say(msg, title) {
    try {
      if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
        await DSDialogs.confirm(msg, { title: title || 'Perfil ajustes', confirmText: 'Entendido' });
        return;
      }
    } catch (e) {}
    try { alert(msg); } catch (e2) {}
  }

  // ---------- Descargar ----------
  const dlList = document.getElementById('dlList');
  const dlChecked = new Set();

  function renderDownload() {
    if (!dlList) return;
    dlList.innerHTML = '';
    dlChecked.clear();
    getProfiles().forEach((pf) => {
      dlChecked.add(pf.id);
      const row = document.createElement('label');
      row.className = 'pf-item';
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = true;
      check.addEventListener('change', () => {
        if (check.checked) dlChecked.add(pf.id);
        else dlChecked.delete(pf.id);
      });
      const img = document.createElement('img');
      img.src = avatarFor(pf.icon);
      img.alt = '';
      img.onerror = () => { img.src = '../assets/Texturas/UI/Usuario.svg'; };
      const name = document.createElement('span');
      name.textContent = pf.name;
      const n = countsOf(pf.id);
      const small = document.createElement('small');
      small.textContent = n.links + ' enlaces · ' + n.cats + ' grupos';
      row.appendChild(check);
      row.appendChild(img);
      row.appendChild(name);
      row.appendChild(small);
      dlList.appendChild(row);
    });
  }

  function downloadIds(ids, graphic) {
    if (!ids || ids.length === 0) return;
    const doc = DSRespaldo.generarJSON(ids, graphic !== false);
    let nombre = 'darksnowf-perfiles-todos.json';
    if (ids.length === 1) {
      const pf = getProfiles().find((p) => p.id === ids[0]);
      nombre = 'darksnowf-perfil-' + cleanName(pf ? pf.name : 'perfil') + '.json';
    } else if (ids.length < getProfiles().length) {
      nombre = 'darksnowf-perfiles-' + ids.length + '.json';
    }
    DSRespaldo.descargar(nombre, JSON.stringify(doc, null, 2), 'application/json');
  }

  const btnDlSel = document.getElementById('btn-dl-sel');
  if (btnDlSel) btnDlSel.addEventListener('click', async () => {
    const ids = getProfiles().map((p) => p.id).filter((id) => dlChecked.has(id));
    if (ids.length === 0) {
      await say('Marca al menos un perfil para descargar.');
      return;
    }
    const graphic = document.getElementById('dlGraphic');
    downloadIds(ids, graphic ? graphic.checked : true);
    await say('Copia guardada. Llévala al otro PC y súbela desde esta misma ventana.');
  });

  const btnDlAll = document.getElementById('btn-dl-all');
  if (btnDlAll) btnDlAll.addEventListener('click', async () => {
    const ids = getProfiles().map((p) => p.id);
    const graphic = document.getElementById('dlGraphic');
    downloadIds(ids, graphic ? graphic.checked : true);
    await say('Copia guardada. Llévala al otro PC y súbela desde esta misma ventana.');
  });

  // ---------- Subir ----------
  const upFile = document.getElementById('upFile');
  const upPanel = document.getElementById('upPanel');
  const upList = document.getElementById('upList');
  const upDest = document.getElementById('upDest');
  const upMode = document.getElementById('upMode');
  const btnUpPick = document.getElementById('btn-up-pick');
  const btnUpApply = document.getElementById('btn-up-apply');
  let fileDoc = null;
  let fileChecked = [];

  function renderDest() {
    if (!upDest) return;
    const prev = upDest.value;
    upDest.innerHTML = '';
    getProfiles().forEach((pf) => {
      const o = document.createElement('option');
      o.value = pf.id;
      o.textContent = pf.name;
      upDest.appendChild(o);
    });
    if (prev && getProfiles().some((p) => p.id === prev)) upDest.value = prev;
  }

  function renderFileList() {
    if (!upList) return;
    upList.innerHTML = '';
    if (!fileDoc || !Array.isArray(fileDoc.perfiles)) return;
    fileDoc.perfiles.forEach((p, i) => {
      const row = document.createElement('label');
      row.className = 'pf-item';
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = fileChecked.includes(i);
      check.addEventListener('change', () => {
        if (check.checked && !fileChecked.includes(i)) fileChecked.push(i);
        if (!check.checked) fileChecked = fileChecked.filter((x) => x !== i);
      });
      const name = document.createElement('span');
      name.textContent = (p.nombre || p.name || 'Perfil');
      const small = document.createElement('small');
      small.textContent = ((p.accesos || []).length) + ' enlaces';
      row.appendChild(check);
      row.appendChild(name);
      row.appendChild(small);
      upList.appendChild(row);
    });
  }

  if (btnUpPick && upFile) btnUpPick.addEventListener('click', () => upFile.click());

  if (upFile) upFile.addEventListener('change', () => {
    const f = upFile.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed && parsed.app === 'darksnowf' && parsed.v === 1 && parsed.data && typeof parsed.data === 'object') {
          Object.keys(parsed.data).forEach((k) => {
            try { localStorage.setItem(k, parsed.data[k]); } catch (e) {}
          });
          try {
            if (window.DSPersistencia && window.DSPersistencia.espejarPronto) window.DSPersistencia.espejarPronto();
          } catch (e) {}
          await say('Copia cargada. Se recargará la página.');
          window.location.reload();
          return;
        }
        const valid = DSRespaldo.validarImportacion(parsed);
        if (!valid.valido) throw new Error(valid.motivo || 'bad backup');
        fileDoc = parsed;
        fileChecked = parsed.perfiles.map((_, i) => i);
        renderFileList();
        renderDest();
        if (upPanel) upPanel.style.display = 'flex';
      } catch (e) {
        await say('Archivo inválido: no es una copia de DarkSnowF.');
      }
      upFile.value = '';
    };
    reader.readAsText(f);
  });

  if (btnUpApply) btnUpApply.addEventListener('click', async () => {
    try {
      if (!fileDoc) return;
      const modo = (upMode || {}).value || 'fusionar';
      const destino = (upDest || {}).value;
      const elegidos = (fileDoc.perfiles || []).filter((_, i) => fileChecked.includes(i));
      if (elegidos.length === 0) {
        await say('Marca al menos un perfil del archivo.');
        return;
      }
      elegidos.forEach((p) => {
        if (modo === 'nuevo' || elegidos.length > 1) {
          if (modo === 'nuevo') DSRespaldo.aplicarImportacion([p], { modo: 'nuevo' });
          else DSRespaldo.aplicarImportacion([p], { modo: modo, destinoId: destino });
        } else {
          DSRespaldo.aplicarImportacion([p], { modo: modo, destinoId: destino });
        }
      });
      try {
        if (fileDoc.fondo && typeof fileDoc.fondo === 'object') {
          Object.keys(fileDoc.fondo).forEach((k) => {
            const v = fileDoc.fondo[k];
            try {
              if (v === null || v === undefined) localStorage.removeItem(k);
              else localStorage.setItem(k, v);
            } catch (e) {}
          });
        }
        if (fileDoc.ajustes && typeof fileDoc.ajustes === 'object') {
          try { localStorage.setItem('darkSnowFConfig', JSON.stringify(fileDoc.ajustes)); } catch (e) {}
        }
        if (window.DSPersistencia && window.DSPersistencia.espejarPronto) window.DSPersistencia.espejarPronto();
      } catch (e) {}
      await say('Perfiles cargados. Se recargará la página.');
      window.location.reload();
    } catch (e) {
      await say('No se pudo importar el archivo.');
    }
  });

  renderDownload();
  renderDest();
})();
