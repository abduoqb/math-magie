/* L’Horloge Enchantée : générateur pur des manches (lecture, réglage, durées).
   Aucune dépendance au DOM. Exporté aussi pour Node (tests).
   Temps en minutes : « t » vaut 0..719 sur une horloge à aiguilles (t = 60 × heure + minutes). */
(function (root) {
  'use strict';

  var NB_MANCHES = 8;
  var SEUIL_VICTOIRE = 5;
  var DEMI_JOUR = 720;
  var NOMS_DIFFICULTE = ['Petite Magie', 'Grande Magie', 'Maître Magicien'];

  /* ---------- Outils ---------- */
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(rng, tab) { return tab[Math.floor(rng() * tab.length)]; }
  function melanger(tab, rng) {
    var t = tab.slice();
    for (var i = t.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var x = t[i]; t[i] = t[j]; t[j] = x;
    }
    return t;
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function mod(a, n) { return ((a % n) + n) % n; }
  function plage(a, b, pas) { var r = []; for (var x = a; x <= b; x += pas) r.push(x); return r; }
  function decimal(x) { return String(+x.toFixed(2)).replace('.', ','); }

  var M5 = plage(0, 55, 5);
  var M60 = plage(0, 59, 1);

  /* ---------- Réglages par classe et difficulté ---------- */
  var SEQ_LR = ['lire', 'regler', 'lire', 'regler', 'lire', 'regler', 'lire', 'regler'];
  var SEQUENCES = {
    cp: SEQ_LR,
    ce1: SEQ_LR,
    ce2: ['lire', 'regler', 'duree', 'lire', 'duree', 'regler', 'lire', 'duree'],
    cm1: ['lire', 'duree', 'regler', 'duree', 'lire', 'duree', 'regler', 'duree'],
    cm2: ['duree', 'lire', 'duree', 'regler', 'duree', 'lire', 'duree', 'regler']
  };

  /* fmt : 'cp' (3 heures et demie), 'quart' (3 h et quart), 'num' (3 h 15)
     mins : minutes possibles ; mins5 : proba de se limiter aux multiples de 5 ; pm : proba d’une heure en 24 h
     pas : boutons de minutes ; chiffres : 'tous' ou 'quatre' ; aide : légende des aiguilles
     duree : pas / min / max (en minutes) ; kinds : sortes de manches « durée » */
  var REGLAGES = {
    cp: [
      { desc: 'Les heures pile', fmt: 'cp', mins: [0], pm: 0, pas: [], chiffres: 'tous', aide: true, kinds: [] },
      { desc: 'Pile et demi-heure', fmt: 'cp', mins: [0, 30], pm: 0, pas: [30], chiffres: 'tous', aide: true, kinds: [] },
      { desc: 'Midi, minuit, demies', fmt: 'cp', mins: [0, 30], pm: 0, pas: [30], chiffres: 'tous', aide: false, kinds: [] }
    ],
    ce1: [
      { desc: 'Pile et demies', fmt: 'quart', mins: [0, 30], pm: 0, pas: [30], chiffres: 'tous', aide: true, kinds: [] },
      { desc: 'Avec les quarts', fmt: 'quart', mins: [0, 15, 30, 45], pm: 0, pas: [15], chiffres: 'tous', aide: false, kinds: [] },
      { desc: 'Quarts et 24 heures', fmt: 'quart', mins: [0, 15, 30, 45], pm: 0.4, minsPm: [0, 30], pas: [15], chiffres: 'tous', aide: false, kinds: [] }
    ],
    ce2: [
      { desc: 'Par 5 minutes', fmt: 'num', mins: M5, pm: 0, pas: [5], chiffres: 'tous', aide: false,
        duree: { pas: 30, min: 30, max: 240 }, kinds: ['ecoule', 'dans'] },
      { desc: 'Minute près, durées', fmt: 'num', mins: M60, mins5: 0.55, pm: 0, pas: [5, 1], chiffres: 'tous', aide: false,
        duree: { pas: 15, min: 15, max: 150 }, kinds: ['ecoule', 'dans'] },
      { desc: '24 heures et durées', fmt: 'num', mins: M60, mins5: 0.3, pm: 0.35, pas: [5, 1], chiffres: 'quatre', aide: false,
        duree: { pas: 5, min: 15, max: 180 }, kinds: ['ecoule', 'dans', 'conv24'] }
    ],
    cm1: [
      { desc: 'Durées entre deux heures', fmt: 'num', mins: M5, pm: 0.2, pas: [5, 1], chiffres: 'tous', aide: false,
        duree: { pas: 15, min: 30, max: 180 }, kinds: ['ecoule', 'dans', 'conv24'] },
      { desc: 'Heures et minutes, trains', fmt: 'num', mins: M60, mins5: 0.5, pm: 0.3, pas: [5, 1], chiffres: 'tous', aide: false,
        duree: { pas: 5, min: 20, max: 240 }, conv: { hMax: 3, mPas: 15 }, kinds: ['ecoule', 'conv_h', 'train', 'conv24'] },
      { desc: 'Durées et conversions', fmt: 'num', mins: M60, mins5: 0.3, pm: 0.35, pas: [5, 1], chiffres: 'quatre', aide: false,
        duree: { pas: 5, min: 20, max: 360 }, conv: { hMax: 5, mPas: 5 }, kinds: ['ecoule', 'train', 'conv_h', 'conv_min'] }
    ],
    cm2: [
      { desc: 'Durées plus longues', fmt: 'num', mins: M60, mins5: 0.5, pm: 0.3, pas: [5, 1], chiffres: 'tous', aide: false,
        duree: { pas: 5, min: 30, max: 360 }, conv: { hMax: 6, mPas: 5 }, fracs: [15, 30, 45], kinds: ['ecoule', 'train', 'conv_min', 'fraction'] },
      { desc: 'Fractions et décimaux', fmt: 'num', mins: M60, mins5: 0.3, pm: 0.35, pas: [5, 1], chiffres: 'quatre', aide: false,
        duree: { pas: 5, min: 30, max: 480 }, conv: { hMax: 6, mPas: 5 }, fracs: [15, 20, 30, 40, 45], decs: 3,
        kinds: ['fraction', 'decimal', 'train', 'ecoule', 'conv_min'] },
      { desc: 'Tout mélanger', fmt: 'num', mins: M60, mins5: 0.2, pm: 0.4, pas: [5, 1], chiffres: 'quatre', aide: false,
        duree: { pas: 5, min: 45, max: 600 }, conv: { hMax: 8, mPas: 1 }, fracs: null, decs: 8,
        kinds: ['decimal', 'fraction', 'depart', 'ecoule', 'conv_min'] }
    ]
  };
  var FRACTIONS = [
    { min: 6, f: '1/10' }, { min: 12, f: '1/5' }, { min: 15, f: '1/4' }, { min: 20, f: '1/3' }, { min: 24, f: '2/5' },
    { min: 30, f: '1/2' }, { min: 36, f: '3/5' }, { min: 40, f: '2/3' }, { min: 45, f: '3/4' }, { min: 48, f: '4/5' }
  ];
  var DECIMAUX = [
    { r: 30, ds: '5' }, { r: 15, ds: '25' }, { r: 45, ds: '75' }, { r: 12, ds: '2' },
    { r: 24, ds: '4' }, { r: 36, ds: '6' }, { r: 48, ds: '8' }, { r: 6, ds: '1' }
  ];
  var SCENES = ['Le spectacle de magie', 'Le cours de potions', 'Le duel de sorciers', 'Le vol en balai', 'La sieste du dragon', 'Le bal des fées'];

  function reglages(niveau, d) {
    var l = REGLAGES[niveau] || REGLAGES.ce2;
    return l[Math.max(0, Math.min(2, d | 0))];
  }
  function difficultes(niveau) {
    return REGLAGES[niveau].map(function (r, i) { return { nom: NOMS_DIFFICULTE[i], desc: r.desc }; });
  }

  /* ---------- Écriture des heures ---------- */
  /** h24 : 0..23 ; m : minutes ; fmt : 'cp' | 'quart' | 'num12' | 'num24' ; nom : autorise « midi » / « minuit ». */
  function texteHeure(h24, m, fmt, nom) {
    if (fmt === 'num24') return h24 + ' h' + (m ? ' ' + pad2(m) : '');
    if (fmt === 'num12') return (h24 % 12 || 12) + ' h' + (m ? ' ' + pad2(m) : '');
    var long = fmt === 'cp';
    function lib(hh, forcerLong) {
      if (nom && hh === 12) return { t: 'midi', mot: true };
      if (nom && hh === 0) return { t: 'minuit', mot: true };
      var n = hh % 12 || 12;
      if (long || forcerLong) return { t: n + (n > 1 ? ' heures' : ' heure'), mot: false };
      return { t: n + ' h', mot: false };
    }
    if (m === 0) return lib(h24, true).t;
    if (m === 15) return lib(h24).t + ' et quart';
    if (m === 30) { var b = lib(h24); return b.t + (b.mot ? ' et demi' : ' et demie'); }
    if (m === 45) return lib((h24 + 1) % 24).t + ' moins le quart';
    throw new Error('minutes non littérales : ' + m);
  }
  function fmtDuree(T) {
    if (T < 60) return T + ' min';
    if (T % 60 === 0) return (T / 60) + ' h';
    return Math.floor(T / 60) + ' h ' + pad2(T % 60) + ' min';
  }
  function texteT(t, fmt) { return texteHeure(Math.floor(t / 60), t % 60, fmt, false); }

  /* ---------- Aiguilles ---------- */
  function anglesAiguilles(t) {
    t = mod(t, DEMI_JOUR);
    return { heure: t / 2, minute: (t % 60) * 6 };
  }
  /** Nouvelle heure t quand on touche le cadran : zone 'heure' (près du centre) ou 'minute'. */
  function reglerParAngle(t, angle, zone, pasMin) {
    t = mod(t, DEMI_JOUR);
    angle = mod(angle, 360);
    if (zone === 'heure') return (Math.round(angle / 30) % 12) * 60 + (t % 60);
    if (!pasMin) return t;
    var m = mod(Math.round(angle / 6 / pasMin) * pasMin, 60);
    var base = Math.floor(t / 60) * 60;
    var meilleur = base + m, dMin = 1e9;
    [base + m - 60, base + m, base + m + 60].forEach(function (c) {
      var ecart = Math.abs(mod(c, DEMI_JOUR) - t);
      ecart = Math.min(ecart, DEMI_JOUR - ecart);
      if (ecart < dMin) { dMin = ecart; meilleur = mod(c, DEMI_JOUR); }
    });
    return meilleur;
  }
  function indiceRegler(t, cible) {
    t = mod(t, DEMI_JOUR); cible = mod(cible, DEMI_JOUR);
    var mc = cible % 60;
    if (t % 60 !== mc) {
      if (mc === 0) return 'La grande aiguille doit être tout en haut, sur le 12.';
      if (mc % 5 === 0) return 'La grande aiguille doit être sur le ' + (mc / 5) + ' (' + mc + ' minutes).';
      return 'La grande aiguille doit montrer ' + mc + ' minutes : compte les petits traits.';
    }
    var hc = Math.floor(cible / 60) || 12;
    return mc === 0 ? 'La petite aiguille doit être sur le ' + hc + '.' : 'La petite aiguille doit avoir passé le ' + hc + '.';
  }
  function indiceLecture(h12, m, niveau) {
    var g;
    if (m % 5 === 0) {
      g = m === 0 ? 'La grande aiguille est sur le 12.' : 'La grande aiguille est sur le ' + (m / 5) + (niveau === 'cp' ? '.' : ' : ça fait ' + m + ' minutes.');
    } else {
      g = 'La grande aiguille est après le ' + Math.floor(m / 5) + ' : compte les petits traits.';
    }
    var p = m === 0 ? 'La petite aiguille est sur le ' + h12 + '.' : 'La petite aiguille a passé le ' + h12 + '.';
    return p + ' ' + g;
  }

  /* ---------- Fabrique de choix ---------- */
  function construireChoix(bonneTxt, candidats, rng, remplir) {
    var vus = {}; vus[bonneTxt] = true;
    var autres = [];
    melanger(candidats, rng).forEach(function (t) {
      if (t && !vus[t] && autres.length < 3) { vus[t] = true; autres.push(t); }
    });
    var essais = 0;
    while (autres.length < 3 && essais++ < 400) {
      var t = remplir(rng);
      if (t && !vus[t]) { vus[t] = true; autres.push(t); }
    }
    if (autres.length < 3) throw new Error('pas assez de distracteurs pour ' + bonneTxt);
    var choix = melanger([bonneTxt].concat(autres), rng);
    return { choix: choix, bonne: choix.indexOf(bonneTxt) };
  }

  /* ---------- 1) Quelle heure est-il ? ---------- */
  function tirerMinutes(r, pool, rng) {
    if (pool) return pick(rng, pool);
    if (r.mins5 && rng() < r.mins5) return pick(rng, M5);
    return pick(rng, r.mins);
  }
  function genLire(niveau, d, rng) {
    var r = reglages(niveau, d);
    var pm = !!(r.pm && rng() < r.pm);
    var m = tirerMinutes(r, pm && r.minsPm ? r.minsPm : null, rng);
    var h12 = ri(rng, 1, 12);
    var permis = pm && r.minsPm ? r.minsPm : r.mins;
    function txt(h, mm) {
      if (pm) return texteHeure(h === 12 ? 12 : h + 12, mm, 'num24', false);
      return texteHeure(h, mm, r.fmt === 'num' ? 'num12' : r.fmt, false);
    }
    var suiv = h12 % 12 + 1, prec = (h12 + 10) % 12 + 1;
    var cands = [[suiv, m], [prec, m]];
    if (m % 5 === 0) cands.push([m / 5 || 12, (h12 % 12) * 5]);
    if (m !== 0) cands.push([h12, 60 - m]);
    var i = permis.indexOf(m);
    [-2, -1, 1, 2].forEach(function (k) { if (permis[i + k] !== undefined) cands.push([h12, permis[i + k]]); });
    if (permis.indexOf(m + 1) >= 0) cands.push([h12, m + 1]);
    if (permis.indexOf(m - 1) >= 0) cands.push([h12, m - 1]);
    var textes = cands.filter(function (c) { return permis.indexOf(c[1]) >= 0 && !(c[0] === h12 && c[1] === m); })
      .map(function (c) { return txt(c[0], c[1]); });
    var bonneTxt = txt(h12, m);
    var ch = construireChoix(bonneTxt, textes, rng, function (g) { return txt(ri(g, 1, 12), pick(g, permis)); });
    var contexte = '';
    if (pm) contexte = (h12 === 12 || h12 + 12 < 18) ? 'C’est l’après-midi : écris l’heure avec les 24 heures.' : 'C’est le soir : écris l’heure avec les 24 heures.';
    return {
      type: 'lire', kind: 'lire', niveau: niveau, diff: d,
      consigne: 'Quelle heure est-il ?', enonce: contexte,
      voix: 'Quelle heure est-il ?',
      horloge: { t: (h12 % 12) * 60 + m }, chiffres: r.chiffres, aide: r.aide,
      choix: ch.choix, bonne: ch.bonne,
      indice: indiceLecture(h12, m, niveau),
      donnees: { h12: h12, m: m, pm: pm },
      cle: 'lire|' + h12 + '|' + m + '|' + pm
    };
  }

  /* ---------- 2) Règle l’horloge ---------- */
  function genRegler(niveau, d, rng) {
    var r = reglages(niveau, d);
    var pm = !!(r.pm && rng() < r.pm);
    var m = tirerMinutes(r, pm && r.minsPm ? r.minsPm : null, rng);
    var h12 = ri(rng, 1, 12);
    var h24, texte;
    if (pm) { h24 = h12 === 12 ? 12 : h12 + 12; texte = texteHeure(h24, m, 'num24', false); }
    else if (r.fmt === 'num') { h24 = h12; texte = texteHeure(h24, m, 'num12', false); }
    else {
      h24 = h12 === 12 ? (rng() < 0.5 ? 12 : 0) : h12;
      texte = texteHeure(h24, m, r.fmt, true);
    }
    var cible = (h12 % 12) * 60 + m;
    var t0 = ri(rng, 0, 11) * 60;
    if (r.pas.length && rng() < 0.4) {
      var p = Math.min.apply(null, r.pas); // départ atteignable avec les boutons de minutes
      t0 += pick(rng, plage(0, 60 - p, p));
    }
    t0 = mod(t0, DEMI_JOUR);
    if (t0 === cible) t0 = mod(t0 + 180, DEMI_JOUR);
    return {
      type: 'regler', kind: 'regler', niveau: niveau, diff: d,
      consigne: 'Règle l’horloge sur ' + texte + '.', enonce: '',
      voix: 'Règle l’horloge sur ' + texte + '.',
      horloge: { t: t0 }, cible: { t: cible }, pas: r.pas.slice(), chiffres: r.chiffres, aide: r.aide,
      texteCible: texte, indice: '',
      donnees: { h24: h24, m: m, pm: pm, h12: h12 },
      cle: 'regler|' + h12 + '|' + m + '|' + pm
    };
  }

  /* ---------- 3) Durées et calculs sur le temps ---------- */
  function bornesJournee(niveau) {
    return (niveau === 'cm1' || niveau === 'cm2') ? [6 * 60, 22 * 60] : [60, 12 * 60];
  }
  function enonceHeure(niveau, t) {
    return niveau === 'ce2' ? texteT(t, 'num12') : texteT(t, 'num24');
  }
  function genEcoule(niveau, d, rng) {
    var r = reglages(niveau, d), dd = r.duree, b = bornesJournee(niveau);
    var D = ri(rng, dd.min / dd.pas, dd.max / dd.pas) * dd.pas;
    var s = b[0] + ri(rng, 0, Math.floor((b[1] - D - b[0]) / dd.pas)) * dd.pas;
    var e = s + D;
    var naif = Math.abs(Math.floor(e / 60) - Math.floor(s / 60)) * 60 + Math.abs(e % 60 - s % 60);
    var c = [D + dd.pas, D - dd.pas, D + 60, D - 60, D + 10, D - 10, D + 15, D - 15, D + 5, D - 5, D + 30, D - 30, D + 40, naif]
      .filter(function (x) { return x > 0 && x !== D && x <= 900; }).map(fmtDuree);
    var ch = construireChoix(fmtDuree(D), c, rng, function (g) { return fmtDuree(D + ri(g, -8, 8) * 5); });
    var phrase = pick(rng, SCENES) + ' commence à ' + enonceHeure(niveau, s) + ' et finit à ' + enonceHeure(niveau, e) + '. Combien de temps cela dure-t-il ?';
    return {
      type: 'duree', kind: 'ecoule', niveau: niveau, diff: d,
      consigne: 'Combien de temps ?', enonce: phrase, voix: phrase,
      horloge: null, choix: ch.choix, bonne: ch.bonne,
      indice: 'Compte d’abord les heures qui passent, puis les minutes qui restent.',
      donnees: { debut: s, fin: e, duree: D },
      cle: 'ecoule|' + s + '|' + D
    };
  }
  function genDans(niveau, d, rng) {
    var r = reglages(niveau, d), dd = r.duree;
    var X = ri(rng, Math.ceil(dd.min / dd.pas), Math.floor(Math.min(dd.max, 180) / dd.pas)) * dd.pas;
    var s = ri(rng, 0, DEMI_JOUR / dd.pas - 1) * dd.pas;
    var fin = mod(s + X, DEMI_JOUR);
    function tx(t) { return texteHeure(Math.floor(mod(t, DEMI_JOUR) / 60), mod(t, DEMI_JOUR) % 60, 'num12', false); }
    var sansRetenue = Math.floor(s / 60) * 60 + (s % 60 + X) % 60;
    var c = [fin + dd.pas, fin - dd.pas, fin + 5, fin - 5, fin + 10, fin - 10, fin + 15, fin - 15, fin + 60, fin - 60, fin + 40, sansRetenue]
      .map(function (t) { return mod(t, DEMI_JOUR); }).filter(function (t) { return t !== fin; }).map(tx);
    var ch = construireChoix(tx(fin), c, rng, function (g) { return tx(fin + ri(g, -12, 12) * 5); });
    var phrase = 'Regarde l’horloge. Dans ' + fmtDuree(X).replace(' min', ' minutes').replace(/^1 h$/, '1 heure').replace(/^(\d+) h$/, '$1 heures') + ', quelle heure sera-t-il ?';
    return {
      type: 'duree', kind: 'dans', niveau: niveau, diff: d,
      consigne: 'Dans ' + fmtDuree(X) + ', il sera…', enonce: phrase, voix: phrase,
      horloge: { t: s }, chiffres: r.chiffres, aide: false, choix: ch.choix, bonne: ch.bonne,
      indice: 'Ajoute les minutes à l’heure de l’horloge. Au-delà de 60 minutes, on passe à l’heure suivante !',
      donnees: { debut: s, delta: X, fin: fin },
      cle: 'dans|' + s + '|' + X
    };
  }
  function genConv24(niveau, d, rng) {
    var r = reglages(niveau, d);
    var h24 = ri(rng, 13, 23), h12 = h24 - 12;
    var m = rng() < 0.5 ? pick(rng, M5) : pick(rng, r.mins);
    var per = h24 < 18 ? 'de l’après-midi' : 'du soir';
    var autrePer = h24 < 18 ? 'du soir' : 'de l’après-midi';
    function t12(h, mm, p) { return texteHeure(h, mm, 'num12', false) + ' ' + p; }
    function t24(h, mm) { return texteHeure(h, mm, 'num24', false); }
    var sens = rng() < 0.5 ? 'a' : 'b', bonne, c, phrase, remplir;
    if (sens === 'a') {
      bonne = t12(h12, m, per);
      c = [t12(h12 + 1, m, per), h12 > 1 ? t12(h12 - 1, m, per) : null, t12(h12, m, 'du matin'), t12(h12, m, autrePer)];
      if (m + 5 < 60) c.push(t12(h12, m + 5, per));
      if (m >= 5) c.push(t12(h12, m - 5, per));
      remplir = function (g) { return t12(ri(g, 1, 11), pick(g, M5), pick(g, [per, autrePer, 'du matin'])); };
      phrase = 'Il est ' + t24(h24, m) + '. Comment peut-on aussi le dire ?';
    } else {
      bonne = t24(h24, m);
      c = [t24(h24 + 1 > 23 ? h24 - 2 : h24 + 1, m), t24(h24 - 1, m), t24(h12, m), h12 + 10 <= 23 ? t24(h12 + 10, m) : null];
      if (m + 5 < 60) c.push(t24(h24, m + 5));
      if (m >= 5) c.push(t24(h24, m - 5));
      remplir = function (g) { return t24(ri(g, 1, 23), pick(g, M5)); };
      phrase = 'Il est ' + t12(h12, m, per) + '. Comment l’écrire avec les 24 heures ?';
    }
    var ch = construireChoix(bonne, c, rng, remplir);
    return {
      type: 'duree', kind: 'conv24', niveau: niveau, diff: d,
      consigne: sens === 'a' ? 'Une autre façon de le dire' : 'Écris avec 24 heures', enonce: phrase, voix: phrase,
      horloge: null, choix: ch.choix, bonne: ch.bonne,
      indice: 'Dans l’après-midi, on ajoute 12 heures : 2 h de l’après-midi, c’est 14 h.',
      donnees: { h24: h24, m: m, sens: sens },
      cle: 'conv24|' + h24 + '|' + m + '|' + sens
    };
  }
  function genConvH(niveau, d, rng) { // heures-minutes -> minutes
    var cv = reglages(niveau, d).conv || { hMax: 3, mPas: 15 };
    var h = ri(rng, 1, cv.hMax), m = ri(rng, 1, Math.floor(59 / cv.mPas)) * cv.mPas;
    var T = h * 60 + m;
    var c = [h * 100 + m, T + 10, T - 10, T + 20, T - 20, T + 60, T - 60, T + 5, T - 5, h * 10 + m, (h + m)]
      .filter(function (x) { return x > 0 && x !== T; }).map(function (x) { return x + ' min'; });
    var ch = construireChoix(T + ' min', c, rng, function (g) { return (T + ri(g, -9, 9) * 5) + ' min'; });
    var phrase = h + ' h ' + m + ' min, c’est combien de minutes ?';
    return {
      type: 'duree', kind: 'conv_h', niveau: niveau, diff: d,
      consigne: 'Convertis en minutes', enonce: phrase, voix: phrase,
      horloge: null, choix: ch.choix, bonne: ch.bonne,
      indice: '1 heure = 60 minutes. Calcule les minutes des heures, puis ajoute les autres.',
      donnees: { h: h, m: m, total: T },
      cle: 'conv_h|' + T
    };
  }
  function genConvMin(niveau, d, rng) { // minutes -> heures-minutes
    var cv = reglages(niveau, d).conv || { hMax: 4, mPas: 5 };
    var h = ri(rng, 1, cv.hMax), m = ri(rng, 1, Math.floor(59 / cv.mPas)) * cv.mPas;
    var T = h * 60 + m;
    var c = [[h + 1, m], [h - 1, m], [h, mod(m + 10, 60)], [h, mod(m - 10, 60)], [h, mod(m + 5, 60)], [h, mod(m - 5, 60)],
      [Math.floor(T / 100), T % 100], [h + 1, mod(m + 30, 60)], [h, mod(m + 30, 60)]]
      .filter(function (p) { return p[0] >= 0 && p[1] >= 0 && p[1] < 60 && p[0] * 60 + p[1] !== T && p[0] * 60 + p[1] > 0; })
      .map(function (p) { return fmtDuree(p[0] * 60 + p[1]); });
    var ch = construireChoix(fmtDuree(T), c, rng, function (g) { return fmtDuree(ri(g, 1, cv.hMax + 1) * 60 + ri(g, 1, 11) * 5); });
    var phrase = T + ' min, c’est combien en heures et minutes ?';
    return {
      type: 'duree', kind: 'conv_min', niveau: niveau, diff: d,
      consigne: 'Convertis en heures', enonce: phrase, voix: phrase,
      horloge: null, choix: ch.choix, bonne: ch.bonne,
      indice: 'Combien de fois 60 minutes dans ce nombre ? Ce qui reste, ce sont les minutes.',
      donnees: { total: T },
      cle: 'conv_min|' + T
    };
  }
  function genTrain(niveau, d, rng, retour) {
    var r = reglages(niveau, d), dd = r.duree;
    var pas = dd.pas >= 15 ? 15 : 5;
    var D = ri(rng, Math.ceil(Math.max(dd.min, 45) / pas), Math.floor(Math.min(dd.max, 300) / pas)) * pas;
    var a = ri(rng, 6, 18) * 60 + ri(rng, 0, 60 / pas - 1) * pas;
    var b = a + D;
    var cherche = retour ? a : b;
    function tx(t) { return texteT(t, 'num24'); }
    var sansRetenue = retour ? (Math.floor(b / 60) - Math.floor(D / 60)) * 60 + mod(b % 60 - D % 60, 60)
      : (Math.floor(a / 60) + Math.floor(D / 60)) * 60 + (a % 60 + D % 60) % 60;
    var c = [cherche + 5, cherche - 5, cherche + 10, cherche - 10, cherche + 15, cherche - 15, cherche + 20, cherche - 20,
      cherche + 60, cherche - 60, cherche + 40, cherche - 40, sansRetenue]
      .filter(function (t) { return t >= 0 && t < 1440 && t !== cherche; }).map(tx);
    var ch = construireChoix(tx(cherche), c, rng, function (g) { return tx(Math.max(0, Math.min(1439, cherche + ri(g, -12, 12) * 5))); });
    var phrase = retour
      ? 'Le train magique arrive à ' + tx(b) + ' après ' + fmtDuree(D) + ' de trajet. À quelle heure est-il parti ?'
      : 'Le train magique part à ' + tx(a) + '. Il roule pendant ' + fmtDuree(D) + '. À quelle heure arrive-t-il ?';
    return {
      type: 'duree', kind: retour ? 'depart' : 'train', niveau: niveau, diff: d,
      consigne: retour ? 'À quelle heure est-il parti ?' : 'Horaire de train', enonce: phrase, voix: phrase,
      horloge: null, choix: ch.choix, bonne: ch.bonne,
      indice: retour ? 'Recule d’abord des heures, puis des minutes. 1 heure = 60 minutes.'
        : 'Ajoute d’abord les heures, puis les minutes. Quand tu dépasses 60 minutes, ça fait une heure de plus.',
      donnees: { depart: a, duree: D, arrivee: b },
      cle: (retour ? 'depart|' : 'train|') + a + '|' + D
    };
  }
  function genFraction(niveau, d, rng) {
    var r = reglages(niveau, d);
    var utiles = FRACTIONS.filter(function (f) { return !r.fracs || r.fracs.indexOf(f.min) >= 0; });
    var f = pick(rng, utiles);
    var sens = rng() < 0.5 ? 'a' : 'b', ch, phrase;
    var toutes = FRACTIONS.filter(function (g) { return g.min !== f.min; });
    if (sens === 'a') {
      ch = construireChoix(f.f + ' h', toutes.map(function (g) { return g.f + ' h'; }), rng, function () { return null; });
      phrase = f.min + ' minutes, c’est quelle fraction d’une heure ?';
    } else {
      ch = construireChoix(f.min + ' min', toutes.map(function (g) { return g.min + ' min'; }), rng, function () { return null; });
      phrase = f.f + ' d’heure, c’est combien de minutes ?';
    }
    return {
      type: 'duree', kind: 'fraction', niveau: niveau, diff: d,
      consigne: 'Minutes et fractions d’heure', enonce: phrase, voix: phrase,
      horloge: null, choix: ch.choix, bonne: ch.bonne,
      indice: '1 heure = 60 minutes. La moitié, c’est 30 min ; le quart, c’est 15 min.',
      donnees: { min: f.min, f: f.f, sens: sens },
      cle: 'fraction|' + f.min + '|' + sens
    };
  }
  function genDecimal(niveau, d, rng) {
    var r = reglages(niveau, d);
    var f = pick(rng, DECIMAUX.slice(0, r.decs || 3));
    var h = ri(rng, 0, 4);
    var T = h * 60 + f.r;
    var valeur = h + parseFloat('0.' + f.ds);
    var sens = rng() < 0.5 ? 'a' : 'b', ch, phrase;
    if (sens === 'a') {
      var ds = parseInt(f.ds, 10);
      var c = [[h, ds], [h, parseInt(f.ds + '0', 10)], [h, f.r + 15], [h, f.r - 15], [h + 1, f.r], [h, mod(f.r + 10, 60)], [h + 1, mod(f.r + 30, 60)], [Math.max(h - 1, 0), f.r]]
        .filter(function (p) { return p[1] >= 0 && p[1] < 60 && p[0] * 60 + p[1] !== T && p[0] * 60 + p[1] > 0; })
        .map(function (p) { return fmtDuree(p[0] * 60 + p[1]); });
      ch = construireChoix(fmtDuree(T), c, rng, function (g) { return fmtDuree(ri(g, 0, 5) * 60 + ri(g, 1, 11) * 5); });
      phrase = decimal(valeur) + ' h, c’est combien en heures et minutes ?';
    } else {
      var c2 = [h + f.r / 100, h + 0.25, h + 0.5, h + 0.75, h + 0.1, h + 0.2, h + 0.6, valeur + 0.5, valeur - 0.5]
        .filter(function (x) { return x > 0 && x !== Math.floor(x) && Math.abs(x - valeur) > 1e-9; }).map(function (x) { return decimal(x) + ' h'; });
      ch = construireChoix(decimal(valeur) + ' h', c2, rng, function (g) { return decimal(ri(g, 0, 4) + ri(g, 1, 9) / 10) + ' h'; });
      phrase = fmtDuree(T).replace(' min', ' minutes') + ', c’est combien en heures décimales ?';
    }
    return {
      type: 'duree', kind: 'decimal', niveau: niveau, diff: d,
      consigne: 'Heures et décimaux', enonce: phrase, voix: phrase,
      horloge: null, choix: ch.choix, bonne: ch.bonne,
      indice: '0,5 h est la moitié d’une heure : 30 minutes. Et 0,25 h = 15 minutes.',
      donnees: { h: h, r: f.r, ds: f.ds, sens: sens, valeur: valeur },
      cle: 'decimal|' + T + '|' + sens
    };
  }

  var GENERATEURS = {
    ecoule: genEcoule, dans: genDans, conv24: genConv24, conv_h: genConvH, conv_min: genConvMin,
    train: function (n, d, g) { return genTrain(n, d, g, false); },
    depart: function (n, d, g) { return genTrain(n, d, g, true); },
    fraction: genFraction, decimal: genDecimal
  };

  /* ---------- Assemblage ---------- */
  /** Génère une manche : type = 'lire' | 'regler' | 'duree' (kind optionnel pour une durée). */
  function genererManche(niveau, d, type, rng, kind) {
    rng = rng || Math.random;
    if (type === 'lire') return genLire(niveau, d, rng);
    if (type === 'regler') return genRegler(niveau, d, rng);
    var r = reglages(niveau, d);
    if (!r.kinds.length) return genLire(niveau, d, rng);
    return GENERATEURS[kind || pick(rng, r.kinds)](niveau, d, rng);
  }
  /** Une partie : 8 manches qui alternent les types, sans question répétée. */
  function genererPartie(niveau, d, rng) {
    rng = rng || Math.random;
    var seq = SEQUENCES[niveau] || SEQUENCES.ce2;
    var vues = {}, liste = [];
    var derniers = [];
    seq.forEach(function (type) {
      var m, essais = 0;
      do { m = genererManche(niveau, d, type, rng); essais++; }
      while ((vues[m.cle] || (type === 'duree' && derniers.indexOf(m.kind) >= 0 && essais < 12)) && essais < 40);
      vues[m.cle] = true;
      if (type === 'duree') derniers.push(m.kind);
      liste.push(m);
    });
    return liste;
  }
  function etoiles(score) {
    return score >= 8 ? 3 : score >= 6 ? 2 : score >= SEUIL_VICTOIRE ? 1 : 0;
  }

  var API = {
    NB_MANCHES: NB_MANCHES, SEUIL_VICTOIRE: SEUIL_VICTOIRE, NOMS_DIFFICULTE: NOMS_DIFFICULTE,
    REGLAGES: REGLAGES, SEQUENCES: SEQUENCES, FRACTIONS: FRACTIONS, DECIMAUX: DECIMAUX,
    reglages: reglages, difficultes: difficultes,
    texteHeure: texteHeure, fmtDuree: fmtDuree, anglesAiguilles: anglesAiguilles,
    reglerParAngle: reglerParAngle, indiceRegler: indiceRegler,
    genererManche: genererManche, genererPartie: genererPartie, etoiles: etoiles
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.HorlogeMagique = API;
})(typeof window !== 'undefined' ? window : globalThis);
