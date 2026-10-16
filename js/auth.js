/**
 * Auth — hachage des codes (SHA-256 + sel), limitation anti-devinette, garde de page.
 * Tout reste local : aucun code ni donnée n'est envoyé à un serveur.
 * Charger avant profils.js.
 */
(function (global) {
  'use strict';

  const CLE_ESSAIS = 'mathemagie-auth-essais';
  const MAX_ESSAIS = 3;
  const PAUSE_MS = 30000;

  // --- SHA-256 pur JS (secours si crypto.subtle est indisponible) ---
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function sha256Octets(octets) {
    const l = octets.length;
    const total = (((l + 9) + 63) >> 6) << 6;
    const m = new Uint8Array(total);
    m.set(octets);
    m[l] = 0x80;
    const dv = new DataView(m.buffer);
    dv.setUint32(total - 8, Math.floor((l * 8) / 4294967296));
    dv.setUint32(total - 4, (l * 8) >>> 0);
    const h = new Uint32Array([
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);
    const w = new Uint32Array(64);
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < total; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (hh + S1 + ch + K[t] + w[t]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh;
    }
    return Array.from(h).map(x => x.toString(16).padStart(8, '0')).join('');
  }

  function versOctets(texte) {
    return new TextEncoder().encode(texte);
  }

  const Auth = {
    MAX_ESSAIS,
    PAUSE_MS,

    /** Horloge injectable (tests). */
    maintenant() { return Date.now(); },

    codeValide(code) {
      return typeof code === 'string' && /^\d{4}$/.test(code);
    },

    genererSel() {
      const octets = new Uint8Array(16);
      const c = global.crypto;
      if (c && c.getRandomValues) {
        c.getRandomValues(octets);
      } else {
        for (let i = 0; i < 16; i++) octets[i] = Math.floor(Math.random() * 256);
      }
      return Array.from(octets).map(x => x.toString(16).padStart(2, '0')).join('');
    },

    /** SHA-256(sel + ':' + code) en hexadécimal. */
    async hacher(code, sel) {
      const octets = versOctets(sel + ':' + code);
      const c = global.crypto;
      if (c && c.subtle && c.subtle.digest) {
        try {
          const buf = await c.subtle.digest('SHA-256', octets);
          return Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, '0')).join('');
        } catch (e) { /* repli ci-dessous */ }
      }
      return sha256Octets(octets);
    },

    /** Crée l'empreinte à stocker : { sel, hash }. */
    async creerEmpreinte(code) {
      const sel = this.genererSel();
      return { sel, hash: await this.hacher(code, sel) };
    },

    async verifierEmpreinte(code, empreinte) {
      if (!empreinte || !empreinte.sel || !empreinte.hash || !this.codeValide(code)) return false;
      const h = await this.hacher(code, empreinte.sel);
      // comparaison en temps constant
      if (h.length !== empreinte.hash.length) return false;
      let diff = 0;
      for (let i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ empreinte.hash.charCodeAt(i);
      return diff === 0;
    },

    // --- Limitation anti-devinette : 3 échecs → pause de 30 s (persistée) ---

    _lireEssais() {
      try {
        const o = JSON.parse(global.localStorage.getItem(CLE_ESSAIS));
        return o && typeof o === 'object' ? o : {};
      } catch (e) { return {}; }
    },

    _ecrireEssais(o) {
      try { global.localStorage.setItem(CLE_ESSAIS, JSON.stringify(o)); } catch (e) { /* ignore */ }
    },

    /** { bloque, restantMs, essaisRestants } pour une clé (ex: "profil:Léa", "parent"). */
    etatLimite(cle) {
      const e = this._lireEssais()[cle];
      const now = this.maintenant();
      if (e && e.bloqueJusqua && e.bloqueJusqua > now) {
        return { bloque: true, restantMs: e.bloqueJusqua - now, essaisRestants: 0 };
      }
      const echecs = e && !(e.bloqueJusqua && e.bloqueJusqua <= now) ? (e.echecs || 0) : 0;
      return { bloque: false, restantMs: 0, essaisRestants: MAX_ESSAIS - echecs };
    },

    enregistrerEchec(cle) {
      const tous = this._lireEssais();
      const now = this.maintenant();
      let e = tous[cle] || { echecs: 0, bloqueJusqua: 0 };
      if (e.bloqueJusqua && e.bloqueJusqua <= now) e = { echecs: 0, bloqueJusqua: 0 };
      e.echecs += 1;
      if (e.echecs >= MAX_ESSAIS) e.bloqueJusqua = now + PAUSE_MS;
      tous[cle] = e;
      this._ecrireEssais(tous);
      return this.etatLimite(cle);
    },

    reinitialiserLimite(cle) {
      const tous = this._lireEssais();
      if (tous[cle]) {
        delete tous[cle];
        this._ecrireEssais(tous);
      }
    },

    // --- Garde de page ---

    /** Redirige vers connexion.html si aucun profil complet n'est connecté. */
    garde(basePath) {
      const gp = global.gestionnaireProfils;
      if (!gp) return false;
      return gp.verifierAccesOuRediriger(basePath || '');
    }
  };

  global.Auth = Auth;
  if (typeof module !== 'undefined' && module.exports) module.exports = Auth;
})(typeof window !== 'undefined' ? window : globalThis);
