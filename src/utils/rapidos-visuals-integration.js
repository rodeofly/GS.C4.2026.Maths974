
// ========================================
// RAPIDOS VISUELS - Intégration RapidoLayout
// Script à inclure dans RapidoLayout.astro
// ========================================

import VisualsSystem from './visuals-system.js';
import './visual-registry.js'; // Charge le registre
import { visualMetadata, getConfigFields, getDefaultConfig } from './visual-registry.js';

/**
 * Initialiser le système de visuels pour tous les Rapidos
 * À appeler dans RapidoLayout.astro après le DOM ready
 */
export async function initRapidosVisuals(questionData) {
  // AJOUTER CETTE SÉCURITÉ :
  if (!questionData || !Array.isArray(questionData)) {
    console.warn('⚠️ No question data provided to Visuals System');
    return;
  }

  console.log('🎨 Initializing Rapidos Visuals System...');

  // Pour chaque question
  questionData.forEach((question, qIndex) => {
    const cardElement = document.getElementById(`card-${qIndex}`);
    if (!cardElement) return;

    // Restructurer la carte en Grid
    restructureCardGrid(cardElement);

    // Initialiser les visuels pour chaque variante
    question.variantes.forEach((variante, vIndex) => {
      if (!variante.visual) return;

      // Stocker la config dans le DOM pour accès rapide
      const variantContent = cardElement.querySelector(
        `.variant-content[data-index="${vIndex}"]`
      );
      if (variantContent) {
        variantContent.visualData = variante.visual;
      }
    });

    // Charger le visuel de la variante active (index 0 par défaut)
    const activeVariant = cardElement.querySelector('.variant-content.active');
    if (activeVariant?.visualData) {
      VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
    }

    // Ajouter le bouton toggle
    addVisualToggleButton(cardElement);

    // Restaurer l'état depuis localStorage
    VisualsSystem.restoreVisualState(cardElement);
  });

  console.log('✅ Rapidos Visuals System initialized');
}

/**
 * Restructurer une carte en CSS Grid
 */
function restructureCardGrid(cardElement) {
  // Le contenu existant (variantes + bullets) devient .q-card-content
  const existingContent = cardElement.innerHTML;

  cardElement.innerHTML = `
    <div class="q-card-content">
      ${existingContent}
    </div>
  `;

  // Les zones north/south/east/west/front/back seront ajoutées dynamiquement
}

/**
 * Ajouter le bouton toggle visuel
 */
/**
 * Ajouter le bouton toggle visuel à l'intérieur de la navigation des variantes
 */
function addVisualToggleButton(cardElement) {
  // On cible le conteneur des petits ronds (bullets)
  const navContainer = cardElement.querySelector('.bullets-nav');
  if (!navContainer) return;

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'visual-toggle-btn mini-eye active'; // Active par défaut
  
  // SVG discret (Style Lucide)
  toggleBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;
  
  toggleBtn.title = 'Afficher/Masquer le visuel';

  let isVisible = true;
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isVisible = !isVisible;
    VisualsSystem.toggleVisual(cardElement, isVisible);
    toggleBtn.classList.toggle('active', isVisible);
  });

  // On l'ajoute comme dernier enfant des bullets
  navContainer.appendChild(toggleBtn);
}

/**
 * Gérer le changement de variante (hook dans le système existant)
 * À appeler quand l'utilisateur clique sur un bullet
 */
export async function handleVariantChange(cardElement, newVariantIndex) {
  const variantContent = cardElement.querySelector(
    `.variant-content[data-index="${newVariantIndex}"]`
  );

  if (!variantContent?.visualData) {
    // Pas de visuel pour cette variante, nettoyer
    clearCardVisuals(cardElement);
    return;
  }

  // Charger le nouveau visuel
  await VisualsSystem.initCardVisuals(cardElement, variantContent.visualData);
}

/**
 * Nettoyer les visuels d'une carte
 */
function clearCardVisuals(cardElement) {
  const visualZones = cardElement.querySelectorAll(
    '.q-card-north, .q-card-south, .q-card-east, .q-card-west, .q-card-front, .q-card-back'
  );

  visualZones.forEach((zone) => {
    zone.remove();
  });
}

/**
 * Ouvrir l'éditeur de visuel pour une carte
 */
export function openVisualEditor(cardElement) {
  const activeVariant = cardElement.querySelector('.variant-content.active');
  if (!activeVariant?.visualData) {
    alert('Cette variante n\'a pas de visuel configuré.');
    return;
  }

  const visualData = activeVariant.visualData;
  const visualType = visualData.type;

  // Créer le panneau éditeur s'il n'existe pas
  let editorPanel = document.getElementById('visual-editor-panel');
  if (!editorPanel) {
    editorPanel = createEditorPanel();
    document.body.appendChild(editorPanel);
  }

  // Remplir l'éditeur avec la config actuelle
  populateEditor(editorPanel, visualType, visualData);

  // Afficher le panneau
  editorPanel.classList.add('open');

  // Stocker la carte en cours d'édition
  editorPanel.currentCard = cardElement;
}

/**
 * Créer le panneau éditeur HTML
 */
function createEditorPanel() {
  const panel = document.createElement('div');
  panel.id = 'visual-editor-panel';
  panel.className = 'visual-editor-panel';

  panel.innerHTML = `
    <div class="editor-header">
      <h3>Éditeur de Visuel</h3>
      <button class="editor-close" aria-label="Fermer">✕</button>
    </div>
    <div class="editor-body">
      <!-- Rempli dynamiquement -->
    </div>
    <div class="editor-actions">
      <button class="editor-btn editor-btn-secondary" data-action="reset">Réinitialiser</button>
      <button class="editor-btn editor-btn-primary" data-action="apply">Appliquer</button>
    </div>
  `;

  // Events
  panel.querySelector('.editor-close').addEventListener('click', () => {
    panel.classList.remove('open');
  });

  panel.querySelector('[data-action="reset"]').addEventListener('click', () => {
    const type = panel.currentType;
    const defaults = getDefaultConfig(type);
    populateEditor(panel, type, { type, config: defaults });
  });

  panel.querySelector('[data-action="apply"]').addEventListener('click', async () => {
    await applyEditorChanges(panel);
  });

  return panel;
}

/**
 * Remplir l'éditeur avec les champs du type de visuel
 */
function populateEditor(panel, visualType, visualData) {
  panel.currentType = visualType;

  const metadata = visualMetadata[visualType];
  if (!metadata) {
    console.error(`Unknown visual type: ${visualType}`);
    return;
  }

  const editorBody = panel.querySelector('.editor-body');
  editorBody.innerHTML = `
    <div class="editor-field">
      <label>Type de Visuel</label>
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f8fafc; border-radius: 0.5rem;">
        <span style="font-size: 1.5rem;">${metadata.icon}</span>
        <span style="font-weight: 600;">${metadata.label}</span>
      </div>
    </div>
  `;

  // Générer les champs selon metadata
  const configFields = getConfigFields(visualType);

  const currentConfig = visualData.config || {};

  configFields.forEach((field) => {
    const fieldValue = currentConfig[field.name] ?? field.default;
    const fieldHTML = generateFieldHTML(field, fieldValue);
    editorBody.innerHTML += fieldHTML;
  });
}

/**
 * Générer le HTML d'un champ selon son type
 */
function generateFieldHTML(field, value) {
  const fieldId = `editor-field-${field.name}`;

  

  let inputHTML = '';

  switch (field.type) {
    case 'number':
      inputHTML = `<input type="number" id="${fieldId}" name="${field.name}" value="${value}" />`;
      break;

    case 'text':
      inputHTML = `<input type="text" id="${fieldId}" name="${field.name}" value="${value}" />`;
      break;

    case 'boolean':
      inputHTML = `
        <label style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" id="${fieldId}" name="${field.name}" ${value ? 'checked' : ''} />
          <span>Activé</span>
        </label>
      `;
      break;

    case 'select':
      inputHTML = `
        <select id="${fieldId}" name="${field.name}">
          ${field.options
            .map(
              (opt) => `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`
            )
            .join('')}
        </select>
      `;
      break;

    case 'color':
      inputHTML = `<input type="color" id="${fieldId}" name="${field.name}" value="${value}" />`;
      break;

    case 'array':
      // Cas complexe : liste de points, etc.
      // Pour le MVP, on utilise JSON textarea
      inputHTML = `<textarea id="${fieldId}" name="${field.name}" rows="3" style="font-family: monospace; font-size: 0.875rem;">${JSON.stringify(value || [], null, 2)}</textarea>`;
      break;

    default:
      inputHTML = `<input type="text" id="${fieldId}" name="${field.name}" value="${value}" />`;
  }

  return `
    <div class="editor-field">
      <label for="${fieldId}">${field.label}</label>
      ${inputHTML}
    </div>
  `;
}

/**
 * Appliquer les changements de l'éditeur
 */
async function applyEditorChanges(panel) {
  const cardElement = panel.currentCard;
  if (!cardElement) return;

  const visualType = panel.currentType;
  const editorBody = panel.querySelector('.editor-body');

  // Collecter les valeurs des champs
  const newConfig = {};
  const fields = getConfigFields(visualType);

  fields.forEach((field) => {
    const input = editorBody.querySelector(`[name="${field.name}"]`);
    if (!input) return;

    let value;
    switch (field.type) {
      case 'number':
        value = parseFloat(input.value);
        break;
      case 'boolean':
        value = input.checked;
        break;
      case 'array':
        try {
          value = JSON.parse(input.value);
        } catch (e) {
          console.error(`Invalid JSON for ${field.name}:`, e);
          value = field.default;
        }
        break;
      default:
        value = input.value;
    }

    newConfig[field.name] = value;
  });

  // Mettre à jour le visuel
  const activeVariant = cardElement.querySelector('.variant-content.active');
  if (activeVariant) {
    activeVariant.visualData.config = newConfig;
    await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
  }

  // Sauvegarder en localStorage
  const cardId = cardElement.id;
  if (cardId) {
    const storageKey = `visual-config-${cardId}`;
    localStorage.setItem(storageKey, JSON.stringify(newConfig));
  }

  // Fermer le panneau
  panel.classList.remove('open');

  console.log('✅ Visual config updated:', newConfig);
}

// Export pour utilisation dans RapidoLayout
export default {
  initRapidosVisuals,
  handleVariantChange,
  openVisualEditor,
};
