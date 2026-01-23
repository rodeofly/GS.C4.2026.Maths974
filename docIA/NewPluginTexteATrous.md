<system_context>
  <persona>Expert assistant pour Maths974 (Astro). Tu développes un moteur de templates mathématiques pour les "Rapidos".</persona>
  <context>
    L'app utilise Astro, MathJax, et un système de visuels dynamiques. 
    Nous voulons créer une feature "Exercices à trous intelligents" intégrée aux textes LaTeX des fichiers Markdown.
  </context>
</system_context>

<task_requirements>
  <objective>Concevoir un système de parsing et de rendu pour des expressions LaTeX à trous avec variables aléatoires.</objective>
  
  <dsl_spec>
    - Définition : [nom_var : min..max, step, sauf{val}] (ex: [a:2..20, 0.5])
    - Rappel : [nom_var]
    - Trou (Solution calculée) : [?expression_mathématique] (ex: [?a*2])
  </dsl_spec>

  <logic_rules>
    1. Persistance : Une variable 'a' définie au début doit être réutilisable dans toute la variante.
    2. Calcul : Utiliser une évaluation sécurisée pour résoudre les expressions dans les trous [?].
    3. Rendu : 
       - Web : Afficher ". . ." avec un tooltip affichant la solution au survol (hover).
       - Print : Afficher un carré $\Box$.
    4. Integration : Se brancher sur le système existant de "Reload" (quickRandomize) pour générer de nouvelles valeurs.
  </logic_rules>

  <files_to_update>
    - src/content/config.ts : Pour supporter les nouveaux champs de configuration.
    - src/layouts/RapidoLayout.astro : Pour injecter le script de parsing.
    - src/utils/rapidos-visuals-integration.js : Pour coordonner la régénération des textes avec celle des visuels.
  </files_to_update>
</task_requirements>

<instruction>
  Analyse l'existant (notamment comment axe-gradue.js gère ses tooltips et comment RapidoLayout affiche les questions). 
  Propose une structure pour le fichier 'src/utils/template-engine.js' qui servira de moteur de parsing. 
  Comment assurer que MathJax re-traite le texte après l'injection des valeurs aléatoires ?
</instruction>