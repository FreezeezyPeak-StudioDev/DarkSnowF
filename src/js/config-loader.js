// Cargar y aplicar configuraciones guardadas
(function() {
  // La página cargó: la recarga solicitada se completó.
  try { sessionStorage.removeItem('ds_reloading'); } catch (e) {}
  // Recarga verificada: si la página sigue viva, falló → se pide manual.
  window.dsReloadVerified = function dsReloadVerified() {
    try { sessionStorage.setItem('ds_reloading', '1'); } catch (e) {}
    try { location.reload(); } catch (e) {}
    setTimeout(() => {
      let lang = 'es';
      try {
        const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
        lang = s.lang === 'en' ? 'en' : 'es';
      } catch (e) {}
      const en = lang === 'en';
      const msg = en
        ? 'Automatic reload failed. Reload the page manually to see the changes.'
        : 'No se pudo recargar automáticamente. Recarga la página manualmente para ver los cambios.';
      const title = en ? 'Reload' : 'Recargar';
      const ok = en ? 'Got it' : 'Entendido';
      try {
        if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
          DSDialogs.confirm(msg, { title, confirmText: ok });
        } else {
          alert(msg);
        }
      } catch (e2) {}
    }, 2500);
  };
  const settings = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
  const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
  const assetUrl = (path) => new URL(`../../assets/${path}`, scriptUrl).href;
  const themeUrl = (theme) => new URL(`../../themes/${theme}.css`, scriptUrl).href;

  console.log('Configuraciones cargadas:', settings);

  // ==================== TIPOGRAFÍA ====================
  if (settings.fontFamily) {
    document.body.style.fontFamily = settings.fontFamily;
    console.log('Tipografía aplicada:', settings.fontFamily);
  }

  // ==================== RELOJ ====================
  const clock = document.querySelector('.clock-corner');
  if (clock) {
    if (settings.showClock === false) {
      clock.style.display = 'none';
      console.log('Reloj oculto');
    } else {
      clock.style.display = 'block';
      console.log('Reloj visible');
    }
  }

  // ==================== BÚSQUEDA ====================
  const search = document.querySelector('.search-container');
  if (search) {
    if (settings.showSearch === false) {
      search.style.display = 'none';
      console.log('Búsqueda oculta');
    } else {
      search.style.display = 'block';
      console.log('Búsqueda visible');
    }
  }

  // ==================== TEMA (por perfil) ====================
  const pfTheme = (typeof window.DSPf !== 'undefined' && window.DSPf.get) ? window.DSPf.get().theme : (settings.theme || 'dark');
  if (pfTheme && pfTheme !== 'dark') {
    const themeLink = document.createElement('link');
    themeLink.rel = 'stylesheet';
    themeLink.href = themeUrl(pfTheme);
    themeLink.id = 'theme-link';
    document.head.appendChild(themeLink);
    console.log('Tema aplicado:', pfTheme);
  }

  // ==================== VELOCIDAD DE ANIMACIÓN ====================
  if (settings.animationSpeed) {
    const speeds = {
      'slow': '0.6s',
      'normal': '0.3s',
      'fast': '0.15s'
    };
    
    const duration = speeds[settings.animationSpeed] || '0.3s';
    const style = document.createElement('style');
    style.id = 'speed-style';
    style.textContent = `* { transition-duration: ${duration} !important; }`;
    document.head.appendChild(style);
    console.log('Velocidad aplicada:', settings.animationSpeed);
  }

  // ==================== PARTÍCULAS ====================
  if (settings.showParticles === true) {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 51, 102, 0.3)';
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    
    console.log('Partículas activadas');
  } else {
    console.log('Partículas desactivadas');
  }

  // ==================== AUDIO (solo clic) ====================
  if (settings.enableClickSound !== false) {
    const clickableSelector = 'a, button, input, select, textarea, label, .btn, .shortcut-card, .sidebar-button, [data-engine], [role="button"]';
    let lastClickSound = 0;
    document.addEventListener('click', (e) => {
      if (e.target.closest(clickableSelector)) {
        const now = Date.now();
        if (now - lastClickSound < 180) return; // un solo clic (label+input disparan dos)
        lastClickSound = now;
        const clickSound = new Audio(assetUrl('Fx/Click2.mp3'));
        clickSound.volume = settings.clickVolume || 0.35;
        clickSound.play().catch(e => console.log('Sonido no disponible'));
      }
    });
    console.log('Sonidos de click habilitados');
  }

  // ==================== ZOOM (80% por defecto; el menú queda al 100%) ====================
  // Se aplica al contenido (.main-container / .container), nunca al menú flotante
  const zoomValue = (typeof settings.zoom === 'number') ? settings.zoom : 0.8;
  const zoomTarget = document.querySelector('.main-container, .container, main') || document.body;
  zoomTarget.style.zoom = zoomValue;
  console.log('Zoom aplicado:', zoomValue);

  // ==================== FONDO EN TODOS LOS HTML ====================
  // El home lo aplica en vivo; aquí se refleja en las páginas secundarias.
  // Siempre con cover/center para que no se pixele ni se deforme.
  if (!document.querySelector('[data-wallpaper-modal]')) {
    try {
      let wp = null;
      try {
        if (typeof getRotatedWallpaper === 'function') {
          wp = getRotatedWallpaper();
        }
      } catch (e) {
        wp = null;
      }
      if (!wp) wp = localStorage.getItem('wallpaper');
      if (!wp && typeof defaultWallpaper === 'function') wp = defaultWallpaper();
      if (wp && wp !== 'default') {
        const size = localStorage.getItem('wallpaperSize') || 'cover';
        const w = localStorage.getItem('wallpaperWidth');
        const h = localStorage.getItem('wallpaperHeight');
        const bg = document.createElement('div');
        bg.id = 'ds-wallpaper';
        bg.style.position = 'fixed';
        bg.style.inset = '0';
        bg.style.zIndex = '-1';
        bg.style.pointerEvents = 'none';
        const full = (typeof resolveWp === 'function') ? resolveWp(wp) : wp;
        bg.style.backgroundImage = "url('" + full + "')";
        bg.style.backgroundPosition = 'center';
        bg.style.backgroundRepeat = 'no-repeat';
        bg.style.backgroundSize = (size === 'custom' && w && h) ? (w + 'px ' + h + 'px') : 'cover';
        document.body.appendChild(bg);
        console.log('Fondo aplicado en página secundaria');
      }
    } catch (e) {}
  }

  // ==================== CURSOR ====================
  // Prioridad: desactivado > gatos en vivo (solo con CatCursorF) > azul propio.
  const cursorLinks = Array.from(document.querySelectorAll('link[href*="cursor.css"]'));
  const clearRemoteCats = () => {
    const st = document.getElementById('ds-cats-win');
    if (st && st.parentNode) st.parentNode.removeChild(st);
  };
  const neutralCursor = () => {
    cursorLinks.forEach((l) => {
      try { l.disabled = true; } catch (e) {}
    });
    clearRemoteCats();
    if (!document.getElementById('ds-cursor-off')) {
      const offStyle = document.createElement('style');
      offStyle.id = 'ds-cursor-off';
      offStyle.textContent = '* { cursor: auto !important; } a, button, input, select, textarea, label { cursor: pointer !important; }';
      document.head.appendChild(offStyle);
    }
  };
  const blueCursor = () => {
    clearRemoteCats();
    const off = document.getElementById('ds-cursor-off');
    if (off) off.remove();
    cursorLinks.forEach((l) => {
      try { l.disabled = false; } catch (e) {}
    });
  };
  if (settings.customCursor === false || settings.cursorChoice === 'other') {
    neutralCursor();
    console.log('Cursor personalizado desactivado');
  } else if (settings.catCursors === true) {
    // Gatos en vivo desde CatCursorF (estricto: sin ella no hay gatos)
    cursorLinks.forEach((l) => {
      try { l.disabled = true; } catch (e) {}
    });
    const off0 = document.getElementById('ds-cursor-off');
    if (off0) off0.remove();
    if (typeof requestCatCursors === 'function' && typeof applyCatCursors === 'function') {
      requestCatCursors(2500).then((urls) => {
        if (urls && applyCatCursors(urls)) {
          console.log('Gatos en vivo aplicados');
        } else {
          try {
            const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
            s.catCursors = false;
            localStorage.setItem('darkSnowFConfig', JSON.stringify(s));
          } catch (e) {}
          blueCursor();
          console.log('Sin CatCursorF: gatos desactivados');
        }
      });
    } else {
      blueCursor();
    }
  } else {
    blueCursor();
    // Estado por defecto: azul propio SÍ, gatos NO
    clearRemoteCats();
    document.querySelectorAll('link[href*="cursor.css"]').forEach((l) => {
      try { l.disabled = false; } catch (e) {}
    });
    // Si el usuario eligió mantener el nuestro, nuestra hoja va al final.
    if (settings.cursorChoice === 'keep') {
      document.querySelectorAll('link[href*="cursor.css"]').forEach((l) => {
        document.head.appendChild(l);
      });
    }
    // Detectar cursor externo: el nuestro usa data:image. El pack de gatos
    // propio no cuenta como externo.
    let cursorNoticed = false;
    const detectForeignCursor = () => {
      if (cursorNoticed) return;
      try {
        const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
        if (s.cursorChoice) return;
        if (s.catCursors === true) return; // nuestro pack: no es externo
      } catch (e) {}
      let current = '';
      try {
        current = getComputedStyle(document.body).cursor || '';
      } catch (e) {}
      if (current.indexOf('url(') !== -1 && current.indexOf('data:image') === -1) {
        cursorNoticed = true;
        showCursorNotice();
      }
    };
    const showCursorNotice = () => {
      if (document.getElementById('ds-cursor-notice')) return;
      const lang = (settings.lang === 'en' || settings.lang === 'es')
        ? settings.lang
        : ((typeof window.dsSysLang === 'function') ? window.dsSysLang() : 'es');
      const box = document.createElement('div');
      box.id = 'ds-cursor-notice';
      box.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:3000;max-width:280px;background:rgba(10,15,25,0.97);border:1px solid #0066B2;border-radius:12px;padding:12px 14px;color:#e8eef8;font-size:0.82rem;font-family:inherit;box-shadow:0 10px 30px rgba(0,0,0,0.5);';
      const p = document.createElement('p');
      p.style.margin = '0 0 10px 0';
      p.textContent = lang === 'en'
        ? 'An add-on from our organization (CatCursorF) was detected. Keeping it is recommended to see the cats here and improve the experience. The other option uses the default DarkSnowF cursor. You can change it in Settings.'
        : 'Se detectó un complemento de nuestra organización (CatCursorF). Se recomienda Conservar para ver los gatos aquí y mejorar la experiencia. La otra opción usa el cursor por defecto de DarkSnowF. Puedes cambiarlo en Ajustes.';
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '8px';
      const keep = document.createElement('button');
      keep.type = 'button';
      keep.textContent = lang === 'en' ? 'Keep' : 'Conservar';
      const other = document.createElement('button');
      other.type = 'button';
      other.textContent = 'DarkSnowF';
      [keep, other].forEach((b) => {
        b.style.cssText = 'flex:1;padding:8px;border-radius:8px;border:1px solid #0066B2;background:rgba(0,51,102,0.2);color:#e8eef8;cursor:pointer;font-size:0.8rem;font-family:inherit;';
      });
      keep.style.background = '#0066B2';
      keep.style.color = '#000';
      keep.style.fontWeight = '700';
      const choose = (v) => {
        if (v === 'keep-cats') {
          // Conservar: pedir gatos en vivo a CatCursorF
          if (typeof requestCatCursors === 'function' && typeof applyCatCursors === 'function') {
            requestCatCursors(2500).then((urls) => {
              try {
                const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
                if (urls && applyCatCursors(urls)) {
                  s.catCursors = true;
                  s.cursorChoice = 'cats';
                } else {
                  s.catCursors = false;
                  s.cursorChoice = 'default';
                  blueCursor();
                }
                localStorage.setItem('darkSnowFConfig', JSON.stringify(s));
              } catch (e) {}
            });
          }
        } else {
          // Cursor por defecto de DarkSnowF
          try {
            const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
            s.catCursors = false;
            s.cursorChoice = 'default';
            localStorage.setItem('darkSnowFConfig', JSON.stringify(s));
          } catch (e) {}
          blueCursor();
        }
        if (box.parentNode) box.parentNode.removeChild(box);
      };
      keep.addEventListener('click', () => choose('keep-cats'));
      other.addEventListener('click', () => choose('default'));
      row.appendChild(keep);
      row.appendChild(other);
      box.appendChild(p);
      box.appendChild(row);
      document.body.appendChild(box);
    };
    window.addEventListener('load', detectForeignCursor, { once: true });
    setTimeout(detectForeignCursor, 2500);
  }

  console.log('Configuraciones aplicadas completamente');
})();

// Aviso al detectar CatCursorF instalada (verificación en vivo).
(function catInstallNotice() {
  if (typeof requestCatCursors !== 'function') return;
  requestCatCursors(2000).then((urls) => {
    let was = null;
    try { was = localStorage.getItem('ccf_was_present'); } catch (e) {}
    const now = urls ? '1' : '0';
    if (was !== now) {
      try { localStorage.setItem('ccf_was_present', now); } catch (e) {}
    }
    if (now === '1' && was !== '1') {
      const sysLang = (typeof window.dsSysLang === 'function') ? window.dsSysLang() : 'es';
      const lang = (typeof settings !== 'undefined' && (settings.lang === 'en' || settings.lang === 'es')) ? settings.lang : sysLang;
      const en = lang === 'en';
      const msg = en
        ? 'An extension from our organization was detected: CatCursorF. Choosing "Yes, apply" is recommended to improve your experience and use both extensions.'
        : 'Se ha detectado una extensión de nuestra organización: CatCursorF. Se recomienda elegir «Sí, aplicar» para mejorar su experiencia y usar ambas extensiones.';
      const title = en ? 'Compatibility active' : 'Compatibilidad activa';
      const yesBtn = en ? 'Yes, apply' : 'Sí, aplicar';
      const noBtn = en ? 'No, keep the previous cursor' : 'No, mantener el cursor anterior';
      const ask = async () => {
        let yes = true;
        try {
          if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
            yes = await DSDialogs.confirm(msg, { title, confirmText: yesBtn, cancelText: noBtn });
          }
        } catch (e) {}
        try {
          const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
          s.catCursors = !!yes;
          localStorage.setItem('darkSnowFConfig', JSON.stringify(s));
        } catch (e) {}
        if (yes) {
          if (typeof requestCatCursors === 'function' && typeof applyCatCursors === 'function') {
            requestCatCursors(2500).then((u2) => { if (u2) applyCatCursors(u2); });
          }
        } else {
          try {
            const st = document.getElementById('ds-cats-win');
            if (st && st.parentNode) st.parentNode.removeChild(st);
            document.querySelectorAll('link[href*="cursor.css"]').forEach((l) => {
              try { l.disabled = false; } catch (e) {}
            });
          } catch (e) {}
        }
      };
      setTimeout(ask, 800);
    }
  });
})();

// Transición lenta entre HTML (oscurece al salir, ilumina al entrar)
(function pageTransition() {
  const style = document.createElement('style');
  style.textContent = `
    #ds-fader {
      position: fixed;
      inset: 0;
      background: #000;
      pointer-events: none;
      z-index: 9998;
      transition: opacity 0.5s ease-in-out;
    }
  `;
  document.head.appendChild(style);

  // Fade in al cargar la página
  const faderIn = document.createElement('div');
  faderIn.id = 'ds-fader';
  faderIn.style.opacity = '1';
  document.body.appendChild(faderIn);
  
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      faderIn.style.opacity = '0';
    });
  });
  
  setTimeout(() => {
    if (faderIn.parentNode) faderIn.parentNode.removeChild(faderIn);
  }, 600);

  // Fade out al hacer clic en un enlace
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;
    
    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (err) {
      return;
    }
    
    if (url.protocol !== window.location.protocol || url.host !== window.location.host) return;
    if (url.hash && url.pathname === window.location.pathname) return;
    // La página actual no se vuelve a seleccionar (no recarga)
    if (a.classList.contains('active') || a.getAttribute('aria-current') === 'page') return;
    
    e.preventDefault();
    
    const faderOut = document.createElement('div');
    faderOut.id = 'ds-fader';
    faderOut.style.opacity = '0';
    document.body.appendChild(faderOut);
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        faderOut.style.opacity = '1';
      });
    });
    
    setTimeout(() => {
      window.location.href = url.href;
    }, 520);
  });
})();

// Prevenir recarga al hacer clic en la misma página del menú y mostrar indicador visual
(function activeMenuIndicator() {
  // Marcar el enlace activo en el sidebar
  function markActiveLink() {
    const sidebar = document.querySelector('[data-sidebar]');
    if (!sidebar) return;
    
    const currentPath = window.location.pathname;
    const links = sidebar.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const rawHref = link.getAttribute('href') || '';
      // Ignorar anclas (#) y vacíos: no son páginas (ej. redes pendientes)
      if (!rawHref || rawHref.charAt(0) === '#') return;
      const linkPath = new URL(link.href, window.location.origin).pathname;
      
      // Remover indicador previo
      const existingArrow = link.querySelector('.active-arrow');
      if (existingArrow) existingArrow.remove();
      link.classList.remove('active-page');
      
      // Si es la página actual (el marcador "<" lo pone el CSS; aquí solo se evita la recarga)
      if (linkPath === currentPath) {
        link.classList.add('active-page');
        
        // Prevenir recarga al hacer clic
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          // Opcional: hacer un pequeño efecto visual
          link.style.transform = 'scale(0.98)';
          setTimeout(() => {
            link.style.transform = '';
          }, 150);
        });
      }
    });
  }
  
  // Ejecutar al cargar la página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markActiveLink);
  } else {
    markActiveLink();
  }
  
  // Re-ejecutar si el sidebar se abre dinámicamente
  const sidebar = document.querySelector('[data-sidebar]');
  if (sidebar) {
    const observer = new MutationObserver(() => {
      if (sidebar.classList.contains('active')) {
        markActiveLink();
      }
    });
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
  }
})();
