/* Icônes « autocollant » des missions de géométrie (SVG en ligne, 64x64).
 * Utilisées par la liste des missions et par l'en-tête de chaque mission.
 * GeoIcones.svg('geometrie-formes') -> chaîne SVG ; GeoIcones.etoile(plein) -> étoile de progression. */
(function (root) {
  var E = '#2B2D5B'; // encre
  var A = 'fill="none" stroke="' + E + '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"';
  function s(c, f) { return '<g stroke="' + E + '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" fill="' + f + '">' + c + '</g>'; }

  var ICONES = {
    'geometrie-formes':
      s('<polygon points="16,50 30,22 44,50" />', '#FB7185') +
      s('<circle cx="44" cy="22" r="11" />', '#FACC15') +
      s('<rect x="30" y="38" width="22" height="18" rx="3" />', '#60A5FA'),
    'geometrie-proprietes':
      s('<polygon points="32,8 56,26 47,54 17,54 8,26" />', '#5EEAD4') +
      '<g fill="#fff" stroke="' + E + '" stroke-width="3">' +
      '<circle cx="32" cy="8" r="4.5"/><circle cx="56" cy="26" r="4.5"/><circle cx="47" cy="54" r="4.5"/><circle cx="17" cy="54" r="4.5"/><circle cx="8" cy="26" r="4.5"/></g>',
    'geometrie-angles':
      '<path d="M12 52 L52 52 L22 14 Z" fill="#FDBA74" stroke="' + E + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M26 52 A14 14 0 0 0 20 40" ' + A + '/>' +
      '<circle cx="12" cy="52" r="4" fill="#fff" stroke="' + E + '" stroke-width="3"/>',
    'geometrie-symetrie':
      s('<path d="M32 30 C20 6 4 12 8 30 C10 42 24 44 32 34 Z" />', '#C4B5FD') +
      s('<path d="M32 30 C44 6 60 12 56 30 C54 42 40 44 32 34 Z" />', '#C4B5FD') +
      s('<path d="M32 34 C24 46 14 50 12 58 C22 58 30 50 32 42 C34 50 42 58 52 58 C50 50 40 46 32 34 Z" />', '#A78BFA').replace('stroke-width="3.5"', 'stroke-width="3"') +
      '<line x1="32" y1="4" x2="32" y2="60" stroke="' + E + '" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="round"/>',
    'geometrie-vraifaux':
      '<circle cx="19" cy="32" r="14" fill="#4ADE80" stroke="' + E + '" stroke-width="3.5"/>' +
      '<path d="M12 32 L18 38 L27 26" ' + A + '/>' +
      '<circle cx="46" cy="32" r="14" fill="#FB7185" stroke="' + E + '" stroke-width="3.5"/>' +
      '<path d="M40 26 L52 38 M52 26 L40 38" ' + A + '/>',
    'geometrie-droites':
      '<line x1="6" y1="18" x2="58" y2="18" stroke="' + E + '" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="6" y1="38" x2="58" y2="38" stroke="' + E + '" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="32" y1="6" x2="32" y2="58" stroke="#F97316" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="32" y="28" width="9" height="10" fill="#fff" stroke="' + E + '" stroke-width="3"/>',
    'geometrie-triangles':
      s('<polygon points="32,8 58,54 6,54" />', '#FDE047') +
      '<path d="M19 33 L25 36 M45 33 L39 36" ' + A + '/>' +
      '<circle cx="32" cy="38" r="2" fill="' + E + '"/>',
    'geometrie-quadrilateres':
      s('<polygon points="32,6 54,30 32,58 10,30" />', '#F9A8D4') +
      s('<polygon points="32,20 42,31 32,44 22,31" />', '#FFFFFF'),
    'geometrie-patrons':
      s('<rect x="22" y="6" width="14" height="14" />', '#FDBA74') +
      s('<rect x="8" y="20" width="14" height="14" />', '#86EFAC') +
      s('<rect x="22" y="20" width="14" height="14" />', '#FDBA74') +
      s('<rect x="36" y="20" width="14" height="14" />', '#86EFAC') +
      s('<rect x="22" y="34" width="14" height="14" />', '#93C5FD') +
      s('<rect x="22" y="48" width="14" height="12" />', '#93C5FD')
  };

  function svg(id, taille) {
    var c = ICONES[id];
    if (!c) c = s('<circle cx="32" cy="32" r="22" />', '#5EEAD4');
    var t = taille ? ' width="' + taille + '" height="' + taille + '"' : '';
    return '<svg class="geo-icone" viewBox="0 0 64 64"' + t + ' aria-hidden="true" focusable="false">' + c + '</svg>';
  }

  function etoile(plein, cls) {
    return '<svg class="geo-etoile ' + (plein ? 'pleine' : 'vide') + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<polygon points="12,2.5 15,9 22,9.8 16.8,14.6 18.3,21.5 12,18 5.7,21.5 7.2,14.6 2,9.8 9,9" stroke-width="2" stroke-linejoin="round"/></svg>';
  }

  var API = { svg: svg, etoile: etoile, ICONES: ICONES };
  root.GeoIcones = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
