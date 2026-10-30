import type { LessonLevel, Rank } from '../lessons.data';

/**
 * Tableaux de ranges (rubrique « Apprendre ») : une grille 13 × 13 des 169 mains de départ par situation.
 * Débutant et Intermédiaire sont embarqués ; le contenu Expert est servi par l'API aux seuls membres Premium
 * (GET /api/lessons/ranges/expert, backPoker/resources/lessons/ranges-expert.json) : ici, uniquement ses titres.
 *
 * Notation des mains : paires « 99 », « 22+ », « 99-66 » ; mains assorties (s) ou dépareillées (o) « AKs », « ATo+ »
 * (kicker croissant jusqu'à la carte haute), « K9s-K6s » ; sans suffixe, les deux (« KQ » = KQs + KQo).
 */

export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export interface RangeAction {
  /** Identifiant technique, aussi utilisé pour la couleur de la case */
  key: 'raise' | 'call' | 'threebet' | 'shove';
  label: string;
  /** Mains en notation abrégée, séparées par des virgules */
  hands: string;
}

export interface RangeChart {
  id: string;
  title: string;
  /** Situation de jeu en une phrase (table, position, action devant soi) */
  situation: string;
  /** Une action par couleur ; les mains non citées se couchent. Une main ne figure que dans une action. */
  actions: RangeAction[];
  /** Conseil d'utilisation affiché sous la grille */
  note: string;
}

export interface RangeLevel {
  level: LessonLevel;
  label: 'Débutant' | 'Intermédiaire' | 'Expert';
  description: string;
  premium: boolean;
}

export const RANGE_LEVELS: RangeLevel[] = [
  { level: 'debutant', label: 'Débutant', description: 'Trois repères simples pour ouvrir quand personne n’est entré dans le coup.', premium: false },
  { level: 'intermediaire', label: 'Intermédiaire', description: 'Les ranges d’ouverture complètes d’une table à six joueurs, place par place.', premium: false },
  { level: 'avance', label: 'Expert', description: 'Répondre à une ouverture : sur-relancer (3-bet), payer ou se coucher.', premium: true },
];

/** Titres des tableaux Expert, pour la présentation aux visiteurs non abonnés (contenu servi par l'API) */
export const EXPERT_RANGE_TITLES: string[] = [
  'Bouton face à une ouverture du cut-off',
  'Grosse blinde face à une ouverture du bouton',
  'Petite blinde face à une ouverture du bouton',
];

const COMMON_NOTE =
  'Repères simplifiés pour une table à six joueurs et des tapis d’au moins 40 grosses blindes. Ils se resserrent face à des joueurs qui relancent souvent et ne remplacent pas la réflexion à la table.';

export const BEGINNER_CHARTS: RangeChart[] = [
  {
    id: 'debutant-utg',
    title: 'Sous le pistolet',
    situation: 'Vous parlez en premier, cinq joueurs agissent après vous. Relancez à environ 2,5 à 3 grosses blindes.',
    actions: [{ key: 'raise', label: 'Relancer', hands: '99+, AJ+, KQ, ATs, KJs' }],
    note: 'Peu de mains, mais jouées de façon décidée. Toutes les autres se couchent.',
  },
  {
    id: 'debutant-co',
    title: 'Cut-off',
    situation: 'Deux places avant les blindes, personne n’est encore entré dans le coup.',
    actions: [{ key: 'raise', label: 'Relancer', hands: '22+, A2s+, AT+, KTs+, KQo, QTs+, JTs, T9s, 98s' }],
    note: 'On ajoute les petites paires, les As assortis et les meilleures mains assorties qui se suivent.',
  },
  {
    id: 'debutant-btn',
    title: 'Bouton',
    situation: 'Vous parlerez en dernier après le flop, seules les deux blindes restent à battre.',
    actions: [{ key: 'raise', label: 'Relancer', hands: '22+, A2s+, A8o+, K8s+, KTo+, Q9s+, Q9o+, J9s+, JTo, T8s+, 98s, 87s, 76s' }],
    note: 'La place la plus rentable : la sélection s’élargit nettement, sans jouer n’importe quoi.',
  },
];

export const INTERMEDIATE_CHARTS: RangeChart[] = [
  {
    id: 'intermediaire-utg',
    title: 'Sous le pistolet (UTG)',
    situation: 'Table à six, premier à parler. Ouverture à 2,5 BB.',
    actions: [{ key: 'raise', label: 'Ouvrir', hands: '22+, A2s+, KTs+, QTs+, JTs, T9s, ATo+, KJo+' }],
    note: COMMON_NOTE,
  },
  {
    id: 'intermediaire-hj',
    title: 'Hijack (HJ)',
    situation: 'Quatre joueurs derrière vous, personne n’est entré dans le coup. Ouverture à 2,5 BB.',
    actions: [{ key: 'raise', label: 'Ouvrir', hands: '22+, A2s+, K9s+, Q9s+, J9s+, T9s, 98s, 87s, ATo+, KTo+, QJo' }],
    note: COMMON_NOTE,
  },
  {
    id: 'intermediaire-co',
    title: 'Cut-off (CO)',
    situation: 'Trois joueurs derrière vous, personne n’est entré dans le coup. Ouverture à 2,5 BB.',
    actions: [{ key: 'raise', label: 'Ouvrir', hands: '22+, A2s+, K5s+, Q8s+, J8s+, T8s+, 97s+, 87s, 76s, 65s, A9o+, KTo+, QTo+, JTo' }],
    note: COMMON_NOTE,
  },
  {
    id: 'intermediaire-btn',
    title: 'Bouton (BTN)',
    situation: 'Seules les blindes restent à parler. Ouverture à 2,5 BB.',
    actions: [
      {
        key: 'raise',
        label: 'Ouvrir',
        hands: '22+, A2s+, K2s+, Q4s+, J6s+, T6s+, 96s+, 85s+, 75s+, 64s+, 54s, A4o+, K8o+, Q9o+, J9o+, T8o+, 98o',
      },
    ],
    note: COMMON_NOTE,
  },
  {
    id: 'intermediaire-sb',
    title: 'Petite blinde (SB)',
    situation: 'Tout le monde s’est couché, il ne reste que la grosse blinde. Ouverture à 3 BB : vous serez hors de position.',
    actions: [
      { key: 'raise', label: 'Ouvrir', hands: '22+, A2s+, K4s+, Q7s+, J7s+, T7s+, 97s+, 86s+, 75s+, 65s, 54s, A7o+, K9o+, QTo+, JTo' },
    ],
    note: 'Plus serrée que le bouton : la grosse blinde parlera après vous à chaque tour. ' + COMMON_NOTE,
  },
];

/** Libellé d'une case : « AKs » au-dessus de la diagonale, « AKo » en dessous, « AA » sur la diagonale */
export function cellHand(row: number, col: number): string {
  const [a, b] = [RANKS[row], RANKS[col]];
  if (row === col) {
    return a + b;
  }
  return row < col ? `${a}${b}s` : `${b}${a}o`;
}

/** Nombre de combinaisons d'une main : 6 pour une paire, 4 assortie, 12 dépareillée */
export function combos(hand: string): number {
  return hand.length === 2 ? 6 : hand.endsWith('s') ? 4 : 12;
}

const rankIndex = (r: string): number => {
  const i = RANKS.indexOf(r as Rank);
  if (i < 0) {
    throw new Error(`Valeur inconnue : ${r}`);
  }
  return i;
};

/** Développe une notation abrégée (« 22+, ATs+, KQ ») en liste de mains (« AA », « ATs », « KQo »…). */
export function expandRange(notation: string): string[] {
  const hands = new Set<string>();
  for (const raw of notation.split(',')) {
    const token = raw.trim();
    if (token) {
      expandToken(token).forEach((h) => hands.add(h));
    }
  }
  return [...hands];
}

function expandToken(token: string): string[] {
  const span = token.match(/^([AKQJT2-9])([AKQJT2-9])([so]?)-([AKQJT2-9])([AKQJT2-9])([so]?)$/);
  if (span) {
    const [, a1, b1, s1, a2, b2, s2] = span;
    if (s1 !== s2) {
      throw new Error(`Intervalle incohérent : ${token}`);
    }
    if (a1 === b1 && a2 === b2) {
      return between(rankIndex(a1), rankIndex(a2)).map((i) => RANKS[i] + RANKS[i]);
    }
    if (a1 !== a2) {
      throw new Error(`Intervalle incohérent : ${token}`);
    }
    return between(rankIndex(b1), rankIndex(b2)).flatMap((i) => suited(a1, RANKS[i], s1));
  }

  const single = token.match(/^([AKQJT2-9])([AKQJT2-9])([so]?)(\+?)$/);
  if (!single) {
    throw new Error(`Notation inconnue : ${token}`);
  }
  const [, a, b, s, plus] = single;
  const [ia, ib] = [rankIndex(a), rankIndex(b)];
  if (ia === ib) {
    if (s) {
      throw new Error(`Une paire n'est ni assortie ni dépareillée : ${token}`);
    }
    return (plus ? between(0, ia) : [ia]).map((i) => RANKS[i] + RANKS[i]);
  }
  if (ia > ib) {
    throw new Error(`Carte haute en premier : ${token}`);
  }
  // « ATs+ » : de ATs jusqu'à AKs (kicker juste sous la carte haute)
  return (plus ? between(ia + 1, ib) : [ib]).flatMap((i) => suited(a, RANKS[i], s));
}

function between(i: number, j: number): number[] {
  const [lo, hi] = i <= j ? [i, j] : [j, i];
  return Array.from({ length: hi - lo + 1 }, (_, k) => lo + k);
}

function suited(a: string, b: string, s: string): string[] {
  return s ? [a + b + s] : [`${a}${b}s`, `${a}${b}o`];
}

/** Action de chaque main d'un tableau (absente = se coucher) */
export function chartActions(chart: RangeChart): Map<string, RangeAction> {
  const map = new Map<string, RangeAction>();
  for (const action of chart.actions) {
    for (const hand of expandRange(action.hands)) {
      if (!map.has(hand)) {
        map.set(hand, action);
      }
    }
  }
  return map;
}

/** Part des 1 326 combinaisons jouées par une action, en pourcentage */
export function rangePercent(notation: string): number {
  return (expandRange(notation).reduce((sum, h) => sum + combos(h), 0) / 1326) * 100;
}
