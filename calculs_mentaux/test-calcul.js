/**
 * Test du générateur de calcul mental (calculs_mentaux/js/generateur_calcul.js).
 *
 * Pour CHAQUE classe (cp..cm2), CHAQUE opération active et CHAQUE palier, on tire 200 calculs
 * et on vérifie les invariants documentés dans l'en-tête du générateur et dans le README :
 *  - résultat fini ;
 *  - soustractions : jamais de résultat négatif ;
 *  - additions : bornes respectées (cp/ce1/ce2/cm2 : bornes du RÉSULTAT ; cm1 : bornes de CHAQUE
 *    TERME via BORNES_PAR_TERME) ;
 *  - retenue annoncée (p.retenue) effectivement présente (aRetenueAddition / aRetenueSoustraction),
 *    en tolérant le repli `approx:true` après 6000 essais (l'invariant principal reste vérifié) ;
 *  - divisions : quotient*diviseur + reste == dividende et 0 <= reste < diviseur ; avec décimaux>0,
 *    pas de reste et quotient exact ;
 *  - décimaux : formatage avec virgule, jamais de point.
 *
 * Lancer : node calculs_mentaux/test-calcul.js
 */
'use strict';

const assert = require('node:assert');

// Les programmes posent window.PROGRAMMES : sous Node, window == global.
global.window = global;

const API = require('./js/generateur_calcul.js');

const CLASSES = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
const TIRAGES = 200;

for (const classe of CLASSES) require('../programmes/' + classe + '.js');
const PROGS = global.PROGRAMMES;

/* ---------- Petit harnais (assert node, mais on cumule les échecs) ---------- */

let verifs = 0;
let nbEchecs = 0;
const messages = [];

function verif(cond, msg) {
  verifs++;
  if (cond) return;
  nbEchecs++;
  if (messages.length < 40) messages.push(msg);
  try { assert.ok(cond, msg); } catch (e) { /* comptabilisé, on continue */ }
}

const estFini = (n) => typeof n === 'number' && isFinite(n);
function pasDePoint(v) {
  if (Array.isArray(v)) return v.every((x) => String(x).indexOf('.') === -1);
  return String(v).indexOf('.') === -1;
}

/* ---------- Vérificateurs par opération ---------- */

function verifAddition(classe, p, r, ctx) {
  const k = p.termes || 2;
  const d = p.decimaux || 0;
  const s = Math.pow(10, d);
  verif(Array.isArray(r.termes) && r.termes.length === k, ctx + ' : nombre de termes (' + (r.termes || []).length + ' != ' + k + ')');
  verif(Array.isArray(r.brut) && r.brut.length === k, ctx + ' : champ brut absent');
  const parTerme = !!API.BORNES_PAR_TERME[classe];
  if (parTerme) {
    (r.brut || []).forEach((scaled, i) => {
      const v = scaled / s;
      verif(v >= p.min && v <= p.max, ctx + ' : terme ' + i + '=' + v + ' hors [' + p.min + ',' + p.max + '] (bornes par terme)');
    });
  } else {
    verif(r.resultat >= p.min && r.resultat <= p.max, ctx + ' : résultat ' + r.resultat + ' hors [' + p.min + ',' + p.max + ']');
  }
  if (Array.isArray(r.brut)) {
    const somme = r.brut.reduce((a, b) => a + b, 0);
    verif(Math.abs(r.resultat - somme / s) < 1e-9, ctx + ' : résultat != somme des termes');
  }
  if (p.retenue && !r.approx) {
    verif(API.aRetenueAddition(r.brut) === true, ctx + ' : retenue annoncée mais absente');
  }
  if (d > 0) verif(pasDePoint(r.termes), ctx + ' : décimaux au point (attendu virgule) ' + JSON.stringify(r.termes));
}

function verifSoustraction(classe, p, r, ctx) {
  const k = p.termes || 2;
  const d = p.decimaux || 0;
  const s = Math.pow(10, d);
  verif(Array.isArray(r.termes) && r.termes.length === k, ctx + ' : nombre de termes (' + (r.termes || []).length + ' != ' + k + ')');
  verif(r.resultat >= 0, ctx + ' : résultat négatif (' + r.resultat + ')');
  if (Array.isArray(r.brut)) {
    const res = r.brut.slice(1).reduce((a, b) => a - b, r.brut[0]);
    verif(Math.abs(r.resultat - res / s) < 1e-9, ctx + ' : résultat != différence des termes');
  }
  if (p.retenue && !r.approx) {
    verif(API.aRetenueSoustraction(r.brut) === true, ctx + ' : emprunt annoncé mais absent');
  }
  if (d > 0) verif(pasDePoint(r.termes), ctx + ' : décimaux au point (attendu virgule) ' + JSON.stringify(r.termes));
}

function verifMultiplication(classe, p, r, ctx) {
  const d = p.decimaux || 0;
  const s = Math.pow(10, d);
  const aVal = r.A / s;
  verif(aVal >= p.a[0] && aVal <= p.a[1], ctx + ' : a=' + aVal + ' hors [' + p.a + ']');
  verif(r.B >= p.b[0] && r.B <= p.b[1], ctx + ' : b=' + r.B + ' hors [' + p.b + ']');
  verif(Math.abs(r.resultat - (r.A * r.B) / s) < 1e-9, ctx + ' : résultat != A*B');
  if (d > 0) verif(pasDePoint(r.a), ctx + ' : décimaux au point (attendu virgule) ' + r.a);
}

function verifDivision(classe, p, r, ctx) {
  const k = p.decimaux || 0;
  const sk = Math.pow(10, k);
  verif(r.diviseur >= p.diviseur[0] && r.diviseur <= p.diviseur[1], ctx + ' : diviseur=' + r.diviseur + ' hors [' + p.diviseur + ']');
  const Q = Math.round(r.quotient * sk);
  verif(Math.abs(r.quotient - Q / sk) < 1e-9, ctx + ' : quotient non conforme (' + r.quotient + ')');
  verif(Q / sk >= p.quotient[0] && Q / sk <= p.quotient[1], ctx + ' : quotient ' + (Q / sk) + ' hors [' + p.quotient + ']');
  if (k === 0) {
    verif(Number.isInteger(r.reste) && r.reste >= 0 && r.reste < r.diviseur, ctx + ' : reste ' + r.reste + ' hors [0,' + r.diviseur + ')');
    verif(r.quotient * r.diviseur + r.reste === r.dividende, ctx + ' : quotient*diviseur+reste != dividende');
    if (p.reste && r.diviseur >= 2) verif(r.reste >= 1, ctx + ' : reste attendu > 0 (p.reste=true)');
    verif(r.avecReste === (r.reste > 0), ctx + ' : avecReste incohérent avec le reste');
  } else {
    verif(r.reste === 0, ctx + ' : reste non nul pour une division décimale');
    verif(Q * r.diviseur === r.dividende, ctx + ' : division décimale non exacte');
  }
  if (k > 0) verif(pasDePoint(r.a), ctx + ' : décimaux au point (attendu virgule) ' + r.a);
}

/* ---------- Boucle principale ---------- */

verif(!!PROGS, 'window.PROGRAMMES non chargé');
verif(CLASSES.every((c) => PROGS && PROGS[c]), 'les 5 programmes ne sont pas tous chargés');

for (const classe of CLASSES) {
  const prog = PROGS[classe];
  if (!prog) continue;
  const ops = prog.calcul || {};
  for (const op of Object.keys(ops)) {
    const def = ops[op];
    if (!def || !def.actif) continue;
    const niveaux = def.niveaux || [];
    verif(niveaux.length > 0, classe + '/' + op + ' : mission active sans palier');
    for (let pi = 0; pi < niveaux.length; pi++) {
      const p = niveaux[pi];
      for (let t = 0; t < TIRAGES; t++) {
        const ctx = classe + '/' + op + '/p' + (pi + 1) + '/t' + t;
        let r;
        try {
          r = API.generer(op, prog, pi + 1, classe);
        } catch (e) {
          verif(false, ctx + ' : exception « ' + e.message + ' »');
          continue;
        }
        verif(estFini(r.resultat), ctx + ' : résultat non fini (' + r.resultat + ')');
        if (op === 'additions') verifAddition(classe, p, r, ctx);
        else if (op === 'soustractions') verifSoustraction(classe, p, r, ctx);
        else if (op === 'multiplications') verifMultiplication(classe, p, r, ctx);
        else if (op === 'divisions') verifDivision(classe, p, r, ctx);
      }
    }
  }
}

/* ---------- Quelques contrôles de surface ---------- */

verif(API.format(305, 2) === '3,05', 'format(305,2) devrait donner 3,05');
verif(API.format(1234, 0) === '1234', 'format entier');
verif(API.BORNES_PAR_TERME.cm1 === true, 'cm1 doit être borné par terme');
verif(!API.BORNES_PAR_TERME.cp && !API.BORNES_PAR_TERME.ce1 && !API.BORNES_PAR_TERME.ce2 && !API.BORNES_PAR_TERME.cm2, 'seul cm1 doit être borné par terme');

/* ---------- Résumé ---------- */

console.log(verifs + ' vérifications sur les tirages, ' + nbEchecs + ' échec(s).');
if (messages.length) {
  console.log('Échecs (' + nbEchecs + '), premiers cas :');
  messages.forEach((m) => console.log('  - ' + m));
}
process.exit(nbEchecs ? 1 : 0);
