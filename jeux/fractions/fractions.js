/* Pizzas Magiques : générateur de questions sur les fractions (pur, testable) + géométrie des parts.
   Aucune dépendance au DOM. Exporté aussi pour Node (tests). Les textes contiennent des jetons
   {n/d} que l'interface affiche en fraction empilée (numérateur au-dessus du dénominateur). */
(function (root) {
  'use strict';

  var NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
  var NB_MANCHES = 8;
  var SEUIL_VICTOIRE = 5;
  var DENS_CE2 = [2, 3, 4, 5, 6, 8, 10];

  /* ---------- Utilitaires ---------- */
  function ri(rng, a, b) { return Math.min(b, a + Math.floor(rng() * (b - a + 1))); }
  function choisir(rng, t) { return t[Math.min(t.length - 1, Math.floor(rng() * t.length))]; }
  function melanger(rng, t) {
    var a = t.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }
  function pgcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function egales(a, b) { return a.num * b.den === b.num * a.den; }
  function jeton(n, d) { return '{' + n + '/' + d + '}'; }
  function plage(n) { var l = []; for (var i = 0; i < n; i++) l.push(i); return l; }

  var DIFFICULTES = {
    cp: [{ nom: 'Petite Magie', detail: 'La moitié' }, { nom: 'Grande Magie', detail: 'Moitié et quart' }, { nom: 'Maître Magicien', detail: 'Parts coupées autrement' }],
    ce1: [{ nom: 'Petite Magie', detail: 'Moitié, tiers, quart' }, { nom: 'Grande Magie', detail: '3 quarts, 2 tiers…' }, { nom: 'Maître Magicien', detail: 'Parts à comparer' }],
    ce2: [{ nom: 'Petite Magie', detail: 'Parts de 2 à 5' }, { nom: 'Grande Magie', detail: 'Jusqu’aux huitièmes' }, { nom: 'Maître Magicien', detail: 'Jusqu’aux dixièmes' }],
    cm1: [{ nom: 'Petite Magie', detail: 'Fractions simples' }, { nom: 'Grande Magie', detail: 'Fractions égales' }, { nom: 'Maître Magicien', detail: 'Plus grand que 1' }],
    cm2: [{ nom: 'Petite Magie', detail: 'Fractions simples' }, { nom: 'Grande Magie', detail: 'Pourcentages' }, { nom: 'Maître Magicien', detail: 'Fractions expertes' }]
  };
  function difficultes(niveau) { return DIFFICULTES[niveau] || DIFFICULTES.ce2; }

  var OBJETS = {
    disque: { nom: 'pizza', la: 'la pizza', de: 'de la pizza', pl: 'pizzas', matiere: 'de pizza' },
    barre: { nom: 'tablette', la: 'la tablette de chocolat', de: 'de la tablette de chocolat', pl: 'tablettes de chocolat', matiere: 'de chocolat' }
  };
  function formePour(rng, d, probDisque) {
    if (d > 6 && d % 2 === 1) return 'disque';
    if (d > 12) return 'disque';
    return rng() < probDisque ? 'disque' : 'barre';
  }

  /* ---------- Dire les fractions ---------- */
  var NOMS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze',
    'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt'];
  var DEN_MOT = {
    2: ['demi', 'demis'], 3: ['tiers', 'tiers'], 4: ['quart', 'quarts'], 5: ['cinquième', 'cinquièmes'], 6: ['sixième', 'sixièmes'],
    7: ['septième', 'septièmes'], 8: ['huitième', 'huitièmes'], 9: ['neuvième', 'neuvièmes'], 10: ['dixième', 'dixièmes'],
    11: ['onzième', 'onzièmes'], 12: ['douzième', 'douzièmes'], 20: ['vingtième', 'vingtièmes'], 100: ['centième', 'centièmes']
  };
  function dire(num, den) {
    var n = num <= 20 ? NOMS[num] : String(num);
    if (den === 1) return n;
    var m = DEN_MOT[den];
    var nom = m ? m[num > 1 ? 1 : 0] : den + ' ièmes';
    return n + ' ' + nom;
  }
  function motFraction(num, den) {
    if (num === 1 && den === 2) return 'la moitié';
    if (num === 1 && den === 4) return 'un quart';
    if (num === 1 && den === 3) return 'un tiers';
    return dire(num, den);
  }
  function motQuantite(num, den) {
    if (num === 1 && den === 2) return 'la moitié';
    if (num === 1 && den === 3) return 'le tiers';
    if (num === 1 && den === 4) return 'le quart';
    if (num === 2 && den === 3) return 'les deux tiers';
    if (num === 3 && den === 4) return 'les trois quarts';
    return null;
  }
  /** Découpe un texte en morceaux { txt } ou { frac: true, num, den }. */
  function segments(texte) {
    var res = [], re = /\{(\d+)\/(\d+)\}/g, dernier = 0, m;
    texte = String(texte);
    while ((m = re.exec(texte))) {
      if (m.index > dernier) res.push({ txt: texte.slice(dernier, m.index) });
      res.push({ frac: true, num: +m[1], den: +m[2] });
      dernier = m.index + m[0].length;
    }
    if (dernier < texte.length) res.push({ txt: texte.slice(dernier) });
    return res;
  }
  /** Texte lisible à voix haute. */
  function enTexteBrut(texte) {
    return String(texte)
      .replace(/\{(\d+)\/(\d+)\}/g, function (m, a, b) { return dire(+a, +b); })
      .replace(/ %/g, ' pour cent').replace(/\+/g, ' plus ').replace(/=/g, ' égale ')
      .replace(/\s+/g, ' ').trim();
  }

  /* ---------- Bornes par classe ---------- */
  function fractionOK(niveau, num, den) {
    if (num < 1 || den < 2 || num !== Math.floor(num) || den !== Math.floor(den)) return false;
    switch (niveau) {
      case 'cp': return num === 1 && (den === 2 || den === 4);
      case 'ce1': return den <= 4 && num <= den;
      case 'ce2': return DENS_CE2.indexOf(den) >= 0 && num <= den;
      case 'cm1': return den <= 12 && num <= 2 * den;
      default: return den <= 20 && num <= 2 * den;
    }
  }
  var POOLS = {};
  function pool(niveau) {
    if (!POOLS[niveau]) {
      var l = [];
      for (var d = 2; d <= 20; d++) for (var n = 1; n <= 2 * d; n++) if (fractionOK(niveau, n, d)) l.push({ num: n, den: d });
      POOLS[niveau] = l;
    }
    return POOLS[niveau];
  }

  /** Fraction bonne + (nb - 1) distracteurs plausibles, de valeurs toutes différentes. La bonne est en premier. */
  function choixFractions(niveau, bonne, rng, nb) {
    var n = bonne.num, d = bonne.den;
    var cands = [{ num: n + 1, den: d }, { num: n - 1, den: d }, { num: d - n, den: d }, { num: n, den: d + 1 }, { num: n, den: d - 1 },
      { num: d, den: n }, { num: n + 1, den: d + 1 }, { num: n * 2, den: d }, { num: n, den: d * 2 }];
    var res = [bonne];
    function ajouter(c) {
      if (res.length >= nb || !fractionOK(niveau, c.num, c.den)) return;
      for (var i = 0; i < res.length; i++) if (egales(res[i], c)) return;
      res.push({ num: c.num, den: c.den });
    }
    melanger(rng, cands).forEach(ajouter);
    if (res.length < nb) melanger(rng, pool(niveau)).forEach(ajouter);
    return res;
  }
  /** Mélange la liste [bonne, ...] et retourne { choix, reponse }, la bonne étant repérée par référence. */
  function melangerChoix(rng, liste, creer) {
    var bonne = liste[0];
    var m = melanger(rng, liste);
    return { choix: m.map(creer), reponse: m.indexOf(bonne) };
  }
  function choixDeFractions(niveau, bonne, rng, nb) {
    var liste = choixFractions(niveau, bonne, rng, nb);
    return melangerChoix(rng, liste, function (f) {
      var c = { num: f.num, den: f.den, texte: niveau === 'cp' ? motFraction(f.num, f.den) : jeton(f.num, f.den) };
      if (niveau === 'ce1') c.mot = motFraction(f.num, f.den);
      return c;
    });
  }

  /* ---------- Géométrie : parts du disque et de la barre ---------- */
  function arrondi(x) { return Math.round(x * 100) / 100; }
  function pointCercle(cx, cy, r, deg) {
    var a = deg * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  /** tailles : fractions du tour (somme = 1). Retourne un secteur par part, en partant du haut, dans le sens horaire. */
  function secteurs(tailles, cx, cy, r) {
    var out = [], a0 = -90;
    tailles.forEach(function (t) {
      var ang = t * 360, a1 = a0 + ang;
      var p0 = pointCercle(cx, cy, r, a0), p1 = pointCercle(cx, cy, r, a1);
      var m = pointCercle(cx, cy, r * 0.62, a0 + ang / 2);
      out.push({
        d: 'M ' + cx + ' ' + cy + ' L ' + arrondi(p0.x) + ' ' + arrondi(p0.y) + ' A ' + r + ' ' + r + ' 0 ' + (ang > 180 ? 1 : 0) + ' 1 ' + arrondi(p1.x) + ' ' + arrondi(p1.y) + ' Z',
        angle: ang, debut: a0, mx: arrondi(m.x), my: arrondi(m.y)
      });
      a0 = a1;
    });
    return out;
  }
  /** Tablette de chocolat en grille (1 rangée jusqu'à 5 parts, 2 rangées au-delà). */
  function grilleBarre(d, W) {
    var cols = d <= 5 ? d : Math.ceil(d / 2), rows = Math.ceil(d / cols);
    var cw = W / cols, ch = Math.min(cw, 70), cells = [];
    for (var i = 0; i < d; i++) {
      var c = i % cols, r = Math.floor(i / cols);
      cells.push({ x: c * cw, y: r * ch, w: cw, h: ch, mx: c * cw + cw / 2, my: r * ch + ch / 2 });
    }
    return { cells: cells, largeur: W, hauteur: rows * ch, cols: cols, rows: rows };
  }
  /** Barre d'une seule rangée à parts de largeurs inégales. */
  function tranchesBarre(tailles, W, H) {
    var x = 0, cells = [];
    tailles.forEach(function (t) {
      var w = t * W;
      cells.push({ x: arrondi(x), y: 0, w: arrondi(w), h: H, mx: arrondi(x + w / 2), my: H / 2 });
      x += w;
    });
    return { cells: cells, largeur: W, hauteur: H, cols: tailles.length, rows: 1 };
  }

  /* ---------- Manche 1 : colorier la fraction ---------- */
  function palier(diff, etape) { return Math.max(0, Math.min(2, (diff | 0) + ((etape | 0) >= 4 ? 1 : 0))); }

  function equivalent(rng, dens, maxParts) {
    var d, m;
    do { d = choisir(rng, dens); m = ri(rng, 2, 3); } while (d * m > maxParts);
    var n = ri(rng, 1, d - 1);
    return { fr: { num: n, den: d }, parts: d * m, nb: 1, cible: n * m };
  }
  function impropre(rng, dens) {
    var d = choisir(rng, dens), n = ri(rng, d + 1, 2 * d - 1);
    return { fr: { num: n, den: d }, parts: d, nb: 2, cible: n };
  }
  var PCT_PARTS = [4, 8, 10];
  function pourcentage(rng, liste) {
    var pct, parts;
    do { pct = choisir(rng, liste); parts = choisir(rng, PCT_PARTS); } while ((pct * parts) % 100 !== 0);
    return { fr: { num: pct, den: 100 }, pct: pct, parts: parts, nb: 1, cible: pct * parts / 100 };
  }

  function genColorier(niveau, p, rng) {
    var r, cas, d, n;
    if (niveau === 'cp') {
      cas = choisir(rng, p === 0 ? [[1, 2, 1]] : p === 1 ? [[1, 2, 1], [1, 4, 1]] : [[1, 2, 2], [1, 4, 1], [1, 2, 1], [1, 4, 1]]);
      r = { fr: { num: cas[0], den: cas[1] }, parts: cas[1] * cas[2], nb: 1, cible: cas[0] * cas[2] };
    } else if (niveau === 'ce1') {
      d = choisir(rng, [2, 3, 4]);
      n = p === 0 ? 1 : ri(rng, 1, d - 1);
      var m = (p === 2 && d === 2 && rng() < 0.4) ? 2 : 1;
      r = { fr: { num: n, den: d }, parts: d * m, nb: 1, cible: n * m };
    } else if (niveau === 'ce2') {
      d = choisir(rng, p === 0 ? [2, 3, 4, 5] : p === 1 ? [2, 3, 4, 5, 6, 8] : [2, 3, 4, 5, 6, 8, 10]);
      r = { fr: { num: ri(rng, 1, d - 1), den: d }, parts: d, nb: 1 };
      r.cible = r.fr.num;
    } else if (niveau === 'cm1') {
      if (p < 2 || rng() < 0.5) {
        d = choisir(rng, p === 0 ? [2, 3, 4, 5, 6, 8, 10] : [2, 3, 4, 5, 6, 8, 10, 12]);
        r = { fr: { num: ri(rng, 1, d - 1), den: d }, parts: d, nb: 1 };
        r.cible = r.fr.num;
      } else if (rng() < 0.5) r = equivalent(rng, [2, 3, 4, 5, 6], 12);
      else r = impropre(rng, [2, 3, 4, 5, 6]);
    } else {
      if (p === 0) {
        d = choisir(rng, [2, 3, 4, 5, 6, 8, 10, 12]);
        r = { fr: { num: ri(rng, 1, d - 1), den: d }, parts: d, nb: 1 };
        r.cible = r.fr.num;
      } else if (p === 1) r = rng() < 0.7 ? pourcentage(rng, [10, 20, 25, 50, 75]) : equivalent(rng, [2, 3, 4, 5, 6], 12);
      else {
        var t = rng();
        r = t < 0.4 ? pourcentage(rng, [10, 20, 25, 40, 50, 60, 75, 80]) : t < 0.7 ? impropre(rng, [2, 3, 4, 5, 6, 8]) : equivalent(rng, [2, 3, 4, 5, 6], 12);
      }
    }
    var forme = formePour(rng, r.parts, niveau === 'cp' ? 0.85 : 0.6), o = OBJETS[forme];
    var f = r.fr, texte;
    if (r.pct) texte = 'Colorie ' + r.pct + ' % ' + o.de + '.';
    else if (niveau === 'cp') texte = 'Colorie ' + motFraction(f.num, f.den) + ' ' + o.de + '.';
    else if (niveau === 'ce1') texte = 'Colorie ' + motFraction(f.num, f.den) + ' (' + jeton(f.num, f.den) + ') ' + o.de + '.';
    else if (r.nb > 1) texte = 'Tu as ' + r.nb + ' ' + o.pl + ' coupées pareil. Colorie ' + jeton(f.num, f.den) + ' ' + o.matiere + '.';
    else texte = 'Colorie ' + jeton(f.num, f.den) + ' ' + o.de + '.';
    var total = r.parts * r.nb;
    var simple = !r.pct && r.nb === 1 && r.parts === f.den;
    return {
      type: 'colorier', forme: forme, parts: r.parts, nbFormes: r.nb, total: total, cible: r.cible,
      fraction: { num: f.num, den: f.den }, pct: r.pct || 0, texte: texte,
      indice: simple ? 'Le nombre du bas dit en combien de parts la ' + o.nom + ' est coupée. Le nombre du haut dit combien de parts colorier.'
        : 'Compte les parts : combien y en a-t-il en tout ? Quelle part de ce tout faut-il colorier ?',
      explication: 'Il fallait colorier ' + r.cible + ' part' + (r.cible > 1 ? 's' : '') + ' sur ' + total + '.'
    };
  }

  /* ---------- Manche 2 : quelle fraction est coloriée ? ---------- */
  function genLire(niveau, p, rng) {
    var d, n, nb = 1, bonne;
    if (niveau === 'cp') {
      d = p === 0 ? 2 : choisir(rng, [2, 4]);
      n = (p === 2 && d === 4 && rng() < 0.5) ? 2 : 1;
      bonne = (d === 2 || n === 2) ? { num: 1, den: 2 } : { num: 1, den: 4 };
    } else {
      if (niveau === 'ce1') { d = choisir(rng, [2, 3, 4]); n = p === 0 ? 1 : ri(rng, 1, d - 1); }
      else if (niveau === 'ce2') {
        d = choisir(rng, p === 0 ? [2, 3, 4, 5] : p === 1 ? [2, 3, 4, 5, 6, 8] : [2, 3, 4, 5, 6, 8, 10]);
        n = ri(rng, 1, d - 1);
      } else if (niveau === 'cm1' && p < 2) {
        d = choisir(rng, [2, 3, 4, 5, 6, 8, 10]); n = ri(rng, 1, d - 1);
      } else if (niveau === 'cm1') {
        if (rng() < 0.5) { d = choisir(rng, [2, 3, 4, 5, 6, 8]); n = ri(rng, d + 1, 2 * d - 1); nb = 2; }
        else { d = choisir(rng, [8, 10, 12]); n = ri(rng, 1, d - 1); }
      } else if (p === 0) { d = choisir(rng, [3, 4, 5, 6, 8, 10, 12]); n = ri(rng, 1, d - 1); }
      else if (p === 1 && rng() < 0.5) { d = choisir(rng, [3, 4, 5, 6, 8, 10, 12]); n = ri(rng, 1, d - 1); }
      else { d = choisir(rng, [3, 4, 5, 6, 8]); n = ri(rng, d + 1, 2 * d - 1); nb = 2; }
      bonne = { num: n, den: d };
    }
    var forme = formePour(rng, d, niveau === 'cp' ? 0.85 : 0.6), o = OBJETS[forme];
    var tout = plage(d * nb), indices;
    if (nb > 1 || p === 0) indices = tout.slice(0, n);
    else indices = melanger(rng, tout).slice(0, n).sort(function (a, b) { return a - b; });
    var c = choixDeFractions(niveau, bonne, rng, niveau === 'cp' ? 2 : 4);
    var texte = niveau === 'cp' ? 'Quelle part est coloriée ?'
      : nb > 1 ? 'Chaque ' + o.nom + ' est coupée en ' + d + ' parts. Quelle fraction est coloriée ?'
      : 'Quelle fraction ' + o.de + ' est coloriée ?';
    return {
      type: 'lire', forme: forme, parts: d, nbFormes: nb, total: d * nb, colorees: n, indices: indices,
      fraction: bonne, choix: c.choix, reponse: c.reponse, texte: texte,
      indice: 'Compte toutes les parts (le bas de la fraction), puis les parts coloriées (le haut).',
      explication: niveau === 'cp' ? 'Il y a ' + n + ' part' + (n > 1 ? 's' : '') + ' coloriée' + (n > 1 ? 's' : '') + ' sur ' + d + ' : c’est ' + motFraction(bonne.num, bonne.den) + '.'
        : nb > 1 ? 'Il y a ' + n + ' parts coloriées, et chaque ' + o.nom + ' est coupée en ' + d + ' parts : ' + jeton(n, d) + '.'
        : 'Il y a ' + n + ' part' + (n > 1 ? 's' : '') + ' coloriée' + (n > 1 ? 's' : '') + ' sur ' + d + ' : ' + jeton(n, d) + '.'
    };
  }

  /* ---------- Manche 3 : partage équitable ---------- */
  function genPartage(niveau, p, rng) {
    var ds = niveau === 'cp' ? (p === 0 ? [2] : [2, 4]) : niveau === 'ce1' ? [2, 3, 4] : [3, 4, 5, 6, 8];
    var d = choisir(rng, ds), egal = rng() < 0.5;
    var forme = d > 6 ? 'disque' : formePour(rng, d, niveau === 'cp' ? 0.85 : 0.65), o = OBJETS[forme];
    var tailles = [], plusGrande = -1, i;
    if (egal) for (i = 0; i < d; i++) tailles.push(1 / d);
    else {
      var f = p === 0 ? 2 : p === 1 ? 1.7 : 1.45, w = [], s = 0;
      plusGrande = ri(rng, 0, d - 1);
      for (i = 0; i < d; i++) { w.push(i === plusGrande ? f : 1); s += w[i]; }
      tailles = w.map(function (x) { return x / s; });
    }
    var texte;
    if (niveau === 'cp') texte = 'Les parts sont-elles égales ?';
    else if (niveau === 'ce1' || rng() < 0.5) texte = o.la.charAt(0).toUpperCase() + o.la.slice(1) + ' est coupée en ' + d + ' parts. Les parts sont-elles égales ?';
    else texte = 'Chaque part est-elle ' + jeton(1, d) + ' ' + o.de + ' ?';
    return {
      type: 'partage', forme: forme, parts: d, egal: egal, tailles: tailles, plusGrande: plusGrande,
      reperer: !egal && p >= 1, choix: [{ texte: 'Oui' }, { texte: 'Non' }], reponse: egal ? 0 : 1, texte: texte,
      indice: 'Compare la taille des parts. Sont-elles toutes pareilles ?',
      explication: egal ? 'Toutes les parts ont la même taille : c’est un partage équitable.'
        : 'Une part est plus grande que les autres : ce n’est pas équitable.'
    };
  }

  /* ---------- Manche 4 : comparer ---------- */
  var PAIRES_CE1 = [
    [[[1, 2], [1, 4]], [[1, 2], [1, 3]], [[1, 3], [1, 4]]],
    [[[1, 4], [3, 4]], [[1, 3], [2, 3]], [[1, 4], [2, 4]], [[2, 4], [3, 4]], [[1, 2], [3, 4]]]
  ];
  function genComparer(niveau, p, rng) {
    var a, b, d, na, nb, t, m, base, dbl;
    if (niveau === 'cp') {
      a = { num: 1, den: 2 }; b = { num: 1, den: 4 };
    } else if (niveau === 'ce1') {
      if (p < 2) {
        var pr = choisir(rng, PAIRES_CE1[p]);
        a = { num: pr[0][0], den: pr[0][1] }; b = { num: pr[1][0], den: pr[1][1] };
      } else {
        var pl = pool('ce1').filter(function (f) { return f.num < f.den; });
        do { a = choisir(rng, pl); b = choisir(rng, pl); } while (egales(a, b));
      }
    } else if (niveau === 'ce2') {
      d = choisir(rng, p === 0 ? [3, 4, 5] : p === 1 ? [3, 4, 5, 6, 8] : [3, 4, 5, 6, 8, 10]);
      na = ri(rng, 1, d - 1);
      do { nb = ri(rng, 1, d - 1); } while (nb === na);
      a = { num: na, den: d }; b = { num: nb, den: d };
    } else if (niveau === 'cm1') {
      if (p === 0) {
        d = choisir(rng, [3, 4, 5, 6, 8, 10, 12]);
        na = ri(rng, 1, d - 1);
        do { nb = ri(rng, 1, d - 1); } while (nb === na);
        a = { num: na, den: d }; b = { num: nb, den: d };
      } else if (p === 1) {
        d = choisir(rng, [3, 4, 5, 6, 8, 10, 12]);
        if (d % 2 === 0 && rng() < 0.25) na = d / 2;
        else do { na = ri(rng, 1, d - 1); } while (d % 2 === 0 && na === d / 2);
        a = { num: na, den: d }; b = { num: 1, den: 2 };
      } else if (rng() < 0.5) {
        d = choisir(rng, [2, 3, 4, 5, 6, 8, 10]);
        if (rng() < 0.25) na = d;
        else do { na = ri(rng, 1, 2 * d); } while (na === d);
        a = { num: na, den: d }; b = { num: 1, den: 1 };
      } else {
        d = choisir(rng, [3, 4, 5, 6, 8]);
        na = ri(rng, 1, 2 * d - 1);
        do { nb = ri(rng, 1, 2 * d - 1); } while (nb === na);
        a = { num: na, den: d }; b = { num: nb, den: d };
      }
      if (rng() < 0.5) { t = a; a = b; b = t; }
    } else {
      base = choisir(rng, p === 0 ? [2, 3, 4, 5] : [2, 3, 4, 5, 6, 8, 10]);
      do { m = ri(rng, 2, p === 0 ? 3 : 5); } while (base * m > 20 || (p === 0 && base * m > 12));
      dbl = base * m;
      na = ri(rng, 1, p === 2 ? 2 * base - 1 : base - 1);
      do { nb = na * m + choisir(rng, [-2, -1, 0, 0, 1, 2]); } while (nb < 1 || nb > 2 * dbl || (p < 2 && nb >= dbl));
      a = { num: na, den: base }; b = { num: nb, den: dbl };
      if (rng() < 0.5) { t = a; a = b; b = t; }
    }
    if (niveau === 'cp' && rng() < 0.5) { t = a; a = b; b = t; }
    var c = a.num * b.den - b.num * a.den;
    var solution = c > 0 ? 'a' : c < 0 ? 'b' : 'egal';
    var cm = niveau === 'cm1' || niveau === 'cm2';
    var figures = a.num <= a.den && b.num <= b.den && a.den > 1 && b.den > 1 && a.den <= 12 && b.den <= 12 &&
      (niveau !== 'cm1' || p <= 1) && (niveau !== 'cm2' || p === 0);
    var choix;
    if (cm) choix = [{ id: 'a', texte: jeton(a.num, a.den) + ' > ' + jeton(b.num, b.den) }, { id: 'egal', texte: jeton(a.num, a.den) + ' = ' + jeton(b.num, b.den) },
      { id: 'b', texte: jeton(a.num, a.den) + ' < ' + jeton(b.num, b.den) }];
    else choix = [{ id: 'a', texte: 'À gauche' }, { id: 'b', texte: 'À droite' }];
    var reponse = 0;
    choix.forEach(function (x, i) { if (x.id === solution) reponse = i; });
    var forme = formePour(rng, Math.max(a.den, b.den), niveau === 'cp' ? 0.85 : 0.6);
    var texte = niveau === 'cp' ? 'Où la part coloriée est-elle la plus grande ?' : cm ? 'Compare ces deux fractions.' : 'Quelle fraction est la plus grande ?';
    var expl;
    if (niveau === 'cp') {
      expl = 'La moitié est plus grande que le quart.';
    } else if (solution === 'egal') expl = jeton(a.num, a.den) + ' et ' + jeton(b.num, b.den) + ' sont égales.';
    else expl = (solution === 'a' ? jeton(a.num, a.den) + ' est plus grand que ' + jeton(b.num, b.den) : jeton(b.num, b.den) + ' est plus grand que ' + jeton(a.num, a.den)) + '.';
    return {
      type: 'comparer', forme: forme, a: a, b: b, figures: figures, solution: solution, choix: choix, reponse: reponse, texte: texte,
      indice: a.den === b.den ? 'Les parts sont de la même taille : compare le nombre de parts coloriées.'
        : cm ? 'Pense à mettre les deux fractions avec le même dénominateur, ou compare avec 1 ou ½.'
        : 'Regarde bien les parts coloriées : où y en a-t-il le plus ?',
      explication: expl
    };
  }

  /* ---------- Fraction d'une quantité ---------- */
  var OBJETS_Q = [{ nom: 'bonbons', emoji: '🍬' }, { nom: 'billes', emoji: '🔮' }, { nom: 'étoiles', emoji: '⭐' },
    { nom: 'fraises', emoji: '🍓' }, { nom: 'gâteaux', emoji: '🧁' }, { nom: 'cartes', emoji: '🃏' }];
  var CE2_TOTAUX = { 12: [2, 3, 4, 6], 20: [2, 4, 5, 10], 24: [2, 3, 4, 6, 8] };

  function genQuantite(niveau, p, rng) {
    var den, num = 1, total, pct = 0, k;
    if (niveau === 'cp') {
      if (p === 0) { den = 2; total = choisir(rng, [2, 4, 6, 8]); }
      else if (p === 1) { den = 2; total = choisir(rng, [4, 6, 8, 10, 12]); if (rng() < 0.35) { den = 4; total = choisir(rng, [4, 8]); } }
      else { den = choisir(rng, [2, 4]); total = den === 2 ? choisir(rng, [8, 10, 12, 14, 16, 18, 20]) : choisir(rng, [4, 8, 12]); }
    } else if (niveau === 'ce1') {
      if (p === 0) { den = 2; total = 2 * ri(rng, 1, 5); }
      else if (p === 1) { den = choisir(rng, [2, 4]); total = den * ri(rng, den === 2 ? 3 : 1, den === 2 ? 10 : 5); }
      else {
        var t = rng();
        if (t < 0.35) { den = 3; total = 3 * ri(rng, 1, 6); }
        else if (t < 0.6) { den = 4; num = 3; total = 4 * ri(rng, 1, 3); }
        else { den = choisir(rng, [2, 4]); total = den * ri(rng, 2, den === 2 ? 10 : 5); }
      }
    } else if (niveau === 'ce2') {
      total = choisir(rng, [12, 20, 24]);
      var valides = CE2_TOTAUX[total].filter(function (x) { return p > 0 || x <= 4; });
      den = choisir(rng, valides);
      num = p === 2 && den >= 3 ? ri(rng, 1, den - 1) : 1;
    } else if (niveau === 'cm1') {
      den = choisir(rng, [2, 3, 4, 5, 6, 8, 10]);
      k = ri(rng, 2, Math.min(10, Math.floor(100 / den)));
      total = den * k;
      num = p === 0 ? 1 : p === 1 ? ri(rng, 1, Math.min(3, den - 1)) : ri(rng, 1, den - 1);
    } else if (p >= 1 && rng() < 0.4) {
      pct = choisir(rng, p === 1 ? [10, 20, 25, 50, 75] : [10, 20, 25, 40, 50, 60, 75, 80]);
      var base = 100 / pgcd(pct, 100);
      total = base * ri(rng, Math.ceil(20 / base), Math.floor(200 / base));
    } else {
      den = choisir(rng, p === 2 ? [2, 3, 4, 5, 6, 8, 10, 12] : [2, 3, 4, 5, 8, 10]);
      k = ri(rng, 3, Math.min(12, Math.floor(120 / den)));
      total = den * k;
      num = p === 0 ? 1 : p === 1 ? ri(rng, 1, Math.min(3, den - 1)) : ri(rng, 1, den - 1);
    }
    var rep = pct ? total * pct / 100 : total * num / den;
    var obj = choisir(rng, OBJETS_Q);
    var mot = niveau === 'cm1' || niveau === 'cm2' ? null : motQuantite(num, den);
    var texte;
    if (pct) texte = 'Combien font ' + pct + ' % de ' + total + ' ' + obj.nom + ' ?';
    else if (mot && num === 1) texte = 'Quelle est ' + mot + ' de ' + total + ' ' + obj.nom + ' ?';
    else if (mot) texte = 'Combien font ' + mot + ' de ' + total + ' ' + obj.nom + ' ?';
    else texte = 'Combien font ' + jeton(num, den) + ' de ' + total + ' ' + obj.nom + ' ?';
    var unite = pct ? total / (100 / pgcd(pct, 100)) : total / den;
    var cands = [rep + 1, rep - 1, rep + 2, rep - 2, total - rep, unite, rep * 2, total, rep + 3, rep + 10];
    var autres = [];
    melanger(rng, cands).forEach(function (v) { if (v > 0 && v !== rep && autres.indexOf(v) < 0) autres.push(v); });
    var nbChoix = niveau === 'cp' ? 3 : 4;
    var c = melangerChoix(rng, [rep].concat(autres.slice(0, nbChoix - 1)), function (v) { return { valeur: v, texte: String(v) }; });
    var expl;
    if (pct) {
      var g = pgcd(pct, 100), pn = pct / g, pd = 100 / g;
      expl = 'Pour ' + pct + ' %, on prend ' + jeton(pn, pd) + ' : ' + total + ' ÷ ' + pd + ' = ' + unite + (pn > 1 ? ', puis ' + unite + ' × ' + pn + ' = ' + rep : '') + '.';
    } else expl = total + ' ÷ ' + den + ' = ' + unite + (num > 1 ? ', puis ' + unite + ' × ' + num + ' = ' + rep : '') + '.';
    return {
      type: 'quantite', fraction: { num: pct || num, den: pct ? 100 : den }, pct: pct, total: total, valeur: rep,
      objet: obj, grille: total <= 24, choix: c.choix, reponse: c.reponse, texte: texte,
      indice: pct ? 'Cherche à quelle fraction correspond ' + pct + ' % (par exemple 50 % = la moitié).' : 'Partage d’abord ' + total + ' en ' + den + ' groupes égaux.',
      explication: expl
    };
  }

  /* ---------- Fractions égales (CM1, CM2) ---------- */
  var BASES_CM1 = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5]];
  var BASES_CM2 = BASES_CM1.concat([[4, 5], [5, 6], [3, 8], [5, 8], [7, 10], [1, 6], [1, 10], [3, 10]]);

  function genEgales(niveau, p, rng) {
    var denMax = niveau === 'cm1' ? 12 : 20;
    var bases = niveau === 'cm1' ? BASES_CM1 : BASES_CM2, ref, k;
    do {
      ref = choisir(rng, bases);
      k = ri(rng, 2, p === 0 ? 2 : p === 1 ? 3 : niveau === 'cm1' ? 4 : 5);
    } while (ref[1] * k > denMax);
    var a = ref[0], b = ref[1];
    var bonne = { num: a * k, den: b * k }, refF = { num: a, den: b };
    var cands = [{ num: a + k, den: b + k }, { num: a * k, den: b }, { num: a, den: b * k }, { num: a * k, den: b * k + 1 },
      { num: a * k + 1, den: b * k }, { num: b * k - a * k, den: b * k }, { num: a + 1, den: b + 1 }, { num: a * k, den: b * k - 1 }];
    var liste = [bonne];
    function ajouter(c) {
      if (liste.length >= 4 || c.num < 1 || c.den < 2 || c.den > denMax || c.num > 2 * c.den) return;
      if (egales(c, refF)) return;
      for (var i = 0; i < liste.length; i++) if (egales(liste[i], c)) return;
      liste.push(c);
    }
    melanger(rng, cands).forEach(ajouter);
    melanger(rng, pool(niveau)).forEach(ajouter);
    var c = melangerChoix(rng, liste, function (f) { return { num: f.num, den: f.den, texte: jeton(f.num, f.den) }; });
    return {
      type: 'egales', ref: refF, forme: choisir(rng, ['disque', 'barre']), figure: b <= 12 && (niveau === 'cm1' || p === 0),
      choix: c.choix, reponse: c.reponse, texte: 'Quelle fraction est égale à ' + jeton(a, b) + ' ?',
      indice: 'Multiplie le haut ET le bas de la fraction par le même nombre.',
      explication: jeton(a, b) + ' = ' + jeton(a * k, b * k) + ' (on multiplie le haut et le bas par ' + k + ').'
    };
  }

  /* ---------- Simplifier (CM2) ---------- */
  function genSimplifier(niveau, p, rng) {
    var ref, k, a, b;
    do {
      ref = choisir(rng, BASES_CM2);
      k = choisir(rng, p === 0 ? [2, 3] : p === 1 ? [2, 3, 4, 5] : [2, 3, 4, 5, 6]);
    } while (ref[1] * k > 20);
    a = ref[0]; b = ref[1];
    var donnee = { num: a * k, den: b * k }, bonne = { num: a, den: b };
    var liste = [bonne];
    function ajouter(c) {
      if (liste.length >= 4 || c.num < 1 || c.den < 2 || c.den > 20 || c.num > 2 * c.den) return;
      if (egales(c, donnee)) return;
      for (var i = 0; i < liste.length; i++) if (egales(liste[i], c)) return;
      liste.push(c);
    }
    // fraction « à moitié simplifiée » : même valeur mais pas irréductible
    for (var f = 2; f < k; f++) if (k % f === 0) { liste.push({ num: a * f, den: b * f }); break; }
    var cands = [{ num: a + 1, den: b }, { num: a, den: b + 1 }, { num: b, den: a }, { num: a, den: b + 2 }, { num: a + 2, den: b }, { num: a + 1, den: b + 1 }];
    melanger(rng, cands).forEach(ajouter);
    melanger(rng, pool('cm2')).forEach(ajouter);
    var c = melangerChoix(rng, liste, function (x) { return { num: x.num, den: x.den, texte: jeton(x.num, x.den) }; });
    return {
      type: 'simplifier', donnee: donnee, choix: c.choix, reponse: c.reponse, texte: 'Simplifie ' + jeton(a * k, b * k) + ' au maximum.',
      indice: 'Cherche un nombre qui divise le haut ET le bas. Continue jusqu’à ce que ce ne soit plus possible.',
      explication: jeton(a * k, b * k) + ' = ' + jeton(a, b) + ' (on divise le haut et le bas par ' + k + ').'
    };
  }

  /* ---------- Fractions décimales et nombres décimaux (CM1, CM2) ---------- */
  function fmtCent(H) {
    var e = Math.floor(H / 100), f = H % 100;
    if (f === 0) return String(e);
    var s = (f < 10 ? '0' : '') + f;
    if (s.charAt(1) === '0') s = s.charAt(0);
    return e + ',' + s;
  }
  function genDecimal(niveau, p, rng) {
    var den, num;
    den = p === 0 ? 10 : p === 1 ? 100 : choisir(rng, [10, 100]);
    var max = niveau === 'cm1' ? (den === 10 ? (p === 2 ? 19 : 9) : 99) : (den === 10 ? 99 : 199);
    do { num = ri(rng, 1, max); } while (num % 10 === 0);
    var H = den === 10 ? num * 10 : num;
    var sens = rng() < 0.5 ? 'fd' : 'df';
    var unite = den === 10 ? 'dixième' : 'centième';
    var indice = 'Un ' + unite + ', c’est ' + (den === 10 ? '0,1' : '0,01') + '. Combien y en a-t-il ?';
    var expl = jeton(num, den) + ' = ' + num + ' ' + unite + (num > 1 ? 's' : '') + ' = ' + fmtCent(H) + '.';
    if (sens === 'fd') {
      var hs = [H];
      [H * 10, H % 10 === 0 ? H / 10 : 0, H + 100, H + 1, H - 1, H + 10, H - 10, H * 10 + 100].forEach(function (v) {
        if (v > 0 && v < 100000 && hs.indexOf(v) < 0 && hs.length < 4) hs.push(v);
      });
      hs = [hs[0]].concat(melanger(rng, hs.slice(1)));
      var c = melangerChoix(rng, hs, function (v) { return { valeur: v, texte: fmtCent(v) }; });
      return { type: 'decimal', sens: sens, fraction: { num: num, den: den }, valeur: fmtCent(H), choix: c.choix, reponse: c.reponse,
        texte: 'Écris ' + jeton(num, den) + ' sous forme de nombre décimal.', indice: indice, explication: expl };
    }
    var canon = H % 10 === 0 ? { num: H / 10, den: 10 } : { num: H, den: 100 };
    var liste = [canon];
    var cands = [{ num: canon.num, den: canon.den * 10 }, { num: canon.num, den: canon.den === 100 ? 10 : 100 }, { num: canon.num + 1, den: canon.den },
      { num: canon.den, den: canon.num }, { num: canon.num * 10, den: canon.den }, { num: Math.max(1, canon.num - 1), den: canon.den }];
    melanger(rng, cands).forEach(function (cd) {
      if (liste.length >= 4 || cd.num < 1 || cd.den < 2 || cd.den > 1000) return;
      for (var i = 0; i < liste.length; i++) if (egales(liste[i], cd)) return;
      liste.push(cd);
    });
    var c2 = melangerChoix(rng, liste, function (f) { return { num: f.num, den: f.den, texte: jeton(f.num, f.den) }; });
    return { type: 'decimal', sens: sens, fraction: canon, valeur: fmtCent(H), choix: c2.choix, reponse: c2.reponse,
      texte: 'Quelle fraction décimale est égale à ' + fmtCent(H) + ' ?', indice: indice,
      explication: fmtCent(H) + ' = ' + jeton(canon.num, canon.den) + '.' };
  }

  /* ---------- Additions de fractions de même dénominateur (CM1) ---------- */
  function genAddition(niveau, p, rng) {
    var d, a, b, s;
    d = choisir(rng, p === 0 ? [4, 5, 6, 8, 10] : [3, 4, 5, 6, 8, 10, 12]);
    if (p === 0) {
      s = ri(rng, 2, d - 1); a = ri(rng, 1, s - 1); b = s - a;
    } else if (p === 1) {
      s = ri(rng, 2, d); a = ri(rng, 1, s - 1); b = s - a;
    } else {
      s = ri(rng, d + 1, 2 * d - 2);
      do { a = ri(rng, 1, d - 1); b = s - a; } while (b < 1 || b >= d);
    }
    var bonne = { num: s, den: d };
    var cands = [{ num: s, den: 2 * d }, { num: s + 1, den: d }, { num: s - 1, den: d }, { num: a * b, den: d }, { num: s, den: d + 1 }, { num: Math.abs(a - b), den: d }, { num: a, den: d }];
    var liste = [bonne];
    function ajouter(c) {
      if (liste.length >= 4 || !fractionOK('cm1', c.num, c.den)) return;
      for (var i = 0; i < liste.length; i++) if (egales(liste[i], c)) return;
      liste.push(c);
    }
    melanger(rng, cands).forEach(ajouter);
    melanger(rng, pool('cm1')).forEach(ajouter);
    var c = melangerChoix(rng, liste, function (f) { return { num: f.num, den: f.den, texte: jeton(f.num, f.den) }; });
    return {
      type: 'addition', a: { num: a, den: d }, b: { num: b, den: d }, somme: bonne, choix: c.choix, reponse: c.reponse,
      texte: jeton(a, d) + ' + ' + jeton(b, d) + ' = ?',
      indice: 'Les parts ont la même taille : on garde le dénominateur et on additionne les numérateurs.',
      explication: 'On garde le dénominateur ' + d + ' et on additionne : ' + a + ' + ' + b + ' = ' + s + ', donc ' + jeton(s, d) + '.'
    };
  }

  /* ---------- Fraction plus grande que 1 (CM1) ---------- */
  function genImproprie(niveau, p, rng) {
    var d = choisir(rng, p === 0 ? [3, 4, 5] : [3, 4, 5, 6, 8]);
    var q = p === 0 ? 1 : choisir(rng, [1, 1, 2]);
    var r = ri(rng, 1, d - 1), n = q * d + r;
    var forme = formePour(rng, d, 0.65), o = OBJETS[forme];
    var cands = [[q + 1, r, d], [Math.max(0, q - 1), r, d], [q, d - r, d], [q, r, d + 1], [q, Math.min(d - 1, r + 1), d], [q + 1, d - r, d], [q, r, d - 1]];
    var liste = [[q, r, d]], vals = [n / d];
    melanger(rng, cands).forEach(function (c) {
      if (liste.length >= 4 || c[0] < 1 || c[1] < 1 || c[1] >= c[2] || c[2] < 2) return;
      var v = (c[0] * c[2] + c[1]) / c[2];
      for (var i = 0; i < vals.length; i++) if (Math.abs(vals[i] - v) < 1e-9) return;
      vals.push(v); liste.push(c);
    });
    var c = melangerChoix(rng, liste, function (x) { return { entier: x[0], num: x[1], den: x[2], texte: x[0] + ' + ' + jeton(x[1], x[2]) }; });
    return {
      type: 'improprie', forme: forme, parts: d, nbFormes: q + 1, fraction: { num: n, den: d }, entier: q, reste: { num: r, den: d },
      indices: plage(n), choix: c.choix, reponse: c.reponse,
      texte: 'Voici ' + jeton(n, d) + ' ' + o.matiere + '. Écris-le sous la forme « entier + fraction ».',
      indice: 'Combien de ' + o.pl + ' entières sont coloriées ? Que reste-t-il sur la dernière ?',
      explication: jeton(n, d) + ' = ' + q + ' + ' + jeton(r, d) + ' (' + q + ' entière' + (q > 1 ? 's' : '') + ' et ' + r + ' part' + (r > 1 ? 's' : '') + ' en plus).'
    };
  }

  /* ---------- Pourcentages et fractions (CM2) ---------- */
  var PCT_FR = { 5: [1, 20], 10: [1, 10], 20: [1, 5], 25: [1, 4], 40: [2, 5], 50: [1, 2], 60: [3, 5], 75: [3, 4], 80: [4, 5] };
  function genPourcent(niveau, p, rng) {
    var liste = p === 0 ? [10, 25, 50, 75] : p === 1 ? [10, 20, 25, 50, 75] : [5, 10, 20, 25, 40, 50, 60, 75, 80];
    var pct = choisir(rng, liste);
    var fr = PCT_FR[pct];
    var autres = melanger(rng, Object.keys(PCT_FR).map(Number).filter(function (x) { return x !== pct; })).slice(0, 3);
    var expl = pct + ' % = ' + jeton(fr[0], fr[1]) + ' (' + pct + ' sur 100).';
    if (rng() < 0.5) {
      var c = melangerChoix(rng, [pct].concat(autres), function (v) { return { num: PCT_FR[v][0], den: PCT_FR[v][1], texte: jeton(PCT_FR[v][0], PCT_FR[v][1]) }; });
      return { type: 'pourcent', sens: 'pf', pct: pct, fraction: { num: fr[0], den: fr[1] }, choix: c.choix, reponse: c.reponse,
        texte: 'Quelle fraction est égale à ' + pct + ' % ?', indice: '50 % = la moitié, 25 % = un quart… Pense aux fractions de 100.', explication: expl };
    }
    var c2 = melangerChoix(rng, [pct].concat(autres), function (v) { return { pct: v, texte: v + ' %' }; });
    return { type: 'pourcent', sens: 'fp', pct: pct, fraction: { num: fr[0], den: fr[1] }, choix: c2.choix, reponse: c2.reponse,
      texte: jeton(fr[0], fr[1]) + ' = ? %', indice: 'Cherche par quel nombre multiplier le dénominateur pour obtenir 100.', explication: expl };
  }

  /* ---------- Plan d'une partie et dispatcher ---------- */
  var GENS = { colorier: genColorier, lire: genLire, partage: genPartage, comparer: genComparer, quantite: genQuantite,
    egales: genEgales, decimal: genDecimal, addition: genAddition, improprie: genImproprie, pourcent: genPourcent, simplifier: genSimplifier };
  var SPECIAUX = {
    cp: ['quantite', 'comparer'], ce1: ['quantite', 'comparer'], ce2: ['quantite', 'comparer'],
    cm1: ['egales', 'comparer', 'decimal', 'addition', 'improprie', 'quantite'],
    cm2: ['comparer', 'pourcent', 'quantite', 'simplifier', 'egales', 'decimal']
  };
  var TYPES = Object.keys(GENS);

  /** Les 8 manches : 2 de chaque grande famille, les 2 « spéciales » dépendent de la classe. */
  function plan(niveau, rng) {
    rng = rng || Math.random;
    var sp = melanger(rng, SPECIAUX[niveau] || SPECIAUX.ce2);
    var s1 = sp[0], s2 = sp[1] || sp[0];
    return ['colorier', 'lire', 'partage', s1, 'lire', 'colorier', s2, 'partage'];
  }
  function question(niveau, diff, type, rng, etape) {
    rng = rng || Math.random;
    if (NIVEAUX.indexOf(niveau) < 0) niveau = 'ce2';
    var p = palier(diff, etape);
    var q = GENS[type](niveau, p, rng);
    q.niveau = niveau; q.palier = p;
    return q;
  }
  function partie(niveau, diff, rng) {
    rng = rng || Math.random;
    var types = plan(niveau, rng), vus = {};
    return types.map(function (type, i) {
      var q, essais = 0;
      do { q = question(niveau, diff, type, rng, i); essais++; } while (vus[q.texte + q.forme] && essais < 8);
      vus[q.texte + q.forme] = true;
      return q;
    });
  }
  function verifier(q, rep) { return q.type === 'colorier' ? rep === q.cible : rep === q.reponse; }
  function verifierPart(q, i) { return q.type === 'partage' && i === q.plusGrande; }
  function etoiles(nbJustes) { return nbJustes >= 7 ? 3 : nbJustes >= SEUIL_VICTOIRE ? 2 : nbJustes >= 3 ? 1 : 0; }
  function gagnee(nbJustes) { return nbJustes >= SEUIL_VICTOIRE; }

  var API = {
    NIVEAUX: NIVEAUX, NB_MANCHES: NB_MANCHES, SEUIL_VICTOIRE: SEUIL_VICTOIRE, TYPES: TYPES, SPECIAUX: SPECIAUX, OBJETS: OBJETS,
    difficultes: difficultes, plan: plan, question: question, partie: partie, verifier: verifier, verifierPart: verifierPart,
    etoiles: etoiles, gagnee: gagnee, fractionOK: fractionOK, dire: dire, motFraction: motFraction, segments: segments,
    enTexteBrut: enTexteBrut, secteurs: secteurs, grilleBarre: grilleBarre, tranchesBarre: tranchesBarre, fmtCent: fmtCent, palier: palier
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.PizzasMagiques = API;
})(typeof window !== 'undefined' ? window : globalThis);
