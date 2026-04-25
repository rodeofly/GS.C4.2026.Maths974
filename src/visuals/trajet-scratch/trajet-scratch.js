// src/visuals/trajet-scratch/trajet-scratch.js
// Déplacement Scratch : blocs visuels + quadrillage avec tracé révélé au survol
//
// Convention : 0°=haut(nord), 90°=droite(est), 180°=bas, 270°=gauche
//   "droite" = horaire, "gauche" = anti-horaire
//
// DSL (même style que programme-scratch) :
//   orienter 90
//   avancer 80
//   droite 90
//   gauche 90
//   répéter 4:
//     avancer 4
//     droite 90
//   lever / baisser
//
// Attrs : programme, scale, cellpx, maxpx, color, show_grid, show_path, height

const SC_MOTION = '#4C97FF';
const SC_PEN    = '#0fBD8C';
const SC_CTRL   = '#FFAB19';

class TrajetScratchComponent extends HTMLElement {
  static get observedAttributes() {
    return ['programme', 'scale', 'cellpx', 'maxpx', 'color', 'show_grid', 'show_path', 'height'];
  }
  connectedCallback()        { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  // ── Parser DSL ────────────────────────────────────────────────────────────
  _parseInstr(line) {
    let m;
    if ((m = line.match(/^orienter\s+(-?\d+(?:[.,]\d+)?)/)))
      return { type: 'orienter', angle: parseFloat(m[1]) };
    if ((m = line.match(/^avancer\s+(\d+(?:[.,]\d+)?)/)))
      return { type: 'avancer',  steps: parseFloat(m[1]) };
    if ((m = line.match(/^droite\s+(\d+(?:[.,]\d+)?)/)))
      return { type: 'droite',   angle: parseFloat(m[1]) };
    if ((m = line.match(/^gauche\s+(\d+(?:[.,]\d+)?)/)))
      return { type: 'gauche',   angle: parseFloat(m[1]) };
    if (line === 'lever')   return { type: 'lever' };
    if (line === 'baisser') return { type: 'baisser' };
    return { type: 'unknown', raw: line };
  }

  _parse(src) {
    const lines = src.split('\n').filter(l => l.trim());
    const out = []; let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      const m = line.match(/^répéter\s+(\d+)\s*:/);
      if (m) {
        const count = parseInt(m[1]), body = [];
        i++;
        while (i < lines.length && /^ {2}/.test(lines[i]))
          body.push(this._parseInstr(lines[i++].trim()));
        out.push({ type: 'loop', count, body });
      } else {
        out.push(this._parseInstr(line));
        i++;
      }
    }
    return out;
  }

  // ── Simulation tortue ─────────────────────────────────────────────────────
  _simulate(instructions, scale) {
    let x = 0, y = 0, angle = 90, penDown = true;
    const segs = [];
    const exec = instr => {
      switch (instr.type) {
        case 'orienter': angle = instr.angle; break;
        case 'droite':   angle = (angle + instr.angle) % 360; break;
        case 'gauche':   angle = ((angle - instr.angle) % 360 + 360) % 360; break;
        case 'lever':    penDown = false; break;
        case 'baisser':  penDown = true; break;
        case 'avancer': {
          const rad = angle * Math.PI / 180;
          const nx = x + Math.sin(rad) * instr.steps / scale;
          const ny = y - Math.cos(rad) * instr.steps / scale;
          segs.push({ x1: x, y1: y, x2: nx, y2: ny, draw: penDown });
          x = nx; y = ny; break;
        }
        case 'loop':
          for (let k = 0; k < instr.count; k++) instr.body.forEach(exec);
          break;
      }
    };
    instructions.forEach(exec);
    const rad = angle * Math.PI / 180;
    return { segs, endX: x, endY: y, endDx: Math.sin(rad), endDy: -Math.cos(rad) };
  }

  // ── Helpers DOM ───────────────────────────────────────────────────────────
  _el(tag, cls, html) {
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html !== undefined) d.innerHTML = html;
    return d;
  }
  _num(v)  { return `<span class="sp-num">${v}</span>`; }
  _unit(u) { return `<span class="ts-unit">${u}</span>`; }

  // ── Rendu d'un bloc de mouvement ──────────────────────────────────────────
  _renderInstr(instr) {
    if (instr.type === 'orienter')
      return this._el('div', 'sp-block ts-motion',
        `s'orienter à ${this._num(instr.angle + '°')}`);

    if (instr.type === 'avancer')
      return this._el('div', 'sp-block ts-motion',
        `avancer de ${this._num(instr.steps)} ${this._unit('pas')}`);

    if (instr.type === 'droite')
      return this._el('div', 'sp-block ts-motion',
        `tourner ↻ de ${this._num(instr.angle + '°')}`);

    if (instr.type === 'gauche')
      return this._el('div', 'sp-block ts-motion',
        `tourner ↺ de ${this._num(instr.angle + '°')}`);

    if (instr.type === 'lever')
      return this._el('div', 'sp-block ts-pen', `✎ lever le stylo`);

    if (instr.type === 'baisser')
      return this._el('div', 'sp-block ts-pen', `✎ baisser le stylo`);

    if (instr.type === 'loop') {
      const wrap = this._el('div', 'sp-loop');
      const top  = this._el('div', 'sp-loop-top');
      top.innerHTML = `répéter ${this._num(instr.count)} fois`;
      wrap.appendChild(top);
      const mid  = this._el('div', 'sp-loop-mid');
      const body = this._el('div', 'sp-loop-body');
      for (const sub of instr.body) body.appendChild(this._renderInstr(sub));
      mid.appendChild(this._el('div', 'sp-loop-bar'));
      mid.appendChild(body);
      wrap.appendChild(mid);
      wrap.appendChild(this._el('div', 'sp-loop-bot'));
      return wrap;
    }

    return this._el('div', 'sp-block sp-unknown', instr.raw || '?');
  }

  // ── SVG Quadrillage + tracé ───────────────────────────────────────────────
  _buildGrid(segs, scale, maxpx, color, showPath) {
    const endX = segs.length ? segs[segs.length-1].x2 : 0;
    const endY = segs.length ? segs[segs.length-1].y2 : 0;
    const allX = [0, ...segs.map(s => s.x1), ...segs.map(s => s.x2)];
    const allY = [0, ...segs.map(s => s.y1), ...segs.map(s => s.y2)];
    const minX = Math.floor(Math.min(...allX)) - 1;
    const minY = Math.floor(Math.min(...allY)) - 1;
    const maxX = Math.ceil(Math.max(...allX))  + 1;
    const maxY = Math.ceil(Math.max(...allY))  + 1;
    const gridW = maxX - minX;
    const gridH = maxY - minY;

    const cellpx = Math.min(20, Math.max(8, Math.floor(maxpx / Math.max(gridW, gridH, 1))));
    const pad    = 10;
    const legH   = 14;
    const svgW   = gridW * cellpx + 2 * pad;
    const svgH   = gridH * cellpx + 2 * pad + legH;

    const px = cx => pad + (cx - minX) * cellpx;
    const py = cy => pad + (cy - minY) * cellpx;

    let inner = '';

    // Quadrillage
    for (let gx = 0; gx <= gridW; gx++) {
      const lx = pad + gx * cellpx;
      const axis = gx + minX === 0;
      inner += `<line x1="${lx}" y1="${pad}" x2="${lx}" y2="${pad+gridH*cellpx}"
        stroke="${axis ? '#94a3b8' : '#e2e8f0'}" stroke-width="${axis ? 1 : 0.5}"/>`;
    }
    for (let gy = 0; gy <= gridH; gy++) {
      const ly = pad + gy * cellpx;
      const axis = gy + minY === 0;
      inner += `<line x1="${pad}" y1="${ly}" x2="${pad+gridW*cellpx}" y2="${ly}"
        stroke="${axis ? '#94a3b8' : '#e2e8f0'}" stroke-width="${axis ? 1 : 0.5}"/>`;
    }

    // Départ
    inner += `<circle cx="${px(0)}" cy="${py(0)}" r="4"
      fill="#22c55e" stroke="white" stroke-width="1.5"/>`;

    // Tracé + flèche (groupe caché)
    let pathSVG = '';
    segs.forEach(({ x1, y1, x2, y2, draw }) => {
      if (!draw) return;
      pathSVG += `<line x1="${px(x1)}" y1="${py(y1)}" x2="${px(x2)}" y2="${py(y2)}"
        stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
    });
    // Flèche finale
    const dx = segs.length ? segs[segs.length-1].x2 - segs[segs.length-1].x1 : 1;
    const dy = segs.length ? segs[segs.length-1].y2 - segs[segs.length-1].y1 : 0;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const ndx = dx/len, ndy = dy/len;
    const aLen = Math.max(6, cellpx*0.6);
    const ax = px(endX) + ndx*aLen, ay = py(endY) + ndy*aLen;
    const hw = aLen*0.35;
    pathSVG += `<polygon points="${ax},${ay}
      ${px(endX)-ndy*hw-ndx*aLen*0.6},${py(endY)+ndx*hw-ndy*aLen*0.6}
      ${px(endX)+ndy*hw-ndx*aLen*0.6},${py(endY)-ndx*hw-ndy*aLen*0.6}"
      fill="${color}"/>`;

    inner += `<g class="ts-path" opacity="${showPath ? 1 : 0}"
      style="transition:opacity 0.2s">${pathSVG}</g>`;

    // Légende échelle
    const legY = pad + gridH*cellpx + 10;
    inner += `<line x1="${pad}" y1="${legY}" x2="${pad+cellpx}" y2="${legY}"
      stroke="#64748b" stroke-width="1.5"/>
    <circle cx="${pad}" cy="${legY}" r="2" fill="#64748b"/>
    <circle cx="${pad+cellpx}" cy="${legY}" r="2" fill="#64748b"/>
    <text x="${pad+cellpx/2}" y="${legY-3}" text-anchor="middle"
      font-size="8" fill="#64748b" font-family="sans-serif">${scale} pas</text>`;

    // Zone cliquable invisible pour hover
    inner += `<rect class="ts-hotspot" x="0" y="0" width="${svgW}" height="${svgH}"
      fill="transparent" pointer-events="all" style="cursor:pointer"/>`;

    return `<svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}"
      style="display:block;overflow:visible;flex-shrink:0">${inner}</svg>`;
  }

  // ── Injection CSS (une seule fois) ────────────────────────────────────────
  _ensureStyles() {
    if (document.getElementById('math974-trajet-css')) return;
    const s = document.createElement('style');
    s.id = 'math974-trajet-css';
    s.textContent = `
math974-trajet-scratch{display:block}
.ts-wrap{display:flex;flex-direction:row;align-items:flex-start;gap:10px;flex-wrap:wrap}
.ts-blocks.sp-prog{display:inline-flex;flex-direction:column;gap:3px;
  font:bold 13px/1.5 'Segoe UI',Arial,sans-serif;padding:4px;transform-origin:top left}
.sp-block{display:flex;align-items:center;gap:6px;
  padding:5px 10px;border-radius:5px;color:#fff;white-space:nowrap}
.ts-motion{background:${SC_MOTION}}
.ts-pen   {background:${SC_PEN}}
.sp-unknown{background:#94a3b8}
.sp-num{background:rgba(255,255,255,0.25);border-radius:8px;padding:1px 7px;color:#fff}
.ts-unit{opacity:0.85;font-weight:normal;font-size:11px}
.sp-loop{display:flex;flex-direction:column}
.sp-loop-top{display:flex;align-items:center;gap:6px;padding:5px 10px;
  border-radius:5px 5px 0 0;background:${SC_CTRL};color:#1c1c1c;
  white-space:nowrap;font:bold 13px/1.5 'Segoe UI',Arial,sans-serif}
.sp-loop-top .sp-num{background:rgba(0,0,0,0.15);color:#1c1c1c}
.sp-loop-mid{display:flex;background:${SC_CTRL};padding:3px 6px 3px 0}
.sp-loop-bar{width:18px;flex-shrink:0}
.sp-loop-body{flex:1;display:flex;flex-direction:column;gap:3px;padding:3px;min-height:10px}
.sp-loop-bot{height:10px;background:${SC_CTRL};border-radius:0 0 5px 5px}
    `.trim();
    document.head.appendChild(s);
  }

  // ── Zoom pour tenir dans height ───────────────────────────────────────────
  _scaleToFit() {
    const H = parseInt(this.getAttribute('height') || '0');
    if (!H) return;
    const prog = this.querySelector('.ts-blocks');
    if (!prog) return;
    prog.style.transform = '';
    const nat = prog.offsetHeight;
    if (!nat || nat <= H) return;
    const sc = H / nat;
    prog.style.transform = `scale(${sc})`;
    prog.style.transformOrigin = 'top left';
  }

  // ── Render ────────────────────────────────────────────────────────────────
  render() {
    this.innerHTML = '';
    this._ensureStyles();

    const src      = this.getAttribute('programme') || 'orienter 90\navancer 4\ndroite 90\navancer 4';
    const scale    = parseFloat(this.getAttribute('scale')     || '20');
    const maxpx    = parseFloat(this.getAttribute('maxpx')     || '180');
    const color    = this.getAttribute('color')                || SC_MOTION;
    const showGrid = this.getAttribute('show_grid')            !== 'false';
    const showPath = this.getAttribute('show_path')            === 'true';

    const instrs = this._parse(src);
    const { segs } = this._simulate(instrs, scale);

    // Conteneur flex : blocs | grille
    const wrap = this._el('div', 'ts-wrap');

    // ── Blocs Scratch ────────────────────────────────────────────────────────
    const prog = this._el('div', 'ts-blocks sp-prog');
    for (const instr of instrs) prog.appendChild(this._renderInstr(instr));
    wrap.appendChild(prog);

    // ── Quadrillage SVG ──────────────────────────────────────────────────────
    if (showGrid) {
      const gridDiv = this._el('div', 'ts-grid-wrap');
      gridDiv.style.cssText = 'position:relative;flex-shrink:0';
      gridDiv.innerHTML = this._buildGrid(segs, scale, maxpx, color, showPath);

      // Tooltip "survol"
      if (!showPath) {
        const tip = this._el('div');
        tip.style.cssText = `position:absolute;top:4px;right:4px;
          background:#1e293b;color:white;padding:2px 6px;border-radius:4px;
          font-size:9px;font-family:sans-serif;pointer-events:none;opacity:0.55`;
        tip.textContent = '👁 survol';
        gridDiv.appendChild(tip);
      }

      wrap.appendChild(gridDiv);
    }

    this.appendChild(wrap);
    requestAnimationFrame(() => this._scaleToFit());

    // ── Hover sur la grille ───────────────────────────────────────────────────
    if (showGrid && !showPath) {
      const hotspot = this.querySelector('.ts-hotspot');
      const path    = this.querySelector('.ts-path');
      if (hotspot && path) {
        hotspot.addEventListener('mouseenter', () => path.setAttribute('opacity', '1'));
        hotspot.addEventListener('mouseleave', () => path.setAttribute('opacity', '0'));
      }
    }
  }
}

if (!customElements.get('math974-trajet-scratch')) {
  customElements.define('math974-trajet-scratch', TrajetScratchComponent);
}
