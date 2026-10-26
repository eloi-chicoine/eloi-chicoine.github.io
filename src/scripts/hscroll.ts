// Défilement horizontal de l'accueil sur desktop (GSAP ScrollTrigger).
// La molette verticale fait avancer la piste vers la droite. À l'arrivée de chaque univers,
// la grille du plan et le dessin au trait de la scène se tracent, puis la couleur les remplace.
// Mobile, prefers-reduced-motion ou sans JavaScript : tout reste vertical.
import { gsap, reducedMotion } from './motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

interface Revelation {
  chapitre: HTMLElement;
  couleur: SVGGElement; // la scène en couleur
  traits: SVGGElement; // copie de la scène, en traits seulement
  formes: SVGElement[];
  grille: HTMLElement | null;
  mots: HTMLElement[]; // mots de la phrase « Mes productions : … »
  contenu: HTMLElement[];
}

/** Prépare un univers : on double sa scène avec une version « au trait ». */
function preparer(chapitre: HTMLElement): Revelation | null {
  const svg = chapitre.querySelector<SVGSVGElement>('.chapter__scene svg');
  const couleur = svg?.querySelector<SVGGElement>(':scope > g[clip-path]');
  if (!svg || !couleur) return null;
  const traits = couleur.cloneNode(true) as SVGGElement;
  traits.classList.add('scene-traits');
  traits.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  svg.appendChild(traits);
  return {
    chapitre,
    couleur,
    traits,
    formes: [...traits.querySelectorAll<SVGElement>('path, rect, circle, ellipse, polygon, polyline, line')],
    grille: chapitre.querySelector<HTMLElement>('.grid-lines'),
    mots: [...chapitre.querySelectorAll<HTMLElement>('.mot__in')],
    contenu: [...chapitre.querySelectorAll<HTMLElement>('.tile')],
  };
}

// Même requête que le script en ligne de Base.astro
export const HSCROLL_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

let piste: gsap.core.Timeline | null = null;
let pisteEl: HTMLElement | null = null;

/** Ajoute à une timeline la révélation d'un univers, sur une durée d à partir de debut :
    0 → 75 % : le dessin se trace ; 60 → 95 % : la couleur arrive ; 70 → 100 % : la grille et
    les traits s'effacent ; 68 → 100 % : la phrase monte mot par mot ; 80 → 100 % : les projets. */
function reveler(tl: gsap.core.Timeline, r: Revelation, debut: number, d: number) {
  tl.fromTo(r.formes, { drawSVG: '0%' }, { drawSVG: '100%', duration: d * 0.6, stagger: { amount: d * 0.15 } }, debut)
    .fromTo(r.couleur, { opacity: 0 }, { opacity: 1, duration: d * 0.35 }, debut + d * 0.6)
    .fromTo([r.traits, r.grille], { opacity: 1 }, { opacity: 0, duration: d * 0.3 }, debut + d * 0.7)
    .fromTo(r.mots, { yPercent: 110 }, { yPercent: 0, duration: d * 0.12, stagger: d * 0.03, ease: 'power3.out' }, debut + d * 0.68)
    // opacité seule (pas visibility) : les projets restent atteignables au clavier
    .fromTo(r.contenu, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: d * 0.16, stagger: d * 0.008 }, debut + d * 0.8);
}

/** Calques animés d'un ensemble d'univers (pour tout remettre à zéro). */
const calques = (revs: Revelation[]) =>
  revs.flatMap((r) => [r.couleur, r.traits, ...r.formes, r.grille, ...r.mots, ...r.contenu]).filter(Boolean);

/** Mobile / tablette portrait : la même révélation, pilotée par le défilement vertical. */
function initVertical(track: HTMLElement) {
  gsap.matchMedia().add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
    const html = document.documentElement;
    html.classList.add('anim-chapitres');
    const revs = [...track.querySelectorAll<HTMLElement>('[data-chapter-reveal]')]
      .map(preparer)
      .filter((r): r is Revelation => r !== null);
    const tls = revs.map((r) => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: r.chapitre, start: 'top 90%', end: 'top 5%', scrub: 0.5 },
      });
      reveler(tl, r, 0, 1);
      return tl;
    });
    return () => {
      html.classList.remove('anim-chapitres');
      tls.forEach((tl) => {
        tl.scrollTrigger?.kill();
        tl.kill();
      });
      gsap.set(calques(revs), { clearProps: 'all' });
      revs.forEach((r) => r.traits.remove());
    };
  });
}

export function initHScroll() {
  const wrap = document.querySelector<HTMLElement>('[data-hscroll]');
  const track = wrap?.querySelector<HTMLElement>('[data-track]');
  if (!wrap || !track) return;
  pisteEl = track;

  const html = document.documentElement;
  const mm = gsap.matchMedia();

  // Au lancement et au rechargement, on part toujours de l'accueil : pas de restauration
  // automatique de la position de scroll (navigateur et ScrollTrigger).
  ScrollTrigger.clearScrollMemory('manual');
  const ancre = location.hash.slice(1);
  if (!ancre || !document.getElementById(ancre)) window.scrollTo(0, 0);
  // Une ancre venant d'une autre page (#video, #moi…) sert une fois, puis on l'efface de l'adresse
  // pour qu'un rechargement ramène à l'accueil. (Délai : panels.ts la lit d'abord.)
  if (ancre) setTimeout(() => history.replaceState(null, '', location.pathname + location.search), 100);

  initVertical(track);

  mm.add(HSCROLL_QUERY, () => {
    html.classList.add('is-h', 'anim-chapitres');
    const revelations = [...track.querySelectorAll<HTMLElement>('[data-chapter-reveal]')]
      .map(preparer)
      .filter((r): r is Revelation => r !== null);
    const animes = [track, ...calques(revelations)];

    // Timeline en pixels : à l'instant t, la piste est décalée de t.
    const construire = () => {
      // Progression lue sur la position réelle du scroll (la valeur de ScrollTrigger peut avoir une image de retard)
      const ancien = piste?.scrollTrigger;
      const progression = ancien ? gsap.utils.clamp(0, 1, (window.scrollY - ancien.start) / (ancien.end - ancien.start || 1)) : 0;
      piste?.scrollTrigger?.kill();
      piste?.kill();
      gsap.set(animes, { clearProps: 'all' });

      const vw = window.innerWidth;
      const distance = track.scrollWidth - vw;
      piste = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: wrap, pin: true, scrub: 0.6, end: `+=${distance}` },
      });
      piste.to(track, { x: -distance, duration: distance }, 0);

      // Chaque univers se révèle pendant qu'il glisse dans l'écran (durée = une largeur d'écran)
      const origine = track.getBoundingClientRect().left;
      revelations.forEach((r) => {
        const fin = r.chapitre.getBoundingClientRect().left - origine;
        const debut = Math.max(0, fin - vw);
        if (fin - debut > 0) reveler(piste!, r, debut, fin - debut);
      });

      // Recalcul immédiat des bornes (et de l'espace d'épinglage) avant de restaurer la position,
      // sinon un redimensionnement renvoyait à l'accueil.
      ScrollTrigger.refresh();
      const st = piste.scrollTrigger!;
      if (progression) {
        window.scrollTo({ top: st.start + progression * (st.end - st.start), behavior: 'instant' });
        sauterLissage();
      }
    };
    construire();

    let delai = 0;
    const redimension = () => {
      clearTimeout(delai);
      delai = window.setTimeout(construire, 200);
    };
    window.addEventListener('resize', redimension);

    // Glissé horizontal au trackpad → même effet que la molette
    const molette = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        window.scrollBy(0, e.deltaX);
      }
    };
    window.addEventListener('wheel', molette, { passive: false });

    // Navigation au clavier : on amène à l'écran l'élément qui reçoit le focus
    const focus = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      const r = el.getBoundingClientRect();
      if (r.left < 0 || r.right > window.innerWidth) aller(el, false);
    };
    track.addEventListener('focusin', focus);

    document.fonts?.ready.then(construire);

    // Arrivée avec une ancre (#contact, #video…) depuis une autre page
    const cible = location.hash && document.getElementById(location.hash.slice(1));
    if (cible && track.contains(cible) && !cible.matches('[data-panel]')) {
      setTimeout(() => aller(cible, false), 0);
    }

    return () => {
      html.classList.remove('is-h', 'anim-chapitres');
      window.removeEventListener('wheel', molette);
      window.removeEventListener('resize', redimension);
      piste?.scrollTrigger?.kill();
      piste?.kill();
      gsap.set(animes, { clearProps: 'all' });
      revelations.forEach((r) => r.traits.remove());
      track.removeEventListener('focusin', focus);
      piste = null;
    };
  });

  // Liens internes (#…) : en mode horizontal, on calcule la position de défilement
  document.addEventListener('click', (e) => {
    const lien = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!lien || lien.pathname !== location.pathname || lien.hasAttribute('data-panel-trigger')) return;
    if (lien.hasAttribute('data-open-panel')) return; // géré par panels.ts
    const cible = document.getElementById(decodeURIComponent(lien.hash.slice(1)));
    if (!cible) return;
    // On ne met pas l'ancre dans l'adresse : un rechargement doit ramener à l'accueil
    e.preventDefault();
    aller(cible, true);
  });

  initRepere(track);
}

/** Fait défiler jusqu'à un élément, en vertical ou en horizontal. */
export function aller(el: HTMLElement, doux = true) {
  const behavior: ScrollBehavior = doux && !reducedMotion() ? 'smooth' : 'instant';
  const st = piste?.scrollTrigger;
  if (!st) return el.scrollIntoView({ behavior });

  const track = pisteEl!;
  // Le chapitre ou panneau qui contient l'élément sert de repère
  const repere = el.closest<HTMLElement>('[data-chapter]') ?? el;
  const gauche = repere.getBoundingClientRect().left - track.getBoundingClientRect().left;
  const y = st.start + Math.min(Math.max(gauche, 0), st.end - st.start);
  window.scrollTo({ top: y, behavior });
  if (behavior === 'instant') sauterLissage();
}

/** Saut immédiat : on ne montre pas le glissé du lissage (scrub). */
function sauterLissage() {
  const st = piste?.scrollTrigger;
  if (!st) return;
  st.update();
  const lissage = st.getTween();
  // Pas encore de lissage en cours (juste après une reconstruction) : on place la timeline directement
  if (lissage) lissage.progress(1);
  else piste!.progress(st.progress);
}

/** Position de défilement (scrollY) qui amène une section à l'écran, en horizontal ou en vertical. */
function positionDe(section: HTMLElement) {
  const st = piste?.scrollTrigger;
  if (st && pisteEl) {
    const gauche = section.getBoundingClientRect().left - pisteEl.getBoundingClientRect().left;
    return st.start + Math.min(Math.max(gauche, 0), st.end - st.start);
  }
  return section.getBoundingClientRect().top + window.scrollY;
}

/** Repère en bas d'écran : graduations des étapes, personnage qui roule avec le scroll,
    étape courante, et liste de tous les projets. */
function initRepere(track: HTMLElement) {
  const repere = document.querySelector<HTMLElement>('[data-repere]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-list-dialog]');
  if (!repere) return;

  const rail = repere.querySelector<HTMLElement>('[data-rail]')!;
  const chibi = repere.querySelector<HTMLElement>('[data-chibi]');
  const etapes = [...repere.querySelectorAll<HTMLElement>('[data-etape]')];
  const sections = [...track.querySelectorAll<HTMLElement>('[data-chapter]')];
  const liens = [...repere.querySelectorAll<HTMLAnchorElement>('[data-nav]')];
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  let courant = '';
  let dernierX = 0;

  // Graduations aux vraies positions des sections sur la course du scroll
  const placer = () => {
    etapes.forEach((etape) => {
      const section = sections.find((s) => s.dataset.chapter === etape.dataset.etape);
      if (section) etape.style.setProperty('--pos', String(Math.min(positionDe(section) / maxScroll(), 1)));
    });
    suivre(true);
  };

  // Le personnage avance avec le scroll, se penche selon la vitesse et regarde dans le sens du mouvement
  const redresser = gsap.delayedCall(0.18, () => gsap.to(chibi, { rotation: 0, duration: 0.5, ease: 'power2.out' })).pause();
  const suivre = (immediat = false) => {
    if (!chibi) return;
    const x = (window.scrollY / maxScroll()) * rail.clientWidth;
    const dx = x - dernierX;
    dernierX = x;
    if (immediat || reducedMotion()) {
      gsap.set(chibi, { x });
      return;
    }
    gsap.to(chibi, { x, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    if (Math.abs(dx) > 1) {
      gsap.to(chibi, {
        rotation: gsap.utils.clamp(-14, 14, dx * 0.12),
        scaleX: dx < 0 ? -1 : 1,
        duration: 0.25,
        overwrite: 'auto',
      });
      redresser.restart(true);
    }
  };

  // Étape courante : la section qui occupe le centre de l'écran
  const maj = () => {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const actif = sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.left <= x && r.right > x && r.top <= y && r.bottom > y;
    });
    const id = actif?.dataset.chapter ?? 'accueil';
    if (id === courant) return;
    courant = id;
    liens.forEach((l) => l.setAttribute('aria-current', String(l.dataset.nav === id)));
  };

  let attente = false;
  const surScroll = () => {
    if (attente) return;
    attente = true;
    requestAnimationFrame(() => {
      attente = false;
      suivre();
      maj();
    });
  };
  window.addEventListener('scroll', surScroll, { passive: true });
  // Le lissage (scrub) continue après le dernier événement scroll : on revérifie l'étape
  // courante quelques fois par seconde (5 rectangles, coût négligeable).
  let image = 0;
  gsap.ticker.add(() => {
    if (++image % 12 === 0) maj();
  });

  let delai = 0;
  const recalculer = () => {
    clearTimeout(delai);
    delai = window.setTimeout(() => {
      placer();
      maj();
    }, 300);
  };
  window.addEventListener('resize', recalculer);
  window.addEventListener('load', recalculer);
  document.fonts?.ready.then(recalculer);
  ScrollTrigger.addEventListener('refresh', recalculer);
  recalculer();

  if (dialog) {
    document.querySelectorAll('[data-list-open]').forEach((b) => b.addEventListener('click', () => dialog.showModal()));
    dialog.querySelector('[data-list-close]')?.addEventListener('click', () => dialog.close());
    // Clic sur le fond : fermer
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  }
}
