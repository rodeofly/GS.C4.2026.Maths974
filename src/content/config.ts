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
    competences: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    liens: z.array(z.object({ url: z.string(), label: z.string(), type: z.string().optional(), position: z.string().optional(), size: z.string().optional() })).optional(),
    id: z.string().optional(),
    pdf: z.object({
      page: z.number(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    }).optional(),
    blocs: z.array(z.discriminatedUnion('type', [
      z.object({ type: z.literal('enonce'),      contenu: z.string() }),
      z.object({ type: z.literal('redaction'),   contenu: z.string() }),
      z.object({ type: z.literal('illustration'),url: z.string(), alt: z.string().optional() }),
      z.object({ type: z.literal('retenir'),     items: z.array(z.string()) }),
      z.object({ type: z.literal('erreur'),      items: z.array(z.string()) }),
      z.object({ type: z.literal('rappel'),      contenu: z.string() }),
      z.object({ type: z.literal('accordeon'),   titre: z.string(), contenu: z.string() }),
      z.object({ type: z.literal('tableau'),     entetes: z.array(z.string()), lignes: z.array(z.array(z.string())) }),
    ])).optional(),
  }),
});

const rapidosCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    numero: z.string().optional(),
    niveau: z.string().optional(),
    theme: z.string().optional(),
    periode: z.number().optional(),
    semaine: z.number().optional(),
    questions: z.array(
      z.object({
        variantes: z.array(
          z.object({
            texte: z.string().optional(),
            gs: z.string().optional(),
            type: z.string().optional(),
            config: z.record(z.any()).optional(),
            rand: z.record(z.any()).optional(),
            reponse: z.string().optional(),
          })
        )
      })
    ).optional(),
  }),
});

const automathsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    niveau: z.string().optional(),
    theme: z.string().optional(),
    sous_theme: z.string().optional(),
    gs: z.string().optional(),
    variantes: z.array(
      z.object({
        texte: z.string().optional(),
        gs: z.string().optional(),
        type: z.string().optional(),
        config: z.record(z.any()).optional(),
        rand: z.record(z.any()).optional(),
        reponse: z.string().optional(),
      })
    ).optional(),
  }),
});

export const collections = { 'guide': guideCollection, 'rapidos': rapidosCollection, 'automaths': automathsCollection };