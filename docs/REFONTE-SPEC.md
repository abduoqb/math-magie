# Refonte Mathémagie — Spec de référence (contrat entre agents)

Public: deux enfants (CP et CM1) sur la même tablette/PC, puis tout élève de CP à CM2.
Site statique JS vanilla (pas de build), déployé sur Vercel. **Ne pas introduire de framework ni de backend.**

## Décisions (figées)

1. **Authentification enfant = locale, sans serveur ni e-mail.** Profil = prénom + avatar + **code secret à 4 chiffres** (pavé numérique géant) + **niveau de classe**. Pas de donnée personnelle envoyée à un tiers (enfants mineurs). Le code est stocké haché (SHA-256 + sel par profil via WebCrypto). Mode « parent » : un code parent optionnel pour réinitialiser un code oublié / supprimer un profil.
2. **Niveaux: `cp`, `ce1`, `ce2`, `cm1`, `cm2`.** Le niveau est fixé au profil (modifiable via le mode parent). Tout le contenu (calcul, géométrie, jeux éducatifs) est filtré/paramétré par niveau selon les **programmes officiels de l'Éducation nationale** (Cycle 2: CP-CE1-CE2 ; Cycle 3: CM1-CM2 ; programmes en vigueur, repères annuels Eduscol).
3. **Progression par niveau de classe**: `profil.progression[niveauClasse][missionId] = { niveau, ... }`. Un enfant qui passe en classe supérieure garde l'historique de l'ancienne.
4. **Données de programme séparées du code**: `programmes/<niveau>.js` exporte (via `window.PROGRAMMES.<niveau>`) un objet décrivant les missions disponibles et leurs paramètres pour ce niveau. Les moteurs lisent ces données ; plus de nombres magiques dans les fichiers de mission.
5. **Compatibilité**: migrer les profils existants (clé `mathemagie-profils`, v1) vers la v2 sans perte: profil existant → niveau demandé au premier lancement, ancienne progression rattachée à ce niveau.
6. Conserver l'identité visuelle (Académie de Magie, mascotte flamme, barre de mana, polices Lexend/Century Gothic, Fira Sans), les trophées et avatars. Cibles tactiles ≥ 48px. Pour CP: textes courts, gros boutons, **consignes lisibles à voix haute** (SpeechSynthesis `fr-FR` bouton 🔊), pas de lecture longue.
7. Pas de dépendance externe/CDN. Accessibilité: contraste AA, aria-labels, navigation clavier.

## Arborescence cible

```
index.html                  accueil (adapté au niveau du profil actif)
connexion.html              choix du profil + pavé code + création de profil + mode parent
trophees.html
js/profils.js               GestionnaireProfils v2 (API ci-dessous)
js/auth.js                  hachage, code, garde de page
js/niveaux.js               constantes NIVEAUX, libellés, helpers (getProgramme(niveau))
js/composants/header.js
programmes/{cp,ce1,ce2,cm1,cm2}.js
calculs_mentaux/…           moteur_calcul.js paramétré par programmes
geometrie/…                 moteur_geometrie.js paramétré par programmes
jeux/…                      jeux conservés + variantes par niveau
docs/programmes/{cp,ce1,ce2,cm1,cm2}.md   recherche (source de vérité du contenu pédagogique)
```

## API `gestionnaireProfils` v2 (rétro-compatible avec la v1 quand possible)

Conserver: `getJoueurActif()`, `deconnecter()`, `getAvatar()`, `getCouleur()`, `getTitreMage()`, `getAvatarsDisponibles()`, `getStatsProgression()`, `getProgression(missionId)`, `setProgression(missionId, data)`, `verifierAccesOuRediriger(basePath)` (redirige vers `connexion.html`).
Ajouter: `getNiveauClasse()` → `'cp'|…|'cm2'`, `creerProfil({prenom, avatar, couleur, niveauClasse, code})`, `async verifierCode(prenom, code)`, `async connecter(prenom, code)`, `async changerCode(prenom, ancien, nouveau)`, `setNiveauClasse(prenom, niveau, codeParent)`, `definirCodeParent(code)`, `async verifierCodeParent(code)`, `supprimerProfil(prenom, codeParent)`, `getProgramme()` (programme du niveau actif).
`getProgression`/`setProgression` s'appliquent implicitement au niveau de classe du profil actif.

## Format `programmes/<niveau>.js`

```js
window.PROGRAMMES = window.PROGRAMMES || {};
window.PROGRAMMES.cp = {
  id: 'cp', libelle: 'CP', cycle: 2,
  calcul: {
    additions:       { actif: true, libelle: '…', consigne: '…', niveaux: [ { max: 10, retenue: false, … }, … ] },
    soustractions:   { … }, multiplications: { actif: false }, divisions: { actif: false },
    // missions propres au niveau autorisées: complements, doubles-moities, tables, fractions-simples, decimaux…
  },
  geometrie: { <missionId>: { actif, libelle, contenu: {…} } },
  jeux: { morpion: true, … }
};
```
Un `niveaux[]` par mission = 10 paliers de difficulté croissante **bornés par le programme du niveau** (ex. CP: nombres ≤ 100 ; CE1: ≤ 1000 ; CE2: ≤ 10 000 ; CM1: ≤ 1 000 000 ; CM2: ≤ 1 000 000 000, décimaux/fractions).

## Propriété des fichiers (zéro conflit)

| Agent | Écrit uniquement dans |
|---|---|
| R1–R5 recherche | `docs/programmes/<niveau>.md` |
| A auth | `js/profils.js`, `js/auth.js`, `js/niveaux.js`, `connexion.html`, `style/connexion.css` |
| B shell | `index.html`, `trophees.html`, `js/composants/header.js`, `style/accueil.css`, `style/commun.css` |
| P programmes | `programmes/*.js` (après recherche) |
| C calcul | `calculs_mentaux/**` |
| D géométrie | `geometrie/**` |
| E jeux | `jeux/**` |
| Q qualité | lecture seule, rapport |

## Définition de « fini »
- Chaque niveau charge sans erreur console ; chaque mission active du niveau génère des questions valides sur 200 tirages (aucun résultat négatif/non entier hors programme).
- Aucune mission hors programme du niveau n'est accessible.
- Création de profil → connexion par code → progression sauvegardée → changement de profil, testés.
- Migration v1→v2 testée avec un jeu de données v1 réel.
