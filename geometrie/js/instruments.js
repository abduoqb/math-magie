/* Mission « Les instruments » (geometrie-instruments) : règle, équerre, compas, rapporteur.
 * Thèmes (programme) :
 *   regle-trait       CP   choisir la règle pour tracer un trait droit / mesurer
 *   choix-instrument  CE1+ reconnaître un instrument, choisir celui qui sert à une tâche
 *   regle-lecture     CP+  lire une longueur en cm sur une règle graduée
 * `contenu.instruments` limite les instruments dessinés, nommés et proposés (ex. CP : règle ;
 * CE1 : + équerre, compas ; rapporteur seulement quand le programme l'autorise). */
(function (root) {
  var B = root.GeoBanque || (typeof require === 'function' ? require('./banque_geo.js') : null);
  var E = B.ENCRE;
  var TOUS = ['règle', 'équerre', 'compas', 'rapporteur'];

  function autorises(ctx) { return (ctx.liste('instruments') || TOUS).filter(function (n) { return TOUS.indexOf(n) >= 0; }); }

  var TACHES = {
    'règle': ['tracer un trait droit', 'tracer une droite qui passe par deux points', 'mesurer la longueur d\'un segment'],
    'équerre': ['vérifier qu\'un angle est un angle droit', 'tracer un angle droit'],
    'compas': ['tracer un cercle', 'tracer un cercle de rayon donné'],
    'rapporteur': ['mesurer un angle en degrés', 'tracer un angle de 50°']
  };

  // Dessins des instruments (boîte 100 x 100)
  function dessinInstrument(nom) {
    var i, d;
    if (nom === 'règle') {
      d = '<rect x="6" y="36" width="88" height="28" rx="3" fill="#FDE68A" stroke="' + E + '" stroke-width="3.5"/>';
      for (i = 1; i < 10; i++) d += B.ligne(6 + i * 8.8, 36, 6 + i * 8.8, i % 5 === 0 ? 50 : 44, E, 2);
      return d;
    }
    if (nom === 'équerre') {
      return '<polygon points="14,86 14,14 86,86" fill="#A7F3D0" fill-opacity="0.85" stroke="' + E + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<polygon points="28,74 28,44 58,74" fill="#fff" stroke="' + E + '" stroke-width="2.5" stroke-linejoin="round"/>';
    }
    if (nom === 'compas') {
      return '<circle cx="50" cy="14" r="5" fill="#FACC15" stroke="' + E + '" stroke-width="3"/>' +
        '<path d="M50 18 L30 82 M50 18 L72 74" stroke="' + E + '" stroke-width="5" stroke-linecap="round" fill="none"/>' +
        '<path d="M30 82 L28 92" stroke="#64748B" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M72 74 L74 88" stroke="#F97316" stroke-width="5" stroke-linecap="round"/>';
    }
    d = '<path d="M8 76 A42 42 0 0 1 92 76 Z" fill="#BAE6FD" fill-opacity="0.85" stroke="' + E + '" stroke-width="3.5" stroke-linejoin="round"/>';
    for (i = 1; i < 18; i++) {
      var a = i * 10 * Math.PI / 180, r2 = (i % 3 === 0) ? 33 : 37;
      d += B.ligne((50 + 42 * Math.cos(a)).toFixed(1), (76 - 42 * Math.sin(a)).toFixed(1), (50 + r2 * Math.cos(a)).toFixed(1), (76 - r2 * Math.sin(a)).toFixed(1), E, 1.6);
    }
    return d + '<circle cx="50" cy="76" r="3" fill="' + E + '"/>';
  }

  function rangee(noms, etiquettes) {
    var n = noms.length, sc = n === 1 ? 0.7 : (n === 2 ? 0.45 : (n === 3 ? 0.3 : 0.22)), d = '';
    noms.forEach(function (nom, i) {
      var cx = (i + 0.5) * 100 / n, x = cx - 50 * sc, y = 22;
      d += '<g transform="translate(' + x.toFixed(1) + ' ' + y + ') scale(' + sc + ')">' + dessinInstrument(nom) + '</g>';
      if (etiquettes) d += B.texte(cx.toFixed(1), (y + 100 * sc + 10).toFixed(1), nom, n >= 4 ? 4.6 : 6);
    });
    return d;
  }

  function genReglTrait(ctx) {
    var r = ctx.rng;
    if (autorises(ctx).indexOf('règle') < 0) return null;
    var forme = B.entier(0, 1, r);
    var feuille = '<rect x="8" y="14" width="84" height="72" rx="4" fill="#fff" stroke="' + E + '" stroke-width="3"/>' +
      '<circle cx="26" cy="66" r="4" fill="#E11D48"/><circle cx="74" cy="38" r="4" fill="#E11D48"/>' +
      B.texte(26, 80, 'A', 7) + B.texte(74, 32, 'B', 7);
    if (forme === 0) {
      return {
        id: 'regle-trait', svg: B.svg(feuille),
        instruction: 'Je veux relier A et B avec un trait bien droit. Je prends…', instructionCP: 'Pour un trait droit, je prends…',
        options: B.melanger(['la règle', 'la gomme', 'les ciseaux', 'la colle'], r), reponse: 'la règle'
      };
    }
    return {
      id: 'regle-mesure', svg: B.svg(rangee(['règle'], false)),
      instruction: 'Avec quoi mesure-t-on en centimètres ?', instructionCP: 'Avec quoi mesure-t-on ?',
      options: B.melanger(['la règle', 'la gomme', 'les ciseaux', 'la colle'], r), reponse: 'la règle'
    };
  }

  function genChoix(ctx) {
    var r = ctx.rng, ok = autorises(ctx);
    if (ok.length < 2) return null;
    if (ctx.niveau === 1 || B.alea(r)() < 0.35) { // « Comment s'appelle cet instrument ? »
      var nom = B.choisir(ok, r);
      return { id: 'instr-nom-' + nom, svg: B.svg(rangee([nom], false)), instruction: "Comment s'appelle cet instrument ?", options: B.melanger(ok, r), reponse: nom };
    }
    var cible = B.choisir(ok, r), tache = B.choisir(TACHES[cible], r);
    return {
      id: 'instr-tache-' + cible + tache, svg: B.svg(rangee(ok, true)),
      instruction: 'Quel instrument faut-il pour ' + tache + ' ?', options: B.melanger(ok, r), reponse: cible
    };
  }

  function genLecture(ctx) {
    var r = ctx.rng;
    if (autorises(ctx).indexOf('règle') < 0) return null;
    var N = ctx.indexClasse <= 1 ? 10 : 15;
    var a = (ctx.indexClasse === 0 || ctx.niveau < 2) ? 0 : B.entier(1, 3, r);
    var L = B.entier(2, N - a - (a > 0 ? 1 : 0), r);
    if (L > N - a) L = N - a;
    var x0 = 8, u = 84 / N, d = '';
    d += '<rect x="4" y="58" width="92" height="26" rx="3" fill="#FDE68A" stroke="' + E + '" stroke-width="3"/>';
    for (var i = 0; i <= N; i++) {
      d += B.ligne((x0 + i * u).toFixed(1), 58, (x0 + i * u).toFixed(1), 66, E, 1.6);
      d += B.texte((x0 + i * u).toFixed(1), 78, String(i), N > 10 ? 3.8 : 5);
    }
    var xa = (x0 + a * u).toFixed(1), xb = (x0 + (a + L) * u).toFixed(1);
    d += B.ligne(xa, 40, xb, 40, '#F97316', 4.5);
    d += '<circle cx="' + xa + '" cy="40" r="2.6" fill="' + E + '"/><circle cx="' + xb + '" cy="40" r="2.6" fill="' + E + '"/>';
    d += B.ligne(xa, 40, xa, 58, '#94A3B8', 1.2, ' stroke-dasharray="2 2"') + B.ligne(xb, 40, xb, 58, '#94A3B8', 1.2, ' stroke-dasharray="2 2"');
    var voisins = [L - 1, L + 1, a + L, L + 2, L - 2];
    return {
      id: 'lecture-' + a + '-' + L + '-' + N, svg: B.svg(d),
      instruction: 'Combien mesure le segment orange ? (en cm)', instructionCP: 'Combien de cm mesure le trait orange ?',
      options: B.optionsNombres(L, voisins, 4, r), reponse: String(L)
    };
  }

  var BANQUE = [
    { theme: 'regle-trait', niveau: 1, gen: genReglTrait },
    { theme: 'choix-instrument', niveau: 1, gen: genChoix },
    { theme: 'regle-lecture', niveau: 1, gen: genLecture }
  ];

  var API = { BANQUE: BANQUE, TACHES: TACHES, TOUS: TOUS, config: B.creerConfig('geometrie-instruments', BANQUE) };
  root.GeoInstruments = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document !== 'undefined' && typeof MoteurGeometrie !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { new MoteurGeometrie(API.config); });
  }
})(typeof window !== 'undefined' ? window : globalThis);
