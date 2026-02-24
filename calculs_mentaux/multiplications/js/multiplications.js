const configMultiplications = {
  operationSign: "x",
  genererCalcul: () => {
    // Niveau 1 (basique) : Tables de multiplication de 1 à 10
    let a = Math.floor(Math.random() * 10) + 1; // 1 à 10
    let b = Math.floor(Math.random() * 10) + 1; // 1 à 10
    return {
      a: a,
      b: b,
      resultat: a * b
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configMultiplications);
});
