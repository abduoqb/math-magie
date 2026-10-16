/* Test Node de Calcul Éclair : node jeux/eclair/test-eclair.js */
'use strict';
const assert = require('assert');
const E = require('./eclair.js');

const TIRAGES = 400;
const MAXV = { cp: 40, ce1: 100, ce2: 1000, cm1: 100000, cm2: 1000000 };
const DECIMALES = { cp: 0, ce1: 0, ce2: 0, cm1: 1, cm2: 2 }; // chiffres après la virgule autorisés
let total = 0;

// générateur pseudo-aléatoire déterministe (mulberry32)
function graine(s) {
  return function () {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const num = s => parseFloat(s.replace(/[ \s]/g, '').replace(',', '.'));
const decimales = s => { const m = s.replace(/[ \s]/g, '').match(/,(\d+)$/); return m ? m[1].length : 0; };

// Recalcule la réponse uniquement à partir du texte affiché
function recalculer(texte) {
  let m;
  if ((m = texte.match(/^Double de ([\d ,]+)$/))) return { v: 2 * num(m[1]), nombres: [m[1]], op: 'double' };
  if ((m = texte.match(/^Moitié de ([\d ,]+)$/))) return { v: num(m[1]) / 2, nombres: [m[1]], op: 'moitie', entier: num(m[1]) % 2 === 0 };
  if ((m = texte.match(/^(\d+) % de ([\d ,]+)$/))) return { v: num(m[1]) * num(m[2]) / 100, nombres: [m[2]], op: 'pct', taux: num(m[1]) };
  m = texte.match(/^([\d ,]+) ([+−×÷]) ([\d ,]+)$/);
  assert(m, 'texte inattendu : ' + texte);
  const a = num(m[1]), b = num(m[3]);
  const v = { '+': a + b, '−': a - b, '×': a * b, '÷': a / b }[m[2]];
  return { v, nombres: [m[1], m[3]], op: m[2], a, b };
}

for (const niv of E.NIVEAUX) {
  for (const mode of E.MODES) {
    for (const palier of [0, 1, 2]) {
      const rng = graine(niv.length * 1000 + mode.length * 100 + palier + 7);
      const vus = new Set();
      const ops = new Set();
      let prec = null;
      for (let i = 0; i < TIRAGES; i++) {
        const q = i % 2 ? E.generer(niv, mode, palier, rng) : E.suivante(niv, mode, palier, rng, prec);
        if (i % 2 === 0 && prec) assert.notStrictEqual(q.texte, prec.texte, 'répétition immédiate');
        prec = q;
        const ctx = `${niv}/${mode}/p${palier} : ${q.texte}`;
        const r = recalculer(q.texte);
        ops.add(r.op);
        vus.add(q.texte);
        total++;

        // réponse correcte, positive
        assert(Math.abs(r.v - q.reponse) < 1e-9, 'mauvaise réponse ' + ctx + ' -> ' + q.reponse + ' vs ' + r.v);
        assert(q.reponse >= 0, 'négatif ' + ctx);
        assert(Number.isFinite(q.reponse), 'non fini ' + ctx);

        // bornes
        const tous = r.nombres.map(num).concat([q.reponse]);
        tous.forEach(v => assert(v <= MAXV[niv], 'hors bornes ' + ctx));

        // décimaux : seulement CM1 (dixièmes) et CM2 (centièmes)
        const dr = decimales(E.formaterReponse(q.reponse));
        assert(dr <= DECIMALES[niv], 'trop de décimales ' + ctx);
        r.nombres.forEach(s => assert(decimales(s) <= DECIMALES[niv], 'opérande décimal interdit ' + ctx));
        if (!E.params(niv).decimal) assert(Number.isInteger(q.reponse), 'réponse non entière ' + ctx);

        // pas de division avec reste hors décimaux voulus
        if (r.op === '÷') {
          assert(Number.isInteger(r.a) && Number.isInteger(r.b), 'division décimale ' + ctx);
          assert(r.b > 0, 'division par 0 ' + ctx);
          if (!(E.params(niv).decimal && r.b === 10)) assert(r.a % r.b === 0, 'division avec reste ' + ctx);
          if (r.b !== 10) assert(Number.isInteger(q.reponse), 'quotient non entier ' + ctx);
        }
        if (r.op === 'moitie') assert(r.entier, 'moitié d’un impair ' + ctx);
        if (r.op === 'pct') assert([10, 50].includes(r.taux), 'taux ' + ctx);
        if (r.op === '−') assert(r.a >= r.b, 'soustraction négative ' + ctx);

        // cohérence mode / opérations
        if (mode === 'additions') assert(['+', '−'].includes(r.op), 'opération hors mode ' + ctx);
        if (mode === 'tables') assert(!['+', '−'].includes(r.op), 'opération hors mode ' + ctx);

        // contenu propre à la classe
        if (niv === 'cp') {
          assert(!['×', '÷', 'pct'].includes(r.op), 'CP : pas de ' + r.op);
          if (mode === 'additions') {
            const max = palier === 2 ? 30 : 20;
            tous.forEach(v => assert(v <= max, 'CP additions hors ' + max + ' ' + ctx));
          }
        }
        if (niv === 'ce1' && ['×', '÷'].includes(r.op)) {
          const t = r.op === '×' ? [r.a, r.b] : [r.b];
          assert(t.some(x => [2, 3, 4, 5, 10].includes(x)), 'CE1 table ' + ctx);
          if (r.op === '×') { assert(r.a <= 10 && r.b <= 10, 'CE1 facteur ' + ctx); }
          if (r.op === '÷') assert([2, 5, 10].includes(r.b), 'CE1 diviseur ' + ctx);
          if (palier === 0) assert(t.some(x => [2, 5, 10].includes(x)), 'CE1 p0 ' + ctx);
        }
        if (niv === 'ce2' && r.op === '×') assert(r.a <= 10 && r.b <= 10, 'CE2 facteur ' + ctx);
        if (niv === 'ce2' && r.op === '÷') assert(r.b >= 2 && r.b <= 9 && r.a <= 90, 'CE2 division ' + ctx);
        if (niv === 'ce2') assert(r.op !== 'pct', 'CE2 pas de %');
        if (niv === 'cm1') assert(r.op !== 'pct', 'CM1 pas de %');
        if (niv === 'ce2' && mode === 'additions') assert(tous.every(v => v <= 1000), 'CE2 > 1000 ' + ctx);
        if (niv === 'ce1' && mode === 'additions') assert(tous.every(v => v <= 100), 'CE1 > 100 ' + ctx);

        // reponseJuste : accepte la bonne saisie, refuse une mauvaise
        assert(E.reponseJuste(E.formaterReponse(q.reponse), q.reponse), 'saisie juste refusée ' + ctx);
        assert(!E.reponseJuste(E.formaterReponse(q.reponse + 1), q.reponse), 'saisie fausse acceptée ' + ctx);
        assert(!E.reponseJuste('', q.reponse), 'vide accepté');
      }
      assert(vus.size >= 12, `peu de variété (${vus.size}) pour ${niv}/${mode}/p${palier}`);
      if (mode === 'additions') assert(ops.has('+') && ops.has('−'), `+ et − attendus ${niv}/p${palier}`);
    }
  }
}

// Étoiles, paliers, bonus, durée
for (const niv of E.NIVEAUX) {
  const p = E.params(niv);
  assert.strictEqual(E.etoiles(niv, 0), 0);
  assert.strictEqual(E.etoiles(niv, p.seuils[0]), 1);
  assert.strictEqual(E.etoiles(niv, p.seuils[1]), 2);
  assert.strictEqual(E.etoiles(niv, p.seuils[2] + 50), 3);
  assert(p.seuils[0] < p.seuils[1] && p.seuils[1] < p.seuils[2]);
  assert.strictEqual(E.palierPour(niv, 0), 0);
  assert.strictEqual(E.palierPour(niv, p.paliers[0]), 1);
  assert.strictEqual(E.palierPour(niv, p.paliers[1]), 2);
  assert.strictEqual(p.duree, niv === 'cp' ? 90 : 60);
  E.MODES.forEach(m => assert(E.libelle(niv, m).length === 2));
}
assert.strictEqual(E.bonusSerie(4), 0);
assert.strictEqual(E.bonusSerie(5), 3);
assert.strictEqual(E.bonusSerie(10), 3);
assert.strictEqual(E.bonusSerie(0), 0);
assert(E.reponseJuste('3,5', 3.5) && E.reponseJuste('3.5', 3.5) && E.reponseJuste('3,50', 3.5));
assert(!E.reponseJuste('3,', 4) && !E.reponseJuste('abc', 1) && !E.reponseJuste('-3', 3));
// Sans rng fourni (Math.random)
assert(E.generer('cm2', 'melange', 2).texte);

console.log('OK : ' + total + ' questions vérifiées (5 classes x 3 modes x 3 paliers x ' + TIRAGES + ' tirages), 0 erreur.');
