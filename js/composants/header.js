class AppHeader extends HTMLElement {
  connectedCallback() {
    // Determine the base path so links work correctly from subdirectories
    const basePath = this.getAttribute('base-path') || '';
    
    // Determine which tab should be active
    const path = window.location.pathname;
    const isCalculs = path.includes('calculs_mentaux');
    const isGeometrie = path.includes('geometrie');
    const isAccueil = !isCalculs && !isGeometrie;

    this.innerHTML = `
      <header>
        <nav class="barre-navigation">
          <h1><a href="${basePath}index.html">Mathémagie</a></h1>
          <div>
            <ul class="choix-navigation">
              <li class="${isAccueil ? 'selected' : ''}"><a href="${basePath}index.html">Accueil</a></li>
              <li class="${isCalculs ? 'selected' : ''}"><a href="${basePath}calculs_mentaux/index.html">Calculs mentaux</a></li>
              <li class="${isGeometrie ? 'selected' : ''}"><a href="${basePath}geometrie/index.html">Géométrie</a></li>
            </ul>
          </div>
        </nav>
      </header>
    `;
  }
}

customElements.define('app-header', AppHeader);
