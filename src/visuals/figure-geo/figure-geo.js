// src/visuals/figure-geo/figure-geo.js
// Web Component — Figures géométriques sur quadrillage (périmètre & aire)
//
// Level 1 : Rectangle pur (W×H)
// Level 2 : Polygone rectilinéaire (region growing, adjacence par faces uniquement)
//
// Algorithme de frontière : chaque nœud du contour a exactement degré 2
// → suivi déterministe sans backtracking.

class FigureGeoComponent extends HTMLElement {
  static get observedAttributes() {
    return ['seed', 'level', 'gridsize', 'cellsize', 'mincells', 'maxcells', 'showgrid', 'color', 'showmetrics'];
  }

  connectedCallback()  { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  // ── PRNG déterministe (LCG) ───────────────────────────────────────────────
  makePRNG(seed) {
    let s = 0;
    for (const ch of String(seed)) s = (Math.imul(s, 31) + ch.charCodeAt(0)) | 0;
    s = (s >>> 0) || 1;
    return () => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // ── Génération de forme ───────────────────────────────────────────────────
  genShape(rand, N, level, minCells, maxCells) {
    return level === 1
      ? this.genRectangle(rand, N, minCells, maxCells)
      : this.genRectilinear(rand, N, minCells, maxCells);
  }

  // Level 1 : rectangle aléatoire de dimensions W×H
  genRectangle(rand, N, minCells, maxCells) {
    const maxDim = Math.min(N - 1, 9);
    let w, h, tries = 0;
    do {
      w = 2 + Math.floor(rand() * (maxDim - 1));
      h = 2 + Math.floor(rand() * (maxDim - 1));
      tries++;
    } while ((w * h < minCells || w * h > maxCells) && tries < 300);

    const r0 = Math.floor(rand() * (N - h));
    const c0 = Math.floor(rand() * (N - w));
    const cells = new Set();
    for (let r = r0; r < r0 + h; r++)
      for (let c = c0; c < c0 + w; c++)
        cells.add(`${r},${c}`);
    return cells;
  }

  // Level 2 : region growing — adjacence par FACES uniquement (angles droits garantis)
  genRectilinear(rand, N, minCells, maxCells) {
    const target = minCells + Math.floor(rand() * (maxCells - minCells + 1));
    const r0 = Math.floor(rand() * N);
    const c0 = Math.floor(rand() * N);
    const cells = new Set([`${r0},${c0}`]);
    const DIRS4 = [[-1,0],[1,0],[0,-1],[0,1]];

    for (let iter = 0; cells.size < target && iter < 20000; iter++) {
      const arr = [...cells];
      const key = arr[Math.floor(rand() * arr.length)];
      const [r, c] = key.split(',').map(Number);
      const cands = DIRS4
        .map(([dr, dc]) => [r+dr, c+dc])
        .filter(([nr, nc]) =>
          nr >= 0 && nr < N && nc >= 0 && nc < N && !cells.has(`${nr},${nc}`)
        );
      if (cands.length) {
        const [nr, nc] = cands[Math.floor(rand() * cands.length)];
        cells.add(`${nr},${nc}`);
      }
    }
    return cells;
  }

  // ── Métriques (aire en cases, périmètre en arêtes) ────────────────────────
  calcMetrics(cells) {
    const DIRS4 = [[-1,0],[1,0],[0,-1],[0,1]];
    let boundary = 0;
    for (const cell of cells) {
      const [r, c] = cell.split(',').map(Number);
      for (const [dr, dc] of DIRS4)
        if (!cells.has(`${r+dr},${c+dc}`)) boundary++;
    }
    return { area: cells.size, perimeter: boundary };
  }

  // ── Contour SVG (boundary following, degré 2 garanti pour L1-L2) ─────────
  // Principe :
  //   1. On construit le graphe des nœuds de grille reliés par des arêtes frontières.
  //   2. Chaque nœud a exactement degré 2 → suivi sans ambiguïté.
  //   3. Départ : coin supérieur-gauche de la cellule la plus haute et la plus à gauche.
  //      Sa 1ère arête ajoutée va vers l'EST → parcours sens horaire.
  cellsToPath(cells, S, P) {
    if (!cells.size) return '';

    const adj = new Map();
    const addEdge = (ax, ay, bx, by) => {
      const ka = `${ax},${ay}`, kb = `${bx},${by}`;
      if (!adj.has(ka)) adj.set(ka, []);
      if (!adj.has(kb)) adj.set(kb, []);
      adj.get(ka).push(kb);
      adj.get(kb).push(ka);
    };

    for (const cell of cells) {
      const [r, c] = cell.split(',').map(Number);
      const x = P + c * S, y = P + r * S;
      if (!cells.has(`${r-1},${c}`)) addEdge(x,    y,    x+S,  y   ); // haut
      if (!cells.has(`${r+1},${c}`)) addEdge(x,    y+S,  x+S,  y+S ); // bas
      if (!cells.has(`${r},${c-1}`)) addEdge(x,    y,    x,    y+S ); // gauche
      if (!cells.has(`${r},${c+1}`)) addEdge(x+S,  y,    x+S,  y+S ); // droite
    }

    if (!adj.size) return '';

    // Nœud de départ : le plus haut (y min), puis le plus à gauche (x min)
    const start = [...adj.keys()].sort((a, b) => {
      const [ax, ay] = a.split(',').map(Number);
      const [bx, by] = b.split(',').map(Number);
      return ay !== by ? ay - by : ax - bx;
    })[0];

    // Suivi de frontière (excluant le nœud d'où l'on vient)
    const pts = [start];
    let prev = null, cur = start;

    for (let step = 0; step < adj.size + 2; step++) {
      const nbrs = (adj.get(cur) || []).filter(n => n !== prev);
      const next = nbrs[0];
      if (!next || next === start) break;
      pts.push(next);
      prev = cur;
      cur = next;
    }

    // Construire le path SVG (M x y L x y ... Z)
    return pts.map((p, i) => {
      const [x, y] = p.split(',');
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
  }

  // ── Rendu principal ───────────────────────────────────────────────────────
  render() {
    const seed        = this.getAttribute('seed')        || 'fig';
    const level       = parseInt(this.getAttribute('level')       || '1');
    const N           = parseInt(this.getAttribute('gridsize')    || '8');
    const S           = parseInt(this.getAttribute('cellsize')    || '18');
    const minCells    = parseInt(this.getAttribute('mincells')    || '4');
    const maxCells    = parseInt(this.getAttribute('maxcells')    || '16');
    const showGrid    = this.getAttribute('showgrid')    !== 'false';
    const showMetrics = this.getAttribute('showmetrics') === 'true';
    const color       = this.getAttribute('color')       || '#1d4ed8';

    const rand  = this.makePRNG(seed);
    const cells = this.genShape(rand, N, level, minCells, maxCells);
    const { area, perimeter } = this.calcMetrics(cells);

    // Exposer les métriques (accessibles par le système visuel parent)
    this.dataset.area      = area;
    this.dataset.perimeter = perimeter;

    const PAD  = 6;
    const size = N * S + 2 * PAD;

    // Grille de fond
    let grid = '';
    if (showGrid) {
      for (let i = 0; i <= N; i++) {
        const x = PAD + i * S, y = PAD + i * S;
        grid += `<line x1="${x}" y1="${PAD}" x2="${x}" y2="${PAD + N*S}" stroke="#d1d5db" stroke-width="0.5"/>`;
        grid += `<line x1="${PAD}" y1="${y}" x2="${PAD + N*S}" y2="${y}" stroke="#d1d5db" stroke-width="0.5"/>`;
      }
    }

    // Remplissage des cellules
    let fill = '';
    for (const cell of cells) {
      const [r, c] = cell.split(',').map(Number);
      fill += `<rect x="${PAD + c*S + 0.25}" y="${PAD + r*S + 0.25}"
                     width="${S - 0.5}" height="${S - 0.5}"
                     fill="${color}" fill-opacity="0.10"/>`;
    }

    // Contour
    const pathD = this.cellsToPath(cells, S, PAD);

    // Métriques : toujours en <title> SVG (tooltip au survol, non visible)
    // + barre visible optionnelle en mode prof
    const titleEl = `<title>Périmètre : ${perimeter} u.l. | Aire : ${area} u²</title>`;
    const metricsBar = showMetrics
      ? `<text x="${size/2}" y="${size - 1}"
               text-anchor="middle" font-size="5" fill="#64748b" font-family="sans-serif">
           P = ${perimeter} u.l. | A = ${area} u²
         </text>`
      : '';

    const svgH = showMetrics ? size + 8 : size;

    this.style.display = 'block';
    this.innerHTML = `<svg viewBox="0 0 ${size} ${svgH}"
         xmlns="http://www.w3.org/2000/svg"
         width="${size}" height="${svgH}"
         style="display:block;max-width:100%;height:auto">
      ${titleEl}
      ${grid}${fill}
      ${pathD ? `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>` : ''}
      ${metricsBar}
    </svg>`;
  }
}

customElements.define('math974-figure-geo', FigureGeoComponent);
export default FigureGeoComponent;
export const defaultPosition = 'east';

export function randomize(config) {
  return { ...config, seed: `rnd${Math.random().toString(36).slice(2, 7)}` };
}
