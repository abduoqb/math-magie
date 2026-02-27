const configTriangles = {
  typeInterface: "boutons",
  nomOperation: "geometrie-triangles",
  genererQuestion: function() {
    const types = ["Équilatéral", "Isocèle", "Rectangle"];
    const typeCible = types[Math.floor(Math.random() * types.length)];
    const couleur = "#A077EE";
    
    let points;
    if (typeCible === "Équilatéral") {
      points = "50,20 80,72 20,72";
    } else if (typeCible === "Isocèle") {
      points = "50,15 70,85 30,85";
    } else {
      points = "30,20 30,80 80,80";
    }

    const rotation = Math.floor(Math.random() * 360);
    const svg = `
      <svg viewBox="0 0 100 100">
        <polygon points="${points}" fill="${couleur}" fill-opacity="0.6" stroke="#334155" stroke-width="4" transform="rotate(${rotation}, 50, 50)"/>
      </svg>`;

    return {
      id: `triangle-${typeCible}-${rotation}`,
      svg: svg,
      reponse: typeCible,
      instruction: "De quel type est ce cristal triangulaire ?",
      options: ["Équilatéral", "Isocèle", "Rectangle"]
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configTriangles);
});
