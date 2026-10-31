# Solver GTO Poker Winners — moteur

Module isolé du site (Angular / Symfony). Moteur écrit de zéro, sans code repris de projets AGPL.

## État (v0.1.0, 31/10/2026)

- **L0** : cartes, paquet, 169 classes de mains, 1 326 combos, ranges pondérées, cartes mortes.
- **L1** : moteur CFR générique (Discounted CFR, α = 1,5 ; β = 0 ; γ = 2), meilleure réponse, exploitabilité.
  - Kuhn : valeur −1/18 retrouvée, exploitabilité 0,00015 après 1 000 itérations.
  - Leduc : valeur −0,0856 retrouvée, exploitabilité 0,0002 après 1 000 itérations (CFR classique : 0,012).

## Commandes

```
cd solver
cargo test --release                          # tests unitaires et de convergence
cargo run --release --example convergence     # courbes DCFR vs CFR classique
```

## Suite

L2 : arbre postflop, évaluateur de mains, showdown en O(n), résolution de river → **GO 1** (river < 0,1 % du pot).
