// src/content/config.ts
import { z, defineCollection } from 'astro:content';

// On réutilise le même schéma pour les deux pour l'instant (titre, niveau, etc.)
const schemaCommun = z.object({
    title: z.string(),
    niveau: z.string().optional(),
    theme: z.string().optional(),
    sous_theme: z.string().optional(),
    objectif: z.string().optional(),
    resume: z.string().optional(),

    // Listes
    contenus: z.array(z.string()).optional(),
    erreurs_frequentes: z.array(z.string()).optional(),
    competences: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),

    // Objets complexes
    accordeons: z.array(
    z.object({
    titre: z.string(),
    contenu: z.string(),
    })
    ).optional(),

    liens: z.array(
    z.object({
    url: z.string(),
    label: z.string(),
    type: z.string().optional(),
    position: z.string().optional(), // pour le QRCode
    size: z.string().optional(),
    })
    ).optional(),

    // Autres
    rappel: z.string().optional(),
    illustration: z.string().optional(),
    difficulte: z.string().optional(),
    id: z.string().optional(),
 
});

const guideCollection = defineCollection({
  type: 'content',
  schema: schemaCommun,
});

// Ajoutez ou modifiez le schéma rapidos
const rapidosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    niveau: z.string(),
    periode: z.number().optional(), // Nouveau
    semaine: z.number().optional(), // Nouveau
    questions: z.array(z.string()).optional(), // La liste des 5 questions
  }),
});

export const collections = {
  'guide': guideCollection,
  'rapidos': rapidosCollection,
};