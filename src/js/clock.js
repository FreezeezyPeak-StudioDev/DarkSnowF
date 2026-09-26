/**
 * Clock.js - Control del reloj del sistema
 * Muestra la hora actual en el dashboard
 */

const Clock = {
  element: null,
  isRunning: false,
  offsetMs: 0,
  tz: null,

  /**
   * Fijar desfase en ms (hora de internet menos hora del PC)
   * @param {number} ms
   */
  setOffset(ms) {
    this.offsetMs = Number(ms) || 0;
  },

  /**
   * Fijar zona horaria IANA (ej: America/Bogota). null = hora local del PC
   * @param {string|null} tz
   */
  setTz(tz) {
    this.tz = tz || null;
  },

  /**
   * Hora actual (internet si hay offset, sino PC)
   */
  now() {
    return new Date(Date.now() + this.offsetMs);
  },

  /**
   * Inicializar el reloj
   * @param {string} selector - Selector del elemento donde mostrar la hora
   */
  init(selector) {
    this.element = document.querySelector(selector);
    if (!this.element) {
      console.warn('Clock element not found:', selector);
      return false;
    }
    
    this.update();
    this.isRunning = true;
    setInterval(() => this.update(), 1000);
    return true;
  },

  /**
   * Actualizar hora y fecha
   */
  update() {
    if (!this.element) return;

    const now = this.now();
    let settings = {};
    try {
      settings = JSON.parse(localStorage.getItem('darkSnowFConfig') || '{}');
    } catch (e) {
      settings = {};
    }

    const use24h = settings.clockFormat !== '12h'; // Por defecto 24h (militar)
    const showSeconds = settings.clockSeconds !== false; // Por defecto con segundos
    const dateFormat = settings.dateFormat || 'numeric'; // 'numeric' o 'text'
    
    let timeText;
    let dateText;

    if (this.tz) {
      try {
        const timeOptions = {
          timeZone: this.tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: !use24h
        };
        if (showSeconds) {
          timeOptions.second = '2-digit';
        }
        
        timeText = new Intl.DateTimeFormat('es-ES', timeOptions).format(now);
        
        // Formato de fecha
        if (dateFormat === 'numeric') {
          dateText = now.toLocaleDateString('es-ES', { 
            timeZone: this.tz,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } else {
          dateText = now.toLocaleDateString('es-ES', { 
            timeZone: this.tz,
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          });
        }
      } catch (e) {
        timeText = now.toLocaleTimeString('es-ES', { hour12: !use24h });
        dateText = now.toLocaleDateString('es-ES');
      }
    } else {
      // Hora del PC sin zona horaria específica
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      if (use24h) {
        const hours24 = String(hours).padStart(2, '0');
        timeText = showSeconds ? `${hours24}:${minutes}:${seconds}` : `${hours24}:${minutes}`;
      } else {
        const hours12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        timeText = showSeconds 
          ? `${hours12}:${minutes}:${seconds} ${ampm}` 
          : `${hours12}:${minutes} ${ampm}`;
      }
      
      // Formato de fecha
      if (dateFormat === 'numeric') {
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        dateText = `${day}/${month}/${year}`;
      } else {
        dateText = now.toLocaleDateString('es-ES', { 
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });
      }
    }

    // Mostrar hora y fecha
    while (this.element.firstChild) this.element.removeChild(this.element.firstChild);
    const dateDiv = document.createElement('div');
    dateDiv.className = 'clock-date';
    dateDiv.textContent = dateText;
    const timeDiv = document.createElement('div');
    timeDiv.className = 'clock-time';
    timeDiv.textContent = timeText;
    this.element.appendChild(dateDiv);
    this.element.appendChild(timeDiv);
  },

  /**
   * Obtener hora formateada
   */
  getFormattedTime() {
    const now = new Date();
    return {
      hours: String(now.getHours()).padStart(2, '0'),
      minutes: String(now.getMinutes()).padStart(2, '0'),
      seconds: String(now.getSeconds()).padStart(2, '0'),
      date: now.toLocaleDateString('es-ES'),
      day: now.toLocaleDateString('es-ES', { weekday: 'long' })
    };
  },

  /**
   * Detener el reloj
   */
  stop() {
    this.isRunning = false;
  }
};

// Exportar para uso en navegadores modernos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Clock;
}
