/**
 * Moteur « Nombres » (DOM) : un moteur générique pour toutes les pages du dossier nombres/.
 * Les questions viennent de GenerateurNombres (pur) et le contenu du programme de la classe
 * (programme.nombres['nombres-<theme>']). Aucun nombre de classe ici.
 * Même mécanique que le calcul : 5 bonnes réponses d'affilée = palier suivant, 2 erreurs = palier précédent,
 * 5 erreurs = fin de la partie. La progression est enregistrée par profil (mission `nombres-<theme>`).
 */
class MoteurNombres {
  constructor(missionId) {
    this.missionId = missionId;
    const gp = (typeof gestionnaireProfils !== "undefined") ? gestionnaireProfils : null;
    this.niveauClasse = (gp && typeof gp.getNiveauClasse === "function" && gp.getNiveauClasse()) || null;
    this.programme = (gp && typeof gp.getProgramme === "function" && gp.getProgramme()) || null;
    if (!this.programme && window.PROGRAMMES) {
      this.programme = window.PROGRAMMES[this.niveauClasse || "cm1"] || window.PROGRAMMES.cm1 || null;
    }
    if (this.programme && !this.niveauClasse) this.niveauClasse = this.programme.id;
    this.def = this.programme && this.programme.nombres ? this.programme.nombres[missionId] : null;
    if (!this.def || this.def.actif === false || !this.def.niveaux || !this.def.niveaux.length) {
      window.location.replace("index.html"); // mission hors programme
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
    this.q = null;
    this.precedent = "";
    this.choisis = [];

    let sauvee = null;
    try { sauvee = gp && gp.getProgression ? gp.getProgression(missionId) : null; } catch (e) { sauvee = null; }
    this.niveau = Math.min(this.nbPaliers, Math.max(1, parseInt(sauvee && sauvee.niveau, 10) || 1));
    this.niveauSauvegarde = this.niveau;

    const $ = (id) => document.getElementById(id);
    this.el = {
      cadre: $("zone-jeu"), fin: $("zone-fin"), enonce: $("enonce"), expression: $("expression"),
      visuel: $("visuel"), reponse: $("reponse-zone"), instructions: $("instructions"), suivant: $("suivant"),
      mascotte: $("mascotte"), palier: $("palier"), serie: $("serie"), score: $("score"), essais: $("essais"),
      select: $("selectNiveau"), carte: document.querySelector(".nb-carte"), voixSlot: $("voix-slot")
    };
    document.body.classList.toggle("nb-cp", this.estCP);
    this.titreEtConsigne();
    this.construireSelecteur();
    this.construireSerie();
    this.initEvents();
    this.majStatistiques();
    this.majAffichageNiveau();
    this.nouvelleQuestion();
  }

  /* ---------- utilitaires ---------- */

  static img(nom) { return "../images/" + nom + ".svg"; }
  static esc(t) { return String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  /** Texte -> HTML sûr : fractions empilées et « trou » {?}. */
  static html(t) {
    const trou = '<span class="nb-trou" aria-hidden="true">?</span>';
    const part = (x) => (x === "{?}" ? "?" : x);
    const s = MoteurNombres.esc(t).replace(/(\d+|\{\?\})\/(\d+|\{\?\})/g, (m, n, d) =>
      '<span class="nb-frac" role="img" aria-label="' + part(n) + " sur " + part(d) + '"><span class="nb-num">' + (n === "{?}" ? trou : n) +
      '</span><span class="nb-den">' + (d === "{?}" ? trou : d) + "</span></span>");
    return s.replace(/\{\?\}/g, trou);
  }

  static texteBrut(t) { return String(t).replace(/\{\?\}/g, "?"); }

  etoilesHTML(actives, total) {
    let h = "";
    for (let i = 1; i <= total; i++) {
      h += '<img class="nb-etoile' + (i <= actives ? " on" : "") + (i === actives ? " courant" : "") + '" src="' + MoteurNombres.img("etoile") + '" alt="" />';
    }
    return h;
  }

  setMascotte(etat) {
    const m = this.el.mascotte;
    if (!m) return;
    m.src = MoteurNombres.img("mascotte-" + etat);
    m.classList.remove("rebond", "secoue");
    void m.offsetWidth;
    if (etat === "contente" || etat === "heureuse" || etat === "emerveillee") m.classList.add("rebond");
    if (etat === "triste" || etat === "pleure") m.classList.add("secoue");
  }

  construireSelecteur() {
    this.el.select.innerHTML = Array.from({ length: this.nbPaliers }, (_, i) => i + 1)
      .map((n) => '<option value="' + n + '">' + n + "</option>").join("");
  }

  construireSerie() {
    this.el.serie.innerHTML = Array.from({ length: 5 }, () => '<span class="nb-point"></span>').join("");
  }

  majMana(valeur) {
    const n = Math.min(5, Math.max(0, valeur));
    this.el.serie.querySelectorAll(".nb-point").forEach((p, i) => p.classList.toggle("on", i < n));
    this.el.serie.setAttribute("aria-label", "Série : " + n + " sur 5 bonnes réponses");
  }

  majAffichageNiveau() {
    this.el.select.value = this.niveau;
    this.el.palier.innerHTML = this.etoilesHTML(this.niveau, this.nbPaliers);
    this.el.palier.setAttribute("aria-label", "Palier " + this.niveau + " sur " + this.nbPaliers);
  }

  majStatistiques() {
    this.el.score.textContent = this.score;
    let h = "";
    for (let i = 0; i < this.limiteErreurs; i++) {
      h += '<span class="nb-essai' + (i < this.erreurs ? " perdu" : "") + '">' + (i < this.erreurs ? "✕" : "") + "</span>";
    }
    this.el.essais.innerHTML = h;
    const restants = this.limiteErreurs - this.erreurs;
    this.el.essais.setAttribute("aria-label", "Il te reste " + restants + " essai" + (restants > 1 ? "s" : ""));
  }

  titreEtConsigne() {
    const titre = document.getElementById("titre-texte");
    if (titre && this.def.libelle) { titre.textContent = this.def.libelle; document.title = this.def.libelle + " — Nombres"; }
    const consigne = document.getElementById("consigne");
    if (consigne) { if (this.def.consigne) consigne.textContent = this.def.consigne; else consigne.hidden = true; }
    if (this.estCP && "speechSynthesis" in window && this.el.voixSlot) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nb-voix";
      btn.textContent = "🔊";
      btn.setAttribute("aria-label", "Écouter la question");
      btn.addEventListener("click", () => this.lire());
      this.el.voixSlot.appendChild(btn);
    }
  }

  /** Libellés lisibles des réponses proposées, pour les énoncer à voix haute. */
  choixVocal() {
    const q = this.q;
    if (!q) return [];
    const mots = { "<": "plus petit que", "=": "égal à", ">": "plus grand que" };
    if (q.type === "qcm") return q.choix.map((c) => mots[c] || MoteurNombres.texteBrut(c));
    if (q.type === "ordre") return q.items.map((i) => i.label);
    return [];
  }

  lire() {
    if (!this.q) return;
    const texte = MoteurNombres.texteBrut(this.q.voix);
    const choix = this.choixVocal();
    if (window.Voix && typeof window.Voix.question === "function") { window.Voix.question(texte, choix); return; }
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(texte);
    u.lang = "fr-FR";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  initEvents() {
    this.el.select.addEventListener("change", (e) => {
      this.niveau = parseInt(e.target.value, 10);
      this.consecutifs = 0;
      this.erreursConsecutives = 0;
      this.score = 0;
      this.erreurs = 0;
      this.majMana(0);
      this.majStatistiques();
      this.majAffichageNiveau();
      this.nouvelleQuestion();
    });
    this.el.suivant.addEventListener("click", () => { if (this.verrou && this.el.fin.hidden) this.nouvelleQuestion(); });
  }

  sauvegarderProgression() {
    if (typeof gestionnaireProfils !== "undefined" && typeof gestionnaireProfils.setProgression === "function") {
      gestionnaireProfils.setProgression(this.missionId, { niveau: this.niveau });
    }
    this.niveauSauvegarde = Math.max(this.niveauSauvegarde || 1, this.niveau);
  }

  /* ---------- déroulement ---------- */

  nouvelleQuestion() {
    clearTimeout(this.minuteur);
    this.verrou = false;
    if (this.erreurs >= this.limiteErreurs) { this.afficherResultats(); return; }

    let q = null;
    for (let t = 0; t < 6; t++) {
      q = GenerateurNombres.generer(this.programme, this.missionId, this.niveau, Math.random);
      if (q && (q.enonce + "|" + (q.expression || "") + "|" + q.reponse) !== this.precedent) break;
    }
    if (!q) { window.location.replace("index.html"); return; }
    this.q = q;
    this.precedent = q.enonce + "|" + (q.expression || "") + "|" + q.reponse;
    this.choisis = [];

    this.el.enonce.innerHTML = MoteurNombres.html(q.enonce);
    this.el.expression.innerHTML = q.expression ? MoteurNombres.html(q.expression) : "";
    this.el.expression.hidden = !q.expression;
    this.el.expression.dataset.longueur = q.expression && q.expression.length > 34 ? "long" : "";
    this.dessinerVisuel();
    this.dessinerReponse();

    this.el.instructions.textContent = "";
    this.el.instructions.className = "nb-retour-info nb-neutre";
    this.el.suivant.hidden = true;
    this.el.cadre.classList.remove("succes", "erreur");
    this.majMana(this.consecutifs % 5);
    this.setMascotte(this.estCP ? "lecture" : "neutre");
  }

  /* ----- visuels ----- */

  dessinerVisuel() {
    const v = this.q.visuel, zone = this.el.visuel;
    zone.innerHTML = "";
    zone.hidden = !v;
    if (!v) return;
    if (v.type === "part") { zone.innerHTML = this.svgPart(v.n, v.d); return; }
    // droite graduée
    const n = v.n;
    const droite = document.createElement("div");
    droite.className = "nb-droite";
    droite.style.setProperty("--n", n);
    droite.setAttribute("role", "group");
    droite.setAttribute("aria-label", "Droite graduée de " + v.labels[0] + " à " + v.labels[n]);
    const ligne = document.createElement("div");
    ligne.className = "nb-droite-ligne";
    droite.appendChild(ligne);
    for (let i = 0; i <= n; i++) {
      const g = document.createElement(v.placer && i > 0 && i < n ? "button" : "div");
      if (g.tagName === "BUTTON") { g.type = "button"; g.setAttribute("aria-label", "Graduation " + (i)); g.dataset.i = i; }
      g.className = "nb-grad" + (i in v.etiquettes ? " etiquette" : "") + (v.marque === i ? " marque" : "");
      g.style.left = (i / n * 100) + "%";
      g.innerHTML = '<span class="nb-grad-trait"></span>' + (i in v.etiquettes ? '<span class="nb-grad-label">' + MoteurNombres.html(v.labels[i]) + "</span>" : "");
      if (v.marque === i) g.innerHTML = '<span class="nb-fleche" aria-hidden="true">▼</span>' + g.innerHTML;
      droite.appendChild(g);
    }
    if (v.placer) {
      droite.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-i]");
        if (b) this.valider({ droite: parseInt(b.dataset.i, 10) });
      });
    }
    zone.appendChild(droite);
  }

  svgPart(n, d) {
    const encre = "#2B2D5B";
    if (d > 12) { // grille 10 x 10
      const c = 18, cote = Math.round(Math.sqrt(d));
      let r = "";
      for (let i = 0; i < d; i++) {
        r += '<rect x="' + (2 + (i % cote) * c) + '" y="' + (2 + Math.floor(i / cote) * c) + '" width="' + c + '" height="' + c + '" class="' + (i < n ? "nb-part-on" : "nb-part-off") + '" />';
      }
      const t = cote * c + 4;
      return '<svg class="nb-svg-part nb-svg-grille" viewBox="0 0 ' + t + " " + t + '" role="img" aria-label="Figure coupée en ' + d + " parts égales dont " + n + ' colorées" stroke="' + encre + '" stroke-width="1.5">' + r + "</svg>";
    }
    const L = 300, H = 60, w = L / d;
    let r = "";
    for (let i = 0; i < d; i++) r += '<rect x="' + (2 + i * w) + '" y="2" width="' + w + '" height="' + H + '" class="' + (i < n ? "nb-part-on" : "nb-part-off") + '" />';
    return '<svg class="nb-svg-part" viewBox="0 0 ' + (L + 4) + " " + (H + 4) + '" role="img" aria-label="Barre coupée en ' + d + " parts égales dont " + n + ' colorées" stroke="' + encre + '" stroke-width="3" stroke-linejoin="round">' + r + "</svg>";
  }

  /* ----- zone de réponse ----- */

  dessinerReponse() {
    const q = this.q, zone = this.el.reponse;
    zone.innerHTML = "";
    zone.className = "nb-reponse nb-reponse-" + q.type;
    if (q.type === "qcm") this.dessinerQCM();
    else if (q.type === "saisie") this.dessinerSaisie();
    else if (q.type === "ordre") this.dessinerOrdre();
    // type 'droite' : les graduations sont dans le visuel
  }

  dessinerQCM() {
    const q = this.q, zone = this.el.reponse;
    const mots = { "<": "plus petit que", "=": "égal à", ">": "plus grand que" };
    const grille = document.createElement("div");
    grille.className = "nb-choix" + (q.ordreFixe ? " nb-choix-symboles" : "");
    grille.setAttribute("role", "group");
    grille.setAttribute("aria-label", "Réponses possibles");
    q.choix.forEach((c, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "nb-choix-btn";
      b.dataset.i = i;
      if (mots[c]) { b.innerHTML = '<span class="nb-symbole">' + MoteurNombres.esc(c) + "</span>"; b.setAttribute("aria-label", mots[c]); }
      else b.innerHTML = MoteurNombres.html(c);
      grille.appendChild(b);
    });
    grille.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (b) this.valider({ choix: parseInt(b.dataset.i, 10) });
    });
    zone.appendChild(grille);
  }

  dessinerSaisie() {
    const zone = this.el.reponse;
    const virgule = /,/.test(this.q.reponseTexte || "") || /décimal/.test(this.q.enonce);
    const wrap = document.createElement("div");
    wrap.className = "nb-saisie";
    wrap.innerHTML =
      '<input type="text" id="saisieReponse" class="nb-input" autocomplete="off" aria-label="Ta réponse" inputmode="' + (this.paveActif() ? "none" : "decimal") + '" enterkeyhint="done" />';
    zone.appendChild(wrap);
    this.elSaisie = wrap.querySelector("input");
    const pave = document.createElement("div");
    pave.className = "nb-pave";
    pave.setAttribute("role", "group");
    pave.setAttribute("aria-label", "Pavé numérique");
    pave.hidden = !this.paveActif();
    let h = "";
    for (let i = 1; i <= 9; i++) h += '<button type="button" class="nb-touche" data-k="' + i + '">' + i + "</button>";
    h += virgule ? '<button type="button" class="nb-touche" data-k="," aria-label="Virgule">,</button>' : '<span class="nb-touche-vide"></span>';
    h += '<button type="button" class="nb-touche" data-k="0">0</button>';
    h += '<button type="button" class="nb-touche nb-efface" data-k="del" aria-label="Effacer">⌫</button>';
    pave.innerHTML = h;
    zone.appendChild(pave);
    const bv = document.createElement("button");
    bv.type = "button";
    bv.id = "valider";
    bv.className = "nb-btn-principal";
    bv.textContent = "Valider ✓";
    zone.appendChild(bv);
    pave.addEventListener("mousedown", (e) => e.preventDefault());
    pave.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-k]");
      if (!b || this.verrou) return;
      let v = this.elSaisie.value;
      const k = b.dataset.k;
      if (k === "del") v = v.slice(0, -1);
      else if (k === ",") { if (!v.includes(",")) v = (v === "" ? "0" : v) + ","; }
      else if (v.length < 12) v += k;
      this.elSaisie.value = v;
      this.elSaisie.focus({ preventScroll: true });
    });
    this.elSaisie.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.repeat) { e.preventDefault(); this.valider({ saisie: this.elSaisie.value }); }
    });
    bv.addEventListener("click", () => this.valider({ saisie: this.elSaisie.value }));
    const bascule = document.createElement("button");
    bascule.type = "button";
    bascule.className = "nb-bascule";
    bascule.setAttribute("aria-pressed", this.paveActif() ? "true" : "false");
    bascule.textContent = "Pavé";
    bascule.addEventListener("click", () => {
      const actif = !this.paveActif();
      try { localStorage.setItem("mathemagie-pave", actif ? "1" : "0"); } catch (e) { /* ignore */ }
      pave.hidden = !actif;
      bascule.setAttribute("aria-pressed", actif ? "true" : "false");
      this.elSaisie.setAttribute("inputmode", actif ? "none" : "decimal");
      this.elSaisie.focus({ preventScroll: true });
    });
    zone.appendChild(bascule);
    this.elSaisie.focus({ preventScroll: true });
  }

  paveActif() {
    let pref = null;
    try { pref = localStorage.getItem("mathemagie-pave"); } catch (e) { pref = null; }
    const tactile = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    return pref === "1" ? true : pref === "0" ? false : (tactile || this.estCP);
  }

  dessinerOrdre() {
    const q = this.q, zone = this.el.reponse;
    const c = document.createElement("div");
    c.className = "nb-ordre";
    zone.appendChild(c);
    c.innerHTML =
      '<p class="nb-ordre-titre">Ma réponse</p><div class="nb-ordre-reponse" id="ordre-reponse" aria-live="polite"></div>' +
      '<p class="nb-ordre-titre">Les nombres</p><div class="nb-ordre-pool" id="ordre-pool"></div>' +
      '<button type="button" id="valider-ordre" class="nb-btn-principal" disabled>Valider ✓</button>';
    const rendre = () => {
      const rep = c.querySelector("#ordre-reponse"), pool = c.querySelector("#ordre-pool");
      const tuile = (it, dansReponse, rang) =>
        '<button type="button" class="nb-tuile' + (dansReponse ? " placee" : "") + '" data-id="' + MoteurNombres.esc(it.id) + '"' +
        (dansReponse ? ' aria-label="' + MoteurNombres.esc(it.label) + ', place ' + rang + ', toucher pour l\'enlever"' : "") + ">" +
        (dansReponse ? '<span class="nb-rang">' + rang + "</span>" : "") + MoteurNombres.esc(it.label) + "</button>";
      const place = this.choisis.map((id) => q.items.find((i) => i.id === id));
      rep.innerHTML = place.map((it, k) => tuile(it, true, k + 1)).join("") +
        q.items.slice(place.length).map(() => '<span class="nb-tuile-vide"></span>').join("");
      pool.innerHTML = q.items.filter((i) => this.choisis.indexOf(i.id) === -1).map((it) => tuile(it, false)).join("");
      c.querySelector("#valider-ordre").disabled = this.choisis.length !== q.items.length;
    };
    c.addEventListener("click", (e) => {
      if (this.verrou) return;
      const t = e.target.closest(".nb-tuile");
      if (t) {
        const id = t.dataset.id, i = this.choisis.indexOf(id);
        if (i === -1) this.choisis.push(id); else this.choisis.splice(i, 1);
        rendre();
        return;
      }
      if (e.target.closest("#valider-ordre") && this.choisis.length === q.items.length) this.valider({ ordre: this.choisis.slice() });
    });
    rendre();
  }

  /* ----- validation ----- */

  valider(rep) {
    if (this.verrou) return;
    const q = this.q;
    let juste = false, texteJuste = "";

    if (q.type === "saisie") {
      const brut = String(rep.saisie || "").replace(/[\s ]/g, "");
      if (brut === "") {
        this.el.instructions.textContent = this.estCP ? "Écris un nombre." : "Écris ta réponse d'abord.";
        this.el.instructions.className = "nb-retour-info nb-neutre";
        this.elSaisie.focus({ preventScroll: true });
        return;
      }
      if (!/^\d+([.,]\d+)?$/.test(brut)) {
        this.el.instructions.textContent = "Écris seulement des chiffres.";
        this.el.instructions.className = "nb-retour-info texte-erreur";
        return;
      }
      juste = Math.abs(Number(brut.replace(",", ".")) - q.reponse) < 1e-9;
      texteJuste = q.reponseTexte;
    } else if (q.type === "qcm") {
      juste = q.choix[rep.choix] === q.reponse;
      texteJuste = q.reponse;
    } else if (q.type === "ordre") {
      juste = rep.ordre.join("|") === q.reponse.join("|");
      texteJuste = q.reponseTexte;
    } else {
      juste = rep.droite === q.reponse;
      texteJuste = q.reponseTexte;
    }

    this.verrou = true;
    this.el.cadre.classList.remove("succes", "erreur");
    void this.el.cadre.offsetWidth;
    let delai = 1300;
    this.marquerReponse(rep, juste);

    if (juste) {
      const points = this.niveau * (1 + this.consecutifs);
      this.score += points;
      this.consecutifs++;
      this.erreursConsecutives = 0;
      const combo = this.consecutifs > 1 ? ' <span class="nb-combo">série ×' + this.consecutifs + "</span>" : "";
      this.el.instructions.innerHTML = '<span class="nb-pastille">✅</span> Bravo ! <strong>+' + points + " pts</strong>" + combo;
      this.el.instructions.className = "nb-retour-info texte-succes";
      this.el.cadre.classList.add("succes");
      this.setMascotte("heureuse");
      if (this.consecutifs >= 5 && this.consecutifs % 5 === 0 && this.niveau < this.nbPaliers) {
        this.niveau++;
        this.majMana(5);
        setTimeout(() => this.majMana(0), 500);
        this.el.instructions.innerHTML = '<span class="nb-pastille">✅</span> Palier ' + this.niveau + " ! <strong>+" + points + " pts</strong>" + combo;
        this.majAffichageNiveau();
        delai = 1900;
        if (this.niveau > (this.niveauSauvegarde || 1)) this.sauvegarderProgression();
      } else this.majMana(this.consecutifs % 5);
      this.minuteur = setTimeout(() => this.nouvelleQuestion(), delai);
    } else {
      this.score = Math.max(0, this.score - this.niveau * 2);
      this.consecutifs = 0;
      this.majMana(0);
      this.erreursConsecutives++;
      this.erreurs++;
      this.el.instructions.innerHTML =
        '<span class="nb-pastille">❌</span> Presque ! La réponse est <strong class="nb-bonne">' + MoteurNombres.html(String(texteJuste)) + "</strong>" +
        (q.aide ? '<span class="nb-aide">💡 ' + MoteurNombres.html(q.aide) + "</span>" : "");
      this.el.instructions.className = "nb-retour-info texte-erreur";
      this.el.cadre.classList.add("erreur");
      this.setMascotte("pleure");
      if (this.erreursConsecutives >= 2 && this.niveau > 1) {
        this.niveau--;
        this.erreursConsecutives = 0;
        this.majAffichageNiveau();
        this.sauvegarderProgression();
      }
      // Pas de passage automatique : l'enfant lit la correction puis touche « Suivant »
    }
    this.majStatistiques();
    this.el.suivant.hidden = false;
    this.el.suivant.textContent = this.erreurs >= this.limiteErreurs ? "Voir mon résultat" : "Suivant →";
    this.el.suivant.focus({ preventScroll: true });
  }

  marquerReponse(rep, juste) {
    const q = this.q;
    if (q.type === "qcm") {
      this.el.reponse.querySelectorAll(".nb-choix-btn").forEach((b, i) => {
        b.disabled = true;
        if (q.choix[i] === q.reponse) b.classList.add("juste");
        else if (i === rep.choix) b.classList.add("faux");
      });
    } else if (q.type === "droite") {
      this.el.visuel.querySelectorAll("button.nb-grad").forEach((b) => {
        b.disabled = true;
        const i = parseInt(b.dataset.i, 10);
        if (i === q.reponse) b.classList.add("juste");
        else if (i === rep.droite) b.classList.add("faux");
      });
      this.devoilerGraduation();
    } else if (q.type === "ordre") {
      this.el.reponse.querySelectorAll(".nb-tuile").forEach((t) => { t.disabled = true; });
      const v = this.el.reponse.querySelector("#valider-ordre");
      if (v) v.disabled = true;
      this.el.reponse.querySelector("#ordre-reponse").classList.add(juste ? "juste" : "faux");
    } else if (q.type === "saisie") {
      this.elSaisie.disabled = true;
      this.el.reponse.querySelectorAll("button").forEach((b) => { if (b.id === "valider") b.disabled = true; });
    }
    if (q.visuel && q.visuel.type === "droite" && q.type === "qcm") this.devoilerGraduation();
  }

  devoilerGraduation() {
    // Après la réponse, on affiche le nombre de la graduation visée
    const q = this.q, v = q.visuel;
    const i = q.type === "droite" ? q.reponse : v.marque;
    const g = this.el.visuel.querySelectorAll(".nb-grad")[i];
    if (g && !g.querySelector(".nb-grad-label")) {
      g.classList.add("etiquette", "devoile");
      g.insertAdjacentHTML("beforeend", '<span class="nb-grad-label">' + MoteurNombres.html(v.labels[i]) + "</span>");
    }
  }

  /* ---------- fin de partie ---------- */

  afficherResultats() {
    clearTimeout(this.minuteur);
    this.verrou = true;
    let etoiles, message;
    if (this.score >= 100) { etoiles = 3; message = "Incroyable ! Tu es un vrai mage des nombres !"; }
    else if (this.score >= 50) { etoiles = 2; message = "Bien joué ! Continue comme ça !"; }
    else if (this.score > 0) { etoiles = 1; message = "Joli début ! La prochaine fois sera encore mieux."; }
    else { etoiles = 0; message = "Pas grave, on s'entraîne et tu vas y arriver !"; }
    let grandes = "";
    for (let i = 1; i <= 3; i++) {
      grandes += '<img class="nb-grande-etoile' + (i <= etoiles ? " on" : "") + '" src="' + MoteurNombres.img("etoile") + '" alt="" style="animation-delay:' + (0.15 + i * 0.25).toFixed(2) + 's" />';
    }
    this.el.fin.innerHTML =
      '<img class="nb-mascotte nb-mascotte-fin rebond" src="' + MoteurNombres.img("mascotte-" + (etoiles > 0 ? "emerveillee" : "neutre")) + '" alt="" />' +
      '<h2 class="nb-fin-titre">' + (etoiles > 0 ? "Bravo !" : "Partie terminée") + "</h2>" +
      '<div class="nb-grandes-etoiles" role="img" aria-label="' + etoiles + " étoile" + (etoiles > 1 ? "s" : "") + ' sur 3">' + grandes + "</div>" +
      '<p class="nb-fin-score"><strong>' + this.score + "</strong> pts</p>" +
      '<p class="nb-fin-message">' + message + "</p>" +
      '<button type="button" id="recommencer" class="nb-btn-principal">Recommencer</button>' +
      '<a class="nb-lien-autres" href="index.html">Autres missions</a>';
    this.el.cadre.hidden = true;
    this.el.fin.hidden = false;
    const btn = document.getElementById("recommencer");
    btn.addEventListener("click", () => this.recommencer());
    btn.focus({ preventScroll: true });
  }

  recommencer() {
    this.score = 0;
    this.erreurs = 0;
    this.consecutifs = 0;
    this.erreursConsecutives = 0;
    this.el.fin.hidden = true;
    this.el.fin.innerHTML = "";
    this.el.cadre.hidden = false;
    this.majMana(0);
    this.majStatistiques();
    this.majAffichageNiveau();
    this.nouvelleQuestion();
  }
}

if (typeof window !== "undefined") window.MoteurNombres = MoteurNombres;
