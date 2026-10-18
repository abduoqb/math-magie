/* GeoProgramme : lit le programme du niveau de classe actif et normalise le `contenu`
 * des missions de géométrie (les clés varient d'un niveau à l'autre : formes / figures /
 * figures2d / solides, types, axe / axes, niveauMax / niveauMoteurMax...).
 * Utilisable dans le navigateur (global GeoProgramme) et sous node (module.exports). */
(function (root) {
  var ORDRE = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];

  function env() { return (typeof window !== 'undefined') ? window : root; }

  function niveauClasse() {
    var g = env().gestionnaireProfils;
    var n = null;
    try { if (g && typeof g.getNiveauClasse === 'function') n = g.getNiveauClasse(); } catch (e) { n = null; }
    return n;
  }

  function programme() {
    var g = env().gestionnaireProfils;
    try {
      if (g && typeof g.getProgramme === 'function') {
        var p = g.getProgramme();
        if (p) return p;
      }
    } catch (e) { /* ignore */ }
    var progs = env().PROGRAMMES;
    var n = niveauClasse();
    if (progs && n && progs[n]) return progs[n];
    return null;
  }

  function indexNiveau() {
    var p = programme();
    var i = p ? ORDRE.indexOf(p.id) : -1;
    return i < 0 ? ORDRE.length - 1 : i; // sans programme: tout est permis (comme avant)
  }

  function estCP() { var p = programme(); return !!p && p.id === 'cp'; }

  // Entrée du programme pour une mission, ou null si pas de programme (mode permissif)
  function mission(id) {
    var p = programme();
    if (!p || !p.geometrie) return null;
    var court = id.replace(/^geometrie-/, '');
    return p.geometrie[id] || p.geometrie[court] || { actif: false, contenu: {} };
  }

  function actif(id) {
    var m = mission(id);
    return m ? m.actif !== false : true;
  }

  function contenu(id) {
    var m = mission(id);
    return (m && m.contenu) || {};
  }

  function unique(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  // Noms de figures/solides autorisés (union des clés connues). null = pas de restriction.
  function noms(id) {
    var c = contenu(id);
    if (!mission(id)) return null;
    var cles = ['formes', 'figures', 'figures2d', 'solides', 'aAjouter'];
    var res = [];
    cles.forEach(function (k) { if (Array.isArray(c[k])) res = res.concat(c[k]); });
    return unique(res);
  }

  // Types (angles, droites, triangles, quadrilatères) : contenu.types (+ aAjouter). null = tout.
  function types(id) {
    if (!mission(id)) return null;
    var c = contenu(id);
    return unique((c.types || []).concat(c.aAjouter || []));
  }

  function sansAccent(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  // Questions autorisées pour proprietes : { d2: ['sommets','cotes'], d3: ['sommets','faces','aretes'] }
  function questionsProprietes(id) {
    var tout = { d2: ['sommets', 'cotes'], d3: ['sommets', 'faces', 'aretes'] };
    if (!mission(id)) return tout;
    var c = contenu(id);
    if (!c.proprietes && !c.questions && !c.questions2d && !c.questions3d) return tout; // non precise: toutes
    var norm = function (l) { return (l || []).map(function (q) { var s = sansAccent(q); return s === 'cote' ? 'cotes' : s; }); };
    var generiques = norm(c.proprietes || c.questions);
    var q2 = c.questions2d ? norm(c.questions2d) : generiques;
    var q3 = c.questions3d ? norm(c.questions3d) : generiques;
    return {
      d2: tout.d2.filter(function (q) { return q2.indexOf(q) >= 0; }),
      d3: tout.d3.filter(function (q) { return q3.indexOf(q) >= 0; })
    };
  }

  // Thèmes de questions autorisés pour les missions à banque de questions (espace, solides,
  // cercle, instruments, rapporteur). null = pas de restriction (mode sans programme).
  function themes(id) {
    if (!mission(id)) return null;
    var c = contenu(id);
    return Array.isArray(c.themes) ? c.themes.slice() : null;
  }

  // Liste libre du contenu (ex. 'vocab', 'instruments', 'solides'). null = pas de restriction.
  function liste(id, cle) {
    if (!mission(id)) return null;
    var c = contenu(id);
    return Array.isArray(c[cle]) ? c[cle].slice() : null;
  }

  // Axes de symétrie gérés par le moteur parmi ceux autorisés
  function axes(id) {
    if (!mission(id)) return ['vertical'];
    var c = contenu(id);
    var liste = [];
    if (Array.isArray(c.axes)) liste = liste.concat(c.axes);
    if (c.axe) liste.push(c.axe);
    if (!liste.length && !Array.isArray(c.axes)) return ['vertical']; // non precise: axe vertical par defaut
    var res = [];
    liste.forEach(function (a) {
      var s = sansAccent(a);
      if (s.indexOf('vertic') === 0) res.push('vertical');
      else if (s.indexOf('horizon') === 0) res.push('horizontal');
      else if (s.indexOf('diagonal') === 0) res.push('diagonal');
    });
    return unique(res);
  }

  // Niveau de difficulté maximal du moteur (1..3) autorisé pour la mission
  function maxNiveau(id) {
    var c = contenu(id);
    var m = 3;
    if (typeof c.niveauMax === 'number') m = Math.min(m, c.niveauMax);
    if (typeof c.niveauMoteurMax === 'number') m = Math.min(m, c.niveauMoteurMax);
    var nbp = c.nbPointsMax || (Array.isArray(c.nbPoints) ? c.nbPoints[1] : null);
    if (id.indexOf('symetrie') >= 0 && nbp) m = Math.min(m, nbp <= 4 ? 1 : (nbp <= 6 ? 2 : 3));
    return Math.max(1, m);
  }

  // Filtre un pool (objets avec .nom) par liste de noms autorisés. Repli: tous les pools réunis.
  function filtrerPool(poolNiveau, poolComplet, autorises, minTaille) {
    minTaille = minTaille || 2;
    var ok = function (e) { return autorises === null || autorises.indexOf(e.nom) >= 0; };
    var p = poolNiveau.filter(ok);
    if (p.length >= minTaille) return p;
    return poolComplet.filter(ok);
  }

  // Redirige vers l'index des missions si la mission n'est pas au programme
  function garde(id, redirection) {
    if (actif(id)) return true;
    try { env().location.replace(redirection || '../index.html'); } catch (e) { /* ignore */ }
    return false;
  }

  // Notions utilisées dans les affirmations de vrai/faux : classe minimale (index ORDRE)
  var NOTIONS = {
    cote: 0, sommet: 0, figure_plate: 0, solide: 0, face: 0, comparaison: 0, forme_ronde: 0,
    angle_droit: 1, polygone: 1, egalite_longueur: 1, arete: 1, sommet_solide: 1
  };
  function notionAutorisee(n) { return (NOTIONS[n] === undefined ? 99 : NOTIONS[n]) <= indexNiveau(); }

  // Synthèse vocale (CP) — déléguée au module commun window.Voix
  function lire(texte) {
    try {
      var w = env();
      if (w.Voix && typeof w.Voix.dire === 'function') { w.Voix.dire(texte); return; }
      if (!w.speechSynthesis || typeof w.SpeechSynthesisUtterance !== 'function') return;
      w.speechSynthesis.cancel();
      var u = new w.SpeechSynthesisUtterance(String(texte).replace(/<[^>]*>/g, ' '));
      u.lang = 'fr-FR';
      u.rate = 0.9;
      w.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  var API = {
    ORDRE: ORDRE, NOTIONS: NOTIONS,
    programme: programme, niveauClasse: niveauClasse, indexNiveau: indexNiveau, estCP: estCP,
    mission: mission, actif: actif, contenu: contenu, noms: noms, types: types,
    questionsProprietes: questionsProprietes, axes: axes, themes: themes, liste: liste, maxNiveau: maxNiveau,
    filtrerPool: filtrerPool, garde: garde, notionAutorisee: notionAutorisee, lire: lire
  };
  root.GeoProgramme = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
