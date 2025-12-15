import { z, defineCollection } from 'astro:content';

const guideCollection = defineCollection({
  // ... (votre configuration guide existante, on n'y touche pas)
  type: 'content',
  schema: z.object({
    title: z.string(),
    niveau: z.string().optional(),
    theme: z.string().optional(),
    sous_theme: z.string().optional(),
    objectif: z.string().optional(),
    resume: z.string().optional(),
    format: z.string().optional().default('1/1'),
    contenus: z.array(z.string()).optional(),
    erreurs_frequentes: z.array(z.string()).optional(),
    competences: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    accordeons: z.array(z.object({ titre: z.string(), contenu: z.string() })).optional(),
    liens: z.array(z.object({ url: z.string(), label: z.string(), type: z.string().optional(), position: z.string().optional(), size: z.string().optional() })).optional(),
    rappel: z.string().optional(),
    illustration: z.string().optional(),
    difficulte: z.string().optional(),
    id: z.string().optional(),
  }),
});

// NOUVEAU SCHÉMA RAPIDOS
const rapidosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // ON CHANGE ICI : On remplace 'title' par 'numero'
    numero: z.string(), 
    
    // On garde les infos de contexte
    niveau: z.string(),
    periode: z.number().optional(),
    semaine: z.number().optional(),

    // ON CHANGE ICI : 'questions' devient une liste d'objets complexes
    questions: z.array(
      z.object({
        texte: z.string(),
        gs: z.string().optional
    })).optional(),
  }),
});

export const collections = {
  'guide': guideCollection,
  'rapidos': rapidosCollection,
};