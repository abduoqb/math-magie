/* Patron du cube (CE1 : « approche du patron du cube »).
 * Génère un assemblage de 6 carrés et demande s'il se plie en cube. La réponse est calculée
 * en faisant « rouler » un cube sur l'assemblage : c'est un patron si les 6 carrés
 * touchent 6 faces différentes. Pur (rng injectable), exporté pour les tests Node. */
(function (root) {
  function cle(c) { return c[0] + ',' + c[1]; }

  // cellules : liste de [colonne, ligne] ; vrai si l'assemblage (6 carrés connexes) est un patron du cube
  function estPatronCube(cellules) {
    if (cellules.length !== 6) return false;
    var set = {};
    cellules.forEach(function (c) { set[cle(c)] = true; });
    // état du cube : dessous, dessus, nord, sud, est, ouest (numéros de faces)
    var vus = {}, faces = {};
    var pile = [{ c: cellules[0], e: { b: 0, h: 1, n: 2, s: 3, e: 4, o: 5 } }];
    vus[cle(cellules[0])] = true;
    faces[0] = true;
    while (pile.length) {
      var cur = pile.pop(), x = cur.c[0], y = cur.c[1], e = cur.e;
      var voisins = [
        [x + 1, y, { b: e.e, h: e.o, n: e.n, s: e.s, e: e.h, o: e.b }],
        [x - 1, y, { b: e.o, h: e.e, n: e.n, s: e.s, e: e.b, o: e.h }],
        [x, y - 1, { b: e.n, h: e.s, n: e.h, s: e.b, e: e.e, o: e.o }],
        [x, y + 1, { b: e.s, h: e.n, n: e.b, s: e.h, e: e.e, o: e.o }]
      ];
      for (var i = 0; i < voisins.length; i++) {
        var v = voisins[i], k = v[0] + ',' + v[1];
        if (!set[k] || vus[k]) continue;
        vus[k] = true;
        if (faces[v[2].b]) return false; // une face du cube serait recouverte deux fois
        faces[v[2].b] = true;
        pile.push({ c: [v[0], v[1]], e: v[2] });
      }
    }
    return Object.keys(vus).length === 6;
  }

  function aBloc2x2(cellules) {
    var set = {};
    cellules.forEach(function (c) { set[cle(c)] = true; });
    return cellules.some(function (c) {
      return set[cle([c[0] + 1, c[1]])] && set[cle([c[0], c[1] + 1])] && set[cle([c[0] + 1, c[1] + 1])];
    });
  }

  function plusLongueRangee(cellules) {
    var best = 0;
    var set = {};
    cellules.forEach(function (c) { set[cle(c)] = true; });
    cellules.forEach(function (c) {
      var h = 1, v = 1;
      while (set[cle([c[0] + h, c[1]])]) h++;
      while (set[cle([c[0], c[1] + v])]) v++;
      best = Math.max(best, h, v);
    });
    return best;
  }

  function croissance(rng) {
    var cells = [[0, 0]], set = { '0,0': true };
    while (cells.length < 6) {
      var base = cells[Math.floor(rng() * cells.length)];
      var d = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rng() * 4)];
      var n = [base[0] + d[0], base[1] + d[1]];
      if (set[cle(n)]) continue;
      set[cle(n)] = true;
      cells.push(n);
    }
    return cells;
  }

  // Assemblage aléatoire ; niveau 1 : les assemblages refusés sont « évidents » (bloc 2x2 ou rangée de 5)
  function genererAssemblage(niveau, voulu, rng) {
    rng = rng || Math.random;
    for (var i = 0; i < 2000; i++) {
      var cells = croissance(rng);
      var ok = estPatronCube(cells);
      if (ok !== voulu) continue;
      if (!ok && niveau <= 1 && !(aBloc2x2(cells) || plusLongueRangee(cells) >= 5)) continue;
      return cells;
    }
    return null;
  }

  function svg(cellules, rng) {
    rng = rng || Math.random;
    var cs = cellules.map(function (c) { return [c[0], c[1]]; });
    if (rng() < 0.5) cs = cs.map(function (c) { return [-c[0], c[1]]; });
    if (rng() < 0.5) cs = cs.map(function (c) { return [c[1], c[0]]; });
    var minX = Math.min.apply(null, cs.map(function (c) { return c[0]; })), minY = Math.min.apply(null, cs.map(function (c) { return c[1]; }));
    var maxX = Math.max.apply(null, cs.map(function (c) { return c[0]; })), maxY = Math.max.apply(null, cs.map(function (c) { return c[1]; }));
    var w = maxX - minX + 1, h = maxY - minY + 1, t = Math.min(20, 84 / Math.max(w, h));
    var x0 = (100 - w * t) / 2, y0 = (100 - h * t) / 2;
    var couleurs = ['#FDBA74', '#86EFAC', '#93C5FD', '#F9A8D4', '#C4B5FD', '#FDE047'];
    var d = cs.map(function (c, i) {
      return '<rect x="' + (x0 + (c[0] - minX) * t).toFixed(1) + '" y="' + (y0 + (c[1] - minY) * t).toFixed(1) + '" width="' + t.toFixed(1) + '" height="' + t.toFixed(1) +
        '" fill="' + couleurs[i % 6] + '" stroke="#334155" stroke-width="2.5" stroke-linejoin="round"/>';
    }).join('');
    return '<svg viewBox="0 0 100 100">' + d + '</svg>';
  }

  function question(niveau, rng) {
    rng = rng || Math.random;
    var voulu = rng() < 0.5;
    var cells = genererAssemblage(niveau, voulu, rng);
    if (!cells) { voulu = !voulu; cells = genererAssemblage(niveau, voulu, rng); }
    return {
      id: 'patroncube-' + cells.map(cle).join(';') + '-' + Math.floor(rng() * 1000),
      svg: svg(cells, rng),
      reponse: voulu ? 'Oui' : 'Non',
      instruction: 'Si on plie ces 6 carrés, obtient-on un cube ?',
      options: ['Oui', 'Non']
    };
  }

  var API = { estPatronCube: estPatronCube, genererAssemblage: genererAssemblage, aBloc2x2: aBloc2x2, plusLongueRangee: plusLongueRangee, question: question };
  root.GeoPatronCube = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
