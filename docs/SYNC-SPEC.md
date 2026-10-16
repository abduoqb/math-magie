# Synchronisation Supabase — spec de référence

Objectif: la progression des enfants est sauvegardée en ligne et retrouvée sur tout appareil. **L'app doit continuer à fonctionner hors ligne et sans compte** (le local reste la source de vérité immédiate; la synchro est un plus qui ne bloque jamais un enfant).

## Modèle de confiance
- **Un compte « famille » = un parent** (Supabase Auth, e-mail + mot de passe). Seule donnée personnelle stockée: l'e-mail du parent (géré par Supabase Auth). Aucune donnée personnelle sur l'enfant: prénom (ou pseudo), avatar, couleur, classe, progression.
- Les enfants gardent **prénom + code à 4 chiffres**. Le code est un verrou de confort *à l'intérieur* de la session famille (le hachage `{sel, hash}` est synchronisé pour fonctionner sur tous les appareils). La sécurité réelle = la session du parent + RLS.
- Sur un nouvel appareil: le parent se connecte **une fois** (Espace parent → « Synchroniser cet appareil »), puis les enfants choisissent leur profil + code comme d'habitude. La session persiste jusqu'à « Déconnecter la famille » (Espace parent).

## Base (projet `uuxghhuhfeoposespbsk`, région eu-north-1) — créée par l'orchestrateur
- `public.familles(famille_id uuid pk = auth.uid(), code_parent jsonb, maj_le)` — code parent `{sel, hash}`.
- `public.profils_enfants(id uuid pk, famille_id uuid, prenom text, data jsonb, version int, supprime_le timestamptz, cree_le, maj_le)`, `unique(famille_id, prenom)`.
  `data` = exactement l'objet profil local de `gestionnaireProfils.donnees.profils[prenom]`: `{ _avatar, _couleur, niveauClasse, code:{sel,hash}|null, progression:{cp:{<missionId>:{...}}}, progressionEnAttente? }`.
- RLS: toutes les opérations réservées au rôle `authenticated` et à `famille_id = auth.uid()`. `anon` n'a aucun droit. Trigger `BEFORE UPDATE`: `version = old.version + 1`, `maj_le = now()`, `famille_id` immuable.
- Concurrence optimiste: une mise à jour se fait par `.update(...).eq('id', id).eq('version', versionLue)`; 0 ligne modifiée = quelqu'un a écrit entre-temps → relire, **fusionner**, réessayer (max 5 fois).
- Suppression d'un profil = `supprime_le = now()` (pierre tombale, pour que les autres appareils le suppriment aussi).

## Règles de fusion (déterministes, sans perte de progression)
Fusion de deux versions du même profil (local L, distant D), par mission `progression[niveauClasse][missionId]`:
1. Chaque objet de mission porte `_maj` (ms epoch, ajouté par `setProgression`). Le plus récent `_maj` gagne pour tous les champs (notamment `niveau`, qui peut légitimement baisser).
2. Exception: les champs compteurs dont le nom commence par `parties` ne font que croître → `max(L, D)`.
3. Mission présente d'un seul côté → conservée.
4. Champs du profil (`_avatar`, `_couleur`, `niveauClasse`, `code`): le plus récent `_majProfil` gagne (ajouté à chaque modification de ces champs).
5. `supprime_le` posé d'un côté et profil modifié plus tard de l'autre: la suppression gagne si `supprime_le` > `_majProfil`.
Les anciennes données locales sans `_maj` valent `_maj = 0` (donc jamais prioritaires, jamais perdues).

## Client
- `js/vendor/supabase.js`: supabase-js UMD épinglé (version exacte, téléchargé et versionné dans le repo, pas de CDN au runtime).
- `js/supabase-config.js`: `window.SUPABASE_CONFIG = { url, cle }` (clé *publishable*, publique par conception grâce au RLS).
- `js/sync.js`: `window.Sync` — `estConfigure()`, `estConnecte()`, `getEmail()`, `inscrire(email, mdp)`, `connecter(email, mdp)`, `deconnecter()`, `reinitialiserMotDePasse(email)`, `synchroniser()` (pull + fusion + push), `planifierPush()` (debounce 2 s), `getEtat()` → `'hors-ligne'|'non-connecte'|'synchronise'|'en-cours'|'erreur'`, événement `window` `mathemagie-sync` à chaque changement d'état.
- Hooks dans `profils-core.js` (l'API publique existante ne change pas): après chaque `sauvegarder()` qui modifie un profil → `Sync.planifierPush()`; au chargement de page et au retour du réseau (`online`) → `Sync.synchroniser()`; file d'attente persistante des modifications non envoyées (`localStorage`), un échec réseau ne perd rien.
- À la connexion d'une famille sur un appareil qui a déjà des profils locaux: fusion par prénom (les profils locaux sont envoyés, les distants téléchargés). Aucun profil local n'est jamais supprimé par la synchro sauf pierre tombale distante.
- UI (connexion.html, Espace parent): « Synchroniser cet appareil » (créer un compte / se connecter), état de synchro visible (icône ☁️ + texte court), « Déconnecter la famille », « Mot de passe oublié ». Textes simples, pensés pour un parent. Un enfant ne voit qu'un petit indicateur ☁️ ✓ discret dans l'en-tête, jamais de jargon.
- Sécurité: aucune donnée utilisateur injectée en innerHTML sans échappement; jamais de clé secrète (`service_role`) dans le repo; messages d'erreur génériques pour l'authentification.
- Compatibilité: si Supabase est injoignable ou non configuré, l'app fonctionne exactement comme avant.

## Propriété des fichiers
| Agent | Écrit uniquement dans |
|---|---|
| Orchestrateur | base Supabase (migration), `docs/SYNC-SPEC.md`, `js/supabase-config.js` |
| S client | `js/vendor/supabase.js`, `js/sync.js`, `js/profils-core.js`, `js/profils.js` (liste des scripts), `js/composants/header.js` (indicateur ☁️), `connexion.html`, `style/connexion.css` |
| Q qualité | lecture seule + comptes de test créés puis supprimés |

## Définition de « fini »
- Deux contextes navigateur distincts (= deux appareils) avec la même famille: progression créée sur A visible sur B; modifications simultanées fusionnées selon les règles; suppression propagée; hors ligne puis retour réseau = rattrapage.
- Sans compte ni réseau, comportement identique à avant (tests node `test_calculs.js`, `test_geometrie.js`, `test-auth.js` passent toujours).
- Un autre compte famille ne peut ni lire ni écrire les lignes d'une famille (testé), `anon` ne peut rien lire (testé), advisors Supabase sécurité sans alerte.
