/**
 * GestionnaireProfils — Module central de gestion des profils locaux.
 * Stocke tout sous la clé unique `mathemagie-profils` dans localStorage.
 * 
 * Structure : { joueurActif: "Nom" | null, profils: { "Nom": { operation: { niveau } } } }
 */
class GestionnaireProfils {
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
    const anciensIds = [
      'additions', 'soustractions', 'multiplications', 'divisions',
      'geometrie-formes', 'geometrie-proprietes', 'geometrie-angles',
      'geometrie-symetrie', 'geometrie-vraifaux', 'geometrie-droites',
      'geometrie-triangles', 'geometrie-quadrilateres', 'geometrie-patrons'
    ];

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
        // Fusionner sans écraser les données existantes
        Object.keys(profilMigre).forEach(op => {
          if (!this.donnees.profils[nomMigration][op]) {
            this.donnees.profils[nomMigration][op] = profilMigre[op];
          }
        });
      }
      // Si pas de joueur actif, activer le profil migré
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

  creerProfil(nom) {
    nom = (nom || '').trim();
    if (!nom) return { ok: false, erreur: 'Le nom ne peut pas être vide.' };
    if (nom.length > 15) return { ok: false, erreur: '15 caractères maximum.' };
    if (this.donnees.profils[nom]) return { ok: false, erreur: 'Ce mage existe déjà !' };

    this.donnees.profils[nom] = {};
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

// Singleton global
window.gestionnaireProfils = new GestionnaireProfils();
