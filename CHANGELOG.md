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
