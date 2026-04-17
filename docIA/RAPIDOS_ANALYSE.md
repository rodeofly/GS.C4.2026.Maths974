# Rapidos 6ème — Référence Technique

Dernière mise à jour : 2026-04-17

---

## Vue d'ensemble

Les **Rapidos** sont des rituels mathématiques quotidiens (5-10 min, 5 questions, 4 variantes chacune). La variante correspond au niveau de l'élève — le prof navigue via les bullets.

**Contenu actuel : 32 rapidos 6ème** répartis sur 5 périodes (`Période 1` → `Période 5`).

---

## Schéma YAML (`src/content/config.ts`)

```typescript
// Collection 'rapidos'
{
  title?: string,
  numero?: string,        // "1" → "32"
  niveau?: string,        // "6e"
  theme?: string,
  periode?: number,       // 1–5
  semaine?: number,       // 1–32
  questions?: Array<{
    variantes: Array<{
      texte: string,          // LaTeX inline ($...$), \n pour saut de ligne
      gs?: string,            // "GS 2.5" — lien vers fiche Guide de Survie
      visual?: {
        type: string,         // voir composants disponibles
        position?: 'north' | 'south' | 'east' | 'west' | 'front' | 'back',
        config?: Record<string, any>,
        editor_prefs?: Record<string, any>,
      }
    }>
  }>
}
```

---

## Structure des fichiers

```
src/content/rapidos/6e/
  index.md
  Période 1/  index.md  → Rapidos 1–7
  Période 2/  index.md  → Rapidos 8–15
  Période 3/  index.md  → Rapidos 16–20
  Période 4/  index.md  → Rapidos 21–26
  Période 5/  index.md  → Rapidos 27–32
```

Convention de nommage : `6e.Rapido.{N}.md`

---

## Zones de position des visuels

```
┌────────────────────────┐
│          north         │
├───────┬────────┬───────┤
│ west  │ texte  │ east  │
├───────┴────────┴───────┤
│          south         │
└────────────────────────┘
```

| Position | Usage réel |
|----------|-----------|
| `north`  | `axe-gradue` (fractions), `cubes-numeration`, `texte-trous` |
| `south`  | `axe-gradue` (décimaux) |
| `east`   | `polygone-perimetre` |
| `west`   | `figure-geo`, `schema-additif` |

---

## Composants visuels disponibles

Fichiers dans `src/components/visuals.bin/` :

| Type YAML | Fichier JS | Shapes / Modes |
|-----------|-----------|----------------|
| `axe-gradue` | `axe-gradue.js` | mode `decimal` (défaut), `fraction`, `mixed` |
| `cubes-numeration` | `cubes-numeration.js` | milliers / centaines / dizaines / unités |
| `polygone-perimetre` | *(voir RAPIDOS_VISUELS.md)* | rect, carre, losange, kite, L, tri_rect, trapeze, triangle_equi, hexa_reg, penta_reg |
| `figure-geo` | *(dans visuals.bin?)* | figures rectilinéaires sur quadrillage |
| `schema-additif` | — | schéma bande partie-tout dynamique |
| `texte-trous` | — | texte avec variables aléatoires `[x:min..max]` |

Voir `docIA/RAPIDOS_VISUELS.md` pour la documentation détaillée de chaque composant.

---

## Règles de création

1. **5 questions exactement**, 4 variantes chacune (v1 = facile → v4 = difficile ou type différent)
2. **GS obligatoire** sur chaque variante — lien vers la fiche Guide de Survie correspondante
3. **LaTeX inline uniquement** : `$...$`, jamais `$$...$$`
4. **Sauts de ligne** : `\n` dans le champ `texte` (rendu via `nl2br`)
5. **Contexte réunionnais** dans les problèmes textuels (Saint-Pierre, mangues, carry, Piton…)
6. **Seeds visuels** : convention `{niveau}-r{N}-q{Q}-v{V}` (ex: `"6e-r8-q1-v1"`)
7. **v4 peut changer de GS** si la 4e variante couvre un concept différent (noter dans le commentaire YAML)

---

## Overlay GS (RapidoLayout)

Cliquer sur un badge GS ouvre un overlay PDF.js affichant la fiche correspondante du guide Cycle 3.

- Les données sont chargées au **build time** via `getCollection('guide')`
- La fiche est identifiée par correspondance `gs: "GS 2.5"` → `id: "2.5"` dans la collection guide
- Le PDF source : `public/pdf/guide-survie-c3.pdf`

---

## Checklist création rapido

```
- [ ] Fichier : src/content/rapidos/6e/Période {N}/6e.Rapido.{X}.md
- [ ] Frontmatter : numero, niveau, periode, semaine
- [ ] 5 questions, 4 variantes chacune
- [ ] gs: sur chaque variante
- [ ] LaTeX $...$ uniquement
- [ ] Seeds uniques pour visuels
- [ ] Contexte réunionnais dans les problèmes
```
