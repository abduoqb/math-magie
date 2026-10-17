/**
 * Générateur « Nombres » : fonctions pures (aucun accès au DOM), `rng` injectable, exportées pour Node.
 * Chaque thème lit un palier du programme (programme.nombres['nombres-<theme>'].niveaux[palier - 1]).
 * Aucun nombre de classe ici : tout vient du palier.
 *
 * Question produite :
 *   { type: 'qcm' | 'saisie' | 'ordre' | 'droite',
 *     enonce, expression?, voix, aide?,
 *     choix?[] + reponse (chaîne) + ordreFixe?      -> qcm
 *     reponse (nombre) + reponseTexte                -> saisie
 *     items[{id,label}] + reponse [ids dans l'ordre] -> ordre
 *     visuel { type:'droite', n, labels[], etiquettes{}, marque, placer } + reponse (indice) -> droite
 *     visuel { type:'part', n, d }                   -> figure colorée (qcm)
 *     meta { mission, kind, nombres[] } }
 * `{?}` dans un texte marque le « trou » à remplir.
 */
(function (global) {
  'use strict';

  /* ---------- outils ---------- */

  const entier = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
  const choisir = (rng, t) => t[Math.floor(rng() * t.length)];
  function melanger(rng, t) {
    const r = t.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const x = r[i]; r[i] = r[j]; r[j] = x;
    }
    return r;
  }
  const p10 = (n) => Math.pow(10, n);
  const NBSP = ' ';
  const groupe = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);

  /** Entier « k » à `dec` décimales -> texte français (virgule, espaces insécables). */
  function fmt(k, dec) {
    dec = dec || 0;
    const neg = k < 0;
    let s = String(Math.abs(Math.round(k)));
    if (dec > 0) {
      while (s.length <= dec) s = '0' + s;
      return (neg ? '-' : '') + groupe(s.slice(0, -dec)) + ',' + s.slice(-dec);
    }
    return (neg ? '-' : '') + groupe(s);
  }
  /** Comme fmt mais sans zéros inutiles (3,50 -> 3,5). */
  function fmtCourt(k, dec) {
    let t = fmt(k, dec);
    if (dec > 0) t = t.replace(/0+$/, '').replace(/,$/, '');
    return t;
  }
  /** Valeur réelle d'un entier à `dec` décimales (sans dérive flottante). */
  const valeurReelle = (k, dec) => Number((k / p10(dec || 0)).toFixed(dec || 0));
  /** Graduation k d'une droite : décimale (dec), fractionnaire (den) ou entière. */
  function fmtGrad(k, dec, den) {
    if (den) return k % den === 0 ? fmt(k / den) : k + '/' + den;
    return fmtCourt(k, dec || 0);
  }

  const RANGS = ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de milliers', 'centaines de milliers', 'millions', 'dizaines de millions', 'centaines de millions'];
  const RANGS_1 = ['unité', 'dizaine', 'centaine', 'millier', 'dizaine de milliers', 'centaine de milliers', 'million', 'dizaine de millions', 'centaine de millions'];
  const DECS = ['dixièmes', 'centièmes', 'millièmes'];
  const DECS_1 = ['dixième', 'centième', 'millième'];
  const nomRang = (r, n) => (n > 1 ? RANGS[r] : RANGS_1[r]);
  const nomDec = (p, n) => (n > 1 ? DECS[p - 1] : DECS_1[p - 1]);

  /** Complète une liste de choix (nombres) jusqu'à `nb` valeurs distinctes, toutes acceptées par `ok`. */
  function completer(rng, bonne, candidats, nb, ok, voisin) {
    const vus = new Set([bonne]);
    const res = [bonne];
    const ajoute = (c) => {
      if (typeof c !== 'number' || !isFinite(c) || vus.has(c) || !ok(c)) return;
      vus.add(c); res.push(c);
    };
    melanger(rng, candidats).forEach((c) => { if (res.length < nb) ajoute(c); });
    for (let t = 1; res.length < nb && t < 300; t++) ajoute(voisin(t));
    return melanger(rng, res);
  }
  const voisinDe = (rng, bonne, borne) => (t) => {
    const amp = Math.max(2, Math.ceil(Math.abs(bonne) * 0.1) + Math.floor(t / 8));
    const c = bonne + choisir(rng, [-1, 1]) * entier(rng, 1, amp);
    return c >= 0 && c <= borne ? c : entier(rng, 0, borne);
  };

  const chiffres = (n) => String(n).split('').map(Number);

  /* ---------- VALEUR DES CHIFFRES ---------- */

  function genValeur(rng, d) {
    const types = d.types || ['chiffre'];
    let kind = choisir(rng, types);
    const n = entier(rng, d.min, d.max);
    const s = String(n), L = s.length;
    const lire = (r) => Number(s[L - 1 - r]);

    if (kind === 'valeur') {
      // le chiffre doit apparaître une seule fois et ne pas être nul
      const cand = [];
      for (let r = 0; r < L; r++) {
        const c = lire(r);
        if (c !== 0 && s.split(String(c)).length - 1 === 1) cand.push(r);
      }
      if (!cand.length || L < 2) kind = 'chiffre';
      else {
        const r = choisir(rng, cand), c = lire(r), bonne = c * p10(r);
        const ok = (x) => x >= 0 && x <= p10(L);
        const cands = [];
        for (let k = 0; k < L; k++) if (k !== r) cands.push(c * p10(k));
        cands.push(c);
        const vals = completer(rng, bonne, cands, 4, ok, voisinDe(rng, bonne, p10(L) - 1));
        return {
          type: 'qcm',
          enonce: 'Dans ' + fmt(n) + ', quelle est la valeur du chiffre ' + c + ' ?',
          choix: vals.map((v) => fmt(v)), reponse: fmt(bonne),
          aide: 'Regarde la place du ' + c + ' dans le nombre.',
          meta: { kind, nombres: [n] }
        };
      }
    }
    if (kind === 'combien' && L >= 2) {
      const r = entier(rng, 1, L - 1);
      const bonne = Math.floor(n / p10(r));
      return {
        type: 'saisie',
        enonce: 'Dans ' + fmt(n) + ', combien y a-t-il de ' + RANGS[r] + ' en tout ?',
        reponse: bonne, reponseTexte: fmt(bonne),
        aide: 'Compte tous les paquets de ' + fmt(p10(r)) + ' : ' + fmt(n) + ' contient ' + fmt(bonne) + ' ' + RANGS[r] + '.',
        meta: { kind, nombres: [n] }
      };
    }
    // chiffre des <rang>
    const r = entier(rng, 0, L - 1), bonne = lire(r);
    const ds = Array.from(new Set(chiffres(n)));
    const vals = completer(rng, bonne, ds, 4, (x) => x >= 0 && x <= 9, () => entier(rng, 0, 9));
    return {
      type: 'qcm',
      enonce: 'Dans ' + fmt(n) + ', quel est le chiffre des ' + RANGS[r] + ' ?',
      choix: vals.map(String), reponse: String(bonne),
      aide: 'Les unités sont tout à droite, puis les dizaines, puis les centaines...',
      meta: { kind: 'chiffre', nombres: [n] }
    };
  }

  /* ---------- DÉCOMPOSER ---------- */

  /** Morceaux non nuls : un par chiffre (jusqu'à 6 chiffres), un par classe (millions / mille / unités) au-delà. */
  function partiesNonNulles(n) {
    const s = String(n), L = s.length, out = [];
    if (L > 6) {
      [1000000, 1000, 1].forEach((u) => {
        const v = u === 1000000 ? Math.floor(n / u) * u : (Math.floor(n / u) % 1000) * u;
        if (v) out.push({ r: -1, c: 0, v });
      });
      return out;
    }
    for (let r = L - 1; r >= 0; r--) {
      const c = Number(s[L - 1 - r]);
      if (c) out.push({ r, c, v: c * p10(r) });
    }
    return out;
  }

  function genDecomposer(rng, d) {
    const types = d.types || ['rangs'];
    let kind = choisir(rng, types);
    const n = entier(rng, Math.max(10, d.min), d.max);
    const L = String(n).length;
    if (kind === 'rangs' && L > 4) kind = 'somme';
    if (kind === 'paquets' && L < 4) kind = 'somme';

    if (kind === 'rangs') {
      const s = String(n);
      const trou = entier(rng, 0, L - 1);
      const morceaux = [];
      for (let i = 0; i < L; i++) {
        const r = L - 1 - i, c = Number(s[i]);
        morceaux.push(i === trou ? '{?} ' + RANGS[r] : c + ' ' + nomRang(r, c));
      }
      const bonne = Number(s[trou]);
      return {
        type: 'saisie',
        enonce: 'Complète la décomposition.',
        expression: fmt(n) + ' = ' + morceaux.join(' + '),
        voix: fmt(n) + ' égale ' + morceaux.join(' plus ').replace('{?}', 'combien de'),
        reponse: bonne, reponseTexte: String(bonne),
        aide: 'Un chiffre à la place des ' + RANGS[L - 1 - trou] + ' dit combien il y en a.',
        meta: { kind, nombres: [n] }
      };
    }
    if (kind === 'somme') {
      const parts = partiesNonNulles(n);
      if (parts.length < 2) return genDecomposer(rng, Object.assign({}, d, { types: ['rangs'] }));
      const trou = entier(rng, 0, parts.length - 1);
      const txt = parts.map((p, i) => (i === trou ? '{?}' : fmt(p.v)));
      return {
        type: 'saisie',
        enonce: 'Complète la décomposition.',
        expression: fmt(n) + ' = ' + txt.join(' + '),
        voix: fmt(n) + ' égale ' + txt.join(' plus ').replace('{?}', 'combien'),
        reponse: parts[trou].v, reponseTexte: fmt(parts[trou].v),
        aide: parts[trou].c ? 'Chaque chiffre garde sa valeur : le ' + parts[trou].c + ' vaut ' + fmt(parts[trou].v) + ' ici.' : 'Le nombre se lit par paquets : millions, milliers, unités.',
        meta: { kind, nombres: [n] }
      };
    }
    if (kind === 'retrouver') {
      let parts = partiesNonNulles(n).map((p) => p.v);
      if (parts.length < 2) return genDecomposer(rng, Object.assign({}, d, { types: ['rangs'] }));
      if (L >= 3 && rng() < 0.5) parts = melanger(rng, parts);
      const s = String(n);
      const cands = [];
      for (let i = 0; i + 1 < L; i++) {
        const a = s.split('');
        const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
        cands.push(Number(a.join('')));
      }
      {
        const a = s.split(''); const t = a[0]; a[0] = a[L - 1]; a[L - 1] = t; cands.push(Number(a.join('')));
      }
      const borne = p10(L) - 1;
      const ok = (x) => x >= p10(L - 1) && x <= borne;
      const vals = completer(rng, n, cands, 4, ok, voisinDe(rng, n, borne));
      return {
        type: 'qcm',
        enonce: 'Quel est ce nombre ?',
        expression: parts.map((v) => fmt(v)).join(' + ') + ' = {?}',
        voix: parts.map((v) => fmt(v)).join(' plus ') + ' égale combien',
        choix: vals.map((v) => fmt(v)), reponse: fmt(n),
        aide: 'Place chaque morceau à sa place : centaines, dizaines, unités...',
        meta: { kind, nombres: [n] }
      };
    }
    // paquets : N = q x 10^k + reste
    const ks = [];
    for (let k = 1; k <= 6; k++) if (p10(k) * 2 <= n && k <= L - 1) ks.push(k);
    const k = choisir(rng, ks.length ? ks : [1]);
    const q = Math.floor(n / p10(k)), reste = n % p10(k);
    if (rng() < 0.5) {
      return {
        type: 'saisie',
        enonce: 'Complète.',
        expression: fmt(n) + ' = {?} × ' + fmt(p10(k)) + ' + ' + fmt(reste),
        voix: fmt(n) + ' égale combien fois ' + fmt(p10(k)) + ' plus ' + fmt(reste),
        reponse: q, reponseTexte: fmt(q),
        aide: 'Combien de paquets de ' + fmt(p10(k)) + ' peux-tu faire ?',
        meta: { kind, nombres: [n] }
      };
    }
    return {
      type: 'saisie',
      enonce: 'Complète.',
      expression: fmt(n) + ' = ' + fmt(q) + ' × ' + fmt(p10(k)) + ' + {?}',
      voix: fmt(n) + ' égale ' + fmt(q) + ' fois ' + fmt(p10(k)) + ' plus combien',
      reponse: reste, reponseTexte: fmt(reste),
      aide: 'Ce qui reste après les paquets de ' + fmt(p10(k)) + '.',
      meta: { kind, nombres: [n] }
    };
  }

  /* ---------- COMPARER ---------- */

  function tirerDistincts(rng, nb, lo, hi, proche) {
    const set = new Set();
    let guard = 0;
    if (proche) {
      const fenetre = Math.max(nb * 2 + 2, Math.round((hi - lo) / 10));
      const debut = entier(rng, lo, Math.max(lo, hi - fenetre));
      const fin = Math.min(hi, debut + fenetre);
      while (set.size < nb && guard++ < 400) set.add(entier(rng, debut, fin));
    }
    while (set.size < nb && guard++ < 800) set.add(entier(rng, lo, hi));
    return Array.from(set);
  }

  function genComparer(rng, d) {
    const dec = d.dec || 0;
    const lo = d.min * p10(dec), hi = d.max * p10(dec);
    const types = d.types || ['symbole'];
    const kind = choisir(rng, types);
    const aff = (k) => fmtCourt(k, dec);

    if (kind === 'plusgrand' || kind === 'pluspetit') {
      const nb = d.nb || 3;
      const nombres = tirerDistincts(rng, nb, lo, hi, d.proche);
      const cible = kind === 'plusgrand' ? Math.max.apply(null, nombres) : Math.min.apply(null, nombres);
      return {
        type: 'qcm',
        enonce: kind === 'plusgrand' ? 'Quel est le plus grand nombre ?' : 'Quel est le plus petit nombre ?',
        choix: melanger(rng, nombres).map(aff), reponse: aff(cible),
        aide: 'Compare d’abord le chiffre de gauche.',
        meta: { kind, nombres: nombres.map((k) => valeurReelle(k, dec)) }
      };
    }
    // symbole
    let a, b, texteB = null;
    if (rng() < 0.12) {
      if (dec > 0) {
        a = entier(rng, Math.ceil(lo / 10), Math.floor(hi / 10)) * 10; b = a;
        texteB = fmt(b, dec); // 3,5 = 3,50
      } else { a = entier(rng, lo, hi); b = a; }
    } else {
      const p = tirerDistincts(rng, 2, lo, hi, d.proche);
      a = p[0]; b = p[1];
    }
    const rep = a < b ? '<' : a > b ? '>' : '=';
    return {
      type: 'qcm', ordreFixe: true,
      enonce: 'Complète avec <, = ou >.',
      expression: aff(a) + ' {?} ' + (texteB || aff(b)),
      voix: aff(a) + ' ... ' + (texteB || aff(b)) + '. Plus petit, égal ou plus grand ?',
      choix: ['<', '=', '>'], reponse: rep,
      aide: dec > 0 ? 'Compare les parties entières, puis les dixièmes, puis les centièmes.' : 'Le plus grand nombre a le plus de dizaines, ou de centaines...',
      meta: { kind, nombres: [valeurReelle(a, dec), valeurReelle(b, dec)] }
    };
  }

  /* ---------- RANGER ---------- */

  function genRanger(rng, d) {
    const dec = d.dec || 0;
    const lo = d.min * p10(dec), hi = d.max * p10(dec);
    const nb = d.nb || 3;
    const sens = choisir(rng, d.sens || ['croissant']);
    const nombres = tirerDistincts(rng, nb, lo, hi, d.proche);
    const aff = (k) => fmtCourt(k, dec);
    const tries = nombres.slice().sort((x, y) => (sens === 'croissant' ? x - y : y - x));
    let items = melanger(rng, nombres);
    for (let t = 0; t < 10 && items.join() === tries.join(); t++) items = melanger(rng, nombres);
    return {
      type: 'ordre',
      enonce: sens === 'croissant' ? 'Range du plus petit au plus grand.' : 'Range du plus grand au plus petit.',
      voix: sens === 'croissant' ? 'Range les nombres du plus petit au plus grand.' : 'Range les nombres du plus grand au plus petit.',
      items: items.map((k) => ({ id: String(k), label: aff(k) })),
      reponse: tries.map(String),
      reponseTexte: tries.map(aff).join(sens === 'croissant' ? ' < ' : ' > '),
      aide: 'Touche les nombres dans l’ordre.',
      meta: { kind: sens, nombres: nombres.map((k) => valeurReelle(k, dec)) }
    };
  }

  /* ---------- ENCADRER ---------- */

  const ORDRES_SING = { '0': 'l’entier', '1': 'la dizaine', '2': 'la centaine', '3': 'le millier', '4': 'la dizaine de milliers', '5': 'la centaine de milliers', '6': 'le million', '7': 'la dizaine de millions', '8': 'la centaine de millions', '-1': 'le dixième', '-2': 'le centième' };
  const ORDRES_PLUR = { '0': 'entiers', '1': 'dizaines', '2': 'centaines', '3': 'milliers', '4': 'dizaines de milliers', '5': 'centaines de milliers', '6': 'millions', '7': 'dizaines de millions', '8': 'centaines de millions', '-1': 'dixièmes', '-2': 'centièmes' };

  function genEncadrer(rng, d) {
    const dec = d.dec || 0;
    const e = choisir(rng, d.e);
    const S = p10(e + dec); // pas, en unités du nombre (entier)
    const lo = d.min * p10(dec), hi = d.max * p10(dec);
    let n = entier(rng, lo, hi);
    if (n % S === 0) n = n + 1 <= hi ? n + 1 : n - 1;
    const bas = Math.floor(n / S) * S, haut = bas + S;
    const kind = choisir(rng, d.types || ['pair']);
    const aff = (k) => fmt(k, dec);
    const N = aff(n);
    if (kind === 'inf' || kind === 'sup') {
      const bonne = kind === 'inf' ? bas : haut;
      return {
        type: 'saisie',
        enonce: (/^la /.test(ORDRES_SING[e]) ? 'Quelle' : 'Quel') + ' est ' + ORDRES_SING[e] + ' juste ' + (kind === 'inf' ? 'en dessous' : 'au-dessus') + ' de ' + N + ' ?',
        reponse: valeurReelle(bonne, dec), reponseTexte: fmtCourt(bonne, dec),
        aide: aff(bas) + ' < ' + N + ' < ' + aff(haut),
        meta: { kind, nombres: [valeurReelle(n, dec)] }
      };
    }
    const bonne = aff(bas) + ' et ' + aff(haut);
    const cap = Math.max(haut, Math.ceil(hi / S) * S); // jamais au-delà du domaine du palier
    const paires = [];
    for (let j = -3; j <= 3; j++) if (j !== 0) paires.push([bas + j * S, haut + j * S]);
    paires.push([bas - S, haut], [bas, haut + S]);
    const cand = paires.filter((p) => p[0] >= 0 && p[1] <= cap).map((p) => aff(p[0]) + ' et ' + aff(p[1]));
    const set = new Set([bonne]);
    melanger(rng, cand).forEach((c) => { if (set.size < 4) set.add(c); });
    return {
      type: 'qcm',
      enonce: N + ' est entre deux ' + ORDRES_PLUR[e] + ' qui se suivent. Lesquels ?',
      choix: melanger(rng, Array.from(set)), reponse: bonne,
      aide: 'Cherche ' + ORDRES_SING[e] + ' juste avant et juste après.',
      meta: { kind: 'pair', nombres: [valeurReelle(n, dec)] }
    };
  }

  /* ---------- DROITE GRADUÉE ---------- */

  function genDroite(rng, d) {
    const dec = d.dec || 0, den = d.den || 0;
    const pas = d.pas || 1;
    const n = Math.round((d.max - d.min) / pas);
    const val = (i) => d.min + i * pas;
    const lab = (i) => fmtGrad(val(i), dec, den);
    const labels = [];
    for (let i = 0; i <= n; i++) labels.push(lab(i));
    const etiquettes = {};
    etiquettes[0] = labels[0]; etiquettes[n] = labels[n];
    if (n > 10 && n % 4 === 0) for (let i = n / 4; i < n; i += n / 4) etiquettes[i] = labels[i];
    const libres = [];
    for (let i = 1; i < n; i++) if (!(i in etiquettes)) libres.push(i);
    const pool = libres.length ? libres : [];
    if (!pool.length) return null;
    let kind = choisir(rng, d.types || ['lire']);
    if (kind === 'placer' && n > 10) kind = 'lire';
    const i = choisir(rng, pool);
    const phraseVoix = 'Droite graduée de ' + labels[0] + ' à ' + labels[n];
    if (kind === 'placer') {
      return {
        type: 'droite',
        enonce: 'Touche la graduation de ' + labels[i] + '.',
        voix: 'Touche la graduation de ' + labels[i] + '. ' + phraseVoix,
        visuel: { type: 'droite', n, labels, etiquettes, marque: null, placer: true },
        reponse: i, reponseTexte: labels[i],
        aide: 'Compte les graduations depuis ' + labels[0] + '.',
        meta: { kind, nombres: [val(i)], dec, den }
      };
    }
    const idx = completer(rng, i, [i - 2, i - 1, i + 1, i + 2], 4, (x) => x >= 0 && x <= n, () => entier(rng, 0, n));
    return {
      type: 'qcm',
      enonce: 'Quel nombre montre la flèche ?',
      voix: 'Quel nombre montre la flèche ? ' + phraseVoix,
      visuel: { type: 'droite', n, labels, etiquettes, marque: i, placer: false },
      choix: idx.map((x) => labels[x]), reponse: labels[i],
      aide: 'Compte de combien on avance à chaque graduation.',
      meta: { kind, nombres: [val(i)], dec, den }
    };
  }

  /* ---------- MOITIÉ ---------- */

  const OBJETS = ['bonbons', 'billes', 'cartes', 'gâteaux', 'étoiles', 'crayons'];

  function genMoitie(rng, d) {
    const max = d.max;
    const kind = choisir(rng, d.types || ['moitie']);
    const demi = entier(rng, 1, Math.max(1, Math.floor(max / 2)));
    const n = demi * 2;
    if (kind === 'partage') {
      return {
        type: 'saisie',
        enonce: 'On partage ' + n + ' ' + choisir(rng, OBJETS) + ' en 2 parts égales. Combien dans chaque part ?',
        reponse: demi, reponseTexte: String(demi),
        aide: 'La moitié, c’est une des 2 parts égales.',
        meta: { kind, nombres: [n] }
      };
    }
    if (kind === 'estmoitie') {
      const ok = (x) => x >= 2 && x <= max && x % 2 === 0;
      const vals = completer(rng, n, [demi, n + 2, n - 2, n * 2, demi * 4, demi + 2].filter(ok), 4, ok,
        () => 2 * entier(rng, 1, Math.max(2, Math.floor(max / 2))));
      return {
        type: 'qcm',
        enonce: demi + ' est la moitié de quel nombre ?',
        choix: vals.map(String), reponse: String(n),
        aide: 'Le double de la moitié, c’est le nombre de départ.',
        meta: { kind, nombres: [n, demi] }
      };
    }
    return {
      type: 'saisie',
      enonce: 'Quelle est la moitié de ' + n + ' ?',
      reponse: demi, reponseTexte: String(demi),
      aide: 'Partage ' + n + ' en 2 parts égales.',
      meta: { kind: 'moitie', nombres: [n] }
    };
  }

  /* ---------- FRACTIONS ---------- */

  const pgcd = (a, b) => (b ? pgcd(b, a % b) : a);
  const fr = (n, d) => n + '/' + d;
  const egalesVal = (n1, d1, n2, d2) => n1 * d2 === n2 * d1;
  const NOMS_FRAC = { 2: 'la moitié', 3: 'le tiers', 4: 'le quart' };

  function genFractions(rng, d) {
    const dens = d.dens || [2, 3, 4];
    const kind = choisir(rng, d.types || ['lirepart']);
    const den = choisir(rng, dens);

    if (kind === 'lirepart') {
      const dd = den < 2 ? 2 : den;
      const nn = entier(rng, 1, dd - 1);
      const cand = [];
      [[dd - nn, dd], [nn, dd + 1], [nn, dd - 1], [nn + 1, dd], [nn - 1, dd], [dd, nn], [nn, dd * 2], [nn, dd === 100 ? 10 : dd + 2]].forEach((p) => {
        if (p[0] >= 1 && p[1] >= 2 && p[0] < p[1] && !egalesVal(p[0], p[1], nn, dd)) cand.push(p);
      });
      const out = [[nn, dd]];
      const vus = new Set([fr(nn, dd)]);
      melanger(rng, cand).forEach((p) => { if (out.length < 4 && !vus.has(fr(p[0], p[1]))) { vus.add(fr(p[0], p[1])); out.push(p); } });
      for (let t = 0; out.length < 4 && t < 80; t++) {
        const m = entier(rng, 1, dd + 3), q = entier(rng, 2, dd + 3);
        if (m < q && !vus.has(fr(m, q)) && !egalesVal(m, q, nn, dd)) { vus.add(fr(m, q)); out.push([m, q]); }
      }
      return {
        type: 'qcm',
        enonce: 'Quelle fraction de la figure est colorée ?',
        visuel: { type: 'part', n: nn, d: dd },
        choix: melanger(rng, out).map((p) => fr(p[0], p[1])), reponse: fr(nn, dd),
        aide: 'Le bas dit en combien de parts égales la figure est coupée, le haut dit combien sont colorées.',
        meta: { kind, nombres: [nn, dd] }
      };
    }
    if (kind === 'quantite' || kind === 'quantite2') {
      const qmax = d.qmax || 40;
      const dd = den > 12 ? 4 : den;
      const nn = kind === 'quantite2' && dd > 2 ? entier(rng, 2, dd - 1) : 1;
      const q = dd * entier(rng, 1, Math.max(1, Math.floor(qmax / dd)));
      const reponse = (q / dd) * nn;
      const nom = nn === 1 && NOMS_FRAC[dd] ? NOMS_FRAC[dd] : fr(nn, dd);
      return {
        type: 'saisie',
        enonce: 'Calcule ' + nom + ' de ' + q + '.',
        reponse, reponseTexte: String(reponse),
        aide: 'Partage ' + q + ' en ' + dd + ' parts égales' + (nn > 1 ? ', puis prends ' + nn + ' parts.' : '.'),
        meta: { kind, nombres: [q, dd] }
      };
    }
    if (kind === 'ecriture') {
      const dd = den === 100 ? 100 : 10;
      const dec = dd === 100 ? 2 : 1;
      const nn = entier(rng, 1, dd - 1);
      if (rng() < 0.5) {
        return {
          type: 'saisie',
          enonce: 'Écris ' + fr(nn, dd) + ' sous forme de nombre décimal.',
          reponse: valeurReelle(nn, dec), reponseTexte: fmt(nn, dec),
          aide: fr(1, dd) + ' = ' + fmt(1, dec),
          meta: { kind, nombres: [nn, dd] }
        };
      }
      return {
        type: 'saisie',
        enonce: 'Complète avec une fraction.',
        expression: fmt(nn, dec) + ' = {?}/' + dd,
        voix: fmt(nn, dec) + ' égale combien sur ' + dd,
        reponse: nn, reponseTexte: String(nn),
        aide: 'Combien de ' + (dd === 100 ? 'centièmes' : 'dixièmes') + ' dans ' + fmt(nn, dec) + ' ?',
        meta: { kind, nombres: [nn, dd] }
      };
    }
    if (kind === 'equivalente') {
      const b = den > 12 ? 4 : den;
      const a = entier(rng, 1, b - 1);
      const g = pgcd(a, b);
      const a0 = a / g, b0 = b / g; // fraction de base irréductible
      const ms = [2, 3, 4, 5].filter((m) => b0 * m <= 100 && m * b0 <= 12);
      const m = choisir(rng, ms.length ? ms : [2]);
      const A = a0 * m, B = b0 * m;
      if (rng() < 0.5) {
        const m2 = choisir(rng, [2, 3, 4].filter((x) => x !== m));
        return {
          type: 'saisie',
          enonce: 'Trouve la fraction égale.',
          expression: fr(a0, b0) + ' = {?}/' + (b0 * m2),
          voix: a0 + ' sur ' + b0 + ' égale combien sur ' + (b0 * m2),
          reponse: a0 * m2, reponseTexte: String(a0 * m2),
          aide: 'On multiplie le haut et le bas par ' + m2 + '.',
          meta: { kind, nombres: [a0, b0, b0 * m2] }
        };
      }
      return {
        type: 'saisie',
        enonce: 'Trouve la fraction égale.',
        expression: fr(A, B) + ' = {?}/' + b0,
        voix: A + ' sur ' + B + ' égale combien sur ' + b0,
        reponse: a0, reponseTexte: String(a0),
        aide: 'On divise le haut et le bas par ' + m + '.',
        meta: { kind, nombres: [A, B, b0] }
      };
    }
    if (kind === 'compare1') {
      const dd = den < 2 ? 2 : den;
      const nn = rng() < 0.2 ? dd : entier(rng, 1, 2 * dd - 1);
      const rep = nn < dd ? '<' : nn > dd ? '>' : '=';
      return {
        type: 'qcm', ordreFixe: true,
        enonce: 'Compare cette fraction à 1.',
        expression: fr(nn, dd) + ' {?} 1',
        voix: nn + ' sur ' + dd + ' ... 1. Plus petit, égal ou plus grand ?',
        choix: ['<', '=', '>'], reponse: rep,
        aide: 'Une fraction est plus petite que 1 si le haut est plus petit que le bas.',
        meta: { kind, nombres: [nn, dd] }
      };
    }
    // cmpden : même dénominateur
    const dd = den < 3 ? 4 : den;
    let a = entier(rng, 1, dd + 2), b = rng() < 0.1 ? a : entier(rng, 1, dd + 2);
    const rep = a < b ? '<' : a > b ? '>' : '=';
    return {
      type: 'qcm', ordreFixe: true,
      enonce: 'Compare ces deux fractions.',
      expression: fr(a, dd) + ' {?} ' + fr(b, dd),
      voix: a + ' sur ' + dd + ' ... ' + b + ' sur ' + dd + '. Plus petit, égal ou plus grand ?',
      choix: ['<', '=', '>'], reponse: rep,
      aide: 'Même dénominateur : la plus grande fraction a le plus grand numérateur.',
      meta: { kind: 'cmpden', nombres: [a, b, dd] }
    };
  }

  /* ---------- DÉCIMAUX ---------- */

  function genDecimaux(rng, d) {
    const dec = d.dec || 1;
    const kind = choisir(rng, d.types || ['chiffre']);
    const ip = entier(rng, d.intmin || 0, d.intmax);
    let frac = 0;
    for (let i = 0; i < dec; i++) frac = frac * 10 + (i === dec - 1 ? entier(rng, 1, 9) : entier(rng, 0, 9));
    const X = ip * p10(dec) + frac;
    const txt = fmt(X, dec);
    const digs = String(frac).padStart(dec, '0').split('').map(Number); // digs[0] = dixièmes

    if (kind === 'ecriture') {
      const morceaux = [ip + ' ' + (ip > 1 ? 'unités' : 'unité')];
      digs.forEach((c, j) => morceaux.push(c + ' ' + nomDec(j + 1, c)));
      const dit = morceaux.slice(0, -1).join(', ') + ' et ' + morceaux[morceaux.length - 1];
      return {
        type: 'saisie',
        enonce: 'Écris ce nombre : ' + dit + '.',
        reponse: valeurReelle(X, dec), reponseTexte: txt,
        aide: 'La virgule sépare les unités des dixièmes.',
        meta: { kind, nombres: [valeurReelle(X, dec)] }
      };
    }
    if (kind === 'valeur') {
      const cand = [];
      digs.forEach((c, j) => { if (c !== 0 && (String(ip) + digs.join('')).split(String(c)).length - 1 === 1) cand.push(j); });
      if (cand.length) {
        const j = choisir(rng, cand), c = digs[j];
        const bonne = c * p10(-(j + 1));
        const brutes = [];
        for (let p = -dec; p <= 1; p++) brutes.push(Number((c * p10(p)).toFixed(dec)));
        const set = new Set([Number(bonne.toFixed(dec))]);
        melanger(rng, brutes).forEach((v) => { if (set.size < 4) set.add(v); });
        const aff = (v) => fmtCourt(Math.round(v * p10(dec)), dec);
        return {
          type: 'qcm',
          enonce: 'Dans ' + txt + ', quelle est la valeur du chiffre ' + c + ' ?',
          choix: melanger(rng, Array.from(set)).map(aff), reponse: aff(bonne),
          aide: 'Le premier chiffre après la virgule compte les dixièmes, le deuxième les centièmes.',
          meta: { kind, nombres: [valeurReelle(X, dec)] }
        };
      }
    }
    if (kind === 'combien') {
      const p = entier(rng, 1, dec);
      const bonne = Math.floor(X / p10(dec - p));
      return {
        type: 'saisie',
        enonce: 'Dans ' + txt + ', combien y a-t-il de ' + DECS[p - 1] + ' en tout ?',
        reponse: bonne, reponseTexte: fmt(bonne),
        aide: '1 unité = ' + p10(p) + ' ' + DECS[p - 1] + '.',
        meta: { kind, nombres: [valeurReelle(X, dec)] }
      };
    }
    if (kind === 'fraction') {
      if (rng() < 0.5) {
        return {
          type: 'saisie',
          enonce: 'Complète avec une fraction.',
          expression: txt + ' = {?}/' + p10(dec),
          voix: txt + ' égale combien sur ' + p10(dec),
          reponse: X, reponseTexte: fmt(X),
          aide: 'Combien de ' + DECS[dec - 1] + ' dans ' + txt + ' ?',
          meta: { kind, nombres: [valeurReelle(X, dec)] }
        };
      }
      return {
        type: 'saisie',
        enonce: 'Écris ' + fr(X, p10(dec)) + ' sous forme de nombre décimal.',
        reponse: valeurReelle(X, dec), reponseTexte: txt,
        aide: fr(1, p10(dec)) + ' = ' + fmt(1, dec),
        meta: { kind, nombres: [X, p10(dec)] }
      };
    }
    if (kind === 'decomposer') {
      const parts = [];
      if (ip > 0) parts.push({ t: fmt(ip), v: ip });
      digs.forEach((c, j) => {
        if (c) {
          const v = Number((c * p10(-(j + 1))).toFixed(dec));
          parts.push({ t: fmtCourt(Math.round(v * p10(dec)), dec), v });
        }
      });
      const idx = [];
      parts.forEach((p, i) => { if (p.v < 1) idx.push(i); });
      if (parts.length >= 2 && idx.length) {
        const trou = choisir(rng, idx);
        return {
          type: 'saisie',
          enonce: 'Complète la décomposition.',
          expression: txt + ' = ' + parts.map((p, i) => (i === trou ? '{?}' : p.t)).join(' + '),
          voix: txt + ' égale ' + parts.map((p, i) => (i === trou ? 'combien' : p.t)).join(' plus '),
          reponse: parts[trou].v, reponseTexte: parts[trou].t,
          aide: 'Chaque chiffre garde sa valeur : dixièmes, centièmes...',
          meta: { kind, nombres: [valeurReelle(X, dec)] }
        };
      }
    }
    // chiffre : unités ou rang décimal
    const rangs = ['unités'].concat(DECS.slice(0, dec));
    const choix = entier(rng, 0, dec);
    const bonne = choix === 0 ? ip % 10 : digs[choix - 1];
    const ds = Array.from(new Set(String(ip % 10).split('').map(Number).concat(digs)));
    const vals = completer(rng, bonne, ds, 4, (x) => x >= 0 && x <= 9, () => entier(rng, 0, 9));
    return {
      type: 'qcm',
      enonce: 'Dans ' + txt + ', quel est le chiffre des ' + rangs[choix] + ' ?',
      choix: vals.map(String), reponse: String(bonne),
      aide: 'Après la virgule : dixièmes, puis centièmes, puis millièmes.',
      meta: { kind: 'chiffre', nombres: [valeurReelle(X, dec)] }
    };
  }

  /* ---------- API ---------- */

  const GENERATEURS = {
    valeur: genValeur, decomposer: genDecomposer, comparer: genComparer, ranger: genRanger,
    encadrer: genEncadrer, droite: genDroite, moitie: genMoitie, fractions: genFractions, decimaux: genDecimaux
  };

  /** Thèmes, dans l'ordre d'affichage (id de mission = 'nombres-' + cle). */
  const THEMES = [
    { cle: 'valeur', id: 'nombres-valeur', emoji: '🔢' },
    { cle: 'decomposer', id: 'nombres-decomposer', emoji: '🧩' },
    { cle: 'comparer', id: 'nombres-comparer', emoji: '⚖️' },
    { cle: 'ranger', id: 'nombres-ranger', emoji: '🪜' },
    { cle: 'encadrer', id: 'nombres-encadrer', emoji: '↔️' },
    { cle: 'droite', id: 'nombres-droite', emoji: '📏' },
    { cle: 'moitie', id: 'nombres-moitie', emoji: '🍰' },
    { cle: 'fractions', id: 'nombres-fractions', emoji: '🍕' },
    { cle: 'decimaux', id: 'nombres-decimaux', emoji: '🎚️' }
  ];

  const cleDe = (missionId) => String(missionId).replace(/^nombres-/, '');

  /** Palier (1..n) d'une mission du programme, ou null si absente / inactive. */
  function definitionPalier(programme, missionId, palier) {
    const def = programme && programme.nombres && programme.nombres[missionId];
    if (!def || def.actif === false || !def.niveaux || !def.niveaux.length) return null;
    const i = Math.min(def.niveaux.length, Math.max(1, palier | 0)) - 1;
    return def.niveaux[i];
  }

  /** Une question pour (programme, mission, palier). `rng` par défaut : Math.random. */
  function generer(programme, missionId, palier, rng) {
    rng = rng || Math.random;
    const d = definitionPalier(programme, missionId, palier);
    const g = GENERATEURS[cleDe(missionId)];
    if (!d || !g) return null;
    let q = null;
    for (let t = 0; t < 20 && !q; t++) q = g(rng, d);
    if (!q) return null;
    q.meta = Object.assign({ mission: missionId, palier: palier }, q.meta || {});
    if (!q.voix) q.voix = q.expression ? q.enonce + ' ' + q.expression.replace(/\{\?\}/g, 'combien') : q.enonce;
    return q;
  }

  const Generateur = { generer, definitionPalier, GENERATEURS, THEMES, fmt, fmtCourt, valeurReelle };
  global.GenerateurNombres = Generateur;
  if (typeof module !== 'undefined' && module.exports) module.exports = Generateur;
})(typeof window !== 'undefined' ? window : globalThis);
