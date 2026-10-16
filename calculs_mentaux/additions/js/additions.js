// Configuration fine : la génération des calculs lit le programme du niveau
// (programme.calcul.additions.niveaux[palier - 1]) via GenerateurCalcul.
const configAdditions = {
  nomOperation: "additions",
  operationSign: "+"
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configAdditions);
});
