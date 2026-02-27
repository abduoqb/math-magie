const configSoustractions = {
  nomOperation: "soustractions",
  operationSign: "-",
  genererCalcul: (niveau) => {
    let a, b;
    if (niveau === 1) { a = Math.floor(Math.random() * 5) + 2; b = Math.floor(Math.random() * (a - 1)) + 1; } // 2-6 - (1 à a-1)
    else if (niveau === 2) { a = Math.floor(Math.random() * 9) + 2; b = Math.floor(Math.random() * (a - 1)) + 1; } // Jusqu'à 10
    else if (niveau === 3) { a = Math.floor(Math.random() * 11) + 10; b = Math.floor(Math.random() * 9) + 1; } // 10-20 - 1-9
    else if (niveau === 4) { a = Math.floor(Math.random() * 20) + 2; b = Math.floor(Math.random() * (a - 1)) + 1; } // Jusqu'à 20
    else if (niveau === 5) { a = Math.floor(Math.random() * 21) + 10; b = Math.floor(Math.random() * 15) + 1; } // Jusqu'à 30
    else if (niveau === 6) { a = Math.floor(Math.random() * 31) + 20; b = Math.floor(Math.random() * 20) + 1; } // 20-50 - 1-20
    else if (niveau === 7) { a = Math.floor(Math.random() * 49) + 2; b = Math.floor(Math.random() * (a - 1)) + 1; } // Jusqu'à 50
    else if (niveau === 8) { a = Math.floor(Math.random() * 79) + 2; b = Math.floor(Math.random() * (a - 1)) + 1; } // Jusqu'à 80
    else if (niveau === 9) { a = Math.floor(Math.random() * 99) + 2; b = Math.floor(Math.random() * (a - 1)) + 1; } // Jusqu'à 100
    else { a = Math.floor(Math.random() * 199) + 2; b = Math.floor(Math.random() * (a - 1)) + 1; } // Jusqu'à 200
    
    return { a, b, resultat: a - b };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configSoustractions);
});
