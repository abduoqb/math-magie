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
    lab.appendChild(document.createTextNode(niveau() === 'cp' ? ' 🧮 Défi calcul' : ' 🧮 Défi calcul (résous un calcul pour jouer)'));
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
      msg.textContent = 'Pas tout à fait ! Essaie ce calcul.';
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
    lire: lire, creerBoutonVoix: creerBoutonVoix,
    defi: defi, creerBasculeDefi: creerBasculeDefi, demanderCalcul: demanderCalcul
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else { root.JeuxNiveau = API; init(); }
})(typeof window !== 'undefined' ? window : globalThis);
