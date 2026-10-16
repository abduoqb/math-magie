/**
 * GestionnaireProfils v2 — profils locaux avec code secret et niveau de classe.
 * Stocke tout sous la clé unique `mathemagie-profils` dans localStorage (aucun serveur).
 *
 * Schéma v2 :
 * {
 *   version: 2,
 *   joueurActif: "Léa" | null,
 *   codeParent: { sel, hash } | null,
 *   profils: {
 *     "Léa": {
 *       _avatar, _couleur,
 *       niveauClasse: 'cp'|'ce1'|'ce2'|'cm1'|'cm2'|null,   // null = profil migré v1, niveau à demander
 *       code: { sel, hash } | null,                         // SHA-256(sel:code)
 *       progression: { cp: { additions: {niveau:3}, 'jeu-pendu': {...} }, ce1: {...} },
 *       progressionEnAttente: { ... }                       // ancienne progression v1 (migration) tant que le niveau est inconnu
 *     }
 *   }
 * }
 * Dépend de js/auth.js et js/niveaux.js (chargés avant).
 */
class GestionnaireProfils {

  // --- Constantes avatars et couleurs ---

  static AVATARS_BASE = ['🧙‍♂️', '🧙‍♀️', '🧝‍♂️', '🧝‍♀️', '🦊', '🦁'];

  static AVATARS_DEBLOQUABLES = [
    { emoji: '🔮', nom: 'Cristal Magique', condition: 'Atteindre le niveau 5 dans une mission', test: (p) => p._niveauMax >= 5 },
    { emoji: '🐉', nom: 'Dragon Ancien', condition: 'Cumuler 20 niveaux au total', test: (p) => p._totalNiveaux >= 20 },
    { emoji: '⚡', nom: 'Éclair Foudroyant', condition: 'Compléter toutes les missions de calcul (niv 2+)', test: (p) => p._calculsComplets },
    { emoji: '🦄', nom: 'Licorne Céleste', condition: 'Compléter toutes les missions de géométrie (niv 2+)', test: (p) => p._geometrieComplete },
    { emoji: '🌟', nom: 'Étoile Suprême', condition: 'Toutes les missions au niveau 2+', test: (p) => p._toutesCompletes },
    { emoji: '🎭', nom: 'Maître des Masques', condition: 'Toutes les missions au niveau 3+', test: (p) => p._toutesMaitrisees },
    { emoji: '🎮', nom: 'Joueur Vétéran', condition: 'Jouer à au moins 10 mini-jeux', test: (p) => p._jeuxJoues >= 10 },
    { emoji: '❌', nom: 'Maître Morpion', condition: 'Jouer 15 parties de Morpion', test: (p) => p._morpionJouees >= 15 },
    { emoji: '🔤', nom: 'Survivant du Pendu', condition: 'Gagner 10 parties du Pendu', test: (p) => p._penduGagnees >= 10 },
    { emoji: '🧠', nom: 'Télépathe', condition: 'Gagner 15 fois à Trouver le chiffre', test: (p) => p._chiffreGagnees >= 15 },
    { emoji: '🔴', nom: 'Stratège', condition: 'Jouer 15 parties de Puissance 4', test: (p) => p._p4Jouees >= 15 }
  ];

  static COULEURS = [
    { id: 'violet', valeur: '#A077EE', nom: 'Violet Sage' },
    { id: 'bleu', valeur: '#41B6E6', nom: 'Bleu Calme' },
    { id: 'vert', valeur: '#6BCB77', nom: 'Vert Forêt' },
    { id: 'orange', valeur: '#E07800', nom: 'Orange Flamme' },
    { id: 'rose', valeur: '#EC4899', nom: 'Rose Enchanteur' },
    { id: 'rouge', valeur: '#EF4444', nom: 'Rouge Dragon' }
  ];

  static TITRES_MAGE = [
    { seuil: 40, titre: '🌟 Archimage' },
    { seuil: 30, titre: '⚡ Grand Mage' },
    { seuil: 20, titre: '🔮 Mage' },
    { seuil: 15, titre: '📖 Adepte' },
    { seuil: 0, titre: '✨ Apprenti' }
  ];

  static MISSIONS_CALCUL = ['additions', 'soustractions', 'multiplications', 'divisions'];
  static MISSIONS_GEOMETRIE = [
    'geometrie-formes', 'geometrie-proprietes', 'geometrie-angles',
    'geometrie-symetrie', 'geometrie-vraifaux', 'geometrie-droites',
    'geometrie-triangles', 'geometrie-quadrilateres', 'geometrie-patrons'
  ];
  static TOUTES_MISSIONS = [...GestionnaireProfils.MISSIONS_CALCUL, ...GestionnaireProfils.MISSIONS_GEOMETRIE];

  static VERSION = 2;

  constructor() {
    this.CLE_STORAGE = 'mathemagie-profils';
    this.CLE_SAUVEGARDE_V1 = 'mathemagie-profils-v1-sauvegarde';
    this.donnees = this.charger();
    this.migrerAnciennesDonnees();
  }

  // --- Persistance ---

  _vide() {
    return { version: GestionnaireProfils.VERSION, joueurActif: null, codeParent: null, profils: {} };
  }

  charger() {
    try {
      const raw = localStorage.getItem(this.CLE_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.profils && typeof parsed.profils === 'object') {
          if (parsed.version === GestionnaireProfils.VERSION) {
            if (!('codeParent' in parsed)) parsed.codeParent = null;
            return parsed;
          }
          return this.migrerV1versV2(raw, parsed);
        }
      }
    } catch (e) {
      console.warn('[Profils] Données corrompues, réinitialisation.', e);
    }
    return this._vide();
  }

  sauvegarder() {
    localStorage.setItem(this.CLE_STORAGE, JSON.stringify(this.donnees));
  }

  // --- Migration v1 → v2 (sans perte) ---

  /**
   * v1 : { joueurActif, profils: { Nom: { _avatar, _couleur, <missionId>: {...} } } }
   * v2 : l'ancienne progression est conservée dans `progressionEnAttente` jusqu'à ce que
   * l'enfant choisisse son niveau (niveauClasse:null) ; elle est alors rattachée à ce niveau.
   */
  migrerV1versV2(brutV1, v1) {
    try {
      // Copie de sécurité de l'original, jamais écrasée
      if (!localStorage.getItem(this.CLE_SAUVEGARDE_V1)) {
        localStorage.setItem(this.CLE_SAUVEGARDE_V1, brutV1);
      }
    } catch (e) { /* quota : on continue */ }

    const v2 = this._vide();
    Object.keys(v1.profils).forEach(nom => {
      const ancien = v1.profils[nom] || {};
      const enAttente = {};
      Object.keys(ancien).forEach(cle => {
        if (cle.charAt(0) !== '_') enAttente[cle] = ancien[cle];
      });
      v2.profils[nom] = {
        _avatar: ancien._avatar || '🧙‍♂️',
        _couleur: ancien._couleur || '#A077EE',
        niveauClasse: null,
        code: null,
        progression: {},
        progressionEnAttente: enAttente
      };
    });
    // joueurActif volontairement remis à null : chaque profil migré doit passer par
    // l'écran de connexion pour choisir son niveau et son code.
    v2.joueurActif = null;
    try { localStorage.setItem(this.CLE_STORAGE, JSON.stringify(v2)); } catch (e) { /* ignore */ }
    console.log('[Profils] Migration v1 → v2 terminée.');
    return v2;
  }

  /** Anciennes clés `math-magie-<mission>` (avant les profils) → profil "Mage" en attente de niveau. */
  migrerAnciennesDonnees() {
    const anciensIds = GestionnaireProfils.TOUTES_MISSIONS;

    let aDetecte = false;
    const profilMigre = {};

    anciensIds.forEach(id => {
      const cle = `math-magie-${id}`;
      const raw = localStorage.getItem(cle);
      if (raw) {
        aDetecte = true;
        try {
          profilMigre[id] = JSON.parse(raw);
        } catch (e) {
          profilMigre[id] = { niveau: 1 };
        }
        localStorage.removeItem(cle);
      }
    });

    if (aDetecte) {
      const nomMigration = 'Mage';
      let p = this.donnees.profils[nomMigration];
      if (!p) {
        p = this.donnees.profils[nomMigration] = {
          _avatar: '🧙‍♂️', _couleur: '#A077EE', niveauClasse: null, code: null,
          progression: {}, progressionEnAttente: {}
        };
      }
      const cible = p.niveauClasse ? ((p.progression[p.niveauClasse] = p.progression[p.niveauClasse] || {})) :
        (p.progressionEnAttente = p.progressionEnAttente || {});
      Object.keys(profilMigre).forEach(op => {
        if (!cible[op]) cible[op] = profilMigre[op];
      });
      this.sauvegarder();
      console.log('[Profils] Anciennes données récupérées → profil "Mage".');
    }
  }

  // --- Utilitaires internes ---

  _profil(nom) {
    return (nom && this.donnees.profils[nom]) || null;
  }

  _profilActif() {
    return this._profil(this.donnees.joueurActif);
  }

  /** Objet des missions du niveau actif (ou de l'attente si niveau inconnu). */
  _progressionActive(creer) {
    const p = this._profilActif();
    if (!p) return null;
    if (p.niveauClasse) {
      if (!p.progression) p.progression = {};
      if (!p.progression[p.niveauClasse] && creer) p.progression[p.niveauClasse] = {};
      return p.progression[p.niveauClasse] || null;
    }
    if (!p.progressionEnAttente && creer) p.progressionEnAttente = {};
    return p.progressionEnAttente || null;
  }

  // --- Joueur actif ---

  getJoueurActif() {
    return this.donnees.joueurActif || null;
  }

  /** Active un profil sans vérifier le code (usage interne / compat v1). Préférer connecter(). */
  setJoueurActif(nom) {
    if (!this._profil(nom)) {
      console.warn(`[Profils] Le profil "${nom}" n'existe pas.`);
      return false;
    }
    this.donnees.joueurActif = nom;
    this.sauvegarder();
    return true;
  }

  deconnecter() {
    this.donnees.joueurActif = null;
    this.sauvegarder();
  }

  /** 'cp'|'ce1'|'ce2'|'cm1'|'cm2' du profil actif, ou null (aucun profil / niveau pas encore choisi). */
  getNiveauClasse() {
    const p = this._profilActif();
    return (p && p.niveauClasse) || null;
  }

  /** Programme (window.PROGRAMMES.<niveau>) du niveau actif, ou null. */
  getProgramme() {
    const n = this.getNiveauClasse();
    return n ? Niveaux.getProgramme(n) : null;
  }

  // --- Gestion des profils ---

  getListeProfils() {
    return Object.keys(this.donnees.profils);
  }

  /** Infos publiques d'un profil (jamais de hash). */
  getInfoProfil(nom) {
    const p = this._profil(nom);
    if (!p) return null;
    return {
      prenom: nom,
      avatar: p._avatar || '🧙‍♂️',
      couleur: p._couleur || '#A077EE',
      niveauClasse: p.niveauClasse || null,
      aCode: !!p.code,
      aConfigurer: !p.niveauClasse || !p.code
    };
  }

  /** true si le profil doit choisir son niveau et/ou son code (profil migré v1). */
  profilAConfigurer(nom) {
    const i = this.getInfoProfil(nom);
    return !!(i && i.aConfigurer);
  }

  _validerPrenom(prenom) {
    prenom = (prenom || '').trim();
    if (!prenom) return { erreur: 'Écris ton prénom.' };
    if (prenom.length > 15) return { erreur: '15 lettres maximum.' };
    if (prenom.charAt(0) === '_' || prenom === '__proto__') return { erreur: 'Prénom non autorisé.' };
    const existe = Object.keys(this.donnees.profils).some(n => n.toLowerCase() === prenom.toLowerCase());
    if (existe) return { erreur: 'Ce mage existe déjà !' };
    return { prenom };
  }

  /** Crée un profil. ASYNC (hachage WebCrypto) : retourne Promise<{ok, erreur?}>. */
  async creerProfil({ prenom, avatar, couleur, niveauClasse, code } = {}) {
    const v = this._validerPrenom(prenom);
    if (v.erreur) return { ok: false, erreur: v.erreur };
    if (!Niveaux.estValide(niveauClasse)) return { ok: false, erreur: 'Choisis ta classe.' };
    if (!Auth.codeValide(code)) return { ok: false, erreur: 'Le code doit avoir 4 chiffres.' };
    if (this._profil(v.prenom)) return { ok: false, erreur: 'Ce mage existe déjà !' };

    this.donnees.profils[v.prenom] = {
      _avatar: avatar || '🧙‍♂️',
      _couleur: couleur || '#A077EE',
      niveauClasse,
      code: await Auth.creerEmpreinte(code),
      progression: {}
    };
    this.sauvegarder();
    return { ok: true, prenom: v.prenom };
  }

  /**
   * Finalise un profil migré (niveauClasse ou code manquant) : choisit le niveau, rattache
   * l'ancienne progression à ce niveau et définit le code. Refusé si le profil est déjà complet.
   */
  async configurerProfilMigre(prenom, niveauClasse, code) {
    const p = this._profil(prenom);
    if (!p) return { ok: false, erreur: 'Profil inconnu.' };
    if (!this.profilAConfigurer(prenom)) return { ok: false, erreur: 'Profil déjà configuré.' };
    if (!p.niveauClasse && !Niveaux.estValide(niveauClasse)) return { ok: false, erreur: 'Choisis ta classe.' };
    if (!p.code && !Auth.codeValide(code)) return { ok: false, erreur: 'Le code doit avoir 4 chiffres.' };

    if (!p.niveauClasse) {
      p.niveauClasse = niveauClasse;
      p.progression = p.progression || {};
      p.progression[niveauClasse] = Object.assign({}, p.progressionEnAttente || {}, p.progression[niveauClasse] || {});
      delete p.progressionEnAttente;
    }
    if (!p.code) p.code = await Auth.creerEmpreinte(code);
    this.sauvegarder();
    return { ok: true };
  }

  async _verifierParentOuAbsent(codeParent) {
    // Pas de code parent défini : l'action est autorisée (l'interface en impose la création).
    if (!this.donnees.codeParent) return true;
    return this.verifierCodeParent(codeParent);
  }

  /** Supprime un profil (code parent requis s'il existe). Promise<boolean>. */
  async supprimerProfil(prenom, codeParent) {
    if (!this._profil(prenom)) return false;
    if (!(await this._verifierParentOuAbsent(codeParent))) return false;
    delete this.donnees.profils[prenom];
    if (this.donnees.joueurActif === prenom) this.donnees.joueurActif = null;
    Auth.reinitialiserLimite('profil:' + prenom);
    this.sauvegarder();
    return true;
  }

  /** Change la classe d'un profil (code parent requis s'il existe). La progression précédente est conservée. */
  async setNiveauClasse(prenom, niveau, codeParent) {
    const p = this._profil(prenom);
    if (!p || !Niveaux.estValide(niveau)) return false;
    if (!(await this._verifierParentOuAbsent(codeParent))) return false;
    if (!p.niveauClasse && p.progressionEnAttente) {
      p.progression = p.progression || {};
      p.progression[niveau] = Object.assign({}, p.progressionEnAttente, p.progression[niveau] || {});
      delete p.progressionEnAttente;
    }
    p.niveauClasse = niveau;
    this.sauvegarder();
    return true;
  }

  /** Mode parent : redéfinit le code d'un enfant sans connaître l'ancien. */
  async reinitialiserCode(prenom, nouveau, codeParent) {
    const p = this._profil(prenom);
    if (!p || !Auth.codeValide(nouveau)) return false;
    if (!(await this._verifierParentOuAbsent(codeParent))) return false;
    p.code = await Auth.creerEmpreinte(nouveau);
    Auth.reinitialiserLimite('profil:' + prenom);
    this.sauvegarder();
    return true;
  }

  // --- Codes ---

  /** État de la limitation pour un profil : { bloque, restantMs, essaisRestants }. */
  getEtatBlocage(prenom) {
    return Auth.etatLimite('profil:' + prenom);
  }

  getEtatBlocageParent() {
    return Auth.etatLimite('parent');
  }

  /** true si le code est correct. Pendant une pause anti-devinette : false sans compter d'essai. */
  async verifierCode(prenom, code) {
    const p = this._profil(prenom);
    if (!p || !p.code) return false;
    const cle = 'profil:' + prenom;
    if (Auth.etatLimite(cle).bloque) return false;
    const ok = await Auth.verifierEmpreinte(code, p.code);
    if (ok) Auth.reinitialiserLimite(cle);
    else Auth.enregistrerEchec(cle);
    return ok;
  }

  /** Connexion : { ok } ou { ok:false, erreur, bloque, restantMs, essaisRestants }. */
  async connecter(prenom, code) {
    const p = this._profil(prenom);
    if (!p) return { ok: false, erreur: 'Profil inconnu.' };
    if (!p.code) return { ok: false, erreur: 'Ce profil doit d\'abord choisir un code.', aConfigurer: true };
    const avant = this.getEtatBlocage(prenom);
    if (avant.bloque) {
      return { ok: false, erreur: 'Attends un peu avant de réessayer.', bloque: true, restantMs: avant.restantMs, essaisRestants: 0 };
    }
    const ok = await this.verifierCode(prenom, code);
    if (!ok) {
      const e = this.getEtatBlocage(prenom);
      return { ok: false, erreur: 'Code incorrect.', bloque: e.bloque, restantMs: e.restantMs, essaisRestants: e.essaisRestants };
    }
    this.donnees.joueurActif = prenom;
    this.sauvegarder();
    return { ok: true };
  }

  /** Change son propre code (ancien code requis, soumis à la limitation). Promise<boolean>. */
  async changerCode(prenom, ancien, nouveau) {
    const p = this._profil(prenom);
    if (!p || !Auth.codeValide(nouveau)) return false;
    if (!(await this.verifierCode(prenom, ancien))) return false;
    p.code = await Auth.creerEmpreinte(nouveau);
    this.sauvegarder();
    return true;
  }

  // --- Code parent (optionnel) ---

  aCodeParent() {
    return !!this.donnees.codeParent;
  }

  /**
   * Définit ou change le code parent. Si un code parent existe déjà, `ancien` est requis.
   * Promise<boolean>.
   */
  async definirCodeParent(code, ancien) {
    if (!Auth.codeValide(code)) return false;
    if (this.donnees.codeParent && !(await this.verifierCodeParent(ancien))) return false;
    this.donnees.codeParent = await Auth.creerEmpreinte(code);
    Auth.reinitialiserLimite('parent');
    this.sauvegarder();
    return true;
  }

  async verifierCodeParent(code) {
    if (!this.donnees.codeParent) return false;
    if (Auth.etatLimite('parent').bloque) return false;
    const ok = await Auth.verifierEmpreinte(code, this.donnees.codeParent);
    if (ok) Auth.reinitialiserLimite('parent');
    else Auth.enregistrerEchec('parent');
    return ok;
  }

  // --- Avatar et Couleur ---

  getAvatar(nom) {
    const p = this._profil(nom || this.donnees.joueurActif);
    return (p && p._avatar) || '🧙‍♂️';
  }

  setAvatar(avatar) {
    const p = this._profilActif();
    if (!p) return;
    p._avatar = avatar;
    this.sauvegarder();
  }

  getCouleur(nom) {
    const p = this._profil(nom || this.donnees.joueurActif);
    return (p && p._couleur) || '#A077EE';
  }

  setCouleur(couleur) {
    const p = this._profilActif();
    if (!p) return;
    p._couleur = couleur;
    this.sauvegarder();
  }

  // --- Stats / titre de mage ---

  /** Ensemble des « sacs » de missions d'un profil : tous les niveaux de classe + l'attente. */
  _sacs(profil) {
    const sacs = Object.keys(profil.progression || {}).map(n => profil.progression[n]);
    if (profil.progressionEnAttente) sacs.push(profil.progressionEnAttente);
    return sacs;
  }

  _missionActive(id) {
    const prog = this.getProgramme();
    if (!prog) return true;
    const court = id.replace(/^geometrie-/, '');
    const a = prog.calcul && prog.calcul[id];
    if (a) return a.actif !== false;
    const g = prog.geometrie && (prog.geometrie[id] || prog.geometrie[court]);
    if (g) return g.actif !== false;
    return true;
  }

  /**
   * Stats cumulées sur tous les niveaux de classe (meilleur niveau par mission, somme des
   * parties de jeux) : changer de classe ne fait jamais perdre un avatar ou un titre.
   */
  getStatsProgression(nom) {
    const profil = this._profil(nom || this.donnees.joueurActif);
    if (!profil) {
      return {
        _totalNiveaux: 0, _niveauMax: 0, _calculsComplets: false, _geometrieComplete: false, _toutesCompletes: false, _toutesMaitrisees: false,
        _morpionJouees: 0, _penduGagnees: 0, _chiffreGagnees: 0, _p4Jouees: 0, _jeuxJoues: 0
      };
    }
    const sacs = this._sacs(profil);
    const meilleur = (id) => sacs.reduce((m, s) => Math.max(m, (s[id] && s[id].niveau) || 1), 1);
    const somme = (id, champ) => sacs.reduce((t, s) => t + ((s[id] && s[id][champ]) || 0), 0);

    // missions connues + toute autre mission de progression (hors jeux)
    const ids = new Set(GestionnaireProfils.TOUTES_MISSIONS);
    sacs.forEach(s => Object.keys(s).forEach(k => {
      if (k.indexOf('jeu-') !== 0 && s[k] && typeof s[k].niveau === 'number') ids.add(k);
    }));

    let total = 0, max = 0;
    ids.forEach(id => {
      const n = meilleur(id);
      total += n;
      if (n > max) max = n;
    });

    const tousAtteints = (liste, seuil) => {
      const actives = liste.filter(id => this._missionActive(id));
      return actives.length > 0 && actives.every(id => meilleur(id) >= seuil);
    };
    const activesToutes = GestionnaireProfils.TOUTES_MISSIONS;
    const calculsOk = tousAtteints(GestionnaireProfils.MISSIONS_CALCUL, 2);
    const geoOk = tousAtteints(GestionnaireProfils.MISSIONS_GEOMETRIE, 2);

    const _morpionJouees = somme('jeu-morpion', 'partiesJouees');
    const _penduGagnees = somme('jeu-pendu', 'partiesGagnees');
    const _p4Jouees = somme('jeu-puissance4', 'partiesJouees');
    let _chiffreGagnees = 0;
    // Les plages dépendent de la classe (10, 20, 50, 100, 500, 1000, 5000, ...): on parcourt les clés réelles.
    const clesChiffre = new Set();
    sacs.forEach(s => Object.keys(s).forEach(k => { if (/^jeu-trouver-chiffre-\d+$/.test(k)) clesChiffre.add(k); }));
    clesChiffre.forEach(k => { _chiffreGagnees += somme(k, 'partiesGagnees'); });
    _chiffreGagnees += somme('jeu-trouver-chiffre', 'partiesGagnees'); // ancienne clé

    const _jeuxJoues = _morpionJouees + somme('jeu-pendu', 'partiesJouees') + _p4Jouees + _chiffreGagnees;

    return {
      _totalNiveaux: total,
      _niveauMax: max,
      _calculsComplets: calculsOk,
      _geometrieComplete: geoOk,
      _toutesCompletes: tousAtteints(activesToutes, 2),
      _toutesMaitrisees: tousAtteints(activesToutes, 3),
      _morpionJouees,
      _penduGagnees,
      _chiffreGagnees,
      _p4Jouees,
      _jeuxJoues
    };
  }

  getTitreMage(nom) {
    const stats = this.getStatsProgression(nom);
    for (const t of GestionnaireProfils.TITRES_MAGE) {
      if (stats._totalNiveaux >= t.seuil) return t.titre;
    }
    return '✨ Apprenti';
  }

  getAvatarsDisponibles(nom) {
    const stats = this.getStatsProgression(nom);
    const disponibles = [...GestionnaireProfils.AVATARS_BASE];
    const debloquesInfos = [];

    GestionnaireProfils.AVATARS_DEBLOQUABLES.forEach(a => {
      const debloque = a.test(stats);
      if (debloque) disponibles.push(a.emoji);
      debloquesInfos.push({ ...a, debloque });
    });

    return { disponibles, debloquesInfos };
  }

  // --- Progression (implicitement au niveau de classe du profil actif) ---

  getProgression(missionId) {
    const sac = this._progressionActive(false);
    return (sac && sac[missionId]) || { niveau: 1 };
  }

  setProgression(missionId, data) {
    if (!this._profilActif()) {
      console.warn('[Profils] Aucun joueur actif, progression non sauvegardée.');
      return;
    }
    this._progressionActive(true)[missionId] = data;
    this.sauvegarder();
  }

  /** Progression d'un niveau de classe précis (lecture seule, historique). */
  getProgressionNiveau(niveauClasse, missionId, nom) {
    const p = this._profil(nom || this.donnees.joueurActif);
    const sac = p && p.progression && p.progression[niveauClasse];
    return (sac && sac[missionId]) || { niveau: 1 };
  }

  // --- Garde d'accès ---

  /**
   * Vérifie qu'un profil complet (niveau + code) est connecté ; sinon redirige vers
   * connexion.html (avec ?retour= pour revenir ensuite). Retourne true si l'accès est autorisé.
   */
  verifierAccesOuRediriger(basePathVersRacine) {
    const nom = this.getJoueurActif();
    const p = this._profilActif();
    const ok = !!(nom && p && p.niveauClasse && p.code);
    if (ok) return true;
    // joueur actif invalide ou profil migré non configuré
    if (nom && (!p || !p.niveauClasse || !p.code)) {
      this.donnees.joueurActif = null;
      this.sauvegarder();
    }
    let url = (basePathVersRacine || '') + 'connexion.html';
    try {
      const retour = window.location.pathname + window.location.search;
      url += '?retour=' + encodeURIComponent(retour);
    } catch (e) { /* ignore */ }
    window.location.href = url;
    return false;
  }
}

// --- Son magique (Web Audio API) ---

class SonMagique {
  static jouer(type = 'selection') {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      if (type === 'selection') {
        // Petit chime magique ascendant
        [523, 659, 784].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.3);
        });
      } else if (type === 'validation') {
        // Son de validation plus riche
        [440, 554, 659, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.12, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.4);
        });
      }
      // Fermer le contexte après les sons
      setTimeout(() => ctx.close(), 1000);
    } catch (e) {
      // Web Audio non supporté, pas grave
    }
  }
}

window.SonMagique = SonMagique;

// Singleton global
window.gestionnaireProfils = new GestionnaireProfils();
