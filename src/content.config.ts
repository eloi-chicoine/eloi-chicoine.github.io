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
      // Vidéo hébergée avec le site : chemin dans public/ (ex. videos/mon-film.mp4)
      videoFichier: z.string().optional(),
      couverture: image().optional(),
      images: z
        .array(z.object({ src: image(), alt: bilingue }))
        .default([]),
      // 'planche' : toutes les images en grille régulière, entières (stickers, illustrations…)
      // 'maquettes' : la première en grand, les autres entières côte à côte (captures de tailles variées)
      // 'ecrans' : la première en grand, les autres 2 par 2, entières (captures d'écran de même format)
      galerie: z.enum(['standard', 'planche', 'maquettes', 'ecrans']).default('standard'),
      ordre: z.number().optional(),
      // true = texte provisoire, à remplacer par le vrai projet avant diffusion
      exemple: z.boolean().default(false),
      // true = exclu du site
      brouillon: z.boolean().default(false),
    }),
});

export const collections = { projets };
