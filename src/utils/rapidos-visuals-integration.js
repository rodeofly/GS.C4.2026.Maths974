
// ========================================
// RAPIDOS VISUELS - Intégration RapidoLayout
// Script à inclure dans RapidoLayout.astro
// ========================================

import VisualsSystem from './visuals-system.js';
import './visual-registry.js'; // Charge le registre
import { visualMetadata, getConfigFields, getPrefsFields } from './visual-registry.js';
import { renderEditor as renderAxeGradueEditor } from '../visuals/axe-gradue/editor.js';
import { renderEditor as renderCubesNumerationEditor } from '../visuals/cubes-numeration/editor.js';
import { renderEditor as renderPolygonePerimetreEditor } from '../visuals/polygone-perimetre/editor.js';
import { renderEditor as renderSchemaAdditifEditor } from '../visuals/schema-additif/editor.js';

/**
 * Ajouter les boutons d'action dans .bullets-nav (👁 solution, ⚙ éditeur, ⟳ reload, ⚡ thunder)
 * @param {HTMLElement} cardElement
 * @param {object}  [options]
 * @param {boolean} [options.showEditor] - afficher le bouton éditeur ⚙ (défaut : true)
 */
export function addVisualToggleButton(cardElement, options = {}) {
  const { showEditor = true } = options;
  const nav = cardElement.querySelector('.bullets-nav');
  if (!nav) return;

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'visual-toggle-btn mini-eye btn-eye-solution';
  toggleBtn.title = "Afficher / masquer la réponse";
  toggleBtn.style.display = 'none';
  toggleBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const display = cardElement.querySelector('.q-solution-display');
    if (!display) return;
    const visible = display.classList.toggle('visible');
    toggleBtn.classList.toggle('active', visible);
  });

  nav.appendChild(toggleBtn);

  // Bouton Paramètres (Engrenage) — uniquement en mode éditeur (prof)
  if (showEditor) {
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
  }

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
    updateReponseZone(cardElement);
    updateSolutionZone(cardElement);
    return;
  }

  // Retour au config MD original si demandé (comportement par défaut sur clic bullet)
  if (resetToOriginal && variantContent.originalVisualData) {
    variantContent.visualData = JSON.parse(JSON.stringify(variantContent.originalVisualData));
  }

  await VisualsSystem.initCardVisuals(cardElement, variantContent.visualData);
  updateReponseZone(cardElement);
  updateSolutionZone(cardElement);

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
    '.q-card-north, .q-card-south, .q-card-east, .q-card-west, .q-card-front, .q-card-back, .q-content-visual, .sa-content-wrapper'
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
 * Génère le YAML d'un visualData (nouvelle structure plate)
 * avec l'indentation attendue dans les fichiers .md (8 espaces)
 */
function generateVisualYAML(visualData) {
  const I = '        '; // 8 espaces (niveau variante dans le frontmatter)
  const lines = [];
  lines.push(`${I}type: ${visualData.type}`);

  const config = visualData.config || {};
  if (Object.keys(config).length > 0) {
    lines.push(`${I}config:`);
    for (const [k, v] of Object.entries(config)) {
      if (v === '' || v === null || v === undefined) continue;
      lines.push(`${I}  ${k}: ${toYAMLValue(v)}`);
    }
  }

  const rand = visualData.rand;
  if (rand && Object.keys(rand).length > 0) {
    lines.push(`${I}rand:`);
    for (const [k, v] of Object.entries(rand)) {
      lines.push(`${I}  ${k}: ${toYAMLValue(v)}`);
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
    const markdownPrefs = visualData.rand;
    const prefs = { milliers: '0:1', centaines: '1:3', dizaines: '0:9', unites: '0:9',
                    ...(markdownPrefs || {}) };
    editorBody.insertAdjacentHTML('beforeend', renderCubesNumerationEditor(panel, visualData, prefs));

  } else if (visualType === 'polygone-perimetre') {
    const markdownPrefs = visualData.rand;
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
    const markdownPrefs = visualData.rand;
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

  // Champs de config
  const configFields = getConfigFields(visualType);
  const currentConfig = visualData.config || {};
  configFields.forEach((field) => {
    const fieldValue = currentConfig[field.name] ?? field.default;
    html += generateFieldHTML(field, fieldValue);
  });

  // Section Randomiseur (prefsFields)
  const prefsFields = getPrefsFields(visualType);
  if (prefsFields.length) {
    const currentPrefs = visualData.rand || {};
    html += `<div class="editor-section-title" style="grid-column:1/-1;margin:10px 0 4px;
      font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;
      border-top:1px solid #e2e8f0;padding-top:10px;letter-spacing:.05em;">
      ⚡ Randomiseur
    </div>`;
    prefsFields.forEach((field) => {
      // loop : normaliser en string pour le select
      let raw = currentPrefs[field.name] ?? field.default;
      if (field.name === 'loop') raw = raw === null ? 'null' : String(raw);
      html += generateFieldHTML(field, raw);
    });
  }

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
            .map((opt) => {
              const v = typeof opt === 'object' ? opt.value : opt;
              const l = typeof opt === 'object' ? opt.label : opt;
              return `<option value="${v}" ${v === value ? 'selected' : ''}>${l}</option>`;
            })
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

    case 'range': {
      const v0 = Array.isArray(value) ? value[0] : (field.default?.[0] ?? 0);
      const v1 = Array.isArray(value) ? value[1] : (field.default?.[1] ?? 10);
      inputHTML = `
        <div style="display:flex;align-items:center;gap:6px;">
          <input type="number" step="1" name="${field.name}_0" value="${v0}"
            style="width:60px;padding:3px 6px;border:1px solid #cbd5e1;border-radius:4px;text-align:center;" />
          <span style="color:#64748b">—</span>
          <input type="number" step="1" name="${field.name}_1" value="${v1}"
            style="width:60px;padding:3px 6px;border:1px solid #cbd5e1;border-radius:4px;text-align:center;" />
        </div>`;
      break;
    }

    case 'multicheck': {
      const checked = Array.isArray(value) ? value : (field.default || []);
      inputHTML = `
        <div data-field="${field.name}" style="display:flex;gap:10px;flex-wrap:wrap;padding:4px 0;">
          ${(field.options || []).map(opt => `
            <label style="display:flex;align-items:center;gap:4px;font-weight:600;font-size:13px;cursor:pointer;">
              <input type="checkbox" class="prefs-multicheck" data-field="${field.name}" value="${opt}"
                ${checked.includes(opt) ? 'checked' : ''}
                style="width:14px;height:14px;cursor:pointer;" />
              ${opt}
            </label>`).join('')}
        </div>`;
      break;
    }

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
    const isVertical = ['east', 'west'].includes(posInput.value);
    newConfig.orientation = isVertical ? 'vertical' : 'horizontal';
  }

  // ── Lire les prefsFields → rand ──────────────────────────────────
  const prefsFields = getPrefsFields(visualType);
  if (prefsFields.length) {
    const newPrefs = { ...(activeVariant?.visualData?.rand || {}) };
    prefsFields.forEach((field) => {
      if (field.type === 'range') {
        const i0 = editorBody.querySelector(`[name="${field.name}_0"]`);
        const i1 = editorBody.querySelector(`[name="${field.name}_1"]`);
        if (i0 && i1) newPrefs[field.name] = [parseFloat(i0.value), parseFloat(i1.value)];
      } else if (field.type === 'multicheck') {
        const boxes = editorBody.querySelectorAll(`.prefs-multicheck[data-field="${field.name}"]:checked`);
        newPrefs[field.name] = Array.from(boxes).map(b => b.value);
      } else if (field.name === 'loop') {
        const sel = editorBody.querySelector(`[name="loop"]`);
        if (sel) newPrefs.loop = sel.value === 'null' ? null : sel.value === 'true';
      } else {
        const inp = editorBody.querySelector(`[name="${field.name}"]`);
        if (inp) newPrefs[field.name] = field.type === 'number' ? parseFloat(inp.value) : inp.value;
      }
    });
    if (activeVariant) activeVariant.visualData.rand = newPrefs;
  }

  // Mettre à jour le visuel
  if (activeVariant) {
    if (typeof newConfig.points === 'string') try { newConfig.points = JSON.parse(newConfig.points); } catch(e) {}
    activeVariant.visualData.config = newConfig;
    await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
  }
}

/**
 * Dispatch uniform : chaque visuel exporte randomize(config, rand, originalConfig) → newConfig
 */
async function quickRandomize(cardElement) {
  const activeVariant = cardElement.querySelector('.variant-content.active');
  if (!activeVariant?.visualData) return;
  const { type, config, rand } = activeVariant.visualData;
  const originalConfig = activeVariant.originalVisualData?.config ?? config;
  const module = await import(`../visuals/${type}/${type}.js`);
  if (!module.randomize) return;
  const newConfig = await module.randomize(config || {}, rand || {}, originalConfig || {});
  activeVariant.visualData.config = newConfig;
  await VisualsSystem.initCardVisuals(cardElement, activeVariant.visualData);
  syncEditorFields(cardElement, newConfig);
}

function syncEditorFields(cardElement, config) {
  const panel = document.getElementById('visual-editor-panel');
  if (!panel?.classList.contains('open') || panel.currentCard !== cardElement) return;
  Object.entries(config).forEach(([key, val]) => {
    const input = panel.querySelector(`[name="${key}"]`);
    if (input) input.value = val;
  });
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

// ========================================
// ZONE RÉPONSE (saisie + validation)
// ========================================

function normalizeAnswer(s) {
  return s.trim().replace(',', '.').toLowerCase().replace(/\s+/g, '');
}

function checkAnswer(user, expected) {
  const u = normalizeAnswer(user);
  const e = normalizeAnswer(expected);
  const uNum = parseFloat(u);
  const eNum = parseFloat(e);
  if (!isNaN(uNum) && !isNaN(eNum) && u !== '' && e !== '') {
    return Math.abs(uNum - eNum) < 0.001;
  }
  return u === e;
}

export function updateReponseZone(cardElement) {
  const zone = cardElement.querySelector('.q-reponse-zone');
  if (!zone) return;
  const activeVariant = cardElement.querySelector('.variant-content.active');
  const reponse = activeVariant?.dataset.reponse ?? '';
  zone.classList.toggle('visible', reponse !== '');
  const input = zone.querySelector('.reponse-input');
  const feedback = zone.querySelector('.reponse-feedback');
  if (input) { input.value = ''; input.classList.remove('correct', 'incorrect'); }
  if (feedback) { feedback.className = 'reponse-feedback'; feedback.textContent = ''; }
}

export function addReponseZone(cardElement, question) {
  const hasReponse = question.variantes.some(v => v.reponse);
  if (!hasReponse) return;

  const contentEl = cardElement.querySelector('.q-card-content');
  if (!contentEl) return;

  const zone = document.createElement('div');
  zone.className = 'q-reponse-zone';
  zone.innerHTML = `
    <div class="reponse-row">
      <input type="text" class="reponse-input" placeholder="Réponse…" autocomplete="off" />
      <button class="reponse-btn" title="Valider">✓</button>
    </div>
    <div class="reponse-feedback"></div>
  `;
  contentEl.appendChild(zone);

  const input = zone.querySelector('.reponse-input');
  const btn = zone.querySelector('.reponse-btn');
  const feedback = zone.querySelector('.reponse-feedback');

  const validate = () => {
    const activeVariant = cardElement.querySelector('.variant-content.active');
    const expected = activeVariant?.dataset.reponse ?? '';
    if (!expected) return;
    const correct = checkAnswer(input.value, expected);
    if (correct) {
      input.classList.add('correct'); input.classList.remove('incorrect');
      feedback.className = 'reponse-feedback correct';
      feedback.textContent = '✓ Correct !';
    } else {
      input.classList.add('incorrect'); input.classList.remove('correct');
      feedback.className = 'reponse-feedback incorrect';
      feedback.textContent = `✗  Réponse : ${expected}`;
    }
  };

  btn.addEventListener('click', validate);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { validate(); return; }
    input.classList.remove('correct', 'incorrect');
    feedback.className = 'reponse-feedback';
    feedback.textContent = '';
  });

  updateReponseZone(cardElement);
}

// ========================================
// ZONE SOLUTION
// ========================================

export function updateSolutionZone(cardElement) {
  const display = cardElement.querySelector('.q-solution-display');
  const eyeBtn = cardElement.querySelector('.btn-eye-solution');
  const activeVariant = cardElement.querySelector('.variant-content.active');
  const reponse = activeVariant?.dataset.reponse ?? '';

  if (display) {
    display.textContent = reponse ? `Réponse : ${reponse}` : '';
    display.classList.remove('visible');
  }
  if (eyeBtn) {
    eyeBtn.style.display = reponse ? '' : 'none';
    eyeBtn.classList.remove('active');
  }
}

export function addSolutionZone(cardElement, question) {
  const hasReponse = question.variantes.some(v => v.reponse);
  if (!hasReponse) return;

  const contentEl = cardElement.querySelector('.q-card-content');
  if (!contentEl) return;

  const display = document.createElement('div');
  display.className = 'q-solution-display';
  contentEl.appendChild(display);

  updateSolutionZone(cardElement);
}

// Export par défaut (rétro-compatibilité)
export default {
  handleVariantChange,
  openVisualEditor,
  quickRandomizeCard,
  thunderRandomize,
};
