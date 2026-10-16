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
        contenu: { axe: 'vertical' }
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
      }
    },

    jeux: {
      morpion: true,
      puissance4: true,
      pendu: true,
      'trouver-le-chiffre': true, 'eclair': true, 'compte-magique': true, 'suites-magiques': true, 'ranger': true, 'memory-nombres': true, 'horloge': true, 'marche': true, 'fractions': true
    }
  };
})();
