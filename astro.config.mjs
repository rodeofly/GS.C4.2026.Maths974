import { defineConfig } from 'astro/config';

// ⚠️ CHANGE CECI : Si tu es en local, c'est vide. Si tu es sur GitHub, c'est le nom du repo.
// La ligne ci-dessous détecte automatiquement si on construit pour GitHub Pages
const isProd = process.env.npm_lifecycle_event === 'build';
const BASE_URL = isProd ? '/GS.C4.2026.Maths974' : '';

export default defineConfig({
  srcDir: 'src',
  root: '.',
  site: 'https://rodeofly.github.io',
  base: BASE_URL,
  server: {
    host: true,
  },
  markdown: {
    syntaxHighlight: false,
    smartypants: false,
  },
});