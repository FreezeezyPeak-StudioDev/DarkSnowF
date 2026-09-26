/**
 * snow.js - Nieve cayendo (copos detallados de 6 brazos, no esferas ni píxeles).
 * Se activa con ajustes: darkSnowFConfig.snow (por defecto sí).
 * Sin dependencias.
 */

(function () {
  function snowEnabled() {
    try {
      const s = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
      return s.snow !== false;
    } catch (e) {
      return true;
    }
  }

  if (!snowEnabled()) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'snow-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Ajuste con densidad de píxeles + re-verificación (zoom / redimensionar)
  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit();
  window.addEventListener('resize', fit);
  setTimeout(fit, 600);

  const flakes = [];
  const COUNT = 90;
  const nowD = new Date();
  const festive = nowD.getMonth() === 11 || (nowD.getMonth() === 0 && nowD.getDate() <= 6);
  for (let i = 0; i < COUNT; i++) {
    flakes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 2 + Math.random() * 4,
      speed: 0.4 + Math.random() * 1.2,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.005 + Math.random() * 0.01,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0.5 + Math.random() * 0.5,
      gold: festive && Math.random() < 0.15
    });
  }

  // Copo detallado: 6 brazos con ramitas laterales
  function drawFlake(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    ctx.strokeStyle = f.gold
      ? 'rgba(255, 217, 77, ' + f.opacity.toFixed(2) + ')'
      : 'rgba(255, 255, 255, ' + f.opacity.toFixed(2) + ')';
    ctx.lineWidth = 1;
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 3) * k;
      const x2 = Math.cos(a) * f.r;
      const y2 = Math.sin(a) * f.r;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Ramitas del brazo
      const bx = Math.cos(a) * f.r * 0.6;
      const by = Math.sin(a) * f.r * 0.6;
      const bl = f.r * 0.3;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(a + 0.5) * bl, by + Math.sin(a + 0.5) * bl);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(a - 0.5) * bl, by + Math.sin(a - 0.5) * bl);
      ctx.stroke();
    }
    ctx.restore();
  }

  let frame = 0;
  function tick() {
    frame++;
    // Re-ajustar cada ~2s por si cambió el zoom o la ventana
    if (frame % 120 === 0) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) fit();
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    flakes.forEach((f) => {
      f.sway += f.swaySpeed;
      f.rot += f.rotSpeed;
      f.y += f.speed;
      f.x += Math.sin(f.sway) * 0.4;
      if (f.y > window.innerHeight + 10) {
        f.y = -10;
        f.x = Math.random() * window.innerWidth;
      }
      if (f.x > window.innerWidth + 10) f.x = -10;
      if (f.x < -10) f.x = window.innerWidth + 10;
      drawFlake(f);
    });
    requestAnimationFrame(tick);
  }
  tick();
})();
