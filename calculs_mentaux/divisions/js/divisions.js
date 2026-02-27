const configDivisions = {
  nomOperation: "divisions",
  operationSign: "÷",
  genererCalcul: (niveau) => {
    let diviseur, quotient;
    if (niveau === 1) { diviseur = 2; quotient = Math.floor(Math.random() * 6) + 1; } // Div par 2 (R: 1-5)
    else if (niveau === 2) { diviseur = 2; quotient = Math.floor(Math.random() * 10) + 1; } // Div par 2 (R: 1-10)
    else if (niveau === 3) { diviseur = 10; quotient = Math.floor(Math.random() * 10) + 1; } // Div par 10
    else if (niveau === 4) { diviseur = 5; quotient = Math.floor(Math.random() * 10) + 1; } // Div par 5
    else if (niveau === 5) { diviseur = Math.floor(Math.random() * 3) + 2; quotient = Math.floor(Math.random() * 10) + 1; } // Div par 2, 3, 4
    else if (niveau === 6) { diviseur = Math.floor(Math.random() * 4) + 2; quotient = Math.floor(Math.random() * 10) + 1; } // Div par 2 à 5
    else if (niveau === 7) { diviseur = Math.floor(Math.random() * 9) + 2; quotient = Math.floor(Math.random() * 6) + 1; } // Div par 2 à 10 (R: 1-5)
    else if (niveau === 8) { diviseur = Math.floor(Math.random() * 9) + 2; quotient = Math.floor(Math.random() * 10) + 1; } // Div par 2 à 10 (R: 1-10)
    else if (niveau === 9) { diviseur = Math.floor(Math.random() * 11) + 2; quotient = Math.floor(Math.random() * 16) + 1; } // Div par 2 à 12 (R: 1-15)
    else { diviseur = Math.floor(Math.random() * 19) + 2; quotient = Math.floor(Math.random() * 21) + 1; } // Jusqu'à 20
    
    let a = diviseur * quotient; 
    let b = diviseur;

    return { a, b, resultat: quotient };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configDivisions);
});
