// Vérifie que fr.json et en.json ont exactement les mêmes clés.
import { readFileSync } from 'node:fs';

const lire = (l) => JSON.parse(readFileSync(new URL(`../src/i18n/${l}.json`, import.meta.url), 'utf8'));

function cles(obj, prefixe = '') {
  if (Array.isArray(obj)) return [`${prefixe}[${obj.length}]`, ...obj.flatMap((v, i) => cles(v, `${prefixe}[${i}]`))];
  if (obj && typeof obj === 'object')
    return Object.entries(obj).flatMap(([k, v]) => cles(v, prefixe ? `${prefixe}.${k}` : k));
  return [prefixe];
}

const fr = new Set(cles(lire('fr')));
const en = new Set(cles(lire('en')));
const manqueEn = [...fr].filter((k) => !en.has(k));
const manqueFr = [...en].filter((k) => !fr.has(k));

if (manqueEn.length || manqueFr.length) {
  if (manqueEn.length) console.error('Manquant dans en.json :', manqueEn.join(', '));
  if (manqueFr.length) console.error('Manquant dans fr.json :', manqueFr.join(', '));
  process.exit(1);
}
console.log(`i18n OK (${fr.size} clés)`);
