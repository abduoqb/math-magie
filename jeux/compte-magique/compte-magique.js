/* Le Compte Magique : logique pure (générateur, règles, solveur, état de manche).
   Aucune dépendance au DOM. Exporté aussi pour Node (tests). */
(function (root) {
  'use strict';

  var NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
  var NIVEAU_DEFAUT = 'ce2';
  var NB_MANCHES = 5;
  var NB_INDICES = 2;
  var SEUIL_VICTOIRE = 3;
  var NOMS_DIFFICULTE = ['Petite Magie', 'Grande Magie', 'Maître Magicien'];
  var SYMBOLES = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  var NOMS_OPERATIONS = { '+': 'plus', '-': 'moins', '*': 'fois', '/': 'divisé par' };
  var PLAFOND = 9999; // résultat maximal accepté pour le joueur

  /* Configuration : cartes = nombre de cartes ; ops = opérations permises ;
     cible = [min, max] ; valMax = plus grand nombre intermédiaire du générateur ;
     feuilleMax = plus grand nombre de départ (souhaité) ; facteurs = × permis seulement avec ces nombres ;
     requis = opération qui doit apparaître dans la solution connue. */
  var CONFIG = {
    cp: [
      { cartes: 2, ops: ['+'], cible: [4, 10], valMax: 10, feuilleMax: 9 },
      { cartes: 3, ops: ['+'], cible: [8, 20], valMax: 20, feuilleMax: 15 },
      { cartes: 3, ops: ['+', '-'], cible: [8, 20], valMax: 20, feuilleMax: 20, requis: '-' }
    ],
    ce1: [
      { cartes: 3, ops: ['+'], cible: [15, 30], valMax: 30, feuilleMax: 25 },
      { cartes: 3, ops: ['+', '-'], cible: [20, 50], valMax: 50, feuilleMax: 50, requis: '-' },
      { cartes: 3, ops: ['+', '-', '*'], cible: [20, 50], valMax: 50, feuilleMax: 50, facteurs: [2, 5, 10], requis: '*' }
    ],
    ce2: [
      { cartes: 3, ops: ['+', '-'], cible: [20, 60], valMax: 100, feuilleMax: 60 },
      { cartes: 4, ops: ['+', '-'], cible: [30, 100], valMax: 100, feuilleMax: 100, requis: '-' },
      { cartes: 4, ops: ['+', '-', '*'], cible: [30, 100], valMax: 100, feuilleMax: 100, requis: '*' }
    ],
    cm1: [
      { cartes: 3, ops: ['+', '-', '*'], cible: [50, 200], valMax: 300, feuilleMax: 100, requis: '*' },
      { cartes: 4, ops: ['+', '-', '*'], cible: [100, 500], valMax: 600, feuilleMax: 100, requis: '*' },
      { cartes: 4, ops: ['+', '-', '*', '/'], cible: [100, 500], valMax: 600, feuilleMax: 100, requis: '/' }
    ],
    cm2: [
      { cartes: 4, ops: ['+', '-', '*'], cible: [100, 500], valMax: 600, feuilleMax: 100, requis: '*' },
      { cartes: 5, ops: ['+', '-', '*'], cible: [200, 1000], valMax: 1200, feuilleMax: 100, requis: '*' },
      { cartes: 5, ops: ['+', '-', '*', '/'], cible: [200, 1000], valMax: 1200, feuilleMax: 100, requis: '/' }
    ]
  };

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

  /** Configuration d'un niveau de classe et d'une difficulté (0, 1 ou 2). */
  function config(niveau, difficulte) {
    var l = CONFIG[niveau] || CONFIG[NIVEAU_DEFAUT];
    var c = l[Math.max(0, Math.min(2, difficulte | 0))];
    return {
      cartes: c.cartes, ops: c.ops.slice(), cible: c.cible.slice(), valMax: c.valMax, feuilleMax: c.feuilleMax,
      facteurs: c.facteurs ? c.facteurs.slice() : null, requis: c.requis || null, plafond: PLAFOND
    };
  }

  /* ---------- Règle d'une opération ---------- */
  /** a op b → { ok: true, valeur } ou { ok: false, raison } (résultat toujours entier positif). */
  function appliquer(a, op, b, cfg) {
    var r;
    if (cfg && cfg.ops.indexOf(op) < 0) return { ok: false, raison: 'operation' };
    if (op === '+') r = a + b;
    else if (op === '-') {
      if (a < b) return { ok: false, raison: 'negatif' };
      if (a === b) return { ok: false, raison: 'zero' };
      r = a - b;
    } else if (op === '*') {
      if (cfg && cfg.facteurs && cfg.facteurs.indexOf(a) < 0 && cfg.facteurs.indexOf(b) < 0) return { ok: false, raison: 'facteur' };
      r = a * b;
    } else if (op === '/') {
      if (b < 1 || a % b !== 0) return { ok: false, raison: 'division' };
      r = a / b;
    } else return { ok: false, raison: 'operation' };
    if (r > (cfg ? cfg.plafond : PLAFOND)) return { ok: false, raison: 'grand' };
    return { ok: true, valeur: r };
  }

  /** Message gentil quand une opération est refusée. */
  function messageRefus(raison, a, op, b, cfg) {
    switch (raison) {
      case 'negatif': return 'Oups, ' + a + ' − ' + b + ' passe sous zéro. Essaie dans l’autre sens !';
      case 'zero': return a + ' − ' + b + ' fait zéro. Choisis deux autres cartes.';
      case 'division': return a + ' ÷ ' + b + ' ne tombe pas juste. Essaie une autre division.';
      case 'facteur': return 'Ici, on multiplie seulement par ' + cfg.facteurs.join(', ') + '.';
      case 'grand': return 'Ce nombre est trop grand. Essaie autre chose !';
      default: return 'Cette opération n’est pas permise ici.';
    }
  }

  /* ---------- Solveur ---------- */
  /** Cherche une suite d’opérations qui fait apparaître cible. Retourne [{a,op,b,r}] ou null. */
  function resoudre(valeurs, cible, cfg) {
    function rec(liste) {
      var vus = {};
      for (var i = 0; i < liste.length; i++) {
        for (var j = i + 1; j < liste.length; j++) {
          var x = liste[i], y = liste[j];
          var cle = Math.min(x, y) + '_' + Math.max(x, y);
          if (vus[cle]) continue;
          vus[cle] = true;
          var reste = [];
          for (var k = 0; k < liste.length; k++) if (k !== i && k !== j) reste.push(liste[k]);
          var grand = Math.max(x, y), petit = Math.min(x, y);
          for (var o = 0; o < cfg.ops.length; o++) {
            var op = cfg.ops[o];
            var res = appliquer(grand, op, petit, cfg);
            if (!res.ok) continue;
            var pas = { a: grand, op: op, b: petit, r: res.valeur };
            if (res.valeur === cible) return [pas];
            if (reste.length >= 1) {
              var suite = rec(reste.concat([res.valeur]));
              if (suite) return [pas].concat(suite);
            }
          }
        }
      }
      return null;
    }
    return rec(valeurs.slice());
  }

  /* ---------- Générateur (construit à l’envers depuis la cible) ---------- */
  function diviseurs(x) {
    var d = [];
    for (var i = 2; i * i <= x; i++) if (x % i === 0) d.push(i);
    return d;
  }

  /** Façons de « défaire » x : liste de { a, op, b } avec a op b = x. */
  function decoupes(x, cfg, rng) {
    var res = [], i;
    if (cfg.ops.indexOf('+') >= 0 && x >= 2) {
      var p = ri(rng, 1, x - 1);
      res.push({ a: Math.max(p, x - p), op: '+', b: Math.min(p, x - p) });
    }
    if (cfg.ops.indexOf('-') >= 0) {
      var maxB = Math.min(cfg.valMax - x, cfg.feuilleMax);
      if (maxB >= 1) {
        var bb = ri(rng, 1, maxB);
        res.push({ a: x + bb, op: '-', b: bb }); // (x + b) − b = x
      }
    }
    if (cfg.ops.indexOf('*') >= 0) {
      var paires = [];
      var ds = diviseurs(x);
      for (i = 0; i < ds.length; i++) {
        var f1 = ds[i], f2 = x / f1;
        if (cfg.facteurs && cfg.facteurs.indexOf(f1) < 0 && cfg.facteurs.indexOf(f2) < 0) continue;
        paires.push({ a: Math.max(f1, f2), op: '*', b: Math.min(f1, f2) });
      }
      // x = x × 1 est exclu : on veut des facteurs ≥ 2
      if (paires.length) res.push(choisir(rng, paires));
    }
    if (cfg.ops.indexOf('/') >= 0) {
      var b = ri(rng, 2, 10);
      if (x * b <= cfg.valMax) res.push({ a: x * b, op: '/', b: b });
    }
    return res;
  }

  function solutionContient(solution, op) {
    for (var i = 0; i < solution.length; i++) if (solution[i].op === op) return true;
    return false;
  }

  /** Une tentative de construction. Retourne { cartes, solution } ou null. */
  function tenter(cfg, cible, rng, stricteFeuille, stricteRequis) {
    var liste = [cible];
    var coupes = [];
    while (liste.length < cfg.cartes) {
      // on préfère défaire le plus grand nombre pour garder des cartes petites
      var ordre = [];
      var idx;
      for (idx = 0; idx < liste.length; idx++) ordre.push(idx);
      ordre.sort(function (m, n) { return liste[n] - liste[m]; });
      if (rng() < 0.3) ordre = melanger(rng, ordre);
      var fait = false;
      for (var t = 0; t < ordre.length && !fait; t++) {
        var pos = ordre[t];
        var opts = decoupes(liste[pos], cfg, rng);
        if (!opts.length) continue;
        var o = choisir(rng, opts);
        coupes.push({ a: o.a, op: o.op, b: o.b, r: liste[pos] });
        liste.splice(pos, 1, o.a, o.b);
        fait = true;
      }
      if (!fait) return null;
    }
    var i;
    for (i = 0; i < liste.length; i++) {
      if (liste[i] < 1 || liste[i] > cfg.valMax) return null;
      if (stricteFeuille && liste[i] > cfg.feuilleMax) return null;
      if (liste[i] === cible) return null;
    }
    var solution = coupes.reverse();
    if (stricteRequis && cfg.requis && !solutionContient(solution, cfg.requis)) return null;
    return { cartes: liste, solution: solution };
  }

  /** Puzzle de secours : que des additions (toujours possible). */
  function secours(cfg, cible, rng) {
    var liste = [cible], coupes = [];
    while (liste.length < cfg.cartes) {
      var pos = 0;
      for (var i = 1; i < liste.length; i++) if (liste[i] > liste[pos]) pos = i;
      var x = liste[pos];
      var p = ri(rng, 1, x - 1);
      var a = Math.max(p, x - p), b = Math.min(p, x - p);
      liste.splice(pos, 1, a, b);
      coupes.push({ a: a, op: '+', b: b, r: x });
    }
    return { cartes: liste, solution: coupes.reverse() };
  }

  /**
   * Génère une manche toujours résoluble.
   * Retourne { niveau, difficulte, cfg, cible, cartes: [nombres], solution: [{a,op,b,r}] }.
   */
  function genererManche(niveau, difficulte, rng) {
    rng = rng || Math.random;
    if (NIVEAUX.indexOf(niveau) < 0) niveau = NIVEAU_DEFAUT;
    var cfg = config(niveau, difficulte);
    var essai, puzzle = null, cible;
    for (essai = 0; essai < 400 && !puzzle; essai++) {
      cible = ri(rng, cfg.cible[0], cfg.cible[1]);
      puzzle = tenter(cfg, cible, rng, essai < 250, essai < 150);
      if (puzzle && !resoudre(puzzle.cartes, cible, cfg)) puzzle = null; // vérification de solvabilité
    }
    if (!puzzle) {
      cible = ri(rng, Math.max(cfg.cible[0], cfg.cartes * 2), cfg.cible[1]);
      puzzle = secours(cfg, cible, rng);
    }
    return {
      niveau: niveau, difficulte: difficulte, cfg: cfg, cible: cible,
      cartes: melanger(rng, puzzle.cartes), solution: puzzle.solution
    };
  }

  /* ---------- État d’une manche ---------- */
  function creerEtat(manche) {
    var cartes = manche.cartes.map(function (v, i) { return { id: i, v: v }; });
    return {
      cible: manche.cible, cfg: manche.cfg, solution: manche.solution,
      depart: cartes.map(function (c) { return { id: c.id, v: c.v }; }),
      cartes: cartes, suivant: cartes.length, historique: [], gagne: false
    };
  }
  function copier(cartes) { return cartes.map(function (c) { return { id: c.id, v: c.v }; }); }
  function carte(etat, id) {
    for (var i = 0; i < etat.cartes.length; i++) if (etat.cartes[i].id === id) return etat.cartes[i];
    return null;
  }

  /** Joue « carte A op carte B ». Retourne { ok, raison?, message?, carte?, gagne? }. */
  function jouer(etat, idA, op, idB) {
    var A = carte(etat, idA), B = carte(etat, idB);
    if (etat.gagne || !A || !B || idA === idB) return { ok: false, raison: 'carte', message: 'Choisis deux cartes différentes.' };
    var res = appliquer(A.v, op, B.v, etat.cfg);
    if (!res.ok) return { ok: false, raison: res.raison, message: messageRefus(res.raison, A.v, op, B.v, etat.cfg) };
    etat.historique.push({ cartes: copier(etat.cartes), suivant: etat.suivant, gagne: etat.gagne });
    var nouvelle = { id: etat.suivant++, v: res.valeur };
    var reste = etat.cartes.filter(function (c) { return c.id !== idA && c.id !== idB; });
    reste.push(nouvelle);
    etat.cartes = reste;
    etat.gagne = res.valeur === etat.cible;
    return { ok: true, carte: nouvelle, gagne: etat.gagne, texte: A.v + ' ' + SYMBOLES[op] + ' ' + B.v + ' = ' + res.valeur };
  }

  /** Annule le dernier coup. */
  function annuler(etat) {
    var h = etat.historique.pop();
    if (!h) return false;
    etat.cartes = h.cartes; etat.suivant = h.suivant; etat.gagne = h.gagne;
    return true;
  }

  /** Revient au départ de la manche. */
  function recommencer(etat) {
    etat.cartes = copier(etat.depart);
    etat.suivant = etat.depart.length;
    etat.historique = [];
    etat.gagne = false;
  }

  /** Nombres des cartes actuelles. */
  function valeurs(etat) { return etat.cartes.map(function (c) { return c.v; }); }

  /** Y a-t-il encore un chemin vers la cible ? */
  function resoluble(etat) {
    if (etat.gagne) return true;
    return resoudre(valeurs(etat), etat.cible, etat.cfg) !== null;
  }

  /**
   * Premier coup d’une solution depuis la situation actuelle (solution connue au départ).
   * Retourne { idA, op, idB, a, b, r } ou null s’il n’y a plus de solution.
   */
  function indice(etat) {
    var pas = null;
    if (!etat.historique.length && etat.solution && etat.solution.length) pas = etat.solution[0];
    else {
      var s = resoudre(valeurs(etat), etat.cible, etat.cfg);
      if (s) pas = s[0];
    }
    if (!pas) return null;
    var idA = null, idB = null, i;
    for (i = 0; i < etat.cartes.length; i++) if (idA === null && etat.cartes[i].v === pas.a) idA = etat.cartes[i].id;
    for (i = 0; i < etat.cartes.length; i++) if (idB === null && etat.cartes[i].v === pas.b && etat.cartes[i].id !== idA) idB = etat.cartes[i].id;
    if (idA === null || idB === null) return null;
    return { idA: idA, op: pas.op, idB: idB, a: pas.a, b: pas.b, r: pas.r };
  }

  /* ---------- Partie : étoiles et score ---------- */
  /** Étoiles d’une manche réussie : 3 sans indice, 2 avec un indice, 1 avec deux. */
  function etoilesManche(reussie, nbIndices) {
    if (!reussie) return 0;
    return Math.max(1, 3 - nbIndices);
  }
  /** resultats = [{ reussie, indices }]. */
  function resumerPartie(resultats) {
    var reussies = 0, sansIndice = 0, etoiles = 0;
    resultats.forEach(function (r) {
      if (r.reussie) reussies++;
      if (r.reussie && !r.indices) sansIndice++;
      etoiles += etoilesManche(r.reussie, r.indices || 0);
    });
    return { reussies: reussies, sansIndice: sansIndice, etoiles: etoiles, gagnee: reussies >= SEUIL_VICTOIRE };
  }

  /* ---------- Textes ---------- */
  function consigne(niveau, cible) {
    return niveau === 'cp'
      ? 'Fais le nombre ' + cible + ' !'
      : 'Fais apparaître le nombre ' + cible + ' avec tes cartes.';
  }
  function descriptionDifficulte(niveau, difficulte) {
    var c = config(niveau, difficulte);
    return c.cartes + ' cartes · ' + c.ops.map(function (o) { return SYMBOLES[o]; }).join(' ') + ' · jusqu’à ' + c.cible[1];
  }
  function ecrirePas(p) { return p.a + ' ' + SYMBOLES[p.op] + ' ' + p.b + ' = ' + p.r; }

  var API = {
    NIVEAUX: NIVEAUX, NB_MANCHES: NB_MANCHES, NB_INDICES: NB_INDICES, SEUIL_VICTOIRE: SEUIL_VICTOIRE,
    NOMS_DIFFICULTE: NOMS_DIFFICULTE, SYMBOLES: SYMBOLES, NOMS_OPERATIONS: NOMS_OPERATIONS,
    config: config, appliquer: appliquer, messageRefus: messageRefus, resoudre: resoudre,
    genererManche: genererManche, creerEtat: creerEtat, jouer: jouer, annuler: annuler,
    recommencer: recommencer, valeurs: valeurs, resoluble: resoluble, indice: indice,
    etoilesManche: etoilesManche, resumerPartie: resumerPartie,
    consigne: consigne, descriptionDifficulte: descriptionDifficulte, ecrirePas: ecrirePas
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.CompteMagique = API;
})(typeof window !== 'undefined' ? window : globalThis);
