const configAngles = {
  typeInterface: "boutons",
  nomOperation: "geometrie-angles",
  dernierAngle: -1,

  genererQuestion: function(niveau = 1) {
    // Niv1 : Aigu / Droit uniquement
    // Niv2 : + Obtus
    // Niv3 : + Plat + Nul (0°)
    let types, degres;
    if (niveau === 1) {
      types = ["Aigu", "Droit"];
    } else if (niveau === 2) {
      types = ["Aigu", "Droit", "Obtus"];
    } else {
      types = ["Nul", "Aigu", "Droit", "Obtus", "Plat"];
    }

    const typeCible = types[Math.floor(Math.random() * types.length)];

    if (typeCible === "Nul") degres = 0;
    else if (typeCible === "Aigu") degres = Math.floor(Math.random() * 60) + 20; // 20-80°
    else if (typeCible === "Droit") degres = 90;
    else if (typeCible === "Obtus") degres = Math.floor(Math.random() * 60) + 100; // 100-160°
    else degres = 180; // Plat

    // Rotation aléatoire pour la difficulté
    // Niv1 : pas de rotation (plus facile), Niv2 : rotation modérée, Niv3 : rotation totale
    let rotationBase;
    if (niveau === 1) rotationBase = 0;
    else if (niveau === 2) rotationBase = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
    else rotationBase = Math.floor(Math.random() * 360);

    const rad1 = (rotationBase * Math.PI) / 180;
    const rad2 = ((rotationBase + degres) * Math.PI) / 180;

    const centre = { x: 50, y: 55 };
    const L = 35;

    const p1 = { x: centre.x + L * Math.cos(rad1), y: centre.y + L * Math.sin(rad1) };
    const p2 = { x: centre.x + L * Math.cos(rad2), y: centre.y + L * Math.sin(rad2) };

    // Arc de l'angle
    const rArc = 10;
    const pArc1 = { x: centre.x + rArc * Math.cos(rad1), y: centre.y + rArc * Math.sin(rad1) };
    const pArc2 = { x: centre.x + rArc * Math.cos(rad2), y: centre.y + rArc * Math.sin(rad2) };
    const largeArcFlag = degres > 180 ? 1 : 0;

    let marqueur;
    if (typeCible === "Droit") {
      marqueur = `<rect x="-4" y="-4" width="8" height="8" fill="none" stroke="#FF8C00" stroke-width="3" transform="translate(${centre.x},${centre.y}) rotate(${rotationBase + 45})"/>`;
    } else if (typeCible === "Nul") {
      marqueur = `<circle cx="${centre.x}" cy="${centre.y}" r="5" fill="none" stroke="#FF8C00" stroke-width="2"/>`;
    } else if (typeCible === "Plat") {
      marqueur = `<path d="M ${pArc1.x} ${pArc1.y} A ${rArc} ${rArc} 0 0 1 ${pArc2.x} ${pArc2.y}" fill="none" stroke="#FF8C00" stroke-width="3"/>`;
    } else {
      marqueur = `<path d="M ${pArc1.x} ${pArc1.y} A ${rArc} ${rArc} 0 ${largeArcFlag} 1 ${pArc2.x} ${pArc2.y}" fill="none" stroke="#FF8C00" stroke-width="3"/>`;
    }

    const svg = `
      <svg viewBox="0 0 100 100">
        <line x1="${centre.x}" y1="${centre.y}" x2="${p1.x}" y2="${p1.y}" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="${centre.x}" y1="${centre.y}" x2="${p2.x}" y2="${p2.y}" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        ${marqueur}
        <circle cx="${centre.x}" cy="${centre.y}" r="3" fill="#FF8C00"/>
      </svg>`;

    return {
      id: `${typeCible}-${degres}-${rotationBase}`,
      svg: svg,
      reponse: typeCible,
      instruction: niveau >= 3 ? "Quel est le type de cet angle ?" : "Observe bien l'angle orange :",
      options: types
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configAngles);
});
