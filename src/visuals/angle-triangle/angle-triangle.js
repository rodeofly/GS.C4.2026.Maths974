// src/visuals/angle-triangle/angle-triangle.js
// Web Component — Triangle avec angles connus et 1 angle inconnu (?)
//
// Config attrs : seed, width, height, mode
//               angles=[A,B,C] (JSON), unknown=0|1|2, letters=["X","Y","Z"]
//
// Modes :
//   scalene     (défaut) — triangle quelconque, 3 angles différents
//   isoscele              — apex à P0, base angles égaux en P1/P2 (codage : 1 tiret sur jambes)
//   equilateral           — 60°/60°/60°, 0 valeur affichée (codage : 1 tiret sur tous les côtés)
//   scalene-rect          — angle droit en P1 (carré), angles P0 et P2 quelconques
//   isoscele-rect         — angle droit en P0 (carré), jambes égales P0-P1 et P0-P2 (1 tiret)
//
// Convention du nom de l'angle à l'indice i :
//   letters[(i+2)%3] ^ letters[i] letters[(i+1)%3]
//   ex. unknown=0, letters=["O","K","T"] → T̂OK = \widehat{TOK}

class AngleTriangleComponent extends HTMLElement {
  static get observedAttributes() {
    return ['seed', 'width', 'height', 'mode', 'angles', 'unknown', 'letters'];
  }

  connectedCallback()        { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  // ── PRNG LCG déterministe ────────────────────────────────────────────────
  makePRNG(seed) {
    let s = 0;
    for (const ch of String(seed)) s = (Math.imul(s, 31) + ch.charCodeAt(0)) | 0;
    s = (s >>> 0) || 1;
    return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
  }
  ri(rand, min, max) { return min + Math.floor(rand() * (max - min + 1)); }

  parseAttributes() {
    this.cfg = {
      seed:    this.getAttribute('seed')    || 'triangle',
      width:   parseInt(this.getAttribute('width'))  || 220,
      height:  parseInt(this.getAttribute('height')) || 160,
      mode:    this.getAttribute('mode')    || 'scalene',
      angles:  this.getAttribute('angles')  || null,
      unknown: this.getAttribute('unknown') || null,
      letters: this.getAttribute('letters') || null,
    };
  }

  render() {
    this.parseAttributes();
    this.innerHTML = '';
    this.hoveredAnswer = null;
    this.hitRegion    = null;

    const { width, height } = this.cfg;
    const canvas = document.createElement('canvas');
    canvas.width  = width  * 2;
    canvas.height = height * 2;
    canvas.style.width     = '100%';
    canvas.style.height    = '100%';
    canvas.style.maxWidth  = width  + 'px';
    canvas.style.maxHeight = height + 'px';
    canvas.style.objectFit = 'contain';

    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    this.canvas = canvas;
    this.ctx    = ctx;
    this.appendChild(canvas);

    const style = getComputedStyle(document.documentElement);
    this.primaryColor = style.getPropertyValue('--color-guide-primary').trim() || '#0d9488';

    canvas.addEventListener('mousemove',  this._onMove.bind(this));
    canvas.addEventListener('mouseleave', this._onLeave.bind(this));

    this.draw();
  }

  _onMove(e) {
    if (!this.hitRegion) return;
    const rect = this.canvas.getBoundingClientRect();
    const sx = this.cfg.width  / rect.width;
    const sy = this.cfg.height / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top)  * sy;
    const { x, y, r, answer } = this.hitRegion;
    const hit = Math.hypot(mx - x, my - y) < r;
    if (hit !== (this.hoveredAnswer !== null)) {
      this.hoveredAnswer = hit ? answer : null;
      this.canvas.style.cursor = hit ? 'help' : 'default';
      this.draw();
    }
  }

  _onLeave() {
    if (this.hoveredAnswer !== null) {
      this.hoveredAnswer = null;
      this.canvas.style.cursor = 'default';
      this.draw();
    }
  }

  // ── Génération d'angles selon le mode ────────────────────────────────────
  _generateAnglesByMode(rand, mode) {
    if (mode === 'equilateral') {
      return { angles: [60, 60, 60], unknownIdx: this.ri(rand, 0, 2) };
    }
    if (mode === 'isoscele') {
      // Générer depuis l'angle de base B : apex A = 180-2B
      const B = this.ri(rand, 15, 80);
      const A = 180 - 2 * B;
      return { angles: [A, B, B], unknownIdx: this.ri(rand, 0, 2) };
    }
    if (mode === 'scalene-rect') {
      // Angle droit en index 1
      const A = this.ri(rand, 15, 75);
      const C = 90 - A;
      const unknownIdx = rand() < 0.5 ? 0 : 2;
      return { angles: [A, 90, C], unknownIdx };
    }
    if (mode === 'isoscele-rect') {
      // Angle droit en index 0 (apex), jambes égales en 1 et 2
      const unknownIdx = rand() < 0.5 ? 1 : 2;
      return { angles: [90, 45, 45], unknownIdx };
    }
    // Défaut : scalène quelconque
    const A = this.ri(rand, 25, 130);
    const maxB = Math.min(130, 155 - A);
    const B = maxB >= 25 ? this.ri(rand, 25, maxB) : 25;
    return { angles: [A, B, 180 - A - B], unknownIdx: this.ri(rand, 0, 2) };
  }

  // ── Indices des côtés avec tirets (codage égalité) ────────────────────────
  // Retourne [[idxA, idxB, nbTirets], ...]
  _getSideTicks(mode) {
    if (mode === 'equilateral')    return [[0, 1, 1], [1, 2, 1], [0, 2, 1]];
    if (mode === 'isoscele' ||
        mode === 'isoscele-rect')  return [[0, 1, 1], [0, 2, 1]];
    return [];
  }

  // ── Index du sommet à angle droit (-1 si aucun) ──────────────────────────
  _getRightAngleIdx(mode) {
    if (mode === 'scalene-rect')  return 1;
    if (mode === 'isoscele-rect') return 0;
    return -1;
  }

  // ── Indices des angles connus à afficher en degrés ───────────────────────
  // (minimum de données selon le mode)
  _getShownKnownIndices(angles, unknownIdx, mode) {
    const shown = new Set([0, 1, 2]);
    shown.delete(unknownIdx); // l'inconnu affiche son widehat, pas sa valeur

    if (mode === 'equilateral') {
      shown.clear(); // 0 valeur affichée — tout est déductible du codage
      return shown;
    }

    if (mode === 'isoscele') {
      // Masquer un angle de base (égal à l'autre par codage)
      // On garde toujours le dernier de la paire qui n'est pas l'inconnu
      const hideIdx = unknownIdx === 2 ? 1 : 2;
      shown.delete(hideIdx);
    }

    if (mode === 'isoscele-rect') {
      shown.delete(0); // angle droit affiché par le carré, pas en degrés
      // Masquer le second 45° (égal à l'inconnu par codage)
      const hideIdx = unknownIdx === 2 ? 1 : 2;
      shown.delete(hideIdx);
    }

    if (mode === 'scalene-rect') {
      shown.delete(1); // angle droit affiché par le carré
    }

    return shown;
  }

  // ── Bissectrice intérieure (normalisée) ───────────────────────────────────
  _bisector(pts, i) {
    const [vx, vy] = pts[i];
    const [ax, ay] = pts[(i + 1) % 3];
    const [bx, by] = pts[(i + 2) % 3];
    const da = Math.hypot(ax - vx, ay - vy) || 1;
    const db = Math.hypot(bx - vx, by - vy) || 1;
    const ux = (ax - vx) / da + (bx - vx) / db;
    const uy = (ay - vy) / da + (by - vy) / db;
    const ul = Math.hypot(ux, uy);
    return ul < 0.001 ? [-uy, ux] : [ux / ul, uy / ul];
  }

  // ── Distance depuis (vx,vy) le long de (dx,dy) jusqu'au segment [a,b] ────
  _raySegDist(vx, vy, dx, dy, a, b) {
    const [ax, ay] = a, [bx, by] = b;
    const ex = bx - ax, ey = by - ay;
    const cross = dx * ey - dy * ex;
    if (Math.abs(cross) < 1e-10) return Infinity;
    const t = ((ax - vx) * ey - (ay - vy) * ex) / cross;
    const u = ((ax - vx) * dy - (ay - vy) * dx) / cross;
    if (t > 1e-5 && u >= -1e-5 && u <= 1 + 1e-5) return t;
    return Infinity;
  }

  // ── Carré de l'angle droit ────────────────────────────────────────────────
  _drawRightAngleSquare(ctx, vx, vy, a1, a2, color) {
    const s = 8;
    const u1x = Math.cos(a1) * s, u1y = Math.sin(a1) * s;
    const u2x = Math.cos(a2) * s, u2y = Math.sin(a2) * s;
    ctx.beginPath();
    ctx.moveTo(vx + u1x,             vy + u1y);
    ctx.lineTo(vx + u1x + u2x,       vy + u1y + u2y);
    ctx.lineTo(vx + u2x,             vy + u2y);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.3;
    ctx.stroke();
  }

  // ── Tiret(s) de codage sur un côté ───────────────────────────────────────
  _drawSideTick(ctx, ax, ay, bx, by, count) {
    const mx = (ax + bx) / 2, my = (ay + by) / 2;
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const dx = (bx - ax) / len, dy = (by - ay) / len;
    const px = -dy, py = dx; // perpendiculaire
    const tickLen = 6, spacing = 3.5;
    const start = -(count - 1) * spacing / 2;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth   = 1.5;
    for (let k = 0; k < count; k++) {
      const off = start + k * spacing;
      ctx.beginPath();
      ctx.moveTo(mx + dx * off - px * tickLen / 2, my + dy * off - py * tickLen / 2);
      ctx.lineTo(mx + dx * off + px * tickLen / 2, my + dy * off + py * tickLen / 2);
      ctx.stroke();
    }
  }

  // ── Widehat ^ au-dessus d'un texte centré en (cx, cy) ────────────────────
  _drawWidehat(ctx, cx, cy, text, color) {
    ctx.save();
    ctx.font        = '11px sans-serif';
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';

    const tw     = ctx.measureText(text).width;
    const hatH   = 6, gap = 1, textH = 11;
    const totalH = hatH + gap + textH;

    const topY    = cy - totalH / 2;
    const baseY   = topY + hatH;
    const textTop = baseY + gap;

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - tw / 2 - 1, baseY);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx + tw / 2 + 1, baseY);
    ctx.stroke();

    ctx.fillText(text, cx, textTop);
    ctx.restore();
  }

  draw() {
    const { ctx, cfg } = this;
    const { width, height, seed } = cfg;
    const rand = this.makePRNG(seed);
    ctx.clearRect(0, 0, width, height);

    const mode = cfg.mode || 'scalene';

    // ── 1. Angles et indice de l'inconnu ──────────────────────────────────
    let angles, unknownIdx;
    if (cfg.angles) {
      try { const p = JSON.parse(cfg.angles); angles = p.map(v => parseInt(v)); }
      catch (e) { angles = [60, 70, 50]; }
      unknownIdx = cfg.unknown !== null ? parseInt(cfg.unknown) : 0;
    } else {
      ({ angles, unknownIdx } = this._generateAnglesByMode(rand, mode));
    }

    // ── 2. Lettres ────────────────────────────────────────────────────────
    let letters;
    if (cfg.letters) {
      try { letters = JSON.parse(cfg.letters); } catch (e) { letters = ['A','B','C']; }
    } else {
      const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      for (let i = 0; i < 3; i++) {
        const j = i + Math.floor(rand() * (pool.length - i));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      letters = pool.slice(0, 3);
    }

    // ── 3. Préparation des règles de codage / affichage ───────────────────
    const sideTicks      = this._getSideTicks(mode);
    const rightAngleIdx  = this._getRightAngleIdx(mode);
    const shownKnown     = this._getShownKnownIndices(angles, unknownIdx, mode);

    // ── 4. Construction par loi des sinus ──────────────────────────────────
    const toRad = d => d * Math.PI / 180;
    const Ar = toRad(angles[0]), Br = toRad(angles[1]), Cr = toRad(angles[2]);
    const c = Math.sin(Cr) / Math.sin(Ar);
    const normPts = [
      [c * Math.cos(Br), -c * Math.sin(Br)],
      [0, 0],
      [1, 0],
    ];

    // ── 5. Pré-calcul bbox étendue (labels extérieurs) ────────────────────
    const PAD = 22;
    const arcR = 15;
    const normedBis = normPts.map((_, i) => this._bisector(normPts, i));

    let xMin = Math.min(...normPts.map(p => p[0]));
    let xMax = Math.max(...normPts.map(p => p[0]));
    let yMin = Math.min(...normPts.map(p => p[1]));
    let yMax = Math.max(...normPts.map(p => p[1]));

    const spanX0 = Math.max(xMax - xMin, 0.001);
    const spanY0 = Math.max(yMax - yMin, 0.001);
    const scale0 = Math.min((width - PAD * 2) / spanX0, (height - PAD * 2) / spanY0);

    const perpOffset = 24;

    for (let i = 0; i < 3; i++) {
      // Pas de label pour les angles qui ne sont ni l'inconnu ni un known affiché
      // (mais les labels des known affichés sont à l'intérieur → pas d'extension)
      const hasLabel = i === unknownIdx || shownKnown.has(i);
      if (!hasLabel) continue;

      const [vx, vy] = normPts[i];
      const [bx, by] = normedBis[i];

      if (angles[i] < 40) {
        // Label perpendiculaire extérieur
        const atx = vx + bx * (arcR / scale0);
        const aty = vy + by * (arcR / scale0);
        const p1x = -by, p1y = bx;
        const d = perpOffset / scale0;
        [[atx + p1x * d, aty + p1y * d],
         [atx - p1x * d, aty - p1y * d]].forEach(([lx, ly]) => {
          xMin = Math.min(xMin, lx); xMax = Math.max(xMax, lx);
          yMin = Math.min(yMin, ly); yMax = Math.max(yMax, ly);
        });
      } else if (i !== rightAngleIdx) {
        // Vérifier si la bissectrice est trop courte (triangle plat)
        const reach = this._raySegDist(vx, vy, bx, by, normPts[(i + 1) % 3], normPts[(i + 2) % 3]);
        if (reach < (arcR + 22) / scale0) {
          // Label extérieur (direction -bissectrice)
          const extD = (arcR + 18) / scale0;
          const lx = vx - bx * extD, ly = vy - by * extD;
          xMin = Math.min(xMin, lx); xMax = Math.max(xMax, lx);
          yMin = Math.min(yMin, ly); yMax = Math.max(yMax, ly);
        }
      }
    }

    // ── 6. Scale final ────────────────────────────────────────────────────
    const spanX = Math.max(xMax - xMin, 0.001);
    const spanY = Math.max(yMax - yMin, 0.001);
    const scale = Math.min((width - PAD * 2) / spanX, (height - PAD * 2) / spanY);

    const mcx = (xMin + xMax) / 2, mcy = (yMin + yMax) / 2;
    const toC = ([x, y]) => [width / 2 + (x - mcx) * scale, height / 2 + (y - mcy) * scale];

    const canvasPts = normPts.map(toC);
    const [pA, pB, pC] = canvasPts;
    const gx = (pA[0] + pB[0] + pC[0]) / 3;
    const gy = (pA[1] + pB[1] + pC[1]) / 3;

    // ── 7. Triangle ────────────────────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(pA[0], pA[1]);
    ctx.lineTo(pB[0], pB[1]);
    ctx.lineTo(pC[0], pC[1]);
    ctx.closePath();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth   = 1.8;
    ctx.stroke();

    // ── 8. Codage : tirets sur les côtés égaux ────────────────────────────
    for (const [ia, ib, n] of sideTicks) {
      this._drawSideTick(ctx, canvasPts[ia][0], canvasPts[ia][1],
                              canvasPts[ib][0], canvasPts[ib][1], n);
    }

    // ── 9. Arcs + labels d'angles ─────────────────────────────────────────
    const TAU     = 2 * Math.PI;
    const normAng = a => ((a % TAU) + TAU) % TAU;

    for (let i = 0; i < 3; i++) {
      const [vx, vy] = canvasPts[i];
      const p1 = canvasPts[(i + 1) % 3];
      const p2 = canvasPts[(i + 2) % 3];
      const a1 = Math.atan2(p1[1] - vy, p1[0] - vx);
      const a2 = Math.atan2(p2[1] - vy, p2[0] - vx);

      const isUnknown   = i === unknownIdx;
      const isRightAngle = i === rightAngleIdx;
      const arcColor    = isUnknown ? '#ef4444' : this.primaryColor;

      // ── Marqueur d'angle ────────────────────────────────────────────────
      if (isRightAngle) {
        // Carré à la place de l'arc
        this._drawRightAngleSquare(ctx, vx, vy, a1, a2, arcColor);
      } else {
        const cwSpan        = normAng(a2 - a1);
        const anticlockwise = cwSpan > Math.PI;
        ctx.beginPath();
        ctx.arc(vx, vy, arcR, a1, a2, anticlockwise);
        ctx.strokeStyle = arcColor;
        ctx.lineWidth   = isUnknown ? 2.2 : 1.5;
        ctx.stroke();
      }

      // ── Position du label ────────────────────────────────────────────────
      // Pas de label pour : angle droit connu, angle connu masqué
      const drawLabel = isUnknown || shownKnown.has(i);
      if (!drawLabel) continue;

      const [bx, by] = this._bisector(canvasPts, i);
      const isSmall   = angles[i] < 40;
      let lx, ly;

      if (isSmall) {
        // Perpendiculaire extérieur depuis le sommet de l'arc
        const atx = vx + bx * arcR, aty = vy + by * arcR;
        const p1x = -by, p1y = bx;
        const dot = p1x * (gx - atx) + p1y * (gy - aty);
        const sideX = dot > 0 ? -p1x : p1x;
        const sideY = dot > 0 ? -p1y : p1y;
        lx = atx + sideX * perpOffset;
        ly = aty + sideY * perpOffset;

        ctx.beginPath();
        ctx.moveTo(atx, aty);
        ctx.lineTo(lx, ly);
        ctx.strokeStyle = arcColor;
        ctx.lineWidth   = 0.9;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (!isRightAngle) {
        // Vérifier portée de la bissectrice
        const bisReach = this._raySegDist(vx, vy, bx, by, canvasPts[(i + 1) % 3], canvasPts[(i + 2) % 3]);
        if (bisReach < arcR + 22) {
          // Triangle plat : label extérieur
          const atx = vx + bx * arcR, aty = vy + by * arcR;
          lx = vx - bx * (arcR + 18);
          ly = vy - by * (arcR + 18);
          ctx.beginPath();
          ctx.moveTo(atx, aty);
          ctx.lineTo(lx, ly);
          ctx.strokeStyle = arcColor;
          ctx.lineWidth   = 0.9;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Placement intérieur normal
          lx = vx + bx * (arcR + 15);
          ly = vy + by * (arcR + 15);
        }
      } else {
        // Angle droit inconnu (cas rare) : label près du carré
        const atx = vx + bx * arcR, aty = vy + by * arcR;
        lx = atx; ly = aty;
      }

      // ── Dessin du label ──────────────────────────────────────────────────
      if (isUnknown) {
        const before = letters[(i + 2) % 3];
        const vert   = letters[i];
        const after  = letters[(i + 1) % 3];
        this._drawWidehat(ctx, lx, ly, before + vert + after, '#ef4444');
        this.hitRegion = { x: lx, y: ly, r: 20, answer: angles[i] };
      } else {
        ctx.font         = `${isSmall ? 11 : 12}px sans-serif`;
        ctx.fillStyle    = '#1e293b';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(angles[i] + '°', lx, ly);
      }
    }

    // ── 10. Lettres des sommets ────────────────────────────────────────────
    for (let i = 0; i < 3; i++) {
      const [vx, vy] = canvasPts[i];
      const dx = vx - gx, dy = vy - gy;
      const dl = Math.hypot(dx, dy) || 1;
      ctx.font         = 'italic bold 13px serif';
      ctx.fillStyle    = '#475569';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letters[i], vx + (dx / dl) * 14, vy + (dy / dl) * 14);
    }

    // ── 11. Tooltip réponse au survol ─────────────────────────────────────
    if (this.hoveredAnswer !== null && this.hitRegion) {
      this._drawTooltip(ctx, this.hitRegion.x, this.hitRegion.y - 26, this.hoveredAnswer + '°');
    }
  }

  _drawTooltip(ctx, x, y, text) {
    ctx.save();
    ctx.font = 'bold 13px sans-serif';
    const tw = ctx.measureText(text).width;
    const pw = 10, bh = 22, bw = tw + pw * 2;
    const bx = x - bw / 2, by = y - bh / 2;

    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 5);
    else ctx.rect(bx, by, bw, bh);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 6, by + bh);
    ctx.lineTo(x + 6, by + bh);
    ctx.lineTo(x, by + bh + 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle    = '#fff';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.restore();
  }
}

customElements.define('math974-angle-triangle', AngleTriangleComponent);

export const defaultPosition = 'east';

export function randomize(config) {
  return { seed: `rnd${Math.random().toString(36).slice(2, 7)}`, mode: config.mode || 'scalene' };
}
