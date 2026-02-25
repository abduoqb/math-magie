const configAngles = {
  typeInterface: "boutons",
  dernierAngle: -1,

  genererQuestion: function() {
    // 1. Définir le type d'angle à générer
    const types = ["Aigu", "Droit", "Obtus"];
    const typeCible = types[Math.floor(Math.random() * types.length)];
    
    let degres;
    if (typeCible === "Aigu") degres = Math.floor(Math.random() * 60) + 20; // 20 à 80
    else if (typeCible === "Droit") degres = 90;
    else degres = Math.floor(Math.random() * 60) + 110; // 110 à 170

    // 2. Calculer les points du SVG (angle tourné aléatoirement pour plus de difficulté)
    const rotationBase = Math.floor(Math.random() * 360);
    const rad1 = (rotationBase * Math.PI) / 180;
    const rad2 = ((rotationBase + degres) * Math.PI) / 180;
    
    const centre = { x: 50, y: 55 };
    const L = 35; // Longueur des segments
    
    const p1 = { x: centre.x + L * Math.cos(rad1), y: centre.y + L * Math.sin(rad1) };
    const p2 = { x: centre.x + L * Math.cos(rad2), y: centre.y + L * Math.sin(rad2) };

    // Dessin de l'arc de l'angle
    const rArc = 10;
    const pArc1 = { x: centre.x + rArc * Math.cos(rad1), y: centre.y + rArc * Math.sin(rad1) };
    const pArc2 = { x: centre.x + rArc * Math.cos(rad2), y: centre.y + rArc * Math.sin(rad2) };
    const largeArcFlag = degres > 180 ? 1 : 0;
    
    const pathArc = `<path d="M ${pArc1.x} ${pArc1.y} A ${rArc} ${rArc} 0 ${largeArcFlag} 1 ${pArc2.x} ${pArc2.y}" fill="none" stroke="#ff9800" stroke-width="3"/>`;

    const svg = `
      <svg viewBox="0 0 100 100">
        <line x1="${centre.x}" y1="${centre.y}" x2="${p1.x}" y2="${p1.y}" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <line x1="${centre.x}" y1="${centre.y}" x2="${p2.x}" y2="${p2.y}" stroke="white" stroke-width="3" stroke-linecap="round"/>
        ${typeCible === "Droit" ? 
          `<rect x="-4" y="-4" width="8" height="8" fill="none" stroke="#ff9800" stroke-width="2" transform="translate(${centre.x},${centre.y}) rotate(${rotationBase + 45})"/>` : 
          pathArc}
        <circle cx="${centre.x}" cy="${centre.y}" r="3" fill="#ff9800"/>
      </svg>`;

    return {
      svg: svg,
      reponse: typeCible,
      instruction: "Observe bien l'angle orange :",
      options: ["Aigu", "Droit", "Obtus"]
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configAngles);
});
