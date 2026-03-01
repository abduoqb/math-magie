class AppHeader extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute('base-path') || '';
    
    const path = window.location.pathname;
    // Détection plus robuste des sections
    const isCalculs = path.includes('/calculs_mentaux/');
    const isGeometrie = path.includes('/geometrie/');
    const isTrophees = path.includes('trophees.html');
    const isAccueil = !isCalculs && !isGeometrie && !isTrophees;

    // Infos du mage actif
    const nomMage = window.gestionnaireProfils ? gestionnaireProfils.getJoueurActif() : null;
    const avatarMage = nomMage && window.gestionnaireProfils ? gestionnaireProfils.getAvatar() : '🧙';
    const couleurMage = nomMage && window.gestionnaireProfils ? gestionnaireProfils.getCouleur() : '#A077EE';
    const titreMage = nomMage && window.gestionnaireProfils ? gestionnaireProfils.getTitreMage() : '';

    this.innerHTML = `
      <header>
        <nav class="barre-navigation">
          <h1><a href="${basePath}index.html">Mathémagie</a></h1>
          <div>
            <ul class="choix-navigation">
              <li class="${isAccueil ? 'selected' : ''}"><a href="${basePath}index.html">Accueil</a></li>
              <li class="${isCalculs ? 'selected' : ''}"><a href="${basePath}calculs_mentaux/index.html">Calculs</a></li>
              <li class="${isGeometrie ? 'selected' : ''}"><a href="${basePath}geometrie/index.html">Géométrie</a></li>
              <li class="${isTrophees ? 'selected' : ''}"><a href="${basePath}trophees.html">Trophées</a></li>
              ${nomMage ? `
                <li class="mage-bouton">
                  <a href="#" id="btn-changer-mage" style="display: flex; align-items: center; gap: 8px;">
                    <span style="
                      display: inline-flex;
                      align-items: center;
                      justify-content: center;
                      width: 32px;
                      height: 32px;
                      border-radius: 50%;
                      background: linear-gradient(135deg, ${couleurMage}, ${ajusterCouleurHeader(couleurMage, 40)});
                      font-size: 1.1rem;
                      flex-shrink: 0;
                    ">${avatarMage}</span>
                    <span style="display: flex; flex-direction: column; line-height: 1.2;">
                      <span style="font-size: 0.95rem;">${nomMage}</span>
                      ${titreMage ? `<span style="font-size: 0.65rem; opacity: 0.7;">${titreMage}</span>` : ''}
                    </span>
                  </a>
                </li>
              ` : ''}
            </ul>
          </div>
        </nav>
      </header>
    `;

    // Bouton Changer de Mage
    const btnMage = this.querySelector('#btn-changer-mage');
    if (btnMage) {
      btnMage.addEventListener('click', (e) => {
        e.preventDefault();
        gestionnaireProfils.deconnecter();
        window.location.href = basePath + 'choix-mage.html';
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

customElements.define('app-header', AppHeader);
