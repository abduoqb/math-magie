class MoteurGeometrie {
  constructor(config) {
    this.genererQuestion = config.genererQuestion;
    this.typeInterface = config.typeInterface || "clavier"; // "clavier" ou "boutons"

    this.score = 0;
    this.tentatives = 0;

    // Elements DOM
    this.elForme = document.getElementById("forme-conteneur");
    this.elSaisie = document.getElementById("saisieReponse");
    this.elInstructions = document.getElementById("instructions");
    this.elStatistique = document.querySelector(".cadre span");
    this.elCadre = document.querySelector(".cadre");
    this.elZoneReponse = document.getElementById("zone-reponse");

    this.currentReponse = null;

    this.nouveauDefi();
  }

  nouveauDefi() {
    const defi = this.genererQuestion();
    this.currentReponse = defi.reponse;

    // Nettoyage et affichage
    this.elForme.innerHTML = defi.svg;
    this.elInstructions.innerText = defi.instruction;
    this.elInstructions.className = "";
    this.elCadre.classList.remove("succes", "erreur");

    this.preparerInterface(defi.options);
  }

  preparerInterface(options) {
    this.elZoneReponse.innerHTML = "";

    if (this.typeInterface === "boutons" && options) {
      options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "bouton-option";
        btn.onclick = () => this.validerReponse(opt);
        this.elZoneReponse.appendChild(btn);
      });
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.id = "saisieReponse";
      input.placeholder = "Ta réponse...";
      input.onkeypress = (e) => {
        if (e.key === "Enter") this.validerReponse(input.value);
      };
      this.elZoneReponse.appendChild(input);
      input.focus();
    }
  }

  validerReponse(valeurSaisie) {
    if (!valeurSaisie) return;

    this.tentatives++;
    const estCorrect = valeurSaisie.toString().toLowerCase().trim() === this.currentReponse.toString().toLowerCase().trim();

    this.elCadre.classList.remove("succes", "erreur");
    void this.elCadre.offsetWidth;

    if (estCorrect) {
      this.score++;
      this.elInstructions.innerText = "Bien joué !";
      this.elInstructions.className = "texte-succes";
      this.elCadre.classList.add("succes");
    } else {
      this.elInstructions.innerText = `C'était : ${this.currentReponse}`;
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");
    }

    setTimeout(() => this.nouveauDefi(), 1500);
    this.majStatistiques();
  }

  majStatistiques() {
    if (this.tentatives > 0 && this.elStatistique) {
      const pourcentage = Math.round((this.score / this.tentatives) * 100);
      this.elStatistique.innerText = pourcentage;
    }
  }
}
