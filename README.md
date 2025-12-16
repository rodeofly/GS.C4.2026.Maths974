# 🌋 Guide de Survie Maths974

[![Demo](https://img.shields.io/badge/Demo-Visiter%20le%20site-2ea44f?style=for-the-badge&logo=github)](https://rodeofly.github.io/GS.C4.2026.Maths974/)
![Astro](https://img.shields.io/badge/Astro-4.0-BC027F?style=for-the-badge&logo=astro)
![Tailwind CSS](https://img.shields.io/badge/CSS-Modern-38B2AC?style=for-the-badge&logo=css3)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **"Les maths, c'est comme le cari : meilleur quand on a la bonne recette."** 🍛

Bienvenue sur le dépôt du **Guide de Survie Maths974**, une plateforme éducative moderne conçue pour aider les élèves de la Réunion (et d'ailleurs) à maîtriser les mathématiques du Collège au Lycée !

## 🌟 Fonctionnalités

* **📚 Fiches de Révision (Guides)** : Des synthèses claires, classées par niveau et par thème.
* **⚡ Rapidos** : Exercices rituels quotidiens avec système de différenciation (variantes progressives).
* **📱 Responsive & Mobile-First** : Pensé pour être utilisé sur téléphone en classe ou à la maison.
* **🖨️ Mode Impression Optimisé** : Rendu A4 et A5 parfait pour les profs qui veulent imprimer les fiches.
* **🔍 Recherche Instantanée** : Moteur de recherche rapide avec filtres (niveau, thème).
* **⭐ Favoris & Historique** : Pour retrouver ses fiches préférées en un clic.

## 🛠️ Stack Technique

Ce projet est propulsé par **Astro**, le framework web pour les sites orientés contenu.

* **Framework** : [Astro](https://astro.build)
* **Styling** : CSS natif (Architecture modulaire)
* **Maths** : [MathJax](https://www.mathjax.org/) & [TikZJax](https://tikzjax.com/) pour le rendu LaTeX/Graphique.
* **Contenu** : Markdown (`.md`) & MDX.
* **Déploiement** : GitHub Pages (via GitHub Actions).

## 🚀 Démarrage Rapide

Tu veux lancer le projet sur ta machine ? C'est parti !

### 1. Prérequis

Assure-toi d'avoir **Node.js** (v18+) installé.

### 2. Installation

Clone le dépôt et installe les dépendances :

```bash
git clone [https://github.com/rodeofly/GS.C4.2026.Maths974.git](https://github.com/rodeofly/GS.C4.2026.Maths974.git)
cd GS.C4.2026.Maths974
npm install
````

### 3\. Lancer le serveur de développement

```bash
npm run dev
```

Ouvre ton navigateur sur `http://localhost:4321` et admire le résultat \! 🦎

## 📂 Structure du Projet

```text
src/
├── components/   # Composants UI (Navbar, Etiquette, Slider...)
├── content/      # La base de données (Fiches Markdown)
│   ├── guide/    # Fiches de cours
│   └── rapidos/  # Exercices rituels
├── layouts/      # Mises en page (A4, RapidoLayout...)
├── pages/        # Routes du site (index, recherche...)
└── styles/       # CSS global et modulaire
```

## 📝 Comment ajouter du contenu ?

### Ajouter un Rapido

Crée un fichier `.md` dans `src/content/rapidos/[niveau]/` :

```yaml
---
numero: "1.1"
niveau: "6ème"
questions:
  - variantes:
      - texte: "$5 + 3 = \\dots$"
      - texte: "$15 + 8 = \\dots$"
---
```

### Ajouter une Fiche Guide

Crée un fichier `.md` dans `src/content/guide/[niveau]/[theme]/` :

```yaml
---
title: "Théorème de Pythagore"
niveau: "4ème"
id: "4-GEO-1"
---
Le carré de l'hypoténuse...
```

## 🤝 Contribuer

Les contributions sont les bienvenues \! Si tu as une idée pour améliorer le site ou corriger une coquille :

1.  Fork le projet
2.  Crée ta branche (`git checkout -b feature/AmazingFeature`)
3.  Commit tes changements (`git commit -m 'Add some AmazingFeature'`)
4.  Push vers la branche (`git push origin feature/AmazingFeature`)
5.  Ouvre une Pull Request

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

-----

*Fait avec ❤️ et un peu de soleil 🇷🇪 par [Rodeofly](https://github.com/rodeofly)*

