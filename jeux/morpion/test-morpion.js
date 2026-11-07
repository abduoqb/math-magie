'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const combos = html.match(/const combosGagnantes = (\[[\s\S]*?\]);/)[0];
const debut = html.indexOf('      function choisirCoupIA');
const fin = html.indexOf('      function reinitialiser', debut);
const ctx = vm.createContext({});
vm.runInContext(combos + html.slice(debut, fin), ctx);
const choisir = ctx.choisirCoupIA;
const gagne = ctx.verifierGagnantEtat;

assert.equal(choisir([2, 2, 0, 1, 1, 0, 0, 0, 1], () => 0), 2, 'Saisit une victoire immédiate');
const menace = [1, 1, 0, 0, 2, 0, 0, 0, 0];
assert.equal(choisir(menace, () => 0.8), 2, 'Bloque quand elle cherche à défendre');
const valeurs = [0.1, 0.9];
const erreur = choisir(menace, () => valeurs.shift());
assert.notEqual(erreur, 2, 'Peut laisser une ouverture à l’enfant');
const suite = menace.slice(); suite[erreur] = 2; suite[2] = 1;
assert(gagne(suite, 1), 'L’enfant peut effectivement gagner au coup suivant');
assert.deepEqual(menace, [1, 1, 0, 0, 2, 0, 0, 0, 0], 'La recherche ne modifie pas le plateau');
assert.equal(choisir([1, 2, 1, 1, 2, 2, 2, 1, 1]), null, 'Aucun coup sur un plateau plein');
assert.equal(choisir([1, 1, 1, 0, 2, 0, 2, 0, 0]), null, 'Aucun coup après une victoire');
for (let i = 0; i < 500; i++) {
  const coup = choisir(menace);
  assert.equal(menace[coup], 0, 'Joue uniquement une case libre');
}
console.log('Morpion : victoire, défense, ouverture gagnante et coups légaux vérifiés.');
