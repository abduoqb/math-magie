const configTriangles = {
  typeInterface: "boutons",
  nomOperation: "geometrie-triangles",
  genererQuestion: function(niveau = 1) {
    // Niv1 : Équilatéral / Isocèle (facile à distinguer)
    // Niv2 : + Rectangle
    // Niv3 : + Quelconque (scalène)
    let pool;
    if (niveau === 1) {
      pool = [
        { nom: "Équilatéral", points: "50,20 80,72 20,72" },
        { nom: "Isocèle",     points: "50,15 70,85 30,85" }
      ];
    } else if (niveau === 2) {
      pool = [
        { nom: "Équilatéral", points: "50,20 80,72 20,72" },
        { nom: "Isocèle",     points: "50,15 70,85 30,85" },
        { nom: "Rectangle",   points: "30,20 30,80 80,80" }
      ];
    } else {
      pool = [
        { nom: "Équilatéral", points: "50,20 80,72 20,72" },
        { nom: "Isocèle",     points: "50,15 70,85 30,85" },
        { nom: "Rectangle",   points: "30,20 30,80 80,80" },
        { nom: "Quelconque",  points: "20,25 85,65 35,80" }
      ];
    }

    const cible = pool[Math.floor(Math.random() * pool.length)];
    const couleur = "#A077EE";

    // Niv1 : rotation faible, Niv2 : modérée, Niv3 : totale
    let rotation;
    if (niveau === 1) rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
    else if (niveau === 2) rotation = Math.floor(Math.random() * 4) * 90 + Math.floor(Math.random() * 30);
    else rotation = Math.floor(Math.random() * 360);

    const svg = `
      <svg viewBox="0 0 100 100">
        <polygon points="${cible.points}" fill="${couleur}" fill-opacity="0.6" stroke="#334155" stroke-width="4" transform="rotate(${rotation}, 50, 50)"/>
      </svg>`;

    const options = pool.map(t => t.nom);

    return {
      id: `triangle-${cible.nom}-${rotation}`,
      svg: svg,
      reponse: cible.nom,
      instruction: "De quel type est ce cristal triangulaire ?",
      options: options
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configTriangles);
});
