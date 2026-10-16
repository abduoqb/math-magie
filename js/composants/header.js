class AppHeader extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute('base-path') || '';
    
    const path = window.location.pathname;
    const isCalculs = path.includes('/calculs_mentaux/');
    const isGeometrie = path.includes('/geometrie/');
    const isJeux = path.includes('/jeux/');
    const isJouer = isCalculs || isGeometrie || isJeux;
    const isTrophees = path.includes('trophees.html');
    const isAccueil = !isCalculs && !isGeometrie && !isJeux && !isTrophees;

    // Infos du mage actif (gardes: marche avec profils v1 et v2)
    const gp = window.gestionnaireProfils;
    const nomMage = gp?.getJoueurActif?.() || null;
    const avatarMage = nomMage ? (gp.getAvatar?.() || '🧙') : '🧙';
    const couleurMage = nomMage ? (gp.getCouleur?.() || '#A077EE') : '#A077EE';
    const niveauClasse = nomMage ? (gp.getNiveauClasse?.() || '') : '';
    const badgeClasse = niveauClasse ? String(niveauClasse).toUpperCase() : '';
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    // Univers courant (couleur de l'élément actif)
    const uJouer = isCalculs ? 'u-calcul' : isGeometrie ? 'u-geometrie' : 'u-jeux';
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
                    <li class="u-geometrie ${isGeometrie ? 'selected' : ''}">
                      <a href="${basePath}geometrie/index.html">${ico('📐')}Géométrie</a>
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
