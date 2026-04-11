# Conventions — Guide de Survie Cycle 3

## Source

PDF : `docIA/GS.C3.A5.2025.impression.VFINALE_compressed.pdf`  
Auteurs : Pascal Dorr, Karim Bouasla, Florian Tobé © 2025  
Niveau cible : CM1 → 6ème (Cycle 3)

---

## Concept pédagogique

Chaque **étiquette** est un **mini exercice corrigé** extrait du PDF :
1. L'énoncé de l'exercice
2. La rédaction type (ce qu'un élève parfait écrirait)

Le PDF source est rendu directement dans le navigateur via **PDF.js** — on n'a pas à retranscrire le contenu.

---

## Architecture technique

### Rendu PDF (mode principal)

Les étiquettes affichent une **région du PDF** découpée au pixel près.  
La région est définie dans le frontmatter YAML :

```yaml
pdf:
  page: 4      # numéro de page dans le PDF (1-indexé)
  x: 14        # coin supérieur gauche en points PDF (scale=1, origin top-left)
  y: 48        # coin supérieur gauche en points PDF
  w: 421       # largeur en points PDF
  h: 115       # hauteur en points PDF
```

Les coordonnées se trouvent avec l'outil visuel à `/outils/pdf-picker`.

### Système blocs (mode alternatif)

Pour du contenu créé manuellement (non extrait du PDF), utiliser `blocs:` :

```yaml
blocs:
  - type: enonce
    contenu: "Texte de l'énoncé"
  - type: redaction
    contenu: |
      Texte rédigé sur plusieurs lignes.
      Supporte **gras**, *italique* et $LaTeX inline$.
  - type: retenir
    items:
      - "Notion clé 1"
      - "Notion clé 2"
  - type: erreur
    items:
      - "Erreur à éviter"
  - type: rappel
    contenu: "Remarque ou méthode mnémotechnique"
  - type: accordeon
    titre: "Titre du volet"
    contenu: "Contenu déplié"
  - type: illustration
    url: "https://..."
    alt: "Description"
  - type: tableau
    entetes: ["Col 1", "Col 2"]
    lignes:
      - ["valeur", "valeur"]
```

---

## Trouver les coordonnées PDF

1. Lancer le serveur de dev : `npm run dev`
2. Ouvrir `/outils/pdf-picker` dans le navigateur
3. Naviguer jusqu'à la bonne page
4. Dessiner un rectangle autour de l'étiquette
5. Copier le YAML généré dans le frontmatter du fichier `.md`

Le système de coordonnées utilise l'origine **coin supérieur gauche**, scale=1 (points PDF natifs). Chaque page du PDF source fait ~449 × 623 pts.

---

## Structure des fichiers

```
src/content/guide/
  cycle3/
    index.md
    01-nombres-et-calculs/
      index.md
      01-nombres-entiers/       → fiches 1.1 à 1.10
      02-fractions/             → fiches 2.1 à 2.12
      03-nombres-decimaux/      → fiches 3.1 à 3.9
      04-quatre-operations/     → fiches 4.x
      05-division-multiples/    → fiche 5.x
      06-pourcentages/          → fiche 6.x
      07-calcul-mental/         → fiche 7.x
      08-algebre/               → fiche 8.x
    02-grandeurs-et-mesures/
      index.md
      09-longueurs-masses/
      10-perimetres/
      11-aires/
      12-volumes/
      13-durees/
    03-espace-geometrie/
      index.md
      14-elements-geometrie/
      ...
    04-donnees-probabilites/
    05-proportionnalite/
    06-pensee-informatique/
    07-resolution-problemes/
```

---

## Champs frontmatter

### Champs communs (toutes étiquettes)

| Champ | Type | Requis | Description |
|---|---|---|---|
| `title` | string | oui | Titre de l'étiquette |
| `id` | string | oui | Identifiant court = numéro de l'étiquette (`"1.4"`) |
| `niveau` | string | oui | `"Cycle 3"` |
| `theme` | string | non | `"Nombres et calculs"` etc. |
| `sous_theme` | string | non | `"1. Nombres entiers"` etc. |
| `format` | string | non | `"1/4"`, `"1/2"`, `"1/1"` (défaut `"1/1"`) |
| `full_width` | boolean | non | Force pleine largeur dans la grille |
| `liens` | array | non | Renvois vers d'autres fiches (QR codes) |

### Champs mode PDF

| Champ | Description |
|---|---|
| `pdf.page` | Numéro de page (commence à 1) |
| `pdf.x` | X en points PDF, origine coin supérieur gauche |
| `pdf.y` | Y en points PDF, origine coin supérieur gauche |
| `pdf.w` | Largeur en points PDF |
| `pdf.h` | Hauteur en points PDF |

### Champs mode blocs

| Champ | Description |
|---|---|
| `blocs` | Tableau de blocs typés (voir types ci-dessus) |

### Champs réservés aux fichiers index

| Champ | Description |
|---|---|
| `objectif` / `resume` | Affiché dans la modale "i" de SubthemeInfo |
| `competences` | Liste de compétences (modale + recherche) |
| `tags` | Mots-clés (modale + recherche) |

---

## Convention des IDs

`id` = numéro de l'étiquette dans le guide (`"1.1"`, `"2.3"`, etc.)

Ce numéro est affiché directement sur la carte. Il correspond exactement à la numérotation du PDF source.

---

## Formats

| Format | Quand l'utiliser |
|---|---|
| `"1/4"` | Étiquette courte, 1 exemple simple |
| `"1/2"` | Étiquette moyenne, tableau ou procédure |
| `"1/1"` | Étiquette dense, cas multiples |

---

## Template mode PDF (cas général)

```markdown
---
title: "X.Y Titre de la notion"
id: "X.Y"
niveau: "Cycle 3"
theme: "Nombres et calculs"
sous_theme: "X. Nom du sous-thème"
format: "1/2"
pdf:
  page: 4
  x: 14
  y: 48
  w: 421
  h: 115
---
```

## Template mode blocs (contenu manuel)

```markdown
---
title: "X.Y Titre de la notion"
id: "X.Y"
niveau: "Cycle 3"
theme: "Nombres et calculs"
sous_theme: "X. Nom du sous-thème"
format: "1/2"
blocs:
  - type: enonce
    contenu: "Texte de l'énoncé"
  - type: redaction
    contenu: |
      La rédaction rédigée comme un élève parfait.
      $Calcul = résultat$
---
```

---

## Règles LaTeX

- Inline : `$...$` uniquement
- Jamais de `$$...$$` dans les étiquettes (casse la mise en page)
- Espacement des milliers : écrire `56 234` (espace insécable) — pas `$56\,234$`
- Fractions : `$\frac{a}{b}$`
- Unités : `$\text{cm}$`, `$\text{kg}$`

---

## Composants impliqués

| Composant | Rôle |
|---|---|
| `Etiquette.astro` | Orchestre le rendu selon le mode (`pdf` ou `blocs`) |
| `PdfEtiquette.astro` | Rendu HTML du mode PDF (canvas + lightbox) |
| `BasePrintLayout.astro` | Contient le script PDF.js (chargé une fois pour toutes les cartes) |
| `src/pages/outils/pdf-picker.astro` | Outil visuel de sélection de coordonnées |

### Flux PDF.js

```
BasePrintLayout.astro <script>
  └── import * as pdfjsLib from 'pdfjs-dist'   ← bundle npm via Vite
  └── document.querySelectorAll('.pdf-wrap').forEach(initCard)
        └── IntersectionObserver → renderCard() quand visible
        └── click → openLb() → lightbox plein écran
              └── document.body.appendChild(lb)  ← escape stacking context
```

Le worker est chargé via `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href`.

---

**Dernière mise à jour** : 2026-04-11  
**Analysé et nettoyé par** : Claude (Sonnet 4.6)
