# 🔥 RAPIDOS - Analyse Technique Complète

## 📊 Vue d'Ensemble

Les **Rapidos** sont des exercices rituels quotidiens avec un système de **différenciation progressive** via des variantes par question. Chaque Rapido contient 5 questions, chacune ayant 2 à 4 variantes de difficulté croissante.

---

## 🎯 Objectif Pédagogique

### Concept
- **Rituel mathématique** : 5 questions en début de séance (5-10 min)
- **Différenciation** : Chaque élève travaille sur la variante adaptée à son niveau
- **Progression** : Système de navigation entre variantes via bullets
- **Traçabilité** : Lien vers fiche Guide de Survie pour révision

### Workflow Enseignant
```
1. Projeter le Rapido au tableau (mode plein écran)
2. Élèves copient le numéro de question
3. Enseignant clique sur bullet pour changer de variante
4. Badge GS visible pour orienter révisions
```

---

## 📁 Structure de Données

### Schéma YAML (content/config.ts)
```typescript
const rapidosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    numero: z.string().optional(),        // "16", "17"
    niveau: z.string(),                   // "cm2", "6ème", "Terminale"
    theme: z.string().optional(),         
    periode: z.number().optional(),       // 1-5 (année scolaire)
    semaine: z.number().optional(),       // 1-36
    questions: z.array(
      z.object({
        variantes: z.array(
          z.object({
            texte: z.string(),            // Question avec LaTeX
            gs: z.string().optional(),    // Ex: "GS 1.5"
            difficulte: z.number().optional() // 1-4 (non utilisé UI pour l'instant)
          })
        )
      })
    ).optional(),
  }),
});
```

### Exemple Réel (Rapido.16.md)
```yaml
---
numero: "16"
niveau: "cm2"
periode: 3
semaine: 16
questions:
  - variantes:
      - texte: 'Quel nombre se trouve exactement au milieu de $0$ et $10$ ?'
        gs: "GS 1.5"
      - texte: 'Quel nombre se trouve exactement au milieu de $100$ et $200$ ?'
        gs: "GS 1.5"
      - texte: 'Sur une droite graduée de $50$ en $50$, quel nombre suit $1500$ ?'
        gs: "GS 1.5"
      - texte: 'Le Piton des Neiges culmine à $3070 \, \text{m}$. Encadre : $\dots < 3070 < \dots$'
        gs: "GS 1.5"
        
  - variantes:
      - texte: 'Écris sous forme à virgule : $\frac{3}{10} = \dots$'
        gs: "GS 3.1"
      - texte: 'Écris sous forme à virgule : $\frac{25}{100} = \dots$'
        gs: "GS 3.1"
  # ... 3 autres questions avec variantes
---
```

---

## 🎨 Interface Utilisateur

### Layout Plein Écran (RapidoLayout.astro)

#### Éléments Visuels
1. **Background dégradé rouge** : `linear-gradient(#dc2626, #fca5a5)`
2. **Courbes décoratives** : `/images/curves.svg` (backdrop)
3. **Margouillat** : Illustration mascotte en haut à droite
4. **Volcan** : Base visuelle avec copyright "© maths974"
5. **Lambrequin** : Frise décorative réunionnaise

#### Structure HTML
```
<body class="rapido-body">
  <img class="bg-curves" />               <!-- Fond -->
  <img class="deco-margouillat" />        <!-- Mascotte -->
  <a class="back-btn">⬅</a>              <!-- Retour -->
  
  <div class="rapido-container">
    <header>
      <h2>Maths974</h2>
      <div class="title-wrapper">
        <h1>Rapido {niveau}</h1>
        <div class="rapido-badge">{numero}</div>
      </div>
      <div class="deco-area">
        <img class="deco-volcan" />
        <div class="copyright">© maths974</div>
        <div class="frise-lambrequin" />
      </div>
    </header>
    
    <div class="questions-grid">
      <!-- 5 cartes question -->
    </div>
  </div>
</body>
```

---

## 🎴 Carte Question (Anatomie)

### Structure d'une Carte
```html
<article class="q-card" id="card-0">
  <!-- Numéro circulaire -->
  <div class="q-num">1</div>
  
  <!-- Contrôles en haut -->
  <div class="card-header-controls">
    <!-- Badge GS (visible selon variante active) -->
    <div class="gs-ref-badge active" data-index="0">GS 1.5</div>
    <div class="gs-ref-badge" data-index="1">GS 1.5</div>
    
    <!-- Bullets de navigation -->
    <div class="bullets-nav">
      <button class="bullet active" data-card="0" data-variant="0"></button>
      <button class="bullet" data-card="0" data-variant="1"></button>
      <button class="bullet" data-card="0" data-variant="2"></button>
      <button class="bullet" data-card="0" data-variant="3"></button>
    </div>
  </div>
  
  <!-- Variantes de texte (une seule visible) -->
  <div class="variant-content active" data-index="0">
    <div class="content">Quel nombre au milieu de $0$ et $10$ ?</div>
  </div>
  <div class="variant-content" data-index="1">
    <div class="content">Quel nombre au milieu de $100$ et $200$ ?</div>
  </div>
  <!-- ... autres variantes -->
</article>
```

### CSS Clés
```css
.questions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;      /* 2 colonnes */
  grid-template-rows: repeat(3, 1fr);  /* 3 lignes */
  gap: 1.5rem;
  flex: 1;                              /* Occupe tout l'espace */
}

/* Si 5 questions : Q5 sur toute la largeur en bas */
.questions-grid:has(> :last-child:nth-child(5)) > :last-child {
  grid-column: 1 / -1;
  width: 70%;
  margin: 0 auto;
}

.q-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.5rem;
  padding: 3rem 1.5rem 1.5rem;
  position: relative;
}

.q-num {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 2.5rem;
  height: 2.5rem;
  background: #f59e0b;  /* Orange */
  color: white;
  border-radius: 50%;
  border: 3px solid white;
  z-index: 20;
}
```

---

## ⚙️ Système de Navigation Variantes

### JavaScript (inline dans RapidoLayout.astro)
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const bullets = document.querySelectorAll('.bullet');
  
  bullets.forEach(bullet => {
    bullet.addEventListener('click', (e) => {
      const cardIndex = e.target.dataset.card;
      const variantIndex = e.target.dataset.variant;
      const card = document.getElementById(`card-${cardIndex}`);
      
      // 1. Activer la bonne variante de texte
      card.querySelectorAll('.variant-content').forEach(c => {
        c.classList.toggle('active', c.dataset.index === variantIndex);
      });
      
      // 2. Afficher le bon badge GS
      card.querySelectorAll('.gs-ref-badge').forEach(b => {
        b.classList.toggle('active', b.dataset.index === variantIndex);
      });
      
      // 3. Mettre à jour l'état du bullet cliqué
      card.querySelectorAll('.bullet').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
});
```

### Animations CSS
```css
.variant-content {
  display: none;
  animation: fadeIn 0.3s ease;
}

.variant-content.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #cbd5e1;  /* Gris par défaut */
  transition: all 0.2s;
}

.bullet.active {
  background: #f59e0b;  /* Orange actif */
  transform: scale(1.1);
}

.gs-ref-badge {
  display: none;  /* Caché par défaut */
  background: #0f766e;  /* Teal */
  color: white;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.gs-ref-badge.active {
  display: block;
}
```

---

## 🔗 Routing & Organisation

### Structure Fichiers
```
content/rapidos/
  index.md                    # Menu racine Rapidos
  cm2/
    index.md                  # Menu CM2
    Période 3/
      Rapido.16.md
      Rapido.17.md
      Rapido.18.md
  terminale/
    index.md                  # Menu Terminale
```

### URLs Générées
```
/rapidos/                     → Menu global
/rapidos/cm2/                 → Liste Rapidos CM2
/rapidos/cm2/Rapido.16/       → Rapido 16 (plein écran)
/rapidos/terminale/           → Liste Rapidos Terminale
```

### Page de Menu ([...slug].astro)
Quand `isIndex = true` (fichier `index.md`) :
```astro
<A4Layout>
  <div class="rapido-menu-grid">
    {children.map(child => (
      <a href={`${base}/rapidos/${child.slug}/`} class="card rapido-card-link">
        <div class="card-header">
          <span class="rapido-icon">⚡</span>
          <span class="rapido-number">Rapido {child.data.numero}</span>
        </div>
        <div class="rapido-meta">
          {child.data.questions.length} questions
          • Semaine {child.data.semaine}
          • {child.data.niveau}
        </div>
      </a>
    ))}
  </div>
</A4Layout>
```

---

## 🐛 Fonctionnalité : Retours à la Ligne

### Problème Résolu
Les retours à la ligne (`\n`) dans le texte YAML n'étaient pas rendus en HTML.

### Solution Implémentée
```javascript
// Fonction helper dans RapidoLayout.astro
function nl2br(text) {
  if (!text) return '';
  return text.replace(/\n/g, '<br/>');
}

// Utilisation dans le template
<div class="content" set:html={nl2br(v.texte)}></div>
```

### Exemple d'Usage
```yaml
questions:
  - variantes:
      - texte: |
          Si je lance une pièce, obtenir "Pile" est :
          impossible - certain - probable (1 chance sur 2).
```

---

## 🎯 Bonnes Pratiques Identifiées

### ✅ DO
1. **4 variantes max** : Lisibilité des bullets
2. **Contexte local** : Références réunionnaises (Piton, Saint-Paul)
3. **LaTeX inline** : `$\frac{3}{10}$` pour math
4. **GS cohérent** : Même référence pour toutes les variantes d'une question si concept identique
5. **Progression** : Variante 1 = basique → Variante 4 = complexe

### ❌ DON'T
1. **Texte trop long** : Max 2 lignes par variante
2. **LaTeX display** : Pas de `$$...$$` (casse la mise en page)
3. **Mélanger niveaux** : Garder cohérence CM2/6ème/Terminale
4. **Oublier GS** : Toujours lier à une fiche si possible

---

## 🚀 Fonctionnalités Futures Possibles

### 1. Indicateur de Difficulté Visuel
```yaml
variantes:
  - texte: "..."
    difficulte: 1  # → Afficher 1 étoile
  - texte: "..."
    difficulte: 3  # → Afficher 3 étoiles
```

### 2. Timer Intégré
```javascript
// Ajouter un chrono de 5 min en haut
<div class="timer">⏱️ 5:00</div>
```

### 3. Mode Correction
```yaml
variantes:
  - texte: "..."
    reponse: "5"  # Affichable en cliquant sur un bouton
```

### 4. Statistiques Élève
```javascript
// Tracker quelle variante a été travaillée
localStorage.setItem('rapido-16-q1', '2'); // Variante 2
```

### 5. Export PDF Enseignant
```javascript
// Générer PDF avec toutes les variantes imprimées
window.print(); // Mode spécial A4 avec grille
```

---

## 🔍 Points Techniques Importants

### 1. **Font-family Override**
```css
.rapido-body {
  font-family: var(--font-sans) !important; /* Force Lexend Deca */
}
```

### 2. **Vertical Centering Math**
```css
.content :global(mjx-container) {
  vertical-align: middle !important;
  margin: 0 0.2em !important;
}
```

### 3. **5ème Question Full Width**
```css
/* Sélecteur magique CSS */
.questions-grid:has(> :last-child:nth-child(5)) > :last-child {
  grid-column: 1 / -1;
  width: 70%;
  margin: 0 auto;
}
```

### 4. **Parent URL Calculation**
```javascript
// Remonter dans l'arborescence pour trouver index parent
const parts = entry.slug.split('/');
parts.pop(); 
while (parts.length > 0) {
  const candidateSlug = parts.join('/');
  const parentEntry = allRapidos.find(e => 
    e.slug.replace(/\/index$/, '') === candidateSlug && 
    e.id.endsWith('index.md')
  );
  if (parentEntry) {
    parentUrl = `${base}/rapidos/${candidateSlug}/`;
    break;
  }
  parts.pop();
}
```

---

## 📊 Métriques Actuelles

### Contenu
- **Niveaux** : CM2, Terminale (extensible)
- **Rapidos CM2** : 3 fichiers (16-18)
- **Questions/Rapido** : 5 questions fixes
- **Variantes/Question** : Moyenne 4 variantes

### Performance
- **Rendu LaTeX** : ~200ms (MathJax)
- **Animation variante** : 300ms fadeIn
- **Taille page** : ~150KB (avec images SVG)

---

## 🛠️ Checklist Création Rapido

```markdown
- [ ] Fichier : `content/rapidos/{niveau}/{dossier}/Rapido.{N}.md`
- [ ] Frontmatter complet (numero, niveau, periode, semaine)
- [ ] 5 questions exactement
- [ ] 2-4 variantes par question (progression logique)
- [ ] LaTeX inline uniquement (`$...$`)
- [ ] Références GS pertinentes
- [ ] Contexte local si possible (Réunion)
- [ ] Test rendu : `npm run dev`
- [ ] Vérifier bullets navigation
- [ ] Tester affichage plein écran
```

---

## 📚 Exemples de Patterns

### Pattern 1 : Même Concept, Nombres Différents
```yaml
- variantes:
    - texte: '$5 + 3 = \dots$'
    - texte: '$15 + 8 = \dots$'
    - texte: '$125 + 78 = \dots$'
```

### Pattern 2 : Contexte Progressif
```yaml
- variantes:
    - texte: 'Convertis : $2 \, \text{h} = \dots \, \text{min}$'
      gs: "GS 13.4"
    - texte: 'Convertis : $1 \, \text{h} \, 30 \, \text{min} = \dots \, \text{min}$'
      gs: "GS 13.4"
    - texte: 'La randonnée vers Marla a duré $2 \, \text{h} \, 45$. Combien de minutes ?'
      gs: "GS 13.4"
```

### Pattern 3 : Abstraction Croissante
```yaml
- variantes:
    - texte: 'Un carré a un côté de $5 \, \text{cm}$. Son périmètre ?'
    - texte: 'Un rectangle $8 \times 3 \, \text{cm}$. Son périmètre ?'
    - texte: 'Le périmètre d''un carré est $36 \, \text{m}$. Son côté ?'
```

---

**Dernière mise à jour** : 2024-12-18  
**Analysé par** : Claude (Conseil IA)
