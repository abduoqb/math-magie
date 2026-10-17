// Programme CM1 (cycle 3) - donnees de contenu, lues par les moteurs.
// Source: BO n°16 du 17/04/2025 (programme du cycle 3, en vigueur au CM1).
// Les paliers (niveaux[]) sont des propositions derivees du programme (docs/programmes/cm1.md, section 5).
// Convention: additions/soustractions -> min/max = bornes de chaque terme (de la minuende pour les soustractions).
window.PROGRAMMES = window.PROGRAMMES || {};
window.PROGRAMMES.cm1 = {
  id: 'cm1', libelle: 'CM1', cycle: 3,
  source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
  notes: 'Decimaux limites aux centiemes. Entiers: 4 chiffres en periodes 1-2, jusqu a 999 999 ensuite (paliers hauts). Pas de division decimale posee, pas de multiplication decimal x decimal.',

  calcul: {
    additions: {
      actif: true, libelle: 'Additions', consigne: 'Calcule la somme.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'max = borne de chaque terme (somme bornee < 1 000 000). Paliers 6, 9, 10 = decimaux (dixiemes puis centiemes).',
      niveaux: [
        { min: 1,   max: 10,     retenue: false, termes: 2, decimaux: 0 },
        { min: 5,   max: 50,     retenue: true,  termes: 2, decimaux: 0 },
        { min: 50,  max: 500,    retenue: true,  termes: 2, decimaux: 0 },
        { min: 100, max: 999,    retenue: true,  termes: 2, decimaux: 0 },
        { min: 1000, max: 9999,  retenue: true,  termes: 2, decimaux: 0 },
        { min: 1,   max: 49,     retenue: true,  termes: 2, decimaux: 1 },
        { min: 10000, max: 99999, retenue: true, termes: 2, decimaux: 0 },
        { min: 100000, max: 499999, retenue: true, termes: 2, decimaux: 0 },
        { min: 1,   max: 4999,   retenue: true,  termes: 2, decimaux: 2 },
        { min: 100, max: 333333, retenue: true,  termes: 3, decimaux: 2 }
      ]
    },
    soustractions: {
      actif: true, libelle: 'Soustractions', consigne: 'Calcule la différence.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'min/max = bornes de la minuende; resultat toujours positif. retenue = emprunts.',
      niveaux: [
        { min: 5,   max: 20,     retenue: false, termes: 2, decimaux: 0 },
        { min: 20,  max: 99,     retenue: true,  termes: 2, decimaux: 0 },
        { min: 100, max: 999,    retenue: false, termes: 2, decimaux: 0 },
        { min: 100, max: 999,    retenue: true,  termes: 2, decimaux: 0 },
        { min: 1000, max: 9999,  retenue: true,  termes: 2, decimaux: 0 },
        { min: 10,  max: 99,     retenue: true,  termes: 2, decimaux: 1 },
        { min: 10000, max: 99999, retenue: true, termes: 2, decimaux: 0 },
        { min: 100000, max: 999999, retenue: true, termes: 2, decimaux: 0 },
        { min: 100, max: 9999,   retenue: true,  termes: 2, decimaux: 2 },
        { min: 100000, max: 999999, retenue: true, termes: 2, decimaux: 2 }
      ]
    },
    multiplications: {
      actif: true, libelle: 'Multiplications', consigne: 'Calcule le produit.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Palier 2: x10/x100/x dizaines idealement; ici b dans [10,100] (le moteur peut restreindre aux multiples de 10). Paliers 7-8: decimal x entier < 10 seulement (decimaux = decimales de a). Produits < 1 000 000.',
      niveaux: [
        { a: [2, 9],      b: [2, 9],     decimaux: 0 },
        { a: [2, 99],     b: [10, 100],  decimaux: 0 },
        { a: [10, 99],    b: [2, 9],     decimaux: 0 },
        { a: [10, 99],    b: [10, 99],   decimaux: 0 },
        { a: [100, 999],  b: [2, 9],     decimaux: 0 },
        { a: [100, 500],  b: [10, 99],   decimaux: 0 },
        { a: [1, 99],     b: [2, 9],     decimaux: 1 },
        { a: [1, 99],     b: [2, 9],     decimaux: 2 },
        { a: [1000, 9999], b: [10, 99],  decimaux: 0 },
        { a: [100, 999],  b: [10, 99],   decimaux: 0 }
      ]
    },
    divisions: {
      actif: true, libelle: 'Divisions', consigne: 'Calcule le quotient.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Diviseur a un chiffre (division euclidienne posee), dividende = diviseur x quotient + reste < 1 000 000. Paliers 5 et 9 = division par 10 (mental): decimaux = nb de decimales du quotient (dividende entier ou dixieme). Palier 10 (problemes multi-etapes) non representable: division euclidienne simple.',
      niveaux: [
        { diviseur: [2, 9],   quotient: [1, 5],          reste: false, decimaux: 0 },
        { diviseur: [2, 9],   quotient: [2, 10],         reste: true,  decimaux: 0 },
        { diviseur: [2, 9],   quotient: [10, 110],       reste: true,  decimaux: 0 },
        { diviseur: [2, 9],   quotient: [100, 1100],     reste: true,  decimaux: 0 },
        { diviseur: [10, 10], quotient: [1, 999],        reste: false, decimaux: 1 },
        { diviseur: [2, 9],   quotient: [1000, 11000],   reste: true,  decimaux: 0 },
        { diviseur: [2, 9],   quotient: [10000, 110000], reste: false, decimaux: 0 },
        { diviseur: [2, 9],   quotient: [10000, 110000], reste: true,  decimaux: 0 },
        { diviseur: [10, 10], quotient: [1, 999],        reste: false, decimaux: 2 },
        { diviseur: [3, 9],   quotient: [20000, 110000], reste: true,  decimaux: 0 }
      ]
    }
  },

  geometrie: {
    'geometrie-formes': {
      actif: true, libelle: 'Formes',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: '"Sphère" du code = "boule" au programme (libellé à harmoniser). Pentagone/Hexagone exclus (non cités au CM1).',
      contenu: { formes: ['Carré', 'Triangle', 'Rectangle', 'Cercle', 'Losange', 'Cube', 'Sphère', 'Pyramide', 'Cylindre', 'Pavé droit', 'Cône'] }
    },
    'geometrie-proprietes': {
      actif: true, libelle: 'Propriétés (sommets, faces, arêtes)',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Décrire cube, pavé, pyramide, prisme droit (faces, arêtes, sommets). Pentagone/Hexagone/Octogone/Étoile exclus par prudence; prisme absent du code actuel.',
      contenu: { figures: ['Triangle', 'Carré', 'Rectangle', 'Cube', 'Pavé droit', 'Pyramide'], proprietes: ['sommets', 'cotes', 'faces', 'aretes'] }
    },
    'geometrie-angles': {
      actif: true, libelle: 'Angles',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Angles saillants uniquement; pas de degré ni rapporteur au CM1: le moteur ne doit pas afficher de mesure en degrés. Plat et nul exclus.',
      contenu: { types: ['Aigu', 'Droit', 'Obtus'], afficherDegres: false }
    },
    'geometrie-symetrie': {
      actif: true, libelle: 'Symétrie',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Axe horizontal ou vertical uniquement (le code actuel ne gère que l\'axe vertical).',
      contenu: { axes: ['vertical', 'horizontal'], nbPointsMax: 6 }
    },
    'geometrie-vraifaux': {
      actif: true, libelle: 'Vrai ou faux',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Pentagone/Hexagone exclus; affirmations à vérifier pour rester dans le vocabulaire CM1.',
      contenu: { figures: ['Carré', 'Triangle', 'Cercle', 'Rectangle', 'Losange', 'Cube', 'Sphère', 'Pavé droit', 'Cylindre', 'Cône'] }
    },
    'geometrie-droites': {
      actif: true, libelle: 'Droites',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Perpendicularité et parallélisme au programme; sécantes = vocabulaire usuel, à valider.',
      contenu: { types: ['Parallèles', 'Perpendiculaires', 'Sécantes'] }
    },
    'geometrie-triangles': {
      actif: true, libelle: 'Triangles',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: '"Quelconque" ajouté pour distinguer des cas particuliers (hors liste stricte).',
      contenu: { types: ['Équilatéral', 'Isocèle', 'Rectangle', 'Quelconque'] }
    },
    'geometrie-quadrilateres': {
      actif: true, libelle: 'Quadrilatères',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Seuls carré, rectangle, losange au programme: Trapèze/Parallélogramme/Cerf-volant exclus. "Carré" absent du moteur actuel (à ajouter); avec 2 types seulement le jeu est pauvre.',
      contenu: { types: ['Losange', 'Rectangle'], aAjouter: ['Carré'] }
    },
    'geometrie-patrons': {
      actif: true, libelle: 'Patrons',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Patron du cube explicite; pavé, pyramide, prisme droit (construction de solides). Cylindre et Tétraèdre exclus.',
      contenu: { solides: ['Cube', 'Pavé droit', 'Pyramide', 'Prisme triangulaire'] }
    },
    'geometrie-solides': {
      actif: true, libelle: 'Les solides',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Decrire cube, pave, pyramide, prisme droit : nature des faces, enigmes, comptage faces/sommets/aretes du prisme.',
      contenu: { themes: ['faces-forme', 'description', 'prisme'], solides: ['Cube', 'Pavé droit', 'Pyramide', 'Cylindre', 'Cône', 'Sphère', 'Prisme triangulaire'], niveauMax: 3 }
    },
    'geometrie-cercle': {
      actif: true, libelle: 'Cercle et compas',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Cercle, centre, rayon, diametre, corde ; definition par la distance au centre ; trace au compas.',
      contenu: { themes: ['vocabulaire', 'compas', 'rayon-diametre', 'definition'], vocab: ['centre', 'rayon', 'diamètre', 'corde'], niveauMax: 3 }
    },
    'geometrie-instruments': {
      actif: true, libelle: 'Règle, équerre, compas',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Outils du cycle 3 : regle graduee, equerre, compas. Pas de rapporteur au CM1 (degre et rapporteur : CM2 dans ce projet).',
      contenu: { themes: ['choix-instrument', 'regle-lecture'], instruments: ['règle', 'équerre', 'compas'], niveauMax: 3 }
    }
  },

  nombres: {
    // Module Nombres : ids prefixes 'nombres-'. Paliers lus par nombres/js/generateur_nombres.js.
    // Nombres jusqu'aux millions, fractions simples, décimaux (dixièmes, centièmes). Les paliers sont une proposition de conception (non officielle).
    'nombres-valeur': {
      actif: true,
      libelle: 'Valeur des chiffres',
      consigne: 'Trouve la valeur de chaque chiffre.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Grands nombres : milliers puis millions. Les paliers 5-6 vont jusqu\'à 9 999 999 (le million est introduit au CM1).',
      niveaux: [
        { min: 1000, max: 9999, types: ['chiffre', 'valeur'] },
        { min: 10000, max: 99999, types: ['chiffre', 'valeur', 'combien'] },
        { min: 100000, max: 999999, types: ['chiffre', 'valeur', 'combien'] },
        { min: 100000, max: 999999, types: ['valeur', 'combien'] },
        { min: 1000000, max: 9999999, types: ['chiffre', 'valeur', 'combien'] },
        { min: 1000000, max: 9999999, types: ['valeur', 'combien'] }
      ]
    },
    'nombres-decomposer': {
      actif: true,
      libelle: 'Décomposer',
      consigne: 'Décompose le nombre.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Décomposer les grands nombres (paquets de 1 000, 10 000...).',
      niveaux: [
        { min: 1000, max: 9999, types: ['rangs', 'somme'] },
        { min: 10000, max: 99999, types: ['somme', 'paquets'] },
        { min: 100000, max: 999999, types: ['somme', 'retrouver'] },
        { min: 100000, max: 999999, types: ['somme', 'retrouver', 'paquets'] },
        { min: 1000000, max: 9999999, types: ['paquets', 'somme'] },
        { min: 1000000, max: 9999999, types: ['paquets', 'somme', 'retrouver'] }
      ]
    },
    'nombres-comparer': {
      actif: true,
      libelle: 'Comparer',
      consigne: 'Compare les nombres.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Entiers jusqu\'au million puis décimaux (dixièmes, centièmes).',
      niveaux: [
        { min: 1000, max: 99999, types: ['symbole', 'plusgrand', 'pluspetit'] },
        { min: 100000, max: 999999, types: ['symbole', 'plusgrand', 'pluspetit'] },
        { min: 100000, max: 999999, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true },
        { min: 0, max: 20, dec: 1, types: ['symbole', 'plusgrand', 'pluspetit'] },
        { min: 0, max: 20, dec: 2, types: ['symbole', 'plusgrand', 'pluspetit'], proche: true },
        { min: 0, max: 20, dec: 2, types: ['symbole', 'pluspetit'], proche: true, nb: 4 }
      ]
    },
    'nombres-ranger': {
      actif: true,
      libelle: 'Ranger',
      consigne: 'Range les nombres dans l\'ordre.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Entiers puis décimaux.',
      niveaux: [
        { min: 1000, max: 99999, nb: 4, sens: ['croissant', 'decroissant'] },
        { min: 100000, max: 999999, nb: 4, sens: ['croissant', 'decroissant'], proche: true },
        { min: 100000, max: 999999, nb: 5, sens: ['croissant', 'decroissant'], proche: true },
        { min: 0, max: 20, dec: 1, nb: 4, sens: ['croissant', 'decroissant'] },
        { min: 0, max: 20, dec: 2, nb: 4, sens: ['croissant', 'decroissant'], proche: true },
        { min: 0, max: 20, dec: 2, nb: 5, sens: ['croissant', 'decroissant'], proche: true }
      ]
    },
    'nombres-encadrer': {
      actif: true,
      libelle: 'Encadrer',
      consigne: 'Encadre le nombre.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Encadrer un entier (milliers, dizaines de milliers) puis un décimal par deux entiers ou deux dixièmes.',
      niveaux: [
        { min: 10000, max: 999999, e: [3, 4], types: ['pair', 'inf', 'sup'] },
        { min: 10000, max: 999999, e: [2, 3, 4, 5], types: ['pair', 'inf', 'sup'] },
        { min: 1000000, max: 8999999, e: [4, 5, 6], types: ['pair', 'inf', 'sup'] },
        { min: 1, max: 50, dec: 1, e: [0], types: ['pair', 'inf', 'sup'] },
        { min: 1, max: 50, dec: 2, e: [0, -1], types: ['pair', 'inf', 'sup'] },
        { min: 1, max: 50, dec: 2, e: [0, -1], types: ['pair', 'inf', 'sup'] }
      ]
    },
    'nombres-droite': {
      actif: true,
      libelle: 'Droite graduée',
      consigne: 'Lis ou place un nombre sur la droite.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Entiers, fractions simples (demis, tiers, quarts) et dixièmes. Les valeurs min/max/pas sont en graduations (k/den ou k/10^dec).',
      niveaux: [
        { min: 0, max: 10000, pas: 1000, types: ['lire', 'placer'] },
        { min: 0, max: 100000, pas: 10000, types: ['lire', 'placer'] },
        { min: 0, max: 4, pas: 1, den: 4, types: ['lire', 'placer'] },
        { min: 0, max: 6, pas: 1, den: 3, types: ['lire', 'placer'] },
        { min: 0, max: 10, pas: 1, dec: 1, types: ['lire', 'placer'] },
        { min: 20, max: 30, pas: 1, dec: 1, types: ['lire', 'placer'] }
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
      consigne: 'Lis et utilise les fractions.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Fractions simples 1/2, 1/3, 1/4 ; fractions décimales (dixièmes, centièmes) et écriture décimale.',
      niveaux: [
        { dens: [2, 3, 4], types: ['lirepart'] },
        { dens: [2, 3, 4], types: ['lirepart', 'quantite'], qmax: 40 },
        { dens: [2, 3, 4], types: ['quantite', 'lirepart'], qmax: 100 },
        { dens: [10], types: ['ecriture', 'lirepart'] },
        { dens: [10, 100], types: ['ecriture', 'lirepart'] },
        { dens: [2, 3, 4, 10, 100], types: ['lirepart', 'quantite', 'ecriture'], qmax: 100 }
      ]
    },
    'nombres-decimaux': {
      actif: true,
      libelle: 'Les nombres décimaux',
      consigne: 'Dixièmes et centièmes : lis les nombres à virgule.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Introduction des décimaux : dixièmes puis centièmes.',
      niveaux: [
        { dec: 1, intmax: 9, types: ['chiffre', 'ecriture'] },
        { dec: 1, intmax: 20, types: ['chiffre', 'valeur', 'fraction'] },
        { dec: 1, intmax: 50, types: ['fraction', 'decomposer', 'combien'] },
        { dec: 2, intmax: 9, types: ['chiffre', 'valeur', 'ecriture'] },
        { dec: 2, intmax: 20, types: ['fraction', 'decomposer'] },
        { dec: 2, intmax: 50, types: ['chiffre', 'valeur', 'combien', 'fraction', 'decomposer'] }
      ]
    }
  },
  // BEGIN grandeurs (module grandeurs/ ; généré, voir grandeurs/js/generateur_grandeurs.js pour le format des exos)
  grandeurs: {
    longueurs: {
      actif: true,
      libelle: 'Longueurs',
      consigne: 'Change d’unité, avec des virgules.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Du mm au km. Conversions par relations connues (3,5 m = 350 cm), pas de tableau de conversion au CM1. Décimaux limités aux centièmes.',
      niveaux: [
        { exos: [
          { type: 'convertir', grandeur: 'longueur', paires: [['km', 'm'], ['m', 'cm'], ['m', 'mm']], min: 1, max: 99 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'longueur', paires: [['cm', 'm'], ['mm', 'cm']], min: 1, max: 999, decimal: true },
          { type: 'convertir', grandeur: 'longueur', paires: [['m', 'km']], min: 10, max: 9990, decimal: true, pas: 10 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'longueur', paires: [['m', 'cm'], ['km', 'm'], ['cm', 'mm']], min: 1, max: 99, dv: 1 }
        ] },
        { exos: [
          { type: 'mixte', grandeur: 'longueur', paire: ['km', 'm'], min: 1, max: 99, pas: 50 },
          { type: 'mixte', grandeur: 'longueur', paire: ['m', 'cm'], min: 1, max: 99, pas: 5 },
          { type: 'mixte', grandeur: 'longueur', paire: ['cm', 'mm'], min: 1, max: 99, pas: 1 }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'longueur', op: 'add', unite: 'm', min: 1, max: 99, dec: 1 },
          { type: 'probleme', grandeur: 'longueur', op: 'sub', unite: 'm', min: 1, max: 99, dec: 1 },
          { type: 'probleme', grandeur: 'longueur', op: 'mul', unite: 'm', min: 1, max: 99, dec: 1, n: [2, 9] }
        ] },
        { exos: [
          { type: 'comparer', grandeur: 'longueur', paires: [['m', 'cm'], ['km', 'm'], ['cm', 'mm']], min: 1, max: 99, deux: true },
          { type: 'choisir-unite', grandeur: 'longueur', unites: ['mm', 'cm', 'm', 'km'], nbChoix: 4 },
          { type: 'probleme', grandeur: 'longueur', op: 'div', unite: 'm', min: 1, max: 99, dec: 1, n: [2, 9] }
        ] }
      ]
    },
    'masses-contenances': {
      actif: true,
      libelle: 'Masses et contenances',
      consigne: 'Change d’unité : g, kg, t, L, mL.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Masses : g, kg, t. Contenances : mL, cL, dL, L. Relations connues, pas de tableau. Décimaux limités aux centièmes.',
      niveaux: [
        { exos: [
          { type: 'convertir', grandeur: 'masse', paires: [['kg', 'g'], ['t', 'kg']], min: 1, max: 99 },
          { type: 'convertir', grandeur: 'contenance', paires: [['L', 'mL'], ['L', 'cL'], ['L', 'dL']], min: 1, max: 99 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'masse', paires: [['g', 'kg'], ['kg', 't']], min: 10, max: 9990, decimal: true, pas: 10 },
          { type: 'convertir', grandeur: 'contenance', paires: [['mL', 'L'], ['cL', 'L']], min: 10, max: 9990, decimal: true, pas: 10 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'masse', paires: [['kg', 'g']], min: 1, max: 99, dv: 1 },
          { type: 'convertir', grandeur: 'masse', paires: [['t', 'kg']], min: 1, max: 99, dv: 1 },
          { type: 'convertir', grandeur: 'contenance', paires: [['L', 'cL'], ['L', 'mL']], min: 1, max: 99, dv: 1 }
        ] },
        { exos: [
          { type: 'mixte', grandeur: 'masse', paire: ['kg', 'g'], min: 1, max: 99, pas: 50 },
          { type: 'mixte', grandeur: 'contenance', paire: ['L', 'cL'], min: 1, max: 99, pas: 5 },
          { type: 'mixte', grandeur: 'contenance', paire: ['L', 'mL'], min: 1, max: 99, pas: 50 }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'masse', op: 'add', unite: 'kg', min: 1, max: 99, dec: 1 },
          { type: 'probleme', grandeur: 'masse', op: 'sub', unite: 'kg', min: 1, max: 99, dec: 1 },
          { type: 'probleme', grandeur: 'contenance', op: 'add', unite: 'L', min: 1, max: 99, dec: 1 },
          { type: 'probleme', grandeur: 'contenance', op: 'sub', unite: 'L', min: 1, max: 99, dec: 2 }
        ] },
        { exos: [
          { type: 'choisir-unite', grandeur: 'masse', unites: ['g', 'kg', 't'], nbChoix: 3 },
          { type: 'choisir-unite', grandeur: 'contenance', unites: ['mL', 'cL', 'L'], nbChoix: 3 },
          { type: 'comparer', grandeur: 'masse', paires: [['kg', 'g'], ['t', 'kg']], min: 1, max: 99, deux: true },
          { type: 'probleme', grandeur: 'masse', op: 'mul', unite: 'kg', min: 1, max: 99, dec: 1, n: [2, 9] }
        ] }
      ]
    },
    'durees-monnaie': {
      actif: true,
      libelle: 'Durées et monnaie',
      consigne: 'Heures, minutes, secondes et euros.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Durées en heures, minutes et secondes (problèmes à une ou deux étapes). Monnaie avec centimes (décimaux au centième).',
      niveaux: [
        { exos: [
          { type: 'duree-ecart', mode: 'minutes', croise: true },
          { type: 'convertir', grandeur: 'duree', paires: [['h', 'min'], ['min', 's']], min: 1, max: 99 }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'duree', paires: [['min', 'h']], min: 60, max: 600 },
          { type: 'convertir', grandeur: 'duree', paires: [['jour', 'h']], min: 1, max: 30 },
          { type: 'convertir', grandeur: 'duree', paires: [['semaine', 'jour']], min: 1, max: 52 },
          { type: 'convertir', grandeur: 'calendrier', paires: [['an', 'mois']], min: 1, max: 20 }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'duree', op: 'add', unite: 'min', min: 10, max: 120 },
          { type: 'probleme', grandeur: 'duree', op: 'sub', unite: 'min', min: 10, max: 240 },
          { type: 'probleme', grandeur: 'duree', op: 'mul', unite: 'min', min: 5, max: 90, n: [2, 9] },
          { type: 'probleme', grandeur: 'duree', op: 'div', unite: 'min', min: 5, max: 90, n: [2, 9] }
        ] },
        { exos: [
          { type: 'monnaie-rendu', paye: [20, 50, 100], prixMax: 99, centimes: true },
          { type: 'monnaie-somme', unite: '€', valeurs: [1, 2, 5, 10, 20, 50], nbMax: 5, nbTypes: 4 }
        ] },
        { exos: [
          { type: 'probleme', grandeur: 'monnaie', op: 'add', unite: '€', min: 1, max: 99, dec: 2 },
          { type: 'probleme', grandeur: 'monnaie', op: 'sub', unite: '€', min: 1, max: 99, dec: 2 },
          { type: 'probleme', grandeur: 'monnaie', op: 'mul', unite: '€', min: 1, max: 50, dec: 2, n: [2, 9] }
        ] },
        { exos: [
          { type: 'convertir', grandeur: 'monnaie', paires: [['€', 'cts']], min: 1, max: 99 },
          { type: 'convertir', grandeur: 'monnaie', paires: [['cts', '€']], min: 100, max: 9999, decimal: true },
          { type: 'probleme', grandeur: 'monnaie', op: 'div', unite: '€', min: 1, max: 50, dec: 2, n: [2, 9] },
          { type: 'duree-ecart', mode: 'minutes', croise: true }
        ] }
      ]
    },
    'perimetres-aires': {
      actif: true,
      libelle: 'Périmètres et aires',
      consigne: 'Calcule le tour et la surface des figures.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Périmètre d’un polygone (règle: 4 × côté pour le carré). Aires par quadrillage puis carré et rectangle, unités cm² et m² (le programme CM1 ne cite que cm² : m² ajouté sur demande, À VALIDER). Pas de conversion d’aires avant le CM2.',
      niveaux: [
        { exos: [
          { type: 'perimetre', figures: ['carre', 'rectangle', 'triangle', 'losange'], unites: ['cm'], min: 1, max: 30 }
        ] },
        { exos: [
          { type: 'perimetre', figures: ['carre', 'rectangle', 'triangle', 'losange', 'hexagone'], unites: ['cm', 'm'], min: 2, max: 60, inverse: 0.5 }
        ] },
        { exos: [
          { type: 'aire', figures: ['grille'], unites: ['cm'], min: 2, max: 10 }
        ] },
        { exos: [
          { type: 'aire', figures: ['carre', 'rectangle'], unites: ['cm', 'm'], min: 2, max: 12 }
        ] },
        { exos: [
          { type: 'aire', figures: ['carre', 'rectangle'], unites: ['cm', 'm'], min: 2, max: 25, inverse: 0.4 },
          { type: 'perimetre', figures: ['carre', 'rectangle'], unites: ['cm', 'm'], min: 2, max: 100, inverse: 0.5 }
        ] },
        { exos: [
          { type: 'aire', figures: ['carre', 'rectangle'], unites: ['cm', 'm'], min: 5, max: 50, inverse: 0.5 },
          { type: 'perimetre', figures: ['carre', 'rectangle', 'triangle', 'losange', 'hexagone'], unites: ['cm', 'm'], min: 5, max: 200, inverse: 0.5 },
          { type: 'choisir-unite', grandeur: 'aire', unites: ['cm²', 'm²'], nbChoix: 2 }
        ] }
      ]
    },
    'proportionnalite-pourcentages': {
      actif: true,
      libelle: 'Proportionnalité',
      consigne: 'Cherche combien ça coûte ou combien il en faut.',
      source: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
      notes: 'Initiation : prix, recettes, tableaux de proportionnalité (retour à l’unité, coefficient). Les pourcentages sont du CM2.',
      niveaux: [
        { exos: [
          { type: 'proportionnalite', modes: ['prix'], pmin: 1, pmax: 9, nmax: 6 }
        ] },
        { exos: [
          { type: 'proportionnalite', modes: ['prix-unitaire', 'tableau'], pmin: 1, pmax: 9, nmax: 9, kmax: 6 }
        ] },
        { exos: [
          { type: 'proportionnalite', modes: ['recette'], personnes: [2, 4, 6, 8, 10] },
          { type: 'proportionnalite', modes: ['prix'], pmin: 2, pmax: 20, nmax: 9 }
        ] },
        { exos: [
          { type: 'proportionnalite', modes: ['prix', 'prix-unitaire', 'recette', 'tableau'], pmin: 2, pmax: 20, nmax: 9, kmax: 9, personnes: [2, 3, 4, 5, 6, 8, 10, 12] }
        ] },
        { exos: [
          { type: 'proportionnalite', modes: ['prix', 'prix-unitaire'], pmin: 1, pmax: 9, nmax: 9, dec: 1 }
        ] },
        { exos: [
          { type: 'proportionnalite', modes: ['prix', 'prix-unitaire', 'recette', 'tableau'], pmin: 1, pmax: 20, nmax: 12, kmax: 12, dec: 1, personnes: [2, 3, 4, 5, 6, 8, 10, 12] }
        ] }
      ]
    },
    'volumes-vitesses-echelles': {
      actif: false,
      libelle: 'Volumes, vitesses, échelles',
      notes: 'CM2 uniquement.'
    }
  },
  // END grandeurs
  jeux: { morpion: true, puissance4: true, pendu: true, 'trouver-le-chiffre': true, 'eclair': true, 'compte-magique': true, 'suites-magiques': true, 'ranger': true, 'memory-nombres': true, 'horloge': true, 'marche': true, 'fractions': true }
};
