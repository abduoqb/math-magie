# Mathémagie

Site statique d'exercices de maths, du CP au CM2. Pas de build, pas de framework : du HTML, du CSS et du JavaScript vanilla, servis tels quels. Le déploiement est sur Vercel, branche `main`.

## Lancer en local

Il n'y a rien à installer. Il faut juste servir le dossier, parce que les pages chargent des scripts relatifs et que la synchro passe par `fetch` :

```bash
python -m http.server 8000
# puis http://localhost:8000
```

Ouvrir les fichiers directement (`file://`) marche pour la plupart des pages, mais pas pour la synchro Supabase.

## Organisation

| Dossier / fichier | Rôle |
|---|---|
| `index.html` | Accueil. Affiche les univers accessibles pour la classe du profil actif. |
| `connexion.html` | Choix du profil, pavé de code, création en 6 étapes, espace parent, écran de synchro. |
| `trophees.html` | Liste des trophées, filtrée sur `programme.calcul / geometrie / jeux`. |
| `calculs_mentaux/` | Moteur de calcul (`js/moteur_calcul.js`) + générateur pur (`js/generateur_calcul.js`) + une page par opération. |
| `geometrie/` | Moteur (`js/moteur_geometrie.js`), lecture du programme (`js/programme_geo.js`), une page par mission. |
| `jeux/` | 4 classiques (Morpion, Puissance 4, Pendu, Trouver le chiffre) et 8 « jeux magiques » solo qui adaptent leur contenu à chaque classe (un dossier par jeu : page, générateur pur, CSS, test Node). Helpers partagés, catalogue et défi du jour dans `jeux/commun.js`. |
| `programmes/` | Un fichier par classe (`cp.js` … `cm2.js`). C'est la seule source de vérité pour ce que chaque classe voit. |
| `js/profils.js` | Chargeur : il injecte les scripts dans le bon ordre. Toutes les pages le incluent. |
| `js/profils-core.js` | `GestionnaireProfils` : état, persistance, progression, codes, migration. |
| `js/auth.js` | Hachage des codes, limitation des essais, garde de page. |
| `js/niveaux.js` | Liste des niveaux, libellés, `getProgramme(niveau)`. |
| `js/sync.js` | Synchro Supabase et fonction de fusion `fusionnerProfils` (exportée pour les tests). |
| `js/composants/header.js` | En-tête (web component `<app-header>`), menus, indicateur ☁️. |
| `js/supabase-config.js` | URL et clé `anon` du projet Supabase. |
| `js/vendor/supabase.js` | `supabase-js` 2.45.4, versionné. Ne pas le remplacer par un CDN. |
| `style/` | `commun.css` (tokens et classes génériques), `exercice-commun.css`, `calculs.css`, `geometrie.css`, `jeux.css`, `connexion.css`, `accueil.css`, `missions-liste.css`. |
| `images/` | SVG (univers, opérations, mascotte en 4 expressions) et anciens PNG encore référencés par certaines pages. |
| `supabase/migrations/` | Schéma de la synchro (tables, RLS, triggers), trace des migrations appliquées. |
| `docs/` | `REFONTE-SPEC.md`, `DA-BRIEF.md`, `SYNC-SPEC.md`, et les recherches dans `docs/programmes/`. Lire la spec avant de toucher au modèle de données. |

## Données et persistance

Tout est stocké dans `localStorage`, **un stockage par famille** : `mathemagie-profils:<uid>` pour un compte famille connecté, `mathemagie-profils` pour un appareil sans compte. La clé `mathemagie-famille-active` indique lequel est affiché. Chaque stockage a `version: 2`. Forme simplifiée :

```js
{
  version: 2,
  joueurActif: "Léa" | null,
  codeParent: { sel, hash, _maj } | null,
  profils: {
    "Léa": {
      _avatar, _couleur, _majProfil,
      niveauClasse: "cp" | "ce1" | "ce2" | "cm1" | "cm2" | null,  // null = migré, à configurer
      code: { sel, hash } | null,                                 // SHA-256(sel + ":" + code)
      progression: { cm1: { additions: { niveau: 4, _maj: 1739… }, "jeu-pendu": {…} } },
      progressionEnAttente: {…}                                   // ancienne v1, le temps que la classe soit choisie
    }
  },
  supprimes: { "Tom": { supprimeLe, _majProfil } }                 // pierres tombales pour la synchro
}
```

- La progression est indexée par **classe puis par mission**. Changer de classe ne fait rien disparaître.
- Chaque écriture de progression pose `_maj` (ms). C'est ce qui permet la fusion.
- Les anciennes données (clé `math-magie-*` et `mathemagie-profils` en v1) sont migrées au premier chargement. Une copie de la v1 reste dans `mathemagie-profils-v1-sauvegarde`.
- Le code secret n'est jamais stocké en clair. `auth.js` limite les tentatives : 3 essais, puis 30 s de blocage, persistant au rechargement.

## Programmes

Chaque `programmes/<classe>.js` pose `window.PROGRAMMES.<classe>`. Les moteurs ne contiennent aucun nombre de classe en dur.

```js
window.PROGRAMMES.cp = {
  id: 'cp', libelle: 'CP', cycle: 2,
  calcul: {
    additions: { actif: true, libelle, consigne, niveaux: [ /* 10 paliers */ ] },
    divisions: { actif: false, … }
  },
  geometrie: { 'geometrie-formes': { actif: true, libelle, contenu: { formes: [...], … } }, … },
  jeux: { morpion: true, puissance4: true, pendu: true, 'trouver-le-chiffre': true }
};
```

- `actif: false` : la mission apparaît grisée « Pas encore au programme » et sa page redirige vers l'index.
- Un palier de calcul a `min`, `max`, `retenue`, `termes`, `decimaux`. Les conventions de bornes diffèrent : **cp, ce1, ce2, cm2 bornent le résultat, cm1 borne chaque terme**. Le générateur gère les deux (`BORNES_PAR_TERME` dans `generateur_calcul.js`). C'est une incohérence connue, voir plus bas.
- `contenu` d'une mission géométrie limite ce qui peut apparaître (formes, angles, axes…). Les moteurs filtrent dessus.
- Les sources et les choix à valider sont dans les champs `source` et `notes` de chaque mission.

## Ajouter ou modifier une mission

1. Vérifier que la mission existe dans `programmes/<classe>.js` pour toutes les classes concernées (même id).
2. Pour du calcul : le moteur lit `programme.calcul[op].niveaux[palier - 1]`. Ne pas ajouter de logique par classe dans `moteur_calcul.js`, la mettre dans le programme.
3. Pour la géométrie : la mission doit lire `GeoProgramme` (`programme_geo.js`) et filtrer ses pools sur `contenu`. Une question hors `contenu` est un bug.
4. Pour les jeux : respecter `programme.jeux[id]` et utiliser `JeuxNiveau` (`jeux/commun.js`) pour les plages et les mots.
5. Les pages de mission ne doivent jamais charger `programmes/*.js` directement : c'est fait par `js/profils.js`.

## Synchronisation Supabase

Le client est dans `js/sync.js` (`window.Sync`). Il est **inactif** si `window.SUPABASE_CONFIG` est absent ou si aucune famille n'est connectée. Dans ces cas, le site fonctionne uniquement en local.

Fonctionnement :

- Un compte **famille** (e-mail + mot de passe, Supabase Auth) possède des lignes dans `familles` et `profils_enfants`.
- `profils_enfants.data` contient exactement l'objet profil local, `version` est incrémenté à chaque écriture par un trigger.
- Écriture avec concurrence optimiste : `update … where id = … and version = …`. En cas de conflit, relecture, fusion, nouvelle tentative (5 max).
- **Fusion** (`fusionnerProfils`) : par mission, le `_maj` le plus récent gagne, sauf les champs `parties*` qui prennent le max. Une pierre tombale gagne si elle est postérieure à la dernière modification. Les données sans `_maj` valent 0 et ne sont jamais perdues. La fusion est commutative et idempotente, les tests le vérifient.
- Déclencheurs : au chargement, au retour du réseau (`online`), toutes les 60 s quand l'onglet est visible, et 2 s après une modification (debounce).
- File d'attente : la différence entre l'état local et le dernier état connu du serveur, stockée dans `mathemagie-sync-meta`. Elle survit au rechargement.
- Session Supabase dans `mathemagie-supabase-auth`. La déconnexion utilise `signOut({ scope: 'local' })`.
- **Une famille à la fois** : l'appareil n'affiche que les profils de la famille connectée. Se déconnecter les masque (ils restent sauvegardés en ligne et dans `mathemagie-profils:<uid>`), changer de famille affiche ceux de l'autre famille. Rien ne passe d'une famille à l'autre. Les profils créés sans compte rejoignent la première famille qui se connecte, puis le stockage sans compte est vidé.
- RLS : chaque ligne est visible et modifiable uniquement par `famille_id = auth.uid()`. Le rôle `anon` n'a aucun droit sur les deux tables.

Pour modifier le schéma : ajouter une nouvelle migration dans `supabase/migrations/` et l'appliquer au projet. Ne jamais modifier une migration déjà appliquée.

## Jeux magiques et défi du jour

Les 8 jeux solo (`eclair`, `compte-magique`, `suites-magiques`, `ranger`, `memory-nombres`, `horloge`, `marche`, `fractions`) sont décrits dans `JeuxNiveau.CATALOGUE` (`jeux/commun.js`) : titre, emoji, catégorie, trophée. La liste des jeux, l'accueil et la page des trophées se construisent depuis ce catalogue.

- Chaque jeu a un générateur pur (`jeux/<id>/<id>.js`, `rng` injectable, exporté pour Node) et un test : `node jeux/<id>/test-<id>.js`. Le contenu dépend de la classe (`JeuxNiveau.niveau()`).
- Fin de partie : `JeuxNiveau.enregistrerPartie(id, { gagnee, score, meilleur })` met à jour `jeu-<id>` (`partiesJouees`, `partiesGagnees`, `meilleurScore`) et valide le **défi du jour**.
- **Défi du jour** : un jeu du catalogue, le même toute la journée (choisi par la date, parmi les jeux ouverts à la classe). Sa réussite alimente `defi-du-jour` (`derniereDate`, `serie`, `meilleureSerie`, `partiesDefis`) et la série de jours d'affilée. Affiché sur l'accueil et sur la liste des jeux.
- Trophées : un par jeu (5, 10, 20 parties), plus des personnages à débloquer (jeux essayés, série de défis).
- Ajouter un jeu : créer `jeux/<id>/`, l'ajouter au catalogue **et** à `JEUX_MAGIQUES` (`js/profils-core.js`), puis mettre `'<id>': true` dans la section `jeux` de chaque `programmes/<classe>.js`.

## Tests

Les tests des jeux magiques sont dans le dépôt (`jeux/*/test-*.js`, Node sans dépendance). Pour le reste, ce qui a été vérifié par scripts hors dépôt :

- génération : 10 paliers × 4 opérations × 5 classes, 300 tirages chacun, bornes et résultats contrôlés ;
- géométrie : 85 combinaisons mission × palier × classe, 200 questions chacune, réponse toujours présente dans les choix ;
- auth : hachage identique à `crypto.createHash`, blocage, migration v1→v2, mode parent ;
- synchro : fusion (cas explicites + 3000 tirages aléatoires) et scénarios sur un faux client Supabase.

Les scripts sont restés hors dépôt. Les rajouter (par exemple dans `tests/`, en `node --test`) serait la prochaine étape logique.

## Conventions

- **Interface en français**, tutoiement, phrases courtes. Au CP : textes courts et bouton 🔊 (`speechSynthesis`, `fr-FR`).
- **Couleurs** : tokens sur `:root` dans `style/commun.css` (`--calcul`, `--geometrie`, `--jeux`, `--op-addition`…). Ne pas coder de couleur en dur dans les pages.
- **Classes** : les nouvelles classes génériques vont dans `commun.css` ou `exercice-commun.css`. Les classes spécifiques à un univers sont préfixées (`calc-*`, `geo-*`, `jeu-*`).
- **Texte utilisateur** : toujours échappé avant `innerHTML`. Le prénom est saisi par un enfant, il est considéré comme non fiable.
- **Accessibilité** : cibles tactiles ≥ 48 px (56 px et plus pour les actions principales), focus visible, `prefers-reduced-motion` respecté.
- **Pas de clé `service_role`** dans le dépôt. La clé `anon` dans `supabase-config.js` est publique par conception.

## Limites connues

- **Schéma Supabase versionné** dans `supabase/migrations/20261016000000_sync_familles_profils_enfants.sql`. Ce fichier est déjà appliqué au projet de production : ne pas le rejouer dessus, il sert à recréer un projet vierge. Toute modification future du schéma doit passer par une nouvelle migration.
- **Supabase à configurer à la main** : « Site URL » et les « Redirect URLs » (Authentication → URL Configuration) doivent contenir le domaine de production et `/connexion.html`. Sinon les liens de confirmation et de mot de passe oublié sont faux.
- **Flux e-mail non testé en réel** (confirmation, mot de passe oublié). Les tests ont utilisé des comptes créés directement en base.
- **Migration des appareils déjà synchronisés** : au premier chargement, l'ancien stockage unique est rattaché à la famille alors connectée. Un appareil déconnecté depuis longtemps, avec les profils d'une ancienne famille, les verra rattachés à la prochaine famille qui s'y connecte (impossible à deviner).
- **Incohérence de bornes** entre cm1 (par terme) et les autres classes (par résultat) : voir `BORNES_PAR_TERME`.
- **CE1 divisions** désactivées (`actif: false`), volontairement, en attente de la question du partage dans le moteur.
- **Ancien code mort** : `choix-mage.html` n'est plus qu'une redirection vers `connexion.html`. Quelques PNG de `images/` ne sont plus utilisés.
- **Jamais testé** : Safari, Firefox, un vrai appareil tactile, la voix (`speechSynthesis`) à l'oreille.

## Documentation de référence

- `docs/REFONTE-SPEC.md` : architecture des profils et des programmes.
- `docs/DA-BRIEF.md` : tokens, règles d'interface, répartition des fichiers par univers.
- `docs/SYNC-SPEC.md` : modèle de confiance, règles de fusion, RLS.
- `docs/programmes/*.md` : recherches sur les programmes officiels, avec sources et points non confirmés.
