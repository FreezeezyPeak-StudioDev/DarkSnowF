/**
 * popup.js - Mini menú de la extensión (vistas, enlaces, ventana).
 * Sin handlers inline (compatible CSP MV3).
 */

(function () {
  const POPUP_STRINGS = {
    es: {
      networks: 'Redes',
      license: 'Licencia',
      credits: 'Créditos',
      newWindow: 'Nueva ventana',
      back: 'Atrás',
      profiles: 'Perfiles',
      soonTitle: 'Próximamente',
      soonMsg: '404 — Muy pronto, mantente al tanto.',
      infoOk: 'Entendido',
      pfCreateBtn: 'Crear perfil',
      pfRename: 'Renombrar',
      pfDelete: 'Eliminar',
      pfCreate: 'Nombre del perfil:',
      pfRenameTitle: 'Nuevo nombre:',
      pfDeleteMsg: '¿Eliminar este perfil y sus enlaces?'
    },
    en: {
      networks: 'Socials',
      license: 'License',
      credits: 'Credits',
      newWindow: 'New window',
      back: 'Back',
      profiles: 'Profiles',
      soonTitle: 'Coming soon',
      soonMsg: '404 — Coming soon, stay tuned.',
      infoOk: 'Got it',
      pfCreateBtn: 'Create profile',
      pfRename: 'Rename',
      pfDelete: 'Delete',
      pfCreate: 'Profile name:',
      pfRenameTitle: 'New name:',
      pfDeleteMsg: 'Delete this profile and its links?'
    }
  };

  function popupLang() {
    try {
      const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
      if (s.lang === 'en' || s.lang === 'es') return s.lang;
    } catch (e) {}
    // Sin elección guardada: idioma del equipo.
    if (typeof window.dsSysLang === 'function') return window.dsSysLang();
    return 'es';
  }

  function applyPopupLang() {
    const d = POPUP_STRINGS[popupLang()] || POPUP_STRINGS.es;
    document.querySelectorAll('[data-pl]').forEach((el) => {
      const k = el.getAttribute('data-pl');
      if (d[k] !== undefined) el.textContent = d[k];
    });
  }

  function readSettings() {
    try {
      return JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
    } catch (e) {
      return {};
    }
  }

  function showView(name) {
    const views = {
      main: document.querySelector('[data-view-main]'),
      redes: document.querySelector('[data-view-redes]'),
      profiles: document.querySelector('[data-view-profiles]')
    };
    Object.keys(views).forEach((k) => {
      if (!views[k]) return;
      if (k === name) views[k].classList.remove('hidden');
      else views[k].classList.add('hidden');
    });
    if (name === 'profiles') renderPfManage();
  }

  function openPage(page) {
    try {
      const url = chrome.runtime.getURL(page);
      if (chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url });
      } else {
        window.open(url, '_blank');
      }
    } catch (e) {
      window.open(page, '_blank');
    }
    window.close();
  }

  function pfGet() {
    try {
      const p = JSON.parse(localStorage.getItem('profiles') || '[]');
      if (Array.isArray(p) && p.length > 0) return p;
    } catch (e) {}
    return [{ id: 'personal', name: 'Personal' }];
  }

  function pfActive() {
    try {
      return localStorage.getItem('activeProfile') || pfGet()[0].id;
    } catch (e) {
      return pfGet()[0].id;
    }
  }

  async function pfAskText(msg, def) {
    try {
      if (typeof DSDialogs !== 'undefined' && DSDialogs.prompt) {
        const v = await DSDialogs.prompt(msg, { defaultValue: def || '' });
        return v === null || v === undefined ? null : String(v);
      }
    } catch (e) {}
    const v = prompt(msg, def || '');
    return v === null ? null : String(v);
  }

  async function pfAskYesNo(msg, title) {
    try {
      if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
        return await DSDialogs.confirm(msg, { title: title || '' });
      }
    } catch (e) {}
    return confirm(msg);
  }

  function pfT(key, fallback) {
    const d = POPUP_STRINGS[popupLang()] || POPUP_STRINGS.es;
    return d[key] !== undefined ? d[key] : fallback;
  }

  function renderPfManage() {
    const box = document.querySelector('[data-pf-manage]');
    if (!box) return;
    box.innerHTML = '';
    const profiles = pfGet();
    const active = pfActive();
    profiles.forEach((pf) => {
      const row = document.createElement('div');
      row.className = 'p-pf-row';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'p-btn p-pf' + (pf.id === active ? ' active' : '');
      const s = document.createElement('span');
      s.textContent = pf.name;
      b.appendChild(s);
      b.addEventListener('click', () => {
        try {
          localStorage.setItem('activeProfile', pf.id);
        } catch (e) {}
        renderPfManage();
      });
      const rn = document.createElement('button');
      rn.type = 'button';
      rn.className = 'p-mini p-icon';
      rn.title = pfT('pfRename', 'Renombrar');
      const rnImg = document.createElement('img');
      rnImg.src = 'assets/Texturas/UI/Editar.svg';
      rnImg.alt = '';
      rn.appendChild(rnImg);
      rn.addEventListener('click', () => {
        startInlineRename(box, pf, profiles);
      });
      row.appendChild(b);
      row.appendChild(rn);
      if (profiles.length > 1) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'p-mini p-icon';
        del.title = pfT('pfDelete', 'Eliminar');
        const delImg = document.createElement('img');
        delImg.src = 'assets/Texturas/UI/BasureroCerrado.svg';
        delImg.alt = '';
        del.appendChild(delImg);
        del.addEventListener('click', async () => {
          const msg = pfT('pfDeleteMsg', '¿Eliminar este perfil y sus enlaces?');
          if (!(await pfAskYesNo(msg, pf.name))) return;
          const rest = profiles.filter((p) => p.id !== pf.id);
          try {
            localStorage.setItem('profiles', JSON.stringify(rest));
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
          renderPfManage();
        });
        row.appendChild(del);
      }
      box.appendChild(row);
    });
  }

  // Renombrar/crear en línea, dentro del popup (sin ventanas aparte)
  function inlineEditor(box, initial, onSave) {
    box.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'p-pf-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'p-inline-input';
    input.value = initial || '';
    input.maxLength = 20;
    input.placeholder = pfT('pfCreate', 'Nombre del perfil:');
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'p-mini';
    ok.textContent = '✓';
    ok.title = 'OK';
    const no = document.createElement('button');
    no.type = 'button';
    no.className = 'p-mini';
    no.textContent = '×';
    no.title = 'X';
    const done = (save) => {
      if (save) onSave(input.value.trim());
      else renderPfManage();
    };
    ok.addEventListener('click', () => done(true));
    no.addEventListener('click', () => done(false));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') done(true);
      if (e.key === 'Escape') done(false);
    });
    row.appendChild(input);
    row.appendChild(ok);
    row.appendChild(no);
    box.appendChild(row);
    input.focus();
    input.select();
  }

  function startInlineRename(box, pf, profiles) {
    inlineEditor(box, pf.name, (name) => {
      if (name) {
        pf.name = name.slice(0, 20);
        try {
          localStorage.setItem('profiles', JSON.stringify(profiles));
        } catch (e) {}
      }
      renderPfManage();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
      const link = e.target && e.target.closest ? e.target.closest('[data-coming-soon]') : null;
      if (!link) return;
      e.preventDefault();
      try {
        const d = POPUP_STRINGS[popupLang()] || POPUP_STRINGS.es;
        if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
          DSDialogs.confirm(d.soonMsg, { title: d.soonTitle, confirmText: d.infoOk || 'OK' });
        }
      } catch (err) {}
    });
    const goRedes = document.querySelector('[data-go-redes]');
    const goMain = document.querySelector('[data-go-main]');
    const goMain2 = document.querySelector('[data-go-main2]');
    const goProfiles = document.querySelector('[data-go-profiles]');
    if (goRedes) goRedes.addEventListener('click', () => showView('redes'));
    if (goMain) goMain.addEventListener('click', () => showView('main'));
    if (goMain2) goMain2.addEventListener('click', () => showView('main'));
    if (goProfiles) goProfiles.addEventListener('click', () => showView('profiles'));

    const pfCreate = document.querySelector('[data-pf-create]');
    if (pfCreate) pfCreate.addEventListener('click', () => {
      const box = document.querySelector('[data-pf-manage]');
      if (!box) return;
      inlineEditor(box, '', (name) => {
        if (name) {
          const profiles = pfGet();
          const id = 'p' + Date.now();
          profiles.push({ id, name: name.slice(0, 20) });
          try {
            localStorage.setItem('profiles', JSON.stringify(profiles));
            localStorage.setItem('activeProfile', id);
            // El perfil nuevo elige su tema y motor con el tutorial (en el inicio).
            localStorage.setItem('ds_onboard_step', '1');
          } catch (e) {}
        }
        renderPfManage();
      });
    });

    const lic = document.querySelector('[data-open-license]');
    const cred = document.querySelector('[data-open-credits]');
    if (lic) lic.addEventListener('click', () => openPage('pages/License.html'));
    if (cred) cred.addEventListener('click', () => openPage('pages/credit.html'));

    const win = document.querySelector('[data-new-window]');
    if (win) {
      win.addEventListener('click', () => {
        let opened = false;
        try {
          const url = chrome.runtime.getURL('Index.html');
          if (chrome.windows && chrome.windows.create) {
            const p = chrome.windows.create({ url: url, focused: true, type: 'normal' });
            opened = true;
            if (p && typeof p.catch === 'function') {
              p.catch(() => {
                try {
                  chrome.tabs.create({ url: url });
                } catch (e2) {}
              });
            }
          } else if (chrome.tabs && chrome.tabs.create) {
            chrome.tabs.create({ url: url });
            opened = true;
          }
        } catch (e) {
          try {
            chrome.tabs.create({ url: chrome.runtime.getURL('Index.html') });
            opened = true;
          } catch (e2) {}
        }
        setTimeout(window.close, 200);
      });
    }

    applyPopupLang();
  });
})();
