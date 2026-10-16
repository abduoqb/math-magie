# Refonte DA « Mathémagie » — brief commun (contrat entre agents)

Public: enfants de 6 à 11 ans, souvent sur tablette. **Tout doit se comprendre sans lire**: une icône + un mot court, une seule action principale par écran, retours immédiats (couleur + icône + texte court).
Site statique JS vanilla, pas de build, pas de dépendance externe (seule police externe tolérée: Lexend via Google Fonts, déjà en place; Fira Sans locale existe dans `Fira_Sans/`).

## Direction: « Académie magique en autocollants »
Style *sticker* joyeux et très lisible: formes très arrondies, aplats saturés, **contour épais bleu nuit** et **ombre portée pleine décalée** (pas de flou), petites étoiles/étincelles décoratives, mascotte flamme bleue qui réagit. Ni sombre ni pâle: lumineux, chaleureux, contrasté (AA minimum).

## Tokens (à définir sur `:root` dans style/commun.css — agent A; les autres les consomment)
```
--encre: #2B2D5B;            /* contours, texte fort */
--texte: #334155;
--fond: #FFF8E7;             /* crème chaud (remplace le bleu pâle) */
--fond-2: #E8F6FF;
--carte: #FFFFFF;
--contour: 3px solid var(--encre);
--ombre-pleine: 0 5px 0 var(--encre);      /* + --ombre-pleine-hover: 0 8px 0 */
--rayon: 22px;  --rayon-grand: 32px;

/* une couleur par univers (toujours la même partout) */
--calcul: #8B5CF6;  --calcul-clair: #EDE4FF;
--geometrie: #14B8A6; --geometrie-clair: #D5F5F0;
--jeux: #F97316;    --jeux-clair: #FFE6D2;
--trophees: #FACC15; --trophees-clair: #FFF5C2;

/* une couleur par opération (toujours la même partout) */
--op-addition: #22C55E;  --op-soustraction: #F43F5E;
--op-multiplication: #3B82F6;  --op-division: #F59E0B;

--ok: #22C55E; --ok-clair: #DCFCE7;  --ko: #EF4444; --ko-clair: #FEE2E2;
```
Garder les anciens noms (`--primary-color`, `--secondary-color`, `--accent-color`, `--success-color`, `--error-color`, `--bg-color`, `--card-bg`, `--text-color`, `--text-muted`, `--shadow`, `--border-radius`) comme **alias** vers les nouveaux tokens pour ne rien casser.

## Règles d'interface
- Cibles tactiles ≥ 56px (≥ 72px au CP). Boutons principaux: pleins, contour encre, ombre pleine, s'enfoncent à l'appui (translateY + ombre réduite).
- Un seul bouton principal par écran, libellé = verbe court (« Valider », « Jouer », « Recommencer »).
- Navigation: icône + mot (🏠 Accueil, 🎮 Jouer, 🏆 Trophées, profil). Pas de jargon.
- Retours: bonne réponse = vert + ✓ + mascotte contente; erreur = rouge doux + ✗ + la bonne réponse montrée, jamais culpabilisant.
- Emojis: un jeu cohérent et limité: calcul ➕➖✖️➗, géométrie 🔺🟦📐, jeux 🎲, trophées 🏆, validation ✅, erreur ❌ (pas de variantes décoratives aléatoires).
- Respecter `prefers-reduced-motion` (couper animations), focus clavier très visible.
- Les consignes lues à voix haute (🔊) et le mode CP (textes courts, gros) sont conservés.

## Illustrations (SVG, créées par l'agent A dans `images/`, mêmes noms pour tous)
Style sticker (contour encre 4px, aplats, coins ronds), viewBox 200×200, sans texte intégré sauf symboles mathématiques:
`images/univers-calcul.svg`, `images/univers-geometrie.svg`, `images/univers-jeux.svg`, `images/univers-trophees.svg`,
`images/op-addition.svg`, `images/op-soustraction.svg`, `images/op-multiplication.svg`, `images/op-division.svg`,
`images/mascotte-neutre.svg`, `images/mascotte-contente.svg`, `images/mascotte-triste.svg`, `images/mascotte-lecture.svg` (flamme bleue amicale, 4 expressions),
`images/etoile.svg`, `images/etincelle.svg`.
Les anciens PNG (`addition.png`…) ne sont plus référencés après la refonte (ne pas les supprimer, l'agent A les laisse).

## Propriété des fichiers (zéro conflit)
| Agent | Écrit uniquement dans |
|---|---|
| A fondation | `style/commun.css`, `style/exercice-commun.css`, `style/missions-liste.css`, `js/composants/header.js`, `images/*.svg` |
| B calculs | `calculs_mentaux/**`, `style/calculs.css` (nouveau) |
| C entrée | `index.html`, `style/accueil.css`, `connexion.html`, `style/connexion.css`, `trophees.html` |
| D géométrie + jeux | `geometrie/**`, `jeux/**`, `style/geometrie.css`, `style/jeux.css` (nouveaux) |
| Q qualité | lecture seule |

Si tu as besoin d'une classe/token partagé qui n'existe pas encore, crée-le dans TON fichier (préfixé par ton univers), ne modifie pas ceux des autres.

## Définition de « fini »
Aucune erreur console; aucune régression fonctionnelle (les tests node `test_calculs.js`, `test_geometrie.js`, `test-auth.js` du scratchpad passent toujours); contraste AA; pas de débordement horizontal à 390px; rendu vérifié par capture à 1024×768 et 390×844, au CP et au CM1.
