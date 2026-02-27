const configQuadrilateres = {
  typeInterface: "boutons",
  nomOperation: "geometrie-quadrilateres",
  genererQuestion: function() {
    const types = ["Losange", "Parallélogramme", "Trapèze"];
    const typeCible = types[Math.floor(Math.random() * types.length)];
    const couleur = "#41B6E6";
    
    let points;
    if (typeCible === "Losange") {
      points = "50,10 80,50 50,90 20,50"; // Plus étiré verticalement pour bien différencier du carré
    } else if (typeCible === "Parallélogramme") {
      points = "25,30 85,30 75,70 15,70";
    } else {
      points = "30,30 70,30 85,70 15,70";
    }

    const rotation = Math.floor(Math.random() * 360);
    const svg = `
      <svg viewBox="0 0 100 100">
        <polygon points="${points}" fill="${couleur}" fill-opacity="0.6" stroke="#334155" stroke-width="4" transform="rotate(${rotation}, 50, 50)"/>
      </svg>`;

    return {
      id: `quad-${typeCible}-${rotation}`,
      svg: svg,
      reponse: typeCible,
      instruction: "Quel est ce type de tapis volant ?",
      options: ["Losange", "Parallélogramme", "Trapèze"]
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configQuadrilateres);
});
