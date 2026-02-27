const configAdditions = {
  nomOperation: "additions",
  operationSign: "+",
  genererCalcul: (niveau) => {
    let a, b;
    if (niveau === 1) { a = Math.floor(Math.random() * 5) + 1; b = Math.floor(Math.random() * 5) + 1; } // 1-5 + 1-5 (Max 10)
    else if (niveau === 2) { a = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1; } // 1-10 + 1-10
    else if (niveau === 3) { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 10) + 1; } 
    else if (niveau === 4) { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; } 
    else if (niveau === 5) { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 20) + 1; } 
    else if (niveau === 6) { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 50) + 1; } 
    else if (niveau === 7) { a = Math.floor(Math.random() * 100) + 1; b = Math.floor(Math.random() * 50) + 1; } 
    else if (niveau === 8) { a = Math.floor(Math.random() * 100) + 1; b = Math.floor(Math.random() * 100) + 1; } 
    else if (niveau === 9) { a = Math.floor(Math.random() * 500) + 1; b = Math.floor(Math.random() * 500) + 1; } 
    else { a = Math.floor(Math.random() * 1000) + 1; b = Math.floor(Math.random() * 1000) + 1; } 
    
    return { a, b, resultat: a + b };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configAdditions);
});
