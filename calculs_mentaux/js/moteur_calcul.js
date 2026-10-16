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
    this.verrou = false;      // true pendant l'affichage du retour (réponse déjà donnée)
    this.minuteur = null;
    this.decimal = false;

    // Chargement de la progression du joueur actif
    let progressionSauvegardee = null;
    try { progressionSauvegardee = gp && gp.getProgression ? gp.getProgression(this.nomOperation) : null; } catch (e) { progressionSauvegardee = null; }
    this.niveau = Math.min(this.nbPaliers, Math.max(1, parseInt(progressionSauvegardee && progressionSauvegardee.niveau, 10) || 1));
    this.niveauSauvegarde = this.niveau;

    // Elements DOM
    const $ = (id) => document.getElementById(id);
    this.elCalcul = $("calcul");
    this.elSaisie = $("saisieReponse");
    this.elInstructions = $("instructions");
    this.elBoutonValider = $("valider");
    this.elCadre = $("zone-jeu");
    this.elFin = $("zone-fin");
    this.elMascotte = $("mascotte");
    this.elPalier = $("palier");
    this.elSerie = $("serie");
    this.elScore = $("score");
    this.elEssais = $("essais");
    this.elSelectNiveau = $("selectNiveau");
    this.elPave = $("pave");
    this.elBascule = $("bascule-pave");
    this.elCarte = document.querySelector(".calc-carte");

    document.body.classList.toggle("calc-cp", this.estCP);
    this.construireSelecteur();
    this.construirePave();
    this.construireSerie();
    this.injecterTitreEtVoix();
    this.initPave();
    this.initEvents();
    this.majStatistiques();
    this.majAffichageNiveau();
    this.nouveauCalcul();
  }

  /* ---------- utilitaires d'affichage ---------- */

  static img(nom) { return `../../images/${nom}.svg`; }

  etoilesHTML(actives, total) {
    let h = "";
    for (let i = 1; i <= total; i++) {
      h += `<img class="calc-etoile${i <= actives ? " on" : ""}${i === actives ? " courant" : ""}" src="${MoteurCalcul.img("etoile")}" alt="" />`;
    }
    return h;
  }

  setMascotte(etat) {
    if (!this.elMascotte) return;
    this.elMascotte.src = MoteurCalcul.img("mascotte-" + etat);
    this.elMascotte.dataset.etat = etat;
    this.elMascotte.classList.remove("rebond", "secoue");
    void this.elMascotte.offsetWidth;
    if (etat === "contente") this.elMascotte.classList.add("rebond");
    if (etat === "triste") this.elMascotte.classList.add("secoue");
  }

  construireSelecteur() {
    this.elSelectNiveau.innerHTML = Array.from({ length: this.nbPaliers }, (_, i) => i + 1)
      .map((n) => `<option value="${n}">${n}</option>`).join("");
  }

  construireSerie() {
    this.elSerie.innerHTML = Array.from({ length: 5 }, () => '<span class="calc-point"></span>').join("");
  }

  majMana(valeur) {
    const n = Math.min(5, Math.max(0, valeur));
    this.elSerie.querySelectorAll(".calc-point").forEach((p, i) => p.classList.toggle("on", i < n));
    this.elSerie.setAttribute("aria-label", `Série : ${n} sur 5 bonnes réponses`);
  }

  majAffichageNiveau() {
    if (this.elSelectNiveau) this.elSelectNiveau.value = this.niveau;
    this.elPalier.innerHTML = this.etoilesHTML(this.niveau, this.nbPaliers);
    this.elPalier.setAttribute("aria-label", `Palier ${this.niveau} sur ${this.nbPaliers}`);
  }

  majStatistiques() {
    if (this.elScore) this.elScore.textContent = this.score;
    if (this.elEssais) {
      let h = "";
      for (let i = 0; i < this.limiteErreurs; i++) {
        h += `<span class="calc-essai${i < this.erreurs ? " perdu" : ""}">${i < this.erreurs ? "✕" : ""}</span>`;
      }
      this.elEssais.innerHTML = h;
      const restants = this.limiteErreurs - this.erreurs;
      this.elEssais.setAttribute("aria-label", `Il te reste ${restants} essai${restants > 1 ? "s" : ""}`);
    }
  }

  /* ---------- pavé numérique ---------- */

  construirePave() {
    const touche = (cls, txt, attrs) => `<button type="button" class="calc-touche ${cls}" ${attrs}>${txt}</button>`;
    let h = "";
    for (let i = 1; i <= 9; i++) h += touche("calc-chiffre", i, `data-k="${i}"`);
    h += touche("calc-chiffre calc-zero", "0", 'data-k="0"');
    h += touche("calc-virgule", ",", 'data-k="," aria-label="Virgule"');
    h += touche("calc-efface", "⌫", 'data-k="del" aria-label="Effacer"');
    h += touche("calc-ok", "✓", 'id="pave-valider" data-k="ok" aria-label="Valider"');
    this.elPave.innerHTML = h;
    this.elVirgule = this.elPave.querySelector(".calc-virgule");
    this.elPave.setAttribute("role", "group");
    this.elPave.setAttribute("aria-label", "Pavé numérique");
  }

  initPave() {
    let pref = null;
    try { pref = localStorage.getItem("mathemagie-pave"); } catch (e) { pref = null; }
    const tactile = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    this.paveActif = pref === "1" ? true : pref === "0" ? false : (tactile || this.estCP);
    this.appliquerPave();
  }

  appliquerPave() {
    const actif = !!this.paveActif;
    this.elPave.hidden = !actif;
    this.elBoutonValider.hidden = actif;
    this.elCarte.classList.toggle("avec-pave", actif);
    this.elBascule.setAttribute("aria-pressed", actif ? "true" : "false");
    this.elSaisie.setAttribute("inputmode", actif ? "none" : "decimal");
    this.elSaisie.setAttribute("enterkeyhint", "done");
  }

  basculerPave() {
    this.paveActif = !this.paveActif;
    try { localStorage.setItem("mathemagie-pave", this.paveActif ? "1" : "0"); } catch (e) { /* ignore */ }
    this.appliquerPave();
    this.elSaisie.focus({ preventScroll: true });
  }

  toucheChoisie(k) {
    if (k === "ok") { this.validerReponse(); return; }
    if (this.verrou) return;
    let v = this.elSaisie.value;
    if (k === "del") v = v.slice(0, -1);
    else if (k === ",") {
      if (!this.decimal || v.includes(",") || v.includes(".")) return;
      v = (v === "" ? "0" : v) + ",";
    } else if (v.length < 8) v += k;
    this.elSaisie.value = v;
    this.elSaisie.focus({ preventScroll: true });
  }

  /* ---------- événements ---------- */

  initEvents() {
    this.elSaisie.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.repeat) {
        event.preventDefault();
        this.validerReponse();
      }
    });
    this.elBoutonValider.addEventListener("click", () => this.validerReponse());
    this.elBascule.addEventListener("click", () => this.basculerPave());
    // Le focus reste dans le champ : pas de clavier système, pas de saut de page
    this.elPave.addEventListener("mousedown", (e) => e.preventDefault());
    this.elPave.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-k]");
      if (b) this.toucheChoisie(b.dataset.k);
    });
    this.elSelectNiveau.addEventListener("change", (e) => {
      this.niveau = parseInt(e.target.value, 10);
      this.consecutifs = 0;
      this.erreursConsecutives = 0;
      this.majMana(0);
      // La progression est sauvegardée uniquement après 5 bonnes réponses consécutives
      // Reset complet de la partie en cours
      this.score = 0;
      this.erreurs = 0;
      this.majStatistiques();
      this.majAffichageNiveau();
      this.nouveauCalcul();
    });
  }

  sauvegarderProgression() {
    if (typeof gestionnaireProfils !== "undefined" && typeof gestionnaireProfils.setProgression === "function") {
      gestionnaireProfils.setProgression(this.nomOperation, { niveau: this.niveau });
    }
    this.niveauSauvegarde = Math.max(this.niveauSauvegarde || 1, this.niveau);
  }

  /* ---------- déroulement ---------- */

  nouveauCalcul() {
    clearTimeout(this.minuteur);
    this.verrou = false;
    if (this.erreurs >= this.limiteErreurs) {
      this.afficherResultats();
      return;
    }

    const calcul = this.genererCalcul(this.niveau);
    this.currentResultat = calcul.resultat;
    this.currentVoix = calcul.voix || "";
    const def = this.defOperation.niveaux[Math.min(this.nbPaliers, this.niveau) - 1] || {};
    this.decimal = (calcul.decimaux || def.decimaux || 0) > 0;
    this.elVirgule.hidden = !this.decimal;
    this.elPave.classList.toggle("avec-virgule", this.decimal);

    const texte = calcul.texte || `${calcul.a} ${this.operationSign} ${calcul.b} = `;
    const base = String(texte).replace(/\s*=\s*$/, "");
    this.elCalcul.textContent = "";
    // Énoncé long (ex. 4 nombres à additionner) : police réduite, le CSS lit cet attribut
    this.elCalcul.dataset.longueur = base.length > 30 ? "tres-long" : base.length > 16 ? "long" : "";
    this.elCalcul.append(document.createTextNode(base + " "));
    const egal = document.createElement("span");
    egal.className = "calc-egal";
    egal.textContent = "= ?";
    this.elCalcul.append(egal);

    this.elSaisie.value = "";
    this.elSaisie.disabled = false;
    this.elInstructions.textContent = calcul.aide || (this.estCP ? "Trouve le résultat." : "Ta réponse ?");
    this.elInstructions.className = "calc-neutre";

    this.elCadre.classList.remove("succes", "erreur");
    this.elBoutonValider.disabled = false;
    this.majMana(this.consecutifs % 5);
    this.setMascotte(this.estCP ? "lecture" : "neutre");
    this.elSaisie.focus({ preventScroll: true });
  }

  afficherResultats() {
    clearTimeout(this.minuteur);
    this.verrou = true;
    let etoiles, message;
    if (this.score >= 100) { etoiles = 3; message = "Incroyable ! Tu es un vrai mage des nombres !"; }
    else if (this.score >= 50) { etoiles = 2; message = "Bien joué ! Continue comme ça !"; }
    else if (this.score > 0) { etoiles = 1; message = "Joli début ! La prochaine fois sera encore mieux."; }
    else { etoiles = 0; message = "Pas grave, on s'entraîne et tu vas y arriver !"; }

    let confettis = "";
    if (etoiles > 0) {
      for (let i = 0; i < 12; i++) {
        const gauche = 4 + Math.round(Math.random() * 90);
        const delai = (Math.random() * 1.6).toFixed(2);
        const taille = 18 + Math.round(Math.random() * 18);
        confettis += `<img class="calc-confetti" src="${MoteurCalcul.img("etincelle")}" alt="" style="left:${gauche}%;width:${taille}px;animation-delay:${delai}s" />`;
      }
    }
    let grandes = "";
    for (let i = 1; i <= 3; i++) {
      grandes += `<img class="calc-grande-etoile${i <= etoiles ? " on" : ""}" src="${MoteurCalcul.img("etoile")}" alt="" style="animation-delay:${(0.15 + i * 0.25).toFixed(2)}s" />`;
    }

    this.elFin.innerHTML = `
      <div class="calc-confettis" aria-hidden="true">${confettis}</div>
      <img class="calc-mascotte calc-mascotte-fin rebond" src="${MoteurCalcul.img("mascotte-" + (etoiles > 0 ? "contente" : "neutre"))}" alt="" />
      <h2 class="calc-fin-titre">${etoiles > 0 ? "Bravo !" : "Partie terminée"}</h2>
      <div class="calc-grandes-etoiles" role="img" aria-label="${etoiles} étoile${etoiles > 1 ? "s" : ""} sur 3">${grandes}</div>
      <p class="calc-fin-score"><strong>${this.score}</strong> pts</p>
      <p class="calc-fin-message">${message}</p>
      <button type="button" id="recommencer" class="calc-btn-principal">Recommencer</button>
      <a class="calc-lien-autres" href="../index.html">Autres missions</a>
    `;
    this.elCadre.hidden = true;
    this.elFin.hidden = false;
    const btn = document.getElementById("recommencer");
    btn.addEventListener("click", () => this.recommencer());
    btn.focus({ preventScroll: true });
  }

  recommencer() {
    this.score = 0;
    this.erreurs = 0;
    this.consecutifs = 0;
    this.erreursConsecutives = 0;
    this.elFin.hidden = true;
    this.elFin.innerHTML = "";
    this.elCadre.hidden = false;
    this.majMana(0);
    this.majStatistiques();
    this.majAffichageNiveau();
    this.nouveauCalcul();
  }

  validerReponse() {
    // Pendant le retour, valider = passer tout de suite au calcul suivant
    if (this.verrou) {
      if (this.elFin.hidden) this.nouveauCalcul();
      return;
    }
    const inputValue = this.elSaisie.value.trim();
    if (inputValue === "") {
      this.elInstructions.textContent = this.estCP ? "Écris un nombre." : "Écris ta réponse d'abord.";
      this.elInstructions.className = "calc-neutre";
      this.elSaisie.focus({ preventScroll: true });
      return;
    }

    const valide = /^\d+([.,]\d+)?$/.test(inputValue);
    const saisiResultat = valide ? Number(inputValue.replace(",", ".")) : NaN;
    if (isNaN(saisiResultat)) {
      this.elInstructions.textContent = "Écris seulement des chiffres.";
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");
      setTimeout(() => this.elCadre.classList.remove("erreur"), 400);
      return;
    }

    this.elCadre.classList.remove("succes", "erreur");
    void this.elCadre.offsetWidth;
    this.verrou = true;
    let delai = 1500;

    if (Math.abs(saisiResultat - this.currentResultat) < 1e-9) {
      // Points gagnés = niveau × (1 + série d'invincibilité)
      const pointsGagnes = this.niveau * (1 + this.consecutifs);
      this.score += pointsGagnes;
      this.consecutifs++;
      this.erreursConsecutives = 0;

      const combo = this.consecutifs > 1 ? ` <span class="calc-combo">série ×${this.consecutifs}</span>` : "";
      this.elInstructions.innerHTML = `<span class="calc-pastille">✅</span> Bravo ! <strong>+${pointsGagnes} pts</strong>${combo}`;
      this.elInstructions.className = "texte-succes";
      this.elCadre.classList.add("succes");
      this.setMascotte("contente");

      // Evolution : 5 bonnes réponses de suite = niveau supérieur (la streak continue)
      if (this.consecutifs >= 5 && this.consecutifs % 5 === 0 && this.niveau < this.nbPaliers) {
        this.niveau++;
        this.majMana(5); // Remplit la série brièvement
        this.minuteurSerie = setTimeout(() => this.majMana(0), 500);
        this.elInstructions.innerHTML = `<span class="calc-pastille">✅</span> Palier ${this.niveau} ! <strong>+${pointsGagnes} pts</strong>${combo}`;
        this.majAffichageNiveau();
        delai = 2000;

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

      const bonne = String(this.currentResultat).replace(".", ",");
      this.elInstructions.innerHTML = `<span class="calc-pastille">❌</span> Presque ! La réponse est <strong class="calc-bonne">${bonne}</strong>`;
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");
      this.setMascotte("triste");
      delai = 2600;

      // Régression : 2 erreurs de suite = niveau inférieur (min 1)
      if (this.erreursConsecutives >= 2 && this.niveau > 1) {
        this.niveau--;
        this.erreursConsecutives = 0;
        this.majAffichageNiveau();
        this.sauvegarderProgression();
      }
    }

    this.majStatistiques();
    clearTimeout(this.minuteur);
    this.minuteur = setTimeout(() => this.nouveauCalcul(), delai);
  }

  /* ---------- titre, consigne, voix (CP) ---------- */

  injecterTitreEtVoix() {
    const titre = document.getElementById("titre-texte");
    if (titre && this.defOperation.libelle) {
      titre.textContent = this.defOperation.libelle;
      document.title = this.defOperation.libelle;
    }
    const consigne = document.getElementById("consigne");
    if (consigne) {
      if (this.defOperation.consigne) consigne.textContent = this.defOperation.consigne;
      else consigne.hidden = true;
    }
    this.elSaisie.type = "text";
    this.elSaisie.setAttribute("autocomplete", "off");
    if (this.estCP && "speechSynthesis" in window) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "btn-voix";
      btn.className = "calc-voix";
      btn.textContent = "🔊";
      btn.setAttribute("aria-label", "Écouter le calcul");
      btn.addEventListener("click", () => this.lire());
      this.elCalcul.parentNode.insertAdjacentElement("afterend", btn);
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
}
