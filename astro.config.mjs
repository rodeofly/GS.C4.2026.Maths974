import { defineConfig } from 'astro/config';

// On force la base URL si on est en prod, sinon '/'
const BASE_URL = process.env.NODE_ENV === 'production' ? '/GS.C4.2026.Maths974' : '';

export default defineConfig({
  srcDir: 'src',
  root: '.',
  site: 'https://rodeofly.github.io',
  base: BASE_URL, // Utilisation de la variable sécurisée
  server: {
    host: true,
  },
  markdown: {
    syntaxHighlight: false,
    smartypants: false,
  },
});