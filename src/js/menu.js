/**
 * menu.js - Menú compartido para páginas secundarias, misma UI que el home.
 * Inyecta botón flotante + panel (fondo, ajustes, créditos, licencia,
 * ayuda, idioma y redes). Solo incluir en pages/*.html.
 * Sin handlers inline (compatible CSP de extensiones MV3).
 */

(function () {
  const MENU_STRINGS = {
    es: {
      navMenu: 'Menú de navegación',
      home: 'Inicio',
      wallpaper: 'Cambiar fondo',
      settings: 'Configuración',
      credits: 'Créditos',
      license: 'Licencia',
      help: 'Ayuda',
      networks: 'Redes',
      soonTitle: 'Próximamente',
      soonMsg: '404 — Muy pronto, mantente al tanto.',
      infoOk: 'Entendido'
    },
    en: {
      navMenu: 'Navigation menu',
      home: 'Home',
      wallpaper: 'Change background',
      settings: 'Settings',
      credits: 'Credits',
      license: 'License',
      help: 'Help',
      networks: 'Socials',
      soonTitle: 'Coming soon',
      soonMsg: '404 — Coming soon, stay tuned.',
      infoOk: 'Got it'
    }
  };

  function getLang() {
    try {
      const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
      if (s.lang === 'en' || s.lang === 'es') return s.lang;
    } catch (e) {}
    // Sin elección guardada: idioma del equipo.
    if (typeof window.dsSysLang === 'function') return window.dsSysLang();
    return 'es';
  }

  function basePath() {
    const p = window.location.pathname.replace(/\\/g, '/');
    return p.indexOf('/pages/') !== -1 ? '../' : '';
  }

  function svgIcon(kind) {
    if (kind === 'youtube') {
      return '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="4" fill="#FF0000"/><path d="M10 9.5v5l4.5-2.5L10 9.5z" fill="#fff"/></svg>';
    }
    if (kind === 'github') {
      return '<svg viewBox="0 0 24 24" fill="#e8eef8"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.54 2.87 8.39 6.84 9.75.5.1.68-.22.68-.49 0-.24-.01-1.04-.02-1.89-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.58 2.36 1.12 2.93.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.2 10.2 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>';
    }
    if (kind === 'gitlab') {
      return '<svg viewBox="0 0 24 24" fill="none"><polygon points="12,2 15,8 20,6 21,13 18,19 12,22 6,19 3,13 4,6 9,8" fill="#FC6D26"/><polygon points="12,9 15,12 12,17 9,12" fill="#fff"/></svg>';
    }
    if (kind === 'itch') {
      return '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="11" rx="4" fill="#FA5C5C"/><circle cx="9" cy="12.5" r="1.6" fill="#fff"/><circle cx="15" cy="12.5" r="1.6" fill="#fff"/></svg>';
    }
    if (kind === 'web') {
      return '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#2E9BD6"/><ellipse cx="12" cy="12" rx="4" ry="9" stroke="#fff" stroke-width="1.6" fill="none"/><line x1="3.5" y1="12" x2="20.5" y2="12" stroke="#fff" stroke-width="1.6"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#FF7139"/><path d="M12 2a10 10 0 0 0-3.9.8c2.5.6 3.4 2.4 3.1 4.3-.3 2.1-2 3.4-2.3 5.5-.3 2.3 1.2 4.6 3.1 5.9a10 10 0 0 0 0-16.5z" fill="#FFBD4F"/><circle cx="12" cy="12" r="4.5" fill="#0060DF"/></svg>';
  }

  // Icono como nodo (sin innerHTML: los textos son fijos por tipo).
  function svgEl(kind) {
    try {
      const doc = new DOMParser().parseFromString(svgIcon(kind), 'image/svg+xml');
      const node = doc.documentElement;
      if (node && node.nodeName !== 'parsererror') return node;
    } catch (e) {}
    return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  function build() {
    const base = basePath();
    const ui = base + 'assets/Texturas/UI/';
    const lang = getLang();
    const d = MENU_STRINGS[lang] || MENU_STRINGS.es;

    const overlay = document.createElement('div');
    overlay.className = 'shared-menu-overlay';

    const panel = document.createElement('aside');
    panel.className = 'shared-menu-panel';

    const title = document.createElement('h3');
    title.textContent = 'DarkSnowF';
    const sub = document.createElement('p');
    sub.textContent = d.navMenu;

    // Flecha < para volver atrás
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'shared-back';
    backBtn.title = 'Atrás';
    backBtn.setAttribute('aria-label', 'Volver atrás');
    backBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M15 5 L8 12 L15 19" stroke="#111111" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 5 L8 12 L15 19" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    backBtn.addEventListener('click', () => {
      close();
    });

    const nav = document.createElement('nav');
    const ul = document.createElement('ul');

    const here = window.location.pathname.replace(/\\/g, '/').split('/').pop().toLowerCase();

    const links = [
      { file: 'index.html', href: base + 'Index.html', icon: ui + 'Menu.svg', text: d.home, modal: null },
      { file: '__fondo__', href: null, icon: ui + 'EditarFondo.svg', text: d.wallpaper, modal: 'wallpaper' },
      { file: 'config.html', href: base + 'pages/config.html', icon: ui + 'Editar.svg', text: d.settings, modal: null },
      { file: 'credit.html', href: base + 'pages/credit.html', icon: ui + 'Creditos.svg', text: d.credits, modal: null },
      { file: 'license.html', href: base + 'pages/License.html', icon: ui + 'Licencia.svg', text: d.license, modal: null },
      { file: '__ayuda__', href: null, icon: ui + 'Ayuda.svg', text: d.help, modal: 'help' }
    ];

    links.forEach((item) => {
      const li = document.createElement('li');
      if (item.modal) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'shared-link';
        if (item.icon) {
          const img = document.createElement('img');
          img.src = item.icon;
          img.alt = '';
          b.appendChild(img);
        }
        const span = document.createElement('span');
        span.textContent = item.text;
        b.appendChild(span);
        b.addEventListener('click', () => {
          close();
          if (item.modal === 'wallpaper' && typeof window.DS_openWallpaper === 'function') {
            window.DS_openWallpaper();
          }
          if (item.modal === 'help' && typeof window.DS_openHelp === 'function') {
            window.DS_openHelp();
          }
        });
        li.appendChild(b);
      } else {
        const a = document.createElement('a');
        a.href = item.href;
        if (here === item.file) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
          a.addEventListener('click', (e) => e.preventDefault());
        }
        if (item.icon) {
          const img = document.createElement('img');
          img.src = item.icon;
          img.alt = '';
          a.appendChild(img);
        }
        const span = document.createElement('span');
        span.textContent = item.text;
        a.appendChild(span);
        a.addEventListener('click', close);
        li.appendChild(a);
      }
      ul.appendChild(li);
    });

    // Botón idioma (igual que en el home)
    const langLi = document.createElement('li');
    const langBtn = document.createElement('button');
    langBtn.type = 'button';
    langBtn.className = 'shared-link';
    const langImg = document.createElement('img');
    langImg.src = ui + 'ES-EN.svg';
    langImg.alt = '';
    const langSpan = document.createElement('span');
    langSpan.textContent = lang === 'en' ? 'Language: EN' : 'Idioma: ES';
    langBtn.appendChild(langImg);
    langBtn.appendChild(langSpan);
    langBtn.addEventListener('click', () => {
      let s = {};
      try {
        s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
      } catch (e) {
        s = {};
      }
      s.lang = lang === 'en' ? 'es' : 'en';
      localStorage.setItem('darkSnowFConfig', JSON.stringify(s));
      close();
      window.location.reload();
    });
    langLi.appendChild(langBtn);
    ul.appendChild(langLi);

    nav.appendChild(ul);
    panel.appendChild(backBtn);
    panel.appendChild(title);
    panel.appendChild(sub);
    panel.appendChild(nav);

    // Redes (igual que en el home)
    const social = document.createElement('div');
    social.className = 'shared-social';
    const socialP = document.createElement('p');
    socialP.textContent = d.networks;
    const row = document.createElement('div');
    row.className = 'shared-social-row';
    const socials = [
      { href: 'https://www.youtube.com/@FreezeezyPeak', label: 'YouTube', kind: 'youtube', soon: false },
      { href: 'https://github.com/FreezeezyPeak-StudioDev', label: 'GitHub', kind: 'github', soon: false },
      { href: 'https://addons.mozilla.org/es-ES/firefox/user/20170408/', label: 'Firefox Add-ons', kind: 'firefox', soon: false },
      { href: 'https://gitlab.com/freezeezypeak.studiodev', label: 'GitLab', kind: 'gitlab', soon: false },
      { href: '#', label: 'itch.io', kind: 'itch', soon: true },
      { href: '#', label: 'Mi web', kind: 'web', soon: true }
    ];
    socials.forEach((s) => {
      const a = document.createElement('a');
      a.href = s.href;
      if (!s.soon) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      a.setAttribute('aria-label', s.label);
      if (s.soon) a.setAttribute('data-coming-soon', s.kind);
      a.appendChild(svgEl(s.kind));
      row.appendChild(a);
    });
    social.appendChild(socialP);
    social.appendChild(row);
    panel.appendChild(social);

    const btn = document.createElement('button');
    btn.className = 'shared-menu-btn';
    btn.setAttribute('aria-label', 'Abrir menú');
    btn.setAttribute('type', 'button');
    const btnImg = document.createElement('img');
    btnImg.src = ui + 'Menu.svg';
    btnImg.alt = 'Menú';
    btn.appendChild(btnImg);

    function open() {
      panel.classList.add('active');
      overlay.classList.add('active');
    }

    function close() {
      panel.classList.remove('active');
      overlay.classList.remove('active');
    }

    btn.addEventListener('click', () => {
      if (panel.classList.contains('active')) close();
      else open();
    });
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(btn);

    // Aviso de función próxima para enlaces pendientes (también cubre créditos)
    document.addEventListener('click', (e) => {
      const link = e.target && e.target.closest ? e.target.closest('[data-coming-soon]') : null;
      if (!link) return;
      e.preventDefault();
      if (link.blur) link.blur();
      const lang2 = getLang();
      const dd = MENU_STRINGS[lang2] || MENU_STRINGS.es;
      try {
        if (typeof DSDialogs !== 'undefined' && DSDialogs.confirm) {
          DSDialogs.confirm(dd.soonMsg, { title: dd.soonTitle, confirmText: dd.infoOk });
        }
      } catch (err) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
