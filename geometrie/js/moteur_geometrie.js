/* Moteur commun des missions de géométrie (style « académie magique en autocollants »).
 * Les configs (formes.js, angles.js...) fournissent genererQuestion(niveau) ; le moteur gère
 * l'interface, la progression (gestionnaireProfils), le programme par classe (GeoProgramme). */
class MoteurGeometrie {
  constructor(config) {
    this.genererQuestion = config.genererQuestion.bind(config);
    this.typeInterface = config.typeInterface || "clavier";
    this.nomOperation = config.nomOperation || "geometrie-defaut";

    // Mission hors programme du niveau de classe : retour a la liste des missions
    if (!GeoProgramme.garde(this.nomOperation, "../index.html")) return;
    this.estCP = GeoProgramme.estCP();
    this.maxNiveau = GeoProgramme.maxNiveau(this.nomOperation);
    document.body.classList.add("geo-page");
    if (this.estCP) document.body.classList.add("geo-cp");

    this.score = 0;
    this.tentatives = 0;
    this.consecutifs = 0;
    this.erreursConsecutives = 0;
    this.limiteQuestions = 10;
    this.historiqueSession = []; // Pour garantir l'unicité
    this.resultats = []; // true / false par question (pastilles de progression)
    this.baseImages = "../../images/";

    // Chargement de la progression du joueur actif
    let savedData = null;
    try {
      savedData = (typeof gestionnaireProfils.getProgression === "function")
        ? gestionnaireProfils.getProgression(this.nomOperation) : null;
    } catch (e) { savedData = null; }
    this.niveau = Math.max(1, Math.min((savedData && savedData.niveau) || 1, this.maxNiveau));

    this.elForme = document.getElementById("forme-conteneur");
    this.elInstructions = document.getElementById("instructions");
    this.elCadre = document.querySelector(".cadre");
    this.elZoneReponse = document.getElementById("zone-reponse");
    this.elStatistique = document.getElementById("geo-stats") || document.querySelector(".cadre span");

    this.construireInterface();

    this.currentReponse = null;
    this.enAttente = false;
    this.timer = null;

    this.nouveauDefi();

    // Bouton retour
    const titreEl = document.querySelector('.titre');
    if (titreEl && !document.querySelector('.lien-retour')) {
      const lienRetour = document.createElement('a');
      lienRetour.href = '../index.html';
      lienRetour.className = 'lien-retour';
      lienRetour.textContent = '← Missions';
      lienRetour.setAttribute('aria-label', 'Retour aux missions');
      titreEl.parentNode.insertBefore(lienRetour, titreEl);
    }
  }

  /* ---------- Mascotte (flamme bleue) ---------- */

  static getMascotteSVG(etat) {
    // Repli SVG : les états PNG (heureuse, emerveillee, coeur, pleure) retombent sur contente / triste
    if (etat === "heureuse" || etat === "emerveillee" || etat === "coeur") etat = "contente";
    else if (etat === "pleure") etat = "triste";
    const bouche = etat === "triste"
      ? '<path d="M44 70 Q50 63 56 70" stroke="#2B2D5B" stroke-width="3" fill="none" stroke-linecap="round"/>'
      : (etat === "contente"
        ? '<path d="M42 62 Q50 76 58 62 Z" fill="#2B2D5B" stroke="#2B2D5B" stroke-width="2" stroke-linejoin="round"/>'
        : '<path d="M44 66 Q50 71 56 66" stroke="#2B2D5B" stroke-width="3" fill="none" stroke-linecap="round"/>');
    const yeux = etat === "contente"
      ? '<path d="M36 55 Q41 49 46 55 M54 55 Q59 49 64 55" stroke="#2B2D5B" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
      : '<circle cx="41" cy="54" r="4.5" fill="#2B2D5B"/><circle cx="59" cy="54" r="4.5" fill="#2B2D5B"/><circle cx="42.6" cy="52.4" r="1.6" fill="#fff"/><circle cx="60.6" cy="52.4" r="1.6" fill="#fff"/>';
    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M50 6C50 6 22 40 22 62C22 78 34 90 50 90C66 90 78 78 78 62C78 40 50 6 50 6Z" fill="#38BDF8" stroke="#2B2D5B" stroke-width="4" stroke-linejoin="round"/>
        <path d="M50 34C50 34 36 52 36 64C36 72 42 78 50 78C58 78 64 72 64 64C64 52 50 34 50 34Z" fill="#BAE6FD"/>
        ${yeux}${bouche}
      </svg>`;
  }

  creerMascotte() {
    const conteneur = document.createElement("div");
    conteneur.className = "geo-mascotte";
    conteneur.setAttribute("aria-hidden", "true");
    const img = document.createElement("img");
    img.alt = "";
    img.width = 96;
    img.height = 96;
    img.addEventListener("error", () => {
      conteneur.dataset.fb = "1";
      conteneur.innerHTML = MoteurGeometrie.getMascotteSVG(conteneur.dataset.etat || "neutre");
    });
    conteneur.appendChild(img);
    this.elMascotte = conteneur;
    this.mascotteEtat("neutre");
    return conteneur;
  }

  mascotteEtat(etat) {
    const m = this.elMascotte;
    if (!m) return;
    m.dataset.etat = etat;
    if (m.dataset.fb) {
      m.innerHTML = MoteurGeometrie.getMascotteSVG(etat);
    } else {
      const img = m.querySelector("img");
      if (img) img.src = `${this.baseImages}mascotte-${etat}.svg`;
    }
  }

  /* ---------- Construction de l'interface ---------- */

  construireInterface() {
    const cadre = this.elCadre;

    // En-tête : icône de la mission dans le titre
    const titre = document.querySelector(".titre");
    if (titre && typeof GeoIcones !== "undefined" && !titre.querySelector(".geo-icone")) {
      titre.insertAdjacentHTML("afterbegin", GeoIcones.svg(this.nomOperation));
    }

    // Barre du haut : pastilles de progression + niveau
    const haut = document.createElement("div");
    haut.className = "geo-haut";
    const pastilles = document.createElement("div");
    pastilles.className = "geo-pastilles";
    pastilles.id = "geo-pastilles";
    pastilles.setAttribute("role", "img");
    for (let i = 0; i < this.limiteQuestions; i++) {
      const p = document.createElement("span");
      p.className = "geo-pastille";
      pastilles.appendChild(p);
    }
    haut.appendChild(pastilles);
    this.elPastilles = Array.from(pastilles.children);

    // Sélecteur de niveau (palier de difficulté du moteur)
    this.elNiveauConteneur = document.getElementById("niveau-selection");
    if (!this.elNiveauConteneur) {
      this.elNiveauConteneur = document.createElement("div");
      this.elNiveauConteneur.id = "niveau-selection";
      this.elNiveauConteneur.className = "geo-niveau";
      this.elNiveauConteneur.innerHTML = `
        <label for="selectNiveau">Niveau</label>
        <select id="selectNiveau" aria-label="Sélection du niveau de difficulté">
          ${Array.from({ length: this.maxNiveau }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}
        </select>`;
    }
    haut.appendChild(this.elNiveauConteneur);
    cadre.insertBefore(haut, cadre.firstChild);

    this.elSelectNiveau = document.getElementById("selectNiveau");
    if (this.maxNiveau <= 1) this.elNiveauConteneur.style.display = "none";
    if (this.elSelectNiveau) {
      this.elSelectNiveau.value = this.niveau;
      this.elSelectNiveau.addEventListener("change", (e) => {
        this.changerNiveau(parseInt(e.target.value));
      });
    }

    // Mascotte + bulle de question
    const parole = document.createElement("div");
    parole.className = "geo-parole";
    parole.appendChild(this.creerMascotte());
    this.elInstructions.parentNode.insertBefore(parole, this.elInstructions);
    parole.appendChild(this.elInstructions);
    this.elInstructions.setAttribute("aria-live", "polite");

    // Retour d'erreur / de réussite (sous les boutons)
    const retour = document.createElement("div");
    retour.id = "geo-retour";
    retour.className = "geo-retour";
    retour.setAttribute("role", "status");
    retour.setAttribute("aria-live", "polite");
    this.elZoneReponse.parentNode.insertBefore(retour, this.elZoneReponse.nextSibling);
    this.elRetour = retour;

    if (!this.elStatistique || this.elStatistique.id !== "geo-stats") {
      // anciennes pages : on garde le <span> existant
      const p = this.elStatistique && this.elStatistique.closest("p");
      if (p) { p.id = "geo-stats"; p.className = "geo-stats"; p.removeAttribute("style"); this.elStatistique = p; }
    }
    this.elStatistique.classList.add("geo-stats");
  }

  changerNiveau(n) {
    this.clearTimer();
    this.niveau = Math.max(1, Math.min(n, this.maxNiveau));
    if (this.elSelectNiveau) this.elSelectNiveau.value = this.niveau;
    this.consecutifs = 0;
    this.erreursConsecutives = 0;
    // La progression n'est sauvegardée qu'à la fin avec un bon score
    this.reinitialiserSession();
    this.nouveauDefi();
  }

  reinitialiserSession() {
    this.score = 0;
    this.tentatives = 0;
    this.consecutifs = 0;
    this.historiqueSession = [];
    this.resultats = [];
    this.retirerConfettis();
  }

  clearTimer() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  }

  majMana() { /* ancienne barre de mana remplacée par les pastilles */ }

  /* ---------- Déroulé d'une question ---------- */

  nouveauDefi() {
    this.enAttente = false;
    this.clearTimer();
    this.elRetour.textContent = "";
    this.elRetour.className = "geo-retour";

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

    this.elForme.innerHTML = MoteurGeometrie.nettoyerSVG(defi.svg);
    this.elForme.classList.remove("geo-fin");
    this.texteConsigne = (this.estCP && defi.instructionCP) ? defi.instructionCP : defi.instruction;
    this.elInstructions.innerHTML = this.texteConsigne;
    this.elInstructions.className = "";
    if (this.estCP) this.ajouterBoutonVoix();
    this.elCadre.classList.remove("succes", "erreur", "geo-termine");
    this.mascotteEtat("neutre");

    this.preparerInterface(defi.options);
    this.majStatistiques();
  }

  // Aplats lisibles : encre bleu nuit pour les contours, aplats plus pleins
  static nettoyerSVG(svg) {
    return String(svg)
      .replace(/#334155/gi, "#2B2D5B")
      .replace(/stroke="#f44336"/gi, 'stroke="#E11D48"')
      .replace(/fill-opacity="0\.6"/g, 'fill-opacity="0.9"')
      .replace(/fill-opacity="0\.4"/g, 'fill-opacity="0.85"');
  }

  ajouterBoutonVoix() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bouton-voix";
    btn.textContent = "🔊";
    btn.setAttribute("aria-label", "Écouter la consigne");
    btn.onclick = () => {
      const choix = this.typeInterface === "boutons" ? (this.optionsCourantes || []) : [];
      if (window.Voix && typeof window.Voix.question === "function") window.Voix.question(this.texteConsigne, choix);
      else GeoProgramme.lire(this.texteConsigne);
    };
    this.elInstructions.appendChild(btn);
  }

  static formeIcone(i) {
    // Pastille de lettre colorée (A, B, C...) : repère visuel sans suggérer une forme géométrique
    return `<span class="geo-lettre" aria-hidden="true">${"ABCDEF".charAt(i % 6)}</span>`;
  }

  static iconeBinaire(oui) {
    return oui
      ? '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" fill="#22C55E" stroke="#2B2D5B" stroke-width="2.2"/><path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" fill="#EF4444" stroke="#2B2D5B" stroke-width="2.2"/><path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';
  }

  preparerInterface(options) {
    this.optionsCourantes = (this.typeInterface === "boutons" && options) ? options.slice() : [];
    this.elZoneReponse.innerHTML = "";

    if (this.typeInterface === "boutons" && options) {
      const grille = document.createElement("div");
      const binaire = options.length === 2 && options.every((o) => ["Vrai", "Faux", "Oui", "Non"].indexOf(o) >= 0);
      grille.className = "geo-choix" + (binaire ? " geo-choix-bin" : "") + (options.length === 2 ? " geo-choix-2" : "");
      if (options.some((o) => String(o).length > 11)) grille.classList.add("geo-long");
      grille.setAttribute("role", "group");
      grille.setAttribute("aria-label", "Réponses possibles");
      options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bouton-option";
        btn.dataset.valeur = opt;
        let icone;
        if (binaire) {
          const oui = opt === "Vrai" || opt === "Oui";
          btn.classList.add("geo-bin", oui ? "oui" : "non");
          icone = MoteurGeometrie.iconeBinaire(oui);
        } else {
          btn.classList.add("geo-c" + (i % 6));
          icone = MoteurGeometrie.formeIcone(i);
        }
        btn.innerHTML = `<span class="geo-ico">${icone}</span><span class="geo-lib"></span><span class="geo-marque" aria-hidden="true"></span>`;
        btn.querySelector(".geo-lib").textContent = opt;
        btn.setAttribute("aria-label", `Réponse : ${opt}`);
        btn.onclick = () => this.validerReponse(opt);
        grille.appendChild(btn);
      });
      this.elZoneReponse.appendChild(grille);
    } else {
      const conteneurInput = document.createElement("div");
      conteneurInput.className = "geo-saisie";

      const input = document.createElement("input");
      input.type = "number";
      input.id = "saisieReponse";
      input.inputMode = "numeric";
      input.setAttribute("aria-label", "Saisis ta réponse ici");
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.validerReponse(input.value);
        }
      });

      const btnValider = document.createElement("button");
      btnValider.type = "button";
      btnValider.textContent = "Valider";
      btnValider.className = "bouton-option geo-valider";
      btnValider.setAttribute("aria-label", "Valider la réponse");
      btnValider.onclick = () => this.validerReponse(input.value);

      conteneurInput.appendChild(input);
      conteneurInput.appendChild(btnValider);
      this.elZoneReponse.appendChild(conteneurInput);

      setTimeout(() => input.focus(), 100);
    }
  }

  messageRetour(texte, type) {
    this.elRetour.className = "geo-retour " + type;
    this.elRetour.innerHTML = "";
    const t = document.createElement("span");
    t.className = "geo-retour-texte";
    t.textContent = texte;
    this.elRetour.appendChild(t);
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
        this.messageRetour("Écris seulement des chiffres.", "geo-info");
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
    this.resultats.push(estCorrect);

    this.elCadre.classList.remove("succes", "erreur");
    void this.elCadre.offsetWidth;

    // Boutons : on montre le choix de l'enfant et, si besoin, la bonne réponse
    const boutons = Array.from(this.elZoneReponse.querySelectorAll(".bouton-option[data-valeur]"));
    boutons.forEach((b) => {
      b.disabled = true;
      const v = b.dataset.valeur.toLowerCase().trim();
      const marque = b.querySelector(".geo-marque");
      if (v === s2) { b.classList.add("juste"); if (marque) marque.textContent = "✓"; }
      else if (!estCorrect && v === s1) { b.classList.add("faux"); if (marque) marque.textContent = "✗"; }
    });
    const input = this.elZoneReponse.querySelector("#saisieReponse");
    if (input) {
      input.disabled = true;
      input.classList.add(estCorrect ? "juste" : "faux");
      const bv = this.elZoneReponse.querySelector(".geo-valider");
      if (bv) bv.disabled = true;
    }

    if (estCorrect) {
      this.score++;
      this.consecutifs++;
      this.erreursConsecutives = 0;
      const felicitations = ["Bien joué !", "Bravo !", "Super !", "Génial !", "Exact !"];
      this.messageRetour("✅ " + felicitations[(this.score + this.tentatives) % felicitations.length], "geo-ok");
      this.elCadre.classList.add("succes");
      this.mascotteEtat("heureuse");
    } else {
      this.consecutifs = 0;
      this.erreursConsecutives++;
      this.messageRetour(`Pas grave ! C'était : ${this.currentReponse}`, "geo-ko");
      this.elCadre.classList.add("erreur");
      this.mascotteEtat("pleure");
    }

    this.clearTimer();
    this.timer = setTimeout(() => this.nouveauDefi(), estCorrect ? 1400 : 2800);
    this.majStatistiques();
  }

  /* ---------- Fin de mission ---------- */

  retirerConfettis() {
    const c = this.elCadre && this.elCadre.querySelector(".geo-confettis");
    if (c) c.remove();
  }

  lancerConfettis() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.retirerConfettis();
    const zone = document.createElement("div");
    zone.className = "geo-confettis";
    zone.setAttribute("aria-hidden", "true");
    const couleurs = ["#14B8A6", "#FACC15", "#F43F5E", "#8B5CF6", "#3B82F6", "#F97316"];
    for (let i = 0; i < 28; i++) {
      const c = document.createElement("i");
      c.style.left = Math.round(Math.random() * 100) + "%";
      c.style.background = couleurs[i % couleurs.length];
      c.style.animationDelay = (Math.random() * 0.8).toFixed(2) + "s";
      c.style.animationDuration = (1.8 + Math.random() * 1.4).toFixed(2) + "s";
      c.style.transform = "rotate(" + Math.round(Math.random() * 360) + "deg)";
      zone.appendChild(c);
    }
    this.elCadre.appendChild(zone);
  }

  afficherResultats() {
    const reussi = this.score >= 8;
    const etoiles = this.score >= 9 ? 3 : (this.score >= 8 ? 2 : (this.score >= 5 ? 1 : 0));
    this.elCadre.classList.add("geo-termine");
    this.elCadre.classList.remove("succes", "erreur");
    this.elForme.classList.add("geo-fin");
    let rangee = "";
    for (let i = 0; i < 3; i++) {
      rangee += `<span class="geo-etoile-fin" style="animation-delay:${(0.2 + i * 0.25).toFixed(2)}s">${typeof GeoIcones !== "undefined" ? GeoIcones.etoile(i < etoiles) : (i < etoiles ? "★" : "☆")}</span>`;
    }
    this.elForme.innerHTML = `<div class="geo-etoiles-fin" role="img" aria-label="${etoiles} étoile${etoiles > 1 ? "s" : ""} sur 3">${rangee}</div>`;
    this.mascotteEtat(reussi ? "emerveillee" : (this.score >= 5 ? "heureuse" : "neutre"));

    let msg;
    if (this.score >= 9) msg = "Tu es un vrai magicien !";
    else if (reussi) msg = "Bravo, quelle belle mission !";
    else if (this.score >= 5) msg = "Bien essayé, tu progresses !";
    else msg = "On s'entraîne et ça ira mieux !";

    this.elInstructions.className = "geo-fin-texte";
    this.elInstructions.innerHTML = `
      <span class="geo-fin-titre">Mission terminée !</span>
      <span class="geo-fin-score">Ton score est de <strong>${this.score} / ${this.limiteQuestions}</strong></span>
      <span class="geo-fin-msg">${msg}</span>`;

    let niveauSuivant = false;
    if (reussi) {
      const profilActuel = (typeof gestionnaireProfils.getProgression === "function" && gestionnaireProfils.getProgression(this.nomOperation)) || { niveau: 1 };
      const nouveauNiveau = Math.max(profilActuel.niveau || 1, this.niveau + 1);
      if (typeof gestionnaireProfils.setProgression === "function") {
        gestionnaireProfils.setProgression(this.nomOperation, { niveau: nouveauNiveau });
      }
      niveauSuivant = this.niveau < this.maxNiveau;
      this.messageRetour("🏆 Niveau réussi ! Progression sauvegardée.", "geo-ok geo-grand");
      this.lancerConfettis();
    } else {
      this.messageRetour("Il faut 8 / 10 pour réussir ce niveau. Tu peux le faire !", "geo-info");
    }

    this.elZoneReponse.innerHTML = "";
    const groupe = document.createElement("div");
    groupe.className = "geo-fin-actions";
    const recommencer = () => {
      this.clearTimer();
      this.reinitialiserSession();
      this.nouveauDefi();
    };
    if (niveauSuivant) {
      const suivant = document.createElement("button");
      suivant.type = "button";
      suivant.className = "bouton-option geo-principal";
      suivant.textContent = "Niveau suivant";
      suivant.onclick = () => this.changerNiveau(this.niveau + 1);
      groupe.appendChild(suivant);
    }
    const btnRejouer = document.createElement("button");
    btnRejouer.type = "button";
    btnRejouer.textContent = "Recommencer";
    btnRejouer.className = "bouton-option " + (niveauSuivant ? "geo-secondaire" : "geo-principal");
    btnRejouer.onclick = recommencer;
    groupe.appendChild(btnRejouer);
    this.elZoneReponse.appendChild(groupe);
    this.majStatistiques();
  }

  /* ---------- Score et pastilles ---------- */

  majStatistiques() {
    if (this.elPastilles) {
      this.elPastilles.forEach((p, i) => {
        p.className = "geo-pastille";
        if (i < this.resultats.length) {
          p.classList.add(this.resultats[i] ? "juste" : "faux");
          p.textContent = this.resultats[i] ? "✓" : "✗";
        } else {
          p.textContent = "";
          if (i === this.resultats.length && this.tentatives < this.limiteQuestions) p.classList.add("courante");
        }
      });
      const pc = document.getElementById("geo-pastilles");
      if (pc) pc.setAttribute("aria-label", `Question ${Math.min(this.tentatives + 1, this.limiteQuestions)} sur ${this.limiteQuestions}`);
    }
    if (this.elStatistique) {
      const erreurs = this.tentatives - this.score;
      const numero = Math.min(this.tentatives + 1, this.limiteQuestions);
      this.elStatistique.innerHTML = this.tentatives >= this.limiteQuestions
        ? `<span class="geo-st-n">${this.score} / ${this.limiteQuestions}</span>`
        : `Question <span id="geo-stat" class="geo-st-n">${numero} / ${this.limiteQuestions}</span>`;
      this.elStatistique.innerHTML += `<span class="geo-st-ok">✅ ${this.score}</span><span class="geo-st-ko">❌ ${erreurs}</span>`;
    }
  }
}
