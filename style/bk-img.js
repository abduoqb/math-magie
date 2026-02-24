let background_image = document.querySelector(".bk-img");
let suivant = document.getElementById("suivant");
let precedent = document.getElementById("precedent");

const listeImg = ["first-img", "second-img", "third-img", "fourth-img"];

function imgDefilement() {
  let indice = 0;

  suivant?.addEventListener("click", () => {
    background_image?.classList.remove(listeImg[indice]);
    indice = (indice + 1) % listeImg.length;
    background_image?.classList.add(listeImg[indice]);
  });

  precedent?.addEventListener("click", () => {
    background_image?.classList.remove(listeImg[indice]);
    indice = (indice - 1 + listeImg.length) % listeImg.length;
    background_image?.classList.add(listeImg[indice]);
  });
}

imgDefilement();
