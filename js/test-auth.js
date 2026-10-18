/**
 * Test de js/auth.js — hachage, empreintes de code, limitation anti-devinette.
 *
 * Lancer : node js/test-auth.js
 */
'use strict';

const assert = require('node:assert');
const crypto = require('node:crypto');

// auth.js utilise global.localStorage : shim en mémoire installé AVANT le require.
const memoire = new Map();
global.localStorage = {
  getItem(k) { return memoire.has(k) ? memoire.get(k) : null; },
  setItem(k, v) { memoire.set(k, String(v)); },
  removeItem(k) { memoire.delete(k); },
  clear() { memoire.clear(); }
};

const Auth = require('./auth.js');

/* ---------- Harnais ---------- */

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

/* ---------- Tests ---------- */

(async function () {
  verif(!!Auth, 'auth.js n\'exporte pas Auth');

  // 1. Hachage identique à node:crypto (SHA-256(sel + ':' + code)).
  const couples = [
    ['1234', 'abc'],
    ['0000', 'sel-1'],
    ['9876', 's'],
    ['4321', '0123456789abcdef']
  ];
  for (const [code, sel] of couples) {
    const attendu = crypto.createHash('sha256').update(sel + ':' + code).digest('hex');
    const obtenu = await Auth.hacher(code, sel);
    verif(obtenu === attendu, 'hacher(' + code + ', ' + sel + ') != SHA-256(sel + ":" + code)');
  }

  // 2. Empreinte : création puis vérification.
  const empreinte = await Auth.creerEmpreinte('1234');
  verif(empreinte && typeof empreinte.sel === 'string' && empreinte.sel.length > 0, 'creerEmpreinte : sel manquant');
  verif(empreinte && empreinte.hash === await Auth.hacher('1234', empreinte.sel), 'creerEmpreinte : hash incohérent');
  verif(await Auth.verifierEmpreinte('1234', empreinte) === true, 'verifierEmpreinte : bon code refusé');
  verif(await Auth.verifierEmpreinte('4321', empreinte) === false, 'verifierEmpreinte : mauvais code accepté');
  verif(await Auth.verifierEmpreinte('12', empreinte) === false, 'verifierEmpreinte : code invalide accepté');
  verif(await Auth.verifierEmpreinte('1234', null) === false, 'verifierEmpreinte : empreinte nulle acceptée');

  // 3. codeValide.
  verif(Auth.codeValide('0000') === true, 'codeValide : 0000 devrait être valide');
  verif(Auth.codeValide('123') === false, 'codeValide : 3 chiffres refusé');
  verif(Auth.codeValide('abcd') === false, 'codeValide : lettres refusées');

  // 4. Limitation anti-devinette.
  const cle = 'profil:Test';
  Auth.reinitialiserLimite(cle);
  verif(Auth.etatLimite(cle).bloque === false, 'limite : bloqué alors qu\'aucun échec');
  verif(Auth.etatLimite(cle).essaisRestants === Auth.MAX_ESSAIS, 'limite : essaisRestants initial');

  const t0 = 1700000000000;
  Auth.maintenant = function () { return t0; };

  const e1 = Auth.enregistrerEchec(cle);
  verif(e1.bloque === false && e1.essaisRestants === Auth.MAX_ESSAIS - 1, 'limite : après 1 échec, 2 essais restants');
  Auth.enregistrerEchec(cle);
  verif(Auth.etatLimite(cle).bloque === false && Auth.etatLimite(cle).essaisRestants === 1, 'limite : après 2 échecs, 1 essai restant');
  Auth.enregistrerEchec(cle);
  verif(Auth.etatLimite(cle).bloque === true, 'limite : 3 échecs consécutifs -> bloqué');
  verif(Auth.etatLimite(cle).restantMs === Auth.PAUSE_MS, 'limite : restantMs devrait valoir PAUSE_MS');

  // Avancer de 30 s : le blocage expire.
  Auth.maintenant = function () { return t0 + Auth.PAUSE_MS + 1; };
  verif(Auth.etatLimite(cle).bloque === false, 'limite : toujours bloqué après 30 s');
  verif(Auth.etatLimite(cle).essaisRestants === Auth.MAX_ESSAIS, 'limite : essais non réinitialisés après la pause');

  // reinitialiserLimite remet tout à zéro.
  const cle2 = 'parent';
  Auth.maintenant = function () { return t0; };
  Auth.enregistrerEchec(cle2);
  Auth.enregistrerEchec(cle2);
  Auth.enregistrerEchec(cle2);
  verif(Auth.etatLimite(cle2).bloque === true, 'limite : cle2 devait être bloquée');
  Auth.reinitialiserLimite(cle2);
  verif(Auth.etatLimite(cle2).bloque === false, 'reinitialiserLimite : toujours bloqué');
  verif(Auth.etatLimite(cle2).essaisRestants === Auth.MAX_ESSAIS, 'reinitialiserLimite : essais non remis à zéro');

  /* ---------- Résumé ---------- */
  console.log(verifs + ' vérifications, ' + nbEchecs + ' échec(s).');
  if (messages.length) {
    console.log('Échecs (' + nbEchecs + '), premiers cas :');
    messages.forEach((m) => console.log('  - ' + m));
  }
  process.exit(nbEchecs ? 1 : 0);
})().catch((e) => {
  console.error('Exception inattendue : ' + (e && e.stack || e));
  process.exit(1);
});
