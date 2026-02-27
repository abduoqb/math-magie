const configMultiplications = {
  nomOperation: "multiplications",
  operationSign: "x",
  genererCalcul: (niveau) => {
    let a, b;
    if (niveau === 1) { a = Math.floor(Math.random() * 6); b = 2; } // Table de 2 (0-5)
    else if (niveau === 2) { a = Math.floor(Math.random() * 11); b = 2; } // Table de 2 (0-10)
    else if (niveau === 3) { a = Math.floor(Math.random() * 11); b = 5; } // Table de 5
    else if (niveau === 4) { a = Math.floor(Math.random() * 11); b = 10; } // Table de 10
    else if (niveau === 5) { a = Math.floor(Math.random() * 11); b = Math.floor(Math.random() * 3) + 2; } // Tables 2, 3, 4
    else if (niveau === 6) { a = Math.floor(Math.random() * 11); b = Math.floor(Math.random() * 5) + 1; } // Tables 1 à 5
    else if (niveau === 7) { a = Math.floor(Math.random() * 11); b = Math.floor(Math.random() * 3) + 6; } // Tables 6, 7, 8
    else if (niveau === 8) { a = Math.floor(Math.random() * 11); b = Math.floor(Math.random() * 9) + 2; } // Tables 2 à 10
    else if (niveau === 9) { a = Math.floor(Math.random() * 16); b = Math.floor(Math.random() * 11); } // Jusqu'à 15 x 10
    else { a = Math.floor(Math.random() * 21); b = Math.floor(Math.random() * 21); } // Tables jusqu'à 20 x 20
    
    return { a, b, resultat: a * b };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configMultiplications);
});
