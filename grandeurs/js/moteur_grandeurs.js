/* Moteur des missions « Grandeurs & mesures ».
   Même mécanique que MoteurCalcul (palier, série, essais, pavé, voix CP) : 5 bonnes réponses d'affilée
   montent d'un palier, 2 erreurs d'affilée en font descendre un.
   Rien de propre à une classe ici : tout vient de programme.grandeurs[mission] via GenerateurGrandeurs. */
class MoteurGrandeurs {
  constructor(config) {
    this.mission = config.mission;                       // ex. 'longueurs' (clé dans programme.grandeurs)
    this.idProgression = 'grandeurs-' + this.mission;    // clé de progression du profil

    const gp = (typeof gestionnaireProfils !== "undefined") ? gestionnaireProfils : null;
    this.niveauClasse = (gp && typeof gp.getNiveauClasse === "function" && gp.getNiveauClasse()) || null;
    this.programme = (gp && typeof gp.getProgramme === "function" && gp.getProgramme()) || null;
    if (!this.programme && window.PROGRAMMES) {
      this.programme = window.PROGRAMMES[this.niveauClasse || "cm1"] || window.PROGRAMMES.cm1 || Object.values(window.PROGRAMMES)[0] || null;
    }
    if (this.programme && !this.niveauClasse) this.niveauClasse = this.programme.id;
    this.def = GenerateurGrandeurs.definition(this.programme, this.mission);
    if (!this.def) {
      // Mission hors programme : inaccessible
      window.location.replace("index.html");
      return;
    }
    this.nbPaliers = this.def.niveaux.length;
    this.estCP = this.niveauClasse === "cp";

    this.score = 0;
    this.erreurs = 0;
    this.limiteErreurs = 5;
    this.consecutifs = 0;
    this.erreursConsecutives = 0;
    this.verrou = false;
    this.minuteur = null;
    this.derniere = "";
    this.q = null;

    let sauvegarde = null;
    try { sauvegarde = gp && gp.getProgression ? gp.getProgression(this.idProgression) : null; } catch (e) { sauvegarde = null; }
    this.niveau = Math.min(this.nbPaliers, Math.max(1, parseInt(sauvegarde && sauvegarde.niveau, 10) || 1));
    this.niveauSauvegarde = this.niveau;

    const $ = (id) => document.getElementById(id);
    this.elCalcul = $("calcul");
    this.elSaisie = $("saisieReponse");
    this.elUnite = $("unite");
    this.elSaisieBloc = $("bloc-saisie");
    this.elChoix = $("choix");
    this.elFigure = $("figure");
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
    this.nouvelleQuestion();
  }

  /* ---------- utilitaires d'affichage ---------- */

  static img(nom) { return `../images/${nom}.svg`; }
  static fmt(n) { return String(n).replace(".", ","); }

  etoilesHTML(actives, total) {
    let h = "";
    for (let i = 1; i <= total; i++) {
      h += `<img class="calc-etoile${i <= actives ? " on" : ""}${i === actives ? " courant" : ""}" src="${MoteurGrandeurs.img("etoile")}" alt="" />`;
    }
    return h;
  }

  setMascotte(etat) {
    if (!this.elMascotte) return;
    this.elMascotte.src = MoteurGrandeurs.img("mascotte-" + etat);
    this.elMascotte.dataset.etat = etat;
    this.elMascotte.classList.remove("rebond", "secoue");
    void this.elMascotte.offsetWidth;
    if (etat === "contente" || etat === "heureuse" || etat === "emerveillee" || etat === "coeur") this.elMascotte.classList.add("rebond");
    if (etat === "triste" || etat === "pleure") this.elMascotte.classList.add("secoue");
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
    const actif = !!this.paveActif && !this.modeChoix;
    this.elPave.hidden = !actif;
    this.elBoutonValider.hidden = this.modeChoix || !!this.paveActif;
    this.elCarte.classList.toggle("avec-pave", actif);
    this.elBascule.hidden = !!this.modeChoix;
    this.elBascule.setAttribute("aria-pressed", this.paveActif ? "true" : "false");
    this.elSaisie.setAttribute("inputmode", this.paveActif ? "none" : "decimal");
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
    } else if (v.length < 10) v += k;
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
    this.elPave.addEventListener("mousedown", (e) => e.preventDefault());
    this.elPave.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-k]");
      if (b) this.toucheChoisie(b.dataset.k);
    });
    this.elChoix.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (b) this.validerChoix(parseInt(b.dataset.i, 10), b);
    });
    this.elSelectNiveau.addEventListener("change", (e) => {
      this.niveau = parseInt(e.target.value, 10);
      this.consecutifs = 0;
      this.erreursConsecutives = 0;
      this.majMana(0);
      this.score = 0;
      this.erreurs = 0;
      this.majStatistiques();
      this.majAffichageNiveau();
      this.nouvelleQuestion();
    });
  }

  sauvegarderProgression() {
    if (typeof gestionnaireProfils !== "undefined" && typeof gestionnaireProfils.setProgression === "function") {
      gestionnaireProfils.setProgression(this.idProgression, { niveau: this.niveau });
    }
    this.niveauSauvegarde = Math.max(this.niveauSauvegarde || 1, this.niveau);
  }

  /* ---------- déroulement ---------- */

  tirerQuestion() {
    let q = null;
    for (let i = 0; i < 6; i++) {
      q = GenerateurGrandeurs.generer(this.programme, this.mission, this.niveau);
      if (q && q.texte + (q.choix ? q.choix.join("|") : "") !== this.derniere) break; // évite deux fois la même
    }
    return q;
  }

  nouvelleQuestion() {
    clearTimeout(this.minuteur);
    this.verrou = false;
    if (this.erreurs >= this.limiteErreurs) {
      this.afficherResultats();
      return;
    }
    const q = this.tirerQuestion();
    if (!q) { window.location.replace("index.html"); return; }
    this.q = q;
    this.derniere = q.texte + (q.choix ? q.choix.join("|") : "");
    this.modeChoix = !!q.choix;
    this.decimal = (q.decimaux || 0) > 0;

    // Énoncé : « 3 m = ? cm » (court) ou phrase (problème)
    const long = q.texte.length > 28;
    this.elCalcul.textContent = "";
    this.elCalcul.dataset.longueur = long ? "phrase" : "";
    this.elCalcul.append(document.createTextNode(q.texte));
    if (!this.modeChoix && /=$/.test(q.texte)) {
      const egal = document.createElement("span");
      egal.className = "calc-egal";
      egal.textContent = " ? " + (q.unite || "");
      this.elCalcul.append(egal);
    }

    this.dessinerFigure(q.figure);
    this.elVirgule.hidden = !this.decimal;
    this.elPave.classList.toggle("avec-virgule", this.decimal);

    this.elChoix.textContent = "";
    if (this.modeChoix) {
      q.choix.forEach((c, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "gr-choix-bouton";
        b.dataset.i = String(i);
        b.textContent = c;
        this.elChoix.append(b);
      });
    }
    this.elChoix.hidden = !this.modeChoix;
    this.elSaisieBloc.hidden = this.modeChoix;
    this.elUnite.textContent = /=$/.test(q.texte) ? "" : (q.unite || "");
    this.elUnite.hidden = !this.elUnite.textContent;
    this.appliquerPave();

    this.elSaisie.value = "";
    this.elSaisie.disabled = false;
    this.elInstructions.textContent = this.modeChoix
      ? (this.estCP ? "Touche la bonne réponse." : "Choisis la bonne réponse.")
      : (this.estCP ? "Trouve le résultat." : "Ta réponse ?");
    this.elInstructions.className = "calc-neutre";

    this.elCadre.classList.remove("succes", "erreur");
    this.elBoutonValider.disabled = false;
    this.majMana(this.consecutifs % 5);
    this.setMascotte(this.estCP ? "lecture" : "neutre");
    if (!this.modeChoix) this.elSaisie.focus({ preventScroll: true });
  }

  afficherResultats() {
    clearTimeout(this.minuteur);
    this.verrou = true;
    let etoiles, message;
    if (this.score >= 100) { etoiles = 3; message = "Incroyable ! Tu mesures tout comme un vrai mage !"; }
    else if (this.score >= 50) { etoiles = 2; message = "Bien joué ! Continue comme ça !"; }
    else if (this.score > 0) { etoiles = 1; message = "Joli début ! La prochaine fois sera encore mieux."; }
    else { etoiles = 0; message = "Pas grave, on s'entraîne et tu vas y arriver !"; }

    let confettis = "";
    if (etoiles > 0) {
      for (let i = 0; i < 12; i++) {
        const gauche = 4 + Math.round(Math.random() * 90);
        const delai = (Math.random() * 1.6).toFixed(2);
        const taille = 18 + Math.round(Math.random() * 18);
        confettis += `<img class="calc-confetti" src="${MoteurGrandeurs.img("etincelle")}" alt="" style="left:${gauche}%;width:${taille}px;animation-delay:${delai}s" />`;
      }
    }
    let grandes = "";
    for (let i = 1; i <= 3; i++) {
      grandes += `<img class="calc-grande-etoile${i <= etoiles ? " on" : ""}" src="${MoteurGrandeurs.img("etoile")}" alt="" style="animation-delay:${(0.15 + i * 0.25).toFixed(2)}s" />`;
    }

    this.elFin.innerHTML = `
      <div class="calc-confettis" aria-hidden="true">${confettis}</div>
      <img class="calc-mascotte calc-mascotte-fin rebond" src="${MoteurGrandeurs.img("mascotte-" + (etoiles > 0 ? "emerveillee" : "neutre"))}" alt="" />
      <h2 class="calc-fin-titre">${etoiles > 0 ? "Bravo !" : "Partie terminée"}</h2>
      <div class="calc-grandes-etoiles" role="img" aria-label="${etoiles} étoile${etoiles > 1 ? "s" : ""} sur 3">${grandes}</div>
      <p class="calc-fin-score"><strong>${this.score}</strong> pts</p>
      <p class="calc-fin-message">${message}</p>
      <button type="button" id="recommencer" class="calc-btn-principal">Recommencer</button>
      <a class="calc-lien-autres" href="index.html">Autres missions</a>
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
    this.nouvelleQuestion();
  }

  validerChoix(i, bouton) {
    if (this.verrou) return;
    this.verrou = true;
    const juste = i === this.q.resultat;
    this.elChoix.querySelectorAll("button").forEach((b) => { b.disabled = true; });
    if (bouton) bouton.classList.add(juste ? "juste" : "faux");
    const bon = this.elChoix.querySelector(`button[data-i="${this.q.resultat}"]`);
    if (bon) bon.classList.add("juste");
    this.corriger(juste, this.q.bonne);
  }

  validerReponse() {
    if (this.verrou) {
      if (this.elFin.hidden) this.nouvelleQuestion();
      return;
    }
    if (this.modeChoix) return;
    const inputValue = this.elSaisie.value.trim();
    if (inputValue === "") {
      this.elInstructions.textContent = this.estCP ? "Écris un nombre." : "Écris ta réponse d'abord.";
      this.elInstructions.className = "calc-neutre";
      this.elSaisie.focus({ preventScroll: true });
      return;
    }
    const valide = /^\d+([.,]\d+)?$/.test(inputValue);
    const saisi = valide ? Number(inputValue.replace(",", ".")) : NaN;
    if (isNaN(saisi)) {
      this.elInstructions.textContent = "Écris seulement des chiffres.";
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");
      setTimeout(() => this.elCadre.classList.remove("erreur"), 400);
      return;
    }
    this.verrou = true;
    const bonne = MoteurGrandeurs.fmt(this.q.resultat) + (this.q.unite ? " " + this.q.unite : "");
    this.corriger(Math.abs(saisi - this.q.resultat) < 1e-9, bonne);
  }

  /** Retour après réponse (juste ou fausse) : points, série, palier, message, question suivante. */
  corriger(juste, bonneReponse) {
    this.elCadre.classList.remove("succes", "erreur");
    void this.elCadre.offsetWidth;
    let delai = 1500;

    if (juste) {
      const pointsGagnes = this.niveau * (1 + this.consecutifs);
      this.score += pointsGagnes;
      this.consecutifs++;
      this.erreursConsecutives = 0;
      const combo = this.consecutifs > 1 ? ` <span class="calc-combo">série ×${this.consecutifs}</span>` : "";
      this.elInstructions.innerHTML = `<span class="calc-pastille">✅</span> Bravo ! <strong>+${pointsGagnes} pts</strong>${combo}`;
      this.elInstructions.className = "texte-succes";
      this.elCadre.classList.add("succes");
      this.setMascotte("heureuse");

      if (this.consecutifs >= 5 && this.consecutifs % 5 === 0 && this.niveau < this.nbPaliers) {
        this.niveau++;
        this.majMana(5);
        this.minuteurSerie = setTimeout(() => this.majMana(0), 500);
        this.elInstructions.innerHTML = `<span class="calc-pastille">✅</span> Palier ${this.niveau} ! <strong>+${pointsGagnes} pts</strong>${combo}`;
        this.majAffichageNiveau();
        delai = 2000;
        if (this.niveau > (this.niveauSauvegarde || 1)) this.sauvegarderProgression();
      } else {
        this.majMana(this.consecutifs % 5);
      }
    } else {
      const pointsPerdus = this.niveau * 2;
      this.score = Math.max(0, this.score - pointsPerdus);
      this.consecutifs = 0;
      this.majMana(0);
      this.erreursConsecutives++;
      this.erreurs++;
      const span = document.createElement("strong");
      span.className = "calc-bonne";
      span.textContent = bonneReponse;
      this.elInstructions.textContent = "";
      const pastille = document.createElement("span");
      pastille.className = "calc-pastille";
      pastille.textContent = "❌";
      this.elInstructions.append(pastille, document.createTextNode(" Presque ! La réponse est "), span);
      this.elInstructions.className = "texte-erreur";
      this.elCadre.classList.add("erreur");
      this.setMascotte("pleure");
      delai = 2800;

      if (this.erreursConsecutives >= 2 && this.niveau > 1) {
        this.niveau--;
        this.erreursConsecutives = 0;
        this.majAffichageNiveau();
        this.sauvegarderProgression();
      }
    }

    this.majStatistiques();
    clearTimeout(this.minuteur);
    this.minuteur = setTimeout(() => this.nouvelleQuestion(), delai);
  }

  /* ---------- titre, consigne, voix (CP) ---------- */

  injecterTitreEtVoix() {
    const titre = document.getElementById("titre-texte");
    if (titre && this.def.libelle) {
      titre.textContent = this.def.libelle;
      document.title = this.def.libelle + " - Mathémagie";
    }
    const consigne = document.getElementById("consigne");
    if (consigne) {
      if (this.def.consigne) consigne.textContent = this.def.consigne;
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
      btn.setAttribute("aria-label", "Écouter la question");
      btn.addEventListener("click", () => this.lire());
      this.elCalcul.parentNode.insertAdjacentElement("afterend", btn);
    }
  }

  lire() {
    if (!("speechSynthesis" in window) || !this.q) return;
    const u = new SpeechSynthesisUtterance(this.q.voix || this.q.texte);
    u.lang = "fr-FR";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  /* ---------- dessins (SVG, uniquement des nombres et des étiquettes en textContent) ---------- */

  dessinerFigure(fig) {
    const zone = this.elFigure;
    zone.textContent = "";
    if (!fig) { zone.hidden = true; return; }
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 240 150");
    svg.setAttribute("class", "gr-fig");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Dessin de la figure");
    const el = (nom, attrs, parent) => {
      const e = document.createElementNS(NS, nom);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(e);
      return e;
    };
    const forme = (nom, attrs) => el(nom, Object.assign({ class: "gr-fig-forme" }, attrs));
    const texte = (x, y, t, ancre) => { const e = el("text", { x, y, class: "gr-fig-texte", "text-anchor": ancre || "middle" }); e.textContent = t; return e; };
    const L = fig.labels || [];
    const d = fig.dims || [1, 1];

    switch (fig.type) {
      case "carre": {
        forme("rect", { x: 75, y: 20, width: 90, height: 90, rx: 4 });
        texte(120, 135, L[0]);
        break;
      }
      case "rectangle": {
        const w = 150, h = Math.max(36, Math.min(100, Math.round(w * d[1] / d[0])));
        const x = 45, y = 20 + (100 - h) / 2;
        forme("rect", { x, y, width: w, height: h, rx: 4 });
        texte(x + w / 2, y + h + 20, L[0]);
        texte(x + w + 8, y + h / 2 + 5, L[1], "start");
        break;
      }
      case "losange": {
        forme("polygon", { points: "120,15 175,65 120,115 65,65" });
        texte(120, 142, L[0]);
        break;
      }
      case "triangle": {
        const b = d[0], p = d[1], q = d[2];
        const x = (b * b + p * p - q * q) / (2 * b);
        const y = Math.sqrt(Math.max(0, p * p - x * x));
        const minX = Math.min(0, x), larg = Math.max(b, x) - minX;
        const k = Math.min(170 / larg, 85 / Math.max(y, 0.5));
        const ox = 120 - (minX + larg / 2) * k, oy = 112;
        const A = [ox, oy], B = [ox + b * k, oy], C = [ox + x * k, oy - y * k];
        forme("polygon", { points: [A, B, C].map((pt) => pt.join(",")).join(" ") });
        texte(ox + (b * k) / 2, oy + 20, L[0]);
        texte((A[0] + C[0]) / 2 - 6, (A[1] + C[1]) / 2 - 4, L[1], "end");
        texte((B[0] + C[0]) / 2 + 6, (B[1] + C[1]) / 2 - 4, L[2], "start");
        break;
      }
      case "triangle-rectangle": {
        const k = Math.min(140 / d[0], 90 / d[1]);
        const bw = Math.max(40, d[0] * k), bh = Math.max(30, d[1] * k);
        const ox = 120 - bw / 2, oy = 118;
        forme("polygon", { points: `${ox},${oy} ${ox + bw},${oy} ${ox},${oy - bh}` });
        forme("polyline", { points: `${ox},${oy - 12} ${ox + 12},${oy - 12} ${ox + 12},${oy}`, fill: "none" });
        texte(ox + bw / 2, oy + 20, L[0]);
        texte(ox - 8, oy - bh / 2 + 5, L[1], "end");
        break;
      }
      case "cercle": {
        forme("circle", { cx: 120, cy: 70, r: 52 });
        el("line", { x1: 120, y1: 70, x2: 172, y2: 70, class: "gr-fig-trait" });
        el("circle", { cx: 120, cy: 70, r: 3.5, class: "gr-fig-point" });
        texte(146, 62, L[0]);
        break;
      }
      case "grille": {
        const cols = d[0], rows = d[1];
        const c = Math.min(200 / cols, 110 / rows);
        const w = cols * c, h = rows * c, x = 120 - w / 2, y = 15 + (110 - h) / 2;
        forme("rect", { x, y, width: w, height: h });
        for (let i = 1; i < cols; i++) el("line", { x1: x + i * c, y1: y, x2: x + i * c, y2: y + h, class: "gr-fig-grille" });
        for (let j = 1; j < rows; j++) el("line", { x1: x, y1: y + j * c, x2: x + w, y2: y + j * c, class: "gr-fig-grille" });
        break;
      }
      case "cube":
      case "pave": {
        const dx = fig.type === "cube" ? 1 : d[0], dy = fig.type === "cube" ? 1 : d[2], dz = fig.type === "cube" ? 1 : d[1];
        const s = Math.min(120 / Math.max(dx, 1), 70 / Math.max(dy, 1));
        const w = Math.max(40, Math.min(120, dx * s)), h = Math.max(28, Math.min(70, dy * s));
        const pr = Math.max(14, Math.min(34, Math.round(18 + dz)));
        const x = 55, y = 30 + pr;
        forme("rect", { x, y, width: w, height: h });
        forme("polygon", { points: `${x},${y} ${x + pr},${y - pr} ${x + w + pr},${y - pr} ${x + w},${y}`, class: "gr-fig-forme gr-fig-haut" });
        forme("polygon", { points: `${x + w},${y} ${x + w + pr},${y - pr} ${x + w + pr},${y + h - pr} ${x + w},${y + h}`, class: "gr-fig-forme gr-fig-cote" });
        if (fig.type === "cube") {
          texte(x + w / 2, y + h + 20, L[0]);
        } else {
          texte(x + w / 2, y + h + 20, L[0]);
          texte(x - 8, y + h / 2 + 5, L[2], "end");
          texte(x + w + pr + 6, y - pr / 2 + 5, L[1], "start");
        }
        break;
      }
      default: break;
    }
    zone.appendChild(svg);
    zone.hidden = false;
  }
}

if (typeof module !== "undefined" && module.exports) module.exports = MoteurGrandeurs;
