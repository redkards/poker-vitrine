//! Arbre de mises d'une street (river en L2).
//!
//! Conventions :
//! - joueur 0 = OOP (parle en premier), joueur 1 = IP ;
//! - `contrib[p]` = jetons mis par p pendant la street (le pot de départ est
//!   supposé payé à parts égales, `pot / 2` chacun) ;
//! - les tailles sont des fractions du pot au moment de l'action
//!   (0,5 = mise de la moitié du pot) ;
//! - une mise qui dépasse `allin_threshold` × tapis devient un tapis.

use std::fmt;

#[derive(Clone, Debug, Default)]
pub struct BetSizes {
    /// Tailles d'ouverture (mise), en fraction du pot.
    pub bets: Vec<f64>,
    /// Tailles de relance, en fraction du pot après paiement.
    pub raises: Vec<f64>,
}

#[derive(Clone, Debug)]
pub struct TreeConfig {
    /// Pot au début de la street (en BB).
    pub pot: f64,
    /// Tapis effectif restant au début de la street (en BB).
    pub stack: f64,
    /// Tailles autorisées pour OOP (indice 0) et IP (indice 1).
    pub sizes: [BetSizes; 2],
    /// Nombre maximal de relances dans la street.
    pub max_raises: usize,
    /// Ajoute l'option tapis à chaque décision où elle est possible.
    pub add_allin: bool,
    /// Au-delà de cette fraction du tapis, une mise devient un tapis.
    pub allin_threshold: f64,
}

impl TreeConfig {
    /// Configuration simple : mêmes tailles pour les deux joueurs.
    pub fn simple(pot: f64, stack: f64, bets: &[f64], raises: &[f64], max_raises: usize) -> TreeConfig {
        let s = BetSizes { bets: bets.to_vec(), raises: raises.to_vec() };
        TreeConfig { pot, stack, sizes: [s.clone(), s], max_raises, add_allin: true, allin_threshold: 0.67 }
    }
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Action {
    Fold,
    Check,
    Call,
    /// Mise : contribution totale de la street après l'action.
    Bet(f64),
    /// Relance : contribution totale de la street après l'action.
    Raise(f64),
    /// Tapis : contribution totale = tapis.
    AllIn(f64),
}

impl Action {
    /// Libellé français court, pour l'interface et les explications.
    pub fn label_fr(&self) -> String {
        match *self {
            Action::Fold => "Se coucher".into(),
            Action::Check => "Parole".into(),
            Action::Call => "Suivre".into(),
            Action::Bet(x) => format!("Miser {}", fmt_bb(x)),
            Action::Raise(x) => format!("Relancer à {}", fmt_bb(x)),
            Action::AllIn(x) => format!("Tapis ({})", fmt_bb(x)),
        }
    }
}

fn fmt_bb(x: f64) -> String {
    let r = (x * 10.0).round() / 10.0;
    if (r - r.round()).abs() < 1e-9 {
        format!("{} BB", r as i64)
    } else {
        format!("{r:.1} BB").replace('.', ",")
    }
}

impl fmt::Display for Action {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.label_fr())
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum NodeKind {
    /// Le joueur `folder` s'est couché.
    Fold { folder: usize },
    /// Abattage : contributions égales.
    Showdown,
    /// Décision du joueur `player`.
    Decision { player: usize },
}

#[derive(Clone, Debug)]
pub struct Node {
    pub kind: NodeKind,
    pub contrib: [f64; 2],
    pub actions: Vec<Action>,
    pub children: Vec<usize>,
    /// Suite d'actions depuis la racine (pour l'affichage).
    pub history: Vec<Action>,
}

#[derive(Clone, Debug)]
pub struct Tree {
    pub config: TreeConfig,
    pub nodes: Vec<Node>,
}

const EPS: f64 = 1e-9;

impl Tree {
    pub fn build(config: TreeConfig) -> Tree {
        assert!(config.pot > 0.0 && config.stack >= 0.0, "pot et tapis invalides");
        let mut tree = Tree { config, nodes: Vec::new() };
        tree.add(0, [0.0, 0.0], 0, false, Vec::new());
        tree
    }

    pub fn root(&self) -> usize {
        0
    }

    pub fn num_decisions(&self) -> usize {
        self.nodes.iter().filter(|n| matches!(n.kind, NodeKind::Decision { .. })).count()
    }

    fn push(&mut self, kind: NodeKind, contrib: [f64; 2], history: Vec<Action>) -> usize {
        self.nodes.push(Node { kind, contrib, actions: Vec::new(), children: Vec::new(), history });
        self.nodes.len() - 1
    }

    /// `checked` : OOP a déjà fait parole (sans mise en face).
    fn add(&mut self, player: usize, contrib: [f64; 2], raises: usize, checked: bool, history: Vec<Action>) -> usize {
        let id = self.push(NodeKind::Decision { player }, contrib, history.clone());
        let opp = 1 - player;
        let cfg = self.config.clone();
        let stack = cfg.stack;
        let mut actions: Vec<Action> = Vec::new();
        let facing = contrib[opp] > contrib[player] + EPS;

        if facing {
            actions.push(Action::Fold);
            actions.push(Action::Call);
            let to_call = contrib[opp];
            if raises < cfg.max_raises && to_call < stack - EPS {
                let pot_after_call = cfg.pot + 2.0 * to_call;
                for &f in &cfg.sizes[player].raises {
                    let target = to_call + f * pot_after_call;
                    actions.push(self.sized(Action::Raise(target), target));
                }
                if cfg.add_allin {
                    actions.push(Action::AllIn(stack));
                }
            }
        } else {
            actions.push(Action::Check);
            if stack > contrib[player] + EPS {
                let base = contrib[player];
                let pot_now = cfg.pot + contrib[0] + contrib[1];
                for &f in &cfg.sizes[player].bets {
                    let target = base + f * pot_now;
                    actions.push(self.sized(Action::Bet(target), target));
                }
                if cfg.add_allin {
                    actions.push(Action::AllIn(stack));
                }
            }
        }
        dedup(&mut actions);

        let mut children = Vec::with_capacity(actions.len());
        for &a in &actions {
            let mut h = history.clone();
            h.push(a);
            let child = match a {
                Action::Fold => self.push(NodeKind::Fold { folder: player }, contrib, h),
                Action::Call => {
                    let mut c = contrib;
                    c[player] = c[opp];
                    self.push(NodeKind::Showdown, c, h)
                }
                Action::Check => {
                    if player == 1 || checked {
                        self.push(NodeKind::Showdown, contrib, h)
                    } else {
                        self.add(opp, contrib, raises, true, h)
                    }
                }
                Action::Bet(x) | Action::Raise(x) | Action::AllIn(x) => {
                    let mut c = contrib;
                    c[player] = x;
                    let r = if facing { raises + 1 } else { raises };
                    self.add(opp, c, r, checked, h)
                }
            };
            children.push(child);
        }
        self.nodes[id].actions = actions;
        self.nodes[id].children = children;
        id
    }

    /// Transforme une mise trop grosse en tapis.
    fn sized(&self, a: Action, target: f64) -> Action {
        let stack = self.config.stack;
        if target >= self.config.allin_threshold * stack - EPS || target >= stack - EPS {
            Action::AllIn(stack)
        } else {
            a
        }
    }
}

fn amount(a: &Action) -> Option<f64> {
    match *a {
        Action::Bet(x) | Action::Raise(x) | Action::AllIn(x) => Some(x),
        _ => None,
    }
}

/// Supprime les doublons de montant (ex. deux tailles devenues tapis).
fn dedup(actions: &mut Vec<Action>) {
    let mut seen: Vec<f64> = Vec::new();
    actions.retain(|a| match amount(a) {
        None => true,
        Some(x) => {
            if seen.iter().any(|&y| (x - y).abs() < 1e-6) {
                false
            } else {
                seen.push(x);
                true
            }
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn arbre_check_check() {
        let cfg = TreeConfig { pot: 10.0, stack: 50.0, sizes: Default::default(), max_raises: 0, add_allin: false, allin_threshold: 0.67 };
        let t = Tree::build(cfg);
        // OOP : parole → IP : parole → abattage.
        assert_eq!(t.nodes.len(), 3);
        assert_eq!(t.num_decisions(), 2);
        assert!(matches!(t.nodes[2].kind, NodeKind::Showdown));
    }

    #[test]
    fn mises_et_relances() {
        let t = Tree::build(TreeConfig::simple(10.0, 100.0, &[0.5, 1.0], &[1.0], 1));
        let root = &t.nodes[0];
        assert_eq!(root.actions, vec![Action::Check, Action::Bet(5.0), Action::Bet(10.0), Action::AllIn(100.0)]);
        // Face à 5 : relance à 5 + 1,0 × (10 + 10) = 25.
        let facing = &t.nodes[root.children[1]];
        assert_eq!(facing.actions, vec![Action::Fold, Action::Call, Action::Raise(25.0), Action::AllIn(100.0)]);
        // Après une relance, plus de relance (plafond 1).
        let after_raise = &t.nodes[facing.children[2]];
        assert_eq!(after_raise.actions, vec![Action::Fold, Action::Call]);
    }

    #[test]
    fn grosse_mise_devient_tapis() {
        // Tapis 12 dans un pot de 10 : une mise pot (10) dépasse 67 % du tapis.
        let t = Tree::build(TreeConfig::simple(10.0, 12.0, &[0.5, 1.0], &[], 0));
        assert_eq!(t.nodes[0].actions, vec![Action::Check, Action::Bet(5.0), Action::AllIn(12.0)]);
    }

    #[test]
    fn contributions_equilibrees_a_l_abattage() {
        let t = Tree::build(TreeConfig::simple(20.0, 60.0, &[0.33, 0.75], &[0.8], 2));
        for n in &t.nodes {
            if let NodeKind::Showdown = n.kind {
                assert!((n.contrib[0] - n.contrib[1]).abs() < 1e-9, "{:?}", n.history);
            }
            for x in n.contrib {
                assert!(x <= 60.0 + 1e-9);
            }
        }
    }
}
