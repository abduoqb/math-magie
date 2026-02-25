class MoteurGeometrie {
  constructor(config) {
    this.genererQuestion = config.genererQuestion.bind(config);
    this.typeInterface = config.typeInterface || "clavier";

    this.score = 0;
    this.tentatives = 0;
    this.limiteQuestions = 10;
    this.historiqueSession = []; // Pour garantir l'unicité

    this.elForme = document.getElementById("forme-conteneur");
    this.elInstructions = document.getElementById("instructions");
    this.elStatistique = document.querySelector(".cadre span");
    this.elCadre = document.querySelector(".cadre");
    this.elZoneReponse = document.getElementById("zone-reponse");

    this.currentReponse = null;
    this.enAttente = false;

    this.nouveauDefi();
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
      defi = this.genererQuestion();
      securite++;
      // Si on a fait trop de tentatives (cas où il n'y a pas assez de questions uniques), on accepte le doublon
    } while (this.historiqueSession.includes(defi.id) && securite < 30);

    this.historiqueSession.push(defi.id);
    this.currentReponse = defi.reponse;

    this.elForme.innerHTML = defi.svg;
    this.elInstructions.innerHTML = defi.instruction;
    this.elInstructions.className = "";
    this.elCadre.classList.remove("succes", "erreur");

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
    
    const s1 = valeurSaisie.toString().toLowerCase().trim();
    const s2 = this.currentReponse.toString().toLowerCase().trim();
    const estCorrect = (s1 === s2);

    this.elCadre.classList.remove("succes", "erreur");
    void this.elCadre.offsetWidth;

    if (estCorrect) {
      this.score++;
      this.elInstructions.innerHTML = "Bien joué !";
      this.elInstructions.className = "texte-succes";
      this.elCadre.classList.add("succes");
    } else {
      this.elInstructions.innerHTML = `Oups ! C'était : ${this.currentReponse}`;
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
        Ton score est de <strong style="color:var(--primary-color)">${this.score} / ${this.limiteQuestions}</strong>
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
      this.historiqueSession = []; // Reset de l'historique
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
