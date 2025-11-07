import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: 'src',
  root: '.',
  server: {
    host: true,
  },
  markdown: {
    syntaxHighlight: false,
  },
});
