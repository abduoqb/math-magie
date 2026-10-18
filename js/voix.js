/**
 * Voix — synthèse vocale française commune à tout Mathémagie.
 *
 * Objectif : guider les enfants avec une voix agréable et jamais fautive.
 *  - ne JAMAIS lire les émojis ni les symboles décoratifs (interdit) ;
 *  - normaliser les symboles mathématiques en mots (« × » → « fois », « ÷ » → « divisé par »,
 *    « = » → « égale », « % » → « pour cent », « 3/4 » → « 3 sur 4 », « 3,5 » → « 3 virgule 5 »…) ;
 *  - rester concis (nettoyage, phrases regroupées, pas de lecture inutile) ;
 *  - quand une question propose des choix, les ÉNUMÉRER (« Tes choix : a, b, ou c. ») ;
 *  - lire de façon fluide (voix fr-FR de meilleure qualité, lecture phrase par phrase).
 *
 * Chargé par js/profils.js sur toutes les pages. Disponible en `window.Voix`.
 * Les fonctions pures (`nettoyer`, `enumerer`, `questionTexte`) sont exportées pour les tests Node.
 */
(function (root) {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Détection et choix de la voix                                       */
  /* ------------------------------------------------------------------ */

  function synth() {
    return (root && 'speechSynthesis' in root && root.speechSynthesis) ? root.speechSynthesis : null;
  }

  function disponible() {
    return !!(synth() && typeof root.SpeechSynthesisUtterance === 'function');
  }

  /* Voix francophones à privilégier, de la plus agréable à la plus banale. */
  var PREFERENCE = [
    'google français', 'google fr',
    'microsoft denise', 'microsoft hortense', 'microsoft julie', 'microsoft vivienne',
    'denise', 'hortense', 'julie', 'vivienne',
    'amelie', 'amélie', 'audrey', 'marie', 'thomas',
    'eddy', 'flo', 'sandy', 'grandma', 'grandpa'
  ];

  var voixMemo = null;

  function choisirVoix() {
    var s = synth();
    if (!s) return null;
    var voix = [];
    try { voix = s.getVoices() || []; } catch (e) { voix = []; }
    if (!voix.length) return null;
    var fr = voix.filter(function (v) { return /^fr([-_]|$)/i.test(v.lang || ''); });
    if (!fr.length) fr = voix.filter(function (v) { return /fr/i.test(v.lang || ''); });
    if (!fr.length) return null;
    for (var i = 0; i < PREFERENCE.length; i++) {
      var p = PREFERENCE[i];
      var trouve = null;
      for (var j = 0; j < fr.length; j++) {
        if (String(fr[j].name || '').toLowerCase().indexOf(p) !== -1) { trouve = fr[j]; break; }
      }
      if (trouve) return trouve;
    }
    // Sinon : une voix « locale » (souvent plus fiable), à défaut la première.
    for (var k = 0; k < fr.length; k++) if (fr[k].localService) return fr[k];
    return fr[0];
  }

  /** Les voix se chargent de façon asynchrone : on attend un court instant au besoin. */
  function quandPretes(cb) {
    var s = synth();
    if (!s) return;
    var pretes = [];
    try { pretes = s.getVoices() || []; } catch (e) { pretes = []; }
    if (pretes.length) { cb(); return; }
    var fait = false;
    var fini = function () {
      if (fait) return;
      fait = true;
      try { s.onvoiceschanged = null; } catch (e) { /* ignore */ }
      cb();
    };
    try { s.onvoiceschanged = fini; } catch (e) { /* ignore */ }
    setTimeout(fini, 1500); // repli si l'évènement n'arrive jamais
  }

  /* ------------------------------------------------------------------ */
  /* Nettoyage du texte                                                  */
  /* ------------------------------------------------------------------ */

  /* Émojis, pictogrammes, symboles décoratifs : jamais lus. */
  var EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{FE0E}\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{1F3FB}-\u{1F3FF}\u{200B}-\u{200F}\u{202A}-\u{202E}\u{2060}-\u{206F}\u{FFFD}]/gu;

  /** Remplace les symboles mathématiques par des mots, pour une lecture juste. */
  function symboles(t) {
    return t
      .replace(/\u00A0|\u202F|\u2009|\u2007/g, ' ')
      .replace(/\s*[×✕✖]\s*/g, ' fois ')
      .replace(/\s*÷\s*/g, ' divisé par ')
      .replace(/(\d)\s*[−–—-]\s*(\d)/g, '$1 moins $2')
      .replace(/−/g, ' moins ')
      .replace(/[–—]/g, ', ')
      .replace(/\s*\+\s*/g, ' plus ')
      .replace(/\s*=\s*/g, ' égale ')
      .replace(/%/g, ' pour cent')
      .replace(/€/g, ' euros')
      .replace(/\$/g, ' dollars')
      .replace(/°/g, ' degrés')
      .replace(/²/g, ' au carré')
      .replace(/³/g, ' au cube')
      .replace(/(\d)\s*\/\s*(\d)/g, '$1 sur $2')
      .replace(/(\d),(\d)/g, '$1 virgule $2')
      .replace(/(\d)\.(\d)/g, '$1 virgule $2')
      .replace(/&/g, ' et ');
  }

  /** Texte prêt à être lu : sans HTML, sans émoji, concis, ponctué proprement. */
  function nettoyer(texte) {
    if (texte === null || texte === undefined) return '';
    var t = String(texte);
    t = t.replace(/<[^>]*>/g, ' ');          // balises HTML éventuelles
    t = t.replace(/&nbsp;/gi, ' ');
    t = symboles(t);
    t = t.replace(EMOJI, ' ');
    t = t.replace(/…/g, '. ');
    t = t.replace(/\.{2,}/g, '. ');
    t = t.replace(/\s+/g, ' ').trim();
    t = t.replace(/\s+([.,;:])/g, '$1');                // pas d'espace avant , ; : (usage français)
    t = t.replace(/([,.!?;:])(?=[^\s,.!?;:])/g, '$1 '); // une espace après la ponctuation
    t = t.replace(/([,.!?;:])\1+/g, '$1');              // ponctuation répétée
    t = t.replace(/^[\s,;:.!?·•-]+/, '').replace(/[\s,;:.·•-]+$/, '');
    return t;
  }

  /* ------------------------------------------------------------------ */
  /* Énumération des choix                                               */
  /* ------------------------------------------------------------------ */

  /** « a », « a ou b », « a, b, ou c ». */
  function enumerer(liste) {
    var l = (liste || []).filter(function (x) { return x !== null && x !== undefined && String(x).length; });
    if (!l.length) return '';
    if (l.length === 1) return String(l[0]);
    if (l.length === 2) return l[0] + ' ou ' + l[1];
    return l.slice(0, -1).join(', ') + ', ou ' + l[l.length - 1];
  }

  function sansAccents(t) {
    var s = String(t).toLowerCase();
    try { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { /* ignore */ }
    return s;
  }

  /* Mots « vides » ignorés pour comparer un choix à la consigne. */
  var MOTS_VIDES = { que: 1, a: 1, au: 1, aux: 1, le: 1, la: 1, les: 1, de: 1, du: 1, des: 1, un: 1, une: 1, et: 1, ou: 1, l: 1, d: 1 };

  function motsCles(choix) {
    return sansAccents(choix).replace(/[^a-z0-9]+/g, ' ').split(' ')
      .filter(function (w) { return w && !MOTS_VIDES[w]; });
  }

  /** Le texte cite-t-il déjà chaque choix ? (alors on n'énumère pas deux fois) */
  function dejaCite(texte, choix) {
    var t = ' ' + sansAccents(texte).replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    return choix.every(function (c) {
      var mots = motsCles(c);
      if (!mots.length) return true;
      return mots.every(function (w) { return t.indexOf(' ' + w + ' ') !== -1; });
    });
  }

  /** Construit la phrase lue : consigne + énumération des choix si utile. */
  function questionTexte(consigne, choix) {
    var c = nettoyer(consigne);
    var liste = [];
    (choix || []).forEach(function (x) {
      var v = nettoyer(x);
      if (v) liste.push(v);
    });
    if (!liste.length) return c;
    if (dejaCite(c, liste)) return c;
    var base = c.replace(/[\s.!?]+$/, '');
    var intro = base ? base + '. ' : '';
    return (intro + 'Tes choix : ' + enumerer(liste) + '.').trim();
  }

  /* ------------------------------------------------------------------ */
  /* Lecture                                                             */
  /* ------------------------------------------------------------------ */

  var jeton = 0;             // invalide les lectures précédentes quand on relance

  /** Coupe le texte en morceaux courts : lecture fluide, jamais tronquée. */
  function decouper(t) {
    var phrases = t.match(/[^.!?]+[.!?]*/g) || [t];
    var morceaux = [];
    var courant = '';
    phrases.forEach(function (p) {
      p = p.trim();
      if (!p) return;
      if (courant && (courant.length + p.length + 1) > 150) { morceaux.push(courant); courant = p; }
      else courant = courant ? courant + ' ' + p : p;
    });
    if (courant) morceaux.push(courant);
    return morceaux.length ? morceaux : [t];
  }

  function appliquer(u, opts) {
    u.lang = 'fr-FR';
    u.rate = opts.rate > 0 ? opts.rate : 0.95;
    u.pitch = opts.pitch > 0 ? opts.pitch : 1;
    u.volume = 1;
    if (!voixMemo) voixMemo = choisirVoix();
    if (voixMemo) u.voice = voixMemo;
  }

  /** Lit un texte (émojis retirés, symboles traduits). Relance la lecture à chaque appel. */
  function dire(texte, opts) {
    if (!disponible()) return;
    var t = nettoyer(texte);
    if (!t) return;
    opts = opts || {};
    var s = synth();
    var mien = ++jeton;
    try { s.cancel(); } catch (e) { /* ignore */ }
    var morceaux = decouper(t);
    var i = 0;
    function suite() {
      if (mien !== jeton || i >= morceaux.length) return;
      var u = new root.SpeechSynthesisUtterance(morceaux[i++]);
      appliquer(u, opts);
      u.onend = suite;
      u.onerror = suite;
      try { s.speak(u); } catch (e) { /* ignore */ }
    }
    quandPretes(suite);
  }

  /** Lit une question en énumérant les choix proposés (s'ils ne sont pas déjà cités). */
  function question(consigne, choix, opts) {
    dire(questionTexte(consigne, choix), opts);
  }

  function arreter() {
    jeton++;
    var s = synth();
    if (s) { try { s.cancel(); } catch (e) { /* ignore */ } }
  }

  var API = {
    disponible: disponible,
    nettoyer: nettoyer, symboles: symboles, enumerer: enumerer,
    questionTexte: questionTexte, dejaCite: dejaCite,
    dire: dire, lire: dire, question: question, arreter: arreter,
    choisirVoix: choisirVoix
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else { root.Voix = API; if (disponible()) { try { root.speechSynthesis.getVoices(); } catch (e) { /* précharge */ } } }
})(typeof window !== 'undefined' ? window : globalThis);
