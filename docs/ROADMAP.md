# Feuille de route — PokerVitrine

Le produit évoluera par versions successives. Chaque version est livrable seule, testée, et
documentée dans le [journal des versions](../CHANGELOG.md).

## v1.0 — Mise en ligne (MVP)
Objectif : ouvrir le site au public sur **redkards-dev.fr**, après confirmation du propriétaire.
- Finitions : tests front (Jasmine), balises SEO.
- [x] Documentation de l'API (`/api/doc`, en développement uniquement).
- Déploiement o2switch : sous-domaine `api.`, HTTPS, MariaDB, emails, crons RGPD, sauvegardes.
- Mentions légales et politique de confidentialité complétées et relues.

## v1.1 — Communauté
- [x] Signalement d'un message du forum par les membres (file de modération) — API et back-office prêts, écran front à faire.
- [x] Recherche dans le forum et les actualités — API prête, écran front à faire.
- [x] Profil public d'un membre (pseudo, date d'inscription, nombre de messages) — API prête, écran front à faire.
- Notifications dans le site (en plus des emails).

## v1.2 — Apprentissage
- Nouvelles leçons interactives et parcours par niveau (débutant → avancé).
- Suivi de progression enregistré sur le compte (et non plus seulement dans le navigateur).
- Vidéos produites par PokerVitrine à partir des scripts (`docs/videos`).

## v2.0 — Nouvelles rubriques (hors MVP du dossier de conception)
- Quiz interactifs et classements.
- Agenda des tournois.
- Newsletter (avec consentement dédié).
- Double authentification (TOTP).
- Boutique : livres de formation et accessoires (Stripe, factures, CGV, TVA 5,5 % / 20 %) —
  version majeure car elle ajoute des obligations légales et de nouvelles données personnelles.

## Règles pour faire évoluer le produit sans casser l'existant
- **Base de données** : toute évolution passe par une nouvelle migration Doctrine ; on ne modifie
  jamais une migration déjà exécutée en production.
- **API** : on ajoute des champs ou des routes sans en retirer. Un changement incompatible se fait
  sous un nouveau préfixe (`/api/v2/…`) en gardant l'ancien le temps de la transition.
- **CGU** : toute modification incrémente `CGU_VERSION` ; les membres acceptent la nouvelle version
  à leur prochaine connexion (à développer en v1.1).
- **Fonctionnalités en préparation** : développées sur une branche Git dédiée, fusionnées dans
  `main` une fois testées.
- **Livraison** : mise à jour du `CHANGELOG.md`, du numéro de version (`frontPoker/package.json`),
  puis étiquette Git `vX.Y.Z`.
