// src/visuals/suite-figures/suite-figures.js
// Suite de figures géométriques croissantes — GS 8.4 / cycle 4
//
// Position recommandée : north
//
// Patterns :
//   baton    — rangée linéaire     : 1, 2,  3,  4…  (n)
//   L        — équerre L           : 1, 3,  5,  7…  (2n−1)
//   T        — forme en T          : 1, 4,  7, 10…  (3n−2)
//   peigne   — peigne/fourche      : 2, 5,  8, 11…  (3n−1)
//   croix    — croix + pure        : 1, 5,  9, 13…  (4n−3)
//   cadre    — carré creux         : 1, 4,  8, 12…  (4(n−1) pour n≥2)
//   triangle — triangle rectangle  : 1, 3,  6, 10…  (n(n+1)/2)
//   colonnes — histogramme         : 1, 3,  6, 10…  (n(n+1)/2, rendu différent)
//   carre    — carré plein         : 1, 4,  9, 16…  (n²)
//   losange  — diamant Manhattan   : 1, 5, 13, 25…  (2n²−2n+1)
//
// Attrs : pattern, etapes, show_blank, color, cellsize, show_step

class SuiteFiguresComponent extends HTMLElement {
  static get observedAttributes() {
    return ['pattern', 'etapes', 'show_blank', 'color', 'cellsize', 'show_step'];
  }

  connectedCallback()        { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  // ── Taille de grille ──────────────────────────────────────────────────────
  _gridSize(pattern, n) {
    switch (pattern) {
      case 'losange':  return { cols: 2*n-1, rows: 2*n-1 };
      case 'triangle': return { cols: n,     rows: n };
      case 'carre':    return { cols: n,     rows: n };
      case 'cadre':    return { cols: n,     rows: n };
      case 'croix':    return { cols: 2*n-1, rows: 2*n-1 };
      case 'L':        return { cols: n,     rows: n };
      case 'baton':    return { cols: n,     rows: 1 };
      case 'colonnes': return { cols: n,     rows: n };
      case 'T':        return { cols: 2*n-1, rows: n };
      case 'peigne':   return { cols: 2*n-1, rows: 2 };
      default:         return { cols: n,     rows: n };
    }
  }

  // ── Cellule remplie ? ─────────────────────────────────────────────────────
  _isFilled(pattern, n, row, col) {
    switch (pattern) {
      case 'losange': {
        const cx = n-1, cy = n-1;
        return Math.abs(row-cy) + Math.abs(col-cx) <= n-1;
      }
      case 'triangle':
        return col <= row;
      case 'carre':
        return true;
      case 'cadre':
        return row === 0 || row === n-1 || col === 0 || col === n-1;
      case 'croix': {
        const mid = n-1;
        return row === mid || col === mid;
      }
      case 'L':
        return row === n-1 || col === 0;
      case 'baton':
        return true;
      case 'colonnes':
        return row >= (n-1-col);
      case 'T':
        // barre du haut (row 0) + tige centrale (col n-1, row > 0)
        return row === 0 || col === n-1;
      case 'peigne':
        // dents en haut (row 0, colonnes paires) + base en bas (row 1, toutes)
        return row === 1 || (row === 0 && col % 2 === 0);
      default:
        return true;
    }
  }

  // ── Nombre de cases remplies (formule directe) ────────────────────────────
  _count(pattern, n) {
    switch (pattern) {
      case 'baton':    return n;
      case 'L':        return 2*n - 1;
      case 'T':        return 3*n - 2;
      case 'peigne':   return 3*n - 1;
      case 'croix':    return 4*n - 3;
      case 'cadre':    return n === 1 ? 1 : 4*(n-1);
      case 'triangle': return n*(n+1)/2;
      case 'colonnes': return n*(n+1)/2;
      case 'carre':    return n*n;
      case 'losange':  return 2*n*n - 2*n + 1;
      default: {
        const { cols, rows } = this._gridSize(pattern, n);
        let k = 0;
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++)
            if (this._isFilled(pattern, n, r, c)) k++;
        return k;
      }
    }
  }

  // ── Rendu SVG d'une étape ─────────────────────────────────────────────────
  _renderStage({ n, cols, rows, w, h, blank, distant, color, cellsize, gap, x, yBase }) {
    let svg = '';

    if (blank || distant) {
      // Étape vide en pointillés (à compléter ou étape lointaine)
      svg += `<rect x="${x}" y="${yBase}" width="${w}" height="${h}"
        fill="#f9fafb" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="5,3" rx="3"/>`;
      svg += `<text x="${x+w/2}" y="${yBase+h/2+5}"
        text-anchor="middle" font-size="${Math.min(18, h*0.6)}" fill="#d1d5db" font-weight="bold">?</text>`;
    } else {
      svg += `<rect x="${x-1}" y="${yBase-1}" width="${w+2}" height="${h+2}"
        fill="#f0f9ff" rx="2"/>`;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx     = x + c*(cellsize+gap);
          const cy     = yBase + r*(cellsize+gap);
          const filled = this._isFilled(this._currentPattern, n, r, c);
          svg += `<rect x="${cx}" y="${cy}" width="${cellsize}" height="${cellsize}"
            fill="${filled ? color : 'none'}"
            stroke="${filled ? 'white' : '#e5e7eb'}"
            stroke-width="${filled ? '0.5' : '0.8'}"
            rx="1"/>`;
        }
      }
    }
    return svg;
  }

  render() {
    const pattern   = this.getAttribute('pattern')    || 'losange';
    const etapes    = Math.max(1, parseInt(this.getAttribute('etapes')    || '3'));
    const showBlank = this.getAttribute('show_blank') === 'true';
    const color     = this.getAttribute('color')      || '#60a5fa';
    const cellsize  = Math.max(6, parseInt(this.getAttribute('cellsize') || '14'));
    const showStep  = parseInt(this.getAttribute('show_step') || '0');

    this._currentPattern = pattern;

    const gap      = 2;
    const stageGap = 20;
    const padX     = 8;
    const padTop   = 6;
    const labelH   = 14;
    const labelGap = 4;

    // ── Liste des étapes affichées ──────────────────────────────────────────
    const stages = [];
    for (let n = 1; n <= etapes + (showBlank ? 1 : 0); n++) {
      const { cols, rows } = this._gridSize(pattern, n);
      const w = cols*cellsize + Math.max(0, cols-1)*gap;
      const h = rows*cellsize + Math.max(0, rows-1)*gap;
      stages.push({ n, cols, rows, w, h, blank: showBlank && n === etapes+1 });
    }

    // ── Étape lointaine (cycle 4) ───────────────────────────────────────────
    let distantStage = null;
    if (showStep > etapes) {
      // Taille fixe de la boîte "?" (proportionnelle mais bornée)
      const lastStage = stages[stages.length - 1];
      distantStage = { n: showStep, w: lastStage.w, h: lastStage.h, distant: true };
    }

    const allStages = distantStage ? [...stages, distantStage] : stages;
    const maxH  = Math.max(...allStages.map(s => s.h));

    // Largeur totale : stages + séparateur "..." si étape lointaine
    const dotsW = distantStage ? 28 : 0;
    const totalW = allStages.reduce((acc, s, i) => {
      return acc + s.w + (i > 0 ? stageGap : 0);
    }, 0) + 2*padX + dotsW;
    const totalH = padTop + maxH + labelGap + labelH + 4;

    // ── Construction SVG ────────────────────────────────────────────────────
    let svg = '';
    let x   = padX;

    allStages.forEach((stage, idx) => {
      const { n, cols, rows, w, h, blank, distant } = stage;
      const yBase  = padTop + (maxH - h);
      const yLabel = padTop + maxH + labelGap + labelH - 2;
      const count  = this._count(pattern, n);
      const isLast = !distant && idx === stages.length - 1;

      // Séparateur "…" avant l'étape lointaine
      if (distant && distantStage) {
        const dotsX = x - stageGap/2 - 10;
        const dotsY = padTop + maxH/2;
        svg += `<text x="${dotsX}" y="${dotsY+4}" text-anchor="middle"
          font-size="14" fill="#9ca3af" font-family="sans-serif">…</text>`;
      }

      // Groupe interactif (hover tooltip)
      svg += `<g class="sf-stage" data-count="${count}" data-step="${n}"
        style="cursor:default" pointer-events="all">`;

      if (blank || distant) {
        svg += `<rect x="${x}" y="${yBase}" width="${w}" height="${h}"
          fill="#f9fafb" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="5,3" rx="4"/>`;
        svg += `<text x="${x+w/2}" y="${yBase+h/2+6}"
          text-anchor="middle" font-size="${Math.max(12, Math.min(20, h*0.5))}"
          fill="#d1d5db" font-weight="bold">?</text>`;
        // Title natif (alt/tooltip navigateur)
        svg += `<title>${count} case${count > 1 ? 's' : ''} à l'étape ${n}</title>`;
      } else {
        // Fond léger
        svg += `<rect x="${x-1}" y="${yBase-1}" width="${w+2}" height="${h+2}"
          fill="${isLast ? '#eff6ff' : '#f0f9ff'}" rx="2"
          stroke="${isLast ? '#bfdbfe' : 'none'}" stroke-width="${isLast ? 1 : 0}"/>`;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx     = x + c*(cellsize+gap);
            const cy     = yBase + r*(cellsize+gap);
            const filled = this._isFilled(pattern, n, r, c);
            svg += `<rect x="${cx}" y="${cy}" width="${cellsize}" height="${cellsize}"
              fill="${filled ? color : 'none'}"
              stroke="${filled ? 'white' : '#e5e7eb'}"
              stroke-width="${filled ? '0.5' : '0.8'}"
              rx="1"/>`;
          }
        }
        // Title natif
        svg += `<title>${count} case${count > 1 ? 's' : ''} à l'étape ${n}</title>`;
        // Badge count (caché, visible au hover via JS)
        svg += `<rect class="sf-badge-bg" x="${x+w-18}" y="${yBase}" width="18" height="14"
          rx="3" fill="${color}" opacity="0"/>`;
        svg += `<text class="sf-badge-txt" x="${x+w-9}" y="${yBase+10}"
          text-anchor="middle" font-size="9" font-weight="700" fill="white" opacity="0">${count}</text>`;
      }

      svg += `</g>`;

      // Étiquette "Étape N"
      svg += `<text x="${x+w/2}" y="${yLabel}"
        text-anchor="middle" font-size="9" fill="#6b7280" font-family="sans-serif">Étape ${n}</text>`;

      x += w + stageGap;
    });

    this.style.display = 'block';
    this.style.position = 'relative';

    // Tooltip flottant
    this.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${totalW} ${totalH}"
        width="${totalW}" height="${totalH}"
        style="display:block;max-width:100%;overflow:visible">
        ${svg}
      </svg>
      <div class="sf-tip" style="
        position:absolute;top:0;left:0;
        background:#1e293b;color:white;
        padding:3px 8px;border-radius:6px;
        font-size:11px;font-weight:700;
        pointer-events:none;opacity:0;
        transition:opacity 0.12s;
        white-space:nowrap;z-index:10;">
      </div>`;

    this._bindHover();
  }

  _bindHover() {
    const tip    = this.querySelector('.sf-tip');
    const groups = this.querySelectorAll('.sf-stage');

    groups.forEach(g => {
      const count = g.dataset.count;
      const step  = g.dataset.step;
      const label = `${count} case${count > 1 ? 's' : ''} à l'étape ${step}`;

      const badgeBg  = g.querySelector('.sf-badge-bg');
      const badgeTxt = g.querySelector('.sf-badge-txt');

      g.addEventListener('mouseenter', () => {
        // Tooltip flottant
        tip.textContent = label;
        tip.style.opacity = '1';

        // Position relative au composant
        const gRect    = g.getBoundingClientRect();
        const hostRect = this.getBoundingClientRect();
        const tx = gRect.left - hostRect.left + gRect.width/2;
        const ty = gRect.top  - hostRect.top  - 26;
        tip.style.transform = `translate(${tx}px, ${ty}px) translateX(-50%)`;

        // Badge count dans le coin de la figure
        if (badgeBg)  badgeBg.setAttribute('opacity', '0.85');
        if (badgeTxt) badgeTxt.setAttribute('opacity', '1');
      });

      g.addEventListener('mouseleave', () => {
        tip.style.opacity = '0';
        if (badgeBg)  badgeBg.setAttribute('opacity', '0');
        if (badgeTxt) badgeTxt.setAttribute('opacity', '0');
      });
    });
  }
}

if (!customElements.get('math974-suite-figures')) {
  customElements.define('math974-suite-figures', SuiteFiguresComponent);
}
