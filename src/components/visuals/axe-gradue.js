
// ========================================
// VISUAL COMPONENT: Axe Gradué
// math974-axe-gradue
// ========================================

class AxeGradueComponent extends HTMLElement {
  constructor() {
    super();
    this.canvas = null;
    this.ctx = null;
    this.config = {
      min: 0,
      max: 10,
      step: 1,
      orientation: 'horizontal', // ou 'vertical'
      width: 400,
      height: 80,
      points: [], // [{label: 'A', value: 5, color: '#f59e0b'}]
      showNumbers: true,
      showArrows: true,
      color: '#1e293b',
      lineWidth: 2,
      fontSize: 14,
    };
  }

  static get observedAttributes() {
    return [
      'min',
      'max',
      'step',
      'orientation',
      'width',
      'height',
      'points',
      'show-numbers',
      'show-arrows',
      'color',
      'line-width',
      'font-size',
    ];
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.parseAttributes();
      this.render();
    }
  }

  parseAttributes() {
    // Parser les attributs HTML
    if (this.hasAttribute('min')) this.config.min = parseFloat(this.getAttribute('min'));
    if (this.hasAttribute('max')) this.config.max = parseFloat(this.getAttribute('max'));
    if (this.hasAttribute('step')) this.config.step = parseFloat(this.getAttribute('step'));
    if (this.hasAttribute('orientation'))
      this.config.orientation = this.getAttribute('orientation');
    if (this.hasAttribute('width')) this.config.width = parseInt(this.getAttribute('width'));
    if (this.hasAttribute('height')) this.config.height = parseInt(this.getAttribute('height'));
    if (this.hasAttribute('show-numbers'))
      this.config.showNumbers = this.getAttribute('show-numbers') !== 'false';
    if (this.hasAttribute('show-arrows'))
      this.config.showArrows = this.getAttribute('show-arrows') !== 'false';
    if (this.hasAttribute('color')) this.config.color = this.getAttribute('color');
    if (this.hasAttribute('line-width'))
      this.config.lineWidth = parseInt(this.getAttribute('line-width'));
    if (this.hasAttribute('font-size'))
      this.config.fontSize = parseInt(this.getAttribute('font-size'));

    // Parser les points (JSON)
    if (this.hasAttribute('points')) {
      try {
        this.config.points = JSON.parse(this.getAttribute('points'));
      } catch (e) {
        console.error('Invalid points JSON:', e);
        this.config.points = [];
      }
    }
  }

  render() {
    // Nettoyer
    this.innerHTML = '';

    // Créer le canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.height = 'auto';
    this.ctx = this.canvas.getContext('2d');

    this.appendChild(this.canvas);

    // Dessiner l'axe
    if (this.config.orientation === 'horizontal') {
      this.drawHorizontalAxis();
    } else {
      this.drawVerticalAxis();
    }
  }

  drawHorizontalAxis() {
    const ctx = this.ctx;
    const { min, max, step, width, height, showNumbers, showArrows, color, lineWidth, fontSize } =
      this.config;

    const padding = 40;
    const axisY = height / 2;
    const axisStart = padding;
    const axisEnd = width - padding;
    const axisLength = axisEnd - axisStart;

    // Ligne principale
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(axisStart, axisY);
    ctx.lineTo(axisEnd, axisY);
    ctx.stroke();

    // Flèches
    if (showArrows) {
      this.drawArrow(ctx, axisEnd, axisY, axisEnd + 10, axisY, color);
    }

    // Graduations
    const range = max - min;
    const numSteps = Math.floor(range / step);

    for (let i = 0; i <= numSteps; i++) {
      const value = min + i * step;
      const x = axisStart + (value - min) * (axisLength / range);

      // Trait de graduation
      ctx.beginPath();
      ctx.moveTo(x, axisY - 8);
      ctx.lineTo(x, axisY + 8);
      ctx.stroke();

      // Nombre
      if (showNumbers) {
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px var(--font-sans)`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(value.toString(), x, axisY + 12);
      }
    }

    // Points marqués
    this.config.points.forEach((point) => {
      const x = axisStart + (point.value - min) * (axisLength / range);
      const pointColor = point.color || '#f59e0b';

      // Cercle
      ctx.fillStyle = pointColor;
      ctx.beginPath();
      ctx.arc(x, axisY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = pointColor;
      ctx.font = `bold ${fontSize + 2}px var(--font-sans)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(point.label, x, axisY - 12);
    });
  }

  drawVerticalAxis() {
    const ctx = this.ctx;
    const { min, max, step, width, height, showNumbers, showArrows, color, lineWidth, fontSize } =
      this.config;

    const padding = 40;
    const axisX = width / 2;
    const axisStart = height - padding;
    const axisEnd = padding;
    const axisLength = axisStart - axisEnd;

    // Ligne principale
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(axisX, axisStart);
    ctx.lineTo(axisX, axisEnd);
    ctx.stroke();

    // Flèches
    if (showArrows) {
      this.drawArrow(ctx, axisX, axisEnd, axisX, axisEnd - 10, color);
    }

    // Graduations
    const range = max - min;
    const numSteps = Math.floor(range / step);

    for (let i = 0; i <= numSteps; i++) {
      const value = min + i * step;
      const y = axisStart - (value - min) * (axisLength / range);

      // Trait de graduation
      ctx.beginPath();
      ctx.moveTo(axisX - 8, y);
      ctx.lineTo(axisX + 8, y);
      ctx.stroke();

      // Nombre
      if (showNumbers) {
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px var(--font-sans)`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toString(), axisX - 12, y);
      }
    }

    // Points marqués
    this.config.points.forEach((point) => {
      const y = axisStart - (point.value - min) * (axisLength / range);
      const pointColor = point.color || '#f59e0b';

      // Cercle
      ctx.fillStyle = pointColor;
      ctx.beginPath();
      ctx.arc(axisX, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = pointColor;
      ctx.font = `bold ${fontSize + 2}px var(--font-sans)`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(point.label, axisX + 12, y);
    });
  }

  drawArrow(ctx, x1, y1, x2, y2, color) {
    const arrowSize = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - arrowSize * Math.cos(angle - Math.PI / 6),
      y2 - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - arrowSize * Math.cos(angle + Math.PI / 6),
      y2 - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }

  // Méthode publique pour mettre à jour la config
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);
    this.render();
  }

  // Méthode pour obtenir la config actuelle
  getConfig() {
    return { ...this.config };
  }
}

// Enregistrer le Web Component
customElements.define('math974-axe-gradue', AxeGradueComponent);

export default AxeGradueComponent;
