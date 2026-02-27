const configPatrons = {
  typeInterface: "boutons",
  nomOperation: "geometrie-patrons",
  genererQuestion: function() {
    const types = ["Cube", "Pyramide"];
    const typeCible = types[Math.floor(Math.random() * types.length)];
    const couleur = "#FF8C00";
    
    let path;
    if (typeCible === "Cube") {
      path = `
        <rect x="40" y="10" width="20" height="20" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
        <rect x="20" y="30" width="20" height="20" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
        <rect x="40" y="30" width="20" height="20" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
        <rect x="60" y="30" width="20" height="20" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
        <rect x="40" y="50" width="20" height="20" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
        <rect x="40" y="70" width="20" height="20" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
      `;
    } else {
      path = `
        <rect x="40" y="40" width="20" height="20" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
        <polygon points="40,40 60,40 50,20" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
        <polygon points="60,40 60,60 80,50" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
        <polygon points="40,60 60,60 50,80" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
        <polygon points="40,40 40,60 20,50" fill="${couleur}" fill-opacity="0.4" stroke="#334155" stroke-width="2"/>
      `;
    }

    const rotation = Math.floor(Math.random() * 4) * 90;
    const svg = `
      <svg viewBox="0 0 100 100">
        <g transform="rotate(${rotation}, 50, 50)">${path}</g>
      </svg>`;

    return {
      id: `patron-${typeCible}-${rotation}`,
      svg: svg,
      reponse: typeCible,
      instruction: "Si on replie ce parchemin, quel solide va-t-on obtenir ?",
      options: ["Cube", "Pyramide"]
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configPatrons);
});
