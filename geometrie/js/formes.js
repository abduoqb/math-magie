const configFormes = {
  typeInterface: "boutons",
  genererQuestion: () => {
    const formes = [
      { 
        nom: "Carré", 
        svg: '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#ff9800" stroke="#fff" stroke-width="2"/></svg>' 
      },
      { 
        nom: "Triangle", 
        svg: '<svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="#4caf50" stroke="#fff" stroke-width="2"/></svg>' 
      },
      { 
        nom: "Rectangle", 
        svg: '<svg viewBox="0 0 100 100"><rect x="10" y="25" width="80" height="50" fill="#2196f3" stroke="#fff" stroke-width="2"/></svg>' 
      },
      { 
        nom: "Cercle", 
        svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#e91e63" stroke="#fff" stroke-width="2"/></svg>' 
      }
    ];

    const formeAleatoire = formes[Math.floor(Math.random() * formes.length)];
    
    return {
      svg: formeAleatoire.svg,
      reponse: formeAleatoire.nom,
      instruction: "Appuie sur le bon bouton :",
      options: ["Carré", "Triangle", "Rectangle", "Cercle"]
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configFormes);
});
