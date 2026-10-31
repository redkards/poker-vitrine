//! Moteur du solver GTO de Poker Winners.
//!
//! Écrit de zéro (aucun code repris de projets sous licence AGPL).
//! Référence algorithmique : Brown & Sandholm, « Solving Imperfect-Information
//! Games via Discounted Regret Minimization » (AAAI 2019).
//!
//! Modules :
//! - [`cards`] : cartes, paquet, conversion texte ;
//! - [`range`] : 169 classes de mains, combos et ranges pondérées ;
//! - [`cfr`] : interface de jeu générique, solveur DCFR, meilleure réponse et exploitabilité ;
//! - [`games`] : jeux de validation (Kuhn, Leduc).

pub mod cards;
pub mod cfr;
pub mod games;
pub mod range;
