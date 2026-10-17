/* Programme CE2 (cycle 2, BO n°41 du 31/10/2024, applicable rentrée 2025).
   Recherche : docs/programmes/ce2.md. Champ numérique : entiers <= 10 000.
   Conventions :
   - additions/soustractions : `max` = borne du résultat (additions) / du plus grand nombre (soustractions) ;
     les termes sont tirés pour que la somme reste <= max et que les différences restent >= 0.
   - multiplications : a et b sont des intervalles d'entiers ; produit <= 10 000.
   - divisions : dividende = diviseur x quotient (division exacte, pas de reste au CE2).
   - decimaux : 0 partout (les décimaux formels sont du cycle 3 ; la monnaie à virgule est hors paliers, à valider). */
window.PROGRAMMES = window.PROGRAMMES || {};
(function () {
  var SRC_BO = 'https://pedagogie.ac-orleans-tours.fr/documents/pdf/presentation_programmes_maths_c2_pdf.pdf';
  var SRC_CPD = 'https://maths.circo39.ac-besancon.fr/wp-content/uploads/sites/27/2024/01/programme-maths-C2-mise-en-parallele-1.pdf';

  window.PROGRAMMES.ce2 = {
    id: 'ce2',
    libelle: 'CE2',
    cycle: 2,
    source: SRC_BO,
    notes: 'Pages Eduscol/education.gouv en 403 lors de la recherche : formulations à recouper avec le BO n°41 du 31/10/2024.',

    calcul: {
      additions: {
        actif: true,
        libelle: 'Additions',
        consigne: 'Calcule la somme. Nombres jusqu’à 10 000.',
        source: SRC_CPD,
        notes: 'Paliers dérivés du programme (non officiels). Monnaie à virgule (<= 100 EUR) non incluse : à valider.',
        niveaux: [
          { min: 1,   max: 10,    retenue: false, termes: 2, decimaux: 0 },
          { min: 1,   max: 20,    retenue: true,  termes: 2, decimaux: 0 },
          { min: 10,  max: 100,   retenue: false, termes: 2, decimaux: 0 },
          { min: 10,  max: 100,   retenue: true,  termes: 2, decimaux: 0 },
          { min: 10,  max: 1000,  retenue: false, termes: 2, decimaux: 0 },
          { min: 10,  max: 1000,  retenue: true,  termes: 2, decimaux: 0 },
          { min: 10,  max: 1000,  retenue: true,  termes: 3, decimaux: 0 },
          { min: 100, max: 10000, retenue: false, termes: 2, decimaux: 0 },
          { min: 100, max: 10000, retenue: true,  termes: 2, decimaux: 0 },
          { min: 100, max: 10000, retenue: true,  termes: 3, decimaux: 0 }
        ]
      },

      soustractions: {
        actif: true,
        libelle: 'Soustractions',
        consigne: 'Calcule la différence. Nombres jusqu’à 10 000.',
        source: SRC_CPD,
        notes: 'Retenue = emprunt. Soustraction posée introduite en période 3 au plus tard. Termes 3 = a - b - c (résultat >= 0).',
        niveaux: [
          { min: 1,   max: 10,    retenue: false, termes: 2, decimaux: 0 },
          { min: 1,   max: 20,    retenue: true,  termes: 2, decimaux: 0 },
          { min: 10,  max: 100,   retenue: false, termes: 2, decimaux: 0 },
          { min: 10,  max: 100,   retenue: true,  termes: 2, decimaux: 0 },
          { min: 10,  max: 1000,  retenue: false, termes: 2, decimaux: 0 },
          { min: 10,  max: 1000,  retenue: true,  termes: 2, decimaux: 0 },
          { min: 100, max: 10000, retenue: false, termes: 2, decimaux: 0 },
          { min: 100, max: 10000, retenue: true,  termes: 2, decimaux: 0 },
          { min: 100, max: 1000,  retenue: true,  termes: 3, decimaux: 0 },
          { min: 100, max: 10000, retenue: true,  termes: 3, decimaux: 0 }
        ]
      },

      multiplications: {
        actif: true,
        libelle: 'Multiplications',
        consigne: 'Calcule le produit.',
        source: SRC_CPD,
        notes: 'Palier 5 = x10 (a=10). Pas de x100 (non confirmé dans le BO). Palier 10 : 2 chiffres x 2 chiffres, produit max 9801. Les dizaines entières (9 x 40) ne sont pas exprimables par un intervalle : couvertes par le palier 6.',
        niveaux: [
          { a: [2, 5],     b: [2, 5],     decimaux: 0 },
          { a: [2, 5],     b: [2, 10],    decimaux: 0 },
          { a: [2, 9],     b: [2, 9],     decimaux: 0 },
          { a: [2, 9],     b: [2, 10],    decimaux: 0 },
          { a: [10, 10],   b: [11, 99],   decimaux: 0 },
          { a: [2, 9],     b: [10, 99],   decimaux: 0 },
          { a: [2, 9],     b: [100, 500], decimaux: 0 },
          { a: [2, 9],     b: [100, 999], decimaux: 0 },
          { a: [100, 300], b: [11, 30],   decimaux: 0 },
          { a: [11, 99],   b: [11, 99],   decimaux: 0 }
        ]
      },

      divisions: {
        actif: true,
        libelle: 'Divisions',
        consigne: 'Calcule le quotient (partage ou groupement).',
        source: SRC_CPD,
        notes: 'reste:false partout : division euclidienne et division posée non trouvées dans la source CE2, à valider avec le BO. Palier 10 : division par 10 uniquement (pas de 100).',
        niveaux: [
          { diviseur: [2, 5],   quotient: [1, 5],      reste: false, decimaux: 0 },
          { diviseur: [2, 5],   quotient: [1, 10],     reste: false, decimaux: 0 },
          { diviseur: [2, 9],   quotient: [1, 9],      reste: false, decimaux: 0 },
          { diviseur: [2, 9],   quotient: [1, 10],     reste: false, decimaux: 0 },
          { diviseur: [10, 10], quotient: [1, 10],     reste: false, decimaux: 0 },
          { diviseur: [2, 9],   quotient: [10, 20],    reste: false, decimaux: 0 },
          { diviseur: [2, 9],   quotient: [10, 50],    reste: false, decimaux: 0 },
          { diviseur: [2, 9],   quotient: [10, 99],    reste: false, decimaux: 0 },
          { diviseur: [2, 9],   quotient: [10, 111],   reste: false, decimaux: 0 },
          { diviseur: [10, 10], quotient: [100, 1000], reste: false, decimaux: 0 }
        ]
      }
    },

    geometrie: {
      'geometrie-formes': {
        actif: true,
        libelle: 'Reconnaître les formes',
        source: SRC_BO,
        notes: 'Sphère = « boule » au programme. Tous ces noms figurent au CE2.',
        contenu: {
          formes: ['Carré', 'Triangle', 'Rectangle', 'Cercle', 'Losange', 'Hexagone', 'Pentagone', 'Cube', 'Sphère', 'Pyramide', 'Cylindre', 'Pavé droit', 'Cône']
        }
      },
      'geometrie-proprietes': {
        actif: true,
        libelle: 'Sommets, côtés, faces',
        source: SRC_BO,
        notes: 'Octogone et Étoile exclus (hors liste CE2 : pentagone, hexagone cités seulement).',
        contenu: {
          figures: ['Triangle', 'Carré', 'Rectangle', 'Pentagone', 'Hexagone', 'Cube', 'Pavé droit', 'Pyramide']
        }
      },
      'geometrie-angles': {
        actif: true,
        libelle: 'Les angles',
        source: SRC_BO,
        notes: 'Angle droit, aigu, obtus. Plat et nul exclus (non cités au CE2).',
        contenu: { types: ['Aigu', 'Droit', 'Obtus'] }
      },
      'geometrie-symetrie': {
        actif: true,
        libelle: 'Symétrie axiale',
        source: SRC_BO,
        notes: 'Reconnaître une figure symétrique par rapport à un axe : au programme CE2.',
        contenu: { axe: 'vertical', quadrillage: true, niveauMoteurMax: 2 }
      },
      'geometrie-vraifaux': {
        actif: true,
        libelle: 'Vrai ou faux',
        source: SRC_BO,
        notes: 'À valider : certaines affirmations des pools niveaux 2-3 peuvent dépasser le CE2. Formes limitées à celles du CE2.',
        contenu: {
          formes: ['Carré', 'Triangle', 'Cercle', 'Rectangle', 'Losange', 'Hexagone', 'Pentagone', 'Cube', 'Sphère', 'Pavé droit', 'Cylindre', 'Cône']
        }
      },
      'geometrie-droites': {
        actif: false,
        libelle: 'Droites',
        source: SRC_BO,
        notes: 'Parallèles/perpendiculaires/sécantes non listées dans la recherche CE2 ; en cas de doute désactivé. Si activé : Perpendiculaires et Parallèles seulement.',
        contenu: { types: [] }
      },
      'geometrie-triangles': {
        actif: false,
        libelle: 'Types de triangles',
        source: SRC_BO,
        notes: 'Seul le triangle rectangle est cité au CE2 ; équilatéral/isocèle/quelconque relèvent du cycle 3. Hors programme.',
        contenu: { types: [] }
      },
      'geometrie-quadrilateres': {
        actif: false,
        libelle: 'Types de quadrilatères',
        source: SRC_BO,
        notes: 'Trapèze, parallélogramme, cerf-volant : cycle 3. Seuls losange et rectangle sont du CE2, trop peu pour la mission (le pool ne contient pas le carré). Hors programme.',
        contenu: { types: [] }
      },
      'geometrie-patrons': {
        actif: true,
        libelle: 'Patrons de solides',
        source: SRC_BO,
        notes: 'Construire cube, pavé, pyramide à partir de faces. Cylindre, prisme, tétraèdre exclus.',
        contenu: { solides: ['Cube', 'Pavé droit', 'Pyramide'] }
      },
      'geometrie-espace': {
        actif: true,
        libelle: 'Repérage et déplacements',
        source: SRC_BO,
        notes: 'Vocabulaire de position et de deplacement, codage d un deplacement sur quadrillage, coordonnees (x ; y) sur quadrillage.',
        contenu: { themes: ['quadrillage-case', 'deplacement', 'coordonnees'], niveauMax: 3 }
      },
      'geometrie-solides': {
        actif: true,
        libelle: 'Les solides',
        source: SRC_BO,
        notes: 'Nature des faces (cube, pave, pyramide, cylindre, cone) et descriptions par enigmes. Prisme : CM1.',
        contenu: { themes: ['faces-forme', 'description'], solides: ['Cube', 'Pavé droit', 'Pyramide', 'Cylindre', 'Cône', 'Sphère'], niveauMax: 3 }
      },
      'geometrie-cercle': {
        actif: true,
        libelle: 'Cercle et compas',
        source: SRC_BO,
        notes: 'Cercle : centre, rayon, diametre ; trace au compas. Corde et definition par la distance au centre : CM1.',
        contenu: { themes: ['vocabulaire', 'compas', 'rayon-diametre'], vocab: ['centre', 'rayon', 'diamètre'], niveauMax: 3 }
      },
      'geometrie-instruments': {
        actif: true,
        libelle: 'Règle, équerre, compas',
        source: SRC_BO,
        notes: 'Regle graduee, equerre, compas. Rapporteur : CM2.',
        contenu: { themes: ['choix-instrument', 'regle-lecture'], instruments: ['règle', 'équerre', 'compas'], niveauMax: 3 }
      }
    },

  nombres: {
    // Module Nombres : ids prefixes 'nombres-'. Paliers lus par nombres/js/generateur_nombres.js.
    // Nombres jusqu'à 10 000. Les paliers sont une proposition de conception (non officielle).
    'nombres-valeur': {
      actif: true,
      libelle: 'Valeur des chiffres',
      consigne: 'Trouve la valeur de chaque chiffre.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Entiers jusqu\'à 10 000 (ici jusqu\'à 9 999).',
      niveaux: [
        { min: 100, max: 999, types: ['chiffre', 'valeur'] },
        { min: 1000, max: 9999, types: ['chiffre'] },
        { min: 1000, max: 9999, types: ['valeur'] },
        { min: 1000, max: 9999, types: ['combien', 'chiffre'] },
        { min: 1000, max: 9999, types: ['chiffre', 'valeur', 'combien'] },
        { min: 1000, max: 9999, types: ['valeur', 'combien'] }
      ]
    },
    'nombres-decomposer': {
      actif: true,
      libelle: 'Décomposer',
      consigne: 'Décompose le nombre.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Décomposer jusqu\'à 10 000.',
      niveaux: [
        { min: 100, max: 999, types: ['rangs'] },
        { min: 1000, max: 9999, types: ['rangs'] },
        { min: 1000, max: 9999, types: ['somme'] },
        { min: 1000, max: 9999, types: ['retrouver', 'somme'] },
        { min: 1000, max: 9999, types: ['rangs', 'somme', 'retrouver'] },
        { min: 1000, max: 9999, types: ['rangs', 'somme', 'retrouver', 'paquets'] }
      ]
    },
    'nombres-comparer': {
      actif: true,
      libelle: 'Comparer',
      consigne: 'Compare les nombres.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Comparer jusqu\'à 10 000.',
      niveaux: [
        { min: 100, max: 999, types: ['symbole', 'plusgrand', 'pluspetit'] },
        { min: 1000, max: 9999, types: ['symbole', 'plusgrand'] },
        { min: 1000, max: 9999, types: ['symbole', 'plusgrand', 'pluspetit'] },
        { min: 1000, max: 9999, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true },
        { min: 1000, max: 10000, types: ['symbole', 'pluspetit'], proche: true, nb: 4 },
        { min: 1000, max: 10000, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true, nb: 4 }
      ]
    },
    'nombres-ranger': {
      actif: true,
      libelle: 'Ranger',
      consigne: 'Range les nombres dans l\'ordre.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Ranger jusqu\'à 10 000.',
      niveaux: [
        { min: 100, max: 999, nb: 3, sens: ['croissant', 'decroissant'] },
        { min: 1000, max: 9999, nb: 3, sens: ['croissant', 'decroissant'] },
        { min: 1000, max: 9999, nb: 4, sens: ['croissant', 'decroissant'] },
        { min: 1000, max: 9999, nb: 4, sens: ['croissant', 'decroissant'], proche: true },
        { min: 1000, max: 10000, nb: 5, sens: ['croissant', 'decroissant'] },
        { min: 1000, max: 10000, nb: 5, sens: ['croissant', 'decroissant'], proche: true }
      ]
    },
    'nombres-encadrer': {
      actif: true,
      libelle: 'Encadrer',
      consigne: 'Encadre le nombre.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Encadrer par deux dizaines, centaines ou milliers consécutifs.',
      niveaux: [
        { min: 1000, max: 9999, e: [2], types: ['pair', 'inf', 'sup'] },
        { min: 1000, max: 9999, e: [1, 2], types: ['pair', 'inf', 'sup'] },
        { min: 1000, max: 9999, e: [3], types: ['pair', 'inf', 'sup'] },
        { min: 1000, max: 9999, e: [1, 2, 3], types: ['pair', 'inf', 'sup'] },
        { min: 1000, max: 9999, e: [1, 2, 3], types: ['pair', 'inf', 'sup'] },
        { min: 1000, max: 9999, e: [1, 2, 3], types: ['pair', 'inf', 'sup'] }
      ]
    },
    'nombres-droite': {
      actif: true,
      libelle: 'Droite graduée',
      consigne: 'Lis ou place un nombre sur la droite.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Droite graduée simple, graduations régulières (pas 10, 100, 1 000). Pas de décimaux ni de fractions.',
      niveaux: [
        { min: 0, max: 100, pas: 10, types: ['lire'] },
        { min: 0, max: 100, pas: 10, types: ['lire', 'placer'] },
        { min: 0, max: 1000, pas: 100, types: ['lire', 'placer'] },
        { min: 1000, max: 2000, pas: 100, types: ['lire', 'placer'] },
        { min: 0, max: 10000, pas: 1000, types: ['lire', 'placer'] },
        { min: 0, max: 1000, pas: 50, types: ['lire'] }
      ]
    },
    'nombres-moitie': {
      actif: false,
      libelle: 'La moitié',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Moitié : CP.',
      niveaux: []
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
        consigne: 'Change d’unité et calcule avec des longueurs.',
        source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
        notes: 'Unités : mm, cm, dm, m, km. Conversions simples par relations connues (pas de tableau, pas de virgule). Entiers <= 10 000.',
        niveaux: [
          { exos: [
            { type: 'convertir', grandeur: 'longueur', paires: [['m', 'cm'], ['m', 'dm']], min: 1, max: 9 },
            { type: 'convertir', grandeur: 'longueur', paires: [['cm', 'm']], min: 100, max: 900 },
            { type: 'convertir', grandeur: 'longueur', paires: [['dm', 'm']], min: 10, max: 90 }
          ] },
          { exos: [
            { type: 'convertir', grandeur: 'longueur', paires: [['km', 'm']], min: 1, max: 9 },
            { type: 'convertir', grandeur: 'longueur', paires: [['m', 'km']], min: 1000, max: 9000 },
            { type: 'convertir', grandeur: 'longueur', paires: [['cm', 'mm']], min: 1, max: 99 }
          ] },
          { exos: [
            { type: 'mixte', grandeur: 'longueur', paire: ['m', 'cm'], min: 1, max: 9, pas: 5 },
            { type: 'mixte', grandeur: 'longueur', paire: ['km', 'm'], min: 1, max: 9, pas: 100 },
            { type: 'mixte', grandeur: 'longueur', paire: ['cm', 'mm'], min: 1, max: 20, pas: 1 }
          ] },
          { exos: [
            { type: 'choisir-unite', grandeur: 'longueur', unites: ['mm', 'cm', 'm', 'km'], nbChoix: 4 },
            { type: 'comparer', grandeur: 'longueur', paires: [['m', 'cm'], ['km', 'm']], min: 1, max: 9, deux: true }
          ] },
          { exos: [
            { type: 'probleme', grandeur: 'longueur', op: 'add', unite: 'm', min: 1, max: 1000 },
            { type: 'probleme', grandeur: 'longueur', op: 'sub', unite: 'm', min: 1, max: 5000 },
            { type: 'probleme', grandeur: 'longueur', op: 'mul', unite: 'm', min: 2, max: 100, n: [2, 9] },
            { type: 'probleme', grandeur: 'longueur', op: 'div', unite: 'm', min: 2, max: 500, n: [2, 9] }
          ] },
          { exos: [
            { type: 'convertir', grandeur: 'longueur', paires: [['m', 'mm'], ['dm', 'mm']], min: 1, max: 9 },
            { type: 'convertir', grandeur: 'longueur', paires: [['mm', 'cm']], min: 10, max: 990 },
            { type: 'mixte', grandeur: 'longueur', paire: ['m', 'cm'], min: 1, max: 99, pas: 1 }
          ] }
        ]
      },
      'masses-contenances': {
        actif: true,
        libelle: 'Masses et contenances',
        consigne: 'Change d’unité et calcule avec des masses et des litres.',
        source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
        notes: 'Masses : g, kg, t. Contenances : L et ses sous-multiples (dL, cL, mL). Conversions simples, entiers <= 10 000.',
        niveaux: [
          { exos: [
            { type: 'convertir', grandeur: 'masse', paires: [['kg', 'g']], min: 1, max: 9 },
            { type: 'convertir', grandeur: 'masse', paires: [['g', 'kg']], min: 1000, max: 9000 }
          ] },
          { exos: [
            { type: 'convertir', grandeur: 'contenance', paires: [['L', 'cL'], ['L', 'dL'], ['dL', 'cL']], min: 1, max: 9 },
            { type: 'convertir', grandeur: 'contenance', paires: [['cL', 'L']], min: 100, max: 900 }
          ] },
          { exos: [
            { type: 'mixte', grandeur: 'masse', paire: ['kg', 'g'], min: 1, max: 9, pas: 100 },
            { type: 'mixte', grandeur: 'contenance', paire: ['L', 'cL'], min: 1, max: 9, pas: 10 },
            { type: 'mixte', grandeur: 'contenance', paire: ['L', 'dL'], min: 1, max: 9, pas: 1 }
          ] },
          { exos: [
            { type: 'choisir-unite', grandeur: 'masse', unites: ['g', 'kg', 't'] },
            { type: 'choisir-unite', grandeur: 'contenance', unites: ['mL', 'cL', 'L'] }
          ] },
          { exos: [
            { type: 'probleme', grandeur: 'masse', op: 'add', unite: 'kg', min: 1, max: 1000 },
            { type: 'probleme', grandeur: 'masse', op: 'mul', unite: 'g', min: 5, max: 200, n: [2, 9] },
            { type: 'probleme', grandeur: 'contenance', op: 'sub', unite: 'L', min: 1, max: 1000 },
            { type: 'probleme', grandeur: 'contenance', op: 'div', unite: 'L', min: 2, max: 500, n: [2, 9] }
          ] },
          { exos: [
            { type: 'convertir', grandeur: 'masse', paires: [['t', 'kg']], min: 1, max: 9 },
            { type: 'convertir', grandeur: 'contenance', paires: [['L', 'mL']], min: 1, max: 9 },
            { type: 'comparer', grandeur: 'masse', paires: [['kg', 'g']], min: 1, max: 9, deux: true },
            { type: 'comparer', grandeur: 'contenance', paires: [['L', 'cL']], min: 1, max: 9, deux: true }
          ] }
        ]
      },
      'durees-monnaie': {
        actif: true,
        libelle: 'Durées et monnaie',
        consigne: 'Calcule des durées et rends la monnaie.',
        source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
        notes: 'Durées : h, min, s, jours, semaines, mois, ans. Monnaie : montants <= 100 € avec centimes. Les décimaux formels sont du cycle 3 : les résultats à virgule se limitent à la monnaie (à valider).',
        niveaux: [
          { exos: [
            { type: 'duree-ecart', mode: 'minutes', croise: false },
            { type: 'monnaie-somme', unite: '€', valeurs: [1, 2, 5, 10, 20, 50], nbMax: 3, nbTypes: 3 }
          ] },
          { exos: [
            { type: 'duree-ecart', mode: 'minutes', croise: true },
            { type: 'monnaie-rendu', paye: [10, 20, 50], prixMax: 49 }
          ] },
          { exos: [
            { type: 'convertir', grandeur: 'duree', paires: [['h', 'min']], min: 1, max: 9 },
            { type: 'convertir', grandeur: 'duree', paires: [['min', 'h']], min: 60, max: 540 },
            { type: 'convertir', grandeur: 'duree', paires: [['jour', 'h']], min: 1, max: 7 },
            { type: 'convertir', grandeur: 'duree', paires: [['semaine', 'jour']], min: 1, max: 9 },
            { type: 'convertir', grandeur: 'calendrier', paires: [['an', 'mois']], min: 1, max: 9 }
          ] },
          { exos: [
            { type: 'monnaie-somme', unite: 'cts', valeurs: [5, 10, 20, 50], nbMax: 3, nbTypes: 3 },
            { type: 'monnaie-rendu', paye: [5, 10, 20], prixMax: 19, centimes: true }
          ] },
          { exos: [
            { type: 'probleme', grandeur: 'duree', op: 'add', unite: 'min', min: 5, max: 90 },
            { type: 'probleme', grandeur: 'duree', op: 'sub', unite: 'min', min: 5, max: 120 },
            { type: 'probleme', grandeur: 'monnaie', op: 'mul', unite: '€', min: 2, max: 50, n: [2, 9] },
            { type: 'probleme', grandeur: 'monnaie', op: 'div', unite: '€', min: 2, max: 50, n: [2, 9] }
          ] },
          { exos: [
            { type: 'convertir', grandeur: 'monnaie', paires: [['€', 'cts']], min: 1, max: 99 },
            { type: 'convertir', grandeur: 'monnaie', paires: [['cts', '€']], min: 100, max: 900 },
            { type: 'convertir', grandeur: 'duree', paires: [['min', 's']], min: 1, max: 9 },
            { type: 'duree-ecart', mode: 'minutes', croise: true }
          ] }
        ]
      },
      'perimetres-aires': {
        actif: true,
        libelle: 'Périmètres',
        consigne: 'Calcule le tour des figures.',
        source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
        notes: 'Périmètres du carré, du rectangle, du triangle et du losange (somme des côtés). Non cité explicitement dans la recherche CE2 (docs/programmes/ce2.md) : demande du porteur du projet, À VALIDER. Les aires commencent en CM1.',
        niveaux: [
          { exos: [
            { type: 'perimetre', figures: ['carre'], unites: ['cm'], min: 1, max: 10 }
          ] },
          { exos: [
            { type: 'perimetre', figures: ['carre', 'rectangle'], unites: ['cm'], min: 1, max: 15 }
          ] },
          { exos: [
            { type: 'perimetre', figures: ['carre', 'rectangle', 'triangle', 'losange'], unites: ['cm'], min: 1, max: 20 }
          ] },
          { exos: [
            { type: 'perimetre', figures: ['carre', 'rectangle'], unites: ['cm', 'm'], min: 2, max: 50, inverse: 0.5 }
          ] },
          { exos: [
            { type: 'perimetre', figures: ['carre', 'rectangle', 'triangle', 'losange'], unites: ['cm', 'm'], min: 2, max: 100, inverse: 0.4 }
          ] },
          { exos: [
            { type: 'perimetre', figures: ['carre', 'rectangle', 'triangle'], unites: ['m'], min: 5, max: 500, inverse: 0.4 }
          ] }
        ]
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
      'trouver-le-chiffre': true, 'eclair': true, 'compte-magique': true, 'suites-magiques': true, 'ranger': true, 'memory-nombres': true, 'horloge': true, 'marche': true, 'fractions': true
    }
  };
})();
