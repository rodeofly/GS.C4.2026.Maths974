
// ========================================
// RAPIDOS VISUELS - Intégration RapidoLayout
// Script à inclure dans RapidoLayout.astro
// ========================================

import VisualsSystem from './visuals-system.js';
import './visual-registry.js'; // Charge le registre
import { visualMetadata, getConfigFields } from './visual-registry.js';
import { renderEditor as renderAxeGradueEditor } from '../visuals/axe-gradue/editor.js';
import { renderEditor as renderCubesNumerationEditor } from '../visuals/cubes-numeration/editor.js';
import { renderEditor as renderPolygonePerimetreEditor, randomizeSeed as polygoneRandomizeSeed } from '../visuals/polygone-perimetre/editor.js';
import { renderEditor as renderSchemaAdditifEditor, randomize as randomizeSchemaAdditif } from '../visuals/schema-additif/editor.js';

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
        // On stocke la config MD originale et la config courante (session)
        const originalData = JSON.parse(JSON.stringify(variante.visual));
        variantContent.originalVisualData = originalData;
        variantContent.visualData = JSON.parse(JSON.stringify(originalData)); // copie de travail
      }
    });

    // Charger le visuel de la variante active (index 0 par défaut)
    const activeVariant = cardElement.querySelector('.variant-content.active');
    if (activeVariant?.visualData) {
      VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
    }

    // Ajouter le bouton toggle
    addVisualToggleButton(cardElement);
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

  const thunderBtn = document.createElement('button');
  thunderBtn.className = 'visual-toggle-btn mini-eye';
  thunderBtn.title = "Variante aléatoire (mystère)";
  thunderBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2.5"
         stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>`;

  thunderBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    thunderRandomize(cardElement);
  });

  nav.appendChild(thunderBtn);
}
/**
 * Gérer le changement de variante (hook dans le système existant)
 * À appeler quand l'utilisateur clique sur un bullet
 */
export async function handleVariantChange(cardElement, newVariantIndex, resetToOriginal = true) {
  const variantContent = cardElement.querySelector(
    `.variant-content[data-index="${newVariantIndex}"]`
  );

  if (!variantContent?.visualData) {
    clearCardVisuals(cardElement);
    return;
  }

  // Retour au config MD original si demandé (comportement par défaut sur clic bullet)
  if (resetToOriginal && variantContent.originalVisualData) {
    variantContent.visualData = JSON.parse(JSON.stringify(variantContent.originalVisualData));
  }

  await VisualsSystem.initCardVisuals(cardElement, variantContent.visualData);

  // Mettre à jour l'éditeur si ouvert sur cette carte
  const editorPanel = document.getElementById('visual-editor-panel');
  if (editorPanel?.classList.contains('open') && editorPanel.currentCard === cardElement) {
    populateEditor(editorPanel, variantContent.visualData.type, variantContent.visualData, variantContent.originalVisualData);
  }
}

/**
 * Nettoyer les visuels d'une carte
 */
function clearCardVisuals(cardElement) {
  const visualZones = cardElement.querySelectorAll(
    '.q-card-north, .q-card-south, .q-card-east, .q-card-west, .q-card-front, .q-card-back, .sa-content-wrapper'
  );

  visualZones.forEach((zone) => {
    zone.remove();
  });
  cardElement.classList.remove('has-visual-west', 'has-visual-east');
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
      <div style="display:flex;gap:6px;align-items:center;">
        <button class="editor-yaml-btn" title="Exporter le YAML pour le fichier .md"
          style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);
                 color:white;font-size:0.7rem;font-weight:700;padding:3px 8px;border-radius:4px;
                 cursor:pointer;letter-spacing:0.05em;">YAML</button>
        <button class="editor-close" aria-label="Fermer" style="color: white;">✕</button>
      </div>
    </div>
    <div class="editor-body">
      <!-- Rempli dynamiquement -->
    </div>
  `;

  panel.querySelector('.editor-close').addEventListener('click', () => {
    panel.classList.remove('open');
  });

  panel.querySelector('.editor-yaml-btn').addEventListener('click', () => {
    const card = panel.currentCard;
    if (!card) return;
    const activeVariant = card.querySelector('.variant-content.active');
    if (!activeVariant?.visualData) return;
    showYAMLExport(activeVariant.visualData);
  });

  return panel;
}

/**
 * Sérialise une valeur en YAML inline
 */
function toYAMLValue(val) {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return `${val}`;
  if (typeof val === 'string') {
    const escaped = val.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  if (Array.isArray(val)) {
    return `[${val.map(toYAMLValue).join(', ')}]`;
  }
  if (typeof val === 'object') {
    // Objets inline (ex: points axe-gradué) → JSON-like
    return `{${Object.entries(val).map(([k, v]) => `${k}: ${toYAMLValue(v)}`).join(', ')}}`;
  }
  return `${val}`;
}

/**
 * Génère le YAML d'un visualData (type + position + config + editor_prefs)
 * avec l'indentation attendue dans les fichiers .md (10 espaces)
 */
function generateVisualYAML(visualData) {
  const I = '          '; // 10 espaces (niveau visual: dans le frontmatter)
  const lines = [];
  lines.push(`${I}visual:`);
  lines.push(`${I}  type: "${visualData.type}"`);
  lines.push(`${I}  position: "${visualData.position || 'north'}"`);

  const config = visualData.config || {};
  if (Object.keys(config).length > 0) {
    lines.push(`${I}  config:`);
    for (const [k, v] of Object.entries(config)) {
      if (v === '' || v === null || v === undefined) continue;
      lines.push(`${I}    ${k}: ${toYAMLValue(v)}`);
    }
  }

  const prefs = visualData.editor_prefs;
  if (prefs && Object.keys(prefs).length > 0) {
    lines.push(`${I}  editor_prefs:`);
    for (const [k, v] of Object.entries(prefs)) {
      lines.push(`${I}    ${k}: ${toYAMLValue(v)}`);
    }
  }

  return lines.join('\n');
}

/**
 * Affiche une modale avec le YAML généré
 */
function showYAMLExport(visualData) {
  // Supprimer modale existante
  document.getElementById('yaml-export-modal')?.remove();

  const yaml = generateVisualYAML(visualData);

  const modal = document.createElement('div');
  modal.id = 'yaml-export-modal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:200;
    display:flex;align-items:center;justify-content:center;`;

  modal.innerHTML = `
    <div style="background:white;border-radius:10px;padding:20px;width:90%;max-width:520px;
                max-height:85vh;display:flex;flex-direction:column;gap:10px;
                box-shadow:0 20px 60px rgba(0,0,0,0.4);">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:800;font-size:0.9rem;color:#1e293b;letter-spacing:0.05em;">
          YAML — à coller dans le fichier .md
        </span>
        <button id="yaml-modal-close"
          style="background:transparent;border:none;font-size:1.2rem;cursor:pointer;color:#64748b;">✕</button>
      </div>
      <textarea id="yaml-modal-content" readonly
        style="flex:1;font-family:monospace;font-size:0.78rem;line-height:1.5;
               border:1px solid #e2e8f0;border-radius:6px;padding:10px;
               min-height:220px;resize:vertical;background:#f8fafc;color:#1e293b;"
      >${yaml}</textarea>
      <div style="display:flex;gap:8px;">
        <button id="yaml-modal-copy"
          style="flex:1;background:#0f766e;color:white;border:none;border-radius:6px;
                 padding:8px;font-weight:700;font-size:0.85rem;cursor:pointer;">
          Copier dans le presse-papiers
        </button>
        <button id="yaml-modal-close2"
          style="background:#e2e8f0;color:#1e293b;border:none;border-radius:6px;
                 padding:8px 16px;font-weight:600;cursor:pointer;">Fermer</button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#yaml-modal-close').addEventListener('click', close);
  modal.querySelector('#yaml-modal-close2').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  modal.querySelector('#yaml-modal-copy').addEventListener('click', async () => {
    const btn = modal.querySelector('#yaml-modal-copy');
    try {
      await navigator.clipboard.writeText(yaml);
      btn.textContent = '✓ Copié !';
      btn.style.background = '#059669';
      setTimeout(() => {
        btn.textContent = 'Copier dans le presse-papiers';
        btn.style.background = '#0f766e';
      }, 2000);
    } catch {
      // Fallback sélection manuelle
      modal.querySelector('#yaml-modal-content').select();
    }
  });
}

/**
 * Remplir l'éditeur avec les champs du type de visuel
 */
function populateEditor(panel, visualType, visualData, _originalVisualData) {
  panel.currentType = visualType;

  const metadata = visualMetadata[visualType];
  if (!metadata) {
    console.error(`Unknown visual type: ${visualType}`);
    return;
  }

  const editorBody = panel.querySelector('.editor-body');

  // 1. Injecter la partie commune EN PREMIER (type + bouton reset)
  editorBody.innerHTML = `
    <div class="editor-field full-width">
      <label>Type de Visuel</label>
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: #f8fafc; border-radius: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.5rem;">${metadata.icon}</span>
          <span style="font-weight: 600;">${metadata.label}</span>
        </div>
        <button id="reset-visual-config" style="background: transparent; border: 1px solid #cbd5e1; color: #64748b; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-weight: 600;">Réinitialiser</button>
      </div>
    </div>
  `;

  // 2. Listener bouton réinitialisation — repart de la config markdown originale
  editorBody.querySelector('#reset-visual-config').addEventListener('click', async () => {
    const cardElement = panel.currentCard;
    if (!cardElement) return;
    const activeVariant = cardElement.querySelector('.variant-content.active');
    if (activeVariant?.originalVisualData) {
      activeVariant.visualData = JSON.parse(JSON.stringify(activeVariant.originalVisualData));
    }
    await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
    populateEditor(panel, visualType, activeVariant.visualData, activeVariant.originalVisualData);
  });

  // 3. Rendre l'éditeur spécifique au type (insertAdjacentHTML + listeners propres)
  if (visualType === 'axe-gradue') {
    // renderAxeGradueEditor utilise insertAdjacentHTML et attache ses propres listeners
    renderAxeGradueEditor(panel, visualData);

  } else if (visualType === 'cubes-numeration') {
    const markdownPrefs = visualData.editor_prefs;
    const prefs = { milliers: '0:1', centaines: '1:3', dizaines: '0:9', unites: '0:9',
                    ...(markdownPrefs || {}) };
    editorBody.insertAdjacentHTML('beforeend', renderCubesNumerationEditor(panel, visualData, prefs));

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
    }
    editorBody.insertAdjacentHTML('beforeend', renderPolygonePerimetreEditor(panel, visualData, prefs));

  } else if (visualType === 'schema-additif') {
    const markdownPrefs = visualData.editor_prefs;
    const prefs = { totalMin: 20, totalMax: 99, totalStep: 10, ...(markdownPrefs || {}) };
    editorBody.insertAdjacentHTML('beforeend', renderSchemaAdditifEditor(panel, visualData, prefs));

    // Mise à jour live du champ "partie 2" en fonction de total et part1
    const updatePart2 = () => {
      const t  = parseFloat(editorBody.querySelector('[name="total"]')?.value  || '0');
      const p1 = parseFloat(editorBody.querySelector('[name="part1"]')?.value || '0');
      const p2Display = editorBody.querySelector('[name="part2-display"]');
      if (p2Display) p2Display.value = Math.round((t - p1) * 1000) / 1000;
    };
    editorBody.querySelector('[name="total"]') ?.addEventListener('input', updatePart2);
    editorBody.querySelector('[name="part1"]') ?.addEventListener('input', updatePart2);

  } else {
    editorBody.insertAdjacentHTML('beforeend', renderStandardEditor(panel, visualType, visualData));
  }

  // 4. Live Edit sur tous les inputs — APRÈS le rendu des éditeurs spécifiques
  //    Exclure les inputs de plages de randomisation et les inputs cachés/désactivés
  const inputs = editorBody.querySelectorAll('input:not(.rand-range):not(.sa-range):not(.pp-range):not([type="hidden"]):not([disabled]), select, textarea');
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
function renderStandardEditor(_panel, visualType, visualData) {
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

  // ── Branche polygone-périmètre ────────────────────────────────────────
  if (visualType === 'polygone-perimetre') {
    await quickRandomizePolygone(cardElement, activeVariant, visualData?.editor_prefs);
    return;
  }

  // ── Branche schéma additif ───────────────────────────────────────────
  if (visualType === 'schema-additif') {
    await quickRandomizeSchemaAdditif(cardElement, activeVariant, visualData?.editor_prefs);
    return;
  }

  // ── Branche figure-geo ────────────────────────────────────────────────
  // On ne change que le seed : level, gridsize, cellsize, etc. viennent du config MD
  if (visualType === 'figure-geo') {
    const newSeed = `rnd${Math.random().toString(36).slice(2, 7)}`;
    if (activeVariant) {
      activeVariant.visualData.config = { ...activeVariant.visualData.config, seed: newSeed };
      await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
      const editorPanel = document.getElementById('visual-editor-panel');
      if (editorPanel?.classList.contains('open') && editorPanel.currentCard === cardElement) {
        const seedInput = editorPanel.querySelector('[name="seed"]');
        if (seedInput) seedInput.value = newSeed;
      }
    }
    return;
  }

  // ── Branche axe-gradué (logique existante) ────────────────────────────
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
    prefs = { ...prefs, ...markdownPrefs };
  }

  const currentConfig = visualData?.config || {};
  const newConfig = generateRandomConfigValues(prefs, currentConfig);

  if (activeVariant) {
    activeVariant.visualData.config = { ...activeVariant.visualData.config, ...newConfig };
    await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
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
 * Randomisation dédiée polygone-périmètre
 * - Conserve la forme et le niveau tels que définis dans l'éditeur
 * - Génère un nouveau seed
 * - Choisit une unité aléatoire
 */
async function quickRandomizePolygone(cardElement, activeVariant, markdownPrefs) {
  const editorPanel   = document.getElementById('visual-editor-panel');
  const editorOpen    = editorPanel?.classList.contains('open') && editorPanel.currentCard === cardElement;
  const visualData    = activeVariant?.visualData;
  const currentConfig = visualData?.config || {};

  // Lire la forme et le niveau depuis l'éditeur (si ouvert) ou la config courante
  let shape = currentConfig.shape ?? 'rect';
  let level = currentConfig.level ?? 1;
  if (editorOpen) {
    const editorBody = editorPanel.querySelector('.editor-body');
    const shapeInput = editorBody.querySelector('[name="shape"]');
    const levelInput = editorBody.querySelector('[name="level"]');
    if (shapeInput) shape = shapeInput.value;
    if (levelInput) level = parseInt(levelInput.value) || 1;
  }

  // Unité aléatoire
  const units = ['cm', 'm', 'dm', 'mm'];
  const unit  = units[Math.floor(Math.random() * units.length)];

  // Plage de valeurs depuis les prefs (markdown > défaut)
  let valueMin = 2, valueMax = 9;
  if (markdownPrefs?.valueRange) {
    valueMin = markdownPrefs.valueRange[0] ?? 2;
    valueMax = markdownPrefs.valueRange[1] ?? 9;
  }

  const newConfig = {
    ...currentConfig,
    seed:       polygoneRandomizeSeed(),
    shape,
    level,
    unit,
    valuerange: [valueMin, valueMax],
  };

  if (activeVariant) {
    activeVariant.visualData.config = newConfig;
    await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);

    if (editorOpen) {
      const editorBody = editorPanel.querySelector('.editor-body');
      const seedInput = editorBody.querySelector('[name="seed"]');
      const unitInput = editorBody.querySelector('[name="unit"]');
      if (seedInput) seedInput.value = newConfig.seed;
      if (unitInput) unitInput.value = newConfig.unit;
    }
  }
}

/**
 * Randomisation dédiée schéma additif
 */
async function quickRandomizeSchemaAdditif(cardElement, activeVariant, markdownPrefs) {
  const editorPanel   = document.getElementById('visual-editor-panel');
  const editorOpen    = editorPanel?.classList.contains('open') && editorPanel.currentCard === cardElement;
  const visualData    = activeVariant?.visualData;
  const currentConfig = visualData?.config || {};

  // ── Mode dynamique : le composant se régénère seul via TemplateEngine ──
  if (currentConfig.content) {
    // Re-créer l'élément suffit — Math.random() produit de nouvelles valeurs
    await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
    return;
  }

  // ── Mode statique : générer de nouvelles valeurs ────────────────────────
  let prefs = { totalMin: 20, totalMax: 99, totalStep: 10, ...(markdownPrefs || {}) };

  if (editorOpen) {
    const editorBody = editorPanel.querySelector('.editor-body');
    const get = (part) => parseInt(editorBody.querySelector(`.sa-range[data-part="${part}"]`)?.value);
    if (!isNaN(get('totalMin')))  prefs.totalMin  = get('totalMin');
    if (!isNaN(get('totalMax')))  prefs.totalMax  = get('totalMax');
    if (!isNaN(get('totalStep'))) prefs.totalStep = get('totalStep');
  }

  let level = currentConfig.level ?? 1;
  if (editorOpen) {
    const lvl = parseInt(editorPanel.querySelector('.editor-body [name="level"]')?.value);
    if (!isNaN(lvl)) level = lvl;
  }

  const newConfig = randomizeSchemaAdditif({ ...currentConfig, level }, prefs);

  if (activeVariant) {
    activeVariant.visualData.config = newConfig;
    await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);

    if (editorOpen) {
      const editorBody = editorPanel.querySelector('.editor-body');
      ['total', 'part1', 'unknown'].forEach(name => {
        const input = editorBody.querySelector(`[name="${name}"]`);
        if (input) input.value = newConfig[name] ?? '';
      });
      const p2 = editorBody.querySelector('[name="part2-display"]');
      if (p2) p2.value = newConfig.total - newConfig.part1;
    }
  }
}

/**
 * Randomisation dédiée cubes-numération
 */
async function quickRandomizeCubes(cardElement, activeVariant, markdownPrefs) {
  const editorPanel = document.getElementById('visual-editor-panel');
  const editorOpen  = editorPanel?.classList.contains('open') && editorPanel.currentCard === cardElement;
  const visualData  = activeVariant?.visualData;

  const prefs = { milliers: '0:1', centaines: '1:3', dizaines: '0:9', unites: '0:9',
                  ...(markdownPrefs || {}) };

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

  if (editorOpen) {
    const editorBody = editorPanel.querySelector('.editor-body');
    ['milliers', 'centaines', 'dizaines', 'unites'].forEach(name => {
      const input = editorBody.querySelector(`[name="${name}"]`);
      if (input) input.value = newConfig[name] ?? 0;
    });
  }
}

/**
 * Randomisation rapide de la variante active — appelé par double-clic bullet
 */
export async function quickRandomizeCard(cardElement) {
  await quickRandomize(cardElement);
}

/**
 * Thunder : variante aléatoire silencieuse (sans mise à jour des bullets ni du badge GS)
 * Réinitialise d'abord au config MD puis quickRandomize
 */
export async function thunderRandomize(cardElement) {
  const variants = Array.from(cardElement.querySelectorAll('.variant-content'));
  if (variants.length === 0) return;

  const randomIndex = Math.floor(Math.random() * variants.length);

  // Afficher la variante choisie sans toucher aux bullets ni aux badges GS
  variants.forEach((v, idx) => v.classList.toggle('active', idx === randomIndex));

  // Réinitialiser au config MD original avant de randomiser
  const variantContent = variants[randomIndex];
  if (variantContent?.originalVisualData) {
    variantContent.visualData = JSON.parse(JSON.stringify(variantContent.originalVisualData));
  }

  if (variantContent?.visualData) {
    await VisualsSystem.initCardVisuals(cardElement, variantContent.visualData);
  } else {
    clearCardVisuals(cardElement);
    return;
  }

  // Générer de nouvelles valeurs aléatoires
  await quickRandomize(cardElement);

  if (window.MathJax) window.MathJax.typesetPromise([cardElement]).catch(() => {});
}

// Export pour utilisation dans RapidoLayout
export default {
  initRapidosVisuals,
  handleVariantChange,
  openVisualEditor,
  quickRandomizeCard,
  thunderRandomize,
};
