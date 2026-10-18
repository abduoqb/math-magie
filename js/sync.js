/**
 * Sync — synchronisation facultative des profils avec Supabase (voir docs/SYNC-SPEC.md).
 *
 * - Le local reste la source de vérité immédiate : sans configuration, sans compte ou sans
 *   réseau, rien ne change pour l'enfant.
 * - Fusion déterministe (fonctions PURES exportables sous node) : fusionnerProfils(L, D).
 * - Concurrence optimiste par `version` ; file d'attente persistante = différence entre l'état
 *   local et le dernier état connu du serveur (localStorage `mathemagie-sync-meta`).
 *
 * Dépend (à l'exécution seulement) de window.gestionnaireProfils, window.supabase (vendor)
 * et window.SUPABASE_CONFIG (js/supabase-config.js, facultatif).
 */
(function (global) {
  'use strict';

  // =====================================================================
  // 1. Fonctions pures de fusion
  // =====================================================================

  const CHAMPS_PROFIL = ['_avatar', '_couleur', 'niveauClasse', 'code'];
  const CHAMPS_TRAITES = CHAMPS_PROFIL.concat(['_majProfil', 'progression', 'progressionEnAttente', 'supprimeLe']);

  function estObjet(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function nb(v) { return typeof v === 'number' && isFinite(v) ? v : 0; }
  function cloner(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }

  /** JSON canonique (clés triées) : sert aux comparaisons et aux départages déterministes. */
  function stable(v) {
    if (v === undefined) return 'undefined';
    if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
    if (v !== null && typeof v === 'object') {
      return '{' + Object.keys(v).sort().filter(k => v[k] !== undefined)
        .map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
    }
    return JSON.stringify(v);
  }

  /** Jointure commutative, associative et idempotente de deux valeurs (cas d'égalité). */
  function joindre(a, b) {
    if (a === undefined || a === null) return cloner(b);
    if (b === undefined || b === null) return cloner(a);
    if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
    return cloner(stable(a) >= stable(b) ? a : b);
  }

  /** Fusion de deux objets de mission (règles 1 à 3). */
  function fusionnerMission(a, b) {
    if (a === undefined) return cloner(b);
    if (b === undefined) return cloner(a);
    if (!estObjet(a) || !estObjet(b)) return joindre(a, b);
    const ma = nb(a._maj), mb = nb(b._maj);
    const res = {};
    const cles = new Set(Object.keys(a).concat(Object.keys(b)));
    cles.forEach(k => {
      if (k === '__proto__') return;
      const va = a[k], vb = b[k];
      let v;
      if (k.indexOf('parties') === 0) {
        const nombres = [va, vb].filter(x => typeof x === 'number');
        v = nombres.length ? Math.max.apply(null, nombres) : joindre(va, vb);
      } else if (k === '_maj') {
        v = Math.max(ma, mb);
      } else if (ma > mb) {
        v = va;
      } else if (mb > ma) {
        v = vb;
      } else {
        v = joindre(va, vb);
      }
      if (v !== undefined) res[k] = cloner(v);
    });
    return res;
  }

  /** Fusion de deux « sacs » de missions { missionId: {...} }. */
  function fusionnerSac(a, b) {
    if (!estObjet(a) && !estObjet(b)) return undefined;
    if (!estObjet(a)) return cloner(b);
    if (!estObjet(b)) return cloner(a);
    const res = {};
    new Set(Object.keys(a).concat(Object.keys(b))).forEach(id => {
      if (id === '__proto__') return;
      res[id] = fusionnerMission(a[id], b[id]);
    });
    return res;
  }

  function pierre(supprimeLe, majProfil) {
    const p = { supprimeLe };
    if (majProfil > 0) p._majProfil = majProfil;
    return p;
  }

  /**
   * Fusionne le profil local L et le profil distant D (l'un ou l'autre peut être null).
   * Un profil supprimé porte `supprimeLe` (ms). Retourne un nouvel objet (jamais d'alias).
   * Commutative, idempotente, sans perte de progression.
   */
  function fusionnerProfils(L, D) {
    L = estObjet(L) ? L : null;
    D = estObjet(D) ? D : null;
    if (!L && !D) return null;
    if (!L || !D) {
      const seul = cloner(L || D);
      if (nb(seul.supprimeLe)) return pierre(nb(seul.supprimeLe), nb(seul._majProfil));
      return normaliserVivant(seul);
    }
    const sL = nb(L.supprimeLe), sD = nb(D.supprimeLe);
    const mL = nb(L._majProfil), mD = nb(D._majProfil);

    // Règle 5 : pierres tombales
    if (sL || sD) {
      if (sL && sD) return pierre(Math.max(sL, sD), Math.max(mL, mD));
      const s = sL || sD;
      const vivant = sL ? D : L;
      const mv = sL ? mD : mL;
      if (s > mv) return pierre(s, Math.max(mv, sL ? mL : mD));
      return normaliserVivant(cloner(vivant)); // modifié après la suppression : il survit
    }

    const res = {};
    // Règle 4 : champs du profil
    CHAMPS_PROFIL.forEach(k => {
      let v;
      if (mL > mD) v = L[k];
      else if (mD > mL) v = D[k];
      else v = joindre(L[k], D[k]);
      if (v !== undefined) res[k] = cloner(v);
    });
    if (Math.max(mL, mD) > 0) res._majProfil = Math.max(mL, mD);

    // Règles 1 à 3 : progression par niveau de classe et par mission
    const prog = {};
    const lp = estObjet(L.progression) ? L.progression : {};
    const dp = estObjet(D.progression) ? D.progression : {};
    new Set(Object.keys(lp).concat(Object.keys(dp))).forEach(n => {
      if (n === '__proto__') return;
      const sac = fusionnerSac(lp[n], dp[n]);
      if (sac !== undefined) prog[n] = sac;
    });
    // Ancienne progression v1 en attente de niveau : rattachée au niveau si celui-ci est connu
    const attente = fusionnerSac(L.progressionEnAttente, D.progressionEnAttente);
    if (attente !== undefined) {
      if (res.niveauClasse) prog[res.niveauClasse] = fusionnerSac(prog[res.niveauClasse] || {}, attente);
      else res.progressionEnAttente = attente;
    }
    res.progression = prog;

    // Champs inconnus (évolutions futures) : jointure
    new Set(Object.keys(L).concat(Object.keys(D))).forEach(k => {
      if (CHAMPS_TRAITES.indexOf(k) !== -1 || k === '__proto__') return;
      const v = joindre(L[k], D[k]);
      if (v !== undefined) res[k] = v;
    });
    return res;
  }

  function normaliserVivant(p) {
    if (!estObjet(p.progression)) p.progression = {};
    delete p.supprimeLe;
    if (estObjet(p.progressionEnAttente) && p.niveauClasse) {
      p.progression[p.niveauClasse] = fusionnerSac(p.progression[p.niveauClasse] || {}, p.progressionEnAttente);
      delete p.progressionEnAttente;
    }
    CHAMPS_PROFIL.forEach(k => { if (p[k] === undefined && k !== '_avatar' && k !== '_couleur') p[k] = null; });
    return p;
  }

  /** Code parent { sel, hash, _maj? } : le plus récent `_maj` gagne. */
  function fusionnerCodeParent(a, b) {
    a = estObjet(a) ? a : null;
    b = estObjet(b) ? b : null;
    if (!a && !b) return null;
    if (!a) return cloner(b);
    if (!b) return cloner(a);
    const ma = nb(a._maj), mb = nb(b._maj);
    if (ma !== mb) return cloner(ma > mb ? a : b);
    return cloner(stable(a) >= stable(b) ? a : b);
  }

  /** Forme canonique d'un profil (ou d'une pierre) pour comparer / détecter les modifications. */
  function empreinte(p) {
    if (!estObjet(p)) return 'null';
    if (nb(p.supprimeLe)) return stable(pierre(nb(p.supprimeLe), nb(p._majProfil)));
    const c = Object.assign({}, p);
    delete c.supprimeLe;
    return stable(c);
  }

  const PURES = { fusionnerProfils, fusionnerMission, fusionnerSac, fusionnerCodeParent, empreinte, stable };

  // Sous node (tests) : on exporte les fonctions pures ; le reste exige un navigateur.
  const enNavigateur = typeof global.window !== 'undefined' && global.window === global;
  if (typeof module !== 'undefined' && module.exports) module.exports = PURES;
  if (!enNavigateur && typeof global.localStorage === 'undefined') return;

  // =====================================================================
  // 2. Synchronisation (navigateur)
  // =====================================================================

  const CLE_META = 'mathemagie-sync-meta';
  const CLE_AUTH = 'mathemagie-supabase-auth';
  const DEBOUNCE_MS = 2000;
  const MAX_TENTATIVES = 5;
  const INTERVALLE_MS = 60000;

  const MSG_INDISPO = 'La synchronisation n\'est pas disponible pour le moment.';
  const MSG_RESEAU = 'Impossible de joindre le serveur. Vérifiez la connexion internet.';

  let racine = '';
  try {
    const cs = global.document && global.document.currentScript;
    if (cs && cs.src) racine = cs.src.replace(/js\/sync\.js(\?.*)?$/, '');
  } catch (e) { /* ignore */ }

  let gp = null;
  let client = null;
  let meta = lireMeta();
  let enCours = false;
  let enCoursPromesse = null;
  let relancer = false;
  let timer = null;
  let timerRetry = null;
  let echecs = 0;
  let erreurMsg = null;
  let erreurReseau = false;
  let recuperation = false;
  let adoptesRecents = 0; // profils sans compte rattachés à la famille qui vient de se connecter

  function metaVide() {
    return { uid: null, email: null, ids: {}, versions: {}, snaps: {}, snapCp: 'null', derniere: 0 };
  }
  function lireMeta() {
    try {
      const o = JSON.parse(global.localStorage.getItem(CLE_META));
      if (o && typeof o === 'object') return Object.assign(metaVide(), o);
    } catch (e) { /* ignore */ }
    return metaVide();
  }
  function ecrireMeta() {
    try { global.localStorage.setItem(CLE_META, JSON.stringify(meta)); } catch (e) { /* ignore */ }
  }

  function config() { return global.SUPABASE_CONFIG; }

  function estConfigure() {
    const c = config();
    return !!(c && c.url && c.cle && global.supabase && typeof global.supabase.createClient === 'function');
  }
  function estConnecte() { return !!meta.uid; }
  function getEmail() { return meta.email || null; }
  function horsLigneNavigateur() { return typeof navigator !== 'undefined' && navigator.onLine === false; }

  function getClient() {
    if (client) return client;
    if (!estConfigure()) return null;
    try {
      const c = config();
      client = global.supabase.createClient(c.url, c.cle, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: CLE_AUTH }
      });
      client.auth.onAuthStateChange((evenement, session) => {
        if (evenement === 'PASSWORD_RECOVERY') {
          recuperation = true;
          if (session) adopterSession(session);
          emettre({ recuperation: true });
        } else if (evenement === 'SIGNED_OUT') {
          oublierFamille();
        }
      });
    } catch (e) {
      client = null;
    }
    return client;
  }

  function getEtat() {
    if (!estConfigure() || !estConnecte()) return 'non-connecte';
    if (horsLigneNavigateur()) return 'hors-ligne';
    if (enCours || timer) return 'en-cours';
    if (erreurMsg) return erreurReseau ? 'hors-ligne' : 'erreur';
    return 'synchronise';
  }

  function emettre(extra) {
    try {
      global.dispatchEvent(new global.CustomEvent('mathemagie-sync', { detail: Object.assign({ etat: getEtat() }, extra || {}) }));
    } catch (e) { /* ignore */ }
  }

  function adopterSession(session) {
    if (!session || !session.user) return;
    if (meta.uid && meta.uid !== session.user.id) {
      meta = Object.assign(metaVide(), { uid: session.user.id });
      erreurMsg = null;
    }
    meta.uid = session.user.id;
    meta.email = session.user.email || meta.email;
    ecrireMeta();
    basculerFamille(meta.uid);
  }

  /**
   * L'appareil affiche les profils de la famille connectée (et seulement eux). Un changement de
   * famille ou une déconnexion change de stockage : aucun profil ne passe d'une famille à l'autre.
   */
  function basculerFamille(uid) {
    if (!gp || typeof gp.changerDeFamille !== 'function' || gp.famille === (uid || null)) return;
    const r = gp.changerDeFamille(uid);
    if (r && r.adoptes) adoptesRecents += r.adoptes;
    emettre({ changement: true });
  }

  function oublierFamille() {
    meta = metaVide();
    ecrireMeta();
    if (timer) { clearTimeout(timer); timer = null; }
    if (timerRetry) { clearTimeout(timerRetry); timerRetry = null; }
    erreurMsg = null;
    emettre();
  }

  function urlConnexion() {
    try { return new URL((racine || '') + 'connexion.html', global.location.href).href; } catch (e) { return undefined; }
  }

  function messageAuth(err) {
    const m = String((err && (err.message || err.msg)) || '').toLowerCase();
    const s = err && err.status;
    if (s === 429 || m.indexOf('rate limit') !== -1 || m.indexOf('too many') !== -1) {
      return 'Trop de tentatives. Patientez quelques minutes, puis réessayez.';
    }
    if (m.indexOf('not confirmed') !== -1) {
      return 'Confirmez d\'abord votre adresse e-mail grâce au message que nous vous avons envoyé.';
    }
    if (m.indexOf('fetch') !== -1 || m.indexOf('network') !== -1 || s === 0) return MSG_RESEAU;
    return 'E-mail ou mot de passe incorrect.';
  }

  function emailValide(e) { return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()); }

  // --- API compte ---

  async function inscrire(email, mdp) {
    if (!getClient()) return { ok: false, erreur: MSG_INDISPO };
    if (!emailValide(email)) return { ok: false, erreur: 'Cette adresse e-mail ne semble pas correcte.' };
    if (typeof mdp !== 'string' || mdp.length < 8) return { ok: false, erreur: 'Choisissez un mot de passe d\'au moins 8 caractères.' };
    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(), password: mdp, options: { emailRedirectTo: urlConnexion() }
      });
      if (error) {
        const m = String(error.message || '').toLowerCase();
        if (error.status === 429) return { ok: false, erreur: messageAuth(error) };
        if (m.indexOf('password') !== -1) return { ok: false, erreur: 'Ce mot de passe est trop simple. Essayez-en un plus long.' };
        if (m.indexOf('fetch') !== -1 || m.indexOf('network') !== -1) return { ok: false, erreur: MSG_RESEAU };
        return { ok: false, erreur: 'Impossible de créer le compte. Vérifiez l\'adresse e-mail ou essayez de vous connecter.' };
      }
      if (data && data.session) {
        adoptesRecents = 0;
        adopterSession(data.session);
        const adoptes = adoptesRecents; adoptesRecents = 0;
        emettre();
        await synchroniser();
        return { ok: true, connecte: true, adoptes };
      }
      return { ok: true, connecte: false, confirmer: true };
    } catch (e) {
      return { ok: false, erreur: MSG_RESEAU };
    }
  }

  async function connecter(email, mdp) {
    if (!getClient()) return { ok: false, erreur: MSG_INDISPO };
    if (!emailValide(email) || typeof mdp !== 'string' || !mdp) return { ok: false, erreur: 'E-mail ou mot de passe incorrect.' };
    try {
      const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password: mdp });
      if (error || !data || !data.session) return { ok: false, erreur: messageAuth(error) };
      adoptesRecents = 0;
      adopterSession(data.session);
      const adoptes = adoptesRecents; adoptesRecents = 0;
      emettre();
      const r = await synchroniser();
      return { ok: true, synchro: r, adoptes };
    } catch (e) {
      return { ok: false, erreur: MSG_RESEAU };
    }
  }

  async function deconnecter() {
    try { if (getClient()) await client.auth.signOut({ scope: 'local' }); } catch (e) { /* ignore */ }
    oublierFamille();
    basculerFamille(null); // les profils de la famille ne s'affichent plus ici (ils restent sauvegardés)
    return { ok: true };
  }

  async function reinitialiserMotDePasse(email) {
    if (!getClient()) return { ok: false, erreur: MSG_INDISPO };
    if (!emailValide(email)) return { ok: false, erreur: 'Cette adresse e-mail ne semble pas correcte.' };
    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: urlConnexion() });
      if (error && (error.status === 429 || /rate limit/i.test(error.message || ''))) return { ok: false, erreur: messageAuth(error) };
    } catch (e) {
      return { ok: false, erreur: MSG_RESEAU };
    }
    // Réponse volontairement identique que le compte existe ou non
    return { ok: true };
  }

  async function changerMotDePasse(mdp) {
    if (!getClient()) return { ok: false, erreur: MSG_INDISPO };
    if (typeof mdp !== 'string' || mdp.length < 8) return { ok: false, erreur: 'Choisissez un mot de passe d\'au moins 8 caractères.' };
    try {
      const { error } = await client.auth.updateUser({ password: mdp });
      if (error) return { ok: false, erreur: 'Impossible de changer le mot de passe. Redemandez un lien par e-mail.' };
      recuperation = false;
      emettre();
      synchroniser();
      return { ok: true };
    } catch (e) {
      return { ok: false, erreur: MSG_RESEAU };
    }
  }

  // --- Détection des modifications (file d'attente persistante) ---

  function estSale() {
    if (!gp || !gp.donnees) return false;
    const d = gp.donnees;
    const noms = Object.keys(d.profils || {});
    for (let i = 0; i < noms.length; i++) {
      if (meta.snaps[noms[i]] !== empreinte(d.profils[noms[i]])) return true;
    }
    const morts = Object.keys(d.supprimes || {});
    for (let i = 0; i < morts.length; i++) {
      if (meta.snaps[morts[i]] !== empreinte(d.supprimes[morts[i]])) return true;
    }
    return stable(d.codeParent || null) !== meta.snapCp;
  }

  function planifierPush() {
    if (!gp || !estConnecte() || !estConfigure()) return;
    if (!estSale()) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { timer = null; synchroniser(); }, DEBOUNCE_MS);
    emettre();
  }

  // --- Cycle de synchronisation ---

  function prenomValide(p) {
    return typeof p === 'string' && p.length > 0 && p.length <= 40 && p.charAt(0) !== '_' && p !== '__proto__';
  }

  function uuid() {
    const c = global.crypto;
    if (c && typeof c.randomUUID === 'function') return c.randomUUID();
    const o = new Uint8Array(16);
    if (c && c.getRandomValues) c.getRandomValues(o); else for (let i = 0; i < 16; i++) o[i] = Math.floor(Math.random() * 256);
    o[6] = (o[6] & 0x0f) | 0x40; o[8] = (o[8] & 0x3f) | 0x80;
    const h = Array.from(o).map(x => x.toString(16).padStart(2, '0')).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  function depuisLigne(ligne) {
    const data = estObjet(ligne.data) ? cloner(ligne.data) : {};
    if (ligne.supprime_le) {
      const ms = Date.parse(ligne.supprime_le);
      return pierre(isFinite(ms) && ms > 0 ? ms : 1, nb(data._majProfil));
    }
    delete data.supprimeLe;
    return data;
  }

  function donneesPourEnvoi(M) {
    if (nb(M.supprimeLe)) return pierre(nb(M.supprimeLe), nb(M._majProfil));
    const c = cloner(M);
    delete c.supprimeLe;
    return c;
  }

  function isoOuNull(M) { return nb(M.supprimeLe) ? new Date(nb(M.supprimeLe)).toISOString() : null; }

  function appliquerLocal(prenom, M, stats) {
    const d = gp.donnees;
    if (!estObjet(d.supprimes)) d.supprimes = {};
    const avant = d.profils[prenom] || d.supprimes[prenom] || null;
    const existait = !!d.profils[prenom];
    if (empreinte(avant) === empreinte(M)) return;
    stats.changement = true;
    if (nb(M.supprimeLe)) {
      delete d.profils[prenom];
      d.supprimes[prenom] = M;
      if (d.joueurActif === prenom) { d.joueurActif = null; stats.actifSupprime = true; }
    } else {
      d.profils[prenom] = M;
      delete d.supprimes[prenom];
      if (!existait) stats.telecharges.push(prenom);
    }
  }

  /** Fusionne le distant dans le local (synchrone, donc atomique), puis envoie. Retourne true si conflit. */
  async function appliquerEtPousser(c, uid, lignes, famille, stats) {
    const d = gp.donnees;
    if (!estObjet(d.supprimes)) d.supprimes = {};
    const aPousser = [];
    const vus = new Set();

    lignes.forEach(ligne => {
      const prenom = ligne.prenom;
      if (!prenomValide(prenom)) return;
      vus.add(prenom);
      const D = depuisLigne(ligne);
      const L = d.profils[prenom] || d.supprimes[prenom] || null;
      const M = fusionnerProfils(L, D);
      appliquerLocal(prenom, M, stats);
      meta.ids[prenom] = ligne.id;
      meta.versions[prenom] = ligne.version;
      if (empreinte(M) !== empreinte(D) || (!nb(M.supprimeLe) && ligne.supprime_le)) {
        aPousser.push({ prenom, M: cloner(M), ligne });
      } else {
        meta.snaps[prenom] = empreinte(M);
      }
    });

    Object.keys(d.profils).concat(Object.keys(d.supprimes)).forEach(prenom => {
      if (vus.has(prenom) || !prenomValide(prenom)) return;
      const M = d.profils[prenom] || d.supprimes[prenom];
      if (nb(M.supprimeLe)) { meta.snaps[prenom] = empreinte(M); return; } // rien à supprimer à distance
      aPousser.push({ prenom, M: cloner(M), ligne: null });
    });

    const Dcp = famille && famille.code_parent ? famille.code_parent : null;
    const Mcp = fusionnerCodeParent(d.codeParent || null, Dcp);
    if (stable(Mcp) !== stable(d.codeParent || null)) { d.codeParent = Mcp; stats.changement = true; }

    if (stats.changement) {
      try { gp.sauvegarder(true); } catch (e) { /* ignore */ }
    }

    let conflit = false;
    for (let i = 0; i < aPousser.length; i++) {
      const e = aPousser[i];
      const data = donneesPourEnvoi(e.M);
      const supprime_le = isoOuNull(e.M);
      if (!e.ligne) {
        const id = uuid();
        const r = await c.from('profils_enfants').insert({ id, famille_id: uid, prenom: e.prenom, data, supprime_le }).select('id,version');
        if (r.error) {
          if (r.error.code === '23505') { conflit = true; continue; }
          throw r.error;
        }
        const ligne = r.data && r.data[0];
        meta.ids[e.prenom] = ligne ? ligne.id : id;
        meta.versions[e.prenom] = ligne ? ligne.version : 1;
      } else {
        const r = await c.from('profils_enfants').update({ data, supprime_le })
          .eq('id', e.ligne.id).eq('version', e.ligne.version).select('id,version');
        if (r.error) throw r.error;
        if (!r.data || !r.data.length) { conflit = true; continue; }
        meta.ids[e.prenom] = r.data[0].id;
        meta.versions[e.prenom] = r.data[0].version;
      }
      meta.snaps[e.prenom] = empreinte(e.M);
      stats.envoyes++;
    }

    if (Mcp && stable(Mcp) !== stable(Dcp)) {
      const r = await c.from('familles').upsert({ famille_id: uid, code_parent: Mcp }, { onConflict: 'famille_id' });
      if (r.error) throw r.error;
      meta.snapCp = stable(Mcp);
    } else {
      meta.snapCp = stable(Mcp);
    }
    ecrireMeta();
    return conflit;
  }

  async function cycle(stats) {
    const c = getClient();
    const rs = await c.auth.getSession();
    const session = rs && rs.data && rs.data.session;
    if (!session) {
      if (!horsLigneNavigateur()) oublierFamille();
      const e = new Error('session'); e.session = true; throw e;
    }
    adopterSession(session);
    const uid = session.user.id;
    for (let t = 0; t < MAX_TENTATIVES; t++) {
      const rp = await c.from('profils_enfants').select('id,prenom,data,version,supprime_le').eq('famille_id', uid);
      if (rp.error) throw rp.error;
      const rf = await c.from('familles').select('code_parent').eq('famille_id', uid).maybeSingle();
      if (rf.error) throw rf.error;
      const conflit = await appliquerEtPousser(c, uid, rp.data || [], rf.data || null, stats);
      if (!conflit) return;
    }
    throw new Error('conflit');
  }

  function estErreurReseau(e) {
    const m = String((e && (e.message || e.details)) || '').toLowerCase();
    return horsLigneNavigateur() || m.indexOf('fetch') !== -1 || m.indexOf('network') !== -1 || m.indexOf('timeout') !== -1 ||
      (e && e.name === 'TypeError');
  }

  /** Pull + fusion + push. Ne rejette jamais. Retourne { ok, telecharges, envoyes, changement, ... }. */
  function synchroniser() {
    if (!gp || !estConfigure() || !estConnecte()) return Promise.resolve({ ok: false, raison: 'non-connecte' });
    if (horsLigneNavigateur()) { emettre(); return Promise.resolve({ ok: false, raison: 'hors-ligne' }); }
    if (enCours) { relancer = true; return enCoursPromesse; }
    if (timer) { clearTimeout(timer); timer = null; }
    if (timerRetry) { clearTimeout(timerRetry); timerRetry = null; }
    enCours = true;
    emettre();
    const stats = { ok: false, telecharges: [], envoyes: 0, changement: false, actifSupprime: false };
    enCoursPromesse = (async () => {
      try {
        await cycle(stats);
        meta.derniere = Date.now();
        ecrireMeta();
        erreurMsg = null; erreurReseau = false; echecs = 0;
        stats.ok = true;
      } catch (e) {
        erreurReseau = estErreurReseau(e);
        erreurMsg = erreurReseau ? MSG_RESEAU : 'La synchronisation a rencontré un problème. Nouvel essai bientôt.';
        stats.erreur = erreurMsg;
        if (!(e && e.session)) {
          echecs++;
          timerRetry = setTimeout(() => { timerRetry = null; synchroniser(); }, Math.min(300000, 15000 * Math.pow(2, echecs - 1)));
        } else {
          erreurMsg = 'Session expirée : reconnectez la famille.';
        }
      } finally {
        enCours = false;
        const sortie = Object.assign({}, stats);
        try {
          if (stats.actifSupprime) quitterProfilSupprime();
        } catch (e2) { /* ignore */ }
        emettre({ changement: stats.changement, telecharges: stats.telecharges, actifSupprime: stats.actifSupprime });
        if (relancer) { relancer = false; synchroniser(); }
        return sortie;
      }
    })();
    return enCoursPromesse;
  }

  /** Le profil actif a été supprimé sur un autre appareil : on sort proprement vers la connexion. */
  function quitterProfilSupprime() {
    try { gp.sauvegarder(true); } catch (e) { /* ignore */ }
    const chemin = (global.location && global.location.pathname) || '';
    if (/connexion\.html$/.test(chemin) || !global.document) return;
    if (typeof gp.verifierAccesOuRediriger === 'function') gp.verifierAccesOuRediriger(racine);
  }

  function getDerniereSynchro() { return meta.derniere || 0; }
  function getMessageErreur() { return erreurMsg; }
  function recuperationEnCours() { return recuperation; }

  /** Appelé par profils-core.js une fois le gestionnaire créé. */
  function demarrer(gestionnaire) {
    gp = gestionnaire;
    if (!estConfigure()) return;
    getClient();
    if (!client) return;
    if (estConnecte()) basculerFamille(meta.uid); // les profils affichés sont ceux de la famille connectée
    try {
      client.auth.getSession().then(r => {
        const s = r && r.data && r.data.session;
        if (s) { adopterSession(s); emettre(); }
      }).catch(() => { /* ignore */ });
    } catch (e) { /* ignore */ }
    if (estConnecte()) setTimeout(synchroniser, 0);
    global.addEventListener('online', () => { emettre(); synchroniser(); });
    global.addEventListener('offline', () => emettre());
    if (global.document) {
      global.document.addEventListener('visibilitychange', () => {
        if (global.document.visibilityState === 'visible' && estConnecte() && Date.now() - (meta.derniere || 0) > 30000) synchroniser();
      });
      setInterval(() => {
        if (estConnecte() && global.document.visibilityState === 'visible') synchroniser();
      }, INTERVALLE_MS);
    }
  }

  global.Sync = {
    estConfigure, estConnecte, getEmail,
    inscrire, connecter, deconnecter, reinitialiserMotDePasse, changerMotDePasse,
    synchroniser, planifierPush, getEtat,
    getDerniereSynchro, getMessageErreur, recuperationEnCours, demarrer,
    fusionnerProfils, fusionnerCodeParent
  };

  // Auto-démarrage : si le gestionnaire de profils est déjà là, c'est que sync.js a été chargé
  // APRÈS profils-core.js (chargement différé depuis js/profils.js) → on démarre tout de suite.
  // Sur connexion.html, sync.js est chargé AVANT profils-core.js : c'est alors profils-core.js
  // qui appelle demarrer(). Les deux cas s'excluent, jamais de double démarrage.
  try {
    if (global.gestionnaireProfils) demarrer(global.gestionnaireProfils);
  } catch (e) { /* la synchro ne doit jamais empêcher la page de fonctionner */ }
})(typeof window !== 'undefined' ? window : globalThis);
