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
    }
  },

  jeux: { morpion: true, puissance4: true, pendu: true, 'trouver-le-chiffre': true }
};
