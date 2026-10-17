// Tests du générateur « Nombres » : node nombres/test-nombres.js
// Pour chaque classe, chaque mission active et chaque palier : bornes, réponses justes,
// choix distincts, rien hors classe. Sans dépendance.
'use strict';
const path = require('path');
global.window = {};
['cp', 'ce1', 'ce2', 'cm1', 'cm2'].forEach((c) => require(path.join(__dirname, '..', 'programmes', c + '.js')));
const G = require('./js/generateur_nombres.js');
const PROGS = global.window.PROGRAMMES;

// Plafond des nombres affichés, par classe (choix et énoncés compris)
const PLAFOND = { cp: 100, ce1: 1000, ce2: 10000, cm1: 9999999, cm2: 1000000000 };
// Missions attendues par classe (le reste doit être actif:false)
const ATTENDU = {
  cp: ['valeur', 'decomposer', 'comparer', 'ranger', 'moitie'],
  ce1: ['valeur', 'decomposer', 'comparer', 'ranger', 'encadrer'],
  ce2: ['valeur', 'decomposer', 'comparer', 'ranger', 'encadrer', 'droite'],
  cm1: ['valeur', 'decomposer', 'comparer', 'ranger', 'encadrer', 'droite', 'fractions', 'decimaux'],
  cm2: ['valeur', 'decomposer', 'comparer', 'ranger', 'encadrer', 'droite', 'fractions', 'decimaux']
};
const TIRAGES = 300;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let nbTests = 0, echecs = 0;
const vus = new Set();
function ok(cond, msg) {
  nbTests++;
  if (!cond && !vus.has(msg)) {
    vus.add(msg);
    echecs++;
    if (echecs <= 40) console.log('ECHEC ' + msg);
  }
}

const num = (s) => Number(String(s).replace(/[ \s]/g, '').replace(',', '.'));
const NOMBRE = /\d+(?: \d{3})*(?:,\d+)?/g;
const nombresDans = (s) => (String(s).match(NOMBRE) || []).map(num);
const textes = (q) => [q.enonce, q.expression, q.reponseTexte, q.visuel && q.visuel.labels ? q.visuel.labels.join(' ') : '']
  .concat(q.choix || []).concat((q.items || []).map((i) => i.label)).filter(Boolean);
const egal = (a, b) => Math.abs(a - b) < 1e-9;

function verifSemantique(q, d, ctx) {
  const k = q.meta.kind, m = q.meta.mission.replace('nombres-', '');
  const trou = (s) => String(s).replace(/\{\?\}/g, '?');
  if (m === 'comparer' && k === 'symbole') {
    const mm = trou(q.expression).match(/^(.+?) \? (.+)$/);
    const a = num(mm[1]), b = num(mm[2]);
    ok((a < b ? '<' : a > b ? '>' : '=') === q.reponse, ctx + ' symbole faux ' + q.expression);
  }
  if (m === 'comparer' && (k === 'plusgrand' || k === 'pluspetit')) {
    const v = q.choix.map(num);
    const cible = k === 'plusgrand' ? Math.max.apply(null, v) : Math.min.apply(null, v);
    ok(egal(num(q.reponse), cible), ctx + ' plus grand/petit faux ' + q.choix.join('|'));
  }
  if (m === 'ranger') {
    const tri = q.items.slice().sort((x, y) => (k === 'croissant' ? num(x.label) - num(y.label) : num(y.label) - num(x.label)));
    ok(tri.map((i) => i.id).join() === q.reponse.join(), ctx + ' ordre faux');
    ok(new Set(q.items.map((i) => num(i.label))).size === q.items.length, ctx + ' doublons ranger');
    ok(q.items.length === (d.nb || 3), ctx + ' nombre d\'items');
  }
  if (m === 'valeur') {
    if (k === 'chiffre') {
      const mm = q.enonce.match(/^Dans (.+), quel est le chiffre des (.+) \?$/);
      const s = mm[1].replace(/ /g, '');
      const r = ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de milliers', 'centaines de milliers', 'millions', 'dizaines de millions', 'centaines de millions'].indexOf(mm[2]);
      ok(s[s.length - 1 - r] === q.reponse, ctx + ' chiffre faux ' + q.enonce);
    }
    if (k === 'valeur') {
      const mm = q.enonce.match(/^Dans (.+), quelle est la valeur du chiffre (\d) \?$/);
      const s = mm[1].replace(/ /g, ''), c = mm[2];
      ok(s.split(c).length === 2, ctx + ' chiffre non unique ' + q.enonce);
      ok(num(q.reponse) === Number(c) * Math.pow(10, s.length - 1 - s.indexOf(c)), ctx + ' valeur fausse ' + q.enonce);
    }
    if (k === 'combien') {
      const mm = q.enonce.match(/^Dans (.+), combien y a-t-il de (.+) en tout \?$/);
      const n = num(mm[1]);
      const r = ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de milliers', 'centaines de milliers', 'millions', 'dizaines de millions', 'centaines de millions'].indexOf(mm[2]);
      ok(q.reponse === Math.floor(n / Math.pow(10, r)), ctx + ' combien faux ' + q.enonce);
    }
  }
  if (m === 'decomposer') {
    if (k === 'retrouver') {
      const mm = trou(q.expression).match(/^(.+) = \?$/);
      const somme = mm[1].split(' + ').map(num).reduce((a, b) => a + b, 0);
      ok(somme === num(q.reponse), ctx + ' retrouver faux ' + q.expression);
    }
    if (k === 'somme') {
      const mm = trou(q.expression).match(/^(.+?) = (.+)$/);
      const n = num(mm[1]);
      const morceaux = mm[2].split(' + ');
      const cumul = morceaux.reduce((a, t) => a + (t === '?' ? q.reponse : num(t)), 0);
      ok(cumul === n, ctx + ' somme fausse ' + q.expression);
    }
    if (k === 'rangs') {
      const mm = trou(q.expression).match(/^(.+?) = (.+)$/);
      const n = num(mm[1]);
      const morc = mm[2].split(' + ');
      const L = morc.length;
      let tot = 0;
      morc.forEach((t, i) => { const c = t.startsWith('?') ? q.reponse : Number(t.split(' ')[0]); tot += c * Math.pow(10, L - 1 - i); });
      ok(tot === n, ctx + ' rangs faux ' + q.expression);
    }
    if (k === 'paquets') {
      const e = trou(q.expression);
      let mm = e.match(/^(.+?) = \? × (.+) \+ (.+)$/);
      if (mm) ok(q.reponse * num(mm[2]) + num(mm[3]) === num(mm[1]), ctx + ' paquets faux ' + e);
      else {
        mm = e.match(/^(.+?) = (.+) × (.+) \+ \?$/);
        ok(num(mm[2]) * num(mm[3]) + q.reponse === num(mm[1]), ctx + ' paquets reste faux ' + e);
      }
    }
  }
  if (m === 'encadrer') {
    const dec = d.dec || 0;
    if (k === 'pair') {
      const n = num(q.enonce.split(' est entre')[0]);
      const [a, b] = q.reponse.split(' et ').map(num);
      ok(a < n && n < b, ctx + ' encadrement faux ' + q.enonce + ' ' + q.reponse);
      const e = Math.round(Math.log10(Math.abs(b - a) + 1e-12));
      ok(d.e.indexOf(e) !== -1, ctx + ' pas de l\'encadrement hors palier (' + e + ')');
    } else {
      const n = num(q.enonce.split(' de ').pop().replace(/ \?$/, ''));
      ok(k === 'inf' ? q.reponse < n : q.reponse > n, ctx + ' inf/sup faux ' + q.enonce);
      ok(Math.abs(q.reponse - n) < Math.pow(10, Math.max.apply(null, d.e)) + 1e-9, ctx + ' inf/sup trop loin');
      void dec;
    }
  }
  if (m === 'moitie') {
    if (k === 'moitie') ok(q.reponse * 2 === nombresDans(q.enonce)[0], ctx + ' moitié fausse ' + q.enonce);
    if (k === 'partage') ok(q.reponse * 2 === nombresDans(q.enonce)[0], ctx + ' partage faux ' + q.enonce);
    if (k === 'estmoitie') ok(num(q.reponse) === 2 * nombresDans(q.enonce)[0], ctx + ' estmoitie faux ' + q.enonce);
  }
  if (m === 'fractions') {
    const e = trou(q.expression || '');
    if (k === 'lirepart') {
      const [n, dd] = q.reponse.split('/').map(Number);
      ok(q.visuel.n === n && q.visuel.d === dd && n < dd, ctx + ' visuel part');
      q.choix.forEach((c) => { if (c !== q.reponse) { const [a, b] = c.split('/').map(Number); ok(a * dd !== n * b, ctx + ' distracteur de même valeur ' + c + ' / ' + q.reponse); } });
    }
    if (k === 'equivalente') {
      const mm = e.match(/^(\d+)\/(\d+) = (\?|\d+)\/(\?|\d+)$/);
      const a = Number(mm[1]), b = Number(mm[2]);
      const c = mm[3] === '?' ? q.reponse : Number(mm[3]);
      const dd = mm[4] === '?' ? q.reponse : Number(mm[4]);
      ok(a * dd === b * c, ctx + ' équivalence fausse ' + e);
    }
    if (k === 'compare1') {
      const mm = e.match(/^(\d+)\/(\d+) \? 1$/);
      ok((Number(mm[1]) < Number(mm[2]) ? '<' : Number(mm[1]) > Number(mm[2]) ? '>' : '=') === q.reponse, ctx + ' compare1 faux ' + e);
    }
    if (k === 'cmpden') {
      const mm = e.match(/^(\d+)\/(\d+) \? (\d+)\/(\d+)$/);
      ok(mm[2] === mm[4], ctx + ' cmpden dénominateurs');
      ok((Number(mm[1]) < Number(mm[3]) ? '<' : Number(mm[1]) > Number(mm[3]) ? '>' : '=') === q.reponse, ctx + ' cmpden faux ' + e);
    }
    if (k === 'quantite' || k === 'quantite2') {
      const mm = q.enonce.match(/^Calcule (?:la moitié|le tiers|le quart|(\d+)\/(\d+)) de (\d+)\.$/);
      const Q = Number(mm[3]);
      let n = 1, dd;
      if (mm[1]) { n = Number(mm[1]); dd = Number(mm[2]); }
      else dd = /moitié/.test(q.enonce) ? 2 : /tiers/.test(q.enonce) ? 3 : 4;
      ok(Q % dd === 0 && q.reponse === (Q / dd) * n, ctx + ' quantité fausse ' + q.enonce);
    }
    if (k === 'ecriture') {
      if (q.expression) {
        const mm = e.match(/^(.+) = \?\/(\d+)$/);
        ok(Math.round(num(mm[1]) * Number(mm[2])) === q.reponse, ctx + ' écriture frac fausse ' + e);
      } else {
        const mm = q.enonce.match(/^Écris (\d+)\/(\d+) /);
        ok(egal(Number(mm[1]) / Number(mm[2]), q.reponse), ctx + ' écriture déc fausse ' + q.enonce);
      }
    }
  }
  if (m === 'decimaux') {
    if (k === 'chiffre') {
      const mm = q.enonce.match(/^Dans (.+), quel est le chiffre des (.+) \?$/);
      const [ent, fra] = mm[1].replace(/ /g, '').split(',');
      const pos = { 'unités': ent[ent.length - 1], 'dixièmes': fra[0], 'centièmes': fra[1], 'millièmes': fra[2] }[mm[2]];
      ok(pos === q.reponse, ctx + ' chiffre décimal faux ' + q.enonce);
    }
    if (k === 'valeur') {
      const mm = q.enonce.match(/^Dans (.+), quelle est la valeur du chiffre (\d) \?$/);
      const s = mm[1].replace(/ /g, '');
      ok(s.replace(',', '').split(mm[2]).length === 2, ctx + ' chiffre décimal non unique');
      const i = s.indexOf(mm[2]), v = s.indexOf(',');
      const exp = Number(mm[2]) * Math.pow(10, i < v ? v - i - 1 : v - i);
      ok(egal(num(q.reponse), exp), ctx + ' valeur décimale fausse ' + q.enonce + ' -> ' + q.reponse);
    }
    if (k === 'combien') {
      const mm = q.enonce.match(/^Dans (.+), combien y a-t-il de (.+) en tout \?$/);
      const p = ['dixièmes', 'centièmes', 'millièmes'].indexOf(mm[2]) + 1;
      ok(q.reponse === Math.floor(Math.round(num(mm[1]) * 1000) / Math.pow(10, 3 - p) + 1e-9), ctx + ' combien décimal faux ' + q.enonce);
    }
  }
  if (m === 'droite') {
    const v = q.visuel;
    ok(Number.isInteger(v.n) && v.n >= 2 && v.n <= 20, ctx + ' n graduations ' + v.n);
    ok(v.labels.length === v.n + 1 && new Set(v.labels).size === v.labels.length, ctx + ' labels droite');
    if (q.type === 'droite') {
      ok(v.placer === true && v.n <= 10 && q.reponse >= 1 && q.reponse <= v.n - 1 && !(q.reponse in v.etiquettes), ctx + ' placer');
      ok(q.enonce === 'Touche la graduation de ' + v.labels[q.reponse] + '.', ctx + ' placer énoncé');
    } else {
      ok(v.marque >= 1 && v.marque <= v.n - 1 && !(v.marque in v.etiquettes) && q.reponse === v.labels[v.marque], ctx + ' lire');
    }
  }
}

function verifQuestion(q, d, classe, missionId, palier) {
  const ctx = classe + '/' + missionId + '/p' + palier;
  ok(q && typeof q === 'object', ctx + ' question nulle');
  if (!q) return;
  ok(['qcm', 'saisie', 'ordre', 'droite'].indexOf(q.type) !== -1, ctx + ' type ' + q.type);
  ok(typeof q.enonce === 'string' && q.enonce.length > 3, ctx + ' énoncé vide');
  ok(typeof q.voix === 'string' && q.voix.length > 3, ctx + ' voix vide');
  const tout = textes(q).join(' ');
  ok(!/undefined|NaN|null|Infinity|\[object/.test(tout), ctx + ' texte invalide: ' + tout);
  const plafond = PLAFOND[classe];
  nombresDans(tout).forEach((x) => ok(x <= plafond, ctx + ' nombre hors classe ' + x + ' dans "' + tout + '"'));
  ok(!/-\d/.test(tout.replace(/ - /g, '')), ctx + ' nombre négatif ? ' + tout);
  if (['cp', 'ce1', 'ce2'].indexOf(classe) !== -1) {
    ok(!/,\d|\d\/\d/.test(tout.replace(/\{\?\}/g, '')), ctx + ' décimal ou fraction avant le CM1: ' + tout);
  }
  // nombres principaux dans [min, max] du palier
  if (q.meta.nombres && d.min !== undefined && d.max !== undefined && q.meta.mission !== 'nombres-droite') {
    q.meta.nombres.forEach((x) => ok(x >= d.min - 1e-9 && x <= d.max + 1e-9, ctx + ' nombre ' + x + ' hors [' + d.min + ',' + d.max + ']'));
  }
  if (q.type === 'qcm') {
    ok(Array.isArray(q.choix) && q.choix.length >= 3 && q.choix.length <= 4, ctx + ' nb choix ' + (q.choix && q.choix.length));
    ok(new Set(q.choix).size === q.choix.length, ctx + ' choix en double ' + q.choix.join('|'));
    ok(q.choix.filter((c) => c === q.reponse).length === 1, ctx + ' réponse absente des choix ' + q.reponse + ' / ' + q.choix.join('|'));
    ok(new Set(q.choix.map((c) => (/^[<=>]$/.test(c) || /[/]/.test(c) ? c : num(c)))).size === q.choix.length || /\/| et /.test(q.choix[0]), ctx + ' choix de même valeur');
    if (q.ordreFixe) ok(q.choix.join('') === '<=>', ctx + ' ordre fixe');
  } else if (q.type === 'saisie') {
    ok(typeof q.reponse === 'number' && isFinite(q.reponse) && q.reponse >= 0, ctx + ' réponse saisie ' + q.reponse);
    ok(typeof q.reponseTexte === 'string' && egal(num(q.reponseTexte), q.reponse), ctx + ' reponseTexte ' + q.reponseTexte + ' / ' + q.reponse);
    ok(/\{\?\}/.test(q.expression || '') || !q.expression, ctx + ' trou manquant');
  } else if (q.type === 'ordre') {
    ok(q.items.length >= 3 && q.items.length <= 5, ctx + ' items');
    ok(Array.isArray(q.reponse) && q.reponse.length === q.items.length, ctx + ' réponse ordre');
    ok(new Set(q.items.map((i) => i.id)).size === q.items.length, ctx + ' ids en double');
    ok(q.items.map((i) => i.id).join() !== q.reponse.join() || q.items.length < 3, ctx + ' déjà rangé');
  }
  verifSemantique(q, d, ctx);
}

/* ---------- 1. structure du programme ---------- */
const TOUS = ['valeur', 'decomposer', 'comparer', 'ranger', 'encadrer', 'droite', 'moitie', 'fractions', 'decimaux'];
Object.keys(PLAFOND).forEach((classe) => {
  const prog = PROGS[classe];
  ok(prog && prog.nombres, classe + ': section nombres absente');
  TOUS.forEach((cle) => {
    const id = 'nombres-' + cle, def = prog.nombres[id];
    ok(def && typeof def.libelle === 'string', classe + ' ' + id + ' libellé');
    const attendu = ATTENDU[classe].indexOf(cle) !== -1;
    ok((def.actif !== false) === attendu, classe + ' ' + id + ' actif attendu=' + attendu);
    if (attendu) {
      ok(Array.isArray(def.niveaux) && def.niveaux.length === 6, classe + ' ' + id + ' paliers');
      ok(typeof def.consigne === 'string' && def.source && def.notes, classe + ' ' + id + ' consigne/source/notes');
      def.niveaux.forEach((d, i) => {
        if (cle === 'encadrer') d.e.forEach((e) => ok(e + (d.dec || 0) >= 0 && (e + (d.dec || 0) > 0 || (d.dec || 0) > 0), classe + ' encadrer pas invalide p' + (i + 1)));
        if (cle === 'droite') {
          const n = (d.max - d.min) / (d.pas || 1);
          ok(Number.isInteger(n) && n >= 2 && n <= 20, classe + ' droite n=' + n + ' p' + (i + 1));
          ok(!(d.dec || d.den) || classe === 'cm1' || classe === 'cm2', classe + ' droite décimale/fraction trop tôt');
        }
        if (d.max !== undefined && cle !== 'droite' && cle !== 'moitie') ok(d.max <= PLAFOND[classe], classe + ' ' + id + ' max palier ' + (i + 1));
        if (cle === 'moitie') ok(d.max <= PLAFOND[classe], classe + ' moitié max');
        if (cle === 'droite' && !d.dec && !d.den) ok(d.max <= PLAFOND[classe], classe + ' droite max');
        if (d.dec) ok(['cm1', 'cm2'].indexOf(classe) !== -1, classe + ' décimaux avant le CM1');
        if (classe === 'cm1' && d.dec) ok(d.dec <= 2, 'cm1: décimaux limités aux centièmes');
      });
    } else {
      ok(G.generer(prog, id, 1, mulberry32(1)) === null, classe + ' ' + id + ' inactif doit renvoyer null');
    }
  });
});

/* ---------- 2. tirages ---------- */
const stats = {};
Object.keys(PLAFOND).forEach((classe, ci) => {
  const prog = PROGS[classe];
  ATTENDU[classe].forEach((cle, mi) => {
    const id = 'nombres-' + cle, def = prog.nombres[id];
    def.niveaux.forEach((d, pi) => {
      const rng = mulberry32(1000 * ci + 100 * mi + pi + 7);
      const types = new Set();
      for (let t = 0; t < TIRAGES; t++) {
        const q = G.generer(prog, id, pi + 1, rng);
        verifQuestion(q, d, classe, id, pi + 1);
        if (q) types.add(q.meta.kind);
      }
      // chaque type demandé par le palier doit sortir au moins une fois (variété)
      (d.types || []).forEach((tp) => {
        const sorti = types.has(tp) || (tp === 'croissant' || tp === 'decroissant' ? types.has(tp) : false);
        if (!sorti && !['lire', 'placer'].includes(tp)) ok(false, classe + '/' + id + '/p' + (pi + 1) + ' type jamais généré: ' + tp);
      });
      (d.sens || []).forEach((tp) => ok(types.has(tp), classe + '/' + id + '/p' + (pi + 1) + ' sens jamais généré: ' + tp));
      stats[classe] = (stats[classe] || 0) + TIRAGES;
    });
  });
});

/* ---------- 3. déterminisme et palier hors bornes ---------- */
{
  const a = G.generer(PROGS.cm2, 'nombres-comparer', 3, mulberry32(42));
  const b = G.generer(PROGS.cm2, 'nombres-comparer', 3, mulberry32(42));
  ok(JSON.stringify(a) === JSON.stringify(b), 'même rng => même question');
  ok(G.generer(PROGS.cp, 'nombres-valeur', 99, mulberry32(3)) !== null, 'palier trop grand borné');
  ok(G.generer(PROGS.cp, 'nombres-valeur', 0, mulberry32(3)) !== null, 'palier 0 borné');
  ok(G.generer(PROGS.cp, 'nombres-inconnu', 1, mulberry32(3)) === null, 'mission inconnue => null');
  ok(G.fmt(1234567) === '1 234 567' && G.fmt(305, 2) === '3,05' && G.fmtCourt(350, 2) === '3,5', 'formatage');
}

console.log(nbTests + ' vérifications, ' + echecs + ' échec(s).');
console.log('Tirages par classe : ' + Object.keys(stats).map((c) => c + '=' + stats[c]).join(', '));
process.exit(echecs ? 1 : 0);
