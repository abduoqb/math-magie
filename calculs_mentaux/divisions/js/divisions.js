const configDivisions = {
  operationSign: "÷",
  genererCalcul: () => {
    // Niveau 1 (basique) : Divisions simples sans reste (tables de 1 à 10)
    // Astuce : On génère le diviseur et le quotient, puis on calcule le dividende (a).
    let diviseur = Math.floor(Math.random() * 10) + 1; // b (1 à 10)
    let quotient = Math.floor(Math.random() * 10) + 1; // résultat
    let a = diviseur * quotient; 
    let b = diviseur;

    return {
      a: a,
      b: b,
      resultat: a / b
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configDivisions);
});
