# RAPIDOS — Composants Visuels

Documentation des composants visuels intégrés dans les Rapidos.  
Dernière mise à jour : 2026-04-17

---

## 🏗️ Architecture Générale

Chaque question d'un Rapido peut avoir un visuel attaché à une ou plusieurs de ses variantes.

### Déclaration dans le YAML

```yaml
questions:
  - variantes:
      - texte: "Quel est le périmètre de cette figure ?"
        gs: "GS 10.2"
        visual:
          type: "figure-geo"          # identifiant du composant
          position: "west"            # zone d'affichage dans la carte
          config:                     # config passée au Web Component
            seed: "6e-r1-q3-v1"
            level: 1
          editor_prefs:               # contraintes du randomiseur (optionnel)
            level: 1
            gridsize: 7
```

### Zones disponibles (`position`)

```
┌─────────────────────────────┐
│         north               │
├────────┬────────┬───────────┤
│  west  │ texte  │   east    │
├────────┴────────┴───────────┤
│         south               │
└─────────────────────────────┘
```

| Position | Usage typique |
|----------|---------------|
| `north`  | Axe gradué, cubes de numération, texte à trous — en haut de la carte |
| `west`   | Figure géométrique — à gauche du texte |
| `east`   | Futur usage |
| `south`  | Futur usage |
| `front`  | Overlay au-dessus du contenu (opacité 0.85) |
| `back`   | Fond derrière le contenu (opacité 0.15) |

### Fonctionnement

Le système insère le Web Component dans la zone correspondante après que la carte est rendue. La classe CSS `has-visual-west` / `has-visual-east` est ajoutée sur `.q-card` pour activer la grille 3 colonnes.

---

## 📦 Cubes de Numération

**Fichier :** `src/components/visuals.bin/cubes-numeration.js`  
**Tag HTML :** `<math974-cubes-numeration>`  
**Position recommandée :** `north`

Représentation isométrique du matériel de numération base 10 :
- Millier = grand cube 3D
- Centaine = plaque plate 10×10
- Dizaine = barreau de 10
- Unité = petit cube

### Attributs / Config

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `milliers` | number | `0` | Nb de cubes milliers (0–9) |
| `centaines` | number | `0` | Nb de plaques centaines (0–9) |
| `dizaines` | number | `0` | Nb de barreaux dizaines (0–9) |
| `unites` | number | `0` | Nb de petits cubes unités (0–9) |
| `showLabels` | boolean | `false` | Afficher les étiquettes "1000 / 100 / 10 / 1" |

> Au-delà de 5 éléments par dénomination, un retour à la ligne automatique est appliqué.

### Exemple YAML

```yaml
visual:
  type: "cubes-numeration"
  position: "north"
  config:
    milliers: 2
    centaines: 1
    dizaines: 4
    unites: 2
  editor_prefs:
    milliers: "1:9"     # plage aléatoire "min:max"
    centaines: "0:9"
    dizaines: "0:9"
    unites: "0:9"
```

### `editor_prefs` — Randomiseur

Chaque champ accepte une plage `"min:max"` (string). À chaque clic sur 🎲, le randomiseur tire un nouveau nombre dans chaque plage.

```yaml
editor_prefs:
  milliers: "0:0"    # Désactive les milliers (toujours 0)
  centaines: "1:5"   # Forcer au moins 1 centaine
  dizaines: "0:9"
  unites: "0:9"
```

---

## 📏 Axe Gradué

**Fichier :** `src/components/visuals.bin/axe-gradue.js`  
**Tag HTML :** `<math974-axe-gradue>`  
**Position recommandée :** `north`

Axe numérique sur Canvas (Retina ×2). Supporte les modes décimal, fraction, et nombre mixte. Peut être horizontal ou vertical.

### Attributs / Config

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `min` | number | `0` | Valeur de départ |
| `max` | number | `10` | Valeur de fin |
| `step` | number | `1` | Pas de graduation |
| `width` | number | `800` | Largeur interne du canvas (px) |
| `height` | number | `100` | Hauteur interne du canvas (px) |
| `orientation` | string | `"horizontal"` | `"horizontal"` ou `"vertical"` |
| `visibleLabels` | array JSON | `null` | Liste des valeurs affichées en chiffres. `null` = toutes |
| `points` | array JSON | `[]` | Points à marquer sur l'axe |
| `mode` | string | `"decimal"` | `"decimal"`, `"fraction"`, `"mixed"` |
| `denominators` | array JSON | `[2,4,5,10]` | Dénominateurs autorisés (modes fraction/mixte) |
| `labelFrequency` | number | `1` | Afficher 1 graduation sur N |
| `showNumbers` | boolean | `true` | Afficher ou masquer tous les labels |

#### Format `points`
```json
[
  { "label": "?", "value": 10, "color": "#dc2626" },
  { "label": "A", "value": 4,  "color": "#0f766e" }
]
```
`label: "?"` = trou à compléter (flèche rouge). Autre label = point nommé.

### Exemple YAML — Axe simple avec trou

```yaml
visual:
  type: "axe-gradue"
  position: "north"
  config:
    min: 0
    max: 12
    step: 2
    visibleLabels: [0, 4]
    points:
      - label: "?"
        value: 10
        color: "#dc2626"
  editor_prefs:
    minRange: [0, 10]       # Plage pour le min aléatoire
    countRange: [5, 8]      # Nb de graduations (max = min + count*step)
    steps: [1, 2, 5]        # Pas possibles
    visibleRange: [2, 2]    # Toujours 2 labels visibles
    pointsRange: [1, 1]     # Toujours 1 point
    snap: true              # Points snappés sur les graduations
```

### Exemple YAML — Axe avec fractions

```yaml
visual:
  type: "axe-gradue"
  position: "north"
  config:
    min: 0
    max: 2
    step: 0.25
    mode: "fraction"
    denominators: [4]
    visibleLabels: [0, 1]
    points:
      - label: "?"
        value: 0.75
        color: "#dc2626"
```

### `editor_prefs` — Randomiseur

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `minRange` | [min, max] | `[-10, 0]` | Plage pour la valeur de départ |
| `countRange` | [min, max] | `[5, 10]` | Nb de graduations |
| `steps` | number[] | `[1]` | Pas possibles (tirage aléatoire) |
| `visibleRange` | [min, max] | `[2, 4]` | Nb de labels visibles |
| `pointsRange` | [min, max] | `[2, 3]` | Nb de points |
| `snap` | boolean | `true` | Points sur les graduations exactes |

> Si `editor_prefs` est présent dans le YAML, il a la **priorité absolue** sur les préférences stockées en localStorage.

---

## 🔲 Figure Géométrique (Périmètre)

**Fichier :** `src/components/visuals.bin/` *(vérifier nom exact)*  
**Tag HTML :** `<math974-figure-geo>`  
**Position recommandée :** `west`

Génère une figure rectilinéaire sur quadrillage à partir d'une graine déterministe (PRNG LCG). Le périmètre et l'aire sont calculés automatiquement.

### Attributs / Config

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `seed` | string | `"fig"` | Graine déterministe — même seed = même figure |
| `level` | number | `1` | `1` = rectangle pur, `2` = polygone rectilinéaire (L, T, etc.) |
| `gridsize` | number | `8` | Taille de la grille N×N |
| `cellsize` | number | `18` | Taille d'une case en px |
| `mincells` | number | `4` | Nombre min de cases |
| `maxcells` | number | `16` | Nombre max de cases |
| `showgrid` | boolean | `true` | Afficher la grille de fond |
| `showmetrics` | boolean | `false` | Afficher P et A sous la figure (mode prof) |
| `color` | string | `"#1d4ed8"` | Couleur de remplissage et contour |

> Le périmètre et l'aire sont toujours accessibles via `element.dataset.perimeter` et `element.dataset.area` après rendu.

### Exemple YAML — Variantes avec graines fixes

```yaml
questions:
  - variantes:
      - texte: "Quel est le périmètre de cette figure ?"
        gs: "GS 10.2"
        visual:
          type: "figure-geo"
          position: "west"
          config:
            seed: "6e-r1-q3-v1"    # graine fixe → figure reproductible
            level: 1
            gridsize: 7
            cellsize: 16
            mincells: 6
            maxcells: 16
            showgrid: true
            showmetrics: false
          editor_prefs:
            level: 1
            gridsize: 7
            cellsize: 16
            mincells: 6
            maxcells: 16

      - texte: "Quel est le périmètre de cette figure ?"
        gs: "GS 10.2"
        visual:
          type: "figure-geo"
          position: "west"
          config:
            seed: "6e-r1-q3-v2"    # graine différente → figure différente
            level: 1
            gridsize: 7
            cellsize: 16
            mincells: 6
            maxcells: 16
            showgrid: true
            showmetrics: false
```

### Convention de nommage des graines

```
{niveau}-r{numero_rapido}-q{question}-v{variante}
Exemple : "6e-r1-q3-v1"
```

Cette convention garantit l'unicité des figures à travers tous les Rapidos.

### `editor_prefs` — Randomiseur

À chaque clic 🎲, le randomiseur génère une nouvelle seed aléatoire `rndXXXXX` en respectant les contraintes de `editor_prefs`.

| Champ | Type | Description |
|-------|------|-------------|
| `level` | number | Niveau de complexité (1 ou 2) |
| `gridsize` | number | Grille imposée |
| `cellsize` | number | Taille des cases |
| `mincells` | number | Nombre min de cases |
| `maxcells` | number | Nombre max de cases |

### Level 1 vs Level 2

| Level | Forme | Périmètre | Usage |
|-------|-------|-----------|-------|
| `1` | Rectangle W×H | `2(W+H)` cases | 6e — début de cycle |
| `2` | Polygone rectilinéaire (L, T, escalier…) | Variable | 6e — fin de cycle / 5e |

---

## 🔷 Polygone Périmètre

**Fichier :** `src/components/visuals.bin/` *(vérifier nom exact)*  
**Tag HTML :** `<math974-polygone-perimetre>`  
**Position recommandée :** `west`

Polygone étiqueté avec tracé "main levée" (courbes de Bézier + léger offset). Les côtés portent leurs mesures, avec des marques d'égalité (tirets perpendiculaires) et des symboles d'angle droit. Le niveau contrôle quels côtés sont masqués (côtés déductibles par contrainte géométrique).

### Formes disponibles (`shape`)

| Valeur | Forme | Côtés | Particularités |
|--------|-------|-------|----------------|
| `rect` | Rectangle | 4 | Angles droits, côtés opposés égaux (marques) |
| `carre` | Carré | 4 | Angles droits, 1 seule valeur |
| `losange` | Losange | 4 | Tous côtés égaux, 1 seule valeur |
| `kite` | Cerf-volant | 4 | 2 paires de côtés adjacents égaux |
| `quad` | Quadrilatère | 4 | 4 valeurs indépendantes, forme légèrement irrégulière |
| `L` | Forme en L | 6 | Rectilinéaire, 2 côtés déductibles au level 2 |
| `escalier` | Escalier | 8 | Rectilinéaire, 4 côtés déductibles au level 2 |
| `tri_rect` | Triangle rectangle | 3 | Triple pythagoricienne (3-4-5, 5-12-13…) |
| `tri_iso` | Triangle isocèle | 3 | 2 côtés égaux (marques) |
| `triangle_equi` | Triangle équilatéral | 3 | 1 seule valeur (tous côtés égaux) |
| `trapeze` | Trapèze | 4 | 4 valeurs indépendantes |
| `hexa_reg` | Hexagone régulier | 6 | 1 seule valeur |
| `penta_reg` | Pentagone régulier | 5 | 1 seule valeur |
| `random` | Aléatoire | — | Choisit une forme parmi toutes |

### Système de niveaux

| Level | Comportement |
|-------|-------------|
| `1` | Tous les côtés étiquetés |
| `2` | Les côtés déductibles par symétrie/contrainte sont masqués |
| `3` | Davantage de côtés masqués (variations selon la forme) |

Exemple L-shape level 2 : les côtés `b` et `c-d` (déductibles du bas et du gauche) sont masqués. L'élève doit d'abord trouver les mesures manquantes, puis sommer les 6 côtés.

### Attributs / Config

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `seed` | string | `"poly"` | Graine PRNG déterministe |
| `shape` | string | `"rect"` | Forme (voir tableau ci-dessus) |
| `unit` | string | `"cm"` | Unité affichée après chaque mesure |
| `level` | number | `1` | Niveau de difficulté (1–3) |
| `valuerange` | [min, max] JSON | `[2, 9]` | Plage de valeurs entières pour les côtés |
| `showmetrics` | boolean | `false` | Afficher `P = X cm` sous la figure |
| `color` | string | `"#1d4ed8"` | Couleur du tracé et des étiquettes |

> Le périmètre est toujours accessible via `element.dataset.perimeter` après rendu.

### Exemple YAML — Rectangle level 2

```yaml
visual:
  type: "polygone-perimetre"
  position: "west"
  config:
    seed: "6e-r2-q1-v1"
    shape: "rect"
    unit: "cm"
    level: 2
  editor_prefs:
    shapes: ["rect", "carre"]
    valueRange: [2, 9]
    level: 2
```

### Exemple YAML — Forme en L level 2

```yaml
visual:
  type: "polygone-perimetre"
  position: "west"
  config:
    seed: "6e-r2-q3-v1"
    shape: "L"
    unit: "cm"
    level: 2
  editor_prefs:
    shapes: ["L", "escalier"]
    valueRange: [3, 8]
    level: 2
```

### Convention de graine

Même convention que `figure-geo` :
```
{niveau}-r{rapido}-q{question}-v{variante}
Exemple : "6e-r2-q3-v1"
```

### `editor_prefs` — Randomiseur

| Champ | Type | Description |
|-------|------|-------------|
| `shapes` | string[] | Formes autorisées pour le tirage aléatoire |
| `valueRange` | [min, max] | Plage de valeurs entières |
| `level` | number | Niveau imposé |

---

## 📝 Texte à Trous

**Fichier :** `src/visuals/texte-trous/texte-trous.js`  
**Position recommandée :** `north`

Texte avec variables aléatoires inline et expressions calculées. Voir `docIA/NewPluginTexteATrous.md` pour la doc complète.

---

## 🛠️ Checklist Création d'un Visuel dans un Rapido

```markdown
- [ ] Choisir le bon type (cubes-numeration / axe-gradue / figure-geo)
- [ ] Définir la position (north pour la plupart, west pour figure-geo)
- [ ] Définir la config initiale (valeurs par défaut pédagogiquement pertinentes)
- [ ] Donner une seed unique pour figure-geo : {niveau}-r{N}-q{Q}-v{V}
- [ ] Définir editor_prefs pour contraindre la randomisation
- [ ] Tester via le bouton 🎲 que les variantes restent pédagogiques
- [ ] Vérifier l'affichage sur la page Rapido (npm run dev)
```
