/**
 * Chargeur — conserve la balise <script src=".../js/profils.js"> de toutes les pages.
 * Charge dans l'ordre (synchrone) : niveaux.js, auth.js, programmes/*.js, vendor/supabase.js,
 * supabase-config.js (facultatif), sync.js, profils-core.js.
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
  // Synchro facultative : si supabase-config.js est absent (404), l'erreur est ignorée et Sync reste inactif.
  if (typeof window.supabase === 'undefined') liste.push(dossierJs + 'vendor/supabase.js');
  if (typeof window.SUPABASE_CONFIG === 'undefined') liste.push({ src: dossierJs + 'supabase-config.js', silencieux: true });
  if (typeof window.Sync === 'undefined' && !deja('sync.js')) liste.push(dossierJs + 'sync.js');
  liste.push(dossierJs + 'profils-core.js');
  liste.forEach((e) => {
    const src = typeof e === 'string' ? e : e.src;
    const silencieux = typeof e !== 'string' && e.silencieux;
    document.write('<script src="' + src + '"' + (silencieux ? ' onerror="this.remove()"' : '') + '><\/script>');
  });
})();
