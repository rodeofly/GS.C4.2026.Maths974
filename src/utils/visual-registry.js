
// ========================================
// VISUAL REGISTRY - Enregistrement avec Lazy Loading
// ========================================

import { registerVisual } from './visuals-system.js';

/**
 * Enregistrer tous les types de visuels disponibles
 * Chaque type pointe vers un module qui sera chargé à la demande
 */

// 1. AXE GRADUÉ
registerVisual('axe-gradue', () => import('./components/visuals/axe-gradue.js'));

// 2. REPÈRE CARTÉSIEN (à créer)
registerVisual('repere-cartesien', () => import('./components/visuals/repere-cartesien.js'));

// 3. TRIANGLE (à créer)
registerVisual('triangle', () => import('./components/visuals/triangle.js'));

// 4. FRACTION CERCLE (à créer)
registerVisual('fraction-cercle', () => import('./components/visuals/fraction-cercle.js'));

// 5. CUBES NUMÉRATION (à créer)
registerVisual('cubes-numeration', () => import('./components/visuals/cubes-numeration.js'));

/**
 * Fonction helper pour précharger certains visuels
 * Utile pour les types très fréquents
 */
export async function preloadCommonVisuals() {
  const common = ['axe-gradue', 'repere-cartesien'];

  const promises = common.map((type) => {
    return window.Math974Visuals.registry.get(type)?.loader().catch((err) => {
      console.warn(`Failed to preload ${type}:`, err);
    });
  });

  await Promise.allSettled(promises);
  console.log('✅ Common visuals preloaded');
}

/**
 * Obtenir la liste des visuels disponibles
 */
export function getAvailableVisuals() {
  return Array.from(window.Math974Visuals.registry.keys());
}

/**
 * Obtenir les métadonnées d'un type de visuel
 * (Pour l'UI de sélection dans l'éditeur)
 */
export const visualMetadata = {
  'axe-gradue': {
    label: 'Axe Gradué',
    description: 'Axe numérique horizontal ou vertical avec graduations',
    icon: '📏',
    category: 'Repérage',
    configFields: [
      { name: 'min', type: 'number', label: 'Minimum', default: 0 },
      { name: 'max', type: 'number', label: 'Maximum', default: 10 },
      { name: 'step', type: 'number', label: 'Pas', default: 1 },
      {
        name: 'orientation',
        type: 'select',
        label: 'Orientation',
        options: ['horizontal', 'vertical'],
        default: 'horizontal',
      },
      { name: 'width', type: 'number', label: 'Largeur (px)', default: 400 },
      { name: 'height', type: 'number', label: 'Hauteur (px)', default: 80 },
      { name: 'showNumbers', type: 'boolean', label: 'Afficher nombres', default: true },
      { name: 'showArrows', type: 'boolean', label: 'Afficher flèches', default: true },
      {
        name: 'points',
        type: 'array',
        label: 'Points marqués',
        itemFields: [
          { name: 'label', type: 'text', label: 'Label' },
          { name: 'value', type: 'number', label: 'Valeur' },
          { name: 'color', type: 'color', label: 'Couleur', default: '#f59e0b' },
        ],
      },
    ],
  },

  'repere-cartesien': {
    label: 'Repère Cartésien',
    description: 'Repère avec axes X et Y, grille optionnelle',
    icon: '📐',
    category: 'Repérage',
    configFields: [
      { name: 'xmin', type: 'number', label: 'X min', default: -10 },
      { name: 'xmax', type: 'number', label: 'X max', default: 10 },
      { name: 'ymin', type: 'number', label: 'Y min', default: -10 },
      { name: 'ymax', type: 'number', label: 'Y max', default: 10 },
      { name: 'xstep', type: 'number', label: 'Pas X', default: 1 },
      { name: 'ystep', type: 'number', label: 'Pas Y', default: 1 },
      { name: 'showGrid', type: 'boolean', label: 'Afficher grille', default: true },
      { name: 'width', type: 'number', label: 'Largeur (px)', default: 400 },
      { name: 'height', type: 'number', label: 'Hauteur (px)', default: 400 },
    ],
  },

  triangle: {
    label: 'Triangle',
    description: 'Triangle avec sommets, angles et mesures',
    icon: '🔺',
    category: 'Géométrie',
    configFields: [
      { name: 'A', type: 'point', label: 'Sommet A', default: { x: 0, y: 0 } },
      { name: 'B', type: 'point', label: 'Sommet B', default: { x: 100, y: 0 } },
      { name: 'C', type: 'point', label: 'Sommet C', default: { x: 50, y: 86 } },
      { name: 'showAngles', type: 'boolean', label: 'Afficher angles', default: true },
      { name: 'showLengths', type: 'boolean', label: 'Afficher longueurs', default: true },
      { name: 'fillColor', type: 'color', label: 'Couleur remplissage', default: '#ccfbf1' },
      { name: 'strokeColor', type: 'color', label: 'Couleur contour', default: '#0d9488' },
    ],
  },

  'fraction-cercle': {
    label: 'Fraction (Cercle)',
    description: 'Représentation circulaire de fractions',
    icon: '🥧',
    category: 'Nombres',
    configFields: [
      { name: 'numerator', type: 'number', label: 'Numérateur', default: 3 },
      { name: 'denominator', type: 'number', label: 'Dénominateur', default: 4 },
      { name: 'radius', type: 'number', label: 'Rayon (px)', default: 80 },
      { name: 'fillColor', type: 'color', label: 'Couleur parts', default: '#f59e0b' },
      { name: 'emptyColor', type: 'color', label: 'Couleur vide', default: '#f3f4f6' },
      { name: 'showLabel', type: 'boolean', label: 'Afficher fraction', default: true },
    ],
  },

  'cubes-numeration': {
    label: 'Cubes Numération',
    description: 'Représentation unités/dizaines/centaines/milliers',
    icon: '🧊',
    category: 'Nombres',
    configFields: [
      { name: 'milliers', type: 'number', label: 'Milliers', default: 0 },
      { name: 'centaines', type: 'number', label: 'Centaines', default: 0 },
      { name: 'dizaines', type: 'number', label: 'Dizaines', default: 0 },
      { name: 'unites', type: 'number', label: 'Unités', default: 0 },
      { name: 'cubeSize', type: 'number', label: 'Taille cube (px)', default: 20 },
      { name: 'spacing', type: 'number', label: 'Espacement', default: 5 },
      { name: 'showLabels', type: 'boolean', label: 'Afficher étiquettes', default: true },
    ],
  },
};

/**
 * Obtenir les champs de config pour un type
 */
export function getConfigFields(type) {
  return visualMetadata[type]?.configFields || [];
}

/**
 * Valeurs par défaut pour un type
 */
export function getDefaultConfig(type) {
  const fields = getConfigFields(type);
  const defaults = {};

  fields.forEach((field) => {
    defaults[field.name] = field.default;
  });

  return defaults;
}
