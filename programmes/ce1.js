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
      actif: true,
      libelle: 'Angles',
      source: 'https://eduscol.education.fr/document/13948/download',
      notes: 'Au CE1 seul l\'angle droit est vu (equerre) ; aigu/obtus/plat/nul sont hors programme. Active : le moteur propose "est-ce un angle droit ?" (Oui/Non) avec une equerre dessinee, jamais les autres noms d\'angles.',
      contenu: { types: ['Droit'], niveauMax: 2 }
    },
    'geometrie-symetrie': {
      actif: true,
      libelle: 'Symétrie',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Reconnaitre un axe de symetrie (pliage, calque) au programme CE1. Limiter aux formes simples du moteur (niveaux 1-2 : 3 a 6 points, erreurs visibles) ; pas de niveau 3 (formes complexes, erreurs subtiles).',
      contenu: { niveauMoteurMax: 2, nbPoints: [3, 6], quadrillage: true }
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
      actif: true,
      libelle: 'Patron du cube',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Seule une "approche du patron du cube" est citee : mode Oui/Non "ce patron plie-t-il en cube ?" (assemblages de 6 carres, reponse calculee par simulation de pliage). Patrons de pyramide/cylindre/pave : hors CE1.',
      contenu: { mode: 'patron-cube', solides: ['Cube'], niveauMax: 2 }
    },
    'geometrie-espace': {
      actif: true,
      libelle: 'Repérage sur quadrillage',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Vocabulaire spatial + suite de deplacements sur un quadrillage (droite/gauche/haut/bas). Coordonnees (x ; y) : CE2.',
      contenu: { themes: ['position', 'quadrillage-case', 'deplacement'], niveauMax: 2 }
    },
    'geometrie-solides': {
      actif: true,
      libelle: 'Les solides',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Faces du cube (carres), du pave (rectangles), de la pyramide (triangles). "Roule / ne roule pas" : activite classique du cycle 2 (a valider). Descriptions par enigmes : CE2.',
      contenu: { themes: ['roule', 'faces-forme'], solides: ['Cube', 'Sphère', 'Pavé droit', 'Cylindre', 'Cône', 'Pyramide'], niveauMax: 2 }
    },
    'geometrie-cercle': {
      actif: true,
      libelle: 'Le cercle',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Cercle, centre, rayon, compas pour tracer un cercle. Diametre : CE2.',
      contenu: { themes: ['vocabulaire', 'compas'], vocab: ['centre', 'rayon'], niveauMax: 1 }
    },
    'geometrie-instruments': {
      actif: true,
      libelle: 'Règle, équerre, compas',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Regle graduee (cm), equerre (angles droits), compas (cercle). Rapporteur : CM2.',
      contenu: { themes: ['choix-instrument', 'regle-lecture'], instruments: ['règle', 'équerre', 'compas'], niveauMax: 3 }
    }
  },
  nombres: {
    // Module Nombres : ids prefixes 'nombres-'. Paliers lus par nombres/js/generateur_nombres.js.
    // Nombres jusqu'à 1 000. Les paliers sont une proposition de conception (non officielle).
    'nombres-valeur': {
      actif: true,
      libelle: 'Valeur des chiffres',
      consigne: 'Centaines, dizaines, unités : trouve la valeur.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Nombres jusqu\'à 1 000 : centaines, dizaines, unités.',
      niveaux: [
        { min: 100, max: 300, types: ['chiffre'] },
        { min: 100, max: 999, types: ['chiffre'] },
        { min: 100, max: 999, types: ['chiffre', 'valeur'] },
        { min: 100, max: 999, types: ['valeur', 'combien'] },
        { min: 100, max: 999, types: ['chiffre', 'valeur', 'combien'] },
        { min: 100, max: 999, types: ['valeur', 'combien'] }
      ]
    },
    'nombres-decomposer': {
      actif: true,
      libelle: 'Décomposer',
      consigne: 'Décompose en centaines, dizaines et unités.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Décomposer un nombre jusqu\'à 1 000.',
      niveaux: [
        { min: 100, max: 300, types: ['rangs'] },
        { min: 100, max: 999, types: ['rangs'] },
        { min: 100, max: 999, types: ['somme'] },
        { min: 100, max: 999, types: ['retrouver', 'somme'] },
        { min: 100, max: 999, types: ['rangs', 'somme', 'retrouver'] },
        { min: 100, max: 999, types: ['rangs', 'somme', 'retrouver'] }
      ]
    },
    'nombres-comparer': {
      actif: true,
      libelle: 'Comparer',
      consigne: 'Compare les nombres.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Comparer jusqu\'à 1 000.',
      niveaux: [
        { min: 0, max: 200, types: ['symbole'] },
        { min: 0, max: 999, types: ['symbole', 'plusgrand'] },
        { min: 0, max: 999, types: ['symbole', 'plusgrand', 'pluspetit'] },
        { min: 100, max: 999, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true },
        { min: 100, max: 999, types: ['symbole', 'pluspetit'], proche: true, nb: 4 },
        { min: 100, max: 999, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true, nb: 4 }
      ]
    },
    'nombres-ranger': {
      actif: true,
      libelle: 'Ranger',
      consigne: 'Range les nombres dans l\'ordre.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Ranger jusqu\'à 1 000.',
      niveaux: [
        { min: 0, max: 200, nb: 3, sens: ['croissant'] },
        { min: 0, max: 999, nb: 3, sens: ['croissant', 'decroissant'] },
        { min: 0, max: 999, nb: 4, sens: ['croissant', 'decroissant'] },
        { min: 100, max: 999, nb: 4, sens: ['croissant', 'decroissant'], proche: true },
        { min: 100, max: 999, nb: 5, sens: ['croissant', 'decroissant'] },
        { min: 100, max: 999, nb: 5, sens: ['croissant', 'decroissant'], proche: true }
      ]
    },
    'nombres-encadrer': {
      actif: true,
      libelle: 'Encadrer',
      consigne: 'Encadre le nombre.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Encadrer entre deux dizaines ou deux centaines consécutives.',
      niveaux: [
        { min: 20, max: 99, e: [1], types: ['pair'] },
        { min: 100, max: 999, e: [1], types: ['pair', 'inf', 'sup'] },
        { min: 100, max: 999, e: [2], types: ['pair'] },
        { min: 100, max: 999, e: [1, 2], types: ['pair', 'inf', 'sup'] },
        { min: 100, max: 999, e: [1, 2], types: ['pair', 'inf', 'sup'] },
        { min: 100, max: 999, e: [1, 2], types: ['pair', 'inf', 'sup'] }
      ]
    },
    'nombres-droite': {
      actif: false,
      libelle: 'Droite graduée',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Droite graduée : à partir du CE2 dans ce module.',
      niveaux: []
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
      consigne: 'Mesure, compare et change d’unité.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Unités : cm, dm, m, km (dm et km introduits au CE1, voir docs/programmes/ce1.md). Pas de mm. Entiers <= 1000.',
      niveaux: [
        { exos: [
          { type: 'comparer', grandeur: 'longueur', unites: ['cm'], min: 1, max: 100, deux: true },
          { type: 'choisir-unite', grandeur: 'longueur', unites: ['cm', 'm'], nbChoix: 2 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'longueur', paires: [['m', 'cm']], min: 1, max: 9 },
          { type: 'probleme', grandeur: 'longueur', op: 'add', unite: 'm', min: 1, max: 500 },
          { type: 'probleme', grandeur: 'longueur', op: 'sub', unite: 'm', min: 1, max: 1000 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'longueur', paires: [['m', 'dm'], ['dm', 'cm']], min: 1, max: 99 },
          { type: 'comparer', grandeur: 'longueur', paires: [['m', 'cm']], min: 1, max: 9 }
        ] },
        { exos: [
          { type: 'mixte', grandeur: 'longueur', paire: ['m', 'cm'], min: 1, max: 9, pas: 10 },
          { type: 'convertir', grandeur: 'longueur', paires: [['km', 'm']], min: 1, max: 1 },
          { type: 'choisir-unite', grandeur: 'longueur', unites: ['cm', 'm', 'km'] }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'longueur', op: 'mul', unite: 'm', min: 2, max: 100, n: [2, 5] },
          { type: 'probleme', grandeur: 'longueur', op: 'div', unite: 'm', min: 2, max: 100, n: [2, 5] },
          { type: 'convertir', grandeur: 'longueur', paires: [['dm', 'm']], min: 10, max: 90 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'longueur', paires: [['cm', 'm']], min: 100, max: 900 },
          { type: 'comparer', grandeur: 'longueur', paires: [['m', 'cm']], min: 1, max: 9, deux: true },
          { type: 'choisir-unite', grandeur: 'longueur', unites: ['cm', 'dm', 'm', 'km'] }
        ] }
      ]
    },
    'masses-contenances': {
      actif: true,
      libelle: 'Masses et contenances',
      consigne: 'Pèse, compare et mesure avec des litres.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Masses : g et kg (3 kg = 3 000 g, quelques valeurs au-delà de 1000). Contenances : litre uniquement (cL et dL sont au CE2).',
      niveaux: [
        { exos: [
          { type: 'comparer', grandeur: 'masse', unites: ['kg'], min: 1, max: 50, deux: true },
          { type: 'comparer', grandeur: 'contenance', unites: ['L'], min: 1, max: 50, deux: true }
        ] },
        { exos: [
          { type: 'choisir-unite', grandeur: 'masse', unites: ['g', 'kg'], nbChoix: 2 },
          { type: 'probleme', grandeur: 'masse', op: 'add', unite: 'kg', min: 1, max: 50 },
          { type: 'probleme', grandeur: 'contenance', op: 'add', unite: 'L', min: 1, max: 50 }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'masse', op: 'add', unite: 'g', min: 10, max: 500 },
          { type: 'probleme', grandeur: 'masse', op: 'sub', unite: 'g', min: 10, max: 1000 },
          { type: 'probleme', grandeur: 'contenance', op: 'sub', unite: 'L', min: 1, max: 100 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'masse', paires: [['kg', 'g']], min: 1, max: 5 },
          { type: 'probleme', grandeur: 'masse', op: 'mul', unite: 'kg', min: 2, max: 50, n: [2, 5] },
          { type: 'probleme', grandeur: 'contenance', op: 'mul', unite: 'L', min: 2, max: 50, n: [2, 5] }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'masse', op: 'div', unite: 'kg', min: 2, max: 100, n: [2, 5] },
          { type: 'probleme', grandeur: 'contenance', op: 'div', unite: 'L', min: 2, max: 100, n: [2, 5] },
          { type: 'convertir', grandeur: 'masse', paires: [['g', 'kg']], min: 1000, max: 5000 }
        ] },
        { exos: [
          { type: 'mixte', grandeur: 'masse', paire: ['kg', 'g'], min: 1, max: 4, pas: 100 },
          { type: 'convertir', grandeur: 'masse', paires: [['kg', 'g']], min: 1, max: 5 },
          { type: 'choisir-unite', grandeur: 'masse', unites: ['g', 'kg'], nbChoix: 2 }
        ] }
      ]
    },
    'durees-monnaie': {
      actif: true,
      libelle: 'Durées et monnaie',
      consigne: 'Calcule des durées et des sommes d’argent.',
      source: 'https://www.education.gouv.fr/sites/default/files/ensel135_annexe4.pdf',
      notes: 'Heures entières, 60 min = 1 h, 24 h = 1 jour, 7 jours = 1 semaine, 12 mois = 1 an. Monnaie en euros entiers (centimes seulement en conversion). Heures sur horloge : voir le jeu Horloge.',
      niveaux: [
        { exos: [
          { type: 'duree-ecart', mode: 'heures', maxH: 5 },
          { type: 'monnaie-somme', unite: '€', valeurs: [1, 2, 5, 10], nbMax: 2, nbTypes: 2 }
        ] },
        { exos: [
          { type: 'duree-ecart', mode: 'heure-future', maxH: 5 },
          { type: 'monnaie-rendu', paye: [5, 10], prixMax: 9 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'duree', paires: [['h', 'min']], min: 1, max: 1 },
          { type: 'convertir', grandeur: 'duree', paires: [['semaine', 'jour']], min: 1, max: 4 },
          { type: 'convertir', grandeur: 'duree', paires: [['jour', 'h']], min: 1, max: 3 },
          { type: 'convertir', grandeur: 'calendrier', paires: [['an', 'mois']], min: 1, max: 3 }
        ] },
        { exos: [
          { type: 'monnaie-somme', unite: '€', valeurs: [1, 2, 5, 10, 20], nbMax: 3, nbTypes: 3 },
          { type: 'probleme', grandeur: 'duree', op: 'add', unite: 'h', min: 1, max: 6 }
        ] },
        { exos: [
          { type: 'monnaie-rendu', paye: [10, 20], prixMax: 19 },
          { type: 'probleme', grandeur: 'monnaie', op: 'sub', unite: '€', min: 5, max: 100 },
          { type: 'probleme', grandeur: 'duree', op: 'sub', unite: 'h', min: 1, max: 8 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'monnaie', paires: [['€', 'cts']], min: 1, max: 9 },
          { type: 'probleme', grandeur: 'monnaie', op: 'mul', unite: '€', min: 2, max: 50, n: [2, 5] },
          { type: 'monnaie-rendu', paye: [20, 50], prixMax: 49 }
        ] }
      ]
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
    'trouver-le-chiffre': true, 'eclair': true, 'compte-magique': true, 'suites-magiques': true, 'ranger': true, 'memory-nombres': true, 'horloge': true, 'marche': true, 'fractions': true
  }
};
