class AppHeader extends HTMLElement {
  connectedCallback() {
    const basePath = this.getAttribute('base-path') || '';
    
    const path = window.location.pathname;
    // Détection plus robuste des sections
    const isCalculs = path.includes('/calculs_mentaux/');
    const isGeometrie = path.includes('/geometrie/');
    const isTrophees = path.includes('trophees.html');
    const isAccueil = !isCalculs && !isGeometrie && !isTrophees;

    this.innerHTML = `
      <header>
        <nav class="barre-navigation">
          <h1><a href="${basePath}index.html">Mathémagie</a></h1>
          <div>
            <ul class="choix-navigation">
              <li class="${isAccueil ? 'selected' : ''}"><a href="${basePath}index.html" style="min-height: 44px; display: flex; align-items: center;">Accueil</a></li>
              <li class="${isCalculs ? 'selected' : ''}"><a href="${basePath}calculs_mentaux/index.html" style="min-height: 44px; display: flex; align-items: center;">Calculs</a></li>
              <li class="${isGeometrie ? 'selected' : ''}"><a href="${basePath}geometrie/index.html" style="min-height: 44px; display: flex; align-items: center;">Géométrie</a></li>
              <li class="${isTrophees ? 'selected' : ''}"><a href="${basePath}trophees.html" style="min-height: 44px; display: flex; align-items: center;">Trophées</a></li>
            </ul>
          </div>
        </nav>
      </header>
    `;
  }
}

customElements.define('app-header', AppHeader);
