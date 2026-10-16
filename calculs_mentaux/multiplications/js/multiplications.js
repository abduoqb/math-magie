// Configuration fine : la génération des calculs lit le programme du niveau
// (programme.calcul.multiplications.niveaux[palier - 1]) via GenerateurCalcul.
const configMultiplications = {
  nomOperation: "multiplications",
  operationSign: "x"
};

document.addEventListener("DOMContentLoaded", () => {
  new MoteurCalcul(configMultiplications);
});
