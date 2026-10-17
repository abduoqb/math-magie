// Programme CP (cycle 2) - donnees pour les moteurs de calcul, geometrie et jeux.
// Source: docs/programmes/cp.md (BO n 41 du 31/10/2024, programme cycle 2 en vigueur) + reperes Eduscol cycle 2.
// Tous les nombres sont <= 100. En cas de doute, le palier reste en dessous du programme.
// Les champs `source` et `notes` sont informatifs (ignores par les moteurs).
(function () {
  var SRC_PROGRAMME = "https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf";
  var SRC_REPERES = "https://eduscol.education.gouv.fr/sites/default/files/document/20-maths-c2-reperes-eduscol1114750pdf-74640.pdf";

  function pal(max, retenue, termes) {
    return { min: 0, max: max, retenue: retenue, termes: termes || 2, decimaux: 0 };
  }
  function dbl(bmin, bmax) { return { a: [2, 2], b: [bmin, bmax], decimaux: 0 }; }
  function moi(qmin, qmax) { return { diviseur: [2, 2], quotient: [qmin, qmax], reste: false, decimaux: 0 }; }

  window.PROGRAMMES = window.PROGRAMMES || {};
  window.PROGRAMMES.cp = {
    id: "cp",
    libelle: "CP",
    cycle: 2,
    source: SRC_PROGRAMME,
    calcul: {
      additions: {
        actif: true,
        libelle: "Additions",
        consigne: "Calcule la somme.",
        source: SRC_PROGRAMME,
        notes: "Paliers 1-3: faits numeriques (complements a 10, tables d'addition). 4-9: calcul mental (+1, +2, +10, dizaines, +9, cassage de la dizaine, dizaines+unites). 10: addition posee de 3 nombres (ex. 28 + 8 + 56). A VALIDER: le programme place l'addition posee en periode 4/5 alors que les reperes donnent une technique posee de soustraction en periode 3 (divergence signalee dans la recherche). Resultats toujours <= 100. 'max' = borne du resultat.",
        niveaux: [
          pal(10, false),
          pal(20, false),
          pal(20, true),
          pal(30, false),
          pal(50, false),
          pal(60, true),
          pal(70, true),
          pal(100, false),
          pal(100, true),
          pal(100, true, 3)
        ]
      },
      soustractions: {
        actif: true,
        libelle: "Soustractions",
        consigne: "Calcule la différence.",
        source: SRC_PROGRAMME,
        notes: "A VALIDER: au CP la soustraction mentale se limite a -1, -2, -10, dizaines entieres, nombre < 10. Les paliers 8-10 (deux nombres a deux chiffres, retenue:true aux paliers 9-10) depassent le strict mental; l'algorithme pose est CE1 (mais reperes: technique posee au plus tard en periode 3). Usage strict: mettre retenue:false aux paliers 9-10. 'max' = borne du plus grand nombre.",
        niveaux: [
          pal(10, false),
          pal(20, false),
          pal(20, true),
          pal(30, false),
          pal(50, false),
          pal(60, true),
          pal(70, true),
          pal(100, false),
          pal(80, true),
          pal(100, true)
        ]
      },
      multiplications: {
        actif: true,
        libelle: "Les doubles",
        consigne: "Trouve le double.",
        source: SRC_PROGRAMME,
        notes: "Pas de tables de multiplication au CP (CE1). Seuls les doubles (x2) de 1 a 10 sont retenus; le moteur doit afficher 'double de N' ou '2 x N'. Doubles de dizaines (20 a 50) non representables avec des intervalles continus: non inclus.",
        niveaux: [dbl(1, 3), dbl(1, 4), dbl(1, 5), dbl(1, 6), dbl(1, 7), dbl(1, 8), dbl(1, 9), dbl(1, 10), dbl(5, 10), dbl(6, 10)]
      },
      divisions: {
        actif: true,
        libelle: "Les moitiés",
        consigne: "Trouve la moitié.",
        source: SRC_PROGRAMME,
        notes: "Seules les moities de nombres pairs <= 20 sont prevues (diviseur 2, sans reste). Pas de division euclidienne au CP (CE1).",
        niveaux: [moi(1, 3), moi(1, 4), moi(1, 5), moi(1, 6), moi(1, 7), moi(1, 8), moi(1, 9), moi(1, 10), moi(5, 10), moi(6, 10)]
      }
    },
    geometrie: {
      "geometrie-formes": {
        actif: true,
        libelle: "Les formes",
        source: SRC_PROGRAMME,
        contenu: { formes: ["Carré", "Triangle", "Rectangle", "Cercle", "Cube", "Sphère", "Pavé droit", "Cylindre", "Cône"], niveauMax: 2 },
        notes: "Exclus: Losange (CE1), Pentagone, Hexagone, Pyramide (CE1). Cercle/Sphere correspondent a disque/boule du programme."
      },
      "geometrie-proprietes": {
        actif: true,
        libelle: "Sommets et côtés",
        source: SRC_PROGRAMME,
        contenu: { figures: ["Triangle", "Carré", "Rectangle"], questions: ["sommets", "côtés"], niveauMax: 1 },
        notes: "Figures planes seulement. Arete/sommet des solides = CE1, donc exclus."
      },
      "geometrie-angles": { actif: false, libelle: "Les angles", contenu: {}, source: SRC_PROGRAMME, notes: "Angle droit/aigu/obtus: CE1-CE2." },
      "geometrie-symetrie": { actif: false, libelle: "La symétrie", contenu: {}, source: SRC_PROGRAMME, notes: "Au CP seulement la perception; axe de symetrie = CE2." },
      "geometrie-vraifaux": {
        actif: false,
        libelle: "Vrai ou faux",
        contenu: { formes: ["Carré", "Triangle", "Cercle", "Rectangle"], niveauMax: 1 },
        source: SRC_PROGRAMME,
        notes: "Desactive: les affirmations existantes utilisent du vocabulaire hors CP (polygone, angles droits). Reactivable apres filtrage des affirmations."
      },
      "geometrie-droites": { actif: false, libelle: "Les droites", contenu: {}, source: SRC_PROGRAMME, notes: "Paralleles/perpendiculaires: CE1-CE2." },
      "geometrie-triangles": { actif: false, libelle: "Les triangles", contenu: {}, source: SRC_PROGRAMME, notes: "Isocele/equilateral/rectangle: CE1-CE2." },
      "geometrie-quadrilateres": { actif: false, libelle: "Les quadrilatères", contenu: {}, source: SRC_PROGRAMME, notes: "Losange, trapeze, parallelogramme: CE1 et plus." },
      "geometrie-patrons": { actif: false, libelle: "Les patrons", contenu: {}, source: SRC_PROGRAMME, notes: "Patron du cube: CE1." },
      "geometrie-espace": {
        actif: true,
        libelle: "Repérage dans l'espace",
        source: SRC_PROGRAMME,
        contenu: { themes: ["position", "dessus-dessous"], niveauMax: 2 },
        notes: "Vocabulaire de position (gauche, droite, entre, au-dessus, en dessous). Quadrillage a coordonnees : hors CP."
      },
      "geometrie-instruments": {
        actif: true,
        libelle: "La règle",
        source: SRC_PROGRAMME,
        contenu: { themes: ["regle-trait", "regle-lecture"], instruments: ["règle"], niveauMax: 2 },
        notes: "Usage de la regle : tracer un trait droit, mesurer un segment en cm entiers (<= 10 cm). Equerre, compas, rapporteur : plus tard."
      }
    },
  nombres: {
    // Module Nombres : ids prefixes 'nombres-'. Paliers lus par nombres/js/generateur_nombres.js.
    // Nombres 0 à 100. Les paliers sont une proposition de conception (non officielle).
    'nombres-valeur': {
      actif: true,
      libelle: 'Dizaines et unités',
      consigne: 'Trouve les chiffres et leur valeur.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Nombres 0 à 100 : chiffre des dizaines/unités, valeur d\'un chiffre.',
      niveaux: [
        { min: 10, max: 20, types: ['chiffre'] },
        { min: 10, max: 50, types: ['chiffre'] },
        { min: 10, max: 99, types: ['chiffre'] },
        { min: 10, max: 99, types: ['chiffre', 'valeur'] },
        { min: 10, max: 99, types: ['valeur', 'combien'] },
        { min: 10, max: 99, types: ['chiffre', 'valeur', 'combien'] }
      ]
    },
    'nombres-decomposer': {
      actif: true,
      libelle: 'Décomposer',
      consigne: 'Décompose en dizaines et unités.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Décomposition 47 = 4 dizaines + 7 unités = 40 + 7.',
      niveaux: [
        { min: 10, max: 20, types: ['rangs'] },
        { min: 10, max: 60, types: ['rangs'] },
        { min: 10, max: 99, types: ['rangs'] },
        { min: 10, max: 99, types: ['somme'] },
        { min: 10, max: 99, types: ['rangs', 'somme', 'retrouver'] },
        { min: 20, max: 99, types: ['rangs', 'somme', 'retrouver'] }
      ]
    },
    'nombres-comparer': {
      actif: true,
      libelle: 'Comparer',
      consigne: 'Compare les nombres.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Comparer avec <, = et > ; plus grand / plus petit ; nombres jusqu\'à 100.',
      niveaux: [
        { min: 0, max: 10, types: ['plusgrand'] },
        { min: 0, max: 20, types: ['symbole'] },
        { min: 0, max: 50, types: ['symbole', 'plusgrand', 'pluspetit'] },
        { min: 0, max: 100, types: ['symbole', 'plusgrand', 'pluspetit'] },
        { min: 0, max: 100, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true },
        { min: 0, max: 100, types: ['symbole'], proche: true }
      ]
    },
    'nombres-ranger': {
      actif: true,
      libelle: 'Ranger',
      consigne: 'Range les nombres dans l\'ordre.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Ranger dans l\'ordre croissant et décroissant, de 0 à 100.',
      niveaux: [
        { min: 0, max: 20, nb: 3, sens: ['croissant'] },
        { min: 0, max: 20, nb: 3, sens: ['croissant', 'decroissant'] },
        { min: 0, max: 50, nb: 4, sens: ['croissant', 'decroissant'] },
        { min: 0, max: 100, nb: 4, sens: ['croissant', 'decroissant'] },
        { min: 0, max: 100, nb: 5, sens: ['croissant', 'decroissant'] },
        { min: 0, max: 100, nb: 5, sens: ['croissant', 'decroissant'], proche: true }
      ]
    },
    'nombres-encadrer': {
      actif: false,
      libelle: 'Encadrer',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Pas dans la liste retenue pour le CP (encadrement : CE1).',
      niveaux: []
    },
    'nombres-droite': {
      actif: false,
      libelle: 'Droite graduée',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Droite graduée : à partir du CE2 dans ce module.',
      niveaux: []
    },
    'nombres-moitie': {
      actif: true,
      libelle: 'La moitié',
      consigne: 'Trouve la moitié.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Notion de moitié : partager en 2 parts égales (nombres pairs jusqu\'à 100).',
      niveaux: [
        { max: 10, types: ['moitie'] },
        { max: 20, types: ['moitie'] },
        { max: 20, types: ['moitie', 'partage'] },
        { max: 50, types: ['moitie', 'partage', 'estmoitie'] },
        { max: 100, types: ['moitie', 'partage', 'estmoitie'] },
        { max: 100, types: ['moitie', 'partage', 'estmoitie'] }
      ]
    },
    'nombres-fractions': {
      actif: false,
      libelle: 'Les fractions',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Fractions simples : CM1.',
      niveaux: []
    },
    'nombres-decimaux': {
      actif: false,
      libelle: 'Les nombres décimaux',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Décimaux : CM1.',
      niveaux: []
    }
  },
    // BEGIN grandeurs (module grandeurs/ ; généré, voir grandeurs/js/generateur_grandeurs.js pour le format des exos)
    grandeurs: {
      longueurs: {
        actif: true,
        libelle: 'Longueurs',
        consigne: 'Mesure et compare des longueurs.',
        source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
        notes: 'Unités du CP : m et cm, 1 m = 100 cm, nombres <= 100. Pas de conversion en tableau, pas de virgule.',
        niveaux: [
          { exos: [
            { type: 'comparer', grandeur: 'longueur', unites: ['cm'], min: 1, max: 20 }
          ] },
          { exos: [
            { type: 'comparer', grandeur: 'longueur', unites: ['cm'], min: 1, max: 100, deux: true },
            { type: 'choisir-unite', grandeur: 'longueur', unites: ['cm', 'm'], nbChoix: 2 }
          ] },
          { exos: [
            { type: 'probleme', grandeur: 'longueur', op: 'add', unite: 'cm', min: 1, max: 10 },
            { type: 'probleme', grandeur: 'longueur', op: 'sub', unite: 'cm', min: 1, max: 20 }
          ] },
          { exos: [
            { type: 'probleme', grandeur: 'longueur', op: 'add', unite: 'cm', min: 1, max: 50 },
            { type: 'probleme', grandeur: 'longueur', op: 'sub', unite: 'cm', min: 1, max: 100 },
            { type: 'probleme', grandeur: 'longueur', op: 'add', unite: 'm', min: 1, max: 50 }
          ] },
          { exos: [
            { type: 'comparer', grandeur: 'longueur', unites: ['m'], min: 1, max: 100, deux: true },
            { type: 'choisir-unite', grandeur: 'longueur', unites: ['cm', 'm'], nbChoix: 2 },
            { type: 'convertir', grandeur: 'longueur', paires: [['m', 'cm']], min: 1, max: 1 }
          ] }
        ]
      },
      'masses-contenances': {
        actif: false,
        libelle: 'Masses et contenances',
        notes: 'Pas dans cette version pour le CP (la monnaie et l\'heure sont couvertes par les jeux Horloge et Marché).'
      },
      'durees-monnaie': {
        actif: false,
        libelle: 'Durées et monnaie',
        notes: 'Heures justes et monnaie : déjà couverts par les jeux Horloge et Marché, volontairement non dupliqués.'
      },
      'perimetres-aires': {
        actif: false,
        libelle: 'Périmètres et aires',
        notes: 'Périmètres : CE2. Aires : CM1.'
      },
      'proportionnalite-pourcentages': {
        actif: false,
        libelle: 'Proportionnalité',
        notes: 'Initiation en CM1, pourcentages en CM2.'
      },
      'volumes-vitesses-echelles': {
        actif: false,
        libelle: 'Volumes, vitesses, échelles',
        notes: 'CM2 uniquement.'
      }
    },
    // END grandeurs
    jeux: {
      morpion: true,
      puissance4: true,
      pendu: true,
      "trouver-le-chiffre": true, "eclair": true, "compte-magique": true, "suites-magiques": true, "ranger": true, "memory-nombres": true, "horloge": true, "marche": true, "fractions": true
    },
    sourceReperes: SRC_REPERES
  };
})();
