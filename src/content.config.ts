import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Un texte dans les deux langues : { fr: "…", en: "…" }
const bilingue = z.object({ fr: z.string().min(1), en: z.string().min(1) });

export const UNIVERS = ['graphisme', 'video', 'web'] as const;
export type Univers = (typeof UNIVERS)[number];

const projets = defineCollection({
  // Un fichier .yaml par projet ; le nom du fichier sert d'adresse (slug).
  loader: glob({ pattern: '*.yaml', base: './src/content/projets' }),
  schema: ({ image }) =>
    z.object({
      titre: bilingue,
      date: z.string().regex(/^\d{4}-\d{2}$/, 'Format attendu : AAAA-MM'),
      univers: z.enum(UNIVERS),
      resume: bilingue,
      description: bilingue,
      outils: z.array(z.string()).default([]),
      lien: z.string().url().optional(),
      video: z.string().url().optional(),
      couverture: image().optional(),
      images: z
        .array(z.object({ src: image(), alt: bilingue }))
        .default([]),
      ordre: z.number().optional(),
      // true = texte provisoire, à remplacer par le vrai projet avant diffusion
      exemple: z.boolean().default(false),
      // true = exclu du site
      brouillon: z.boolean().default(false),
    }),
});

export const collections = { projets };
