/**
 * Niveaux — constantes et helpers pour les niveaux de classe (CP → CM2).
 * Charger avant profils.js. Expose `window.Niveaux`, `window.NIVEAUX`, `window.LIBELLES_NIVEAUX`.
 */
(function (global) {
  'use strict';

  const NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];

  const LIBELLES = {
    cp: 'CP',
    ce1: 'CE1',
    ce2: 'CE2',
    cm1: 'CM1',
    cm2: 'CM2'
  };

  const LIBELLES_LONGS = {
    cp: 'Cours préparatoire',
    ce1: 'Cours élémentaire 1',
    ce2: 'Cours élémentaire 2',
    cm1: 'Cours moyen 1',
    cm2: 'Cours moyen 2'
  };

  const CYCLES = { cp: 2, ce1: 2, ce2: 2, cm1: 3, cm2: 3 };

  const Niveaux = {
    NIVEAUX,
    LIBELLES,
    LIBELLES_LONGS,
    CYCLES,

    estValide(niveau) {
      return NIVEAUX.indexOf(niveau) !== -1;
    },

    getLibelle(niveau) {
      return LIBELLES[niveau] || '';
    },

    getLibelleLong(niveau) {
      return LIBELLES_LONGS[niveau] || '';
    },

    getCycle(niveau) {
      return CYCLES[niveau] || null;
    },

    /** Position (0 = CP … 4 = CM2), -1 si inconnu. */
    getIndex(niveau) {
      return NIVEAUX.indexOf(niveau);
    },

    /** Niveau suivant, ou null après CM2. */
    getSuivant(niveau) {
      const i = NIVEAUX.indexOf(niveau);
      return i === -1 || i === NIVEAUX.length - 1 ? null : NIVEAUX[i + 1];
    },

    /** Programme (window.PROGRAMMES.<niveau>) ou null s'il n'est pas chargé. */
    getProgramme(niveau) {
      const p = global.PROGRAMMES;
      return (p && p[niveau]) || null;
    }
  };

  global.Niveaux = Niveaux;
  global.NIVEAUX = NIVEAUX;
  global.LIBELLES_NIVEAUX = LIBELLES;
})(typeof window !== 'undefined' ? window : globalThis);
