const configDroites = {
  typeInterface: "boutons",
  nomOperation: "geometrie-droites",
  genererQuestion: function(niveau = 1) {
    // Niv1 : Parallèles / Perpendiculaires, sans rotation
    // Niv2 : + rotation modérée
    // Niv3 : + Sécantes (ni // ni ⊥), rotation totale
    let types;
    if (niveau <= 2) {
      types = ["Parallèles", "Perpendiculaires"];
    } else {
      types = ["Parallèles", "Perpendiculaires", "Sécantes"];
    }

    const typeCible = types[Math.floor(Math.random() * types.length)];

    let line2;
    if (typeCible === "Parallèles") {
      line2 = `<line x1="20" y1="60" x2="80" y2="60" stroke="#334155" stroke-width="4" stroke-linecap="round"/>`;
    } else if (typeCible === "Perpendiculaires") {
      line2 = `<line x1="50" y1="20" x2="50" y2="80" stroke="#334155" stroke-width="4" stroke-linecap="round"/>`;
    } else {
      // Sécantes : angle entre 30° et 60° ou 120° et 150° (clairement ni 0° ni 90°)
      const angle = (Math.random() > 0.5) ? (30 + Math.random() * 30) : (120 + Math.random() * 30);
      const rad = (angle * Math.PI) / 180;
      const cx = 50, cy = 50, len = 30;
      const x1 = cx - len * Math.cos(rad), y1 = cy - len * Math.sin(rad);
      const x2 = cx + len * Math.cos(rad), y2 = cy + len * Math.sin(rad);
      line2 = `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#334155" stroke-width="4" stroke-linecap="round"/>`;
    }

    let angleRotation;
    if (niveau === 1) angleRotation = 0;
    else if (niveau === 2) angleRotation = [0, 45, 90, 135][Math.floor(Math.random() * 4)];
    else angleRotation = Math.floor(Math.random() * 360);

    const svg = `
      <svg viewBox="0 0 100 100">
        <g transform="rotate(${angleRotation}, 50, 50)">
          <line x1="20" y1="40" x2="80" y2="40" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
          ${line2}
        </g>
      </svg>`;

    return {
      id: `droites-${typeCible}-${angleRotation}`,
      svg: svg,
      reponse: typeCible,
      instruction: "Comment sont ces deux baguettes magiques ?",
      options: types
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configDroites);
});
