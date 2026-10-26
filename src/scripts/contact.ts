// Envoi du formulaire sans quitter la page. Sans JavaScript, Web3Forms affiche sa propre page de confirmation.
export function initContact() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;

  const bouton = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const succes = form.querySelector<HTMLElement>('[data-success]')!;
  const erreur = form.querySelector<HTMLElement>('[data-error]')!;
  const texteBouton = bouton.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    succes.hidden = true;
    erreur.hidden = true;
    bouton.disabled = true;
    bouton.textContent = form.dataset.sending ?? '…';

    try {
      const reponse = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const resultat = await reponse.json();
      if (!reponse.ok || !resultat.success) throw new Error(resultat.message);
      form.reset();
      succes.hidden = false;
    } catch {
      erreur.hidden = false;
    } finally {
      bouton.disabled = false;
      bouton.textContent = texteBouton;
    }
  });
}
