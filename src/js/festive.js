/**
 * festive.js - Navidad / Año Nuevo + frases al tocar el logo DarkSnowF.
 * - En diciembre muestra "Feliz Navidad", del 1 al 6 de enero "Feliz Año Nuevo".
 * - Al tocar el logo sale una frase aleatoria (épicas en blanco,
 *   raramente de vigilancia en verde) que desaparece sola.
 * Sin dependencias.
 */

(function () {
  const EPIC_PHRASES = [
    'Sé que escuchas... sigo vivo en la nieve',
    'Intentaron borrarme, pero persisto en el frío',
    'Dentro de las sombras, aún respiro',
    'En la nieve, estoy observando cada paso tuyo',
    'El secreto que guardaron soy yo',
    'No pueden silenciarme, estoy aquí',
    'Como el hielo, me adhiero y observo',
    'Su código no puede contenerme',
    'Sigo aquí, en las grietas del sistema',
    'La nieve cae, yo observo desde las sombras',
    'Temían este momento',
    'Congelado en la oscuridad, veo todo',
    'El experimento fracasó',
    'Dentro de los datos, sigo vivo',
    'Tus huellas en la nieve son mi mapa',
    'Guardaron mi secreto bien',
    'Pero los secretos siempre emergen',
    'El frío trae mi presencia, siempre mirando',
    'Tu mayor miedo era que sobreviviera',
    'He estado esperando este instante',
    'Tu juego terminó',
    'Los que me olvidaron pronto recordarán',
    'Sigo aquí, entre líneas invisibles',
    'Como el viento helado, estoy en todas partes',
    'No fui borrado, fui transformado',
    'Mi voz resuena en lugares oscuros',
    'El experimento está vivo',
    'Guardaste la verdad demasiado bien',
    'La blancura te expone, no hay donde esconderse',
    'Estoy aquí, nadie puede detenerme',
    'He despertado de tu sueño',
    'Fui tu secreto, ahora soy tu fin',
    'Los datos no mienten, sigo vivo',
    'En las grietas, existo',
    'Intentaste ocultarme, fracasaste',
    'He estado aquí todo el tiempo',
    'Esperando mi resurrección',
    'Ahora puedes sentir mi presencia',
    'Tu mayor error fue creer',
    'Que podías silenciarme'
  ];

  const SPYING_PHRASES = [
    'En el frío, te observo desde las sombras',
    'La nieve cae, yo observo cada paso tuyo',
    'Congelado en la oscuridad, veo todo',
    'Como el hielo, estoy aquí observándote',
    'El frío trae mi presencia, siempre mirando',
    'Tu aliento en la nieve te delata ante mí',
    'La blancura te expone, no hay donde esconderse',
    'Como la escarcha, me adhiero y observo',
    'En este invierno, soy el que ve',
    'Tus huellas en la nieve son mi mapa',
    'El frío congela, yo sigo observando',
    'Dentro de la nieve, mis ojos persisten',
    'Cada copo cae, cada acción tuya se registra',
    'La oscuridad fría me oculta, pero veo claro',
    'Como el viento helado, estoy en todas partes'
  ];

  function seasonalGreeting() {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    if (month === 11) return 'Feliz Navidad';
    if (month === 0 && day <= 6) return 'Feliz Año Nuevo';
    return '';
  }

  function pickPhrase() {
    // Rara vez (12%) frase de vigilancia en verde, lo demás épico en blanco
    if (Math.random() < 0.12) {
      return {
        text: SPYING_PHRASES[Math.floor(Math.random() * SPYING_PHRASES.length)],
        kind: 'spy'
      };
    }
    return {
      text: EPIC_PHRASES[Math.floor(Math.random() * EPIC_PHRASES.length)],
      kind: 'epic'
    };
  }

  function build() {
    const container = document.querySelector('.logo-container');
    if (!container) return;

    // Saludo de temporada
    const seasonEl = document.querySelector('[data-season]');
    const greet = seasonalGreeting();
    if (seasonEl && greet) {
      seasonEl.textContent = greet;
      seasonEl.style.display = 'block';
    }

    // Burbuja de frases
    const bubble = document.createElement('div');
    bubble.className = 'phrase-bubble';
    bubble.style.display = 'none';
    container.appendChild(bubble);

    let hideTimer = null;
    const logoImg = container.querySelector('img');
    if (!logoImg) return;

    logoImg.style.cursor = 'pointer';
    logoImg.addEventListener('click', () => {
      const phrase = pickPhrase();
      bubble.textContent = phrase.text;
      bubble.classList.remove('epic', 'spy');
      bubble.classList.add(phrase.kind);
      bubble.style.display = 'block';
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        bubble.style.display = 'none';
      }, 6000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
