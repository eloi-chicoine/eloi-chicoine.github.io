# Portfolio — Eloi Chicoine

Astro + GSAP. Site statique, FR / EN.

## Lancer en local

```bash
npm install
npm run voir
```

Puis ouvrir http://localhost:4321/

`npm run voir` compile le site puis l'affiche : c'est la version fiable, identique au site en ligne.
L'aperçu tourne en arrière-plan ; pour l'arrêter : `npx astro preview stop`.
`npm run dev` (rechargement automatique) ne reprend pas toujours les modifications sur cette
machine (Node 26 + Astro 5) : en cas de doute, arrêter et relancer `npm run voir`.

## Où modifier quoi

| Je veux…                         | Fichier                                     |
| -------------------------------- | ------------------------------------------- |
| Ajouter / modifier un projet     | `src/content/projets/<nom>.yaml`            |
| Ajouter les images d'un projet   | `src/assets/projets/<nom>/` puis le `.yaml` |
| Changer un texte du site         | `src/i18n/fr.json` et `src/i18n/en.json`    |
| Changer outils, e-mail, LinkedIn | `src/data/profil.ts`                        |
| Changer ma photo (N&B, détourée) | `src/assets/photos/portrait.webp` (fond transparent conseillé) |
| Remplacer le CV                  | `public/cv/CV-Chicoine_Eloi.pdf` (si le nom change : `src/data/profil.ts`) |
| Couleurs, typos, grille          | `src/styles/tokens.css`                     |
| Changer les scènes des univers   | réexporter `src/assets/svg/scenes.svg` depuis Affinity, puis `npm run scenes` |

Un projet avec `brouillon: true` n'apparaît pas. Les projets avec `exemple: true`
ont un texte provisoire : le build les liste en avertissement.

`npm run build` vérifie aussi que `fr.json` et `en.json` ont les mêmes clés.

## Formulaire de contact

1. Créer une clé gratuite sur https://web3forms.com (avec l'adresse qui doit recevoir les messages).
2. En local : copier `.env.example` en `.env` et coller la clé.
3. Sur GitHub : Settings → Secrets and variables → Actions → Variables → `PUBLIC_WEB3FORMS_KEY`.

## Mise en ligne (GitHub Pages)

1. Dépôt : https://github.com/eloi-chicoine/eloi-chicoine.github.io (branche `main`).
2. Dans le dépôt : Settings → Pages → Source : **GitHub Actions**.
3. Chaque push sur `main` publie le site sur https://eloi-chicoine.github.io/

Pour une autre adresse, définir les variables `SITE_URL` et `SITE_BASE` (voir `astro.config.mjs`).
