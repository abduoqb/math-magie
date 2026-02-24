const configSoustractions = {
  operationSign: "-",
  genererCalcul: () => {
    // Niveau 1 (basique) : On génère deux nombres, 
    // et on s'assure que 'a' est toujours le plus grand pour éviter les nombres négatifs.
    let num1 = Math.floor(Math.random() * 101);
    let num2 = Math.floor(Math.random() * 101);
    
    let a = Math.max(num1, num2);
    let b = Math.min(num1, num2);
    
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
