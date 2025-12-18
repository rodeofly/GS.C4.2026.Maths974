// src/components/visuals/axe-gradue.js

class AxeGradueComponent extends HTMLElement {
  constructor() {
    super();
    this.config = { 
      min: 0, max: 10, step: 1, 
      orientation: 'horizontal', 
      width: 450, height: 100, 
      points: [], showNumbers: true 
    };
  }

  connectedCallback() {
    this.render();
  }

  // 🛠️ UTILITAIRE : Précision mathématique pour éviter le bug "0,700000001"
  round(v, s) { 
    const p = (s.toString().split('.')[1] || '').length;
    return parseFloat(v.toFixed(p));
  }

  // 🛠️ UTILITAIRE : Dessiner une flèche propre au bout de l'axe
  drawArrow(ctx, x1, y1, x2, y2) {
    const size = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  render() {
    this.parseAttributes();
    this.innerHTML = '';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Support Haute Définition (Retina)
    canvas.width = this.config.width * 2;
    canvas.height = this.config.height * 2;
    canvas.style.width = '100%';
    ctx.scale(2, 2);
    this.appendChild(canvas);

    // Récupération dynamique de la couleur du thème
    const style = getComputedStyle(document.documentElement);
    this.primaryColor = style.getPropertyValue('--color-guide-primary').trim() || '#0d9488';
    this.ctx = ctx;

    if (this.config.orientation === 'horizontal') {
      this.drawHorizontalAxis();
    } else {
      this.drawVerticalAxis();
    }

    this.drawPoints();
  }

  drawHorizontalAxis() {
    const { ctx } = this;
    const { min, max, step, width, height, showNumbers } = this.config;
    const padding = 40;
    const range = max - min;
    const axisLen = width - padding * 2;
    const y = height / 2;

    // Calcul densité des étiquettes (pas moins de 40px d'écart)
    const pxPerStep = (step / range) * axisLen;
    const labelFreq = pxPerStep < 40 ? Math.ceil(40 / pxPerStep) : 1;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;

    // Ligne et Flèche
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    this.drawArrow(ctx, width - padding - 10, y, width - padding, y);

    // Graduations
    for (let v = min, i = 0; v <= max + (step/2); v += step, i++) {
      const val = this.round(v, step);
      const x = padding + ((val - min) / range) * axisLen;
      const isMajor = i % labelFreq === 0;

      ctx.beginPath();
      ctx.moveTo(x, y - (isMajor ? 8 : 4));
      ctx.lineTo(x, y + (isMajor ? 8 : 4));
      ctx.stroke();

      if (showNumbers && isMajor) {
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px Lexend Deca, sans-serif';
        ctx.fillText(val.toString().replace('.', ','), x, y + 25);
      }
    }
  }

  drawVerticalAxis() {
    const { ctx } = this;
    const { min, max, step, width, height, showNumbers } = this.config;
    const padding = 35;
    const range = max - min;
    const axisLen = height - padding * 2;
    const x = width / 2;

    const pxPerStep = (step / range) * axisLen;
    const labelFreq = pxPerStep < 40 ? Math.ceil(40 / pxPerStep) : 1;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;

    // Ligne et Flèche (vers le haut)
    ctx.beginPath();
    ctx.moveTo(x, height - padding);
    ctx.lineTo(x, padding);
    ctx.stroke();
    this.drawArrow(ctx, x, padding + 10, x, padding);

    // Graduations
    for (let v = min, i = 0; v <= max + (step/2); v += step, i++) {
      const val = this.round(v, step);
      const y = (height - padding) - ((val - min) / range) * axisLen;
      const isMajor = i % labelFreq === 0;

      ctx.beginPath();
      ctx.moveTo(x - (isMajor ? 8 : 4), y);
      ctx.lineTo(x + (isMajor ? 8 : 4), y);
      ctx.stroke();

      if (showNumbers && isMajor) {
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 12px Lexend Deca, sans-serif';
        ctx.fillText(val.toString().replace('.', ','), x - 15, y);
      }
    }
  }

  drawPoints() {
    const { ctx } = this;
    const { min, max, orientation, width, height, points } = this.config;
    const padding = (orientation === 'horizontal' ? 40 : 35);
    const range = max - min;
    const axisLen = (orientation === 'horizontal' ? width : height) - padding * 2;

    points.forEach(p => {
      const ratio = (p.value - min) / range;
      ctx.fillStyle = p.color || this.primaryColor;
      
      const px = orientation === 'horizontal' ? padding + ratio * axisLen : width / 2;
      const py = orientation === 'horizontal' ? height / 2 : (height - padding) - ratio * axisLen;

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.font = 'bold 14px Lexend Deca, sans-serif';
      ctx.textAlign = orientation === 'horizontal' ? 'center' : 'left';
      ctx.fillText(p.label, px + (orientation === 'horizontal' ? 0 : 12), py - (orientation === 'horizontal' ? 15 : 0));
    });
  }

  parseAttributes() {
    const a = ['min', 'max', 'step', 'width', 'height'];
    a.forEach(at => { if(this.hasAttribute(at)) this.config[at] = parseFloat(this.getAttribute(at)); });
    if(this.hasAttribute('orientation')) this.config.orientation = this.getAttribute('orientation');
    if(this.hasAttribute('points')) {
        try { this.config.points = JSON.parse(this.getAttribute('points')); }
        catch(e) { this.config.points = []; }
    }
  }
}

customElements.define('math974-axe-gradue', AxeGradueComponent);