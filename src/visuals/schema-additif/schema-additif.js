// src/visuals/schema-additif/schema-additif.js
// Schéma additif — bande de référence pour la modélisation additive
//
// Mode statique  : total + part1 fournis directement en attributs
// Mode dynamique : content (template DSL) + part1expr + totalexpr
//                  → les valeurs du schéma sont calculées à partir du texte
//
// Level 1 : schéma avec 2 valeurs connues + 1 "?"
// Level 2 : schéma sans valeurs (texte toujours affiché)

import { TemplateEngine } from '../../utils/template-engine.js';

class SchemaAdditifComponent extends HTMLElement {
  static get observedAttributes() {
    return ['total','part1','unknown','unit','level','color1','color2','color3',
            'content','part1expr','totalexpr','position','labelt','label1','label2'];
  }

  connectedCallback()    { this.render(); }
  disconnectedCallback() { this._clearProjectedText(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  // Rectangle SVG avec coins arrondis sélectifs (r_tl, r_tr, r_br, r_bl)
  _path(x, y, w, h, r_tl = 0, r_tr = 0, r_br = 0, r_bl = 0) {
    const p = [];
    p.push(`M ${x + r_tl},${y}`);
    p.push(`H ${x + w - r_tr}`);
    if (r_tr) p.push(`Q ${x + w},${y} ${x + w},${y + r_tr}`);
    p.push(`V ${y + h - r_br}`);
    if (r_br) p.push(`Q ${x + w},${y + h} ${x + w - r_br},${y + h}`);
    p.push(`H ${x + r_bl}`);
    if (r_bl) p.push(`Q ${x},${y + h} ${x},${y + h - r_bl}`);
    p.push(`V ${y + r_tl}`);
    if (r_tl) p.push(`Q ${x},${y} ${x + r_tl},${y}`);
    p.push('Z');
    return p.join(' ');
  }

  _clearProjectedText() {
    if (this._textSlot) { this._textSlot.remove(); this._textSlot = null; }
    const card = this.closest?.('.q-card');
    if (card) card.querySelectorAll('.sa-projected-text').forEach(el => el.remove());
  }

  _projectText(html) {
    const card = this.closest?.('.q-card');
    const contentEl = card?.querySelector('.q-card-content');
    if (!contentEl) return;
    const slot = document.createElement('div');
    slot.className = 'sa-projected-text';
    slot.innerHTML = html;
    contentEl.prepend(slot);
    this._textSlot = slot;
    if (window.MathJax && this.isConnected)
      window.MathJax.typesetPromise([slot]).catch(e => console.warn('MathJax:', e));
  }

  render() {
    const content   = this.getAttribute('content')   || '';
    const part1expr = this.getAttribute('part1expr') || '';
    const totalexpr = this.getAttribute('totalexpr') || '';
    const unknown   = this.getAttribute('unknown')   || 'part1';
    const unit      = this.getAttribute('unit')      || '';
    const level     = parseInt(this.getAttribute('level') || '1');
    const position  = this.getAttribute('position')  || 'south';
    const c1        = this.getAttribute('color1') || '#c7d2fe'; // lavande (total)
    const c2        = this.getAttribute('color2') || '#fcd496'; // ambre   (part1)
    const c3        = this.getAttribute('color3') || '#86efb5'; // menthe  (part2)

    // En zone satellite, le composant projette son texte dans .q-card-content
    const ZONES = new Set(['north', 'south', 'east', 'west']);
    const inSatellite = ZONES.has(this.getAttribute('position'));

    this._clearProjectedText();

    let total, part1, textHTML = '';

    if (content) {
      // ── Mode dynamique ──────────────────────────────────────────────────
      const engine = new TemplateEngine();
      engine.reset();
      const parsed = engine.parse(content, 'web').replace(/\n/g, '<br>');

      if (inSatellite) {
        this._projectText(parsed);
      } else {
        textHTML = parsed;
      }

      // Calculer total et part1 à partir des expressions sur les variables
      part1 = part1expr ? engine.evaluate(part1expr) : parseFloat(this.getAttribute('part1') || '0');
      total = totalexpr ? engine.evaluate(totalexpr) : parseFloat(this.getAttribute('total') || '0');
    } else {
      // ── Mode statique ───────────────────────────────────────────────────
      total = parseFloat(this.getAttribute('total') || '60');
      part1 = parseFloat(this.getAttribute('part1') || '20');
    }

    const labelt = this.getAttribute('labelt') || '';
    const label1 = this.getAttribute('label1') || '';
    const label2 = this.getAttribute('label2') || '';

    const part2 = Math.round((total - part1) * 1000) / 1000;

    // ── Géométrie SVG ───────────────────────────────────────────────────
    // LABEL_W : zone de gauche réservée aux étiquettes externes (labelt, label1)
    const hasLeftLabels = labelt || label1;
    const LABEL_W = hasLeftLabels ? 52 : 10;
    const W   = 280;
    const PAD_R = 10;
    const BW  = W - LABEL_W - PAD_R;
    const BH  = 46;
    const GAP = 10;  // espace inter-barres (label2 s'y glisse)
    const R   = 5;
    const H   = LABEL_W > 10 ? (PAD_R + BH + GAP + BH + PAD_R)
                              : (10    + BH + GAP + BH + 10);

    const x0   = LABEL_W;
    const yTop = LABEL_W > 10 ? PAD_R : 10;
    const yBot = yTop + BH + GAP;

    const ratio1 = total > 0 ? Math.max(0.08, Math.min(0.92, part1 / total)) : 0.5;
    const w1 = Math.round(BW * ratio1);
    const w2 = BW - w1;

    const pathLeft  = this._path(x0,      yBot, w1, BH, R, 0, 0, R);
    const pathRight = this._path(x0 + w1, yBot, w2, BH, 0, R, R, 0);

    // ── Labels valeurs (masqués au niveau 2) ────────────────────────────
    const fmt = (v) => unit ? `${v}\u202F${unit}` : `${v}`;
    const lbl = (v, isUnknown) => {
      if (level >= 2) return '';
      return isUnknown ? '?' : fmt(v);
    };

    const lblT = lbl(total, unknown === 'total');
    const lbl1 = lbl(part1, unknown === 'part1');
    const lbl2 = lbl(part2, unknown === 'part2');

    const cyTop = yTop + BH / 2;
    const cyBot = yBot + BH / 2;
    const cxTop = x0 + BW / 2;
    const cx1   = x0 + w1 / 2;
    const cx2   = x0 + w1 + w2 / 2;

    const MIN_W = 28;

    // Valeurs centrées dans les barres
    const txt = (label, cx, cy) => {
      if (!label) return '';
      const isQ = label === '?';
      return `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}"
        font-size="${isQ ? 20 : 15}" font-family="sans-serif" font-weight="800"
        fill="${isQ ? '#6d28d9' : '#1e293b'}"
        text-anchor="middle" dominant-baseline="middle">${label}</text>`;
    };

    // Étiquettes externes (noms) — à gauche de chaque barre
    const barLbl = (text, x, y) => {
      if (!text) return '';
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}"
        font-size="11" font-family="sans-serif" font-weight="700" font-style="italic"
        fill="#475569" text-anchor="end" dominant-baseline="middle">${text}</text>`;
    };
    // label2 : petit, dans l'espace inter-barres, centré au-dessus de la barre droite
    const barLbl2 = (text, cx, y) => {
      if (!text) return '';
      return `<text x="${cx.toFixed(1)}" y="${y.toFixed(1)}"
        font-size="9" font-family="sans-serif" font-weight="700" font-style="italic"
        fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">${text}</text>`;
    };

    // ── Rendu ───────────────────────────────────────────────────────────
    this.style.display = 'block';

    const gapMid = yTop + BH + GAP / 2;

    const schemaSVG = `
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
           width="${W}" height="${H}" style="display:block;max-width:100%;height:auto">
        ${barLbl(labelt, x0 - 5, cyTop)}
        ${barLbl(label1, x0 - 5, cyBot)}
        ${barLbl2(label2, cx2, gapMid)}
        <rect x="${x0}" y="${yTop}" width="${BW}" height="${BH}" rx="${R}" fill="${c1}"/>
        ${txt(lblT, cxTop, cyTop)}
        <path d="${pathLeft}"  fill="${c2}"/>
        <path d="${pathRight}" fill="${c3}"/>
        <line x1="${(x0+w1).toFixed(1)}" y1="${yBot}"
              x2="${(x0+w1).toFixed(1)}" y2="${yBot+BH}"
              stroke="white" stroke-width="2.5"/>
        ${w1 >= MIN_W ? txt(lbl1, cx1, cyBot) : ''}
        ${w2 >= MIN_W ? txt(lbl2, cx2, cyBot) : ''}
      </svg>`;

    if (textHTML) {
      // Mode dynamique : texte + schéma
      // La `position` contrôle le layout interne (où sont les barres par rapport au texte)
      const isRow      = position === 'east' || position === 'west';
      const flexDir    = isRow
        ? (position === 'west' ? 'row-reverse' : 'row')
        : (position === 'north' ? 'column-reverse' : 'column');
      const alignItems = isRow ? 'center' : 'flex-start';
      const textFlex   = isRow ? 'flex:1;min-width:0;' : '';

      this.innerHTML = `
        <div style="display:flex;flex-direction:${flexDir};gap:10px;align-items:${alignItems};width:100%;">
          <div class="sa-text" style="
            ${textFlex}
            font-family:inherit;font-size:1.1rem;font-weight:600;color:#334155;
            line-height:1.5;">
            ${textHTML}
          </div>
          <div style="flex-shrink:0;">
            ${schemaSVG}
          </div>
        </div>`;

      // MathJax sur le bloc texte
      const textEl = this.querySelector('.sa-text');
      if (textEl && window.MathJax && this.isConnected) {
        window.MathJax.typesetPromise([textEl]).catch(e => console.warn('MathJax:', e));
      }
    } else {
      this.innerHTML = schemaSVG;
    }
  }
}

customElements.define('math974-schema-additif', SchemaAdditifComponent);
export default SchemaAdditifComponent;
export const defaultPosition = 'east';

export async function randomize(config, rand) {
  if (config.content) return { ...config }; // template mode: re-init re-evaluates ranges
  const { randomize: rnd } = await import('./editor.js');
  return rnd(config, { totalMin: 20, totalMax: 99, totalStep: 10, ...(rand || {}) });
}
