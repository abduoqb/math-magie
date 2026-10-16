/**
 * Chargeur — conserve la balise <script src=".../js/profils.js"> de toutes les pages.
 * Charge dans l'ordre (synchrone) : niveaux.js, auth.js, programmes/*.js, profils-core.js.
 * Les scripts déjà présents (ex. connexion.html) ne sont pas rechargés.
 */
(function () {
  const courant = document.currentScript;
  if (!courant) return;
  const dossierJs = courant.src.replace(/profils\.js(\?.*)?$/, '');
  const racine = dossierJs.replace(/js\/$/, '');
  const deja = (nom) => !!document.querySelector('script[src$="' + nom + '"]') && nom !== 'profils-core.js';
  const liste = [];
  if (typeof window.Niveaux === 'undefined' && !deja('niveaux.js')) liste.push(dossierJs + 'niveaux.js');
  if (typeof window.Auth === 'undefined' && !deja('auth.js')) liste.push(dossierJs + 'auth.js');
  ['cp', 'ce1', 'ce2', 'cm1', 'cm2'].forEach((n) => liste.push(racine + 'programmes/' + n + '.js'));
  liste.push(dossierJs + 'profils-core.js');
  liste.forEach((src) => document.write('<script src="' + src + '"><\/script>'));
})();
