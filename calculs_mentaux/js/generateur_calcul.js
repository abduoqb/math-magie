/* Générateur de calculs piloté par le programme du niveau (programmes/<niveau>.js).
 * Fonction pure (sans DOM), utilisable dans le navigateur (window.GenerateurCalcul)
 * et dans node pour les tests (module.exports).
 *
 * Conventions (voir docs/REFONTE-SPEC.md) :
 *  - additions : min/max bornent le RÉSULTAT (sauf programme `cm1` : bornes de CHAQUE TERME,
 *    cf. BORNES_PAR_TERME) ; termes 2 ou 3 ; decimaux = décimales des opérandes.
 *  - soustractions : max borne le plus grand nombre (minuende), min le borne par le bas ;
 *    résultat toujours >= 1 (jamais négatif) ; retenue = emprunt.
 *  - multiplications : a et b sont des intervalles ; decimaux s'applique à a.
 *  - divisions : dividende = diviseur x quotient (+ reste si reste:true) ; avec decimaux>0
 *    le quotient est décimal exact et il n'y a pas de reste.
 * Tous les calculs se font sur des entiers « mis à l'échelle » (x 10^decimaux) : pas d'erreur flottante.
 */
(function (global) {
  "use strict";

  // Niveaux dont les additions utilisent min/max comme bornes de chaque terme.
  var BORNES_PAR_TERME = { cm1: true };

  function ri(a, b) {
    if (b < a) b = a;
    return a + Math.floor(Math.random() * (b - a + 1));
  }
  function pow10(d) { return Math.pow(10, d || 0); }

  function chiffre(n, i) { return Math.floor(n / Math.pow(10, i)) % 10; }
  function nbChiffres(n) { return String(n).length; }

  // Y a-t-il au moins une retenue en additionnant les nombres en colonnes ?
  function aRetenueAddition(termes) {
    var longueur = 0, i, j, carry = 0, s;
    for (i = 0; i < termes.length; i++) longueur = Math.max(longueur, nbChiffres(termes[i]));
    for (i = 0; i < longueur; i++) {
      s = carry;
      for (j = 0; j < termes.length; j++) s += chiffre(termes[j], i);
      if (s >= 10) return true;
      carry = 0;
    }
    return false;
  }

  // Y a-t-il au moins un emprunt dans x - y (x >= y) ?
  function aEmprunt(x, y) {
    var longueur = Math.max(nbChiffres(x), nbChiffres(y)), i;
    for (i = 0; i < longueur; i++) {
      if (chiffre(x, i) < chiffre(y, i)) return true;
    }
    return false;
  }

  function aRetenueSoustraction(termes) {
    var cur = termes[0], i, emprunt = false;
    for (i = 1; i < termes.length; i++) {
      if (aEmprunt(cur, termes[i])) emprunt = true;
      cur -= termes[i];
    }
    return emprunt;
  }

  function format(n, d) {
    if (!d) return String(n);
    var s = Math.pow(10, d);
    var ent = Math.floor(n / s);
    var dec = String(n % s);
    while (dec.length < d) dec = "0" + dec;
    return ent + "," + dec;
  }

  function aspectDecimal(n, d) { return !d || n % 10 !== 0; }

  var ESSAIS = 6000;

  function genAddition(p, parTerme) {
    var d = p.decimaux || 0, s = pow10(d), k = p.termes || 2;
    var min = Math.round((p.min || 0) * s), max = Math.round(p.max * s);
    var t, i, R, lo, a, b, c, dernier = null;
    for (i = 0; i < ESSAIS; i++) {
      var cosmetique = i < ESSAIS / 3;
      if (parTerme) {
        var tlo = Math.max(1, min), thi = Math.max(tlo, max);
        t = [];
        for (var j = 0; j < k; j++) t.push(ri(tlo, thi));
      } else {
        var rmin = Math.max(min, k), rmax = Math.max(max, rmin);
        R = ri(rmin, rmax);
        if (k === 2) {
          lo = (i < ESSAIS / 2) ? Math.max(1, Math.round(R * 0.15)) : 1;
          if (lo > R - lo) lo = 1;
          a = ri(lo, R - lo);
          t = [a, R - a];
        } else {
          lo = (i < ESSAIS / 2) ? Math.max(1, Math.round(R * 0.1)) : 1;
          if (3 * lo > R) lo = 1;
          a = ri(lo, R - 2 * lo);
          b = ri(lo, R - a - lo);
          c = R - a - b;
          t = [a, b, c];
        }
      }
      dernier = t;
      if (cosmetique && !t.every(function (x) { return aspectDecimal(x, d); })) continue;
      if (aRetenueAddition(t) !== !!p.retenue) continue;
      return fin(t);
    }
    return fin(dernier, true);

    function fin(tt, approx) {
      var somme = tt.reduce(function (x, y) { return x + y; }, 0);
      return { termes: tt.map(function (x) { return format(x, d); }), resultat: somme / s, resultatEntier: somme, decimaux: d, approx: !!approx, brut: tt };
    }
  }

  function genSoustraction(p) {
    var d = p.decimaux || 0, s = pow10(d), k = p.termes || 2;
    var min = Math.round((p.min || 0) * s), max = Math.round(p.max * s);
    var i, A, t, dernier = null, lo, b, c;
    var amin = Math.max(min, k), amax = Math.max(max, amin);
    for (i = 0; i < ESSAIS; i++) {
      var cosmetique = i < ESSAIS / 3;
      A = ri(amin, amax);
      lo = (i < ESSAIS / 2) ? Math.max(1, Math.round(A * 0.1)) : 1;
      if (k === 2) {
        if (lo > A - 1) lo = 1;
        b = ri(lo, A - 1);
        t = [A, b];
      } else {
        if (2 * lo + 1 > A) lo = 1;
        b = ri(lo, A - lo - 1);
        c = ri(lo, A - b - 1);
        t = [A, b, c];
      }
      dernier = t;
      if (cosmetique && !t.every(function (x) { return aspectDecimal(x, d); })) continue;
      if (aRetenueSoustraction(t) !== !!p.retenue) continue;
      return fin(t);
    }
    return fin(dernier, true);

    function fin(tt, approx) {
      var res = tt.slice(1).reduce(function (x, y) { return x - y; }, tt[0]);
      return { termes: tt.map(function (x) { return format(x, d); }), resultat: res / s, resultatEntier: res, decimaux: d, approx: !!approx, brut: tt };
    }
  }

  function genMultiplication(p) {
    var d = p.decimaux || 0, s = pow10(d);
    var amin = Math.round(p.a[0] * s), amax = Math.round(p.a[1] * s);
    var A = ri(amin, amax), i;
    if (d > 0) {
      for (i = 0; i < 200 && !aspectDecimal(A, d); i++) A = ri(amin, amax);
    }
    var B = ri(p.b[0], p.b[1]);
    var prod = A * B;
    return { A: A, B: B, a: format(A, d), b: String(B), resultat: prod / s, resultatEntier: prod, decimaux: d, brut: [A, B] };
  }

  function genDivision(p) {
    var k = p.decimaux || 0, sk = pow10(k);
    var dv = ri(p.diviseur[0], p.diviseur[1]);
    var qmin = Math.round(p.quotient[0] * sk), qmax = Math.round(p.quotient[1] * sk);
    var Q = ri(qmin, qmax), i;
    if (k > 0) {
      for (i = 0; i < 200 && !aspectDecimal(Q, k); i++) Q = ri(qmin, qmax);
    }
    var reste = 0;
    if (p.reste && k === 0 && dv >= 2) reste = ri(1, dv - 1);
    var D = dv * Q + reste;
    return { a: format(D, k), b: String(dv), resultat: Q / sk, quotient: Q / sk, reste: reste, diviseur: dv, dividende: D, decimaux: k, avecReste: reste > 0 };
  }

  var SIGNES = { additions: "+", soustractions: "-", multiplications: "×", divisions: "÷" };
  var MOTS = { additions: "plus", soustractions: "moins", multiplications: "fois", divisions: "divisé par" };

  /**
   * @param {string} op   additions | soustractions | multiplications | divisions
   * @param {object} programme  objet programme (window.PROGRAMMES.<niveau>)
   * @param {number} palier 1..niveaux.length
   * @param {string} [niveauClasse] défaut programme.id
   * @returns {{texte, voix, resultat, a, b, aide, ...}}
   */
  function generer(op, programme, palier, niveauClasse) {
    var def = programme.calcul[op];
    var niveaux = def.niveaux;
    var idx = Math.min(niveaux.length, Math.max(1, palier)) - 1;
    var p = niveaux[idx];
    var classe = niveauClasse || programme.id;
    var r, texte, voix, a, b;

    if (op === "additions") {
      r = genAddition(p, !!BORNES_PAR_TERME[classe]);
    } else if (op === "soustractions") {
      r = genSoustraction(p);
    } else if (op === "multiplications") {
      r = genMultiplication(p);
    } else {
      r = genDivision(p);
    }

    if (r.termes) {
      texte = r.termes.join(" " + SIGNES[op] + " ") + " = ";
      voix = r.termes.join(" " + MOTS[op] + " ");
      a = r.termes[0]; b = r.termes[1];
    } else {
      a = r.a; b = r.b;
      texte = a + " " + SIGNES[op] + " " + b + " = ";
      voix = a + " " + MOTS[op] + " " + b;
      if (classe === "cp" && op === "multiplications" && p.a[0] === 2 && p.a[1] === 2) {
        texte = "Double de " + b + " = ";
        voix = "Le double de " + b;
      } else if (classe === "cp" && op === "divisions" && p.diviseur[0] === 2 && p.diviseur[1] === 2) {
        texte = "Moitié de " + a + " = ";
        voix = "La moitié de " + a;
      }
    }
    r.texte = texte;
    r.voix = voix;
    r.aide = (op === "divisions" && r.avecReste) ? "Donne seulement le quotient entier (sans le reste)." : "";
    r.palier = idx + 1;
    return r;
  }

  var api = { generer: generer, format: format, SIGNES: SIGNES, aRetenueAddition: aRetenueAddition, aRetenueSoustraction: aRetenueSoustraction, BORNES_PAR_TERME: BORNES_PAR_TERME };
  global.GenerateurCalcul = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
