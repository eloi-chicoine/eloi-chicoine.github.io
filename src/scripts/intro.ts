// Intro de l'accueil : le plan se construit (traits verticaux, bandes, spirale de Fibonacci),
// puis le contenu apparaît en fondu. Une fois par visite (sessionStorage), ≈ 1,8 s.
// L'état de départ est posé en CSS par la classe .is-intro (script en ligne de Base.astro).
import { gsap } from './motion';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);

export function initIntro() {
  const html = document.documentElement;
  const accueil = document.querySelector<HTMLElement>('.panel--home');
  if (!html.classList.contains('is-intro') || !accueil) return;

  const lignes = [...accueil.querySelectorAll<HTMLElement>('.grid-lines > span')];
  const bandes = [...accueil.querySelectorAll<HTMLElement>('.band')];
  const spirale = accueil.querySelector<HTMLElement>('.spiral');
  const traits = spirale ? [...spirale.querySelectorAll<SVGElement>('rect, path')] : [];
  const contenu = [...document.querySelectorAll<HTMLElement>('[data-intro]')];

  const fin = () => {
    html.classList.remove('is-intro');
    gsap.set([...lignes, ...bandes, ...traits, ...contenu, spirale].filter(Boolean), { clearProps: 'all' });
    try {
      sessionStorage.setItem('intro-vue', '1');
    } catch {}
  };

  gsap
    .timeline({ defaults: { ease: 'power2.inOut' }, onComplete: fin })
    // 1. Les traits verticaux du plan descendent, les bandes horizontales s'étendent
    .fromTo(lignes, { scaleY: 0 }, { scaleY: 1, duration: 0.75, stagger: 0.08, transformOrigin: '50% 0%' }, 0)
    .fromTo(bandes, { scaleX: 0 }, { scaleX: 1, duration: 0.65, stagger: 0.12, transformOrigin: '0% 50%' }, 0.2)
    // 2. La construction de Fibonacci se trace, carré par carré, puis la spirale
    .set(spirale, { visibility: 'visible' }, 0.45)
    .fromTo(traits, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, stagger: 0.05, ease: 'power1.inOut' }, 0.45)
    // 3. Le contenu apparaît en fondu, en remontant légèrement
    .fromTo(contenu, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: { amount: 0.35 }, ease: 'power2.out' }, 0.95);
}
