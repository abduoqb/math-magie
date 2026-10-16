// Configuration fine : la génération des calculs lit le programme du niveau
// (programme.calcul.divisions.niveaux[palier - 1]) via GenerateurCalcul.
const configDivisions = {
  nomOperation: "divisions",
  operationSign: "÷"
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configDivisions);
});
