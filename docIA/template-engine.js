/**
 * Moteur de template pour les exercices à trous mathématiques.
 * Gère le parsing du DSL [var:..], [var] et [?expr].
 */
export class TemplateEngine {
  constructor() {
    this.variables = new Map();
  }

  /**
   * Réinitialise les variables pour une nouvelle variante.
   */
  reset() {
    this.variables.clear();
  }

  /**
   * Génère un nombre aléatoire selon les contraintes.
   * @param {number} min 
   * @param {number} max 
   * @param {number} step 
   * @param {Array<number>} exclude 
   */
  generateRandom(min, max, step, exclude = []) {
    let value;
    let attempts = 0;
    const range = Math.floor((max - min) / step);
    
    do {
      value = min + Math.floor(Math.random() * (range + 1)) * step;
      // Correction d'imprécision flottante (ex: 0.30000000004)
      value = parseFloat(value.toFixed(10)); 
      attempts++;
    } while (exclude.includes(value) && attempts < 100);

    return value;
  }

  /**
   * Évalue une expression mathématique en utilisant les variables actuelles.
   * @param {string} expr - L'expression (ex: "a * 2 + b")
   */
  evaluate(expr) {
    try {
      const keys = Array.from(this.variables.keys());
      const values = Array.from(this.variables.values());
      // Création d'une fonction sécurisée avec les variables comme arguments
      const func = new Function(...keys, `return ${expr};`);
      const result = func(...values);
      
      // Formatage basique : si entier, pas de décimale, sinon 2 max
      return Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
    } catch (e) {
      console.error(`Erreur d'évaluation pour [?${expr}]`, e);
      return "?";
    }
  }

  /**
   * Parse le texte et remplace les balises DSL.
   * @param {string} text - Le texte Markdown source
   * @param {string} mode - 'web' | 'print'
   */
  parse(text, mode = 'web') {
    // Regex capture : [ contenu ]
    return text.replace(/\[(.*?)\]/g, (match, content) => {
      content = content.trim();

      // 1. Trou / Solution calculée : [?expression]
      if (content.startsWith('?')) {
        const expr = content.substring(1);
        const solution = this.evaluate(expr);

        if (mode === 'print') {
          return '\\Box'; // Carré vide LaTeX pour l'impression
        } else {
          // Mode Web : ". . ." avec tooltip
          // Note : data-solution permet au JS client de manipuler si besoin
          return `<span class="rapido-hole" title="${solution}" data-solution="${solution}">. . .</span>`;
        }
      }

      // 2. Définition de variable : [nom : min..max, step, sauf{...}]
      if (content.includes(':')) {
        const [defPart, excludePart] = content.split('sauf');
        const [name, rangePart] = defPart.split(':').map(s => s.trim());
        
        // Parsing range "min..max, step"
        const [range, stepStr] = rangePart.split(',').map(s => s.trim());
        const [min, max] = range.split('..').map(Number);
        const step = stepStr ? Number(stepStr) : 1;

        // Parsing exclusions
        let exclude = [];
        if (excludePart) {
          const insideBraces = excludePart.match(/\{([^}]+)\}/);
          if (insideBraces) {
            exclude = insideBraces[1].split(',').map(Number);
          }
        }

        const val = this.generateRandom(min, max, step, exclude);
        this.variables.set(name, val);
        return val;
      }

      // 3. Rappel de variable : [nom]
      if (this.variables.has(content)) {
        return this.variables.get(content);
      }

      // Fallback si non reconnu
      return match;
    });
  }
}