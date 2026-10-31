# Mémoire commune — Poker Winners

Fichier partagé entre toutes les sessions Claude (PC et téléphone). GitHub est le seul lien entre elles :
elles ne peuvent ni se parler ni lire la mémoire privée de l'autre.

**Au démarrage :** `git pull` puis lire ce fichier.
**Avant de s'arrêter ou de changer d'appareil :** mettre à jour ce fichier, puis commit et push.

Aucun mot de passe, jeton ni secret ici : ce fichier est versionné.

## État actuel (mis à jour le 2026-10-30, depuis le PC)

- Version du code : **0.8.1** (`main`, commit `135facd`). Front bêta compilé depuis ce commit sur `front-beta`.
- Bêta privée : https://beta.redkards-dev.fr ; API : https://api.redkards-dev.fr.
- Site public redkards-dev.fr : non publié.

## À confirmer

- La bêta en ligne est-elle bien en 0.8.1 ? (`update.sh` à lancer dans le Terminal cPanel)
- Les tâches planifiées sont-elles installées ? (`deploy/install-crons.sh`)
- Commandes de la v0.7.0 lancées sur le serveur ? (`app:content:seed --shop-demo --env=prod`, puis `app:user:premium` pour le compte du propriétaire)

## Reste à faire

- [ ] Relancer les tests back et front sur la v0.8.1.
- [ ] Créer et pousser les tags manquants `v0.7.1`, `v0.8.0`, `v0.8.1`, une fois les tests verts.
- [ ] Le propriétaire teste la bêta et remonte les anomalies.
- [ ] Rédiger la section « Abonnement Premium » des CGU.
- [ ] Premium payant : valider prix et CGV, brancher Stripe, emails, expiration automatique.
- [ ] Solver GTO (`solver/`, mini-structure « PW Solver ») : lot L2 (arbre postflop, évaluateur, river) jusqu'au GO 1.
- [ ] Publication publique v1.0 : uniquement après confirmation explicite du propriétaire.

## Façon de travailler

- Un seul appareil à la fois sur le projet, pour éviter les conflits.
- Toujours `git fetch` avant de décrire l'état du projet.
- Commit et push à chaque étape validée (tests verts).
- À chaque release : `CHANGELOG.md`, version de `frontPoker/package.json` et tag `vX.Y.Z`.
- Rapport PDF labellisé (version et date) dans `docs/recap/` en fin de lot de travail.
- Ne jamais demander ni coller de mot de passe dans le chat.
- `pdfPoker/` : documents personnels, jamais dans Git.

## Particularités techniques

- SSH bloqué depuis le PC : la mise à jour du serveur passe par le Terminal cPanel (`deploy/update.sh`).
- Front publié avec `bash deploy/build-front.sh` (branche `front-beta`).
- Front local sur le port 4300 ; le 4200 est réservé à un autre projet, sans lien avec celui-ci.
- Sur le PC : Docker Desktop à relancer après un redémarrage ; OneDrive ralentit le premier démarrage de Symfony
  (une à plusieurs minutes) et les tests back (environ 5 minutes), et peut verrouiller un fichier au build (EBUSY).

## Journal

- 2026-10-30, PC : v0.7.0 (Premium, leçons Expert servies par l'API, boutique de démonstration).
- 2026-10-30, téléphone : v0.7.1 (crons, tests front), v0.8.0 (tableaux de ranges, mentions légales), v0.8.1 (UTG).
- 2026-10-30, PC : création de ce fichier.
- 2026-10-31, cloud : solver v0.1.0, lots L0 (cartes, ranges) et L1 (DCFR validé sur Kuhn et Leduc, 12 tests verts), commit `dd529a3`. Projet rattaché à la mini-structure « PW Solver » (décision PARADOXX D-022).
