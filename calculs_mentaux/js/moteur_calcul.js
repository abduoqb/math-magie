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
    
    // Ajout d'un sélecteur de niveau
    this.elNiveauConteneur = document.getElementById("niveau-selection");
    if (!this.elNiveauConteneur) {
        this.elNiveauConteneur = document.createElement("div");
        this.elNiveauConteneur.id = "niveau-selection";
        this.elNiveauConteneur.style = "margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-weight: bold;";
        this.elNiveauConteneur.innerHTML = `
            <label for="selectNiveau" style="color: var(--primary-color);">Niveau :</label>
            <select id="selectNiveau" aria-label="Sélection du niveau de difficulté" style="padding: 5px 10px; border-radius: 10px; border: 2px solid var(--primary-color); background: #1a1a1a; color: white; font-weight: bold; cursor: pointer;">
                ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}">${n}</option>`).join("")}
            </select>
        `;
        // On l'insère avant le calcul
        this.elCadre.insertBefore(this.elNiveauConteneur, this.elCalcul);
    }
    this.elSelectNiveau = document.getElementById("selectNiveau");
    this.elSelectNiveau.value = this.niveau;

    this.currentResultat = null;

    this.initEvents();
    
    // Add ARIA label to existing input field if present
    if (this.elSaisie) {
        this.elSaisie.setAttribute('aria-label', 'Saisis ta réponse ici');
    }

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
    this.elSelectNiveau?.addEventListener("change", (e) => {
      this.niveau = parseInt(e.target.value);
      this.consecutifs = 0;
      this.erreursConsecutives = 0;
      this.sauvegarderProgression();
      this.nouveauCalcul();
    });
  }

  majAffichageNiveau() {
    if (this.elSelectNiveau) {
        this.elSelectNiveau.value = this.niveau;
    }
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
    const inputValue = this.elSaisie.value.trim();
    if (inputValue === "") return;

    const saisiResultat = Number(inputValue);
    if (isNaN(saisiResultat)) {
      this.elInstructions.innerText = "Saisie invalide ! Utilise uniquement des chiffres.";
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");
      setTimeout(() => this.elCadre.classList.remove("erreur"), 400);
      return; // Ne compte pas comme une tentative/erreur
    }

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
      if (this.consecutifs >= 5 && this.niveau < 10) {
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
