//! Évaluateur de mains de Texas Hold'em (5, 6 ou 7 cartes).
//!
//! Écrit de zéro pour Top Solver, sans table pré-calculée : tout se fait par
//! opérations sur des masques de bits, sans allocation.
//!
//! Principe :
//! 1. On répartit les cartes en quatre masques de rangs sur 13 bits, un par
//!    couleur (bit `r` = rang `r`, 0 = deux … 12 = as).
//! 2. Les multiplicités de rangs s'obtiennent par ET/OU entre ces masques
//!    (rangs présents ≥ 2 fois, ≥ 3 fois, 4 fois).
//! 3. La force est encodée sur un `u32` : catégorie dans les bits 26 à 29,
//!    puis les rangs départageants en dessous. Comparer deux masques de rangs
//!    distincts revient à comparer lexicographiquement les rangs triés par
//!    ordre décroissant, ce qui donne directement le bon départage.
//!
//! Encodage des départages (sous la catégorie) :
//! - Hauteur, Couleur : masque des 5 meilleurs rangs ;
//! - Paire : rang de la paire << 13 | masque des 3 meilleurs kickers ;
//! - Double paire : masque des 2 paires << 13 | masque du kicker ;
//! - Brelan : rang du brelan << 13 | masque des 2 meilleurs kickers ;
//! - Quinte, Quinte flush : indice de la carte haute (0 = roue A-2-3-4-5 … 9 = quinte royale) ;
//! - Full : rang du brelan << 4 | rang de la paire ;
//! - Carré : rang du carré << 13 | masque du kicker.

use crate::cards::Card;

/// Force d'une main : plus grand = meilleure. Deux mains de même valeur font égalité.
pub type Strength = u32;

/// Catégorie de main, de la plus faible à la plus forte.
#[derive(Clone, Copy, PartialEq, Eq, Debug, PartialOrd, Ord)]
pub enum Category {
    HighCard,
    Pair,
    TwoPair,
    Trips,
    Straight,
    Flush,
    FullHouse,
    Quads,
    StraightFlush,
}

const CAT_SHIFT: u32 = 26;

const ALL_CATEGORIES: [Category; 9] = [
    Category::HighCard,
    Category::Pair,
    Category::TwoPair,
    Category::Trips,
    Category::Straight,
    Category::Flush,
    Category::FullHouse,
    Category::Quads,
    Category::StraightFlush,
];

#[inline(always)]
const fn cat(c: Category) -> u32 {
    (c as u32) << CAT_SHIFT
}

/// Catégorie d'une force renvoyée par [`evaluate`] ou [`evaluate_mask`].
pub fn category(s: Strength) -> Category {
    let i = (s >> CAT_SHIFT) as usize;
    assert!(i < ALL_CATEGORIES.len(), "force invalide : {s}");
    ALL_CATEGORIES[i]
}

/// Nom français d'une catégorie.
pub fn category_fr(c: Category) -> &'static str {
    match c {
        Category::HighCard => "Hauteur",
        Category::Pair => "Paire",
        Category::TwoPair => "Double paire",
        Category::Trips => "Brelan",
        Category::Straight => "Quinte",
        Category::Flush => "Couleur",
        Category::FullHouse => "Full",
        Category::Quads => "Carré",
        Category::StraightFlush => "Quinte flush",
    }
}

/// Évalue 5 à 7 cartes (meilleure combinaison de 5).
pub fn evaluate(cards: &[Card]) -> Strength {
    debug_assert!((5..=7).contains(&cards.len()), "il faut 5 à 7 cartes");
    let mut m = 0u64;
    for c in cards {
        m |= c.mask();
    }
    evaluate_mask(m)
}

/// Rang le plus haut d'un masque non vide.
#[inline(always)]
fn top_rank(m: u32) -> u32 {
    31 - m.leading_zeros()
}

/// Ne garde que les `n` bits les plus hauts du masque.
#[inline(always)]
fn keep_top(mut m: u32, n: u32) -> u32 {
    while m.count_ones() > n {
        m &= m - 1;
    }
    m
}

/// Indice de la carte haute de la meilleure quinte (0 = roue … 9 = as), si elle existe.
#[inline(always)]
fn straight_top(ranks: u32) -> Option<u32> {
    // Bit 0 = as « bas », bits 1..=13 = deux … as.
    let m = (ranks << 1) | (ranks >> 12);
    let s = m & (m >> 1) & (m >> 2) & (m >> 3) & (m >> 4);
    if s == 0 {
        None
    } else {
        Some(top_rank(s))
    }
}

/// Évalue un ensemble de 5 à 7 cartes donné sous forme de masque (`Card::mask`).
pub fn evaluate_mask(mask: u64) -> Strength {
    debug_assert!((5..=7).contains(&mask.count_ones()), "il faut 5 à 7 cartes");
    debug_assert!(mask >> 52 == 0, "masque hors paquet");

    // Masques de rangs par couleur.
    let mut sm = [0u32; 4];
    let mut m = mask;
    while m != 0 {
        let id = m.trailing_zeros();
        sm[(id & 3) as usize] |= 1 << (id >> 2);
        m &= m - 1;
    }
    let [a, b, c, d] = sm;

    // Couleur : avec 7 cartes, une couleur exclut carré et full.
    for &s in &sm {
        if s.count_ones() >= 5 {
            return match straight_top(s) {
                Some(t) => cat(Category::StraightFlush) | t,
                None => cat(Category::Flush) | keep_top(s, 5),
            };
        }
    }

    let any = a | b | c | d;
    let ab = a & b;
    let cd = c & d;
    let four = ab & cd;
    let three = (ab & (c | d)) | (cd & (a | b));
    let two = ab | cd | ((a | b) & (c | d));

    if four != 0 {
        let q = top_rank(four);
        return cat(Category::Quads) | (q << 13) | keep_top(any & !(1 << q), 1);
    }

    if three != 0 {
        let t = top_rank(three);
        let rest_pairs = two & !(1 << t);
        if rest_pairs != 0 {
            return cat(Category::FullHouse) | (t << 4) | top_rank(rest_pairs);
        }
    }

    if let Some(t) = straight_top(any) {
        return cat(Category::Straight) | t;
    }

    if three != 0 {
        let t = top_rank(three);
        return cat(Category::Trips) | (t << 13) | keep_top(any & !(1 << t), 2);
    }

    if two != 0 {
        if two.count_ones() >= 2 {
            let p = keep_top(two, 2);
            return cat(Category::TwoPair) | (p << 13) | keep_top(any & !p, 1);
        }
        let p = top_rank(two);
        return cat(Category::Pair) | (p << 13) | keep_top(any & !two, 3);
    }

    cat(Category::HighCard) | keep_top(any, 5)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::cards::parse_cards;
    use std::collections::HashSet;

    fn ev(s: &str) -> Strength {
        evaluate(&parse_cards(s).unwrap())
    }

    fn cat_de(s: &str) -> Category {
        category(ev(s))
    }

    /// Évaluateur naïf et indépendant (tri des rangs), pour validation croisée
    /// sur des mains de 5 cartes. Renvoie une clé comparable.
    fn naif_5(cards: &[Card]) -> (Category, [u8; 5]) {
        let mut cnt = [0u8; 13];
        for c in cards {
            cnt[c.rank() as usize] += 1;
        }
        let flush = cards.iter().all(|c| c.suit() == cards[0].suit());
        // Rangs triés par (multiplicité, rang) décroissants.
        let mut groupes: Vec<(u8, u8)> =
            (0..13u8).filter(|&r| cnt[r as usize] > 0).map(|r| (cnt[r as usize], r)).collect();
        groupes.sort_unstable_by(|x, y| y.cmp(x));
        let mut cle = [0u8; 5];
        let mut i = 0;
        for &(n, r) in &groupes {
            for _ in 0..n {
                cle[i] = r;
                i += 1;
            }
        }
        let distincts = groupes.len();
        let mut straight = None;
        if distincts == 5 {
            let hi = groupes[0].1;
            let lo = groupes[4].1;
            if hi - lo == 4 {
                straight = Some(hi);
            } else if hi == 12 && groupes[1].1 == 3 && lo == 0 {
                straight = Some(3); // roue : le cinq est la carte haute
            }
        }
        let c = match (straight, flush) {
            (Some(h), true) => return (Category::StraightFlush, [h, 0, 0, 0, 0]),
            (Some(h), false) => return (Category::Straight, [h, 0, 0, 0, 0]),
            (None, true) => Category::Flush,
            _ => match (groupes[0].0, groupes.get(1).map(|g| g.0)) {
                (4, _) => Category::Quads,
                (3, Some(2)) => Category::FullHouse,
                (3, _) => Category::Trips,
                (2, Some(2)) => Category::TwoPair,
                (2, _) => Category::Pair,
                _ => Category::HighCard,
            },
        };
        (c, cle)
    }

    #[test]
    fn noms_francais() {
        assert_eq!(category_fr(Category::HighCard), "Hauteur");
        assert_eq!(category_fr(Category::TwoPair), "Double paire");
        assert_eq!(category_fr(Category::Quads), "Carré");
        assert_eq!(category_fr(Category::StraightFlush), "Quinte flush");
    }

    #[test]
    fn ordre_des_categories() {
        let mains = [
            ("As Kd 9c 7h 3s", Category::HighCard),
            ("2s 2d 9c 7h 3s", Category::Pair),
            ("2s 2d 3c 3h 4s", Category::TwoPair),
            ("2s 2d 2c 7h 3s", Category::Trips),
            ("As 2d 3c 4h 5s", Category::Straight),
            ("2h 4h 6h 8h Th", Category::Flush),
            ("2s 2d 2c 3h 3s", Category::FullHouse),
            ("2s 2d 2c 2h 3s", Category::Quads),
            ("Ah 2h 3h 4h 5h", Category::StraightFlush),
        ];
        let mut prec = None;
        for (m, c) in mains {
            let s = ev(m);
            assert_eq!(category(s), c, "{m}");
            if let Some(p) = prec {
                assert!(s > p, "{m} devrait battre la main précédente");
            }
            prec = Some(s);
        }
        assert!(Category::HighCard < Category::StraightFlush);
    }

    #[test]
    fn departages_classiques() {
        // Kicker.
        assert!(ev("As Ad Kc 7h 3s") > ev("As Ad Qc 7h 3s"));
        assert!(ev("As Ad Kc 7h 4s") > ev("Ac Ah Kd 7d 3c"));
        assert_eq!(ev("As Ad Kc 7h 3s"), ev("Ac Ah Kd 7d 3c"));
        // Double paire : grosse paire, puis petite paire, puis kicker.
        assert!(ev("Ks Kd 2c 2h 3s") > ev("Qs Qd Jc Jh As"));
        assert!(ev("Ks Kd 3c 3h 2s") > ev("Kc Kh 2c 2d As"));
        assert!(ev("Ks Kd 3c 3h 5s") > ev("Kc Kh 3d 3s 4c"));
        // Full contre full : le brelan prime, puis la paire.
        assert!(ev("3s 3d 3c 2h 2s") > ev("2c 2d 2h As Ad"));
        assert!(ev("As Ad Ac 3h 3s") > ev("Ah Ad Ac 2h 2s"));
        // Roue < quinte au six.
        assert!(ev("As 2d 3c 4h 5s") < ev("2d 3c 4h 5s 6d"));
        assert!(ev("Ts Jd Qc Kh As") > ev("9s Td Jc Qh Ks"));
        // Couleur contre couleur : comparaison carte par carte.
        assert!(ev("Ah 9h 7h 5h 3h") > ev("Kh Qh Jh 9h 7h"));
        assert!(ev("Ah 9h 7h 5h 3h") > ev("As 9s 7s 5s 2s"));
        assert_eq!(ev("Ah 9h 7h 5h 3h"), ev("As 9s 7s 5s 3s"));
        // Quinte flush roue = la plus faible des quintes flush, mais bat un carré.
        assert!(ev("Ah 2h 3h 4h 5h") < ev("2h 3h 4h 5h 6h"));
        assert!(ev("Ah 2h 3h 4h 5h") > ev("As Ad Ac Ah Ks"));
        // Carré : kicker.
        assert!(ev("9s 9d 9c 9h As") > ev("9s 9d 9c 9h Ks"));
    }

    #[test]
    fn mains_de_six_et_sept_cartes() {
        // Trois paires : on garde les deux meilleures, kicker = meilleure carte restante.
        assert_eq!(ev("As Ad Kc Kh 2s 2d Qc"), ev("As Ad Kc Kh Qc"));
        assert_eq!(ev("As Ad Kc Kh 3s 3d 2c"), ev("As Ad Kc Kh 3s"));
        // Deux brelans : full.
        assert_eq!(cat_de("As Ad Ac Kh Ks Kd 2c"), Category::FullHouse);
        assert_eq!(ev("As Ad Ac Kh Ks Kd 2c"), ev("As Ad Ac Kh Ks"));
        // Carré + brelan : carré avec kicker.
        assert_eq!(ev("9s 9d 9c 9h As Ad Ac"), ev("9s 9d 9c 9h Ah"));
        // Quinte de six cartes : la plus haute.
        assert_eq!(ev("As 2d 3c 4h 5s 6d 9c"), ev("2d 3c 4h 5s 6d"));
        // Couleur à 6 ou 7 cartes : les 5 plus hautes.
        assert_eq!(ev("2h 4h 6h 8h Th Qh Ac"), ev("4h 6h 8h Th Qh"));
        // Quinte flush cachée dans une couleur plus haute.
        assert_eq!(cat_de("Ah 2h 3h 4h 5h Kh 9c"), Category::StraightFlush);
        assert_eq!(ev("6h 2h 3h 4h 5h Ah Kh"), ev("2h 3h 4h 5h 6h"));
        // Quinte et couleur différentes : la couleur l'emporte.
        assert_eq!(cat_de("2h 4h 6h 8h Th 7c 9d"), Category::Flush);
        // Six cartes.
        assert_eq!(cat_de("As Ad Ac Kh Ks 2c"), Category::FullHouse);
    }

    #[test]
    fn enumeration_exhaustive_5_cartes() {
        let mut comptes = [0u64; 9];
        let mut valeurs = HashSet::new();
        let mut paires: Vec<(Strength, (Category, [u8; 5]))> = Vec::with_capacity(2_598_960);
        for a in 0..52u8 {
            for b in a + 1..52 {
                for c in b + 1..52 {
                    for d in c + 1..52 {
                        for e in d + 1..52 {
                            let mains = [Card(a), Card(b), Card(c), Card(d), Card(e)];
                            let s = evaluate(&mains);
                            comptes[category(s) as usize] += 1;
                            valeurs.insert(s);
                            paires.push((s, naif_5(&mains)));
                        }
                    }
                }
            }
        }
        assert_eq!(paires.len(), 2_598_960);
        assert_eq!(
            comptes,
            [1_302_540, 1_098_240, 123_552, 54_912, 10_200, 5_108, 3_744, 624, 40]
        );
        assert_eq!(valeurs.len(), 7_462);

        // Validation croisée : l'ordre de `evaluate` doit coïncider exactement
        // avec celui de l'évaluateur naïf (même égalités, même ordre).
        paires.sort_unstable();
        for w in paires.windows(2) {
            let (s1, k1) = w[0];
            let (s2, k2) = w[1];
            assert_eq!(s1 == s2, k1 == k2, "égalité incohérente : {k1:?} / {k2:?}");
            assert!(k1 <= k2, "ordre incohérent : {k1:?} > {k2:?}");
        }
    }

    /// Les 21 sous-ensembles de 5 cartes parmi 7.
    fn max_sous_ensembles(cards: &[Card; 7]) -> Strength {
        let mut best = 0;
        for i in 0..7 {
            for j in i + 1..7 {
                let cinq: Vec<Card> =
                    (0..7).filter(|&k| k != i && k != j).map(|k| cards[k]).collect();
                best = best.max(evaluate(&cinq));
            }
        }
        best
    }

    #[test]
    fn coherence_7_cartes_et_sous_ensembles() {
        // Générateur pseudo-aléatoire déterministe (xorshift64*).
        let mut x: u64 = 0x9E37_79B9_7F4A_7C15;
        let mut alea = || {
            x ^= x >> 12;
            x ^= x << 25;
            x ^= x >> 27;
            x.wrapping_mul(0x2545_F491_4F6C_DD1D)
        };
        for _ in 0..300_000 {
            let mut m = 0u64;
            let mut cartes = [Card(0); 7];
            let mut n = 0;
            while n < 7 {
                let id = (alea() % 52) as u8;
                if m & (1 << id) == 0 {
                    m |= 1 << id;
                    cartes[n] = Card(id);
                    n += 1;
                }
            }
            let s = evaluate(&cartes);
            assert_eq!(s, evaluate_mask(m));
            assert_eq!(s, max_sous_ensembles(&cartes), "{cartes:?}");
            // Six cartes : max des 6 sous-ensembles de 5.
            let six = &cartes[..6];
            let mut best6 = 0;
            for i in 0..6 {
                let cinq: Vec<Card> = (0..6).filter(|&k| k != i).map(|k| six[k]).collect();
                best6 = best6.max(evaluate(&cinq));
            }
            assert_eq!(evaluate(six), best6);
        }
        // Mains piégeuses choisies à la main.
        for m in [
            "Ah 2h 3h 4h 5h 6h 7h",
            "As Ad Ac Ah Ks Kd Kc",
            "As 2d 3c 4h 5s 6d 7c",
            "2s 2d 3c 3h 4s 4d 5c",
            "Ah Kh Qh Jh 9h Ts 8c",
        ] {
            let v = parse_cards(m).unwrap();
            let arr: [Card; 7] = v.clone().try_into().unwrap();
            assert_eq!(evaluate(&v), max_sous_ensembles(&arr), "{m}");
        }
    }

    #[test]
    #[ignore = "long : 133 784 560 mains, à lancer en release avec --ignored"]
    fn enumeration_exhaustive_7_cartes() {
        let debut = std::time::Instant::now();
        let mut comptes = [0u64; 9];
        let mut total = 0u64;
        for a in 0..52u64 {
            let ma = 1u64 << a;
            for b in a + 1..52 {
                let mb = ma | 1 << b;
                for c in b + 1..52 {
                    let mc = mb | 1 << c;
                    for d in c + 1..52 {
                        let md = mc | 1 << d;
                        for e in d + 1..52 {
                            let me = md | 1 << e;
                            for f in e + 1..52 {
                                let mf = me | 1 << f;
                                for g in f + 1..52 {
                                    let s = evaluate_mask(mf | 1 << g);
                                    comptes[(s >> CAT_SHIFT) as usize] += 1;
                                    total += 1;
                                }
                            }
                        }
                    }
                }
            }
        }
        let duree = debut.elapsed().as_secs_f64();
        println!(
            "{total} mains de 7 cartes en {duree:.2} s, soit {:.1} M évaluations/s",
            total as f64 / duree / 1e6
        );
        assert_eq!(total, 133_784_560);
        assert_eq!(
            comptes,
            [
                23_294_460, 58_627_800, 31_433_400, 6_461_620, 6_180_020, 4_047_644, 3_473_184,
                224_848, 41_584
            ]
        );
    }
}
