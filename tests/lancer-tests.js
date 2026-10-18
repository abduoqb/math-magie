/**
 * Lanceur de tests Mathémagie.
 *
 * Découvre récursivement les fichiers `test-*.js` du dépôt (hors node_modules, .git et vendor),
 * lance chacun dans un processus node séparé, puis affiche un résumé.
 * Code de sortie non nul si au moins un test échoue.
 *
 * Lancer : node tests/lancer-tests.js   (ou `npm test`)
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const RACINE = path.join(__dirname, '..');
// Dossiers jamais explorés.
const EXCLUS = new Set(['node_modules', '.git', 'vendor']);
// Un test : nom commençant par « test- » et finissant par « .js ».
const MOTIF = /^test-.*\.js$/;

function decouvrir(dossier) {
  const trouve = [];
  let entrees;
  try {
    entrees = fs.readdirSync(dossier, { withFileTypes: true });
  } catch (e) {
    return trouve;
  }
  entrees.sort((a, b) => a.name.localeCompare(b.name));
  for (const entree of entrees) {
    if (EXCLUS.has(entree.name)) continue;
    const chemin = path.join(dossier, entree.name);
    if (entree.isDirectory()) {
      for (const f of decouvrir(chemin)) trouve.push(f);
    } else if (entree.isFile() && MOTIF.test(entree.name)) {
      trouve.push(chemin);
    }
  }
  return trouve;
}

function main() {
  const fichiers = decouvrir(RACINE);

  if (!fichiers.length) {
    console.error('Aucun fichier test-*.js trouvé sous ' + RACINE);
    process.exit(1);
  }

  console.log('Mathémagie — ' + fichiers.length + ' fichier(s) de test trouvé(s).\n');

  const resultats = [];
  for (const fichier of fichiers) {
    const relatif = path.relative(RACINE, fichier) || fichier;
    console.log('▶ ' + relatif);
    const r = spawnSync('node', [fichier], { stdio: 'inherit' });
    let statut;
    if (r.error) {
      statut = 'erreur';
      console.log('  ✗ ' + relatif + ' — lancement impossible : ' + r.error.message);
    } else if (r.status !== 0) {
      statut = 'echec';
      console.log('  ✗ ' + relatif + ' — échec (code ' + r.status + ')');
    } else {
      statut = 'ok';
      console.log('  ✓ ' + relatif);
    }
    resultats.push({ relatif, statut });
  }

  const ok = resultats.filter((r) => r.statut === 'ok').length;
  const echecs = resultats.filter((r) => r.statut !== 'ok');

  console.log('\n================ Résumé ================');
  console.log('Tests exécutés : ' + fichiers.length);
  console.log('Réussis        : ' + ok);
  console.log('Échoués        : ' + echecs.length);
  if (echecs.length) {
    console.log('Détail :');
    for (const e of echecs) console.log('  ✗ ' + e.relatif + ' [' + e.statut + ']');
  }
  console.log('========================================');

  process.exit(echecs.length ? 1 : 0);
}

main();
