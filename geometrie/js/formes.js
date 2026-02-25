const configFormes = {
  typeInterface: "boutons",
  dernierIndex: -1,
  
  genererQuestion: function() {
    const couleurs = ["#ff9800", "#4caf50", "#2196f3", "#e91e63", "#9c27b0", "#00bcd4", "#ffeb3b", "#f44336", "#795548"];
    const couleur = couleurs[Math.floor(Math.random() * couleurs.length)];

    const toutesLesFormes = [
      // --- FORMES PLATES ---
      { nom: "Carré", path: `<rect x="15" y="15" width="70" height="70" fill="${couleur}" stroke="#fff" stroke-width="2"/>` },
      { nom: "Triangle", path: `<polygon points="50,15 85,85 15,85" fill="${couleur}" stroke="#fff" stroke-width="2"/>` },
      { nom: "Rectangle", path: `<rect x="10" y="30" width="80" height="40" fill="${couleur}" stroke="#fff" stroke-width="2"/>` },
      { nom: "Cercle", path: `<circle cx="50" cy="50" r="35" fill="${couleur}" stroke="#fff" stroke-width="2"/>` },
      { nom: "Losange", path: `<polygon points="50,10 85,50 50,90 15,50" fill="${couleur}" stroke="#fff" stroke-width="2"/>` },
      { nom: "Pentagone", path: `<polygon points="50,10 90,40 75,85 25,85 10,40" fill="${couleur}" stroke="#fff" stroke-width="2"/>` },
      { nom: "Hexagone", path: `<polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="${couleur}" stroke="#fff" stroke-width="2"/>` },
      
      // --- SOLIDES (avec ombres simples pour l'effet 3D) ---
      { 
        nom: "Cube", 
        path: `
          <polygon points="25,45 55,45 55,75 25,75" fill="${couleur}"/>
          <polygon points="25,45 40,30 70,30 55,45" fill="${couleur}" fill-opacity="0.6"/>
          <polygon points="55,45 70,30 70,60 55,75" fill="${couleur}" fill-opacity="0.8"/>
          <path d="M25,45 L55,45 L55,75 L25,75 Z M25,45 L40,30 L70,30 L55,45 Z M55,45 L70,30 L70,60 L55,75 Z" fill="none" stroke="#fff" stroke-width="2"/>` 
      },
      { 
        nom: "Pyramide", 
        path: `
          <polygon points="50,15 80,75 20,75" fill="${couleur}"/>
          <polygon points="50,15 80,75 90,60" fill="${couleur}" fill-opacity="0.7"/>
          <path d="M50,15 L80,75 L20,75 Z M50,15 L80,75 L90,60 Z" fill="none" stroke="#fff" stroke-width="2"/>` 
      },
      { 
        nom: "Sphère", 
        path: `
          <defs><radialGradient id="gradSphere" cx="40%" cy="40%" r="50%"><stop offset="0%" style="stop-color:#fff;stop-opacity:0.4" /><stop offset="100%" style="stop-color:#000;stop-opacity:0.2" /></radialGradient></defs>
          <circle cx="50" cy="50" r="35" fill="${couleur}" stroke="#fff" stroke-width="2"/>
          <circle cx="50" cy="50" r="35" fill="url(#gradSphere)"/>` 
      },
      { 
        nom: "Cylindre", 
        path: `
          <ellipse cx="50" cy="30" rx="25" ry="10" fill="${couleur}" fill-opacity="0.7" stroke="#fff" stroke-width="2"/>
          <rect x="25" y="30" width="50" height="40" fill="${couleur}" stroke-width="0"/>
          <ellipse cx="50" cy="70" rx="25" ry="10" fill="${couleur}" stroke="#fff" stroke-width="2"/>
          <line x1="25" y1="30" x2="25" y2="70" stroke="#fff" stroke-width="2"/>
          <line x1="75" y1="30" x2="75" y2="70" stroke="#fff" stroke-width="2"/>` 
      },
      { 
        nom: "Pavé droit", 
        path: `
          <polygon points="15,45 65,45 65,75 15,75" fill="${couleur}"/>
          <polygon points="15,45 35,25 85,25 65,45" fill="${couleur}" fill-opacity="0.6"/>
          <polygon points="65,45 85,25 85,55 65,75" fill="${couleur}" fill-opacity="0.8"/>
          <path d="M15,45 L65,45 L65,75 L15,75 Z M15,45 L35,25 L85,25 L65,45 Z M65,45 L85,25 L85,55 L65,75 Z" fill="none" stroke="#fff" stroke-width="2"/>` 
      },
      { 
        nom: "Cône", 
        path: `
          <polygon points="50,15 80,75 20,75" fill="${couleur}"/>
          <ellipse cx="50" cy="75" rx="30" ry="10" fill="${couleur}" fill-opacity="0.8" stroke="#fff" stroke-width="2"/>
          <path d="M50,15 L20,75 M50,15 L80,75" fill="none" stroke="#fff" stroke-width="2"/>` 
      }
    ];

    let indexCible;
    do {
      indexCible = Math.floor(Math.random() * toutesLesFormes.length);
    } while (indexCible === this.dernierIndex);
    
    this.dernierIndex = indexCible;
    const cible = toutesLesFormes[indexCible];
    const svgFinal = `<svg viewBox="0 0 100 100">${cible.path}</svg>`;

    const autresNoms = toutesLesFormes
      .map(f => f.nom)
      .filter(nom => nom !== cible.nom);
    
    const mauvaisesReponses = [];
    for (let i = 0; i < 3; i++) {
      const indexAleatoire = Math.floor(Math.random() * autresNoms.length);
      mauvaisesReponses.push(autresNoms.splice(indexAleatoire, 1)[0]);
    }

    const options = [cible.nom, ...mauvaisesReponses].sort(() => Math.random() - 0.5);
    
    return {
      id: cible.nom,
      svg: svgFinal,
      reponse: cible.nom,
      instruction: "Quel est le nom de cette figure ?",
      options: options
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configFormes);
});
