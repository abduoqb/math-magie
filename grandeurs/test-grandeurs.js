/* Tests du générateur « Grandeurs & mesures » (Node sans dépendance) :
     node grandeurs/test-grandeurs.js
   Vérifie, pour chaque classe, chaque mission active et chaque palier :
   - bornes des données, réponse juste (recalculée indépendamment), choix cohérents ;
   - aucun contenu hors classe (unités, types, figures, modes, taille des nombres, décimales) ;
   - missions inactives sans paliers ; reproductibilité à graine égale.
   Le bloc `grandeurs` de chaque programmes/<classe>.js est extrait entre ses marqueurs
   BEGIN/END : les tests ne dépendent pas des autres sections du programme. */
'use strict';
var fs = require('fs');
var path = require('path');
var G = require('./js/generateur_grandeurs.js');

var RACINE = path.join(__dirname, '..');
var CLASSES = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
var N = 300;
var echecs = [];
var nbQuestions = 0;
function ko(msg) { if (echecs.length < 40) echecs.push(msg); else if (echecs.length === 40) echecs.push('… (autres échecs masqués)'); }

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function chargerProgramme(classe) {
  var src = fs.readFileSync(path.join(RACINE, 'programmes', classe + '.js'), 'utf8');
  var m = src.match(/\/\/ BEGIN grandeurs[^\n]*\n([\s\S]*?)\/\/ END grandeurs/);
  if (!m) throw new Error('bloc grandeurs absent de programmes/' + classe + '.js');
  var corps = m[1].trim().replace(/,\s*$/, '');
  return { id: classe, grandeurs: new Function('return ({' + corps + '})')().grandeurs };
}

/* ---------- ce que chaque classe a le droit de voir ---------- */
var U_CP = ['cm', 'm'];
var U_CE1 = U_CP.concat(['dm', 'km', 'g', 'kg', 'L', 'h', 'min', 'jour', 'semaine', 'mois', 'an', '€', 'cts']);
var U_CE2 = U_CE1.concat(['mm', 't', 'dL', 'cL', 'mL', 's']);
var U_CM1 = U_CE2.concat(['cm²', 'm²']);
var U_CM2 = U_CM1.concat(['dm²', 'cm³', 'dm³', 'm³', 'km/h', '%']);
var T_CP = ['comparer', 'choisirUnite', 'probleme', 'convertir'];
var T_CE1 = T_CP.concat(['mixte', 'monnaieSomme', 'monnaieRendu', 'dureeEcart']);
var T_CE2 = T_CE1.concat(['perimetre']);
var T_CM1 = T_CE2.concat(['aire', 'proportionnalite']);
var T_CM2 = T_CM1.concat(['volume', 'vitesse', 'echelle', 'pourcentage']);

var SPEC = {
  cp:  { missions: ['longueurs'], unites: U_CP, types: T_CP, ops: ['add', 'sub'], figures: [], modes: [], maxNombre: 100, maxDec: 0 },
  ce1: { missions: ['longueurs', 'masses-contenances', 'durees-monnaie'], unites: U_CE1, types: T_CE1, ops: ['add', 'sub', 'mul', 'div'], figures: [], modes: [], maxNombre: 5000, maxDec: 0 },
  ce2: { missions: ['longueurs', 'masses-contenances', 'durees-monnaie', 'perimetres-aires'], unites: U_CE2, types: T_CE2, ops: ['add', 'sub', 'mul', 'div'],
         figures: ['carre', 'rectangle', 'triangle', 'losange'], modes: [], maxNombre: 10000, maxDec: 2, decTypes: ['monnaieRendu'] },
  cm1: { missions: ['longueurs', 'masses-contenances', 'durees-monnaie', 'perimetres-aires', 'proportionnalite-pourcentages'], unites: U_CM1, types: T_CM1, ops: ['add', 'sub', 'mul', 'div'],
         figures: ['carre', 'rectangle', 'triangle', 'losange', 'hexagone', 'grille'], modes: ['prix', 'prix-unitaire', 'recette', 'tableau'], maxNombre: 1000000, maxDec: 2 },
  cm2: { missions: ['longueurs', 'masses-contenances', 'durees-monnaie', 'perimetres-aires', 'proportionnalite-pourcentages', 'volumes-vitesses-echelles'], unites: U_CM2, types: T_CM2, ops: ['add', 'sub', 'mul', 'div'],
         figures: ['carre', 'rectangle', 'triangle', 'losange', 'hexagone', 'grille', 'triangle-rectangle', 'cercle', 'cube', 'pave'],
         modes: ['prix', 'prix-unitaire', 'recette', 'tableau', 'de', 'reduction', 'fraction', 'plan-reel', 'reel-plan', 'distance', 'vitesse', 'temps', 'minutes'], maxNombre: 1000000000, maxDec: 3 }
};
/* L'unité d'un objet n'est pas ambiguë : quelques vérifications indépendantes de « Quelle unité ? » */
var UNITE_ATTENDUE = [
  [/crayon/, 'cm'], [/porte/, 'm'], [/entre deux villes/, 'km'], [/camion\b(?!-)/, 't'], [/éléphant|baleine/, 't'],
  [/pomme\b/, 'g'], [/cuillère/, 'mL'], [/baignoire/, 'L'], [/film/, 'h'], [/timbre/, 'cm²'], [/terrain de football/, null]
];

/* ---------- outils de vérification ---------- */
var FACT = G.UNITES;
function facteur(grandeur, u) { return FACT[grandeur] && FACT[grandeur][u]; }
function nombres(texte) {
  var t = texte.replace(/ /g, '').replace(/(\d),(\d)/g, '$1.$2');
  return (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
}
function proche(a, b) { return Math.abs(a - b) < 1e-6; }
function decimales(x) { var s = String(x); var i = s.indexOf('.'); return i === -1 ? 0 : s.length - i - 1; }
function nomExo(exo) { return exo.type + (exo.grandeur ? '/' + exo.grandeur : ''); }

function verifierReponse(q, exo, ctx) {
  var v = q.meta.valeurs || [];
  var nb = nombres(q.texte);
  var attendu;
  switch (q.type) {
    case 'convertir': {
      var de = q.meta.unites[0], vers = q.meta.unites[1];
      attendu = v[0] * facteur(q.grandeur, de) / facteur(q.grandeur, vers);
      if (!proche(attendu, q.resultat)) ko(ctx + ' convertir faux : ' + q.texte + ' ' + q.resultat + ' vs ' + attendu);
      break;
    }
    case 'mixte': {
      var g = q.meta.unites[0], p = q.meta.unites[1];
      attendu = nb[0] * facteur(q.grandeur, g) / facteur(q.grandeur, p) + nb[1];
      if (!proche(attendu, q.resultat)) ko(ctx + ' mixte faux : ' + q.texte + ' ' + q.resultat);
      if (nb[1] >= facteur(q.grandeur, g) / facteur(q.grandeur, p)) ko(ctx + ' mixte : partie fine trop grande : ' + q.texte);
      break;
    }
    case 'probleme': {
      var a = v[0], b = v[1];
      var op = q.meta.op;
      attendu = op === 'add' ? a + b : op === 'sub' ? a - b : null;
      if (op === 'sub' && a <= b) ko(ctx + ' soustraction non positive : ' + q.texte);
      if (attendu !== null && !proche(attendu, q.resultat)) ko(ctx + ' probleme faux : ' + q.texte + ' ' + q.resultat);
      if (op === 'mul') {
        var n = nb[nb.length - 1] === a ? nb[0] : (nb.indexOf(a) === 0 ? nb[1] : nb[0]);
        var nn = nb.filter(function (x) { return !proche(x, a); });
        if (nn.length && !proche(a * nn[0], q.resultat)) ko(ctx + ' mul faux : ' + q.texte + ' ' + q.resultat);
        void n;
      }
      if (op === 'div') {
        var nd = nb.filter(function (x) { return !proche(x, a); })[0];
        if (!nd || !proche(a / nd, q.resultat)) ko(ctx + ' div faux : ' + q.texte + ' ' + q.resultat);
      }
      break;
    }
    case 'comparer': {
      var f = q.choix.map(function (c, i) { return v[i] * facteur(q.grandeur, q.meta.unites[i]); });
      var moins = /moins|court|léger|petit/.test(q.texte);
      var idx = moins ? (f[0] < f[1] ? 0 : 1) : (f[0] > f[1] ? 0 : 1);
      if (f[0] === f[1]) ko(ctx + ' comparer : valeurs égales : ' + q.choix.join(' / '));
      if (idx !== q.resultat) ko(ctx + ' comparer faux : ' + q.texte + ' ' + q.choix.join(' / ') + ' -> ' + q.resultat);
      break;
    }
    case 'choisirUnite': {
      var bonne = q.choix[q.resultat];
      UNITE_ATTENDUE.forEach(function (e) {
        if (e[0].test(q.texte) && e[1] && bonne !== e[1]) ko(ctx + ' unité fausse : ' + q.texte + ' -> ' + bonne);
      });
      break;
    }
    case 'perimetre': {
      var fig = q.meta.figure, inverse = /Combien mesure un côté|Quelle est sa largeur/.test(q.texte);
      if (fig === 'carre') attendu = inverse ? nb[0] / 4 : 4 * v[0];
      else if (fig === 'losange') attendu = 4 * v[0];
      else if (fig === 'hexagone') attendu = 6 * v[0];
      else if (fig === 'triangle') attendu = v[0] + v[1] + v[2];
      else if (fig === 'cercle') attendu = Number((2 * 3.14 * v[0]).toFixed(2));
      else if (fig === 'rectangle') attendu = inverse ? nb[0] / 2 - nb[1] : 2 * (v[0] + v[1]);
      if (!proche(attendu, q.resultat)) ko(ctx + ' périmètre faux : ' + q.texte + ' ' + q.resultat + ' vs ' + attendu);
      if (fig === 'triangle' && !(v[0] < v[1] + v[2] && v[1] < v[0] + v[2] && v[2] < v[0] + v[1])) ko(ctx + ' triangle impossible : ' + q.texte);
      if (fig === 'rectangle' && !inverse && v[0] <= v[1]) ko(ctx + ' rectangle L<=l : ' + q.texte);
      break;
    }
    case 'aire': {
      var fa = q.meta.figure, inv = /Quelle est sa largeur/.test(q.texte);
      if (fa === 'carre') attendu = v[0] * v[0];
      else if (fa === 'grille') attendu = v[0] * v[1];
      else if (fa === 'triangle-rectangle') { attendu = v[0] * v[1] / 2; if (!Number.isInteger(attendu)) ko(ctx + ' aire triangle non entière : ' + q.texte); }
      else if (fa === 'rectangle') attendu = inv ? nb[0] / nb[1] : v[0] * v[1];
      if (!proche(attendu, q.resultat)) ko(ctx + ' aire fausse : ' + q.texte + ' ' + q.resultat + ' vs ' + attendu);
      break;
    }
    case 'volume': {
      var fv = q.meta.figure, invv = /Quelle est sa hauteur/.test(q.texte);
      if (fv === 'cube') attendu = Math.pow(v[0], 3);
      else attendu = invv ? nb[0] / nb[1] : v[0] * v[1] * v[2];
      if (!proche(attendu, q.resultat)) ko(ctx + ' volume faux : ' + q.texte + ' ' + q.resultat + ' vs ' + attendu);
      break;
    }
    case 'monnaieSomme': {
      // « Tu as 2 pièces de 5 € et 1 billet de 10 € » : n1 × v1 + n2 × v2
      var paires = q.texte.match(/(\d+) (?:pièces?|billets?) de (\d+)/g) || [];
      var somme = 0;
      paires.forEach(function (s) { var m = s.match(/(\d+) \S+ de (\d+)/); somme += Number(m[1]) * Number(m[2]); });
      if (!paires.length || somme !== q.resultat) ko(ctx + ' somme monnaie fausse : ' + q.texte + ' ' + q.resultat);
      break;
    }
    case 'monnaieRendu': {
      var paye = v[0], prix = v[1];
      if (!(prix > 0 && prix < paye)) ko(ctx + ' rendu : prix hors (0, paye) : ' + q.texte);
      if (!proche(paye - prix, q.resultat)) ko(ctx + ' rendu faux : ' + q.texte + ' ' + q.resultat);
      if (!q.texte.includes('billet de ' + paye)) ko(ctx + ' rendu : énoncé incohérent');
      break;
    }
    case 'dureeEcart': {
      if (!(q.resultat > 0)) ko(ctx + ' durée non positive : ' + q.texte);
      if (/Dans/.test(q.texte)) { if (!proche(nb[0] + nb[1], q.resultat)) ko(ctx + ' heure future fausse : ' + q.texte); if (q.resultat > 23) ko(ctx + ' heure > 23'); }
      else if (/minutes/.test(q.texte)) {
        var d = (nb[2] * 60 + nb[3]) - (nb[0] * 60 + nb[1]);
        if (d !== q.resultat) ko(ctx + ' durée en minutes fausse : ' + q.texte + ' ' + q.resultat);
        if (exo.croise === false && Math.floor((nb[0] * 60 + nb[1]) / 60) !== Math.floor((nb[2] * 60 + nb[3]) / 60)) ko(ctx + ' durée croise une heure alors que croise=false : ' + q.texte);
        if (nb[2] > 23) ko(ctx + ' fin après minuit');
      } else if (!proche(nb[1] - nb[0], q.resultat)) ko(ctx + ' durée en heures fausse : ' + q.texte);
      break;
    }
    case 'proportionnalite': {
      var mode = q.meta.mode;
      if (mode === 'prix') attendu = nb[1] / nb[0] * nb[2];
      else if (mode === 'prix-unitaire') attendu = nb[1] / nb[0];
      else if (mode === 'recette') attendu = nb[1] / nb[0] * nb[2];
      else attendu = nb[1] / nb[0] * nb[2];
      if (mode === 'recette') { nb = nombres(q.texte.replace(/\d+ ?(?:g|cL)\b/, function (s) { return s; })); }
      if (mode === 'prix' || mode === 'tableau' || mode === 'prix-unitaire') {
        if (mode === 'prix') attendu = nb[1] / nb[0] * nb[2];
        if (mode === 'tableau') attendu = nb[1] / nb[0] * nb[2];
        if (mode === 'prix-unitaire') attendu = nb[1] / nb[0];
        if (!proche(Number(attendu.toFixed(6)), q.resultat)) ko(ctx + ' proportionnalité fausse : ' + q.texte + ' ' + q.resultat + ' vs ' + attendu);
      } else {
        // recette : Pour a personnes, il faut Q (unité) ... pour b personnes → Q / a × b
        var texteNum = q.texte.replace(/ /g, ' ');
        var mm = texteNum.match(/Pour (\d+) personnes, il faut (\d+)[^.]*\. Combien en faut-il pour (\d+)/);
        if (!mm || !proche(Number(mm[2]) / Number(mm[1]) * Number(mm[3]), q.resultat)) ko(ctx + ' recette fausse : ' + q.texte + ' ' + q.resultat);
      }
      break;
    }
    case 'pourcentage': {
      var md = q.meta.mode;
      if (md === 'fraction') { var fr = q.texte.match(/(\d+)\/(\d+)/); attendu = 100 * Number(fr[1]) / Number(fr[2]); }
      else if (md === 'de') attendu = nb[0] * nb[1] / 100;
      else attendu = nb[0] - nb[0] * nb[1] / 100;
      if (!proche(attendu, q.resultat)) ko(ctx + ' pourcentage faux : ' + q.texte + ' ' + q.resultat + ' vs ' + attendu);
      if (md !== 'fraction' && !Number.isInteger(q.resultat)) ko(ctx + ' pourcentage non entier : ' + q.texte);
      break;
    }
    case 'echelle': {
      var me = q.meta.mode;
      if (me === 'fraction') {
        var cm = q.meta.valeurs[0] * q.meta.rapport; // cm réels
        var mult = q.meta.unites[1] === 'km' ? 100000 : q.meta.unites[1] === 'm' ? 100 : 1;
        if (!proche(cm / mult, q.resultat)) ko(ctx + ' échelle fraction fausse : ' + q.texte + ' ' + q.resultat);
      } else if (me === 'plan-reel') { if (!proche(v[0] * v[1], q.resultat)) ko(ctx + ' échelle plan-réel fausse : ' + q.texte); }
      else if (!proche(v[0], q.resultat)) ko(ctx + ' échelle réel-plan fausse : ' + q.texte);
      break;
    }
    case 'vitesse': {
      var mv = q.meta.mode;
      if (mv === 'distance') attendu = v[0] * v[1];
      else if (mv === 'vitesse') attendu = v[0];
      else if (mv === 'temps') attendu = v[1];
      else attendu = v[0] * v[1] / 60;
      if (!proche(attendu, q.resultat)) ko(ctx + ' vitesse fausse : ' + q.texte + ' ' + q.resultat);
      if (!Number.isInteger(q.resultat)) ko(ctx + ' vitesse non entière : ' + q.texte);
      break;
    }
    default:
      ko(ctx + ' type non vérifié : ' + q.type);
  }
}

function verifierBornes(q, exo, ctx) {
  var v = q.meta.valeurs || [];
  var min = exo.min || 1, max = exo.max;
  var pasDec = Math.pow(10, exo.dec || 0);
  switch (q.type) {
    case 'convertir':
      if (!(v[0] >= min - 1e-9 && v[0] <= max + 1e-9)) ko(ctx + ' convertir hors bornes [' + min + ',' + max + '] : ' + q.texte);
      break;
    case 'mixte':
      if (!(v[0] >= min && v[0] <= max)) ko(ctx + ' mixte hors bornes : ' + q.texte);
      break;
    case 'probleme':
      if (q.meta.op !== 'div') v.forEach(function (x) { if (!(x >= min - 1e-9 && x <= max + 1e-9)) ko(ctx + ' probleme hors bornes [' + min + ',' + max + '] : ' + q.texte); });
      else if (!(v[0] / nombres(q.texte).filter(function (x) { return !proche(x, v[0]); })[0] >= min - 1e-9)) ko(ctx + ' division : quotient hors bornes : ' + q.texte);
      if (decimales(q.resultat) > (exo.dec || 0)) ko(ctx + ' probleme : trop de décimales : ' + q.resultat);
      void pasDec;
      break;
    case 'comparer':
      if (!exo.paires) v.forEach(function (x) { if (!(x >= min && x <= max)) ko(ctx + ' comparer hors bornes : ' + q.choix.join(' / ')); });
      else {
        var gi = facteur(q.grandeur, q.meta.unites[0]) >= facteur(q.grandeur, q.meta.unites[1]) ? 0 : 1; // valeur exprimée dans la grande unité
        if (!(v[gi] >= min && v[gi] <= max)) ko(ctx + ' comparer (paires) hors bornes : ' + q.choix.join(' / '));
      }
      break;
    case 'perimetre': case 'aire': case 'volume':
      v.forEach(function (x) { if (!(x >= min && x <= max)) ko(ctx + ' ' + q.type + ' hors bornes [' + min + ',' + max + '] : ' + q.texte); });
      break;
    default: break;
  }
}

function verifierContenu(q, exo, classe, ctx) {
  var s = SPEC[classe];
  if (s.types.indexOf(q.type) === -1) ko(ctx + ' type hors classe : ' + q.type);
  (q.meta.unites || []).forEach(function (u) { if (s.unites.indexOf(u) === -1) ko(ctx + ' unité hors classe « ' + u + ' » : ' + q.texte); });
  if (q.unite && q.type !== 'proportionnalite') {
    var base = q.unite.replace(/s$/, '');
    if (s.unites.indexOf(q.unite) === -1 && s.unites.indexOf(base) === -1 && q.unite !== 'carreaux') ko(ctx + ' unité de réponse hors classe « ' + q.unite + ' »');
  }
  if (q.type === 'probleme' && s.ops.indexOf(q.meta.op) === -1) ko(ctx + ' opération hors classe : ' + q.meta.op);
  if (q.meta.figure && s.figures.indexOf(q.meta.figure) === -1) ko(ctx + ' figure hors classe : ' + q.meta.figure);
  if (q.meta.mode && s.modes.indexOf(q.meta.mode) === -1) ko(ctx + ' mode hors classe : ' + q.meta.mode);
  if (classe === 'cp' && q.type === 'convertir' && !(q.meta.unites[0] === 'm' && q.meta.unites[1] === 'cm' && q.resultat === 100)) ko(ctx + ' CP : seule 1 m = 100 cm est autorisée');
  if (classe === 'ce1' && q.type === 'monnaieRendu' && !Number.isInteger(q.resultat)) ko(ctx + ' CE1 : rendu de monnaie non entier');
  if (classe === 'cm1' && q.type === 'perimetre' && q.meta.figure === 'cercle') ko(ctx + ' CM1 : cercle interdit');
  if (/π/.test(q.texte) && classe !== 'cm2') ko(ctx + ' π hors CM2');
  if (/%/.test(q.texte) && classe !== 'cm2') ko(ctx + ' pourcentage hors CM2');
  // taille des nombres
  var nbs = nombres(q.texte).concat([q.type === 'comparer' || q.type === 'choisirUnite' ? 0 : q.resultat]);
  nbs.forEach(function (x) { if (x > s.maxNombre) ko(ctx + ' nombre trop grand (' + x + ' > ' + s.maxNombre + ') : ' + q.texte); });
  // décimales
  var dec = decimales(q.resultat);
  if (q.type !== 'comparer' && q.type !== 'choisirUnite') {
    var autorise = s.decTypes ? (s.decTypes.indexOf(q.type) !== -1 ? s.maxDec : 0) : s.maxDec;
    if (dec > autorise) ko(ctx + ' trop de décimales (' + dec + ') : ' + q.texte + ' ' + q.resultat);
    if (dec > 0 && !(q.decimaux >= dec)) ko(ctx + ' réponse décimale mais pas de virgule proposée : ' + q.texte);
  }
  nombres(q.texte).forEach(function (x) { if (decimales(x) > s.maxDec) ko(ctx + ' donnée trop décimale (' + x + ') : ' + q.texte); });
}

function verifierForme(q, ctx) {
  if (typeof q.texte !== 'string' || !q.texte.length) ko(ctx + ' texte vide');
  if (/undefined|NaN|\[object/.test(q.texte + (q.choix ? q.choix.join('') : ''))) ko(ctx + ' texte invalide : ' + q.texte);
  if (q.choix) {
    if (new Set(q.choix).size !== q.choix.length) ko(ctx + ' choix en double : ' + q.choix.join(' / '));
    if (!(Number.isInteger(q.resultat) && q.resultat >= 0 && q.resultat < q.choix.length) || q.bonne !== q.choix[q.resultat]) ko(ctx + ' index du bon choix incohérent');
    if (q.choix.length < 2) ko(ctx + ' moins de 2 choix');
  } else {
    if (!(typeof q.resultat === 'number' && isFinite(q.resultat) && q.resultat > 0)) ko(ctx + ' résultat invalide : ' + q.texte + ' ' + q.resultat);
  }
  if (typeof q.voix !== 'string' || !q.voix.length) ko(ctx + ' voix vide');
}

/* ================= exécution ================= */
var programmes = {};
CLASSES.forEach(function (c) { programmes[c] = chargerProgramme(c); });

CLASSES.forEach(function (classe) {
  var prog = programmes[classe];
  var spec = SPEC[classe];
  var actives = Object.keys(prog.grandeurs).filter(function (m) { return prog.grandeurs[m].actif !== false; }).sort();
  if (JSON.stringify(actives) !== JSON.stringify(spec.missions.slice().sort())) ko(classe + ' missions actives ' + actives.join(',') + ' != attendues ' + spec.missions.join(','));

  var toutes = ['longueurs', 'masses-contenances', 'durees-monnaie', 'perimetres-aires', 'proportionnalite-pourcentages', 'volumes-vitesses-echelles'];
  toutes.forEach(function (m) {
    var d = prog.grandeurs[m];
    if (!d) { ko(classe + '/' + m + ' absente du programme'); return; }
    if (!d.libelle) ko(classe + '/' + m + ' sans libellé');
    if (d.actif === false) {
      if (d.niveaux) ko(classe + '/' + m + ' inactive mais avec des paliers');
      if (G.generer(prog, m, 1, mulberry32(1)) !== null) ko(classe + '/' + m + ' inactive mais génère');
      return;
    }
    if (!d.consigne) ko(classe + '/' + m + ' sans consigne');
    if (d.niveaux.length < 5) ko(classe + '/' + m + ' moins de 5 paliers');
    d.niveaux.forEach(function (pal, i) {
      var ctxP = classe + '/' + m + ' p' + (i + 1);
      var textes = new Set();
      if (!pal.exos || !pal.exos.length) ko(ctxP + ' palier vide');
      pal.exos.forEach(function (exo) {
        var rng = mulberry32(1000 + i * 7 + classe.length);
        for (var k = 0; k < N; k++) {
          var q;
          var ctx = ctxP + ' ' + nomExo(exo);
          try { q = G.genererExo(exo, rng); } catch (e) { ko(ctx + ' exception : ' + e.message); break; }
          nbQuestions++;
          textes.add(q.texte + (q.choix ? q.choix.join('|') : ''));
          verifierForme(q, ctx);
          verifierReponse(q, exo, ctx);
          verifierBornes(q, exo, ctx);
          verifierContenu(q, exo, classe, ctx);
        }
      });
      if (textes.size < 3) ko(ctxP + ' trop peu de variété (' + textes.size + ' énoncés distincts)');
      // pioche pondérée via l'API publique
      var rng2 = mulberry32(5);
      for (var j = 0; j < 30; j++) {
        var q2 = G.generer(prog, m, i + 1, rng2);
        if (!q2 || q2.palier !== i + 1) ko(ctxP + ' generer() invalide');
      }
    });
    // palier hors limites : borné
    if (!G.generer(prog, m, 99, mulberry32(2)) || !G.generer(prog, m, 0, mulberry32(2))) ko(classe + '/' + m + ' palier hors limites non borné');
  });
});

// Reproductibilité : même graine, mêmes questions
(function () {
  var a = [], b = [];
  var p = programmes.cm2;
  for (var pass = 0; pass < 2; pass++) {
    var rng = mulberry32(42), out = pass ? b : a;
    Object.keys(p.grandeurs).forEach(function (m) { for (var i = 1; i <= 6; i++) { var q = G.generer(p, m, i, rng); out.push(q ? q.texte + '|' + q.resultat : 'null'); } });
  }
  if (JSON.stringify(a) !== JSON.stringify(b)) ko('génération non reproductible à graine égale');
})();

// Cohérence : Math.random par défaut
(function () {
  var q = G.generer(programmes.cm1, 'longueurs', 1);
  if (!q || !isFinite(q.resultat)) ko('rng par défaut invalide');
})();

console.log('Questions vérifiées : ' + nbQuestions);
if (echecs.length) {
  console.log('ÉCHECS (' + echecs.length + ') :');
  echecs.forEach(function (e) { console.log(' - ' + e); });
  process.exit(1);
}
console.log('OK : bornes, réponses, contenu par classe, missions inactives.');
