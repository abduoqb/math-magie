/**
 * Test des fonctions PURES de js/sync.js (fusion de profils).
 *
 * Vérifie les règles de docs/SYNC-SPEC.md :
 *  1. par mission, le `_maj` le plus récent gagne ;
 *  2. les champs `parties*` prennent le max ;
 *  3. une mission présente d'un seul côté est conservée ;
 *  4. les champs de profil suivent le `_majProfil` le plus récent ;
 *  5. une pierre tombale gagne si `supprimeLe` > `_majProfil` de l'autre ;
 *  6. `progressionEnAttente` est rattachée au niveau si `niveauClasse` est connu.
 * Plus : commutativité et idempotence (comparées via stable()), sur ~2000 tirages aléatoires.
 *
 * Lancer : node js/test-sync.js
 */
'use strict';

const assert = require('node:assert');

const PURES = require('./sync.js');
const fusionnerProfils = PURES.fusionnerProfils;
const fusionnerCodeParent = PURES.fusionnerCodeParent;
const stable = PURES.stable;

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

function estObjet(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function nb(v) { return typeof v === 'number' && isFinite(v) ? v : 0; }
function union(a, b) { return Array.from(new Set(a.concat(b))); }

/* ---------- Cas explicites ---------- */

verif(typeof fusionnerProfils === 'function', 'fusionnerProfils exportée');
verif(typeof stable === 'function', 'stable exportée');

// Règle 1 & 2 : le plus récent gagne, sauf `parties*` qui prend le max.
const L1 = { _majProfil: 10, niveauClasse: 'cp', progression: { cp: { additions: { niveau: 3, _maj: 100, partiesJouees: 4 } } } };
const D1 = { _majProfil: 10, niveauClasse: 'cp', progression: { cp: { additions: { niveau: 7, _maj: 200, partiesJouees: 1 } } } };
const M1 = fusionnerProfils(L1, D1);
verif(M1.progression.cp.additions.niveau === 7, 'règle 1 : le _maj le plus récent (200) doit gagner -> niveau 7');
verif(M1.progression.cp.additions.partiesJouees === 4, 'règle 2 : partiesJouees = max(4,1) = 4 malgré _maj plus ancien');
verif(M1.progression.cp.additions._maj === 200, 'fusion mission : _maj = max(100,200)');

// Règle 1 bis : `_maj` plus récent mais champ absent -> le champ n'est pas réinjecté par l'ancien.
const M1b = fusionnerProfils(
  { _majProfil: 0, niveauClasse: 'cp', progression: { cp: { additions: { _maj: 500 } } } },
  { _majProfil: 0, niveauClasse: 'cp', progression: { cp: { additions: { _maj: 100, niveau: 9 } } } }
);
verif(M1b.progression.cp.additions.niveau === undefined, 'règle 1 : le plus récent (sans le champ) prime');

// Règle 3 : mission présente d'un seul côté conservée.
const L2 = { _majProfil: 5, progression: { cp: { additions: { niveau: 1, _maj: 1 } } } };
const D2 = { _majProfil: 5, progression: { cm1: { divisions: { niveau: 2, _maj: 2 } } } };
const M2 = fusionnerProfils(L2, D2);
verif(M2.progression.cp && M2.progression.cp.additions, 'règle 3 : mission locale conservée');
verif(M2.progression.cm1 && M2.progression.cm1.divisions, 'règle 3 : mission distante conservée');

// Règle 4 : champs de profil, `_majProfil` le plus récent gagne.
const L3 = { _majProfil: 500, _avatar: 'tigre', _couleur: '#f00', niveauClasse: 'ce1', code: { sel: 'a', hash: 'A' } };
const D3 = { _majProfil: 100, _avatar: 'grenouille', _couleur: '#0f0', niveauClasse: 'cm2', code: { sel: 'b', hash: 'B' } };
const M3 = fusionnerProfils(L3, D3);
verif(M3._avatar === 'tigre' && M3._couleur === '#f00' && M3.niveauClasse === 'ce1', 'règle 4 : _majProfil le plus récent gagne');
verif(M3._majProfil === 500, 'règle 4 : _majProfil = max');

// Règle 5 : la pierre tombale gagne si supprimeLe > _majProfil de l'autre.
const Mt = fusionnerProfils({ supprimeLe: 1000, _majProfil: 50 }, { niveauClasse: 'cp', _majProfil: 200, _avatar: 'tigre', progression: {} });
verif(Mt.supprimeLe === 1000, 'règle 5 : la pierre tombale gagne si supprimeLe > _majProfil');
verif(Mt.progression === undefined, 'pierre tombale : pas de progression');
verif(Mt._avatar === undefined, 'pierre tombale : pas d\'avatar');

// Règle 5 bis : profil modifié APRÈS la suppression -> il survit.
const Mv = fusionnerProfils({ supprimeLe: 100, _majProfil: 50 }, { _majProfil: 200, _avatar: 'grenouille', niveauClasse: 'cp', progression: { cp: { additions: { niveau: 2, _maj: 5 } } } });
verif(Mv.supprimeLe === undefined, 'règle 5 : profil modifié après la suppression survit');
verif(Mv._avatar === 'grenouille', 'règle 5 : contenu du survivant conservé');
verif(Mv.progression.cp.additions.niveau === 2, 'règle 5 : progression du survivant conservée');

// Règle 5 ter : deux pierres tombales -> max.
const Mb = fusionnerProfils({ supprimeLe: 100, _majProfil: 1 }, { supprimeLe: 300, _majProfil: 2 });
verif(Mb.supprimeLe === 300 && Mb._majProfil === 2, 'pierre tombale : max des dates');

// Règle 6 : progressionEnAttente rattachée au niveau si connu.
const M7 = fusionnerProfils({ _majProfil: 0, niveauClasse: 'ce1', code: null, progressionEnAttente: { additions: { niveau: 4, _maj: 9 } } }, null);
verif(M7.progression && M7.progression.ce1 && M7.progression.ce1.additions && M7.progression.ce1.additions.niveau === 4, 'progressionEnAttente rattachée au niveau de classe');
verif(M7.progressionEnAttente === undefined, 'progressionEnAttente supprimée après rattachement');
const M7b = fusionnerProfils({ _majProfil: 0, niveauClasse: null, code: null, progressionEnAttente: { additions: { niveau: 4, _maj: 9 } } }, null);
verif(M7b.progressionEnAttente && M7b.progressionEnAttente.additions.niveau === 4, 'progressionEnAttente conservée si niveau inconnu');

// Valeurs nulles.
verif(fusionnerProfils(null, null) === null, 'fusion de deux null -> null');
verif(stable(fusionnerProfils(null, D1)) === stable(fusionnerProfils(D1, null)), 'fusion avec null commutative');

// Code parent.
verif(fusionnerCodeParent({ sel: 'a', hash: 'A', _maj: 1 }, { sel: 'b', hash: 'B', _maj: 2 }).hash === 'B', 'code parent : _maj le plus récent gagne');
verif(fusionnerCodeParent(null, { sel: 'b', hash: 'B' }).hash === 'B', 'code parent : un seul côté');
verif(fusionnerCodeParent(null, null) === null, 'code parent : deux null');

// Pas d'alias sur les entrées.
const src = { _majProfil: 1, progression: { cp: { additions: { niveau: 1, _maj: 1 } } } };
const M10 = fusionnerProfils(src, null);
M10.progression.cp.additions.niveau = 99;
verif(src.progression.cp.additions.niveau === 1, 'le résultat ne doit pas aliaser l\'entrée');

/* ---------- Tirages aléatoires ---------- */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }

const CLASSES = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
const MISSIONS = ['additions', 'soustractions', 'multiplications', 'divisions', 'jeu-pendu', 'nombres-valeur'];
const AVATARS = ['tigre', 'grenouille', 'licorne', 'dragon'];
const COULEURS = ['#f00', '#0f0', '#00f', '#ff0'];

function missionRnd(rng) {
  const m = { _maj: ri(rng, 0, 1000) };
  if (rng() < 0.85) m.niveau = ri(rng, 1, 10);
  if (rng() < 0.5) m.partiesJouees = ri(rng, 0, 50);
  if (rng() < 0.4) m.partiesGagnees = ri(rng, 0, 50);
  if (rng() < 0.3) m.partiesDefis = ri(rng, 0, 20);
  if (rng() < 0.3) m.meilleurScore = ri(rng, 0, 100);
  if (rng() < 0.2) m.note = 'n' + ri(rng, 0, 3);
  return m;
}

function sacRnd(rng) {
  const sac = {};
  const n = ri(rng, 0, 3);
  for (let i = 0; i < n; i++) sac[MISSIONS[ri(rng, 0, MISSIONS.length - 1)]] = missionRnd(rng);
  return sac;
}

/** Profil conforme au modèle de données documenté (code, niveauClasse, progression toujours présents). */
function profilRnd(rng) {
  const p = {};
  p._avatar = AVATARS[ri(rng, 0, AVATARS.length - 1)];
  p._couleur = COULEURS[ri(rng, 0, COULEURS.length - 1)];
  p.niveauClasse = rng() < 0.15 ? null : CLASSES[ri(rng, 0, CLASSES.length - 1)];
  p.code = rng() < 0.5 ? { sel: 's' + ri(rng, 0, 3), hash: 'h' + ri(rng, 0, 3) } : null;
  p._majProfil = ri(rng, 0, 1000);

  const progression = {};
  const nClass = ri(rng, 0, 2);
  for (let i = 0; i < nClass; i++) progression[CLASSES[ri(rng, 0, CLASSES.length - 1)]] = sacRnd(rng);
  p.progression = progression;

  if (rng() < 0.25) p.progressionEnAttente = sacRnd(rng);
  if (rng() < 0.15) p.extra = 'v' + ri(rng, 0, 2);
  if (rng() < 0.15) { p.supprimeLe = ri(rng, 0, 1300); p._majProfil = ri(rng, 0, 1300); }
  return p;
}

function aAttente(p) { return estObjet(p.progressionEnAttente) && Object.keys(p.progressionEnAttente).length > 0; }

function verifierFusion(L, D, label) {
  const M1 = fusionnerProfils(L, D);
  const M2 = fusionnerProfils(D, L);
  verif(stable(M1) === stable(M2), label + ' : fusion non commutative');

  const M3 = fusionnerProfils(M1, D);
  verif(stable(M3) === stable(M1), label + ' : fusion non idempotente (fusion(fusion(L,D),D))');

  const sL = nb(L.supprimeLe), sD = nb(D.supprimeLe);
  const mL = nb(L._majProfil), mD = nb(D._majProfil);

  if (sL || sD) {
    if (sL && sD) {
      verif(M1.supprimeLe === Math.max(sL, sD), label + ' : deux pierres tombales -> max attendu');
    } else if ((sL || sD) > (sL ? mD : mL)) {
      verif(M1.supprimeLe === (sL || sD), label + ' : pierre tombale gagnante attendue');
    } else {
      verif(M1.supprimeLe === undefined, label + ' : profil survivant attendu (modifié après suppression)');
    }
    return;
  }

  // Règle 4 : champs de profil.
  ['_avatar', '_couleur', 'niveauClasse', 'code'].forEach((k) => {
    if (mL > mD) verif(stable(M1[k]) === stable(L[k]), label + ' : champ profil ' + k + ' devrait venir du plus récent');
    else if (mD > mL) verif(stable(M1[k]) === stable(D[k]), label + ' : champ profil ' + k + ' devrait venir du plus récent');
  });
  verif(nb(M1._majProfil) === Math.max(mL, mD), label + ' : _majProfil = max');

  // L'ancienne progression en attente est volontairement repliée dans progression[niveauClasse] :
  // dans ce cas, la comparaison mission par mission n'est pas directe (couverte par commutativité/idempotence).
  if (aAttente(L) || aAttente(D)) return;

  // Règles 1 à 3 : progression par classe et par mission.
  const lp = estObjet(L.progression) ? L.progression : {};
  const dp = estObjet(D.progression) ? D.progression : {};
  for (const c of union(Object.keys(lp), Object.keys(dp))) {
    const sacL = estObjet(lp[c]) ? lp[c] : {};
    const sacD = estObjet(dp[c]) ? dp[c] : {};
    const sacM = estObjet(M1.progression) ? M1.progression[c] : undefined;
    for (const mid of union(Object.keys(sacL), Object.keys(sacD))) {
      verif(!!sacM && sacM[mid] !== undefined, label + ' : mission perdue ' + c + '/' + mid);
      const a = sacL[mid], b = sacD[mid];
      if (a === undefined || b === undefined || !estObjet(a) || !estObjet(b) || !sacM) continue;
      const m = sacM[mid];
      const ma = nb(a._maj), mb = nb(b._maj);
      verif(nb(m._maj) === Math.max(ma, mb), label + ' : _maj de mission = max');
      for (const k of union(Object.keys(a), Object.keys(b))) {
        if (k === '_maj') continue;
        if (k.indexOf('parties') === 0) {
          const nombres = [a[k], b[k]].filter((x) => typeof x === 'number');
          if (nombres.length) verif(m[k] === Math.max.apply(null, nombres), label + ' : champ parties non max (' + k + ')');
          continue;
        }
        if (ma > mb) verif(stable(m[k]) === stable(a[k]), label + ' : champ ' + k + ' devrait venir du plus récent (a)');
        else if (mb > ma) verif(stable(m[k]) === stable(b[k]), label + ' : champ ' + k + ' devrait venir du plus récent (b)');
      }
    }
  }
}

const TIRAGES = 2000;
const rng = mulberry32(20261018);
for (let i = 0; i < TIRAGES; i++) {
  verifierFusion(profilRnd(rng), profilRnd(rng), 'aléatoire#' + i);
}

/* ---------- Résumé ---------- */

console.log(verifs + ' vérifications (' + TIRAGES + ' tirages aléatoires), ' + nbEchecs + ' échec(s).');
if (messages.length) {
  console.log('Échecs (' + nbEchecs + '), premiers cas :');
  messages.forEach((m) => console.log('  - ' + m));
}
process.exit(nbEchecs ? 1 : 0);
