
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
registerVisual('schema-additif',    () => import('../visuals/schema-additif/schema-additif.js'));
registerVisual('angle-triangle',    () => import('../visuals/angle-triangle/angle-triangle.js'));
registerVisual('balance-equilibre',    () => import('../visuals/balance-equilibre/balance-equilibre.js'));
registerVisual('programme-scratch',    () => import('../visuals/programme-scratch/programme-scratch.js'));

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

  'schema-additif': {
    label: 'Schéma Additif',
    description: 'Bande de référence pour la modélisation additive (total = partie 1 + partie 2)',
    icon: '➕',
    category: 'Nombres',
    configFields: [
      { name: 'total',   type: 'number', label: 'Total',              default: 60 },
      { name: 'part1',   type: 'number', label: 'Partie gauche',      default: 20 },
      { name: 'unknown', type: 'select', label: 'Valeur inconnue',
        options: ['total', 'part1', 'part2'],                          default: 'part1' },
      { name: 'level',   type: 'number', label: 'Niveau (1–2)',       default: 1 },
      { name: 'unit',      type: 'text',   label: 'Unité',                 default: '' },
      { name: 'content',   type: 'text',   label: 'Énoncé (DSL)',          default: '' },
      { name: 'part1expr', type: 'text',   label: 'Partie 1 = (expr)',     default: '' },
      { name: 'totalexpr', type: 'text',   label: 'Total = (expr)',        default: '' },
      { name: 'labelt',    type: 'text',   label: 'Étiquette barre totale',default: '' },
      { name: 'label1',    type: 'text',   label: 'Étiquette barre gauche',default: '' },
      { name: 'label2',    type: 'text',   label: 'Étiquette barre droite',default: '' },
    ],
  },

  'angle-triangle': {
    label: 'Angle dans un triangle',
    description: 'Triangle avec angle(s) connu(s) et 1 angle inconnu (GS 19.3)',
    icon: '📐',
    category: 'Géométrie',
    configFields: [
      { name: 'seed', type: 'text',   label: 'Graine (mode aléatoire)', default: 'triangle' },
      { name: 'mode', type: 'select', label: 'Type de triangle',
        options: [
          { value: 'scalene',        label: 'Scalène' },
          { value: 'isoscele',       label: 'Isocèle' },
          { value: 'equilateral',    label: 'Équilatéral' },
          { value: 'scalene-rect',   label: 'Scalène rectangle' },
          { value: 'isoscele-rect',  label: 'Isocèle rectangle' },
        ],
        default: 'scalene' },
      { name: 'width',  type: 'number', label: 'Largeur (px)',  default: 220 },
      { name: 'height', type: 'number', label: 'Hauteur (px)', default: 160 },
    ],
  },

  'balance-equilibre': {
    label: 'Balance équilibrée',
    description: 'Balance Roberval avec équation algébrique — GS 28.3 / 29.2',
    icon: '⚖️',
    category: 'Algèbre',
    configFields: [
      { name: 'equation', type: 'text',   label: 'Équation (ex: 3x + 10 = 40)', default: '3x + 10 = 40' },
      { name: 'object',   type: 'select', label: 'Objet variable',
        options: [
          { value: '📦', label: '📦 Boîte' },
          { value: '🥫', label: '🥫 Conserve' },
          { value: '🍅', label: '🍅 Tomate' },
          { value: '🎁', label: '🎁 Cadeau' },
          { value: '⭐', label: '⭐ Étoile' },
          { value: '🔮', label: '🔮 Boule' },
          { value: '🧱', label: '🧱 Brique' },
          { value: 'letter', label: 'Lettre (abstrait)' },
        ],
        default: '📦' },
      { name: 'level',  type: 'select', label: "Niveau d'abstraction",
        options: [
          { value: '1', label: 'Niveau 1 — Emoji' },
          { value: '2', label: 'Niveau 2 — Boîte + lettre' },
          { value: '3', label: 'Niveau 3 — Texte équation' },
        ],
        default: '1' },
      { name: 'width',  type: 'number', label: 'Largeur (px)',  default: 260 },
      { name: 'height', type: 'number', label: 'Hauteur (px)', default: 160 },
    ],
  },

  'programme-scratch': {
    label: 'Programme Scratch',
    description: 'Programme de calcul style Scratch — GS 25.2 / 25.3',
    icon: '🧩',
    category: 'Algorithmique',
    configFields: [
      { name: 'programme', type: 'textarea', label: 'Programme (DSL)',
        default: 'résultat = réponse\nrépéter 3:\n  résultat = résultat + 2\ndire résultat' },
      { name: 'input',  type: 'number', label: 'Nombre de départ', default: 5 },
      { name: 'height', type: 'number', label: 'Hauteur max (px)', default: 220 },
    ],
    prefsFields: [
      { name: 'inputRange',  type: 'range',      label: 'Nombre de départ',  default: [2, 20] },
      { name: 'opsRange',    type: 'range',      label: "Nb d'opérations (sans boucle)", default: [1, 3] },
      { name: 'ops',         type: 'multicheck', label: 'Opérations autorisées',
        options: ['+', '-', '×', '÷'],           default: ['+', '-', '×', '÷'] },
      { name: 'loop',        type: 'select',     label: 'Boucle',            default: 'null',
        options: [
          { value: 'null',  label: 'Aléatoire (oui ou non)' },
          { value: 'true',  label: 'Toujours' },
          { value: 'false', label: 'Jamais' },
        ]},
      { name: 'iterRange',   type: 'range',      label: "Nb d'itérations (si boucle)", default: [2, 5] },
      { name: 'valRange',    type: 'range',      label: 'Valeurs opérandes', default: [1, 10] },
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
 * Obtenir les champs de préférences randomiseur pour un type
 */
export function getPrefsFields(type) {
  return visualMetadata[type]?.prefsFields || [];
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
