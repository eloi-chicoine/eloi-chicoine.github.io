// @ts-check
import { defineConfig } from 'astro/config';

// Adresse du site. Pour changer d'URL (nouveau nom de compte GitHub,
// nom de domaine…), il suffit de modifier ces deux valeurs.
// - dépôt "eloi-chicoine.github.io" du compte eloi-chicoine → https://eloi-chicoine.github.io/ (BASE = '/')
// - autre nom de dépôt → BASE = '/<nom-du-depot>' ; nom de domaine perso → SITE = 'https://…', BASE = '/'
const SITE = process.env.SITE_URL ?? 'https://eloi-chicoine.github.io';
const BASE = process.env.SITE_BASE ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  // Politique de sécurité du contenu (CSP) : Astro calcule les empreintes des scripts et styles
  // du site ; seuls Web3Forms (formulaire) et YouTube / Vimeo (vidéos) sont autorisés en plus.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://api.web3forms.com",
        "form-action 'self' https://api.web3forms.com",
        "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
        "base-uri 'self'",
        "object-src 'none'",
      ],
      // Les scènes SVG d'Affinity utilisent des attributs style="" : on les autorise
      // (un attribut de style ne peut pas exécuter de code).
      styleDirective: {
        resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
