/* Test Node de ranger.js : node jeux/ranger/test-ranger.js */
'use strict';
const R = require('./ranger.js');
const NIV = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
const N = 400;
let erreurs = 0, total = 0;
function ko(msg, ctx) { erreurs++; if (erreurs <= 25) console.log('ERREUR', msg, ctx ? JSON.stringify(ctx) : ''); }
function verif(c, msg, ctx) { if (!c) ko(msg, ctx); }

// générateur pseudo-aléatoire reproductible
function graine(s) { return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// évaluateur indépendant d'un texte affiché
function evalTexte(t) {
  const s = t.replace(/\s/g, '');
  const num = x => Number(x.replace(',', '.'));
  let m;
  if ((m = /^(\d+)%de(\d+)$/.exec(s))) return num(m[1]) * num(m[2]) / 100;
  if ((m = /^(\d+)%$/.exec(s))) return num(m[1]) / 100;
  if ((m = /^(\d+)\/(\d+)$/.exec(s))) return num(m[1]) / num(m[2]);
  if ((m = /^([\d,]+)([+−×÷])([\d,]+)$/.exec(s))) {
    const a = num(m[1]), b = num(m[3]);
    return m[2] === '+' ? a + b : m[2] === '−' ? a - b : m[2] === '×' ? a * b : a / b;
  }
  if (/^[\d,]+$/.test(s)) return num(s);
  return NaN;
}
const proche = (a, b) => Math.abs(a - b) < 1e-6;

function controleItem(it, niv, ctx) {
  const v = evalTexte(it.texte);
  verif(!isNaN(v) && proche(v, it.v), 'valeur du texte', { t: it.texte, v: it.v, ctx });
  verif(it.v >= 0 && it.v <= R.BORNES[niv] + 1e-9, 'hors bornes', { t: it.texte, niv });
  if (niv === 'cp' || niv === 'ce1' || niv === 'ce2') verif(!/[,\/%]/.test(it.texte), 'décimal/fraction avant le CM1', { t: it.texte, niv });
  if (niv === 'cp') verif(/^\d+$/.test(it.texte), 'CP: chiffres seulement', { t: it.texte });
  if (niv === 'cm1') verif(!/%/.test(it.texte), 'CM1: pas de pourcentage', { t: it.texte });
  verif(!/\./.test(it.texte), 'point décimal', { t: it.texte });
}

function testOrdre(m, niv, d) {
  const attendu = R.NB_CARTES[niv][R.palier(d, undefined)];
  verif(m.items.length === attendu, 'nb cartes', { n: m.items.length, attendu });
  m.items.forEach(it => controleItem(it, niv, 'ordre'));
  const vals = m.items.map(i => evalTexte(i.texte));
  for (let i = 0; i < vals.length; i++) for (let j = i + 1; j < vals.length; j++) {
    verif(!proche(vals[i], vals[j]), 'deux cartes égales', { a: m.items[i].texte, b: m.items[j].texte });
    verif(m.items[i].texte !== m.items[j].texte, 'doublon de texte');
  }
  const ids = m.items.map(i => i.id);
  verif(new Set(ids).size === ids.length, 'ids uniques');
  const tri = m.items.slice().sort((a, b) => m.sens === 'croissant' ? evalTexte(a.texte) - evalTexte(b.texte) : evalTexte(b.texte) - evalTexte(a.texte));
  verif(JSON.stringify(tri.map(i => i.id)) === JSON.stringify(m.ordre), 'ordre attendu faux', m);
  verif(m.ordre.length === m.items.length, 'longueur ordre');
  verif(m.items.some((it, i) => it.id !== m.ordre[i]), 'cartes déjà rangées');
  // le déroulé complet est accepté, une mauvaise carte refusée
  m.ordre.forEach((id, k) => {
    verif(R.verifierOrdre(m, k, id), 'verifierOrdre ok');
    m.items.forEach(it => { if (it.id !== id) verif(!R.verifierOrdre(m, k, it.id), 'verifierOrdre ko'); });
  });
  if (niv === 'cp' && R.palier(d) === 0) verif(m.sens === 'croissant', 'CP facile croissant');
  verif(typeof m.consigne === 'string' && m.consigne.length > 0, 'consigne');
}

let stats = { egal: 0, comparaisons: 0, fractions: 0, pct: 0, decroissant: 0, ordres: 0 };
function testComparer(m, niv) {
  controleItem(m.gauche, niv, 'comparer'); controleItem(m.droite, niv, 'comparer');
  const a = evalTexte(m.gauche.texte), b = evalTexte(m.droite.texte);
  const att = proche(a, b) ? '=' : (a < b ? '<' : '>');
  verif(m.reponse === att, 'signe faux', { g: m.gauche.texte, d: m.droite.texte, rep: m.reponse });
  verif(new Set(m.choix).size === m.choix.length && m.choix.filter(c => c === m.reponse).length === 1, 'réponse absente/non unique', m);
  verif(niv === 'cp' ? (m.choix.length === 2 && !m.choix.includes('=')) : (m.choix.length === 3 && m.choix.includes('=')), 'choix du niveau', m.choix);
  verif(m.gauche.texte !== m.droite.texte, 'deux côtés identiques', m.gauche.texte);
  if (niv === 'cp') verif(m.reponse !== '=', 'CP: égalité interdite');
  m.choix.forEach(c => verif(R.verifierSigne(m, c) === (c === m.reponse), 'verifierSigne'));
  stats.comparaisons++; if (m.reponse === '=') stats.egal++;
}

function testProche(m, niv) {
  controleItem(m.cible, niv, 'proche');
  verif(m.choix.length === 3, 'trois choix');
  const t = evalTexte(m.cible.texte);
  m.choix.forEach(it => controleItem(it, niv, 'proche'));
  const textes = m.choix.map(c => c.texte);
  verif(new Set(textes).size === 3 && !textes.includes(m.cible.texte), 'doublons/cible dans les choix', textes);
  const d = m.choix.map(c => ({ id: c.id, d: Math.abs(evalTexte(c.texte) - t) })).sort((x, y) => x.d - y.d);
  verif(d[1].d - d[0].d > 1e-6 && d[2].d - d[1].d > 1e-6, 'distances non strictes', d);
  verif(d[0].id === m.reponse, 'mauvais plus proche', { rep: m.reponse, d });
  verif(m.choix.filter(c => c.id === m.reponse).length === 1, 'réponse unique');
  m.choix.forEach(c => verif(R.verifierProche(m, c.id) === (c.id === m.reponse), 'verifierProche'));
  verif(m.choix.every(c => typeof c.ecart === 'string'), 'écart');
}

for (const niv of NIV) {
  for (let d = 0; d < 3; d++) {
    for (const type of R.TYPES) {
      for (let i = 0; i < N; i++) {
        total++;
        let m;
        try { m = R.genererManche(niv, d, type, graine(i * 977 + d * 31 + niv.length), undefined); }
        catch (e) { ko('exception ' + e.message, { niv, d, type, i }); continue; }
        verif(m.type === type, 'type');
        if (type === 'ordre') { testOrdre(m, niv, d); stats.ordres++; if (m.sens === 'decroissant') stats.decroissant++; }
        else if (type === 'comparer') testComparer(m, niv);
        else testProche(m, niv);
        if (/\//.test(JSON.stringify(m))) stats.fractions++;
        if (/%/.test(JSON.stringify(m))) stats.pct++;
      }
    }
    // parties complètes avec montée de palier + Math.random
    for (let i = 0; i < 100; i++) {
      total++;
      let p;
      try { p = R.genererPartie(niv, d, i % 2 ? graine(i + 5) : Math.random); }
      catch (e) { ko('exception partie ' + e.message, { niv, d }); continue; }
      verif(p.length === 8 && p[0].type === 'ordre', 'partie 8 manches', p.map(x => x.type));
      const cnt = t => p.filter(x => x.type === t).length;
      verif(cnt('ordre') === 3 && cnt('comparer') === 3 && cnt('proche') === 2, 'répartition');
      p.forEach((m, rang) => {
        if (m.type === 'ordre') { const att = R.NB_CARTES[niv][R.palier(d, rang)]; verif(m.items.length === att, 'nb cartes (rang)', { rang }); m.items.forEach(it => controleItem(it, niv, 'partie')); }
        if (m.type === 'comparer') testComparer(m, niv);
        if (m.type === 'proche') testProche(m, niv);
      });
    }
  }
}

// niveau inconnu -> repli sans erreur ; scores
verif(R.genererManche('zzz', 0, 'ordre').items.length > 0, 'niveau inconnu');
verif(R.resultatPartie(5).gagnee && !R.resultatPartie(4).gagnee && R.resultatPartie(8).etoiles === 3, 'resultatPartie');
verif(R.niveauxDifficulte('cp').length === 3, 'noms de difficulté');

console.log('Tirages contrôlés :', total, '| manches comparer:', stats.comparaisons, 'dont "=":', stats.egal,
  '| manches ordre décroissant:', stats.decroissant + '/' + stats.ordres, '| avec fraction:', stats.fractions, '| avec %:', stats.pct);
if (stats.egal < stats.comparaisons * 0.1) { console.log('Trop peu d’égalités'); erreurs++; }
console.log(erreurs === 0 ? 'OK : 0 erreur' : 'ECHEC : ' + erreurs + ' erreur(s)');
process.exit(erreurs === 0 ? 0 : 1);
