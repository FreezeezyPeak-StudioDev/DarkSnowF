
<br>

<!-- LOGO CENTRADO -->
<div align="center">

<img src="https://raw.githubusercontent.com/FreezeezyPeak/Info-Freezeezy-PeaK/main/logo_freezeezy.png" width="220">

# FreezeezyPeak

</div>

---

<div align="center">

![DarkSnowF](https://img.shields.io/badge/DarkSnowF-v3.2-blue?style=for-the-badge&logo=firefox)

## DarkSnowF

**Tu Página de Inicio Personalizada para Firefox**

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-GPL%20v3-blue)
![Firefox](https://img.shields.io/badge/Firefox-Compatible-orange)

</div>

---

**[🇪🇸 Español](#español)** | **[🇬🇧 English](#english)**

---

## Español

### DarkSnowF — Tu página de inicio personalizada

Experiencia oscura, personalizable y completa. Buscador multi-motor, accesos rápidos arrastrables, reloj en vivo, fondos dinámicos, 5 temas azules, nieve animada, frases secretas y perfiles independientes.

100% local • Sin cuentas • Código abierto (GPL-3.0)

### Características

- **Buscador Multi-Motor** — Google, Bing, DuckDuckGo, ChatGPT, Wikipedia, Perplexity
- **Accesos Rápidos** — Arrastra, organiza y categoriza con iconos automáticos
- **Perfiles** — Personal, Público, Trabajo... cada uno con enlaces independientes
- **Reloj en Vivo** — Sincronización internet/PC, formato 12/24h, zonas horarias
- **Fondos Dinámicos** — Presets, URLs o archivos locales con rotación automática
- **5 Temas Azules** — Oscuro, claro y paletas exclusivas
- **Nieve Animada** — Efectos navideños y easter eggs
- **100% Local** — Sin nube, sin rastreo, todo en tu navegador

### Estructura del Proyecto

```text
DarkSnowF/
├── Index.html                  ← inicio (buscador, accesos, categorías, logo)
├── popup.html                  ← mini menú del icono (redes, perfiles, ventana)
├── manifest.json               ← MV3 v1.1.0 (newtab, homepage, fondo worker+scripts)
├── .vscode/settings.json       ← solo editor, excluido del XPI
├── pages/
│   ├── config.html             ← ajustes, perfiles, exportar/importar TXT-JSON
│   ├── credit.html             ← créditos
│   └── License.html            ← licencia GPL-3.0
├── assets/
│   ├── Fx/Click2.mp3           ← sonido de clic
│   └── Texturas/
│       ├── backgrounds/ (8 JPG)← fondos
│       ├── Logos/ (5 PNG)      ← logos
│       └── UI/ (18 SVG)        ← iconos de interfaz
├── src/
│   ├── css/ (7)                ← cursor, dialogs, index-styles, main, menu, modals, themes
│   └── js/ (20)
│       ├── index-app.js        ← aplicación principal
│       ├── almacen.js          ← guardado verificado
│       ├── iconos.js           ← iconos URL, archivo o automático
│       ├── respaldo.js         ← respaldo TXT y JSON
│       ├── config-page.js      ← página de opciones
│       ├── config-loader.js    ← aplica ajustes
│       ├── profile-cfg.js      ← tema y motor por perfil
│       ├── popup.js            ← popup con avatares
│       ├── background.js       ← fondo MV3
│       ├── onboarding.js       ← bienvenida
│       ├── i18n.js             ← idiomas inicio
│       ├── i18n-pages.js       ← idiomas páginas
│       └── clock, snow, festive, rotate, search-suggest, cat-remote, menu, modals
├── utils/dialogs.js            ← diálogos
├── themes/ (oscuro, claro)     ← temas
└── versions/ (V1.0, V1.1.0)    ← paquetes XPI
```
### Cómo Usar

**Home Principal:**
1. Click en el icono de DarkSnowF
2. Personaliza buscador, accesos rápidos y perfiles
3. Elige tema, fondo y efectos

**Ajustes:**
- Tema (Abyss, Frost, Neon, Ocean, Dark)
- Fondo (predefinido, URL o archivo local)
- Reloj (12/24h, zona horaria, sincronización)
- Zoom (50%-150%)
- Perfiles independientes

**Perfiles:**
- Crea múltiples perfiles
- Cada uno con sus propios enlaces
- Cambia rápidamente

### Instalación

1. Descarga desde Firefox Add-ons: [DarkSnowF](link)
2. Click "Agregar a Firefox"
3. Tu nueva pestaña está lista

### Licencia

GNU General Public License v3.0 — Ver archivo LICENSE

Desarrollado por **Freezeezy Peak**
GitHub: [github.com/FreezeezyPeak-StudioDev/DarkSnowF](link)

---

## English

### DarkSnowF — Personalized Home Page

Dark, customizable, complete experience. Multi-engine search, draggable shortcuts, live clock, dynamic backgrounds, 5 blue themes, animated snow, secret phrases and independent profiles.

100% local • No accounts • Open source (GPL-3.0)

### Features

- **Multi-Engine Search** — Google, Bing, DuckDuckGo, ChatGPT, Wikipedia, Perplexity
- **Draggable Shortcuts** — Drag, organize and categorize with automatic icons
- **Profiles** — Personal, Public, Work... each with independent links
- **Live Clock** — Internet/PC sync, 12/24h format, timezone support
- **Dynamic Backgrounds** — Presets, URLs, or local files with auto-rotation
- **5 Blue Themes** — Dark, light and exclusive palettes
- **Animated Snow** — Holiday effects and easter eggs
- **100% Local** — No cloud, no tracking, everything in your browser

### Project Structure

## Project Structure

```text
DarkSnowF/
├── Index.html                  ← home (search, shortcuts, categories, logo)
├── popup.html                  ← toolbar popup (socials, profiles, window)
├── manifest.json               ← MV3 v1.1.0 (newtab, homepage, worker+scripts background)
├── .vscode/settings.json       ← editor only, excluded from XPI
├── pages/
│   ├── config.html             ← settings, profiles, TXT-JSON backup
│   ├── credit.html             ← credits
│   └── License.html            ← GPL-3.0 license
├── assets/
│   ├── Fx/Click2.mp3           ← click sound
│   └── Texturas/
│       ├── backgrounds/ (8 JPG)← wallpapers
│       ├── Logos/ (5 PNG)      ← logos
│       └── UI/ (18 SVG)        ← interface icons
├── src/
│   ├── css/ (7)                ← cursor, dialogs, index-styles, main, menu, modals, themes
│   └── js/ (20)
│       ├── index-app.js        ← main app
│       ├── almacen.js          ← verified storage
│       ├── iconos.js           ← custom icons (URL, file, auto)
│       ├── respaldo.js         ← TXT and JSON backup
│       ├── config-page.js      ← options page
│       ├── config-loader.js    ← applies settings
│       ├── profile-cfg.js      ← per-profile theme and engine
│       ├── popup.js            ← popup with avatars
│       ├── background.js       ← MV3 background
│       ├── onboarding.js       ← welcome flow
│       ├── i18n.js             ← home locales
│       ├── i18n-pages.js       ← pages locales
│       └── clock, snow, festive, rotate, search-suggest, cat-remote, menu, modals
├── utils/dialogs.js            ← dialogs
├── themes/ (oscuro, claro)     ← themes
└── versions/ (V1.0, V1.1.0)    ← XPI packages
```


### How to Use

**Main Home:**
1. Click DarkSnowF icon
2. Customize search, shortcuts and profiles
3. Choose theme, background and effects

**Settings:**
- Theme (Abyss, Frost, Neon, Ocean, Dark)
- Background (preset, URL or local file)
- Clock (12/24h, timezone, sync)
- Zoom (50%-150%)
- Independent profiles

**Profiles:**
- Create multiple profiles
- Each with its own links
- Switch quickly

### Installation

1. Download from Firefox Add-ons: [DarkSnowF](link)
2. Click "Add to Firefox"
3. Your new tab is ready

### License

GNU General Public License v3.0 — See LICENSE file

Developed by **Freezeezy Peak**
GitHub: [github.com/FreezeezyPeak-StudioDev/DarkSnowF](link)

---

<p align="center">
<strong>Made by Freezeezy Peak</strong><br>
<a href="https://www.youtube.com/@FreezeezyPeak">YouTube</a> |
<a href="https://addons.mozilla.org/es-ES/firefox/">Firefox Profile</a> |
<a href="https://github.com/FreezeezyPeak-StudioDev">GitHub</a>
</p>
