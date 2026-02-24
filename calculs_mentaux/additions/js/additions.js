const configAdditions = {
  operationSign: "+",
  genererCalcul: () => {
    // Niveau 1 (basique) : nombres de 0 à 100
    let a = Math.floor(Math.random() * 101);
    let b = Math.floor(Math.random() * 101);
    return {
      a: a,
      b: b,
      resultat: a + b
    };
  }
};

// On initialise le moteur une fois que la page est prête
document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configAdditions);
});
