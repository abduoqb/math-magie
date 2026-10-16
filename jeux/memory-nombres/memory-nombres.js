/* Mémoire Magique : logique et données (sans interface).
   Memory dont les paires sont des couples ÉQUIVALENTS de valeur (3/4 ↔ 0,75…).
   Générateur pur (rng injectable) + petit moteur de partie. Exporté aussi pour Node (tests). */
(function (root) {
  'use strict';

  var NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
  var NIVEAU_DEFAUT = 'ce2';
  var NBSP = ' ';

  /* Trois modes : 6, 8 et 10 paires (grilles 3×4, 4×4, 4×5 : colonnes × lignes). */
  var MODES = [
    { nom: 'Petite Magie', paires: 6, colonnes: 3, lignes: 4 },
    { nom: 'Grande Magie', paires: 8, colonnes: 4, lignes: 4 },
    { nom: 'Maître Magicien', paires: 10, colonnes: 4, lignes: 5 }
  ];

  /* ---------- Outils ---------- */
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(rng, tab) { return tab[Math.floor(rng() * tab.length)]; }
  function melanger(rng, tab) {
    for (var i = tab.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = tab[i]; tab[i] = tab[j]; tab[j] = t;
    }
    return tab;
  }
  function cle(x) { return String(Math.round(x * 1e6) / 1e6); }
  /** Entier avec espaces insécables pour les milliers. */
  function nb(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP); }
  /** Décimal à la française (virgule, 3 décimales maximum). */
  function dec(x) {
    var p = String(Math.round(x * 1000) / 1000).split('.');
    p[0] = nb(p[0]);
    return p.join(',');
  }
  function pl(n, mot) { return n + ' ' + mot + (n > 1 ? 's' : ''); }
  function paire(v, a, b) { return { v: v, a: a, b: b }; }
  function t(texte) { return { texte: texte }; }

  /* ---------- Nombres en lettres (0 à 100) ---------- */
  var PETITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  var DIZAINES = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
  function enLettres(n) {
    if (n === 100) return 'cent';
    var d = Math.floor(n / 10), u = n % 10;
    if (n < 17) return PETITS[n];
    if (n < 20) return 'dix-' + PETITS[u];
    if (d <= 6) {
      if (u === 0) return DIZAINES[d];
      if (u === 1) return DIZAINES[d] + ' et un';
      return DIZAINES[d] + '-' + PETITS[u];
    }
    if (d === 7) return n === 71 ? 'soixante et onze' : 'soixante-' + enLettres(n - 60);
    if (d === 8) return u === 0 ? 'quatre-vingts' : 'quatre-vingt-' + PETITS[u];
    return 'quatre-vingt-' + enLettres(n - 80);
  }

  /* ---------- Fabriques de paires (une par famille de cartes) ---------- */
  function pointsChiffre(max) {
    return function (rng) {
      var n = ri(rng, 1, max);
      return paire(cle(n), { texte: n + ' points', points: n }, t(String(n)));
    };
  }
  function chiffreLettres(min, max) {
    return function (rng) {
      var n = ri(rng, min, max);
      return paire(cle(n), t(String(n)), t(enLettres(n)));
    };
  }
  /** Double / moitié : « Double de 3 » ↔ 6, « Moitié de 14 » ↔ 7. */
  function doubleMoitie(max) {
    return function (rng) {
      var x = ri(rng, 1, max);
      if (rng() < 0.5) return paire(cle(2 * x), t('Double de ' + x), t(String(2 * x)));
      return paire(cle(x), t('Moitié de ' + (2 * x)), t(String(x)));
    };
  }
  /** « 25 + 25 » ↔ 50 (CE1). */
  function sommeDouble(max) {
    return function (rng) {
      var x = ri(rng, 3, max);
      return paire(cle(2 * x), t(x + ' + ' + x), t(String(2 * x)));
    };
  }
  /** « 3 dizaines 4 unités » ↔ 34. */
  function dizUni(min, max) {
    return function (rng) {
      var n = ri(rng, min, max);
      if (n % 10 === 0) n++;
      var d = Math.floor(n / 10), u = n % 10;
      return paire(cle(n), t(pl(d, 'dizaine') + ' ' + pl(u, 'unité')), t(String(n)));
    };
  }
  /** Addition / soustraction simple ↔ résultat. */
  function calculSimple(maxTotal, grand) {
    return function (rng) {
      var a, b;
      if (rng() < 0.5) {
        a = ri(rng, grand ? 10 : 2, maxTotal - 3);
        b = ri(rng, 2, maxTotal - a);
        return paire(cle(a + b), t(a + ' + ' + b), t(String(a + b)));
      }
      a = ri(rng, grand ? 20 : 6, maxTotal);
      b = ri(rng, 2, a - 1);
      return paire(cle(a - b), t(a + ' − ' + b), t(String(a - b)));
    };
  }
  /** Produit de tables ↔ résultat. */
  function produit(tables, mMax) {
    return function (rng) {
      var a = pick(rng, tables), b = ri(rng, 2, mMax);
      if (rng() < 0.5) { var s = a; a = b; b = s; }
      return paire(cle(a * b), t(a + ' × ' + b), t(String(a * b)));
    };
  }
  /** Division exacte ↔ quotient. */
  function division(diviseurs, qMax) {
    return function (rng) {
      var d = pick(rng, diviseurs), q = ri(rng, 2, qMax);
      return paire(cle(q), t((d * q) + ' ÷ ' + d), t(String(q)));
    };
  }
  /** Nombre ↔ décomposition : « 3 000 + 200 + 5 ». */
  function decomposition(nbChiffres, nbTermes) {
    return function (rng) {
      var places = [];
      for (var i = 0; i < nbChiffres - 1; i++) places.push(i);
      melanger(rng, places);
      var choisies = [nbChiffres - 1].concat(places.slice(0, nbTermes - 1));
      choisies.sort(function (x, y) { return y - x; });
      var total = 0;
      var termes = choisies.map(function (p) {
        var v = ri(rng, 1, 9) * Math.pow(10, p);
        total += v;
        return nb(v);
      });
      return paire(cle(total), t(nb(total)), t(termes.join(' + ')));
    };
  }
  /** « 32 centaines » ↔ 3 200 ; « 4 milliers 5 centaines » ↔ 4 500. */
  function milliersCentaines() {
    return function (rng) {
      if (rng() < 0.5) {
        var c = ri(rng, 11, 99);
        if (c % 10 === 0) c++;
        return paire(cle(c * 100), t(pl(c, 'centaine')), t(nb(c * 100)));
      }
      var m = ri(rng, 1, 9), c2 = ri(rng, 1, 9);
      return paire(cle(m * 1000 + c2 * 100), t(pl(m, 'millier') + ' ' + pl(c2, 'centaine')), t(nb(m * 1000 + c2 * 100)));
    };
  }
  /** Heure dite ↔ heure numérique : « 3 h et quart » ↔ « 15 h 15 ». */
  function heure(avecMinutes) {
    return function (rng) {
      var h = ri(rng, 1, 11), genre = ri(rng, 0, avecMinutes ? 4 : 3);
      var texte, H, m;
      if (genre === 0) { texte = h + ' h pile'; H = h + 12; m = 0; }
      else if (genre === 1) { texte = h + ' h et quart'; H = h + 12; m = 15; }
      else if (genre === 2) { texte = h + ' h et demie'; H = h + 12; m = 30; }
      else if (genre === 3) { texte = h + ' h moins le quart'; H = h + 11; m = 45; }
      else { m = pick(rng, [5, 10, 20, 25]); texte = h + ' h et ' + m + ' min'; H = h + 12; }
      var num = H + ' h ' + (m < 10 ? '0' : '') + m;
      return paire('h' + ((H % 12) * 60 + m), t(texte), t(num));
    };
  }

  /* Fractions « simples » : numérateur, dénominateur. */
  var FRAC_DECIMALES = [[1, 2], [1, 4], [3, 4], [1, 10], [3, 10], [7, 10], [9, 10],
    [1, 5], [2, 5], [3, 5], [4, 5], [1, 100], [7, 100], [3, 100]];
  function fractionDecimal(taille) {
    return function (rng) {
      var f = pick(rng, FRAC_DECIMALES.slice(0, taille));
      return paire(cle(f[0] / f[1]), t(f[0] + '/' + f[1]), t(dec(f[0] / f[1])));
    };
  }
  /** « 3 parts sur 4 » (texte décrivant un dessin) ↔ 3/4. */
  function fractionDessin(denominateurs) {
    return function (rng) {
      var d = pick(rng, denominateurs), n = ri(rng, 1, d - 1);
      return paire(cle(n / d), t(pl(n, 'part') + ' sur ' + d), t(n + '/' + d));
    };
  }
  function dixiemes() {
    return function (rng) {
      var n = ri(rng, 11, 99);
      if (n % 10 === 0) n++;
      return paire(cle(n / 10), t(n + ' dixièmes'), t(dec(n / 10)));
    };
  }
  function centiemes() {
    return function (rng) {
      var n = ri(rng, 2, 99);
      if (n % 10 === 0) n++;
      return paire(cle(n / 100), t(n + ' centièmes'), t(dec(n / 100)));
    };
  }
  /** « 2 + 3/10 » ↔ 2,3. */
  function entierFraction() {
    return function (rng) {
      var e = ri(rng, 1, 9), n = ri(rng, 1, 9);
      return paire(cle(e + n / 10), t(e + ' + ' + n + '/10'), t(dec(e + n / 10)));
    };
  }
  /** Multiples / tables ↔ résultat (CM1). */
  function multiples(grand) {
    return function (rng) {
      if (grand && rng() < 0.5) {
        var k = pick(rng, [3, 4]), x = ri(rng, 11, 40);
        return paire(cle(k * x), t((k === 3 ? 'Le triple de ' : 'Le quadruple de ') + x), t(String(k * x)));
      }
      var a = ri(rng, 3, 9), b = ri(rng, 6, 12);
      return paire(cle(a * b), t(a + ' × ' + b), t(String(a * b)));
    };
  }

  /* Pourcentage ↔ fraction ↔ décimal : on tire deux écritures différentes parmi les trois. */
  var POURCENTS = [[1, 2], [1, 4], [3, 4], [1, 10], [1, 5], [2, 5], [3, 5], [4, 5],
    [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [1, 100]];
  function pourcentage(taille) {
    return function (rng) {
      var f = pick(rng, POURCENTS.slice(0, taille));
      var formes = [
        f[0] + '/' + f[1],
        dec(100 * f[0] / f[1]) + NBSP + '%',
        dec(f[0] / f[1])
      ];
      var i = ri(rng, 0, 2), j = (i + ri(rng, 1, 2)) % 3;
      return paire(cle(f[0] / f[1]), t(formes[i]), t(formes[j]));
    };
  }
  var EXPOSANTS = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶' };
  /** 10³ ↔ 1 000, « 10 × 10 × 10 » ↔ 1 000. */
  function puissances(kMax) {
    return function (rng) {
      var k = ri(rng, 2, kMax), texte;
      if (k <= 4 && rng() < 0.4) {
        var fs = [];
        for (var i = 0; i < k; i++) fs.push('10');
        texte = fs.join(' × ');
      } else texte = '10' + EXPOSANTS[k];
      return paire(cle(Math.pow(10, k)), t(texte), t(nb(Math.pow(10, k))));
    };
  }
  /** Multiplier / diviser par 10, 100, 1 000. */
  function decalage(decimal, diviser, kMax) {
    return function (rng) {
      if (diviser && rng() < 0.5) {
        var q = Math.pow(10, ri(rng, 1, 2)), a = ri(rng, 2, 999);
        return paire(cle(a / q), t(nb(a) + ' ÷ ' + nb(q)), t(dec(a / q)));
      }
      var p = Math.pow(10, ri(rng, 1, kMax));
      var x = decimal && rng() < 0.7 ? ri(rng, 12, 99) / 10 : ri(rng, 2, 99);
      if (decimal && Math.round(x) === x) x += 0.5;
      return paire(cle(x * p), t(dec(x) + ' × ' + nb(p)), t(dec(x * p)));
    };
  }
  /** Calculs décimaux ↔ résultat. */
  function calculDecimal(niveauDiff) {
    return function (rng) {
      var a, b, q, kind = ri(rng, 0, niveauDiff === 0 ? 1 : 3);
      if (kind === 0) {
        a = ri(rng, 11, 99); b = ri(rng, 11, 99);
        if (niveauDiff === 2 && rng() < 0.5) {
          a = ri(rng, 101, 499); b = ri(rng, 11, 99) * 10 + 5;
          return paire(cle((a + b) / 100), t(dec(a / 100) + ' + ' + dec(b / 100)), t(dec((a + b) / 100)));
        }
        return paire(cle((a + b) / 10), t(dec(a / 10) + ' + ' + dec(b / 10)), t(dec((a + b) / 10)));
      }
      if (kind === 1) {
        a = ri(rng, 30, 99); b = ri(rng, 11, a - 1);
        return paire(cle((a - b) / 10), t(dec(a / 10) + ' − ' + dec(b / 10)), t(dec((a - b) / 10)));
      }
      if (kind === 2) {
        b = ri(rng, 2, 5);
        if (niveauDiff === 2) { a = ri(rng, 105, 245); return paire(cle(a * b / 100), t(dec(a / 100) + ' × ' + b), t(dec(a * b / 100))); }
        a = ri(rng, 11, 49);
        return paire(cle(a * b / 10), t(dec(a / 10) + ' × ' + b), t(dec(a * b / 10)));
      }
      b = ri(rng, 2, 5); q = ri(rng, 3, 19);
      return paire(cle(q / 10), t(dec(b * q / 10) + ' ÷ ' + b), t(dec(q / 10)));
    };
  }

  /* ---------- Programme par classe et par mode (0 petite, 1 grande, 2 maître) ---------- */
  var FABRIQUES = {
    cp: [
      [pointsChiffre(10), chiffreLettres(1, 10)],
      [pointsChiffre(20), chiffreLettres(1, 20), doubleMoitie(5)],
      [pointsChiffre(20), chiffreLettres(11, 20), doubleMoitie(10), chiffreLettres(1, 10)]
    ],
    ce1: [
      [dizUni(11, 59), calculSimple(20, false), chiffreLettres(11, 39), sommeDouble(10)],
      [dizUni(11, 99), calculSimple(60, true), chiffreLettres(20, 69), sommeDouble(30)],
      [dizUni(11, 99), calculSimple(100, true), chiffreLettres(60, 100), sommeDouble(49), produit([2, 3, 4, 5, 10], 10)]
    ],
    ce2: [
      [produit([2, 3, 4, 5, 10], 10), decomposition(3, 2), milliersCentaines(), heure(false)],
      [produit([2, 3, 4, 5, 6, 7, 8, 9], 9), decomposition(4, 3), milliersCentaines(), heure(false)],
      [produit([3, 4, 6, 7, 8, 9], 9), decomposition(4, 3), milliersCentaines(), heure(true), division([2, 3, 4, 5, 6, 7, 8, 9], 9)]
    ],
    cm1: [
      [fractionDecimal(7), fractionDessin([2, 3, 4, 5, 10]), multiples(false)],
      [fractionDecimal(11), fractionDessin([2, 3, 4, 5, 6, 8, 10]), dixiemes(), decomposition(5, 3), multiples(true)],
      [fractionDecimal(14), fractionDessin([3, 4, 5, 6, 8, 10]), dixiemes(), centiemes(), entierFraction(), decomposition(6, 3), multiples(true)]
    ],
    cm2: [
      [pourcentage(8), puissances(5), decalage(false, false, 2), calculDecimal(0)],
      [pourcentage(11), puissances(5), decalage(true, true, 3), calculDecimal(1)],
      [pourcentage(14), puissances(6), decalage(true, true, 3), calculDecimal(2)]
    ]
  };

  function nomNiveau(n) { return NIVEAUX.indexOf(n) >= 0 ? n : NIVEAU_DEFAUT; }

  /**
   * Génère une partie : { niveau, diff, mode, paires: [{v, a, b}], cartes: [{id, paire, texte, aria?, points?}] }.
   * Garanties : chaque valeur n'apparaît que dans UNE paire, aucun texte n'est répété,
   * donc chaque carte n'a qu'un seul partenaire dans la grille.
   */
  function genererPartie(niveau, diff, rng) {
    rng = rng || Math.random;
    niveau = nomNiveau(niveau);
    diff = Math.max(0, Math.min(2, diff | 0));
    var mode = MODES[diff];
    var fabriques = melanger(rng, FABRIQUES[niveau][diff].slice());
    var paires = [], valeurs = {}, textes = {};
    for (var essais = 0; paires.length < mode.paires && essais < 2000; essais++) {
      // rotation sur les familles pour varier ; on décale si une famille bloque
      var f = fabriques[(paires.length + Math.floor(essais / 25)) % fabriques.length];
      var p = f(rng);
      if (valeurs[p.v] || textes[p.a.texte] || textes[p.b.texte] || p.a.texte === p.b.texte) continue;
      valeurs[p.v] = textes[p.a.texte] = textes[p.b.texte] = true;
      paires.push(p);
    }
    if (paires.length < mode.paires) throw new Error('Génération impossible : ' + niveau + ' / ' + diff);
    var cartes = [];
    paires.forEach(function (p, i) {
      [p.a, p.b].forEach(function (c) {
        var carte = { paire: i, texte: c.texte };
        if (c.points) carte.points = c.points;
        cartes.push(carte);
      });
    });
    melanger(rng, cartes);
    cartes.forEach(function (c, i) { c.id = i; });
    return { niveau: niveau, diff: diff, mode: mode, paires: paires, cartes: cartes };
  }

  /* ---------- Moteur de partie ---------- */
  function creerEtat(partie) {
    return {
      cartes: partie.cartes,
      nbPaires: partie.paires.length,
      statuts: partie.cartes.map(function () { return 'cachee'; }),
      ouvertes: [],
      coups: 0,
      trouvees: 0,
      serie: 0,
      meilleureSerie: 0
    };
  }
  /**
   * Retourne la carte i. Résultat : { action: 'ignore' | 'premiere' | 'paire' | 'erreur', fin }.
   * Après une 'erreur', l'interface appelle refermer() au bout d'1 s.
   */
  function retourner(etat, i) {
    if (etat.ouvertes.length >= 2 || etat.statuts[i] !== 'cachee') return { action: 'ignore', fin: false };
    etat.statuts[i] = 'visible';
    etat.ouvertes.push(i);
    if (etat.ouvertes.length === 1) return { action: 'premiere', fin: false };
    etat.coups++;
    var a = etat.ouvertes[0], b = etat.ouvertes[1];
    if (etat.cartes[a].paire === etat.cartes[b].paire) {
      etat.statuts[a] = etat.statuts[b] = 'trouvee';
      etat.ouvertes = [];
      etat.trouvees++;
      etat.serie++;
      if (etat.serie > etat.meilleureSerie) etat.meilleureSerie = etat.serie;
      return { action: 'paire', fin: etat.trouvees === etat.nbPaires, cartes: [a, b] };
    }
    etat.serie = 0;
    return { action: 'erreur', fin: false, cartes: [a, b] };
  }
  function refermer(etat) {
    var anciennes = etat.ouvertes.slice();
    anciennes.forEach(function (i) { etat.statuts[i] = 'cachee'; });
    etat.ouvertes = [];
    return anciennes;
  }

  /* ---------- Score ---------- */
  /** Gagnée = terminée avec au plus 2 × paires + 4 coups. */
  function partieGagnee(coups, nbPaires) { return coups <= 2 * nbPaires + 4; }
  /** 3 étoiles (≤ 1,5 × paires + 1), 2 (≤ 2 × paires), 1 (partie gagnée), sinon 0. */
  function etoiles(coups, nbPaires) {
    if (coups <= Math.ceil(1.5 * nbPaires) + 1) return 3;
    if (coups <= 2 * nbPaires) return 2;
    return partieGagnee(coups, nbPaires) ? 1 : 0;
  }

  /* ---------- Textes d'aide ---------- */
  var CONSIGNES = {
    cp: 'Retourne 2 cartes qui vont ensemble !',
    ce1: 'Retourne 2 cartes qui valent pareil, comme « 3 dizaines 4 unités » et « 34 ».',
    ce2: 'Retourne 2 cartes qui valent pareil, comme « 3 × 4 » et « 12 ».',
    cm1: 'Retourne 2 cartes qui valent pareil, comme « 1/2 » et « 0,5 ».',
    cm2: 'Retourne 2 cartes qui valent pareil, comme « 25 % » et « 1/4 ».'
  };
  function consigne(niveau) { return CONSIGNES[nomNiveau(niveau)]; }
  function texteVocal(niveau) {
    return nomNiveau(niveau) === 'cp'
      ? 'Retourne deux cartes. Trouve celles qui vont ensemble.'
      : 'Retourne deux cartes. Trouve celles qui ont la même valeur.';
  }

  var API = {
    NIVEAUX: NIVEAUX, MODES: MODES,
    enLettres: enLettres, genererPartie: genererPartie,
    creerEtat: creerEtat, retourner: retourner, refermer: refermer,
    partieGagnee: partieGagnee, etoiles: etoiles, consigne: consigne, texteVocal: texteVocal
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.MemoireMagique = API;
})(typeof window !== 'undefined' ? window : globalThis);
