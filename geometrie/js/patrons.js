const configPatrons = {
  typeInterface: "boutons",
  nomOperation: "geometrie-patrons",
  genererQuestion: function(niveau = 1) {
    // Couleurs par solide
    const couleurs = {
      "Cube": "#FF8C00",
      "Pyramide": "#A077EE",
      "Pavé droit": "#41B6E6",
      "Cylindre": "#6BCB77",
      "Prisme triangulaire": "#FF6B6B",
      "Tétraèdre": "#F59E0B"
    };
    const s = "#334155";
    const w = "2";
    const o = "0.4";

    // Tous les patrons disponibles
    const tousLesPatrons = {
      "Cube": function(c) {
        return `
          <rect x="40" y="10" width="20" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="20" y="30" width="20" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="40" y="30" width="20" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="60" y="30" width="20" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="40" y="50" width="20" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="40" y="70" width="20" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
        `;
      },
      "Pyramide": function(c) {
        return `
          <rect x="40" y="40" width="20" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <polygon points="40,40 60,40 50,20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <polygon points="60,40 60,60 80,50" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <polygon points="40,60 60,60 50,80" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <polygon points="40,40 40,60 20,50" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
        `;
      },
      "Pavé droit": function(c) {
        return `
          <rect x="35" y="5" width="30" height="15" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="35" y="20" width="30" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="35" y="40" width="30" height="15" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="35" y="55" width="30" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="5" y="20" width="30" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="65" y="20" width="30" height="20" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
        `;
      },
      "Cylindre": function(c) {
        return `
          <rect x="25" y="30" width="50" height="40" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <ellipse cx="50" cy="20" rx="18" ry="12" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <ellipse cx="50" cy="80" rx="18" ry="12" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
        `;
      },
      "Prisme triangulaire": function(c) {
        return `
          <rect x="20" y="30" width="20" height="40" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="40" y="30" width="20" height="40" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <rect x="60" y="30" width="20" height="40" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <polygon points="40,30 60,30 50,15" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <polygon points="40,70 60,70 50,85" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
        `;
      },
      "Tétraèdre": function(c) {
        const h = 17.3;
        return `
          <polygon points="40,50 60,50 50,${50 - h}" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <polygon points="40,50 60,50 50,${50 + h}" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <polygon points="40,50 50,${50 - h} ${40 - h},${50 - h/2}" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
          <polygon points="60,50 50,${50 - h} ${60 + h},${50 - h/2}" fill="${c}" fill-opacity="${o}" stroke="${s}" stroke-width="${w}"/>
        `;
      }
    };

    // Niv1 : Cube / Pyramide (très différents)
    // Niv2 : + Pavé droit / Cylindre 
    // Niv3 : + Prisme triangulaire / Tétraèdre (tous les 6)
    let noms;
    if (niveau === 1) {
      noms = ["Cube", "Pyramide"];
    } else if (niveau === 2) {
      noms = ["Cube", "Pyramide", "Pavé droit", "Cylindre"];
    } else {
      noms = ["Cube", "Pyramide", "Pavé droit", "Cylindre", "Prisme triangulaire", "Tétraèdre"];
    }

    const typeCible = noms[Math.floor(Math.random() * noms.length)];
    const c = couleurs[typeCible];
    const path = tousLesPatrons[typeCible](c);

    // Rotation : Niv1 pas de rotation, Niv2 rotation modérée, Niv3 rotation totale
    let rotation;
    if (niveau === 1) rotation = 0;
    else if (niveau === 2) rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
    else rotation = Math.floor(Math.random() * 4) * 90;

    const svg = `
      <svg viewBox="0 0 100 100">
        <g transform="rotate(${rotation}, 50, 50)">${path}</g>
      </svg>`;

    return {
      id: `patron-${typeCible}-${rotation}`,
      svg: svg,
      reponse: typeCible,
      instruction: "Si on replie ce parchemin, quel solide va-t-on obtenir ?",
      options: noms
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configPatrons);
});
