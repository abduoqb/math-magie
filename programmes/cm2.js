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
      notes: 'Angle nul exclu. Ici : types d angles. La mesure au rapporteur est dans la mission geometrie-rapporteur (la recherche docs/programmes/cm2.md la disait hors programme : a re-valider).'
    },
    'geometrie-symetrie': {
      actif: true, libelle: 'Symétrie axiale',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      contenu: { axes: ['vertical', 'horizontal', 'diagonal'], niveauMax: 3 },
      notes: "Programme : axe vertical, horizontal ou diagonale du quadrillage ; le moteur gere les trois (diagonale = figure pivotee de 45 degres)."
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
    },
    'geometrie-solides': {
      actif: true, libelle: 'Les solides',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      notes: 'Decrire cube, pave, pyramide, prisme droit, cylindre, cone, boule.',
      contenu: { themes: ['faces-forme', 'description', 'prisme'], solides: ['Cube', 'Pavé droit', 'Pyramide', 'Cylindre', 'Cône', 'Sphère', 'Prisme triangulaire'], niveauMax: 3 }
    },
    'geometrie-cercle': {
      actif: true, libelle: 'Cercle et compas',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      notes: 'Cercle, centre, rayon, diametre, corde ; definition par la distance au centre.',
      contenu: { themes: ['vocabulaire', 'compas', 'rayon-diametre', 'definition'], vocab: ['centre', 'rayon', 'diamètre', 'corde'], niveauMax: 3 }
    },
    'geometrie-instruments': {
      actif: true, libelle: 'Règle, équerre, compas, rapporteur',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      notes: 'Regle graduee, equerre, compas et rapporteur (choix de l instrument).',
      contenu: { themes: ['choix-instrument', 'regle-lecture'], instruments: ['règle', 'équerre', 'compas', 'rapporteur'], niveauMax: 3 }
    },
    'geometrie-rapporteur': {
      actif: true, libelle: 'Mesurer des angles',
      source: 'https://sos-cartables.fr/nouveaux-programmes-mathematiques-cm2/',
      notes: 'Mesure et trace d angles au rapporteur (demande produit CM2). ATTENTION : docs/programmes/cm2.md indique "rapporteur non au programme CM2 (verifie)" ; a re-valider.',
      contenu: { themes: ['estimation', 'classer', 'lecture', 'verifier-trace', 'complementaire'], niveauMax: 3 }
    }
  },
  nombres: {
    // Module Nombres : ids prefixes 'nombres-'. Paliers lus par nombres/js/generateur_nombres.js.
    // Nombres jusqu'aux milliards, équivalences de fractions, décimaux. Les paliers sont une proposition de conception (non officielle).
    'nombres-valeur': {
      actif: true,
      libelle: 'Valeur des chiffres',
      consigne: 'Trouve la valeur de chaque chiffre.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Entiers jusqu\'aux milliards (ici nombres de 9 chiffres).',
      niveaux: [
        { min: 100000, max: 999999, types: ['chiffre', 'valeur', 'combien'] },
        { min: 1000000, max: 9999999, types: ['chiffre', 'valeur', 'combien'] },
        { min: 10000000, max: 99999999, types: ['chiffre', 'valeur', 'combien'] },
        { min: 100000000, max: 999999999, types: ['chiffre', 'valeur'] },
        { min: 100000000, max: 999999999, types: ['valeur', 'combien'] },
        { min: 100000000, max: 999999999, types: ['chiffre', 'valeur', 'combien'] }
      ]
    },
    'nombres-decomposer': {
      actif: true,
      libelle: 'Décomposer',
      consigne: 'Décompose le nombre.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Grands nombres jusqu\'aux milliards.',
      niveaux: [
        { min: 100000, max: 999999, types: ['somme', 'retrouver'] },
        { min: 1000000, max: 9999999, types: ['paquets', 'somme'] },
        { min: 10000000, max: 99999999, types: ['paquets', 'somme'] },
        { min: 100000000, max: 999999999, types: ['paquets'] },
        { min: 1000000, max: 9999999, types: ['somme', 'retrouver', 'paquets'] },
        { min: 100000000, max: 999999999, types: ['paquets'] }
      ]
    },
    'nombres-comparer': {
      actif: true,
      libelle: 'Comparer',
      consigne: 'Compare les nombres.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Grands entiers puis décimaux (jusqu\'aux millièmes).',
      niveaux: [
        { min: 1000000, max: 999999999, types: ['symbole', 'plusgrand', 'pluspetit'] },
        { min: 1000000, max: 999999999, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true },
        { min: 0, max: 50, dec: 2, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true },
        { min: 0, max: 20, dec: 3, types: ['symbole', 'plusgrand', 'pluspetit'] },
        { min: 0, max: 20, dec: 3, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true, nb: 4 },
        { min: 100000000, max: 999999999, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true, nb: 4 }
      ]
    },
    'nombres-ranger': {
      actif: true,
      libelle: 'Ranger',
      consigne: 'Range les nombres dans l\'ordre.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Grands entiers et décimaux.',
      niveaux: [
        { min: 1000000, max: 999999999, nb: 4, sens: ['croissant', 'decroissant'] },
        { min: 0, max: 50, dec: 2, nb: 4, sens: ['croissant', 'decroissant'] },
        { min: 0, max: 50, dec: 2, nb: 5, sens: ['croissant', 'decroissant'], proche: true },
        { min: 0, max: 20, dec: 3, nb: 4, sens: ['croissant', 'decroissant'], proche: true },
        { min: 0, max: 20, dec: 3, nb: 5, sens: ['croissant', 'decroissant'], proche: true },
        { min: 100000000, max: 999999999, nb: 5, sens: ['croissant', 'decroissant'], proche: true }
      ]
    },
    'nombres-encadrer': {
      actif: true,
      libelle: 'Encadrer',
      consigne: 'Encadre le nombre.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Encadrer des entiers (jusqu\'aux dizaines de millions) et des décimaux.',
      niveaux: [
        { min: 100000, max: 999999999, e: [4, 5, 6], types: ['pair', 'inf', 'sup'] },
        { min: 1000000, max: 999999999, e: [5, 6, 7], types: ['pair', 'inf', 'sup'] },
        { min: 1, max: 99, dec: 2, e: [0, -1], types: ['pair', 'inf', 'sup'] },
        { min: 1, max: 99, dec: 3, e: [0, -1, -2], types: ['pair', 'inf', 'sup'] },
        { min: 1, max: 99, dec: 3, e: [-1, -2], types: ['pair', 'inf', 'sup'] },
        { min: 1, max: 99, dec: 3, e: [0, -1, -2], types: ['pair', 'inf', 'sup'] }
      ]
    },
    'nombres-droite': {
      actif: true,
      libelle: 'Droite graduée',
      consigne: 'Lis ou place un nombre sur la droite.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Repérage de fractions et de décimaux sur une droite graduée. Les valeurs min/max/pas sont en graduations (k/den ou k/10^dec).',
      niveaux: [
        { min: 0, max: 5, pas: 1, den: 5, types: ['lire', 'placer'] },
        { min: 0, max: 12, pas: 1, den: 4, types: ['lire', 'placer'] },
        { min: 0, max: 10, pas: 1, dec: 1, types: ['lire', 'placer'] },
        { min: 120, max: 130, pas: 1, dec: 1, types: ['lire', 'placer'] },
        { min: 0, max: 100, pas: 10, dec: 2, types: ['lire', 'placer'] },
        { min: 0, max: 10, pas: 1, dec: 2, types: ['lire'] }
      ]
    },
    'nombres-moitie': {
      actif: false,
      libelle: 'La moitié',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Moitié : CP.',
      niveaux: []
    },
    'nombres-fractions': {
      actif: true,
      libelle: 'Les fractions',
      consigne: 'Compare et écris des fractions égales.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Fractions équivalentes, comparaison avec 1 et à même dénominateur, fractions décimales.',
      niveaux: [
        { dens: [2, 3, 4, 5], types: ['lirepart', 'quantite'], qmax: 60 },
        { dens: [2, 3, 4, 5, 6, 8], types: ['equivalente'] },
        { dens: [2, 3, 4, 5, 6, 8, 10], types: ['equivalente', 'compare1'] },
        { dens: [3, 4, 5, 6, 8, 10], types: ['cmpden', 'compare1', 'quantite2'], qmax: 100 },
        { dens: [10, 100], types: ['ecriture', 'equivalente'] },
        { dens: [2, 3, 4, 5, 6, 8, 10, 100], types: ['equivalente', 'compare1', 'cmpden', 'ecriture', 'quantite2'], qmax: 100 }
      ]
    },
    'nombres-decimaux': {
      actif: true,
      libelle: 'Les nombres décimaux',
      consigne: 'Compare, décompose et encadre les décimaux.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Maîtrise des décimaux (jusqu\'aux millièmes).',
      niveaux: [
        { dec: 2, intmax: 50, types: ['chiffre', 'valeur', 'combien'] },
        { dec: 2, intmax: 99, types: ['fraction', 'decomposer', 'ecriture'] },
        { dec: 3, intmax: 20, types: ['chiffre', 'valeur'] },
        { dec: 3, intmax: 50, types: ['combien', 'decomposer', 'fraction'] },
        { dec: 3, intmax: 99, types: ['chiffre', 'valeur', 'combien', 'decomposer'] },
        { dec: 3, intmax: 99, types: ['chiffre', 'valeur', 'combien', 'fraction', 'decomposer', 'ecriture'] }
      ]
    }
  },
  // BEGIN grandeurs (module grandeurs/ ; généré, voir grandeurs/js/generateur_grandeurs.js pour le format des exos)
  grandeurs: {
    longueurs: {
      actif: true,
      libelle: 'Longueurs',
      consigne: 'Conversions expertes de longueurs.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Du mm au km, décimaux jusqu’au millième (2,345 km). Conversions de longueurs : non vérifiées dans la recherche CM2, À VALIDER.',
      niveaux: [
        { exos: [
          { type: 'convertir', grandeur: 'longueur', paires: [['km', 'm'], ['m', 'cm'], ['m', 'mm'], ['cm', 'mm']], min: 1, max: 999 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'longueur', paires: [['mm', 'm'], ['cm', 'm']], min: 1, max: 9999, decimal: true },
          { type: 'convertir', grandeur: 'longueur', paires: [['m', 'km']], min: 1, max: 9999, decimal: true }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'longueur', paires: [['m', 'cm'], ['km', 'm'], ['m', 'mm']], min: 1, max: 99, dv: 2 }
        ] },
        { exos: [
          { type: 'mixte', grandeur: 'longueur', paire: ['km', 'm'], min: 1, max: 99, pas: 5 },
          { type: 'mixte', grandeur: 'longueur', paire: ['m', 'cm'], min: 1, max: 99, pas: 1 },
          { type: 'mixte', grandeur: 'longueur', paire: ['m', 'mm'], min: 1, max: 9, pas: 1 }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'longueur', op: 'add', unite: 'm', min: 1, max: 99, dec: 2 },
          { type: 'probleme', grandeur: 'longueur', op: 'sub', unite: 'm', min: 1, max: 99, dec: 2 },
          { type: 'probleme', grandeur: 'longueur', op: 'mul', unite: 'm', min: 1, max: 99, dec: 2, n: [2, 12] },
          { type: 'probleme', grandeur: 'longueur', op: 'div', unite: 'm', min: 1, max: 99, dec: 2, n: [2, 12] }
        ] },
        { exos: [
          { type: 'comparer', grandeur: 'longueur', paires: [['m', 'cm'], ['km', 'm'], ['m', 'mm'], ['cm', 'mm']], min: 1, max: 999, deux: true },
          { type: 'convertir', grandeur: 'longueur', paires: [['cm', 'm'], ['mm', 'm']], min: 100, max: 99999, decimal: true },
          { type: 'choisir-unite', grandeur: 'longueur', unites: ['mm', 'cm', 'm', 'km'], nbChoix: 4 }
        ] }
      ]
    },
    'masses-contenances': {
      actif: true,
      libelle: 'Masses et contenances',
      consigne: 'Conversions expertes de masses et de contenances.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Masses : g, kg, t. Contenances : mL, cL, dL, L. Décimaux jusqu’au millième.',
      niveaux: [
        { exos: [
          { type: 'convertir', grandeur: 'masse', paires: [['kg', 'g'], ['t', 'kg'], ['t', 'g']], min: 1, max: 999 },
          { type: 'convertir', grandeur: 'contenance', paires: [['L', 'mL'], ['L', 'cL'], ['L', 'dL'], ['dL', 'mL']], min: 1, max: 999 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'masse', paires: [['g', 'kg'], ['kg', 't']], min: 1, max: 9999, decimal: true },
          { type: 'convertir', grandeur: 'contenance', paires: [['mL', 'L'], ['cL', 'L'], ['dL', 'L']], min: 1, max: 9999, decimal: true }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'masse', paires: [['kg', 'g'], ['t', 'kg']], min: 1, max: 99, dv: 2 },
          { type: 'convertir', grandeur: 'contenance', paires: [['L', 'cL'], ['L', 'mL']], min: 1, max: 99, dv: 2 }
        ] },
        { exos: [
          { type: 'mixte', grandeur: 'masse', paire: ['kg', 'g'], min: 1, max: 99, pas: 5 },
          { type: 'mixte', grandeur: 'contenance', paire: ['L', 'cL'], min: 1, max: 99, pas: 1 },
          { type: 'mixte', grandeur: 'contenance', paire: ['L', 'mL'], min: 1, max: 99, pas: 5 }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'masse', op: 'add', unite: 'kg', min: 1, max: 99, dec: 2 },
          { type: 'probleme', grandeur: 'masse', op: 'sub', unite: 'kg', min: 1, max: 99, dec: 2 },
          { type: 'probleme', grandeur: 'contenance', op: 'mul', unite: 'L', min: 1, max: 99, dec: 2, n: [2, 12] },
          { type: 'probleme', grandeur: 'contenance', op: 'div', unite: 'L', min: 1, max: 99, dec: 2, n: [2, 12] }
        ] },
        { exos: [
          { type: 'comparer', grandeur: 'masse', paires: [['kg', 'g'], ['t', 'kg']], min: 1, max: 999, deux: true },
          { type: 'comparer', grandeur: 'contenance', paires: [['L', 'cL'], ['L', 'mL']], min: 1, max: 999, deux: true },
          { type: 'choisir-unite', grandeur: 'masse', unites: ['g', 'kg', 't'], nbChoix: 3 },
          { type: 'choisir-unite', grandeur: 'contenance', unites: ['mL', 'cL', 'L'], nbChoix: 3 }
        ] }
      ]
    },
    'durees-monnaie': {
      actif: true,
      libelle: 'Durées et monnaie',
      consigne: 'Heures, minutes, secondes et euros.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Durées h, min, s (vérifié CM2). Monnaie avec centimes.',
      niveaux: [
        { exos: [
          { type: 'duree-ecart', mode: 'minutes', croise: true },
          { type: 'convertir', grandeur: 'duree', paires: [['h', 'min'], ['min', 's'], ['h', 's']], min: 1, max: 99 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'duree', paires: [['min', 'h']], min: 60, max: 600 },
          { type: 'convertir', grandeur: 'duree', paires: [['s', 'min']], min: 60, max: 600 },
          { type: 'convertir', grandeur: 'duree', paires: [['jour', 'h'], ['jour', 'min']], min: 1, max: 30 },
          { type: 'convertir', grandeur: 'duree', paires: [['semaine', 'jour']], min: 1, max: 52 }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'duree', op: 'add', unite: 'min', min: 10, max: 240 },
          { type: 'probleme', grandeur: 'duree', op: 'sub', unite: 'min', min: 10, max: 480 },
          { type: 'probleme', grandeur: 'duree', op: 'mul', unite: 'min', min: 5, max: 90, n: [2, 12] },
          { type: 'probleme', grandeur: 'duree', op: 'div', unite: 'min', min: 5, max: 90, n: [2, 12] }
        ] },
        { exos: [
          { type: 'monnaie-rendu', paye: [20, 50, 100], prixMax: 99, centimes: true },
          { type: 'probleme', grandeur: 'monnaie', op: 'add', unite: '€', min: 1, max: 99, dec: 2 },
          { type: 'probleme', grandeur: 'monnaie', op: 'sub', unite: '€', min: 1, max: 99, dec: 2 }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'monnaie', op: 'mul', unite: '€', min: 1, max: 99, dec: 2, n: [2, 12] },
          { type: 'probleme', grandeur: 'monnaie', op: 'div', unite: '€', min: 1, max: 99, dec: 2, n: [2, 12] },
          { type: 'convertir', grandeur: 'monnaie', paires: [['cts', '€']], min: 100, max: 99999, decimal: true }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'duree', paires: [['min', 'h'], ['s', 'min']], min: 60, max: 6000 },
          { type: 'probleme', grandeur: 'duree', op: 'mul', unite: 's', min: 5, max: 90, n: [2, 12] },
          { type: 'monnaie-rendu', paye: [50, 100], prixMax: 99, centimes: true }
        ] }
      ]
    },
    'perimetres-aires': {
      actif: true,
      libelle: 'Périmètres et aires',
      consigne: 'Périmètres, aires et conversions d’aires.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Aires du carré, du rectangle et du triangle rectangle (cm², dm², m²). Périmètre du cercle avec π = 3,14 (À VALIDER : formule parfois placée en 6e). Les formules sont présentées comme règles, l’enfant ne les apprend pas par cœur.',
      niveaux: [
        { exos: [
          { type: 'perimetre', figures: ['carre', 'rectangle', 'triangle', 'losange', 'hexagone'], unites: ['cm', 'm'], min: 5, max: 200, inverse: 0.5 }
        ] },
        { exos: [
          { type: 'aire', figures: ['carre', 'rectangle'], unites: ['cm', 'm'], min: 5, max: 50, inverse: 0.4 }
        ] },
        { exos: [
          { type: 'aire', figures: ['triangle-rectangle'], unites: ['cm', 'm'], min: 2, max: 30 },
          { type: 'aire', figures: ['rectangle'], unites: ['cm', 'm'], min: 5, max: 50, inverse: 0.5 }
        ] },
        { exos: [
          { type: 'perimetre', figures: ['cercle'], unites: ['cm', 'm'], min: 1, max: 20 },
          { type: 'aire', figures: ['carre', 'rectangle', 'triangle-rectangle'], unites: ['cm', 'm'], min: 5, max: 60 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'aire', paires: [['m²', 'dm²'], ['dm²', 'cm²'], ['m²', 'cm²']], min: 1, max: 99 },
          { type: 'convertir', grandeur: 'aire', paires: [['cm²', 'dm²'], ['dm²', 'm²']], min: 100, max: 9900 }
        ] },
        { exos: [
          { type: 'aire', figures: ['carre', 'rectangle', 'triangle-rectangle'], unites: ['cm', 'm'], min: 5, max: 100, inverse: 0.4 },
          { type: 'perimetre', figures: ['rectangle', 'cercle', 'triangle'], unites: ['cm', 'm'], min: 5, max: 100, inverse: 0.5 },
          { type: 'convertir', grandeur: 'aire', paires: [['m²', 'cm²'], ['dm²', 'cm²']], min: 1, max: 99 },
          { type: 'choisir-unite', grandeur: 'aire', unites: ['cm²', 'dm²', 'm²'], nbChoix: 3 }
        ] }
      ]
    },
    'proportionnalite-pourcentages': {
      actif: true,
      libelle: 'Proportionnalité et pourcentages',
      consigne: 'Proportionnalité, pourcentages simples.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Proportionnalité (prix, recettes, tableaux) puis pourcentages usuels (10, 20, 25, 50, 75 %) en lien avec les fractions. Pourcentages : programme de fin de cycle 3 (À VALIDER pour le CM2 seul).',
      niveaux: [
        { exos: [
          { type: 'proportionnalite', modes: ['prix', 'prix-unitaire', 'recette', 'tableau'], pmin: 2, pmax: 20, nmax: 12, kmax: 12, dec: 1, personnes: [2, 3, 4, 5, 6, 8, 10, 12] }
        ] },
        { exos: [
          { type: 'pourcentage', modes: ['fraction'], pourcentages: [50, 25, 75, 10] }
        ] },
        { exos: [
          { type: 'pourcentage', modes: ['de'], pourcentages: [10, 50], baseMax: 200 }
        ] },
        { exos: [
          { type: 'pourcentage', modes: ['de'], pourcentages: [10, 20, 25, 50, 75], baseMax: 400 },
          { type: 'pourcentage', modes: ['fraction'], pourcentages: [1, 10, 20, 25, 50, 75] }
        ] },
        { exos: [
          { type: 'pourcentage', modes: ['reduction'], pourcentages: [10, 20, 25, 50], baseMax: 200 },
          { type: 'pourcentage', modes: ['de'], pourcentages: [10, 20, 25, 50, 75], baseMax: 800 }
        ] },
        { exos: [
          { type: 'pourcentage', modes: ['reduction', 'de'], pourcentages: [5, 10, 20, 25, 50, 75], baseMax: 1000 },
          { type: 'proportionnalite', modes: ['prix', 'prix-unitaire', 'recette', 'tableau'], pmin: 2, pmax: 30, nmax: 15, kmax: 15, dec: 1, personnes: [2, 3, 4, 5, 6, 8, 10, 12] }
        ] }
      ]
    },
    'volumes-vitesses-echelles': {
      actif: true,
      libelle: 'Volumes, vitesses, échelles',
      consigne: 'Volumes, vitesses et échelles.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Volume du cube et du pavé droit (cm³, dm³, m³, 1 L = 1 dm³), vitesse moyenne (km/h), échelles. Volume : non vérifié dans la recherche CM2 (« probablement hors programme »), vitesses et échelles : demande du porteur du projet. Tout est À VALIDER.',
      niveaux: [
        { exos: [
          { type: 'volume', figures: ['cube'], unites: ['cm', 'dm'], min: 1, max: 6 }
        ] },
        { exos: [
          { type: 'vitesse', modes: ['distance', 'vitesse'], vmin: 20, vmax: 100, tmax: 4 }
        ] },
        { exos: [
          { type: 'echelle', modes: ['plan-reel'], echelles: [{ k: 2, u: 'm' }, { k: 5, u: 'm' }, { k: 10, u: 'm' }, { k: 50, u: 'm' }], nmax: 9 }
        ] },
        { exos: [
          { type: 'volume', figures: ['cube', 'pave'], unites: ['cm', 'dm'], min: 1, max: 10 },
          { type: 'convertir', grandeur: 'volume', paires: [['L', 'dm³'], ['dm³', 'L'], ['L', 'mL']], min: 1, max: 99 }
        ] },
        { exos: [
          { type: 'vitesse', modes: ['distance', 'vitesse', 'temps'], vmin: 20, vmax: 120, tmax: 6 },
          { type: 'echelle', modes: ['plan-reel', 'reel-plan'], echelles: [{ k: 2, u: 'km' }, { k: 5, u: 'km' }, { k: 10, u: 'km' }, { k: 20, u: 'm' }, { k: 100, u: 'm' }], nmax: 12 }
        ] },
        { exos: [
          { type: 'volume', figures: ['pave'], unites: ['cm', 'dm', 'm'], min: 2, max: 12, inverse: 0.4 },
          { type: 'vitesse', modes: ['distance', 'vitesse', 'temps', 'minutes'], vmin: 20, vmax: 120, tmax: 8 },
          { type: 'echelle', modes: ['fraction', 'plan-reel', 'reel-plan'], rapports: [100, 1000, 10000, 100000], echelles: [{ k: 5, u: 'km' }, { k: 50, u: 'm' }], nmax: 12 },
          { type: 'convertir', grandeur: 'volume', paires: [['m³', 'dm³'], ['dm³', 'cm³'], ['m³', 'L']], min: 1, max: 99 }
        ] }
      ]
    }
  },
  // END grandeurs
  jeux: { morpion: true, puissance4: true, pendu: true, 'trouver-le-chiffre': true, 'eclair': true, 'compte-magique': true, 'suites-magiques': true, 'ranger': true, 'memory-nombres': true, 'horloge': true, 'marche': true, 'fractions': true }
};
