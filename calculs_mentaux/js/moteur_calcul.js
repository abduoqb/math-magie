class MoteurCalcul {
  constructor(config) {
    this.operationSign = config.operationSign;
    this.nomOperation = config.nomOperation; // ex: 'additions'

    // Programme du niveau de classe du profil actif (garde si l'API v2 est absente)
    const gp = (typeof gestionnaireProfils !== "undefined") ? gestionnaireProfils : null;
    this.niveauClasse = (gp && typeof gp.getNiveauClasse === "function" && gp.getNiveauClasse()) || null;
    this.programme = (gp && typeof gp.getProgramme === "function" && gp.getProgramme()) || null;
    if (!this.programme && window.PROGRAMMES) {
      this.programme = window.PROGRAMMES[this.niveauClasse || "cm1"] || window.PROGRAMMES.cm1 || Object.values(window.PROGRAMMES)[0] || null;
    }
    if (this.programme && !this.niveauClasse) this.niveauClasse = this.programme.id;
    this.defOperation = this.programme && this.programme.calcul ? this.programme.calcul[this.nomOperation] : null;
    if (!this.defOperation || this.defOperation.actif === false || !this.defOperation.niveaux) {
      // Mission hors programme : inaccessible
      window.location.replace("../index.html");
      return;
    }
    this.nbPaliers = this.defOperation.niveaux.length;
    this.estCP = this.niveauClasse === "cp";
    this.genererCalcul = config.genererCalcul || ((palier) =>
      GenerateurCalcul.generer(this.nomOperation, this.programme, palier, this.niveauClasse));
    
    this.score = 0;
    this.erreurs = 0;
    this.limiteErreurs = 5;
    this.consecutifs = 0; // série d'invincibilité
    this.erreursConsecutives = 0;

    // Chargement de la progression du joueur actif
    let progressionSauvegardee = null;
    try { progressionSauvegardee = gp && gp.getProgression ? gp.getProgression(this.nomOperation) : null; } catch (e) { progressionSauvegardee = null; }
    this.niveau = Math.min(this.nbPaliers, Math.max(1, parseInt(progressionSauvegardee && progressionSauvegardee.niveau, 10) || 1));
    this.niveauSauvegarde = this.niveau;

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
        this.elNiveauConteneur.style = "margin-bottom: 25px; display: flex; justify-content: center; align-items: center; gap: 15px; font-weight: bold; font-size: 1.5rem;";
        this.elNiveauConteneur.innerHTML = `
            <label for="selectNiveau" style="color: var(--primary-color);">Niveau :</label>
            <select id="selectNiveau" aria-label="Sélection du niveau de difficulté" style="padding: 5px 15px; border-radius: 10px; border: 3px solid var(--primary-color); background: white; color: var(--primary-color); font-weight: bold; font-size: 1.5rem; cursor: pointer;">
                ${Array.from({ length: this.nbPaliers }, (_, i) => i + 1).map(n => `<option value="${n}">${n}</option>`).join("")}
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

    this.injecterTitreEtVoix();
    this.nouveauCalcul();

    // Bouton retour
    const titreEl = document.querySelector('.titre');
    if (titreEl) {
      const lienRetour = document.createElement('a');
      lienRetour.href = '../index.html';
      lienRetour.className = 'lien-retour';
      lienRetour.textContent = '← Retour aux missions';
      titreEl.parentNode.insertBefore(lienRetour, titreEl);
    }
  }

  static getMascotteSVG() {
    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10C50 10 30 40 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 40 50 10 50 10Z" fill="#41B6E6" opacity="0.8">
          <animate attributeName="d" dur="3s" repeatCount="indefinite" values="M50 10C50 10 30 40 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 40 50 10 50 10Z;M50 5C50 5 25 40 25 60C25 73.8071 36.1929 85 50 85C63.8071 85 75 73.8071 75 60C75 40 50 5 50 5Z;M50 10C50 10 30 40 30 60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60C70 40 50 10 50 10Z" />
        </path>
        <circle cx="43" cy="55" r="3" fill="white" />
        <circle cx="57" cy="55" r="3" fill="white" />
        <path d="M45 65 Q50 70 55 65" stroke="white" stroke-width="2" fill="none" />
      </svg>
    `;
  }

  injecterElementsMagiques() {
    const mascotte = document.createElement("div");
    mascotte.className = "mascotte-guide";
    mascotte.innerHTML = MoteurCalcul.getMascotteSVG();
    const presentation = document.querySelector(".presentation");
    if (presentation) presentation.appendChild(mascotte);

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
      // La progression est sauvegardée uniquement après 5 bonnes réponses consécutives
      // Reset complet de la partie en cours
      this.score = 0;
      this.erreurs = 0;
      this.majStatistiques();
      this.nouveauCalcul();
    });
  }

  majAffichageNiveau() {
    if (this.elSelectNiveau) {
        this.elSelectNiveau.value = this.niveau;
    }
  }

  sauvegarderProgression() {
    if (typeof gestionnaireProfils !== "undefined" && typeof gestionnaireProfils.setProgression === "function") {
      gestionnaireProfils.setProgression(this.nomOperation, { niveau: this.niveau });
    }
    this.niveauSauvegarde = Math.max(this.niveauSauvegarde || 1, this.niveau);
  }

  nouveauCalcul() {
    if (this.erreurs >= this.limiteErreurs) {
      this.afficherResultats();
      return;
    }

    const calcul = this.genererCalcul(this.niveau);
    this.currentResultat = calcul.resultat;
    this.currentVoix = calcul.voix || "";

    this.elCalcul.innerText = calcul.texte || `${calcul.a} ${this.operationSign} ${calcul.b} = `;
    if(this.elSaisie) this.elSaisie.value = "";

    this.elInstructions.innerText = calcul.aide || (this.estCP ? "Écris la réponse." : "Saisis ta réponse et appuie sur Entrée");
    this.elInstructions.className = "";
    
    this.elCadre.classList.remove("succes", "erreur");
    this.majMana(this.consecutifs % 5);
    this.elSaisie?.focus();
  }

  afficherResultats() {
    if(this.elCalcul) this.elCalcul.innerHTML = '<div style="font-size: 3rem;">🏆</div>';
    if(this.elSaisie) this.elSaisie.style.display = 'none';
    if(this.elBoutonChanger) this.elBoutonChanger.style.display = 'none';
    if(this.elNiveauConteneur) this.elNiveauConteneur.style.display = 'none';
    
    // Message en fonction du score
    let message, emoji;
    if (this.score >= 200) { emoji = "🌟"; message = "Incroyable ! Tu es un vrai mage des nombres !"; }
    else if (this.score >= 100) { emoji = "🔥"; message = "Excellent ! Très belle performance !"; }
    else if (this.score >= 50) { emoji = "✨"; message = "Bien joué ! Continue comme ça !"; }
    else if (this.score > 0) { emoji = "💪"; message = "Pas mal ! Tu peux faire encore mieux !"; }
    else { emoji = "🎯"; message = "Entraîne-toi encore, tu vas y arriver !"; }

    if(this.elInstructions) {
      this.elInstructions.innerHTML = `
        <div style="font-size: 1.3rem; margin-bottom: 15px;">
          ${emoji} Partie terminée !<br>
          <strong style="font-size: 2rem; color: var(--accent-color);">${this.score} pts</strong><br>
          <span style="color: var(--text-muted); font-size: 0.95rem;">${message}</span>
        </div>
      `;
      this.elInstructions.className = '';
    }
    
    const btnRejouer = document.createElement('button');
    btnRejouer.innerText = 'Recommencer';
    btnRejouer.id = 'changer';
    btnRejouer.onclick = () => {
      this.score = 0;
      this.erreurs = 0;
      this.consecutifs = 0;
      this.erreursConsecutives = 0;
      this.majMana(0);
      if(this.elSaisie) this.elSaisie.style.display = '';
      if(this.elBoutonChanger) this.elBoutonChanger.style.display = '';
      if(this.elNiveauConteneur) this.elNiveauConteneur.style.display = '';
      btnRejouer.remove();
      this.nouveauCalcul();
    };
    this.elCadre.appendChild(btnRejouer);
  }

  validerReponse() {
    const inputValue = this.elSaisie.value.trim();
    if (inputValue === "") return;

    const valide = /^\d+([.,]\d+)?$/.test(inputValue);
    const saisiResultat = valide ? Number(inputValue.replace(",", ".")) : NaN;
    if (isNaN(saisiResultat)) {
      this.elInstructions.innerText = "Saisie invalide ! Utilise uniquement des chiffres.";
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");
      setTimeout(() => this.elCadre.classList.remove("erreur"), 400);
      return;
    }

    this.elCadre.classList.remove("succes", "erreur");
    void this.elCadre.offsetWidth; 

    if (Math.abs(saisiResultat - this.currentResultat) < 1e-9) {
      // Points gagnés = niveau × (1 + série d'invincibilité)
      const pointsGagnes = this.niveau * (1 + this.consecutifs);
      this.score += pointsGagnes;
      this.consecutifs++;
      this.erreursConsecutives = 0;
      
      // Afficher les points gagnés avec le détail du combo
      if (this.consecutifs > 1) {
        this.elInstructions.innerHTML = `Bien joué ! <strong>+${pointsGagnes} pts</strong> <span style="color: var(--accent-color);">(combo x${this.consecutifs} 🔥)</span>`;
      } else {
        this.elInstructions.innerHTML = `Bien joué ! <strong>+${pointsGagnes} pts</strong>`;
      }
      this.elInstructions.className = "texte-succes";
      this.elCadre.classList.add("succes");

      // Evolution : 5 bonnes réponses de suite = niveau supérieur (la streak continue)
      if (this.consecutifs >= 5 && this.consecutifs % 5 === 0 && this.niveau < this.nbPaliers) {
        this.niveau++;
        this.majMana(5); // Remplit la barre à 100% brièvement
        setTimeout(() => this.majMana(0), 500); // Puis redescend à 0
        this.elInstructions.innerHTML = `🎉 Niveau ${this.niveau} ! <strong>+${pointsGagnes} pts</strong> <span style="color: var(--accent-color);">(combo x${this.consecutifs} 🔥)</span>`;
        this.majAffichageNiveau();
        
        if (this.niveau > (this.niveauSauvegarde || 1)) {
           this.sauvegarderProgression();
        }
      } else {
         this.majMana(this.consecutifs % 5);
      }
    } else {
      // Pénalité : on perd (niveau × 2) points, minimum 0
      const pointsPerdus = this.niveau * 2;
      this.score = Math.max(0, this.score - pointsPerdus);
      this.consecutifs = 0;
      this.majMana(0);
      this.erreursConsecutives++;
      this.erreurs++;
      
      const erreursRestantes = this.limiteErreurs - this.erreurs;
      this.elInstructions.innerHTML = `Oups ! C'était ${String(this.currentResultat).replace(".", ",")} <strong style="color:#e74c3c;">−${pointsPerdus} pts</strong> <span style="color: var(--text-muted);">(${erreursRestantes} erreur${erreursRestantes > 1 ? 's' : ''} restante${erreursRestantes > 1 ? 's' : ''})</span>`;
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");

      // Régression : 3 erreurs de suite = niveau inférieur (min 1)
      if (this.erreursConsecutives >= 2 && this.niveau > 1) {
        this.niveau--;
        this.erreursConsecutives = 0;
        this.majAffichageNiveau();
        this.sauvegarderProgression();
      }
    }

    setTimeout(() => this.nouveauCalcul(), 1500);
    this.majStatistiques();
  }

  injecterTitreEtVoix() {
    const titre = document.querySelector(".titre");
    if (titre && this.defOperation.libelle) {
      titre.textContent = this.defOperation.libelle;
      document.title = this.defOperation.libelle;
    }
    if (titre && this.defOperation.consigne) {
      const p = document.createElement("p");
      p.className = "consigne-mission";
      p.style.cssText = "text-align:center;font-size:1.2rem;color:var(--text-muted);margin:0 0 15px;";
      p.textContent = this.defOperation.consigne;
      titre.insertAdjacentElement("afterend", p);
    }
    if (this.elSaisie) {
      this.elSaisie.type = "text";
      this.elSaisie.setAttribute("inputmode", "decimal");
      this.elSaisie.setAttribute("autocomplete", "off");
    }
    if (this.estCP && "speechSynthesis" in window) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "btn-voix";
      btn.textContent = "🔊";
      btn.setAttribute("aria-label", "Écouter le calcul");
      btn.style.cssText = "min-width:56px;min-height:56px;font-size:1.8rem;border-radius:50%;cursor:pointer;margin:0 0 12px;";
      btn.addEventListener("click", () => this.lire());
      this.elCadre.insertBefore(btn, this.elCalcul);
    }
  }

  lire() {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(`${this.defOperation.consigne || ""} ${this.currentVoix}`.trim());
    u.lang = "fr-FR";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  majStatistiques() {
    if (this.elStatistique) {
      this.elStatistique.innerHTML = `${this.score} pts — ❌ ${this.erreurs}/${this.limiteErreurs}`;
    }
  }
}
