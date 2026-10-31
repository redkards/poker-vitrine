//! Poker de Leduc : 6 cartes (deux valets, deux dames, deux rois), ante de 1,
//! deux tours d'enchères (mise de 2 puis de 4, au plus deux mises par tour),
//! une carte commune entre les deux tours. Sert à valider le moteur sur un jeu
//! à plusieurs tours, plus proche du hold'em que Kuhn.
//! Valeur théorique connue pour le premier joueur : environ -0,0856.

use crate::cfr::{Game, NodeKind};

#[derive(Clone, Debug)]
pub struct LeducState {
    /// Rangs des cartes privées (0 = valet, 1 = dame, 2 = roi).
    pub private: Option<[u8; 2]>,
    pub public: Option<u8>,
    /// 1 ou 2.
    pub round: u8,
    /// Historiques des deux tours : 'c' = parole/suivre, 'r' = miser/relancer, 'f' = se coucher.
    pub history: [String; 2],
    pub contrib: [f64; 2],
    pub to_act: usize,
    pub raises: u8,
    pub folded: Option<usize>,
    /// Tour terminé, carte commune pas encore distribuée.
    pub awaiting_public: bool,
    pub showdown: bool,
}

pub struct Leduc;

impl Leduc {
    fn bet_size(round: u8) -> f64 {
        if round == 1 {
            2.0
        } else {
            4.0
        }
    }
    fn facing_bet(s: &LeducState) -> bool {
        s.history[(s.round - 1) as usize].ends_with('r')
    }
    /// Actions légales sous forme de caractères, dans un ordre fixe.
    fn legal(s: &LeducState) -> Vec<char> {
        let mut v = Vec::with_capacity(3);
        if Leduc::facing_bet(s) {
            v.push('f');
        }
        v.push('c');
        if s.raises < 2 {
            v.push('r');
        }
        v
    }
    fn strength(private: u8, public: u8) -> u8 {
        if private == public {
            10 + private
        } else {
            private
        }
    }
}

impl Game for Leduc {
    type State = LeducState;

    fn root(&self) -> LeducState {
        LeducState {
            private: None,
            public: None,
            round: 1,
            history: [String::new(), String::new()],
            contrib: [1.0, 1.0],
            to_act: 0,
            raises: 0,
            folded: None,
            awaiting_public: false,
            showdown: false,
        }
    }

    fn kind(&self, s: &LeducState) -> NodeKind {
        if s.folded.is_some() || s.showdown {
            NodeKind::Terminal
        } else if s.private.is_none() || s.awaiting_public {
            NodeKind::Chance
        } else {
            NodeKind::Player(s.to_act)
        }
    }

    fn utility(&self, s: &LeducState, player: usize) -> f64 {
        let other = 1 - player;
        if let Some(f) = s.folded {
            return if f == player { -s.contrib[player] } else { s.contrib[other] };
        }
        let p = s.private.expect("donne faite");
        let board = s.public.expect("carte commune");
        let (me, them) = (Leduc::strength(p[player], board), Leduc::strength(p[other], board));
        match me.cmp(&them) {
            std::cmp::Ordering::Greater => s.contrib[other],
            std::cmp::Ordering::Less => -s.contrib[player],
            std::cmp::Ordering::Equal => 0.0,
        }
    }

    fn chance_outcomes(&self, s: &LeducState) -> Vec<(LeducState, f64)> {
        const DECK: [u8; 6] = [0, 0, 1, 1, 2, 2];
        let mut out = Vec::new();
        if s.private.is_none() {
            // 30 donnes ordonnées équiprobables.
            for i in 0..6 {
                for j in 0..6 {
                    if i != j {
                        let mut n = s.clone();
                        n.private = Some([DECK[i], DECK[j]]);
                        out.push((n, 1.0 / 30.0));
                    }
                }
            }
        } else {
            let p = s.private.expect("donne faite");
            // 4 cartes restantes équiprobables.
            let mut remaining: Vec<u8> = DECK.to_vec();
            for c in p {
                let idx = remaining.iter().position(|&x| x == c).expect("carte présente");
                remaining.remove(idx);
            }
            for c in remaining {
                let mut n = s.clone();
                n.public = Some(c);
                n.awaiting_public = false;
                n.round = 2;
                n.to_act = 0;
                n.raises = 0;
                out.push((n, 0.25));
            }
        }
        out
    }

    fn num_actions(&self, s: &LeducState) -> usize {
        Leduc::legal(s).len()
    }

    fn apply(&self, s: &LeducState, action: usize) -> LeducState {
        let act = Leduc::legal(s)[action];
        let mut n = s.clone();
        let me = s.to_act;
        let opp = 1 - me;
        let r = (s.round - 1) as usize;
        let was_facing = Leduc::facing_bet(s);
        let was_empty = s.history[r].is_empty();
        n.history[r].push(act);
        match act {
            'f' => n.folded = Some(me),
            'r' => {
                n.contrib[me] = s.contrib[opp] + Leduc::bet_size(s.round);
                n.raises += 1;
                n.to_act = opp;
            }
            'c' => {
                if was_facing {
                    n.contrib[me] = s.contrib[opp];
                    end_round(&mut n);
                } else if was_empty {
                    n.to_act = opp;
                } else {
                    end_round(&mut n);
                }
            }
            _ => unreachable!(),
        }
        n
    }

    fn info_key(&self, s: &LeducState) -> String {
        let p = s.private.expect("donne faite");
        let board = s.public.map(|c| c.to_string()).unwrap_or_else(|| "-".into());
        format!("{}{}:{}/{}", p[s.to_act], board, s.history[0], s.history[1])
    }
}

fn end_round(n: &mut LeducState) {
    if n.round == 1 {
        n.awaiting_public = true;
    } else {
        n.showdown = true;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cfr::{expected_value, exploitability, DcfrParams, Solver};

    #[test]
    fn nombre_d_ensembles_d_information() {
        let game = Leduc;
        let mut solver = Solver::new(&game, DcfrParams::RECOMMENDED);
        solver.iterate();
        // Valeur de référence de la littérature : 288 ensembles d'information.
        assert_eq!(solver.num_infosets(), 288);
    }

    #[test]
    fn dcfr_converge_sur_leduc() {
        let game = Leduc;
        let mut solver = Solver::new(&game, DcfrParams::RECOMMENDED);
        solver.run(1000);
        let policy = solver.average_policy();
        let value = expected_value(&game, &policy, 0);
        let expl = exploitability(&game, &policy);
        assert!(expl < 1e-3, "exploitabilité = {expl}");
        assert!((value - (-0.0856)).abs() < 5e-3, "valeur = {value}");
    }

    #[test]
    fn dcfr_plus_rapide_que_cfr_vanilla() {
        let game = Leduc;
        let mut dcfr = Solver::new(&game, DcfrParams::RECOMMENDED);
        let mut vanilla = Solver::new(&game, DcfrParams::VANILLA);
        dcfr.run(200);
        vanilla.run(200);
        let e_d = exploitability(&game, &dcfr.average_policy());
        let e_v = exploitability(&game, &vanilla.average_policy());
        assert!(e_d < e_v, "DCFR {e_d} doit battre CFR {e_v}");
    }
}
