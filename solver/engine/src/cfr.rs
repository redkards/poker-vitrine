//! Solveur générique par minimisation du regret contrefactuel.
//!
//! - [`Game`] décrit un jeu à deux joueurs, à somme nulle, à information
//!   imparfaite et à mémoire parfaite (poker).
//! - [`Solver`] applique Discounted CFR (DCFR) : regrets positifs pondérés par
//!   t^α/(t^α+1), regrets négatifs par t^β/(t^β+1), stratégie moyenne par
//!   (t/(t+1))^γ. Paramètres par défaut α = 1,5 ; β = 0 ; γ = 2
//!   (Brown & Sandholm, 2019). Avec α = β = γ = 0 et sans remise à zéro,
//!   on retrouve CFR « vanilla ».
//! - [`exploitability`] mesure la qualité d'une stratégie : ce que gagnerait en
//!   moyenne un adversaire qui jouerait la meilleure réponse.

use std::collections::HashMap;

/// Nature d'un nœud de l'arbre de jeu.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum NodeKind {
    Terminal,
    Chance,
    Player(usize),
}

/// Jeu à deux joueurs, somme nulle, mémoire parfaite.
pub trait Game {
    type State: Clone;
    fn root(&self) -> Self::State;
    fn kind(&self, s: &Self::State) -> NodeKind;
    /// Gain du joueur `player` à un nœud terminal.
    fn utility(&self, s: &Self::State, player: usize) -> f64;
    /// Issues du hasard et leurs probabilités (somme = 1).
    fn chance_outcomes(&self, s: &Self::State) -> Vec<(Self::State, f64)>;
    fn num_actions(&self, s: &Self::State) -> usize;
    fn apply(&self, s: &Self::State, action: usize) -> Self::State;
    /// Clé de l'ensemble d'information du joueur qui doit agir.
    fn info_key(&self, s: &Self::State) -> String;
}

#[derive(Clone, Copy, Debug)]
pub struct DcfrParams {
    pub alpha: f64,
    pub beta: f64,
    pub gamma: f64,
}

impl DcfrParams {
    /// Valeurs recommandées par Brown & Sandholm (2019).
    pub const RECOMMENDED: DcfrParams = DcfrParams { alpha: 1.5, beta: 0.0, gamma: 2.0 };
    /// CFR sans escompte (référence de comparaison).
    pub const VANILLA: DcfrParams = DcfrParams { alpha: f64::INFINITY, beta: f64::INFINITY, gamma: 0.0 };
}

#[derive(Clone, Debug)]
struct InfoNode {
    regret: Vec<f64>,
    strategy_sum: Vec<f64>,
    /// Variations accumulées pendant la passe en cours. Un ensemble
    /// d'information est visité plusieurs fois par passe (une fois par carte
    /// adverse possible) : la stratégie doit rester celle de l'itération t
    /// pendant toute la passe, d'où l'application différée.
    regret_delta: Vec<f64>,
    strategy_delta: Vec<f64>,
}

impl InfoNode {
    fn new(n: usize) -> InfoNode {
        InfoNode {
            regret: vec![0.0; n],
            strategy_sum: vec![0.0; n],
            regret_delta: vec![0.0; n],
            strategy_delta: vec![0.0; n],
        }
    }
    fn commit(&mut self) {
        for a in 0..self.regret.len() {
            self.regret[a] += self.regret_delta[a];
            self.strategy_sum[a] += self.strategy_delta[a];
            self.regret_delta[a] = 0.0;
            self.strategy_delta[a] = 0.0;
        }
    }
    /// Appariement des regrets : probabilités proportionnelles aux regrets positifs.
    fn current_strategy(&self) -> Vec<f64> {
        let pos: Vec<f64> = self.regret.iter().map(|r| r.max(0.0)).collect();
        let total: f64 = pos.iter().sum();
        let n = pos.len() as f64;
        if total > 0.0 {
            pos.iter().map(|p| p / total).collect()
        } else {
            vec![1.0 / n; pos.len()]
        }
    }
    fn average_strategy(&self) -> Vec<f64> {
        let total: f64 = self.strategy_sum.iter().sum();
        let n = self.strategy_sum.len() as f64;
        if total > 0.0 {
            self.strategy_sum.iter().map(|s| s / total).collect()
        } else {
            vec![1.0 / n; self.strategy_sum.len()]
        }
    }
}

/// Stratégie : probabilité de chaque action, par ensemble d'information.
pub trait Policy {
    fn probabilities(&self, info_key: &str, num_actions: usize) -> Vec<f64>;
}

/// Solveur DCFR tabulaire (un nœud par ensemble d'information).
pub struct Solver<'g, G: Game> {
    game: &'g G,
    params: DcfrParams,
    nodes: HashMap<String, InfoNode>,
    iterations: u64,
}

impl<'g, G: Game> Solver<'g, G> {
    pub fn new(game: &'g G, params: DcfrParams) -> Self {
        Solver { game, params, nodes: HashMap::new(), iterations: 0 }
    }

    pub fn iterations(&self) -> u64 {
        self.iterations
    }

    pub fn num_infosets(&self) -> usize {
        self.nodes.len()
    }

    /// Une itération complète : une passe par joueur (mises à jour alternées),
    /// puis application des escomptes DCFR.
    pub fn iterate(&mut self) {
        self.iterations += 1;
        let root = self.game.root();
        for p in 0..2 {
            self.cfr(&root, p, 1.0, 1.0);
            for node in self.nodes.values_mut() {
                node.commit();
            }
        }
        self.discount();
    }

    pub fn run(&mut self, n: u64) {
        for _ in 0..n {
            self.iterate();
        }
    }

    fn discount(&mut self) {
        let t = self.iterations as f64;
        let w = |exp: f64| -> f64 {
            if exp.is_infinite() {
                1.0
            } else {
                let ta = t.powf(exp);
                ta / (ta + 1.0)
            }
        };
        let pos = w(self.params.alpha);
        let neg = w(self.params.beta);
        let avg = (t / (t + 1.0)).powf(self.params.gamma);
        for node in self.nodes.values_mut() {
            for r in node.regret.iter_mut() {
                *r *= if *r > 0.0 { pos } else { neg };
            }
            for s in node.strategy_sum.iter_mut() {
                *s *= avg;
            }
        }
    }

    /// Parcours récursif ; renvoie la valeur du nœud pour `traverser`.
    fn cfr(&mut self, s: &G::State, traverser: usize, reach_self: f64, reach_other: f64) -> f64 {
        match self.game.kind(s) {
            NodeKind::Terminal => self.game.utility(s, traverser),
            NodeKind::Chance => self
                .game
                .chance_outcomes(s)
                .into_iter()
                .map(|(child, p)| p * self.cfr(&child, traverser, reach_self, reach_other * p))
                .sum(),
            NodeKind::Player(player) => {
                let n = self.game.num_actions(s);
                let key = self.game.info_key(s);
                let strategy = self.nodes.entry(key.clone()).or_insert_with(|| InfoNode::new(n)).current_strategy();
                if player == traverser {
                    let mut values = vec![0.0; n];
                    let mut node_value = 0.0;
                    for a in 0..n {
                        let child = self.game.apply(s, a);
                        values[a] = self.cfr(&child, traverser, reach_self * strategy[a], reach_other);
                        node_value += strategy[a] * values[a];
                    }
                    let node = self.nodes.get_mut(&key).expect("nœud créé plus haut");
                    for a in 0..n {
                        node.regret_delta[a] += reach_other * (values[a] - node_value);
                        node.strategy_delta[a] += reach_self * strategy[a];
                    }
                    node_value
                } else {
                    // Pas d'élagage des actions adverses à probabilité nulle :
                    // la stratégie moyenne du joueur qui parcourt se pondère par
                    // sa SEULE probabilité d'atteinte, y compris dans les lignes
                    // que l'adversaire évite à cette itération. Les élaguer
                    // laisse ces zones figées et exploitables.
                    let mut v = 0.0;
                    for a in 0..n {
                        let child = self.game.apply(s, a);
                        v += strategy[a] * self.cfr(&child, traverser, reach_self, reach_other * strategy[a]);
                    }
                    v
                }
            }
        }
    }

    /// Stratégie moyenne (celle qui converge vers l'équilibre).
    pub fn average_policy(&self) -> AveragePolicy {
        AveragePolicy {
            table: self.nodes.iter().map(|(k, n)| (k.clone(), n.average_strategy())).collect(),
        }
    }
}

/// Stratégie figée, extraite d'un solveur.
#[derive(Clone, Debug, Default)]
pub struct AveragePolicy {
    pub table: HashMap<String, Vec<f64>>,
}

impl Policy for AveragePolicy {
    fn probabilities(&self, info_key: &str, num_actions: usize) -> Vec<f64> {
        self.table
            .get(info_key)
            .cloned()
            .unwrap_or_else(|| vec![1.0 / num_actions as f64; num_actions])
    }
}

/// Valeur espérée pour `player` quand les deux joueurs suivent `policy`.
pub fn expected_value<G: Game, P: Policy>(game: &G, policy: &P, player: usize) -> f64 {
    fn rec<G: Game, P: Policy>(g: &G, pol: &P, s: &G::State, player: usize) -> f64 {
        match g.kind(s) {
            NodeKind::Terminal => g.utility(s, player),
            NodeKind::Chance => g.chance_outcomes(s).iter().map(|(c, p)| p * rec(g, pol, c, player)).sum(),
            NodeKind::Player(_) => {
                let n = g.num_actions(s);
                let probs = pol.probabilities(&g.info_key(s), n);
                (0..n)
                    .filter(|&a| probs[a] > 0.0)
                    .map(|a| probs[a] * rec(g, pol, &g.apply(s, a), player))
                    .sum()
            }
        }
    }
    rec(game, policy, &game.root(), player)
}

/// Valeur de la meilleure réponse de `responder` contre `policy`.
///
/// Méthode : on regroupe les états de chaque ensemble d'information du
/// répondant, pondérés par la probabilité d'y arriver due au hasard et à
/// l'adversaire, puis on choisit l'action optimale de l'ensemble le plus
/// profond au moins profond (mémoire parfaite).
pub fn best_response_value<G: Game, P: Policy>(game: &G, policy: &P, responder: usize) -> f64 {
    struct Group<S> {
        depth: usize,
        states: Vec<(S, f64)>,
        num_actions: usize,
    }
    fn collect<G: Game, P: Policy>(
        g: &G,
        pol: &P,
        s: &G::State,
        responder: usize,
        reach: f64,
        depth: usize,
        groups: &mut HashMap<String, Group<G::State>>,
    ) {
        if reach == 0.0 {
            return;
        }
        match g.kind(s) {
            NodeKind::Terminal => {}
            NodeKind::Chance => {
                for (c, p) in g.chance_outcomes(s) {
                    collect(g, pol, &c, responder, reach * p, depth + 1, groups);
                }
            }
            NodeKind::Player(pl) => {
                let n = g.num_actions(s);
                if pl == responder {
                    let key = g.info_key(s);
                    let grp = groups.entry(key).or_insert_with(|| Group { depth, states: Vec::new(), num_actions: n });
                    grp.depth = grp.depth.min(depth);
                    grp.states.push((s.clone(), reach));
                    for a in 0..n {
                        collect(g, pol, &g.apply(s, a), responder, reach, depth + 1, groups);
                    }
                } else {
                    let probs = pol.probabilities(&g.info_key(s), n);
                    for a in 0..n {
                        collect(g, pol, &g.apply(s, a), responder, reach * probs[a], depth + 1, groups);
                    }
                }
            }
        }
    }
    fn eval<G: Game, P: Policy>(g: &G, pol: &P, s: &G::State, responder: usize, br: &HashMap<String, usize>) -> f64 {
        match g.kind(s) {
            NodeKind::Terminal => g.utility(s, responder),
            NodeKind::Chance => g.chance_outcomes(s).iter().map(|(c, p)| p * eval(g, pol, c, responder, br)).sum(),
            NodeKind::Player(pl) => {
                let n = g.num_actions(s);
                if pl == responder {
                    let a = *br.get(&g.info_key(s)).expect("ensemble plus profond déjà résolu");
                    eval(g, pol, &g.apply(s, a), responder, br)
                } else {
                    let probs = pol.probabilities(&g.info_key(s), n);
                    (0..n)
                        .filter(|&a| probs[a] > 0.0)
                        .map(|a| probs[a] * eval(g, pol, &g.apply(s, a), responder, br))
                        .sum()
                }
            }
        }
    }

    let mut groups: HashMap<String, Group<G::State>> = HashMap::new();
    collect(game, policy, &game.root(), responder, 1.0, 0, &mut groups);
    let mut keys: Vec<String> = groups.keys().cloned().collect();
    keys.sort_by(|a, b| groups[b].depth.cmp(&groups[a].depth).then_with(|| a.cmp(b)));
    let mut br: HashMap<String, usize> = HashMap::new();
    for key in keys {
        let grp = &groups[&key];
        let mut best = (0usize, f64::NEG_INFINITY);
        for a in 0..grp.num_actions {
            let v: f64 = grp.states.iter().map(|(s, w)| w * eval(game, policy, &game.apply(s, a), responder, &br)).sum();
            if v > best.1 + 1e-12 {
                best = (a, v);
            }
        }
        br.insert(key, best.0);
    }
    eval(game, policy, &game.root(), responder, &br)
}

/// Exploitabilité : moyenne des gains des deux meilleures réponses.
/// Vaut 0 exactement à l'équilibre de Nash ; exprimée dans l'unité du jeu
/// (jetons). Pour le poker, on la divise par le pot pour l'avoir en % du pot.
pub fn exploitability<G: Game, P: Policy>(game: &G, policy: &P) -> f64 {
    (best_response_value(game, policy, 0) + best_response_value(game, policy, 1)) / 2.0
}
