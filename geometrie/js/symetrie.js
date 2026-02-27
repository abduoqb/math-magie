const configSymetrie = {
  typeInterface: "boutons",
  nomOperation: "geometrie-symetrie",
  genererQuestion: function(niveau = 1) {
    const estSymetrique = Math.random() > 0.5;
    const couleur = "#4caf50";

    // Niv1 : formes simples (3-4 points), erreurs grossières
    // Niv2 : formes moyennes (5-6 points), erreurs modérées
    // Niv3 : formes complexes (7-9 points), erreurs subtiles
    let nbPoints, erreurAmplitude;
    if (niveau === 1) {
      nbPoints = Math.floor(Math.random() * 2) + 3; // 3-4 points
      erreurAmplitude = 15;
    } else if (niveau === 2) {
      nbPoints = Math.floor(Math.random() * 2) + 5; // 5-6 points
      erreurAmplitude = 10;
    } else {
      nbPoints = Math.floor(Math.random() * 3) + 7; // 7-9 points
      erreurAmplitude = 6;
    }

    const pointsGauche = [];
    for (let i = 0; i < nbPoints; i++) {
      pointsGauche.push({
        x: 5 + Math.random() * 40,
        y: 10 + (i * (80 / nbPoints)) + (Math.random() * 10 - 5)
      });
    }
    pointsGauche.sort((a, b) => a.y - b.y);

    let pointsDroite = pointsGauche.map(p => ({
      x: 100 - p.x,
      y: p.y
    }));

    if (!estSymetrique) {
      const indexErreur = Math.floor(Math.random() * pointsDroite.length);

      if (niveau === 1) {
        // Niv1 : erreurs très visibles (translation ou gros décalage)
        const typeErreur = Math.random();
        if (typeErreur < 0.5) {
          const decalage = Math.random() > 0.5 ? erreurAmplitude : -erreurAmplitude;
          pointsDroite = pointsDroite.map(p => ({...p, y: p.y + decalage}));
        } else {
          pointsDroite[indexErreur].x += (Math.random() > 0.5 ? erreurAmplitude : -erreurAmplitude);
          pointsDroite[indexErreur].y += (Math.random() > 0.5 ? erreurAmplitude : -erreurAmplitude);
        }
      } else if (niveau === 2) {
        // Niv2 : erreurs modérées (un ou deux points décalés)
        pointsDroite[indexErreur].x += (Math.random() > 0.5 ? erreurAmplitude : -erreurAmplitude);
        pointsDroite[indexErreur].y += (Math.random() > 0.5 ? erreurAmplitude : -erreurAmplitude);
      } else {
        // Niv3 : erreurs subtiles (petit décalage sur un seul point)
        const dir = Math.random() > 0.5 ? 1 : -1;
        pointsDroite[indexErreur].x += dir * (erreurAmplitude + Math.random() * 3);
        pointsDroite[indexErreur].y += dir * (erreurAmplitude * 0.5);
      }
    }

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
