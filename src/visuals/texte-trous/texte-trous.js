import { TemplateEngine } from '../../utils/template-engine.js';

export class TexteTrousVisual extends HTMLElement {
  constructor() {
    super();
    this.engine = new TemplateEngine();
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ['content', 'mode'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    this.style.display = 'block';
    this.style.width = '100%';
    const content = this.getAttribute('content') || '';
    const mode = this.getAttribute('mode') || 'web';

    // Nettoyage
    this.innerHTML = '';

    if (!content) {
      this.innerHTML = '<div style="padding:1rem; color: #666; font-style: italic;">(Vide)</div>';
      return;
    }

    // 1. Reset & Parsing — normalise les \n du DSL en <br> avant parsing (évite de casser l'HTML généré)
    this.engine.reset();
    const normalizedContent = content.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
    const htmlContent = this.engine.parse(normalizedContent, mode);
    
    // Style pour aligner correctement le LaTeX (MathJax) avec le texte
    const style = document.createElement('style');
    style.textContent = `
      .texte-trous-container mjx-container {
        vertical-align: middle !important;
        margin: 0 0.2em !important;
      }
    `;
    this.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.className = 'texte-trous-container';
    wrapper.style.fontFamily = 'inherit';
    wrapper.style.fontSize = '1.5rem'; // Harmonisation avec .content (rem au lieu de em)
    wrapper.style.fontWeight = '600';  // Harmonisation avec .content
    wrapper.style.color = '#334155';   // Harmonisation avec .content
    wrapper.style.lineHeight = '1.5';
    wrapper.innerHTML = htmlContent;

    this.appendChild(wrapper);

    // 2. MathJax Refresh
    if (window.MathJax && this.isConnected) {
      window.MathJax.typesetPromise([wrapper]).catch(err => console.warn('MathJax error:', err));
    }
  }
}

// Enregistrement du Custom Element
if (!customElements.get('math974-texte-trous')) {
  customElements.define('math974-texte-trous', TexteTrousVisual);
}

export default TexteTrousVisual;
export const defaultPosition = 'content';

// Re-init triggers TemplateEngine with new random values from the content template
export function randomize(config) { return { ...config }; }