/* Test de cohérence géométrie : programmes/*.js <-> missions <-> banques de questions.
 * Lancer : node geometrie/test-geometrie.js   (Node sans dépendance, code retour 1 en cas d'échec)
 *
 * Vérifie, pour chaque classe et chaque mission de géométrie ACTIVE :
 *  - la page geometrie/missions/<page>.html, l'entrée de geometrie/index.html, l'icône et la liste
 *    GestionnaireProfils.MISSIONS_GEOMETRIE existent ;
 *  - 300 questions par palier : réponse présente dans les choix, choix uniques, SVG bien formé ;
 *  - « une question hors contenu est un bug » : les choix restent dans le contenu du programme
 *    (types, solides, instruments, vocabulaire, thèmes), pas de rapporteur / degrés hors CM2, etc. ;
 *  - le patron du cube (CE1) : 64 assemblages orientés valides sur les 216 hexaminos (11 patrons libres). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = path.join(__dirname, '..');
const CLASSES = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
const TIRAGES = 300;
let echecs = 0, verifs = 0;
const vus = {};
function ok(cond, msg) {
  verifs++;
  if (cond) return;
  echecs++;
  const k = msg.replace(/ : .*/, '') + ' : ' + msg.replace(/^.*? : /, '').slice(0, 50);
  if (!vus[k]) { vus[k] = 1; if (Object.keys(vus).length <= 40) console.error('  ECHEC : ' + msg); } else vus[k]++;
}
const lire = (p) => fs.readFileSync(path.join(RACINE, p), 'utf8');

/* ---------- Contexte navigateur simulé ---------- */
const ctx = vm.createContext({ console: console, Math: Math, setTimeout: setTimeout });
ctx.window = ctx; ctx.globalThis = ctx;
ctx.document = { addEventListener: function () {}, body: { classList: { add: function () {} } } };
ctx.gestionnaireProfils = { getProgramme: function () { return ctx.PROGRAMMES[ctx.__classe]; }, getNiveauClasse: function () { return ctx.__classe; } };
function charger(p) { vm.runInContext(lire(p), ctx, { filename: p }); }
CLASSES.forEach((c) => charger('programmes/' + c + '.js'));
['icones_geo', 'programme_geo', 'banque_geo', 'espace', 'solides', 'cercle', 'instruments', 'rapporteur', 'patron_cube',
  'formes', 'proprietes', 'angles', 'symetrie', 'vrai_faux', 'droites', 'triangles', 'quadrilateres', 'patrons']
  .forEach((f) => charger('geometrie/js/' + f + '.js'));
const evalCtx = (code) => vm.runInContext(code, ctx);

const indexHtml = lire('geometrie/index.html');
const profilsCore = lire('js/profils-core.js');
const pageDe = {};
indexHtml.replace(/\{ id: '(geometrie-[a-z]+)', page: '([a-z_]+\.html)'/g, (m, id, page) => { pageDe[id] = page; return m; });

/* ---------- Générateurs ---------- */
const BANQUES = {
  'geometrie-espace': () => ctx.GeoEspace.BANQUE, 'geometrie-solides': () => ctx.GeoSolides.BANQUE,
  'geometrie-cercle': () => ctx.GeoCercle.BANQUE, 'geometrie-instruments': () => ctx.GeoInstruments.BANQUE,
  'geometrie-rapporteur': () => ctx.GeoRapporteur.BANQUE
};
const GENERATEURS = {
  'geometrie-espace': () => ctx.GeoEspace.config, 'geometrie-solides': () => ctx.GeoSolides.config,
  'geometrie-cercle': () => ctx.GeoCercle.config, 'geometrie-instruments': () => ctx.GeoInstruments.config,
  'geometrie-rapporteur': () => ctx.GeoRapporteur.config,
  'geometrie-formes': () => evalCtx('configFormes'), 'geometrie-proprietes': () => evalCtx('configProprietes'),
  'geometrie-angles': () => evalCtx('configAngles'), 'geometrie-symetrie': () => evalCtx('configSymetrie'),
  'geometrie-vraifaux': () => evalCtx('configVraiFaux'), 'geometrie-droites': () => evalCtx('configDroites'),
  'geometrie-triangles': () => evalCtx('configTriangles'), 'geometrie-quadrilateres': () => evalCtx('configQuadrilateres'),
  'geometrie-patrons': () => evalCtx('configPatrons')
};
const NORM = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function svgBienForme(svg) {
  const s = String(svg);
  if (!/^\s*<svg[\s>]/.test(s) || !/<\/svg>\s*$/.test(s)) return false;
  if (/NaN|undefined|Infinity/.test(s)) return false;
  const ouvrants = (s.match(/<(g|defs|radialGradient|text)[\s>]/g) || []).length;
  const fermants = (s.match(/<\/(g|defs|radialGradient|text)>/g) || []).length;
  return ouvrants === fermants;
}

function verifierQuestion(id, cls, niveau, q, contenu, clavier) {
  const lieu = cls + ' ' + id + ' n' + niveau;
  ok(q && typeof q === 'object', lieu + ' : question vide');
  if (!q) return;
  const opts = (q.options || []).map(String);
  if (clavier) { // saisie au clavier : la réponse est un entier positif
    ok(/^\d+$/.test(String(q.reponse)), lieu + ' : réponse non entière : ' + q.reponse);
    opts.push(String(q.reponse));
  }
  ok(opts.length >= 2 || clavier, lieu + ' : moins de 2 choix (' + q.instruction + ')');
  ok(opts.indexOf(String(q.reponse)) >= 0, lieu + ' : réponse absente des choix : ' + q.reponse + ' / ' + opts.join('|') + ' / ' + q.instruction);
  ok(new Set(opts).size === opts.length, lieu + ' : choix en double : ' + opts.join('|'));
  ok(svgBienForme(q.svg), lieu + ' : SVG mal formé');
  ok(typeof q.instruction === 'string' && q.instruction.length > 3 && !/undefined|NaN/.test(q.instruction), lieu + ' : consigne invalide');

  const texte = NORM(q.instruction + ' ' + opts.join(' '));
  // Contenu par thème (missions à banque)
  if (BANQUES[id]) {
    ok((contenu.themes || []).indexOf(q.theme) >= 0, lieu + ' : thème hors programme : ' + q.theme);
  }
  // Types (angles, droites, triangles, quadrilatères) : jamais de type hors programme
  const types = (contenu.types || []).concat(contenu.aAjouter || []);
  if (['geometrie-angles', 'geometrie-droites', 'geometrie-triangles', 'geometrie-quadrilateres'].indexOf(id) >= 0 && types.length) {
    if (!(id === 'geometrie-angles' && types.length === 1 && types[0] === 'Droit')) {
      opts.forEach((o) => ok(types.indexOf(o) >= 0, lieu + ' : type hors contenu proposé : ' + o));
    } else {
      ok(opts.join('|') === 'Oui|Non', lieu + ' : angle droit CE1 : choix inattendus ' + opts.join('|'));
      ok(!/aigu|obtus|plat/.test(texte), lieu + ' : vocabulaire d\'angle hors programme CE1');
    }
  }
  if (id === 'geometrie-formes' || id === 'geometrie-proprietes') {
    const noms = ['formes', 'figures', 'figures2d', 'solides'].reduce((a, k) => a.concat(contenu[k] || []), []);
    if (id === 'geometrie-formes') opts.forEach((o) => ok(noms.indexOf(o) >= 0, lieu + ' : forme hors contenu : ' + o));
  }
  if (id === 'geometrie-patrons') {
    if (contenu.mode === 'patron-cube') ok(opts.join('|') === 'Oui|Non', lieu + ' : patron du cube : choix ' + opts.join('|'));
    else opts.forEach((o) => ok((contenu.solides || []).indexOf(o) >= 0, lieu + ' : patron hors contenu : ' + o));
  }
  // Solides
  if (id === 'geometrie-solides') {
    const sol = contenu.solides || [];
    opts.forEach((o) => { if (ctx.GeoBanque.SOLIDES.indexOf(o) >= 0) ok(sol.indexOf(o) >= 0, lieu + ' : solide hors contenu : ' + o); });
    ctx.GeoBanque.SOLIDES.filter((s) => sol.indexOf(s) < 0).forEach((s) => {
      if (q.theme === 'prisme') return;
      ok(!new RegExp('\\b' + NORM(s) + '\\b').test(texte), lieu + ' : solide hors contenu cité : ' + s);
    });
    if (sol.indexOf('Prisme triangulaire') < 0) ok(!/prisme/.test(texte), lieu + ' : prisme hors programme');
  }
  // Instruments
  if (id === 'geometrie-instruments') {
    const ins = contenu.instruments || [];
    ['règle', 'équerre', 'compas', 'rapporteur'].filter((i) => ins.indexOf(i) < 0).forEach((i) => {
      ok(!new RegExp(NORM(i)).test(texte), lieu + ' : instrument hors contenu cité : ' + i + ' / ' + q.instruction);
    });
    ok(!(ins.indexOf('rapporteur') < 0 && /degre|°/.test(texte)), lieu + ' : degrés sans rapporteur');
  }
  // Cercle : vocabulaire
  if (id === 'geometrie-cercle') {
    const voc = contenu.vocab || [];
    ['diamètre', 'corde'].filter((v) => voc.indexOf(v) < 0).forEach((v) => {
      ok(!new RegExp(NORM(v)).test(texte), lieu + ' : vocabulaire hors contenu : ' + v);
    });
  }
  // Rapporteur / degrés : uniquement dans la mission du rapporteur (jamais avant le CM2)
  if (id !== 'geometrie-rapporteur' && cls !== 'cm2') {
    ok(!/rapporteur|degre|°/.test(texte), lieu + ' : rapporteur / degrés avant le CM2 : ' + q.instruction);
  }
  // Coordonnées (x ; y) : à partir du CE2
  if (['cp', 'ce1'].indexOf(cls) >= 0) ok(!/coordonn/.test(texte), lieu + ' : coordonnées avant le CE2');
}

/* ---------- 1. Cohérence programme <-> missions ---------- */
console.log('1. Programmes <-> missions');
const MISSIONS_CONNUES = Object.keys(GENERATEURS);
CLASSES.forEach((cls) => {
  const prog = ctx.PROGRAMMES[cls];
  ok(prog && prog.geometrie, cls + ' : section geometrie absente');
  Object.keys(prog.geometrie).forEach((id) => {
    ok(MISSIONS_CONNUES.indexOf(id) >= 0, cls + ' : mission inconnue ' + id);
    const m = prog.geometrie[id];
    if (m.actif === false) return;
    ok(!!pageDe[id], cls + ' : ' + id + ' absente de geometrie/index.html');
    if (pageDe[id]) ok(fs.existsSync(path.join(RACINE, 'geometrie/missions', pageDe[id])), cls + ' : page manquante ' + pageDe[id]);
    ok(profilsCore.indexOf("'" + id + "'") >= 0, cls + ' : ' + id + ' absente de MISSIONS_GEOMETRIE (profils-core.js)');
    ok(!!ctx.GeoIcones.ICONES[id], cls + ' : icône manquante pour ' + id);
    ok(typeof m.libelle === 'string' && m.libelle.length > 0, cls + ' : ' + id + ' sans libellé');
    if (BANQUES[id]) {
      const themes = (m.contenu && m.contenu.themes) || [];
      ok(themes.length > 0, cls + ' : ' + id + ' sans themes');
      const connus = BANQUES[id]().map((b) => b.theme);
      themes.forEach((t) => ok(connus.indexOf(t) >= 0, cls + ' : thème inconnu ' + id + '/' + t));
    }
  });
  // la page de chaque mission existe aussi pour toutes les missions listées
});
Object.keys(pageDe).forEach((id) => {
  ok(fs.existsSync(path.join(RACINE, 'geometrie/missions', pageDe[id])), 'index : page absente ' + pageDe[id]);
  const html = lire('geometrie/missions/' + pageDe[id]);
  ok(/programme_geo\.js/.test(html) && /moteur_geometrie\.js/.test(html), pageDe[id] + ' : scripts du moteur manquants');
  if (BANQUES[id]) ok(/banque_geo\.js/.test(html), pageDe[id] + ' : banque_geo.js manquant');
});

/* ---------- 2. Génération de questions ---------- */
console.log('2. Questions (' + TIRAGES + ' tirages par classe, mission et palier)');
let missionsTestees = 0;
CLASSES.forEach((cls) => {
  ctx.__classe = cls;
  const prog = ctx.PROGRAMMES[cls];
  Object.keys(prog.geometrie).forEach((id) => {
    const m = prog.geometrie[id];
    if (m.actif === false || !GENERATEURS[id]) return;
    const config = GENERATEURS[id]();
    const contenu = m.contenu || {};
    const max = ctx.GeoProgramme.maxNiveau(id);
    ok(max >= 1 && max <= 3, cls + ' ' + id + ' : maxNiveau ' + max);
    missionsTestees++;
    const themesVus = {};
    for (let niv = 1; niv <= max; niv++) {
      for (let i = 0; i < TIRAGES; i++) {
        let q;
        try { q = config.genererQuestion(niv); } catch (e) { ok(false, cls + ' ' + id + ' n' + niv + ' : exception ' + e.message); break; }
        verifierQuestion(id, cls, niv, q, contenu, config.typeInterface === 'clavier');
        if (q && q.theme) themesVus[q.theme] = true;
      }
    }
    if (BANQUES[id]) { // chaque thème listé est effectivement tiré au moins une fois
      (contenu.themes || []).forEach((t) => ok(themesVus[t], cls + ' ' + id + ' : thème jamais tiré : ' + t));
    }
  });
});
console.log('   ' + missionsTestees + ' missions actives testées');

/* ---------- 3. Contenu attendu par classe (lacunes comblées) ---------- */
console.log('3. Contenu attendu');
const actif = (cls, id) => { const m = ctx.PROGRAMMES[cls].geometrie[id]; return !!m && m.actif !== false; };
ok(actif('cp', 'geometrie-espace') && actif('cp', 'geometrie-instruments') && actif('cp', 'geometrie-formes'), 'CP : repérage, règle, figures planes');
ok(actif('ce1', 'geometrie-angles') && actif('ce1', 'geometrie-solides') && actif('ce1', 'geometrie-symetrie') && actif('ce1', 'geometrie-patrons'), 'CE1 : angle droit, solides, symétrie, patron du cube');
ok(actif('ce2', 'geometrie-cercle') && actif('ce2', 'geometrie-solides') && actif('ce2', 'geometrie-formes'), 'CE2 : cercle/compas, solides, polygones');
ok(actif('cm1', 'geometrie-droites') && actif('cm1', 'geometrie-triangles'), 'CM1 : droites, triangles');
ok(actif('cm2', 'geometrie-rapporteur') && actif('cm2', 'geometrie-patrons') && actif('cm2', 'geometrie-symetrie'), 'CM2 : rapporteur, patrons, symétrie');
['cp', 'ce1', 'ce2', 'cm1'].forEach((c) => ok(!actif(c, 'geometrie-rapporteur'), c + ' : rapporteur ne doit pas être ouvert'));
ctx.__classe = 'cm2';
ok(ctx.GeoProgramme.axes('geometrie-symetrie').join() === 'vertical,horizontal,diagonal', 'CM2 : axes de symétrie');

/* ---------- 4. Patron du cube ---------- */
console.log('4. Patron du cube');
(function () {
  const P = ctx.GeoPatronCube;
  // tous les hexaminos « fixes » (à translation près)
  const cle = (c) => c[0] + ',' + c[1];
  const normaliser = (cells) => {
    const mx = Math.min.apply(null, cells.map((c) => c[0])), my = Math.min.apply(null, cells.map((c) => c[1]));
    return cells.map((c) => [c[0] - mx, c[1] - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  };
  let niveauEnsembles = { '0,0': [[0, 0]] };
  for (let n = 2; n <= 6; n++) {
    const suivant = {};
    Object.keys(niveauEnsembles).forEach((k) => {
      const cells = niveauEnsembles[k];
      cells.forEach((c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach((d) => {
        const nc = [c[0] + d[0], c[1] + d[1]];
        if (cells.some((x) => x[0] === nc[0] && x[1] === nc[1])) return;
        const norm = normaliser(cells.concat([nc]));
        suivant[norm.map(cle).join(';')] = norm;
      }));
    });
    niveauEnsembles = suivant;
  }
  const tous = Object.keys(niveauEnsembles).map((k) => niveauEnsembles[k]);
  ok(tous.length === 216, 'hexaminos fixes : ' + tous.length + ' (attendu 216)');
  const valides = tous.filter((c) => P.estPatronCube(c));
  ok(valides.length === 64, "patrons du cube orientés : " + valides.length + " (attendu 64)");
  const libres = new Set();
  valides.forEach((c) => {
    const formes = [];
    let cur = c;
    for (let r = 0; r < 4; r++) {
      cur = normaliser(cur.map((p) => [-p[1], p[0]]));
      formes.push(cur.map(cle).join(';'));
      formes.push(normaliser(cur.map((p) => [-p[0], p[1]])).map(cle).join(';'));
    }
    libres.add(formes.sort()[0]);
  });
  ok(libres.size === 11, 'patrons libres : ' + libres.size + ' (attendu 11)');
  let oui = 0;
  for (let i = 0; i < 400; i++) {
    const q = P.question(1 + (i % 2));
    if (q.reponse === 'Oui') oui++;
    ok(svgBienForme(q.svg), 'patron cube : SVG mal formé');
  }
  ok(oui > 100 && oui < 300, 'patron cube : réponses déséquilibrées (' + oui + '/400 Oui)');
})();

Object.keys(vus).forEach((k) => { if (vus[k] > 1) console.error('    (' + vus[k] + ' fois) ' + k); });
console.log(echecs === 0 ? 'OK : ' + verifs + ' vérifications' : 'ECHEC : ' + echecs + ' erreur(s) sur ' + verifs + ' vérifications');
process.exit(echecs === 0 ? 0 : 1);
