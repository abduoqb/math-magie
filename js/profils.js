/**
 * GestionnaireProfils — Module central de gestion des profils locaux.
 * Stocke tout sous la clé unique `mathemagie-profils` dans localStorage.
 * 
 * Structure : { joueurActif: "Nom" | null, profils: { "Nom": { _avatar, _couleur, operation: { niveau } } } }
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

  constructor() {
    this.CLE_STORAGE = 'mathemagie-profils';
    this.donnees = this.charger();
    this.migrerAnciennesDonnees();
  }

  // --- Persistance ---

  charger() {
    try {
      const raw = localStorage.getItem(this.CLE_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.profils) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[Profils] Données corrompues, réinitialisation.', e);
    }
    return { joueurActif: null, profils: {} };
  }

  sauvegarder() {
    localStorage.setItem(this.CLE_STORAGE, JSON.stringify(this.donnees));
  }

  // --- Migration des anciennes clés math-magie-* ---

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
      if (!this.donnees.profils[nomMigration]) {
        this.donnees.profils[nomMigration] = profilMigre;
      } else {
        Object.keys(profilMigre).forEach(op => {
          if (!this.donnees.profils[nomMigration][op]) {
            this.donnees.profils[nomMigration][op] = profilMigre[op];
          }
        });
      }
      // Avatar et couleur par défaut si absents
      if (!this.donnees.profils[nomMigration]._avatar) {
        this.donnees.profils[nomMigration]._avatar = '🧙‍♂️';
      }
      if (!this.donnees.profils[nomMigration]._couleur) {
        this.donnees.profils[nomMigration]._couleur = '#A077EE';
      }
      if (!this.donnees.joueurActif) {
        this.donnees.joueurActif = nomMigration;
      }
      this.sauvegarder();
      console.log('[Profils] Migration terminée → profil "Mage" créé.');
    }
  }

  // --- Joueur actif ---

  getJoueurActif() {
    return this.donnees.joueurActif || null;
  }

  setJoueurActif(nom) {
    if (!nom || !this.donnees.profils[nom]) {
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

  // --- Gestion des profils ---

  creerProfil(nom, avatar, couleur) {
    nom = (nom || '').trim();
    if (!nom) return { ok: false, erreur: 'Le nom ne peut pas être vide.' };
    if (nom.length > 15) return { ok: false, erreur: '15 caractères maximum.' };
    if (this.donnees.profils[nom]) return { ok: false, erreur: 'Ce mage existe déjà !' };

    this.donnees.profils[nom] = {
      _avatar: avatar || '🧙‍♂️',
      _couleur: couleur || '#A077EE'
    };
    this.sauvegarder();
    return { ok: true };
  }

  supprimerProfil(nom) {
    if (!this.donnees.profils[nom]) return false;
    delete this.donnees.profils[nom];
    if (this.donnees.joueurActif === nom) {
      this.donnees.joueurActif = null;
    }
    this.sauvegarder();
    return true;
  }

  getListeProfils() {
    return Object.keys(this.donnees.profils);
  }

  // --- Avatar et Couleur ---

  getAvatar(nom) {
    const n = nom || this.donnees.joueurActif;
    if (!n || !this.donnees.profils[n]) return '🧙‍♂️';
    return this.donnees.profils[n]._avatar || '🧙‍♂️';
  }

  setAvatar(avatar) {
    const joueur = this.donnees.joueurActif;
    if (!joueur || !this.donnees.profils[joueur]) return;
    this.donnees.profils[joueur]._avatar = avatar;
    this.sauvegarder();
  }

  getCouleur(nom) {
    const n = nom || this.donnees.joueurActif;
    if (!n || !this.donnees.profils[n]) return '#A077EE';
    return this.donnees.profils[n]._couleur || '#A077EE';
  }

  setCouleur(couleur) {
    const joueur = this.donnees.joueurActif;
    if (!joueur || !this.donnees.profils[joueur]) return;
    this.donnees.profils[joueur]._couleur = couleur;
    this.sauvegarder();
  }

  // --- Titre de mage ---

  getStatsProgression(nom) {
    const n = nom || this.donnees.joueurActif;
    if (!n || !this.donnees.profils[n]) {
      return { 
        _totalNiveaux: 0, _niveauMax: 0, _calculsComplets: false, _geometrieComplete: false, _toutesCompletes: false, _toutesMaitrisees: false,
        _morpionJouees: 0, _penduGagnees: 0, _chiffreGagnees: 0, _p4Jouees: 0, _jeuxJoues: 0
      };
    }
    const profil = this.donnees.profils[n];

    let total = 0;
    let max = 0;
    let calculsOk = true;
    let geoOk = true;
    let toutesOk = true;
    let toutesMaitrisees = true;

    GestionnaireProfils.TOUTES_MISSIONS.forEach(id => {
      const niv = profil[id]?.niveau || 1;
      total += niv;
      if (niv > max) max = niv;
      if (niv < 2) toutesOk = false;
      if (niv < 3) toutesMaitrisees = false;
    });

    GestionnaireProfils.MISSIONS_CALCUL.forEach(id => {
      const niv = profil[id]?.niveau || 1;
      if (niv < 2) calculsOk = false;
    });

    GestionnaireProfils.MISSIONS_GEOMETRIE.forEach(id => {
      const niv = profil[id]?.niveau || 1;
      if (niv < 2) geoOk = false;
    });

    const _morpionJouees = profil['jeu-morpion']?.partiesJouees || 0;
    const _penduGagnees = profil['jeu-pendu']?.partiesGagnees || 0;
    const _p4Jouees = profil['jeu-puissance4']?.partiesJouees || 0;
    
    let _chiffreGagnees = 0;
    [10, 100, 1000].forEach(max => {
      _chiffreGagnees += profil[`jeu-trouver-chiffre-${max}`]?.partiesGagnees || 0;
    });
    // Compatibilité avec l'ancienne clé "jeu-trouver-chiffre"
    _chiffreGagnees += profil['jeu-trouver-chiffre']?.partiesGagnees || 0;

    const _jeuxJoues = _morpionJouees + (profil['jeu-pendu']?.partiesJouees || 0) + _p4Jouees + _chiffreGagnees;

    return {
      _totalNiveaux: total,
      _niveauMax: max,
      _calculsComplets: calculsOk,
      _geometrieComplete: geoOk,
      _toutesCompletes: toutesOk,
      _toutesMaitrisees: toutesMaitrisees,
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

  // --- Progression par opération ---

  getProgression(nomOperation) {
    const joueur = this.donnees.joueurActif;
    if (!joueur || !this.donnees.profils[joueur]) return { niveau: 1 };
    return this.donnees.profils[joueur][nomOperation] || { niveau: 1 };
  }

  setProgression(nomOperation, data) {
    const joueur = this.donnees.joueurActif;
    if (!joueur || !this.donnees.profils[joueur]) {
      console.warn('[Profils] Aucun joueur actif, progression non sauvegardée.');
      return;
    }
    this.donnees.profils[joueur][nomOperation] = data;
    this.sauvegarder();
  }

  // --- Garde d'accès ---

  verifierAccesOuRediriger(basePathVersRacine) {
    if (!this.getJoueurActif()) {
      window.location.href = basePathVersRacine + 'choix-mage.html';
      return false;
    }
    return true;
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
