const configDroites = {
  typeInterface: "boutons",
  nomOperation: "geometrie-droites",
  genererQuestion: function() {
    const types = ["Parallèles", "Perpendiculaires"];
    const typeCible = types[Math.floor(Math.random() * types.length)];
    const angleRotation = Math.floor(Math.random() * 360);
    
    let line2;
    if (typeCible === "Parallèles") {
      line2 = `<line x1="20" y1="60" x2="80" y2="60" stroke="#334155" stroke-width="4" stroke-linecap="round"/>`;
    } else {
      line2 = `<line x1="50" y1="20" x2="50" y2="80" stroke="#334155" stroke-width="4" stroke-linecap="round"/>`;
    }

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
      options: ["Parallèles", "Perpendiculaires"]
    };
  }
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurGeometrie(configDroites);
});
