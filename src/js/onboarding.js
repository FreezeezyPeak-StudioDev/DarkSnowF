/**
 * onboarding.js - Bienvenida: tema, motor de búsqueda y funciones.
 * Sale siempre al instalar/actualizar (versión distinta) y al crear un
 * Los pasos se aplican en vivo; solo el final recarga.
 * Omitir deja todo recomendado (tema por defecto + DuckDuckGo).
 */
(function onboarding() {
  const ov = document.querySelector('[data-onboard]');
  if (!ov) return;

  const ENGINES = ['google', 'bing', 'duckduckgo', 'chatgpt', 'wikipedia', 'perplexity', 'claude', 'mistral', 'gemini'];
  const NAMES = {
    google: 'Google', bing: 'Bing', duckduckgo: 'DuckDuckGo', chatgpt: 'ChatGPT',
    wikipedia: 'Wikipedia ES', perplexity: 'Perplexity IA',
    claude: 'Claude', mistral: 'Mistral', gemini: 'Gemini'
  };
  const RECOMMENDED = { theme: 'dark', engine: 'duckduckgo' };

  const tr = (k, fb) => {
    try {
      if (typeof window.t === 'function') {
        const v = window.t(k);
        if (v && v !== k) return v;
      }
    } catch (e) {}
    return fb;
  };

  const pfGet = () => {
    try {
      if (typeof window.DSPf !== 'undefined' && window.DSPf.get) return window.DSPf.get();
    } catch (e) {}
    return { theme: RECOMMENDED.theme, engine: RECOMMENDED.engine };
  };
  const pfSet = (patch) => {
    try {
      if (typeof window.DSPf !== 'undefined' && window.DSPf.set) {
        window.DSPf.set(window.DSPf.activeId(), patch || {});
      }
    } catch (e) {}
  };

  // Motores del paso 2 (preselección: perfil o recomendado)
  const engBox = ov.querySelector('[data-ob-engines]');
  let pickedEngine = pfGet().engine || RECOMMENDED.engine;
  if (engBox) {
    engBox.innerHTML = '';
    ENGINES.forEach((id) => {
      const lab = document.createElement('label');
      lab.className = 'ob-engine' + (id === 'duckduckgo' ? ' ob-rec' : '');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'ob-engine';
      radio.value = id;
      radio.checked = id === pickedEngine;
      radio.addEventListener('change', () => { pickedEngine = id; });
      const name = document.createElement('span');
      name.textContent = NAMES[id] || id;
      lab.appendChild(radio);
      lab.appendChild(name);
      if (id === 'duckduckgo') {
        const star = document.createElement('em');
        star.textContent = ' ★';
        lab.appendChild(star);
      }
      engBox.appendChild(lab);
    });
  }

  const show = (n) => {
    ov.querySelectorAll('[data-ob-step]').forEach((s) => {
      s.hidden = s.getAttribute('data-ob-step') !== String(n);
    });
  };

  const open = (step) => {
    try { ov.removeAttribute('hidden'); } catch (e) {}
    ov.classList.add('active');
    show(step || 1);
  };
  const close = () => {
    ov.classList.remove('active');
    try { ov.setAttribute('hidden', ''); } catch (e) {}
  };

  const reloadVerified = () => {
    try {
      if (typeof window.dsReloadVerified === 'function') window.dsReloadVerified();
      else location.reload();
    } catch (e) {}
  };

  const saveStep = (n) => {
    try { localStorage.setItem('ds_onboard_step', String(n)); } catch (e) {}
  };

  const applyThemeLive = (name) => {
    let link = document.getElementById('theme-link');
    if (name === 'dark') {
      if (link && link.parentNode) link.parentNode.removeChild(link);
      return;
    }
    if (link) {
      link.href = 'themes/' + name + '.css';
    } else {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'theme-link';
      link.href = 'themes/' + name + '.css';
      document.head.appendChild(link);
    }
  };

  const paintEngineLive = (engine) => {
    try {
      document.querySelectorAll('[data-engine]').forEach((opt) => {
        opt.classList.toggle('active', opt.dataset.engine === engine);
      });
      const nameSpan = document.querySelector('[data-engine-name]');
      if (nameSpan) nameSpan.textContent = NAMES[engine] || engine;
      const input = document.querySelector('[data-search]');
      if (input) input.placeholder = tr('searchWith', 'Buscar con ') + (NAMES[engine] || engine);
    } catch (e) {}
  };

  // Paso 1: tema del perfil en vivo, sin recargar.
  ov.querySelectorAll('[data-ob-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
      pfSet({ theme: btn.getAttribute('data-ob-theme') || RECOMMENDED.theme });
      applyThemeLive(btn.getAttribute('data-ob-theme') || RECOMMENDED.theme);
      saveStep(2);
      show(2);
    });
  });

  // Paso 1: omitir todo → recomendado → paso 3, sin recargar.
  const skipAll = ov.querySelector('[data-ob-skip-all]');
  if (skipAll) skipAll.addEventListener('click', () => {
    pfSet({ theme: RECOMMENDED.theme, engine: RECOMMENDED.engine });
    applyThemeLive(RECOMMENDED.theme);
    pickedEngine = RECOMMENDED.engine;
    paintEngineLive(pickedEngine);
    saveStep(3);
    show(3);
  });

  // Paso 2: motor del perfil en vivo, sin recargar.
  const nextBtn = ov.querySelector('[data-ob-next]');
  if (nextBtn) nextBtn.addEventListener('click', () => {
    pfSet({ engine: pickedEngine || RECOMMENDED.engine });
    paintEngineLive(pickedEngine || RECOMMENDED.engine);
    saveStep(3);
    show(3);
  });

  // Paso 2: omitir → motor recomendado → paso 3, sin recargar.
  const skipBtn = ov.querySelector('[data-ob-skip]');
  if (skipBtn) skipBtn.addEventListener('click', () => {
    pickedEngine = RECOMMENDED.engine;
    pfSet({ engine: RECOMMENDED.engine });
    paintEngineLive(pickedEngine);
    saveStep(3);
    show(3);
  });

  // Paso 3: terminar → marca versión instalada y recarga limpio.
  const finishBtn = ov.querySelector('[data-ob-finish]');
  if (finishBtn) finishBtn.addEventListener('click', () => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      try {
        localStorage.setItem('ds_onboarded', '1');
        localStorage.removeItem('ds_onboard_step');
      } catch (e) {}
      reloadVerified();
    };
    try {
      fetch('manifest.json', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((m) => {
          try {
            if (m && m.version) localStorage.setItem('ds_build', String(m.version));
          } catch (e) {}
          done();
        })
        .catch(done);
      setTimeout(done, 1500);
    } catch (e) {
      done();
    }
  });

  // Releer desde Ayuda
  const guideBtn = document.querySelector('[data-help-guide]');
  if (guideBtn) guideBtn.addEventListener('click', () => {
    try {
      const help = document.querySelector('[data-help-modal]');
      if (help) help.classList.remove('active');
    } catch (e) {}
    open(1);
  });

  // Cuándo salir: paso pendiente, primera vez o versión nueva instalada.
  const pending = (() => {
    try {
      const n = parseInt(localStorage.getItem('ds_onboard_step') || '', 10);
      return n >= 1 && n <= 3 ? n : 0;
    } catch (e) {
      return 0;
    }
  })();
  if (pending) {
    window.addEventListener('load', () => {
      setTimeout(() => { open(pending); }, 700);
    });
  } else {
    let done = false;
    try { done = localStorage.getItem('ds_onboarded') === '1'; } catch (e) {}
    const checkBuild = () => {
      try {
        fetch('manifest.json', { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((m) => {
            let seen = null;
            try { seen = localStorage.getItem('ds_build'); } catch (e) {}
            const cur = m && m.version ? String(m.version) : null;
            // Instalación/actualización nueva: preguntar el tema siempre.
            if (!done || (cur && seen !== cur)) {
              setTimeout(() => { open(1); }, 700);
            }
          })
          .catch(() => { if (!done) setTimeout(() => { open(1); }, 700); });
      } catch (e) {
        if (!done) setTimeout(() => { open(1); }, 700);
      }
    };
    window.addEventListener('load', checkBuild);
  }

  window.DSOnboard = { open, close };
})();
