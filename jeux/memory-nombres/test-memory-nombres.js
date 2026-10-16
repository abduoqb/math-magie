/* Test Node de Mémoire Magique : node jeux/memory-nombres/test-memory-nombres.js */
'use strict';
var M = require('./memory-nombres.js');

var erreurs = [];
function ko(msg) { if (erreurs.length < 25) erreurs.push(msg); erreurs.total = (erreurs.total || 0) + 1; }
var NIV = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
var TIRAGES = 400;

/* Générateur pseudo-aléatoire déterministe (mulberry32). */
function rngGraine(s) {
  return function () {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    var t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ---- Évaluation INDÉPENDANTE du texte d'une carte (ne réutilise rien du générateur) ---- */
var UNITES = { 'zéro': 0, un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9,
  dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16 };
var DIZ = { vingt: 20, trente: 30, quarante: 40, cinquante: 50, soixante: 60 };
function lettresVersNombre(s) {
  if (s === 'cent') return 100;
  if (s in UNITES) return UNITES[s];
  var m;
  if ((m = /^dix-(sept|huit|neuf)$/.exec(s))) return 10 + UNITES[m[1]];
  if (s === 'quatre-vingts') return 80;
  if ((m = /^quatre-vingt-(.+)$/.exec(s))) return 80 + lettresVersNombre(m[1]);
  if (s === 'soixante et onze') return 71;
  if ((m = /^soixante-(.+)$/.exec(s))) return 60 + lettresVersNombre(m[1]);
  if ((m = /^(vingt|trente|quarante|cinquante|soixante) et un$/.exec(s))) return DIZ[m[1]] + 1;
  if ((m = /^(vingt|trente|quarante|cinquante|soixante)-(.+)$/.exec(s))) return DIZ[m[1]] + lettresVersNombre(m[2]);
  if (s in DIZ) return DIZ[s];
  return NaN;
}
function ent(s) { return parseInt(s.replace(/ /g, ''), 10); }
function decNb(s) { return parseFloat(s.replace(/ /g, '').replace(',', '.')); }
var NOMBRE = '(\\d+(?: \\d{3})*(?:,\\d+)?)';
var EXPO = { '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6 };

/** Retourne { v: nombre, genre } ou null si le texte n'est pas reconnu. */
function evaluer(carte) {
  if (carte.points) return { v: carte.points, genre: 'points' };
  var s = carte.texte.replace(/[  ]/g, ' ');
  var m;
  if ((m = /^(\d+) points$/.exec(s))) return { v: +m[1], genre: 'points' };
  if (/^\d+$/.test(s)) return { v: +s, genre: 'nombre' };
  if ((m = /^Double de (\d+)$/.exec(s))) return { v: 2 * m[1], genre: 'double' };
  if ((m = /^Moitié de (\d+)$/.exec(s))) return { v: m[1] / 2, genre: 'moitie' };
  if ((m = /^Le (triple|quadruple) de (\d+)$/.exec(s))) return { v: (m[1] === 'triple' ? 3 : 4) * m[2], genre: 'multiple' };
  if (/^\d+( \d{3})*( \+ \d+( \d{3})*)+$/.test(s)) {
    var termes = s.split(' + ').map(ent);
    var puiss = termes.every(function (x, i) { return /^[1-9]0*$/.test(String(x)) && (i === 0 || x < termes[i - 1]); });
    if (puiss) return { v: termes.reduce(function (a, b) { return a + b; }, 0), genre: 'decomposition', termes: termes };
  }
  if ((m = /^(\d+) \+ (\d+)$/.exec(s))) return { v: +m[1] + +m[2], genre: 'somme', a: +m[1], b: +m[2] };
  if ((m = /^(\d+) − (\d+)$/.exec(s))) return { v: m[1] - m[2], genre: 'difference', a: +m[1], b: +m[2] };
  if ((m = /^(\d+) × (\d+)$/.exec(s))) return { v: m[1] * m[2], genre: 'produit', a: +m[1], b: +m[2] };
  if ((m = /^(\d+) ÷ (\d+)$/.exec(s))) return { v: m[1] / m[2], genre: 'quotient', a: +m[1], b: +m[2], plein: m[1] % m[2] === 0 };
  if ((m = /^(\d+) dizaines? (\d+) unités?$/.exec(s))) return { v: 10 * m[1] + +m[2], genre: 'dizuni' };
  if ((m = /^(\d+) milliers? (\d+) centaines?$/.exec(s))) return { v: 1000 * m[1] + 100 * m[2], genre: 'milliers' };
  if ((m = /^(\d+) centaines?$/.exec(s))) return { v: 100 * m[1], genre: 'centaines' };
  if ((m = /^(\d+) h (pile|et quart|et demie|moins le quart|et (\d+) min)$/.exec(s))) {
    var h = +m[1], min = { pile: 0, 'et quart': 15, 'et demie': 30 }[m[2]];
    if (m[2] === 'moins le quart') { h -= 1; min = 45; } else if (min === undefined) min = +m[3];
    return { v: 'h' + ((h % 12) * 60 + min), genre: 'heure-dite', h: m[1] };
  }
  if ((m = /^(\d+) h (\d\d)$/.exec(s))) return { v: 'h' + (((+m[1]) % 12) * 60 + +m[2]), genre: 'heure-num', H: +m[1] };
  if ((m = /^(\d+) parts? sur (\d+)$/.exec(s))) return { v: m[1] / m[2], genre: 'dessin', n: +m[1], d: +m[2] };
  if ((m = /^(\d+)\/(\d+)$/.exec(s))) return { v: m[1] / m[2], genre: 'fraction', n: +m[1], d: +m[2] };
  if ((m = /^(\d+) \+ (\d)\/10$/.exec(s))) return { v: +m[1] + m[2] / 10, genre: 'entierfrac' };
  if ((m = new RegExp('^' + NOMBRE + ' dixièmes$').exec(s))) return { v: decNb(m[1]) / 10, genre: 'dixiemes' };
  if ((m = new RegExp('^' + NOMBRE + ' centièmes$').exec(s))) return { v: decNb(m[1]) / 100, genre: 'centiemes' };
  if ((m = new RegExp('^' + NOMBRE + ' %$').exec(s))) return { v: decNb(m[1]) / 100, genre: 'pourcent' };
  if ((m = /^10([²³⁴⁵⁶])$/.exec(s))) return { v: Math.pow(10, EXPO[m[1]]), genre: 'puissance' };
  if (/^10( × 10)+$/.test(s)) return { v: Math.pow(10, s.split(' × ').length), genre: 'puissance' };
  if (/^\d+( \d{3})+$/.test(s)) return { v: ent(s), genre: 'nombre' };
  if ((m = new RegExp('^' + NOMBRE + ' ([+−×÷]) ' + NOMBRE + '$').exec(s))) {
    var x = decNb(m[1]), y = decNb(m[3]);
    var r = m[2] === '+' ? x + y : m[2] === '−' ? x - y : m[2] === '×' ? x * y : x / y;
    return { v: r, genre: 'calcul-dec', op: m[2], x: x, y: y };
  }
  if (/^\d+,\d+$/.test(s)) return { v: decNb(s), genre: 'decimal' };
  if (/^[a-zéè -]+$/.test(s)) {
    var n = lettresVersNombre(s);
    if (!isNaN(n)) return { v: n, genre: 'lettres' };
  }
  return null;
}
function egal(a, b) {
  if (typeof a === 'string' || typeof b === 'string') return a === b;
  return Math.abs(a - b) < 1e-9;
}

/* ---- Bornes par classe (valeur maximale d'une carte numérique, etc.) ---- */
var BORNES = { cp: 100, ce1: 1000, ce2: 10000, cm1: 1000000, cm2: 10000000 };
var GENRES_OK = {
  cp: ['points', 'nombre', 'lettres', 'double', 'moitie'],
  ce1: ['nombre', 'lettres', 'dizuni', 'somme', 'difference', 'produit', 'decomposition'],
  ce2: ['nombre', 'produit', 'quotient', 'decomposition', 'centaines', 'milliers', 'heure-dite', 'heure-num'],
  cm1: ['nombre', 'fraction', 'dessin', 'decimal', 'produit', 'multiple', 'dixiemes', 'centiemes', 'entierfrac', 'decomposition'],
  cm2: ['fraction', 'decimal', 'pourcent', 'puissance', 'nombre', 'calcul-dec', 'produit', 'quotient', 'somme', 'difference', 'decomposition']
};

var nbParties = 0, nbPaires = 0;
var DEFI = {};

NIV.forEach(function (niv) {
  [0, 1, 2].forEach(function (diff) {
    var rng = rngGraine(1000 * (NIV.indexOf(niv) + 1) + diff);
    var mode = M.MODES[diff];
    for (var k = 0; k < TIRAGES; k++) {
      var etiq = niv + '/d' + diff + '#' + k;
      var partie;
      try { partie = M.genererPartie(niv, diff, rng); } catch (e) { ko(etiq + ' exception ' + e.message); continue; }
      nbParties++;
      if (partie.cartes.length !== 2 * mode.paires || mode.colonnes * mode.lignes !== partie.cartes.length) ko(etiq + ' mauvais nombre de cartes');
      var vus = {}, valeurs = {};
      partie.cartes.forEach(function (c, i) {
        if (c.id !== i) ko(etiq + ' id incorrect');
        if (vus[c.texte]) ko(etiq + ' texte en double : ' + c.texte);
        vus[c.texte] = true;
        if (typeof c.texte !== 'string' || !c.texte) ko(etiq + ' texte vide');
      });
      // chaque paire : exactement 2 cartes, valeurs équivalentes recalculées, unicité des valeurs
      var parPaire = {};
      partie.cartes.forEach(function (c) { (parPaire[c.paire] = parPaire[c.paire] || []).push(c); });
      Object.keys(parPaire).forEach(function (p) {
        var cs = parPaire[p];
        if (cs.length !== 2) { ko(etiq + ' paire ' + p + ' a ' + cs.length + ' cartes'); return; }
        var e1 = evaluer(cs[0]), e2 = evaluer(cs[1]);
        if (!e1 || !e2) { ko(etiq + ' texte non reconnu : ' + (e1 ? cs[1].texte : cs[0].texte)); return; }
        nbPaires++;
        if (!egal(e1.v, e2.v)) ko(etiq + ' non équivalentes : ' + cs[0].texte + ' / ' + cs[1].texte + ' (' + e1.v + ' vs ' + e2.v + ')');
        var cleV = String(typeof e1.v === 'number' ? Math.round(e1.v * 1e6) / 1e6 : e1.v);
        if (valeurs[cleV]) ko(etiq + ' valeur en double : ' + cleV + ' (' + cs[0].texte + ')');
        valeurs[cleV] = true;
        [e1, e2].forEach(function (e, idx) {
          var texte = cs[idx].texte;
          DEFI[niv + ':' + e.genre] = (DEFI[niv + ':' + e.genre] || 0) + 1;
          if (GENRES_OK[niv].indexOf(e.genre) < 0) ko(etiq + ' genre hors programme : ' + e.genre + ' « ' + texte + ' »');
          if (typeof e.v === 'number') {
            if (e.v > BORNES[niv] || e.v < 0) ko(etiq + ' hors bornes : ' + texte);
            if (niv === 'cp' && e.v > 20 && diff < 2 && e.genre !== 'double') ko(etiq + ' CP > 20 : ' + texte);
            if (niv === 'cp' && e.v > 20) ko(etiq + ' CP > 20 : ' + texte);
          }
          if (e.genre === 'quotient' && niv === 'cm2' && Math.abs(e.v * 100 - Math.round(e.v * 100)) > 1e-6) ko(etiq + ' quotient à plus de 2 décimales : ' + texte);
          if (e.genre === 'quotient' && niv !== 'cm2' && !e.plein) ko(etiq + ' division non entière : ' + texte);
          if (e.genre === 'quotient' && niv !== 'ce2' && niv !== 'cm2') ko(etiq + ' quotient hors CE2 : ' + texte);
          if (e.genre === 'produit' && niv !== 'cm2' && (e.a > 12 || e.b > 12)) ko(etiq + ' produit trop grand : ' + texte);
          if (e.genre === 'produit' && niv === 'ce1' && [2, 3, 4, 5, 10].indexOf(e.a) < 0 && [2, 3, 4, 5, 10].indexOf(e.b) < 0) ko(etiq + ' table CE1 hors programme : ' + texte);
          if (e.genre === 'difference' && e.v < 0) ko(etiq + ' négatif : ' + texte);
          if (e.genre === 'dessin' && (e.n >= e.d || e.n < 1)) ko(etiq + ' fraction impropre : ' + texte);
          if (e.genre === 'decomposition') {
            if (e.termes.length < 2) ko(etiq + ' décomposition à 1 terme : ' + texte);
            for (var i = 1; i < e.termes.length; i++) if (e.termes[i] >= e.termes[i - 1]) ko(etiq + ' décomposition non décroissante : ' + texte);
          }
          if (e.genre === 'calcul-dec' && e.op === '÷' && Math.abs(e.v * 100 - Math.round(e.v * 100)) > 1e-6) ko(etiq + ' division non décimale : ' + texte);
          if (e.genre === 'calcul-dec' && e.v < 0) ko(etiq + ' résultat négatif : ' + texte);
          if (e.genre === 'heure-num' && (e.H < 12 || e.H > 23)) ko(etiq + ' heure inattendue : ' + texte);
          if (e.genre === 'lettres' && niv === 'cp' && e.v > 20) ko(etiq + ' lettres CP > 20 : ' + texte);
          if (/NaN|undefined|Infinity/.test(texte)) ko(etiq + ' texte invalide : ' + texte);
        });
      });
      // déterminisme avec même graine
      if (k === 0) {
        var a = JSON.stringify(M.genererPartie(niv, diff, rngGraine(7)));
        var b = JSON.stringify(M.genererPartie(niv, diff, rngGraine(7)));
        if (a !== b) ko(etiq + ' non déterministe avec rng fixe');
      }
    }
  });
});

/* ---- Moteur : jeu parfait, jeu aléatoire, règles ---- */
function jouerParfait(partie) {
  var etat = M.creerEtat(partie), vu = {};
  var coups = 0;
  partie.cartes.forEach(function () {});
  // stratégie : retourne une inconnue, cherche son partenaire connu sinon une autre inconnue
  var connu = {};
  var garde = 0;
  while (etat.trouvees < etat.nbPaires && garde++ < 500) {
    var cachees = etat.statuts.map(function (s, i) { return s === 'cachee' ? i : -1; }).filter(function (i) { return i >= 0; });
    var i = cachees.filter(function (x) { return !connu[x]; })[0];
    if (i === undefined) i = cachees[0];
    var r = M.retourner(etat, i); connu[i] = true;
    if (r.action === 'ignore') { ko('moteur : clic ignoré à tort'); break; }
    var part = cachees.filter(function (x) { return x !== i && connu[x] && etat.cartes[x].paire === etat.cartes[i].paire; })[0];
    var j = part !== undefined ? part : cachees.filter(function (x) { return x !== i && !connu[x]; })[0];
    var r2 = M.retourner(etat, j); connu[j] = true;
    if (r2.action === 'erreur') M.refermer(etat);
  }
  return etat;
}
var rngM = rngGraine(42);
for (var g = 0; g < 200; g++) {
  var p = M.genererPartie(NIV[g % 5], g % 3, rngM);
  var st = jouerParfait(p);
  if (st.trouvees !== st.nbPaires) ko('moteur : partie parfaite non terminée');
  if (!M.partieGagnee(st.coups, st.nbPaires)) ko('moteur : jeu mémorisé non gagné (' + st.coups + ' coups)');
  if (st.statuts.some(function (s) { return s !== 'trouvee'; })) ko('moteur : cartes non trouvées en fin de partie');
}
// jeu au hasard : doit finir, coups ≥ paires
for (g = 0; g < 100; g++) {
  var q = M.genererPartie('ce2', g % 3, rngM), e = M.creerEtat(q), n = 0;
  while (e.trouvees < e.nbPaires && n++ < 5000) {
    var libres = e.statuts.map(function (s, i) { return s === 'cachee' ? i : -1; }).filter(function (i) { return i >= 0; });
    var res = M.retourner(e, libres[Math.floor(rngM() * libres.length)]);
    if (res.action === 'erreur') M.refermer(e);
  }
  if (e.trouvees !== e.nbPaires || e.coups < e.nbPaires) ko('moteur : partie aléatoire incohérente');
}
// règles : pas de 3e carte pendant une erreur, pas de re-clic
(function () {
  var pa = M.genererPartie('cp', 0, rngGraine(3)), et = M.creerEtat(pa);
  var a = 0, b = pa.cartes.findIndex(function (c, i) { return i > 0 && c.paire !== pa.cartes[0].paire; });
  var c = pa.cartes.findIndex(function (cc, i) { return i !== a && i !== b; });
  if (M.retourner(et, a).action !== 'premiere') ko('règle : première carte');
  if (M.retourner(et, a).action !== 'ignore') ko('règle : re-clic sur la même carte');
  if (M.retourner(et, b).action !== 'erreur') ko('règle : erreur attendue');
  if (M.retourner(et, c).action !== 'ignore') ko('règle : 3e carte pendant l\'erreur');
  if (et.coups !== 1 || et.serie !== 0) ko('règle : compteur de coups');
  M.refermer(et);
  if (et.statuts[a] !== 'cachee' || et.statuts[b] !== 'cachee') ko('règle : refermer');
})();
// score
if (!M.partieGagnee(16, 6) || M.partieGagnee(17, 6)) ko('score : seuil de victoire 6 paires');
if (!M.partieGagnee(24, 10) || M.partieGagnee(25, 10)) ko('score : seuil de victoire 10 paires');
if (M.etoiles(6, 6) !== 3 || M.etoiles(12, 6) !== 2 || M.etoiles(16, 6) !== 1 || M.etoiles(17, 6) !== 0) ko('score : étoiles 6 paires');
// nombres en lettres : cohérence aller-retour 1..100
for (var n2 = 1; n2 <= 100; n2++) if (lettresVersNombre(M.enLettres(n2)) !== n2) ko('lettres : ' + n2 + ' → ' + M.enLettres(n2));
// niveau inconnu → repli
try { M.genererPartie('xx', 1, rngGraine(1)); } catch (e2) { ko('repli niveau inconnu'); }
// Math.random par défaut
try { M.genererPartie('cm2', 2); } catch (e3) { ko('rng par défaut'); }

console.log('Parties générées : ' + nbParties + ' (5 classes × 3 modes × ' + TIRAGES + '), paires vérifiées : ' + nbPaires);
console.log('Genres rencontrés :', JSON.stringify(DEFI));
if (erreurs.total) {
  console.log('ÉCHEC : ' + erreurs.total + ' erreur(s). Premières :');
  erreurs.forEach(function (m) { console.log(' - ' + m); });
  process.exit(1);
}
console.log('OK : 0 erreur');
