/* Range les nombres : générateur pur des manches (ordre, comparer, le plus proche de…).
   Aucune dépendance au DOM : exporté aussi pour Node (tests). rng injectable. */
(function (root) {
  'use strict';

  var NB_MANCHES = 8;          // manches par partie
  var SEUIL_VICTOIRE = 5;      // manches réussies sans erreur pour gagner
  var ERREURS_AVANT_AIDE = 2;  // erreurs tolérées avant de montrer la bonne carte
  var NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
  var EPS = 1e-6;
  var NBSP = ' ';

  /* ---------- Outils ---------- */
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function choix(rng, t) { return t[Math.floor(rng() * t.length)]; }
  function melanger(t, rng) {
    var a = t.slice(), i, j, x;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(rng() * (i + 1)); x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function egal(a, b) { return Math.abs(a - b) < EPS; }
  function signe(a, b) { return egal(a, b) ? 0 : (a < b ? -1 : 1); }
  function groupe(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP); }
  /** Décimal écrit à la française ; n est un entier mis à l'échelle 10^d. */
  function dec(n, d) {
    var s = (n / Math.pow(10, d)).toFixed(d), p;
    if (d > 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    p = s.split('.');
    p[0] = groupe(p[0]);
    return p.join(',');
  }
  function libre(x) { // écart affiché
    var p = String(Math.round(x * 10000) / 10000).split('.');
    p[0] = groupe(p[0]);
    return p.join(',');
  }
  function echangeChiffres(n, rng) {
    var s = String(n).split(''), i = ri(rng, 0, s.length - 1), j = ri(rng, 0, s.length - 1), t = s[i];
    s[i] = s[j]; s[j] = t;
    return s[0] === '0' ? n : Number(s.join(''));
  }

  /* ---------- Valeurs affichables : { texte, v } ---------- */
  function ent(n) { return { texte: groupe(n), v: n }; }
  function decimal(n, d) { return { texte: dec(n, d), v: n / Math.pow(10, d) }; }
  function fraction(a, b) { return { texte: a + '/' + b, v: a / b }; }
  function pourcent(p) { return { texte: p + NBSP + '%', v: p / 100 }; }
  function expr(texte, v) { return { texte: texte, v: v }; }

  var FRACTIONS = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10]];
  var FRACTIONS_CM1 = FRACTIONS.slice(0, 4).concat([[1, 10]]);
  function formes(fr) {
    var pc = fr[0] * 100 / fr[1];
    return { fraction: fraction(fr[0], fr[1]), decimal: decimal(pc, 2), pourcent: pourcent(pc), pc: pc };
  }
  function ecritureZero(t) { // 3,4 -> 3,40 (même valeur, écriture différente)
    var a = decimal(t, 1);
    return { texte: a.texte + '0', v: a.v };
  }

  /* ---------- Paramètres ---------- */
  var NB_CARTES = { cp: [3, 3, 4], ce1: [3, 4, 4], ce2: [4, 5, 5], cm1: [4, 5, 5], cm2: [4, 5, 5] };
  var BORNES = { cp: 100, ce1: 1000, ce2: 10000, cm1: 999999, cm2: 99999999 };
  var NOMS = ['Petite Magie', 'Grande Magie', 'Maître Magicien'];
  var DETAILS = {
    cp: ['jusqu’à 20', 'jusqu’à 100', 'nombres voisins'],
    ce1: ['jusqu’à 100', 'jusqu’à 1 000', 'calculs et signe ='],
    ce2: ['jusqu’à 1 000', 'jusqu’à 10 000', 'calculs et arrondis'],
    cm1: ['grands nombres', 'décimaux', 'fractions et décimaux'],
    cm2: ['grands nombres', 'décimaux', 'fractions et %']
  };
  var ARRONDIS = { 10: 'à la dizaine', 100: 'à la centaine', 1000: 'au millier', 10000: 'à la dizaine de mille', 100000: 'à la centaine de mille' };

  function niveauxDifficulte(niveau) {
    var d = DETAILS[niveau] || DETAILS.ce2;
    return NOMS.map(function (nom, i) { return { nom: nom, detail: d[i] }; });
  }
  /** Palier réel : les dernières manches montent d'un cran. */
  function palier(diff, rang) {
    var p = Math.max(0, Math.min(2, diff | 0));
    return (typeof rang === 'number' && rang >= 5) ? Math.min(2, p + 1) : p;
  }

  /* ---------- Manche « ordre » ---------- */
  function tirerDistincts(n, gen) {
    var res = [], essais = 0, it;
    while (res.length < n && essais++ < 500) {
      it = gen();
      if (res.every(function (x) { return !egal(x.v, it.v) && x.texte !== it.texte; })) res.push(it);
    }
    return res.length === n ? res : null;
  }
  function fenetre(rng, lo, hi, larg) {
    var d = ri(rng, lo, Math.max(lo, hi - larg));
    return [d, Math.min(hi, d + larg)];
  }
  function generateurOrdre(niveau, p, rng) {
    var f, digs, k, i;
    switch (niveau) {
      case 'cp':
        if (p === 0) return function () { return ent(ri(rng, 0, 20)); };
        if (p === 1) return function () { return ent(ri(rng, 10, 100)); };
        f = fenetre(rng, 0, 100, 30);
        return function () { return ent(ri(rng, f[0], f[1])); };
      case 'ce1':
        if (p === 0) return function () { return ent(ri(rng, 10, 100)); };
        if (p === 1) return function () { return ent(ri(rng, 100, 999)); };
        f = fenetre(rng, 100, 999, 150);
        return function () { return ent(ri(rng, f[0], f[1])); };
      case 'ce2':
        if (p === 0) return function () { return ent(ri(rng, 100, 1000)); };
        if (p === 1) return function () { return ent(ri(rng, 1000, 9999)); };
        if (rng() < 0.5) { // mêmes chiffres, places différentes
          digs = melanger([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], rng).slice(0, 4);
          return function () {
            var q;
            do { q = melanger(digs, rng); } while (q[0] === 0);
            return ent(Number(q.join('')));
          };
        }
        f = fenetre(rng, 1000, 9999, 1500);
        return function () { return ent(ri(rng, f[0], f[1])); };
      case 'cm1':
        if (p === 0) return function () { k = ri(rng, 3, 5); return ent(ri(rng, Math.pow(10, k), Math.pow(10, k + 1) - 1)); };
        if (p === 1) {
          i = ri(rng, 0, 8);
          return function () { return decimal(i * 10 + ri(rng, 0, 25), 1); };
        }
        return function () {
          var r = rng();
          if (r < 0.25) return fraction.apply(null, choix(rng, FRACTIONS_CM1));
          if (r < 0.55) return decimal(ri(rng, 1, 9), 1);
          return decimal(ri(rng, 1, 99), 2);
        };
      default: // cm2
        if (p === 0) return function () { k = ri(rng, 5, 7); return ent(ri(rng, Math.pow(10, k), Math.pow(10, k + 1) - 1)); };
        if (p === 1) {
          i = ri(rng, 0, 20);
          return function () { return decimal(i * 100 + ri(rng, 0, 250), 2); };
        }
        return function () {
          var r = rng();
          if (r < 0.3) return fraction.apply(null, choix(rng, FRACTIONS));
          if (r < 0.55) return pourcent(choix(rng, [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]));
          if (r < 0.75) return decimal(ri(rng, 1, 15), 1);
          return decimal(ri(rng, 1, 99), 2);
        };
    }
  }
  function mancheOrdre(niveau, p, rng) {
    var n = NB_CARTES[niveau][p], items = null, essais = 0, k;
    while (!items && essais++ < 50) items = tirerDistincts(n, generateurOrdre(niveau, p, rng));
    if (!items) throw new Error('ordre: tirage impossible');
    var sens = (niveau === 'cp' && p === 0) || rng() < 0.5 ? 'croissant' : 'decroissant';
    var tri = items.slice().sort(function (a, b) { return sens === 'croissant' ? a.v - b.v : b.v - a.v; });
    var pres = items, ok = false;
    for (k = 0; k < 20 && !ok; k++) {
      pres = melanger(items, rng);
      ok = pres.some(function (it, i) { return it !== tri[i]; });
    }
    pres.forEach(function (it, i) { it.id = i; });
    var cp = niveau === 'cp';
    var petit = sens === 'croissant';
    return {
      type: 'ordre', niveau: niveau, palier: p, sens: sens,
      items: pres, ordre: tri.map(function (it) { return it.id; }),
      consigne: cp ? (petit ? 'Du plus petit au plus grand !' : 'Du plus grand au plus petit !')
                   : (petit ? 'Touche les cartes du plus petit au plus grand.' : 'Touche les cartes du plus grand au plus petit.'),
      consigneVoix: petit ? 'Touche les nombres, du plus petit au plus grand.' : 'Touche les nombres, du plus grand au plus petit.',
      indice: petit ? 'Cherche le plus petit nombre qui reste.' : 'Cherche le plus grand nombre qui reste.'
    };
  }

  /* ---------- Manche « comparer » ---------- */
  var CAP = { ce1: [100, 1000, 1000], ce2: [1000, 10000, 10000] };

  /** Autre écriture de x sous forme de calcul (somme, différence ou produit) ; null si impossible. */
  function alternative(x, rng, tables, cap, interdit) {
    var pas = (x % 10 === 0 && x >= 20) ? 10 : 1, opts = [], essais, e;
    if (x >= 2 * pas) opts.push(function () { var a = pas * ri(rng, 1, x / pas - 1); return expr(groupe(a) + ' + ' + groupe(x - a), x); });
    var maxB = Math.min(Math.floor((cap - x) / pas), Math.floor(x / pas));
    if (maxB >= 1) opts.push(function () { var b = pas * ri(rng, 1, maxB); return expr(groupe(x + b) + ' − ' + groupe(b), x); });
    tables.forEach(function (t) {
      if (x % t === 0 && x / t >= 2 && x / t <= 100) opts.push(function () { return rng() < 0.5 ? expr(t + ' × ' + groupe(x / t), x) : expr(groupe(x / t) + ' × ' + t, x); });
    });
    for (essais = 0; essais < 20 && opts.length; essais++) {
      e = choix(rng, opts)();
      if (e.texte !== interdit) return e;
    }
    return null;
  }
  function exprCalcul(niveau, p, rng) {
    var a, b, t, k, r = rng();
    if (niveau === 'ce1') {
      if (p === 0) { a = 10 * ri(rng, 1, 8); b = 10 * ri(rng, 1, (100 - a) / 10); return expr(a + ' + ' + b, a + b); }
      if (p === 1) {
        if (r < 0.34) { a = ri(rng, 11, 89); b = ri(rng, 1, 100 - a); return expr(a + ' + ' + b, a + b); }
        if (r < 0.67) { t = choix(rng, [2, 5, 10]); k = ri(rng, 2, 10); return expr(t + ' × ' + k, t * k); }
        a = 100 * ri(rng, 1, 8); b = 100 * ri(rng, 1, (1000 - a) / 100); return expr(groupe(a) + ' + ' + groupe(b), a + b);
      }
      if (r < 0.25) { a = 100 * ri(rng, 1, 8); b = 100 * ri(rng, 1, (1000 - a) / 100); return expr(groupe(a) + ' + ' + groupe(b), a + b); }
      if (r < 0.5) { a = 100 * ri(rng, 2, 10); b = 100 * ri(rng, 1, a / 100 - 1); return expr(groupe(a) + ' − ' + b, a - b); }
      if (r < 0.75) { a = 10 * ri(rng, 10, 60); b = 10 * ri(rng, 1, (1000 - a) / 10); return expr(a + ' + ' + b, a + b); }
      t = choix(rng, [2, 3, 4, 5, 10]); k = 10 * ri(rng, 1, 10); return expr(t + ' × ' + k, t * k);
    }
    if (niveau === 'ce2') {
      if (p === 0) {
        if (r < 0.5) { a = ri(rng, 2, 9); b = ri(rng, 2, 9); return expr(a + ' × ' + b, a * b); }
        a = 10 * ri(rng, 10, 50); b = 10 * ri(rng, 1, (1000 - a) / 10); return expr(a + ' + ' + b, a + b);
      }
      if (p === 1) {
        if (r < 0.3) { a = ri(rng, 2, 9); b = ri(rng, 2, 9); return expr(a + ' × ' + b, a * b); }
        if (r < 0.55) { a = ri(rng, 11, 30); b = ri(rng, 2, 9); return expr(a + ' × ' + b, a * b); }
        if (r < 0.8) { a = 100 * ri(rng, 10, 60); b = 100 * ri(rng, 1, (10000 - a) / 100); return expr(groupe(a) + ' + ' + groupe(b), a + b); }
        a = 100 * ri(rng, 10, 99); b = 100 * ri(rng, 1, a / 100 - 1); return expr(groupe(a) + ' − ' + groupe(b), a - b);
      }
      if (r < 0.3) { a = ri(rng, 12, 99); b = ri(rng, 3, 9); return expr(a + ' × ' + b, a * b); }
      if (r < 0.55) { t = ri(rng, 2, 9); k = choix(rng, [10, 100, 200, 300, 500, 1000]); return expr(t + ' × ' + groupe(k), t * k); }
      if (r < 0.8) { a = 50 * ri(rng, 20, 100); b = 50 * ri(rng, 1, (10000 - a) / 50); return expr(groupe(a) + ' + ' + groupe(b), a + b); }
      a = 50 * ri(rng, 20, 199); b = 50 * ri(rng, 1, a / 50 - 1); return expr(groupe(a) + ' − ' + groupe(b), a - b);
    }
    // cm1
    if (r < 0.5) { a = ri(rng, 12, 60); b = ri(rng, 2, 12); return expr(a + ' × ' + b, a * b); }
    b = ri(rng, 2, 12); k = ri(rng, 5, 60); return expr(groupe(b * k) + ' ÷ ' + b, k);
  }
  function entiersProches(rng, lo, hi, w) {
    var a = ri(rng, lo, hi), b = a, essais = 0;
    while ((b === a || b < lo || b > hi) && essais++ < 100) b = rng() < 0.5 ? echangeChiffres(a, rng) : a + ri(rng, -w, w);
    if (b === a || b < lo || b > hi) b = a === hi ? a - 1 : a + 1;
    return [ent(a), ent(b)];
  }
  function delta(rng, liste) { return choix(rng, liste) * (rng() < 0.5 ? -1 : 1); }

  /** Un calcul et un nombre : égaux (eq) ou voisins. */
  function calculEtNombre(niveau, p, rng, cap, deltas, pEgal, gen) {
    var e = gen(), y = e.v, essais = 0, d;
    if (rng() >= pEgal) {
      do { d = delta(rng, deltas); essais++; } while ((e.v + d < 1 || e.v + d > cap) && essais < 30);
      y = (e.v + d < 1 || e.v + d > cap) ? e.v : e.v + d;
    }
    return [e, ent(y)];
  }
  function calculEtCalcul(rng, cap, deltas, pEgal, tables, gen) {
    var e = gen(), x = e.v, essais = 0, d, e2;
    if (rng() >= pEgal) {
      do { d = delta(rng, deltas); essais++; } while ((e.v + d < 2 || e.v + d > cap) && essais < 30);
      if (!(e.v + d < 2 || e.v + d > cap)) x = e.v + d;
    }
    e2 = alternative(x, rng, tables, cap, e.texte);
    return [e, e2 || ent(x)];
  }
  function equivalent(rng, liste, formesPermises, pEgal) {
    var fr = choix(rng, liste), f = formes(fr), a, b, ks, n;
    if (rng() < pEgal) {
      ks = melanger(formesPermises, rng);
      return [f[ks[0]], f[ks[1]]];
    }
    a = f[choix(rng, formesPermises)];
    do { n = f.pc + delta(rng, [1, 5, 10, 20]); } while (n < 1 || n >= 100 + 50);
    b = decimal(n, 2);
    return [a, b];
  }

  function paireComparer(niveau, p, rng) {
    var r = rng(), a, b, x, y, t, c, d;
    switch (niveau) {
      case 'cp':
        if (p === 0) { a = ri(rng, 0, 20); do { b = ri(rng, 0, 20); } while (b === a); return [ent(a), ent(b)]; }
        if (p === 1) {
          a = ri(rng, 10, 100);
          do { b = a + ri(rng, -9, 9); } while (b === a || b < 0 || b > 100);
          return [ent(a), ent(b)];
        }
        if (r < 0.5) { x = ri(rng, 1, 9); do { y = ri(rng, 1, 9); } while (y === x); return [ent(10 * x + y), ent(10 * y + x)]; }
        x = ri(rng, 1, 9); c = ri(rng, 0, 9); do { d = ri(rng, 0, 9); } while (d === c);
        return [ent(10 * x + c), ent(10 * x + d)];
      case 'ce1':
        if (p === 0) {
          if (r < 0.4) return entiersProches(rng, 10, 100, 10);
          return calculEtNombre(niveau, p, rng, 100, [1, 2, 5, 10], 0.4, function () { return exprCalcul('ce1', 0, rng); });
        }
        if (p === 1) {
          if (r < 0.3) return entiersProches(rng, 100, 999, 60);
          return calculEtNombre(niveau, p, rng, 1000, [1, 2, 5, 10], 0.4, function () { return exprCalcul('ce1', 1, rng); });
        }
        if (r < 0.35) return calculEtNombre(niveau, p, rng, 1000, [5, 10, 20], 0.4, function () { return exprCalcul('ce1', 2, rng); });
        return calculEtCalcul(rng, 1000, [5, 10, 20], 0.4, [2, 3, 4, 5, 10], function () { return exprCalcul('ce1', 2, rng); });
      case 'ce2':
        if (p === 0) {
          if (r < 0.3) return entiersProches(rng, 100, 1000, 80);
          return calculEtNombre(niveau, p, rng, 1000, [1, 10, 50], 0.4, function () { return exprCalcul('ce2', 0, rng); });
        }
        if (p === 1) {
          if (r < 0.35) return entiersProches(rng, 1000, 9999, 500);
          if (r < 0.75) return calculEtNombre(niveau, p, rng, 10000, [10, 50, 100], 0.4, function () { return exprCalcul('ce2', 1, rng); });
          return calculEtCalcul(rng, 10000, [10, 50, 100], 0.4, [2, 3, 4, 5, 6, 7, 8, 9], function () { return exprCalcul('ce2', 1, rng); });
        }
        if (r < 0.3) return calculEtNombre(niveau, p, rng, 10000, [10, 50, 100], 0.4, function () { return exprCalcul('ce2', 2, rng); });
        return calculEtCalcul(rng, 10000, [10, 50, 100], 0.4, [2, 3, 4, 5, 6, 7, 8, 9], function () { return exprCalcul('ce2', 2, rng); });
      case 'cm1':
        if (p === 0) {
          if (r < 0.4) return entiersProches(rng, 10000, 999999, 2000);
          if (r < 0.7) return calculEtNombre(niveau, p, rng, 1000, [1, 2, 5, 10, 20], 0.35, function () { return exprCalcul('cm1', 0, rng); });
          return calculEtCalcul(rng, 1000, [1, 2, 5, 10, 20], 0.35, [2, 3, 4, 5, 6, 8, 10], function () { return exprCalcul('cm1', 0, rng); });
        }
        if (p === 1) {
          if (r < 0.3) { // 0,5 et 0,50
            do { t = ri(rng, 1, 99); } while (t % 10 === 0);
            return [decimal(t, 1), ecritureZero(t)];
          }
          if (r < 0.65) { // 3,4 et 3,04
            x = ri(rng, 0, 9); y = ri(rng, 1, 9);
            return [decimal(x * 10 + y, 1), decimal(x * 100 + y, 2)];
          }
          a = ri(rng, 10, 500);
          do { b = a + ri(rng, -12, 12); } while (b === a || b < 1);
          return [decimal(a, 2), decimal(b, 2)];
        }
        if (r < 0.65) return equivalent(rng, FRACTIONS_CM1, ['fraction', 'decimal'], 0.45);
        do { a = choix(rng, FRACTIONS_CM1); b = choix(rng, FRACTIONS_CM1); } while (egal(a[0] / a[1], b[0] / b[1]));
        return [fraction(a[0], a[1]), fraction(b[0], b[1])];
      default: // cm2
        if (p === 0) {
          if (r < 0.35) return entiersProches(rng, 100000, 99999999, 20000);
          if (r < 0.7) { // somme de dixièmes
            a = ri(rng, 11, 99); b = ri(rng, 11, 99);
            x = a + b;
            if (rng() >= 0.4) { do { y = x + delta(rng, [1, 2, 10]); } while (y < 1); x = y; }
            return [expr(dec(a, 1) + ' + ' + dec(b, 1), (a + b) / 10), decimal(x, 1)];
          }
          if (r < 0.85) { do { t = ri(rng, 1, 99); } while (t % 10 === 0); return [decimal(t, 1), ecritureZero(t)]; }
          a = ri(rng, 101, 9999);
          do { b = a + ri(rng, -15, 15); } while (b === a || b < 1);
          return [decimal(a, 2), decimal(b, 2)];
        }
        if (p === 1) return equivalent(rng, FRACTIONS, ['fraction', 'decimal', 'pourcent'], 0.4);
        if (r < 0.5) {
          t = choix(rng, [10, 25, 50, 75]); a = 20 * ri(rng, 1, 20); x = t * a / 100;
          if (rng() >= 0.4) { do { y = x + delta(rng, [1, 2, 5]); } while (y < 1); x = y; }
          return [expr(t + NBSP + '% de ' + a, t * a / 100), ent(x)];
        }
        do { a = choix(rng, FRACTIONS); b = choix(rng, FRACTIONS); } while (a === b);
        if (rng() < 0.3) b = a; // même fraction : 40 % et 2/5
        return [pourcent(a[0] * 100 / a[1]), fraction(b[0], b[1])];
    }
  }
  function mancheComparer(niveau, p, rng) {
    var cp = niveau === 'cp', paire, essais = 0, s;
    do { paire = paireComparer(niveau, p, rng); s = signe(paire[0].v, paire[1].v); essais++; }
    while (essais < 50 && (paire[0].texte === paire[1].texte || (cp && s === 0)));
    if (rng() < 0.5) paire = [paire[1], paire[0]];
    s = signe(paire[0].v, paire[1].v);
    var texteCalc = /[+−×÷]|de /.test(paire[0].texte + paire[1].texte);
    var texteForme = /[,\/%]/.test(paire[0].texte + paire[1].texte);
    return {
      type: 'comparer', niveau: niveau, palier: p,
      gauche: paire[0], droite: paire[1],
      choix: cp ? ['<', '>'] : ['<', '=', '>'],
      reponse: s < 0 ? '<' : (s > 0 ? '>' : '='),
      consigne: cp ? 'Choisis le bon signe.' : 'Compare, puis choisis <, > ou =.',
      consigneVoix: 'Choisis le bon signe : plus petit, ou plus grand.',
      indice: texteCalc ? 'Calcule d’abord chaque côté.'
        : (texteForme ? 'Pense à les écrire de la même façon.' : 'Compare les chiffres en partant de la gauche.')
    };
  }

  /* ---------- Manche « le plus proche de… » ---------- */
  function autourDe(t, step, jmax, bornes) {
    var base = Math.round(t / step) * step, res = [], j, v;
    for (j = -jmax; j <= jmax; j++) {
      v = base + j * step;
      if (v >= bornes[0] && v <= bornes[1]) res.push(ent(v));
    }
    return res;
  }
  function decimauxAutour(n, d, kmax, min) {
    var res = [], k;
    for (k = -kmax; k <= kmax; k++) if (k !== 0 && n + k >= min) res.push(decimal(n + k, d));
    return res;
  }
  function entiersAutour(t, unit, kmax, bornes) {
    var res = [], k, v;
    for (k = -kmax; k <= kmax; k++) {
      v = t + k * unit;
      if (k !== 0 && v >= bornes[0] && v <= bornes[1]) res.push(ent(v));
    }
    return res;
  }
  function cibleArrondie(rng, step, lo, hi) {
    var t, r, essais = 0;
    do { t = ri(rng, lo, hi); r = t % step; essais++; } while ((r === 0 || r * 2 === step) && essais < 100);
    return t;
  }
  function genProche(niveau, p, rng) {
    var t, step, n, fr, f, k;
    switch (niveau) {
      case 'cp':
        if (p === 0) { t = ri(rng, 2, 18); return { cible: ent(t), cands: entiersAutour(t, 1, 5, [0, 20]) }; }
        if (p === 1) { t = ri(rng, 15, 85); return { cible: ent(t), cands: entiersAutour(t, 1, 10, [0, 100]) }; }
        t = 10 * ri(rng, 2, 9); return { cible: ent(t), cands: entiersAutour(t, 1, 15, [0, 100]) };
      case 'ce1':
        if (p === 0) { t = ri(rng, 20, 90); return { cible: ent(t), cands: entiersAutour(t, 1, 10, [0, 100]) }; }
        if (p === 1) { t = ri(rng, 150, 850); return { cible: ent(t), cands: entiersAutour(t, 10, 8, [0, 1000]) }; }
        t = 100 * ri(rng, 2, 9); return { cible: ent(t), cands: entiersAutour(t, 5, 12, [0, 1000]) };
      case 'ce2':
        step = p === 0 ? 10 : (p === 1 ? 100 : choix(rng, [10, 100, 1000]));
        t = p === 0 ? cibleArrondie(rng, step, 101, 999) : cibleArrondie(rng, step, 1001, 9999 - step / 2);
        return { cible: ent(t), garde: ent(Math.round(t / step) * step), cands: autourDe(t, step, 3, [10, 9999]), indice: 'Arrondis ' + ent(t).texte + ' ' + ARRONDIS[step] + '.' };
      case 'cm1':
        if (p === 0) {
          step = choix(rng, [1000, 10000]);
          t = cibleArrondie(rng, step, 10001, 999999 - step / 2);
          return { cible: ent(t), garde: ent(Math.round(t / step) * step), cands: autourDe(t, step, 3, [step, 999999]), indice: 'Arrondis ' + ent(t).texte + ' ' + ARRONDIS[step] + '.' };
        }
        if (p === 1) {
          do { n = ri(rng, 11, 99); } while (n % 10 === 0);
          return { cible: decimal(n, 1), cands: decimauxAutour(n, 1, 12, 0) };
        }
        if (rng() < 0.5) {
          fr = choix(rng, FRACTIONS_CM1); f = formes(fr);
          return { cible: f.fraction, cands: decimauxAutour(f.pc, 2, 15, 1) };
        }
        do { n = ri(rng, 101, 999); } while (n % 10 === 0);
        return { cible: decimal(n, 2), cands: decimauxAutour(n, 2, 15, 1) };
      default: // cm2
        if (p === 0) {
          step = choix(rng, [1000, 10000, 100000]);
          t = cibleArrondie(rng, step, 100001, 9999999);
          return { cible: ent(t), garde: ent(Math.round(t / step) * step), cands: autourDe(t, step, 3, [step, 99999999]), indice: 'Arrondis ' + ent(t).texte + ' ' + ARRONDIS[step] + '.' };
        }
        if (p === 1) {
          do { n = ri(rng, 1, 50) * 100 + ri(rng, 11, 99); } while (n % 10 === 0);
          return { cible: decimal(n, 2), cands: decimauxAutour(n, 2, 20, 1) };
        }
        fr = choix(rng, FRACTIONS); f = formes(fr);
        k = rng() < 0.5 ? f.fraction : f.pourcent;
        return { cible: k, cands: decimauxAutour(f.pc, 2, 20, 1) };
    }
  }
  function distancesStrictes(cible, trois) {
    var d = trois.map(function (x) { return Math.abs(x.v - cible.v); }).sort(function (a, b) { return a - b; });
    return d[1] - d[0] > EPS && d[2] - d[1] > EPS;
  }
  function choisirTrois(cible, cands, rng, garde) {
    var essai, t, i, j, k;
    if (garde) { // l'arrondi doit faire partie des choix
      cands = cands.filter(function (c) { return !egal(c.v, garde.v); });
      for (essai = 0; essai < 80; essai++) {
        t = [garde].concat(melanger(cands, rng).slice(0, 2));
        if (t.length === 3 && distancesStrictes(cible, t) && Math.abs(garde.v - cible.v) < Math.abs(t[1].v - cible.v) && Math.abs(garde.v - cible.v) < Math.abs(t[2].v - cible.v)) return melanger(t, rng);
      }
    }
    for (essai = 0; essai < 80; essai++) {
      t = melanger(cands, rng).slice(0, 3);
      if (t.length === 3 && distancesStrictes(cible, t)) return t;
    }
    for (i = 0; i < cands.length; i++) for (j = i + 1; j < cands.length; j++) for (k = j + 1; k < cands.length; k++) {
      t = [cands[i], cands[j], cands[k]];
      if (distancesStrictes(cible, t)) return melanger(t, rng);
    }
    throw new Error('proche: aucun triplet valide');
  }
  function mancheProche(niveau, p, rng) {
    var g = genProche(niveau, p, rng), trois = choisirTrois(g.cible, g.cands, rng, g.garde), meilleur = null;
    trois.forEach(function (it, i) {
      it.id = i;
      it.ecart = libre(Math.abs(it.v - g.cible.v));
      if (!meilleur || Math.abs(it.v - g.cible.v) < Math.abs(meilleur.v - g.cible.v)) meilleur = it;
    });
    return {
      type: 'proche', niveau: niveau, palier: p,
      cible: g.cible, choix: trois, reponse: meilleur.id,
      consigne: 'Lequel est le plus proche de ' + g.cible.texte + ' ?',
      consigneVoix: 'Quel nombre est le plus proche de ' + g.cible.texte.replace('/', ' sur ') + ' ?',
      indice: g.indice || ('Regarde l’écart avec ' + g.cible.texte + '.')
    };
  }

  /* ---------- Parties ---------- */
  var TYPES = ['ordre', 'comparer', 'proche'];
  function genererManche(niveau, diff, type, rng, rang) {
    rng = rng || Math.random;
    if (NIVEAUX.indexOf(niveau) < 0) niveau = 'ce2';
    var p = palier(diff, rang);
    if (type === 'comparer') return mancheComparer(niveau, p, rng);
    if (type === 'proche') return mancheProche(niveau, p, rng);
    return mancheOrdre(niveau, p, rng);
  }
  /** 8 manches mixtes (3 ordres, 3 comparaisons, 2 « plus proche »), l'ordre en premier. */
  function genererPartie(niveau, diff, rng) {
    rng = rng || Math.random;
    var types = melanger(['ordre', 'ordre', 'ordre', 'comparer', 'comparer', 'comparer', 'proche', 'proche'], rng), i = types.indexOf('ordre'), x;
    x = types[0]; types[0] = types[i]; types[i] = x;
    return types.map(function (t, rang) { return genererManche(niveau, diff, t, rng, rang); });
  }

  /* ---------- Vérifications (réponses de l'enfant) ---------- */
  function verifierOrdre(manche, nbPlaces, id) { return manche.ordre[nbPlaces] === id; }
  function verifierSigne(manche, s) { return manche.reponse === s; }
  function verifierProche(manche, id) { return manche.reponse === id; }
  function resultatPartie(reussies) {
    return { gagnee: reussies >= SEUIL_VICTOIRE, etoiles: reussies >= NB_MANCHES ? 3 : (reussies >= 7 ? 2 : (reussies >= SEUIL_VICTOIRE ? 1 : 0)) };
  }

  var API = {
    NB_MANCHES: NB_MANCHES, SEUIL_VICTOIRE: SEUIL_VICTOIRE, ERREURS_AVANT_AIDE: ERREURS_AVANT_AIDE,
    NIVEAUX: NIVEAUX, TYPES: TYPES, BORNES: BORNES, NB_CARTES: NB_CARTES,
    niveauxDifficulte: niveauxDifficulte, palier: palier, signe: signe,
    genererManche: genererManche, genererPartie: genererPartie,
    verifierOrdre: verifierOrdre, verifierSigne: verifierSigne, verifierProche: verifierProche,
    resultatPartie: resultatPartie
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.RangerNombres = API;
})(typeof window !== 'undefined' ? window : globalThis);
