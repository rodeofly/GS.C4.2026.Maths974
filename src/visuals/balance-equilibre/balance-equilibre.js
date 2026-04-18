// src/visuals/balance-equilibre/balance-equilibre.js
// Web Component — Balance Roberval avec équation algébrique
//
// Config attrs : equation, object, level, width (ignoré, calculé), height
//
// equation : "3x + 20 = 50"  |  "2x + 10 = 20 + 30"  |  "3x = 42"
//   termes variables  → "3x", "x", "2y"   → objets côte à côte sur le plateau
//   constantes        → "25", "100"        → poids (disques calibrés)
//
// object : emoji pour les variables ("📦" "🍅" "🥫" …) ou "letter" (boîte+lettre)
// level  : 1=emoji  2=boîte+lettre  3=texte équation
//
// La largeur du canvas est calculée dynamiquement depuis l'équation.
// Hover sur les objets variables → tooltip réponse.

class BalanceEquilibreComponent extends HTMLElement {
  static get observedAttributes() {
    return ['equation', 'object', 'level', 'height'];
  }
  connectedCallback()        { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  // ── Parser ────────────────────────────────────────────────────────────────
  _parseEquation(eq) {
    const parts = eq.split('=').map(s => s.trim());
    if (parts.length !== 2) return { left: [], right: [] };
    return { left: this._parseMember(parts[0]), right: this._parseMember(parts[1]) };
  }

  _parseMember(str) {
    return str
      .split(/\s*\+\s*/)
      .map(t => t.trim())
      .filter(Boolean)
      .map(token => {
        const m = token.match(/^(\d*)([a-zA-Z])$/);
        if (m) return { type: 'var', letter: m[2], count: parseInt(m[1] || '1') };
        const n = parseInt(token);
        return isNaN(n) ? null : { type: 'weight', value: n };
      })
      .filter(Boolean);
  }

  // ── Résolution linéaire (1 variable) ─────────────────────────────────────
  _solve(left, right) {
    let coeff = 0, cst = 0, letter = null;
    for (const t of left)  { if (t.type === 'var') { coeff += t.count; letter = t.letter; } else cst -= t.value; }
    for (const t of right) { if (t.type === 'var') { coeff -= t.count; letter = t.letter; } else cst += t.value; }
    if (coeff === 0) return null;
    const val = cst / coeff;
    return { letter, value: Number.isInteger(val) ? val : Math.round(val * 100) / 100 };
  }

  // ── Rayon d'un poids (4 tailles discrètes) ───────────────────────────────
  _weightRadius(v) {
    if (v <= 10)  return 13;
    if (v <= 50)  return 17;
    if (v <= 200) return 21;
    return 25;
  }

  // ── Largeur interne d'un membre (px) ─────────────────────────────────────
  _memberWidth(tokens) {
    const emojiSz = 28, gap = 8;
    let w = 0, first = true;
    for (const t of tokens) {
      if (!first) w += gap;
      first = false;
      if (t.type === 'var') w += t.count * emojiSz + Math.max(0, t.count - 1) * gap;
      else w += this._weightRadius(t.value) * 2;
    }
    return w;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  render() {
    this.innerHTML = '';
    this._hovered  = false;
    this._hitBoxes = [];

    const eq  = this.getAttribute('equation') || '3x + 10 = 40';
    const obj = this.getAttribute('object')   || '📦';
    const lvl = parseInt(this.getAttribute('level'))  || 1;
    const H   = parseInt(this.getAttribute('height')) || 105;

    const { left, right } = this._parseEquation(eq);
    this._solution = this._solve(left, right);
    this._left = left; this._right = right;
    this._obj = obj;   this._lvl  = lvl;
    this._H   = H;

    if (lvl === 3) { this._renderEquationText(eq, H); return; }

    // Largeur calculée depuis le contenu — plateaux identiques (symétrie visuelle)
    const PAD       = 18;
    const ARROW_W   = 50;
    const leftInner  = this._memberWidth(left);
    const rightInner = this._memberWidth(right);
    const plateW     = Math.max(leftInner + PAD * 2, rightInner + PAD * 2, 65);
    const leftPlateW  = plateW;
    const rightPlateW = plateW;
    const W = plateW * 2 + ARROW_W;

    this._W           = W;
    this._leftPlateW  = leftPlateW;
    this._rightPlateW = rightPlateW;
    this._arrowZoneW  = ARROW_W;

    const canvas = document.createElement('canvas');
    canvas.width  = W * 2;
    canvas.height = H * 2;
    canvas.style.width    = W + 'px';
    canvas.style.maxWidth = '100%';
    canvas.style.height   = H + 'px';
    canvas.style.display  = 'block';
    canvas.style.margin   = '0 auto';

    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    this.canvas = canvas;
    this.ctx    = ctx;
    this.appendChild(canvas);

    canvas.addEventListener('mousemove',  e => this._onMove(e));
    canvas.addEventListener('mouseleave', () => this._onLeave());

    this._draw();
  }

  _renderEquationText(eq, H) {
    const div = document.createElement('div');
    div.style.cssText = `display:flex;align-items:center;justify-content:center;
      width:100%;height:${H}px;font:bold 18px serif;color:#1e293b;`;
    div.textContent = eq;
    this.appendChild(div);
  }

  // ── Hover ─────────────────────────────────────────────────────────────────
  _onMove(e) {
    if (!this._hitBoxes.length || !this._solution) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this._W / rect.width;
    const scaleY = this._H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
    const hit = this._hitBoxes.some(b => mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h);
    if (hit !== this._hovered) {
      this._hovered = hit;
      this.canvas.style.cursor = hit ? 'help' : 'default';
      this._draw();
    }
  }

  _onLeave() {
    if (this._hovered) { this._hovered = false; this.canvas.style.cursor = 'default'; this._draw(); }
  }

  // ── Dessin principal ──────────────────────────────────────────────────────
  _draw() {
    const { ctx, _W: W, _H: H, _leftPlateW: leftPlateW, _arrowZoneW: ARROW_W } = this;
    ctx.clearRect(0, 0, W, H);
    this._hitBoxes = [];

    // Géométrie — plateau aligné en bas, flèche monte depuis le bas
    const plateY    = H - 34;        // y de la ligne de plateau
    const leftPlatR  = leftPlateW;
    const rightPlatL = leftPlateW + ARROW_W;
    const pivotX     = leftPlateW + ARROW_W / 2;

    // ── Plateaux ────────────────────────────────────────────────────────────
    ctx.strokeStyle = '#374151';
    ctx.lineWidth   = 2.5;

    ctx.beginPath(); ctx.moveTo(0,          plateY); ctx.lineTo(leftPlatR,  plateY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rightPlatL, plateY); ctx.lineTo(W,          plateY); ctx.stroke();

    // ── Flèche ↑ (fulcrum, montant depuis le bas) ───────────────────────────
    this._drawArrowUp(ctx, pivotX, plateY + 2, plateY);

    // ── Membres (éléments à plat sur le plateau) ─────────────────────────────
    this._drawMemberFlat(ctx, this._left,  0,          leftPlatR,  plateY);
    this._drawMemberFlat(ctx, this._right, rightPlatL, W,          plateY);

    // ── Tooltip réponse au survol ─────────────────────────────────────────
    if (this._hovered && this._solution) {
      const s   = this._solution;
      const sym = this._obj !== 'letter' ? this._obj : s.letter;
      this._drawTooltip(ctx, pivotX, plateY - 20, `1 ${sym} = ${s.value}`);
    }
  }

  // ── Membre à plat (une rangée d'éléments côte à côte) ───────────────────
  _drawMemberFlat(ctx, tokens, platL, platR, plateY) {
    if (!tokens.length) return;
    const platCX  = (platL + platR) / 2;
    const emojiSz = 28, gap = 8;
    const totalW  = this._memberWidth(tokens);
    let x = platCX - totalW / 2;

    let firstToken = true;
    for (const t of tokens) {
      if (!firstToken) x += gap;
      firstToken = false;

      if (t.type === 'var') {
        for (let i = 0; i < t.count; i++) {
          if (i > 0) x += gap;
          this._drawObject(ctx, x + emojiSz / 2, plateY, this._obj, t.letter, this._lvl, emojiSz);
          this._hitBoxes.push({ x, y: plateY - emojiSz - 2, w: emojiSz, h: emojiSz + 2 });
          x += emojiSz;
        }
      } else {
        const r = this._weightRadius(t.value);
        this._drawWeight(ctx, x + r, plateY - r, r, t.value);
        x += r * 2;
      }
    }
  }

  // ── Objet variable (emoji ou boîte+lettre) ────────────────────────────────
  _drawObject(ctx, cx, bottomY, object, letter, level, size) {
    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';

    if (level === 1 && object !== 'letter') {
      ctx.font = `${size}px serif`;
      ctx.fillText(object, cx, bottomY);
    } else {
      // Niveau 2 — boîte verte avec lettre
      ctx.fillStyle   = '#f0fdf4';
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth   = 1.8;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cx - size / 2, bottomY - size, size, size, 5);
      else ctx.rect(cx - size / 2, bottomY - size, size, size);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle    = '#166534';
      ctx.font         = `bold ${Math.round(size * 0.58)}px sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, cx, bottomY - size / 2);
    }
    ctx.restore();
  }

  // ── Poids (disque calibré) ─────────────────────────────────────────────────
  _drawWeight(ctx, cx, cy, r, value) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle   = '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth   = 1.3;
    ctx.stroke();
    ctx.fillStyle    = '#1e293b';
    ctx.font         = `bold ${r >= 20 ? 11 : r >= 16 ? 10 : 9}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value + 'g', cx, cy);
    ctx.restore();
  }

  // ── Flèche ↑ centrée ─────────────────────────────────────────────────────
  _drawArrowUp(ctx, x, tipY, baseY) {
    const headH = 8, headW = 6;
    ctx.save();
    ctx.strokeStyle = '#374151';
    ctx.fillStyle   = '#374151';
    ctx.lineWidth   = 1.8;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, tipY + headH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - headW, tipY + headH);
    ctx.lineTo(x, tipY);
    ctx.lineTo(x + headW, tipY + headH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Tooltip ───────────────────────────────────────────────────────────────
  _drawTooltip(ctx, x, tipY, text) {
    ctx.save();
    ctx.font = 'bold 12px sans-serif';
    const tw = ctx.measureText(text).width;
    const pw = 8, bh = 20, bw = tw + pw * 2;
    const bx = x - bw / 2, by = tipY - bh;

    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 5);
    else ctx.rect(bx, by, bw, bh);
    ctx.fillStyle = '#1e293b'; ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 5, by + bh); ctx.lineTo(x + 5, by + bh); ctx.lineTo(x, by + bh + 6);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle    = '#fff';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, by + bh / 2);
    ctx.restore();
  }
}

customElements.define('math974-balance-equilibre', BalanceEquilibreComponent);
