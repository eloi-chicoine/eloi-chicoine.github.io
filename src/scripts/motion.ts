import { gsap } from 'gsap';

/** true si l'utilisateur a demandé moins d'animations : on affiche tout, sans mouvement. */
export function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap };
