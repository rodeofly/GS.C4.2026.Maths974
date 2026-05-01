/**
 * Moteur de template pour les exercices à trous mathématiques.
 * Gère le parsing du DSL [var:..], [#var:..], [var], [?expr], [>expr].
 */

// ── Conversion entier → français (0-999 999) ─────────────────────────────────

const _units = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'dix-sept', 'dix-huit', 'dix-neuf',
];

function _belowHundred(n) {
  if (n < 20) return _units[n];
  const d = Math.floor(n / 10), u = n % 10;
  if (d === 7) return u === 1 ? 'soixante et onze' : 'soixante-' + _units[10 + u];
  if (d === 8) return u === 0 ? 'quatre-vingts' : 'quatre-vingt-' + _units[u];
  if (d === 9) return 'quatre-vingt-' + _units[10 + u];
  const t = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'][d];
  if (u === 0) return t;
  if (u === 1) return t + ' et un';
  return t + '-' + _units[u];
}

function _belowThousand(n) {
  if (n < 100) return _belowHundred(n);
  const h = Math.floor(n / 100), r = n % 100;
  const cent = h === 1 ? 'cent' : _units[h] + ' cent';
  if (r === 0) return h === 1 ? 'cent' : _units[h] + ' cents';
  return cent + ' ' + _belowHundred(r);
}

export function nombresEnLettres(n) {
  n = Math.round(n);
  if (n === 0) return 'zéro';
  if (n < 0)  return 'moins ' + nombresEnLettres(-n);
  if (n < 1000) return _belowThousand(n);
  const t = Math.floor(n / 1000), r = n % 1000;
  const mille = t === 1 ? 'mille' : _belowThousand(t) + ' mille';
  return r === 0 ? mille : mille + ' ' + _belowThousand(r);
}

// ── Nom d'un rang (0=unités … 6=millions) ────────────────────────────────────

const _RANGS = ['', 'unités', 'dizaines', 'centaines', 'milliers',
                'dizaines de mille', 'centaines de mille', 'millions'];

export function rangName(r) { return _RANGS[Math.round(r)] ?? '?'; }

export function formatInt(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// ── TemplateEngine ────────────────────────────────────────────────────────────

export class TemplateEngine {
  constructor() {
    this.variables = new Map();
  }

  reset() {
    this.variables.clear();
  }

  generateRandom(min, max, step, exclude = []) {
    let value;
    let attempts = 0;
    const range = Math.floor((max - min) / step);
    do {
      value = min + Math.floor(Math.random() * (range + 1)) * step;
      value = parseFloat(value.toFixed(10));
      attempts++;
    } while (exclude.includes(value) && attempts < 100);
    return value;
  }

  evaluate(expr) {
    try {
      const keys   = ['rangName', 'formatInt', ...Array.from(this.variables.keys())];
      const values = [rangName,   formatInt,   ...Array.from(this.variables.values())];
      const func   = new Function(...keys, `return ${expr};`);
      const result = func(...values);
      if (typeof result === 'string') return result;
      return Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
    } catch (e) {
      console.error(`Erreur d'évaluation pour [?${expr}]`, e);
      return '?';
    }
  }

  /**
   * Parse le texte et remplace les balises DSL.
   *
   * Syntaxes :
   *   [name:min..max]   — génère une variable aléatoire et l'affiche
   *   [#name:min..max]  — génère une variable aléatoire silencieusement (pas d'affichage)
   *   [name]            — rappelle la valeur d'une variable
   *   [?expr]           — input élève avec data-solution (réponse calculée)
   *   [>expr]           — affiche la valeur en toutes lettres (français)
   */
  parse(text, mode = 'web') {
    return text.replace(/\[(.*?)\]/g, (match, content) => {
      content = content.trim();

      // 1. Fraction input [frac?{num_expr}{denom_expr}]
      if (content.startsWith('frac?')) {
        const m = content.match(/^frac\?\{([^}]*)\}\{([^}]*)\}/);
        if (m) {
          if (mode === 'print') return '\\frac{\\Box}{\\Box}';
          const numSol = String(this.evaluate(m[1]));
          const denSol = String(this.evaluate(m[2]));
          const nw = Math.max(2, numSol.length + 1);
          const dw = Math.max(2, denSol.length + 1);
          return `<span class="rapido-frac-wrap">` +
            `<span class="rapido-input-wrap"><input class="rapido-input" type="text" data-solution="${numSol}" size="${nw}" placeholder="…" autocomplete="off" spellcheck="false"><span class="rapido-fb" aria-hidden="true"></span></span>` +
            `<span class="rapido-frac-bar"></span>` +
            `<span class="rapido-input-wrap"><input class="rapido-input" type="text" data-solution="${denSol}" size="${dw}" placeholder="…" autocomplete="off" spellcheck="false"><span class="rapido-fb" aria-hidden="true"></span></span>` +
            `</span>`;
        }
      }

      // 2. Input trou [?expr]
      if (content.startsWith('?')) {
        const expr     = content.substring(1).trim();
        const solution = this.evaluate(expr);
        if (mode === 'print') return '\\Box';
        const sol = String(solution);
        const w   = Math.max(3, sol.length + 1);
        return `<span class="rapido-input-wrap"><input class="rapido-input" type="text" data-solution="${sol}" size="${w}" placeholder="…" autocomplete="off" spellcheck="false"><span class="rapido-fb" aria-hidden="true"></span></span>`;
      }

      // 3. Affichage [>expr] — nombres en lettres, ou passe-plat si string
      if (content.startsWith('>')) {
        const expr   = content.substring(1).trim();
        const result = this.evaluate(expr);
        return typeof result === 'string' ? result : nombresEnLettres(result);
      }

      // 3b. Affichage [=expr] — valeur numérique brute (pour usage dans LaTeX math)
      if (content.startsWith('=')) {
        const expr = content.substring(1).trim();
        return String(this.evaluate(expr));
      }

      // 4. Définition de variable — visible [name:range] ou silencieuse [#name:range]
      const silent     = content.startsWith('#');
      const defContent = silent ? content.substring(1) : content;

      if (defContent.includes(':')) {
        const [defPart, excludePart] = defContent.split('sauf');
        const [name, rangePart]     = defPart.split(':').map(s => s.trim());
        const [range, stepStr]      = rangePart.split(',').map(s => s.trim());
        const evalBound = s => { const n = Number(s.trim()); return isNaN(n) ? Number(this.evaluate(s.trim())) : n; };
        const [min, max]            = range.split('..').map(evalBound);
        const step                  = stepStr ? Number(stepStr) : 1;

        let exclude = [];
        if (excludePart) {
          const m = excludePart.match(/\{([^}]+)\}/);
          if (m) exclude = m[1].split(',').map(Number);
        }

        const val = this.generateRandom(min, max, step, exclude);
        this.variables.set(name, val);
        return silent ? '' : formatInt(val);
      }

      // 5. Rappel de variable [name]
      if (this.variables.has(content)) {
        return formatInt(this.variables.get(content));
      }

      return match;
    });
  }
}
