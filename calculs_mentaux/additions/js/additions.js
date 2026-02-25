const configAdditions = {
  nomOperation: "additions",
  operationSign: "+",
  genererCalcul: (niveau) => {
    let a, b;
    if (niveau === 1) {
      a = Math.floor(Math.random() * 11); // 0 à 10
      b = Math.floor(Math.random() * 11);
    } else if (niveau === 2) {
      a = Math.floor(Math.random() * 101); // 0 à 100
      b = Math.floor(Math.random() * 101);
    } else {
      a = Math.floor(Math.random() * 1001); // 0 à 1000
      b = Math.floor(Math.random() * 1001);
    }
    
    return {
      a: a,
      b: b,
      resultat: a + b
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configAdditions);
});
