/* Test Node de Pizzas Magiques : node jeux/fractions/test-fractions.js
   5 classes x 3 difficultés x 8 manches x N tirages, vérifications indépendantes du générateur. */
'use strict';
var PM = require('./fractions.js');

var TIRAGES = 300;
var erreurs = [], total = 0;

function echec(msg, q) { if (erreurs.length < 25) erreurs.push(msg + (q ? ' :: ' + JSON.stringify(q).slice(0, 300) : '')); }
function ok(cond, msg, q) { total++; if (!cond) echec(msg, q); }
function pgcd(a, b) { return b ? pgcd(b, a % b) : a; }
function val(f) { return f.num / f.den; }
function eg(a, b) { return a.num * b.den === b.num * a.den; }
function parseFrac(t) { var m = /^\{(\d+)\/(\d+)\}$/.exec(t); return m ? { num: +m[1], den: +m[2] } : null; }
function parseDec(t) { return parseFloat(t.replace(',', '.')); }

// générateur pseudo-aléatoire reproductible (mulberry32)
function rngDe(graine) {
  var a = graine >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

var BORNES = {
  cp: { parts: [2, 4], frac: function (f) { return f.num === 1 && (f.den === 2 || f.den === 4); }, partsOK: function (p) { return p === 2 || p === 4; } },
  ce1: { frac: function (f) { return f.den >= 2 && f.den <= 4 && f.num >= 1 && f.num <= f.den; }, partsOK: function (p) { return p >= 2 && p <= 4; } },
  ce2: { frac: function (f) { return [2, 3, 4, 5, 6, 8, 10].indexOf(f.den) >= 0 && f.num >= 1 && f.num <= f.den; }, partsOK: function (p) { return [2, 3, 4, 5, 6, 8, 10].indexOf(p) >= 0; } },
  cm1: { frac: function (f) { return f.den >= 2 && f.den <= 12 && f.num >= 1 && f.num <= 2 * f.den; }, partsOK: function (p) { return p >= 2 && p <= 12; } },
  cm2: { frac: function (f) { return f.den >= 2 && f.den <= 20 && f.num >= 1 && f.num <= 2 * f.den; }, partsOK: function (p) { return p >= 2 && p <= 12; } }
};
var TOTAL_Q = { cp: function (t) { return t >= 2 && t <= 20; }, ce1: function (t) { return t >= 2 && t <= 20; }, ce2: function (t) { return t === 12 || t === 20 || t === 24; },
  cm1: function (t) { return t >= 4 && t <= 100; }, cm2: function (t) { return t >= 6 && t <= 200; } };

function uniquesTextes(q) {
  var vus = {};
  q.choix.forEach(function (c) { ok(!vus[c.texte], 'choix en double ' + c.texte, q); vus[c.texte] = true; });
  ok(q.reponse >= 0 && q.reponse < q.choix.length, 'reponse hors choix', q);
}
function valeursDistinctes(q) {
  for (var i = 0; i < q.choix.length; i++) for (var j = i + 1; j < q.choix.length; j++) {
    ok(!eg(q.choix[i], q.choix[j]), 'deux choix de même valeur', q);
  }
}
function nbChoix(q, niveau, attendu) { ok(q.choix.length === attendu, 'nombre de choix ' + q.choix.length, q); }

function verifierQuestion(niveau, q) {
  var B = BORNES[niveau];
  ok(typeof q.texte === 'string' && q.texte.length > 0 && !/undefined|NaN|null/.test(q.texte), 'texte invalide', q);
  PM.segments(q.texte).forEach(function (s) { if (s.frac) ok(s.den >= 1 && s.num >= 0, 'jeton invalide', q); });
  ok(PM.enTexteBrut(q.texte).indexOf('{') < 0, 'jeton non converti', q);
  ok(typeof q.indice === 'string' && typeof q.explication === 'string' && !/undefined|NaN/.test(q.explication + q.indice), 'indice/explication', q);
  if (q.choix) { uniquesTextes(q); q.choix.forEach(function (c) { ok(!/undefined|NaN/.test(c.texte), 'texte de choix', q); PM.segments(c.texte); }); }

  switch (q.type) {
    case 'colorier': {
      ok(B.partsOK(q.parts), 'parts hors bornes ' + q.parts, q);
      ok(B.frac(q.fraction) || (niveau === 'cm2' && q.pct > 0), 'fraction hors bornes', q);
      ok(q.nbFormes === 1 || ((niveau === 'cm1' || niveau === 'cm2') && q.nbFormes === 2), 'nbFormes', q);
      ok(q.total === q.parts * q.nbFormes, 'total', q);
      if (q.pct) { ok(q.cible * 100 === q.pct * q.parts, 'cible pct', q); ok(niveau === 'cm2', 'pct hors cm2', q); }
      else ok(q.cible * q.fraction.den === q.fraction.num * q.parts, 'cible fraction', q);
      ok(Number.isInteger(q.cible) && q.cible >= 1 && q.cible <= q.total, 'cible bornes', q);
      ok(PM.verifier(q, q.cible) && !PM.verifier(q, q.cible + 1) && !PM.verifier(q, q.cible - 1), 'verifier colorier', q);
      if (niveau === 'cp') ok(q.nbFormes === 1, 'cp 1 forme', q);
      break;
    }
    case 'lire': {
      nbChoix(q, niveau, niveau === 'cp' ? 2 : 4);
      ok(B.partsOK(q.parts), 'parts hors bornes', q);
      ok(new Set(q.indices).size === q.indices.length && q.indices.length === q.colorees, 'indices', q);
      ok(q.indices.every(function (i) { return i >= 0 && i < q.total; }), 'indice hors forme', q);
      var vraie = { num: q.colorees, den: q.parts };
      q.choix.forEach(function (c, i) {
        ok(B.frac(c), 'choix hors bornes ' + c.num + '/' + c.den, q);
        ok(eg(c, vraie) === (i === q.reponse), 'bonne réponse non unique/juste', q);
      });
      valeursDistinctes(q);
      ok(niveau !== 'cp' || q.nbFormes === 1, 'cp lire 1 forme', q);
      break;
    }
    case 'partage': {
      ok(B.partsOK(q.parts) || (niveau !== 'cp' && niveau !== 'ce1' && q.parts <= 8), 'parts partage', q);
      var s = q.tailles.reduce(function (a, b) { return a + b; }, 0);
      ok(Math.abs(s - 1) < 1e-9 && q.tailles.length === q.parts, 'somme des tailles', q);
      var mn = Math.min.apply(null, q.tailles), mx = Math.max.apply(null, q.tailles);
      if (q.egal) { ok(mx - mn < 1e-9, 'égal mais inégal', q); ok(q.reponse === 0 && q.plusGrande === -1, 'egal reponse', q); }
      else {
        ok(mx / mn >= 1.4, 'inégalité trop faible ' + mx / mn, q);
        ok(q.tailles[q.plusGrande] === mx && q.tailles.filter(function (t) { return t === mx; }).length === 1, 'plus grande part', q);
        ok(q.reponse === 1, 'inegal reponse', q);
        ok(PM.verifierPart(q, q.plusGrande) && !PM.verifierPart(q, (q.plusGrande + 1) % q.parts), 'verifierPart', q);
      }
      ok(q.choix.length === 2, 'oui/non', q);
      break;
    }
    case 'comparer': {
      var c = q.a.num * q.b.den - q.b.num * q.a.den;
      var sol = c > 0 ? 'a' : c < 0 ? 'b' : 'egal';
      ok(q.solution === sol && q.choix[q.reponse].id === sol, 'solution comparer', q);
      ok(q.choix.filter(function (x) { return x.id === sol; }).length === 1, 'solution unique', q);
      [q.a, q.b].forEach(function (f) { ok(B.frac(f) || (f.num === 1 && f.den === 1 && niveau === 'cm1'), 'bornes comparer', q); });
      if (niveau === 'cp' || niveau === 'ce1' || niveau === 'ce2') { ok(sol !== 'egal', 'égalité inattendue', q); ok(q.choix.length === 2, '2 choix', q); }
      if (niveau === 'ce2') ok(q.a.den === q.b.den, 'ce2 même dénominateur', q);
      if (niveau === 'cm2') ok(q.a.den % q.b.den === 0 || q.b.den % q.a.den === 0, 'cm2 multiples', q);
      if (q.figures) ok(q.a.num <= q.a.den && q.b.num <= q.b.den && q.a.den <= 12 && q.b.den <= 12, 'figures', q);
      break;
    }
    case 'quantite': {
      ok(TOTAL_Q[niveau](q.total), 'total hors bornes ' + q.total, q);
      var attendu = q.pct ? q.total * q.pct / 100 : q.total * q.fraction.num / q.fraction.den;
      ok(Number.isInteger(attendu), 'division non entière', q);
      ok(q.choix[q.reponse].valeur === attendu, 'bonne valeur', q);
      ok(q.choix.filter(function (x) { return x.valeur === attendu; }).length === 1, 'valeur unique', q);
      ok(q.choix.every(function (x) { return x.valeur > 0 && Number.isInteger(x.valeur); }), 'choix entiers', q);
      nbChoix(q, niveau, niveau === 'cp' ? 3 : 4);
      ok(!q.pct || niveau === 'cm2', 'pct hors cm2', q);
      if (!q.pct) ok(B.frac(q.fraction) || niveau === 'cm1' || niveau === 'cm2', 'fraction quantité', q);
      if (niveau === 'cp') ok(q.fraction.num === 1 && (q.fraction.den === 2 || q.fraction.den === 4), 'cp moitié/quart', q);
      ok(q.grille === (q.total <= 24), 'grille', q);
      break;
    }
    case 'egales': {
      ok(niveau === 'cm1' || niveau === 'cm2', 'egales classe', q);
      nbChoix(q, niveau, 4);
      q.choix.forEach(function (c, i) {
        ok(eg(c, q.ref) === (i === q.reponse), 'egales juste/unique', q);
        ok(c.den <= (niveau === 'cm1' ? 12 : 20), 'egales borne', q);
      });
      valeursDistinctes(q);
      break;
    }
    case 'simplifier': {
      ok(niveau === 'cm2', 'simplifier classe', q);
      nbChoix(q, niveau, 4);
      var bonnes = 0;
      q.choix.forEach(function (c, i) {
        var irr = pgcd(c.num, c.den) === 1;
        if (eg(c, q.donnee) && irr) { bonnes++; ok(i === q.reponse, 'simplifiée = reponse', q); }
        if (i === q.reponse) ok(eg(c, q.donnee) && irr, 'reponse simplifiée', q);
      });
      ok(bonnes === 1, 'une seule fraction simplifiée', q);
      ok(pgcd(q.donnee.num, q.donnee.den) > 1, 'donnée non simplifiable', q);
      break;
    }
    case 'decimal': {
      ok(niveau === 'cm1' || niveau === 'cm2', 'decimal classe', q);
      nbChoix(q, niveau, 4);
      var f = q.fraction;
      ok(f.den === 10 || f.den === 100, 'den décimal', q);
      var v = f.num / f.den;
      ok(Math.abs(parseDec(q.valeur) - v) < 1e-9, 'valeur décimale', q);
      if (q.sens === 'fd') {
        var bons = q.choix.filter(function (c) { return Math.abs(parseDec(c.texte) - v) < 1e-9; });
        ok(bons.length === 1 && q.choix[q.reponse] === bons[0], 'décimal unique', q);
      } else {
        var bons2 = q.choix.filter(function (c) { return Math.abs(c.num / c.den - v) < 1e-9; });
        ok(bons2.length === 1 && q.choix[q.reponse] === bons2[0], 'fraction décimale unique', q);
        valeursDistinctes(q);
      }
      ok(v < 2.0001 || niveau === 'cm2', 'cm1 décimal trop grand', q);
      break;
    }
    case 'addition': {
      ok(niveau === 'cm1', 'addition classe', q);
      nbChoix(q, niveau, 4);
      ok(q.a.den === q.b.den && q.a.den <= 12, 'même dénominateur', q);
      var sm = { num: q.a.num + q.b.num, den: q.a.den };
      q.choix.forEach(function (c, i) { ok(eg(c, sm) === (i === q.reponse), 'somme juste/unique', q); });
      valeursDistinctes(q);
      break;
    }
    case 'improprie': {
      ok(niveau === 'cm1', 'improprie classe', q);
      nbChoix(q, niveau, 4);
      ok(q.fraction.num > q.fraction.den && q.fraction.den <= 8, 'fraction > 1', q);
      var n = q.fraction.num, d = q.fraction.den;
      ok(q.nbFormes === Math.ceil(n / d) && q.indices.length === n, 'formes impropre', q);
      q.choix.forEach(function (c, i) {
        var egalV = (c.entier * c.den + c.num) * d === n * c.den;
        ok(egalV === (i === q.reponse), 'impropre juste/unique', q);
        ok(c.num < c.den && c.entier >= 1, 'forme entier + fraction', q);
      });
      break;
    }
    case 'pourcent': {
      ok(niveau === 'cm2', 'pourcent classe', q);
      nbChoix(q, niveau, 4);
      ok([5, 10, 20, 25, 40, 50, 60, 75, 80].indexOf(q.pct) >= 0, 'pct inattendu', q);
      if (q.sens === 'pf') {
        q.choix.forEach(function (c, i) { ok((c.num * 100 === q.pct * c.den) === (i === q.reponse), 'pf juste/unique', q); });
      } else {
        q.choix.forEach(function (c, i) { ok((q.fraction.num * 100 === c.pct * q.fraction.den) === (i === q.reponse), 'fp juste/unique', q); });
      }
      break;
    }
    default: ok(false, 'type inconnu ' + q.type, q);
  }
}

var compte = {};
var nbQuestions = 0;
PM.NIVEAUX.forEach(function (niveau) {
  [0, 1, 2].forEach(function (diff) {
    var rng = rngDe(1000 + diff * 77 + niveau.length * 13 + niveau.charCodeAt(2));
    for (var t = 0; t < TIRAGES; t++) {
      var partie;
      try { partie = PM.partie(niveau, diff, rng); } catch (e) { echec('exception ' + niveau + '/' + diff + ' : ' + e.stack); continue; }
      ok(partie.length === PM.NB_MANCHES, 'longueur de la partie', null);
      var types = partie.map(function (q) { return q.type; });
      ok(types.filter(function (x) { return x === 'colorier'; }).length === 2 && types.filter(function (x) { return x === 'lire'; }).length === 2 &&
        types.filter(function (x) { return x === 'partage'; }).length === 2, 'composition de la partie ' + types.join(','), null);
      partie.forEach(function (q, i) {
        nbQuestions++;
        compte[niveau + ':' + q.type] = (compte[niveau + ':' + q.type] || 0) + 1;
        ok(PM.SPECIAUX[niveau].indexOf(q.type) >= 0 || ['colorier', 'lire', 'partage'].indexOf(q.type) >= 0, 'type non prévu pour la classe ' + q.type, q);
        try { verifierQuestion(niveau, q); } catch (e) { echec('exception vérif ' + niveau + '/' + q.type + ' : ' + e.stack, q); }
      });
    }
  });
});

// Géométrie
(function () {
  [2, 3, 4, 5, 6, 7, 8, 10, 12].forEach(function (d) {
    var tailles = []; for (var i = 0; i < d; i++) tailles.push(1 / d);
    var sec = PM.secteurs(tailles, 110, 110, 98);
    ok(sec.length === d, 'secteurs : nombre', null);
    ok(Math.abs(sec.reduce(function (a, s) { return a + s.angle; }, 0) - 360) < 1e-6, 'secteurs : 360°', null);
    sec.forEach(function (s) { ok(/^M 110 110 L -?[\d.]+ -?[\d.]+ A 98 98 0 [01] 1 -?[\d.]+ -?[\d.]+ Z$/.test(s.d), 'chemin ' + s.d, null); ok(isFinite(s.mx) && isFinite(s.my), 'milieu', null); });
    var g = PM.grilleBarre(d, 290);
    ok(g.cells.length === d && g.cells.every(function (c) { return c.w > 20 && c.h > 20; }), 'grille barre ' + d, null);
    var tb = PM.tranchesBarre(tailles, 290, 70);
    ok(Math.abs(tb.cells[d - 1].x + tb.cells[d - 1].w - 290) < 0.1, 'tranches barre', null);
  });
  var tail = PM.secteurs([1 / 3, 2 / 3], 110, 110, 98);
  ok(/A 98 98 0 1 1/.test(tail[1].d), 'grand arc', null);
  ok(PM.dire(3, 4) === 'trois quarts' && PM.dire(1, 2) === 'un demi' && PM.dire(2, 5) === 'deux cinquièmes', 'dire', null);
  ok(PM.fmtCent(30) === '0,3' && PM.fmtCent(3) === '0,03' && PM.fmtCent(125) === '1,25' && PM.fmtCent(300) === '3', 'fmtCent', null);
  ok(PM.etoiles(8) === 3 && PM.etoiles(5) === 2 && PM.gagnee(5) && !PM.gagnee(4), 'étoiles/victoire', null);
})();

console.log('Questions générées : ' + nbQuestions + ' (' + TIRAGES + ' parties x 3 difficultés x 5 classes x 8 manches)');
console.log('Contrôles : ' + total);
Object.keys(compte).sort().forEach(function (k) { /* répartition */ });
console.log('Types par classe : ' + PM.NIVEAUX.map(function (n) {
  return n + '[' + Object.keys(compte).filter(function (k) { return k.indexOf(n + ':') === 0; }).map(function (k) { return k.split(':')[1]; }).join(',') + ']';
}).join(' '));
if (erreurs.length) { console.log('ECHECS (' + erreurs.length + ' premiers) :'); erreurs.forEach(function (e) { console.log(' - ' + e); }); process.exit(1); }
console.log('0 erreur');
