/**
 * cat-remote.js - Gatos en vivo desde CatCursorF (sin texturas locales).
 * Pide las URLs por mensaje externo y las aplica con especificidad alta,
 * para que prevalezcan sobre otros estilos.
 * Estricto: sin CatCursorF no hay gatos.
 * Sin dependencias. Cargar antes de config-loader.js y config-page.js.
 * Globales: requestCatCursors, applyCatCursors, clearCatCursors.
 */

const CATCURSOR_ID = 'catcursorf@freezeezypeak.local';

const CAT_HOTSPOTS = {
  normal: [0, 1],
  link: [0, 1],
  texto: [0, 8],
  ayuda: [0, 1],
  pluma: [0, 1],
  precision: [0, 10],
  no: [0, 28],
  vertical: [0, 10]
};

function requestCatCursors(timeoutMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (urls) => {
      if (done) return;
      done = true;
      resolve(urls);
    };
    const timer = setTimeout(() => finish(null), timeoutMs || 2500);
    try {
      let api = null;
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        api = chrome.runtime;
      } else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
        api = browser.runtime;
      }
      if (!api) {
        clearTimeout(timer);
        finish(null);
        return;
      }
      const res = api.sendMessage(CATCURSOR_ID, { type: 'darksnowf-get-cursors' });
      if (res && typeof res.then === 'function') {
        res.then((resp) => {
          clearTimeout(timer);
          finish(extractCatUrls(resp));
        }, () => {
          clearTimeout(timer);
          finish(null);
        });
      }
      // Sin promesa (callback), el timeout decide.
    } catch (e) {
      clearTimeout(timer);
      finish(null);
    }
  });
}

function extractCatUrls(resp) {
  try {
    const c = resp && resp.cursores ? resp.cursores : null;
    if (!c || typeof c.normal !== 'string' || typeof c.link !== 'string' || typeof c.texto !== 'string') {
      return null;
    }
    return c;
  } catch (e) {
    return null;
  }
}

function applyCatCursors(urls) {
  if (!urls) return false;
  let st = document.getElementById('ds-cats-win');
  if (!st) {
    st = document.createElement('style');
    st.id = 'ds-cats-win';
    document.head.appendChild(st);
  }
  const u = (key, fb) => {
    const url = urls[key];
    if (typeof url !== 'string' || !url) return fb;
    const hs = CAT_HOTSPOTS[key] || [0, 0];
    return "url('" + url + "') " + hs[0] + ' ' + hs[1];
  };
  st.textContent =
    'html body,html body *,html body *:hover,html body *:active,html body *:focus{cursor:' + u('normal', 'auto') + ',auto !important;}' +
    "html body a,html body a *,html body a:hover,html body a:active,html body a:focus,html body button,html body button *,html body button:hover,html body button:active,html body button:focus,html body [role='button'],html body [role='button'] *,html body [role='button']:hover,html body [role='button']:active,html body [data-engine],html body [data-engine]:hover,html body [data-engine]:active{cursor:" + u('link', 'pointer') + ',pointer !important;}' +
    "html body input[type='text'],html body input[type='text']:hover,html body input[type='text']:focus,html body input[type='search'],html body input[type='search']:hover,html body input[type='search']:focus,html body textarea,html body textarea:hover,html body textarea:focus{cursor:" + u('texto', 'text') + ',text !important;}';
  return true;
}

function clearCatCursors() {
  const st = document.getElementById('ds-cats-win');
  if (st && st.parentNode) st.parentNode.removeChild(st);
}
