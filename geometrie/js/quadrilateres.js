const configQuadrilateres = {
  typeInterface: "boutons",
  nomOperation: "geometrie-quadrilateres",
  genererQuestion: function(niveau = 1) {
    // Niv1 : Losange / Trapèze (très différents)
    // Niv2 : + Parallélogramme
    // Niv3 : + Rectangle + Cerf-volant (formes proches, plus subtil)
    let pool;
    if (niveau === 1) {
      pool = [
        { nom: "Losange",  points: "50,10 80,50 50,90 20,50" },
        { nom: "Trapèze",  points: "30,30 70,30 85,70 15,70" }
      ];
    } else if (niveau === 2) {
      pool = [
        { nom: "Losange",           points: "50,10 80,50 50,90 20,50" },
        { nom: "Parallélogramme",   points: "25,30 85,30 75,70 15,70" },
        { nom: "Trapèze",           points: "30,30 70,30 85,70 15,70" }
      ];
    } else {
      pool = [
        { nom: "Losange",           points: "50,10 80,50 50,90 20,50" },
        { nom: "Parallélogramme",   points: "25,30 85,30 75,70 15,70" },
        { nom: "Trapèze",           points: "30,30 70,30 85,70 15,70" },
        { nom: "Rectangle",         points: "20,25 80,25 80,75 20,75" },
        { nom: "Cerf-volant",       points: "50,10 75,45 50,90 25,45" }
      ];
    }

    const cible = pool[Math.floor(Math.random() * pool.length)];
    const couleur = "#41B6E6";

    let rotation;
    if (niveau === 1) rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
    else if (niveau === 2) rotation = Math.floor(Math.random() * 4) * 90 + Math.floor(Math.random() * 45);
    else rotation = Math.floor(Math.random() * 360);

    const svg = `
      <svg viewBox="0 0 100 100">
        <polygon points="${cible.points}" fill="${couleur}" fill-opacity="0.6" stroke="#334155" stroke-width="4" transform="rotate(${rotation}, 50, 50)"/>
      </svg>`;

    const options = pool.map(t => t.nom);

    return {
      id: `quad-${cible.nom}-${rotation}`,
      svg: svg,
      reponse: cible.nom,
      instruction: "Quel est ce type de tapis volant ?",
      options: options
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configQuadrilateres);
});
