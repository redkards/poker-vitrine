//! Résolution de la river, range contre range (lot L2).
//!
//! Approche « vectorisée » des solvers postflop : chaque nœud de l'arbre de
//! mises stocke une stratégie par main du joueur qui agit, et un parcours
//! calcule d'un coup la valeur contrefactuelle de toutes les mains.
//! Algorithme : Discounted CFR (mêmes paramètres que [`crate::cfr`]),
//! mises à jour alternées. Abattage et passes en O(n log n) avec prise en
//! compte des bloqueurs (une carte ne peut pas être chez les deux joueurs).
//!
//! Unités : jetons (BB). Les valeurs renvoyées sont l'espérance de gain
//! net d'un joueur au début de la river (0 = il récupère sa mise de départ).

use crate::cards::{mask_of, Card};
use crate::cfr::DcfrParams;
use crate::eval::{evaluate_mask, Strength};
use crate::range::Range;
use crate::tree::{Action, NodeKind, Tree, TreeConfig};

/// Une main en jeu pour un joueur.
#[derive(Clone, Copy, Debug)]
pub struct Hand {
    pub cards: [Card; 2],
    pub weight: f64,
    pub strength: Strength,
}

/// Description d'un spot de river.
#[derive(Clone, Debug)]
pub struct RiverSpot {
    pub board: [Card; 5],
    /// Ranges OOP (0) et IP (1) avant élimination des cartes mortes.
    pub ranges: [Range; 2],
    pub tree: TreeConfig,
}

struct NodeData {
    /// [action * nh + main]
    regret: Vec<f64>,
    strategy_sum: Vec<f64>,
}

pub struct RiverSolver {
    pub tree: Tree,
    pub hands: [Vec<Hand>; 2],
    /// Pour chaque main de p : indice de la même combinaison chez l'adversaire.
    same: [Vec<Option<usize>>; 2],
    /// Indices triés par force croissante.
    order: [Vec<usize>; 2],
    data: Vec<Option<NodeData>>,
    params: DcfrParams,
    iterations: u64,
    /// Somme des poids des couples de mains compatibles.
    pair_weight: f64,
}

fn card_ids(h: &Hand) -> (usize, usize) {
    (h.cards[0].0 as usize, h.cards[1].0 as usize)
}

impl RiverSolver {
    pub fn new(spot: &RiverSpot, params: DcfrParams) -> Result<RiverSolver, String> {
        let board_mask = mask_of(&spot.board);
        if board_mask.count_ones() != 5 {
            return Err("board invalide : 5 cartes distinctes attendues".into());
        }
        let mut hands: [Vec<Hand>; 2] = [Vec::new(), Vec::new()];
        for p in 0..2 {
            let mut r = spot.ranges[p].clone();
            r.remove_dead(board_mask);
            for (c, &w) in r.combos.iter().zip(r.weights.iter()) {
                if w <= 0.0 || c.mask() & board_mask != 0 {
                    continue;
                }
                hands[p].push(Hand {
                    cards: [c.0, c.1],
                    weight: w as f64,
                    strength: evaluate_mask(board_mask | c.mask()),
                });
            }
            if hands[p].is_empty() {
                return Err(format!("range {} vide après retrait des cartes du board", if p == 0 { "OOP" } else { "IP" }));
            }
        }
        let key = |h: &Hand| {
            let (a, b) = card_ids(h);
            (a.min(b), a.max(b))
        };
        let mut same: [Vec<Option<usize>>; 2] = [Vec::new(), Vec::new()];
        for p in 0..2 {
            same[p] = hands[p]
                .iter()
                .map(|h| hands[1 - p].iter().position(|o| key(o) == key(h)))
                .collect();
        }
        let mut order: [Vec<usize>; 2] = [Vec::new(), Vec::new()];
        for p in 0..2 {
            let mut idx: Vec<usize> = (0..hands[p].len()).collect();
            idx.sort_by_key(|&i| hands[p][i].strength);
            order[p] = idx;
        }
        let tree = Tree::build(spot.tree.clone());
        let data = tree
            .nodes
            .iter()
            .map(|n| match n.kind {
                NodeKind::Decision { player } => {
                    let size = n.actions.len() * hands[player].len();
                    Some(NodeData { regret: vec![0.0; size], strategy_sum: vec![0.0; size] })
                }
                _ => None,
            })
            .collect();
        let mut solver = RiverSolver { tree, hands, same, order, data, params, iterations: 0, pair_weight: 0.0 };
        let w1: Vec<f64> = solver.hands[1].iter().map(|h| h.weight).collect();
        let avail = solver.available(0, &w1);
        solver.pair_weight = solver.hands[0].iter().zip(avail.iter()).map(|(h, a)| h.weight * a).sum();
        if solver.pair_weight <= 0.0 {
            return Err("aucun couple de mains compatible".into());
        }
        Ok(solver)
    }

    pub fn iterations(&self) -> u64 {
        self.iterations
    }

    pub fn pot(&self) -> f64 {
        self.tree.config.pot
    }

    /// Pour chaque main de `p` : poids adverse compatible (bloqueurs exclus).
    fn available(&self, p: usize, reach_opp: &[f64]) -> Vec<f64> {
        let o = 1 - p;
        let mut card_sum = [0.0f64; 52];
        let mut total = 0.0;
        for (h, &r) in self.hands[o].iter().zip(reach_opp) {
            let (a, b) = card_ids(h);
            card_sum[a] += r;
            card_sum[b] += r;
            total += r;
        }
        self.hands[p]
            .iter()
            .enumerate()
            .map(|(i, h)| {
                let (a, b) = card_ids(h);
                let back = self.same[p][i].map_or(0.0, |j| reach_opp[j]);
                total - card_sum[a] - card_sum[b] + back
            })
            .collect()
    }

    /// Pour chaque main de `p` : (poids adverse battu, poids adverse gagnant).
    fn showdown_split(&self, p: usize, reach_opp: &[f64]) -> (Vec<f64>, Vec<f64>) {
        let o = 1 - p;
        let n = self.hands[p].len();
        let mut win = vec![0.0; n];
        let mut lose = vec![0.0; n];
        let mine = &self.order[p];
        let theirs = &self.order[o];
        // Montée : adversaires strictement plus faibles.
        let mut cs = [0.0f64; 52];
        let mut sum = 0.0;
        let mut j = 0;
        for &i in mine {
            let s = self.hands[p][i].strength;
            while j < theirs.len() && self.hands[o][theirs[j]].strength < s {
                let k = theirs[j];
                let (a, b) = card_ids(&self.hands[o][k]);
                cs[a] += reach_opp[k];
                cs[b] += reach_opp[k];
                sum += reach_opp[k];
                j += 1;
            }
            let (a, b) = card_ids(&self.hands[p][i]);
            win[i] = sum - cs[a] - cs[b];
        }
        // Descente : adversaires strictement plus forts.
        let mut cs = [0.0f64; 52];
        let mut sum = 0.0;
        let mut j = theirs.len();
        for &i in mine.iter().rev() {
            let s = self.hands[p][i].strength;
            while j > 0 && self.hands[o][theirs[j - 1]].strength > s {
                let k = theirs[j - 1];
                let (a, b) = card_ids(&self.hands[o][k]);
                cs[a] += reach_opp[k];
                cs[b] += reach_opp[k];
                sum += reach_opp[k];
                j -= 1;
            }
            let (a, b) = card_ids(&self.hands[p][i]);
            lose[i] = sum - cs[a] - cs[b];
        }
        (win, lose)
    }

    /// Valeurs terminales (non normalisées) des mains de `p`.
    fn terminal_values(&self, node: usize, p: usize, reach_opp: &[f64]) -> Vec<f64> {
        let n = &self.tree.nodes[node];
        let half = self.pot() / 2.0;
        match n.kind {
            NodeKind::Fold { folder } => {
                let avail = self.available(p, reach_opp);
                let gain = if folder == p { -(half + n.contrib[p]) } else { half + n.contrib[1 - p] };
                avail.iter().map(|a| a * gain).collect()
            }
            NodeKind::Showdown => {
                let (win, lose) = self.showdown_split(p, reach_opp);
                let stake = half + n.contrib[p];
                win.iter().zip(lose.iter()).map(|(w, l)| (w - l) * stake).collect()
            }
            NodeKind::Decision { .. } => unreachable!(),
        }
    }

    fn current_strategy(&self, node: usize, player: usize) -> Vec<f64> {
        let nh = self.hands[player].len();
        let na = self.tree.nodes[node].actions.len();
        let d = self.data[node].as_ref().expect("nœud de décision");
        let mut s = vec![0.0; na * nh];
        for h in 0..nh {
            let total: f64 = (0..na).map(|a| d.regret[a * nh + h].max(0.0)).sum();
            for a in 0..na {
                s[a * nh + h] = if total > 0.0 { d.regret[a * nh + h].max(0.0) / total } else { 1.0 / na as f64 };
            }
        }
        s
    }

    /// Stratégie moyenne d'un nœud : [action * nh + main].
    pub fn average_strategy(&self, node: usize) -> Vec<f64> {
        let NodeKind::Decision { player } = self.tree.nodes[node].kind else {
            return Vec::new();
        };
        let nh = self.hands[player].len();
        let na = self.tree.nodes[node].actions.len();
        let d = self.data[node].as_ref().expect("nœud de décision");
        let mut s = vec![0.0; na * nh];
        for h in 0..nh {
            let total: f64 = (0..na).map(|a| d.strategy_sum[a * nh + h]).sum();
            for a in 0..na {
                s[a * nh + h] = if total > 0.0 { d.strategy_sum[a * nh + h] / total } else { 1.0 / na as f64 };
            }
        }
        s
    }

    fn cfr(&mut self, node: usize, p: usize, reach_self: &[f64], reach_opp: &[f64]) -> Vec<f64> {
        let kind = self.tree.nodes[node].kind;
        let NodeKind::Decision { player } = kind else {
            return self.terminal_values(node, p, reach_opp);
        };
        let children = self.tree.nodes[node].children.clone();
        let na = children.len();
        let strat = self.current_strategy(node, player);
        if player == p {
            let nh = reach_self.len();
            let mut values = vec![0.0; nh];
            let mut child_values = Vec::with_capacity(na);
            for (a, &c) in children.iter().enumerate() {
                let rs: Vec<f64> = (0..nh).map(|h| reach_self[h] * strat[a * nh + h]).collect();
                let v = self.cfr(c, p, &rs, reach_opp);
                for h in 0..nh {
                    values[h] += strat[a * nh + h] * v[h];
                }
                child_values.push(v);
            }
            let d = self.data[node].as_mut().expect("nœud de décision");
            for a in 0..na {
                for h in 0..nh {
                    d.regret[a * nh + h] += child_values[a][h] - values[h];
                    d.strategy_sum[a * nh + h] += reach_self[h] * strat[a * nh + h];
                }
            }
            values
        } else {
            let no = reach_opp.len();
            let mut values = vec![0.0; reach_self.len()];
            for (a, &c) in children.iter().enumerate() {
                let ro: Vec<f64> = (0..no).map(|h| reach_opp[h] * strat[a * no + h]).collect();
                let v = self.cfr(c, p, reach_self, &ro);
                for (x, y) in values.iter_mut().zip(v) {
                    *x += y;
                }
            }
            values
        }
    }

    fn initial_reach(&self, p: usize) -> Vec<f64> {
        self.hands[p].iter().map(|h| h.weight).collect()
    }

    /// Une itération DCFR (une passe par joueur puis escomptes).
    pub fn iterate(&mut self) {
        self.iterations += 1;
        for p in 0..2 {
            let rs = self.initial_reach(p);
            let ro = self.initial_reach(1 - p);
            self.cfr(self.tree.root(), p, &rs, &ro);
        }
        let t = self.iterations as f64;
        let w = |exp: f64| if exp.is_infinite() { 1.0 } else { t.powf(exp) / (t.powf(exp) + 1.0) };
        let (pos, neg) = (w(self.params.alpha), w(self.params.beta));
        let avg = (t / (t + 1.0)).powf(self.params.gamma);
        for d in self.data.iter_mut().flatten() {
            for r in d.regret.iter_mut() {
                *r *= if *r > 0.0 { pos } else { neg };
            }
            for s in d.strategy_sum.iter_mut() {
                *s *= avg;
            }
        }
    }

    /// Valeur de `p` quand l'adversaire suit sa stratégie moyenne et que p
    /// joue sa meilleure réponse (`best = true`) ou sa stratégie moyenne.
    fn eval_values(&self, node: usize, p: usize, reach_self: &[f64], reach_opp: &[f64], best: bool) -> Vec<f64> {
        let n = &self.tree.nodes[node];
        let NodeKind::Decision { player } = n.kind else {
            return self.terminal_values(node, p, reach_opp);
        };
        let strat = self.average_strategy(node);
        if player == p {
            let nh = reach_self.len();
            let mut out = if best { vec![f64::NEG_INFINITY; nh] } else { vec![0.0; nh] };
            for (a, &c) in n.children.iter().enumerate() {
                let rs: Vec<f64> = (0..nh).map(|h| reach_self[h] * strat[a * nh + h]).collect();
                let v = self.eval_values(c, p, &rs, reach_opp, best);
                for h in 0..nh {
                    if best {
                        out[h] = out[h].max(v[h]);
                    } else {
                        out[h] += strat[a * nh + h] * v[h];
                    }
                }
            }
            out
        } else {
            let no = reach_opp.len();
            let mut out = vec![0.0; reach_self.len()];
            for (a, &c) in n.children.iter().enumerate() {
                let ro: Vec<f64> = (0..no).map(|h| reach_opp[h] * strat[a * no + h]).collect();
                let v = self.eval_values(c, p, reach_self, &ro, best);
                for (x, y) in out.iter_mut().zip(v) {
                    *x += y;
                }
            }
            out
        }
    }

    fn normalized(&self, p: usize, values: &[f64]) -> f64 {
        self.hands[p].iter().zip(values).map(|(h, v)| h.weight * v).sum::<f64>() / self.pair_weight
    }

    /// Espérance de gain de `p` (stratégies moyennes des deux côtés).
    pub fn expected_value(&self, p: usize) -> f64 {
        let v = self.eval_values(self.tree.root(), p, &self.initial_reach(p), &self.initial_reach(1 - p), false);
        self.normalized(p, &v)
    }

    /// Gain de la meilleure réponse de `p` contre la stratégie moyenne adverse.
    pub fn best_response_value(&self, p: usize) -> f64 {
        let v = self.eval_values(self.tree.root(), p, &self.initial_reach(p), &self.initial_reach(1 - p), true);
        self.normalized(p, &v)
    }

    /// Exploitabilité en jetons (0 à l'équilibre).
    pub fn exploitability(&self) -> f64 {
        (self.best_response_value(0) + self.best_response_value(1)) / 2.0
    }

    /// Exploitabilité en % du pot de départ de la river.
    pub fn exploitability_pct_pot(&self) -> f64 {
        100.0 * self.exploitability() / self.pot()
    }

    /// Lance des itérations jusqu'à `target_pct` (% du pot) ou `max_iter`,
    /// en contrôlant tous les `check_every` tours. Renvoie (itérations, exploitabilité %).
    pub fn solve(&mut self, target_pct: f64, max_iter: u64, check_every: u64) -> (u64, f64) {
        let mut expl = f64::INFINITY;
        while self.iterations < max_iter {
            for _ in 0..check_every {
                self.iterate();
            }
            expl = self.exploitability_pct_pot();
            if expl <= target_pct {
                break;
            }
        }
        (self.iterations, expl)
    }

    /// Fréquence agrégée de chaque action à un nœud (pondérée par la
    /// probabilité d'atteindre le nœud). Renvoie (libellé, fréquence).
    pub fn action_frequencies(&self, node: usize) -> Vec<(Action, f64)> {
        let n = &self.tree.nodes[node];
        let NodeKind::Decision { player } = n.kind else {
            return Vec::new();
        };
        let reach = self.reach_to(node, player);
        let strat = self.average_strategy(node);
        let nh = self.hands[player].len();
        let total: f64 = reach.iter().sum();
        n.actions
            .iter()
            .enumerate()
            .map(|(a, &act)| {
                let f: f64 = (0..nh).map(|h| reach[h] * strat[a * nh + h]).sum();
                (act, if total > 0.0 { f / total } else { 0.0 })
            })
            .collect()
    }

    /// Probabilité (par main de `player`) d'arriver à `node` selon ses propres
    /// actions (poids de range inclus).
    pub fn reach_to(&self, node: usize, player: usize) -> Vec<f64> {
        let mut reach = self.initial_reach(player);
        let mut cur = self.tree.root();
        let path = self.tree.nodes[node].history.clone();
        for act in path {
            let n = &self.tree.nodes[cur];
            let a = n.actions.iter().position(|x| *x == act).expect("chemin valide");
            if let NodeKind::Decision { player: q } = n.kind {
                if q == player {
                    let strat = self.average_strategy(cur);
                    let nh = reach.len();
                    for h in 0..nh {
                        reach[h] *= strat[a * nh + h];
                    }
                }
            }
            cur = n.children[a];
        }
        reach
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cards::parse_cards;
    use crate::tree::BetSizes;

    fn board(s: &str) -> [Card; 5] {
        let v = parse_cards(s).unwrap();
        [v[0], v[1], v[2], v[3], v[4]]
    }

    /// Jeu jouet « polarisé contre bluff-catchers » : OOP ne peut que checker,
    /// IP mise pot ou check. Théorie : IP mise toutes ses nuts et bluffe dans
    /// un rapport mise/(pot + 2 mises) = 1/3 des mises ; OOP paie à 50 %
    /// (MDF = pot / (pot + mise)).
    fn jeu_polarise() -> RiverSpot {
        let ip_only = BetSizes { bets: vec![1.0], raises: vec![] };
        RiverSpot {
            board: board("KsQd7c4h2s"),
            ranges: [Range::parse("QJs").unwrap(), Range::parse("KK,65s").unwrap()],
            tree: TreeConfig { pot: 10.0, stack: 100.0, sizes: [BetSizes::default(), ip_only], max_raises: 0, add_allin: false, allin_threshold: 1.0 },
        }
    }

    #[test]
    fn mains_et_bloqueurs() {
        let s = RiverSolver::new(&jeu_polarise(), DcfrParams::RECOMMENDED).unwrap();
        assert_eq!(s.hands[0].len(), 3); // QJs sans la Qd : trèfle, cœur, pique
        assert_eq!(s.hands[1].len(), 3 + 4); // KK sans le Ks + 4 × 65s
        assert!((s.pair_weight - 21.0).abs() < 1e-9); // aucune carte commune
    }

    #[test]
    fn jeu_polarise_atteint_l_equilibre_theorique() {
        let mut s = RiverSolver::new(&jeu_polarise(), DcfrParams::RECOMMENDED).unwrap();
        let (_, expl) = s.solve(0.01, 5_000, 100);
        assert!(expl < 0.01, "exploitabilité {expl} % du pot");
        // Racine OOP : parole. Nœud IP après parole :
        let ip = s.tree.nodes[0].children[0];
        let strat = s.average_strategy(ip);
        let nh = s.hands[1].len();
        let bet = |h: usize| strat[nh + h];
        let mut nuts = 0.0;
        let mut bluffs = 0.0;
        for (h, hand) in s.hands[1].iter().enumerate() {
            if hand.cards.iter().any(|c| c.rank() == 11) {
                assert!(bet(h) > 0.99, "les rois misent toujours");
                nuts += bet(h);
            } else {
                bluffs += bet(h);
            }
        }
        let bluff_share = bluffs / (nuts + bluffs);
        assert!((bluff_share - 1.0 / 3.0).abs() < 0.02, "part de bluffs {bluff_share}");
        // OOP face à la mise : paie à 50 %.
        let facing = s.tree.nodes[ip].children[1];
        let freqs = s.action_frequencies(facing);
        let call = freqs.iter().find(|(a, _)| *a == Action::Call).unwrap().1;
        assert!((call - 0.5).abs() < 0.02, "fréquence de paiement {call}");
        // Valeur théorique pour IP : nuts 3/7 gagnent pot + mise payée 1 fois sur 2…
        // On contrôle seulement la somme nulle.
        assert!((s.expected_value(0) + s.expected_value(1)).abs() < 1e-9);
    }

    #[test]
    fn abattage_sans_mise_valeur_exacte() {
        // Aucun pari possible : la valeur est l'équité d'abattage.
        let spot = RiverSpot {
            board: board("KsQd7c4h2s"),
            ranges: [Range::parse("QJs").unwrap(), Range::parse("KK,65s").unwrap()],
            tree: TreeConfig { pot: 10.0, stack: 100.0, sizes: [BetSizes::default(), BetSizes::default()], max_raises: 0, add_allin: false, allin_threshold: 1.0 },
        };
        let mut s = RiverSolver::new(&spot, DcfrParams::RECOMMENDED).unwrap();
        s.iterate();
        // OOP bat 4/7 des combos (65s), perd contre 3/7 (KK) : (4-3)/7 × 5.
        assert!((s.expected_value(0) - 5.0 / 7.0).abs() < 1e-9);
        assert!(s.exploitability().abs() < 1e-9);
    }

    #[test]
    fn bloqueurs_dans_l_abattage() {
        // AA contre AK : les As bloquent. Board sans A ni K.
        let spot = RiverSpot {
            board: board("2c3d7h9sJs"),
            ranges: [Range::parse("AA").unwrap(), Range::parse("AKo,AKs").unwrap()],
            tree: TreeConfig { pot: 10.0, stack: 100.0, sizes: Default::default(), max_raises: 0, add_allin: false, allin_threshold: 1.0 },
        };
        let s = RiverSolver::new(&spot, DcfrParams::RECOMMENDED).unwrap();
        // Chaque paire d'As laisse 2 As × 4 rois = 8 combos AK compatibles.
        let w: Vec<f64> = s.hands[1].iter().map(|h| h.weight).collect();
        for a in s.available(0, &w) {
            assert!((a - 8.0).abs() < 1e-9);
        }
        assert!((s.pair_weight - 6.0 * 8.0).abs() < 1e-9);
    }
}
