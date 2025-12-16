import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: 'src',
  root: '.',
  // URL de ton site GitHub Pages
  site: 'https://rodeofly.github.io',
  base: '/GS.C4.2026.Maths974', // ⚠️ Vérifie que c'est bien écrit comme sur GitHub

  server: {
    host: true,
  },
  markdown: {
    syntaxHighlight: false,
    smartypants: false,
  },
});