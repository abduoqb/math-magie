/* Programme CM2 (cycle 3, rentrée 2026). Données uniquement, lues par les moteurs.
 * Recherche : docs/programmes/cm2.md. Texte officiel du BO non lu (403) : voir `notes`.
 * Convention : pour les nombres, min/max (ou a/b) bornent la valeur de l'opérande
 * (décimal compris). `decimaux` = nombre de décimales de l'opérande principal
 * (a pour multiplications, dividende/quotient pour divisions). */
window.PROGRAMMES = window.PROGRAMMES || {};
window.PROGRAMMES.cm2 = {
  id: 'cm2', libelle: 'CM2', cycle: 3,
  source: 'https://www.education.gouv.fr/bo/2025/Hebdo16/MENE2504620A',
  sourcesSecondaires: [
    'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
    'https://mathlvl.fr/programme-maths-cm2-2026'
  ],
  notes: "BO n°16 du 17/04/2025, applicable en CM2 à la rentrée 2026. Paliers = proposition du site (aucun palier officiel). Choix prudent : entiers plafonnés à 999 999 (le domaine va jusqu'à 999 999 999 mais les opérations posées sur 7-9 chiffres sont marquées (*) hors programme explicite).",
  calcul: {
    additions: {
      actif: true, libelle: 'Additions', consigne: 'Calcule la somme.',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      notes: 'Addition posée non citée dans les résumés (supposée acquise du CM1). Paliers 6-7 (*) de la recherche (7 à 8 chiffres) volontairement remplacés par 3 termes et décimaux.',
      niveaux: [
        { min: 10,    max: 99,     retenue: false, termes: 2, decimaux: 0 },
        { min: 100,   max: 999,    retenue: false, termes: 2, decimaux: 0 },
        { min: 100,   max: 9999,   retenue: true,  termes: 2, decimaux: 0 },
        { min: 1000,  max: 99999,  retenue: true,  termes: 2, decimaux: 0 },
        { min: 10000, max: 999999, retenue: true,  termes: 2, decimaux: 0 },
        { min: 100,   max: 99999,  retenue: true,  termes: 3, decimaux: 0 },
        { min: 1,     max: 999,    retenue: true,  termes: 2, decimaux: 1 },
        { min: 1,     max: 999,    retenue: true,  termes: 2, decimaux: 2 },
        { min: 1,     max: 999,    retenue: true,  termes: 3, decimaux: 2 },
        { min: 1,     max: 99999,  retenue: true,  termes: 2, decimaux: 3 }
      ]
    },
    soustractions: {
      actif: true, libelle: 'Soustractions', consigne: 'Calcule la différence.',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      notes: 'Soustraction posée non citée dans les résumés (acquise du CM1). Résultat toujours positif. Paliers (*) 7-8 chiffres évités.',
      niveaux: [
        { min: 10,    max: 99,     retenue: false, termes: 2, decimaux: 0 },
        { min: 100,   max: 999,    retenue: false, termes: 2, decimaux: 0 },
        { min: 100,   max: 9999,   retenue: true,  termes: 2, decimaux: 0 },
        { min: 1000,  max: 99999,  retenue: true,  termes: 2, decimaux: 0 },
        { min: 10000, max: 999999, retenue: true,  termes: 2, decimaux: 0 },
        { min: 1,     max: 99,     retenue: true,  termes: 2, decimaux: 1 },
        { min: 1,     max: 999,    retenue: true,  termes: 2, decimaux: 1 },
        { min: 1,     max: 999,    retenue: true,  termes: 2, decimaux: 2 },
        { min: 1,     max: 9999,   retenue: true,  termes: 2, decimaux: 2 },
        { min: 1,     max: 99999,  retenue: true,  termes: 2, decimaux: 3 }
      ]
    },
    multiplications: {
      actif: true, libelle: 'Multiplications', consigne: 'Calcule le produit.',
      source: 'https://mathlvl.fr/programme-maths-cm2-2026',
      notes: 'Vérifié : décimal x entier posé, x5/x50 en calcul mental. Paliers 5-6 (entier x entier à 2 chiffres) non explicites dans les résumés (acquis CM1), à valider. x50 non exprimable avec ce schéma (palier 4 = x5).',
      niveaux: [
        { a: [0, 10],    b: [2, 10],  decimaux: 0 },
        { a: [10, 99],   b: [2, 9],   decimaux: 0 },
        { a: [100, 999], b: [2, 9],   decimaux: 0 },
        { a: [10, 99],   b: [5, 5],   decimaux: 0 },
        { a: [10, 99],   b: [10, 99], decimaux: 0 },
        { a: [100, 999], b: [10, 99], decimaux: 0 },
        { a: [1, 99],    b: [2, 9],   decimaux: 1 },
        { a: [10, 999],  b: [2, 9],   decimaux: 1 },
        { a: [10, 999],  b: [2, 9],   decimaux: 2 },
        { a: [1, 99],    b: [2, 9],   decimaux: 3 }
      ]
    },
    divisions: {
      actif: true, libelle: 'Divisions', consigne: 'Calcule le quotient.',
      source: 'https://mathlvl.fr/programme-maths-cm2-2026',
      notes: "Vérifié : division décimale à diviseur d'un seul chiffre, dividende entier ou décimal. Diviseur à 2 chiffres exclu (non cité). Avec decimaux>0 : reste=false et quotient décimal exact (dividende = diviseur x quotient avec ces décimales).",
      niveaux: [
        { diviseur: [2, 9], quotient: [2, 10],        reste: false, decimaux: 0 },
        { diviseur: [2, 9], quotient: [10, 99],       reste: true,  decimaux: 0 },
        { diviseur: [2, 9], quotient: [100, 999],     reste: true,  decimaux: 0 },
        { diviseur: [2, 9], quotient: [1000, 9999],   reste: true,  decimaux: 0 },
        { diviseur: [2, 9], quotient: [10000, 99999], reste: true,  decimaux: 0 },
        { diviseur: [2, 9], quotient: [1, 99],        reste: false, decimaux: 1 },
        { diviseur: [2, 9], quotient: [10, 999],      reste: false, decimaux: 1 },
        { diviseur: [2, 9], quotient: [1, 99],        reste: false, decimaux: 2 },
        { diviseur: [2, 9], quotient: [10, 999],      reste: false, decimaux: 2 },
        { diviseur: [2, 9], quotient: [1, 99],        reste: false, decimaux: 3 }
      ]
    }
  },
  geometrie: {
    'geometrie-formes': {
      actif: true, libelle: 'Formes',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      contenu: { formes: ['Carré', 'Triangle', 'Rectangle', 'Cercle', 'Losange', 'Hexagone', 'Pentagone', 'Cube', 'Sphère', 'Pyramide', 'Cylindre', 'Pavé droit', 'Cône'], niveauMax: 3 }
    },
    'geometrie-proprietes': {
      actif: true, libelle: 'Propriétés des figures',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      contenu: { figures: ['Triangle', 'Carré', 'Rectangle', 'Pentagone', 'Hexagone', 'Octogone', 'Cube', 'Pavé droit', 'Pyramide'], proprietes: ['sommets', 'cotes', 'faces', 'aretes'], niveauMax: 3 },
      notes: 'Étoile exclue (non polygone convexe usuel).'
    },
    'geometrie-angles': {
      actif: true, libelle: 'Angles',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      contenu: { types: ['Aigu', 'Droit', 'Obtus', 'Plat'], niveauMax: 3 },
      notes: 'Angle nul exclu. Rapporteur hors programme CM2 (vérifié) : pas de mesure au rapporteur, seulement angle droit = 90° et comparaison.'
    },
    'geometrie-symetrie': {
      actif: true, libelle: 'Symétrie axiale',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      contenu: { axes: ['verticale'], niveauMax: 3 },
      notes: "Programme : axe vertical, horizontal ou diagonale du quadrillage ; le moteur actuel ne gère que l'axe vertical."
    },
    'geometrie-vraifaux': {
      actif: true, libelle: 'Vrai ou faux',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      contenu: { formes: ['Carré', 'Triangle', 'Cercle', 'Rectangle', 'Losange', 'Hexagone', 'Pentagone', 'Cube', 'Sphère', 'Pavé droit', 'Cylindre', 'Cône'], niveauMax: 3 }
    },
    'geometrie-droites': {
      actif: true, libelle: 'Droites',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      contenu: { types: ['Parallèles', 'Perpendiculaires', 'Sécantes'], niveauMax: 3 },
      notes: "Parallèles/perpendiculaires non confirmés dans les résumés du nouveau programme (présents dans l'ancien cycle 3) : à valider."
    },
    'geometrie-triangles': {
      actif: true, libelle: 'Triangles',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      contenu: { types: ['Équilatéral', 'Isocèle', 'Rectangle', 'Quelconque'], niveauMax: 3 }
    },
    'geometrie-quadrilateres': {
      actif: true, libelle: 'Quadrilatères',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      contenu: { types: ['Losange', 'Parallélogramme', 'Trapèze', 'Rectangle'], niveauMax: 3 },
      notes: "Cerf-volant exclu (non cité). Trapèze vérifié ; parallélogramme issu de l'ancien cycle 3, à valider."
    },
    'geometrie-patrons': {
      actif: true, libelle: 'Patrons',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      contenu: { solides: ['Cube', 'Pavé droit', 'Pyramide', 'Cylindre'], niveauMax: 3 },
      notes: 'Vérifié : patrons du cube et du pavé droit. Pyramide et cylindre : à valider. Prisme triangulaire et tétraèdre exclus.'
    }
  },
  jeux: { morpion: true, puissance4: true, pendu: true, 'trouver-le-chiffre': true, 'eclair': true, 'compte-magique': true, 'suites-magiques': true, 'ranger': true, 'memory-nombres': true, 'horloge': true, 'marche': true, 'fractions': true }
};
