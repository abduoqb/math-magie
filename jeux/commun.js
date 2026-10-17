/* Aides communes aux jeux, adaptées au niveau de classe (cp, ce1, ce2, cm1, cm2).
   Indépendant de calculs_mentaux. Exporté aussi pour Node (tests). */
(function (root) {
  'use strict';

  var NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
  var NIVEAU_DEFAUT = 'ce2';

  function gp() {
    return (typeof gestionnaireProfils !== 'undefined' && gestionnaireProfils) || null;
  }

  function niveau() {
    var g = gp();
    var n = null;
    try { if (g && typeof g.getNiveauClasse === 'function') n = g.getNiveauClasse(); } catch (e) {}
    return NIVEAUX.indexOf(n) >= 0 ? n : NIVEAU_DEFAUT;
  }

  function programme() {
    var g = gp();
    try { if (g && typeof g.getProgramme === 'function') return g.getProgramme() || null; } catch (e) {}
    return null;
  }

  function jeuActif(id) {
    var p = programme();
    if (!p || !p.jeux) return true;
    return p.jeux[id] !== false && (p.jeux[id] === true || p.jeux[id] === undefined || !!p.jeux[id]);
  }

  /* ---------- Trouver le chiffre ---------- */
  function essaisPour(max) {
    return Math.ceil(Math.log(max) / Math.LN2) + (max > 100 ? 2 : 0);
  }
  var PLAGES = {
    cp:  [[10, 'Petite Magie'], [20, 'Grande Magie'], [100, 'Maître Magicien']],
    ce1: [[10, 'Petite Magie'], [50, 'Grande Magie'], [100, 'Maître Magicien']],
    ce2: [[100, 'Petite Magie'], [500, 'Grande Magie'], [1000, 'Maître Magicien']],
    cm1: [[1000, 'Petite Magie'], [5000, 'Grande Magie'], [10000, 'Maître Magicien']],
    cm2: [[10000, 'Petite Magie'], [50000, 'Grande Magie'], [100000, 'Maître Magicien']]
  };
  function plages(n) {
    return (PLAGES[n] || PLAGES[NIVEAU_DEFAUT]).map(function (p) {
      return { max: p[0], nom: p[1], essais: essaisPour(p[0]) };
    });
  }
  function plageMax(n) {
    var l = plages(n);
    return l[l.length - 1].max;
  }
  function fmt(nb) {
    return String(nb).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* ---------- Pendu ---------- */
  var MOTS = {
    cp: {
      '🔢 Nombres': ['zero', 'un', 'deux', 'trois', 'six', 'dix', 'neuf', 'huit', 'plus', 'moins'].filter(function (m) { return m.length >= 3; }),
      '🐾 Animaux': ['chat', 'rat', 'lion', 'singe', 'tigre', 'poule', 'vache', 'lapin', 'koala', 'ane'].filter(function (m) { return m !== 'ane'; }),
      '🍎 Fruits': ['pomme', 'poire', 'kiwi', 'lime', 'figue', 'mure'].filter(function (m) { return m !== 'mure'; }),
      '🏠 Maison': ['lune', 'lit', 'sac', 'bus', 'robe', 'balai', 'table', 'livre', 'stylo', 'avion'].filter(function (m) { return m.length >= 3; })
    },
    ce1: {
      '🔢 Maths': ['nombre', 'chiffre', 'somme', 'double', 'moitie', 'dizaine', 'centaine', 'addition', 'calcul', 'total', 'pair', 'impair', 'tableau'],
      '📐 Formes': ['triangle', 'cercle', 'carre', 'rectangle', 'angle', 'droite', 'segment', 'cube', 'point', 'ligne', 'cote'],
      '🎒 École': ['cartable', 'trousse', 'cahier', 'crayon', 'gomme', 'regle', 'ciseaux', 'colle', 'tableau', 'dictee', 'lecture', 'cantine'],
      '🐾 Animaux': ['chien', 'chat', 'lapin', 'cheval', 'poule', 'canard', 'mouton', 'cochon', 'tortue', 'serpent', 'tigre', 'oiseau']
    },
    ce2: {
      '🔢 Maths': ['multiplication', 'division', 'soustraction', 'produit', 'quotient', 'reste', 'milliers', 'centaine', 'dizaine', 'calcul', 'somme', 'difference', 'double', 'moitie', 'tables'],
      '📐 Géométrie': ['perimetre', 'losange', 'diametre', 'rayon', 'symetrie', 'rectangle', 'triangle', 'angle', 'segment', 'sommet', 'cercle', 'figure', 'solide', 'pyramide'],
      '📏 Mesures': ['longueur', 'masse', 'litre', 'gramme', 'kilometre', 'metre', 'euro', 'centime', 'horloge', 'calendrier', 'minute', 'seconde'],
      '🌱 Sciences': ['vivant', 'plante', 'animal', 'graine', 'racine', 'feuille', 'squelette', 'volcan', 'etoile', 'nuage', 'energie']
    },
    cm1: {
      '🔢 Maths': ['fraction', 'decimal', 'diviseur', 'multiple', 'quotient', 'numerateur', 'denominateur', 'millier', 'million', 'moyenne', 'proportion', 'graphique', 'estimation', 'arrondi'],
      '📐 Géométrie': ['parallele', 'perpendiculaire', 'perimetre', 'aire', 'polygone', 'hexagone', 'pentagone', 'diagonale', 'symetrie', 'prisme', 'pyramide', 'cylindre', 'patron', 'losange'],
      '🔬 Sciences': ['energie', 'planete', 'galaxie', 'volcan', 'circuit', 'electricite', 'squelette', 'digestion', 'respiration', 'mammifere', 'evaporation', 'gravite'],
      '🌍 Pays': ['france', 'espagne', 'italie', 'japon', 'maroc', 'bresil', 'canada', 'egypte', 'portugal', 'turquie']
    },
    cm2: {
      '🔢 Maths': ['pourcentage', 'proportion', 'numerateur', 'denominateur', 'fraction', 'decimal', 'diviseur', 'multiple', 'moyenne', 'equation', 'inconnue', 'frequence', 'echelle', 'milliard', 'approximation'],
      '📐 Géométrie': ['perpendiculaire', 'parallele', 'perimetre', 'polygone', 'hexagone', 'diagonale', 'symetrie', 'cylindre', 'pyramide', 'patron', 'circonference', 'diametre', 'bissectrice'].filter(function (m) { return m !== 'bissectrice'; }),
      '🔬 Sciences': ['photosynthese', 'ecosysteme', 'biodiversite', 'condensation', 'evaporation', 'magnetisme', 'electricite', 'molecule', 'atome', 'gravite', 'vitesse', 'planete', 'galaxie', 'erosion', 'mammifere'],
      '🌍 Pays': ['france', 'espagne', 'italie', 'japon', 'maroc', 'bresil', 'canada', 'egypte', 'portugal', 'turquie', 'tunisie', 'suisse']
    }
  };
  function motsPendu(n) { return MOTS[n] || MOTS[NIVEAU_DEFAUT]; }

  /* ---------- Défi calcul (mini-générateur local) ---------- */
  function ri(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function dec(x) { return String(x).replace('.', ','); }

  function genererCalcul(n, rng) {
    rng = rng || Math.random;
    var a, b, p, t;
    switch (n) {
      case 'cp':
        a = ri(rng, 1, 19); b = ri(rng, 1, 20 - a);
        return { texte: a + ' + ' + b, reponse: a + b };
      case 'ce1':
        if (rng() < 0.5) {
          a = ri(rng, 10, 90); b = ri(rng, 1, 100 - a);
          return { texte: a + ' + ' + b, reponse: a + b };
        }
        t = [2, 5, 10][ri(rng, 0, 2)]; b = ri(rng, 1, 10);
        return { texte: t + ' × ' + b, reponse: t * b };
      case 'ce2':
        if (rng() < 0.5) {
          a = ri(rng, 100, 899); b = ri(rng, 10, 1000 - a);
          return { texte: a + ' + ' + b, reponse: a + b };
        }
        a = ri(rng, 2, 9); b = ri(rng, 2, 9);
        return { texte: a + ' × ' + b, reponse: a * b };
      case 'cm1':
        t = rng();
        if (t < 0.4) {
          a = ri(rng, 2, 9); b = ri(rng, 2, 12);
          return { texte: a + ' × ' + b, reponse: a * b };
        }
        if (t < 0.75) {
          b = ri(rng, 2, 9); p = ri(rng, 2, 12);
          return { texte: (b * p) + ' ÷ ' + b, reponse: p };
        }
        a = ri(rng, 11, 50); b = [2, 3, 4, 5][ri(rng, 0, 3)];
        return { texte: a + ' × ' + b, reponse: a * b };
      case 'cm2':
      default:
        t = rng();
        if (t < 0.4) { // addition de décimaux (dixièmes)
          a = ri(rng, 11, 99); b = ri(rng, 11, 99);
          return { texte: dec(a / 10) + ' + ' + dec(b / 10), reponse: (a + b) / 10 };
        }
        if (t < 0.7) { // soustraction positive
          a = ri(rng, 30, 99); b = ri(rng, 11, a - 1);
          return { texte: dec(a / 10) + ' − ' + dec(b / 10), reponse: (a - b) / 10 };
        }
        a = ri(rng, 11, 99); b = [2, 3, 4, 5][ri(rng, 0, 3)];
        return { texte: dec(a / 10) + ' × ' + b, reponse: (a * b) / 10 };
    }
  }
  function reponseJuste(saisie, attendu) {
    var v = parseFloat(String(saisie).trim().replace(',', '.'));
    return !isNaN(v) && Math.abs(v - attendu) < 1e-9;
  }

  /* ---------- Voix ---------- */
  function lire(texte) {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(texte);
      u.lang = 'fr-FR';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function creerBoutonVoix(getTexte) {
    if (niveau() !== 'cp') return null;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-voix';
    b.textContent = '🔊';
    b.setAttribute('aria-label', 'Écouter la consigne');
    b.addEventListener('click', function () {
      lire(typeof getTexte === 'function' ? getTexte() : String(getTexte));
    });
    return b;
  }

  /* ---------- Défi calcul : interface ---------- */
  var defi = { actif: false, ouvert: false };

  function creerBasculeDefi(parent, onChange) {
    var lab = document.createElement('label');
    lab.className = 'defi-bascule';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.addEventListener('change', function () {
      defi.actif = cb.checked;
      if (onChange) onChange(defi.actif);
    });
    lab.appendChild(cb);
    lab.appendChild(document.createTextNode(niveau() === 'cp' ? '➕ Défi calcul' : '➕ Défi calcul (résous un calcul pour jouer)'));
    parent.appendChild(lab);
    return lab;
  }

  function demanderCalcul(onReussi) {
    if (!defi.actif) { onReussi(); return; }
    if (defi.ouvert) return;
    defi.ouvert = true;
    var n = niveau();
    var calc = genererCalcul(n);
    var ov = document.createElement('div');
    ov.className = 'defi-overlay';
    ov.innerHTML =
      '<div class="defi-box" role="dialog" aria-modal="true" aria-label="Défi calcul">' +
      '<p class="defi-titre"></p><p class="defi-calcul"></p>' +
      '<input class="defi-input" type="text" inputmode="decimal" autocomplete="off" aria-label="Ta réponse">' +
      '<p class="defi-msg" aria-live="polite"></p>' +
      '<div class="defi-btns"><button type="button" class="defi-annuler">Annuler</button>' +
      '<button type="button" class="defi-ok">Valider</button></div></div>';
    document.body.appendChild(ov);
    var titre = ov.querySelector('.defi-titre');
    var calcEl = ov.querySelector('.defi-calcul');
    var input = ov.querySelector('.defi-input');
    var msg = ov.querySelector('.defi-msg');
    var voix = creerBoutonVoix(function () { return 'Combien font ' + calc.texte.replace('×', 'fois').replace('÷', 'divisé par').replace('−', 'moins') + ' ?'; });
    titre.textContent = n === 'cp' ? 'Calcule pour jouer !' : 'Résous le calcul pour jouer';
    function afficher() { calcEl.textContent = calc.texte + ' = ?'; input.value = ''; input.focus(); }
    if (voix) ov.querySelector('.defi-btns').insertBefore(voix, ov.querySelector('.defi-ok'));
    function fermer() { defi.ouvert = false; if (ov.parentNode) ov.parentNode.removeChild(ov); }
    function valider() {
      if (reponseJuste(input.value, calc.reponse)) { fermer(); onReussi(); return; }
      msg.textContent = 'Presque ! Essaie ce calcul.';
      calc = genererCalcul(n);
      afficher();
    }
    ov.querySelector('.defi-ok').addEventListener('click', valider);
    ov.querySelector('.defi-annuler').addEventListener('click', fermer);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') valider();
      if (e.key === 'Escape') fermer();
    });
    afficher();
  }


  /* ---------- Catalogue des jeux « magiques » (solo, adaptés à chaque classe) ---------- */
  var CATALOGUE = [
    { id: 'eclair', titre: 'Calcul Éclair', emoji: '⚡', categorie: 'calcul', accroche: 'Un maximum de calculs en 60 secondes !',
      trophee: { nom: 'Éclair de Génie', icones: { 5: '⚡', 10: '🌩️', 20: '☄️' }, action: 'Joue 5 parties de Calcul Éclair' } },
    { id: 'compte-magique', titre: 'Le Compte Magique', emoji: '🎯', categorie: 'calcul', accroche: 'Atteins le nombre cible avec tes nombres.',
      trophee: { nom: 'Maître du Compte', icones: { 5: '🎯', 10: '🏹', 20: '🌟' }, action: 'Joue 5 parties du Compte Magique' } },
    { id: 'suites-magiques', titre: 'Suites Magiques', emoji: '🔗', categorie: 'logique', accroche: 'Trouve le nombre qui manque dans la suite.',
      trophee: { nom: 'Détective des Suites', icones: { 5: '🔎', 10: '🕵️', 20: '🧩' }, action: 'Joue 5 parties de Suites Magiques' } },
    { id: 'ranger', titre: 'Range les nombres', emoji: '📊', categorie: 'logique', accroche: 'Du plus petit au plus grand… ou l’inverse !',
      trophee: { nom: 'Grand Ordonnateur', icones: { 5: '📊', 10: '🗂️', 20: '🏛️' }, action: 'Joue 5 parties de Range les nombres' } },
    { id: 'memory-nombres', titre: 'Mémoire Magique', emoji: '🃏', categorie: 'logique', accroche: 'Retrouve les paires qui vont ensemble.',
      trophee: { nom: 'Mémoire d’Éléphant', icones: { 5: '🃏', 10: '🐘', 20: '🧠' }, action: 'Joue 5 parties de Mémoire Magique' } },
    { id: 'horloge', titre: 'L’Horloge Enchantée', emoji: '🕒', categorie: 'mesures', accroche: 'Lis l’heure et règle les aiguilles.',
      trophee: { nom: 'Gardien du Temps', icones: { 5: '🕒', 10: '⏳', 20: '🕰️' }, action: 'Joue 5 parties de l’Horloge Enchantée' } },
    { id: 'marche', titre: 'Au Marché des Sorciers', emoji: '🪙', categorie: 'mesures', accroche: 'Paye et rends la monnaie sans te tromper.',
      trophee: { nom: 'Roi du Marché', icones: { 5: '🪙', 10: '💰', 20: '👑' }, action: 'Joue 5 parties au Marché des Sorciers' } },
    { id: 'fractions', titre: 'Pizzas Magiques', emoji: '🍕', categorie: 'mesures', accroche: 'Coupe, colorie et partage en parts égales.',
      trophee: { nom: 'Chef Pizzaïolo', icones: { 5: '🍕', 10: '🧑‍🍳', 20: '🏅' }, action: 'Joue 5 parties de Pizzas Magiques' } }
  ];
  var CATEGORIES = [
    { id: 'calcul', titre: '➕ Calcul malin' },
    { id: 'logique', titre: '🧩 Logique et mémoire' },
    { id: 'mesures', titre: '📏 Heure, monnaie, parts' }
  ];
  function jeuCatalogue(id) {
    for (var i = 0; i < CATALOGUE.length; i++) if (CATALOGUE[i].id === id) return CATALOGUE[i];
    return null;
  }

  /* ---------- Enregistrement des parties et défi du jour ---------- */
  function dateLocale(d) {
    d = d || new Date();
    var m = d.getMonth() + 1, j = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (j < 10 ? '0' : '') + j;
  }
  function veille(dateStr) {
    var p = dateStr.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() - 1);
    return dateLocale(d);
  }
  function hachage(texte) {
    var h = 0;
    for (var i = 0; i < texte.length; i++) h = (h * 31 + texte.charCodeAt(i)) >>> 0;
    return h;
  }
  /** Jeu proposé aujourd'hui (le même toute la journée, parmi les jeux ouverts à la classe). */
  function defiDuJour(dateStr) {
    dateStr = dateStr || dateLocale();
    var dispo = CATALOGUE.filter(function (j) { return jeuActif(j.id); });
    if (!dispo.length) return null;
    return dispo[hachage(dateStr) % dispo.length];
  }
  function etatDefi() {
    var g = gp();
    var d = {};
    try { if (g && g.getProgression) d = g.getProgression('defi-du-jour') || {}; } catch (e) {}
    var auj = dateLocale();
    var serie = d.serie || 0;
    var fait = d.derniereDate === auj;
    // une série s'arrête si on a raté hier (elle reste affichée si on a joué aujourd'hui ou hier)
    if (!fait && d.derniereDate && d.derniereDate !== veille(auj)) serie = 0;
    if (!d.derniereDate) serie = 0;
    return { fait: fait, serie: serie, total: d.partiesDefis || 0, jeu: defiDuJour(auj) };
  }
  function validerDefi(id) {
    var g = gp();
    var etat = etatDefi();
    if (!g || !etat.jeu || etat.jeu.id !== id || etat.fait) return null;
    var d = {};
    try { d = g.getProgression('defi-du-jour') || {}; } catch (e) {}
    var auj = dateLocale();
    var serie = (d.derniereDate === veille(auj) ? (d.serie || 0) : 0) + 1;
    g.setProgression('defi-du-jour', {
      derniereDate: auj, serie: serie,
      partiesDefis: (d.partiesDefis || 0) + 1,
      meilleureSerie: Math.max(d.meilleureSerie || 0, serie)
    });
    return { serie: serie };
  }
  /**
   * À appeler à la fin de chaque partie d'un jeu du catalogue.
   * res = { gagnee: bool, score: nombre (optionnel), meilleur: 'max' | 'min' (sens du meilleur score) }
   * Retourne { defi: { serie } } si la partie valide le défi du jour, sinon {}.
   */
  function enregistrerPartie(id, res) {
    var g = gp();
    res = res || {};
    if (!g || typeof g.setProgression !== 'function') return {};
    var cle = 'jeu-' + id;
    var d = {};
    try { d = g.getProgression(cle) || {}; } catch (e) {}
    var suivant = {};
    Object.keys(d).forEach(function (k) { if (k !== 'niveau') suivant[k] = d[k]; });
    suivant.partiesJouees = (d.partiesJouees || 0) + 1;
    suivant.partiesGagnees = (d.partiesGagnees || 0) + (res.gagnee ? 1 : 0);
    if (typeof res.score === 'number' && isFinite(res.score)) {
      var ancien = d.meilleurScore;
      if (typeof ancien !== 'number') suivant.meilleurScore = res.score;
      else suivant.meilleurScore = res.meilleur === 'min' ? Math.min(ancien, res.score) : Math.max(ancien, res.score);
    }
    g.setProgression(cle, suivant);
    var defi = res.gagnee ? validerDefi(id) : null; // le défi du jour demande une partie gagnée
    return defi ? { defi: defi } : {};
  }
  /** Texte de fin de partie quand le défi du jour vient d'être réussi (chaîne vide sinon). */
  function messageDefi(retour) {
    if (!retour || !retour.defi) return '';
    return '🔥 Défi du jour réussi ! Série : ' + retour.defi.serie + ' jour' + (retour.defi.serie > 1 ? 's' : '');
  }

  /* ---------- Mascotte (SVG) ---------- */
  function mascotte(etat) {
    if (typeof document === 'undefined') return;
    var el = document.querySelector('.jeu-mascotte');
    if (!el) return;
    el.dataset.etat = etat;
    el.style.display = '';
    el.src = (el.dataset.dossier || '../../images/') + 'mascotte-' + etat + '.svg';
  }

  function init() {
    if (typeof document === 'undefined') return;
    document.addEventListener('DOMContentLoaded', function () {
      document.body.classList.add('niveau-' + niveau());
    });
  }

  var API = {
    NIVEAUX: NIVEAUX, niveau: niveau, programme: programme, jeuActif: jeuActif,
    plages: plages, plageMax: plageMax, fmt: fmt, motsPendu: motsPendu,
    genererCalcul: genererCalcul, reponseJuste: reponseJuste,
    lire: lire, creerBoutonVoix: creerBoutonVoix, mascotte: mascotte,
    defi: defi, creerBasculeDefi: creerBasculeDefi, demanderCalcul: demanderCalcul,
    CATALOGUE: CATALOGUE, CATEGORIES: CATEGORIES, jeuCatalogue: jeuCatalogue,
    dateLocale: dateLocale, defiDuJour: defiDuJour, etatDefi: etatDefi, enregistrerPartie: enregistrerPartie, messageDefi: messageDefi
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else { root.JeuxNiveau = API; init(); }
})(typeof window !== 'undefined' ? window : globalThis);
