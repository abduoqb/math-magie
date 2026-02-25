const configSoustractions = {
  nomOperation: "soustractions",
  operationSign: "-",
  genererCalcul: (niveau) => {
    let a, b;
    if (niveau === 1) {
      // On s'assure que a est au moins 1 pour pouvoir soustraire quelque chose de différent
      a = Math.floor(Math.random() * 10) + 1; // 1 à 10
      b = Math.floor(Math.random() * a); // 0 à (a-1)
    } else if (niveau === 2) {
      a = Math.floor(Math.random() * 50) + 1; // 1 à 50
      b = Math.floor(Math.random() * a); // 0 à (a-1)
    } else {
      a = Math.floor(Math.random() * 100) + 1; // 1 à 100
      b = Math.floor(Math.random() * a); // 0 à (a-1)
    }
    
    return {
      a: a,
      b: b,
      resultat: a - b
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configSoustractions);
});
