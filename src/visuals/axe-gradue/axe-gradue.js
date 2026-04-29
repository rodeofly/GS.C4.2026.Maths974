// src/visuals/axe-gradue/axe-gradue.js

import { toFraction } from '../../utils/number-utils.js';

class AxeGradueComponent extends HTMLElement {
  constructor() {
    super();
    this.config = {
      min: 0, max: 10, step: 1,
      orientation: 'horizontal',
      width: 800, height: 100,
      points: [], showNumbers: true,
      labelFrequency: 1,
      visibleLabels: null,
      mode: 'decimal', // decimal, fraction, mixed
      denominators: [2, 4, 5, 10]
    };
    this.hitRegions = [];
    this.hoveredPoint = null;
    this._studentAnswer = null;
    this._showSolution  = false;
  }

  connectedCallback() {
    this.style.display = 'block';
    this.style.marginTop = '0'; // Collé au texte pour gagner de la place
    this.render();
  }

  // 🛠️ UTILITAIRE : Précision mathématique pour éviter le bug "0,700000001"
  round(v, s) {
    const p = (s.toString().split('.')[1] || '').length;
    return parseFloat(v.toFixed(p));
  }

  // 🛠️ UTILITAIRE : Adapter dimensions selon orientation
  adjustDimensionsForOrientation() {
    if (this.config.orientation === 'vertical') {
      // Si dimensions par défaut horizontal (450x100), adapter pour vertical
      // SEULEMENT si width/height n'ont pas été explicitement définis dans la config
      if (this.config.width === 800 && (this.config.height === 80 || this.config.height === 100 || this.config.height === 120 || this.config.height === 160 || this.config.height === 200 || this.config.height === 300)) {
        this.config.width = 180; // Réduit pour ne pas prendre trop de place (max 1/3 largeur)
        this.config.height = 300; // Plus haut pour l'axe vertical
      }
    }
  }

  // 🛠️ UTILITAIRE : Marge interne unifiée (réduite pour gagner de la place)
  getPadding() {
    return 15;
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

  /**
   * Dessine une fraction ou un nombre mixte.
   */
  drawFractionLabel(ctx, x, y, fraction, style = {}) {
    ctx.save();
    const { n, d, integer, remainder } = fraction;
    const fontSize = style.fontSize || 20;
    const color = style.color || '#1e293b';
    const fontFamily = style.fontFamily || 'Lexend Deca, sans-serif';
    const align = style.align || 'center'; // center, right
    
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    
    const marginTop = 8; 
    const currentY = y + marginTop;

    // Cas 1 : Entier simple
    if (d === 1) {
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.fillText(n.toString(), x, currentY);
      return;
    }

    // Configuration fraction
    const fractionScale = 1.0; // Mode dfrac (taille normale)
    const fractionFontSize = fontSize * fractionScale;
    const padding = 4;
    
    ctx.font = `bold ${fractionFontSize}px ${fontFamily}`;
    
    // Mesures
    const numStr = (integer !== 0 ? remainder : Math.abs(n)).toString();
    const denStr = d.toString();
    const numMetrics = ctx.measureText(numStr);
    const denMetrics = ctx.measureText(denStr);
    const maxWidth = Math.max(numMetrics.width, denMetrics.width) + 4;
    
    let startX = x;

    // Cas 2 : Nombre Mixte (ex: 1 1/2)
    if (integer !== 0) {
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      const intStr = integer.toString();
      const intMetrics = ctx.measureText(intStr);
      
      // Ajustement position selon alignement
      const totalWidth = intMetrics.width + 8 + maxWidth;
      if (align === 'center') startX = x - totalWidth / 2 + intMetrics.width / 2;
      else if (align === 'right') startX = x - maxWidth - 8 - intMetrics.width/2; 
      
      // Centrage vertical de l'entier par rapport à la barre
      const barY = currentY + fractionFontSize + padding;
      ctx.save();
      ctx.textBaseline = 'middle';
      ctx.fillText(intStr, startX, barY);
      ctx.restore();
      
      startX += intMetrics.width / 2 + 8 + maxWidth / 2;
      ctx.font = `bold ${fractionFontSize}px ${fontFamily}`;
    }

    // Dessin de la fraction
    const barY = currentY + fractionFontSize + padding;
    
    ctx.textAlign = 'center'; // Toujours centrer num/den l'un par rapport à l'autre
    ctx.fillText(numStr, startX, currentY);
    
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(startX - maxWidth / 2, barY);
    ctx.lineTo(startX + maxWidth / 2, barY);
    ctx.stroke();
    
    ctx.fillText(denStr, startX, barY + padding + 2);
    ctx.restore();
  }

  render() {
    this.parseAttributes();
    this.adjustDimensionsForOrientation();
    this.innerHTML = '';
    const canvas = document.createElement('canvas');
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');

    // Support Haute Définition (Retina)
    canvas.width = this.config.width * 2;
    canvas.height = this.config.height * 2;
    canvas.style.width = '100%';
    canvas.style.height = 'auto'; // Garder le ratio d'aspect pour éviter les déformations
    if (this.config.orientation === 'vertical') {
      canvas.style.maxWidth = `min(${this.config.width}px, 33vw)`;
      canvas.style.maxHeight = this.config.height + 'px';
    } else {
      canvas.style.maxWidth = this.config.width + 'px';
      // Force une hauteur max stricte en horizontal pour tenir sur l'écran (5 questions)
      canvas.style.maxHeight = Math.min(this.config.height, 120) + 'px';
    }
    canvas.style.objectFit = 'contain';
    ctx.scale(2, 2);
    this.appendChild(canvas);

    // Récupération dynamique de la couleur du thème
    const style = getComputedStyle(document.documentElement);
    this.primaryColor = style.getPropertyValue('--color-guide-primary').trim() || '#0d9488';
    this.ctx = ctx;

    // Gestion des événements souris
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    // Mode placement : clic sur l'axe pour poser le point
    this._studentAnswer = null;
    this._showSolution  = false;
    if (this.config.placeTarget !== undefined) {
      this.dataset.solution  = String(this.config.placeTarget);
      this.dataset.placeMode = '1';
      canvas.style.cursor = 'crosshair';
      canvas.addEventListener('click', this.handleClick.bind(this));
    } else {
      delete this.dataset.placeMode;
      // Mode lecture : le point '?' expose sa valeur pour l'input texte
      const questionPoint = this.config.points?.find(p => p.label === '?');
      if (questionPoint !== undefined) {
        this.dataset.solution = String(questionPoint.value);
      } else {
        delete this.dataset.solution;
      }
    }

    this.draw();
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    // Calcul de l'échelle entre les pixels CSS et le système de coordonnées interne
    const scaleX = this.config.width / rect.width;
    const scaleY = this.config.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Détection de collision (cercle de rayon 10px pour faciliter le survol)
    const hit = this.hitRegions.find(p => {
      const dx = x - p.x;
      const dy = y - p.y;
      return dx * dx + dy * dy <= 100; // 10^2
    });

    if (hit !== this.hoveredPoint) {
      this.hoveredPoint = hit;
      if (this.config.placeTarget === undefined) {
        this.canvas.style.cursor = hit ? 'pointer' : 'default';
      }
      this.draw();
    }
  }

  handleMouseLeave() {
    if (this.hoveredPoint) {
      this.hoveredPoint = null;
      this.draw();
    }
  }

  toggleSolution() {
    this._showSolution  = !this._showSolution;
    if (this._showSolution) this._studentAnswer = null;
    this.draw();
    return this._showSolution;
  }

  handleClick(e) {
    const { min, max, step, width } = this.config;
    const padding = this.getPadding();
    const range   = max - min;
    const axisLen = width - padding * 2;
    const rect    = this.canvas.getBoundingClientRect();
    const scaleX  = width / rect.width;
    const rawVal  = min + ((e.clientX - rect.left) * scaleX - padding) / axisLen * range;
    const k       = Math.round((rawVal - min) / step);
    this._studentAnswer = parseFloat(Math.max(min, Math.min(max, min + k * step)).toFixed(10));
    this.draw();
  }

  draw() {
    const { ctx, config } = this;
    // Effacer le canvas
    ctx.clearRect(0, 0, config.width, config.height);

    if (config.orientation === 'horizontal') {
      this.drawHorizontalAxis();
    } else {
      this.drawVerticalAxis();
    }

    this.drawPoints();
    this.drawTooltip();
  }

  drawHorizontalAxis() {
    const { ctx } = this;
    const { min, max, step, width, height, showNumbers, labelFrequency, visibleLabels } = this.config;
    const padding = this.getPadding();
    const range = max - min;
    const axisLen = width - padding * 2;
    // Centrage vertical ajusté (45%) pour équilibrer points (haut) et fractions (bas)
    const y = height * 0.45;

    // Calcul densité des étiquettes (pas moins de 40px d'écart)
    const pxPerStep = (step / range) * axisLen;
    const labelFreq = pxPerStep < 40 ? Math.ceil(40 / pxPerStep) : 1;
    const finalFreq = Math.max(labelFrequency || 1, labelFreq);

    ctx.strokeStyle = '#1e293b';
    ctx.textBaseline = 'alphabetic'; // Force baseline standard
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

      let isMajor = false;
      if (visibleLabels && Array.isArray(visibleLabels) && visibleLabels.length > 0) {
        isMajor = visibleLabels.includes(val);
      } else {
        isMajor = i % finalFreq === 0;
      }

      ctx.beginPath();
      ctx.moveTo(x, y - (isMajor ? 8 : 4));
      ctx.lineTo(x, y + (isMajor ? 8 : 4));
      ctx.stroke();

      if (showNumbers && isMajor) {
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px Lexend Deca, sans-serif';

        if (this.config.mode === 'decimal') {
          ctx.fillText(val.toString().replace('.', ','), x, y + 30);
        } else {
          const frac = toFraction(val, { allowedDenominators: this.config.denominators });
          if (frac) {
            if (this.config.mode === 'fraction' && frac.d !== 1) {
              frac.integer = 0;
              frac.remainder = Math.abs(frac.n);
            }
            this.drawFractionLabel(ctx, x, y + 5, frac, {
              fontSize: 20,
              color: '#1e293b'
            });
          } else {
            ctx.fillText(val.toString().replace('.', ','), x, y + 30);
          }
        }
      }
    }
  }

  drawVerticalAxis() {
    const { ctx } = this;
    const { min, max, step, width, height, showNumbers, labelFrequency, visibleLabels } = this.config;
    const padding = this.getPadding();
    const range = max - min;
    const axisLen = height - padding * 2;
    const x = width / 2;

    const pxPerStep = (step / range) * axisLen;
    const labelFreq = pxPerStep < 40 ? Math.ceil(40 / pxPerStep) : 1;
    const finalFreq = Math.max(labelFrequency || 1, labelFreq);

    ctx.save(); // Isoler le contexte pour ne pas polluer textBaseline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;

    // Ligne et Flèche (vers le haut)
    ctx.beginPath();
    ctx.moveTo(x, height - padding);
    ctx.lineTo(x, padding);
    ctx.stroke();
    this.drawArrow(ctx, x, padding + 15, x, padding);

    // Graduations
    for (let v = min, i = 0; v <= max + (step/2); v += step, i++) {
      const val = this.round(v, step);
      const y = (height - padding) - ((val - min) / range) * axisLen;
      
      let isMajor = false;
      if (visibleLabels && Array.isArray(visibleLabels) && visibleLabels.length > 0) {
        isMajor = visibleLabels.includes(val);
      } else {
        isMajor = i % finalFreq === 0;
      }

      ctx.beginPath();
      ctx.moveTo(x - (isMajor ? 8 : 4), y);
      ctx.lineTo(x + (isMajor ? 8 : 4), y);
      ctx.stroke();

      if (showNumbers && isMajor) {
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 20px Lexend Deca, sans-serif';
        const labelX = x - 20;
        
        if (this.config.mode === 'decimal') {
          ctx.fillText(val.toString().replace('.', ','), labelX, y);
        } else {
          // Fallback simple pour vertical pour l'instant (ou implémentation align right)
          const frac = toFraction(val, { allowedDenominators: this.config.denominators });
          if (frac && frac.d !== 1) {
             // Pour vertical, on affiche "1 1/2" en texte simple pour éviter complexité dessin
             // Ou on utilise drawFractionLabel avec un offset Y manuel car il dessine en 'top'
             // Simplification : affichage texte type "3/4"
             const txt = this.config.mode === 'mixed' && frac.integer !== 0 
               ? `${frac.integer} ${frac.remainder}/${frac.d}`
               : `${frac.n}/${frac.d}`;
             ctx.fillText(txt, labelX, y);
          } else {
             ctx.fillText(val.toString().replace('.', ','), labelX, y);
          }
        }
      }
    }
    ctx.restore();
  }

  drawPoints() {
    const { ctx } = this;
    const { min, max, orientation, width, height, points } = this.config;
    const padding = this.getPadding();
    const range = max - min;
    const axisLen = (orientation === 'horizontal' ? width : height) - padding * 2;
    this.hitRegions = [];

    points.forEach(p => {
      const ratio = (p.value - min) / range;
      ctx.fillStyle = p.color || this.primaryColor;
      
      const px = orientation === 'horizontal' ? padding + ratio * axisLen : width / 2;
      const py = orientation === 'horizontal' ? height * 0.45 : (height - padding) - ratio * axisLen;

      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.font = 'bold 20px Lexend Deca, sans-serif';
      ctx.textAlign = orientation === 'horizontal' ? 'center' : 'left';
      ctx.textBaseline = 'alphabetic'; // FIX: Force baseline pour éviter le saut aléatoire
      // Remonter les labels (20px pour rapprocher les lettres de l'axe)
      ctx.fillText(p.label, px + (orientation === 'horizontal' ? 0 : 15), py - (orientation === 'horizontal' ? 20 : 0));
      
      // Enregistrer la zone de collision
      this.hitRegions.push({ x: px, y: py, value: p.value, label: p.label });
    });

    // Mode placement : dessiner le point (solution ou réponse élève)
    if (this.config.placeTarget !== undefined) {
      let drawVal = null, isCorrect = false;
      if (this._showSolution) {
        drawVal   = this.config.placeTarget;
        isCorrect = true;
      } else if (this._studentAnswer !== null) {
        drawVal   = this._studentAnswer;
        isCorrect = Math.abs(drawVal - this.config.placeTarget) < this.config.step * 0.01;
      }
      if (drawVal !== null) {
        const ratio = (drawVal - min) / range;
        const px = orientation === 'horizontal' ? padding + ratio * axisLen : width / 2;
        const py = orientation === 'horizontal' ? height * 0.45 : (height - padding) - ratio * axisLen;
        const label = this.config.placeLabel || 'A';

        ctx.fillStyle = isCorrect ? '#16a34a' : '#dc2626';
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 20px Lexend Deca, sans-serif';
        ctx.textAlign = orientation === 'horizontal' ? 'center' : 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(label + (isCorrect ? ' ✓' : ' ✗'), px + (orientation === 'horizontal' ? 0 : 15), py - (orientation === 'horizontal' ? 20 : 0));
      }
    }
  }

  drawTooltip() {
    if (!this.hoveredPoint) return;
    const { ctx } = this;
    const p = this.hoveredPoint;
    const text = `${p.value}`;

    ctx.save();
    ctx.font = 'bold 12px Lexend Deca, sans-serif';
    const textMetrics = ctx.measureText(text);
    const padding = 6;
    const w = textMetrics.width + padding * 2;
    const h = 24;
    const x = p.x - w / 2;
    const y = p.y - 50; // Au-dessus du point et du label

    // Fond de l'infobulle
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)'; // Slate 800
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 4);
    else ctx.rect(x, y, w, h); // Fallback
    ctx.fill();

    // Petit triangle vers le bas
    ctx.beginPath();
    ctx.moveTo(p.x, y + h + 5);
    ctx.lineTo(p.x - 5, y + h);
    ctx.lineTo(p.x + 5, y + h);
    ctx.fill();

    // Texte
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, p.x, y + h / 2);
    ctx.restore();
  }

  parseAttributes() {
    const a = ['min', 'max', 'step', 'width', 'height', 'labelFrequency'];
    a.forEach(at => { if(this.hasAttribute(at)) this.config[at] = parseFloat(this.getAttribute(at)); });
    if(this.hasAttribute('orientation')) this.config.orientation = this.getAttribute('orientation');
    if(this.hasAttribute('points')) {
        try { this.config.points = JSON.parse(this.getAttribute('points')); }
        catch(e) { this.config.points = []; }
    }
    if(this.hasAttribute('visibleLabels')) {
        try { this.config.visibleLabels = JSON.parse(this.getAttribute('visibleLabels')); }
        catch(e) { this.config.visibleLabels = null; }
    }
    if(this.hasAttribute('mode')) this.config.mode = this.getAttribute('mode');
    if(this.hasAttribute('placeTarget')) this.config.placeTarget = parseFloat(this.getAttribute('placeTarget'));
    if(this.hasAttribute('placeLabel'))  this.config.placeLabel  = this.getAttribute('placeLabel');
    if(this.hasAttribute('denominators')) {
        try { 
          const d = JSON.parse(this.getAttribute('denominators'));
          if(Array.isArray(d)) this.config.denominators = d;
          else if(typeof d === 'string') this.config.denominators = d.split(',').map(Number);
        } catch(e) { 
           // Fallback si format simple "2,4,5" passé en string sans JSON
           if (this.getAttribute('denominators').includes(',')) {
             this.config.denominators = this.getAttribute('denominators').split(',').map(Number);
           }
        }
    }
  }
}

customElements.define('math974-axe-gradue', AxeGradueComponent);

export const defaultPosition = 'north';

export function randomize(config, rand) {
  // Mode placement : tirage d'une graduation aléatoire dans l'axe courant
  if (config.placeTarget !== undefined) {
    const { min, max, step } = config;
    const prec = step < 1 ? 2 : 0;
    const ticks = [];
    for (let v = min; v <= max + step / 10; v += step)
      ticks.push(parseFloat(v.toFixed(prec)));
    const newTarget = ticks[Math.floor(Math.random() * ticks.length)];
    return { ...config, placeTarget: newTarget };
  }

  const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const rItem = arr => arr[Math.floor(Math.random() * arr.length)];
  const prefs = { minRange: [-10, 0], countRange: [5, 10], steps: [1, 0.5, 2], visibleRange: [2, 4], pointsRange: [2, 3], snap: true, ...(rand || {}) };
  let steps = (prefs.steps || [1]).map(Number).filter(s => s > 0);
  if (!steps.length) steps = [1];
  const mode = config.mode || 'decimal';
  if ((mode === 'fraction' || mode === 'mixed') && config.denominators) {
    let d = config.denominators;
    if (typeof d === 'string') d = d.split(',').map(Number);
    if (Array.isArray(d) && d.length) steps = d.map(v => 1 / v);
  }
  const minR     = (prefs.minRange || [-10, 0]).map(Number);
  const cntR     = (prefs.countRange || [5, 10]).map(Number);
  const visR     = (prefs.visibleRange || [2, 4]).map(Number);
  const ptR      = (prefs.pointsRange || [2, 3]).map(Number);
  const minStepV = prefs.minStep ? Number(prefs.minStep) : null;
  const newMin   = minStepV
    ? ri(Math.ceil(minR[0] / minStepV), Math.floor(minR[1] / minStepV)) * minStepV
    : ri(minR[0], minR[1]);
  const newStep = rItem(steps);
  const newMax  = newMin + ri(cntR[0], cntR[1]) * newStep;
  const prec = newStep < 1 ? 2 : (newStep % 1 === 0 ? 0 : 1);
  const allTicks = [];
  for (let v = newMin; v <= newMax + newStep / 10; v += newStep)
    allTicks.push(parseFloat(v.toFixed(prec)));
  const nbVis = Math.min(allTicks.length, ri(visR[0], visR[1]));
  const visibleLabels = [...allTicks].sort(() => 0.5 - Math.random()).slice(0, nbVis).sort((a, b) => a - b);
  const snap = v => {
    if (!prefs.snap) return parseFloat(v.toFixed(2));
    const k = Math.round((v - newMin) / newStep);
    return parseFloat(Math.max(newMin, Math.min(newMax, newMin + k * newStep)).toFixed(10));
  };
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ptLabels = Array.isArray(prefs.pointLabels) ? prefs.pointLabels : null;
  const newPoints = [];
  for (let i = 0; i < ri(ptR[0], ptR[1]); i++) {
    let val = snap(newMin + Math.random() * (newMax - newMin));
    for (let t = 0; t < 5; t++) { if (!visibleLabels.includes(val)) break; val = snap(newMin + Math.random() * (newMax - newMin)); }
    if (!newPoints.some(p => Math.abs(p.value - val) < 0.001)) {
      const label = ptLabels ? ptLabels[i % ptLabels.length] : alpha[Math.floor(Math.random() * alpha.length)];
      const color = label === '?' ? '#dc2626' : '#f59e0b';
      newPoints.push({ label, value: parseFloat(val.toFixed(2)), color });
    }
  }
  return { ...config, min: newMin, max: newMax, step: newStep, points: newPoints, visibleLabels };
}
