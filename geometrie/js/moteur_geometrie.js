class MoteurGeometrie {
  constructor(config) {
    this.genererQuestion = config.genererQuestion.bind(config); // On bind pour garder le contexte
    this.typeInterface = config.typeInterface || "clavier";

    this.score = 0;
    this.tentatives = 0;

    this.elForme = document.getElementById("forme-conteneur");
    this.elInstructions = document.getElementById("instructions");
    this.elStatistique = document.querySelector(".cadre span");
    this.elCadre = document.querySelector(".cadre");
    this.elZoneReponse = document.getElementById("zone-reponse");

    this.currentReponse = null;
    this.enAttente = false; // Sécurité pour éviter les doubles validations

    this.nouveauDefi();
  }

  nouveauDefi() {
    this.enAttente = false;
    const defi = this.genererQuestion();
    if (!defi) return;
    
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
      input.type = "number";
      input.id = "saisieReponse";
      input.placeholder = "?";
      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          this.validerReponse(input.value);
        }
      };
      this.elZoneReponse.appendChild(input);
      input.focus();
    }
  }

  validerReponse(valeurSaisie) {
    if (this.enAttente || valeurSaisie === "" || valeurSaisie === null || valeurSaisie === undefined) return;
    if (this.currentReponse === null || this.currentReponse === undefined) return;

    this.enAttente = true;
    this.tentatives++;
    
    // Comparaison sécurisée
    const s1 = valeurSaisie.toString().toLowerCase().trim();
    const s2 = this.currentReponse.toString().toLowerCase().trim();
    const estCorrect = (s1 === s2);

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
