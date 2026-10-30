# Tableaux de ranges préflop — synthèse des sources (30/10/2026)

Recherche menée pour calibrer la page `/lecons/ranges` (v0.8.0). Les chiffres viennent de sites de formation et
de blogs qui résument des solveurs, pas de sorties de solveur vérifiées. kill-tilt.fr et pokerpro.fr n'étaient pas
accessibles depuis la session de recherche : seuls leurs extraits de moteur de recherche ont été lus.

## 1. Principes

- Grille 13 × 13 : 169 mains distinctes, 1 326 combinaisons (paires 6, assorties 4, dépareillées 12).
- Un tableau n'est valable que pour ses hypothèses : format (6 ou 9 joueurs), tapis, taille d'ouverture, rake, antes.
- Les ranges s'élargissent vers le bouton ; chaque position reprend la range de la précédente.

## 2. Ouvertures (premier à entrer, cash 100 BB)

| Position | 6 joueurs | 9 joueurs |
|---|---|---|
| UTG | 13–18 % (médiane ≈ 15 %) | 9–12 % |
| HJ / MP | 18–22 % | 15–20 % |
| CO | 25–28 % | 25–28 % |
| BTN | 40–50 % (médiane ≈ 43 %) | 44–48 % |
| SB | 33–48 % selon le modèle (relance seule, limp mixte, blinde contre blinde) | idem |

À 9 joueurs, seules les premières positions se resserrent (≈ 3 à 5 points).

## 3. 3-bet et défense des blindes

- Largeur selon l'ouvreur : ≈ 4–5 % face à une ouverture précoce, 6,5–9 % BTN contre CO, 12–16 % des blindes
  contre une ouverture tardive.
- Forme : linéaire en position, polarisée hors de position (valeur + bluffs bloqueurs, ex. A5s, A4s).
- Taille : ≈ 3 fois l'ouverture en position, 3,5 à 4 fois hors de position (≈ 10 BB en BB contre 2,5 BB).
- BB contre BTN : défense de 52 à 58 % selon les solveurs, dont ≈ 12 % en 3-bet ; la population se couche trop
  (≈ 40–45 % de folds).

## 4. Tournois

- Taille d'ouverture : ≈ 2,3 BB à 40 BB ; 2 BB ou tapis à 20 BB.
- Largeur (8 joueurs, sans ICM) : BTN ≈ 52 % à 40 BB, ≈ 42 % à 20 BB ; UTG ≈ 17 %.
- Sous 10–15 BB : push/fold (Nash). À 10 BB, tapis depuis le BTN ≈ 40–44 % selon les antes et la table ; SB ≈ 50 %.
- ICM (bulle, table finale) : resserre surtout les paiements de tapis ; ajustements à calculer au cas par cas.

## 5. Limites

1. Un tableau ignore l'adversaire, les tailles réelles et la dynamique de la table.
2. Les solveurs simplifient l'arbre de jeu (peu de tailles de mise).
3. L'exploitation des erreurs prévisibles rapporte davantage ; l'équilibre reste une base sûre.
4. Beaucoup de tableaux publiés sont « calibrés », pas issus d'un solveur.
5. Tableaux interdits à la table en salle physique ; règles variables en ligne.

## 6. Sources françaises

- **Kill Tilt** : surtout des discussions de membres du forum, ranges dites « largement empiriques ». Range de CO
  cash citée : 22+, A2s+, A8o+ (ou A9o+), broadways, connecteurs assortis, quelques 1-gappers, K6s+ ; UTG ≈ 13 %.
- **YoViral (PokerPro.fr)** : pédagogie de la grille et méthode de construction (pour chaque position : relances,
  paiements, 3-bets, avec % et combinaisons). Pas de tableau chiffré trouvé.
- Winamax, Club Poker, Poker Académie : rien d'exploitable trouvé.

Aucun tableau tiers n'est reproduit sur le site (droit d'auteur) : les tableaux Poker Winners sont des repères
originaux, recoupés avec ces ordres de grandeur.

## 7. Poker Winners face au consensus (v0.8.0)

| Situation | Poker Winners | Consensus |
|---|---|---|
| UTG | 16,1 % | 13–18 % |
| HJ | 20,4 % | 18–22 % |
| CO | 27,0 % | 25–28 % |
| BTN | 42,1 % | 40–50 % |
| SB | 33,9 % | 33–48 % |
| BB contre BTN (Expert) | 52 % défendues, 3-bet 6,8 % | 52–58 %, 3-bet ≈ 12 % |

Pistes : élargir le 3-bet BB contre BTN ; ajouter des tableaux tournoi (40 BB, 20 BB, push/fold 10 BB) au
Premium ; afficher les hypothèses de chaque tableau.

## Sources

- Ouvertures : [GTO Gecko](https://gtogecko.com/blog/preflop-charts-opening-ranges) ·
  [Preflop Wizard 6-max](https://www.preflopwizard.app/blog/6-max-preflop-charts) ·
  [Preflop Wizard 9-max](https://www.preflopwizard.app/blog/9-max-preflop-chart) ·
  [PokerTube](https://www.pokertube.com/article/how-to-use-a-preflop-chart-in-poker) ·
  [PokerSkill](https://www.pokerskill.com/charts/preflop/) ·
  [Toolsgambling](https://toolsgambling.com/blog/poker-hand-ranges-preflop-charts) ·
  [RiverOdds](https://riverodds.app/poker-preflop-charts/)
- 3-bet : [VIP-Grinders](https://www.vip-grinders.com/poker-strategy/3-bet/) ·
  [Upswing Poker](https://upswingpoker.com/vs-3-bet-pre-flop-position-strategy-revealed/) ·
  [Deepfold](https://deepfold.co/en/blog/three-bet-strategy-guide) ·
  [PokerPro.tools](https://pokerpro.tools/preflop/3-bet-ranges)
- Défense BB : [VIP-Grinders BB vs BTN](https://www.vip-grinders.com/defend-the-big-blind-vs-button)
- Tournois : [Red Chip Poker](https://redchippoker.com/preflop-poker-charts/) · [ThinkGTO](https://thinkgto.com/mtt) ·
  [Simple GTO](https://simplegto.com/products/mtt-bundle) · [PrimeDope](https://www.primedope.com/pushbot-trainer/) ·
  [Deepfold push/fold](https://deepfold.co/en/blog/push-fold-complete-guide) ·
  [PokerSkill push/fold](https://www.pokerskill.com/charts/push-fold/)
- Limites : [Smart Poker Study](https://smartpokerstudy.com/when-to-ignore-preflop-range-charts/) ·
  [PokerCoaching](https://pokercoaching.com/preflop-charts/) · [BBZ Poker](https://bbzpoker.com/how-to-use-gto-charts/)
- Sources françaises : [Kill Tilt – ranges d'open 6max](https://www.kill-tilt.fr/forums/topic/cg-6max-nl25-composition-de-mes-ranges-dopen/) ·
  [Kill Tilt – sit&go](https://www.kill-tilt.fr/forums/topic/range-dopen-en-sitgo/) ·
  [PokerPro.fr – YoViral](https://www.pokerpro.fr/blog/poker-les-ranges/) ·
  [PokerPro.fr – ranges et solvers](https://www.pokerpro.fr/blog/les-ranges-et-les-solvers/) ·
  [Pokerregle.fr](https://www.pokerregle.fr/strategie/preflop-charts/) ·
  [Le Guide du poker](https://leguidedupoker.com/guide-poker/strategie/ranges-preflop/)
