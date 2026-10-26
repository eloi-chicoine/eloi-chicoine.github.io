import fr from './fr.json';
import en from './en.json';

export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];

const dictionnaires = { fr, en };

/** Texte traduit : t('fr', 'hero.title') */
export function t(lang: Lang, cle: string): string {
  const valeur = cle
    .split('.')
    .reduce<any>((obj, k) => (obj == null ? undefined : obj[k]), dictionnaires[lang]);
  if (typeof valeur !== 'string') throw new Error(`Traduction manquante : ${lang}.${cle}`);
  return valeur;
}

/** Bloc brut (tableaux, objets) : dict('fr').panels.path.items */
export function dict(lang: Lang) {
  return dictionnaires[lang];
}

/** Choisit la bonne langue dans un champ { fr, en } des projets. */
export function tr(lang: Lang, texte: { fr: string; en: string }) {
  return texte[lang];
}

// Segment d'URL des pages projet selon la langue.
const segmentProjets: Record<Lang, string> = { fr: 'projets', en: 'projects' };

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Adresse interne avec le préfixe de langue et la base du site : url('en', '/') → /en/ */
export function url(lang: Lang, chemin = '/') {
  const prefixe = lang === 'fr' ? '' : `/${lang}`;
  const propre = chemin.startsWith('/') ? chemin : `/${chemin}`;
  return `${base}${prefixe}${propre}`;
}

export function urlAccueil(lang: Lang, ancre = '') {
  return url(lang, '/') + (ancre ? `#${ancre}` : '');
}

export function urlProjet(lang: Lang, slug: string) {
  return url(lang, `/${segmentProjets[lang]}/${slug}/`);
}

/** Fichier de public/ (CV…) */
export function asset(chemin: string) {
  return `${base}/${chemin.replace(/^\//, '')}`;
}

export function autreLangue(lang: Lang): Lang {
  return lang === 'fr' ? 'en' : 'fr';
}

/** "2025-03" → "mars 2025" / "March 2025" */
export function formatDate(lang: Lang, date: string) {
  const [annee, mois] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(annee, mois - 1, 1));
}
