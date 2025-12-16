import { defineConfig } from 'astro/config';

// Détecte si on est en mode "production" (build) ou "développement" (dev)
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  srcDir: 'src',
  root: '.',
  // URL de ton site GitHub Pages
  site: 'https://rodeofly.github.io',
  
  // 🛠️ BASE DYNAMIQUE :
  // - En Prod (GitHub) : on utilise le nom du dépôt
  // - En Local (Ordi)  : on reste à la racine '/'
  base: isProd ? '/GS.C4.2026.Maths974' : '/',

  server: {
    host: true,
  },
  markdown: {
    syntaxHighlight: false,
    smartypants: false,
  },
});