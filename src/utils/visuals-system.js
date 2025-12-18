
// ========================================
// RAPIDOS VISUELS - Web Components System
// Registre et Loader avec Code Splitting
// ========================================

/**
 * Registre global des types de visuels disponibles
 * Format: { type: { loader: () => import(...), component: null } }
 */
window.Math974Visuals = {
  registry: new Map(),
  loaded: new Set(),
};

/**
 * Enregistrer un type de visuel avec lazy loading
 * @param {string} type - Nom du type (ex: 'axe-gradue')
 * @param {Function} loader - Fonction qui retourne import() du module
 */
export function registerVisual(type, loader) {
  window.Math974Visuals.registry.set(type, {
    loader,
    component: null,
  });
}

/**
 * Charger un type de visuel (code splitting)
 * @param {string} type - Nom du type
 * @returns {Promise<CustomElementConstructor>}
 */
export async function loadVisual(type) {
  if (!window.Math974Visuals.registry.has(type)) {
    throw new Error(`Visual type "${type}" not registered`);
  }

  const entry = window.Math974Visuals.registry.get(type);

  // Si déjà chargé, retourner le component
  if (entry.component) {
    return entry.component;
  }

  // Charger dynamiquement le module
  try {
    const module = await entry.loader();
    entry.component = module.default || module[type];
    window.Math974Visuals.loaded.add(type);
    return entry.component;
  } catch (error) {
    console.error(`Failed to load visual "${type}":`, error);
    throw error;
  }
}

/**
 * Vérifier si un type est chargé
 * @param {string} type
 * @returns {boolean}
 */
export function isVisualLoaded(type) {
  return window.Math974Visuals.loaded.has(type);
}

/**
 * Parser la config YAML d'un visuel
 * @param {Object} visualData - Données du frontmatter
 * @returns {Object} Config normalisée
 */
export function parseVisualConfig(visualData) {
  if (!visualData) return null;

  return {
    type: visualData.type,
    position: visualData.position || 'north',
    config: visualData.config || {},
    editable: visualData.editable !== false, // true par défaut
    opacity: visualData.opacity || (visualData.position === 'back' ? 0.15 : 1),
    hidden: visualData.hidden || false,
  };
}

/**
 * Créer et insérer un Web Component dans le DOM
 * @param {string} type - Type de visuel
 * @param {Object} config - Configuration
 * @param {HTMLElement} container - Conteneur parent
 * @returns {Promise<HTMLElement>}
 */
export async function createVisualElement(type, config, container) {
  // Charger le component si nécessaire
  await loadVisual(type);

  // Créer l'élément custom
  const tagName = `math974-${type}`;
  const element = document.createElement(tagName);

  // Appliquer la config via attributs
  Object.entries(config).forEach(([key, value]) => {
    if (typeof value === 'object') {
      element.setAttribute(key, JSON.stringify(value));
    } else {
      element.setAttribute(key, value);
    }
  });

  // Wrapper pour styling
  const wrapper = document.createElement('div');
  wrapper.className = 'visual-wrapper';
  wrapper.appendChild(element);

  // Insérer dans le container
  if (container) {
    container.innerHTML = '';
    container.appendChild(wrapper);
  }

  return element;
}

/**
 * Initialiser tous les visuels d'une carte question
 * @param {HTMLElement} cardElement - Élément .q-card
 * @param {Object} visualData - Données visual du YAML
 */
// src/utils/visuals-system.js

// src/utils/visuals-system.js

// src/utils/visuals-system.js

export async function initCardVisuals(cardElement, visualData) {
  // 🛠️ FIX : Nettoyage systématique des zones existantes
  const oldZones = cardElement.querySelectorAll(
    '.q-card-north, .q-card-south, .q-card-east, .q-card-west, .q-card-front, .q-card-back'
  );
  oldZones.forEach(zone => zone.remove());

  if (!visualData || !visualData.type) return;

  const config = parseVisualConfig(visualData);
  if (config.hidden) return;

  const positionClass = `q-card-${config.position}`;
  const container = document.createElement('div');
  container.className = positionClass;

  // Placement intelligent dans le DOM pour la Grid
  if (config.position === 'north') {
    cardElement.prepend(container);
  } else {
    cardElement.appendChild(container);
  }

  container.style.opacity = config.opacity;

  try {
    const element = await createVisualElement(config.type, config.config, container);
    element.visualConfig = config;
    return element;
  } catch (error) {
    console.error('Failed to init visual:', error);
  }
}

/**
 * Toggle visibilité d'un visuel
 * @param {HTMLElement} cardElement
 * @param {boolean} visible
 */
export function toggleVisual(cardElement, visible) {
  const visualZones = cardElement.querySelectorAll(
    '.q-card-north, .q-card-south, .q-card-east, .q-card-west, .q-card-front, .q-card-back'
  );

  visualZones.forEach((zone) => {
    if (visible) {
      zone.classList.remove('visual-hidden');
    } else {
      zone.classList.add('visual-hidden');
    }
  });

  // Sauvegarder l'état en localStorage
  const cardId = cardElement.id;
  if (cardId) {
    localStorage.setItem(`visual-state-${cardId}`, visible ? 'visible' : 'hidden');
  }
}

/**
 * Restaurer l'état des visuels depuis localStorage
 * @param {HTMLElement} cardElement
 */
export function restoreVisualState(cardElement) {
  const cardId = cardElement.id;
  if (!cardId) return;

  const state = localStorage.getItem(`visual-state-${cardId}`);
  if (state === 'hidden') {
    toggleVisual(cardElement, false);
  }
}

// ========================================
// EXPORT DU SYSTÈME
// ========================================

export default {
  registerVisual,
  loadVisual,
  isVisualLoaded,
  parseVisualConfig,
  createVisualElement,
  initCardVisuals,
  toggleVisual,
  restoreVisualState,
};
