
// ========================================
// VISUAL REGISTRY - Enregistrement avec Lazy Loading
// ========================================

import { registerVisual } from './visuals-system.js';
import { metadata as axeGradueMetadata } from '../visuals/axe-gradue/config.js';

/**
 * Enregistrer tous les types de visuels disponibles
 * Chaque type pointe vers un module qui sera chargé à la demande
 */

// 1. AXE GRADUÉ
registerVisual('axe-gradue', () => import('../visuals/axe-gradue/axe-gradue.js'));
registerVisual('texte-trous', () => import('../visuals/texte-trous/texte-trous.js'));
registerVisual('cubes-numeration', () => import('../visuals/cubes-numeration/cubes-numeration.js'));
registerVisual('figure-geo', () => import('../visuals/figure-geo/figure-geo.js'));
registerVisual('polygone-perimetre', () => import('../visuals/polygone-perimetre/polygone-perimetre.js'));

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
  'axe-gradue': axeGradueMetadata,

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

  'polygone-perimetre': {
    label: 'Polygone Périmètre',
    description: 'Polygone étiqueté pour le calcul de périmètre (main levée)',
    icon: '📐',
    category: 'Géométrie',
    configFields: [
      { name: 'seed',       type: 'text',   label: 'Graine',        default: 'poly' },
      { name: 'shape',      type: 'select', label: 'Forme',         default: 'rect',
        options: ['rect','carre','losange','kite','quad','L','escalier','tri_rect','tri_iso','random'] },
      { name: 'unit',       type: 'select', label: 'Unité',         default: 'cm',
        options: ['cm','m','dm','mm'] },
      { name: 'level',      type: 'number', label: 'Niveau (1–3)',  default: 1 },
      { name: 'showmetrics',type: 'boolean',label: 'Afficher P=',   default: false },
      { name: 'color',      type: 'color',  label: 'Couleur',       default: '#1d4ed8' },
    ],
  },

  'figure-geo': {
    label: 'Figure Géométrique',
    description: 'Figure rectilinéaire sur quadrillage (périmètre & aire)',
    icon: '📐',
    category: 'Géométrie',
    configFields: [
      { name: 'seed',        type: 'text',    label: 'Graine',      default: 'fig' },
      { name: 'level',       type: 'number',  label: 'Niveau (1/2)', default: 1 },
      { name: 'gridsize',    type: 'number',  label: 'Grille N×N',  default: 7 },
      { name: 'cellsize',    type: 'number',  label: 'Case (px)',   default: 16 },
      { name: 'mincells',    type: 'number',  label: 'Cases min',   default: 6 },
      { name: 'maxcells',    type: 'number',  label: 'Cases max',   default: 16 },
      { name: 'showgrid',    type: 'boolean', label: 'Grille',      default: true },
      { name: 'showmetrics', type: 'boolean', label: 'Métriques',   default: false },
      { name: 'color',       type: 'color',   label: 'Couleur',     default: '#1d4ed8' },
    ],
  },

  'texte-trous': {
    label: 'Texte à Trous',
    description: 'Texte avec variables aléatoires et trous calculés',
    icon: '📝',
    category: 'Algèbre',
    configFields: [
      { name: 'content', type: 'textarea', label: 'Modèle (Markdown)', default: 'Soit [a:2..10] et [b:2..10].\nCalculer $ [a] \\times [b] $. \n\nRéponse : [?a*b]' },
      { name: 'mode', type: 'select', label: 'Mode', options: ['web', 'print'], default: 'web' },
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
