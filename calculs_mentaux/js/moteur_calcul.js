class MoteurCalcul {
  constructor(config) {
    this.operationSign = config.operationSign;
    this.genererCalcul = config.genererCalcul;
    this.nomOperation = config.nomOperation; // ex: 'additions'
    
    this.score = 0;
    this.tentatives = 0;
    this.consecutifs = 0;
    this.erreursConsecutives = 0;

    // Chargement de la progression
    const progressionSauvegardee = JSON.parse(localStorage.getItem(`math-magie-${this.nomOperation}`)) || { niveau: 1 };
    this.niveau = progressionSauvegardee.niveau;

    // Elements DOM
    this.elCalcul = document.getElementById("calcul");
    this.elSaisie = document.getElementById("saisieReponse");
    this.elInstructions = document.getElementById("instructions");
    this.elBoutonChanger = document.getElementById("changer");
    this.elStatistique = document.querySelector(".cadre span");
    this.elCadre = document.querySelector(".cadre");
    
    // Ajout d'un indicateur de niveau s'il n'existe pas
    this.elNiveau = document.getElementById("niveau-display");
    if (!this.elNiveau) {
        this.elNiveau = document.createElement("div");
        this.elNiveau.id = "niveau-display";
        this.elNiveau.style = "position: absolute; top: 10px; right: 20px; font-weight: bold; color: var(--primary-color);";
        this.elCadre.style.position = "relative";
        this.elCadre.appendChild(this.elNiveau);
    }

    this.currentResultat = null;

    this.initEvents();
    this.majAffichageNiveau();
    this.nouveauCalcul();
  }

  initEvents() {
    this.elSaisie?.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.validerReponse();
      }
    });
    this.elBoutonChanger?.addEventListener("click", () => {
      this.nouveauCalcul();
    });
  }

  majAffichageNiveau() {
    this.elNiveau.innerText = `Niveau ${this.niveau}`;
  }

  sauvegarderProgression() {
    localStorage.setItem(`math-magie-${this.nomOperation}`, JSON.stringify({ niveau: this.niveau }));
  }

  nouveauCalcul() {
    const { a, b, resultat } = this.genererCalcul(this.niveau);
    this.currentResultat = resultat;
    
    this.elCalcul.innerText = `${a} ${this.operationSign} ${b} = `;
    this.elSaisie.value = "";
    this.elInstructions.innerText = "Saisis ta réponse et appuie sur Entrée";
    this.elInstructions.className = "";
    this.elCadre.classList.remove("succes", "erreur");
    
    this.elSaisie?.focus();
  }

  validerReponse() {
    if (this.elSaisie.value === "") return;

    const saisiResultat = Number(this.elSaisie.value);
    this.tentatives++;

    this.elCadre.classList.remove("succes", "erreur");
    void this.elCadre.offsetWidth; 

    if (saisiResultat === this.currentResultat) {
      this.score++;
      this.consecutifs++;
      this.erreursConsecutives = 0;
      this.elInstructions.innerText = "Bien joué !";
      this.elInstructions.className = "texte-succes";
      this.elCadre.classList.add("succes");

      // Evolution : 5 bonnes réponses de suite = niveau supérieur
      if (this.consecutifs >= 5) {
        this.niveau++;
        this.consecutifs = 0;
        this.elInstructions.innerText = "Super ! Tu passes au niveau supérieur !";
        this.majAffichageNiveau();
        this.sauvegarderProgression();
      }
    } else {
      this.consecutifs = 0;
      this.erreursConsecutives++;
      this.elInstructions.innerText = `Oups ! C'était ${this.currentResultat}`;
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");

      // Régression : 3 erreurs de suite = niveau inférieur (min 1)
      if (this.erreursConsecutives >= 3 && this.niveau > 1) {
        this.niveau--;
        this.erreursConsecutives = 0;
        this.elInstructions.innerText = `On redescend au niveau ${this.niveau} pour s'entraîner !`;
        this.majAffichageNiveau();
        this.sauvegarderProgression();
      }
    }

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
