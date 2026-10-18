/* Calcul Éclair : générateur de calculs mentaux (pur, testable) et règles du jeu.
   Aucune dépendance au DOM. Exporté aussi pour Node (tests). */
(function (root) {
  'use strict';

  var NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
  var NIVEAU_DEFAUT = 'ce2';
  var MODES = ['additions', 'tables', 'melange'];

  /* Réglages par classe :
     duree  = secondes de départ
     seuils = nombre de bonnes réponses pour 1, 2 et 3 étoiles
     paliers = bonnes réponses à atteindre pour passer au palier 1 puis 2 (difficulté croissante) */
  var PARAMS = {
    cp:  { duree: 90, seuils: [5, 9, 14],  paliers: [5, 12], decimal: false },
    ce1: { duree: 60, seuils: [8, 14, 20], paliers: [6, 14], decimal: false },
    ce2: { duree: 60, seuils: [8, 14, 20], paliers: [6, 14], decimal: false },
    cm1: { duree: 60, seuils: [7, 12, 18], paliers: [6, 13], decimal: true },
    cm2: { duree: 60, seuils: [6, 11, 16], paliers: [5, 12], decimal: true }
  };

  /* Textes de l'écran de choix : [nom, détail] par classe et par mode */
  var LIBELLES = {
    cp: {
      additions: ['Additions et soustractions', 'Jusqu’à 20, puis jusqu’à 30'],
      tables: ['Doubles et moitiés', 'Le double, la moitié'],
      melange: ['Mélange', 'Un peu de tout']
    },
    ce1: {
      additions: ['Additions et soustractions', 'Jusqu’à 100'],
      tables: ['Tables de multiplication', 'Tables de 2, 3, 4, 5 et 10'],
      melange: ['Mélange', 'Un peu de tout']
    },
    ce2: {
      additions: ['Additions et soustractions', 'Jusqu’à 1 000'],
      tables: ['Tables et divisions', 'Toutes les tables, divisions exactes'],
      melange: ['Mélange', 'Un peu de tout']
    },
    cm1: {
      additions: ['Additions et soustractions', 'Grands nombres et premiers décimaux'],
      tables: ['Multiplications et divisions', 'Tables, × 10, × 100, divisions'],
      melange: ['Mélange', 'Un peu de tout']
    },
    cm2: {
      additions: ['Additions et soustractions', 'Décimaux et grands nombres'],
      tables: ['Multiplications et divisions', 'Tables, × 0,5, pourcentages'],
      melange: ['Mélange', 'Un peu de tout']
    }
  };

  /* ---------- Outils ---------- */
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(rng, tab) { return tab[Math.floor(rng() * tab.length)]; }
  function arrondi(x) { return Math.round(x * 1000) / 1000; }
  function coin(rng, p) { return rng() < p; }

  /** Nombre affiché : virgule décimale, espace insécable entre les milliers. */
  function nb(x) {
    var s = String(arrondi(x)).split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return s.join(',');
  }
  /** Réponse attendue écrite comme l'enfant la tape (sans espace). */
  function formaterReponse(x) { return String(arrondi(x)).replace('.', ','); }

  function creer(type, texte, reponse, a, b) {
    return { type: type, texte: texte, reponse: arrondi(reponse), a: a, b: b };
  }
  function addition(a, b) { return creer('add', nb(a) + ' + ' + nb(b), a + b, a, b); }
  function soustraction(a, b) { return creer('sub', nb(a) + ' − ' + nb(b), a - b, a, b); }
  function produit(a, b) { return creer('mul', nb(a) + ' × ' + nb(b), a * b, a, b); }
  function quotient(a, b) { return creer('div', nb(a) + ' ÷ ' + nb(b), a / b, a, b); }

  /* ---------- Additions et soustractions ---------- */
  // Petits nombres (CP, CE1) : borne max, second terme éventuellement limité
  function petitsNombres(rng, max, limiteB) {
    var a, b;
    if (coin(rng, 0.5)) {
      b = ri(rng, 1, limiteB ? Math.min(limiteB, max - 2) : max - 2);
      a = ri(rng, 2, max - b);
      return addition(a, b);
    }
    a = ri(rng, 3, max);
    b = ri(rng, 1, limiteB ? Math.min(limiteB, a - 1) : a - 1);
    return soustraction(a, b);
  }
  // Deux nombres à deux chiffres, somme ≤ 100
  function deuxChiffres(rng) {
    var a, b;
    if (coin(rng, 0.5)) {
      a = ri(rng, 11, 89); b = ri(rng, 11, 100 - a);
      return addition(a, b);
    }
    a = ri(rng, 20, 99); b = ri(rng, 11, a - 1);
    return soustraction(a, b);
  }
  // Un nombre + des dizaines ou des unités
  function unitesDizaines(rng) {
    var a, b;
    if (coin(rng, 0.5)) {
      a = ri(rng, 10, 90);
      b = coin(rng, 0.5) ? ri(rng, 1, 9) : ri(rng, 1, 9) * 10;
      if (a + b > 100) b = 100 - a > 0 ? 100 - a : 1;
      return addition(a, b);
    }
    a = ri(rng, 20, 99);
    b = coin(rng, 0.5) ? ri(rng, 1, 9) : ri(rng, 1, 9) * 10;
    if (b >= a) b = ri(rng, 1, 9);
    return soustraction(a, b);
  }
  // Nombres jusqu'à 1000
  function jusqua1000(rng, facile) {
    var a, b;
    if (coin(rng, 0.5)) {
      a = ri(rng, 100, 899);
      b = facile ? ri(rng, 1, 10) * 10 : ri(rng, 11, 1000 - a);
      return addition(a, b);
    }
    a = ri(rng, 200, 999);
    b = facile ? ri(rng, 1, 10) * 10 : ri(rng, 11, a - 1);
    return soustraction(a, b);
  }
  // Nombres décimaux : s = 10 (dixièmes) ou 100 (centièmes)
  function decimaux(rng, s, minA, maxA) {
    var A = ri(rng, minA, maxA), B;
    if (coin(rng, 0.5)) {
      B = ri(rng, minA, maxA);
      return addition(A / s, B / s);
    }
    B = ri(rng, Math.min(minA, A - 1), A - 1);
    return soustraction(A / s, B / s);
  }
  // Grands entiers « ronds » (multiples de pas)
  function grandsEntiers(rng, pas, minK, maxK) {
    var a = ri(rng, minK, maxK) * pas, b = ri(rng, minK, maxK) * pas;
    if (coin(rng, 0.5)) return addition(a, b);
    return a >= b ? soustraction(a, b) : soustraction(b, a);
  }

  function additions(n, p, rng) {
    var q, b;
    switch (n) {
      case 'cp':
        return petitsNombres(rng, p === 2 ? 30 : 20, p === 0 ? 5 : 0);
      case 'ce1':
        if (p === 0) return petitsNombres(rng, 20, 0);
        return p === 1 ? unitesDizaines(rng) : deuxChiffres(rng);
      case 'ce2':
        if (p === 0) return deuxChiffres(rng);
        return jusqua1000(rng, p === 1);
      case 'cm1':
        if (p === 0) return jusqua1000(rng, false);
        if (p === 1) {
          if (coin(rng, 0.3)) return decimaux(rng, 10, 11, 99);
          if (coin(rng, 0.5)) {
            var a = ri(rng, 1000, 8999);
            b = ri(rng, 100, 999);
            return coin(rng, 0.5) ? addition(a, b) : soustraction(a, b);
          }
          return grandsEntiers(rng, 100, 10, 99);
        }
        if (coin(rng, 0.4)) return decimaux(rng, 10, 11, 99);
        return grandsEntiers(rng, 100, 10, 500);
      case 'cm2':
      default:
        if (p === 0) return decimaux(rng, 10, 11, 99);
        if (p === 1) {
          if (coin(rng, 0.5)) return decimaux(rng, 100, 101, 999);
          // décimal + dixième
          var x = ri(rng, 101, 999), y = ri(rng, 1, 9) * 10;
          return coin(rng, 0.5) ? addition(x / 100, y / 100) : soustraction(x / 100, y / 100);
        }
        if (coin(rng, 0.4)) return decimaux(rng, 100, 101, 999);
        q = grandsEntiers(rng, 1000, 10, 500);
        return q;
    }
  }

  /* ---------- Tables, multiplications, divisions ---------- */
  function table(rng, tables, kMin, kMax) {
    var t = pick(rng, tables), k = ri(rng, kMin, kMax);
    return coin(rng, 0.5) ? produit(t, k) : produit(k, t);
  }
  // Division exacte par un diviseur de la liste
  function divisionExacte(rng, diviseurs, kMin, kMax) {
    var d = pick(rng, diviseurs), k = ri(rng, kMin, kMax);
    return quotient(d * k, d);
  }
  function doubleDe(rng, max) {
    var x = ri(rng, 1, max);
    return creer('double', 'Double de ' + nb(x), 2 * x, x, 2);
  }
  function moitieDe(rng, max) {
    var x = 2 * ri(rng, 1, max);
    return creer('moitie', 'Moitié de ' + nb(x), x / 2, x, 2);
  }
  function pourcentage(rng, taux, valeur) {
    return creer('pct', taux + ' % de ' + nb(valeur), taux * valeur / 100, taux, valeur);
  }

  function tables(n, p, rng) {
    var t, x;
    switch (n) {
      case 'cp':
        x = [10, 15, 20][p];
        return coin(rng, 0.5) ? doubleDe(rng, x) : moitieDe(rng, x);
      case 'ce1':
        t = p === 0 ? [2, 5, 10] : [2, 3, 4, 5, 10];
        if (p === 2 && coin(rng, 0.25)) return divisionExacte(rng, [2, 5, 10], 1, 10);
        return table(rng, t, p === 0 ? 1 : 2, 10);
      case 'ce2':
        if (p === 0) return table(rng, [2, 3, 4, 5, 10], 1, 10);
        if (p === 1) return table(rng, [2, 3, 4, 5, 6, 7, 8, 9], 2, 10);
        if (coin(rng, 0.35)) return divisionExacte(rng, [2, 3, 4, 5, 6, 7, 8, 9], 2, 10);
        return table(rng, [2, 3, 4, 5, 6, 7, 8, 9], 2, 10);
      case 'cm1':
        if (p === 0) {
          if (coin(rng, 0.3)) return divisionExacte(rng, [2, 3, 4, 5, 6, 7, 8, 9], 2, 10);
          return table(rng, [2, 3, 4, 5, 6, 7, 8, 9], 2, 10);
        }
        if (p === 1) {
          x = rng();
          if (x < 0.35) return produit(ri(rng, 2, 99), pick(rng, [10, 100]));
          if (x < 0.55) return quotient(ri(rng, 2, 99) * 10, 10);
          if (x < 0.8) return produit(ri(rng, 11, 49), ri(rng, 2, 9));
          return divisionExacte(rng, [2, 3, 4, 5, 6, 7, 8, 9], 2, 12);
        }
        x = rng();
        if (x < 0.25) return produit(ri(rng, 101, 999), ri(rng, 2, 9));
        if (x < 0.5) return produit(ri(rng, 11, 99) / 10, pick(rng, [10, 100]));
        if (x < 0.7) return quotient(ri(rng, 11, 999), 10);
        return divisionExacte(rng, [2, 3, 4, 5, 6, 7, 8, 9], 11, 25);
      case 'cm2':
      default:
        if (p === 0) {
          x = rng();
          if (x < 0.3) return produit(0.5, 2 * ri(rng, 1, 30));
          if (x < 0.5) return divisionExacte(rng, [2, 3, 4, 5, 6, 7, 8, 9], 2, 12);
          return table(rng, [3, 4, 6, 7, 8, 9], 3, 12);
        }
        if (p === 1) {
          x = rng();
          if (x < 0.3) return produit(0.5, ri(rng, 3, 99));
          if (x < 0.6) return pourcentage(rng, pick(rng, [10, 50]), ri(rng, 1, 50) * 10);
          if (x < 0.8) return produit(ri(rng, 11, 99) / 10, pick(rng, [10, 100]));
          return produit(ri(rng, 11, 99), ri(rng, 2, 9));
        }
        x = rng();
        if (x < 0.3) return pourcentage(rng, pick(rng, [10, 50]), ri(rng, 3, 99) * 5);
        if (x < 0.5) return produit(ri(rng, 11, 99) / 10, ri(rng, 2, 9));
        if (x < 0.65) return produit(0.5, ri(rng, 11, 199));
        if (x < 0.8) return quotient(ri(rng, 11, 999), 10);
        return produit(ri(rng, 101, 999), ri(rng, 2, 9));
    }
  }

  /* ---------- Interface publique ---------- */
  function normNiveau(n) { return NIVEAUX.indexOf(n) >= 0 ? n : NIVEAU_DEFAUT; }

  /**
   * Une question : { type, texte, reponse, a, b }.
   * palier : 0, 1 ou 2 (de plus en plus difficile au fil de la partie).
   */
  function generer(niveau, mode, palier, rng) {
    rng = rng || Math.random;
    var n = normNiveau(niveau);
    var p = Math.max(0, Math.min(2, palier | 0));
    if (mode === 'melange') mode = coin(rng, 0.5) ? 'additions' : 'tables';
    return mode === 'tables' ? tables(n, p, rng) : additions(n, p, rng);
  }
  /** Comme generer, mais évite de reposer deux fois de suite la même question. */
  function suivante(niveau, mode, palier, rng, precedente) {
    var q = generer(niveau, mode, palier, rng);
    for (var i = 0; i < 10 && precedente && q.texte === precedente.texte; i++) {
      q = generer(niveau, mode, palier, rng);
    }
    return q;
  }
  function reponseJuste(saisie, attendu) {
    var s = String(saisie).replace(/[\s ]/g, '').replace(',', '.');
    if (!/^\d+(\.\d*)?$/.test(s)) return false;
    var v = parseFloat(s);
    return !isNaN(v) && Math.abs(v - attendu) < 1e-9;
  }
  function params(niveau) { return PARAMS[normNiveau(niveau)]; }
  function palierPour(niveau, bonnes) {
    var pl = params(niveau).paliers;
    return bonnes >= pl[1] ? 2 : bonnes >= pl[0] ? 1 : 0;
  }
  function etoiles(niveau, score) {
    var s = params(niveau).seuils, e = 0;
    for (var i = 0; i < s.length; i++) if (score >= s[i]) e = i + 1;
    return e;
  }
  /** Secondes gagnées quand la série atteint ce nombre (toutes les 5 bonnes réponses d'affilée). */
  function bonusSerie(serie) { return serie > 0 && serie % 5 === 0 ? 3 : 0; }
  function libelle(niveau, mode) { return LIBELLES[normNiveau(niveau)][mode]; }

  var API = {
    NIVEAUX: NIVEAUX, MODES: MODES, PARAMS: PARAMS, LIBELLES: LIBELLES,
    generer: generer, suivante: suivante, reponseJuste: reponseJuste, params: params,
    palierPour: palierPour, etoiles: etoiles, bonusSerie: bonusSerie, libelle: libelle,
    formaterReponse: formaterReponse
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.Eclair = API;
})(typeof window !== 'undefined' ? window : globalThis);
