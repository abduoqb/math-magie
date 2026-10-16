/* Test Node (sans dépendance) du générateur « Au Marché des Sorciers ».
   Lancer : node jeux/marche/test-marche.js */
'use strict';
const M = require('./marche.js');

const TIRAGES = 300;
let erreurs = 0, verifs = 0;
function ko(msg, ctx) {
  erreurs++;
  if (erreurs <= 25) console.log('ERREUR', ctx, msg);
}
function ok(cond, msg, ctx) { verifs++; if (!cond) ko(msg, ctx); }

// rng déterministe (mulberry32)
function graine(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const total = (arts) => arts.reduce((s, a) => s + a.prix * a.qte, 0);
const unites = { cp: 100, ce1: 10, ce2: 1, cm1: 1, cm2: 1 };
const eur = (c) => c / 100;

function verifierQuestion(q, niveau, diff, i) {
  const ctx = niveau + '/' + diff + '/m' + i + '/' + q.type;
  const max = M.MAX_MONTANT[niveau];
  const u = unites[niveau];
  ok(q.type === M.PLAN[niveau][diff][i], 'type différent du plan', ctx);
  ok(typeof q.consigne === 'string' && q.consigne.length > 3, 'consigne absente', ctx);
  ok(typeof q.voix === 'string' && q.voix.length > 3, 'voix absente', ctx);
  ok(typeof q.indice === 'string' && typeof q.explication === 'string', 'indice/explication absents', ctx);
  ok(!/NaN|undefined|null|\d\.\d/.test(q.consigne + q.explication), 'texte suspect : ' + q.consigne + ' | ' + q.explication, ctx);
  if (niveau === 'cp') ok(q.consigne.length <= 80, 'consigne CP trop longue', ctx);

  if (q.articles) {
    q.articles.forEach((a) => {
      ok(Number.isInteger(a.prix) && a.prix > 0 && a.prix % u === 0, 'prix non entier / hors unité', ctx);
      ok(a.qte >= 1 && Number.isInteger(a.qte), 'quantité', ctx);
    });
    const ids = q.articles.map((a) => a.id);
    ok(new Set(ids).size === ids.length, 'article en double', ctx);
  }

  if (q.mode === 'composer') {
    ok(Array.isArray(q.denoms) && q.denoms.length > 0, 'pas de pièces', ctx);
    ok(q.denoms.every((d) => M.DENOMS[niveau].indexOf(d) >= 0 && d <= q.cible), 'pièce interdite ou trop grande', ctx);
    ok(q.cible > 0 && q.cible % u === 0 && q.cible <= max, 'cible hors bornes', ctx);
    // la somme est réalisable avec les pièces proposées et par peu de pièces
    const sol = M.solutionMinimale(q.cible, q.denoms);
    ok(sol !== null, 'somme irréalisable', ctx);
    ok(sol && sol.length <= M.MAX_PIECES, 'trop de pièces nécessaires : ' + (sol && sol.length), ctx);
    ok(sol && M.verifierComposition(q, sol), 'solution minimale non validée', ctx);
    ok(!M.verifierComposition(q, sol.concat([q.denoms[0]])), 'composition fausse acceptée', ctx);
    // recalcul indépendant de la cible
    if (q.type === 'payer') {
      ok(q.cible === total(q.articles), 'cible ≠ somme des prix', ctx);
      ok(q.cible === q.articles.reduce((s, a) => s + a.prix * a.qte, 0), 'cible', ctx);
    } else if (q.type === 'rendre') {
      ok(q.cible === q.paye - total(q.articles), 'rendu ≠ billet − prix', ctx);
      ok([500, 1000, 2000, 5000].indexOf(q.paye) >= 0, 'billet inconnu', ctx);
      ok(q.cible > 0, 'rendu nul', ctx);
    }
    if (niveau === 'cp') ok(q.cible <= 2000 && q.articles.every((a) => a.prix <= 1000) && q.denoms.every((d) => [100, 200, 500, 1000].indexOf(d) >= 0), 'bornes CP', ctx);
    if (niveau === 'cp' && diff === 'facile') ok(q.denoms.every((d) => d <= 200) && q.cible <= 500, 'CP facile : pièces 1 et 2 €', ctx);
    if (niveau === 'ce1') ok(q.cible <= 5000 && q.denoms.every((d) => d <= 2000), 'bornes CE1', ctx);
  } else {
    // QCM : bonne réponse présente et unique, pas de doublon
    ok(Array.isArray(q.choix) && q.choix.length >= 2, 'pas de choix', ctx);
    const vals = q.choix.map((c) => c.valeur);
    const labs = q.choix.map((c) => c.label);
    ok(new Set(vals).size === vals.length, 'valeurs en double', ctx);
    ok(new Set(labs).size === labs.length, 'libellés en double', ctx);
    ok(q.bonne >= 0 && q.bonne < q.choix.length && q.choix[q.bonne].valeur === q.reponse, 'index de bonne réponse', ctx);
    ok(vals.filter((v) => v === q.reponse).length === 1, 'bonne réponse non unique', ctx);
    if (typeof q.reponse === 'number' && q.type !== 'budget') {
      vals.forEach((v) => ok(Number.isInteger(v) && v > 0 && v <= max && v % u === 0, 'proposition hors bornes ' + v, ctx));
    }
    if (niveau === 'cp') ok(q.choix.length === 3, 'CP : 3 propositions', ctx);
  }

  // vérification indépendante de la réponse selon le type
  switch (q.type) {
    case 'compter': {
      ok(q.reponse === q.pieces.reduce((s, v) => s + v, 0), 'somme des pièces', ctx);
      ok(q.pieces.every((v) => M.DENOMS[niveau].indexOf(v) >= 0), 'pièce inconnue', ctx);
      ok(q.pieces.length >= 2 && q.pieces.length <= 6, 'nb de pièces', ctx);
      break;
    }
    case 'rendre': { // mode choix
      if (q.mode === 'choix') {
        ok(q.reponse === q.paye - total(q.articles), 'rendu choix', ctx);
        ok(q.paye <= (niveau === 'cp' ? 1000 : 2000), 'billet trop gros', ctx);
      }
      break;
    }
    case 'achats': {
      const t = total(q.articles);
      ok((t <= q.budget ? 'oui' : 'non') === q.reponse, 'achats oui/non', ctx);
      ok(q.budget % 100 === 0 && q.budget > 0 && q.budget <= max, 'budget', ctx);
      ok(Math.abs(t - q.budget) <= 400, 'budget trop loin du total', ctx);
      break;
    }
    case 'comparer': {
      const a = total(q.paniers[0]), b = total(q.paniers[1]);
      let att;
      if (a === b) att = 'egal';
      else if (q.dir === 'moins') att = a < b ? 'A' : 'B';
      else att = a > b ? 'A' : 'B';
      ok(att === q.reponse, 'comparaison', ctx);
      const ids = q.paniers[0].concat(q.paniers[1]).map((x) => x.id);
      ok(new Set(ids).size === ids.length, 'article répété entre paniers', ctx);
      ok(a <= max && b <= max, 'panier trop cher', ctx);
      break;
    }
    case 'remise': {
      const p = q.prixUnitaire;
      let paye = 0; // simulation objet par objet : le 3e de chaque groupe est offert
      for (let k = 1; k <= q.n; k++) if (k % 3 !== 0) paye += p;
      ok(paye === q.reponse, 'remise 2 achetés = 1 offert', ctx);
      ok(q.n >= 3 && q.n <= 8, 'nb objets', ctx);
      break;
    }
    case 'pourcent': {
      const P = q.prixInitial;
      ok((P * q.pourcentage) % 100 === 0, 'pourcentage non entier en centimes', ctx);
      const remise = (P * q.pourcentage) / 100;
      ok([10, 25, 50].indexOf(q.pourcentage) >= 0, 'pourcentage inconnu', ctx);
      ok(q.reponse === (q.variante === 'prix' ? P - remise : remise), 'pourcentage', ctx);
      break;
    }
    case 'unitaire': {
      if (q.variante === 'unite') {
        ok(q.total % q.n === 0 && q.reponse === q.total / q.n, 'prix unitaire', ctx);
      } else {
        ok(q.total % q.n === 0 && q.reponse === (q.total / q.n) * q.n2 && q.n2 !== q.n, 'proportionnalité', ctx);
      }
      break;
    }
    case 'budget': {
      let n = 0, reste = q.budget;
      while (reste >= q.prixUnitaire) { reste -= q.prixUnitaire; n++; }
      ok(n === q.reponse && n >= 2, 'budget', ctx);
      ok(q.choix.every((c) => c.valeur >= 1), 'proposition < 1', ctx);
      break;
    }
    case 'payer': case 'rendre_composer': break;
    default: break;
  }
}

let nbQuestions = 0;
const typesVus = {};
M.NIVEAUX.forEach((niveau, ni) => {
  M.DIFFS.forEach((diff, di) => {
    const rng = graine(1000 * (ni + 1) + 77 * (di + 1));
    for (let t = 0; t < TIRAGES; t++) {
      let partie;
      try { partie = M.genererPartie(niveau, diff, rng); } catch (e) { ko('exception : ' + e.stack, niveau + '/' + diff); continue; }
      ok(partie.length === M.NB_MANCHES, '6 manches', niveau + '/' + diff);
      partie.forEach((q, i) => {
        nbQuestions++;
        typesVus[q.type] = (typesVus[q.type] || 0) + 1;
        try { verifierQuestion(q, niveau, diff, i); } catch (e) { ko('exception : ' + e.stack, niveau + '/' + diff + '/' + i); }
      });
    }
  });
});

// Formats français
const fm = M.formaterMontant;
ok(fm(250, 'ce2') === '2,50 €', 'format 2,50', 'format');
ok(fm(345, 'cm1') === '3,45 €', 'format 3,45', 'format');
ok(fm(205, 'cm1') === '2,05 €', 'format 2,05', 'format');
ok(fm(50, 'ce2') === '0,50 €', 'format 0,50', 'format');
ok(fm(50, 'ce1') === '50 c', 'format 50 c', 'format');
ok(fm(350, 'ce1') === '3 € 50 c', 'format 3 € 50 c', 'format');
ok(fm(400, 'cp') === '4 €', 'format 4 €', 'format');
ok(M.voixMontant(100) === '1 euro' && M.voixMontant(250) === '2 euros 50', 'voix', 'format');

// SVG pour toutes les pièces et billets
[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000].forEach((v) => {
  const s = M.svgMonnaie(v);
  ok(/^<svg[\s\S]*<\/svg>$/.test(s) && (s.match(/<svg/g) || []).length === 1, 'svg ' + v, 'svg');
  ok(M.nomMonnaie(v).length > 5, 'nom ' + v, 'svg');
});
ok(M.svgMonnaie(3) === '', 'svg inconnu', 'svg');

// Score
ok(M.gagnee(4) && !M.gagnee(3), 'gagnee', 'score');
ok(M.etoiles(6) === 3 && M.etoiles(4) === 2 && M.etoiles(0) === 0, 'étoiles', 'score');

// Valeurs par défaut (Math.random, niveau/difficulté inconnus)
ok(M.genererPartie().length === 6 && M.genererPartie('zz', 'zz').length === 6, 'défauts', 'defauts');

// Tous les types attendus apparaissent
['payer', 'rendre', 'compter', 'achats', 'comparer', 'remise', 'pourcent', 'unitaire', 'budget'].forEach((t) =>
  ok(typesVus[t] > 0, 'type jamais généré : ' + t, 'couverture'));

console.log('Questions générées :', nbQuestions, '(' + M.NIVEAUX.length + ' classes × 3 difficultés × ' + TIRAGES + ' parties)');
console.log('Types :', JSON.stringify(typesVus));
console.log('Vérifications :', verifs, '- erreurs :', erreurs);
process.exit(erreurs ? 1 : 0);
