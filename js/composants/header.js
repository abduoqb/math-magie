class AppHeader extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute('base-path') || '';
    
    const path = window.location.pathname;
    // Détection plus robuste des sections
    const isCalculs = path.includes('/calculs_mentaux/');
    const isGeometrie = path.includes('/geometrie/');
    const isTrophees = path.includes('trophees.html');
    const isAccueil = !isCalculs && !isGeometrie && !isTrophees;

    // Nom du mage actif
    const nomMage = window.gestionnaireProfils ? gestionnaireProfils.getJoueurActif() : null;

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
              ${nomMage ? `<li class="mage-bouton"><a href="#" id="btn-changer-mage">🧙 ${nomMage}</a></li>` : ''}
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

customElements.define('app-header', AppHeader);
