class AppHeader extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute('base-path') || '';
    
    const path = window.location.pathname;
    const isCalculs = path.includes('/calculs_mentaux/');
    const isGeometrie = path.includes('/geometrie/');
    const isJeux = path.includes('/jeux/');
    const isGrandeurs = path.includes('/grandeurs/');
    const isNombres = path.includes('/nombres/');
    const isJouer = isCalculs || isGeometrie || isJeux || isGrandeurs || isNombres;
    const isTrophees = path.includes('trophees.html');
    const isAccueil = !isCalculs && !isGeometrie && !isJeux && !isGrandeurs && !isNombres && !isTrophees;

    // Infos du mage actif (gardes: marche avec profils v1 et v2)
    const gp = window.gestionnaireProfils;
    const nomMage = gp?.getJoueurActif?.() || null;
    const avatarMage = nomMage ? (gp.getAvatar?.() || '🧙') : '🧙';
    const couleurMage = nomMage ? (gp.getCouleur?.() || '#A077EE') : '#A077EE';
    const niveauClasse = nomMage ? (gp.getNiveauClasse?.() || '') : '';
    const badgeClasse = niveauClasse ? String(niveauClasse).toUpperCase() : '';
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    // Univers courant (couleur de l'élément actif)
    const uJouer = isCalculs ? 'u-calcul' : isGeometrie ? 'u-geometrie' : isGrandeurs ? 'u-grandeurs' : isNombres ? 'u-nombres' : 'u-jeux';
    const ico = (e) => `<span class="nav-ico" aria-hidden="true">${e}</span>`;

    this.innerHTML = `
      <header>
        <nav class="barre-navigation" aria-label="Navigation principale">
          <h1><a href="${basePath}index.html" aria-label="Mathémagie, accueil"><img class="logo-mascotte" src="${basePath}images/mascotte-neutre.svg" alt=""><span class="logo-texte">Mathémagie</span></a></h1>
          <div>
            <ul class="choix-navigation">
              <li class="u-accueil ${isAccueil ? 'selected' : ''}"><a href="${basePath}index.html"${isAccueil ? ' aria-current="page"' : ''}>${ico('🏠')}<span class="nav-mot">Accueil</span></a></li>

              <li class="nav-dropdown ${uJouer} ${isJouer ? 'selected' : ''}">
                <a href="#" class="nav-dropdown-toggle" role="button" aria-haspopup="true" aria-expanded="false">${ico('🎮')}<span class="nav-mot">Jouer</span><span class="nav-chevron" aria-hidden="true">▾</span></a>
                <ul class="nav-dropdown-menu">
                  <div class="nav-dropdown-menu-inner">
                    <li class="u-calcul ${isCalculs ? 'selected' : ''}">
                      <a href="${basePath}calculs_mentaux/index.html">${ico('➕')}Calcul</a>
                    </li>
                    <li class="u-nombres ${isNombres ? 'selected' : ''}">
                      <a href="${basePath}nombres/index.html">${ico('🔢')}Nombres</a>
                    </li>
                    <li class="u-geometrie ${isGeometrie ? 'selected' : ''}">
                      <a href="${basePath}geometrie/index.html">${ico('📐')}Géométrie</a>
                    </li>
                    <li class="u-grandeurs ${isGrandeurs ? 'selected' : ''}">
                      <a href="${basePath}grandeurs/index.html">${ico('📏')}Mesures</a>
                    </li>
                    <li class="u-jeux ${isJeux ? 'selected' : ''}">
                      <a href="${basePath}jeux/index.html">${ico('🎲')}Jeux</a>
                    </li>
                  </div>
                </ul>
              </li>

              <li class="u-trophees ${isTrophees ? 'selected' : ''}"><a href="${basePath}trophees.html"${isTrophees ? ' aria-current="page"' : ''}>${ico('🏆')}<span class="nav-mot">Trophées</span></a></li>

              ${nomMage ? `
                <li class="nav-dropdown nav-profil mage-bouton">
                  <a href="#" class="nav-dropdown-toggle" id="btn-profil" role="button" aria-haspopup="true" aria-expanded="false" aria-label="Menu du profil de ${esc(nomMage)}${badgeClasse ? ', classe ' + badgeClasse : ''}">
                    <span class="mage-avatar" aria-hidden="true" style="background: linear-gradient(135deg, ${couleurMage}, ${ajusterCouleurHeader(couleurMage, 40)})">${avatarMage}</span>
                    <span class="mage-info">
                      <span class="mage-nom nav-mot">${esc(nomMage)}</span>
                    </span>
                    ${badgeClasse ? `<span class="badge-classe" aria-hidden="true">${badgeClasse}</span>` : ''}
                    <span class="nav-chevron" aria-hidden="true">▾</span>
                  </a>
                  <ul class="nav-dropdown-menu nav-dropdown-menu-droite">
                    <div class="nav-dropdown-menu-inner">
                      <li><a href="#" id="btn-mon-perso" role="button">${ico('✏️')}Mon personnage</a></li>
                      <li><a href="${basePath}connexion.html" id="btn-changer-profil">${ico('🔄')}Changer de profil</a></li>
                    </div>
                  </ul>
                </li>
              ` : ''}
            </ul>
          </div>
        </nav>
      </header>
    `;

    // Dropdowns (survol, clic tactile, clavier)
    const dropdowns = this.querySelectorAll('.nav-dropdown');
    dropdowns.forEach((dropdownLi) => {
      const toggle = dropdownLi.querySelector('.nav-dropdown-toggle');
      const setOpen = (open) => {
        dropdownLi.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
      };
      // Le survol ouvre le menu ; le clic/toucher l'épingle ouvert (2e clic = fermeture).
      // Sans ce drapeau, mouseenter ouvrait puis le clic refermait aussitôt.
      let epingle = false;
      dropdownLi.addEventListener('mouseenter', () => setOpen(true));
      dropdownLi.addEventListener('mouseleave', () => { epingle = false; setOpen(false); });
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        epingle = !epingle;
        setOpen(epingle);
      });
      dropdownLi.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { setOpen(false); toggle.focus(); }
      });
      document.addEventListener('click', (e) => {
        if (!dropdownLi.contains(e.target)) { epingle = false; setOpen(false); }
      });
    });

    // Indicateur de synchronisation ☁️ (discret ; rien tant qu'aucune famille n'est connectée)
    this.initIndicateurSync();

    // Mon personnage : l'enfant change son prénom et son personnage (parmi ceux débloqués)
    const btnPerso = this.querySelector('#btn-mon-perso');
    if (btnPerso) {
      btnPerso.addEventListener('click', (e) => {
        e.preventDefault();
        ouvrirEditeurProfil();
      });
    }

    // Changer de profil : on ferme la session de l'enfant puis on revient à l'écran « Qui joue ? »
    const btnChanger = this.querySelector('#btn-changer-profil');
    if (btnChanger) {
      btnChanger.addEventListener('click', (e) => {
        e.preventDefault();
        window.gestionnaireProfils?.deconnecter?.();
        window.location.href = basePath + 'connexion.html';
      });
    }
  }
}

function ajusterCouleurHeader(hex, amount) {
  try {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch (e) {
    return hex;
  }
}


AppHeader.prototype.initIndicateurSync = function () {
  const liste = this.querySelector('.choix-navigation');
  if (!liste || !window.Sync || typeof window.Sync.getEtat !== 'function') return;
  const li = document.createElement('li');
  li.className = 'sync-indicateur';
  li.setAttribute('role', 'status');
  li.style.cssText = 'display:none;align-items:center;font-size:1.1rem;padding:0 8px;cursor:default;user-select:none;';
  liste.appendChild(li);
  const TEXTES = {
    'synchronise': ['☁️✓', 'Ta progression est sauvegardée'],
    'en-cours': ['☁️…', 'Sauvegarde en cours'],
    'hors-ligne': ['☁️⏸', 'Pas de connexion : ta progression est gardée ici'],
    'erreur': ['☁️⏸', 'Sauvegarde en pause : ta progression est gardée ici']
  };
  const maj = () => {
    const t = TEXTES[window.Sync.getEtat()];
    if (!t) { li.style.display = 'none'; li.textContent = ''; li.removeAttribute('title'); return; }
    li.style.display = 'flex';
    li.textContent = t[0];
    li.title = t[1];
    li.setAttribute('aria-label', t[1]);
  };
  this._majSync = maj;
  window.addEventListener('mathemagie-sync', maj);
  maj();
};

AppHeader.prototype.disconnectedCallback = function () {
  if (this._majSync) window.removeEventListener('mathemagie-sync', this._majSync);
};

customElements.define('app-header', AppHeader);

/**
 * Fenêtre « Mon personnage » : l'enfant se renomme et choisit un personnage débloqué.
 * Sans code parent. Les changements passent par gestionnaireProfils (localStorage + synchro).
 */
function ouvrirEditeurProfil() {
  const gp = window.gestionnaireProfils;
  if (!gp || !gp.getJoueurActif?.() || document.getElementById('editeur-profil')) return;
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dernierFocus = document.activeElement;
  let avatar = gp.getAvatar();
  const { disponibles, debloquesInfos } = gp.getAvatarsDisponibles();
  const verrouilles = debloquesInfos.filter((i) => !i.debloque);

  const fond = document.createElement('div');
  fond.id = 'editeur-profil';
  fond.className = 'editeur-fond';
  fond.innerHTML = `
    <div class="editeur-carte" role="dialog" aria-modal="true" aria-labelledby="editeur-titre">
      <h2 id="editeur-titre">✏️ Mon personnage</h2>
      <label class="editeur-label" for="editeur-prenom">Mon prénom</label>
      <input id="editeur-prenom" class="editeur-prenom" type="text" maxlength="15" autocomplete="off" value="${esc(gp.getJoueurActif())}">
      <p class="editeur-label">Mon personnage</p>
      <div class="editeur-grille" role="radiogroup" aria-label="Choisis ton personnage">
        ${disponibles.map((a) => `<button type="button" class="editeur-choix" role="radio" data-avatar="${esc(a)}" aria-label="Personnage ${esc(a)}">${esc(a)}</button>`).join('')}
      </div>
      ${verrouilles.length ? `<p class="editeur-aide">🔒 ${verrouilles.length} personnage${verrouilles.length > 1 ? 's' : ''} à débloquer avec les <a href="${esc(document.querySelector('app-header')?.getAttribute('base-path') || '')}trophees.html">trophées</a> !</p>` : '<p class="editeur-aide">🌟 Tu as débloqué tous les personnages !</p>'}
      <p class="editeur-erreur" id="editeur-erreur" role="alert"></p>
      <div class="editeur-actions">
        <button type="button" class="btn-secondaire" id="editeur-annuler">Annuler</button>
        <button type="button" class="btn-principal" id="editeur-ok">✅ Valider</button>
      </div>
    </div>`;
  document.body.appendChild(fond);

  const champ = fond.querySelector('#editeur-prenom');
  const erreur = fond.querySelector('#editeur-erreur');
  const choix = fond.querySelectorAll('.editeur-choix');
  const marquer = () => choix.forEach((b) => {
    const sel = b.dataset.avatar === avatar;
    b.classList.toggle('choisi', sel);
    b.setAttribute('aria-checked', String(sel));
  });
  marquer();
  choix.forEach((b) => b.addEventListener('click', () => { avatar = b.dataset.avatar; marquer(); }));

  const fermer = () => {
    fond.remove();
    document.removeEventListener('keydown', surTouche);
    if (dernierFocus && dernierFocus.focus) dernierFocus.focus();
  };
  const valider = () => {
    erreur.textContent = '';
    const nom = champ.value.trim();
    if (avatar !== gp.getAvatar() && !gp.setAvatar(avatar)) {
      erreur.textContent = 'Ce personnage n’est pas encore débloqué.';
      return;
    }
    if (nom !== gp.getJoueurActif()) {
      const r = gp.renommerProfilActif(nom);
      if (!r.ok) { erreur.textContent = r.erreur; return; }
    }
    fermer();
    window.location.reload(); // rafraîchit l'en-tête et la page avec le nouveau prénom / personnage
  };
  const surTouche = (e) => {
    if (e.key === 'Escape') fermer();
    else if (e.key === 'Enter' && e.target === champ) { e.preventDefault(); valider(); }
    else if (e.key === 'Tab') { // garde le focus dans la fenêtre
      const f = [...fond.querySelectorAll('input, button, a')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  };
  document.addEventListener('keydown', surTouche);
  fond.addEventListener('click', (e) => { if (e.target === fond) fermer(); });
  fond.querySelector('#editeur-annuler').addEventListener('click', fermer);
  fond.querySelector('#editeur-ok').addEventListener('click', valider);
  champ.focus();
  champ.select();
}
window.ouvrirEditeurProfil = ouvrirEditeurProfil;
