/* Test Node du Compte Magique : node jeux/compte-magique/test-compte-magique.js */
'use strict';
const CM = require('./compte-magique.js');

const NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
const TIRAGES = 400;
let erreurs = 0, controles = 0;

function ko(msg) { erreurs++; if (erreurs <= 25) console.log('ECHEC : ' + msg); }
function verif(cond, msg) { controles++; if (!cond) ko(msg); }

// générateur pseudo-aléatoire reproductible
function graine(s) {
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// calcul indépendant (sans appliquer) : null si interdit
function calc(a, op, b, cfg) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 1) return null;
  if (op === '+') return a + b;
  if (op === '-') return a > b ? a - b : null;
  if (op === '*') {
    if (cfg.facteurs && !cfg.facteurs.includes(a) && !cfg.facteurs.includes(b)) return null;
    return a * b;
  }
  if (op === '/') return a % b === 0 ? a / b : null;
  return null;
}

// rejoue une solution : retourne true si elle est valide et atteint la cible
function rejouer(cartes, solution, cible, cfg, etiquette) {
  const main = cartes.slice();
  let atteint = false;
  for (const p of solution) {
    verif(cfg.ops.includes(p.op), etiquette + ' opération interdite ' + p.op);
    const ia = main.indexOf(p.a);
    verif(ia >= 0, etiquette + ' nombre ' + p.a + ' absent');
    if (ia < 0) return false;
    main.splice(ia, 1);
    const ib = main.indexOf(p.b);
    verif(ib >= 0, etiquette + ' nombre ' + p.b + ' absent');
    if (ib < 0) return false;
    main.splice(ib, 1);
    const r = calc(p.a, p.op, p.b, cfg);
    verif(r !== null && r === p.r && Number.isInteger(r) && r >= 1, etiquette + ' résultat faux ' + p.a + p.op + p.b + '=' + p.r);
    if (r === null) return false;
    main.push(r);
    if (r === cible) atteint = true;
  }
  return atteint;
}

const stats = {};
for (const niveau of NIVEAUX) {
  for (let d = 0; d < 3; d++) {
    const cfg = CM.config(niveau, d);
    const rng = graine(1000 * (NIVEAUX.indexOf(niveau) + 1) + d);
    const cle = niveau + '/' + d;
    stats[cle] = { requis: 0, maxCarte: 0, minCible: 1e9, maxCible: 0 };
    for (let i = 0; i < TIRAGES; i++) {
      const et = cle + '#' + i;
      let m;
      try { m = CM.genererManche(niveau, d, rng); } catch (e) { ko(et + ' exception ' + e.message); continue; }
      verif(m.cartes.length === cfg.cartes, et + ' nombre de cartes ' + m.cartes.length);
      verif(m.cartes.every(v => Number.isInteger(v) && v >= 1 && v <= cfg.valMax), et + ' carte hors bornes ' + m.cartes);
      verif(Number.isInteger(m.cible) && m.cible >= cfg.cible[0] && m.cible <= cfg.cible[1], et + ' cible hors bornes ' + m.cible);
      verif(!m.cartes.includes(m.cible), et + ' la cible est déjà une carte');
      verif(m.solution.length === cfg.cartes - 1, et + ' longueur de solution');
      verif(rejouer(m.cartes, m.solution, m.cible, cfg, et + ' solution connue'), et + ' solution connue invalide');
      if (cfg.requis && m.solution.some(p => p.op === cfg.requis)) stats[cle].requis++;
      stats[cle].maxCarte = Math.max(stats[cle].maxCarte, ...m.cartes);
      stats[cle].minCible = Math.min(stats[cle].minCible, m.cible);
      stats[cle].maxCible = Math.max(stats[cle].maxCible, m.cible);

      // solveur indépendant
      const s = CM.resoudre(m.cartes, m.cible, cfg);
      verif(s !== null, et + ' non résoluble');
      if (s) verif(rejouer(m.cartes, s, m.cible, cfg, et + ' solveur'), et + ' solution du solveur invalide');

      // jeu complet via l'état : indice, annuler, recommencer, victoire
      const etat = CM.creerEtat(m);
      const h = CM.indice(etat);
      verif(h !== null && etat.cartes.some(c => c.id === h.idA) && etat.cartes.some(c => c.id === h.idB) && h.idA !== h.idB, et + ' indice invalide');
      verif(CM.resoluble(etat), et + ' état initial non résoluble');
      if (i % 5 === 0) {
        // coup volontairement quelconque puis annuler / recommencer
        const a = etat.cartes[0].id, b = etat.cartes[1].id;
        const op = cfg.ops[0];
        const avant = JSON.stringify(etat.cartes);
        const r = CM.jouer(etat, a, op, b);
        if (r.ok) {
          verif(etat.cartes.length === cfg.cartes - 1, et + ' une carte de moins');
          verif(CM.annuler(etat) && JSON.stringify(etat.cartes) === avant, et + ' annuler');
          CM.jouer(etat, a, op, b);
          CM.recommencer(etat);
          verif(JSON.stringify(etat.cartes) === avant && etat.historique.length === 0, et + ' recommencer');
        }
      }
      // on suit les indices successifs jusqu'à la victoire
      let garde = 0;
      while (!etat.gagne && garde++ < 10) {
        const ind = CM.indice(etat);
        if (!ind) { ko(et + ' indice nul en cours de partie'); break; }
        const r = CM.jouer(etat, ind.idA, ind.op, ind.idB);
        verif(r.ok, et + ' coup d\'indice refusé');
        if (!r.ok) break;
        verif(etat.cartes.every(c => Number.isInteger(c.v) && c.v >= 1), et + ' carte non entière positive');
      }
      verif(etat.gagne && etat.cartes.some(c => c.v === m.cible), et + ' victoire non atteinte');
    }
  }
}

// règles d'opération
const cfgCE1 = CM.config('ce1', 2);
verif(!CM.appliquer(3, '*', 4, cfgCE1).ok, 'CE1 : 3 × 4 doit être refusé');
verif(CM.appliquer(3, '*', 5, cfgCE1).valeur === 15, 'CE1 : 3 × 5');
verif(!CM.appliquer(3, '-', 5, cfgCE1).ok, '3 − 5 refusé');
verif(!CM.appliquer(5, '-', 5, cfgCE1).ok, '5 − 5 refusé');
verif(!CM.appliquer(7, '/', 2, CM.config('cm1', 2)).ok, '7 ÷ 2 refusé');
verif(CM.appliquer(8, '/', 2, CM.config('cm1', 2)).valeur === 4, '8 ÷ 2');
verif(!CM.appliquer(2, '*', 3, CM.config('cp', 2)).ok, 'CP : pas de ×');

// contenu par classe : opérations
verif(CM.config('cp', 2).ops.join('') === '+-', 'CP : + et − seulement');
verif(CM.config('cm1', 2).ops.includes('/') && CM.config('cm2', 2).cartes === 5, 'CM1 ÷ et CM2 5 cartes');

// score
const resu = CM.resumerPartie([
  { reussie: true, indices: 0 }, { reussie: true, indices: 1 }, { reussie: false, indices: 0 },
  { reussie: true, indices: 0 }, { reussie: false, indices: 2 }
]);
verif(resu.reussies === 3 && resu.sansIndice === 2 && resu.gagnee && resu.etoiles === 3 + 2 + 3, 'résumé de partie');
verif(!CM.resumerPartie([{ reussie: true, indices: 0 }, { reussie: true, indices: 0 }]).gagnee, 'moins de 3 manches : perdue');

console.log('Tirages : ' + (TIRAGES * 15) + ' manches (5 classes x 3 difficultés x ' + TIRAGES + ')');
Object.keys(stats).forEach(k => {
  const s = stats[k];
  console.log('  ' + k + ' : cible ' + s.minCible + '-' + s.maxCible + ', carte max ' + s.maxCarte + ', opération-clé présente ' + Math.round(100 * s.requis / TIRAGES) + ' %');
});
console.log(controles + ' contrôles, ' + erreurs + ' erreur(s)');
process.exit(erreurs ? 1 : 0);
