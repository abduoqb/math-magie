# [Mathémagie](https://math-magie.vercel.app/index.html)

Bienvenue dans **Mathémagie**, une application web ludique conçue pour transformer l'apprentissage des mathématiques en une véritable aventure ! Ce projet propose une expérience immersive pour les enfants, mêlant défis mathématiques, découverte de la géométrie et esthétique de jeu vidéo.

## 🚀 Mission : Devenir un Champion des Chiffres et des Formes !

L'application a été pensée pour être **100% adaptée aux enfants** avec une interface dynamique, bienveillante et accessible.

### 🎮 Fonctionnalités Clés

- **Système de Progression Dynamique (Calcul Mental)** :
  - Un moteur de calcul adaptatif sur 10 niveaux de difficulté.
  - Sauvegarde automatique de la progression (localStorage).
  - Montée de niveau automatique après 5 bonnes réponses consécutives, et descente après 3 erreurs, assurant un apprentissage en douceur.
  - Sélecteur manuel pour choisir son défi à tout moment.
- **Missions de Géométrie (Nouveau !)** :
  - Apprentissage visuel des formes 2D et solides 3D (sommets, faces, arêtes).
  - Reconnaissance des angles (Aigu, Droit, Obtus, Plat) et initiation à la symétrie.
  - Sélecteur de niveau de difficulté adaptant les formes affichées (de basique à complexe).
- **Interface Gamifiée & Accessible** :
  - Composant de navigation centralisé (Web Component `<app-header>`).
  - Validation robuste des saisies (blocage des lettres et caractères spéciaux).
  - Support de l'accessibilité (ARIA labels, balises alt explicites).
  - Design "Pop & Bounce" avec feedback visuel immédiat (animations de succès/erreur).
  - Thème sombre optimisé et design responsive pour mobile, tablette et PC.

## 🛠️ Technologies Utilisées

- **HTML5** & **CSS3** (Animations, Flexbox & Grid, CSS Masks)
- **JavaScript Vanilla (ES6+)** (Web Components, LocalStorage, Moteurs de jeu paramétrables)
- **Génération SVG dynamique** pour le dessin précis des formes géométriques.
- **Polices** : Fira Sans

## 📂 Structure du Projet

- `index.html` : Portail d'accueil avec accès rapide aux deux grandes sections.
- `js/composants/header.js` : Web Component gérant la barre de navigation globale.
- `calculs_mentaux/` : Le module de calcul mental (additions, soustractions, multiplications, divisions) géré par `moteur_calcul.js`.
- `geometrie/` : Le module dédié aux formes et figures géré par `moteur_geometrie.js`.
- `style/` : Fichiers CSS centralisés (`commun.css`, `exercice-commun.css`, `missions-liste.css`).

---

Projet développé pour rendre les mathématiques aussi amusantes qu'un jeu vidéo ! 🚀✨
