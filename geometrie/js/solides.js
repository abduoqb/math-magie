/* Mission « Les solides » (geometrie-solides).
 * Thèmes (programme) :
 *   roule        CE1  un solide roule-t-il ? (boule, cylindre ; cube, pavé, pyramide non)
 *   faces-forme  CE1+ nature des faces (carrés, rectangles, triangles, disques)
 *   description  CE2+ retrouver un solide à partir d'une description (faces, sommets, base)
 *   prisme       CM1+ compter faces / sommets / arêtes d'un prisme droit à base triangulaire
 * `contenu.solides` limite les solides dessinés ET proposés comme réponses. */
(function (root) {
  var B = root.GeoBanque || (typeof require === 'function' ? require('./banque_geo.js') : null);
  var COULEURS = ['#FB923C', '#4ADE80', '#60A5FA', '#F472B6', '#A78BFA', '#2DD4BF'];

  function autorises(ctx) { return ctx.liste('solides') || B.SOLIDES.slice(); }
  function a(ctx, nom) { return autorises(ctx).indexOf(nom) >= 0; }
  function dessiner(nom, ctx) { return B.svg(B.dessinSolide(nom, B.choisir(COULEURS, ctx.rng))); }
  function disque(ctx) { return ctx.indexClasse >= 2 ? 'disques' : 'ronds'; }

  function genRoule(ctx) {
    var ok = autorises(ctx).filter(function (n) { return ['Sphère', 'Cylindre', 'Cube', 'Pavé droit', 'Pyramide'].indexOf(n) >= 0; });
    var roulent = ok.filter(function (n) { return n === 'Sphère' || n === 'Cylindre'; });
    var non = ok.filter(function (n) { return roulent.indexOf(n) < 0; });
    if (!roulent.length || !non.length) return null;
    var nom = B.choisir(B.alea(ctx.rng)() < 0.5 ? roulent : non, ctx.rng);
    var oui = roulent.indexOf(nom) >= 0;
    return {
      id: 'roule-' + nom, svg: dessiner(nom, ctx),
      instruction: 'Ce solide peut-il rouler (sur une face ou sur le côté) ?',
      options: ['Oui', 'Non'], reponse: oui ? 'Oui' : 'Non'
    };
  }

  function genFaces(ctx) {
    var d = disque(ctx);
    var tous = ['carrés', 'rectangles', 'triangles', d];
    var items = [];
    if (a(ctx, 'Cube')) items.push({ s: 'Cube', q: "Les faces d'un cube sont des…", rep: 'carrés', opts: tous });
    if (a(ctx, 'Pavé droit')) items.push({ s: 'Pavé droit', q: 'Les faces de ce pavé droit sont des…', rep: 'rectangles', opts: ['rectangles', 'triangles', d, 'étoiles'] });
    if (a(ctx, 'Pyramide')) items.push({ s: 'Pyramide', q: "Les faces qui se rejoignent en haut d'une pyramide sont des…", rep: 'triangles', opts: tous });
    if (ctx.indexClasse >= 2 && a(ctx, 'Cylindre')) items.push({ s: 'Cylindre', q: 'Les deux bases (haut et bas) du cylindre sont des…', rep: d, opts: tous });
    if (ctx.indexClasse >= 2 && a(ctx, 'Cône')) items.push({ s: 'Cône', q: 'La base du cône (en bas) est un…', rep: 'disque', opts: ['disque', 'carré', 'triangle', 'rectangle'] });
    if (!items.length) return null;
    var it = B.choisir(items, ctx.rng);
    return { id: 'faces-' + it.s, svg: dessiner(it.s, ctx), instruction: it.q, options: B.options(it.rep, it.opts, 4, ctx.rng), reponse: it.rep };
  }

  // Descriptions : { s: solide, niv: palier mini, t: texte }
  var DESCRIPTIONS = [
    { s: 'Cube', niv: 1, t: "J'ai 6 faces, et toutes mes faces sont des carrés." },
    { s: 'Cube', niv: 2, t: "J'ai 8 sommets et 12 arêtes, toutes de la même longueur." },
    { s: 'Pavé droit', niv: 1, t: "J'ai 6 faces rectangulaires, qui ne sont pas toutes des carrés." },
    { s: 'Pavé droit', niv: 2, t: "J'ai 8 sommets et 12 arêtes, et mes faces ne sont pas toutes des carrés." },
    { s: 'Pyramide', niv: 1, t: "J'ai une base carrée et mes autres faces sont des triangles qui se rejoignent en pointe." },
    { s: 'Pyramide', niv: 2, t: "J'ai 5 sommets et 5 faces." },
    { s: 'Cylindre', niv: 1, t: "J'ai deux faces rondes et plates, et une face qui s'enroule." },
    { s: 'Cône', niv: 1, t: "J'ai une seule pointe et une base ronde." },
    { s: 'Sphère', niv: 1, t: "Je suis tout rond : je n'ai ni sommet, ni arête, ni face plate. On m'appelle aussi la boule." },
    { s: 'Prisme triangulaire', niv: 1, t: "J'ai 2 faces triangulaires et 3 faces rectangulaires." },
    { s: 'Prisme triangulaire', niv: 2, t: "J'ai 5 faces, 6 sommets et 9 arêtes." }
  ];
  var COUSINS = { 'Cube': 'Pavé droit', 'Pavé droit': 'Cube', 'Cylindre': 'Cône', 'Cône': 'Cylindre', 'Pyramide': 'Prisme triangulaire', 'Prisme triangulaire': 'Pyramide', 'Sphère': 'Cylindre' };

  function genDescription(ctx) {
    var ok = autorises(ctx);
    var dispo = DESCRIPTIONS.filter(function (d) { return ok.indexOf(d.s) >= 0 && d.niv <= ctx.niveau; });
    // « sphère » : le mot « boule » vient du programme ; pas de prisme avant le CM1 (filtré par `solides`)
    if (!dispo.length) return null;
    var d = B.choisir(dispo, ctx.rng);
    var autres = ok.filter(function (n) { return n !== d.s; });
    if (autres.length < 2) return null;
    var cand = autres;
    var opts = B.options(d.s, cand, 4, ctx.rng);
    var cousin = COUSINS[d.s];
    if (ctx.niveau >= 3 && cousin && ok.indexOf(cousin) >= 0 && opts.indexOf(cousin) < 0) { // piège : solide voisin
      var i = 0;
      while (opts[i] === d.s) i++;
      opts[i] = cousin;
    }
    opts = B.unique(opts);
    return { id: 'desc-' + d.s + d.niv, svg: B.svg(B.texte(50, 56, '?', 40, 'middle', '#8B5CF6')), instruction: d.t + ' Qui suis-je ?', options: opts, reponse: d.s };
  }

  function genPrisme(ctx) {
    if (!a(ctx, 'Prisme triangulaire')) return null;
    var types = [
      { k: 'faces', q: 'Combien de faces a ce prisme ?', n: 5 },
      { k: 'sommets', q: 'Combien de sommets a ce prisme ?', n: 6 },
      { k: 'arêtes', q: 'Combien d\'arêtes a ce prisme ?', n: 9 }
    ];
    var t = B.choisir(types, ctx.rng);
    var voisins = [t.n - 1, t.n + 1, t.n + 3, 12, 6, 8].filter(function (v) { return v !== t.n; });
    return { id: 'prisme-' + t.k, svg: dessiner('Prisme triangulaire', ctx), instruction: t.q, options: B.optionsNombres(t.n, voisins, 4, ctx.rng), reponse: String(t.n) };
  }

  var BANQUE = [
    { theme: 'roule', niveau: 1, gen: genRoule },
    { theme: 'faces-forme', niveau: 1, gen: genFaces },
    { theme: 'description', niveau: 1, gen: genDescription },
    { theme: 'prisme', niveau: 2, gen: genPrisme }
  ];

  var API = { BANQUE: BANQUE, config: B.creerConfig('geometrie-solides', BANQUE) };
  root.GeoSolides = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document !== 'undefined' && typeof MoteurGeometrie !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { new MoteurGeometrie(API.config); });
  }
})(typeof window !== 'undefined' ? window : globalThis);
