---
import { getEntry } from 'astro:content';
import A4Layout from '../../layouts/A4.astro';

// On va chercher le fichier arborescence/index.md dans la collection
const entry = await getEntry('guide', 'arborescence/index');

if (!entry) {
  throw new Error("⚠️ Fichier 'src/content/guide/arborescence/index.md' introuvable !");
}

const { Content } = await entry.render();
---

<A4Layout info={entry} niveau="Ressource" theme="Général" sousTheme="Navigation">
  <article class="etiquette format-1_1">
    <header class="etiquette-header">
      <h2 class="etiquette-title">{entry.data.title}</h2>
    </header>
    <section class="etiquette-section section-texte">
      <div class="arborescence-container">
        <Content />
      </div>
    </section>
  </article>
</A4Layout>

<style>
  /* Pour afficher l'arbre proprement */
  .arborescence-container :global(pre) {
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #cbd5e1;
    font-family: monospace;
    line-height: 1.4;
  }
</style>