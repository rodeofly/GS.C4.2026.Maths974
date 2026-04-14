// src/visuals/polygone-perimetre/polygone-perimetre.js
// Web Component — Polygones étiquetés pour le calcul de périmètre
//
// Shapes : rect, carre, losange, kite, quad, L, escalier, tri_rect, tri_iso
// Level 1 : tous les côtés étiquetés
// Level 2 : côtés déductibles masqués (contraintes de forme)
// Level 3 : davantage de côtés masqués
// Aesthetic : tracé "main levée" (courbes de Bézier avec léger offset)

class PolygonePerimetreComponent extends HTMLElement {
  static get observedAttributes() {
    return ['seed', 'shape', 'unit', 'level', 'showmetrics', 'color'];
  }

  connectedCallback()  { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  // ── PRNG déterministe (LCG) ─────────────────────────────────────────────
  makePRNG(seed) {
    let s = 0;
    for (const ch of String(seed)) s = (Math.imul(s, 31) + ch.charCodeAt(0)) | 0;
    s = (s >>> 0) || 1;
    return () => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  ri(rand, min, max) {
    return min + Math.floor(rand() * (max - min + 1));
  }

  // ── Centroïde ────────────────────────────────────────────────────────────
  centroid(pts) {
    return [
      pts.reduce((s, p) => s + p[0], 0) / pts.length,
      pts.reduce((s, p) => s + p[1], 0) / pts.length,
    ];
  }

  // ── Normale extérieure d'un segment ──────────────────────────────────────
  outNorm(p1, p2, cx, cy) {
    const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
    const len = Math.hypot(dx, dy);
    let nx = -dy / len, ny = dx / len;
    if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny; }
    return [nx, ny];
  }

  // ── Tracé "main levée" via courbes de Bézier quadratiques ───────────────
  wobblyPath(pts, rand, amount = 2.5) {
    const n = pts.length;
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p1 = pts[i], p2 = pts[(i + 1) % n];
      const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
      const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
      const len = Math.hypot(dx, dy);
      const nx = -dy / len, ny = dx / len;
      const off = (rand() - 0.5) * amount;
      d += ` Q ${(mx + nx * off).toFixed(1)} ${(my + ny * off).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + ' Z';
  }

  // ── Symbole d'angle droit (petit carré) ──────────────────────────────────
  rightAngleMark(pts, vIdx, size = 7) {
    const n = pts.length;
    const v = pts[vIdx];
    const vPrev = pts[(vIdx - 1 + n) % n];
    const vNext = pts[(vIdx + 1) % n];
    const d1 = [vPrev[0] - v[0], vPrev[1] - v[1]];
    const l1 = Math.hypot(...d1);
    const u1 = [d1[0] / l1, d1[1] / l1];
    const d2 = [vNext[0] - v[0], vNext[1] - v[1]];
    const l2 = Math.hypot(...d2);
    const u2 = [d2[0] / l2, d2[1] / l2];
    const q1 = [v[0] + size * u1[0], v[1] + size * u1[1]];
    const q2 = [v[0] + size * u1[0] + size * u2[0], v[1] + size * u1[1] + size * u2[1]];
    const q3 = [v[0] + size * u2[0], v[1] + size * u2[1]];
    return `M ${q1[0].toFixed(1)} ${q1[1].toFixed(1)} L ${q2[0].toFixed(1)} ${q2[1].toFixed(1)} L ${q3[0].toFixed(1)} ${q3[1].toFixed(1)}`;
  }

  // ── Marques d'égalité (tirets perpendiculaires) ──────────────────────────
  // ticks: 0 = 1 trait, 1 = 2 traits, 2 = 3 traits
  tickMarks(p1, p2, ticks, size = 6) {
    const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
    const len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len;
    const ux = dx / len, uy = dy / len;
    const count = ticks + 1;
    const spacing = 3;
    let d = '';
    for (let i = 0; i < count; i++) {
      const off = (i - (count - 1) / 2) * spacing;
      const cx = mx + ux * off, cy = my + uy * off;
      d += `M ${(cx - nx * size).toFixed(1)} ${(cy - ny * size).toFixed(1)} L ${(cx + nx * size).toFixed(1)} ${(cy + ny * size).toFixed(1)} `;
    }
    return d.trim();
  }

  // ── Templates de formes ──────────────────────────────────────────────────
  // Chaque template retourne : { pts, sides, rightAngles, perimeter, svgW, svgH }
  // sides[i] : { i, j, val, ticks (-1 = sans), hideAt (level à partir duquel cacher) }

  genShapeData(rand, shapeName, vmin, vmax) {
    const S = 15; // px par unité pour les formes rectilinéaires
    const P = 48; // padding pour les étiquettes (assez grand pour "9 cm" en text-anchor:end)

    switch (shapeName) {

      // ── Rectangle ─────────────────────────────────────────────────────────
      case 'rect': {
        const w = this.ri(rand, Math.max(2, vmin), Math.min(9, vmax));
        const h = this.ri(rand, Math.max(2, vmin), Math.min(9, vmax));
        const pts = [
          [P,       P + h * S],
          [P + w*S, P + h * S],
          [P + w*S, P],
          [P,       P],
        ];
        return {
          pts,
          sides: [
            { i:0, j:1, val:w, ticks:0, hideAt:99 },
            { i:1, j:2, val:h, ticks:1, hideAt:99 },
            { i:2, j:3, val:w, ticks:0, hideAt:2  },
            { i:3, j:0, val:h, ticks:1, hideAt:2  },
          ],
          rightAngles: [0, 1, 2, 3],
          perimeter: 2 * (w + h),
          svgW: w * S + 2 * P,
          svgH: h * S + 2 * P,
        };
      }

      // ── Carré ──────────────────────────────────────────────────────────────
      case 'carre': {
        const a = this.ri(rand, Math.max(2, vmin), Math.min(9, vmax));
        const pts = [
          [P,       P + a * S],
          [P + a*S, P + a * S],
          [P + a*S, P],
          [P,       P],
        ];
        return {
          pts,
          sides: [
            { i:0, j:1, val:a, ticks:0, hideAt:2  },
            { i:1, j:2, val:a, ticks:0, hideAt:2  },
            { i:2, j:3, val:a, ticks:0, hideAt:2  },
            { i:3, j:0, val:a, ticks:0, hideAt:99 },
          ],
          rightAngles: [0, 1, 2, 3],
          perimeter: 4 * a,
          svgW: a * S + 2 * P,
          svgH: a * S + 2 * P,
        };
      }

      // ── Losange (diamant) ─────────────────────────────────────────────────
      case 'losange': {
        const a = this.ri(rand, vmin, vmax);
        const W = 200, H = 155;
        const cx = W / 2, cy = H / 2;
        const rx = W / 2 - P, ry = H / 2 - P;
        const pts = [
          [cx,      P],       // haut
          [cx + rx, cy],      // droite
          [cx,      H - P],   // bas
          [cx - rx, cy],      // gauche
        ];
        return {
          pts,
          sides: [
            { i:0, j:1, val:a, ticks:0, hideAt:2  },
            { i:1, j:2, val:a, ticks:0, hideAt:2  },
            { i:2, j:3, val:a, ticks:0, hideAt:2  },
            { i:3, j:0, val:a, ticks:0, hideAt:99 },
          ],
          rightAngles: [],
          perimeter: 4 * a,
          svgW: W,
          svgH: H,
        };
      }

      // ── Cerf-volant (kite) ────────────────────────────────────────────────
      case 'kite': {
        const a = this.ri(rand, vmin, vmax);
        let b = this.ri(rand, vmin, vmax);
        while (b === a) b = this.ri(rand, vmin, vmax);
        const W = 200, H = 195;
        const cx = W / 2;
        const pts = [
          [cx,      P],
          [W - P,   P + 72],
          [cx,      H - P],
          [P,       P + 72],
        ];
        return {
          pts,
          sides: [
            { i:0, j:1, val:a, ticks:0, hideAt:2  },
            { i:1, j:2, val:b, ticks:1, hideAt:2  },
            { i:2, j:3, val:b, ticks:1, hideAt:99 },
            { i:3, j:0, val:a, ticks:0, hideAt:2  },
          ],
          rightAngles: [],
          perimeter: 2 * (a + b),
          svgW: W,
          svgH: H,
        };
      }

      // ── Quadrilatère quelconque ───────────────────────────────────────────
      case 'quad': {
        const vals = [
          this.ri(rand, vmin, vmax),
          this.ri(rand, vmin, vmax),
          this.ri(rand, vmin, vmax),
          this.ri(rand, vmin, vmax),
        ];
        const W = 215, H = 175;
        // Forme légèrement irrégulière : part d'un rectangle et wobble les coins
        const mx0 = (rand() - 0.5) * 18, my0 = (rand() - 0.5) * 14;
        const mx1 = (rand() - 0.5) * 14, my1 = (rand() - 0.5) * 18;
        const mx2 = (rand() - 0.5) * 16, my2 = (rand() - 0.5) * 12;
        const mx3 = (rand() - 0.5) * 12, my3 = (rand() - 0.5) * 16;
        const pts = [
          [P + mx0,       H - P + my0],
          [W - P + mx1,   H - P + my1],
          [W - P + mx2,   P + my2],
          [P + mx3,       P + my3],
        ];
        return {
          pts,
          sides: [
            { i:0, j:1, val:vals[0], ticks:-1, hideAt:99 },
            { i:1, j:2, val:vals[1], ticks:-1, hideAt:99 },
            { i:2, j:3, val:vals[2], ticks:-1, hideAt:99 },
            { i:3, j:0, val:vals[3], ticks:-1, hideAt:99 },
          ],
          rightAngles: [],
          perimeter: vals.reduce((s, v) => s + v, 0),
          svgW: W,
          svgH: H,
        };
      }

      // ── Forme en L ────────────────────────────────────────────────────────
      case 'L': {
        const a = this.ri(rand, Math.max(4, vmin), Math.min(9, vmax));
        const c = this.ri(rand, Math.max(4, vmin), Math.min(9, vmax));
        const b = this.ri(rand, 1, a - 2);   // largeur de l'entaille (droite)
        const d = this.ri(rand, 1, c - 2);   // hauteur du gradin

        // Sommets (sens horaire, origin haut-gauche):
        // (0) TL, (1) TR-interne, (2) gradin, (3) gradin-droite, (4) BR, (5) BL
        // -> côté haut = a-b, vertical interne = c-d, gradin horiz = b, vertical droite = d, bas = a, gauche = c
        const pts = [
          [P,               P],
          [P + (a-b)*S,     P],
          [P + (a-b)*S,     P + (c-d)*S],
          [P + a*S,         P + (c-d)*S],
          [P + a*S,         P + c*S],
          [P,               P + c*S],
        ];
        return {
          pts,
          sides: [
            { i:0, j:1, val:a-b, ticks:-1, hideAt:3  }, // haut (déductible du bas + gradin)
            { i:1, j:2, val:c-d, ticks:-1, hideAt:2  }, // vertical interne (déductible)
            { i:2, j:3, val:b,   ticks:-1, hideAt:2  }, // gradin horizontal (déductible)
            { i:3, j:4, val:d,   ticks:-1, hideAt:99 }, // vertical droite
            { i:4, j:5, val:a,   ticks:-1, hideAt:99 }, // bas
            { i:5, j:0, val:c,   ticks:-1, hideAt:99 }, // gauche
          ],
          rightAngles: [0, 1, 2, 3, 4, 5],
          perimeter: 2 * (a + c),
          svgW: a * S + 2 * P,
          svgH: c * S + 2 * P,
        };
      }

      // ── Escalier ──────────────────────────────────────────────────────────
      case 'escalier': {
        const a = this.ri(rand, Math.max(4, vmin), Math.min(9, vmax));
        const c = this.ri(rand, Math.max(4, vmin), Math.min(9, vmax));
        const b = this.ri(rand, 1, a - 2);
        const d = this.ri(rand, 1, c - 2);

        // Forme en escalier (2 marches) :
        // (0) TL, (1) gradin-h-1, (2) gradin-v-1, (3) TR, (4) BR, (5) gradin-v-2, (6) gradin-h-2, (7) BL
        const pts = [
          [P,           P],
          [P + (a-b)*S, P],
          [P + (a-b)*S, P + d*S],
          [P + a*S,     P + d*S],
          [P + a*S,     P + c*S],
          [P + b*S,     P + c*S],
          [P + b*S,     P + (c-d)*S],
          [P,           P + (c-d)*S],
        ];
        return {
          pts,
          sides: [
            { i:0, j:1, val:a-b, ticks:-1, hideAt:2  },
            { i:1, j:2, val:d,   ticks:-1, hideAt:99 },
            { i:2, j:3, val:b,   ticks:-1, hideAt:2  },
            { i:3, j:4, val:c-d, ticks:-1, hideAt:2  },
            { i:4, j:5, val:a-b, ticks:-1, hideAt:2  },
            { i:5, j:6, val:d,   ticks:-1, hideAt:2  },
            { i:6, j:7, val:b,   ticks:-1, hideAt:99 },
            { i:7, j:0, val:c-d, ticks:-1, hideAt:99 },
          ],
          rightAngles: [0, 1, 2, 3, 4, 5, 6, 7],
          perimeter: 2 * (a + c),
          svgW: a * S + 2 * P,
          svgH: c * S + 2 * P,
        };
      }

      // ── Triangle rectangle (triple pythagoricienne) ───────────────────────
      case 'tri_rect': {
        const triples = [[3,4,5],[5,12,13],[8,15,17],[7,24,25]];
        const [ta, tb, tc] = triples[Math.floor(rand() * triples.length)];
        const k  = this.ri(rand, 1, Math.floor(vmax / Math.max(ta, tb)));
        const a  = ta * k, b = tb * k, c = tc * k;
        const W = 220, H = 185;
        // Recalculer pour que le triangle tienne dans le canvas
        const sc = Math.min((W - 2*P) / (a), (H - 2*P) / (b));
        const pts2 = [
          [P,           H - P],
          [P + a * sc,  H - P],
          [P,           H - P - b * sc],
        ];
        return {
          pts: pts2,
          sides: [
            { i:0, j:1, val:a, ticks:-1, hideAt:99 },
            { i:1, j:2, val:c, ticks:-1, hideAt:2  },
            { i:2, j:0, val:b, ticks:-1, hideAt:99 },
          ],
          rightAngles: [0],
          perimeter: a + b + c,
          svgW: W,
          svgH: H,
        };
      }

      // ── Triangle isocèle ──────────────────────────────────────────────────
      case 'tri_iso': {
        const a = this.ri(rand, vmin, vmax);   // côtés égaux
        let b = this.ri(rand, vmin, vmax);     // base
        while (b === a) b = this.ri(rand, vmin, vmax);
        const W = 210, H = 185;
        const cx = W / 2;
        const pts = [
          [cx,       P],
          [cx + W/2 - P, H - P],
          [P,        H - P],
        ];
        return {
          pts,
          sides: [
            { i:0, j:1, val:a, ticks:0, hideAt:2  },
            { i:1, j:2, val:b, ticks:-1, hideAt:99 },
            { i:2, j:0, val:a, ticks:0, hideAt:2  },
          ],
          rightAngles: [],
          perimeter: 2 * a + b,
          svgW: W,
          svgH: H,
        };
      }

      // ── Triangle quelconque (fallback) ─────────────────────────────────────
      default: {
        return this.genShapeData(rand, 'rect', vmin, vmax);
      }
    }
  }

  // ── Rendu principal ───────────────────────────────────────────────────────
  render() {
    const seed        = this.getAttribute('seed')        || 'poly';
    const shapeName   = this.getAttribute('shape')       || 'rect';
    const unit        = this.getAttribute('unit')        || 'cm';
    const level       = parseInt(this.getAttribute('level')       || '1');
    const showMetrics = this.getAttribute('showmetrics') === 'true';
    const color       = this.getAttribute('color')       || '#1d4ed8';

    // Plages de valeurs (passées via attribut JSON ou défaut)
    let valueRange = [2, 9];
    try {
      const vr = JSON.parse(this.getAttribute('valuerange') || 'null');
      if (Array.isArray(vr) && vr.length === 2) valueRange = vr;
    } catch (_) {}
    const [vmin, vmax] = valueRange;

    const rand = this.makePRNG(seed);

    // Choisir la forme (aléatoirement parmi une liste si 'random')
    let shape = shapeName;
    if (shape === 'random') {
      const all = ['rect','carre','losange','kite','quad','L','escalier','tri_rect','tri_iso'];
      shape = all[Math.floor(rand() * all.length)];
    }

    const data = this.genShapeData(rand, shape, vmin, vmax);
    const { pts, sides, rightAngles, perimeter, svgW, svgH } = data;

    // Exposer les métriques
    this.dataset.perimeter = perimeter;
    this.dataset.shape     = shape;

    const [cx, cy] = this.centroid(pts);

    // ── Tracé wobbly ────────────────────────────────────────────────────────
    const pathD = this.wobblyPath(pts, rand, 2);

    // ── Angles droits ────────────────────────────────────────────────────────
    let rightAngleSVG = '';
    for (const vi of rightAngles) {
      const d = this.rightAngleMark(pts, vi, 7);
      if (d) rightAngleSVG += `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.2"/>`;
    }

    // ── Marques d'égalité et étiquettes ──────────────────────────────────────
    let ticksSVG   = '';
    let labelsSVG  = '';
    const LABEL_OFFSET = 16;
    const FONT_SIZE    = 11;

    for (const side of sides) {
      const p1 = pts[side.i], p2 = pts[side.j];
      const [nx, ny] = this.outNorm(p1, p2, cx, cy);
      const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;

      // Marques d'égalité (toujours visibles même si côté masqué)
      if (side.ticks >= 0) {
        ticksSVG += `<path d="${this.tickMarks(p1, p2, side.ticks)}" stroke="${color}" stroke-width="1.5" fill="none"/>`;
      }

      // Étiquette (conditionnelle au niveau)
      const show = level < side.hideAt;
      if (show) {
        const lx = mx + nx * LABEL_OFFSET;
        const ly = my + ny * LABEL_OFFSET;
        // Ancrage horizontal selon direction de la normale
        const anchor = Math.abs(nx) > 0.4
          ? (nx > 0 ? 'start' : 'end')
          : 'middle';
        labelsSVG += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}"
          text-anchor="${anchor}" dominant-baseline="middle"
          font-size="${FONT_SIZE}" font-family="sans-serif"
          font-weight="600" fill="#1e293b">${side.val} ${unit}</text>`;
      }
    }

    // ── Barre de métriques (mode prof) ───────────────────────────────────────
    const titleEl = `<title>Périmètre : ${perimeter} ${unit}</title>`;
    const metricsBar = showMetrics
      ? `<text x="${(svgW / 2).toFixed(1)}" y="${svgH - 3}"
           text-anchor="middle" font-size="8" fill="#64748b" font-family="sans-serif">
           P = ${perimeter} ${unit}
         </text>`
      : '';

    const svgHFinal = showMetrics ? svgH + 10 : svgH;

    this.style.display = 'block';
    this.innerHTML = `<svg viewBox="0 0 ${svgW} ${svgHFinal}"
         xmlns="http://www.w3.org/2000/svg"
         width="${svgW}" height="${svgHFinal}"
         style="display:block;max-width:100%;height:auto">
      ${titleEl}
      <path d="${pathD}" fill="${color}" fill-opacity="0.08"
            stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${rightAngleSVG}
      ${ticksSVG}
      ${labelsSVG}
      ${metricsBar}
    </svg>`;
  }
}

customElements.define('math974-polygone-perimetre', PolygonePerimetreComponent);
export default PolygonePerimetreComponent;
