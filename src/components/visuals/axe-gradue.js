// src/components/visuals/axe-gradue.js

class AxeGradueComponent extends HTMLElement {
  constructor() {
    super();
    this.config = { min: 0, max: 10, step: 1, orientation: 'horizontal', width: 450, height: 100, points: [], showNumbers: true };
  }

  connectedCallback() { this.render(); }

  // 🛠️ FIX : Précision mathématique pour unités, dixièmes, centièmes
  round(v, s) { 
    const p = (s.toString().split('.')[1] || '').length;
    return parseFloat(v.toFixed(p));
  }

  render() {
    this.parseAttributes();
    this.innerHTML = '';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Support Retina
    canvas.width = this.config.width * 2;
    canvas.height = this.config.height * 2;
    canvas.style.width = '100%';
    ctx.scale(2, 2);
    this.appendChild(canvas);

    const { min, max, step, orientation, width, height, points, showNumbers } = this.config;
    const padding = 40;
    const range = max - min;
    const axisLen = (orientation === 'horizontal' ? width : height) - padding * 2;
    
    // 🛠️ LOGIQUE DE DENSITÉ : Affiche les labels seulement si l'espace > 40px
    const pxPerStep = (step / range) * axisLen;
    const labelFreq = pxPerStep < 40 ? Math.ceil(40 / pxPerStep) : 1;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.font = 'bold 12px Lexend Deca, sans-serif';

    if (orientation === 'horizontal') {
      const y = height / 2;
      ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(width - padding, y); ctx.stroke();
      for (let v = min, i = 0; v <= max + (step/2); v += step, i++) {
        const val = this.round(v, step);
        const x = padding + ((val - min) / range) * axisLen;
        const isMajor = i % labelFreq === 0;
        ctx.beginPath();
        ctx.moveTo(x, y - (isMajor ? 8 : 4)); ctx.lineTo(x, y + (isMajor ? 8 : 4));
        ctx.stroke();
        if (showNumbers && isMajor) {
          ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center';
          ctx.fillText(val.toString().replace('.', ','), x, y + 25);
        }
      }
    } else {
      // 🛠️ AXE VERTICAL PROPRE
      const x = width / 2;
      ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, height - padding); ctx.stroke();
      for (let v = min, i = 0; v <= max + (step/2); v += step, i++) {
        const val = this.round(v, step);
        const y = (height - padding) - ((val - min) / range) * axisLen;
        const isMajor = i % labelFreq === 0;
        ctx.beginPath();
        ctx.moveTo(x - (isMajor ? 8 : 4), y); ctx.lineTo(x + (isMajor ? 8 : 4), y);
        ctx.stroke();
        if (showNumbers && isMajor) {
          ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          ctx.fillText(val.toString().replace('.', ','), x - 15, y);
        }
      }
    }

    // Dessin des points (A, B, C...)
    points.forEach(p => {
      const ratio = (p.value - min) / range;
      ctx.fillStyle = p.color || '#0d9488';
      const px = orientation === 'horizontal' ? padding + ratio * axisLen : width / 2;
      const py = orientation === 'horizontal' ? height / 2 : (height - padding) - ratio * axisLen;
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(p.label, px, py - 15);
    });
  }

  parseAttributes() {
    const a = ['min', 'max', 'step', 'width', 'height'];
    a.forEach(at => { if(this.hasAttribute(at)) this.config[at] = parseFloat(this.getAttribute(at)); });
    if(this.hasAttribute('orientation')) this.config.orientation = this.getAttribute('orientation');
    if(this.hasAttribute('points')) this.config.points = JSON.parse(this.getAttribute('points'));
  }
}
customElements.define('math974-axe-gradue', AxeGradueComponent);