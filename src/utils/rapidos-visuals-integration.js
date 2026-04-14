
// ========================================
// RAPIDOS VISUELS - Intégration RapidoLayout
// Script à inclure dans RapidoLayout.astro
// ========================================

import VisualsSystem from './visuals-system.js';
import './visual-registry.js'; // Charge le registre
import { visualMetadata, getConfigFields, getDefaultConfig } from './visual-registry.js';
import { renderEditor as renderAxeGradueEditor } from '../visuals/axe-gradue/editor.js';
import { renderEditor as renderCubesNumerationEditor } from '../visuals/cubes-numeration/editor.js';
import { renderEditor as renderPolygonePerimetreEditor } from '../visuals/polygone-perimetre/editor.js';

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

  // Pour chaque question — on sélectionne par ordre DOM, indépendamment de l'ID
  const cardElements = Array.from(document.querySelectorAll('.q-card'));

  questionData.forEach((question, qIndex) => {
    const cardElement = cardElements[qIndex];
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
        // On stocke la config MD originale et la config surchargée par localStorage
        const originalData = JSON.parse(JSON.stringify(variante.visual));
        variantContent.originalVisualData = originalData;
        variantContent.visualData = JSON.parse(JSON.stringify(originalData)); // copie de travail
      }
    });

    // Charger le visuel de la variante active (index 0 par défaut)
    const activeVariant = cardElement.querySelector('.variant-content.active');
    loadConfigFromLocalStorage(cardElement, activeVariant); // Charger la config pour la variante active
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
 * Charge la configuration du localStorage pour une variante donnée.
 */
function loadConfigFromLocalStorage(cardElement, variantContent) {
  if (!cardElement || !variantContent || !variantContent.visualData) return;

  const cardId = cardElement.id;
  const storedConfig = localStorage.getItem(`visual-config-${cardId}`);
  if (storedConfig) {
    try {
      const parsedConfig = JSON.parse(storedConfig);
      // On utilise une copie de l'original pour fusionner
      const originalData = JSON.parse(JSON.stringify(variantContent.originalVisualData));
      originalData.config = { ...originalData.config, ...parsedConfig };
      variantContent.visualData = originalData;
    } catch (e) { console.error('Error parsing stored visual config:', e); }
  } else {
    // S'il n'y a rien dans le storage, on s'assure d'utiliser la config originale
    variantContent.visualData = JSON.parse(JSON.stringify(variantContent.originalVisualData));
  }
}

/**
 * Restructurer une carte en CSS Grid
 */
function restructureCardGrid(cardElement) {
  // Vérifier si déjà restructuré
  if (cardElement.querySelector('.q-card-content')) {
    return; // Déjà fait
  }

  // Extraire les éléments qui NE doivent PAS être dans .q-card-content
  const qNum = cardElement.querySelector('.q-num');
  const cardHeaderControls = cardElement.querySelector('.card-header-controls');

  // Extraire les variantes qui DOIVENT être dans .q-card-content
  const variantContents = Array.from(cardElement.querySelectorAll('.variant-content'));

  // Vider la carte
  cardElement.innerHTML = '';

  // Remettre les éléments dans le bon ordre
  if (qNum) cardElement.appendChild(qNum);
  if (cardHeaderControls) cardElement.appendChild(cardHeaderControls);

  // Créer .q-card-content avec les variantes
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'q-card-content';
  variantContents.forEach(variant => contentWrapper.appendChild(variant));
  cardElement.appendChild(contentWrapper);

  // Les zones north/south/east/west/front/back seront ajoutées dynamiquement
}

/**
 * Ajouter le bouton toggle visuel
 */
/**
 * Ajouter le bouton toggle visuel à l'intérieur de la navigation des variantes
 */
// src/utils/rapidos-visuals-integration.js

// src/utils/rapidos-visuals-integration.js

function addVisualToggleButton(cardElement) {
  const nav = cardElement.querySelector('.bullets-nav');
  if (!nav) return;

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'visual-toggle-btn mini-eye active';
  toggleBtn.title = "Masquer/Afficher le visuel";
  toggleBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = toggleBtn.classList.toggle('active');
    VisualsSystem.toggleVisual(cardElement, isVisible);
  });

  nav.appendChild(toggleBtn);

  // Bouton Paramètres (Engrenage)
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'visual-toggle-btn mini-eye';
  settingsBtn.title = "Éditer les paramètres";
  settingsBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>`;

  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openVisualEditor(cardElement);
  });

  nav.appendChild(settingsBtn);

  // Bouton Reload (Régénérer)
  const reloadBtn = document.createElement('button');
  reloadBtn.className = 'visual-toggle-btn mini-eye';
  reloadBtn.title = "Régénérer aléatoirement";
  reloadBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M22 12.5a10 10 0 0 1-18.8 4.3L2.5 16"></path>
    </svg>`;

  reloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    quickRandomize(cardElement);
  });

  nav.appendChild(reloadBtn);
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
  // S'assurer que la config du localStorage est bien chargée pour cette variante
  loadConfigFromLocalStorage(cardElement, variantContent);
  await VisualsSystem.initCardVisuals(cardElement, variantContent.visualData);

  // Si l'éditeur est ouvert pour cette carte, le mettre à jour aussi
  const editorPanel = document.getElementById('visual-editor-panel');
  if (editorPanel?.classList.contains('open') && editorPanel.currentCard === cardElement) {
    const visualData = variantContent.visualData;
    const originalVisualData = variantContent.originalVisualData;
    populateEditor(editorPanel, visualData.type, visualData, originalVisualData);
  }
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
  const originalVisualData = activeVariant.originalVisualData;
  const visualType = visualData.type;

  // Créer le panneau éditeur s'il n'existe pas
  let editorPanel = document.getElementById('visual-editor-panel');
  if (!editorPanel) {
    editorPanel = createEditorPanel();
    document.body.appendChild(editorPanel);
  }

  // Stocker la carte en cours d'édition AVANT de peupler l'éditeur
  editorPanel.currentCard = cardElement;

  // Remplir l'éditeur avec la config actuelle
  populateEditor(editorPanel, visualType, visualData, originalVisualData);

  // Afficher le panneau
  editorPanel.classList.add('open');
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
      <h3 style="color: white; margin: 0;">Éditeur de Visuel</h3>
      <button class="editor-close" aria-label="Fermer" style="color: white;">✕</button>
    </div>
    <div class="editor-body">
      <!-- Rempli dynamiquement -->
    </div>
  `;

  // Events
  panel.querySelector('.editor-close').addEventListener('click', () => {
    panel.classList.remove('open');
  });

  return panel;
}

/**
 * Remplir l'éditeur avec les champs du type de visuel
 */
function populateEditor(panel, visualType, visualData, originalVisualData) {
  panel.currentType = visualType;

  const metadata = visualMetadata[visualType];
  const cardId = panel.currentCard.id;
  if (!metadata) {
    console.error(`Unknown visual type: ${visualType}`);
    return;
  }

  const editorBody = panel.querySelector('.editor-body');

  // 1. Injecter la partie commune EN PREMIER (type + éventuel warning localStorage)
  const storedConfig = localStorage.getItem(`visual-config-${cardId}`);
  editorBody.innerHTML = `
    <div class="editor-field full-width">
      <label>Type de Visuel</label>
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f8fafc; border-radius: 0.5rem;">
        <span style="font-size: 1.5rem;">${metadata.icon}</span>
        <span style="font-weight: 600;">${metadata.label}</span>
      </div>
    </div>
    ${storedConfig ? `
    <div class="editor-field full-width" style="padding: 8px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 0.75rem; color: #92400e; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
      <span>Les valeurs par défaut ont été surchargées.</span>
      <button id="reset-visual-config" style="background: transparent; border: 1px solid #f59e0b; color: #b45309; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-weight: 600;">Réinitialiser</button>
    </div>` : ''}
  `;

  // 2. Listener bouton réinitialisation (attaché immédiatement après injection)
  const resetBtn = editorBody.querySelector('#reset-visual-config');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      const cardElement = panel.currentCard;
      if (!cardElement) return;
      localStorage.removeItem(`visual-config-${cardId}`);
      localStorage.removeItem(`cn-rand-prefs-${cardId}`);
      const activeVariant = cardElement.querySelector('.variant-content.active');
      if (activeVariant?.originalVisualData) {
        activeVariant.visualData = JSON.parse(JSON.stringify(activeVariant.originalVisualData));
      }
      await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
      populateEditor(panel, visualType, activeVariant.visualData, activeVariant.originalVisualData);
    });
  }

  // 3. Rendre l'éditeur spécifique au type (insertAdjacentHTML + listeners propres)
  if (visualType === 'axe-gradue') {
    // renderAxeGradueEditor utilise insertAdjacentHTML et attache ses propres listeners
    renderAxeGradueEditor(panel, visualData, { generateFieldHTML });

  } else if (visualType === 'cubes-numeration') {
    const markdownPrefs = visualData.editor_prefs;
    let prefs = { milliers: '0:1', centaines: '1:3', dizaines: '0:9', unites: '0:9' };
    if (markdownPrefs) {
      prefs = { ...prefs, ...markdownPrefs };
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem(`cn-rand-prefs-${cardId}`));
        if (saved) prefs = { ...prefs, ...saved };
      } catch (e) {}
    }
    editorBody.insertAdjacentHTML('beforeend', renderCubesNumerationEditor(panel, visualData, prefs));
    // Listener sauvegarde plages aléatoires (localStorage)
    editorBody.querySelectorAll('.rand-range').forEach(input => {
      input.addEventListener('input', () => {
        if (visualData.editor_prefs) return;
        const newPrefs = {};
        ['milliers', 'centaines', 'dizaines', 'unites'].forEach(name => {
          const minEl = editorBody.querySelector(`.rand-range[data-pref="${name}"][data-part="min"]`);
          const maxEl = editorBody.querySelector(`.rand-range[data-pref="${name}"][data-part="max"]`);
          if (minEl && maxEl) newPrefs[name] = `${minEl.value}:${maxEl.value}`;
        });
        localStorage.setItem(`cn-rand-prefs-${cardId}`, JSON.stringify(newPrefs));
      });
    });

  } else if (visualType === 'polygone-perimetre') {
    const markdownPrefs = visualData.editor_prefs;
    let prefs = { valueMin: 2, valueMax: 9 };
    if (markdownPrefs) {
      if (markdownPrefs.valueRange) {
        prefs.valueMin = markdownPrefs.valueRange[0] ?? 2;
        prefs.valueMax = markdownPrefs.valueRange[1] ?? 9;
      }
      if (markdownPrefs.shapes) prefs.shapes = markdownPrefs.shapes;
      if (markdownPrefs.level)  prefs.level  = markdownPrefs.level;
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem(`pp-rand-prefs-${cardId}`));
        if (saved) prefs = { ...prefs, ...saved };
      } catch (e) {}
    }
    editorBody.insertAdjacentHTML('beforeend', renderPolygonePerimetreEditor(panel, visualData, prefs));
    // Listener sauvegarde plages aléatoires
    editorBody.querySelectorAll('.pp-range').forEach(input => {
      input.addEventListener('input', () => {
        if (visualData.editor_prefs) return;
        const minEl = editorBody.querySelector('.pp-range[data-part="min"]');
        const maxEl = editorBody.querySelector('.pp-range[data-part="max"]');
        if (minEl && maxEl) {
          const newPrefs = { ...prefs, valueMin: parseInt(minEl.value), valueMax: parseInt(maxEl.value) };
          localStorage.setItem(`pp-rand-prefs-${cardId}`, JSON.stringify(newPrefs));
        }
      });
    });

  } else {
    editorBody.insertAdjacentHTML('beforeend', renderStandardEditor(panel, visualType, visualData));
  }

  // 4. Live Edit sur tous les inputs — APRÈS le rendu des éditeurs spécifiques
  //    Exclure .rand-range (déjà gérés) et les inputs cachés d'axe-gradue (name=rand-*)
  const inputs = editorBody.querySelectorAll('input:not(.rand-range):not([type="hidden"]), select, textarea');
  inputs.forEach(input => {
    input.addEventListener('change', () => applyEditorChanges(panel));
    if (input.type === 'range' || input.type === 'text' || input.type === 'number') {
      input.addEventListener('input', () => applyEditorChanges(panel));
    }
  });
}

/**
 * Rendu standard pour les autres visuels
 */
function renderStandardEditor(panel, visualType, visualData) {
  let html = '';
  // Générer les champs selon metadata
  const configFields = getConfigFields(visualType);
  const currentConfig = visualData.config || {};

  configFields.forEach((field) => {
    const fieldValue = currentConfig[field.name] ?? field.default;
    html += generateFieldHTML(field, fieldValue);
  });

  return html;
}

// ... (le reste du fichier)
/**
 * Générer le HTML d'un champ selon son type
 */
function generateFieldHTML(field, value) {
  const fieldId = `editor-field-${field.name}`;
  let inputHTML = '';
  let containerClass = 'editor-field';

  switch (field.type) {
    case 'number':
      inputHTML = `<input type="number" step="any" id="${fieldId}" name="${field.name}" value="${value}" />`;
      break;

    case 'text':
      inputHTML = `<input type="text" id="${fieldId}" name="${field.name}" value="${value}" />`;
      break;

    case 'textarea':
      containerClass += ' full-width';
      inputHTML = `<textarea id="${fieldId}" name="${field.name}" rows="6" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; font-family: monospace; font-size: 0.9em;">${value}</textarea>`;
      break;

    case 'boolean':
      inputHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" id="${fieldId}" name="${field.name}" ${value ? 'checked' : ''} />
          <label for="${fieldId}" style="margin:0;white-space:normal;overflow:visible;text-overflow:unset;text-transform:uppercase;font-size:0.75rem;font-weight:600;color:#1e293b;">${field.label}</label>
        </div>
      `;
      return `<div class="${containerClass}" style="grid-column: 1 / -1;">${inputHTML}</div>`;

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
      // Interface riche pour les points
      containerClass += ' full-width';
      const items = Array.isArray(value) ? value : [];
      
      const itemsHTML = items.map(item => `
        <div class="array-item">
          <input type="text" placeholder="Nom" class="item-input" data-key="label" value="${item.label || ''}">
          <input type="number" step="any" placeholder="Val" class="item-input" data-key="value" value="${item.value !== undefined ? item.value : 0}">
          <input type="color" class="item-input" data-key="color" value="${item.color || '#f59e0b'}">
          <button class="btn-remove-item" title="Supprimer">✕</button>
        </div>
      `).join('');

      inputHTML = `
        <div class="array-editor" data-field="${field.name}" id="${fieldId}">
          <div class="array-items">
            ${itemsHTML}
          </div>
          <button class="btn-add-item">+ Ajouter un point</button>
        </div>
      `;
      break;

    default:
      containerClass += ' full-width';
      inputHTML = `<input type="text" id="${fieldId}" name="${field.name}" value="${value}" />`;
  }

  // Pour boolean, le label est déjà dans inputHTML
  const labelHTML = field.type === 'boolean' ? '' : `<label for="${fieldId}">${field.label}</label>`;

  return `
    <div class="${containerClass}">
      ${labelHTML}
      ${inputHTML}
    </div>
  `;
}

/**
 * Appliquer les changements de l'éditeur pour "cubes-numeration"
 */
async function applyCubesNumerationChanges(panel) {
  const cardElement = panel.currentCard;
  if (!cardElement) return;

  const activeVariant = cardElement.querySelector('.variant-content.active');
  const editorBody = panel.querySelector('.editor-body');

  // 1. Collecter les valeurs des champs de configuration
  const newConfig = { ...activeVariant?.visualData?.config };
  ['milliers', 'centaines', 'dizaines', 'unites'].forEach(name => {
    const input = editorBody.querySelector(`input[name="${name}"]`);
    if (input) {
      newConfig[name] = parseInt(input.value, 10) || 0;
    }
  });

  // 2. Gérer la checkbox "showLabels"
  const showLabelsInput = editorBody.querySelector(`input[name="showLabels"]`);
  if (showLabelsInput) {
    newConfig.showLabels = showLabelsInput.checked;
  }

  // 3. Mettre à jour le visuel et sauvegarder
  if (activeVariant) {
    activeVariant.visualData.config = newConfig;
    await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);

    const cardId = cardElement.id;
    localStorage.setItem(`visual-config-${cardId}`, JSON.stringify(newConfig));
  }
}

/**
 * Appliquer les changements de l'éditeur
 */
async function applyEditorChanges(panel) {
  const cardElement = panel.currentCard;
  if (!cardElement) return;

  const activeVariant = cardElement.querySelector('.variant-content.active');
  const visualType = panel.currentType;
  const editorBody = panel.querySelector('.editor-body');

  // Branche spécifique pour cubes-numeration
  if (visualType === 'cubes-numeration') {
    await applyCubesNumerationChanges(panel);
    return;
  }

  // Collecter les valeurs des champs
  const newConfig = { ...activeVariant?.visualData?.config }; // Garder les valeurs existantes (pour les champs cachés)
  const fields = getConfigFields(visualType);

  fields.forEach((field) => {
    // Gestion spéciale pour les champs cachés ou hors metadata (comme position)
    let input = editorBody.querySelector(`[name="${field.name}"]`);
    
    // Si le champ n'est pas dans le DOM standard, on ignore sauf si c'est un hidden input manuel
    if (!input) return;

    let value;
    switch (field.type) {
      case 'select':
        value = input.value;
        break;
      case 'text':
        value = input.value;
        break;
      case 'number':
        value = parseFloat(input.value);
        break;
      case 'boolean':
        value = input.checked;
        break;
      case 'array':
        // Pour les arrays (points), on lit le JSON du champ caché ou textarea
        try {
          value = JSON.parse(input.value || '[]');
        } catch (e) { value = []; }
        break;
      default:
        value = input.value;
    }
    
    // Conversion spéciale pour visibleLabels (String -> Array[Number])
    if (field.name === 'visibleLabels' && typeof value === 'string') {
      value = value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    }

    newConfig[field.name] = value;
  });

  // Gestion spécifique de la POSITION (root level)
  const posInput = editorBody.querySelector('[name="position"]');
  if (posInput) {
    activeVariant.visualData.position = posInput.value;
    // Définir l'orientation automatiquement selon la position
    const isVertical = ['east', 'west'].includes(posInput.value);
    newConfig.orientation = isVertical ? 'vertical' : 'horizontal';
  }

  // Mettre à jour le visuel
  if (activeVariant) {
    // On s'assure que points est bien un tableau
    if (typeof newConfig.points === 'string') try { newConfig.points = JSON.parse(newConfig.points); } catch(e) {}
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
  console.log('✅ Visual config updated:', newConfig);
}

/**
 * Logique de génération aléatoire (partagée)
 */
function generateRandomConfigValues(prefs, currentConfig = {}) {
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Conversion explicite en nombres pour éviter les erreurs de type (ex: "0" + 1 = "01")
  const minRange = (prefs.minRange || [-10, 0]).map(Number);
  const countRange = (prefs.countRange || [5, 10]).map(Number); // Nombre de graduations
  let steps = (prefs.steps || [1]).map(Number).filter(s => s > 0);
  if (steps.length === 0) steps = [1];

  const visibleRange = (prefs.visibleRange || [2, 4]).map(Number);
  const pointsRange = (prefs.pointsRange || [2, 3]).map(Number);
  const snapToGrid = prefs.snap !== undefined ? prefs.snap : true;

  // INTELLIGENCE DU PAS (STEP) SELON LE MODE
  const mode = currentConfig.mode || 'decimal';

  if (mode === 'fraction' || mode === 'mixed') {
    // En mode fraction/mixte : le pas est STRICTEMENT déterminé par les dénominateurs (1/d)
    // On ignore les "PAS POSSIBLES" configurés pour le mode décimal
    if (currentConfig.denominators) {
      let denoms = currentConfig.denominators;
      if (typeof denoms === 'string') denoms = denoms.split(',').map(Number);
      
      if (Array.isArray(denoms) && denoms.length > 0) {
        steps = denoms.map(d => 1/d);
      }
    }
  }

  const newMin = randInt(minRange[0], minRange[1]);
  
  // Choisir un pas
  const newStep = randItem(steps) || 1;
  
  // Calculer le Max basé sur le nombre de graduations (count)
  // Max = Min + (NbGraduations * Step)
  const nbSteps = randInt(countRange[0], countRange[1]);
  const newMax = newMin + (nbSteps * newStep);

  // Générer toutes les graduations possibles
  const allTicks = [];
  for (let v = newMin; v <= newMax + (newStep/10); v += newStep) {
    // Arrondi pour éviter 0.30000000004
    const precision = newStep < 1 ? 2 : (newStep % 1 === 0 ? 0 : 1);
    allTicks.push(parseFloat(v.toFixed(precision)));
  }

  // Choisir combien d'abscisses afficher (ex: entre 2 et 4)
  const nbVisible = Math.min(allTicks.length, randInt(visibleRange[0], visibleRange[1]));
  
  // Sélectionner aléatoirement les labels visibles
  // On mélange les ticks et on prend les N premiers
  const shuffledTicks = [...allTicks].sort(() => 0.5 - Math.random());
  const visibleLabels = shuffledTicks.slice(0, nbVisible).sort((a, b) => a - b);

  // Générer des points
  const nbPoints = randInt(pointsRange[0], pointsRange[1]);
  const newPoints = [];
  // Lettres aléatoires A-Z
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Essayer de placer les points sur des abscisses INCONNUES (cachées)
  for (let i = 0; i < nbPoints; i++) {
    const range = newMax - newMin;
    let val = newMin + (Math.random() * range);
    
    // Snap à la graduation la plus proche (offset depuis newMin, pas depuis 0)
    const snapToGrad = (v) => {
      if (snapToGrid) {
        const k = Math.round((v - newMin) / newStep);
        const snapped = newMin + k * newStep;
        // Clamp dans [newMin, newMax]
        return Math.max(newMin, Math.min(newMax, parseFloat(snapped.toFixed(10))));
      }
      return parseFloat(v.toFixed(2));
    };

    val = snapToGrad(val);

    // Si possible, forcer une valeur qui n'est PAS dans visibleLabels
    // On a 5 essais pour trouver une valeur cachée
    for (let attempt = 0; attempt < 5; attempt++) {
        if (!visibleLabels.includes(val)) break; // C'est bon, c'est caché
        // Sinon on réessaie
        val = snapToGrad(newMin + Math.random() * range);
    }
    
    // Éviter les doublons exacts
    if (!newPoints.some(p => Math.abs(p.value - val) < 0.001)) {
      newPoints.push({
        label: alphabet[Math.floor(Math.random() * alphabet.length)],
        value: parseFloat(val.toFixed(2)),
        color: '#f59e0b'
      });
    }
  }

  return {
    min: newMin,
    max: newMax,
    step: newStep,
    points: newPoints,
    visibleLabels: visibleLabels
  };
}

/**
 * Régénération rapide (Bouton Reload)
 */
async function quickRandomize(cardElement) {
  const activeVariant = cardElement.querySelector('.variant-content.active');
  const visualData = activeVariant?.visualData;
  const visualType = visualData?.type;

  // ── Branche cubes-numération ──────────────────────────────────────────
  if (visualType === 'cubes-numeration') {
    await quickRandomizeCubes(cardElement, activeVariant, visualData?.editor_prefs);
    return;
  }

  // ── Branche figure-geo ────────────────────────────────────────────────
  if (visualType === 'figure-geo') {
    const cardId = cardElement.id;
    const newSeed = `rnd${Math.random().toString(36).slice(2, 7)}`;
    if (activeVariant) {
      // Repartir de la config originale (MD), seulement changer le seed
      const originalConfig = activeVariant.originalVisualData?.config || activeVariant.visualData.config;
      const editorPrefs = visualData?.editor_prefs || {};
      const newConfig = { ...originalConfig, ...editorPrefs, seed: newSeed };
      activeVariant.visualData.config = newConfig;
      await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
      localStorage.setItem(`visual-config-${cardId}`, JSON.stringify(newConfig));
      const editorPanel = document.getElementById('visual-editor-panel');
      if (editorPanel?.classList.contains('open') && editorPanel.currentCard === cardElement) {
        const seedInput = editorPanel.querySelector('[name="seed"]');
        if (seedInput) seedInput.value = newSeed;
      }
    }
    return;
  }

  // ── Branche axe-gradué (logique existante) ────────────────────────────
  const cardId = cardElement.id;

  // 1. Lire les préférences depuis le Markdown (editor_prefs)
  const markdownPrefs = visualData?.editor_prefs;

  let prefs = {
    minRange: [-10, 0],
    countRange: [5, 10],
    steps: [1, 0.5, 2],
    visibleRange: [2, 4],
    pointsRange: [2, 3],
    snap: true
  };

  if (markdownPrefs) {
    // Priorité au Markdown
    prefs = { ...prefs, ...markdownPrefs };
  } else {
    // Sinon, fallback sur le localStorage
    try {
      const stored = localStorage.getItem(`visual-random-prefs-${cardId}`);
      if (stored) prefs = { ...prefs, ...JSON.parse(stored) };
    } catch(e) {}
  }

  const currentConfig = visualData?.config || {};
  const newConfig = generateRandomConfigValues(prefs, currentConfig);

  if (activeVariant) {
    activeVariant.visualData.config = { ...activeVariant.visualData.config, ...newConfig };
    await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
    localStorage.setItem(`visual-config-${cardId}`, JSON.stringify(activeVariant.visualData.config));
    const editorPanel = document.getElementById('visual-editor-panel');
    if (editorPanel && editorPanel.classList.contains('open') && editorPanel.currentCard === cardElement) {
      // Mettre à jour les champs de l'éditeur
      Object.entries(newConfig).forEach(([key, value]) => {
        const input = editorPanel.querySelector(`[name="${key}"]`);
        if (input) input.value = value;
      });
    }
  }
}

/**
 * Randomisation dédiée cubes-numération
 */
async function quickRandomizeCubes(cardElement, activeVariant, markdownPrefs) {
  const cardId    = cardElement.id;
  const editorPanel = document.getElementById('visual-editor-panel');
  const editorOpen  = editorPanel?.classList.contains('open') && editorPanel.currentCard === cardElement;
  const visualData = activeVariant?.visualData;

  // Charger les préférences de randomisation
  let prefs = { milliers: '0:1', centaines: '1:3', dizaines: '0:9', unites: '0:9' }; // Valeurs par défaut

  // La configuration du Markdown (editor_prefs) est TOUJOURS prioritaire,
  // que ce soit pour l'éditeur ou pour la randomisation.
  if (markdownPrefs) {
    prefs = { ...prefs, ...markdownPrefs };
  } else {
    try {
      const stored = localStorage.getItem(`cn-rand-prefs-${cardId}`);
      if (stored) prefs = { ...prefs, ...JSON.parse(stored) };
    } catch(e) {}
  }

  const randInt = (range) => {
    const [min, max] = String(range).split(':').map(Number);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const newConfig = {
    ...visualData.config,
    milliers:  randInt(prefs.milliers),
    centaines: randInt(prefs.centaines),
    dizaines:  randInt(prefs.dizaines),
    unites:    randInt(prefs.unites),
  };

  visualData.config = newConfig;
  await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
  localStorage.setItem(`visual-config-${cardId}`, JSON.stringify(newConfig));

  // 3. Mettre à jour uniquement les valeurs dans l'éditeur sans le reconstruire —
  //    les plages aléatoires restent intactes dans le DOM.
  if (editorOpen) {
    const editorBody = editorPanel.querySelector('.editor-body');
    ['milliers', 'centaines', 'dizaines', 'unites'].forEach(name => {
      const input = editorBody.querySelector(`[name="${name}"]`);
      if (input) input.value = newConfig[name] ?? 0;
    });
  }
}

// Export pour utilisation dans RapidoLayout
export default {
  initRapidosVisuals,
  handleVariantChange,
  openVisualEditor,
};
