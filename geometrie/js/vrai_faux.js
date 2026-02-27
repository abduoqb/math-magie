const configVraiFaux = {
  typeInterface: "boutons",
  nomOperation: "geometrie-vraifaux",
  derniereQuestionId: "",

  genererQuestion: function(niveau = 1) {
    // --- POOL NIVEAU 1 : Formes 2D simples ---
    const questionsNiv1 = [
      { 
        nom: "Carré", 
        svg: '<rect x="25" y="25" width="50" height="50" fill="#ff9800" stroke="#334155" stroke-width="4"/>',
        affirmations: [
          { t: "J'ai 4 côtés de la même longueur.", r: "Vrai" },
          { t: "J'ai 4 sommets.", r: "Vrai" },
          { t: "J'ai 3 angles droits seulement.", r: "Faux" },
          { t: "Je suis un polygone.", r: "Vrai" }
        ]
      },
      { 
        nom: "Triangle", 
        svg: '<polygon points="50,20 85,80 15,80" fill="#4caf50" stroke="#334155" stroke-width="4"/>',
        affirmations: [
          { t: "J'ai 3 côtés et 3 sommets.", r: "Vrai" },
          { t: "J'ai 4 angles droits.", r: "Faux" },
          { t: "Je suis une figure plate.", r: "Vrai" },
          { t: "J'ai plus de côtés qu'un carré.", r: "Faux" }
        ]
      },
      { 
        nom: "Cercle", 
        svg: '<circle cx="50" cy="50" r="35" fill="#e91e63" stroke="#334155" stroke-width="4"/>',
        affirmations: [
          { t: "Je n'ai aucun côté droit.", r: "Vrai" },
          { t: "Je suis un polygone.", r: "Faux" },
          { t: "J'ai 0 sommet.", r: "Vrai" },
          { t: "J'ai un sommet tout en haut.", r: "Faux" }
        ]
      },
      { 
        nom: "Rectangle", 
        svg: '<rect x="15" y="30" width="70" height="40" fill="#2196f3" stroke="#334155" stroke-width="4"/>',
        affirmations: [
          { t: "J'ai 4 angles droits.", r: "Vrai" },
          { t: "Tous mes côtés ont la même longueur.", r: "Faux" },
          { t: "J'ai 4 sommets.", r: "Vrai" },
          { t: "Je suis un polygone.", r: "Vrai" }
        ]
      }
    ];

    // --- POOL NIVEAU 2 : + Formes 2D avancées ---
    const questionsNiv2 = [
      ...questionsNiv1,
      { 
        nom: "Losange", 
        svg: '<polygon points="50,15 85,50 50,85 15,50" fill="#ffeb3b" stroke="#334155" stroke-width="4"/>',
        affirmations: [
          { t: "J'ai 4 côtés de même longueur.", r: "Vrai" },
          { t: "J'ai forcément 4 angles droits.", r: "Faux" },
          { t: "Je suis un polygone.", r: "Vrai" },
          { t: "J'ai 4 sommets.", r: "Vrai" }
        ]
      },
      { 
        nom: "Hexagone", 
        svg: '<polygon points="50,15 80,30 80,70 50,85 20,70 20,30" fill="#4caf50" stroke="#334155" stroke-width="4"/>',
        affirmations: [
          { t: "J'ai 6 côtés et 6 sommets.", r: "Vrai" },
          { t: "J'ai moins de côtés qu'un carré.", r: "Faux" },
          { t: "Je suis une figure plate.", r: "Vrai" },
          { t: "Je suis un solide.", r: "Faux" }
        ]
      },
      { 
        nom: "Pentagone", 
        svg: '<polygon points="50,15 85,45 70,85 30,85 15,45" fill="#3f51b5" stroke="#334155" stroke-width="4"/>',
        affirmations: [
          { t: "J'ai 5 côtés.", r: "Vrai" },
          { t: "J'ai 5 sommets.", r: "Vrai" },
          { t: "J'ai autant de côtés qu'un triangle.", r: "Faux" },
          { t: "Je suis un polygone.", r: "Vrai" }
        ]
      }
    ];

    // --- POOL NIVEAU 3 : + Solides 3D ---
    const questionsNiv3 = [
      ...questionsNiv2,
      { 
        nom: "Cube", 
        svg: '<path d="M30,45 L55,45 L55,70 L30,70 Z M30,45 L45,30 L70,30 L55,45 Z M55,45 L70,30 L70,55 L55,70 Z" fill="#2196f3" stroke="#334155" stroke-width="3"/>',
        affirmations: [
          { t: "Je possède 6 faces carrées.", r: "Vrai" },
          { t: "Je suis un solide (en 3D).", r: "Vrai" },
          { t: "Je suis une figure plate.", r: "Faux" },
          { t: "J'ai exactement 8 sommets.", r: "Vrai" }
        ]
      },
      { 
        nom: "Sphère", 
        svg: '<circle cx="50" cy="50" r="35" fill="#9c27b0" stroke="#334155" stroke-width="4"/>',
        affirmations: [
          { t: "Je ressemble à une balle.", r: "Vrai" },
          { t: "J'ai des arêtes droites.", r: "Faux" },
          { t: "Je n'ai aucune face plate.", r: "Vrai" },
          { t: "J'ai 0 sommet.", r: "Vrai" }
        ]
      },
      { 
        nom: "Pavé droit", 
        svg: '<path d="M20,45 L70,45 L70,70 L20,70 Z M20,45 L35,30 L85,30 L70,45 Z M70,45 L85,30 L85,55 L70,70 Z" fill="#00bcd4" stroke="#334155" stroke-width="3"/>',
        affirmations: [
          { t: "J'ai 8 sommets.", r: "Vrai" },
          { t: "Toutes mes faces sont des cercles.", r: "Faux" },
          { t: "Mes faces sont des rectangles ou carrés.", r: "Vrai" },
          { t: "Je suis un solide.", r: "Vrai" }
        ]
      },
      { 
        nom: "Cylindre", 
        svg: '<ellipse cx="50" cy="30" rx="25" ry="10" fill="#ff9800" fill-opacity="0.7" stroke="#334155" stroke-width="3"/><rect x="25" y="30" width="50" height="40" fill="#ff9800"/><ellipse cx="50" cy="70" rx="25" ry="10" fill="#ff9800" stroke="#334155" stroke-width="3"/><line x1="25" y1="30" x2="25" y2="70" stroke="#334155" stroke-width="3"/><line x1="75" y1="30" x2="75" y2="70" stroke="#334155" stroke-width="3"/>',
        affirmations: [
          { t: "J'ai deux faces rondes et plates.", r: "Vrai" },
          { t: "Je suis un solide.", r: "Vrai" },
          { t: "J'ai des sommets pointus.", r: "Faux" },
          { t: "Je ressemble à une boîte de conserve.", r: "Vrai" }
        ]
      },
      { 
        nom: "Cône", 
        svg: '<polygon points="50,15 80,75 20,75" fill="#e91e63"/><ellipse cx="50" cy="75" rx="30" ry="10" fill="#e91e63" fill-opacity="0.8" stroke="#334155" stroke-width="3"/><path d="M50,15 L20,75 M50,15 L80,75" fill="none" stroke="#334155" stroke-width="3"/>',
        affirmations: [
          { t: "J'ai un seul sommet pointu.", r: "Vrai" },
          { t: "Ma face plate est un cercle.", r: "Vrai" },
          { t: "Je suis une figure plate.", r: "Faux" },
          { t: "Je suis un solide.", r: "Vrai" }
        ]
      }
    ];

    let questions;
    if (niveau === 1) questions = questionsNiv1;
    else if (niveau === 2) questions = questionsNiv2;
    else questions = questionsNiv3;

    let f, a, questionId;
    do {
      f = questions[Math.floor(Math.random() * questions.length)];
      a = f.affirmations[Math.floor(Math.random() * f.affirmations.length)];
      questionId = f.nom + a.t;
    } while (questionId === this.derniereQuestionId);

    this.derniereQuestionId = questionId;

    return {
      id: questionId,
      svg: `<svg viewBox="0 0 100 100">${f.svg}</svg>`,
      reponse: a.r,
      instruction: `<span class="enonce">${f.nom} :</span> "${a.t}"`,
      options: ["Vrai", "Faux"]
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configVraiFaux);
});
