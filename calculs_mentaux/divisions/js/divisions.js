const configDivisions = {
  nomOperation: "divisions",
  operationSign: "÷",
  genererCalcul: (niveau) => {
    let diviseur, quotient, a, b;
    
    if (niveau === 1) {
      // Niveau simple : Diviseur petit (2, 5, 10), Quotient de 1 à 10
      const diviseursSimples = [2, 5, 10];
      diviseur = diviseursSimples[Math.floor(Math.random() * diviseursSimples.length)];
      quotient = Math.floor(Math.random() * 10) + 1;
    } else if (niveau === 2) {
      // Niveau classique : Tables de division de 2 à 10, Quotient de 1 à 10
      diviseur = Math.floor(Math.random() * 9) + 2; // 2 à 10
      quotient = Math.floor(Math.random() * 10) + 1;
    } else {
      // Niveau expert : Diviseur de 2 à 20, Quotient de 1 à 20
      diviseur = Math.floor(Math.random() * 19) + 2; // 2 à 20
      quotient = Math.floor(Math.random() * 20) + 1;
    }

    a = diviseur * quotient; 
    b = diviseur;

    return {
      a: a,
      b: b,
      resultat: quotient
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configDivisions);
});
