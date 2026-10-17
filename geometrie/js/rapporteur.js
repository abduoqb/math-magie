/* Mission « Le rapporteur » (geometrie-rapporteur) : mesurer, estimer et tracer des angles.
 * Thèmes (programme) :
 *   estimation     estimer un angle sans rapporteur (30, 60, 90, 120, 150 degrés)
 *   classer        aigu / droit / obtus / plat d'après la mesure en degrés
 *   lecture        lire la mesure d'un angle sur un rapporteur (zéro sur la demi-droite de départ)
 *   verifier-trace dire si un angle tracé a bien la mesure demandée
 *   complementaire deux angles qui forment un angle droit ou plat
 * Un seul sens de graduation est dessiné (0° à droite), comme dans les exercices de lecture guidée. */
(function (root) {
  var B = root.GeoBanque || (typeof require === 'function' ? require('./banque_geo.js') : null);
  var E = B.ENCRE, OR = '#F97316';
  var CX = 50, CY = 74, R = 42;

  function rad(deg) { return deg * Math.PI / 180; }
  function pt(deg, rayon) { return { x: +(CX + rayon * Math.cos(rad(deg))).toFixed(1), y: +(CY - rayon * Math.sin(rad(deg))).toFixed(1) }; }

  function rapporteur(avecGraduations) {
    var d = '<path d="M' + (CX - R) + ' ' + CY + ' A' + R + ' ' + R + ' 0 0 1 ' + (CX + R) + ' ' + CY + ' Z" fill="#BAE6FD" fill-opacity="0.75" stroke="' + E + '" stroke-width="2.5" stroke-linejoin="round"/>';
    if (avecGraduations) {
      for (var a = 0; a <= 180; a += 5) {
        var long = (a % 10 === 0) ? 5 : 2.6, p1 = pt(a, R), p2 = pt(a, R - long);
        d += B.ligne(p1.x, p1.y, p2.x, p2.y, E, a % 10 === 0 ? 1 : 0.7);
        if (a % 10 === 0) { var pt2 = pt(a, R - 9); d += B.texte(pt2.x, (pt2.y + 1.3).toFixed(1), String(a), 3.4); }
      }
    }
    d += '<line x1="4" y1="' + CY + '" x2="96" y2="' + CY + '" stroke="' + E + '" stroke-width="1.5"/>';
    return d;
  }
  function demiDroite(deg, couleur, largeur) {
    var p = pt(deg, 47);
    return B.ligne(CX, CY, p.x, p.y, couleur || OR, largeur || 3);
  }
  function arc(deg1, deg2, rayon, couleur) {
    var a = pt(deg1, rayon), b = pt(deg2, rayon);
    return '<path d="M' + a.x + ' ' + a.y + ' A' + rayon + ' ' + rayon + ' 0 0 0 ' + b.x + ' ' + b.y + '" fill="none" stroke="' + (couleur || '#8B5CF6') + '" stroke-width="2.6" stroke-linecap="round"/>';
  }

  function genLecture(ctx) {
    var r = ctx.rng, pas = ctx.niveau >= 3 ? 5 : (ctx.niveau === 2 ? 10 : 30);
    var nb = Math.floor(170 / pas), t;
    do { t = B.entier(1, nb, r) * pas; } while (t % 10 !== 0 && t % 5 !== 0 || t >= 180);
    var voisins = [t - pas, t + pas, 180 - t, t + 10, t - 10].filter(function (v) { return v > 0 && v < 180; });
    var d = rapporteur(true) + demiDroite(0, E, 2.5) + demiDroite(t) + '<circle cx="' + CX + '" cy="' + CY + '" r="2.6" fill="#E11D48"/>';
    return {
      id: 'lect-' + t, svg: B.svg(d),
      instruction: 'Le zéro est sur la demi-droite de départ. Combien mesure l\'angle orange ? (en degrés)',
      options: B.optionsNombres(t, voisins, 4, r), reponse: String(t)
    };
  }

  function genEstimation(ctx) {
    var r = ctx.rng, base = B.choisir([30, 60, 90, 120, 150], r), jitter = B.entier(-6, 6, r), t = base + jitter;
    var d = '<line x1="14" y1="' + CY + '" x2="86" y2="' + CY + '" stroke="' + E + '" stroke-width="3.5" stroke-linecap="round"/>' +
      demiDroite(t, E, 3.5).replace('stroke-width="3.5"', 'stroke-width="3.5"') + arc(0, t, 14) + '<circle cx="' + CX + '" cy="' + CY + '" r="3" fill="' + OR + '"/>';
    return {
      id: 'est-' + t, svg: B.svg(d),
      instruction: 'Sans rapporteur : quelle est la mesure de cet angle, à peu près ? (en degrés)',
      options: B.optionsNombres(base, [30, 60, 90, 120, 150], 4, r), reponse: String(base)
    };
  }

  function genClasser(ctx) {
    var r = ctx.rng, cas = [
      { t: [B.entier(10, 85, r)], rep: 'aigu' }, { t: [90], rep: 'droit' },
      { t: [B.entier(95, 175, r)], rep: 'obtus' }, { t: [180], rep: 'plat' }
    ];
    var c = B.choisir(ctx.niveau >= 2 ? cas : cas.slice(0, 3), r), t = c.t[0];
    var d = rapporteur(true);
    return {
      id: 'cla-' + t, svg: B.svg(d),
      instruction: 'Un angle mesure ' + t + '°. Cet angle est…',
      options: ctx.niveau >= 2 ? ['aigu', 'droit', 'obtus', 'plat'] : ['aigu', 'droit', 'obtus'], reponse: c.rep
    };
  }

  function genVerifier(ctx) {
    var r = ctx.rng, cible = B.choisir([30, 40, 50, 60, 70, 110, 120, 130, 140], r), bon = r() < 0.5, trace;
    if (bon) trace = cible;
    else trace = B.choisir([cible + 20, cible - 20, 180 - cible, cible + 30].filter(function (v) { return v > 0 && v < 180 && v !== cible; }), r);
    var d = rapporteur(true) + demiDroite(0, E, 2.5) + demiDroite(trace) + '<circle cx="' + CX + '" cy="' + CY + '" r="2.6" fill="#E11D48"/>';
    return {
      id: 'ver-' + cible + '-' + trace, svg: B.svg(d),
      instruction: 'On voulait tracer un angle de ' + cible + '°. L\'angle orange est-il bien tracé ?',
      options: ['Oui', 'Non'], reponse: bon ? 'Oui' : 'Non'
    };
  }

  function genComplementaire(ctx) {
    var r = ctx.rng, total = ctx.niveau >= 3 && r() < 0.5 ? 180 : 90, a = B.entier(1, total / 5 - 1, r) * 5;
    var b = total - a, nomTot = total === 90 ? "un angle droit" : "un angle plat";
    var d = rapporteur(false) + demiDroite(0, E, 2.5) + demiDroite(total, E, 2.5) + demiDroite(a, OR, 3.5) + arc(0, a, 16, '#8B5CF6') + arc(a, total, 24, '#14B8A6');
    return {
      id: 'comp-' + total + '-' + a, svg: B.svg(d),
      instruction: 'Deux angles côte à côte forment ' + nomTot + ' (' + total + '°). L\'un mesure ' + a + '°. Combien mesure l\'autre ? (en degrés)',
      options: B.optionsNombres(b, [a, total - a + 10, total - a - 10, total + a, 180 - a].filter(function (v) { return v !== b; }), 4, r), reponse: String(b)
    };
  }

  var BANQUE = [
    { theme: 'estimation', niveau: 1, gen: genEstimation },
    { theme: 'classer', niveau: 1, gen: genClasser },
    { theme: 'lecture', niveau: 1, gen: genLecture },
    { theme: 'verifier-trace', niveau: 2, gen: genVerifier },
    { theme: 'complementaire', niveau: 3, gen: genComplementaire }
  ];

  var API = { BANQUE: BANQUE, config: B.creerConfig('geometrie-rapporteur', BANQUE) };
  root.GeoRapporteur = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document !== 'undefined' && typeof MoteurGeometrie !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { new MoteurGeometrie(API.config); });
  }
})(typeof window !== 'undefined' ? window : globalThis);
