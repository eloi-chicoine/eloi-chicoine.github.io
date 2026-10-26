// Découpe l'export Affinity (src/assets/svg/scenes.svg, 3 plans de travail côte à côte)
// en un fichier par univers : scene-graphisme.svg, scene-video.svg, scene-web.svg.
// À relancer après chaque nouvel export : npm run scenes
import { readFileSync, writeFileSync } from 'node:fs';

const dossier = new URL('../src/assets/svg/', import.meta.url);
const source = readFileSync(new URL('scenes.svg', dossier), 'utf8');
const NOMS = ['graphisme', 'video', 'web']; // dans l'ordre des plans de travail

const debutDefs = source.indexOf('<defs>');
const defs = source.slice(debutDefs, source.indexOf('</defs>') + 7);
const corps = source.slice(0, debutDefs);

// Début de chaque plan de travail : le rectangle « cadre » sans remplissage
const cadres = [...corps.matchAll(/<rect id="(_0\d[^"]*)"[^>]*x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" style="fill:none;"\/>/g)];
if (cadres.length !== NOMS.length) throw new Error(`${cadres.length} plans de travail trouvés, ${NOMS.length} attendus`);

const definition = (id) =>
  defs.match(new RegExp(`<(linearGradient|radialGradient|clipPath|filter|pattern|mask) id="${id}"[\\s\\S]*?</\\1>`))?.[0];

cadres.forEach((cadre, i) => {
  const fin = i + 1 < cadres.length ? cadres[i + 1].index : corps.length;
  const morceau = corps.slice(cadre.index, fin).replace(/<\/svg>\s*$/, '');
  const [, , x, y, w, h] = cadre;

  // Dégradés utilisés par ce plan (et ceux qu'ils citent eux-mêmes)
  const aTraiter = [...morceau.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
  const trouves = new Map();
  while (aTraiter.length) {
    const id = aTraiter.pop();
    if (trouves.has(id) || morceau.includes(`id="${id}"`)) continue;
    const el = definition(id);
    if (!el) continue;
    trouves.set(id, el);
    for (const m of el.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) aTraiter.push(m[1]);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMid slice" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:2;">
${morceau.replace(/ affinity:id="[^"]*"/g, '').trim()}
<defs>
${[...trouves.values()].join('\n')}
</defs>
</svg>
`;
  writeFileSync(new URL(`scene-${NOMS[i]}.svg`, dossier), svg);
  console.log(`scene-${NOMS[i]}.svg — ${(svg.length / 1024).toFixed(0)} Ko, ${trouves.size} dégradés`);
});
