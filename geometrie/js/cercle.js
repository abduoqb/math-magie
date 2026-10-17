/* Mission « Cercle et compas » (geometrie-cercle).
 * Thèmes (programme) :
 *   vocabulaire    CE1+ centre, rayon (CE1) puis diamètre, corde (`contenu.vocab`)
 *   compas         CE1+ où piquer la pointe, écartement du compas pour un rayon / diamètre donné
 *   rayon-diametre CE2+ passer du rayon au diamètre et inversement
 *   definition     CM1+ le cercle : points à la même distance du centre */
(function (root) {
  var B = root.GeoBanque || (typeof require === 'function' ? require('./banque_geo.js') : null);
  var OR = '#F97316';

  function cercleBase(extra) {
    return '<circle cx="50" cy="50" r="34" fill="#BAE6FD" fill-opacity="0.7" stroke="' + B.ENCRE + '" stroke-width="3.5"/>' + (extra || '');
  }
  function point(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (c || B.ENCRE) + '"/>'; }

  function vocabAutorise(ctx) { return ctx.liste('vocab') || ['centre', 'rayon', 'diamètre', 'corde']; }

  function genVocab(ctx) {
    var voc = vocabAutorise(ctx), r = ctx.rng;
    var nom = B.choisir(voc, r);
    var ang = B.entier(0, 359, r) * Math.PI / 180;
    var cx = 50, cy = 50, R = 34, dessin;
    var px = (cx + R * Math.cos(ang)).toFixed(1), py = (cy + R * Math.sin(ang)).toFixed(1);
    var qx = (cx - R * Math.cos(ang)).toFixed(1), qy = (cy - R * Math.sin(ang)).toFixed(1);
    if (nom === 'centre') dessin = cercleBase(point(cx, cy, 5.5, OR));
    else if (nom === 'rayon') dessin = cercleBase(point(cx, cy, 3) + B.ligne(cx, cy, px, py, OR, 4.5) + point(px, py, 3));
    else if (nom === 'diamètre') dessin = cercleBase(B.ligne(qx, qy, px, py, OR, 4.5) + point(px, py, 3) + point(qx, qy, 3) + point(cx, cy, 2.5));
    else { // corde : segment qui ne passe pas par le centre
      var a1 = ang, a2 = ang + (110 + B.entier(0, 50, r)) * Math.PI / 180;
      dessin = cercleBase(point(cx, cy, 3) +
        B.ligne((cx + R * Math.cos(a1)).toFixed(1), (cy + R * Math.sin(a1)).toFixed(1), (cx + R * Math.cos(a2)).toFixed(1), (cy + R * Math.sin(a2)).toFixed(1), OR, 4.5));
    }
    var opts = voc.slice();
    if (opts.length < 3) opts.push('côté'); // éviter un choix 50/50
    if (opts.length < 3) opts.push('sommet');
    var cible = nom === 'centre' ? 'le point orange' : 'le segment orange';
    return {
      id: 'voc-' + nom + '-' + Math.round(ang * 100), svg: B.svg(dessin),
      instruction: 'Comment s\'appelle ' + cible + ' ?',
      options: B.melanger(B.unique(opts), r), reponse: nom
    };
  }

  function genRayonDiametre(ctx) {
    var r = ctx.rng, vocOk = vocabAutorise(ctx);
    if (vocOk.indexOf('diamètre') < 0) return null;
    var max = ctx.niveau >= 3 ? 25 : (ctx.niveau === 2 ? 12 : 8);
    var vers = B.choisir(['diametre', 'rayon'], r);
    var ray = B.entier(2, max, r), diam = ray * 2;
    var ang = B.entier(0, 359, r) * Math.PI / 180;
    var px = (50 + 34 * Math.cos(ang)).toFixed(1), py = (50 + 34 * Math.sin(ang)).toFixed(1);
    var qx = (50 - 34 * Math.cos(ang)).toFixed(1), qy = (50 - 34 * Math.sin(ang)).toFixed(1);
    var dessin, instr, rep, voisins;
    if (vers === 'diametre') { // on donne le rayon
      dessin = cercleBase(point(50, 50, 3) + B.ligne(50, 50, px, py, OR, 4.5));
      instr = 'Le rayon de ce cercle mesure ' + ray + ' cm. Combien mesure son diamètre (en cm) ?';
      rep = diam; voisins = [ray, ray + 2, diam + 2, diam - 2, ray * 3];
    } else {
      dessin = cercleBase(B.ligne(qx, qy, px, py, OR, 4.5) + point(50, 50, 2.5));
      instr = 'Le diamètre de ce cercle mesure ' + diam + ' cm. Combien mesure son rayon (en cm) ?';
      rep = ray; voisins = [diam, diam * 2, ray + 1, ray - 1, ray + 2];
    }
    return { id: 'rd-' + vers + ray, svg: B.svg(dessin), instruction: instr, options: B.optionsNombres(rep, voisins, 4, r), reponse: String(rep) };
  }

  function compasSvg() {
    var e = B.ENCRE;
    return '<circle cx="50" cy="14" r="5" fill="#FACC15" stroke="' + e + '" stroke-width="3"/>' +
      '<path d="M50 18 L30 82 M50 18 L72 74" stroke="' + e + '" stroke-width="5" stroke-linecap="round" fill="none"/>' +
      '<path d="M30 82 L28 92" stroke="#64748B" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M72 74 L74 88" stroke="#F97316" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M26 94 Q50 100 76 90" fill="none" stroke="#94A3B8" stroke-width="2" stroke-dasharray="3 3"/>';
  }

  function genCompas(ctx) {
    var r = ctx.rng, forme = B.entier(0, ctx.niveau >= 2 && vocabAutorise(ctx).indexOf('diamètre') >= 0 ? 2 : 1, r);
    if (forme === 0) {
      return {
        id: 'compas-pointe', svg: B.svg(compasSvg()),
        instruction: 'Pour tracer un cercle, où pose-t-on la pointe du compas ?',
        options: B.melanger(['sur le centre', 'sur le cercle', 'à côté du cercle'], r), reponse: 'sur le centre'
      };
    }
    if (forme === 1) {
      var ray = B.entier(2, ctx.niveau >= 2 ? 9 : 6, r);
      return {
        id: 'compas-rayon' + ray, svg: B.svg(compasSvg()),
        instruction: 'Je veux tracer un cercle de rayon ' + ray + ' cm. J\'écarte le compas de… (en cm)',
        options: B.optionsNombres(ray, [ray * 2, ray + 1, ray - 1, Math.max(1, ray / 2)].map(Math.round), 4, r), reponse: String(ray)
      };
    }
    var rayon = B.entier(2, 8, r), d = rayon * 2;
    return {
      id: 'compas-diametre' + d, svg: B.svg(compasSvg()),
      instruction: 'Je veux tracer un cercle de diamètre ' + d + ' cm. J\'écarte le compas de… (en cm)',
      options: B.optionsNombres(rayon, [d, d + 2, rayon + 1, rayon - 1], 4, r), reponse: String(rayon)
    };
  }

  function genDefinition(ctx) {
    var r = ctx.rng;
    var qs = [
      { q: 'Tous les points d\'un cercle sont à la même distance…', rep: 'du centre', o: ['du centre', 'd\'un sommet', 'd\'une droite', 'd\'un côté'] },
      { q: 'Le diamètre d\'un cercle est…', rep: 'le double du rayon', o: ['le double du rayon', 'la moitié du rayon', 'égal au rayon', 'le triple du rayon'] },
      { q: 'Le rayon d\'un cercle est…', rep: 'la moitié du diamètre', o: ['la moitié du diamètre', 'le double du diamètre', 'égal au diamètre', 'le quart du diamètre'] },
      { q: 'Le plus grand segment qu\'on peut tracer dans un cercle, c\'est…', rep: 'le diamètre', o: ['le diamètre', 'le rayon', 'une corde qui ne passe pas par le centre', 'le centre'] }
    ];
    var it = B.choisir(qs, r);
    return { id: 'def-' + it.rep, svg: B.svg(cercleBase(point(50, 50, 3))), instruction: it.q, options: B.melanger(it.o, r), reponse: it.rep };
  }

  var BANQUE = [
    { theme: 'vocabulaire', niveau: 1, gen: genVocab },
    { theme: 'compas', niveau: 1, gen: genCompas },
    { theme: 'rayon-diametre', niveau: 2, gen: genRayonDiametre },
    { theme: 'definition', niveau: 2, gen: genDefinition }
  ];

  var API = { BANQUE: BANQUE, config: B.creerConfig('geometrie-cercle', BANQUE) };
  root.GeoCercle = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document !== 'undefined' && typeof MoteurGeometrie !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { new MoteurGeometrie(API.config); });
  }
})(typeof window !== 'undefined' ? window : globalThis);
