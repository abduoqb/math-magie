class MoteurGeometrie {
  constructor(config) {
    this.genererQuestion = config.genererQuestion.bind(config);
    this.typeInterface = config.typeInterface || "clavier";
    this.nomOperation = config.nomOperation || "geometrie-defaut";

    this.score = 0;
    this.tentatives = 0;
    this.consecutifs = 0;
    this.erreursConsecutives = 0;
    this.limiteQuestions = 10;
    this.historiqueSession = []; // Pour garantir l'unicité

    // Chargement simple du niveau pour la session
    const savedData = JSON.parse(
      localStorage.getItem(`math-magie-${this.nomOperation}`),
    ) || { niveau: 1 };
    this.niveau = savedData.niveau;

    this.elForme = document.getElementById("forme-conteneur");
    this.elInstructions = document.getElementById("instructions");
    this.elStatistique = document.querySelector(".cadre span");
    this.elCadre = document.querySelector(".cadre");
    this.elZoneReponse = document.getElementById("zone-reponse");

    // Injection de la Mascotte et de la Barre de Mana
    this.injecterElementsMagiques();

    // Ajout d'un sélecteur de niveau si la config le supporte (ex: formes.js)
    if (config.nomOperation) {
      this.elNiveauConteneur = document.getElementById("niveau-selection");
      if (!this.elNiveauConteneur) {
        this.elNiveauConteneur = document.createElement("div");
        this.elNiveauConteneur.id = "niveau-selection";
        this.elNiveauConteneur.style =
          "margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: bold;";
        this.elNiveauConteneur.innerHTML = `
                <label for="selectNiveau" style="color: var(--primary-color);">Niveau :</label>
                <select id="selectNiveau" aria-label="Sélection du niveau de difficulté" style="padding: 5px 10px; border-radius: 10px; border: 2px solid var(--primary-color); background: #1a1a1a; color: white; font-weight: bold; cursor: pointer;">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
            `;
        this.elCadre.insertBefore(this.elNiveauConteneur, this.elForme);
      }

      this.elSelectNiveau = document.getElementById("selectNiveau");
      if (this.elSelectNiveau) {
        this.elSelectNiveau.value = this.niveau;
        this.elSelectNiveau.addEventListener("change", (e) => {
          this.niveau = parseInt(e.target.value);
          this.consecutifs = 0;
          this.erreursConsecutives = 0;
          this.majMana(0);
          localStorage.setItem(
            `math-magie-${this.nomOperation}`,
            JSON.stringify({ niveau: this.niveau }),
          );
          // Reset la session en cours
          this.score = 0;
          this.tentatives = 0;
          this.historiqueSession = [];
          this.majStatistiques();
          this.nouveauDefi();
        });
      }
    }

    this.currentReponse = null;
    this.enAttente = false;

    this.nouveauDefi();
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
    if (presentation) presentation.appendChild(mascotte);

    // Barre de Mana
    const manaConteneur = document.createElement("div");
    manaConteneur.className = "mana-conteneur";
    manaConteneur.innerHTML = `<div class="mana-barre" id="manaBarreGeo"></div>`;
    this.elCadre.insertBefore(manaConteneur, this.elCadre.firstChild);
    this.elManaBarre = document.getElementById("manaBarreGeo");
  }

  majMana(valeur) {
    const pourcentage = Math.min(100, (valeur / 5) * 100);
    if (this.elManaBarre) {
      this.elManaBarre.style.width = `${pourcentage}%`;
    }
  }

  nouveauDefi() {
    this.enAttente = false;

    if (this.tentatives >= this.limiteQuestions) {
      this.afficherResultats();
      return;
    }

    // On cherche une question qui n'a pas encore été posée dans cette session
    let defi;
    let securite = 0;
    do {
      defi = this.genererQuestion(this.niveau);
      securite++;
      // Si on a fait trop de tentatives (cas où il n'y a pas assez de questions uniques), on accepte le doublon
    } while (this.historiqueSession.includes(defi.id) && securite < 30);

    // Si on a atteint la limite de sécurité, on vide l'historique pour éviter que ça ne ralentisse les prochains tours
    if (securite >= 30) {
      this.historiqueSession = [];
    }

    this.historiqueSession.push(defi.id);
    this.currentReponse = defi.reponse;

    this.elForme.innerHTML = defi.svg;
    this.elInstructions.innerHTML = defi.instruction;
    this.elInstructions.className = "";
    this.elCadre.classList.remove("succes", "erreur");
    this.majMana(this.consecutifs);

    this.preparerInterface(defi.options);
    this.majStatistiques();
  }

  preparerInterface(options) {
    this.elZoneReponse.innerHTML = "";

    if (this.typeInterface === "boutons" && options) {
      options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "bouton-option";
        btn.setAttribute("aria-label", `Réponse : ${opt}`);
        btn.onclick = () => this.validerReponse(opt);
        this.elZoneReponse.appendChild(btn);
      });
    } else {
      const conteneurInput = document.createElement("div");
      conteneurInput.style.display = "flex";
      conteneurInput.style.flexDirection = "column";
      conteneurInput.style.alignItems = "center";
      conteneurInput.style.gap = "15px";

      const input = document.createElement("input");
      input.type = "number";
      input.id = "saisieReponse";
      input.setAttribute("aria-label", "Saisis ta réponse ici");
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.validerReponse(input.value);
        }
      });

      const btnValider = document.createElement("button");
      btnValider.innerText = "Valider";
      btnValider.className = "bouton-option";
      btnValider.setAttribute("aria-label", "Valider la réponse");
      btnValider.style.width = "auto";
      btnValider.style.minWidth = "150px";
      btnValider.onclick = () => this.validerReponse(input.value);

      conteneurInput.appendChild(input);
      conteneurInput.appendChild(btnValider);
      this.elZoneReponse.appendChild(conteneurInput);

      setTimeout(() => input.focus(), 100);
    }
  }

  validerReponse(valeurSaisie) {
    if (
      this.enAttente ||
      valeurSaisie === "" ||
      valeurSaisie === null ||
      valeurSaisie === undefined
    )
      return;
    if (this.currentReponse === null || this.currentReponse === undefined)
      return;

    if (this.typeInterface === "clavier") {
      const num = Number(valeurSaisie);
      if (isNaN(num)) {
        this.elInstructions.innerHTML =
          "Saisie invalide ! Utilise uniquement des chiffres.";
        this.elInstructions.className = "texte-erreur";
        this.elCadre.classList.add("erreur");
        setTimeout(() => this.elCadre.classList.remove("erreur"), 400);
        return;
      }
    }

    this.enAttente = true;
    this.tentatives++;

    const s1 = valeurSaisie.toString().toLowerCase().trim();
    const s2 = this.currentReponse.toString().toLowerCase().trim();
    const estCorrect = s1 === s2;

    this.elCadre.classList.remove("succes", "erreur");
    void this.elCadre.offsetWidth;

    if (estCorrect) {
      this.score++;
      this.consecutifs++;
      this.erreursConsecutives = 0;
      this.majMana(this.consecutifs);
      this.elInstructions.innerText = "Bien joué !";
      this.elInstructions.className = "texte-succes";
      this.elCadre.classList.add("succes");
    } else {
      this.consecutifs = 0;
      this.erreursConsecutives++;
      this.majMana(0);
      this.elInstructions.innerText = `Oups ! C'était : ${this.currentReponse}`;
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");
    }

    setTimeout(() => this.nouveauDefi(), 1500);
    this.majStatistiques();
  }

  afficherResultats() {
    this.elForme.innerHTML = `<div style="font-size: 4rem; margin-bottom: 20px;">🏆</div>`;
    this.elInstructions.innerHTML = `
      <div style="font-size: 1.5rem; margin-bottom: 20px;">
        Mission terminée !<br>
        Ton score est de <strong style="color:var(--accent-color)">${this.score} / ${this.limiteQuestions}</strong>
      </div>
    `;

    this.elZoneReponse.innerHTML = "";
    const btnRejouer = document.createElement("button");
    btnRejouer.innerText = "Recommencer la mission";
    btnRejouer.className = "bouton-option";
    btnRejouer.style.width = "auto";
    btnRejouer.style.padding = "15px 30px";
    btnRejouer.onclick = () => {
      this.score = 0;
      this.tentatives = 0;
      this.consecutifs = 0;
      this.historiqueSession = []; // Reset de l'historique
      this.majMana(0);
      this.nouveauDefi();
    };
    this.elZoneReponse.appendChild(btnRejouer);
  }

  majStatistiques() {
    if (this.elStatistique) {
      this.elStatistique.innerText = `${this.tentatives} / ${this.limiteQuestions}`;
    }
  }
}
