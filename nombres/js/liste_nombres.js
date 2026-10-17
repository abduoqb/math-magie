// Liste des missions « Nombres » pour la classe du profil actif.
// Les missions hors programme (actif:false) sont grisées « Pas encore au programme ».
document.addEventListener('DOMContentLoaded', function () {
  var gp = (typeof gestionnaireProfils !== 'undefined') ? gestionnaireProfils : null;
  var classe = gp && gp.getNiveauClasse ? gp.getNiveauClasse() : null;
  var prog = (gp && gp.getProgramme && gp.getProgramme()) ||
    (window.PROGRAMMES && (window.PROGRAMMES[classe || 'cm1'] || window.PROGRAMMES.cm1)) || null;
  var zone = document.getElementById('themes');
  if (!zone || !prog || !prog.nombres) return;
  var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
  var estCP = classe === 'cp';
  function etoiles(actives, total) {
    var h = '';
    for (var i = 1; i <= total; i++) h += '<img class="nb-etoile' + (i <= actives ? ' on' : '') + '" src="../images/etoile.svg" alt="" />';
    return h;
  }
  var html = '';
  GenerateurNombres.THEMES.forEach(function (t) {
    var def = prog.nombres[t.id];
    if (!def) return;
    var actif = def.actif !== false && def.niveaux && def.niveaux.length;
    var nom = esc(def.libelle || t.cle);
    if (!actif) {
      html += '<div class="nb-theme inactive" aria-disabled="true"><span class="nb-theme-ico" aria-hidden="true">' + t.emoji + '</span>' +
        '<span class="nb-theme-nom">' + nom + '</span><span class="nb-theme-go">' + (estCP ? 'Plus tard' : 'Pas encore au programme') + '</span></div>';
      return;
    }
    var palier = 1;
    try { var pr = gp && gp.getProgression ? gp.getProgression(t.id) : null; palier = (pr && pr.niveau) || 1; } catch (e) { palier = 1; }
    var total = def.niveaux.length;
    palier = Math.min(total, Math.max(1, palier));
    html += '<a class="nb-theme" href="' + t.cle + '.html">' +
      '<span class="nb-theme-ico" aria-hidden="true">' + t.emoji + '</span>' +
      '<span class="nb-theme-nom">' + nom + '</span>' +
      '<span class="nb-theme-palier" role="img" aria-label="Palier ' + palier + ' sur ' + total + '">' + etoiles(palier, total) + '</span>' +
      '<span class="nb-theme-go">Jouer</span></a>';
  });
  zone.innerHTML = html;
  if (estCP) document.body.classList.add('nb-cp');
});
