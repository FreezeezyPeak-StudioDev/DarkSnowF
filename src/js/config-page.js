/**
 * config-page.js - Lógica de la página de opciones (MV3, sin manejadores en línea).
 */

function applyLocalSettings() {
  const settings = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');

  // Aplicar cursor
  if (settings.cursorStyle && settings.showCustomCursor !== false) {
    const cursorStyles = {
      'windows': 'default',
      'default': 'auto',
      'blue': 'crosshair',
      'neon': 'pointer',
      'retro': 'cell'
    };
    document.body.style.cursor = cursorStyles[settings.cursorStyle] || 'auto';
  }

  // Aplicar tipografía
  if (settings.fontFamily) {
    document.body.style.fontFamily = settings.fontFamily;
  }

  // Aplicar velocidad de animación
  if (settings.animationSpeed) {
    const speeds = {
      'slow': '0.6s',
      'normal': '0.3s',
      'fast': '0.15s'
    };
    document.body.style.transitionDuration = speeds[settings.animationSpeed] || '0.3s';
  }
}

function changeSetting(key, value) {
  const settings = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
  settings[key] = value;
  localStorage.setItem('darkSnowFConfig', JSON.stringify(settings));
  // El tema es por perfil: se guarda también en su perfil activo.
  if (key === 'theme') {
    try {
      if (typeof window.DSPf !== 'undefined' && window.DSPf.set) {
        window.DSPf.set(window.DSPf.activeId(), { theme: value });
      }
    } catch (e) {}
  }

  applyLocalSettings();
  console.log('Configuración guardada:', key, '=', value);
}

async function saveSettings() {
  await showInfo('alertSaved', 'Configuración guardada', 'cfgTitle', 'Configuración');
  try {
    if (typeof window.dsReloadVerified === 'function') window.dsReloadVerified();
    else location.reload();
  } catch (e) {}
}

function applyNow() {
  showInfo('alertSaved', 'Configuración guardada', 'cfgTitle', 'Configuración');
}

async function resetSettings() {
  const confirmed = await DSDialogs.confirm(
    typeof tP === 'function' ? tP('confirmReset') : '¿Estás seguro de que deseas restaurar la configuración predeterminada?',
    {
      title: typeof tP === 'function' ? tP('resetTitle') : 'Restaurar configuración',
      confirmText: typeof tP === 'function' ? tP('reset') : 'Restaurar',
      isDanger: true
    }
  );
  if (confirmed) {
    const keepLinksEl = document.getElementById('keepLinks');
    const keepWallEl = document.getElementById('keepWallpaper');
    const keepLinks = keepLinksEl ? keepLinksEl.checked : true;
    const keepWall = keepWallEl ? keepWallEl.checked : true;
    localStorage.removeItem('darkSnowFConfig');
    localStorage.removeItem('darksnowf_config');
    if (!keepLinks) {
      // Borrar enlaces de todos los perfiles + categorías + selección + perfiles
      try {
        const gone = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.indexOf('shortcuts_') === 0 || k.indexOf('shortcutCategories_') === 0 || k.indexOf('selectedCat_') === 0)) gone.push(k);
        }
        gone.forEach((k) => localStorage.removeItem(k));
        localStorage.removeItem('shortcuts');
        localStorage.removeItem('shortcutCategories');
        localStorage.removeItem('selectedCat');
        localStorage.removeItem('profiles');
        localStorage.removeItem('activeProfile');
        localStorage.removeItem('startupProfile');
        localStorage.removeItem('profilesMigrated');
      } catch (e) {}
    }
    if (!keepWall) {
      localStorage.removeItem('wallpaper');
      localStorage.removeItem('wallpaperSize');
      localStorage.removeItem('wallpaperWidth');
      localStorage.removeItem('wallpaperHeight');
      localStorage.removeItem('wallpaperAnimated');
      localStorage.removeItem('wallpaperPool');
    }
    await showInfo('alertReset', 'Configuración restaurada\n\nAbre una nueva pestaña para ver los cambios.', 'cfgTitle', 'Configuración');
    try {
      if (typeof window.dsReloadVerified === 'function') window.dsReloadVerified();
      else location.reload();
    } catch (e) {}
  }
}

// Mapeo: elemento -> { key, type }
const SETTING_BINDINGS = [
  ['theme', 'theme', 'value'],
  ['fontFamily', 'fontFamily', 'value'],
  ['showParticles', 'showParticles', 'checked'],
  ['showClock', 'showClock', 'checked'],
  ['showSearch', 'showSearch', 'checked'],
  ['enableClickSound', 'enableClickSound', 'checked'],
  ['clickVolume', 'clickVolume', 'number'],
  ['speed', 'animationSpeed', 'value'],
  ['tz', 'clockTz', 'value'],
  ['syncTime', 'syncTime', 'checked'],
  ['snow', 'snow', 'checked'],
  ['customCursor', 'customCursor', 'checked'],
  ['catCursors', 'catCursors', 'checked'],
  ['clockFormat', 'clockFormat', 'value'],
  ['clockSeconds', 'clockSeconds', 'checked'],
  ['dateFormat', 'dateFormat', 'value']
];

function bindControls() {
  let reloadTimer = 0;
  const autoReload = () => {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      try {
        if (typeof window.dsReloadVerified === 'function') window.dsReloadVerified();
        else location.reload();
      } catch (e) {}
    }, 1200);
  };
  SETTING_BINDINGS.forEach(([elementId, key, kind]) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.addEventListener('change', () => {
      let value;
      if (kind === 'checked') value = el.checked;
      else if (kind === 'number') value = Number(el.value);
      else value = el.value;
      changeSetting(key, value);
      // Recarga automática en cada cambio (menos volumen y gatos: flujo propio).
      if (elementId !== 'clickVolume' && elementId !== 'catCursors') autoReload();
    });
  });

  const saveBtn = document.getElementById('btn-save');
  const applyBtn = document.getElementById('btn-apply');
  const resetBtn = document.getElementById('btn-reset');
  if (saveBtn) saveBtn.addEventListener('click', saveSettings);
  if (applyBtn) applyBtn.addEventListener('click', applyNow);
  if (resetBtn) resetBtn.addEventListener('click', resetSettings);

  // Zoom + / -
  const zoomIn = document.getElementById('btn-zoom-in');
  const zoomOut = document.getElementById('btn-zoom-out');
  const stepZoom = (dir) => {
    let settings = {};
    try {
      settings = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
    } catch (e) {
      settings = {};
    }
    let z = typeof settings.zoom === 'number' ? settings.zoom : 0.8;
    z = Math.min(1.5, Math.max(0.5, Math.round((z + dir * 0.1) * 10) / 10));
    changeSetting('zoom', z);
    updateZoomLabel(z);
  };
  if (zoomIn) zoomIn.addEventListener('click', () => stepZoom(1));
  if (zoomOut) zoomOut.addEventListener('click', () => stepZoom(-1));

  // Aplicar cursor en vivo al activar/desactivar (sin recargar)
  const liveCursor = () => {
    let s = {};
    try {
      s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
    } catch (e) {}
    const off = s.customCursor === false;
    document.querySelectorAll('link[href*="cursor.css"]').forEach((l) => {
      try { l.disabled = off; } catch (e) {}
    });
    let offStyle = document.getElementById('ds-cursor-off');
    if (off) {
      if (!offStyle) {
        offStyle = document.createElement('style');
        offStyle.id = 'ds-cursor-off';
        offStyle.textContent = '* { cursor: auto !important; } a, button, input, select, textarea, label { cursor: pointer !important; }';
        document.head.appendChild(offStyle);
      }
    } else if (offStyle) {
      offStyle.remove();
    }
  };
  const ccBox = document.getElementById('customCursor');
  if (ccBox) ccBox.addEventListener('change', () => setTimeout(liveCursor, 60));
  const catBox = document.getElementById('catCursors');
  const amoLink = document.getElementById('catAmoLink');
  if (amoLink) {
    const amoLang = (typeof getPagesLang === 'function' ? getPagesLang() : 'es') === 'en' ? 'en-US' : 'es-ES';
    amoLink.href = 'https://addons.mozilla.org/' + amoLang + '/firefox/addon/catcursorf/';
  }
  if (catBox) catBox.addEventListener('change', () => {
    // Estricto: al activar se pide en vivo a CatCursorF; sin ella se revierte.
    if (!catBox.checked) {
      try {
        const s0 = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
        s0.catCursors = false;
        localStorage.setItem('darkSnowFConfig', JSON.stringify(s0));
      } catch (e) {}
      setTimeout(liveCursor, 60);
      return;
    }
    const needMsg = () => {
      const msg = typeof tP === 'function' ? tP('catReqMsg') : 'Para ver los gatos necesitas tener instalada la extensión CatCursorF. Puedes activar o desactivar esta opción en Ajustes.';
      const title = typeof tP === 'function' ? tP('catReqTitle') : 'Extensión requerida';
      const ok = typeof tP === 'function' ? tP('infoOk') : 'Entendido';
      try {
        if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
          DSDialogs.confirm(msg, { title, confirmText: ok });
        }
      } catch (e) {}
    };
    if (typeof requestCatCursors === 'function' && typeof applyCatCursors === 'function') {
      requestCatCursors(2500).then(async (urls) => {
        if (urls && applyCatCursors(urls)) {
          setTimeout(liveCursor, 60);
          let yes = true;
          try {
            const okMsg = typeof tP === 'function' ? tP('compatMsg') : 'Se ha detectado una extensión de nuestra organización: CatCursorF.';
            const okTitle = typeof tP === 'function' ? tP('compatTitle') : 'Compatibilidad activa';
            const yesBtn = typeof tP === 'function' ? tP('applyYes') : 'Sí, aplicar';
            const noBtn = typeof tP === 'function' ? tP('keepOld') : 'No, mantener el cursor anterior';
            if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
              yes = await DSDialogs.confirm(okMsg, { title: okTitle, confirmText: yesBtn, cancelText: noBtn });
            }
          } catch (e) {}
          if (!yes) {
            try {
              const s0 = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
              s0.catCursors = false;
              localStorage.setItem('darkSnowFConfig', JSON.stringify(s0));
            } catch (e) {}
            catBox.checked = false;
            try { if (typeof clearCatCursors === 'function') clearCatCursors(); } catch (e) {}
            setTimeout(liveCursor, 60);
          }
        } else {
          try {
            const s0 = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
            s0.catCursors = false;
            localStorage.setItem('darkSnowFConfig', JSON.stringify(s0));
          } catch (e) {}
          catBox.checked = false;
          needMsg();
        }
      });
    } else {
      try {
        const s0 = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
        s0.catCursors = false;
        localStorage.setItem('darkSnowFConfig', JSON.stringify(s0));
      } catch (e) {}
      catBox.checked = false;
      needMsg();
    }
  });

  // Fondo instantáneo (sin recargar): escribe las mismas claves del home
  const wpPreset = document.getElementById('wpPresetCfg');
  const wpUrl = document.getElementById('wpUrlCfg');
  const applyWallpaperNow = async () => {
    if (!wpPreset || !wpUrl) return;
    const val = wpUrl.value.trim() || wpPreset.value;
    if (!val) return;
    if (val === 'default') {
      localStorage.removeItem('wallpaper');
      localStorage.removeItem('wallpaperSize');
    } else {
      localStorage.setItem('wallpaper', val);
      localStorage.setItem('wallpaperSize', 'cover');
      if (wpUrl.value.trim()) wpPreset.value = '';
    }
    console.log('Fondo actualizado:', val);
    try {
      if (typeof trackWallpaper === 'function') trackWallpaper(val);
    } catch (e) {}
    // Preguntar si quitar la nieve para mejorar el ambiente
    let snowOn = true;
    try {
      const sc = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
      snowOn = sc.snow !== false;
    } catch (e) {}
    if (val !== 'default' && snowOn) {
      let yes = false;
      const askMsg = typeof tP === 'function' ? tP('snowAsk') : '¿Quitar la nieve para mejorar el ambiente del fondo?';
      try {
        if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
          yes = await DSDialogs.confirm(askMsg, {
            title: 'Fondo',
            confirmText: typeof tP === 'function' ? tP('yesBtn') : 'Sí',
            cancelText: typeof tP === 'function' ? tP('noBtn') : 'No'
          });
        } else {
          yes = confirm(askMsg);
        }
      } catch (e) {
        yes = false;
      }
      if (yes) {
        try {
          const sc2 = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
          sc2.snow = false;
          localStorage.setItem('darkSnowFConfig', JSON.stringify(sc2));
        } catch (e) {}
        const snowBox = document.getElementById('snow');
        if (snowBox) snowBox.checked = false;
      }
    }
    // Aviso centrado de confirmación
    try {
      const doneMsg = typeof tP === 'function' ? tP('wpDone') : 'Fondo aplicado correctamente.';
      const okText = typeof tP === 'function' ? tP('infoOk') : 'Entendido';
      if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
        await DSDialogs.confirm(doneMsg, { title: 'Fondo', confirmText: okText });
      }
    } catch (e) {}
  };
  if (wpPreset) wpPreset.addEventListener('change', () => { wpUrl.value = ''; applyWallpaperNow(); });
  if (wpUrl) wpUrl.addEventListener('change', applyWallpaperNow);

  // Rotación: sembrar presets la primera vez + gestionar pool
  const PRESET_URLS = [
    'assets/Texturas/backgrounds/noche-montanas.jpg',
    'assets/Texturas/backgrounds/aurora.jpg',
    'assets/Texturas/backgrounds/montanas-nevadas.jpg',
    'assets/Texturas/backgrounds/paisaje-nevado.jpg',
    'assets/Texturas/backgrounds/tierra-espacio.jpg',
    'assets/Texturas/backgrounds/noche-estrellas.jpg',
    'assets/Texturas/backgrounds/lago-montana.jpg',
    'assets/Texturas/backgrounds/bmw-m4.jpg'
  ];
  const poolBox = document.getElementById('wpPool');
  const renderPool = () => {
    if (!poolBox || typeof getWallpaperPool !== 'function') return;
    poolBox.innerHTML = '';
    const pool = getWallpaperPool();
    if (pool.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'pool-empty';
      empty.textContent = typeof tP === 'function' ? tP('poolEmpty') : 'Aplica un fondo para agregarlo a la rotación.';
      poolBox.appendChild(empty);
      return;
    }
    pool.forEach((url) => {
      const item = document.createElement('div');
      item.className = 'pool-item';
      const thumb = document.createElement('img');
      thumb.src = (typeof resolveWp === 'function') ? resolveWp(url) : url;
      thumb.alt = '';
      thumb.loading = 'lazy';
      const label = document.createElement('span');
      try {
        const u = new URL(url);
        label.textContent = u.hostname + u.pathname.split('/').pop().slice(0, 24);
      } catch (e) {
        label.textContent = url.slice(0, 40);
      }
      label.title = url;
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = '×';
      del.title = 'Quitar';
      del.addEventListener('click', () => {
        if (typeof saveWallpaperPool === 'function') {
          saveWallpaperPool(getWallpaperPool().filter((u) => u !== url));
        }
        renderPool();
      });
      item.appendChild(thumb);
      item.appendChild(label);
      item.appendChild(del);
      poolBox.appendChild(item);
    });
  };

  // Perfiles: inicio + lista con cambiar/renombrar/eliminar
  const getPf = () => {
    try {
      const p = JSON.parse(localStorage.getItem('profiles') || '[]');
      if (Array.isArray(p) && p.length > 0) return p;
    } catch (e) {}
    return [{ id: 'personal', name: 'Personal' }];
  };
  const savePf = (profiles) => {
    try {
      localStorage.setItem('profiles', JSON.stringify(profiles));
    } catch (e) {}
  };
  const pfActive = () => {
    try {
      return localStorage.getItem('activeProfile') || getPf()[0].id;
    } catch (e) {
      return getPf()[0].id;
    }
  };
  const pfAskText = async (msg, def) => {
    try {
      if (typeof DSDialogs !== 'undefined' && DSDialogs.prompt) {
        const v = await DSDialogs.prompt(msg, { defaultValue: def || '' });
        return v === null || v === undefined ? null : String(v);
      }
    } catch (e) {}
    const v = prompt(msg, def || '');
    return v === null ? null : String(v);
  };
  const pfAskYesNo = async (msg, title) => {
    try {
      if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
        return await DSDialogs.confirm(msg, { title: title || '' });
      }
    } catch (e) {}
    return confirm(msg);
  };
  const renderPfList = () => {
    const profiles = getPf();
    const startupSel = document.getElementById('startupProfile');
    if (startupSel) {
      startupSel.innerHTML = '';
      profiles.forEach((pf) => {
        const o = document.createElement('option');
        o.value = pf.id;
        o.textContent = pf.name;
        startupSel.appendChild(o);
      });
      let startup = null;
      try {
        startup = localStorage.getItem('startupProfile');
      } catch (e) {}
      startupSel.value = (startup && profiles.some((p) => p.id === startup)) ? startup : profiles[0].id;
    }
    const box = document.getElementById('pfList');
    if (!box) return;
    box.innerHTML = '';
    const active = pfActive();
    profiles.forEach((pf) => {
      const item = document.createElement('div');
      item.className = 'pool-item';
      const uimg = document.createElement('img');
      uimg.src = '../assets/Texturas/UI/Usuario.svg';
      uimg.alt = '';
      uimg.style.objectFit = 'contain';
      const label = document.createElement('span');
      label.textContent = pf.name + (pf.id === active ? ' ✓' : '');
      label.title = pf.name;
      const use = document.createElement('button');
      use.type = 'button';
      use.textContent = '→';
      use.title = typeof tP === 'function' ? tP('pfUse') : 'Usar';
      use.addEventListener('click', () => {
        try {
          localStorage.setItem('activeProfile', pf.id);
        } catch (e) {}
        renderPfList();
      });
      const rn = document.createElement('button');
      rn.type = 'button';
      rn.textContent = 'E';
      rn.title = typeof tP === 'function' ? tP('pfRenameTitle') : 'Renombrar';
      rn.addEventListener('click', async () => {
        const name = await pfAskText(typeof tP === 'function' ? tP('pfRename') : 'Nuevo nombre:', pf.name);
        if (!name || !name.trim()) return;
        pf.name = name.trim().slice(0, 20);
        savePf(profiles);
        renderPfList();
        setTimeout(() => {
          try {
            window.location.reload();
          } catch (e2) {}
        }, 350);
      });
      item.appendChild(use);
      item.appendChild(rn);
      if (profiles.length > 1) {
        const del = document.createElement('button');
        del.type = 'button';
        del.textContent = '×';
        del.title = typeof tP === 'function' ? tP('pfDeleteTitle') : 'Eliminar';
        del.addEventListener('click', async () => {
          const msg = (typeof tP === 'function' ? tP('pfDelete') : '¿Eliminar el perfil "{name}" y todos sus enlaces?').replace('{name}', pf.name);
          if (!(await pfAskYesNo(msg, pf.name))) return;
          const rest = profiles.filter((p) => p.id !== pf.id);
          savePf(rest);
          try {
            localStorage.removeItem('shortcuts_' + pf.id);
            localStorage.removeItem('shortcutCategories_' + pf.id);
            localStorage.removeItem('selectedCat_' + pf.id);
            if (localStorage.getItem('activeProfile') === pf.id) {
              localStorage.setItem('activeProfile', rest[0].id);
            }
            if (localStorage.getItem('startupProfile') === pf.id) {
              localStorage.setItem('startupProfile', rest[0].id);
            }
          } catch (e) {}
          renderPfList();
          setTimeout(() => {
            try {
              window.location.reload();
            } catch (e2) {}
          }, 350);
        });
        item.appendChild(del);
      }
      box.appendChild(item);
    });
  };
  const startupSel = document.getElementById('startupProfile');
  if (startupSel) startupSel.addEventListener('change', () => {
    try {
      localStorage.setItem('startupProfile', startupSel.value);
    } catch (e) {}
  });
  const pfCreateBtn = document.getElementById('btn-pf-create');
  if (pfCreateBtn) pfCreateBtn.addEventListener('click', async () => {
    const name = await pfAskText(typeof tP === 'function' ? tP('pfCreate') : 'Nombre del perfil:', '');
    if (!name || !name.trim()) return;
    const profiles = getPf();
    const id = 'p' + Date.now();
    profiles.push({ id, name: name.trim().slice(0, 20) });
    savePf(profiles);
    try {
      localStorage.setItem('activeProfile', id);
      // El perfil nuevo elige su tema y motor con el tutorial (en el inicio).
      localStorage.setItem('ds_onboard_step', '1');
    } catch (e) {}
    renderPfList();
    // El perfil nuevo elige su tema en el inicio: ir allá para el tutorial.
    setTimeout(() => {
      try {
        window.location.href = '../Index.html';
      } catch (e2) {}
    }, 350);
  });
  const pfResetBtn = document.getElementById('btn-pf-reset');
  if (pfResetBtn) pfResetBtn.addEventListener('click', async () => {
    const msg = typeof tP === 'function' ? tP('pfResetMsg') : '¿Volver al perfil único Personal? Se respetan las opciones de mantener.';
    const title = typeof tP === 'function' ? tP('pfReset') : 'Restablecer perfiles';
    if (!(await pfAskYesNo(msg, title))) return;
    const keepLinksEl = document.getElementById('keepLinks');
    const keepLinks = keepLinksEl ? keepLinksEl.checked : true;
    try {
      if (!keepLinks) {
        const gone = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.indexOf('shortcuts_') === 0 || k.indexOf('shortcutCategories_') === 0 || k.indexOf('selectedCat_') === 0)) gone.push(k);
        }
        gone.forEach((k) => localStorage.removeItem(k));
        localStorage.removeItem('shortcuts');
        localStorage.removeItem('shortcutCategories');
        localStorage.removeItem('selectedCat');
      }
      localStorage.setItem('profiles', JSON.stringify([{ id: 'personal', name: 'Personal' }]));
      localStorage.setItem('activeProfile', 'personal');
      localStorage.setItem('startupProfile', 'personal');
    } catch (e) {}
    renderPfList();
    setTimeout(() => {
      try {
        window.location.reload();
      } catch (e2) {}
    }, 350);
  });

  // Copia de seguridad: exportar/importar todos los datos
  const BACKUP_KEYS = [
    'darkSnowFConfig', 'wallpaper', 'wallpaperSize', 'wallpaperWidth', 'wallpaperHeight',
    'wallpaperAnimated', 'wallpaperPool', 'shortcuts', 'shortcutCategories', 'selectedCat',
    'profiles', 'activeProfile', 'startupProfile', 'profilesMigrated', 'preferredSearchEngine'
  ];
  const dynamicKeys = () => {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.indexOf('shortcuts_') === 0 || k.indexOf('shortcutCategories_') === 0 || k.indexOf('selectedCat_') === 0) && BACKUP_KEYS.indexOf(k) === -1) {
          out.push(k);
        }
      }
    } catch (e) {}
    return out;
  };
  const backupExport = document.getElementById('btn-export');
  if (backupExport) backupExport.addEventListener('click', async () => {
    const data = {};
    BACKUP_KEYS.concat(dynamicKeys()).forEach((k) => {
      try {
        const v = localStorage.getItem(k);
        if (v !== null) data[k] = v;
      } catch (e) {}
    });
    const blob = new Blob([JSON.stringify({ app: 'darksnowf', v: 1, data })], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'darksnowf-copia.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        URL.revokeObjectURL(a.href);
        a.remove();
      } catch (e) {}
    }, 1000);
    await showInfo('backupSaved', 'Copia guardada. Guárdala para restaurar tras reinstalar.', 'cfgTitle', 'Configuración');
  });
  const backupImportBtn = document.getElementById('btn-import');
  const backupFile = document.getElementById('backup-file');
  if (backupImportBtn && backupFile) {
    backupImportBtn.addEventListener('click', () => backupFile.click());
    backupFile.addEventListener('change', () => {
      const f = backupFile.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (!parsed || parsed.app !== 'darksnowf' || typeof parsed.data !== 'object') {
            throw new Error('bad backup');
          }
          Object.keys(parsed.data).forEach((k) => {
            try {
              localStorage.setItem(k, parsed.data[k]);
            } catch (e) {}
          });
          await showInfo('backupLoaded', 'Copia cargada. Se recargará la página.', 'cfgTitle', 'Configuración');
          location.reload();
        } catch (e) {
          await showInfo('backupBad', 'Archivo inválido: no es una copia de DarkSnowF.', 'cfgTitle', 'Configuración');
        }
        backupFile.value = '';
      };
      reader.readAsText(f);
    });
  }
  renderPfList();
  const rotBox = document.getElementById('rotWallpaper');
  if (rotBox) rotBox.addEventListener('change', () => {
    if (rotBox.checked && typeof getWallpaperPool === 'function' && getWallpaperPool().length === 0) {
      if (typeof saveWallpaperPool === 'function') saveWallpaperPool(PRESET_URLS.slice());
      renderPool();
    }
  });
  const poolAdd = document.getElementById('btn-pool-add');
  if (poolAdd) poolAdd.addEventListener('click', () => {
    const cur = localStorage.getItem('wallpaper');
    if (cur && (/^https?:/i.test(cur) || /^assets\//i.test(cur)) && typeof trackWallpaper === 'function') {
      trackWallpaper(cur);
      renderPool();
    }
  });
  renderPool();

  // Idioma ES/EN
  const langBtn = document.getElementById('btn-lang');
  if (langBtn) langBtn.addEventListener('click', () => {
    let s = {};
    try { s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}'); } catch (e) { s = {}; }
    s.lang = (s.lang === 'en') ? 'es' : 'en';
    localStorage.setItem('darkSnowFConfig', JSON.stringify(s));
    location.reload();
  });
}

function refreshLangLabel(lang) {
  const el = document.getElementById('lang-label');
  if (el) el.textContent = lang === 'en' ? 'Idioma: EN' : 'Idioma: ES';
}

function updateZoomLabel(z) {
  const el = document.getElementById('zoom-value');
  if (el) el.textContent = Math.round(z * 100) + '%';
  const target = document.querySelector('.main-container, .container, main') || document.body;
  target.style.zoom = z;
}

function loadSettingsIntoControls() {
  const settings = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };
  const setChecked = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.checked = val;
  };

  setVal('theme', (typeof window.DSPf !== 'undefined' && window.DSPf.get) ? window.DSPf.get().theme : settings.theme);
  setChecked('showParticles', settings.showParticles);
  setChecked('showClock', settings.showClock);
  setChecked('showSearch', settings.showSearch);
  setVal('fontFamily', settings.fontFamily);
  setChecked('enableClickSound', settings.enableClickSound);
  if (settings.clickVolume !== undefined) setVal('clickVolume', settings.clickVolume);
  setVal('speed', settings.animationSpeed);
  setVal('tz', settings.clockTz);
  setChecked('syncTime', settings.syncTime);
  setChecked('rotWallpaper', settings.rotateWallpaper);
  setVal('rotInterval', settings.rotateInterval || 'tab');
  setChecked('snow', settings.snow);
  setChecked('customCursor', settings.customCursor);
  setChecked('catCursors', settings.catCursors);
  setVal('clockFormat', settings.clockFormat || '24h');
  setChecked('clockSeconds', settings.clockSeconds);
  setVal('dateFormat', settings.dateFormat || 'numeric');
  updateZoomLabel(typeof settings.zoom === 'number' ? settings.zoom : 0.8);
  refreshLangLabel(settings.lang === 'en' ? 'en' : 'es');

  // Reflejar fondo actual en los controles (sin aplicarlo de nuevo)
  const curWp = localStorage.getItem('wallpaper');
  const wpPreset = document.getElementById('wpPresetCfg');
  if (wpPreset && curWp) {
    const known = Array.from(wpPreset.options).some((o) => o.value === curWp);
    if (known) wpPreset.value = curWp;
    else {
      const urlInput = document.getElementById('wpUrlCfg');
      if (urlInput) urlInput.value = curWp.startsWith('data:') ? '' : curWp;
    }
  }

  applyLocalSettings();
}

window.addEventListener('DOMContentLoaded', () => {
  bindControls();
  loadSettingsIntoControls();
});
