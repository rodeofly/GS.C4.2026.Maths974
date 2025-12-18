# 📊 Analyse Complète - Maths974 Guide de Survie

## 🎯 Vue d'Ensemble Exécutive

**Maths974** est une plateforme éducative statique construite avec Astro, dédiée aux mathématiques pour collège/lycée à La Réunion. L'application génère des fiches pédagogiques optimisées pour l'impression professionnelle (A4/A5) et la consultation web.

---

## 🏗️ Architecture Technique

### Stack Principal
```
Framework: Astro v4.12.2
Styling: CSS natif modulaire (variables CSS + architecture BEM)
Math Rendering: MathJax 3 + TikZJax
QR Codes: qrcode@1.5.3
Déploiement: GitHub Pages (workflow automatisé)
```

### Structure des Répertoires
```
src/
├── components/          # Composants réutilisables
│   ├── Navbar.astro
│   ├── Etiquette.astro  # Carte de fiche pédagogique
│   ├── Accordion.astro
│   ├── QRCode.astro
│   └── SubthemeInfo.astro
├── content/             # Base de données Markdown
│   ├── guide/          # Fiches de cours
│   └── rapidos/        # Exercices rituels
├── layouts/            # Templates de page
│   ├── BasePrintLayout.astro
│   ├── A4.astro
│   ├── A5.astro
│   └── RapidoLayout.astro
├── pages/              # Routes
│   ├── index.astro
│   ├── guide/[...slug].astro
│   ├── rapidos/[...slug].astro
│   └── recherche/
├── styles/             # Architecture CSS modulaire
│   ├── 00-tokens.css   # Design System
│   ├── 01-reset.css
│   ├── 02-typography.css
│   ├── 03-layout.css
│   ├── 04-utilities.css
│   ├── components/
│   ├── layouts/
│   └── pages/
└── utils/
    └── storage.js      # LocalStorage (favoris/historique)
```

---

## 🎓 Objectifs Pédagogiques

### 1. Accessibilité du Contenu Mathématique
- **Simplification** : Fiches ultra-condensées (format 1/1, 1/2, 1/4, 1/8)
- **Hiérarchisation** : ID unique (ex: `6-NC-1.1`), niveau, thème, sous-thème
- **Contextualisation locale** : Exemples ancrés à La Réunion (Piton des Neiges, Saint-Paul, etc.)

### 2. Différenciation Pédagogique
- **Rapidos** : Système de variantes progressives (4 niveaux de difficulté par question)
- **Liens GS** : Chaque variante peut pointer vers une fiche Guide de Survie spécifique
- **Format adaptatif** : Grille responsive mobile-first → 2 colonnes desktop max

### 3. Autonomie de l'Élève
- **Moteur de recherche** : Filtres (niveau, thème, tags)
- **Favoris & Historique** : LocalStorage pour suivi personnel
- **QR Codes** : Liens vers ressources complémentaires imprimables

---

## 🎨 Objectifs UX/UI

### Design System (`00-tokens.css`)
```css
--color-guide-primary: #0d9488 (teal)
--color-rapido-primary: #dc2626 (red)
--font-sans: 'Lexend Deca' (lisibilité optimisée)
--space-* : Échelle d'espacement cohérente
--radius-* : Border-radius harmonieux
```

### Principes d'Interface
1. **Mobile-First** : Grille 1 col mobile → 2 col desktop
2. **Affordance claire** : Boutons 44x44px minimum (WCAG)
3. **Feedback visuel** : Hover states, animations subtiles
4. **Accessibilité** :
   - Focus visible (outline accent)
   - Skip links
   - ARIA labels complets
   - Préférence mouvement réduit (`prefers-reduced-motion`)

### Parcours Utilisateur
```
Accueil → [Guides | Rapidos]
  ↓
Menu Niveau (ex: 6ème)
  ↓
Sous-thèmes (ex: Nombres entiers)
  ↓
Étiquettes individuelles
  ↓
[Favoris | Isoler | Imprimer]
```

---

## 🖨️ Objectifs d'Impression Professionnelle

### Système de Formats
**Contrôle via Navbar → Paramètres :**
- **Screen** : Largeur fluide (max 1400px)
- **A4** : 21×29.7cm, marges 1cm
- **A5** : 14.8×21cm, marges 0.5cm

### Mécanisme Technique
```javascript
// navbar.astro - Script inline
body[data-layout-mode="a4"] .layout { 
  width: 21cm; min-height: 29.7cm; 
}
body[data-layout-mode="a5"] .layout { 
  width: 14.8cm; min-height: 21cm; 
}
```

**⚠️ RÈGLE CRITIQUE** : Les `@page` sont **dynamiques** et injectés via JS :
```javascript
// Ajustement taille police + @page selon mode
if (mode === 'a5') {
  styleEl.textContent = `
    @page { size: A5 portrait; margin: 0.5cm; }
    body { font-size: 10pt !important; }
    h1 { font-size: 12pt !important; }
  `;
}
```

### Optimisations Print
- **Break-inside-avoid** sur `.etiquette`
- **Accordéons ouverts** automatiquement
- **QR Codes** : Taille réduite (2.2cm A5)
- **Suppression** : Navbar, boutons interactifs

---

## 📝 Contenu : Collection Astro

### Schéma `guide` (Zod)
```typescript
{
  title: string,
  niveau?: string,          // "6ème", "Terminale"
  theme?: string,           // "Nombres et calculs"
  sous_theme?: string,      // "1. Nombres entiers"
  format?: "1/1" | "1/2" | "1/4" | "1/8",
  full_width?: boolean,
  contenus?: string[],      // Bullets "À retenir"
  erreurs_frequentes?: string[],
  accordeons?: { titre, contenu }[],
  liens?: { url, label, type, position, size }[],
  id?: string,              // "6-NC-1.1"
}
```

### Schéma `rapidos`
```typescript
{
  numero: string,
  niveau: string,
  theme?: string,
  periode?: number,
  semaine?: number,
  questions: [
    {
      variantes: [
        { texte: string, gs?: string, difficulte?: 1|2|3|4 }
      ]
    }
  ]
}
```

### Organisation Fichiers
```
content/guide/
  sixieme/
    01-nombres-et-calculs/
      01-nombres-entiers/
        index.md              # Intro sous-thème
        1.1-representer.md
        1.2-decomposer.md
      index.md                # Intro thème
    index.md                  # Intro niveau
  terminale/...

content/rapidos/
  cm2/
    Période 3/
      Rapido.16.md
      Rapido.17.md
    index.md
```

---

## 🔑 Points d'Attention Critiques

### 1. **Base URL GitHub Pages**
```javascript
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
// TOUJOURS préfixer : `${base}/guide/...`
```

### 2. **Scripts Client-Side**
```astro
<script>
  // ✅ CORRECT : Import statique pour bundling
  import { Favoris } from '../../utils/storage.js';
  
  // ❌ INTERDIT : Import dynamique non-bundlé
  const { Favoris } = await import('/utils/storage.js');
</script>
```

### 3. **Rendering Math/TikZ**
```javascript
// BasePrintLayout.astro - Footer script
// Ordre impératif :
1. convertTikzBlocks()  // Transforme LaTeX en <script type="text/tikz">
2. MathJax.typesetPromise()
3. tikzjax.renderAll()
```

### 4. **Grille Layout**
```css
/* Mobile : TOUJOURS 1 colonne */
.etiquettes-grid { grid-template-columns: 1fr; }

/* Desktop : MAX 2 colonnes */
@media (min-width: 768px) {
  .etiquettes-grid { grid-template-columns: repeat(2, 1fr); }
}
```

---

## 🛠️ Workflows Développement

### Commandes
```bash
npm run dev      # Port 4321
npm run build    # SSG complet
npm run preview  # Tester build
```

### Déploiement Auto
```yaml
# .github/workflows/deploy.yml
on: push (main) → withastro/action@v2 → deploy-pages@v4
```

### Ajout de Contenu
1. **Fiche Guide** :
   ```markdown
   ---
   title: "Théorème de Pythagore"
   niveau: "4ème"
   id: "4-GEO-1"
   format: "1/2"
   ---
   Contenu Markdown + LaTeX
   ```

2. **Rapido** :
   ```yaml
   ---
   numero: "16"
   niveau: "cm2"
   questions:
     - variantes:
         - texte: "$5 + 3 = \\dots$"
         - texte: "$15 + 8 = \\dots$"
   ---
   ```

---

## 📋 Checklist Intervention IA

Avant toute modification, vérifier :

- [ ] **Base URL** : Tous les liens incluent `${base}`
- [ ] **Import scripts** : Utiliser imports statiques Astro
- [ ] **@page dynamique** : NE PAS hardcoder dans CSS
- [ ] **Grille responsive** : Mobile 1 col → Desktop 2 col max
- [ ] **Accessibilité** : Touch targets 44px, ARIA, focus visible
- [ ] **Print** : Tester A4/A5, page-break-inside
- [ ] **Math rendering** : Ordre convertTikz → MathJax → TikZJax

---

## 🚀 Améliorations Futures Possibles

1. **Backend léger** : Supabase pour sync favoris multi-devices
2. **PWA** : Consultation offline
3. **Générateur PDF** : Puppeteer côté serveur
4. **Analytics** : Plausible pour tracking pédagogique
5. **CMS** : Tina.io pour édition profs non-dev

---

## 📚 Ressources Essentielles

- **Astro Docs** : https://docs.astro.build
- **Content Collections** : https://docs.astro.build/en/guides/content-collections/
- **MathJax** : https://docs.mathjax.org/en/latest/
- **TikZJax** : https://tikzjax.com/
- **WCAG 2.1** : https://www.w3.org/WAI/WCAG21/quickref/

---

## 🤝 Protocole Inter-IA

### Quand intervenir
- **Claude** : Architecture, refactoring, accessibilité
- **Gemini (Lead)** : Décisions stratégiques, validation finale
- **ChatGPT** : Contenu pédagogique, debugging rapide

### Format Questions
```
[IA_ORIGINE] → [SUJET] → [CONTEXTE_FICHIER] → [QUESTION_PRÉCISE]

Exemple :
[Claude] → [Grille Layout] → [03-layout.css L.89-120] 
→ Doit-on autoriser 3 colonnes sur écrans >1600px ?
```

### Validation Changements
1. Test local (`npm run dev`)
2. Build production (`npm run build`)
3. Vérification impression (Ctrl+P)
4. Commit avec message structuré :
   ```
   [COMPOSANT] Action courte
   
   - Détail 1
   - Détail 2
   
   Impacts: [UX|A11Y|PRINT|PERF]
   ```

---

**Dernière mise à jour** : 2024-12-18  
**Mainteneur** : Conseil IA (Claude + Gemini + ChatGPT)  
**Licence** : MIT