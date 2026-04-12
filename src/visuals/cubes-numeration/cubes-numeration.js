// src/visuals/cubes-numeration/cubes-numeration.js
// Web Component — Matériel de numération isométrique (base 10)
//
// Rendu :
//  - Millier  : grand cube isométrique 3D (S=18)
//  - Centaine : plaque PLATE 10×10 — 100 faces supérieures visibles + arêtes
//  - Dizaine  : barreau de 10 — faces latérales avec 10 divisions + top
//  - Unité    : petit cube isométrique 3D (S=9)
//
// Au-delà de 5 éléments par dénomination → 2 lignes automatiques.
// showLabels : false par défaut (évite le chevauchement avec le texte de la question).

class CubesNumerationComponent extends HTMLElement {
  static get observedAttributes() {
    return ['centaines', 'dizaines', 'unites', 'milliers', 'showlabels'];
  }

  connectedCallback()  { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const m = Math.min(9, Math.max(0, parseInt(this.getAttribute('milliers')  || '0')));
    const c = Math.min(9, Math.max(0, parseInt(this.getAttribute('centaines') || '0')));
    const d = Math.min(9, Math.max(0, parseInt(this.getAttribute('dizaines')  || '0')));
    const u = Math.min(9, Math.max(0, parseInt(this.getAttribute('unites')    || '0')));
    // false par défaut — les labels chevauchent le texte de la question
    const showLabels = this.getAttribute('showlabels') === 'true';
    this.style.display = 'block';
    this.style.width   = '100%';
    this.innerHTML = this.buildSVG(m, c, d, u, showLabels);
  }

  // ── Couleurs ─────────────────────────────────────────────────────────────────
  hexAdjust(hex, delta) {
    const num   = parseInt(hex.replace('#', ''), 16);
    const clamp = v => Math.max(0, Math.min(255, v));
    const r = clamp((num >> 16)          + delta);
    const g = clamp(((num >> 8) & 0xff)  + delta);
    const b = clamp((num & 0xff)         + delta);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  poly(pts, fill) {
    return `<polygon points="${pts}" fill="${fill}"
              stroke="rgba(255,255,255,0.85)" stroke-width="0.5" stroke-linejoin="round"/>`;
  }

  // ── Cube isométrique complet (milliers / unités) ──────────────────────────────
  // Ancre (cx, ay) = arête centrale avant à mi-hauteur. Bottom=ay+S, Top=ay-S.
  cube(cx, ay, S, color) {
    const hw = S * 0.866, hh = S * 0.5;
    const top   = this.hexAdjust(color,  55);
    const right = this.hexAdjust(color, -10);
    const left  = this.hexAdjust(color, -60);
    const p = (x1,y1,x2,y2,x3,y3,x4,y4,f) =>
      this.poly(`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`, f);
    return [
      p(cx,ay, cx,ay+S,   cx-hw,ay+hh, cx-hw,ay-hh, left),
      p(cx,ay, cx,ay+S,   cx+hw,ay+hh, cx+hw,ay-hh, right),
      p(cx,ay, cx+hw,ay-hh, cx,ay-S,   cx-hw,ay-hh, top),
    ].join('');
  }

  // ── MILLIER : grand cube (S=18) ──────────────────────────────────────────────
  renderMillierCube(gx, S, color) {
    const hw = S * 0.866;
    return { svg: this.cube(gx + hw, -S, S, color), width: 2 * hw, rowH: 2 * S };
  }

  // ── CENTAINE : plaque PLATE 10×10 — toutes les faces supérieures visibles ────
  // N = 10 cellules par côté, Sc = taille d'une cellule, D = épaisseur de l'arête
  renderCentainePlate(gx, Sc, color) {
    const N  = 10;
    const hw = Sc * 0.866;
    const hh = Sc * 0.5;
    const D  = Math.round(Sc * 0.9); // épaisseur latérale ≈ 90% d'une cellule

    // Origine Y : bas de la plaque à Y=0
    // La face avant-gauche (i=N-1, j=N-1) a son bas à gy + 2*(N-1)*hh + D = 0
    const gy = -(2 * (N - 1) * hh + D);
    // Centre X : bord gauche de la plaque à gx
    const cx = gx + N * hw;

    let paths = '';
    const topColor   = this.hexAdjust(color,  50);
    const rightColor = this.hexAdjust(color, -10);
    const leftColor  = this.hexAdjust(color, -55);
    const lineColor  = 'rgba(255,255,255,0.75)';

    // 1. Faces latérales d'arête DROITE (colonne i=N-1) — rendu avant les faces sup
    for (let j = N - 1; j >= 0; j--) {
      const ax = cx + (N - 1 - j) * hw;
      const ay = gy + (N - 1 + j) * hh;
      paths += this.poly(
        `${ax},${ay} ${ax},${ay+D} ${ax+hw},${ay+D-hh} ${ax+hw},${ay-hh}`,
        rightColor
      );
    }
    // 2. Faces latérales d'arête AVANT (ligne j=N-1) — rendu avant les faces sup
    for (let i = N - 1; i >= 0; i--) {
      const ax = cx + (i - N + 1) * hw;
      const ay = gy + (i + N - 1) * hh;
      paths += this.poly(
        `${ax},${ay} ${ax},${ay+D} ${ax-hw},${ay+D-hh} ${ax-hw},${ay-hh}`,
        leftColor
      );
    }

    // 3. Faces supérieures 10×10 — rendu dos→avant (toutes visibles)
    for (let sum = 2 * (N - 1); sum >= 0; sum--) {
      for (let i = N - 1; i >= 0; i--) {
        const j = sum - i;
        if (j < 0 || j >= N) continue;
        const ax = cx + (i - j) * hw;
        const ay = gy + (i + j) * hh;
        paths += this.poly(
          `${ax},${ay} ${ax+hw},${ay-hh} ${ax},${ay-Sc} ${ax-hw},${ay-hh}`,
          topColor
        );
      }
    }

    const plateWidth = 2 * N * hw;
    const rowH       = 2 * (N - 1) * hh + Sc + D; // hauteur totale de la plaque
    return { svg: paths, width: plateWidth, rowH };
  }

  // ── DIZAINE : barreau de 10 cellules — divisions visibles sur les faces lat. ─
  // H = 10 cellules, Sd = taille d'une cellule
  renderDizaineBar(gx, Sd, color) {
    const H  = 10;
    const hw = Sd * 0.866;
    const hh = Sd * 0.5;
    const cx = gx + hw;

    const topColor   = this.hexAdjust(color,  55);
    const rightColor = this.hexAdjust(color, -10);
    const leftColor  = this.hexAdjust(color, -60);

    let paths = '';

    // Face gauche (une seule grande face + lignes de grille)
    paths += this.poly(
      `${cx},0 ${cx},${-H*Sd} ${cx-hw},${-H*Sd-hh} ${cx-hw},${-hh}`,
      leftColor
    );
    // Face droite
    paths += this.poly(
      `${cx},0 ${cx},${-H*Sd} ${cx+hw},${-H*Sd-hh} ${cx+hw},${-hh}`,
      rightColor
    );
    // Lignes de grille sur les deux faces (H-1 séparations)
    for (let k = 1; k < H; k++) {
      const y = -k * Sd;
      paths += `<line x1="${cx}" y1="${y}" x2="${cx+hw}" y2="${y-hh}"
                      stroke="${'rgba(255,255,255,0.8)'}" stroke-width="0.7"/>`;
      paths += `<line x1="${cx}" y1="${y}" x2="${cx-hw}" y2="${y-hh}"
                      stroke="${'rgba(255,255,255,0.8)'}" stroke-width="0.7"/>`;
    }
    // Face supérieure (rhombus du dessus)
    const topAy = -H * Sd;
    paths += this.poly(
      `${cx},${topAy} ${cx+hw},${topAy-hh} ${cx},${topAy-Sd} ${cx-hw},${topAy-hh}`,
      topColor
    );

    const barWidth = 2 * hw;
    const rowH     = (H + 1) * Sd; // hauteur totale du barreau
    return { svg: paths, width: barWidth, rowH };
  }

  // ── UNITÉ : petit cube (S=9) ─────────────────────────────────────────────────
  renderUnitCube(gx, S, color) {
    const hw = S * 0.866;
    return { svg: this.cube(gx + hw, -S, S, color), width: 2 * hw, rowH: 2 * S };
  }

  // ── Rendu d'un groupe avec retour à la ligne au-delà de 5 ────────────────────
  renderGroup(count, renderFn, groupX, gap) {
    const COLS    = 5;
    const ROW_GAP = 6;
    const rows    = Math.ceil(count / COLS);

    // Taille d'un élément (appel à blanc)
    const sample  = renderFn(0);
    const itemW   = sample.width;
    const rowH    = sample.rowH;
    const step    = itemW + gap;

    let svg    = '';
    let minTopY = -rowH;

    for (let row = rows - 1; row >= 0; row--) {
      const startI = row * COLS;
      const rowCnt = Math.min(COLS, count - startI);
      const yOff   = row > 0 ? -(rowH + ROW_GAP) * row : 0;
      if (row > 0) minTopY = Math.min(minTopY, yOff - rowH);

      for (let col = 0; col < rowCnt; col++) {
        const ix          = groupX + col * step;
        const { svg: s }  = renderFn(ix);
        svg += row > 0
          ? `<g transform="translate(0,${yOff})">${s}</g>`
          : s;
      }
    }

    const maxCols = Math.min(COLS, count);
    return { svg, width: maxCols * step - gap, topY: minTopY };
  }

  // ── SVG principal ─────────────────────────────────────────────────────────────
  buildSVG(nbM, nbC, nbD, nbU, showLabels) {
    const Sm = 18; // millier
    const Sc = 3;  // centaine — cellule de la plaque 10×10
    const Sd = 4;  // dizaine  — cellule du barreau ×10
    const Su = 9;  // unité

    const COLORS = { m:'#b91c1c', c:'#1d4ed8', d:'#16a34a', u:'#ca8a04' };

    const PAD     = 8;
    const GRP_GAP = 14;
    const GAP     = { m:6, c:5, d:4, u:4 };

    let shapes  = '';
    let labels  = '';
    let curX    = PAD;
    let minTopY = 0;

    const addLabel = (x, w, text, color) => {
      if (!showLabels) return;
      labels += `<text x="${x + w/2}" y="10" text-anchor="middle"
                       font-size="5" fill="${color}"
                       font-family="sans-serif" font-weight="700">${text}</text>`;
    };

    const render = (nb, fn, gap, label, color) => {
      if (nb <= 0) return;
      const { svg, width, topY } = this.renderGroup(nb, fn, curX, gap);
      shapes  += svg;
      minTopY  = Math.min(minTopY, topY);
      addLabel(curX, width, label, color);
      curX    += width + GRP_GAP;
    };

    render(nbM, (gx) => this.renderMillierCube(gx,  Sm, COLORS.m), GAP.m, 'milliers',  COLORS.m);
    render(nbC, (gx) => this.renderCentainePlate(gx, Sc, COLORS.c), GAP.c, 'centaines', COLORS.c);
    render(nbD, (gx) => this.renderDizaineBar(gx,   Sd, COLORS.d), GAP.d, 'dizaines',  COLORS.d);
    render(nbU, (gx) => this.renderUnitCube(gx,     Su, COLORS.u), GAP.u, 'unités',    COLORS.u);

    // Supprimer le dernier GRP_GAP si au moins un groupe a été rendu
    if (curX > PAD) curX -= GRP_GAP;

    const totalW   = curX + PAD;
    const labelH   = showLabels ? 18 : 2;
    const viewBoxY = minTopY - 4;
    const viewBoxH = -viewBoxY + labelH;

    return `<svg viewBox="0 ${viewBoxY} ${totalW} ${viewBoxH}"
                 xmlns="http://www.w3.org/2000/svg"
                 style="width:100%;height:auto;max-height:160px;display:block">
      ${shapes}
      ${labels}
    </svg>`;
  }
}

customElements.define('math974-cubes-numeration', CubesNumerationComponent);
export default CubesNumerationComponent;
