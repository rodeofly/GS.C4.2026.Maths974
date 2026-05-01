// src/visuals/ordre-nombres/ordre-nombres.js
// Web Component — Liste draggable à ordonner (croissant ou décroissant)
//
// Attrs  : items (JSON), direction ('asc'|'desc'), unit, step, layout ('vertical'|'horizontal')
// Expose : validate()        → colore les tuiles sans verrouiller
//          toggleSolution()  → révèle/cache la solution (verrouille le drag)
// dataset.placeMode = '1'  → empêche l'injection d'un <input> texte

const CSS = `
math974-ordre-nombres {
  display: block;
  padding: 4px 0;
  user-select: none;
  -webkit-user-select: none;
}
math974-ordre-nombres .on-dir {
  font-size: 0.78em;
  color: #6b7280;
  text-align: center;
  margin-bottom: 6px;
  font-style: italic;
}
math974-ordre-nombres .on-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  touch-action: none;
}
math974-ordre-nombres .on-list.horiz {
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 18px;
}
math974-ordre-nombres .on-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: #f9fafb;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  cursor: grab;
  transition: border-color 0.2s, background 0.2s;
  box-sizing: border-box;
}
math974-ordre-nombres .on-list.horiz .on-item {
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  text-align: center;
  min-width: 0;
}
math974-ordre-nombres .on-item:active { cursor: grabbing; }
math974-ordre-nombres .on-handle {
  color: #9ca3af;
  font-size: 1.1em;
  line-height: 1;
  flex-shrink: 0;
}
math974-ordre-nombres .on-list.horiz .on-handle {
  font-size: 0.85em;
}
math974-ordre-nombres .on-name {
  font-weight: 500;
  color: #374151;
  font-size: 0.85em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
math974-ordre-nombres .on-val {
  font-weight: 700;
  color: #1e293b;
  font-size: 1em;
  margin-left: auto;
  white-space: nowrap;
}
math974-ordre-nombres .on-list.horiz .on-val {
  margin-left: 0;
  font-size: 1.1em;
}
math974-ordre-nombres .on-ghost {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: #fff;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(59,130,246,0.25);
  cursor: grabbing;
  box-sizing: border-box;
  pointer-events: none;
  z-index: 9999;
  position: fixed;
}
math974-ordre-nombres .on-ghost .on-val { margin-left: auto; }
math974-ordre-nombres .on-list.horiz .on-item:not(:last-child)::before {
  content: attr(data-chevron);
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1em;
  font-weight: 700;
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}
math974-ordre-nombres .on-list.horiz.dragging .on-item::before { content: none; }
math974-ordre-nombres .on-correct {
  border-color: #16a34a !important;
  background: #f0fdf4 !important;
}
math974-ordre-nombres .on-incorrect {
  border-color: #dc2626 !important;
  background: #fef2f2 !important;
}
math974-ordre-nombres .on-correct::after,
math974-ordre-nombres .on-incorrect::after {
  position: absolute;
  top: 2px;
  right: 5px;
  font-size: 0.7em;
  font-weight: 900;
  line-height: 1;
  pointer-events: none;
}
math974-ordre-nombres .on-correct::after   { content: '✓'; color: #16a34a; }
math974-ordre-nombres .on-incorrect::after { content: '✗'; color: #dc2626; }
`;

function injectStyles() {
  if (document.getElementById('on-styles')) return;
  const s = document.createElement('style');
  s.id = 'on-styles';
  s.textContent = CSS;
  document.head.appendChild(s);
}

function snap(v, step) { return Math.round(v / step) * step; }

function fmtVal(v, step) {
  if (!step || step >= 1) return String(Math.round(v));
  const dec = Math.max(0, Math.round(-Math.log10(step)));
  return v.toFixed(dec).replace('.', ',');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function correctOrder(items, direction) {
  return [...items].sort((a, b) =>
    direction === 'asc' ? a.value - b.value : b.value - a.value
  );
}

class OrdreNombresComponent extends HTMLElement {
  static get observedAttributes() {
    return ['items', 'direction', 'unit', 'step', 'layout'];
  }

  connectedCallback()        { injectStyles(); this._solutionVisible = false; this._locked = false; this._render(); }
  attributeChangedCallback() { if (this.isConnected) { this._solutionVisible = false; this._locked = false; this._render(); } }

  _cfg() {
    return {
      items:     JSON.parse(this.getAttribute('items') || '[]'),
      direction: this.getAttribute('direction') || 'desc',
      unit:      this.getAttribute('unit') || '',
      step:      parseFloat(this.getAttribute('step') || '1'),
      layout:    this.getAttribute('layout') || 'vertical',
    };
  }

  _itemHtml(it, step, unit) {
    const nameHtml = it.label ? `<span class="on-name">${it.label}</span>` : '';
    const valHtml  = `<span class="on-val">${fmtVal(it.value, step)}${unit ? ' ' + unit : ''}</span>`;
    return `<span class="on-handle">⠿</span>${nameHtml}${valHtml}`;
  }

  _render() {
    const { items, direction: dirAttr, unit, step, layout } = this._cfg();
    if (!items.length) { this.innerHTML = ''; return; }

    const direction = dirAttr === 'random'
      ? (Math.random() < 0.5 ? 'asc' : 'desc')
      : (dirAttr || 'desc');
    this._direction = direction; // direction résolue, utilisée par validate/toggleSolution

    const sorted = correctOrder(items, direction);
    this.dataset.solution  = sorted.map(it => it.short ?? it.label).join(',');
    this.dataset.placeMode = '1';

    let displayed = shuffle(items);
    if (displayed.map(it => it.short ?? it.label).join(',') === this.dataset.solution && displayed.length > 1) {
      [displayed[0], displayed[1]] = [displayed[1], displayed[0]];
    }

    const ordre = direction === 'asc' ? 'croissant' : 'décroissant';
    const expl  = layout === 'horizontal'
      ? (direction === 'asc' ? 'du plus petit au plus grand' : 'du plus grand au plus petit')
      : (direction === 'asc' ? 'du plus petit en haut, au plus grand en bas' : 'du plus grand en haut, au plus petit en bas');
    const dirLabel = `Classer dans l'ordre ${ordre} <span style="font-weight:400">(${expl})</span>`;
    const listClass = layout === 'horizontal' ? 'on-list horiz' : 'on-list';

    this.innerHTML = `
      <div class="on-dir">${dirLabel}</div>
      <div class="${listClass}">
        ${displayed.map(it =>
          `<div class="on-item" data-short="${it.short ?? it.label}" data-chevron="${direction === 'asc' ? '<' : '>'}">${this._itemHtml(it, step, unit)}</div>`
        ).join('')}
      </div>
    `;

    this._setupDrag(layout);
  }

  // Valide sans verrouiller — appelé par le bouton ✓
  validate() {
    const { items } = this._cfg();
    const correctArr = correctOrder(items, this._direction || 'desc').map(it => it.short ?? it.label);
    this.querySelectorAll('.on-item').forEach((el, i) => {
      el.classList.toggle('on-correct',   el.dataset.short === correctArr[i]);
      el.classList.toggle('on-incorrect', el.dataset.short !== correctArr[i]);
    });
  }

  // Révèle/cache la solution — appelé par 👁
  toggleSolution() {
    this._solutionVisible = !this._solutionVisible;
    const list = this.querySelector('.on-list');
    const { items } = this._cfg();
    const direction = this._direction || 'desc';

    if (this._solutionVisible) {
      // Sauvegarder l'ordre actuel de l'élève
      this._studentOrder = [...list.querySelectorAll('.on-item')];
      // Réordonner dans le bon ordre + tout vert
      const sorted = correctOrder(items, direction);
      const itemEls = [...list.querySelectorAll('.on-item')];
      sorted.forEach(it => {
        const el = itemEls.find(e => e.dataset.short === (it.short ?? it.label));
        if (el) { list.appendChild(el); el.classList.add('on-correct'); el.classList.remove('on-incorrect'); }
      });
      this._locked = true;
    } else {
      // Restaurer l'ordre de l'élève
      (this._studentOrder || []).forEach(el => {
        list.appendChild(el);
        el.classList.remove('on-correct', 'on-incorrect');
      });
      this._studentOrder = null;
      this._locked = false;
    }
    return this._solutionVisible;
  }

  _setupDrag(layout) {
    const list    = this.querySelector('.on-list');
    const isHoriz = layout === 'horizontal';
    let ghost = null, capturedItem = null, activePid = null;
    let startX = 0, startY = 0, origLeft = 0, origTop = 0;

    list.addEventListener('pointerdown', e => {
      if (this._locked || capturedItem) return;
      const item = e.target.closest('.on-item');
      if (!item) return;
      e.preventDefault();

      const rect = item.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      origLeft = rect.left; origTop = rect.top;
      activePid = e.pointerId;

      ghost = document.createElement('div');
      ghost.className = 'on-ghost';
      ghost.innerHTML = item.innerHTML;
      ghost.style.top    = rect.top    + 'px';
      ghost.style.left   = rect.left   + 'px';
      ghost.style.width  = rect.width  + 'px';
      ghost.style.height = rect.height + 'px';
      if (isHoriz) {
        ghost.style.flexDirection = 'column';
        ghost.style.alignItems    = 'center';
        ghost.style.textAlign     = 'center';
      }
      document.body.appendChild(ghost);

      item.style.opacity = '0.35';
      list.classList.add('dragging');   // cache les ::before chevrons
      capturedItem = item;
      list.setPointerCapture(activePid);
    });

    list.addEventListener('pointermove', e => {
      if (!capturedItem || e.pointerId !== activePid) return;
      e.preventDefault();

      ghost.style.top  = (origTop  + e.clientY - startY) + 'px';
      ghost.style.left = (origLeft + e.clientX - startX) + 'px';

      const siblings = [...list.querySelectorAll('.on-item')].filter(s => s !== capturedItem);
      let placed = false;
      for (const sib of siblings) {
        const sr  = sib.getBoundingClientRect();
        const mid = isHoriz ? sr.left + sr.width / 2 : sr.top + sr.height / 2;
        const pos = isHoriz ? e.clientX : e.clientY;
        if (pos < mid) { list.insertBefore(capturedItem, sib); placed = true; break; }
      }
      if (!placed) list.appendChild(capturedItem);
    });

    const endDrag = e => {
      if (!capturedItem || e.pointerId !== activePid) return;
      capturedItem.style.opacity = '';
      list.classList.remove('dragging');  // remet les ::before chevrons
      ghost.remove();
      ghost = null; capturedItem = null; activePid = null;
    };

    list.addEventListener('pointerup',     endDrag);
    list.addEventListener('pointercancel', endDrag);
  }
}

if (!customElements.get('math974-ordre-nombres')) {
  customElements.define('math974-ordre-nombres', OrdreNombresComponent);
}

export default OrdreNombresComponent;
export const defaultPosition = 'north';

export function randomize(config, rand, originalConfig) {
  // La direction est lue depuis originalConfig pour ne pas perdre 'random' après le 1er tirage
  const dirPref   = rand?.direction ?? originalConfig?.direction ?? config.direction ?? 'random';
  const direction = dirPref === 'random' ? (Math.random() < 0.5 ? 'asc' : 'desc') : dirPref;

  // Config fixe (rand vide ou sans medianRange) : juste mettre à jour la direction
  if (!rand || !rand.medianRange) {
    return { ...config, direction };
  }

  const step = rand.step ?? config.step ?? 1;
  const unit = rand.unit ?? config.unit ?? '';
  const layout    = rand.layout    ?? config.layout     ?? 'vertical';

  const [medMin, medMax] = rand.medianRange ?? [200, 800];
  const median = snap(medMin + Math.random() * (medMax - medMin), step);

  const [dMin, dMax] = rand.deltaRange ?? [20, 100];
  const delta = Math.max(step, snap(dMin + Math.random() * (dMax - dMin), step));

  const offsets = [-1.5, -0.5, 0.5, 1.5];
  let values = offsets.map(o => snap(median + o * delta, step));

  const minVal = Math.min(...values);
  if (minVal <= 0) {
    const shift = snap(-minVal + step, step);
    values = values.map(v => snap(v + shift, step));
  }

  const shorts = ['A', 'B', 'C', 'D'];
  const items  = values.map((value, i) => ({ short: shorts[i], label: '', value }));

  return { ...config, items, direction, unit, step, layout };
}
