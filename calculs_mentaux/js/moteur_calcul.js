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
    
    // Injection de la Mascotte et de la Barre de Mana
    this.injecterElementsMagiques();

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

  injecterElementsMagiques() {
    // Mascotte (Flamme bleue SVG)
    const mascotte = document.createElement("div");
    mascotte.className = "mascotte-guide";
    mascotte.innerHTML = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10C50 10 30 40 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 40 50 10 50 10Z" fill="#41B6E6" opacity="0.8">
          <animate attributeName="d" dur="3s" repeatCount="indefinite" values="M50 10C50 10 30 40 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 40 50 10 50 10Z;M50 5C50 5 25 40 25 60C25 73.8071 36.1929 85 50 85C63.8071 85 75 73.8071 75 60C75 40 50 5 50 5Z;M50 10C50 10 30 40 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 40 50 10 50 10Z" />
        </path>
        <circle cx="43" cy="55" r="3" fill="white" />
        <circle cx="57" cy="55" r="3" fill="white" />
        <path d="M45 65 Q50 70 55 65" stroke="white" stroke-width="2" fill="none" />
      </svg>
    `;
    const presentation = document.querySelector(".presentation");
    presentation.appendChild(mascotte);

    // Barre de Mana
    const manaConteneur = document.createElement("div");
    manaConteneur.className = "mana-conteneur";
    manaConteneur.innerHTML = `<div class="mana-barre" id="manaBarre"></div>`;
    this.elCadre.insertBefore(manaConteneur, this.elCadre.firstChild);
    this.elManaBarre = document.getElementById("manaBarre");
  }

  majMana(valeur) {
    const pourcentage = Math.min(100, (valeur / 5) * 100);
    if (this.elManaBarre) {
      this.elManaBarre.style.width = `${pourcentage}%`;
    }
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
      this.majMana(0);
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
    if(this.elSaisie) this.elSaisie.value = "";
    
    this.elInstructions.innerText = "Saisis ta réponse et appuie sur Entrée";
    this.elInstructions.className = "";
    
    this.elCadre.classList.remove("succes", "erreur");
    this.majMana(this.consecutifs);
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
      this.majMana(this.consecutifs);
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
      this.majMana(0);
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
