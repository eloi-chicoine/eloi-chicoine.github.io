// Pop-ups de l'accueil : un trait relie le picto, le cadre se dessine, puis le texte apparaît.
import { gsap, reducedMotion } from './motion';

const IDS = ['moi', 'outils', 'parcours'];

export function initPanels() {
  const zone = document.querySelector<HTMLElement>('[data-panels]');
  if (!zone) return;

  const connecteur = zone.querySelector<HTMLElement>('[data-connector]')!;
  const triggers = [...document.querySelectorAll<HTMLAnchorElement>('[data-panel-trigger]')];
  let ouvert: string | null = null;
  let anim: gsap.core.Timeline | null = null;

  triggers.forEach((btn) => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.panelTrigger!;
      ouvert === id ? fermer() : ouvrir(id);
    });
  });

  zone.querySelectorAll('[data-panel-close]').forEach((b) => b.addEventListener('click', () => fermer()));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ouvert) fermer();
  });

  // Lien « À propos » du menu : ouvre « Moi » sans recharger la page.
  document.querySelectorAll<HTMLAnchorElement>('[data-open-panel]').forEach((lien) => {
    lien.addEventListener('click', (e) => {
      e.preventDefault();
      ouvrir(lien.dataset.openPanel!, false);
      window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    });
  });

  // Arrivée depuis une autre page avec #moi, #outils ou #parcours
  const hash = location.hash.slice(1);
  if (IDS.includes(hash)) {
    ouvrir(hash, false);
    // Le navigateur saute à l'ancre : on garde l'accueil entier à l'écran.
    const enHaut = () => window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(enHaut);
    window.addEventListener('load', enHaut, { once: true });
  }

  function trigger(id: string) {
    return triggers.find((b) => b.dataset.panelTrigger === id)!;
  }

  function ouvrir(id: string, focus = true) {
    if (ouvert) masquer(ouvert);
    const panel = document.getElementById(id);
    if (!panel) return;
    ouvert = id;
    panel.classList.add('is-open');
    trigger(id).setAttribute('aria-expanded', 'true');

    // Le trait de liaison part du milieu du picto
    const p = trigger(id).getBoundingClientRect();
    const z = zone!.getBoundingClientRect();
    connecteur.style.setProperty('--connector-y', `${p.top + p.height / 2 - z.top}px`);

    if (focus) panel.querySelector<HTMLElement>('.panel__title')?.focus({ preventScroll: true });

    anim?.kill();
    const lignesH = panel.querySelectorAll('.panel__line--t, .panel__line--b');
    const lignesV = panel.querySelectorAll('.panel__line--l, .panel__line--r');
    const contenu = panel.querySelectorAll('.panel__body > *, .panel__close');

    if (reducedMotion()) {
      gsap.set(connecteur, { autoAlpha: 1, scaleX: 1 });
      gsap.set([lignesH, lignesV, contenu, panel], { clearProps: 'all' });
      return;
    }

    anim = gsap
      .timeline({ defaults: { ease: 'power2.inOut' } })
      .fromTo(connecteur, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.2 })
      .fromTo(panel, { clipPath: 'inset(0 100% 100% 0)' }, { clipPath: 'inset(0 0% 0% 0)', duration: 0.5 })
      .fromTo(lignesH, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.45 }, '<')
      .fromTo(lignesV, { scaleY: 0, transformOrigin: 'center top' }, { scaleY: 1, duration: 0.45 }, '<0.05')
      .fromTo(
        contenu,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' },
        '-=0.15',
      );
  }

  function masquer(id: string) {
    document.getElementById(id)?.classList.remove('is-open');
    trigger(id).setAttribute('aria-expanded', 'false');
  }

  function fermer() {
    if (!ouvert) return;
    const id = ouvert;
    const panel = document.getElementById(id)!;
    ouvert = null;
    anim?.kill();

    const fin = () => {
      masquer(id);
      gsap.set(connecteur, { autoAlpha: 0 });
      trigger(id).focus({ preventScroll: true });
    };

    if (reducedMotion()) return fin();
    anim = gsap
      .timeline({ onComplete: fin })
      .to(panel, { clipPath: 'inset(0 0% 100% 0)', duration: 0.25, ease: 'power2.in' })
      .to(connecteur, { scaleX: 0, duration: 0.15 }, '<0.1');
  }
}
