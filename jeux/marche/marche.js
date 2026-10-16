/* Au Marché des Sorciers : générateur pur de manches (payer, rendre la monnaie, achats malins).
   Tous les montants sont des entiers en CENTIMES (aucun flottant). Aucune dépendance au DOM.
   Exporté aussi pour Node (tests). */
(function (root) {
  'use strict';

  var NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
  var DIFFS = ['facile', 'moyen', 'difficile'];
  var NB_MANCHES = 6;
  var SEUIL_VICTOIRE = 4;
  var MAX_PIECES = 9;       // nombre maxi de pièces/billets de la solution la plus courte
  var NBSP = ' ';

  // Pièces (en centimes) et billets disponibles selon la classe
  var TOUTES = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  var DENOMS = {
    cp: [100, 200, 500, 1000],
    ce1: [10, 20, 50, 100, 200, 500, 1000, 2000],
    ce2: TOUTES, cm1: TOUTES, cm2: TOUTES
  };
  // Montant maximum rencontré (réponses et propositions comprises)
  var MAX_MONTANT = { cp: 2000, ce1: 5000, ce2: 5000, cm1: 5000, cm2: 10000 };
  // Plus petite unité de compte de la classe
  var UNITE = { cp: 100, ce1: 10, ce2: 1, cm1: 1, cm2: 1 };

  var DIFFICULTES = {
    cp: [
      { id: 'facile', nom: 'Petite Magie', detail: 'Pièces de 1 et 2 €' },
      { id: 'moyen', nom: 'Grande Magie', detail: 'Billets de 5 et 10 €' },
      { id: 'difficile', nom: 'Maître Magicien', detail: 'Rends la monnaie' }
    ],
    ce1: [
      { id: 'facile', nom: 'Petite Magie', detail: 'Euros entiers' },
      { id: 'moyen', nom: 'Grande Magie', detail: 'Avec les centimes' },
      { id: 'difficile', nom: 'Maître Magicien', detail: 'Monnaie sur 20 €' }
    ],
    ce2: [
      { id: 'facile', nom: 'Petite Magie', detail: 'Euros et 50 c' },
      { id: 'moyen', nom: 'Grande Magie', detail: 'Tous les centimes' },
      { id: 'difficile', nom: 'Maître Magicien', detail: 'Monnaie sur 50 €' }
    ],
    cm1: [
      { id: 'facile', nom: 'Petite Magie', detail: 'Totaux simples' },
      { id: 'moyen', nom: 'Grande Magie', detail: 'Remises et totaux' },
      { id: 'difficile', nom: 'Maître Magicien', detail: 'Gros paniers' }
    ],
    cm2: [
      { id: 'facile', nom: 'Petite Magie', detail: 'Totaux et −10 %' },
      { id: 'moyen', nom: 'Grande Magie', detail: 'Pourcentages' },
      { id: 'difficile', nom: 'Maître Magicien', detail: 'Prix et budget' }
    ]
  };

  // Types de manches (6 par partie), pensés pour progresser dans la partie
  var PLAN = {
    cp: {
      facile: ['payer', 'compter', 'payer', 'compter', 'payer', 'payer'],
      moyen: ['payer', 'compter', 'payer', 'rendre', 'payer', 'compter'],
      difficile: ['payer', 'rendre', 'payer', 'compter', 'rendre', 'payer']
    },
    ce1: {
      facile: ['payer', 'compter', 'rendre', 'payer', 'rendre', 'payer'],
      moyen: ['payer', 'rendre', 'compter', 'payer', 'rendre', 'payer'],
      difficile: ['payer', 'rendre', 'payer', 'rendre', 'compter', 'payer']
    },
    ce2: {
      facile: ['payer', 'rendre', 'achats', 'payer', 'rendre', 'comparer'],
      moyen: ['payer', 'rendre', 'achats', 'comparer', 'rendre', 'payer'],
      difficile: ['payer', 'achats', 'rendre', 'comparer', 'rendre', 'achats']
    },
    cm1: {
      facile: ['payer', 'rendre', 'remise', 'achats', 'payer', 'rendre'],
      moyen: ['payer', 'remise', 'rendre', 'achats', 'comparer', 'rendre'],
      difficile: ['payer', 'remise', 'rendre', 'achats', 'remise', 'rendre']
    },
    cm2: {
      facile: ['payer', 'pourcent', 'unitaire', 'rendre', 'budget', 'pourcent'],
      moyen: ['pourcent', 'unitaire', 'rendre', 'budget', 'achats', 'pourcent'],
      difficile: ['pourcent', 'unitaire', 'rendre', 'budget', 'pourcent', 'unitaire']
    }
  };

  // Articles de l'étal
  var ARTICLES = [
    { id: 'potion', nom: 'potion', pl: 'potions', det: 'une', emoji: '🧪' },
    { id: 'baguette', nom: 'baguette', pl: 'baguettes', det: 'une', emoji: '🪄' },
    { id: 'chapeau', nom: 'chapeau', pl: 'chapeaux', det: 'un', emoji: '🎩' },
    { id: 'grimoire', nom: 'grimoire', pl: 'grimoires', det: 'un', emoji: '📖' },
    { id: 'bonbon', nom: 'bonbon de dragon', pl: 'bonbons de dragon', det: 'un', emoji: '🍬' },
    { id: 'cristal', nom: 'boule de cristal', pl: 'boules de cristal', det: 'une', emoji: '🔮' },
    { id: 'balai', nom: 'balai volant', pl: 'balais volants', det: 'un', emoji: '🧹' },
    { id: 'champignon', nom: 'champignon magique', pl: 'champignons magiques', det: 'un', emoji: '🍄' },
    { id: 'bougie', nom: 'bougie enchantée', pl: 'bougies enchantées', det: 'une', emoji: '🕯️' },
    { id: 'plume', nom: 'plume de phénix', pl: 'plumes de phénix', det: 'une', emoji: '🪶' },
    { id: 'etoile', nom: 'étoile filante', pl: 'étoiles filantes', det: 'une', emoji: '🌟' },
    { id: 'cle', nom: 'clé secrète', pl: 'clés secrètes', det: 'une', emoji: '🗝️' },
    { id: 'cape', nom: 'cape magique', pl: 'capes magiques', det: 'une', emoji: '🧥' },
    { id: 'gateau', nom: 'gâteau de lune', pl: 'gâteaux de lune', det: 'un', emoji: '🥮' }
  ];

  /* ---------- Outils ---------- */
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(rng, tab) { return tab[ri(rng, 0, tab.length - 1)]; }
  function melanger(rng, tab) {
    var t = tab.slice();
    for (var i = t.length - 1; i > 0; i--) {
      var j = ri(rng, 0, i), x = t[i];
      t[i] = t[j]; t[j] = x;
    }
    return t;
  }
  function suite(pas) {
    var r = [];
    for (var c = 0; c < 100; c += pas) r.push(c);
    return r;
  }
  var C0 = [0], C50 = [0, 50], C10 = suite(10), C5 = suite(5), C1 = suite(1), CE1C = [0, 10, 20, 50];

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function pct(p) { return '−' + p + NBSP + '%'; }

  /** Écriture française d'un montant en centimes : « 2,50 € », « 4 € » ; CP/CE1 : « 50 c », « 3 € 50 c ». */
  function formaterMontant(c, niveau) {
    var e = Math.floor(c / 100), r = c % 100;
    if (r === 0) return e + NBSP + '€';
    if (niveau === 'cp' || niveau === 'ce1') {
      return e === 0 ? r + NBSP + 'c' : e + NBSP + '€ ' + r + NBSP + 'c';
    }
    return e + ',' + (r < 10 ? '0' : '') + r + NBSP + '€';
  }
  /** Montant dit à voix haute (sans symbole). */
  function voixMontant(c) {
    var e = Math.floor(c / 100), r = c % 100;
    if (e === 0) return r + ' centimes';
    return e + (e > 1 ? ' euros' : ' euro') + (r ? ' ' + r : '');
  }
  function nomMonnaie(v) {
    if (v >= 500) return 'billet de ' + (v / 100) + ' euros';
    if (v < 100) return 'pièce de ' + v + ' centime' + (v > 1 ? 's' : '');
    return 'pièce de ' + (v / 100) + ' euro' + (v > 1 ? 's' : '');
  }

  function somme(tab) { return tab.reduce(function (s, v) { return s + v; }, 0); }
  function totalPanier(arts) {
    return arts.reduce(function (s, a) { return s + a.prix * a.qte; }, 0);
  }

  /** Plus petit nombre de pièces/billets pour faire c (glouton, optimal avec les euros) ; Infinity si impossible. */
  function solutionMinimale(c, denoms) {
    var liste = denoms.slice().sort(function (a, b) { return b - a; });
    var reste = c, res = [];
    for (var i = 0; i < liste.length; i++) {
      while (reste >= liste[i]) { res.push(liste[i]); reste -= liste[i]; }
    }
    return reste === 0 ? res : null;
  }
  function nbPieces(c, denoms) {
    var s = solutionMinimale(c, denoms);
    return s ? s.length : Infinity;
  }
  function filtrerDenoms(denoms, max) {
    return denoms.filter(function (d) { return d <= max; });
  }
  /** Vérifie qu'une composition (liste de valeurs) donne exactement la cible, avec des pièces autorisées. */
  function verifierComposition(q, pieces) {
    if (!q || q.mode !== 'composer') return false;
    for (var i = 0; i < pieces.length; i++) if (q.denoms.indexOf(pieces[i]) < 0) return false;
    return somme(pieces) === q.cible;
  }

  /* ---------- Articles et paniers ---------- */
  function tirerArticles(rng, n) {
    return melanger(rng, ARTICLES).slice(0, n).map(function (a) {
      return { id: a.id, nom: a.nom, pl: a.pl, det: a.det, emoji: a.emoji, prix: 0, qte: 1 };
    });
  }
  function monte(emin, emax, i) {
    return emin + Math.round((emax - emin) * (0.5 + 0.5 * i / (NB_MANCHES - 1)));
  }
  function tirerPrix(rng, cfg, emaxI) {
    var emin = Math.min(cfg.emin, emaxI);
    for (var t = 0; t < 60; t++) {
      var p = ri(rng, emin, emaxI) * 100 + pick(rng, cfg.cents);
      if (p >= cfg.pmin) return p;
    }
    return Math.max(cfg.pmin, 100);
  }
  function construirePanier(rng, cfg, i, nb, emaxCap) {
    var arts = tirerArticles(rng, nb);
    var emaxI = Math.max(0, Math.min(monte(cfg.emin, cfg.emax, i), emaxCap === undefined ? 999 : emaxCap));
    arts.forEach(function (a) {
      a.prix = tirerPrix(rng, cfg, emaxI);
      a.qte = cfg.qteMax && rng() < 0.4 ? ri(rng, 2, cfg.qteMax) : 1;
    });
    return arts;
  }
  function listeTexte(arts, niveau) {
    var items = arts.map(function (a) {
      return a.qte > 1
        ? a.qte + ' ' + a.pl + ' à ' + formaterMontant(a.prix, niveau) + ' chacun'
        : a.det + ' ' + a.nom + ' à ' + formaterMontant(a.prix, niveau);
    });
    if (items.length === 1) return items[0];
    return items.slice(0, -1).join(', ') + ' et ' + items[items.length - 1];
  }

  /* ---------- Propositions (QCM) ---------- */
  function distracteurs(rng, bonne, extras, pas, valide, n) {
    var vus = {}, res = [];
    vus[bonne] = true;
    function essayer(v) {
      if (res.length < n - 1 && !vus[v] && valide(v)) { vus[v] = true; res.push(v); return true; }
      return false;
    }
    // une erreur « plausible » en premier, puis des voisins
    var ex = melanger(rng, extras);
    for (var e = 0; e < ex.length; e++) if (essayer(ex[e])) break;
    var voisins = [];
    for (var k = 1; k <= 3; k++) voisins.push(bonne + k * pas, bonne - k * pas);
    melanger(rng, voisins).forEach(essayer);
    for (var k2 = 4; k2 <= 80 && res.length < n - 1; k2++) { essayer(bonne + k2 * pas); essayer(bonne - k2 * pas); }
    // dernier recours : pas plus fin (petits prix)
    [50, 10, 5, 1].forEach(function (p2) {
      if (p2 >= pas) return;
      for (var k3 = 1; k3 <= 80 && res.length < n - 1; k3++) { essayer(bonne + k3 * p2); essayer(bonne - k3 * p2); }
    });
    return res;
  }
  function construireChoix(rng, bonne, extras, pas, valide, n, etiquette) {
    var vals = distracteurs(rng, bonne, extras, pas, valide, n);
    vals.push(bonne);
    vals.sort(function (a, b) { return a - b; });
    return {
      choix: vals.map(function (v) { return { label: etiquette(v), valeur: v }; }),
      bonne: vals.indexOf(bonne),
      reponse: bonne
    };
  }
  function pasPour(c) {
    if (c % 100 === 0) return 100;
    return c % 10 === 0 ? 10 : 5;
  }

  /* ---------- Manche « Paye le bon prix » ---------- */
  var PAYER = {
    cp: {
      facile: { nb: [1, 1], emin: 1, emax: 5, cents: C0, pmin: 100, tot: 500, denoms: [100, 200] },
      moyen: { nb: [1, 1], emin: 3, emax: 10, cents: C0, pmin: 100, tot: 1000 },
      difficile: { nb: [2, 2], emin: 2, emax: 10, cents: C0, pmin: 100, tot: 2000 }
    },
    ce1: {
      facile: { nb: [1, 1], emin: 2, emax: 20, cents: C0, pmin: 100, tot: 2000 },
      moyen: { nb: [1, 1], emin: 0, emax: 15, cents: CE1C, pmin: 10, tot: 1500 },
      difficile: { nb: [2, 2], emin: 1, emax: 25, cents: CE1C, pmin: 10, tot: 5000 }
    },
    ce2: {
      facile: { nb: [1, 1], emin: 1, emax: 10, cents: C50, pmin: 100, tot: 1000 },
      moyen: { nb: [1, 2], emin: 1, emax: 10, cents: C10, pmin: 100, tot: 2000 },
      difficile: { nb: [2, 2], emin: 1, emax: 15, cents: C5, pmin: 100, tot: 3000 }
    },
    cm1: {
      facile: { nb: [2, 2], emin: 1, emax: 9, cents: C10, pmin: 100, tot: 2000 },
      moyen: { nb: [2, 3], emin: 1, emax: 12, cents: C5, pmin: 100, tot: 3000 },
      difficile: { nb: [3, 3], emin: 1, emax: 15, cents: C1, pmin: 100, tot: 4000, qteMax: 2 }
    },
    cm2: {
      facile: { nb: [2, 3], emin: 1, emax: 12, cents: C10, pmin: 100, tot: 3000 },
      moyen: { nb: [3, 3], emin: 1, emax: 12, cents: C5, pmin: 100, tot: 4000, qteMax: 2 },
      difficile: { nb: [3, 4], emin: 1, emax: 12, cents: C1, pmin: 100, tot: 5000, qteMax: 3 }
    }
  };

  function base(type, mode, niveau, diff, index) {
    return { type: type, mode: mode, niveau: niveau, diff: diff, index: index };
  }

  function genererPayer(niveau, diff, i, rng) {
    var cfg = PAYER[niveau][diff];
    var denoms = cfg.denoms || DENOMS[niveau];
    var arts = null, total = 0, ok = false;
    for (var t = 0; t < 300 && !ok; t++) {
      arts = construirePanier(rng, cfg, i, ri(rng, cfg.nb[0], cfg.nb[1]));
      total = totalPanier(arts);
      ok = total <= cfg.tot && nbPieces(total, denoms) <= MAX_PIECES;
    }
    if (!ok) {
      arts = tirerArticles(rng, 1);
      arts[0].prix = (cfg.emin + 1) * 100;
      total = totalPanier(arts);
    }
    var q = base('payer', 'composer', niveau, diff, i);
    q.articles = arts;
    q.cible = total;
    q.denoms = filtrerDenoms(denoms, total);
    if (niveau === 'cp') {
      q.consigne = arts.length === 1 ? 'Paye ' + formaterMontant(total, niveau) + '.' : 'Paye les deux objets.';
      q.voix = arts.length === 1 ? 'Paye ' + voixMontant(total) + '.' : 'Paye les deux objets.';
    } else {
      q.consigne = 'Tu achètes ' + listeTexte(arts, niveau) + '. Paye le bon prix !';
      q.voix = q.consigne;
    }
    q.indice = arts.length === 1 && arts[0].qte === 1
      ? 'Pose des pièces et des billets jusqu’à ' + formaterMontant(total, niveau) + '.'
      : 'Additionne les prix un par un, puis pose les pièces.';
    q.explication = 'Il fallait payer ' + formaterMontant(total, niveau) + '.';
    return q;
  }

  /* ---------- Manche « Rends la monnaie » ---------- */
  var RENDRE = {
    cp: {
      moyen: { B: [1000], nb: [1, 1], emin: 2, emax: 9, cents: C0, pmin: 100, chMin: 100, mode: 'choix' },
      difficile: { B: [500, 1000], nb: [1, 1], emin: 1, emax: 9, cents: C0, pmin: 100, chMin: 100, mode: 'choix' }
    },
    ce1: {
      facile: { B: [500, 1000], nb: [1, 1], emin: 1, emax: 9, cents: C0, pmin: 100, chMin: 100, mode: 'choix' },
      moyen: { B: [500, 1000, 2000], nb: [1, 1], emin: 1, emax: 19, cents: C0, pmin: 100, chMin: 100, mode: 'composer' },
      difficile: { B: [1000, 2000], nb: [1, 1], emin: 0, emax: 19, cents: CE1C, pmin: 10, chMin: 10, mode: 'composer' }
    },
    ce2: {
      facile: { B: [1000], nb: [1, 1], emin: 1, emax: 9, cents: C50, pmin: 100, chMin: 50, mode: 'composer' },
      moyen: { B: [1000, 2000], nb: [1, 1], emin: 1, emax: 18, cents: C10, pmin: 100, chMin: 10, mode: 'composer' },
      difficile: { B: [2000, 5000], nb: [1, 1], emin: 1, emax: 49, cents: C5, pmin: 100, chMin: 5, mode: 'composer' }
    },
    cm1: {
      facile: { B: [2000], nb: [1, 1], emin: 1, emax: 19, cents: C10, pmin: 100, chMin: 10, mode: 'composer' },
      moyen: { B: [2000, 5000], nb: [1, 2], emin: 1, emax: 30, cents: C5, pmin: 100, chMin: 5, mode: 'composer' },
      difficile: { B: [5000], nb: [2, 3], emin: 1, emax: 40, cents: C1, pmin: 100, chMin: 1, mode: 'composer', qteMax: 2 }
    },
    cm2: {
      facile: { B: [2000], nb: [1, 2], emin: 1, emax: 19, cents: C10, pmin: 100, chMin: 10, mode: 'composer' },
      moyen: { B: [5000], nb: [2, 2], emin: 1, emax: 30, cents: C5, pmin: 100, chMin: 5, mode: 'composer', qteMax: 2 },
      difficile: { B: [5000], nb: [2, 3], emin: 1, emax: 40, cents: C1, pmin: 100, chMin: 1, mode: 'composer', qteMax: 3 }
    }
  };

  function genererRendre(niveau, diff, i, rng) {
    var cfg = RENDRE[niveau][diff] || RENDRE[niveau].moyen || RENDRE[niveau].facile;
    var denoms = DENOMS[niveau];
    var B = 0, arts = null, total = 0, ok = false;
    for (var t = 0; t < 300 && !ok; t++) {
      B = pick(rng, cfg.B);
      var nb = ri(rng, cfg.nb[0], cfg.nb[1]);
      arts = construirePanier(rng, cfg, i, nb, Math.floor((B - cfg.chMin) / nb / 100));
      total = totalPanier(arts);
      ok = total <= B - cfg.chMin &&
        (cfg.mode === 'choix' || nbPieces(B - total, denoms) <= MAX_PIECES);
    }
    if (!ok) {
      B = cfg.B[0];
      arts = tirerArticles(rng, 1);
      arts[0].prix = 100;
      total = 100;
    }
    var rendu = B - total;
    var q = base('rendre', cfg.mode, niveau, diff, i);
    q.articles = arts;
    q.paye = B;
    q.rendu = rendu;
    if (cfg.mode === 'composer') {
      q.cible = rendu;
      q.denoms = filtrerDenoms(denoms, rendu);
      q.consigne = 'Tu vends ' + listeTexte(arts, niveau) + '. Le client donne un billet de ' +
        formaterMontant(B, niveau) + '. Rends-lui la monnaie !';
      q.voix = q.consigne;
      q.indice = 'Compte de ' + formaterMontant(total, niveau) + ' jusqu’à ' + formaterMontant(B, niveau) + '.';
    } else {
      var ch = construireChoix(rng, rendu, [total], 100,
        function (v) { return v > 0 && v < B && v % 100 === 0; }, 3,
        function (v) { return formaterMontant(v, niveau); });
      q.choix = ch.choix; q.bonne = ch.bonne; q.reponse = ch.reponse;
      q.consigne = 'Le client donne ' + formaterMontant(B, niveau) + '. Combien rends-tu ?';
      q.voix = 'Le client donne ' + voixMontant(B) + '. Combien rends-tu ?';
      q.indice = 'Compte de ' + formaterMontant(total, niveau) + ' jusqu’à ' + formaterMontant(B, niveau) + '.';
    }
    q.explication = formaterMontant(B, niveau) + ' − ' + formaterMontant(total, niveau) + ' = ' +
      formaterMontant(rendu, niveau) + '.';
    return q;
  }

  /* ---------- Manche « Combien d'argent ? » (CP, CE1) ---------- */
  var COMPTER = {
    cp: {
      facile: { k: [2, 4], den: [100, 200, 500], tot: 1000 },
      moyen: { k: [3, 5], den: [100, 200, 500, 1000], tot: 1500 },
      difficile: { k: [3, 6], den: [100, 200, 500, 1000], tot: 2000 }
    },
    ce1: {
      facile: { k: [3, 5], den: [100, 200, 500, 1000], tot: 3000 },
      moyen: { k: [3, 5], den: [10, 20, 50, 100, 200], tot: 900 },
      difficile: { k: [4, 6], den: [10, 20, 50, 100, 200, 500, 1000, 2000], tot: 5000 }
    }
  };

  function genererCompter(niveau, diff, i, rng) {
    var cfg = (COMPTER[niveau] || COMPTER.ce1)[diff];
    var pieces = [], total = 0;
    for (var t = 0; t < 300; t++) {
      var k = ri(rng, cfg.k[0], cfg.k[1]);
      pieces = [];
      for (var j = 0; j < k; j++) pieces.push(pick(rng, cfg.den));
      total = somme(pieces);
      if (total <= cfg.tot) break;
    }
    if (total > cfg.tot) { pieces = [cfg.den[0], cfg.den[0]]; total = 2 * cfg.den[0]; }
    pieces.sort(function (a, b) { return b - a; });
    var unite = UNITE[niveau];
    var max = MAX_MONTANT[niveau];
    var pas = pasPour(total);
    if (pas < unite) pas = unite;
    var ch = construireChoix(rng, total, [pieces.length * 100], pas,
      function (v) { return v > 0 && v <= max && v % unite === 0; }, niveau === 'cp' ? 3 : 4,
      function (v) { return formaterMontant(v, niveau); });
    var q = base('compter', 'choix', niveau, diff, i);
    q.pieces = pieces;
    q.choix = ch.choix; q.bonne = ch.bonne; q.reponse = ch.reponse;
    q.consigne = niveau === 'cp' ? 'Combien d’euros y a-t-il ?' : 'Combien d’argent y a-t-il ?';
    q.voix = q.consigne;
    q.indice = 'Compte d’abord les billets, puis les pièces.';
    q.explication = pieces.map(function (v) { return formaterMontant(v, niveau); }).join(' + ') + ' = ' +
      formaterMontant(total, niveau) + '.';
    return q;
  }

  /* ---------- Manche « Achats malins » (peut-on acheter ?) ---------- */
  var ACHATS = {
    ce2: {
      facile: { nb: [2, 2], emin: 1, emax: 8, cents: C50, pmin: 100 },
      moyen: { nb: [2, 2], emin: 1, emax: 12, cents: C10, pmin: 100 },
      difficile: { nb: [2, 2], emin: 1, emax: 15, cents: C5, pmin: 100 }
    },
    cm1: {
      facile: { nb: [2, 2], emin: 1, emax: 10, cents: C10, pmin: 100 },
      moyen: { nb: [2, 3], emin: 1, emax: 10, cents: C5, pmin: 100 },
      difficile: { nb: [3, 3], emin: 1, emax: 12, cents: C1, pmin: 100 }
    },
    cm2: {
      facile: { nb: [2, 3], emin: 1, emax: 10, cents: C10, pmin: 100 },
      moyen: { nb: [3, 3], emin: 1, emax: 12, cents: C5, pmin: 100, qteMax: 2 },
      difficile: { nb: [3, 3], emin: 1, emax: 12, cents: C1, pmin: 100, qteMax: 3 }
    }
  };

  function genererAchats(niveau, diff, i, rng) {
    var cfg = ACHATS[niveau][diff];
    var arts = construirePanier(rng, cfg, i, ri(rng, cfg.nb[0], cfg.nb[1]));
    var total = totalPanier(arts);
    // budget en euros entiers, proche du total pour que la décision demande un vrai calcul
    var haut = Math.ceil(total / 100);
    var oui = rng() < 0.5;
    var X;
    if (oui) X = (haut + (rng() < 0.2 ? 0 : ri(rng, 0, 2))) * 100;
    else X = (haut - 1 - ri(rng, 0, 2)) * 100;
    if (X <= 0) X = haut * 100;
    var assez = total <= X;
    var q = base('achats', 'choix', niveau, diff, i);
    q.articles = arts;
    q.budget = X;
    q.choix = [{ label: 'Oui ✅', valeur: 'oui' }, { label: 'Non ❌', valeur: 'non' }];
    q.bonne = assez ? 0 : 1;
    q.reponse = assez ? 'oui' : 'non';
    q.consigne = 'Tu as ' + formaterMontant(X, niveau) + '. Peux-tu acheter ' + listeTexte(arts, niveau) + ' ?';
    q.voix = q.consigne;
    q.indice = 'Calcule d’abord le total des achats.';
    q.explication = assez
      ? 'Le total est ' + formaterMontant(total, niveau) + '. ' + (X === total
        ? 'Tu as juste assez !'
        : 'Il te reste ' + formaterMontant(X - total, niveau) + '.')
      : 'Le total est ' + formaterMontant(total, niveau) + '. Il te manque ' + formaterMontant(total - X, niveau) + '.';
    return q;
  }

  /* ---------- Manche « Compare deux paniers » ---------- */
  var COMPARER = {
    ce2: {
      facile: { nb: [1, 2], emin: 1, emax: 8, cents: C50, pmin: 100 },
      moyen: { nb: [2, 2], emin: 1, emax: 10, cents: C10, pmin: 100 },
      difficile: { nb: [2, 2], emin: 1, emax: 12, cents: C5, pmin: 100 }
    },
    cm1: {
      facile: { nb: [2, 2], emin: 1, emax: 8, cents: C10, pmin: 100 },
      moyen: { nb: [2, 3], emin: 1, emax: 10, cents: C5, pmin: 100 },
      difficile: { nb: [3, 3], emin: 1, emax: 12, cents: C5, pmin: 100 }
    }
  };

  function genererComparer(niveau, diff, i, rng) {
    var cfg = (COMPARER[niveau] || COMPARER.cm1)[diff];
    var A, B, tA, tB, nbA, nbB, tout, t;
    for (t = 0; t < 100; t++) {
      nbA = ri(rng, cfg.nb[0], cfg.nb[1]);
      nbB = ri(rng, cfg.nb[0], cfg.nb[1]);
      tout = construirePanier(rng, cfg, i, nbA + nbB);
      A = tout.slice(0, nbA); B = tout.slice(nbA);
      tA = totalPanier(A);
      // parfois, deux paniers au même prix : on ajuste le dernier article de B
      if (rng() < 0.15) {
        var dernier = B[B.length - 1];
        var autres = totalPanier(B) - dernier.prix;
        var np = tA - autres;
        if (np >= cfg.pmin && np <= MAX_MONTANT[niveau]) dernier.prix = np;
      }
      tB = totalPanier(B);
      if (tA === tB || Math.abs(tA - tB) >= 10) break;
    }
    var moins = rng() < 0.5;
    var rep = tA === tB ? 'egal' : (moins === (tA < tB) ? 'A' : 'B');
    var q = base('comparer', 'choix', niveau, diff, i);
    q.paniers = [A, B];
    q.dir = moins ? 'moins' : 'plus';
    q.choix = [{ label: 'Panier A', valeur: 'A' }, { label: 'Panier B', valeur: 'B' }, { label: 'Même prix', valeur: 'egal' }];
    q.bonne = rep === 'A' ? 0 : rep === 'B' ? 1 : 2;
    q.reponse = rep;
    q.consigne = 'Quel panier coûte le ' + (moins ? 'moins' : 'plus') + ' cher ?';
    q.voix = q.consigne;
    q.indice = 'Calcule le total de chaque panier.';
    q.explication = 'Panier A : ' + formaterMontant(tA, niveau) + '. Panier B : ' + formaterMontant(tB, niveau) + '.';
    return q;
  }

  /* ---------- Manche « 2 achetés = 1 offert » (CM1) ---------- */
  var REMISE = {
    facile: { emin: 2, emax: 6, cents: C0, ns: [3, 6] },
    moyen: { emin: 1, emax: 6, cents: C10, ns: [3, 4, 5] },
    difficile: { emin: 1, emax: 8, cents: C5, ns: [4, 5, 7, 8] }
  };

  function genererRemise(niveau, diff, i, rng) {
    var cfg = REMISE[diff];
    var art = tirerArticles(rng, 1)[0];
    var n = pick(rng, cfg.ns);
    var emax = Math.max(cfg.emin, Math.min(cfg.emax, Math.floor(45 / n)));
    var p = ri(rng, cfg.emin, emax) * 100 + pick(rng, cfg.cents);
    if (p < 100) p = 100;
    var payes = n - Math.floor(n / 3);
    var bonne = payes * p;
    var max = MAX_MONTANT[niveau];
    var ch = construireChoix(rng, bonne, [n * p, bonne + p, (payes - 1) * p], p === 0 ? 1 : p,
      function (v) { return v > 0 && v <= max; }, 4,
      function (v) { return formaterMontant(v, niveau); });
    var q = base('remise', 'choix', niveau, diff, i);
    q.article = art; q.n = n; q.prixUnitaire = p;
    q.offre = { achetes: 2, offerts: 1 };
    q.choix = ch.choix; q.bonne = ch.bonne; q.reponse = ch.reponse;
    q.consigne = 'Offre : 2 achetés = 1 offert ! Tu prends ' + n + ' ' + art.pl + ' à ' +
      formaterMontant(p, niveau) + ' chacun. Combien paies-tu ?';
    q.voix = q.consigne;
    q.indice = 'Dans chaque groupe de 3, un objet est offert. Combien en payes-tu ?';
    q.explication = 'Tu paies ' + payes + ' objets : ' + payes + ' × ' + formaterMontant(p, niveau) + ' = ' +
      formaterMontant(bonne, niveau) + '.';
    return q;
  }

  /* ---------- Manche « Pourcentages » (CM2) ---------- */
  var POURCENT = {
    facile: { pcts: [50, 10], pas: 1000, emin: 10, emax: 50, vars: ['prix'] },
    moyen: { pcts: [10, 25, 50], pas: 400, emin: 8, emax: 40, vars: ['prix', 'prix', 'remise'] },
    difficile: { pcts: [10, 25, 50], pas: 200, emin: 4, emax: 40, vars: ['prix', 'remise'] }
  };

  function genererPourcent(niveau, diff, i, rng) {
    var cfg = POURCENT[diff];
    var art = tirerArticles(rng, 1)[0];
    var p = pick(rng, cfg.pcts);
    var k = ri(rng, Math.ceil(cfg.emin * 100 / cfg.pas), Math.floor(cfg.emax * 100 / cfg.pas));
    var P = k * cfg.pas;
    var variante = pick(rng, cfg.vars);
    var remise = P * p / 100;
    var final = P - remise;
    var bonne = variante === 'prix' ? final : remise;
    var autre = variante === 'prix' ? remise : final;
    var max = MAX_MONTANT[niveau];
    var ch = construireChoix(rng, bonne, [autre, P], pasPour(bonne) >= 50 ? 50 : 10,
      function (v) { return v > 0 && v <= P && v <= max; }, 4,
      function (v) { return formaterMontant(v, niveau); });
    var q = base('pourcent', 'choix', niveau, diff, i);
    q.article = art; q.prixInitial = P; q.pourcentage = p; q.variante = variante;
    q.choix = ch.choix; q.bonne = ch.bonne; q.reponse = ch.reponse;
    q.consigne = cap(art.det + ' ' + art.nom) + ' coûte ' + formaterMontant(P, niveau) + '. Promotion : ' + pct(p) + '. ' +
      (variante === 'prix' ? 'Quel est le nouveau prix ?' : 'Combien d’euros économises-tu ?');
    q.voix = q.consigne;
    q.indice = p === 50 ? '50 %, c’est la moitié.' : p === 25 ? '25 %, c’est le quart.' : '10 %, c’est le dixième : divise par 10.';
    q.explication = pct(p) + ' de ' + formaterMontant(P, niveau) + ' = ' + formaterMontant(remise, niveau) +
      '. Nouveau prix : ' + formaterMontant(final, niveau) + '.';
    return q;
  }

  /* ---------- Manche « Prix unitaire » (CM2) ---------- */
  var UNITAIRE = {
    facile: { emin: 1, emax: 9, cents: C0, n: [2, 5], vars: ['unite'] },
    moyen: { emin: 1, emax: 6, cents: C50, n: [2, 6], vars: ['unite'] },
    difficile: { emin: 1, emax: 5, cents: C5, n: [2, 6], vars: ['unite', 'proportion'] }
  };

  function genererUnitaire(niveau, diff, i, rng) {
    var cfg = UNITAIRE[diff];
    var art = tirerArticles(rng, 1)[0];
    var u = ri(rng, cfg.emin, cfg.emax) * 100 + pick(rng, cfg.cents);
    var n = ri(rng, cfg.n[0], cfg.n[1]);
    var variante = pick(rng, cfg.vars);
    var max = MAX_MONTANT[niveau];
    var q = base('unitaire', 'choix', niveau, diff, i);
    q.article = art; q.variante = variante; q.n = n;
    var ch;
    if (variante === 'unite') {
      var T = u * n;
      q.total = T;
      ch = construireChoix(rng, u, [T], pasPour(u),
        function (v) { return v > 0 && v < T && v <= max; }, 4,
        function (v) { return formaterMontant(v, niveau); });
      q.consigne = n + ' ' + art.pl + ' coûtent ' + formaterMontant(T, niveau) + '. Combien coûte ' + art.det + ' ' + art.nom + ' ?';
      q.indice = 'Partage ' + formaterMontant(T, niveau) + ' en ' + n + '.';
      q.explication = formaterMontant(T, niveau) + ' ÷ ' + n + ' = ' + formaterMontant(u, niveau) + '.';
    } else {
      var n2 = ri(rng, 2, 10);
      if (n2 === n) n2 = n + 1;
      var T1 = u * n;
      q.total = T1; q.n2 = n2;
      var bonne = u * n2;
      ch = construireChoix(rng, bonne, [T1 + (n2 - n) * 100], pasPour(bonne) >= 50 ? 50 : 10,
        function (v) { return v > 0 && v <= max; }, 4,
        function (v) { return formaterMontant(v, niveau); });
      q.consigne = n + ' ' + art.pl + ' coûtent ' + formaterMontant(T1, niveau) + '. Combien coûtent ' + n2 + ' ' + art.pl + ' ?';
      q.indice = 'Cherche d’abord le prix d’un seul.';
      q.explication = 'Un seul : ' + formaterMontant(T1, niveau) + ' ÷ ' + n + ' = ' + formaterMontant(u, niveau) +
        '. Pour ' + n2 + ' : ' + n2 + ' × ' + formaterMontant(u, niveau) + ' = ' + formaterMontant(bonne, niveau) + '.';
    }
    q.choix = ch.choix; q.bonne = ch.bonne; q.reponse = ch.reponse;
    q.voix = q.consigne;
    return q;
  }

  /* ---------- Manche « Budget » (CM2) ---------- */
  var BUDGET = {
    facile: { emin: 2, emax: 6, cents: C0, qs: [2, 6], g: 100 },
    moyen: { emin: 1, emax: 6, cents: C50, qs: [2, 8], g: 50 },
    difficile: { emin: 1, emax: 5, cents: C10, qs: [3, 9], g: 5 }
  };

  function genererBudget(niveau, diff, i, rng) {
    var cfg = BUDGET[diff];
    var art = tirerArticles(rng, 1)[0];
    var p, qte, X, reste, t;
    for (t = 0; t < 100; t++) {
      p = ri(rng, cfg.emin, cfg.emax) * 100 + pick(rng, cfg.cents);
      if (p < 100) p = 100;
      qte = ri(rng, cfg.qs[0], cfg.qs[1]);
      reste = rng() < 0.8 ? ri(rng, 0, Math.floor((p - 1) / cfg.g)) * cfg.g : 0;
      X = qte * p + reste;
      if (X <= 5000) break;
    }
    if (X > 5000) { p = 300; qte = 4; reste = 0; X = 1200; }
    var bonne = Math.floor(X / p);
    var extras = [];
    if (X % p !== 0) extras.push(bonne + 1);
    var ch = construireChoix(rng, bonne, extras, 1,
      function (v) { return v >= 1; }, 4,
      function (v) { return v + ' ' + (v > 1 ? art.pl : art.nom); });
    var q = base('budget', 'choix', niveau, diff, i);
    q.article = art; q.budget = X; q.prixUnitaire = p;
    q.choix = ch.choix; q.bonne = ch.bonne; q.reponse = ch.reponse;
    q.consigne = 'Tu as ' + formaterMontant(X, niveau) + '. ' + cap(art.det + ' ' + art.nom) + ' coûte ' +
      formaterMontant(p, niveau) + '. Combien peux-tu en acheter au maximum ?';
    q.voix = q.consigne;
    q.indice = 'Combien de fois ' + formaterMontant(p, niveau) + ' tient dans ' + formaterMontant(X, niveau) + ' ?';
    q.explication = bonne + ' × ' + formaterMontant(p, niveau) + ' = ' + formaterMontant(bonne * p, niveau) +
      (X % p === 0 ? '.' : ', et un de plus dépasserait ' + formaterMontant(X, niveau) + '.');
    return q;
  }

  /* ---------- Assemblage ---------- */
  var GENERATEURS = {
    payer: genererPayer, rendre: genererRendre, compter: genererCompter, achats: genererAchats,
    comparer: genererComparer, remise: genererRemise, pourcent: genererPourcent,
    unitaire: genererUnitaire, budget: genererBudget
  };

  function normaliser(niveau, diff) {
    if (NIVEAUX.indexOf(niveau) < 0) niveau = 'ce2';
    if (DIFFS.indexOf(diff) < 0) diff = 'moyen';
    return { niveau: niveau, diff: diff };
  }

  /** Une manche (index 0 à 5) : objet question, entièrement décrit par ses champs. */
  function genererManche(niveau, diff, index, rng) {
    rng = rng || Math.random;
    var n = normaliser(niveau, diff);
    var i = Math.max(0, Math.min(NB_MANCHES - 1, index | 0));
    var type = PLAN[n.niveau][n.diff][i];
    return GENERATEURS[type](n.niveau, n.diff, i, rng);
  }
  function genererPartie(niveau, diff, rng) {
    rng = rng || Math.random;
    var manches = [];
    for (var i = 0; i < NB_MANCHES; i++) manches.push(genererManche(niveau, diff, i, rng));
    return manches;
  }

  function gagnee(score) { return score >= SEUIL_VICTOIRE; }
  function etoiles(score) { return score >= 6 ? 3 : score >= 4 ? 2 : score >= 2 ? 1 : 0; }

  /* ---------- Images de pièces et billets (SVG inline, valeurs internes uniquement) ---------- */
  var PIECES_INFO = {
    1: { r: 19, ext: 'cuivre' }, 2: { r: 22, ext: 'cuivre' }, 5: { r: 25, ext: 'cuivre' },
    10: { r: 22, ext: 'or' }, 20: { r: 25, ext: 'or' }, 50: { r: 28, ext: 'or' },
    100: { r: 27, ext: 'or', int: 'argent' }, 200: { r: 30, ext: 'argent', int: 'or' }
  };
  var TEINTES = { cuivre: '#E39A63', or: '#F5CF5C', argent: '#DDE5EC' };
  var BILLETS_COULEUR = { 500: '#CFD8DC', 1000: '#F4A3A0', 2000: '#8EB8F2', 5000: '#F7B77A' };
  var ENCRE = '#2B2D5B';

  function svgMonnaie(v) {
    var info = PIECES_INFO[v];
    var txt, unite, fs;
    if (info) {
      var euro = v >= 100;
      txt = euro ? String(v / 100) : String(v);
      unite = euro ? '€' : 'c';
      fs = txt.length > 1 ? 17 : 22;
      var s = '<svg class="marche-svg marche-svg-piece" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
        '<circle cx="32" cy="32" r="' + info.r + '" fill="' + TEINTES[info.ext] + '" stroke="' + ENCRE + '" stroke-width="3"/>';
      if (info.int) {
        s += '<circle cx="32" cy="32" r="' + Math.round(info.r * 0.66) + '" fill="' + TEINTES[info.int] + '" stroke="' + ENCRE + '" stroke-width="2"/>';
      } else {
        s += '<circle cx="32" cy="32" r="' + (info.r - 5) + '" fill="none" stroke="' + ENCRE + '" stroke-width="1.5" opacity=".35"/>';
      }
      s += '<text x="32" y="' + (32 + Math.round(fs * 0.35)) + '" text-anchor="middle" font-family="Lexend,sans-serif" font-weight="800" font-size="' + fs +
        '" fill="' + ENCRE + '">' + txt + '<tspan font-size="11">' + (euro ? '' : ' ') + unite + '</tspan></text></svg>';
      return s;
    }
    if (BILLETS_COULEUR[v]) {
      var n = String(v / 100);
      return '<svg class="marche-svg marche-svg-billet" viewBox="0 0 120 64" aria-hidden="true" focusable="false">' +
        '<rect x="2" y="2" width="116" height="60" rx="8" fill="' + BILLETS_COULEUR[v] + '" stroke="' + ENCRE + '" stroke-width="3"/>' +
        '<rect x="9" y="9" width="102" height="46" rx="5" fill="none" stroke="' + ENCRE + '" stroke-width="1.5" opacity=".35"/>' +
        '<circle cx="26" cy="32" r="13" fill="#fff" fill-opacity=".55" stroke="' + ENCRE + '" stroke-width="1.5" opacity=".8"/>' +
        '<path d="M26 22 l3 7 7 .6 -5.4 4.6 1.7 7 -6.3 -3.8 -6.3 3.8 1.7 -7 -5.4 -4.6 7 -.6z" fill="' + ENCRE + '" opacity=".3"/>' +
        '<text x="74" y="42" text-anchor="middle" font-family="Lexend,sans-serif" font-weight="800" font-size="28" fill="' + ENCRE + '">' +
        n + '<tspan font-size="20"> €</tspan></text></svg>';
    }
    return '';
  }

  var API = {
    NIVEAUX: NIVEAUX, DIFFS: DIFFS, NB_MANCHES: NB_MANCHES, SEUIL_VICTOIRE: SEUIL_VICTOIRE,
    DENOMS: DENOMS, MAX_MONTANT: MAX_MONTANT, UNITE: UNITE, PLAN: PLAN, DIFFICULTES: DIFFICULTES, ARTICLES: ARTICLES,
    MAX_PIECES: MAX_PIECES,
    genererManche: genererManche, genererPartie: genererPartie,
    formaterMontant: formaterMontant, voixMontant: voixMontant, nomMonnaie: nomMonnaie,
    solutionMinimale: solutionMinimale, nbPieces: nbPieces, verifierComposition: verifierComposition,
    somme: somme, gagnee: gagnee, etoiles: etoiles, svgMonnaie: svgMonnaie
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.MarcheSorciers = API;
})(typeof window !== 'undefined' ? window : globalThis);
