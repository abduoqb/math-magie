/* Test Node de L’Horloge Enchantée : node jeux/horloge/test-horloge.js
   Pour chaque classe × difficulté × type : réponse recalculée à partir du texte, unicité des choix, bornes. */
'use strict';
const H = require('./horloge.js');

const NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2'];
const TIRAGES = 400;
let erreurs = 0, total = 0;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function echec(msg, m) {
  erreurs++;
  if (erreurs <= 25) console.error('ECHEC : ' + msg + (m ? '\n   ' + JSON.stringify({ k: m.kind, e: m.enonce, c: m.consigne, ch: m.choix, b: m.bonne, d: m.donnees }) : ''));
}
function verifie(cond, msg, m) { if (!cond) echec(msg, m); }

/* ---- analyse indépendante des textes ---- */
function parseHeure(txt) { // minutes depuis minuit (mod 1440), ou null
  let r;
  if ((r = /^(midi|minuit)(?: (et demi|et quart|moins le quart))?$/.exec(txt))) {
    const base = r[1] === 'midi' ? 720 : 0;
    return (base + (r[2] === 'et demi' ? 30 : r[2] === 'et quart' ? 15 : r[2] === 'moins le quart' ? -15 : 0) + 1440) % 1440;
  }
  if ((r = /^(\d+) heures?$/.exec(txt))) return +r[1] * 60;
  if ((r = /^(\d+) (?:h|heures?) et (quart|demie)$/.exec(txt))) return +r[1] * 60 + (r[2] === 'quart' ? 15 : 30);
  if ((r = /^(\d+) (?:h|heures?) moins le quart$/.exec(txt))) return +r[1] * 60 - 15;
  if ((r = /^(\d+) h(?: (\d\d))?$/.exec(txt))) return +r[1] * 60 + (r[2] ? +r[2] : 0);
  return null;
}
function parseDuree(txt) {
  const r = /^(?:(\d+) h)?(?: ?(\d+) min(?:utes)?)?$/.exec(txt);
  if (!r || (r[1] === undefined && r[2] === undefined)) return null;
  return (r[1] ? +r[1] * 60 : 0) + (r[2] ? +r[2] : 0);
}
function parseHeureDuree(txt) { // « 2 heures », « 1 heure »
  const r = /^(\d+) heures?$/.exec(txt);
  return r ? +r[1] * 60 : parseDuree(txt);
}

const MINS_ATTENDUES = {
  cp: [[0], [0, 30], [0, 30]],
  ce1: [[0, 30], [0, 15, 30, 45], [0, 15, 30, 45]]
};
function tousMinutes(a, b, p) { const r = []; for (let x = a; x <= b; x += p) r.push(x); return r; }

/* ---- vérifications d’une manche ---- */
function verifierManche(m, niveau, d) {
  verifie(m && typeof m.consigne === 'string' && m.consigne.length > 0, 'consigne vide', m);
  verifie(!/undefined|NaN|null/.test(JSON.stringify([m.consigne, m.enonce, m.choix || [], m.indice])), 'texte invalide', m);
  verifie(typeof m.cle === 'string', 'cle manquante', m);

  if (m.type === 'regler') {
    const p = H.parseCible ? null : null;
    const mn = parseHeure(m.texteCible);
    verifie(mn !== null, 'texte cible illisible : ' + m.texteCible, m);
    verifie(mn !== null && mn % 720 === m.cible.t, 'cible différente du texte', m);
    verifie(m.horloge.t !== m.cible.t, 'départ = cible', m);
    verifie(m.horloge.t >= 0 && m.horloge.t < 720 && m.cible.t >= 0 && m.cible.t < 720, 't hors bornes', m);
    const pas = m.pas;
    const min = pas.length ? Math.min(...pas) : 60;
    verifie(((m.cible.t - m.horloge.t) % min + min) % min === 0, 'cible inatteignable avec les boutons', m);
    if (niveau === 'cp' || niveau === 'ce1') verifie(!/\d h \d\d$/.test(m.texteCible) || d === 2, 'format numérique trop tôt', m);
    verifie(m.consigne.indexOf(m.texteCible) > 0, 'consigne sans heure', m);
    verifie(H.indiceRegler(m.horloge.t, m.cible.t).length > 5, 'indice vide', m);
    return;
  }

  // QCM
  verifie(Array.isArray(m.choix) && m.choix.length === 4, '4 choix attendus', m);
  verifie(new Set(m.choix).size === 4, 'choix en double', m);
  verifie(Number.isInteger(m.bonne) && m.bonne >= 0 && m.bonne < 4, 'index bonne invalide', m);
  verifie(m.choix.filter(c => c === m.choix[m.bonne]).length === 1, 'bonne réponse non unique', m);
  verifie(m.indice && m.indice.length > 5, 'indice vide', m);

  if (m.type === 'lire') {
    const ts = m.choix.map(parseHeure);
    verifie(ts.every(x => x !== null), 'choix illisible', m);
    const vals = ts.map(x => ((x % 720) + 720) % 720);
    verifie(new Set(vals).size === 4, 'deux choix lisent la même heure', m);
    verifie(vals[m.bonne] === m.horloge.t, 'bonne réponse ≠ lecture de l’horloge (t=' + m.horloge.t + ')', m);
    const mins = ((ts[m.bonne] % 60) + 60) % 60;
    if (niveau === 'cp' || niveau === 'ce1') {
      const pm = m.donnees.pm;
      const permis = pm ? [0, 30] : MINS_ATTENDUES[niveau][d];
      verifie(permis.indexOf(mins) >= 0, 'minutes hors programme : ' + mins, m);
      m.choix.forEach(c => {
        const mm = ((parseHeure(c) % 60) + 60) % 60;
        verifie(permis.indexOf(mm) >= 0, 'distracteur hors programme : ' + c, m);
        if (niveau === 'cp') verifie(/^(\d+) heures?( et demie)?$/.test(c), 'format CP : ' + c, m);
        if (niveau === 'ce1' && !pm) verifie(/^(\d+) (heures?|h)( et quart| et demie| moins le quart)?$/.test(c), 'format CE1 : ' + c, m);
      });
    }
    if (niveau === 'cp') verifie(!m.donnees.pm, 'CP en 24 h', m);
    if (niveau === 'ce2' || niveau === 'cm1' || niveau === 'cm2') m.choix.forEach(c => verifie(/^\d+ h( \d\d)?$/.test(c), 'format num : ' + c, m));
    if (m.donnees.pm) m.choix.forEach(c => verifie(parseHeure(c) >= 720 && parseHeure(c) < 1440, 'pm hors 12-23 h : ' + c, m));
    else m.choix.filter(c => !/moins le quart/.test(c)).forEach(c => verifie(parseHeure(c) >= 60 && parseHeure(c) <= 720 + 59, 'am hors 1-12 h : ' + c, m));
    if (niveau === 'ce2' && d === 0) verifie(mins % 5 === 0, 'CE2 facile : minutes par 5', m);
    verifie(m.horloge.t === (m.donnees.h12 % 12) * 60 + m.donnees.m, 'donnees ≠ horloge', m);
    return;
  }

  // durées
  verifie(['ce2', 'cm1', 'cm2'].indexOf(niveau) >= 0, 'durée avant le CE2', m);
  const e = m.enonce;
  let r, attendu, valeur;
  switch (m.kind) {
    case 'ecoule': {
      const t = [...e.matchAll(/(\d+) h(?: (\d\d))?/g)].map(x => +x[1] * 60 + (x[2] ? +x[2] : 0));
      verifie(t.length === 2 && t[1] > t[0], 'heures illisibles', m);
      attendu = t[1] - t[0];
      valeur = parseDuree;
      if (niveau === 'ce2') verifie(t[1] <= 720 && t[0] >= 60, 'CE2 : hors 12 h', m);
      else verifie(t[1] <= 22 * 60 && t[0] >= 6 * 60, 'CM : hors journée', m);
      const max = { ce2: 240, cm1: 360, cm2: 600 }[niveau];
      verifie(attendu >= 30 - 15 && attendu <= max, 'durée hors bornes : ' + attendu, m);
      if (niveau === 'ce2' && d === 0) verifie(attendu % 30 === 0 && t[0] % 30 === 0, 'CE2 facile : demi-heures', m);
      break;
    }
    case 'dans': {
      r = /Dans (?:(\d+) (?:h|heures?))?(?: ?(\d+) minutes)?,/.exec(e);
      verifie(!!r, 'phrase dans illisible : ' + e, m);
      const X = (r[1] ? +r[1] * 60 : 0) + (r[2] ? +r[2] : 0);
      verifie(X > 0 && X <= 180, 'delta hors bornes', m);
      attendu = (m.horloge.t + X) % 720;
      valeur = txt => { const v = parseHeure(txt); return v === null ? null : ((v % 720) + 720) % 720; };
      verifie(/^\d+ h( \d\d)?$/.test(m.choix[m.bonne]) && parseHeure(m.choix[m.bonne]) <= 12 * 60 + 59 && parseHeure(m.choix[m.bonne]) >= 60, 'format dans', m);
      break;
    }
    case 'conv24': {
      r = /^Il est (.+)\. Comment/.exec(e);
      verifie(!!r, 'conv24 illisible', m);
      const bonneTxt = m.choix[m.bonne];
      if (m.donnees.sens === 'a') {
        const h24 = parseHeure(r[1]);
        const rr = /^(\d+ h(?: \d\d)?) (de l’après-midi|du soir)$/.exec(bonneTxt);
        verifie(!!rr, 'format 12 h + période', m);
        const h12 = parseHeure(rr[1]);
        verifie(h12 + 720 === h24, 'conv 24→12 faux', m);
        verifie(rr[2] === (h24 < 18 * 60 ? 'de l’après-midi' : 'du soir'), 'mauvaise période', m);
        m.choix.forEach(c => verifie(/^\d+ h(?: \d\d)? (de l’après-midi|du soir|du matin)$/.test(c), 'format choix conv24 a : ' + c, m));
        verifie(new Set(m.choix).size === 4, 'doublon', m);
      } else {
        const rr = /^(\d+ h(?: \d\d)?) (de l’après-midi|du soir)$/.exec(r[1]);
        verifie(!!rr, 'énoncé conv24 b illisible', m);
        verifie(parseHeure(bonneTxt) === parseHeure(rr[1]) + 720, 'conv 12→24 faux', m);
        m.choix.forEach(c => { const v = parseHeure(c); verifie(v !== null && v <= 23 * 60 + 59, 'choix 24 h invalide : ' + c, m); });
      }
      if (niveau === 'ce2') verifie(d === 2, 'conv24 CE2 seulement en difficile', m);
      return;
    }
    case 'conv_h': {
      r = /^(\d+) h (\d+) min,/.exec(e);
      attendu = +r[1] * 60 + +r[2];
      valeur = txt => { const q = /^(\d+) min$/.exec(txt); return q ? +q[1] : null; };
      verifie(+r[2] < 60 && +r[1] <= 5, 'conv_h hors bornes', m);
      break;
    }
    case 'conv_min': {
      r = /^(\d+) min,/.exec(e);
      attendu = +r[1];
      valeur = parseDuree;
      verifie(attendu >= 60 && attendu <= 8 * 60 + 59, 'conv_min hors bornes', m);
      break;
    }
    case 'train': {
      r = /part à (.+)\. Il roule pendant (.+)\. À/.exec(e);
      verifie(!!r, 'train illisible', m);
      const a = parseHeure(r[1]), D = parseDuree(r[2]);
      attendu = a + D;
      verifie(attendu < 1440 && a >= 6 * 60, 'train hors journée', m);
      valeur = parseHeure;
      break;
    }
    case 'depart': {
      r = /arrive à (.+) après (.+) de trajet/.exec(e);
      verifie(!!r, 'départ illisible', m);
      attendu = parseHeure(r[1]) - parseDuree(r[2]);
      verifie(attendu >= 6 * 60, 'départ trop tôt', m);
      valeur = parseHeure;
      verifie(niveau === 'cm2', 'depart hors CM2', m);
      break;
    }
    case 'fraction': {
      const FR = { '1/10': 6, '1/5': 12, '1/4': 15, '1/3': 20, '2/5': 24, '1/2': 30, '3/5': 36, '2/3': 40, '3/4': 45, '4/5': 48 };
      verifie(niveau === 'cm2', 'fraction hors CM2', m);
      if (m.donnees.sens === 'a') {
        r = /^(\d+) minutes, c’est quelle fraction/.exec(e);
        attendu = +r[1];
        valeur = txt => { const q = /^(\d+)\/(\d+) h$/.exec(txt); return q ? +q[1] * 60 / +q[2] : null; };
      } else {
        r = /^(\d+)\/(\d+) d’heure, c’est combien/.exec(e);
        attendu = +r[1] * 60 / +r[2];
        valeur = txt => { const q = /^(\d+) min$/.exec(txt); return q ? +q[1] : null; };
      }
      verifie(Object.values(FR).indexOf(attendu) >= 0, 'fraction hors table', m);
      break;
    }
    case 'decimal': {
      verifie(niveau === 'cm2', 'decimal hors CM2', m);
      if (m.donnees.sens === 'a') {
        r = /^(\d+,\d+) h, c’est combien/.exec(e);
        attendu = Math.round(parseFloat(r[1].replace(',', '.')) * 60);
        valeur = parseDuree;
      } else {
        r = /^(.+), c’est combien en heures décimales/.exec(e);
        attendu = parseDuree(r[1].replace(/ minutes$/, ' min'));
        valeur = txt => { const q = /^(\d+,\d+) h$/.exec(txt); return q ? Math.round(parseFloat(q[1].replace(',', '.')) * 60) : null; };
      }
      if (d === 1) verifie([30, 15, 45].indexOf(attendu % 60) >= 0, 'decimal moyen : 0,5 / 0,25 / 0,75', m);
      break;
    }
    default: echec('kind inconnu ' + m.kind, m); return;
  }
  const vals = m.choix.map(valeur);
  verifie(vals.every(v => v !== null), 'choix illisible (' + m.kind + ')', m);
  verifie(new Set(vals).size === 4, 'deux choix de même valeur (' + m.kind + ')', m);
  verifie(vals[m.bonne] === attendu, 'mauvaise réponse (' + m.kind + ') : attendu ' + attendu + ' obtenu ' + vals[m.bonne], m);
}

/* ---- boucle principale ---- */
const attendusTypes = { cp: ['lire', 'regler'], ce1: ['lire', 'regler'], ce2: ['lire', 'regler', 'duree'], cm1: ['lire', 'regler', 'duree'], cm2: ['lire', 'regler', 'duree'] };
const kindsVus = {};
NIVEAUX.forEach(niveau => {
  [0, 1, 2].forEach(d => {
    const rng = mulberry32(1000 * NIVEAUX.indexOf(niveau) + 10 * d + 7);
    attendusTypes[niveau].forEach(type => {
      for (let i = 0; i < TIRAGES; i++) {
        total++;
        try {
          const m = H.genererManche(niveau, d, type, rng);
          verifierManche(m, niveau, d);
          const cle = niveau + '/' + d + '/' + m.kind;
          kindsVus[cle] = (kindsVus[cle] || 0) + 1;
        } catch (err) { echec('exception ' + niveau + ' d' + d + ' ' + type + ' : ' + err.message); }
      }
    });
    // parties complètes
    for (let i = 0; i < 100; i++) {
      total++;
      try {
        const p = H.genererPartie(niveau, d, rng);
        verifie(p.length === H.NB_MANCHES, 'partie de ' + p.length + ' manches');
        verifie(new Set(p.map(x => x.cle)).size === p.length, 'questions répétées dans une partie', p[0]);
        verifie(p.map(x => x.type).join() === H.SEQUENCES[niveau].join(), 'séquence de types incorrecte');
        p.forEach(m => verifierManche(m, niveau, d));
      } catch (err) { echec('exception partie ' + niveau + ' d' + d + ' : ' + err.message); }
    }
  });
});

/* ---- outils purs ---- */
total++;
verifie(H.texteHeure(3, 0, 'cp', false) === '3 heures', 'cp pile');
verifie(H.texteHeure(3, 30, 'cp', false) === '3 heures et demie', 'cp demie');
verifie(H.texteHeure(1, 0, 'cp', false) === '1 heure', 'cp 1 heure');
verifie(H.texteHeure(3, 15, 'quart', false) === '3 h et quart', 'et quart');
verifie(H.texteHeure(3, 45, 'quart', false) === '4 h moins le quart', 'moins le quart');
verifie(H.texteHeure(12, 0, 'cp', true) === 'midi', 'midi');
verifie(H.texteHeure(0, 30, 'quart', true) === 'minuit et demi', 'minuit et demi');
verifie(H.texteHeure(11, 45, 'quart', true) === 'midi moins le quart', 'midi moins le quart');
verifie(H.texteHeure(14, 35, 'num24') === '14 h 35' && H.texteHeure(14, 5, 'num12') === '2 h 05', 'num');
verifie(H.fmtDuree(85) === '1 h 25 min' && H.fmtDuree(120) === '2 h' && H.fmtDuree(45) === '45 min', 'fmtDuree');
const a = H.anglesAiguilles(225); // 3 h 45
verifie(a.minute === 270 && a.heure === 112.5, 'angles');
verifie(H.reglerParAngle(180, 90, 'minute', 5) === 195, 'angle minute');       // 3 h 00 -> 3 h 15
verifie(H.reglerParAngle(235, 10, 'minute', 5) === 242 - 2 || H.reglerParAngle(235, 10, 'minute', 5) === 240, 'angle minute passage');
verifie(H.reglerParAngle(235, 60, 'heure', 0) === 120 + 55, 'angle heure');
verifie(H.etoiles(4) === 0 && H.etoiles(5) === 1 && H.etoiles(7) === 2 && H.etoiles(8) === 3, 'étoiles');

/* ---- bilan ---- */
console.log('Types de manches vus (niveau/difficulté/type) :');
console.log(Object.keys(kindsVus).sort().map(k => k + '=' + kindsVus[k]).join('  '));
console.log(total + ' lots de tirages, ' + erreurs + ' erreur(s).');
if (erreurs) process.exit(1);
console.log('OK');
