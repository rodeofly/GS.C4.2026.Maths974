// src/visuals/fraction-figure/fraction-figure.js
// Web Component — Représentation visuelle d'une fraction (propre ou impropre)
//
// Types : 'bande' | 'disque' | 'grille' | 'triangle' | 'polygone'
//
// Attrs  : type, total, colored, fill ('first'|'last'|'random'),
//          orient ('h'|'v'|'random'), cellsize (px|'auto'), color
//
// Sémantique de total :
//   bande, disque, polygone → total = dénominateur (nb de parts)
//   grille, triangle        → total = n (côté), dénominateur réel = n²
//
// colored peut être > total (fraction impropre) :
//   → floor(colored/total) figures complètes + 1 figure partielle éventuelle
//
// dataset.solution = "colored/dénominateur"

const CSS = `
math974-fraction-figure {
  display: flex;
  justify-content: center;
  padding: 6px 0;
}
math974-fraction-figure svg { display: block; }
`;

function injectStyles() {
  if (document.getElementById('ff-styles')) return;
  const s = document.createElement('style');
  s.id = 'ff-styles';
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ── Positions des parts colorées ─────────────────────────────────────────────

function getPositions(total, colored, fill) {
  if (fill === 'first') return new Set(Array.from({ length: colored }, (_, i) => i));
  if (fill === 'last')  return new Set(Array.from({ length: colored }, (_, i) => total - colored + i));
  const idx = Array.from({ length: total }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return new Set(idx.slice(0, colored));
}

// ── Renderers ─────────────────────────────────────────────────────────────────

function renderBande(total, positions, vertical, cs, color) {
  const W = vertical ? cs : cs * total;
  const H = vertical ? cs * total : cs;
  let cells = '';
  for (let i = 0; i < total; i++) {
    const x = vertical ? 0 : i * cs, y = vertical ? i * cs : 0;
    cells += `<rect x="${x}" y="${y}" width="${cs}" height="${cs}" fill="${positions.has(i) ? color : '#ffffff'}" stroke="#374151" stroke-width="1.5" stroke-linejoin="round"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="border-radius:3px">${cells}</svg>`;
}

function renderDisque(total, positions, r, color) {
  const cx = r + 2, cy = r + 2, size = (r + 2) * 2;
  let s = '';
  if (total === 1) {
    s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#374151" stroke-width="1.5"/>`;
  } else {
    for (let i = 0; i < total; i++) {
      const a1 = (i / total) * 2 * Math.PI - Math.PI / 2;
      const a2 = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      s += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${(1 / total) > 0.5 ? 1 : 0} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${positions.has(i) ? color : '#ffffff'}" stroke="#374151" stroke-width="1.5"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#374151" stroke-width="1.5"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${s}</svg>`;
}

// Grille n×n — total parts = n², positions indexées ligne par ligne
function renderGrille(n, positions, cs, color) {
  const W = n * cs, H = n * cs;
  let cells = '';
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      cells += `<rect x="${col * cs}" y="${row * cs}" width="${cs}" height="${cs}" fill="${positions.has(row * n + col) ? color : '#ffffff'}" stroke="#374151" stroke-width="1.5" stroke-linejoin="round"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="border-radius:3px">${cells}</svg>`;
}

// Triangle équilatéral n divisions par côté → n² petits triangles
// Ordre d'énumération par bande i=0..n-1 : up(i,0), down(i,0), up(i,1), ..., up(i,i)
// up(i,k)   : pt(i,k)→pt(i+1,k)→pt(i+1,k+1)
// down(i,k) : pt(i,k)→pt(i,k+1)→pt(i+1,k+1)
function renderTriangle(n, positions, size, color) {
  const W = size, H = W * Math.sqrt(3) / 2, pad = 2;

  function pt(i, j) {
    return [pad + W / n * ((n - i) / 2 + j), pad + H * i / n];
  }

  let paths = '', idx = 0;
  for (let i = 0; i < n; i++) {
    for (let k = 0; k <= i; k++) {
      const [ax, ay] = pt(i, k), [bx, by] = pt(i + 1, k), [cx, cy] = pt(i + 1, k + 1);
      paths += `<path d="M${ax.toFixed(1)},${ay.toFixed(1)} L${bx.toFixed(1)},${by.toFixed(1)} L${cx.toFixed(1)},${cy.toFixed(1)} Z" fill="${positions.has(idx++) ? color : '#ffffff'}" stroke="#374151" stroke-width="1.5" stroke-linejoin="round"/>`;
      if (k < i) {
        const [dx, dy] = pt(i, k), [ex, ey] = pt(i, k + 1), [fx, fy] = pt(i + 1, k + 1);
        paths += `<path d="M${dx.toFixed(1)},${dy.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)} L${fx.toFixed(1)},${fy.toFixed(1)} Z" fill="${positions.has(idx++) ? color : '#ffffff'}" stroke="#374151" stroke-width="1.5" stroke-linejoin="round"/>`;
      }
    }
  }
  const svgW = (W + 2 * pad).toFixed(0), svgH = (H + 2 * pad).toFixed(0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">${paths}</svg>`;
}

// Polygone régulier à n côtés divisé en n secteurs triangulaires depuis le centre
function renderPolygone(n, positions, r, color) {
  const cx = r + 2, cy = r + 2, size = (r + 2) * 2;
  let paths = '';
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * 2 * Math.PI - Math.PI / 2;
    const a2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    paths += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${positions.has(i) ? color : '#ffffff'}" stroke="#374151" stroke-width="1.5" stroke-linejoin="round"/>`;
  }
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  paths += `<polygon points="${pts}" fill="none" stroke="#374151" stroke-width="1.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${paths}</svg>`;
}

// ── Web Component ─────────────────────────────────────────────────────────────

class FractionFigureComponent extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'total', 'colored', 'fill', 'orient', 'cellsize', 'color'];
  }

  connectedCallback()        { injectStyles(); this._render(); }
  attributeChangedCallback() { if (this.isConnected) this._render(); }

  _cfg() {
    const type     = this.getAttribute('type') || 'bande';
    const rawTotal = Math.max(1, parseInt(this.getAttribute('total') || '4'));

    // grille/triangle : total attr = n (côté), dénominateur réel = n²
    // polygone        : total = nb de côtés ≥ 3
    // bande/disque    : total = dénominateur ≥ 2
    let n, total;
    if (type === 'grille' || type === 'triangle') {
      n     = Math.max(2, rawTotal);
      total = n * n;
    } else if (type === 'polygone') {
      total = Math.max(3, rawTotal); // un polygone a au moins 3 côtés
      n     = total;
    } else {
      total = Math.max(2, rawTotal);
      n     = total;
    }

    const colored = Math.max(1, parseInt(this.getAttribute('colored') || '1'));
    return {
      type, n, total, colored,
      fill:     this.getAttribute('fill')     || 'random',
      orient:   this.getAttribute('orient')   || 'h',
      cellsize: this.getAttribute('cellsize') || 'auto',
      color:    this.getAttribute('color')    || '#60a5fa',
    };
  }

  // Produit un SVG pour une figure avec `col` parts colorées sur `total`
  _svgUnit(type, n, total, col, fill, vertical, cellsize, color) {
    const positions = col >= total
      ? new Set(Array.from({ length: total }, (_, i) => i)) // unité complète
      : getPositions(total, col, fill);

    if (type === 'grille') {
      const cs = cellsize === 'auto'
        ? Math.max(16, Math.min(52, Math.floor(180 / n)))
        : Math.max(12, parseInt(cellsize));
      return renderGrille(n, positions, cs, color);
    }
    if (type === 'triangle') {
      const size = cellsize === 'auto'
        ? Math.max(80, Math.min(180, n * 56))
        : Math.max(48, parseInt(cellsize));
      return renderTriangle(n, positions, size, color);
    }
    if (type === 'polygone') {
      const r = cellsize === 'auto' ? 50 : Math.max(20, parseInt(cellsize));
      return renderPolygone(n, positions, r, color);
    }
    if (type === 'disque') {
      const r = cellsize === 'auto' ? 50 : Math.max(20, parseInt(cellsize));
      return renderDisque(total, positions, r, color);
    }
    // bande (défaut)
    const cs = cellsize === 'auto'
      ? Math.max(18, Math.min(44, Math.floor(300 / total)))
      : Math.max(14, parseInt(cellsize));
    return renderBande(total, positions, vertical, cs, color);
  }

  _render() {
    const { type, n, total, colored, fill, orient, cellsize, color } = this._cfg();
    const vertical = orient === 'v' || (orient === 'random' && Math.random() < 0.5);
    this.dataset.solution = `${colored}/${total}`;

    // Décomposer en unités : figures complètes + éventuelle figure partielle
    const fullUnits = Math.floor(colored / total);
    const remainder = colored % total;
    const units = [
      ...Array(fullUnits).fill(total),
      ...(remainder > 0 ? [remainder] : []),
    ];

    const svgs = units.map(col =>
      this._svgUnit(type, n, total, col, fill, vertical, cellsize, color)
    );

    this.innerHTML = svgs.length === 1
      ? svgs[0]
      : `<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;justify-content:center">${svgs.join('')}</div>`;
  }
}

if (!customElements.get('math974-fraction-figure')) {
  customElements.define('math974-fraction-figure', FractionFigureComponent);
}

export default FractionFigureComponent;
export const defaultPosition = 'north';

export function randomize(config, rand, originalConfig) {
  if (!rand || !rand.totalRange) return config;

  const typePool   = rand.typePool   ?? [config.type   ?? 'bande'];
  const fillPool   = rand.fillPool   ?? [rand.fill      ?? 'random'];
  const orientPool = rand.orientPool ?? [rand.orient    ?? 'h'];
  const type   = typePool[Math.floor(Math.random() * typePool.length)];
  const fill   = fillPool[Math.floor(Math.random() * fillPool.length)];
  const orient = orientPool[Math.floor(Math.random() * orientPool.length)];
  const color    = rand.color    ?? config.color    ?? '#60a5fa';
  const cellsize = rand.cellsize ?? config.cellsize ?? 'auto';

  let total, colored;

  if (type === 'grille' || type === 'triangle') {
    // totalRange = plage de n (côté), le composant reçoit total=n et calcule n² en interne
    const [nMin, nMax] = rand.totalRange;
    const n      = Math.max(2, Math.floor(nMin + Math.random() * (nMax - nMin + 1)));
    const maxCol = n * n - 1;
    total        = n;
    const [cMin, cMax] = rand.coloredRange ?? [1, maxCol];
    const eMin = rand.minImproper ? Math.max(cMin, maxCol + 1) : cMin;
    colored = Math.max(eMin, Math.floor(eMin + Math.random() * (Math.max(eMin, cMax) - eMin + 1)));
  } else {
    // bande, disque, polygone : totalRange = plage du dénominateur
    const [tMin, tMax] = rand.totalRange;
    const minT = type === 'polygone' ? Math.max(3, tMin) : tMin;
    total = Math.max(minT, Math.floor(tMin + Math.random() * (tMax - tMin + 1)));
    const [cMin, cMax] = rand.coloredRange ?? [1, total - 1];
    // minImproper : garantit colored > total (au moins 1 unité entière + partie)
    const eMin = rand.minImproper ? Math.max(cMin, total + 1) : cMin;
    colored = Math.max(eMin, Math.floor(eMin + Math.random() * (Math.max(eMin, cMax) - eMin + 1)));
  }

  return { ...config, type, total, colored, fill, orient, color, cellsize };
}
