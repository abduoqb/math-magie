/* Mission « Repérage dans l'espace » (geometrie-espace).
 * Thèmes (programme) :
 *   position         CP+  gauche / droite / milieu / juste à côté / entre (rangée de boules)
 *   dessus-dessous   CP+  haut / bas / au-dessus / en dessous (pile de boîtes)
 *   quadrillage-case CE1+ lire une case (colonne + ligne) sur un quadrillage
 *   deplacement      CE1+ suivre une suite de déplacements sur un quadrillage
 *   coordonnees      CE2+ lire les coordonnées (x ; y) d'un point */
(function (root) {
  var B = root.GeoBanque || (typeof require === 'function' ? require('./banque_geo.js') : null);
  var COUL = B.COULEURS;

  function boule(x, y, c, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 11) + '" fill="' + c.hex + '" stroke="' + B.ENCRE + '" stroke-width="3"/>';
  }
  function boite(x, y, c, l, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + l + '" height="' + h + '" rx="3" fill="' + c.hex + '" stroke="' + B.ENCRE + '" stroke-width="3"/>';
  }
  function tirerCouleurs(n, rng) { return B.melanger(COUL, rng).slice(0, n); }

  /* ---------- Rangée de boules (gauche / droite) ---------- */
  function genPosition(ctx) {
    var r = ctx.rng, n = ctx.niveau >= 2 ? 4 : 3;
    var cs = tirerCouleurs(n, r);
    var xs = n === 3 ? [22, 50, 78] : [15, 38, 62, 85];
    var dessin = '<line x1="5" y1="62" x2="95" y2="62" stroke="' + B.ENCRE + '" stroke-width="3" stroke-linecap="round"/>';
    cs.forEach(function (c, i) { dessin += boule(xs[i], 50, c); });
    var noms = cs.map(function (c) { return c.nom; });
    var q, rep, instr, cp, opts;
    var forme = n === 4 ? B.choisir([0, 2], r) : (ctx.niveau >= 2 ? B.entier(0, 2, r) : B.entier(0, 1, r));
    if (forme === 0) { // « Quelle boule est à gauche / à droite ? »
      var cote = B.choisir(['gauche', 'droite'], r);
      rep = cote === 'gauche' ? noms[0] : noms[n - 1];
      instr = 'Quelle boule est tout à ' + cote + ' ?';
      cp = 'Quelle boule est à ' + cote + ' ?';
      opts = noms;
    } else if (forme === 1) { // « La boule X est… ? »
      var i = B.entier(0, n - 1, r);
      var lib = ['à gauche', 'au milieu', 'à droite'];
      rep = lib[i];
      instr = 'Où est la boule ' + noms[i] + ' ?';
      cp = 'Où est la boule ' + noms[i] + ' ?';
      opts = lib;
    } else { // juste à gauche / à droite de X, ou entre
      var kind = B.choisir(['gauche', 'droite', 'entre'], r);
      if (kind === 'entre') {
        var m = B.entier(0, n - 3, r);
        rep = noms[m + 1];
        instr = 'Quelle boule est entre la boule ' + noms[m] + ' et la boule ' + noms[m + 2] + ' ?';
      } else if (kind === 'gauche') {
        var k = B.entier(1, n - 1, r);
        rep = noms[k - 1];
        instr = 'Quelle boule est juste à gauche de la boule ' + noms[k] + ' ?';
      } else {
        var k2 = B.entier(0, n - 2, r);
        rep = noms[k2 + 1];
        instr = 'Quelle boule est juste à droite de la boule ' + noms[k2] + ' ?';
      }
      cp = instr; opts = noms;
    }
    return { id: 'pos-' + noms.join('') + '-' + instr, svg: B.svg(dessin), instruction: instr, instructionCP: cp, options: B.melanger(opts, r), reponse: rep };
  }

  /* ---------- Pile de boîtes (haut / bas) ---------- */
  function genDessus(ctx) {
    var r = ctx.rng, n = ctx.niveau >= 2 ? 4 : 3;
    var cs = tirerCouleurs(n, r);
    var h = n === 3 ? 20 : 16, dessin = '', top = 90 - n * h;
    cs.forEach(function (c, i) { dessin += boite(34, top + i * h, c, 32, h); }); // i=0 : en haut
    dessin += '<line x1="20" y1="90" x2="80" y2="90" stroke="' + B.ENCRE + '" stroke-width="3" stroke-linecap="round"/>';
    var noms = cs.map(function (c) { return c.nom; });
    var rep, instr;
    var kind = ctx.niveau >= 2 ? B.choisir(['haut', 'bas', 'dessus', 'dessous'], r) : B.choisir(['haut', 'bas'], r);
    if (kind === 'haut') { rep = noms[0]; instr = 'Quelle boîte est tout en haut ?'; }
    else if (kind === 'bas') { rep = noms[n - 1]; instr = 'Quelle boîte est tout en bas ?'; }
    else if (kind === 'dessus') { var k = B.entier(1, n - 1, r); rep = noms[k - 1]; instr = 'Quelle boîte est juste au-dessus de la boîte ' + noms[k] + ' ?'; }
    else { var k2 = B.entier(0, n - 2, r); rep = noms[k2 + 1]; instr = 'Quelle boîte est juste en dessous de la boîte ' + noms[k2] + ' ?'; }
    return { id: 'pile-' + noms.join('') + '-' + kind, svg: B.svg(dessin), instruction: instr, instructionCP: instr, options: B.melanger(noms, r), reponse: rep };
  }

  /* ---------- Quadrillage ---------- */
  var LETTRES = 'ABCDEFG';
  function tailleGrille(niveau) { return niveau >= 3 ? 6 : (niveau === 2 ? 5 : 4); }

  function grille(n, x0, y0, pas, avecEtiquettes) {
    var d = '', i;
    for (i = 0; i <= n; i++) {
      d += B.ligne(x0 + i * pas, y0, x0 + i * pas, y0 + n * pas, '#94A3B8', 1.2);
      d += B.ligne(x0, y0 + i * pas, x0 + n * pas, y0 + i * pas, '#94A3B8', 1.2);
    }
    if (avecEtiquettes) {
      for (i = 0; i < n; i++) {
        d += B.texte(x0 + i * pas + pas / 2, y0 - 3, LETTRES.charAt(i), 6);
        d += B.texte(x0 - 5, y0 + i * pas + pas / 2 + 2.2, String(i + 1), 6);
      }
    }
    return d;
  }
  function etoile(cx, cy, r, couleur) {
    var pts = [];
    for (var k = 0; k < 10; k++) {
      var rad = (k % 2 === 0 ? r : r * 0.45), a = -Math.PI / 2 + k * Math.PI / 5;
      pts.push((cx + rad * Math.cos(a)).toFixed(1) + ',' + (cy + rad * Math.sin(a)).toFixed(1));
    }
    return '<polygon points="' + pts.join(' ') + '" fill="' + couleur + '" stroke="' + B.ENCRE + '" stroke-width="2.5" stroke-linejoin="round"/>';
  }
  function nomCase(c, l) { return LETTRES.charAt(c) + (l + 1); }

  function genCase(ctx) {
    var r = ctx.rng, n = tailleGrille(ctx.niveau), pas = 80 / n, x0 = 15, y0 = 14;
    var c = B.entier(0, n - 1, r), l = B.entier(0, n - 1, r);
    var dessin = grille(n, x0, y0, pas, true) + etoile(x0 + c * pas + pas / 2, y0 + l * pas + pas / 2, pas * 0.38, '#FACC15');
    var rep = nomCase(c, l);
    var cand = [];
    if (c !== l && l < n && c < n) cand.push(nomCase(l, c)); // colonne et ligne échangées
    if (c + 1 < n) cand.push(nomCase(c + 1, l));
    if (c > 0) cand.push(nomCase(c - 1, l));
    if (l + 1 < n) cand.push(nomCase(c, l + 1));
    if (l > 0) cand.push(nomCase(c, l - 1));
    var opts = B.options(rep, cand, 4, r);
    return { id: 'case-' + n + rep, svg: B.svg(dessin), instruction: "Dans quelle case se trouve l'étoile ? (colonne puis ligne)", options: opts, reponse: rep };
  }

  var DIRS = [
    { nom: 'à droite', dc: 1, dl: 0 }, { nom: 'à gauche', dc: -1, dl: 0 },
    { nom: 'en bas', dc: 0, dl: 1 }, { nom: 'en haut', dc: 0, dl: -1 }
  ];
  function genDeplacement(ctx) {
    var r = ctx.rng, n = ctx.niveau >= 3 ? 5 : 4, pas = 80 / n, x0 = 15, y0 = 14;
    var nbEtapes = ctx.niveau >= 3 ? 3 : 2;
    for (var essai = 0; essai < 40; essai++) {
      var c = B.entier(0, n - 1, r), l = B.entier(0, n - 1, r), c0 = c, l0 = l, etapes = [], ok = true, dernierAxe = null;
      for (var e = 0; e < nbEtapes && ok; e++) {
        var d = B.choisir(DIRS, r), k = B.entier(1, 2, r);
        var axe = d.dc !== 0 ? 'h' : 'v';
        if (axe === dernierAxe && e > 0) { ok = false; break; } // on alterne horizontal / vertical
        var c2 = c + d.dc * k, l2 = l + d.dl * k;
        if (c2 < 0 || c2 >= n || l2 < 0 || l2 >= n) { ok = false; break; }
        c = c2; l = l2; dernierAxe = axe;
        etapes.push(k + ' case' + (k > 1 ? 's' : '') + ' ' + d.nom);
      }
      if (!ok || (c === c0 && l === l0)) continue;
      var dessin = grille(n, x0, y0, pas, true) +
        '<circle cx="' + (x0 + c0 * pas + pas / 2) + '" cy="' + (y0 + l0 * pas + pas / 2) + '" r="' + (pas * 0.3).toFixed(1) + '" fill="#FB7185" stroke="' + B.ENCRE + '" stroke-width="2.5"/>';
      var rep = nomCase(c, l);
      var cand = [nomCase(c0, l0)];
      if (c + 1 < n) cand.push(nomCase(c + 1, l));
      if (c > 0) cand.push(nomCase(c - 1, l));
      if (l + 1 < n) cand.push(nomCase(c, l + 1));
      if (l > 0) cand.push(nomCase(c, l - 1));
      var texteEtapes = etapes.join(', puis ');
      return {
        id: 'dep-' + nomCase(c0, l0) + texteEtapes,
        svg: B.svg(dessin),
        instruction: 'Le lutin rouge part de la case ' + nomCase(c0, l0) + '. Il avance de ' + texteEtapes + '. Dans quelle case arrive-t-il ?',
        options: B.options(rep, cand, 4, r), reponse: rep
      };
    }
    return null;
  }

  function genCoordonnees(ctx) {
    var r = ctx.rng, n = ctx.niveau >= 3 ? 6 : 5, pas = 70 / n, x0 = 18, y0 = 84; // origine en bas à gauche
    var x = B.entier(1, n, r), y = B.entier(1, n, r);
    if (x === y) { y = (y % n) + 1; if (x === y) return null; }
    var d = '', i;
    for (i = 0; i <= n; i++) {
      d += B.ligne(x0 + i * pas, y0, x0 + i * pas, y0 - n * pas, '#CBD5E1', 1);
      d += B.ligne(x0, y0 - i * pas, x0 + n * pas, y0 - i * pas, '#CBD5E1', 1);
      d += B.texte(x0 + i * pas, y0 + 8, String(i), 5);
      d += B.texte(x0 - 5, y0 - i * pas + 1.8, String(i), 5);
    }
    d += B.ligne(x0, y0, x0 + n * pas + 4, y0, B.ENCRE, 2) + B.ligne(x0, y0, x0, y0 - n * pas - 4, B.ENCRE, 2);
    d += '<circle cx="' + (x0 + x * pas) + '" cy="' + (y0 - y * pas) + '" r="3.8" fill="#E11D48" stroke="' + B.ENCRE + '" stroke-width="1.6"/>';
    var fmt = function (a, b) { return '(' + a + ' ; ' + b + ')'; };
    var rep = fmt(x, y);
    var cand = [fmt(y, x)];
    if (x < n) cand.push(fmt(x + 1, y));
    if (y < n) cand.push(fmt(x, y + 1));
    if (x > 1) cand.push(fmt(x - 1, y));
    return { id: 'coord-' + rep + n, svg: B.svg(d), instruction: 'Quelles sont les coordonnées du point rouge ? (on lit d\'abord vers la droite, puis vers le haut)', options: B.options(rep, cand, 4, r), reponse: rep };
  }

  var BANQUE = [
    { theme: 'position', niveau: 1, gen: genPosition },
    { theme: 'dessus-dessous', niveau: 1, gen: genDessus },
    { theme: 'quadrillage-case', niveau: 1, gen: genCase },
    { theme: 'deplacement', niveau: 2, gen: genDeplacement },
    { theme: 'coordonnees', niveau: 2, gen: genCoordonnees }
  ];

  var API = { BANQUE: BANQUE, config: B.creerConfig('geometrie-espace', BANQUE) };
  root.GeoEspace = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document !== 'undefined' && typeof MoteurGeometrie !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { new MoteurGeometrie(API.config); });
  }
})(typeof window !== 'undefined' ? window : globalThis);
