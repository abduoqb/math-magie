/* Suites Magiques : générateur pur de suites logiques à trous (CP à CM2).
   Aucune dépendance au DOM. Exporté aussi pour Node (tests).
   Tous les calculs se font sur des entiers « mis à l'échelle » (ech = 1, 10 ou 100)
   pour éviter les erreurs d'arrondi avec les décimaux. */
(function (root) {
  'use strict';

  var NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
  var NB_SUITES = 10;        // suites par partie
  var SEUIL_VICTOIRE = 6;    // bonnes réponses du premier coup pour gagner
  var BORNES = { cp: 100, ce1: 999, ce2: 9999, cm1: 999999, cm2: 9999999 };
  var DIFFICULTES = [
    { nom: 'Petite Magie', detail: '1 trou, règles simples' },
    { nom: 'Grande Magie', detail: '1 trou, règles variées' },
    { nom: 'Maître Magicien', detail: '2 trous, règles malignes' }
  ];

  var INDICE_ARITH = 'Regarde l’écart entre deux nombres qui se suivent.';
  var INDICE_GEO = 'Regarde comment on passe d’un nombre au suivant : on multiplie ou on divise ?';
  var INDICE_CARRES = 'Regarde les écarts : ils grandissent à chaque fois.';
  var INDICE_ALT = 'Regarde les écarts : ils reviennent deux par deux.';

  /* ---------- Outils ---------- */
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function choisir(rng, liste) { return liste[Math.floor(rng() * liste.length)]; }
  function melanger(rng, liste) {
    var t = liste.slice();
    for (var i = t.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var x = t[i]; t[i] = t[j]; t[j] = x;
    }
    return t;
  }
  function decs(x) {
    var s = String(x), i = s.indexOf('.');
    return i < 0 ? 0 : s.length - i - 1;
  }
  function echelleDe(valeurs) {
    var m = 0;
    valeurs.forEach(function (v) { m = Math.max(m, decs(v)); });
    return Math.pow(10, m);
  }

  /** Écriture française : espaces insécables pour les milliers, virgule décimale. */
  function formater(v) {
    var s = String(Math.round(v * 1000) / 1000);
    var p = s.split('.');
    var ent = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return p[1] ? ent + ',' + p[1] : ent;
  }

  /** Vérifie une réponse tapée (virgule ou point, espaces tolérés). */
  function verifierSaisie(texte, attendu) {
    var s = String(texte).replace(/[\s  ]/g, '').replace(',', '.');
    if (!/^\d+(\.\d+)?$/.test(s)) return false;
    return Math.abs(parseFloat(s) - attendu) < 1e-9;
  }

  /* ---------- Fabriques de règles ---------- */
  function A(pas, max, o) { return Object.assign({ kind: 'arith', pas: pas, max: max, grain: 1 }, o); }
  function Gx(r, debuts, max, o) { return Object.assign({ kind: 'geo', mode: 'x', r: r, debuts: debuts, max: max }, o); }
  function Gd(r, finales, max, o) { return Object.assign({ kind: 'geo', mode: '/', r: r, debuts: finales, max: max }, o); }
  function Ca(ks, max) { return { kind: 'carres', ks: ks, max: max }; }
  function Al(a, b, debuts, max, o) { return Object.assign({ kind: 'alt', a: a, b: b, debuts: debuts, max: max, grain: 1 }, o); }

  var P5 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  var P15 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15];
  var FRAC_DEMI = { fraction: 'un demi', grain: 0.5 };
  var FRAC_QUART = { fraction: 'un quart', grain: 0.25 };

  /* Pour chaque classe, 3 paliers de règles (du plus simple au plus malin). */
  var SPECS = {
    cp: [
      [A(1, 20), A(1, 20), A(-1, 20), A(2, 20, { parite: true })],
      [A(1, 100), A(-1, 100), A(2, 100, { parite: true }), A(5, 100, { grain: 5 }), A(10, 100, { grain: 10 })],
      [A(2, 100, { parite: true }), A(5, 100), A(10, 100), A(-2, 100, { parite: true }), A(-5, 100, { grain: 5 }), A(-10, 100)]
    ],
    ce1: [
      [A(2, 100), A(5, 100, { grain: 5 }), A(10, 100, { grain: 10 }), A(-2, 100), A(-10, 100, { grain: 10 })],
      [A(2, 60, { table: true }), A(3, 60, { table: true }), A(4, 60, { table: true }), A(5, 100, { table: true }),
        A(10, 999), A(100, 999, { grain: 100 }), A(-5, 100, { grain: 5 }), A(-10, 999)],
      [A(100, 999), A(-100, 999), A(-10, 999), A(3, 100, { table: true }), A(4, 100, { table: true }),
        A(5, 999), A(-2, 100), A(-5, 999)]
    ],
    ce2: [
      [A(3, 100, { table: true }), A(4, 100, { table: true }), A(6, 100, { table: true }), A(5, 999),
        A(10, 999), A(-3, 100), A(-5, 999, { grain: 5 })],
      [A(7, 100, { table: true }), A(9, 100, { table: true }), A(25, 999, { grain: 25 }), A(50, 999, { grain: 50 }),
        A(100, 9999), Gx(2, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15], 1000, { doubles: true }), A(-4, 100), A(-50, 999, { grain: 50 })],
      [A(1000, 9999), A(-1000, 9999), A(-100, 9999), A(-25, 999, { grain: 25 }), A(7, 300), A(9, 300), A(25, 9999),
        A(50, 9999, { grain: 50 }), Gx(2, [5, 10, 15, 25, 50, 75, 100, 125, 150, 200, 250, 300], 9999, { doubles: true })]
    ],
    cm1: [
      [A(25, 1000, { grain: 25 }), A(50, 1000, { grain: 50 }), A(100, 9999), A(1000, 99999),
        A(0.5, 20, FRAC_DEMI), A(10, 9999)],
      [A(0.25, 10, FRAC_QUART), A(0.5, 20, FRAC_DEMI), A(-0.5, 20, FRAC_DEMI), Ca([1, 2, 3], 200),
        Gx(2, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25], 5000, { doubles: true }),
        A(250, 9999, { grain: 250 }), A(5000, 999999, { grain: 1000 }), A(500, 9999, { grain: 500 })],
      [Gx(3, [1, 2, 3, 4, 5], 5000), Gx(10, P5, 999999), A(-0.25, 10, FRAC_QUART),
        A(0.75, 20, { fraction: 'trois quarts', grain: 0.25 }), A(-2500, 99999, { grain: 500 }),
        A(25000, 999999, { grain: 1000 }), A(100000, 999999, { grain: 1000 }), A(1.5, 50, { grain: 0.5 }),
        Ca([3, 4, 5], 200)]
    ],
    cm2: [
      [A(0.2, 20, { grain: 0.1 }), A(0.5, 50, FRAC_DEMI), A(1.5, 50, { grain: 0.5 }), A(0.25, 20, FRAC_QUART),
        A(-0.5, 50, FRAC_DEMI), A(0.1, 10, { grain: 0.1 }), A(2500, 99999, { grain: 500 }), A(-0.2, 20, { grain: 0.1 })],
      [Gx(2, P15, 20000, { doubles: true }), Gx(10, [0.1, 1, 2, 3, 4, 5, 6, 7, 8, 9], 99999),
        Gd(2, P15, 2000), Al(3, 1, [0, 20]), Al(5, 2, [0, 40]), A(0.75, 30, { grain: 0.25 }),
        A(2.5, 100, { grain: 0.5 }), A(1250, 99999, { grain: 250 }), Ca([5, 6, 7], 500)],
      [Gd(10, [0.1, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9], 99999), Gx(10, [0.1, 0.2, 0.5, 1, 2, 5], 99999),
        Gx(3, [1, 2, 3, 4, 5], 20000), Gd(2, P15, 10000), Gd(3, [1, 2, 3, 4, 5], 5000),
        Al(7, 3, [0, 100]), Al(10, 4, [0, 200]), Al(0.5, 0.2, [0, 10], 100, { grain: 0.1 }),
        Al(1.5, 0.5, [0, 20], 100, { grain: 0.5 }), A(-1.25, 100, { grain: 0.25 }),
        A(250000, 9999999, { grain: 10000 })]
    ]
  };

  /* ---------- Constructeurs de suites (valeurs mises à l'échelle) ---------- */
  function texteArith(spec, P, ech, debut) {
    var ab = Math.abs(P);
    var pasTxt = formater(ab / ech);
    if (spec.table && P > 0) return 'C’est la table de ' + pasTxt + ' : on ajoute ' + pasTxt + ' à chaque fois.';
    var verbe = P > 0 ? 'On ajoute ' : 'On enlève ';
    var suite = pasTxt + ' à chaque fois';
    if (spec.parite) return verbe + suite + ' : ce sont des nombres ' + (debut % 2 === 0 ? 'pairs.' : 'impairs.');
    if (spec.fraction) return verbe + suite + ' (' + spec.fraction + ').';
    return verbe + suite + '.';
  }

  function construireArith(spec, rng, n, nMin, borne) {
    var ech = echelleDe([spec.pas, spec.grain || 1]);
    var P = Math.round(spec.pas * ech);
    var M = Math.round(Math.min(spec.max, borne) * ech);
    var G = Math.max(1, Math.round((spec.grain || 1) * ech));
    var ab = Math.abs(P);
    while (n > nMin && ab * (n - 1) > M) n--;
    var span = ab * (n - 1);
    if (span > M) return null;
    var lo = P > 0 ? 0 : span;
    var hi = P > 0 ? M - span : M;
    var debut;
    if (spec.table && P > 0) {
      var ks = [];
      for (var k = 1; k <= 3; k++) if (ab * k <= hi) ks.push(k);
      if (!ks.length) return null;
      debut = ab * choisir(rng, ks);
    } else {
      var a = Math.ceil(lo / G), b = Math.floor(hi / G);
      if (a > b) return null;
      debut = G * ri(rng, a, b);
    }
    var t = [];
    for (var i = 0; i < n; i++) t.push(debut + i * P);
    return {
      def: { kind: 'arith', ech: ech, debut: debut, pas: P }, ech: ech, scaled: t, M: M, premier: 1,
      cle: 'arith' + P / ech, regle: texteArith(spec, P, ech, debut), indice: INDICE_ARITH, geo: null
    };
  }

  function construireGeo(spec, rng, n, nMin, borne) {
    var ech = echelleDe(spec.debuts);
    var M = Math.round(Math.min(spec.max, borne) * ech);
    var r = spec.r, c = [];
    while (n >= nMin) {
      var nn = n;
      c = spec.debuts.filter(function (d) { return Math.round(d * ech) * Math.pow(r, nn - 1) <= M; });
      if (c.length) break;
      n--;
    }
    if (n < nMin || !c.length) return null;
    var D = Math.round(choisir(rng, c) * ech);
    var t = [], i;
    var premier = spec.mode === 'x' ? D : D * Math.pow(r, n - 1);
    for (i = 0; i < n; i++) t.push(spec.mode === 'x' ? D * Math.pow(r, i) : D * Math.pow(r, n - 1 - i));
    var regle;
    if (spec.mode === 'x') regle = spec.doubles ? 'On double à chaque fois (× 2).' : 'On multiplie par ' + r + ' à chaque fois.';
    else regle = r === 2 ? 'On prend la moitié à chaque fois (÷ 2).' : 'On divise par ' + r + ' à chaque fois.';
    return {
      def: { kind: 'geo', ech: ech, debut: premier, r: r, mode: spec.mode }, ech: ech, scaled: t, M: M, premier: 2,
      cle: 'geo' + spec.mode + r, regle: regle, indice: INDICE_GEO, geo: { r: r, mode: spec.mode }
    };
  }

  function construireCarres(spec, rng, n, nMin, borne) {
    var k = choisir(rng, spec.ks);
    var M = Math.min(spec.max, borne);
    while (n > nMin && (k + n - 1) * (k + n - 1) > M) n--;
    if ((k + n - 1) * (k + n - 1) > M) return null;
    var t = [];
    for (var i = 0; i < n; i++) t.push((k + i) * (k + i));
    return {
      def: { kind: 'carres', ech: 1, k: k }, ech: 1, scaled: t, M: M, premier: 2, cle: 'carres',
      regle: 'Ce sont les carrés : 1 × 1, 2 × 2, 3 × 3, 4 × 4…', indice: INDICE_CARRES, geo: null
    };
  }

  function construireAlt(spec, rng, n, nMin, borne) {
    var ech = echelleDe([spec.a, spec.b, spec.grain || 1]);
    var A1 = Math.round(spec.a * ech), B1 = Math.round(spec.b * ech);
    var G = Math.max(1, Math.round((spec.grain || 1) * ech));
    var M = Math.round(Math.min(spec.max || borne, borne) * ech);
    nMin = Math.max(nMin, 6);
    if (n < nMin) n = nMin;
    var dMin = Math.ceil(spec.debuts[0] * ech / G), dMax = Math.floor(spec.debuts[1] * ech / G);
    var D = G * ri(rng, dMin, dMax);
    var t = [];
    for (var i = 0; i < n; i++) t.push(D + Math.floor((i + 1) / 2) * A1 - Math.floor(i / 2) * B1);
    if (t[n - 1] > M || Math.max.apply(null, t) > M) return null;
    return {
      def: { kind: 'alt', ech: ech, debut: D, a: A1, b: B1 }, ech: ech, scaled: t, M: M, premier: 3,
      cle: 'alt' + spec.a + '/' + spec.b,
      regle: 'On ajoute ' + formater(spec.a) + ', puis on enlève ' + formater(spec.b) + ', et on recommence.',
      indice: INDICE_ALT, geo: null
    };
  }

  var CONSTRUCTEURS = { arith: construireArith, geo: construireGeo, carres: construireCarres, alt: construireAlt };

  /* ---------- Trous et propositions ---------- */
  /** Choisit `nb` trous non voisins, en laissant assez de nombres visibles côte à côte. */
  function placerTrous(rng, n, nb, premier) {
    var i;
    for (var essai = 0; essai < 80; essai++) {
      var possibles = [];
      for (i = premier; i < n; i++) possibles.push(i);
      var idx = [];
      var m = melanger(rng, possibles);
      for (i = 0; i < m.length && idx.length < nb; i++) {
        var ok = true;
        for (var j = 0; j < idx.length; j++) if (Math.abs(idx[j] - m[i]) < 2) ok = false;
        if (ok) idx.push(m[i]);
      }
      if (idx.length < nb) continue;
      idx.sort(function (a, b) { return a - b; });
      var paires = 0;
      for (i = 0; i < n - 1; i++) if (idx.indexOf(i) < 0 && idx.indexOf(i + 1) < 0) paires++;
      if (paires >= 1) return idx;
    }
    return nb === 1 ? [n - 1] : [n - 3, n - 1];
  }

  /** 4 propositions (en valeurs mises à l'échelle) : la bonne + 3 erreurs plausibles. */
  function proposer(rng, t, h, M, geo) {
    var b = t[h];
    var vus = {};
    var cands = [];
    function ajouter(v) {
      if (!isFinite(v) || v < 0 || v > M || v === b || Math.floor(v) !== v || vus[v]) return;
      vus[v] = true; cands.push(v);
    }
    var pas = Math.max(1, Math.abs(b - t[h - 1]));
    ajouter(b + pas); ajouter(b - pas); ajouter(b + 2 * pas); ajouter(b - 2 * pas);
    if (h >= 2) ajouter(2 * t[h - 1] - t[h - 2]);          // on prolonge « en ligne droite »
    if (h + 1 < t.length) ajouter((t[h - 1] + t[h + 1]) / 2); // le milieu des voisins
    for (var u = 1; u <= pas * 10; u *= 10) {
      if (u * 10 < pas) continue;
      ajouter(b + u); ajouter(b - u);
    }
    if (geo) { ajouter(b * geo.r); ajouter(b / geo.r); }
    var res = melanger(rng, cands).slice(0, 3);
    for (var k = 1; res.length < 3 && k < 200; k++) {
      [b + k, b - k].forEach(function (v) {
        if (res.length < 3 && v >= 0 && v <= M && !vus[v] && v !== b) { vus[v] = true; res.push(v); }
      });
    }
    return melanger(rng, [b].concat(res));
  }

  function indice2(spec, t, trous, ech) {
    for (var i = 0; i < t.length - 1; i++) {
      if (trous.indexOf(i) >= 0 || trous.indexOf(i + 1) >= 0) continue;
      var de = 'De ' + formater(t[i] / ech) + ' à ' + formater(t[i + 1] / ech) + ', ';
      if (spec.geo) {
        return de + (spec.geo.mode === 'x' ? 'on multiplie par ' : 'on divise par ') + spec.geo.r + '.';
      }
      var d = t[i + 1] - t[i];
      return de + (d >= 0 ? 'on gagne ' : 'on perd ') + formater(Math.abs(d) / ech) + '.';
    }
    return 'Cherche ce qui se répète d’un nombre au suivant.';
  }

  /* ---------- Paramètres d'une suite dans une partie ---------- */
  function parametresSuite(difficulte, i) {
    var palier = difficulte;
    if (i < 2) palier = Math.max(0, difficulte - 1);
    else if (i >= 7) palier = Math.min(2, difficulte + 1);
    var nbTrous = difficulte === 2 ? (i < 2 ? 1 : 2) : (difficulte === 1 ? (i >= 7 ? 2 : 1) : 1);
    return { palier: palier, nbTrous: nbTrous };
  }

  /**
   * Génère une suite.
   * opts (facultatif) : { palier: 0..2, nbTrous: 1|2, eviter: clé de règle à ne pas répéter }
   */
  function genererSuite(niveau, difficulte, rng, opts) {
    rng = rng || Math.random;
    if (NIVEAUX.indexOf(niveau) < 0) niveau = 'ce2';
    opts = opts || {};
    var par = parametresSuite(difficulte, 5);
    var palier = opts.palier !== undefined ? opts.palier : par.palier;
    var nbTrous = opts.nbTrous !== undefined ? opts.nbTrous : par.nbTrous;
    var pool = SPECS[niveau][palier];
    var borne = BORNES[niveau];
    var nMin = nbTrous === 2 ? 6 : 5;
    var nMax = niveau === 'cp' ? 6 : 7;
    var essais = 0;
    while (essais++ < 300) {
      var spec = choisir(rng, pool);
      var n = ri(rng, nMin, Math.max(nMin, nMax));
      var s = CONSTRUCTEURS[spec.kind](spec, rng, n, nMin, borne);
      if (!s) continue;
      if (opts.eviter && s.cle === opts.eviter && pool.length > 1 && essais < 200) continue;
      var t = s.scaled;
      var trous = placerTrous(rng, t.length, nbTrous, s.premier);
      var ech = s.ech;
      var termes = t.map(function (v) { return v / ech; });
      var choix = trous.map(function (h) {
        return proposer(rng, t, h, Math.min(s.M, Math.round(borne * ech)), s.geo).map(function (v) { return v / ech; });
      });
      return {
        niveau: niveau, difficulte: difficulte, palier: palier, kind: spec.kind, cle: s.cle, def: s.def, ech: ech,
        termes: termes, trous: trous, reponses: trous.map(function (h) { return termes[h]; }), choix: choix,
        saisie: difficulte === 2 && (niveau === 'cm1' || niveau === 'cm2'),
        regle: s.regle, indice: s.indice, indice2: indice2(s, t, trous, ech),
        signature: termes.join(',')
      };
    }
    throw new Error('Impossible de générer une suite (' + niveau + ', palier ' + palier + ')');
  }

  /** Une partie : 10 suites, de plus en plus malignes, toutes différentes. */
  function genererPartie(niveau, difficulte, rng) {
    rng = rng || Math.random;
    var partie = [], vues = {}, precedente = null;
    for (var i = 0; i < NB_SUITES; i++) {
      var par = parametresSuite(difficulte, i);
      var s = null;
      for (var essai = 0; essai < 30; essai++) {
        s = genererSuite(niveau, difficulte, rng, { palier: par.palier, nbTrous: par.nbTrous, eviter: precedente });
        if (!vues[s.signature]) break;
      }
      vues[s.signature] = true;
      precedente = s.cle;
      partie.push(s);
    }
    return partie;
  }

  /* ---------- Score et textes ---------- */
  function etoiles(score) { return score >= 9 ? 3 : (score >= 7 ? 2 : (score >= SEUIL_VICTOIRE ? 1 : 0)); }
  function estGagnee(score) { return score >= SEUIL_VICTOIRE; }

  /** Texte lu à voix haute (CP) : la suite avec « le nombre qui manque » à la place des trous. */
  function texteLecture(suite) {
    return suite.termes.map(function (v, i) {
      return suite.trous.indexOf(i) >= 0 ? 'le nombre qui manque' : String(v).replace('.', ',');
    }).join(', ');
  }

  var API = {
    NIVEAUX: NIVEAUX, NB_SUITES: NB_SUITES, SEUIL_VICTOIRE: SEUIL_VICTOIRE, BORNES: BORNES, DIFFICULTES: DIFFICULTES,
    SPECS: SPECS, formater: formater, verifierSaisie: verifierSaisie, parametresSuite: parametresSuite,
    genererSuite: genererSuite, genererPartie: genererPartie, etoiles: etoiles, estGagnee: estGagnee,
    texteLecture: texteLecture
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.SuitesMagiques = API;
})(typeof window !== 'undefined' ? window : globalThis);
