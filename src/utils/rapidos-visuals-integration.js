
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

  // --- LAYOUT SPÉCIFIQUE POUR AXE GRADUÉ (FUSIONNÉ) ---
  if (visualType === 'axe-gradue') {
    renderAxeGradueEditor(panel, visualData);
  } else {
    // --- LAYOUT STANDARD POUR LES AUTRES VISUELS ---
    renderStandardEditor(panel, visualType, visualData);
  }

  // Activer le "Live Edit" sur tous les inputs
  const inputs = editorBody.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('change', () => applyEditorChanges(panel));
    // Pour les sliders ou text, on peut aussi utiliser 'input' pour plus de réactivité
    if (input.type === 'range' || input.type === 'text' || input.type === 'number') {
       input.addEventListener('input', () => applyEditorChanges(panel));
    }
  });

  // Event Listeners pour l'éditeur de tableau (Points) - Géré globalement
  // (Le code existant pour click sur .btn-remove-item / .btn-add-item fonctionne car délégué sur editorBody)
}

/**
 * Rendu spécifique fusionné pour Axe Gradué
 */
function renderAxeGradueEditor(panel, visualData) {
  const editorBody = panel.querySelector('.editor-body');
  const config = visualData.config || {};
  const position = visualData.position || 'north';

  // 1. Charger les préférences aléatoires
  let randPrefs = { min: '-10:0', count: '5:10', steps: '1, 0.5, 2', visible: '2:4', points: '1:2', snap: true };
  try {
    const saved = JSON.parse(localStorage.getItem(`visual-random-prefs-${panel.currentCard?.id}`));
    if (saved) {
      randPrefs.min = saved.minRange.join(':');
      randPrefs.count = saved.countRange.join(':');
      randPrefs.steps = saved.steps.join(', ');
      randPrefs.visible = saved.visibleRange.join(':');
      randPrefs.points = saved.pointsRange.join(':');
      randPrefs.snap = saved.snap !== undefined ? saved.snap : true;
    }
  } catch (e) {}

  // Helper pour les champs range (min/max inputs)
  const rangeField = (label, name, val) => {
    const [v1, v2] = val.split(':');
    return `
      <div class="editor-field full-width range-group">
        <label>${label}</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.3rem;">
            <span style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">MIN</span>
            <input type="number" step="any" value="${v1}" style="padding: 0.2rem 0.4rem; font-size: 0.8rem;">
          </div>
          <div style="display: flex; align-items: center; gap: 0.3rem;">
            <span style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">MAX</span>
            <input type="number" step="any" value="${v2}" style="padding: 0.2rem 0.4rem; font-size: 0.8rem;">
          </div>
        </div>
        <input type="hidden" name="${name}" value="${val}">
      </div>
    `;
  };

  // 2. HTML Fusionné
  const html = `
    <!-- CHAMPS CACHÉS (Pour stocker les valeurs générées) -->
    <input type="hidden" name="min" value="${config.min}">
    <input type="hidden" name="max" value="${config.max}">
    <input type="hidden" name="step" value="${config.step}">
    <input type="hidden" name="width" value="${config.width || 800}">
    <input type="hidden" name="height" value="${config.height || 80}">
    <input type="hidden" name="visibleLabels" value="${Array.isArray(config.visibleLabels) ? config.visibleLabels.join(', ') : ''}">
    <input type="hidden" name="points" value='${JSON.stringify(config.points || [])}'>

    <!-- LIGNE 1 : POSITION + CHECKBOX -->
    <div style="grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; align-items: end;">
       <div class="editor-field">
          <label for="editor-field-position">POSITION</label>
          <select id="editor-field-position" name="position">
            ${['north', 'south', 'east', 'west'].map(opt => `<option value="${opt}" ${opt === position ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
       </div>
       
       <div class="editor-field" style="justify-content: flex-end; padding-bottom: 5px; padding: 0; border: none; background: transparent;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" id="rand-snap-check" name="rand-snap" ${randPrefs.snap ? 'checked' : ''} style="width: auto;" />
            <label for="rand-snap-check" style="margin:0; cursor:pointer;">SUR GRADUATION</label>
          </div>
       </div>
    </div>

    <!-- PARAMÈTRES -->
    ${rangeField('INTERVALLE MIN', 'rand-min-range', randPrefs.min)}
    ${generateFieldHTML({ name: 'rand-steps', label: 'PAS POSSIBLES', type: 'text' }, randPrefs.steps)}
    ${rangeField('NB GRADUATIONS (LONGUEUR)', 'rand-count-range', randPrefs.count)}
    ${rangeField('ABSCISSES AFFICHÉES', 'rand-visible-range', randPrefs.visible)}
    ${rangeField('NB POINTS', 'rand-points-range', randPrefs.points)}
  `;

  editorBody.insertAdjacentHTML('beforeend', html);

  // Logique pour mettre à jour les inputs hidden quand on change les ranges
  panel.querySelectorAll('.range-group').forEach(group => {
    const hidden = group.querySelector('input[type="hidden"]');
    const inputs = group.querySelectorAll('input[type="number"]');
    
    const updateHidden = () => {
      hidden.value = `${inputs[0].value}:${inputs[1].value}`;
      hidden.dispatchEvent(new Event('input'));
    };
    
    inputs.forEach(inp => inp.addEventListener('input', updateHidden));
  });

  // Sauvegarde automatique des préférences du générateur lors de la modification
  const savePrefs = () => {
    const getVal = (name) => panel.querySelector(`[name="${name}"]`)?.value || '';
    const prefs = {
      minRange: getVal('rand-min-range').split(':').map(Number),
      countRange: getVal('rand-count-range').split(':').map(Number),
      steps: getVal('rand-steps').split(',').map(s => parseFloat(s.trim())),
      visibleRange: getVal('rand-visible-range').split(':').map(Number),
      pointsRange: getVal('rand-points-range').split(':').map(Number),
      snap: panel.querySelector('[name="rand-snap"]').value === 'true'
    };
    if (panel.currentCard?.id) {
      localStorage.setItem(`visual-random-prefs-${panel.currentCard.id}`, JSON.stringify(prefs));
    }
  };

  ['rand-min-range', 'rand-count-range', 'rand-steps', 'rand-visible-range', 'rand-points-range', 'rand-snap'].forEach(name => {
    const el = panel.querySelector(`[name="${name}"]`);
    if (el) {
      el.addEventListener('input', savePrefs);
      el.addEventListener('change', savePrefs);
    }
  });
}

/**
 * Rendu standard pour les autres visuels
 */
function renderStandardEditor(panel, visualType, visualData) {
  const editorBody = panel.querySelector('.editor-body');
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
  let containerClass = 'editor-field';

  switch (field.type) {
    case 'number':
      inputHTML = `<input type="number" step="any" id="${fieldId}" name="${field.name}" value="${value}" />`;
      break;

    case 'text':
      inputHTML = `<input type="text" id="${fieldId}" name="${field.name}" value="${value}" />`;
      break;

    case 'boolean':
      inputHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" id="${fieldId}" name="${field.name}" ${value ? 'checked' : ''} />
          <label for="${fieldId}" style="margin:0;">${field.label}</label>
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
 * Appliquer les changements de l'éditeur
 */
async function applyEditorChanges(panel) {
  const cardElement = panel.currentCard;
  if (!cardElement) return;

  const activeVariant = cardElement.querySelector('.variant-content.active');
  const visualType = panel.currentType;
  const editorBody = panel.querySelector('.editor-body');

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
function generateRandomConfigValues(prefs) {
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const minRange = prefs.minRange || [-10, 0];
  const countRange = prefs.countRange || [5, 10]; // Nombre de graduations
  const steps = prefs.steps || [1];
  const visibleRange = prefs.visibleRange || [2, 4];
  const pointsRange = prefs.pointsRange || [2, 3];
  const snapToGrid = prefs.snap !== undefined ? prefs.snap : true;

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
    
    let precision = 0.01;
    if (snapToGrid) {
      // Exactement sur graduation ou milieu (step / 2)
      precision = newStep / 2;
    } else {
      precision = 0.01;
    }
    val = Math.round(val / precision) * precision;
    
    // Si possible, forcer une valeur qui n'est PAS dans visibleLabels
    // On a 5 essais pour trouver une valeur cachée
    for (let attempt = 0; attempt < 5; attempt++) {
        if (!visibleLabels.includes(val)) break; // C'est bon, c'est caché
        // Sinon on réessaie
        val = newMin + (Math.random() * range);
        val = Math.round(val / precision) * precision;
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
  const cardId = cardElement.id;
  
  // 1. Récupérer les préférences ou défauts
  let prefs = {
    minRange: [-10, 0],
    countRange: [5, 10],
    steps: [1, 0.5, 2],
    visibleRange: [2, 4],
    pointsRange: [2, 3],
    snap: true
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

    // Si l'éditeur est ouvert pour cette carte, le rafraîchir pour afficher les nouvelles valeurs
    const editorPanel = document.getElementById('visual-editor-panel');
    if (editorPanel && editorPanel.classList.contains('open') && editorPanel.currentCard === cardElement) {
      populateEditor(editorPanel, activeVariant.visualData.type, activeVariant.visualData);
    }
  }
}

// Export pour utilisation dans RapidoLayout
export default {
  initRapidosVisuals,
  handleVariantChange,
  openVisualEditor,
};
