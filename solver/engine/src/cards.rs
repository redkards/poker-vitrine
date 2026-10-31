//! Cartes à jouer : représentation compacte sur un octet.
//!
//! Une carte vaut `rang * 4 + couleur`, avec rang 0 = deux … 12 = as,
//! couleur 0 = trèfle (c), 1 = carreau (d), 2 = cœur (h), 3 = pique (s).

use std::fmt;

pub const RANKS: &[u8; 13] = b"23456789TJQKA";
pub const SUITS: &[u8; 4] = b"cdhs";

#[derive(Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Debug)]
pub struct Card(pub u8);

impl Card {
    pub fn new(rank: u8, suit: u8) -> Card {
        assert!(rank < 13 && suit < 4, "carte invalide");
        Card(rank * 4 + suit)
    }
    pub fn rank(self) -> u8 {
        self.0 / 4
    }
    pub fn suit(self) -> u8 {
        self.0 % 4
    }
    /// Masque 64 bits de la carte (pour les ensembles de cartes).
    pub fn mask(self) -> u64 {
        1u64 << self.0
    }
    /// Lit une carte du type « As », « Td », « 7c ».
    pub fn parse(s: &str) -> Result<Card, String> {
        let b = s.trim().as_bytes();
        if b.len() != 2 {
            return Err(format!("carte invalide : {s:?}"));
        }
        let r = RANKS
            .iter()
            .position(|&c| c == b[0].to_ascii_uppercase())
            .ok_or_else(|| format!("rang invalide : {s:?}"))?;
        let su = SUITS
            .iter()
            .position(|&c| c == b[1].to_ascii_lowercase())
            .ok_or_else(|| format!("couleur invalide : {s:?}"))?;
        Ok(Card::new(r as u8, su as u8))
    }
}

impl fmt::Display for Card {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}{}", RANKS[self.rank() as usize] as char, SUITS[self.suit() as usize] as char)
    }
}

/// Lit une suite de cartes collées ou séparées : « AsKd7c » ou « As Kd 7c ».
pub fn parse_cards(s: &str) -> Result<Vec<Card>, String> {
    let compact: String = s.chars().filter(|c| !c.is_whitespace() && *c != ',').collect();
    if compact.len() % 2 != 0 {
        return Err(format!("nombre de caractères impair : {s:?}"));
    }
    let mut out = Vec::new();
    let mut seen = 0u64;
    for i in (0..compact.len()).step_by(2) {
        let c = Card::parse(&compact[i..i + 2])?;
        if seen & c.mask() != 0 {
            return Err(format!("carte en double : {c}"));
        }
        seen |= c.mask();
        out.push(c);
    }
    Ok(out)
}

/// Masque d'un ensemble de cartes.
pub fn mask_of(cards: &[Card]) -> u64 {
    cards.iter().fold(0, |m, c| m | c.mask())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn aller_retour_texte() {
        for i in 0..52u8 {
            let c = Card(i);
            assert_eq!(Card::parse(&c.to_string()).unwrap(), c);
        }
    }

    #[test]
    fn lecture_board() {
        let b = parse_cards("As Kd 7c").unwrap();
        assert_eq!(b.len(), 3);
        assert_eq!(b[0].rank(), 12);
        assert_eq!(b[1].suit(), 1);
        assert!(parse_cards("AsAs").is_err());
        assert!(parse_cards("Ax").is_err());
    }
}
