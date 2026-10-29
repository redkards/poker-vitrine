# Journal des versions — PokerVitrine

Le projet suit le [versionnage sémantique](https://semver.org/lang/fr/) : `MAJEURE.MINEURE.CORRECTIF`.

- **MAJEURE** : changement incompatible (API modifiée sans rétrocompatibilité, refonte).
- **MINEURE** : nouvelle fonctionnalité compatible (nouvelle rubrique, nouvel écran).
- **CORRECTIF** : correction de bug ou ajustement sans nouvelle fonctionnalité.

Tant que le site n'est pas en ligne, les versions restent en `0.x`. La mise en ligne publique sera la **1.0.0**.
Chaque version publiée reçoit une étiquette Git (`git tag v0.5.0`). La feuille de route est dans [docs/ROADMAP.md](docs/ROADMAP.md).

## [Non publié]

### Ajouté
- Leçons interactives originales (5 thèmes) et scripts vidéo avec storyboards.
- Documentation de l'API (OpenAPI, NelmioApiDocBundle) : `/api/doc` et `/api/doc.json`, en développement uniquement.
- Forum : signalement d'un message par les membres (`POST /api/forum/posts/{id}/report`, motifs spam,
  insulte, hors sujet, autre ; un seul signalement par membre et par message, pas sur ses propres messages)
  et file de modération « Signalements » dans le back-office avec l'action « Marquer résolu ».
- Recherche dans les actualités publiées et le forum (`GET /api/search?q=`, 2 à 100 caractères).
- Profil public d'un membre (`GET /api/members/{pseudo}`) : pseudo, date d'inscription, nombre de messages.
- Front : page `/recherche` (saisie avec délai, 2 caractères minimum, résultats groupés Actualités / Forum,
  état vide) et champ de recherche avec loupe dans l'en-tête.
- Front : page de profil public `/membres/:pseudo` ; les pseudos du forum (sujets, messages, recherche) y mènent.
- Front : bouton « Signaler » sur les messages du forum (membre connecté, hors ses propres messages) avec
  choix du motif, commentaire facultatif, confirmation et gestion des erreurs 409 / 429.
- Front : SEO par route (`SeoService` + `SeoTitleStrategy`) : titre, meta description et Open Graph
  (`og:title`, `og:description`, `og:type`) ; les pages article, vidéo, leçon, sujet, catégorie et profil
  les complètent avec leur contenu. `meta robots noindex` conservé pour la bêta.
- Front : tests Jasmine des services recherche, membres, signalement et SEO (`npm run test:ci`, Chrome headless).

## [0.5.0] — 2026-10-29

### Ajouté
- Profil membre : modification du pseudo et du mot de passe, favoris vidéos.
- RGPD : export des données (JSON), suppression du compte confirmée par email avec anonymisation,
  purge automatique (`app:gdpr:cleanup` : IP de plus de 90 jours, comptes inactifs depuis 3 ans).
- Pages CGU, politique de confidentialité et mentions légales (modèles à compléter).

### Modifié
- Base de données : MariaDB 10.6 (comme l'hébergement o2switch) au lieu de PostgreSQL.
- Vidéos : uniquement des vidéos sous licence Creative Commons Attribution (CC BY).

### Retiré
- Vidéos des chaînes Kill Tilt et zChance44.

## [0.4.0] — 2026-10-29

### Ajouté
- Forum : catégories, sujets, réponses, suivi des sujets avec notification par email, modération.
- Actualités : portée France / International (2 fenêtres chacune sur l'accueil).
- Guide de déploiement o2switch pour débutant.

### Retiré
- Compteur vidéos / messages / membres de l'accueil.

## [0.3.0] — 2026-10-29

### Ajouté
- Actualités (liste, détail, catégories), vidéos pédagogiques (filtres par niveau), lecteur YouTube au clic.
- Back-office EasyAdmin (articles, vidéos, utilisateurs).

## [0.2.0] — 2026-10-28

### Ajouté
- Inscription avec consentement RGPD, vérification de l'email, connexion JWT avec refresh token.
- Design : thème clair et rouge, titres Playfair Display, page d'accueil.

## [0.1.0] — 2026-10-28

### Ajouté
- Fondations : Symfony 7.4, Angular 19, Docker, entités utilisateur et consentement.
