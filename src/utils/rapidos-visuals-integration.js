
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
    <div class="editor-field full-width">
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

  // Charger les préférences aléatoires sauvegardées
  let randPrefs = { min: '-10:0', max: '10:20', steps: '1, 0.5, 2', points: '2:3' };
  try {
    const saved = JSON.parse(localStorage.getItem(`visual-random-prefs-${panel.currentCard?.id}`));
    if (saved) {
      randPrefs.min = saved.minRange.join(':');
      randPrefs.max = saved.maxRange.join(':');
      randPrefs.steps = saved.steps.join(', ');
      randPrefs.points = saved.pointsRange.join(':');
    }
  } catch (e) {}

  // Ajouter la section Générateur Aléatoire
  const randomizerHTML = `
    <div class="randomizer-section">
      <div class="randomizer-header">
        <span class="randomizer-title">🎲 Paramètres Aléatoires</span>
        <button class="btn-random" id="btn-trigger-random">Générer & Appliquer</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
         <div class="editor-field">
           <label title="Format: min:max (ex: -10:0)">Intervalle Min</label>
           <input type="text" id="rand-min-range" value="${randPrefs.min}" placeholder="-10:0">
         </div>
         <div class="editor-field">
           <label title="Format: min:max (ex: 10:20)">Intervalle Max</label>
           <input type="text" id="rand-max-range" value="${randPrefs.max}" placeholder="10:20">
         </div>
         <div class="editor-field">
           <label title="Valeurs séparées par virgule">Pas possibles</label>
           <input type="text" id="rand-steps" value="${randPrefs.steps}" placeholder="1, 0.5">
         </div>
         <div class="editor-field">
           <label title="Format: min:max">Nb Points</label>
           <input type="text" id="rand-points-range" value="${randPrefs.points}" placeholder="2:3">
         </div>
      </div>
    </div>
  `;
  editorBody.insertAdjacentHTML('beforeend', randomizerHTML);

  // Event Listener pour le bouton Random
  const randBtn = panel.querySelector('#btn-trigger-random');
  if (randBtn) {
    randBtn.addEventListener('click', () => handleRandomize(panel));
  }
}

/**
 * Générer le HTML d'un champ selon son type
 */
function generateFieldHTML(field, value) {
  const fieldId = `editor-field-${field.name}`;
  let inputHTML = '';
  let containerClass = 'editor-field';

  switch (field.type) {
    case 'number':
      inputHTML = `<input type="number" id="${fieldId}" name="${field.name}" value="${value}" />`;
      break;

    case 'text':
      inputHTML = `<input type="text" id="${fieldId}" name="${field.name}" value="${value}" />`;
      break;

    case 'boolean':
      containerClass += ' checkbox-field full-width';
      inputHTML = `
        <label for="${fieldId}">${field.label}</label>
        <input type="checkbox" id="${fieldId}" name="${field.name}" ${value ? 'checked' : ''} />
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
      containerClass += ' full-width';
      // Pour le MVP, on utilise JSON textarea
      inputHTML = `<textarea id="${fieldId}" name="${field.name}" rows="3" style="font-family: monospace; font-size: 0.875rem;">${JSON.stringify(value || [], null, 2)}</textarea>`;
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
          alert(`Erreur de syntaxe JSON dans le champ "${field.label}" :\n${e.message}`);
          return; // 🛑 Arrêter la sauvegarde pour ne pas perdre les données
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

/**
 * Gérer le tirage aléatoire
 */
function handleRandomize(panel) {
  // 1. Récupérer les contraintes
  const getRange = (id) => {
    const val = panel.querySelector(id).value.split(':').map(Number);
    return { min: val[0] || 0, max: val[1] !== undefined ? val[1] : val[0] };
  };
  const getList = (id) => panel.querySelector(id).value.split(',').map(s => parseFloat(s.trim()));

  const minRange = getRange('#rand-min-range');
  const maxRange = getRange('#rand-max-range');
  const steps = getList('#rand-steps');
  const pointsRange = getRange('#rand-points-range');

  // Sauvegarder les préférences pour le bouton "Reload"
  const prefs = { minRange: [minRange.min, minRange.max], maxRange: [maxRange.min, maxRange.max], steps, pointsRange: [pointsRange.min, pointsRange.max] };
  if (panel.currentCard?.id) {
    localStorage.setItem(`visual-random-prefs-${panel.currentCard.id}`, JSON.stringify(prefs));
  }

  // 2. Générer la config
  const generated = generateRandomConfigValues(prefs);

  // 3. Mettre à jour les champs du formulaire
  const setVal = (name, val) => {
    const input = panel.querySelector(`[name="${name}"]`);
    if (input) {
      input.value = typeof val === 'object' ? JSON.stringify(val, null, 2) : val;
    }
  };

  setVal('min', generated.min);
  setVal('max', generated.max);
  setVal('step', generated.step);
  setVal('points', generated.points);

  // 4. Appliquer
  applyEditorChanges(panel);
}

/**
 * Logique de génération aléatoire (partagée)
 */
function generateRandomConfigValues(prefs) {
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const minRange = prefs.minRange || [-10, 0];
  const maxRange = prefs.maxRange || [10, 20];
  const steps = prefs.steps || [1];
  const pointsRange = prefs.pointsRange || [2, 3];

  const newMin = randInt(minRange[0], minRange[1]);
  
  // S'assurer que max > min
  let newMax = randInt(Math.max(maxRange[0], newMin + 5), maxRange[1]);
  if (newMax <= newMin) newMax = newMin + 10;

  const newStep = randItem(steps) || 1;

  // Générer des points
  const nbPoints = randInt(pointsRange[0], pointsRange[1]);
  const newPoints = [];
  const labels = ['A', 'B', 'C', 'D', 'E'];
  
  for (let i = 0; i < nbPoints; i++) {
    const range = newMax - newMin;
    let val = newMin + (Math.random() * range);
    
    // Arrondir au step ou step/2 pour que ce soit "joli"
    const precision = newStep < 1 ? 0.1 : (newStep % 1 === 0 ? 0.5 : 0.1);
    val = Math.round(val / precision) * precision;
    
    // Éviter les doublons exacts
    if (!newPoints.some(p => Math.abs(p.value - val) < 0.001)) {
      newPoints.push({
        label: labels[i % labels.length],
        value: parseFloat(val.toFixed(2)),
        color: '#f59e0b'
      });
    }
  }

  return {
    min: newMin,
    max: newMax,
    step: newStep,
    points: newPoints
  };
}

/**
 * Régénération rapide (Bouton Reload)
 */
async function quickRandomize(cardElement) {
  const cardId = cardElement.id;
  
  // 1. Récupérer les préférences ou défauts
  let prefs = {
    minRange: [-10, 0],
    maxRange: [10, 20],
    steps: [1, 0.5, 2],
    pointsRange: [2, 3]
  };
  
  try {
    const stored = localStorage.getItem(`visual-random-prefs-${cardId}`);
    if (stored) prefs = { ...prefs, ...JSON.parse(stored) };
  } catch(e) {}

  // 2. Générer
  const newConfig = generateRandomConfigValues(prefs);

  // 3. Appliquer
  const activeVariant = cardElement.querySelector('.variant-content.active');
  if (activeVariant) {
    // Fusionner avec la config existante pour garder width/height/etc.
    activeVariant.visualData.config = { 
      ...activeVariant.visualData.config, 
      ...newConfig 
    };
    
    await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
    
    // Sauvegarder le résultat
    localStorage.setItem(`visual-config-${cardId}`, JSON.stringify(activeVariant.visualData.config));
  }
}

// Export pour utilisation dans RapidoLayout
export default {
  initRapidosVisuals,
  handleVariantChange,
  openVisualEditor,
};
