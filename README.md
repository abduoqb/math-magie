# [Mathémagie](https://math-magie.vercel.app/index.html)

Bienvenue dans **Mathémagie**, une application web éducative conçue pour transformer l'apprentissage des mathématiques en une véritable aventure ! Ce projet propose une immersion dans l'**Académie de Magie Moderne**, mêlant défis de calcul, découverte de la géométrie et jeux.

## 🚀 Mission : Devenir un Mage des Chiffres et des Formes !

L'application est adaptée à **chaque classe, du CP au CM2**. Chaque enfant choisit son niveau, et tout le contenu (calculs, géométrie, jeux, trophées) s'ajuste aux programmes officiels de l'Éducation nationale pour sa classe.

### 🎮 Fonctionnalités Clés

- **👤 Profils d'enfants protégés** :
  - Chaque enfant a un prénom, un avatar, une couleur, une classe et un **code secret à 4 chiffres** saisi sur un pavé géant.
  - Trois essais, puis une courte pause : un code se devine difficilement.
  - Un **espace parent** (protégé par un code parent) permet de changer la classe, réinitialiser un code ou supprimer un profil.
  - Les anciens profils sont conservés : au premier passage, l'enfant choisit sa classe et son code.

- **☁️ Synchronisation entre appareils (optionnelle)** :
  - Un parent crée un **compte famille** (e-mail et mot de passe) une seule fois par appareil.
  - La progression de chaque enfant est retrouvée sur tous les appareils de la famille.
  - Hors connexion, l'application fonctionne exactement comme avant : les données sont alors gardées sur l'appareil.
  - Seule l'adresse e-mail du parent est stockée. Chaque famille ne voit que ses propres données.

- **🎓 L'Académie de Magie Moderne (Design)** :
  - Style « autocollants » lumineux : contours épais, ombres franches et une couleur par univers (Calcul violet, Géométrie turquoise, Jeux orange, Trophées jaune).
  - **Mascotte Guide** : une petite flamme bleue qui réagit à chaque réponse (neutre, contente, triste, en lecture).
  - Illustrations vectorielles (SVG) pour chaque univers et chaque opération.
  - **Lecture à voix haute** (🔊) des consignes pour les plus jeunes, et textes plus courts au CP.

- **🧮 Calcul Mental** :
  - Additions, soustractions, multiplications et divisions, sur 10 paliers de difficulté par classe.
  - Un **pavé numérique** à l'écran (activé sur tablette et au CP), avec le bouton **Valider ✓**.
  - Barre de mana : elle se remplit à chaque bonne réponse, et 5 bonnes réponses de suite font monter le palier.
  - Une erreur montre la bonne réponse, sans culpabiliser.

- **📐 Géométrie** :
  - Formes, propriétés, angles, symétrie, droites, triangles, quadrilatères et patrons, selon la classe.
  - Les missions hors programme de la classe sont affichées mais verrouillées.

- **🎲 Salle de Jeux** :
  - Morpion, Puissance 4, Pendu et Trouver le chiffre, avec des plages et des mots adaptés à chaque classe.
  - Un **défi calcul** optionnel : résoudre un petit calcul avant de jouer son coup.

- **🏆 Salle des Trophées** :
  - Les trophées affichés sont ceux de la classe de l'enfant, verrouillés tant qu'ils ne sont pas gagnés, avec une consigne pour les débloquer.

## 📚 Programmes

Le contenu de chaque classe vit dans `programmes/` (`cp.js`, `ce1.js`, `ce2.js`, `cm1.js`, `cm2.js`). Les moteurs de calcul, de géométrie et de jeux lisent ces fichiers, sans nombre codé en dur.

Les recherches sur les programmes sont dans `docs/programmes/`. Les paliers de difficulté sont des **propositions dérivées des programmes officiels**, pas des citations : à valider avant tout usage scolaire officiel.

## 🛠️ Technologies Utilisées

- **HTML5** & **CSS3** (animations, contours et ombres « autocollants », respect de `prefers-reduced-motion`).
- **JavaScript Vanilla (ES6+)**, sans étape de compilation : les pages se lancent directement depuis un serveur statique.
- **Supabase** (authentification e-mail et base de données avec sécurité au niveau des lignes) pour la synchronisation, via `supabase-js` versionné dans `js/vendor/`.
- **localStorage** pour la sauvegarde locale de tous les profils.
- **SVG** pour les illustrations et les figures géométriques.

## 🧭 Structure du projet

- `index.html` : accueil, `connexion.html` : profils, espace parent et synchronisation.
- `calculs_mentaux/`, `geometrie/`, `jeux/` : les trois univers de jeu.
- `programmes/` : le contenu pédagogique de chaque classe.
- `js/` : profils, authentification, niveaux, synchronisation et en-tête.
- `docs/` : spécifications (refonte, design, synchronisation) et recherches sur les programmes.

## ⚙️ Configuration de la synchronisation

La clé publique (« anon ») de Supabase est dans `js/supabase-config.js`. Elle est publique par conception : elle ne donne accès à aucune donnée à elle seule. Ne jamais y mettre la clé `service_role`.

---

Projet développé avec passion pour rendre les mathématiques aussi captivantes qu'une quête magique ! 🪄✨
