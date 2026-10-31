//! Poker de Kuhn : 3 cartes (V, D, R), ante de 1, une mise de 1.
//! Valeur théorique pour le premier joueur : -1/18.

use crate::cfr::{Game, NodeKind};

#[derive(Clone, Debug)]
pub struct KuhnState {
    /// Cartes privées (0 = valet, 1 = dame, 2 = roi) ; `None` avant la donne.
    pub cards: Option<[u8; 2]>,
    /// Historique : 'p' = parole/passe, 'b' = mise/suivi.
    pub history: String,
}

pub struct Kuhn;

impl Kuhn {
    fn is_terminal(h: &str) -> bool {
        matches!(h, "pp" | "bp" | "bb" | "pbp" | "pbb")
    }
}

impl Game for Kuhn {
    type State = KuhnState;

    fn root(&self) -> KuhnState {
        KuhnState { cards: None, history: String::new() }
    }

    fn kind(&self, s: &KuhnState) -> NodeKind {
        if s.cards.is_none() {
            NodeKind::Chance
        } else if Kuhn::is_terminal(&s.history) {
            NodeKind::Terminal
        } else {
            NodeKind::Player(s.history.len() % 2)
        }
    }

    fn utility(&self, s: &KuhnState, player: usize) -> f64 {
        let c = s.cards.expect("donne faite");
        let showdown = |stake: f64| if c[0] > c[1] { stake } else { -stake };
        let u0 = match s.history.as_str() {
            "pp" => showdown(1.0),
            "bb" | "pbb" => showdown(2.0),
            "bp" => 1.0,   // le joueur 2 se couche
            "pbp" => -1.0, // le joueur 1 se couche
            h => panic!("historique non terminal : {h}"),
        };
        if player == 0 {
            u0
        } else {
            -u0
        }
    }

    fn chance_outcomes(&self, _s: &KuhnState) -> Vec<(KuhnState, f64)> {
        let mut v = Vec::new();
        for a in 0..3u8 {
            for b in 0..3u8 {
                if a != b {
                    v.push((KuhnState { cards: Some([a, b]), history: String::new() }, 1.0 / 6.0));
                }
            }
        }
        v
    }

    fn num_actions(&self, _s: &KuhnState) -> usize {
        2
    }

    fn apply(&self, s: &KuhnState, action: usize) -> KuhnState {
        let mut n = s.clone();
        n.history.push(if action == 0 { 'p' } else { 'b' });
        n
    }

    fn info_key(&self, s: &KuhnState) -> String {
        let c = s.cards.expect("donne faite");
        let me = s.history.len() % 2;
        format!("{}:{}", c[me], s.history)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cfr::{expected_value, exploitability, DcfrParams, Solver};

    #[test]
    fn dcfr_converge_vers_moins_un_dix_huitieme() {
        let game = Kuhn;
        let mut solver = Solver::new(&game, DcfrParams::RECOMMENDED);
        solver.run(2000);
        let policy = solver.average_policy();
        let value = expected_value(&game, &policy, 0);
        let expl = exploitability(&game, &policy);
        assert_eq!(solver.num_infosets(), 12);
        assert!((value - (-1.0 / 18.0)).abs() < 2e-3, "valeur = {value}");
        assert!(expl < 1e-3, "exploitabilité = {expl}");
    }

    #[test]
    fn strategie_uniforme_exploitable() {
        let game = Kuhn;
        let solver = Solver::new(&game, DcfrParams::RECOMMENDED);
        let expl = exploitability(&game, &solver.average_policy());
        assert!(expl > 0.1, "une stratégie aléatoire doit être exploitable : {expl}");
    }

    #[test]
    fn le_roi_ne_se_couche_jamais() {
        let game = Kuhn;
        let mut solver = Solver::new(&game, DcfrParams::RECOMMENDED);
        solver.run(2000);
        let p = solver.average_policy();
        // Joueur 2 avec le roi face à une mise : toujours suivre.
        let call = p.table["2:b"][1];
        assert!(call > 0.999, "roi face à mise : suivi = {call}");
        // Joueur 2 avec le valet face à une mise : toujours se coucher.
        let fold = p.table["0:b"][0];
        assert!(fold > 0.999, "valet face à mise : couché = {fold}");
    }
}
