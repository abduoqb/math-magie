/** Régressions des trophées : node js/test-profils.js (aussi inclus dans npm test). */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function charger(niveauClasse, progression = {}) {
  const memoire = new Map([['mathemagie-profils', JSON.stringify({
    version: 2, joueurActif: 'Léa', profils: {
      'Léa': { niveauClasse, progression, _avatar: '🧙‍♀️' }
    }
  })]]);
  const contexte = vm.createContext({
    console,
    localStorage: {
      getItem: k => memoire.get(k) ?? null,
      setItem: (k, v) => memoire.set(k, String(v)),
      removeItem: k => memoire.delete(k)
    },
    addEventListener() {}
  });
  contexte.window = contexte;
  for (const fichier of ['js/niveaux.js', ...['cp', 'ce1', 'ce2', 'cm1', 'cm2'].map(n => 'programmes/' + n + '.js'), 'js/profils-core.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', fichier), 'utf8'), contexte);
  }
  return contexte.gestionnaireProfils;
}

function licorne(gp) {
  return gp.getAvatarsDisponibles().debloquesInfos.find(a => a.emoji === '🦄').debloque;
}

for (const classe of ['cp', 'ce1', 'ce2', 'cm1', 'cm2']) {
  test(classe + ' : seules les missions de géométrie au programme sont requises', () => {
    const gp = charger(classe);
    const missions = Object.entries(gp.getProgramme().geometrie)
      .filter(([, m]) => m.actif !== false).map(([id]) => id);
    assert.ok(missions.length > 0);
    assert.equal(licorne(gp), false, 'aucune réussite : licorne verrouillée');
    for (const id of missions) {
      assert.equal(licorne(gp), false, 'une mission requise reste à réussir');
      assert.equal(gp.setAvatar('🦄'), false);
      gp.setProgression(id, { niveau: 2 });
    }
    assert.equal(gp.getStatsProgression()._geometrieComplete, true);
    assert.equal(licorne(gp), true);
    assert.equal(gp.setAvatar('🦄'), true, 'personnage utilisable');
    const recharge = charger(classe, gp.donnees.profils['Léa'].progression);
    assert.equal(licorne(recharge), true, 'progression existante débloquée sans rejouer');
  });
}

test('les meilleurs niveaux des anciennes classes comptent toujours', () => {
  const gp = charger('ce1');
  const progression = gp.donnees.profils['Léa'].progression;
  progression.cp = {};
  progression.ce1 = {};
  Object.entries(gp.getProgramme().geometrie).filter(([, m]) => m.actif !== false)
    .forEach(([id], i) => { progression[i % 2 ? 'cp' : 'ce1'][id] = { niveau: 2 }; });
  assert.equal(licorne(gp), true);
});

test('un programme sans mission de géométrie ne débloque pas la licorne', () => {
  const gp = charger('cp');
  gp.getProgramme().geometrie = {};
  assert.equal(licorne(gp), false);
});

test('les identifiants courts de géométrie restent reconnus', () => {
  const gp = charger('cp');
  gp.getProgramme().geometrie = { formes: { actif: true }, angles: { actif: false } };
  gp.setProgression('geometrie-formes', { niveau: 2 });
  assert.equal(licorne(gp), true);
});
