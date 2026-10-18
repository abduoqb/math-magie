/**
 * Chargeur — conserve la balise <script src=".../js/profils.js"> de toutes les pages.
 *
 * Chargement SYNCHRONE (chemin critique) : niveaux.js, auth.js, programmes/*.js, profils-core.js.
 * `window.gestionnaireProfils` est donc disponible immédiatement après cette balise, comme avant
 * (les scripts inline des pages appellent `gestionnaireProfils.verifierAccesOuRediriger`).
 *
 * Chargement DIFFÉRÉ (hors chemin critique) : vendor/supabase.js, supabase-config.js, sync.js.
 * Ils portent l'attribut `defer` : le parseur n'est jamais bloqué, l'ordre est garanti
 * (supabase.js → supabase-config.js → sync.js) et ils s'exécutent juste avant `DOMContentLoaded`,
 * donc avant header.js (indicateur ☁️) qui suit dans le document. `sync.js` s'auto-démarre auprès
 * du gestionnaire de profils (voir la fin de js/sync.js).
 * Sur un appareil sans famille connectée (aucune trace en localStorage), la synchro n'est même pas
 * téléchargée : le site fonctionne exactement comme sans Supabase.
 * Les scripts déjà présents (ex. connexion.html, qui les charge explicitement et de façon
 * synchrone) ne sont pas rechargés.
 */
(function () {
  const courant = document.currentScript;
  if (!courant) return;
  const dossierJs = courant.src.replace(/profils\.js(\?.*)?$/, '');
  const racine = dossierJs.replace(/js\/$/, '');
  const deja = (nom) => !!document.querySelector('script[src$="' + nom + '"]') && nom !== 'profils-core.js';

  // --- 1. Chemin critique : tout ce dont `gestionnaireProfils` a besoin tout de suite ---
  const synchrones = [];
  if (typeof window.Niveaux === 'undefined' && !deja('niveaux.js')) synchrones.push(dossierJs + 'niveaux.js');
  if (typeof window.Auth === 'undefined' && !deja('auth.js')) synchrones.push(dossierJs + 'auth.js');
  if (typeof window.Voix === 'undefined' && !deja('voix.js')) synchrones.push(dossierJs + 'voix.js');
  ['cp', 'ce1', 'ce2', 'cm1', 'cm2'].forEach((n) => synchrones.push(racine + 'programmes/' + n + '.js'));
  synchrones.push(dossierJs + 'profils-core.js');
  synchrones.forEach((src) => document.write('<script src="' + src + '"><\/script>'));

  // --- 2. Synchro facultative : différée, non bloquante, et seulement si elle est pertinente ---
  // Si supabase-config.js est absent (404), l'erreur est ignorée et Sync reste inactif.
  const differees = [];
  if (typeof window.supabase === 'undefined' && !deja('supabase.js')) differees.push({ src: dossierJs + 'vendor/supabase.js' });
  if (typeof window.SUPABASE_CONFIG === 'undefined' && !deja('supabase-config.js')) differees.push({ src: dossierJs + 'supabase-config.js', silencieux: true });
  if (typeof window.Sync === 'undefined' && !deja('sync.js')) differees.push({ src: dossierJs + 'sync.js' });

  if (differees.length && synchroPertinente()) {
    differees.forEach((e) => {
      document.write('<script defer src="' + e.src + '"' + (e.silencieux ? ' onerror="this.remove()"' : '') + '><\/script>');
    });
  }

  /**
   * La synchro vaut-elle la peine d'être chargée ? Oui si cet appareil garde une trace d'une
   * famille déjà connectée : session Supabase (`mathemagie-supabase-auth`) ou méta de synchro
   * (`mathemagie-sync-meta`) avec un uid. Sinon on ne télécharge rien : une famille connectée
   * laissera toujours l'une de ces traces, donc elle retrouve toujours sa synchro.
   */
  function synchroPertinente() {
    try {
      const auth = localStorage.getItem('mathemagie-supabase-auth');
      if (auth && auth !== 'null' && auth !== '{}') return true;
    } catch (e) { /* localStorage indisponible : on ne tente rien */ }
    try {
      const meta = JSON.parse(localStorage.getItem('mathemagie-sync-meta'));
      if (meta && meta.uid) return true;
    } catch (e) { /* ignore */ }
    return false;
  }
})();
