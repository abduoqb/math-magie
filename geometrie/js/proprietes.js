const configProprietes = {
  typeInterface: "clavier",
  dernierIndex: -1,

  genererQuestion: function() {
    const couleurs = ["#ff9800", "#4caf50", "#2196f3", "#e91e63", "#9c27b0", "#00bcd4", "#ffeb3b", "#f44336", "#009688"];
    const couleur = couleurs[Math.floor(Math.random() * couleurs.length)];

    const figures = [
      // --- FORMES 2D (Sommets / Côtés) ---
      { nom: "Triangle", type: "2d", sommets: 3, cotes: 3, path: `<polygon points="50,15 85,85 15,85" fill="${couleur}" stroke="#334155" stroke-width="4"/>` },
      { nom: "Carré", type: "2d", sommets: 4, cotes: 4, path: `<rect x="15" y="15" width="70" height="70" fill="${couleur}" stroke="#334155" stroke-width="4"/>` },
      { nom: "Pentagone", type: "2d", sommets: 5, cotes: 5, path: `<polygon points="50,10 90,40 75,85 25,85 10,40" fill="${couleur}" stroke="#334155" stroke-width="4"/>` },
      { nom: "Hexagone", type: "2d", sommets: 6, cotes: 6, path: `<polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="${couleur}" stroke="#334155" stroke-width="4"/>` },
      { nom: "Octogone", type: "2d", sommets: 8, cotes: 8, path: `<polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="${couleur}" stroke="#334155" stroke-width="4"/>` },
      { nom: "Étoile", type: "2d", sommets: 10, cotes: 10, path: `<polygon points="50,5 63,38 98,38 70,59 78,95 50,75 22,95 30,59 2,38 37,38" fill="${couleur}" stroke="#334155" stroke-width="4"/>` },
      
      // --- FORMES 3D (Sommets / Faces / Arêtes) ---
      { 
        nom: "Cube", type: "3d", sommets: 8, faces: 6, aretes: 12,
        path: `
          <polygon points="25,45 55,45 55,75 25,75" fill="${couleur}"/>
          <polygon points="25,45 40,30 70,30 55,45" fill="${couleur}" fill-opacity="0.6"/>
          <polygon points="55,45 70,30 70,60 55,75" fill="${couleur}" fill-opacity="0.8"/>
          <path d="M25,45 L55,45 L55,75 L25,75 Z M25,45 L40,30 L70,30 L55,45 Z M55,45 L70,30 L70,60 L55,75 Z" fill="none" stroke="#334155" stroke-width="3"/>`
      },
      { 
        nom: "Pavé droit", type: "3d", sommets: 8, faces: 6, aretes: 12,
        path: `
          <polygon points="15,45 65,45 65,75 15,75" fill="${couleur}"/>
          <polygon points="15,45 35,25 85,25 65,45" fill="${couleur}" fill-opacity="0.6"/>
          <polygon points="65,45 85,25 85,55 65,75" fill="${couleur}" fill-opacity="0.8"/>
          <path d="M15,45 L65,45 L65,75 L15,75 Z M15,45 L35,25 L85,25 L65,45 Z M65,45 L85,25 L85,55 L65,75 Z" fill="none" stroke="#334155" stroke-width="3"/>`
      },
      { 
        nom: "Pyramide", type: "3d", sommets: 5, faces: 5, aretes: 8,
        path: `
          <polygon points="50,15 80,75 20,75" fill="${couleur}"/>
          <polygon points="50,15 80,75 90,60" fill="${couleur}" fill-opacity="0.7"/>
          <path d="M50,15 L80,75 L20,75 Z M50,15 L80,75 L90,60 Z" fill="none" stroke="#334155" stroke-width="3"/>`
      }
    ];

    let index;
    do {
      index = Math.floor(Math.random() * figures.length);
    } while (index === this.dernierIndex);
    this.dernierIndex = index;

    const fig = figures[index];
    let typeQ, reponse, instruction;

    if (fig.type === "2d") {
      const isSommets = Math.random() > 0.5;
      typeQ = isSommets ? "sommets" : "côtés";
      reponse = isSommets ? fig.sommets : fig.cotes;
      instruction = `Combien de ${typeQ} possède ce ${fig.nom} ?`;
    } else {
      const r = Math.random();
      if (r < 0.33) { typeQ = "sommets"; reponse = fig.sommets; }
      else if (r < 0.66) { typeQ = "faces"; reponse = fig.faces; }
      else { typeQ = "arêtes"; reponse = fig.aretes; }
      instruction = `Combien de ${typeQ} possède ce ${fig.nom} ?`;
    }

    return {
      id: `${fig.nom}-${typeQ}`,
      svg: `<svg viewBox="0 0 100 100">${fig.path}</svg>`,
      reponse: reponse,
      instruction: instruction,
      options: null
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configProprietes);
});
