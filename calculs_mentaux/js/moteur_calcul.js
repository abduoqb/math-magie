class MoteurCalcul {
  constructor(config) {
    this.operationSign = config.operationSign;
    this.genererCalcul = config.genererCalcul;
    
    this.score = 0;
    this.tentatives = 0;

    // Elements DOM
    this.elCalcul = document.getElementById("calcul");
    this.elSaisie = document.getElementById("saisieReponse");
    this.elInstructions = document.getElementById("instructions");
    this.elBoutonChanger = document.getElementById("changer");
    this.elStatistique = document.querySelector(".cadre span");
    this.elCadre = document.querySelector(".cadre");

    this.currentResultat = null;

    this.initEvents();
    this.nouveauCalcul();
  }

  initEvents() {
    // Validation avec la touche Entrée pour plus d'autonomie
    this.elSaisie?.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.validerReponse();
      }
    });
    
    // Nouveau calcul via le bouton
    this.elBoutonChanger?.addEventListener("click", () => {
      this.nouveauCalcul();
    });
  }

  nouveauCalcul() {
    const { a, b, resultat } = this.genererCalcul();
    this.currentResultat = resultat;
    
    // Affichage
    this.elCalcul.innerText = `${a} ${this.operationSign} ${b} = `;
    this.elSaisie.value = "";
    this.elInstructions.innerText = "Saisis ta réponse et appuie sur Entrée";
    this.elInstructions.className = ""; // Reset class
    this.elCadre.classList.remove("succes", "erreur");
    
    this.elSaisie?.focus();
  }

  validerReponse() {
    if (this.elSaisie.value === "") return; // Ne rien faire si vide

    const saisiResultat = Number(this.elSaisie.value);
    this.tentatives++;

    // On retire les classes d'animation pour pouvoir les rejouer
    this.elCadre.classList.remove("succes", "erreur");
    
    // Petite astuce pour forcer le reflow du navigateur et rejouer l'animation CSS
    void this.elCadre.offsetWidth; 

    if (saisiResultat === this.currentResultat) {
      this.score++;
      this.elInstructions.innerText = "C'est exact, bien joué ! ✨";
      this.elInstructions.className = "texte-succes";
      this.elCadre.classList.add("succes");
    } else {
      this.elInstructions.innerText = `Oups ! ${this.elCalcul.innerText} ${this.currentResultat}`;
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");
    }

    // Auto passage au calcul suivant après 1.5s
    setTimeout(() => this.nouveauCalcul(), 1500);

    this.majStatistiques();
  }

  majStatistiques() {
    if (this.tentatives > 0 && this.elStatistique) {
      const pourcentage = Math.round((this.score / this.tentatives) * 100);
      this.elStatistique.innerText = pourcentage;
    }
  }
}
