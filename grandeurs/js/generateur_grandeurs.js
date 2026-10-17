/* Grandeurs & mesures : générateurs purs de questions.
   Aucune dépendance au DOM. Le hasard est injectable (rng() renvoie un nombre dans [0, 1[).
   Exporté aussi pour Node (grandeurs/test-grandeurs.js).

   Aucun nombre de classe en dur ici : un « exo » est une description (type + bornes + unités)
   lue dans programme.grandeurs[mission].niveaux[palier - 1].exos (voir programmes/<classe>.js).

   Une question renvoyée :
   {
     type, grandeur,
     texte,            // énoncé (texte brut, à échapper par l'appelant s'il passe par innerHTML)
     resultat,         // nombre attendu (réponse saisie) ou indice du bon choix (si `choix`)
     unite,            // unité affichée à côté du champ de réponse ('' si aucune)
     decimaux,         // > 0 : le pavé propose la virgule
     choix?, bonne?,   // question à choix : libellés et libellé de la bonne réponse
     figure?,          // description d'un dessin { type, dims, labels }
     voix,             // texte lu à voix haute (CP)
     meta: { unites, figure, valeurs, ... }   // sert aux tests (contenu hors classe, bornes)
   }
*/
(function (root) {
  'use strict';

  /* ---------- outils ---------- */
  function ri(rng, a, b) { if (b < a) b = a; return a + Math.floor(rng() * (b - a + 1)); }
  function pick(rng, tab) { return tab[Math.floor(rng() * tab.length)]; }
  function melanger(tab, rng) {
    var t = tab.slice();
    for (var i = t.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var x = t[i]; t[i] = t[j]; t[j] = x;
    }
    return t;
  }
  function pgcd(a, b) { return b === 0 ? a : pgcd(b, a % b); }
  function arrondi(x, d) { return Number(x.toFixed(d)); }
  function fmt(n) {
    var s = String(n);
    var parts = s.split('.');
    var ent = parts[0];
    if (ent.replace('-', '').length > 4) ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.length > 1 ? ent + ',' + parts[1] : ent;
  }
  function unitAff(u, n) {
    if (n >= 2) {
      if (u === 'jour' || u === 'semaine') return u + 's';
      if (u === 'an') return 'ans';
    }
    return u;
  }
  function avec(n, u) { return fmt(n) + (u ? ' ' + unitAff(u, n) : ''); }
  function estPuissanceDe10(k) { return k >= 10 && Math.pow(10, Math.round(Math.log10(k))) === k; }

  /* ---------- tables d'unités (facteur vers la plus petite unité de la grandeur) ---------- */
  var UNITES = {
    longueur: { mm: 1, cm: 10, dm: 100, m: 1000, km: 1000000 },
    masse: { g: 1, kg: 1000, t: 1000000 },
    contenance: { mL: 1, cL: 10, dL: 100, L: 1000 },
    duree: { s: 1, min: 60, h: 3600, jour: 86400, semaine: 604800 },
    calendrier: { mois: 1, an: 12 },
    monnaie: { cts: 1, '€': 100 },
    aire: { 'cm²': 1, 'dm²': 100, 'm²': 10000 },
    volume: { 'cm³': 1, mL: 1, cL: 10, dL: 100, L: 1000, 'dm³': 1000, 'm³': 1000000 }
  };
  var CARRE = { mm: 'mm²', cm: 'cm²', dm: 'dm²', m: 'm²', km: 'km²' };
  var CUBE = { cm: 'cm³', dm: 'dm³', m: 'm³' };

  /* ---------- questions « Lequel est le plus … ? » ---------- */
  var TXT_COMPARER = {
    longueur: ['Lequel est le plus long ?', 'Lequel est le plus court ?'],
    masse: ['Lequel est le plus lourd ?', 'Lequel est le plus léger ?'],
    contenance: ['Lequel contient le plus ?', 'Lequel contient le moins ?'],
    duree: ['Lequel dure le plus longtemps ?', 'Lequel dure le moins longtemps ?'],
    calendrier: ['Lequel dure le plus longtemps ?', 'Lequel dure le moins longtemps ?'],
    monnaie: ['Lequel vaut le plus ?', 'Lequel vaut le moins ?'],
    aire: ['Lequel est le plus grand ?', 'Lequel est le plus petit ?'],
    volume: ['Lequel est le plus grand ?', 'Lequel est le plus petit ?']
  };

  /* ---------- « Quelle unité choisir ? » : [objet, unité] ---------- */
  var OBJETS_UNITE = {
    longueur: [
      ['la longueur d’une fourmi', 'mm'], ['l’épaisseur d’une pièce', 'mm'],
      ['la longueur d’un crayon', 'cm'], ['la largeur d’un cahier', 'cm'], ['la longueur d’une gomme', 'cm'],
      ['la hauteur d’une porte', 'm'], ['la longueur d’une salle de classe', 'm'], ['la hauteur d’un arbre', 'm'],
      ['la longueur d’un terrain de football', 'm'],
      ['la distance entre deux villes', 'km'], ['la longueur d’un fleuve', 'km'], ['la distance de la maison à Paris', 'km']
    ],
    masse: [
      ['la masse d’une pomme', 'g'], ['la masse d’une lettre', 'g'], ['la masse d’un stylo', 'g'],
      ['la masse d’un enfant', 'kg'], ['la masse d’un sac de pommes de terre', 'kg'], ['la masse d’un chat', 'kg'],
      ['la masse d’un camion', 't'], ['la masse d’une baleine', 't']
    ],
    contenance: [
      ['la contenance d’une cuillère à café', 'mL'], ['la contenance d’un petit verre de sirop', 'cL'],
      ['la contenance d’une bouteille d’eau', 'L'], ['la contenance d’une baignoire', 'L'], ['la contenance d’un seau', 'L']
    ],
    duree: [
      ['la durée d’un battement de cœur', 's'], ['la durée d’un clignement d’œil', 's'],
      ['la durée de la récréation', 'min'], ['la durée d’un brossage de dents', 'min'],
      ['la durée d’un film', 'h'], ['la durée d’une nuit de sommeil', 'h'],
      ['la durée des vacances d’été', 'semaine']
    ],
    aire: [
      ['la surface d’un timbre', 'cm²'], ['la surface d’une feuille de cahier', 'dm²'],
      ['la surface d’un terrain de football', 'm²'], ['la surface d’une salle de classe', 'm²']
    ],
    volume: [
      ['le volume d’un dé', 'cm³'], ['le volume d’une bouteille d’eau', 'L'],
      ['le volume d’une piscine', 'm³'], ['le volume d’un camion-citerne', 'm³']
    ]
  };

  /* ---------- énoncés de problèmes simples (A, B, T = quantités avec unité, N = nombre, u = unité) ---------- */
  var PROBLEMES = {
    longueur: {
      add: function (A, B, u) {
        return u === 'km' ? 'Tu parcours ' + A + ', puis ' + B + '. Quelle distance as-tu parcourue en tout ?'
          : 'Un ruban mesure ' + A + '. On y ajoute ' + B + '. Quelle est sa nouvelle longueur ?';
      },
      sub: function (A, B, u) {
        return u === 'km' ? 'Un trajet fait ' + A + '. Tu as déjà fait ' + B + '. Quelle distance reste-t-il ?'
          : 'Une corde mesure ' + A + '. On en coupe ' + B + '. Quelle longueur reste-t-il ?';
      },
      mul: function (A, N, u) {
        return u === 'km' ? 'Une étape mesure ' + A + '. Quelle distance fait-on en ' + N + ' étapes ?'
          : 'Un tuyau mesure ' + A + '. Quelle longueur font ' + N + ' tuyaux mis bout à bout ?';
      },
      div: function (T, N, u) {
        return u === 'km' ? 'Une randonnée de ' + T + ' est faite en ' + N + ' jours égaux. Quelle distance par jour ?'
          : 'Un fil de ' + T + ' est coupé en ' + N + ' morceaux égaux. Combien mesure un morceau ?';
      }
    },
    masse: {
      add: function (A, B, u) {
        if (u === 't') return 'Un camion transporte ' + A + ' et un autre transporte ' + B + '. Quelle est la masse totale ?';
        if (u === 'g') return 'Une pomme pèse ' + A + ' et une poire pèse ' + B + '. Quelle est leur masse totale ?';
        return 'Un sac pèse ' + A + ' et un autre pèse ' + B + '. Quelle est leur masse totale ?';
      },
      sub: function (A, B) { return 'Une caisse pèse ' + A + '. On retire ' + B + '. Combien pèse-t-elle maintenant ?'; },
      mul: function (A, N) { return N + ' paquets pèsent ' + A + ' chacun. Quelle est la masse totale ?'; },
      div: function (T, N) { return T + ' de farine sont répartis dans ' + N + ' sacs identiques. Quelle est la masse d’un sac ?'; }
    },
    contenance: {
      add: function (A, B) { return 'Tu verses ' + A + ' d’eau puis ' + B + ' de jus dans un récipient. Combien y a-t-il de liquide en tout ?'; },
      sub: function (A, B) { return 'Un récipient contient ' + A + '. Tu en verses ' + B + '. Combien en reste-t-il ?'; },
      mul: function (A, N) { return N + ' bidons contiennent ' + A + ' chacun. Quelle quantité en tout ?'; },
      div: function (T, N) { return T + ' de jus sont répartis dans ' + N + ' récipients identiques. Quelle quantité dans un récipient ?'; }
    },
    duree: {
      add: function (A, B) { return 'Léa fait deux activités : la première dure ' + A + ', la seconde dure ' + B + '. Quelle est la durée totale ?'; },
      sub: function (A, B) { return 'Un trajet dure ' + A + '. Il s’est déjà passé ' + B + '. Combien de temps reste-t-il ?'; },
      mul: function (A, N) { return 'Une séance dure ' + A + '. Combien durent ' + N + ' séances ?'; },
      div: function (T, N) { return N + ' séances identiques durent ' + T + ' en tout. Combien dure une séance ?'; }
    },
    monnaie: {
      add: function (A, B) { return 'Tu achètes un objet à ' + A + ' et un autre à ' + B + '. Combien dépenses-tu ?'; },
      sub: function (A, B) { return 'Tu as ' + A + '. Tu dépenses ' + B + '. Combien te reste-t-il ?'; },
      mul: function (A, N) { return 'Un objet coûte ' + A + '. Combien coûtent ' + N + ' objets identiques ?'; },
      div: function (T, N) { return N + ' objets identiques coûtent ' + T + '. Combien coûte un objet ?'; }
    }
  };

  /* ---------- fabrique de question ---------- */
  function question(type, grandeur, texte, resultat, unite, decimaux, meta, extra) {
    var q = {
      type: type, grandeur: grandeur, texte: texte, resultat: resultat,
      unite: unite || '', decimaux: decimaux || 0, voix: texte, meta: meta || {}
    };
    if (extra) for (var k in extra) q[k] = extra[k];
    return q;
  }
  function questionChoix(type, grandeur, texte, choix, indexBon, meta, extra) {
    var q = question(type, grandeur, texte, indexBon, '', 0, meta, extra);
    q.choix = choix;
    q.bonne = choix[indexBon];
    q.voix = texte + ' ' + choix.join(' ou ') + '.';
    return q;
  }

  /* ================= GÉNÉRATEURS ================= */
  var GEN = {};

  /* Conversion : « 3 m = ? cm ». paires = [[de, vers], ...]. min/max bornent la valeur affichée. */
  GEN.convertir = function (exo, rng) {
    var table = UNITES[exo.grandeur];
    // dv : nombre de décimales de la valeur de départ (ex. dv = 1 → « 3,5 m = ? cm »). Le résultat reste entier.
    var dv = exo.dv || 0, sv = Math.pow(10, dv);
    var paires = exo.paires;
    if (dv) {
      var ok = paires.filter(function (q) { return table[q[0]] / table[q[1]] >= sv; });
      if (ok.length) paires = ok;
    }
    var p = pick(rng, paires), de = p[0], vers = p[1];
    var fD = table[de], fV = table[vers];
    var min = exo.min || 1, max = exo.max;
    var v, rep, dec = 0, virgule = false;
    if (fD >= fV) {
      if (dv) {
        v = ri(rng, min * sv, max * sv) / sv;
        rep = arrondi(v * (fD / fV), 6);
        virgule = rep !== Math.floor(rep);
        dec = virgule ? 3 : 0;
      } else {
        v = ri(rng, min, max);
        rep = v * (fD / fV);
      }
    } else {
      var k = fV / fD;
      if (exo.decimal && estPuissanceDe10(k)) {
        dec = Math.round(Math.log10(k));
        var pasV = exo.pas || 1; // v multiple de pasV : limite le nombre de décimales de la réponse
        v = pasV * ri(rng, Math.ceil(min / pasV), Math.floor(max / pasV));
        rep = arrondi(v / k, dec);
        virgule = true;
      } else {
        var lo = Math.ceil(min / k), hi = Math.floor(max / k);
        if (hi < lo) hi = lo;
        var a = ri(rng, lo, hi);
        v = a * k;
        rep = a;
      }
    }
    return question('convertir', exo.grandeur, avec(v, de) + ' =', rep, unitAff(vers, rep), virgule ? dec : 0,
      { unites: [de, vers], valeurs: [v] },
      { voix: avec(v, de) + ' égale combien de ' + vers + ' ?' });
  };

  /* Conversion mixte : « 2 m 35 cm = ? cm ». paire = [grande, petite]. */
  GEN.mixte = function (exo, rng) {
    var table = UNITES[exo.grandeur];
    var g = exo.paire[0], pt = exo.paire[1];
    var r = table[g] / table[pt];
    var pas = exo.pas || 1;
    var G = ri(rng, exo.min || 1, exo.max);
    var P = pas * ri(rng, 1, Math.floor((r - 1) / pas));
    var rep = G * r + P;
    return question('mixte', exo.grandeur, avec(G, g) + ' ' + avec(P, pt) + ' =', rep, unitAff(pt, rep), 0,
      { unites: [g, pt], valeurs: [G] },
      { voix: avec(G, g) + ' ' + avec(P, pt) + ' égale combien de ' + pt + ' ?' });
  };

  /* Comparer deux mesures (choix). unites : même unité ; paires : unités différentes [grande, petite]. */
  GEN.comparer = function (exo, rng) {
    var table = UNITES[exo.grandeur];
    var min = exo.min || 1, max = exo.max;
    var items, i;
    if (exo.paires) {
      var p = pick(rng, exo.paires);
      var r = table[p[0]] / table[p[1]];
      var A = ri(rng, min, max);
      var delta = ri(rng, 1, Math.max(1, Math.floor(r / 2)));
      var B = A * r + (rng() < 0.5 ? -delta : delta);
      if (B < 1) B = A * r + delta;
      items = [{ v: A, u: p[0] }, { v: B, u: p[1] }];
    } else {
      var u = pick(rng, exo.unites);
      var a = ri(rng, min, max), b = ri(rng, min, max);
      for (i = 0; i < 20 && b === a; i++) b = ri(rng, min, max);
      if (b === a) b = a < max ? a + 1 : a - 1;
      items = [{ v: a, u: u }, { v: b, u: u }];
    }
    items = melanger(items, rng);
    var moins = !!exo.deux && rng() < 0.5;
    var f0 = items[0].v * table[items[0].u], f1 = items[1].v * table[items[1].u];
    var idx = moins ? (f0 < f1 ? 0 : 1) : (f0 > f1 ? 0 : 1);
    var choix = items.map(function (it) { return avec(it.v, it.u); });
    return questionChoix('comparer', exo.grandeur, TXT_COMPARER[exo.grandeur][moins ? 1 : 0], choix, idx,
      { unites: items.map(function (it) { return it.u; }), valeurs: items.map(function (it) { return it.v; }) });
  };

  /* « Quelle unité pour mesurer … ? » : exo.unites = unités proposées (et seules autorisées). */
  GEN.choisirUnite = function (exo, rng) {
    var liste = (OBJETS_UNITE[exo.grandeur] || []).filter(function (o) { return exo.unites.indexOf(o[1]) !== -1; });
    var o = pick(rng, liste);
    var choix = melanger(exo.unites, rng).slice(0, Math.max(2, exo.nbChoix || 3));
    if (choix.indexOf(o[1]) === -1) choix[0] = o[1];
    choix = melanger(choix, rng);
    return questionChoix('choisirUnite', exo.grandeur, 'Quelle unité choisir pour mesurer ' + o[0] + ' ?', choix, choix.indexOf(o[1]),
      { unites: choix.slice(), valeurs: [] });
  };

  /* Problèmes à une étape : op = add | sub | mul | div. dec = nombre de décimales des données. */
  GEN.probleme = function (exo, rng) {
    var s = Math.pow(10, exo.dec || 0), dec = exo.dec || 0;
    var u = exo.unite, op = exo.op;
    var tpl = PROBLEMES[exo.grandeur][op];
    var min = exo.min || 1, max = exo.max;
    var val = function (x) { return avec(arrondi(x / s, dec), u); };
    var a, b, n, rep, texte, vals;
    if (op === 'add') {
      a = ri(rng, min * s, max * s); b = ri(rng, min * s, max * s);
      rep = arrondi((a + b) / s, dec); texte = tpl(val(a), val(b), u); vals = [a / s, b / s];
    } else if (op === 'sub') {
      b = ri(rng, min * s, Math.max(min * s, max * s - 1));
      a = ri(rng, b + 1, Math.max(b + 1, max * s));
      rep = arrondi((a - b) / s, dec); texte = tpl(val(a), val(b), u); vals = [a / s, b / s];
    } else if (op === 'mul') {
      a = ri(rng, min * s, max * s); n = ri(rng, exo.n ? exo.n[0] : 2, exo.n ? exo.n[1] : 5);
      rep = arrondi(a * n / s, dec); texte = tpl(val(a), String(n), u); vals = [a / s];
    } else {
      var qt = ri(rng, min * s, max * s); n = ri(rng, exo.n ? exo.n[0] : 2, exo.n ? exo.n[1] : 5);
      rep = arrondi(qt / s, dec); texte = tpl(val(qt * n), String(n), u); vals = [qt * n / s];
    }
    return question('probleme', exo.grandeur, texte, rep, unitAff(u, rep), dec, { unites: [u], valeurs: vals, op: op });
  };

  /* Sommes d'argent : pièces et billets. */
  GEN.monnaieSomme = function (exo, rng) {
    var u = exo.unite; // '€' ou 'cts'
    var nbTypes = exo.nbTypes || 2;
    var vals = melanger(exo.valeurs, rng).slice(0, nbTypes);
    var total = 0, morceaux = [];
    vals.forEach(function (v) {
      var n = ri(rng, 1, exo.nbMax || 3);
      total += n * v;
      var nom = (u === '€' && v >= 5) ? (n > 1 ? 'billets' : 'billet') : (n > 1 ? 'pièces' : 'pièce');
      morceaux.push(n + ' ' + nom + ' de ' + v + ' ' + u);
    });
    var texte = 'Tu as ' + (morceaux.length > 1 ? morceaux.slice(0, -1).join(', ') + ' et ' + morceaux[morceaux.length - 1] : morceaux[0]) + '. Combien as-tu en tout ?';
    return question('monnaieSomme', 'monnaie', texte, total, u, 0, { unites: [u], valeurs: vals });
  };

  /* Rendu de monnaie : paye (billet) − prix. centimes:true → prix avec centimes (réponse décimale). */
  GEN.monnaieRendu = function (exo, rng) {
    var paye = pick(rng, exo.paye);
    var prixMax = Math.min(exo.prixMax || paye - 1, paye - 1);
    var prix, rep, dec = 0;
    if (exo.centimes) {
      var cts = pick(rng, [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]);
      prix = ri(rng, 1, Math.max(1, prixMax - 1)) + cts / 100;
      rep = arrondi(paye - prix, 2);
      dec = 2;
    } else {
      prix = ri(rng, 1, prixMax);
      rep = paye - prix;
    }
    var texte = 'Tu paies avec un billet de ' + paye + ' €. L’objet coûte ' + fmt(arrondi(prix, 2)) + ' €. Combien le vendeur te rend-il ?';
    return question('monnaieRendu', 'monnaie', texte, rep, '€', dec, { unites: ['€'], valeurs: [paye, prix] });
  };

  /* Durées et horaires. mode : heures | heure-future | minutes. */
  GEN.dureeEcart = function (exo, rng) {
    var mode = exo.mode;
    var hh = function (h, m) { return h + ' h' + (m !== undefined ? ' ' + (m < 10 ? '0' : '') + m : ''); };
    if (mode === 'heures') {
      var d = ri(rng, 1, exo.maxH || 5), h = ri(rng, 6, 20 - d);
      return question('dureeEcart', 'duree', 'Un film commence à ' + hh(h) + ' et finit à ' + hh(h + d) + '. Combien d’heures dure-t-il ?', d, unitAff('h', d), 0,
        { unites: ['h'], valeurs: [d] });
    }
    if (mode === 'heure-future') {
      var d2 = ri(rng, 1, exo.maxH || 5), h2 = ri(rng, 6, 20 - d2);
      return question('dureeEcart', 'duree', 'Il est ' + hh(h2) + '. Dans ' + d2 + ' h, quelle heure sera-t-il ? (réponds en heures)', h2 + d2, 'h', 0,
        { unites: ['h'], valeurs: [d2] });
    }
    // minutes : début h:m (m multiple de 5), durée d multiple de 5
    var croise = !!exo.croise;
    var debH = ri(rng, 6, 18), debM = 5 * ri(rng, 0, 11), dur;
    if (croise) dur = 5 * ri(rng, Math.ceil((60 - debM) / 5), Math.ceil((60 - debM) / 5) + 12);
    else dur = 5 * ri(rng, 1, Math.max(1, Math.floor((59 - debM) / 5)));
    if (!croise && debM + dur >= 60) { debM = 0; dur = 5 * ri(rng, 1, 11); }
    var fin = debH * 60 + debM + dur;
    var finH = Math.floor(fin / 60), finM = fin % 60;
    return question('dureeEcart', 'duree', 'Un spectacle commence à ' + hh(debH, debM) + ' et finit à ' + hh(finH, finM) + '. Combien de minutes dure-t-il ?', dur, 'min', 0,
      { unites: ['min', 'h'], valeurs: [dur] });
  };

  /* Périmètres. figures : carre | rectangle | triangle | losange | hexagone | cercle. inverse : proba (0..1). */
  GEN.perimetre = function (exo, rng) {
    var f = pick(rng, exo.figures), u = pick(rng, exo.unites);
    var min = exo.min || 1, max = exo.max;
    var inv = !!exo.inverse && rng() < exo.inverse && (f === 'carre' || f === 'rectangle');
    var A = function (n) { return avec(n, u); };
    var meta = function (vals) { return { unites: [u], figure: f, valeurs: vals }; };
    var c, L, l, P;
    if (f === 'carre') {
      c = ri(rng, min, max);
      if (inv) return question('perimetre', 'longueur', 'Un carré a un périmètre de ' + A(4 * c) + '. Combien mesure un côté ?', c, u, 0, meta([c]),
        { figure: { type: 'carre', dims: [1, 1], labels: ['?'] } });
      return question('perimetre', 'longueur', 'Un carré a un côté de ' + A(c) + '. Quel est son périmètre ?', 4 * c, u, 0, meta([c]),
        { figure: { type: 'carre', dims: [1, 1], labels: [A(c)] } });
    }
    if (f === 'rectangle') {
      l = ri(rng, min, Math.max(min, max - 1));
      L = ri(rng, l + 1, Math.max(l + 1, max));
      if (inv) return question('perimetre', 'longueur', 'Un rectangle a un périmètre de ' + A(2 * (L + l)) + ' et une longueur de ' + A(L) + '. Quelle est sa largeur ?', l, u, 0, meta([L]),
        { figure: { type: 'rectangle', dims: [L, l], labels: [A(L), '?'] } });
      return question('perimetre', 'longueur', 'Un rectangle mesure ' + A(L) + ' de long et ' + A(l) + ' de large. Quel est son périmètre ?', 2 * (L + l), u, 0, meta([L, l]),
        { figure: { type: 'rectangle', dims: [L, l], labels: [A(L), A(l)] } });
    }
    if (f === 'triangle') {
      var a = ri(rng, min, max), b = ri(rng, min, max);
      var lo = Math.max(min, Math.abs(a - b) + 1), hi = Math.min(max, a + b - 1);
      if (lo > hi) { b = a; lo = a; hi = a; }
      c = ri(rng, lo, hi);
      return question('perimetre', 'longueur', 'Un triangle a des côtés de ' + A(a) + ', ' + A(b) + ' et ' + A(c) + '. Quel est son périmètre ?', a + b + c, u, 0, meta([a, b, c]),
        { figure: { type: 'triangle', dims: [a, b, c], labels: [A(a), A(b), A(c)] } });
    }
    if (f === 'losange') {
      c = ri(rng, min, max);
      return question('perimetre', 'longueur', 'Un losange a quatre côtés de ' + A(c) + '. Quel est son périmètre ?', 4 * c, u, 0, meta([c]),
        { figure: { type: 'losange', dims: [1, 1], labels: [A(c)] } });
    }
    if (f === 'hexagone') {
      c = ri(rng, min, max);
      return question('perimetre', 'longueur', 'Un hexagone régulier a six côtés de ' + A(c) + '. Quel est son périmètre ?', 6 * c, u, 0, meta([c]));
    }
    // cercle : périmètre = 2 × 3,14 × rayon
    c = ri(rng, min, max);
    return question('perimetre', 'longueur', 'Un cercle a un rayon de ' + A(c) + '. Quel est son périmètre ? (prends 3,14 pour π)', arrondi(2 * 3.14 * c, 2), u, 2, meta([c]),
      { figure: { type: 'cercle', dims: [1, 1], labels: [A(c)] } });
  };

  /* Aires. figures : grille | carre | rectangle | triangle-rectangle. */
  GEN.aire = function (exo, rng) {
    var f = pick(rng, exo.figures);
    var u = pick(rng, exo.unites || ['cm']);
    var u2 = CARRE[u];
    var min = exo.min || 1, max = exo.max;
    var inv = !!exo.inverse && rng() < exo.inverse && f === 'rectangle';
    var A = function (n) { return avec(n, u); };
    var c, L, l;
    if (f === 'grille') {
      l = ri(rng, min, Math.max(min, max - 1));
      L = ri(rng, l + 1, Math.max(l + 1, max));
      return question('aire', 'aire', 'Ce rectangle est quadrillé : ' + L + ' carreaux de long et ' + l + ' de large. Combien de carreaux de 1 ' + u2 + ' contient-il ?', L * l, 'carreaux', 0,
        { unites: [u2], figure: f, valeurs: [L, l] }, { figure: { type: 'grille', dims: [L, l], labels: [String(L), String(l)] } });
    }
    if (f === 'carre') {
      c = ri(rng, min, max);
      return question('aire', 'aire', 'Un carré a un côté de ' + A(c) + '. Quelle est son aire ?', c * c, u2, 0,
        { unites: [u, u2], figure: f, valeurs: [c] }, { figure: { type: 'carre', dims: [1, 1], labels: [A(c)] } });
    }
    if (f === 'rectangle') {
      l = ri(rng, min, Math.max(min, max - 1));
      L = ri(rng, l + 1, Math.max(l + 1, max));
      if (inv) return question('aire', 'aire', 'Un rectangle a une aire de ' + avec(L * l, u2) + ' et une longueur de ' + A(L) + '. Quelle est sa largeur ?', l, u, 0,
        { unites: [u, u2], figure: f, valeurs: [L] }, { figure: { type: 'rectangle', dims: [L, l], labels: [A(L), '?'] } });
      return question('aire', 'aire', 'Un rectangle mesure ' + A(L) + ' de long et ' + A(l) + ' de large. Quelle est son aire ?', L * l, u2, 0,
        { unites: [u, u2], figure: f, valeurs: [L, l] }, { figure: { type: 'rectangle', dims: [L, l], labels: [A(L), A(l)] } });
    }
    // triangle rectangle : aire = base × hauteur ÷ 2 (le produit est pair)
    var base = ri(rng, Math.max(min, 2), max), h = ri(rng, Math.max(min, 2), max);
    if ((base * h) % 2 === 1) { if (h < max) h++; else h--; }
    return question('aire', 'aire', 'Un triangle a un angle droit. Les côtés de l’angle droit mesurent ' + A(base) + ' et ' + A(h) + '. Quelle est son aire ?', base * h / 2, u2, 0,
      { unites: [u, u2], figure: f, valeurs: [base, h] }, { figure: { type: 'triangle-rectangle', dims: [base, h], labels: [A(base), A(h)] } });
  };

  /* Volumes. figures : cube | pave. inverse : proba (pavé : trouver la hauteur). */
  GEN.volume = function (exo, rng) {
    var f = pick(rng, exo.figures), u = pick(rng, exo.unites);
    var u2 = CARRE[u], u3 = CUBE[u];
    var min = exo.min || 1, max = exo.max;
    var A = function (n) { return avec(n, u); };
    var a, L, l, h;
    if (f === 'cube') {
      a = ri(rng, min, max);
      return question('volume', 'volume', 'Un cube a une arête de ' + A(a) + '. Quel est son volume ?', a * a * a, u3, 0,
        { unites: [u, u3], figure: f, valeurs: [a] }, { figure: { type: 'cube', dims: [1, 1, 1], labels: [A(a)] } });
    }
    L = ri(rng, min, max); l = ri(rng, min, max); h = ri(rng, min, max);
    if (exo.inverse && rng() < exo.inverse) {
      return question('volume', 'volume', 'Un pavé droit a un volume de ' + avec(L * l * h, u3) + '. Sa base a une aire de ' + avec(L * l, u2) + '. Quelle est sa hauteur ?', h, u, 0,
        { unites: [u, u2, u3], figure: f, valeurs: [L, l, h] }, { figure: { type: 'pave', dims: [L, l, h], labels: [A(L), A(l), '?'] } });
    }
    return question('volume', 'volume', 'Un pavé droit mesure ' + A(L) + ' de long, ' + A(l) + ' de large et ' + A(h) + ' de haut. Quel est son volume ?', L * l * h, u3, 0,
      { unites: [u, u3], figure: f, valeurs: [L, l, h] }, { figure: { type: 'pave', dims: [L, l, h], labels: [A(L), A(l), A(h)] } });
  };

  /* Proportionnalité. mode : prix | prix-unitaire | recette | tableau. */
  var ARTICLES = [['un', 'cahier', 'cahiers'], ['un', 'stylo', 'stylos'], ['un', 'jouet', 'jouets'], ['une', 'gomme', 'gommes'], ['un', 'livre', 'livres'], ['une', 'bille', 'billes']];
  var RECETTES = [
    { txt: 'de farine', u: 'g', qps: [25, 50, 75, 100] },
    { txt: 'de lait', u: 'cL', qps: [5, 10, 15, 20, 25] },
    { txt: 'de sucre', u: 'g', qps: [10, 20, 25, 30] },
    { txt: 'œufs', u: '', qps: [1] }
  ];
  GEN.proportionnalite = function (exo, rng) {
    var mode = pick(rng, exo.modes);
    var dec = exo.dec || 0, s = Math.pow(10, dec);
    if (mode === 'prix' || mode === 'prix-unitaire') {
      var art = pick(rng, ARTICLES);
      var p = ri(rng, exo.pmin * s, exo.pmax * s) / s;
      var n1 = ri(rng, 2, exo.nmax), n2 = ri(rng, 2, exo.nmax);
      for (var i = 0; i < 20 && n2 === n1; i++) n2 = ri(rng, 2, exo.nmax);
      if (n2 === n1) n2 = n1 < exo.nmax ? n1 + 1 : n1 - 1;
      if (mode === 'prix') {
        return question('proportionnalite', 'monnaie', n1 + ' ' + art[2] + ' coûtent ' + fmt(arrondi(n1 * p, dec)) + ' €. Combien coûtent ' + n2 + ' ' + art[2] + ' ?', arrondi(n2 * p, dec), '€', dec,
          { unites: ['€'], valeurs: [n1, n2], mode: mode });
      }
      return question('proportionnalite', 'monnaie', n1 + ' ' + art[2] + ' coûtent ' + fmt(arrondi(n1 * p, dec)) + ' €. Combien coûte ' + art[0] + ' ' + art[1] + ' ?', arrondi(p, dec), '€', dec,
        { unites: ['€'], valeurs: [n1], mode: mode });
    }
    if (mode === 'recette') {
      var r = pick(rng, RECETTES), qp = pick(rng, r.qps);
      var pers = melanger(exo.personnes, rng);
      var a = pers[0], b = pers[1];
      var qte = function (n) { return n * qp + (r.u ? ' ' + r.u : '') + ' ' + r.txt; };
      return question('proportionnalite', 'recette', 'Pour ' + a + ' personnes, il faut ' + qte(a) + '. Combien en faut-il pour ' + b + ' personnes ?', b * qp, r.u, 0,
        { unites: r.u ? [r.u] : [], valeurs: [a, b], mode: mode });
    }
    // tableau
    var k = ri(rng, 2, exo.kmax), x1 = ri(rng, 1, exo.nmax), x2 = ri(rng, 1, exo.nmax);
    for (var j = 0; j < 20 && x2 === x1; j++) x2 = ri(rng, 1, exo.nmax);
    if (x2 === x1) x2 = x1 < exo.nmax ? x1 + 1 : x1 - 1;
    return question('proportionnalite', 'tableau', 'Tableau de proportionnalité : ' + x1 + ' → ' + x1 * k + ' et ' + x2 + ' → ?', x2 * k, '', 0,
      { unites: [], valeurs: [x1, x2], mode: mode });
  };

  /* Pourcentages. mode : de | reduction | fraction. */
  var FRACTIONS_POURCENT = [[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 10, 10], [1, 5, 20], [1, 100, 1]];
  GEN.pourcentage = function (exo, rng) {
    var mode = pick(rng, exo.modes);
    if (mode === 'fraction') {
      var f = pick(rng, FRACTIONS_POURCENT.filter(function (x) { return exo.pourcentages.indexOf(x[2]) !== -1; }));
      return question('pourcentage', 'pourcentage', 'Quel pourcentage représente la fraction ' + f[0] + '/' + f[1] + ' ?', f[2], '%', 0, { unites: ['%'], valeurs: [f[2]], mode: mode });
    }
    var p = pick(rng, exo.pourcentages);
    var pas = 100 / pgcd(p, 100);
    var B = pas * ri(rng, 1, Math.max(1, Math.floor(exo.baseMax / pas)));
    var part = B * p / 100;
    if (mode === 'reduction') {
      return question('pourcentage', 'pourcentage', 'Un jouet coûte ' + B + ' €. Il est en solde avec ' + p + ' % de réduction. Quel est son nouveau prix ?', B - part, '€', 0,
        { unites: ['€', '%'], valeurs: [B, p], mode: mode });
    }
    return question('pourcentage', 'pourcentage', 'Combien font ' + p + ' % de ' + B + ' ?', part, '', 0, { unites: ['%'], valeurs: [B, p], mode: mode });
  };

  /* Échelles. mode : plan-reel | reel-plan | fraction. */
  GEN.echelle = function (exo, rng) {
    var mode = pick(rng, exo.modes);
    var nMax = exo.nmax || 9;
    if (mode === 'fraction') {
      var r = pick(rng, exo.rapports), n = ri(rng, 1, nMax);
      var u, m;
      if (r % 100000 === 0) { u = 'km'; m = r / 100000; } else if (r % 100 === 0) { u = 'm'; m = r / 100; } else { u = 'cm'; m = r; }
      return question('echelle', 'echelle', 'Sur une carte à l’échelle 1/' + fmt(r) + ', une longueur mesure ' + n + ' cm. Quelle est la longueur réelle ?', n * m, u, 0,
        { unites: ['cm', u], valeurs: [n], rapport: r, mode: mode });
    }
    var e = pick(rng, exo.echelles); // { k, u } : 1 cm sur le plan = k u dans la réalité
    var n2 = ri(rng, 2, nMax);
    var txt = 'Sur un plan, 1 cm représente ' + avec(e.k, e.u) + ' dans la réalité. ';
    if (mode === 'plan-reel') {
      return question('echelle', 'echelle', txt + 'Une longueur mesure ' + n2 + ' cm sur le plan. Quelle est la longueur réelle ?', n2 * e.k, e.u, 0,
        { unites: ['cm', e.u], valeurs: [n2, e.k], mode: mode });
    }
    return question('echelle', 'echelle', txt + 'Une distance réelle est de ' + avec(n2 * e.k, e.u) + '. Combien mesure-t-elle sur le plan ?', n2, 'cm', 0,
      { unites: ['cm', e.u], valeurs: [n2, e.k], mode: mode });
  };

  /* Vitesses. modes : distance | vitesse | temps | minutes. */
  GEN.vitesse = function (exo, rng) {
    var mode = pick(rng, exo.modes);
    var vmin = exo.vmin || 2, vmax = exo.vmax, tmax = exo.tmax || 6;
    if (mode === 'minutes') {
      var m = pick(rng, [15, 30, 45]);
      var v4 = 4 * ri(rng, Math.ceil(vmin / 4), Math.floor(vmax / 4));
      return question('vitesse', 'vitesse', 'Une voiture roule à ' + v4 + ' km/h pendant ' + m + ' min. Quelle distance parcourt-elle ?', v4 * m / 60, 'km', 0,
        { unites: ['km/h', 'min', 'km'], valeurs: [v4, m], mode: mode });
    }
    var v = ri(rng, vmin, vmax), t = ri(rng, 2, tmax);
    if (mode === 'distance') {
      return question('vitesse', 'vitesse', 'Une voiture roule à ' + v + ' km/h pendant ' + t + ' h. Quelle distance parcourt-elle ?', v * t, 'km', 0,
        { unites: ['km/h', 'h', 'km'], valeurs: [v, t], mode: mode });
    }
    if (mode === 'vitesse') {
      return question('vitesse', 'vitesse', 'Un cycliste parcourt ' + v * t + ' km en ' + t + ' h à vitesse constante. Quelle est sa vitesse moyenne ?', v, 'km/h', 0,
        { unites: ['km', 'h', 'km/h'], valeurs: [v, t], mode: mode });
    }
    return question('vitesse', 'vitesse', 'Un train roule à ' + v + ' km/h. Combien d’heures met-il pour parcourir ' + v * t + ' km ?', t, 'h', 0,
      { unites: ['km/h', 'km', 'h'], valeurs: [v, t], mode: mode });
  };

  var TYPES = {
    convertir: GEN.convertir, mixte: GEN.mixte, comparer: GEN.comparer, 'choisir-unite': GEN.choisirUnite,
    probleme: GEN.probleme, 'monnaie-somme': GEN.monnaieSomme, 'monnaie-rendu': GEN.monnaieRendu,
    'duree-ecart': GEN.dureeEcart, perimetre: GEN.perimetre, aire: GEN.aire, volume: GEN.volume,
    proportionnalite: GEN.proportionnalite, pourcentage: GEN.pourcentage, echelle: GEN.echelle, vitesse: GEN.vitesse
  };

  /* ================= API ================= */

  /** Question pour un exo (description issue du programme). */
  function genererExo(exo, rng) {
    var g = TYPES[exo.type];
    if (!g) throw new Error('Type de question inconnu : ' + exo.type);
    return g(exo, rng || Math.random);
  }

  /** Définition d'une mission dans un programme, ou null (absente / hors programme). */
  function definition(programme, mission) {
    var d = programme && programme.grandeurs && programme.grandeurs[mission];
    return d && d.actif !== false && d.niveaux ? d : null;
  }

  /** Exo choisi (pondéré par `poids`) pour un palier donné (1 = premier). */
  function choisirExo(programme, mission, palier, rng) {
    var d = definition(programme, mission);
    if (!d) return null;
    var p = d.niveaux[Math.min(d.niveaux.length, Math.max(1, palier)) - 1];
    var total = p.exos.reduce(function (t, e) { return t + (e.poids || 1); }, 0);
    var x = (rng || Math.random)() * total;
    for (var i = 0; i < p.exos.length; i++) {
      x -= (p.exos[i].poids || 1);
      if (x < 0) return p.exos[i];
    }
    return p.exos[p.exos.length - 1];
  }

  /** Question pour (programme, mission, palier). */
  function generer(programme, mission, palier, rng) {
    rng = rng || Math.random;
    var exo = choisirExo(programme, mission, palier, rng);
    if (!exo) return null;
    var q = genererExo(exo, rng);
    q.palier = palier;
    return q;
  }

  var API = {
    generer: generer, genererExo: genererExo, choisirExo: choisirExo, definition: definition,
    UNITES: UNITES, TYPES: Object.keys(TYPES), fmt: fmt
  };
  root.GenerateurGrandeurs = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
