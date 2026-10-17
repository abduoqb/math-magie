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
      s('<rect x="22" y="48" width="14" height="12" />', '#93C5FD'),
    'geometrie-espace':
      s('<rect x="8" y="8" width="48" height="48" rx="4" />', '#E0F2FE') +
      '<path d="M8 24 H56 M8 40 H56 M24 8 V56 M40 8 V56" stroke="' + E + '" stroke-width="2.2" fill="none"/>' +
      s('<polygon points="47,31 49.4,36.2 55,36.8 50.8,40.6 52,46 47,43.2 42,46 43.2,40.6 39,36.8 44.6,36.2" />', '#FACC15') +
      '<circle cx="16" cy="48" r="5" fill="#FB7185" stroke="' + E + '" stroke-width="3"/>',
    'geometrie-solides':
      s('<polygon points="10,26 38,26 38,56 10,56" />', '#FDBA74') +
      s('<polygon points="10,26 22,12 50,12 38,26" />', '#FED7AA') +
      s('<polygon points="38,26 50,12 50,42 38,56" />', '#FB923C'),
    'geometrie-cercle':
      s('<circle cx="32" cy="32" r="24" />', '#BAE6FD') +
      '<line x1="32" y1="32" x2="56" y2="32" stroke="#F97316" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="32" cy="32" r="4" fill="' + E + '"/>',
    'geometrie-instruments':
      s('<rect x="6" y="40" width="52" height="16" rx="3" />', '#FDE68A') +
      '<path d="M16 40 V47 M26 40 V47 M36 40 V47 M46 40 V47" stroke="' + E + '" stroke-width="2.4" stroke-linecap="round"/>' +
      s('<polygon points="10,34 10,6 38,34" />', '#A7F3D0'),
    'geometrie-rapporteur':
      s('<path d="M6 48 A26 26 0 0 1 58 48 Z" />', '#BAE6FD') +
      '<path d="M32 48 L50 26" stroke="#F97316" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path d="M15 38 L18 40 M22 28 L25 31 M32 24 V28 M42 28 L39 31" stroke="' + E + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="32" cy="48" r="3.5" fill="' + E + '"/>'
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
