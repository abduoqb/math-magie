const configMultiplications = {
  nomOperation: "multiplications",
  operationSign: "x",
  genererCalcul: (niveau) => {
    let a, b;
    if (niveau === 1) {
      // Tables de 1 à 10
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
    } else if (niveau === 2) {
      // Tables de 1 à 20
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
    } else {
      // Tables 1-100 * [10, 20, ..., 90]
      a = Math.floor(Math.random() * 100) + 1;
      const dizaines = [10, 20, 30, 40, 50, 60, 70, 80, 90];
      b = dizaines[Math.floor(Math.random() * dizaines.length)];
    }
    
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
