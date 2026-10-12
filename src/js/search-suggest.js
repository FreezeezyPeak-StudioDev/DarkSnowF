/**
 * search-suggest.js - Predicciones al escribir en el buscador.
 * Usa la API de sugerencias del motor activo (Google, Bing, DuckDuckGo,
 * Wikipedia ES). Los motores de IA no tienen sugerencias.
 * Sin permisos extra: si el navegador bloquea la petición, no se muestra nada.
 */
(function searchSuggest() {
  const input = document.querySelector('[data-search]');
  const wrapper = document.querySelector('.search-wrapper');
  if (!input || !wrapper) return;

  const box = document.createElement('div');
  box.className = 'search-suggest';
  box.hidden = true;
  wrapper.appendChild(box);

  const ENGINE_URLS = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    chatgpt: 'https://chat.openai.com/?q=',
    wikipedia: 'https://es.wikipedia.org/wiki/Special:Search?search=',
    perplexity: 'https://www.perplexity.ai/search?q=',
    claude: 'https://claude.ai/new?q=',
    mistral: 'https://chat.mistral.ai/chat',
    gemini: 'https://www.google.com/search?udm=50&q='
  };

  const activeEngine = () => {
    try {
      const a = document.querySelector('.search-engine-option.active');
      if (a && a.dataset.engine) return a.dataset.engine;
      if (typeof window.DSPf !== 'undefined' && window.DSPf.get) return window.DSPf.get().engine || 'duckduckgo';
      return localStorage.getItem('preferredSearchEngine') || 'duckduckgo';
    } catch (e) {
      return 'duckduckgo';
    }
  };

  // Caché local de sugerencias (memoria + localStorage con TTL):
  // evita repetir la misma petición y reduce el consumo de internet.
  const SUG_TTL = 6 * 60 * 60 * 1000;
  const SUG_MAX = 60;
  const sugMem = new Map();
  const sugLeerDisco = (clave) => {
    try {
      const crudo = localStorage.getItem('ds_suggest_' + clave);
      if (!crudo) return null;
      const obj = JSON.parse(crudo);
      if (!obj || !Array.isArray(obj.lista) || (Date.now() - (obj.ts || 0)) > SUG_TTL) {
        try { localStorage.removeItem('ds_suggest_' + clave); } catch (e2) {}
        return null;
      }
      return obj.lista;
    } catch (e) {
      return null;
    }
  };
  const sugGuardarDisco = (clave, lista) => {
    try {
      localStorage.setItem('ds_suggest_' + clave, JSON.stringify({ ts: Date.now(), lista: lista }));
    } catch (e) {
      // Sin espacio: vaciar cachés viejas de sugerencias para no romper nada.
      try {
        const viejas = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.indexOf('ds_suggest_') === 0) viejas.push(k);
        }
        viejas.slice(0, Math.max(1, viejas.length - SUG_MAX + 1)).forEach((k) => {
          try { localStorage.removeItem(k); } catch (e2) {}
        });
      } catch (e2) {}
    }
  };
  const sugClave = (engine, q) => (engine + '|' + q.trim().toLowerCase()).slice(0, 80);
  const sugDesdeCache = (engine, q) => {
    const clave = sugClave(engine, q);
    if (sugMem.has(clave)) return sugMem.get(clave);
    const disco = sugLeerDisco(clave);
    if (disco) {
      if (sugMem.size > SUG_MAX) sugMem.clear();
      sugMem.set(clave, disco);
    }
    return disco;
  };
  const sugACache = (engine, q, lista) => {
    const clave = sugClave(engine, q);
    if (sugMem.size > SUG_MAX) sugMem.clear();
    sugMem.set(clave, lista);
    sugGuardarDisco(clave, lista);
  };

  // Controlador de la petición en curso: se aborta al seguir escribiendo
  // para no malgastar ancho de banda en respuestas que se van a descartar.
  let ctrlEnCurso = null;
  const withTimeout = (ms) => {
    try { if (ctrlEnCurso) ctrlEnCurso.abort(); } catch (e) {}
    const c = new AbortController();
    ctrlEnCurso = c;
    const t = setTimeout(() => { try { c.abort(); } catch (e) {} }, ms);
    return { signal: c.signal, done: () => { clearTimeout(t); if (ctrlEnCurso === c) ctrlEnCurso = null; } };
  };

  const fetchJson = async (url, ms) => {
    const t = withTimeout(ms || 3500);
    try {
      const r = await fetch(url, { signal: t.signal, credentials: 'omit' });
      t.done();
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      t.done();
      return null;
    }
  };

  let bingSeq = 0;
  const bingSuggest = (q, ms) => new Promise((resolve) => {
    const id = 'dsBingCb' + (++bingSeq) + '_' + Date.now();
    const done = (list) => {
      try { delete window[id]; } catch (e) {}
      try { if (sc && sc.parentNode) sc.parentNode.removeChild(sc); } catch (e) {}
      resolve(list || []);
    };
    const to = setTimeout(() => done([]), ms || 3500);
    window[id] = (d) => {
      clearTimeout(to);
      try {
        const s = d && d.AS && d.AS.Results && d.AS.Results[0] && d.AS.Results[0].Suggests;
        done((s || []).map((x) => x.Txt).filter(Boolean));
      } catch (e) {
        done([]);
      }
    };
    const sc = document.createElement('script');
    sc.src = 'https://api.bing.com/qsonhs.aspx?type=cb&cb=' + id + '&q=' + encodeURIComponent(q);
    sc.onerror = () => { clearTimeout(to); done([]); };
    document.head.appendChild(sc);
  });

  const fetchSuggest = async (engine, q) => {
    try {
      const enCache = sugDesdeCache(engine, q);
      if (enCache) return enCache;
      let lista = [];
      if (engine === 'google') {
        const d = await fetchJson('https://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(q));
        lista = Array.isArray(d) && Array.isArray(d[1]) ? d[1].filter((x) => typeof x === 'string') : [];
      } else if (engine === 'duckduckgo') {
        const d = await fetchJson('https://duckduckgo.com/ac/?q=' + encodeURIComponent(q) + '&type=list');
        if (Array.isArray(d) && Array.isArray(d[1])) {
          lista = d[1].map((x) => (typeof x === 'string' ? x : x && x.phrase)).filter(Boolean);
        }
      } else if (engine === 'wikipedia') {
        const d = await fetchJson('https://es.wikipedia.org/w/api.php?action=opensearch&search=' + encodeURIComponent(q) + '&limit=8&namespace=0&format=json&origin=*');
        lista = Array.isArray(d) && Array.isArray(d[1]) ? d[1].filter((x) => typeof x === 'string') : [];
      } else if (engine === 'bing') {
        lista = await bingSuggest(q);
      }
      sugACache(engine, q, lista);
      return lista;
    } catch (e) {}
    return [];
  };

  let items = [];
  let hi = -1;
  let timer = 0;
  let seq = 0;

  const close = () => {
    box.hidden = true;
    items = [];
    hi = -1;
  };

  const paint = () => {
    Array.from(box.children).forEach((b, i) => {
      b.classList.toggle('hl', i === hi);
    });
  };

  const doSearch = (text) => {
    const query = String(text || '').trim();
    if (!query) return;
    close();
    const engine = activeEngine();
    const urlPattern = /^(https?:\/\/)|(www\.)/i;
    if (urlPattern.test(query)) {
      window.location.href = query.startsWith('http') ? query : 'https://' + query;
      return;
    }
    if (engine === 'mistral') {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(query).catch(() => {});
        }
      } catch (e) {}
      window.location.href = ENGINE_URLS.mistral;
      return;
    }
    window.location.href = (ENGINE_URLS[engine] || ENGINE_URLS.duckduckgo) + encodeURIComponent(query);
  };

  const render = (list) => {
    box.innerHTML = '';
    items = (list || []).slice(0, 8);
    hi = -1;
    if (!items.length) {
      close();
      return;
    }
    items.forEach((text, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = text;
        doSearch(text);
      });
      box.appendChild(b);
    });
    box.hidden = false;
  };

  input.addEventListener('input', () => {
    close();
    const q = input.value.trim();
    if (q.length < 2) {
      // Sin texto útil: abortar la petición en curso para no gastar datos.
      try { if (ctrlEnCurso) ctrlEnCurso.abort(); } catch (e) {}
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const my = ++seq;
      const list = await fetchSuggest(activeEngine(), q);
      if (my !== seq) return;
      if (document.activeElement !== input) return;
      if (input.value.trim() !== q) return;
      render(list);
    }, 250);
  });

  input.addEventListener('blur', () => {
    setTimeout(close, 150);
  });

  document.querySelectorAll('[data-engine]').forEach((o) => {
    o.addEventListener('click', close);
  });

  // Captura a nivel documento: corre antes que el Enter del buscador.
  document.addEventListener('keydown', (e) => {
    if (e.target !== input || box.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      hi = e.key === 'ArrowDown'
        ? (hi + 1) % items.length
        : (hi - 1 + items.length) % items.length;
      paint();
    } else if (e.key === 'Enter' && hi >= 0 && items[hi]) {
      e.preventDefault();
      e.stopPropagation();
      input.value = items[hi];
      doSearch(items[hi]);
    }
  }, true);
})();
