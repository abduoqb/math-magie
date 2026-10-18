'use strict';

/**
 * tools/generer-missions.js — générateur des pages de mission (Node, sans dépendance).
 *
 * RÔLE
 *   Les pages de mission se répètent presque à l'identique (même <head>, mêmes
 *   <script> dans le même ordre, même squelette de carte). Ce script est la
 *   source unique de vérité pour ces pages : il reconstruit leur HTML complet à
 *   partir d'un template commun (tête, feuilles de style, scripts, <app-header>,
 *   structure du <main>) et d'une table de données par page (titre, texte, icône,
 *   id du corps, scripts spécifiques).
 *
 *   Le HTML produit est OCTET POUR OCTET identique aux fichiers actuels
 *   (mêmes espaces, mêmes fins de ligne CRLF, même retour à la ligne final).
 *   Voir la section « Vérification » plus bas.
 *
 * GROUPES COUVERTS (33 pages)
 *   - calculs_mentaux/<op>/<op>.html         (4 pages, profondeur 2)
 *   - nombres/<id>.html                      (9 pages, profondeur 1)
 *   - grandeurs/<id>.html                    (6 pages, profondeur 1)
 *   - geometrie/missions/<id>.html           (14 pages, profondeur 2)
 *   Les index (calculs_mentaux/index.html, nombres/index.html, grandeurs/index.html)
 *   ne sont PAS gérés ici : ils sont uniques, pas dupliqués.
 *
 * RELANCER
 *   node tools/generer-missions.js            # écrit les pages dans le dépôt
 *   node tools/generer-missions.js --out DIR  # écrit dans DIR (structure mirroir)
 *   node tools/generer-missions.js --check    # compare au dépôt, sans rien écrire
 *                                             # (--check ignore --out : la référence
 *                                             #  est toujours le dépôt)
 *   La commande se lance depuis n'importe quel dossier : les chemins du dépôt
 *   sont résolus par rapport à l'emplacement du script.
 *
 * AJOUTER UNE PAGE
 *   1. Ajouter une entrée dans la table du groupe concerné (CALCULS, NOMBRES,
 *      GRANDEURS ou GEOMETRIE) : le champ id (nom de fichier), le titre, le texte
 *      du <h1>, l'icône/emoji ou l'image, et les scripts spécifiques.
 *   2. Pour un nouveau groupe, écrire une fonction de rendu qui produit un
 *      tableau de lignes (sans fin de ligne) et l'enregistrer dans
 *      `construirePages()`.
 *   3. Relancer `node tools/generer-missions.js`.
 *
 * VÉRIFICATION
 *   `--check` régénère en mémoire et compare octet par octet à ce qui est écrit
 *   dans le dépôt. Sortie : une ligne par page (OK / DIFFÉRENT) puis un résumé.
 *   En cas de divergence le script sort en code 1 (utile en pré-commit).
 *
 * CONVENTIONS DE FICHIER REPRODUITES
 *   UTF-8 sans BOM, fins de ligne CRLF, un retour à la ligne après </html>,
 *   pas de tabulation, pas d'espace en fin de ligne. Ces pages n'utilisent que
 *   des espaces pour l'indentation.
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');
const EOL = '\r\n';

/** Préfixe relatif pour une profondeur donnée : 1 -> '../', 2 -> '../../'. */
function prefixe(profondeur) {
  return '../'.repeat(profondeur);
}

/** Assemble les lignes en respectant la convention CRLF + newline final. */
function rendre(lignes) {
  return lignes.join(EOL) + EOL;
}

/** Balise <script> de tête, indentée à 4 espaces. */
function script(src, defer) {
  return `    <script src="${src}"${defer ? ' defer' : ''}></script>`;
}

/** Balise <link rel="stylesheet">, indentée à 4 espaces. */
function feuille(href) {
  return `    <link rel="stylesheet" href="${href}" />`;
}

// ---------------------------------------------------------------------------
// Groupe 1 — calculs_mentaux/<op>/<op>.html  (profondeur 2)
// ---------------------------------------------------------------------------

const CALCULS = [
  { id: 'additions',       titre: 'Additions',       image: 'addition' },
  { id: 'soustractions',   titre: 'Soustractions',   image: 'soustraction' },
  { id: 'multiplications', titre: 'Multiplications', image: 'multiplication' },
  { id: 'divisions',       titre: 'Divisions',       image: 'division' },
];

function rendreCalcul(p) {
  const r = prefixe(2);
  const op = p.id;
  return rendre([
    '<!DOCTYPE html>',
    '<html lang="fr">',
    '  <head>',
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${p.titre}</title>`,
    `    <link rel="icon" type="image/png" href="${r}images/logo_transparant.png">`,
    script(`${r}js/profils.js`, false),
    script('../js/generateur_calcul.js', true),
    script('../js/moteur_calcul.js', true),
    script(`js/${op}.js`, true),
    script(`${r}js/composants/header.js`, true),
    feuille(`${r}style/commun.css`),
    feuille(`${r}style/calculs.css`),
    '  </head>',
    `  <body class="calc-body calc-op-${op}">`,
    `    <script>gestionnaireProfils.verifierAccesOuRediriger('${r}');</script>`,
    `    <app-header base-path="${r}"></app-header>`,
    '    <main class="calc-page">',
    '      <div class="calc-entete">',
    '        <a class="calc-retour" href="../index.html">&larr; Missions</a>',
    '        <h1 class="titre calc-titre">',
    `          <img class="calc-titre-img" src="${r}images/op-${p.image}.svg" alt="" />`,
    `          <span id="titre-texte">${p.titre}</span>`,
    '        </h1>',
    '        <p class="consigne-mission" id="consigne"></p>',
    '      </div>',
    '',
    '      <section class="presentation calc-carte">',
    '        <div class="cadre calc-cadre" id="zone-jeu">',
    '          <div class="calc-haut">',
    '            <div class="calc-palier" id="palier" role="img" aria-label="Palier"></div>',
    '            <label class="calc-select-palier">Palier',
    '              <select id="selectNiveau" aria-label="Choisir le palier"></select>',
    '            </label>',
    '          </div>',
    '',
    '          <div class="calc-corps">',
    '            <div class="calc-principal">',
    '              <div class="calc-enonce-ligne">',
    `                <img id="mascotte" class="calc-mascotte" src="${r}images/mascotte-neutre.svg" alt="" />`,
    '                <div id="calcul" aria-live="polite"></div>',
    '              </div>',
    '              <input type="text" inputmode="decimal" id="saisieReponse" autocomplete="off" aria-label="Ta réponse" />',
    '              <div id="instructions" role="status"></div>',
    '              <button type="button" id="valider" class="calc-btn-principal">Valider ✓</button>',
    '            </div>',
    '            <div class="calc-pave" id="pave" hidden></div>',
    '          </div>',
    '',
    '          <div class="calc-bas">',
    '            <div class="calc-serie" id="serie" role="img" aria-label="Série de bonnes réponses"></div>',
    '            <div class="calc-score"><span class="calc-score-ico" aria-hidden="true">★</span> <span id="score">0</span> pts</div>',
    '            <div class="calc-essais" id="essais" role="img" aria-label="Essais"></div>',
    '            <button type="button" id="bascule-pave" class="calc-bascule" aria-pressed="false">',
    '              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><g fill="currentColor"><circle cx="5" cy="5" r="2.4"/><circle cx="12" cy="5" r="2.4"/><circle cx="19" cy="5" r="2.4"/><circle cx="5" cy="12" r="2.4"/><circle cx="12" cy="12" r="2.4"/><circle cx="19" cy="12" r="2.4"/><circle cx="5" cy="19" r="2.4"/><circle cx="12" cy="19" r="2.4"/><circle cx="19" cy="19" r="2.4"/></g></svg>',
    '              <span>Pavé</span>',
    '            </button>',
    '          </div>',
    '        </div>',
    '',
    '        <div class="calc-fin" id="zone-fin" hidden></div>',
    '      </section>',
    '    </main>',
    '  </body>',
    '</html>',
  ]);
}

// ---------------------------------------------------------------------------
// Groupe 2 — nombres/<id>.html  (profondeur 1)
// ---------------------------------------------------------------------------

const NOMBRES = [
  { id: 'valeur',     titre: 'Valeur des chiffres — Nombres',   ico: '🔢', texte: 'Valeur des chiffres' },
  { id: 'ranger',     titre: 'Ranger — Nombres',                ico: '🪜', texte: 'Ranger' },
  { id: 'moitie',     titre: 'La moitié — Nombres',             ico: '🍰', texte: 'La moitié' },
  { id: 'decomposer', titre: 'Décomposer — Nombres',            ico: '🧩', texte: 'Décomposer' },
  { id: 'decimaux',   titre: 'Les nombres décimaux — Nombres',  ico: '🎚️', texte: 'Les nombres décimaux' },
  { id: 'comparer',   titre: 'Comparer — Nombres',              ico: '⚖️', texte: 'Comparer' },
  { id: 'encadrer',   titre: 'Encadrer — Nombres',              ico: '↔️', texte: 'Encadrer' },
  { id: 'droite',     titre: 'Droite graduée — Nombres',        ico: '📏', texte: 'Droite graduée' },
  { id: 'fractions',  titre: 'Les fractions — Nombres',         ico: '🍕', texte: 'Les fractions' },
];

function rendreNombre(p) {
  const r = prefixe(1);
  return rendre([
    '<!DOCTYPE html>',
    '<html lang="fr">',
    '  <head>',
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${p.titre}</title>`,
    `    <link rel="icon" type="image/svg+xml" href="${r}images/mascotte-neutre.svg" />`,
    feuille(`${r}style/commun.css`),
    feuille(`${r}style/nombres.css`),
    script(`${r}js/profils.js`, false),
    script('js/generateur_nombres.js', false),
    script('js/moteur_nombres.js', true),
    script(`${r}js/composants/header.js`, true),
    '  </head>',
    '  <body class="nb-body">',
    `    <script>gestionnaireProfils.verifierAccesOuRediriger('${r}');</script>`,
    `    <app-header base-path="${r}"></app-header>`,
    '    <main class="nb-page">',
    '      <div class="nb-entete">',
    '        <a class="nb-retour" href="index.html">&larr; Nombres</a>',
    '        <h1 class="titre nb-titre">',
    `          <span class="nb-titre-ico" aria-hidden="true">${p.ico}</span>`,
    `          <span id="titre-texte">${p.texte}</span>`,
    '        </h1>',
    '        <p class="nb-consigne" id="consigne"></p>',
    '      </div>',
    '',
    '      <section class="nb-carte">',
    '        <div class="nb-cadre" id="zone-jeu">',
    '          <div class="nb-haut">',
    '            <div class="nb-palier" id="palier" role="img" aria-label="Palier"></div>',
    '            <label class="nb-select-palier">Palier',
    '              <select id="selectNiveau" aria-label="Choisir le palier"></select>',
    '            </label>',
    '          </div>',
    '',
    '          <div class="nb-question">',
    `            <img id="mascotte" class="nb-mascotte" src="${r}images/mascotte-neutre.svg" alt="" />`,
    '            <div class="nb-enonce-bloc" aria-live="polite">',
    '              <p class="nb-enonce" id="enonce"></p>',
    '              <p class="nb-expression" id="expression" hidden></p>',
    '            </div>',
    '            <span id="voix-slot"></span>',
    '          </div>',
    '          <div class="nb-visuel" id="visuel" hidden></div>',
    '',
    '          <div class="nb-reponse" id="reponse-zone"></div>',
    '          <div class="nb-retour-info" id="instructions" role="status"></div>',
    '          <button type="button" id="suivant" class="nb-btn-principal nb-suivant" hidden>Suivant &rarr;</button>',
    '',
    '          <div class="nb-bas">',
    '            <div class="nb-serie" id="serie" role="img" aria-label="Série de bonnes réponses"></div>',
    '            <div class="nb-score"><span aria-hidden="true">★</span> <span id="score">0</span> pts</div>',
    '            <div class="nb-essais" id="essais" role="img" aria-label="Essais"></div>',
    '          </div>',
    '        </div>',
    '',
    '        <div class="nb-fin" id="zone-fin" hidden></div>',
    '      </section>',
    '    </main>',
    `    <script>document.addEventListener('DOMContentLoaded', function () { new MoteurNombres('nombres-${p.id}'); });</script>`,
    '  </body>',
    '</html>',
  ]);
}

// ---------------------------------------------------------------------------
// Groupe 3 — grandeurs/<id>.html  (profondeur 1)
// ---------------------------------------------------------------------------

const GRANDEURS = [
  { id: 'longueurs',                     titre: 'Longueurs - Mathémagie',                 ico: '📏', texte: 'Longueurs' },
  { id: 'masses-contenances',            titre: 'Masses et contenances - Mathémagie',      ico: '⚖️', texte: 'Masses et contenances' },
  { id: 'durees-monnaie',                titre: 'Durées et monnaie - Mathémagie',          ico: '⏰', texte: 'Durées et monnaie' },
  { id: 'perimetres-aires',              titre: 'Périmètres et aires - Mathémagie',        ico: '🟦', texte: 'Périmètres et aires' },
  { id: 'proportionnalite-pourcentages', titre: 'Proportionnalité - Mathémagie',           ico: '🛒', texte: 'Proportionnalité' },
  { id: 'volumes-vitesses-echelles',     titre: 'Volumes, vitesses, échelles - Mathémagie', ico: '🧊', texte: 'Volumes, vitesses, échelles' },
];

function rendreGrandeur(p) {
  const r = prefixe(1);
  return rendre([
    '<!DOCTYPE html>',
    '<html lang="fr">',
    '  <head>',
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${p.titre}</title>`,
    `    <link rel="icon" type="image/svg+xml" href="${r}images/mascotte-neutre.svg" />`,
    script(`${r}js/profils.js`, false),
    script('js/generateur_grandeurs.js', true),
    script('js/moteur_grandeurs.js', true),
    script(`${r}js/composants/header.js`, true),
    feuille(`${r}style/commun.css`),
    feuille(`${r}style/calculs.css`),
    feuille(`${r}style/grandeurs.css`),
    '  </head>',
    `  <body class="calc-body gr-body gr-mission-${p.id}">`,
    `    <script>gestionnaireProfils.verifierAccesOuRediriger('${r}');</script>`,
    `    <app-header base-path="${r}"></app-header>`,
    '    <main class="calc-page">',
    '      <div class="calc-entete">',
    '        <a class="calc-retour" href="index.html">&larr; Missions</a>',
    '        <h1 class="titre calc-titre">',
    `          <span class="gr-titre-emoji" aria-hidden="true">${p.ico}</span>`,
    `          <span id="titre-texte">${p.texte}</span>`,
    '        </h1>',
    '        <p class="consigne-mission" id="consigne"></p>',
    '      </div>',
    '',
    '      <section class="presentation calc-carte">',
    '        <div class="cadre calc-cadre" id="zone-jeu">',
    '          <div class="calc-haut">',
    '            <div class="calc-palier" id="palier" role="img" aria-label="Palier"></div>',
    '            <label class="calc-select-palier">Palier',
    '              <select id="selectNiveau" aria-label="Choisir le palier"></select>',
    '            </label>',
    '          </div>',
    '',
    '          <div class="calc-corps">',
    '            <div class="calc-principal">',
    '              <div class="calc-enonce-ligne">',
    `                <img id="mascotte" class="calc-mascotte" src="${r}images/mascotte-neutre.svg" alt="" />`,
    '                <div id="calcul" aria-live="polite"></div>',
    '              </div>',
    '              <div class="gr-figure" id="figure" hidden></div>',
    '              <div class="gr-choix" id="choix" role="group" aria-label="Réponses possibles" hidden></div>',
    '              <div class="gr-saisie" id="bloc-saisie">',
    '                <input type="text" inputmode="decimal" id="saisieReponse" autocomplete="off" aria-label="Ta réponse" />',
    '                <span class="gr-unite" id="unite" hidden></span>',
    '              </div>',
    '              <div id="instructions" role="status"></div>',
    '              <button type="button" id="valider" class="calc-btn-principal">Valider ✓</button>',
    '            </div>',
    '            <div class="calc-pave" id="pave" hidden></div>',
    '          </div>',
    '',
    '          <div class="calc-bas">',
    '            <div class="calc-serie" id="serie" role="img" aria-label="Série de bonnes réponses"></div>',
    '            <div class="calc-score"><span class="calc-score-ico" aria-hidden="true">★</span> <span id="score">0</span> pts</div>',
    '            <div class="calc-essais" id="essais" role="img" aria-label="Essais"></div>',
    '            <button type="button" id="bascule-pave" class="calc-bascule" aria-pressed="false">',
    '              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><g fill="currentColor"><circle cx="5" cy="5" r="2.4"/><circle cx="12" cy="5" r="2.4"/><circle cx="19" cy="5" r="2.4"/><circle cx="5" cy="12" r="2.4"/><circle cx="12" cy="12" r="2.4"/><circle cx="19" cy="12" r="2.4"/><circle cx="5" cy="19" r="2.4"/><circle cx="12" cy="19" r="2.4"/><circle cx="19" cy="19" r="2.4"/></g></svg>',
    '              <span>Pavé</span>',
    '            </button>',
    '          </div>',
    '        </div>',
    '',
    '        <div class="calc-fin" id="zone-fin" hidden></div>',
    '      </section>',
    '    </main>',
    '    <script>',
    "      document.addEventListener('DOMContentLoaded', function () {",
    `        new MoteurGrandeurs({ mission: '${p.id}' });`,
    '      });',
    '    </script>',
    '  </body>',
    '</html>',
  ]);
}

// ---------------------------------------------------------------------------
// Groupe 4 — geometrie/missions/<id>.html  (profondeur 2)
// ---------------------------------------------------------------------------

const GEOMETRIE = [
  { id: 'formes',        titre: "Le nom des formes - Mathémagie",   texte: 'Le nom des formes',    banque: false, scripts: ['formes.js'] },
  { id: 'droites',       titre: 'Droites magiques - Mathémagie',    texte: 'Droites Magiques',     banque: false, scripts: ['droites.js'] },
  { id: 'cercle',        titre: 'Cercle et compas - Mathémagie',    texte: 'Cercle et compas',     banque: true,  scripts: ['cercle.js'] },
  { id: 'angles',        titre: 'Les angles - Mathémagie',          texte: 'Les angles',           banque: false, scripts: ['angles.js'] },
  { id: 'espace',        titre: "Repérage dans l'espace - Mathémagie", texte: "Repérage dans l'espace", banque: true, scripts: ['espace.js'] },
  { id: 'instruments',   titre: 'Les instruments - Mathémagie',     texte: 'Les instruments',      banque: true,  scripts: ['instruments.js'] },
  { id: 'vrai_faux',     titre: 'Vrai ou Faux ? - Mathémagie',      texte: 'Vrai ou Faux ?',       banque: false, scripts: ['vrai_faux.js'] },
  { id: 'rapporteur',    titre: 'Le rapporteur - Mathémagie',       texte: 'Le rapporteur',        banque: true,  scripts: ['rapporteur.js'] },
  { id: 'triangles',     titre: 'Le secret des triangles - Mathémagie', texte: 'Le Secret des Triangles', banque: false, scripts: ['triangles.js'] },
  { id: 'quadrilateres', titre: 'Tapis volants - Mathémagie',       texte: 'Tapis Volants',        banque: false, scripts: ['quadrilateres.js'] },
  { id: 'symetrie',      titre: 'Symétrie - Mathémagie',            texte: 'Symétrie',             banque: false, scripts: ['symetrie.js'] },
  { id: 'proprietes',    titre: 'Sommets et côtés - Mathémagie',    texte: 'Sommets et côtés',     banque: false, scripts: ['proprietes.js'] },
  { id: 'patrons',       titre: 'Les patrons magiques - Mathémagie', texte: 'Les Patrons Magiques', banque: false, scripts: ['patron_cube.js', 'patrons.js'] },
  { id: 'solides',       titre: 'Les solides - Mathémagie',         texte: 'Les solides',          banque: true,  scripts: ['solides.js'] },
];

function rendreGeometrie(p) {
  const r = prefixe(2);
  const scriptsMission = [];
  if (p.banque) scriptsMission.push(script('../js/banque_geo.js', true));
  for (const f of p.scripts) scriptsMission.push(script(`../js/${f}`, true));

  return rendre([
    '<!DOCTYPE html>',
    '<html lang="fr">',
    '  <head>',
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${p.titre}</title>`,
    `    <link rel="icon" type="image/png" href="${r}images/logo_transparant.png" />`,
    feuille(`${r}style/commun.css`),
    feuille(`${r}style/geometrie.css`),
    script(`${r}js/profils.js`, false),
    script(`${r}js/composants/header.js`, true),
    script('../js/programme_geo.js', true),
    script('../js/icones_geo.js', true),
    script('../js/moteur_geometrie.js', true),
    ...scriptsMission,
    '  </head>',
    '  <body class="geo-page">',
    `    <script>gestionnaireProfils.verifierAccesOuRediriger('${r}');</script>`,
    `    <app-header base-path="${r}"></app-header>`,
    '    <main class="geo-main">',
    `      <h1 class="titre">${p.texte}</h1>`,
    '      <section class="presentation">',
    '        <div class="cadre">',
    '          <div id="forme-conteneur"></div>',
    '          <div id="instructions"></div>',
    '          <div id="zone-reponse"></div>',
    '          <p id="geo-stats" class="geo-stats">Question <span id="geo-stat">0 / 10</span></p>',
    '        </div>',
    '      </section>',
    '    </main>',
    '  </body>',
    '</html>',
  ]);
}

// ---------------------------------------------------------------------------
// Registre des pages produites
// ---------------------------------------------------------------------------

/** Retourne la liste { chemin, contenu } de toutes les pages générées. */
function construirePages() {
  const pages = [];
  for (const p of CALCULS) {
    pages.push({ chemin: `calculs_mentaux/${p.id}/${p.id}.html`, contenu: rendreCalcul(p) });
  }
  for (const p of NOMBRES) {
    pages.push({ chemin: `nombres/${p.id}.html`, contenu: rendreNombre(p) });
  }
  for (const p of GRANDEURS) {
    pages.push({ chemin: `grandeurs/${p.id}.html`, contenu: rendreGrandeur(p) });
  }
  for (const p of GEOMETRIE) {
    pages.push({ chemin: `geometrie/missions/${p.id}.html`, contenu: rendreGeometrie(p) });
  }
  return pages;
}

// ---------------------------------------------------------------------------
// Exécution : écriture ou vérification
// ---------------------------------------------------------------------------

function lireArgument(nom) {
  const i = process.argv.indexOf(nom);
  return i !== -1 && i + 1 < process.argv.length ? process.argv[i + 1] : null;
}

function main() {
  const modeCheck = process.argv.includes('--check');
  const dossierSortie = lireArgument('--out');
  // En vérification, la référence est toujours le dépôt.
  const base = modeCheck ? RACINE : (dossierSortie ? path.resolve(dossierSortie) : RACINE);

  const pages = construirePages();
  let identiques = 0;
  const divergences = [];

  for (const page of pages) {
    const cible = path.join(base, page.chemin);
    if (modeCheck) {
      let actuel = null;
      try {
        actuel = fs.readFileSync(cible);
      } catch (e) {
        divergences.push({ chemin: page.chemin, raison: 'absent' });
        console.log(`DIFFÉRENT  ${page.chemin}  (fichier absent)`);
        continue;
      }
      const attendu = Buffer.from(page.contenu, 'utf8');
      if (actuel.equals(attendu)) {
        identiques++;
        console.log(`OK         ${page.chemin}`);
      } else {
        divergences.push({ chemin: page.chemin, raison: `${actuel.length} vs ${attendu.length} octets` });
        console.log(`DIFFÉRENT  ${page.chemin}  (${actuel.length} vs ${attendu.length} octets)`);
      }
    } else {
      fs.mkdirSync(path.dirname(cible), { recursive: true });
      fs.writeFileSync(cible, page.contenu, 'utf8');
      console.log(`écrit      ${page.chemin}`);
    }
  }

  if (modeCheck) {
    console.log('');
    console.log(`${identiques}/${pages.length} pages identiques (octet pour octet).`);
    if (divergences.length > 0) {
      console.log(`${divergences.length} divergence(s) :`);
      for (const d of divergences) console.log(`  - ${d.chemin} : ${d.raison}`);
      process.exitCode = 1;
    }
  } else {
    console.log('');
    console.log(`${pages.length} pages générées dans ${base}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { construirePages, RACINE };
