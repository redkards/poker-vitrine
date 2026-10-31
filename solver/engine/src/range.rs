//! Ranges : 169 classes de mains (« AKs », « T9o », « 77 »), 1 326 combos,
//! poids par combo entre 0 et 1.

use crate::cards::{Card, RANKS};

/// Nombre de combos de deux cartes distinctes.
pub const NUM_COMBOS: usize = 1326;

/// Une main de départ : deux cartes, la plus haute d'abord.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Combo(pub Card, pub Card);

impl Combo {
    pub fn mask(self) -> u64 {
        self.0.mask() | self.1.mask()
    }
    /// Libellé de la classe de main : « AKs », « AKo », « AA ».
    pub fn class_label(self) -> String {
        let (hi, lo) = if self.0.rank() >= self.1.rank() { (self.0, self.1) } else { (self.1, self.0) };
        let h = RANKS[hi.rank() as usize] as char;
        let l = RANKS[lo.rank() as usize] as char;
        if hi.rank() == lo.rank() {
            format!("{h}{l}")
        } else if hi.suit() == lo.suit() {
            format!("{h}{l}s")
        } else {
            format!("{h}{l}o")
        }
    }
}

/// Les 1 326 combos, dans un ordre fixe.
pub fn all_combos() -> Vec<Combo> {
    let mut v = Vec::with_capacity(NUM_COMBOS);
    for a in (0..52u8).rev() {
        for b in (0..a).rev() {
            v.push(Combo(Card(a), Card(b)));
        }
    }
    v
}

/// Les 169 libellés dans l'ordre de la grille 13×13 (ligne = première carte,
/// diagonale = paires, au-dessus = assorties, en dessous = dépareillées).
pub fn grid_labels() -> Vec<String> {
    let mut v = Vec::with_capacity(169);
    for i in 0..13 {
        for j in 0..13 {
            let ri = RANKS[12 - i] as char;
            let rj = RANKS[12 - j] as char;
            v.push(match i.cmp(&j) {
                std::cmp::Ordering::Equal => format!("{ri}{rj}"),
                std::cmp::Ordering::Less => format!("{ri}{rj}s"),
                std::cmp::Ordering::Greater => format!("{rj}{ri}o"),
            });
        }
    }
    v
}

/// Range pondérée : un poids par combo.
#[derive(Clone, Debug)]
pub struct Range {
    pub combos: Vec<Combo>,
    pub weights: Vec<f32>,
}

impl Range {
    pub fn empty() -> Range {
        let combos = all_combos();
        let weights = vec![0.0; combos.len()];
        Range { combos, weights }
    }

    /// Lit une range au format courant : « AA,AKs,KQo:0.5,77 ».
    /// Le suffixe « :poids » est optionnel (1 par défaut). Les plages
    /// (« 22+ », « A2s-A5s ») viendront avec l'interface (lot L5).
    pub fn parse(s: &str) -> Result<Range, String> {
        let mut r = Range::empty();
        for part in s.split(',').map(str::trim).filter(|p| !p.is_empty()) {
            let (label, w) = match part.split_once(':') {
                Some((l, w)) => (l.trim(), w.trim().parse::<f32>().map_err(|_| format!("poids invalide : {part}"))?),
                None => (part, 1.0),
            };
            if !(0.0..=1.0).contains(&w) {
                return Err(format!("poids hors de [0,1] : {part}"));
            }
            let label = normalize(label)?;
            let mut found = false;
            for (i, c) in r.combos.iter().enumerate() {
                if c.class_label() == label {
                    r.weights[i] = w;
                    found = true;
                }
            }
            if !found {
                return Err(format!("main inconnue : {part}"));
            }
        }
        Ok(r)
    }

    /// Nombre de combos pondérés (ex. 6 pour une paire pleine).
    pub fn combo_count(&self) -> f32 {
        self.weights.iter().sum()
    }

    /// Retire les combos bloqués par des cartes déjà sorties (board).
    pub fn remove_dead(&mut self, dead_mask: u64) {
        for (i, c) in self.combos.iter().enumerate() {
            if c.mask() & dead_mask != 0 {
                self.weights[i] = 0.0;
            }
        }
    }
}

fn normalize(label: &str) -> Result<String, String> {
    let b: Vec<char> = label.chars().collect();
    if b.len() < 2 || b.len() > 3 {
        return Err(format!("main invalide : {label}"));
    }
    let r0 = b[0].to_ascii_uppercase();
    let r1 = b[1].to_ascii_uppercase();
    let p0 = RANKS.iter().position(|&c| c as char == r0).ok_or(format!("rang invalide : {label}"))?;
    let p1 = RANKS.iter().position(|&c| c as char == r1).ok_or(format!("rang invalide : {label}"))?;
    let (hi, lo) = if p0 >= p1 { (r0, r1) } else { (r1, r0) };
    match b.get(2).map(|c| c.to_ascii_lowercase()) {
        None if p0 == p1 => Ok(format!("{hi}{lo}")),
        Some(s @ ('s' | 'o')) if p0 != p1 => Ok(format!("{hi}{lo}{s}")),
        _ => Err(format!("main invalide : {label}")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cards::{mask_of, parse_cards};

    #[test]
    fn nombre_de_combos() {
        assert_eq!(all_combos().len(), NUM_COMBOS);
        assert_eq!(grid_labels().len(), 169);
        assert_eq!(grid_labels()[0], "AA");
        assert_eq!(grid_labels()[1], "AKs");
        assert_eq!(grid_labels()[13], "AKo");
    }

    #[test]
    fn comptage_des_classes() {
        let r = Range::parse("AA,AKs,AKo,KQo:0.5").unwrap();
        // 6 + 4 + 12 + 12×0,5
        assert!((r.combo_count() - 28.0).abs() < 1e-6);
    }

    #[test]
    fn cartes_mortes() {
        let mut r = Range::parse("AA,KK").unwrap();
        r.remove_dead(mask_of(&parse_cards("AsKd7c").unwrap()));
        // AA : 3 combos restants, KK : 3 combos restants
        assert!((r.combo_count() - 6.0).abs() < 1e-6);
    }

    #[test]
    fn erreurs_de_saisie() {
        assert!(Range::parse("AAs").is_err());
        assert!(Range::parse("AK").is_err());
        assert!(Range::parse("AA:2").is_err());
        assert!(Range::parse("ka s").is_err());
        assert!(Range::parse("kas").is_ok());
    }
}
