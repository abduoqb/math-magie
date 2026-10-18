/**
 * Test des fonctions PURES de js/voix.js (nettoyage du texte lu et énumération des choix).
 *
 * Vérifie les règles voulues pour la voix des enfants :
 *  1. les émojis et symboles décoratifs ne sont JAMAIS lus ;
 *  2. les symboles mathématiques sont dits en mots (×, ÷, =, %, /, virgule…) ;
 *  3. le texte reste concis (espaces et ponctuation propres) ;
 *  4. une question à choix énumère ses choix, sauf s'ils sont déjà cités.
 *
 * Lancer : node js/test-voix.js
 */
'use strict';

const assert = require('node:assert');

const V = require('./voix.js');
const nettoyer = V.nettoyer;
const enumerer = V.enumerer;
const questionTexte = V.questionTexte;
const dejaCite = V.dejaCite;

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

verif(typeof nettoyer === 'function', 'nettoyer exportée');
verif(typeof enumerer === 'function', 'enumerer exportée');
verif(typeof questionTexte === 'function', 'questionTexte exportée');

/* ---------- 1. Aucun émoji lu ---------- */

const avecEmoji = [
  'Bonjour Léa ! ✨',
  '🔥 Défi du jour réussi !',
  '✅ Bravo ! ❌ Presque !',
  '🔊 Écouter',
  '🎲 Jeux ⚡ Calcul ☄️',
  '★☆ étoiles ✓✗',
  'Choisis : 🍕 ou 🕒 ?'
];
avecEmoji.forEach((t) => {
  const lu = nettoyer(t);
  verif(!/[\p{Extended_Pictographic}]/u.test(lu), 'émoji retiré de « ' + t + ' » -> « ' + lu + ' »');
});

/* Les lettres accentuées et signes utiles sont conservés. */
verif(nettoyer('La moitié de 8') === 'La moitié de 8', 'accents conservés');
verif(nettoyer("C'est fini") === "C'est fini", 'apostrophes conservées');

/* ---------- 2. Symboles mathématiques dits en mots ---------- */

verif(/\bfois\b/.test(nettoyer('3 × 4')), '× devient « fois »');
verif(/divisé par/.test(nettoyer('12 ÷ 3')), '÷ devient « divisé par »');
verif(/égale/.test(nettoyer('5 = 5')), '= devient « égale »');
verif(/plus/.test(nettoyer('2 + 3')), '+ devient « plus »');
verif(/moins/.test(nettoyer('9 − 4')), '− devient « moins »');
verif(/pour cent/.test(nettoyer('25 %')), '% devient « pour cent »');
verif(/3 sur 4/.test(nettoyer('3/4')), 'fraction 3/4 dite « 3 sur 4 »');
verif(/3 virgule 5/.test(nettoyer('3,5')), 'virgule décimale dite en mot');
verif(!/virgule/.test(nettoyer('3, 5, ou 8')), 'la virgule de séparation des choix n\'est pas dite « virgule »');
verif(!/virgule/.test(nettoyer(questionTexte('Range les nombres.', ['3', '5', '8']))), 'énumération de nombres lue sans « virgule » parasite');
verif(!/virgule/.test(nettoyer('1 234, 12 340, ou 1 000')), 'virgules de liste de grands nombres non dites');
verif(/euros/.test(nettoyer('2 €')), '€ devient « euros »');
verif(/degrés/.test(nettoyer('30°')), '° devient « degrés »');

/* ---------- 3. Texte concis et propre ---------- */

verif(nettoyer('   trop   d\u2019espaces   ') === 'trop d\u2019espaces', 'espaces multiples réduits');
verif(nettoyer('<b>Bravo</b> !') === 'Bravo !', 'balises HTML retirées');
verif(nettoyer('Attends…') === 'Attends', 'points de suspension nettoyés');
verif(!/\s[,.]/.test(nettoyer('Bonjour , toi .')), 'aucune espace avant la ponctuation');
verif(nettoyer('Bravo !!') === 'Bravo !', 'ponctuation répétée réduite');
verif(nettoyer('') === '' && nettoyer(null) === '' && nettoyer(undefined) === '', 'entrées vides gérées');

/* ---------- 4. Énumération des choix ---------- */

verif(enumerer(['a']) === 'a', 'un choix');
verif(enumerer(['a', 'b']) === 'a ou b', 'deux choix : « ou »');
verif(enumerer(['a', 'b', 'c']) === 'a, b, ou c', 'trois choix : virgules + « ou »');

const q1 = questionTexte('Quel est le plus grand ?', ['3', '5', '8']);
verif(/Tes choix\s*:\s*3, 5, ou 8\./.test(q1), 'les choix sont énumérés : « ' + q1 + ' »');

const q2 = questionTexte('Plus petit, égal ou plus grand ?', ['plus petit que', 'égal à', 'plus grand que']);
verif(dejaCite(q2, ['plus petit que', 'égal à', 'plus grand que']), 'choix déjà cités détectés');
verif(!/Tes choix/.test(q2), 'pas de double énumération quand la consigne cite déjà les choix : « ' + q2 + ' »');

const q3 = questionTexte('Vrai ou faux ?', ['Vrai', 'Faux']);
verif(!/Tes choix/.test(q3), 'vrai/faux non redondant');

/* Les émojis présents dans la consigne ou les choix sont retirés de la phrase lue. */
const q4 = questionTexte('🎲 Choisis ton univers !', ['🎯 Calcul', '📐 Géométrie ✨']);
verif(!/[\p{Extended_Pictographic}]/u.test(q4), 'questionTexte sans émoji : « ' + q4 + ' »');
verif(/Calcul/.test(q4), 'les libellés de choix restent présents');

/* ---------- Résumé ---------- */

console.log('Test voix — ' + verifs + ' vérifications, ' + nbEchecs + ' échec(s).');
if (nbEchecs) {
  console.log('Détail :');
  messages.forEach((m) => console.log('  ✗ ' + m));
  process.exit(1);
}
