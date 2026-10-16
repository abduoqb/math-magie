/* Test Node (sans dépendance) : node jeux/suites-magiques/test-suites-magiques.js */
'use strict';
var assert = require('assert');
var S = require('./suites-magiques.js');

var erreurs = 0;
function verifier(cond, msg) {
  if (!cond) { erreurs++; if (erreurs <= 30) console.error('ECHEC : ' + msg); }
}

// Générateur pseudo-aléatoire reproductible
function graine(s) {
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Recalcul indépendant d'un terme (valeur mise à l'échelle) à partir de la définition
function terme(def, i) {
  switch (def.kind) {
    case 'arith': return def.debut + i * def.pas;
    case 'geo': return def.mode === 'x' ? def.debut * Math.pow(def.r, i) : def.debut / Math.pow(def.r, i);
    case 'carres': return (def.k + i) * (def.k + i);
    case 'alt': return def.debut + Math.floor((i + 1) / 2) * def.a - Math.floor(i / 2) * def.b;
  }
  throw new Error('kind inconnu');
}
function relire(txt) { // inverse de formater
  return parseFloat(txt.replace(/ /g, '').replace(',', '.'));
}

var total = 0, parties = 0;
var vus = {};
S.NIVEAUX.forEach(function (niv) {
  vus[niv] = {};
  for (var d = 0; d < 3; d++) {
    var rng = graine(1000 * (d + 1) + niv.length * 7 + niv.charCodeAt(1));
    for (var p = 0; p < 300; p++) {
      var partie = S.genererPartie(niv, d, rng);
      parties++;
      verifier(partie.length === S.NB_SUITES, 'partie de ' + partie.length + ' suites');
      var sigs = {};
      partie.forEach(function (s, i) {
        total++;
        var ctx = niv + ' d' + d + ' #' + i + ' [' + s.termes.join(' ') + ']';
        var par = S.parametresSuite(d, i);
        vus[niv][s.cle] = true;
        verifier(!sigs[s.signature], 'doublon dans la partie ' + ctx);
        sigs[s.signature] = true;
        var n = s.termes.length;
        verifier(n >= 5 && n <= 7, 'longueur ' + n + ' ' + ctx);
        verifier(s.trous.length === par.nbTrous, 'nb de trous ' + ctx);
        if (par.nbTrous === 2) verifier(n >= 6, '2 trous mais n<6 ' + ctx);
        verifier(s.palier === par.palier, 'palier ' + ctx);
        // trous triés, non voisins, jamais le premier terme
        s.trous.forEach(function (h, j) {
          verifier(h >= 1 && h < n, 'index de trou ' + ctx);
          if (j > 0) verifier(h - s.trous[j - 1] >= 2, 'trous voisins ' + ctx);
        });
        verifier(s.trous.length === s.reponses.length && s.trous.length === s.choix.length, 'tailles ' + ctx);
        // au moins deux nombres visibles côte à côte
        var paires = 0;
        for (var k = 0; k < n - 1; k++) if (s.trous.indexOf(k) < 0 && s.trous.indexOf(k + 1) < 0) paires++;
        verifier(paires >= 1, 'aucune paire visible ' + ctx);
        // termes recalculés indépendamment
        for (k = 0; k < n; k++) {
          var attendu = terme(s.def, k);
          verifier(Number.isInteger(attendu), 'terme non entier (échelle) ' + ctx);
          verifier(Math.abs(attendu / s.def.ech - s.termes[k]) < 1e-9, 'terme ' + k + ' faux ' + ctx);
          verifier(s.termes[k] >= 0, 'terme négatif ' + ctx);
          verifier(s.termes[k] <= S.BORNES[niv], 'terme hors borne ' + s.termes[k] + ' ' + ctx);
          verifier(Math.abs(relire(S.formater(s.termes[k])) - s.termes[k]) < 1e-9, 'formater ' + ctx);
        }
        // décimaux seulement en CM1/CM2
        var decimal = s.termes.some(function (v) { return !Number.isInteger(v); });
        if (niv === 'cp' || niv === 'ce1' || niv === 'ce2') verifier(!decimal, 'décimal hors CM ' + ctx);
        if (niv === 'cp') verifier(s.def.kind === 'arith', 'CP : règle non arithmétique ' + ctx);
        // réponses et propositions
        s.trous.forEach(function (h, j) {
          var bonne = s.reponses[j];
          verifier(bonne === s.termes[h], 'réponse ≠ terme ' + ctx);
          var c = s.choix[j];
          verifier(c.length === 4, '4 choix ' + ctx);
          verifier(c.filter(function (v) { return Math.abs(v - bonne) < 1e-9; }).length === 1, 'bonne réponse absente/dupliquée ' + ctx);
          var uniq = {};
          c.forEach(function (v) {
            verifier(!uniq[v], 'doublon de choix ' + ctx); uniq[v] = true;
            verifier(v >= 0 && v <= S.BORNES[niv], 'choix hors borne ' + v + ' ' + ctx);
            verifier(Number.isInteger(Math.round(v * s.def.ech * 1e6) / 1e6), 'choix mal échelonné ' + ctx);
            verifier(Math.abs(relire(S.formater(v)) - v) < 1e-9, 'formater choix ' + ctx);
          });
          verifier(S.verifierSaisie(S.formater(bonne), bonne), 'saisie de la bonne réponse refusée ' + ctx);
        });
        verifier(typeof s.regle === 'string' && s.regle.length > 8, 'règle vide ' + ctx);
        verifier(typeof s.indice === 'string' && s.indice.length > 8, 'indice vide ' + ctx);
        verifier(typeof s.indice2 === 'string' && s.indice2.length > 8, 'indice2 vide ' + ctx);
        verifier(s.saisie === (d === 2 && (niv === 'cm1' || niv === 'cm2')), 'mode saisie ' + ctx);
        verifier(S.texteLecture(s).indexOf('le nombre qui manque') >= 0, 'texte de lecture ' + ctx);
      });
    }
  }
});

// Cas particuliers de la saisie
assert.ok(S.verifierSaisie('2,5', 2.5));
assert.ok(S.verifierSaisie('2.50', 2.5));
assert.ok(S.verifierSaisie('1 250', 1250));
assert.ok(S.verifierSaisie('1 250', 1250));
assert.ok(!S.verifierSaisie('', 0));
assert.ok(!S.verifierSaisie('abc', 1));
assert.ok(!S.verifierSaisie('2,6', 2.5));
assert.ok(!S.verifierSaisie('-3', 3));
assert.strictEqual(S.formater(1250000), '1 250 000');
assert.strictEqual(S.formater(0.25), '0,25');
assert.strictEqual(S.etoiles(10), 3); assert.strictEqual(S.etoiles(8), 2);
assert.strictEqual(S.etoiles(6), 1); assert.strictEqual(S.etoiles(5), 0);
assert.ok(S.estGagnee(6) && !S.estGagnee(5));

// Reproductibilité avec un rng injecté, et rng par défaut
var a = S.genererPartie('cm2', 2, graine(42)).map(function (s) { return s.signature; }).join('|');
var b = S.genererPartie('cm2', 2, graine(42)).map(function (s) { return s.signature; }).join('|');
assert.strictEqual(a, b);
assert.strictEqual(S.genererPartie('ce1', 1).length, 10);
assert.strictEqual(S.genererSuite('inconnu', 0).niveau, 'ce2');

S.NIVEAUX.forEach(function (n) { console.log(n + ' : règles vues = ' + Object.keys(vus[n]).join(', ')); });
console.log(parties + ' parties, ' + total + ' suites contrôlées, ' + erreurs + ' erreur(s).');
process.exit(erreurs ? 1 : 0);
