import { z, defineCollection } from 'astro:content';

const guideCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    niveau: z.string().optional(),
    theme: z.string().optional(),
    sous_theme: z.string().optional(),
    objectif: z.string().optional(),
    resume: z.string().optional(),
    format: z.string().optional().default('1/1'),
    full_width: z.boolean().optional().default(false),
    contenus: z.array(z.string()).optional(),
    erreurs_frequentes: z.array(z.string()).optional(),
    competences: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    accordeons: z.array(
      z.object({ 
        titre: z.string(), 
        contenu: z.string() 
      })
    ).optional(),
    liens: z.array(
      z.object({ 
        url: z.string(), 
        label: z.string(), 
        type: z.string().optional(), 
        position: z.string().optional(), 
        size: z.string().optional() 
      })
    ).optional(),
    rappel: z.string().optional(),
    illustration: z.string().optional(),
    difficulte: z.string().optional(),
    id: z.string().optional(),
  }),
});

const rapidosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(), // Pour les fichiers index.md
    numero: z.string().optional(), // ← RENDRE OPTIONNEL
    niveau: z.string(),
    theme: z.string().optional(),
    periode: z.number().optional(),
    semaine: z.number().optional(),
    questions: z.array(
      z.object({
        texte: z.string(),
        gs: z.string().optional(),
      })
    ).optional(),
  }),
});

export const collections = {
  'guide': guideCollection,
  'rapidos': rapidosCollection,
};