const configSymetrie = {
  typeInterface: "boutons",
  genererQuestion: function() {
    const estSymetrique = Math.random() > 0.5;
    const couleur = "#4caf50";
    
    // On génère plus de points pour complexifier la forme (5 à 7 points)
    const nbPoints = Math.floor(Math.random() * 3) + 5;
    const pointsGauche = [];
    
    for(let i = 0; i < nbPoints; i++) {
        pointsGauche.push({
            x: 5 + Math.random() * 40, // Entre 5 et 45 (gauche de l'axe)
            y: 10 + (i * (80 / nbPoints)) + (Math.random() * 10 - 5) // Répartis verticalement
        });
    }
    
    // Trier les points par Y pour éviter que les lignes ne se croisent trop salement
    pointsGauche.sort((a, b) => a.y - b.y);

    // Reflet à droite (axe à x=50)
    let pointsDroite = pointsGauche.map(p => ({
      x: 100 - p.x,
      y: p.y
    }));

    // Si on veut une erreur (Non symétrique)
    if (!estSymetrique) {
        const typeErreur = Math.random();
        const indexErreur = Math.floor(Math.random() * pointsDroite.length);

        if (typeErreur < 0.33) {
            // Erreur de translation : on décale tout un côté
            const decalage = Math.random() > 0.5 ? 8 : -8;
            pointsDroite = pointsDroite.map(p => ({...p, y: p.y + decalage}));
        } else if (typeErreur < 0.66) {
            // Erreur locale : un seul point est faux
            pointsDroite[indexErreur].x += (Math.random() > 0.5 ? 12 : -12);
            pointsDroite[indexErreur].y += (Math.random() > 0.5 ? 10 : -10);
        } else {
            // Erreur de forme : on supprime ou on inverse un point
            pointsDroite[indexErreur].x = 50 + Math.random() * 40;
            pointsDroite[indexErreur].y = Math.random() * 100;
        }
    }

    // Construction du tracé
    // On part du haut de l'axe, on fait la gauche, le bas, la droite, et on revient au haut.
    const pointsPath = [{x: 50, y: 5}, ...pointsGauche, {x: 50, y: 95}, ...pointsDroite.reverse()];
    const pathData = pointsPath.map((p, i) => (i === 0 ? "M" : "L") + ` ${p.x},${p.y}`).join(" ") + " Z";

    const svg = `
      <svg viewBox="0 0 100 100">
        <path d="${pathData}" fill="${couleur}" fill-opacity="0.6" stroke="#334155" stroke-width="3"/>
        <line x1="50" y1="0" x2="50" y2="100" stroke="#f44336" stroke-width="2" stroke-dasharray="4"/>
      </svg>`;

    return {
      id: `sym-${estSymetrique}-${Math.floor(Math.random()*5000)}`,
      svg: svg,
      reponse: estSymetrique ? "Oui" : "Non",
      instruction: "Est-ce que les deux côtés sont identiques ?",
      options: ["Oui", "Non"]
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configSymetrie);
});
