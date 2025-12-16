import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: 'src',
  root: '.',
  // URL de ton site GitHub Pages
  site: 'https://rodeofly.github.io',
  
  // Nom de ton dépôt (attention à la casse, c'est important !)
  base: '/GS.C4.2026.Maths974',

  server: {
    host: true,
  },
  markdown: {
    syntaxHighlight: false,
    smartypants: false,
  },
});