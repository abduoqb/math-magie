// Configuration fine : la génération des calculs lit le programme du niveau
// (programme.calcul.soustractions.niveaux[palier - 1]) via GenerateurCalcul.
const configSoustractions = {
  nomOperation: "soustractions",
  operationSign: "-"
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configSoustractions);
});
