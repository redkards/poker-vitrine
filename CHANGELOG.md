# Journal des versions — PokerVitrine

Le projet suit le [versionnage sémantique](https://semver.org/lang/fr/) : `MAJEURE.MINEURE.CORRECTIF`.

- **MAJEURE** : changement incompatible (API modifiée sans rétrocompatibilité, refonte).
- **MINEURE** : nouvelle fonctionnalité compatible (nouvelle rubrique, nouvel écran).
- **CORRECTIF** : correction de bug ou ajustement sans nouvelle fonctionnalité.

Tant que le site n'est pas en ligne, les versions restent en `0.x`. La mise en ligne publique sera la **1.0.0**.
Chaque version publiée reçoit une étiquette Git (`git tag v0.5.0`). La feuille de route est dans [docs/ROADMAP.md](docs/ROADMAP.md).

## [Non publié]

### Ajouté
- Apprendre : page « Tableaux de ranges » (`/lecons/ranges`, lien depuis la liste des leçons), grille 13 × 13 des
  169 mains par situation, légende en pourcentage des 1 326 combinaisons. Débutant (3 repères d'ouverture) et
  Intermédiaire (ouvertures à six joueurs, UTG à SB) inclus dans le site ; Expert (3-bet, payer ou se coucher face à
  une ouverture, 3 tableaux) réservé aux membres Premium et servi par `GET /api/lessons/ranges/expert`
  (401 anonyme, 403 `premium_required`, `no-store`) depuis `backPoker/resources/lessons/ranges-expert.json`.
- Tests : notation des ranges, cohérence avec la leçon « ranges par position » (UTG 15-18 %, CO 25-30 %,
  BTN 40-50 %), aucune main dans deux actions, verrouillage Premium sans appel à l'API.
- Ranges recalibrées sur les repères publics : UTG 16,1 %, HJ 20,4 %, CO 27,0 %, BTN 42,1 %, SB 33,9 % ;
  grosse blinde face au bouton : 52 % de défense (repère des solveurs 52-58 %), 3-bet à environ 10 BB.

## [0.7.1] — 2026-10-30 — Exploitation : tâches planifiées et tests front

### Ajouté
- Tâches planifiées serveur : `deploy/install-crons.sh` (purge RGPD à 3 h 15, sauvegarde à 3 h 45, rejouable,
  `--remove`) et `deploy/backup-db.sh` (dump MariaDB compressé, droits 600, 14 jours conservés, mot de passe
  hors ligne de commande).
- Tests front (34, Jasmine/Karma) : connexion, renouvellement unique du jeton, déconnexion, intercepteur JWT
  (jeton jamais envoyé hors de l'API, refresh puis rejeu sur 401, pas de refresh sur 403), gardes de routes, et
  cohérence du parcours de leçons (15 par niveau, Expert = Premium, métadonnées identiques à `expert.json` de l'API).
  `npm run test:ci` utilise un Chrome sans interface compatible conteneur (`karma.conf.js`).

## [0.7.0] — 2026-10-30 — Bêta : Premium, leçons Expert, boutique de démonstration

### Ajouté
- Leçons Expert (15) réservées aux membres Premium : le contenu n'est plus embarqué dans le front, il est servi par
  `GET /api/lessons/expert/{slug}` (401 anonyme, 403 `premium_required`, `Cache-Control: private, no-store`) depuis
  `backPoker/resources/lessons/expert.json`. Front : badge Premium et cadenas dans la liste, panneau de déverrouillage.
- Boutique de démonstration (activée sur la bêta seulement, aucune vente réelle) et zone « En ligne » du calendrier.
- Abonnement Premium (préparation, paiement en ligne fermé) : vidéos marquées « Premium » (niveau avancé),
  verrouillées pour les visiteurs et membres non abonnés (`premium`, `locked` ; identifiant YouTube masqué),
  favoris toujours possibles. Rôle dynamique `ROLE_PREMIUM` tant que `premiumUntil` est dans le futur.
- API : `GET /api/premium/plans` (prix TTC en centimes, `.env` `PREMIUM_PRICE_*`), `POST /api/premium/subscribe`
  (503 tant que `PREMIUM_PAYMENT_ENABLED=0` ; prestataire `PremiumPaymentProvider`, factice en dev/test, Stripe préparé
  mais non branché) ; `GET /api/me` expose `premium` et `premiumUntil`.
- Activation manuelle pour la bêta : `php bin/console app:user:premium email --months=N` (`--revoke`), champ
  « Premium jusqu'au » dans la fiche utilisateur et liste « Abonnements Premium » (lecture seule) dans le back-office.
- Front : badge Premium et cadenas sur les vidéos, panneau « Débloquer avec Premium », page `/premium` (avantages,
  formules mensuelle et annuelle), statut dans « Mon espace », section « Abonnement Premium » des CGU à compléter.
- RGPD : abonnements inclus dans l'export ; conservés à l'anonymisation (comptabilité) sans donnée nominative.
- Compte de démo `premium@pokervitrine.local` (fixtures).

## [0.6.0] — 2026-10-30 — Bêta privée

### Ajouté
- Bêta privée en ligne sur https://beta.redkards-dev.fr (mot de passe + noindex), API sur https://api.redkards-dev.fr (o2switch, PHP 8.3, MariaDB 11.4).
- Commande `app:content:seed` : contenu de base en production (forum, vidéos, actualités, calendrier), sans compte de démo.
- Angular 19 → 22 (0 vulnérabilité npm).
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

## v2.0 (en préparation, branche feature/boutique-v2)

Non publiée : la boutique est **désactivée par défaut** (`SHOP_ENABLED=0` côté API, `shopEnabled: false` côté
front). Activation et obligations légales : [docs/boutique/README.md](docs/boutique/README.md).

### Ajouté
- Boutique : catalogue de livres (TVA 5,5 %) et d'accessoires (TVA 20 %) avec filtre par catégorie, fiche
  produit, panier conservé dans le navigateur, récapitulatif avec adresse de livraison et acceptation des CGV.
- Commandes réservées aux membres vérifiés : prix, TVA et stock recalculés par le serveur, réservation atomique
  du stock, limite de 5 commandes / 10 minutes, page « Mes commandes » dans l'espace membre.
- Paiement : interface prestataire, prestataire factice (commande « en attente »), Stripe Checkout préparé mais
  non branché (aucune clé, aucun appel réseau).
- Back-office : produits et commandes (expédition, annulation avec remise en stock).
- Page CGV (modèle à compléter : rétractation 14 jours, TVA, livraison, médiateur).
- RGPD : commandes dans l'export ; conservées sans lien vers le compte après suppression (obligation comptable).

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
