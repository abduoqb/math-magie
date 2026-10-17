/* GeoBanque : moteur de « banques de questions » pour les missions de géométrie à thèmes
 * (espace, solides, cercle, instruments, rapporteur).
 *
 * Une banque est une liste d'éléments { theme, niveau, gen(ctx) } :
 *   - theme  : identifiant du thème, à lister dans `contenu.themes` du programme de la classe ;
 *   - niveau : palier minimal du moteur (1..3) à partir duquel l'élément peut être tiré ;
 *   - gen    : renvoie { id, svg, instruction, instructionCP?, options, reponse }, ou null si le
 *              `contenu` de la classe ne permet pas de poser cette question.
 * Règle du projet : une question hors `contenu` est un bug. Seuls les thèmes listés sont tirés ;
 * les générateurs filtrent eux-mêmes leurs solides / instruments / vocabulaire par `contenu`.
 * Utilisable dans le navigateur (global GeoBanque) et sous node (module.exports). */
(function (root) {
  var ENCRE = '#334155';

  function alea(rng) { return rng || Math.random; }
  function entier(a, b, rng) { return a + Math.floor(alea(rng)() * (b - a + 1)); }
  function choisir(liste, rng) { return liste[Math.floor(alea(rng)() * liste.length)]; }
  function melanger(liste, rng) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(alea(rng)() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function unique(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  // Choix de `n` options dont la bonne réponse, mélangées. `candidats` = mauvaises réponses possibles.
  function options(bonne, candidats, n, rng) {
    var autres = unique(candidats.map(String)).filter(function (c) { return c !== String(bonne); });
    var res = melanger(autres, rng).slice(0, Math.max(0, n - 1));
    res.push(String(bonne));
    return melanger(res, rng);
  }

  // Options numériques proches de la bonne réponse (entiers > 0, uniques)
  function optionsNombres(bonne, voisins, n, rng, min) {
    min = (min === undefined) ? 1 : min;
    var c = voisins.filter(function (v) { return v >= min && v !== bonne; });
    var k = 1;
    while (unique(c).length < n - 1 && k < 40) { // complète avec des voisins directs
      [bonne + k, bonne - k].forEach(function (v) { if (v >= min && c.indexOf(v) < 0) c.push(v); });
      k++;
    }
    return options(bonne, c, n, rng);
  }

  /* ---------- Éléments de dessin ---------- */

  var COULEURS = [
    { nom: 'rouge', hex: '#E11D48' }, { nom: 'bleue', hex: '#3B82F6' }, { nom: 'verte', hex: '#22C55E' },
    { nom: 'jaune', hex: '#FACC15' }, { nom: 'orange', hex: '#F97316' }, { nom: 'violette', hex: '#8B5CF6' }
  ];

  function svg(contenu) { return '<svg viewBox="0 0 100 100">' + contenu + '</svg>'; }

  function texte(x, y, t, taille, anchor, couleur) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (taille || 5) + '" text-anchor="' + (anchor || 'middle') +
      '" font-family="Lexend, Century Gothic, sans-serif" font-weight="700" fill="' + (couleur || ENCRE) + '">' + t + '</text>';
  }

  function ligne(x1, y1, x2, y2, couleur, largeur, extra) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (couleur || ENCRE) +
      '" stroke-width="' + (largeur || 2) + '" stroke-linecap="round"' + (extra || '') + '/>';
  }

  // Solides (dessins partagés avec les autres missions : mêmes tracés que formes.js)
  var SOLIDES = ['Cube', 'Pavé droit', 'Pyramide', 'Cylindre', 'Cône', 'Sphère', 'Prisme triangulaire'];
  function dessinSolide(nom, c) {
    var s = ENCRE;
    switch (nom) {
      case 'Cube':
        return '<polygon points="25,45 55,45 55,75 25,75" fill="' + c + '"/>' +
          '<polygon points="25,45 40,30 70,30 55,45" fill="' + c + '" fill-opacity="0.6"/>' +
          '<polygon points="55,45 70,30 70,60 55,75" fill="' + c + '" fill-opacity="0.8"/>' +
          '<path d="M25,45 L55,45 L55,75 L25,75 Z M25,45 L40,30 L70,30 L55,45 Z M55,45 L70,30 L70,60 L55,75 Z" fill="none" stroke="' + s + '" stroke-width="3" stroke-linejoin="round"/>';
      case 'Pavé droit':
        return '<polygon points="15,45 65,45 65,75 15,75" fill="' + c + '"/>' +
          '<polygon points="15,45 35,25 85,25 65,45" fill="' + c + '" fill-opacity="0.6"/>' +
          '<polygon points="65,45 85,25 85,55 65,75" fill="' + c + '" fill-opacity="0.8"/>' +
          '<path d="M15,45 L65,45 L65,75 L15,75 Z M15,45 L35,25 L85,25 L65,45 Z M65,45 L85,25 L85,55 L65,75 Z" fill="none" stroke="' + s + '" stroke-width="3" stroke-linejoin="round"/>';
      case 'Pyramide':
        return '<polygon points="50,15 80,75 20,75" fill="' + c + '"/>' +
          '<polygon points="50,15 80,75 90,60" fill="' + c + '" fill-opacity="0.7"/>' +
          '<path d="M50,15 L80,75 L20,75 Z M50,15 L80,75 L90,60 Z" fill="none" stroke="' + s + '" stroke-width="3" stroke-linejoin="round"/>';
      case 'Cylindre':
        return '<ellipse cx="50" cy="30" rx="25" ry="10" fill="' + c + '" fill-opacity="0.7" stroke="' + s + '" stroke-width="3"/>' +
          '<rect x="25" y="30" width="50" height="40" fill="' + c + '" stroke-width="0"/>' +
          '<ellipse cx="50" cy="70" rx="25" ry="10" fill="' + c + '" stroke="' + s + '" stroke-width="3"/>' +
          '<line x1="25" y1="30" x2="25" y2="70" stroke="' + s + '" stroke-width="3"/><line x1="75" y1="30" x2="75" y2="70" stroke="' + s + '" stroke-width="3"/>';
      case 'Cône':
        return '<polygon points="50,15 80,75 20,75" fill="' + c + '"/>' +
          '<ellipse cx="50" cy="75" rx="30" ry="10" fill="' + c + '" fill-opacity="0.8" stroke="' + s + '" stroke-width="3"/>' +
          '<path d="M50,15 L20,75 M50,15 L80,75" fill="none" stroke="' + s + '" stroke-width="3" stroke-linecap="round"/>';
      case 'Sphère':
        return '<defs><radialGradient id="gradSphereB" cx="40%" cy="40%" r="50%"><stop offset="0%" style="stop-color:#fff;stop-opacity:0.4"/><stop offset="100%" style="stop-color:#000;stop-opacity:0.2"/></radialGradient></defs>' +
          '<circle cx="50" cy="50" r="35" fill="' + c + '" stroke="' + s + '" stroke-width="4"/>' +
          '<circle cx="50" cy="50" r="35" fill="url(#gradSphereB)"/>';
      case 'Prisme triangulaire':
        return '<polygon points="15,75 55,75 35,40" fill="' + c + '"/>' +
          '<polygon points="55,75 80,57 60,22 35,40" fill="' + c + '" fill-opacity="0.8"/>' +
          '<polygon points="15,75 35,40 60,22 40,57" fill="' + c + '" fill-opacity="0.55"/>' +
          '<path d="M15,75 L55,75 L35,40 Z M55,75 L80,57 L60,22 L35,40 Z M15,75 L40,57 L60,22 L35,40" fill="none" stroke="' + s + '" stroke-width="3" stroke-linejoin="round"/>';
      default:
        return '';
    }
  }

  /* ---------- Sélection ---------- */

  function contexte(id, niveau, rng) {
    var G = root.GeoProgramme;
    return {
      id: id, rng: alea(rng), niveau: niveau,
      contenu: G ? G.contenu(id) : {},
      indexClasse: G ? G.indexNiveau() : 4,
      liste: function (cle) { return G ? G.liste(id, cle) : null; }
    };
  }

  function themesAutorises(banque, id) {
    var G = root.GeoProgramme;
    var th = G ? G.themes(id) : null;
    return banque.filter(function (it) { return th === null || th.indexOf(it.theme) >= 0; });
  }

  function candidats(banque, id, niveau) {
    var G = root.GeoProgramme;
    var max = G ? G.maxNiveau(id) : 3;
    var niv = Math.max(1, Math.min(niveau || 1, max, 3));
    var ok = themesAutorises(banque, id);
    var items = ok.filter(function (it) { return it.niveau <= niv; });
    if (!items.length) items = ok; // repli : on ne sort jamais des thèmes du programme
    return { items: items, niveau: niv };
  }

  function tirer(banque, id, niveau, rng) {
    var r = alea(rng);
    var c = candidats(banque, id, niveau);
    var ctx = contexte(id, c.niveau, r);
    var pool = c.items.slice();
    var exact = pool.filter(function (it) { return it.niveau === c.niveau; });
    var essais = 0;
    while (pool.length && essais < 60) {
      essais++;
      var source = (exact.length && r() < 0.6) ? exact : pool;
      var it = source[Math.floor(r() * source.length)];
      var q = it.gen(ctx);
      if (q) { q.theme = it.theme; return q; }
      pool = pool.filter(function (x) { return x !== it; });
      exact = exact.filter(function (x) { return x !== it; });
    }
    throw new Error('GeoBanque : aucune question possible pour ' + id);
  }

  function creerConfig(nomOperation, banque) {
    return {
      typeInterface: 'boutons',
      nomOperation: nomOperation,
      genererQuestion: function (niveau) { return tirer(banque, nomOperation, niveau, null); }
    };
  }

  var API = {
    ENCRE: ENCRE, COULEURS: COULEURS, SOLIDES: SOLIDES,
    alea: alea, entier: entier, choisir: choisir, melanger: melanger, unique: unique,
    options: options, optionsNombres: optionsNombres,
    svg: svg, texte: texte, ligne: ligne, dessinSolide: dessinSolide,
    candidats: candidats, tirer: tirer, creerConfig: creerConfig, themesAutorises: themesAutorises
  };
  root.GeoBanque = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
