import { getCollection, type CollectionEntry } from 'astro:content';
import { UNIVERS, type Univers } from '../content.config';

export type Projet = CollectionEntry<'projets'>;

let avertissement = false;

/** Projets publiés, rangés par univers, puis par `ordre`, puis du plus récent au plus ancien. */
export async function getProjets(): Promise<Projet[]> {
  const tous = await getCollection('projets', ({ data }) => !data.brouillon);

  const exemples = tous.filter((p) => p.data.exemple);
  if (exemples.length && !avertissement) {
    avertissement = true;
    console.warn(
      `\n⚠ ${exemples.length} projet(s) ont encore un texte d'exemple (exemple: true) : ${exemples.map((p) => p.id).join(', ')}\n`,
    );
  }

  return tous.sort(
    (a, b) =>
      UNIVERS.indexOf(a.data.univers) - UNIVERS.indexOf(b.data.univers) ||
      (a.data.ordre ?? 99) - (b.data.ordre ?? 99) ||
      b.data.date.localeCompare(a.data.date),
  );
}

export function parUnivers(projets: Projet[]) {
  return UNIVERS.map((univers) => ({
    univers,
    projets: projets.filter((p) => p.data.univers === univers),
  }));
}

/** Numéro du projet dans son univers : "01" à "06" */
export function numero(projets: Projet[], projet: Projet) {
  const liste = projets.filter((p) => p.data.univers === projet.data.univers);
  return String(liste.findIndex((p) => p.id === projet.id) + 1).padStart(2, '0');
}

/** Projet suivant dans le même univers (on revient au premier après le dernier). */
export function suivant(projets: Projet[], projet: Projet) {
  const liste = projets.filter((p) => p.data.univers === projet.data.univers);
  return liste[(liste.findIndex((p) => p.id === projet.id) + 1) % liste.length];
}

export const indexUnivers = (u: Univers) => String(UNIVERS.indexOf(u) + 1).padStart(2, '0');
