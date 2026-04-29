// src/visuals/programme-scratch/programme-scratch.js
// Couleurs officielles Scratch 3.0
const SC = {
  control:   '#FFAB19',
  variables: '#FF8C1A',
  looks:     '#9966FF',
  sensing:   '#5CB1D6',
  operators: '#59C059',
};

class ProgrammeScratchComponent extends HTMLElement {
  static get observedAttributes() { return ['programme', 'input', 'height']; }
  connectedCallback()        { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  // ── Parser ────────────────────────────────────────────────────────────────
  _parseInstruction(l) {
    if (/=\s*réponse\s*$/.test(l))
      return { type: 'set_input', var: l.replace(/\s*=\s*réponse\s*$/, '').trim() };
    if (/^dire\s/.test(l))
      return { type: 'dire', var: l.slice(5).trim() };
    const m = l.match(/^(\S+)\s*=\s*(\S+)\s*([+\-×*\/÷])\s*(\d+(?:[.,]\d+)?)$/);
    if (m) return { type: 'op', var: m[1], src: m[2], op: m[3],
                    val: parseFloat(m[4].replace(',', '.')) };
    return { type: 'unknown', raw: l };
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
        while (i < lines.length && /^\s{2}/.test(lines[i]))
          body.push(this._parseInstruction(lines[i++].trim()));
        out.push({ type: 'loop', count, body });
      } else {
        out.push(this._parseInstruction(line));
        i++;
      }
    }
    return out;
  }

  // ── Exécution ─────────────────────────────────────────────────────────────
  _execInstr(instr, vars, input) {
    if (instr.type === 'set_input') { vars[instr.var] = input; return; }
    if (instr.type === 'op') {
      const s = vars[instr.src] ?? 0, v = instr.val, op = instr.op;
      if      (op === '+')               vars[instr.var] = s + v;
      else if (op === '-')               vars[instr.var] = s - v;
      else if (op === '×' || op === '*') vars[instr.var] = s * v;
      else if (op === '÷' || op === '/') vars[instr.var] = s / v;
      return;
    }
    if (instr.type === 'loop')
      for (let k = 0; k < instr.count; k++)
        for (const sub of instr.body) this._execInstr(sub, vars, input);
  }

  _execute(instrs, input) {
    const vars = {};
    for (const i of instrs) this._execInstr(i, vars, input);
    return vars;
  }

  // ── Helpers DOM ───────────────────────────────────────────────────────────
  _opStr(op) {
    if (op === '*' || op === '×') return '×';
    if (op === '/' || op === '÷') return '÷';
    return op === '-' ? '−' : '+';
  }

  _el(tag, cls, html) {
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html !== undefined) d.innerHTML = html;
    return d;
  }

  // pills
  _varPill(name) {
    return `<span class="sp-vref">${name}</span>`;
  }
  _numPill(val) { return `<span class="sp-num">${val}</span>`; }

  // ── Rendu d'une instruction ───────────────────────────────────────────────
  _renderInstr(instr, vars) {

    // mettre VAR à réponse → bloc ask + bloc set
    if (instr.type === 'set_input') {
      const frag = document.createDocumentFragment();
      // bloc "Choisir un nombre" (sensing)
      frag.appendChild(this._el('div', 'sp-block sp-ask',
        `Choisir un nombre`));
      // bloc "mettre VAR à réponse" (variables)
      frag.appendChild(this._el('div', 'sp-block sp-set',
        `mettre ${this._varPill(instr.var)} à <span class="sp-reply">réponse</span>`));
      return frag;
    }

    // mettre VAR à VAR OP NUM
    if (instr.type === 'op') {
      const b = this._el('div', 'sp-block sp-op');
      const expr = `<span class="sp-expr">`
        + this._varPill(instr.src)
        + `<span class="sp-opc">${this._opStr(instr.op)}</span>`
        + this._numPill(instr.val)
        + `</span>`;
      b.innerHTML = `mettre ${this._varPill(instr.var)} à ${expr}`;
      return b;
    }

    // répéter N fois (bloc C)
    if (instr.type === 'loop') {
      const wrap = this._el('div', 'sp-loop');
      const top  = this._el('div', 'sp-loop-top');
      top.innerHTML = `répéter ${this._numPill(instr.count)} fois`;
      wrap.appendChild(top);
      const mid  = this._el('div', 'sp-loop-mid');
      const body = this._el('div', 'sp-loop-body');
      for (const sub of instr.body) body.appendChild(this._renderInstr(sub, vars));
      mid.appendChild(this._el('div', 'sp-loop-bar'));
      mid.appendChild(body);
      wrap.appendChild(mid);
      wrap.appendChild(this._el('div', 'sp-loop-bot'));
      return wrap;
    }

    // dire VAR (tooltip = valeur calculée)
    if (instr.type === 'dire') {
      const b   = this._el('div', 'sp-block sp-dire');
      const val = vars[instr.var];
      const cls = val !== undefined ? 'sp-vref sp-dire-v sp-tip' : 'sp-vref sp-dire-v';
      const tip = val !== undefined
        ? ` data-tip="${Number.isInteger(val) ? val : Math.round(val*1000)/1000}"` : '';
      b.innerHTML = `dire <span class="${cls}"${tip}>${instr.var}</span>`;
      return b;
    }

    return this._el('div', 'sp-block sp-unknown', instr.raw || '?');
  }

  // ── Styles (une seule injection) ──────────────────────────────────────────
  _ensureStyles() {
    if (document.getElementById('math974-scratch-css')) return;
    const s = document.createElement('style');
    s.id = 'math974-scratch-css';
    s.textContent = `
math974-programme-scratch{display:block}
.sp-prog{display:inline-flex;flex-direction:column;gap:3px;
  font:bold 13px/1.5 'Segoe UI',Arial,sans-serif;padding:6px;transform-origin:top left}
.sp-block{display:flex;align-items:center;gap:6px;
  padding:6px 12px;border-radius:5px;color:#fff;white-space:nowrap}

.sp-ask  {background:${SC.sensing};color:#fff}
.sp-set  {background:${SC.variables}}
.sp-op   {background:${SC.variables}}
.sp-dire {background:${SC.looks}}
.sp-unknown{background:#94a3b8}

/* reporter variable — orange foncé uniforme (visible sur fond orange ET vert) */
.sp-vref{background:#CC6600;border-radius:10px;padding:1px 8px;color:#fff}
/* réponse (sensing pill) */
.sp-reply{background:${SC.sensing};border-radius:10px;padding:1px 9px;color:#fff}

/* expression opérateur (vert) */
.sp-expr{display:inline-flex;align-items:center;gap:4px;
  background:${SC.operators};border-radius:10px;padding:2px 8px}
.sp-opc{font-weight:bold;color:#fff}
.sp-num{background:#fff;color:#1e293b;border-radius:10px;padding:1px 7px}

/* dire : même orange foncé */
.sp-dire-v{background:#CC6600;border-radius:10px;padding:1px 8px;color:#fff}

/* bloc C répéter */
.sp-loop{display:flex;flex-direction:column}
.sp-loop-top{display:flex;align-items:center;gap:6px;padding:6px 12px;
  border-radius:5px 5px 0 0;background:${SC.control};color:#1c1c1c;
  white-space:nowrap;font:bold 13px/1.5 'Segoe UI',Arial,sans-serif}
.sp-loop-top .sp-num{color:#1e293b}
.sp-loop-mid{display:flex;background:${SC.control};padding:3px 6px 3px 0}
.sp-loop-bar{width:20px;flex-shrink:0}
.sp-loop-body{flex:1;display:flex;flex-direction:column;gap:3px;padding:3px;min-height:12px}
.sp-loop-bot{height:12px;background:${SC.control};border-radius:0 0 5px 5px}

/* tooltip */
.sp-tip{position:relative;cursor:help}
.sp-tip::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 5px);
  left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;
  border-radius:4px;padding:2px 8px;font-size:11px;white-space:nowrap;
  pointer-events:none;opacity:0;transition:opacity .15s;z-index:20}
.sp-tip:hover::after{opacity:1}
    `.trim();
    document.head.appendChild(s);
  }

  // ── Zoom pour tenir dans height (seulement si contenu dépasse) ────────────
  _scaleToFit() {
    const H = parseInt(this.getAttribute('height') || '0');
    if (!H) return;
    const prog = this.querySelector('.sp-prog');
    if (!prog) return;
    prog.style.transform = '';
    const nat = prog.offsetHeight;
    if (!nat || nat <= H) return;   // contenu plus court → pas de forçage de hauteur
    const scale = H / nat;
    prog.style.transform = `scale(${scale})`;
    this.style.height   = H + 'px';
    this.style.width    = (prog.offsetWidth * scale) + 'px';
    this.style.overflow = 'hidden';
  }

  // ── Render ────────────────────────────────────────────────────────────────
  render() {
    this.innerHTML = '';
    this._ensureStyles();

    const programme = this.getAttribute('programme') || '';
    const input     = parseFloat(this.getAttribute('input') ?? '0');

    const instrs = this._parse(programme);
    const vars   = this._execute(instrs, input);

    const prog = this._el('div', 'sp-prog');
    for (const instr of instrs) prog.appendChild(this._renderInstr(instr, vars));

    this.appendChild(prog);
    requestAnimationFrame(() => this._scaleToFit());
  }
}

customElements.define('math974-programme-scratch', ProgrammeScratchComponent);

export const defaultPosition = 'north';

export function randomize(config, rand) {
  const p = { inputRange: [2, 20], opsRange: [1, 3], ops: ['+', '-', '×', '÷'], loop: null, iterRange: [2, 5], valRange: [1, 10], ...(rand || {}) };
  const ri   = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const VAR  = 'résultat';
  for (let attempt = 0; attempt < 40; attempt++) {
    const hasLoop = p.loop === null ? Math.random() < 0.5 : Boolean(p.loop);
    const iters   = hasLoop ? ri(p.iterRange[0], p.iterRange[1]) : 1;
    const nOps    = ri(p.opsRange[0], p.opsRange[1]);
    const input   = ri(p.inputRange[0], p.inputRange[1]);
    const steps = []; let cur = input; let ok = true;
    for (let i = 0; i < nOps && ok; i++) {
      const op = pick(p.ops); let val;
      if (op === '÷') {
        const divs = []; for (let d = Math.max(2, p.valRange[0]); d <= p.valRange[1]; d++) if (cur % d === 0) divs.push(d);
        if (!divs.length) { ok = false; break; } val = pick(divs); cur /= val;
      } else if (op === '-') {
        const mx = Math.min(cur - 1, p.valRange[1]); if (mx < p.valRange[0]) { ok = false; break; } val = ri(p.valRange[0], mx); cur -= val;
      } else if (op === '×') {
        val = ri(Math.max(2, p.valRange[0]), Math.min(p.valRange[1], 4)); cur *= val; if (cur > 9999) { ok = false; break; }
      } else { val = ri(p.valRange[0], p.valRange[1]); cur += val; }
      steps.push({ op, val });
    }
    if (!ok || !steps.length) continue;
    cur = input;
    for (let k = 0; k < iters && ok; k++)
      for (const s of steps) { cur = s.op === '+' ? cur + s.val : s.op === '-' ? cur - s.val : s.op === '×' ? cur * s.val : cur / s.val; if (cur < 1 || cur > 9999 || !Number.isInteger(cur)) { ok = false; break; } }
    if (!ok) continue;
    const opLine = ({ op, val }) => `${VAR} = ${VAR} ${op} ${val}`;
    const lines = [`${VAR} = réponse`];
    if (hasLoop) { lines.push(`répéter ${iters}:`); steps.forEach(s => lines.push('  ' + opLine(s))); }
    else steps.forEach(s => lines.push(opLine(s)));
    lines.push(`dire ${VAR}`);
    return { ...config, input, programme: lines.join('\n') };
  }
  return { ...config, input: ri(p.inputRange[0], p.inputRange[1]) };
}
