// src/components/visuals/axe-gradue.js

class AxeGradueComponent extends HTMLElement {
  constructor() {
    super();
    this.config = {
      min: 0, max: 10, step: 1,
      orientation: 'horizontal',
      width: 450, height: 100,
      points: [],
      showNumbers: true,
      fontSize: 13
    };
  }

  connectedCallback() {
    this.render();
  }

  // Aide pour éviter les erreurs de calcul flottant (ex: 0.1 + 0.2)
  round(value, step) {
    const precision = (step.toString().split('.')[1] || '').length;
    return parseFloat(value.toFixed(precision));
  }

  render() {
    this.parseAttributes();
    this.innerHTML = '';
    const canvas = document.createElement('canvas');
    // Récupération des couleurs du projet
    const style = getComputedStyle(document.documentElement);
    const primaryColor = style.getPropertyValue('--color-guide-primary').trim() || '#0d9488';
    const textColor = '#1e293b';

    canvas.width = this.config.width * 2; // Retina/HDPI
    canvas.height = this.config.height * 2;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    this.appendChild(canvas);

    const { min, max, step, orientation, width, height, points, showNumbers, fontSize } = this.config;
    const padding = 40;
    const range = max - min;
    const axisLength = (orientation === 'horizontal' ? width : height) - padding * 2;
    
    // Calcul de la densité : si l'espace est < 40px, on saute des étiquettes
    const pixelPerStep = (step / range) * axisLength;
    const labelFrequency = pixelPerStep < 40 ? Math.ceil(40 / pixelPerStep) : 1;

    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    ctx.font = `${fontSize}px Lexend Deca, sans-serif`;

    if (orientation === 'horizontal') {
      const y = height / 2;
      // Ligne
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      for (let v = min, i = 0; v <= max + (step/2); v += step, i++) {
        const val = this.round(v, step);
        const x = padding + ((val - min) / range) * axisLength;
        const isMajor = i % labelFrequency === 0;

        ctx.beginPath();
        ctx.moveTo(x, y - (isMajor ? 8 : 4));
        ctx.lineTo(x, y + (isMajor ? 8 : 4));
        ctx.stroke();

        if (showNumbers && isMajor) {
          ctx.fillStyle = textColor;
          ctx.textAlign = 'center';
          ctx.fillText(val.toString().replace('.', ','), x, y + 25);
        }
      }
    } else {
      // Version Verticale
      const x = width / 2;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();

      for (let v = min, i = 0; v <= max + (step/2); v += step, i++) {
        const val = this.round(v, step);
        const y = (height - padding) - ((val - min) / range) * axisLength;
        const isMajor = i % labelFrequency === 0;

        ctx.beginPath();
        ctx.moveTo(x - (isMajor ? 8 : 4), y);
        ctx.lineTo(x + (isMajor ? 8 : 4), y);
        ctx.stroke();

        if (showNumbers && isMajor) {
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(val.toString().replace('.', ','), x - 15, y);
        }
      }
    }

    // Dessin des points
    points.forEach(p => {
      const posRatio = (p.value - min) / range;
      const pointColor = p.color || primaryColor;
      ctx.fillStyle = pointColor;
      
      let px, py;
      if (orientation === 'horizontal') {
        px = padding + posRatio * axisLength;
        py = height / 2;
      } else {
        px = width / 2;
        py = (height - padding) - posRatio * axisLength;
      }

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(p.label, px, py - 15);
    });

    // Accessibilité
    this.setAttribute('aria-label', `Axe gradué de ${min} à ${max} par pas de ${step}`);
  }

  parseAttributes() {
    const attrs = ['min', 'max', 'step', 'width', 'height', 'fontSize'];
    attrs.forEach(a => { if(this.hasAttribute(a)) this.config[a] = parseFloat(this.getAttribute(a)); });
    if(this.hasAttribute('orientation')) this.config.orientation = this.getAttribute('orientation');
    if(this.hasAttribute('points')) this.config.points = JSON.parse(this.getAttribute('points'));
  }
}
customElements.define('math974-axe-gradue', AxeGradueComponent);