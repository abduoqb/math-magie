// Programme CE1 (cycle 2). Source de verite pedagogique : docs/programmes/ce1.md
// Domaine numerique : entiers <= 1000. Decimaux uniquement en contexte monetaire (donc 0 ici).
// Les 10 paliers sont une proposition de conception (non officielle), bornes par le programme.
window.PROGRAMMES = window.PROGRAMMES || {};
window.PROGRAMMES.ce1 = {
  id: 'ce1',
  libelle: 'CE1',
  cycle: 2,
  source: [
    'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
    'https://eduscol.education.fr/document/13948/download',
    'https://eduscol.education.gouv.fr/sites/default/files/document/20-maths-c2-reperes-eduscol1114750pdf-74640.pdf'
  ],
  calcul: {
    additions: {
      actif: true,
      libelle: 'Additions',
      consigne: 'Calcule la somme.',
      source: 'https://eduscol.education.gouv.fr/document/13948/download',
      notes: 'min/max = bornes du RESULTAT (convention du moteur pour cp, ce1, ce2, cm2) ; sommes <= 500. Palier 1 sans retenue, palier 2 = tables d\'addition avec franchissement de la dizaine. Les cas "dizaines entieres" (64 + 60) ne sont pas exprimables avec min/max seul.',
      niveaux: [
        { min: 1,   max: 10,  retenue: false, termes: 2, decimaux: 0 },
        { min: 1,   max: 10,  retenue: true,  termes: 2, decimaux: 0 },
        { min: 5,   max: 50,  retenue: false, termes: 2, decimaux: 0 },
        { min: 10,  max: 99,  retenue: true,  termes: 2, decimaux: 0 },
        { min: 10,  max: 150, retenue: true,  termes: 2, decimaux: 0 },
        { min: 10,  max: 300, retenue: false, termes: 2, decimaux: 0 },
        { min: 10,  max: 400, retenue: true,  termes: 2, decimaux: 0 },
        { min: 50,  max: 500, retenue: true,  termes: 2, decimaux: 0 },
        { min: 100, max: 500, retenue: true,  termes: 2, decimaux: 0 },
        { min: 7,   max: 330, retenue: true,  termes: 3, decimaux: 0 }
      ]
    },
    soustractions: {
      actif: true,
      libelle: 'Soustractions',
      consigne: 'Calcule la différence.',
      source: 'https://eduscol.education.fr/document/13948/download',
      notes: 'min/max = bornes du minuende (le moteur doit garantir un resultat >= 0). retenue = franchissement de la dizaine/centaine. Minuende <= 1000.',
      niveaux: [
        { min: 1,  max: 10,   retenue: false, termes: 2, decimaux: 0 },
        { min: 5,  max: 20,   retenue: true,  termes: 2, decimaux: 0 },
        { min: 10, max: 50,   retenue: false, termes: 2, decimaux: 0 },
        { min: 10, max: 100,  retenue: true,  termes: 2, decimaux: 0 },
        { min: 10, max: 200,  retenue: false, termes: 2, decimaux: 0 },
        { min: 10, max: 400,  retenue: false, termes: 2, decimaux: 0 },
        { min: 10, max: 500,  retenue: false, termes: 2, decimaux: 0 },
        { min: 10, max: 500,  retenue: true,  termes: 2, decimaux: 0 },
        { min: 10, max: 700,  retenue: true,  termes: 2, decimaux: 0 },
        { min: 10, max: 1000, retenue: true,  termes: 2, decimaux: 0 }
      ]
    },
    multiplications: {
      actif: true,
      libelle: 'Multiplications',
      consigne: 'Calcule le produit.',
      source: 'https://eduscol.education.gouv.fr/sites/default/files/document/20-maths-c2-reperes-eduscol1114750pdf-74640.pdf',
      notes: 'Tables 2, 3, 4, 5 uniquement (6 a 10 = CE2) ; facteur "a" = table. Palier 6 = x10 d\'un nombre < 100 (seul cas ou a=10). Paliers 7-10 : table 2-5 x nombre jusqu\'a 200, produit <= 1000. Je reste en dessous du programme (pas de x9 x 99).',
      niveaux: [
        { a: [2, 2],  b: [1, 10],   decimaux: 0 },
        { a: [5, 5],  b: [1, 10],   decimaux: 0 },
        { a: [3, 3],  b: [1, 10],   decimaux: 0 },
        { a: [4, 4],  b: [1, 10],   decimaux: 0 },
        { a: [2, 5],  b: [0, 10],   decimaux: 0 },
        { a: [10, 10], b: [2, 99],  decimaux: 0 },
        { a: [2, 5],  b: [10, 40],  decimaux: 0 },
        { a: [2, 5],  b: [10, 99],  decimaux: 0 },
        { a: [2, 5],  b: [100, 200], decimaux: 0 },
        { a: [2, 5],  b: [10, 200], decimaux: 0 }
      ]
    },
    divisions: {
      actif: false,
      libelle: 'Divisions',
      consigne: 'Combien de fois ? Partage en parts égales.',
      source: 'https://eduscol.education.gouv.fr/sites/default/files/document/20-maths-c2-reperes-eduscol1114750pdf-74640.pdf',
      notes: 'A VALIDER : au CE1 le symbole ÷ et la division en tant qu\'operation ne sont pas au programme (CE2) ; seuls les problemes de partage/groupement le sont, et le moteur affiche "a ÷ b". Inactif par prudence ; paliers fournis (divisions exactes, sans reste) au cas ou la mission serait reactivee sous forme de problemes de partage.',
      niveaux: [
        { diviseur: [2, 2],  quotient: [1, 5],   reste: false, decimaux: 0 },
        { diviseur: [2, 2],  quotient: [1, 10],  reste: false, decimaux: 0 },
        { diviseur: [2, 5],  quotient: [1, 6],   reste: false, decimaux: 0 },
        { diviseur: [3, 4],  quotient: [1, 10],  reste: false, decimaux: 0 },
        { diviseur: [4, 5],  quotient: [1, 10],  reste: false, decimaux: 0 },
        { diviseur: [10, 10], quotient: [1, 10], reste: false, decimaux: 0 },
        { diviseur: [2, 5],  quotient: [1, 20],  reste: false, decimaux: 0 },
        { diviseur: [2, 10], quotient: [1, 10],  reste: false, decimaux: 0 },
        { diviseur: [2, 10], quotient: [1, 50],  reste: false, decimaux: 0 },
        { diviseur: [2, 10], quotient: [1, 100], reste: false, decimaux: 0 }
      ]
    }
  },
  geometrie: {
    'geometrie-formes': {
      actif: true,
      libelle: 'Formes',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Exclus (hors CE1) : Losange, Hexagone, Pentagone. "Sphere" = boule au programme.',
      contenu: {
        formes: ['Carré', 'Triangle', 'Rectangle', 'Cercle'],
        solides: ['Cube', 'Sphère', 'Pavé droit', 'Cylindre', 'Cône', 'Pyramide']
      }
    },
    'geometrie-proprietes': {
      actif: true,
      libelle: 'Sommets, côtés, faces',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Vocabulaire sommet/cote/face/arete au programme CE1. Exclus : Pentagone, Hexagone, Octogone, Etoile. Le comptage d\'aretes d\'une pyramide est a valider (peut etre juge difficile).',
      contenu: {
        figures2d: ['Triangle', 'Carré', 'Rectangle'],
        questions2d: ['sommets', 'côtés'],
        solides: ['Cube', 'Pavé droit', 'Pyramide'],
        questions3d: ['sommets', 'faces', 'arêtes']
      }
    },
    'geometrie-angles': {
      actif: false,
      libelle: 'Angles',
      source: 'https://eduscol.education.fr/document/13948/download',
      notes: 'Au CE1 seul l\'angle droit est vu (equerre) ; aigu/obtus/plat/nul sont hors programme. Un quiz a un seul type n\'a pas de sens avec le moteur actuel (QCM de types) : inactif. Pourrait devenir "droit / pas droit" si le moteur le permet.',
      contenu: { types: ['Droit'] }
    },
    'geometrie-symetrie': {
      actif: true,
      libelle: 'Symétrie',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Reconnaitre un axe de symetrie (pliage, calque) au programme CE1. Limiter aux formes simples du moteur (niveaux 1-2 : 3 a 6 points, erreurs visibles) ; pas de niveau 3 (formes complexes, erreurs subtiles).',
      contenu: { niveauMoteurMax: 2, nbPoints: [3, 6] }
    },
    'geometrie-vraifaux': {
      actif: true,
      libelle: 'Vrai ou faux',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Memes figures que formes. Exclus : Losange, Hexagone, Pentagone. Verifier que les affirmations ne parlent que de cotes, sommets, angles droits, polygone, faces (vocabulaire CE1).',
      contenu: {
        figures: ['Carré', 'Triangle', 'Cercle', 'Rectangle'],
        solides: ['Cube', 'Sphère', 'Pavé droit', 'Cylindre', 'Cône']
      }
    },
    'geometrie-droites': {
      actif: false,
      libelle: 'Droites',
      source: 'https://eduscol.education.gouv.fr/sites/default/files/document/20-maths-c2-reperes-eduscol1114750pdf-74640.pdf',
      notes: 'Parallelisme/perpendicularite non cites dans le fichier de recherche CE1 (alignement et angle droit seulement) : inactif par prudence.',
      contenu: { types: ['Perpendiculaires'] }
    },
    'geometrie-triangles': {
      actif: false,
      libelle: 'Triangles',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Seul le triangle rectangle est cite au CE1 ; equilateral/isocele/quelconque : hors programme (cycle 3 / CE2).',
      contenu: { types: ['Rectangle'] }
    },
    'geometrie-quadrilateres': {
      actif: false,
      libelle: 'Quadrilatères',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Losange, trapeze, parallelogramme, cerf-volant hors programme CE1 ; carre et rectangle sont deja couverts par geometrie-formes.',
      contenu: { types: [] }
    },
    'geometrie-patrons': {
      actif: false,
      libelle: 'Patrons',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Seule une "approche du patron du cube" est citee ; le moteur demande >= 2 solides et ses patrons de pyramide/cylindre/pave sont hors CE1. A valider si on veut un mini-mode Cube / Pave droit.',
      contenu: { solides: ['Cube'] }
    }
  },
  jeux: {
    morpion: true,
    puissance4: true,
    pendu: true,
    'trouver-le-chiffre': true, 'eclair': true, 'compte-magique': true, 'suites-magiques': true, 'ranger': true, 'memory-nombres': true, 'horloge': true, 'marche': true, 'fractions': true
  }
};
