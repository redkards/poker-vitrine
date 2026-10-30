# Poker Winners

Site communautaire poker francophone (actualités, forum, vidéos, leçons, calendrier des tournois).
Projet indépendant : il ne partage ni code, ni base, ni configuration avec un autre projet.

**Mémoire commune PC / téléphone :** faire `git pull` puis lire [MEMOIRE.md](MEMOIRE.md) au démarrage ; le mettre à jour,
commit et push avant de s'arrêter ou de changer d'appareil.

## Structure
- `backPoker/` : API Symfony 7.4 (PHP 8.2), Doctrine/MariaDB 10.6, JWT + refresh tokens, EasyAdmin.
- `frontPoker/` : Angular 22 (standalone, signals), Node ≥ 22.22.3 (ou 24).
- `docker-compose.yml` : MariaDB (port hôte 3307), Mailhog (1025/8025), Mercure.
- `deploy/` : scripts o2switch (`server-setup.sh`, `deploy.sh`, `publish-front.sh`).
- `docs/` : recap, guide de déploiement, contenus (actualités, calendrier, vidéos), design, ROADMAP.

## Lancer en local
1. Démarrer Docker Desktop puis `docker compose up -d` à la racine.
2. API : `cd backPoker && php -S localhost:8000 -t public public/index.php`
3. Front : `cd frontPoker && npx ng serve --port 4300`

Comptes de démo (fixtures) : `demo@pokervitrine.local` / `admin@pokervitrine.local`.

## Vérifications
- Back : `cd backPoker && php bin/phpunit` (SQLite, `.env.test`).
- Front : `cd frontPoker && npm run test:ci && npx ng build`.

## Règles
- Ne jamais mettre le site en ligne (redkards-dev.fr) sans confirmation explicite.
- Ne jamais committer de secrets (`.env.local`, `.env.*.local`, `*.pem`).
- Commit + push sur `origin/main` à chaque étape validée (tests verts).
- Vidéos : uniquement des contenus sous licence libre (CC BY) avec attribution.
- Versionnage SemVer : mettre à jour `CHANGELOG.md`, la version de `frontPoker/package.json` et créer un tag `vX.Y.Z` à chaque release.
