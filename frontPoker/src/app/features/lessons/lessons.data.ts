/**
 * Rubrique « Leçons » — contenus pédagogiques 100 % originaux PokerVitrine.
 * Rédigés à partir des règles universelles du Texas Hold'em No-Limit.
 */

// Cartes -------------------------------------------------------------------
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
/** s = pique, h = cœur, d = carreau, c = trèfle */
export type Suit = 's' | 'h' | 'd' | 'c';
export type CardCode = `${Rank}${Suit}`;

// Niveaux ------------------------------------------------------------------
export type LessonLevel = 'debutant' | 'intermediaire' | 'avance';
export type LessonLevelLabel = 'Débutant' | 'Intermédiaire' | 'Expert';

/** Les trois niveaux du parcours, dans l'ordre d'affichage (valeur technique 'avance' = Expert). */
export const LESSON_LEVELS: { value: LessonLevel; label: LessonLevelLabel; description: string }[] = [
  { value: 'debutant', label: 'Débutant', description: 'Les règles, les combinaisons et les bons réflexes pour vos premières parties.' },
  { value: 'intermediaire', label: 'Intermédiaire', description: 'Corriger les erreurs fréquentes et maîtriser les bases du tournoi.' },
  { value: 'avance', label: 'Expert', description: 'Méthode de travail, variance, bankroll et équilibre de joueur.' },
];

// Positions (table à 6 joueurs) -----------------------------------------------
export type SeatId = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

// Visuels interactifs ----------------------------------------------------------
export interface HandExample {
  name: string;
  cards: CardCode[];
  description: string;
}

export interface ShowdownPlayer {
  label: string;
  cards: CardCode[];
  result: string;
}

export interface BlindLevel {
  sb: number;
  bb: number;
  ante: number;
}

export interface DecisionOption {
  label: string;
  correct: boolean;
  feedback: string;
}

export interface HandGroup {
  title: string;
  description: string;
  hands: CardCode[][];
}

export interface RevealItem {
  term: string;
  text: string;
}

export type StepVisual =
  | { kind: 'table'; hero: CardCode[]; board: CardCode[]; revealed: 0 | 3 | 4 | 5; interactive?: boolean }
  | { kind: 'showdown'; board: CardCode[]; players: ShowdownPlayer[]; winner: number | null; note: string }
  | { kind: 'ranking'; hands: HandExample[] }
  | { kind: 'positions'; highlight: SeatId[]; selected?: SeatId }
  | { kind: 'stack'; bb: number; calculator?: { chips: number; bigBlind: number } }
  | { kind: 'levels'; stack: number; levels: BlindLevel[] }
  | { kind: 'decision'; situation: string; hero?: CardCode[]; board?: CardCode[]; options: DecisionOption[] }
  | { kind: 'handGroups'; groups: HandGroup[] }
  | { kind: 'reveal'; items: RevealItem[] }
  | { kind: 'checklist'; title: string; items: string[]; alert?: { threshold: number; message: string } }
  | { kind: 'variance' }
  | { kind: 'bankroll'; reserve: number };

// Leçons -------------------------------------------------------------------------
export interface LessonStep {
  title: string;
  paragraphs: string[];
  visual: StepVisual;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Index de la bonne réponse dans `options` */
  answer: number;
  explanation: string;
}

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  level: LessonLevel;
  levelLabel: LessonLevelLabel;
  /** Position de la leçon au sein de son niveau (1, 2, 3…) */
  order: number;
  /** Durée estimée en minutes */
  duration: number;
  /** Deux cartes d'illustration pour la carte de la liste */
  cover: [CardCode, CardCode];
  steps: LessonStep[];
  quiz: QuizQuestion[];
}

// Contenu ------------------------------------------------------------------------
const L1_BOARD: CardCode[] = ['Ts', '7h', '2s', '9d', 'Kc'];

export const LESSONS: Lesson[] = [
  // 1 ----------------------------------------------------------------------------
  {
    slug: 'regles-et-combinaisons',
    title: "Règles et combinaisons du Texas Hold'em",
    summary: "Suivez une main complète, des blindes à l'abattage, et apprenez l'ordre des combinaisons.",
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 1,
    duration: 12,
    cover: ['Ah', 'Kh'],
    steps: [
      {
        title: "Le but d'une main",
        paragraphs: [
          "Chaque joueur reçoit deux cartes privées, face cachée. Cinq cartes communes, le « tableau », sont ensuite dévoilées au centre de la table et servent à tout le monde.",
          "Votre main finale est la meilleure combinaison de cinq cartes que vous pouvez former avec ces sept cartes. Vous remportez le pot soit en montrant la meilleure combinaison à l'abattage, soit parce que tous les autres joueurs se sont couchés avant.",
          "Pour la suite de la leçon, vous tenez Dame et Valet de pique. Le tableau est encore entièrement caché.",
        ],
        visual: { kind: 'table', hero: ['Qs', 'Js'], board: L1_BOARD, revealed: 0 },
      },
      {
        title: 'Le bouton et les blindes',
        paragraphs: [
          "Un jeton « bouton » désigne le donneur fictif ; il avance d'une place dans le sens des aiguilles d'une montre à chaque main.",
          "Les deux joueurs à sa gauche posent des mises obligatoires avant la distribution : la petite blinde, puis la grosse blinde (en général le double). Elles garantissent qu'il y a toujours quelque chose à gagner.",
          "Touchez une place de la table pour découvrir son rôle.",
        ],
        visual: { kind: 'positions', highlight: ['BTN', 'SB', 'BB'], selected: 'BTN' },
      },
      {
        title: 'Le préflop : premier tour d’enchères',
        paragraphs: [
          "Une fois les cartes privées distribuées, la parole revient au joueur assis à gauche de la grosse blinde, la place dite « sous le pistolet ». Le tour continue dans le sens des aiguilles d'une montre et la grosse blinde parle en dernier.",
          "Face à la grosse blinde, chacun peut se coucher, suivre (payer le montant de la grosse blinde) ou relancer. Si personne n'a relancé, la grosse blinde peut simplement « checker », c'est-à-dire parler sans ajouter de jetons.",
          "Dévoilez chaque action pour voir ce qu'elle signifie.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Se coucher', text: "Vous rendez vos cartes et renoncez au pot. Vous ne perdez que ce que vous aviez déjà misé." },
            { term: 'Checker', text: "Passer la parole sans miser. Possible seulement si personne n'a encore misé sur ce tour (ou, au préflop, pour la grosse blinde quand personne n'a relancé)." },
            { term: 'Suivre', text: "Payer exactement la mise en cours pour rester dans le coup." },
            { term: 'Miser / relancer', text: "Miser, c'est ouvrir les enchères d'un tour ; relancer, c'est augmenter une mise déjà faite. Les autres doivent alors payer, relancer à leur tour ou se coucher." },
            { term: 'Tapis', text: "Miser tous ses jetons d'un coup (« all-in » en anglais). On ne peut jamais perdre plus que ce qu'on a devant soi." },
          ],
        },
      },
      {
        title: 'Le flop : trois cartes communes',
        paragraphs: [
          "Le donneur retourne trois cartes d'un coup : c'est le flop. Un deuxième tour d'enchères commence, cette fois par le premier joueur encore en jeu à gauche du bouton. Le bouton parle donc en dernier sur tous les tours suivants.",
          "Ici, le flop 10♠ 7♥ 2♠ vous donne quatre piques : il vous manque une seule carte pour la couleur. Il reste 9 piques dans le paquet : ce sont vos « outs », les cartes qui améliorent votre main. Règle approximative : outs × 4 au flop pour deux cartes à venir, soit environ 35 % de chances de compléter d'ici la river.",
        ],
        visual: { kind: 'table', hero: ['Qs', 'Js'], board: L1_BOARD, revealed: 0, interactive: true },
      },
      {
        title: 'La turn et la river',
        paragraphs: [
          "La quatrième carte commune s'appelle la turn (« le tournant »), la cinquième la river (« la rivière ») ; ces mots anglais sont d'usage courant en français. Chacune est suivie d'un tour d'enchères, dans le même ordre qu'au flop.",
          "Le 9♦ de la turn ajoute un tirage à la quinte par les deux bouts : un Roi ou un 8 la complète. Avec les piques, cela fait 15 outs ; avec une seule carte à venir, comptez outs × 2, soit environ 30 % (32,6 % exactement). Le Roi♣ tombe à la river : vous obtenez la quinte Roi-Dame-Valet-10-9.",
        ],
        visual: { kind: 'table', hero: ['Qs', 'Js'], board: L1_BOARD, revealed: 3, interactive: true },
      },
      {
        title: "L'abattage",
        paragraphs: [
          "Si au moins deux joueurs sont encore en jeu après le dernier tour d'enchères, les cartes sont montrées : c'est l'abattage. La meilleure combinaison de cinq cartes remporte le pot.",
          "Vous pouvez utiliser deux, une ou aucune de vos cartes privées. À combinaison égale, ce sont les cartes restantes, les « kickers », qui départagent ; si les cinq cartes ont la même valeur, le pot est partagé. Les couleurs (pique, cœur…) n'ont aucune hiérarchie entre elles.",
        ],
        visual: {
          kind: 'showdown',
          board: L1_BOARD,
          players: [
            { label: 'Vous', cards: ['Qs', 'Js'], result: 'Quinte au Roi (R-D-V-10-9)' },
            { label: 'Adversaire', cards: ['Kh', 'Th'], result: 'Deux paires, Rois et 10' },
          ],
          winner: 0,
          note: 'Votre quinte bat les deux paires de votre adversaire : vous remportez le pot.',
        },
      },
      {
        title: 'La hiérarchie des combinaisons',
        paragraphs: [
          "Voici les dix combinaisons, de la plus forte à la plus faible. Plus une combinaison est rare, plus elle est forte.",
          "Deux précisions utiles : l'As peut être haut (10-V-D-R-A) ou bas (A-2-3-4-5, la plus petite quinte, surnommée « la roue »), mais une suite ne « tourne » pas : D-R-A-2-3 n'est pas une quinte. Sélectionnez une combinaison pour voir un exemple.",
        ],
        visual: {
          kind: 'ranking',
          hands: [
            { name: 'Quinte flush royale', cards: ['Ah', 'Kh', 'Qh', 'Jh', 'Th'], description: "As, Roi, Dame, Valet et 10 de la même couleur. La meilleure main possible." },
            { name: 'Quinte flush', cards: ['9c', '8c', '7c', '6c', '5c'], description: "Cinq cartes qui se suivent, toutes de la même couleur. Ici, quinte flush au 9." },
            { name: 'Carré', cards: ['7s', '7h', '7d', '7c', 'Kd'], description: "Quatre cartes de même valeur. La cinquième carte sert de kicker." },
            { name: 'Full', cards: ['Qs', 'Qh', 'Qc', '4d', '4s'], description: "Un brelan et une paire : ici, full aux Dames par les 4. On compare d'abord le brelan." },
            { name: 'Couleur', cards: ['Ad', 'Jd', '8d', '6d', '2d'], description: "Cinq cartes de la même couleur, non consécutives. On compare la plus haute carte, puis la suivante." },
            { name: 'Quinte', cards: ['8s', '7d', '6c', '5h', '4s'], description: "Cinq cartes qui se suivent, de couleurs différentes. Aussi appelée « suite »." },
            { name: 'Brelan', cards: ['5h', '5c', '5s', 'Kc', '9d'], description: "Trois cartes de même valeur, accompagnées de deux kickers." },
            { name: 'Double paire', cards: ['Jc', 'Jd', '3h', '3s', 'As'], description: "Deux paires différentes. On compare la paire haute, puis la paire basse, puis le kicker." },
            { name: 'Paire', cards: ['Th', 'Tc', 'Ac', '8d', '4h'], description: "Deux cartes de même valeur. À paire égale, les trois kickers départagent." },
            { name: 'Carte haute', cards: ['As', 'Qd', '9c', '6h', '3d'], description: "Aucune combinaison : c'est la carte la plus haute qui compte, ici l'As." },
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Combien de cartes communes sont dévoilées au flop ?',
        options: ['Une seule', 'Trois', 'Cinq'],
        answer: 1,
        explanation: "Le flop dévoile trois cartes d'un coup. La turn et la river en ajoutent ensuite une chacune, pour un total de cinq.",
      },
      {
        question: 'Laquelle de ces combinaisons est la plus forte ?',
        options: ['Une quinte', 'Une couleur', 'Un brelan'],
        answer: 1,
        explanation: 'Dans la hiérarchie, la couleur bat la quinte, qui bat elle-même le brelan.',
      },
      {
        question: 'Laquelle de ces suites est une quinte valable ?',
        options: ['D-R-A-2-3', 'A-2-3-4-5', 'R-A-2-3-4'],
        answer: 1,
        explanation: "A-2-3-4-5 (« la roue ») est la plus petite quinte : l'As y joue le rôle de carte basse. En revanche, une suite ne peut pas passer de l'As au 2 : D-R-A-2-3 et R-A-2-3-4 ne sont pas des quintes.",
      },
    ],
  },

  // 2 ----------------------------------------------------------------------------
  {
    slug: 'bien-debuter',
    title: 'Bien débuter : une approche simple et solide',
    summary: 'Jouer peu de mains, les jouer avec décision, tirer parti de la position et savoir se coucher.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 2,
    duration: 10,
    cover: ['Qd', 'Qc'],
    steps: [
      {
        title: 'Moins de mains, de meilleures décisions',
        paragraphs: [
          "Il existe 1 326 combinaisons de deux cartes, soit 169 mains de départ distinctes si l'on ne tient compte que des valeurs et du fait d'être assorti ou non. Vous recevrez une paire servie environ une fois sur 17 (5,9 %), et la plupart des mains ne valent pas la peine d'être jouées.",
          "En débutant avec une sélection serrée, vous entrez plus souvent dans un coup avec la meilleure main et vos décisions après le flop deviennent plus simples. Parcourez les trois familles ci-dessous : ce sont des repères pour une table à 6 joueurs, pas une liste figée.",
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            {
              title: 'À jouer de toutes les places',
              description: 'Les grosses paires et les As accompagnés d’une figure forte.',
              hands: [['As', 'Ad'], ['Kh', 'Kc'], ['Qs', 'Qd'], ['Jh', 'Jc'], ['Ah', 'Ks'], ['Ad', 'Qd']],
            },
            {
              title: 'À jouer surtout en fin de parole',
              description: 'Paires moyennes et petites, cartes assorties qui se suivent, As assortis : elles gagnent en valeur quand vous parlez après les autres.',
              hands: [['8h', '8c'], ['5s', '5d'], ['9h', '8h'], ['Jc', 'Tc'], ['As', '5s'], ['Kd', 'Jd']],
            },
            {
              title: 'À laisser passer',
              description: 'Cartes faibles, dépareillées et éloignées les unes des autres : elles forment rarement une bonne main.',
              hands: [['Kc', '4d'], ['9s', '2h'], ['Jd', '3c'], ['7h', '2c'], ['Qc', '5h'], ['8d', '3s']],
            },
          ],
        },
      },
      {
        title: 'Jouer de façon décidée',
        paragraphs: [
          "Quand vous entrez dans un coup, préférez miser ou relancer plutôt que de simplement suivre. Prendre l'initiative vous donne deux manières de gagner : vos adversaires peuvent se coucher tout de suite, et s'ils continuent, vous pouvez encore avoir la meilleure main.",
          "En suivant, vous laissez l'initiative à l'autre : pour gagner, il faudra presque toujours montrer la meilleure combinaison. Comparez les deux approches.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Je relance', text: "Je mets la pression. Si tout le monde se couche, je gagne le pot sans abattage. Si on me paie, j'ai encore mes cartes pour gagner, et souvent l'initiative pour le tour suivant." },
            { term: 'Je suis', text: "Je reste passif. Personne n'est poussé à se coucher : je ne gagne en général que si ma main est la meilleure à la fin." },
          ],
        },
      },
      {
        title: 'La position, un avantage gratuit',
        paragraphs: [
          "Après le flop, c'est le bouton qui parle en dernier sur chaque tour (ou, s'il s'est couché, le joueur encore en jeu le plus proche à sa droite). Il voit ce que les autres ont fait avant de décider : c'est une information précieuse et gratuite.",
          "On dit qu'on est « en position » quand on parle après son adversaire, « hors de position » dans le cas contraire. Touchez chaque place pour découvrir ses particularités.",
        ],
        visual: { kind: 'positions', highlight: ['CO', 'BTN'], selected: 'BTN' },
      },
      {
        title: 'Ouvrir plus large en fin de parole',
        paragraphs: [
          "Plus vous parlez tard, moins il reste de joueurs derrière vous susceptibles de détenir une très grosse main. Vous pouvez donc élargir un peu votre sélection au cut-off (la place à droite du bouton) et au bouton.",
          "À l'inverse, sous le pistolet, cinq joueurs parlent encore après vous : restez sélectif. Mettez-vous en situation.",
        ],
        visual: {
          kind: 'decision',
          situation: "Table à 6. Tout le monde s'est couché jusqu'à vous, au bouton. Seules les blindes restent à parler.",
          hero: ['Th', '9h'],
          options: [
            { label: 'Relancer', correct: true, feedback: "Bon choix : 10-9 assorti se joue bien en position, et seules deux mains aléatoires peuvent vous résister. Vous pouvez même gagner les blindes immédiatement." },
            { label: 'Suivre la grosse blinde', correct: false, feedback: "Suivre vous prive de la possibilité de gagner le pot tout de suite et laisse les blindes voir le flop à bon prix. Si la main vaut d'être jouée ici, relancez." },
            { label: 'Se coucher', correct: false, feedback: "Trop prudent : au bouton, sans relance devant, 10-9 assorti fait partie des mains jouables. Profitez de votre position." },
          ],
        },
      },
      {
        title: 'Se coucher sans regret',
        paragraphs: [
          "Se coucher est une action à part entière, pas un échec. Une main abandonnée ne vous coûte plus rien, alors qu'une main faible jouée par curiosité coûte souvent cher.",
          "Si le flop aurait complété la main que vous avez jetée, ne changez rien : une décision se juge avec ce que vous saviez au moment de la prendre, pas avec la carte qui est tombée ensuite.",
        ],
        visual: {
          kind: 'decision',
          situation: 'Table à 6. Vous êtes sous le pistolet, premier à parler avant le flop.',
          hero: ['Ks', '7d'],
          options: [
            { label: 'Relancer', correct: false, feedback: "Roi-7 dépareillé est trop faible pour ouvrir en première position : cinq joueurs parlent après vous et ceux qui paieront auront souvent mieux." },
            { label: 'Suivre la grosse blinde', correct: false, feedback: "C'est la pire option : vous mettez des jetons avec une main faible, sans initiative, et vous serez hors de position face à la plupart des joueurs." },
            { label: 'Se coucher', correct: true, feedback: "Exactement : cette main ne fait pas partie d'une sélection solide en première position. Se coucher ici ne coûte rien." },
          ],
        },
      },
      {
        title: 'Une routine simple à chaque main',
        paragraphs: [
          "Avant d'agir, prenez l'habitude de vous poser toujours les mêmes questions. Cette routine limite les décisions impulsives.",
          "Cochez-les mentalement pendant vos prochaines parties, même entre amis ou sur des tables gratuites.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Avant chaque décision préflop',
          items: [
            'Quelle est ma position à la table ?',
            "Quelqu'un a-t-il déjà relancé avant moi ?",
            'Ma main fait-elle partie de ma sélection à cette place ?',
            'Si je joue : est-ce que je relance plutôt que de suivre ?',
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Pourquoi relancer est-il souvent préférable à suivre quand on entre dans un coup ?',
        options: [
          'Parce que cela garantit de gagner la main',
          'Parce que vous pouvez gagner si vos adversaires se couchent, ou en ayant la meilleure main',
          'Parce que la règle interdit de suivre la grosse blinde',
        ],
        answer: 1,
        explanation: "Relancer ajoute une façon de gagner : faire coucher l'adversaire. Rien n'est garanti pour autant, et suivre reste autorisé par les règles.",
      },
      {
        question: "Après le flop, quelle place parle en dernier quand elle est encore dans le coup ?",
        options: ['La petite blinde', 'La grosse blinde', 'Le bouton'],
        answer: 2,
        explanation: "Après le flop, la parole commence à gauche du bouton : le bouton parle donc en dernier sur chaque tour, ce qui en fait la meilleure position.",
      },
      {
        question: "Vous vous couchez avec Roi-7 dépareillé sous le pistolet, et le flop aurait apporté deux Rois. Que retenir ?",
        options: [
          'Il fallait jouer la main : le résultat le prouve',
          'Rien de particulier : la décision était bonne avec les informations disponibles',
          'Il faut désormais jouer tous les Rois',
        ],
        answer: 1,
        explanation: "Une décision se juge au moment où on la prend. Roi-7 dépareillé en première position perd de l'argent sur le long terme, même si le tableau l'aurait parfois aidé.",
      },
    ],
  },

  // 3 ----------------------------------------------------------------------------
  {
    slug: 'erreurs-preflop',
    title: 'Les erreurs courantes avant le flop',
    summary: 'Limp, mains jouées hors de position, mains dominées, tapis oublié : repérez les fuites les plus fréquentes.',
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 1,
    duration: 12,
    cover: ['Ac', 'Jd'],
    steps: [
      {
        title: 'Erreur n°1 : entrer en suivant (le « limp »)',
        paragraphs: [
          "Le « limp » (de l'anglais, « boiter ») consiste à entrer dans un coup en suivant simplement la grosse blinde, sans relancer. C'est l'une des habitudes les plus coûteuses.",
          "En suivant, vous renoncez à gagner le pot immédiatement, vous laissez les blindes voir le flop à bon prix et vous jouez souvent à plusieurs, sans initiative. Si personne n'est entré avant vous, la règle simple est : relancer ou se coucher.",
        ],
        visual: {
          kind: 'decision',
          situation: "Personne n'est encore entré dans le coup. Vous êtes au cut-off, la place à droite du bouton, avec 100 grosses blindes.",
          hero: ['Ac', '9c'],
          options: [
            { label: 'Suivre la grosse blinde', correct: false, feedback: "C'est le limp : vous invitez le bouton et les blindes à jouer à bon prix et vous perdez l'initiative." },
            { label: 'Relancer à environ 2,5 grosses blindes', correct: true, feedback: "Oui : As-9 assorti est une ouverture standard au cut-off. La relance peut faire coucher les trois joueurs restants et vous garde l'initiative." },
            { label: 'Se coucher', correct: false, feedback: "Trop serré : avec seulement trois joueurs derrière vous, As-9 assorti est une main tout à fait jouable." },
          ],
        },
      },
      {
        title: 'Erreur n°2 : trop de mains hors de position',
        paragraphs: [
          "En première position ou depuis les blindes, vous parlerez avant votre adversaire sur tous les tours suivants. Vous décidez donc avec moins d'informations que lui.",
          "Les mains moyennes, comme Roi-Valet dépareillé ou les petites cartes assorties, deviennent alors difficiles à jouer avec profit. Les places en rouge sont celles où vous serez le plus souvent hors de position.",
        ],
        visual: { kind: 'positions', highlight: ['UTG', 'SB', 'BB'], selected: 'SB' },
      },
      {
        title: 'Erreur n°3 : payer avec une main dominée',
        paragraphs: [
          "On dit qu'une main est « dominée » quand elle partage une carte avec la main adverse, mais que sa seconde carte est plus faible : As-Valet face à As-Roi, Roi-10 face à Roi-Dame.",
          "Le piège est sournois : quand l'As tombe, vous touchez votre paire… et vous perdez quand même à cause du kicker. Dévoilez la main adverse.",
        ],
        visual: {
          kind: 'showdown',
          board: ['As', '8d', '4s', '2c', 'Th'],
          players: [
            { label: 'Vous', cards: ['Ah', 'Jc'], result: "Paire d'As, kicker Valet" },
            { label: 'Adversaire', cards: ['Ad', 'Kc'], result: "Paire d'As, kicker Roi" },
          ],
          winner: 1,
          note: "Même paire d'As : c'est le kicker qui décide. Le Roi bat le Valet, l'adversaire gagne.",
        },
      },
      {
        title: 'Reconnaître une relance qui vous domine',
        paragraphs: [
          "Face à une forte relance d'un joueur sélectif, sa fourchette (l'ensemble des mains qu'il peut avoir, la « range » en anglais) contient beaucoup de grosses paires, d'As-Roi et d'As-Dame. Contre ces mains, As-Valet est soit dominé, soit nettement derrière.",
          "Payer dans ce cas vous mène souvent à gagner un petit pot ou à en perdre un gros. Que feriez-vous ?",
        ],
        visual: {
          kind: 'decision',
          situation: "Un joueur que vous avez vu très sélectif relance fort sous le pistolet. Un autre joueur relance encore derrière lui (un « 3-bet », la deuxième relance du tour). Vous êtes au bouton.",
          hero: ['Ah', 'Jc'],
          options: [
            { label: 'Payer', correct: false, feedback: "Face à deux relances de joueurs sélectifs, As-Valet est très souvent dominé par As-Roi ou As-Dame, ou derrière une paire haute. Payer coûte cher." },
            { label: 'Se coucher', correct: true, feedback: "C'est le choix raisonnable : les fourchettes des deux joueurs sont fortes et As-Valet joue mal contre elles. Une main jolie n'est pas forcément une main jouable." },
            { label: 'Relancer à tapis', correct: false, feedback: "Vous ne serez payé quasiment que par des mains qui vous battent ou vous dominent. Trop risqué dans ce contexte." },
          ],
        },
      },
      {
        title: 'Erreur n°4 : oublier la taille du tapis',
        paragraphs: [
          "Une même main ne se joue pas de la même façon avec 100 ou 15 grosses blindes. Les petites paires et les cartes assorties qui se suivent cherchent à toucher une grosse combinaison : elles ont besoin de tapis profonds pour rapporter gros quand cela arrive.",
          "Avec un tapis court, ces mains perdent de leur valeur, tandis que les cartes hautes comme As-Roi ou les grosses paires gagnent en importance. Faites varier le tapis pour voir la zone dans laquelle vous jouez.",
        ],
        visual: { kind: 'stack', bb: 100 },
      },
      {
        title: 'Avant d’agir : quatre questions',
        paragraphs: [
          "Toutes ces erreurs ont un point commun : elles viennent d'une décision prise trop vite. Une courte vérification suffit souvent à les éviter.",
          "Gardez cette liste en tête pour chaque décision préflop un peu délicate.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Ma vérification préflop',
          items: [
            'Qui a relancé, et depuis quelle position ?',
            'Ma main risque-t-elle d’être dominée par les mains qui relancent ainsi ?',
            'Combien de grosses blindes avons-nous, lui et moi ?',
            'Serai-je en position ou hors de position après le flop ?',
          ],
        },
      },
    ],
    quiz: [
      {
        question: "Personne n'est entré dans le coup avant vous et votre main mérite d'être jouée. Quelle option est généralement la meilleure ?",
        options: ['Suivre la grosse blinde', 'Relancer', 'Checker'],
        answer: 1,
        explanation: "Relancer vous donne l'initiative et la possibilité de gagner tout de suite. Suivre la grosse blinde (le limp) est moins rentable, et checker est impossible : il faut au moins payer la grosse blinde.",
      },
      {
        question: "Sur un tableau A♠ 8♦ 4♠ 2♣ 10♥, vous avez As-Valet et votre adversaire As-Roi. Qui gagne ?",
        options: ['Vous', 'Votre adversaire', 'Le pot est partagé'],
        answer: 1,
        explanation: "Les deux joueurs ont une paire d'As. Les meilleures cinq cartes sont A-A-R-10-8 contre A-A-V-10-8 : le kicker Roi l'emporte sur le Valet.",
      },
      {
        question: 'Avec un tapis court (environ 15 grosses blindes), que deviennent les petites paires et les cartes assorties qui se suivent ?',
        options: [
          "Elles prennent de la valeur, car elles touchent plus souvent",
          "Elles perdent de la valeur, car vous gagnez trop peu de jetons quand elles touchent",
          "Leur valeur ne dépend pas du tapis",
        ],
        answer: 1,
        explanation: "Ces mains touchent rarement une grosse combinaison ; elles ne sont rentables que si vous pouvez alors gagner un gros pot, ce qu'un tapis court ne permet pas.",
      },
    ],
  },

  // 4 ----------------------------------------------------------------------------
  {
    slug: 'bases-du-tournoi',
    title: 'Les bases du tournoi',
    summary: 'Niveaux de blindes, antes, tapis en grosses blindes, adaptation selon la profondeur et bulle.',
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 2,
    duration: 14,
    cover: ['9s', '9h'],
    steps: [
      {
        title: 'Comment se déroule un tournoi',
        paragraphs: [
          "Tous les participants commencent avec le même nombre de jetons. Le tournoi se poursuit jusqu'à ce qu'un seul joueur les possède tous ; chaque joueur qui perd son tapis est éliminé.",
          "Contrairement au « cash game » (partie où les jetons valent directement leur montant et où l'on peut quitter la table à tout moment), les jetons de tournoi n'ont pas de valeur en eux-mêmes : seul compte votre classement final. Découvrez le vocabulaire de base.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Tapis de départ', text: "Le nombre de jetons identique remis à chaque joueur au début du tournoi." },
            { term: 'Élimination', text: "Un joueur qui n'a plus de jetons quitte le tournoi. Il n'y a pas de recave, sauf règle particulière annoncée à l'avance." },
            { term: 'Table finale', text: "La dernière table, réunissant les derniers joueurs encore en lice." },
            { term: 'Places payées', text: "Dans les tournois avec dotation, seuls les mieux classés (souvent 10 à 20 % des inscrits) reçoivent un prix." },
          ],
        },
      },
      {
        title: 'Les niveaux de blindes et l’ante',
        paragraphs: [
          "Les blindes augmentent à intervalles réguliers, par exemple toutes les 15 ou 20 minutes : ce sont les « niveaux ». Cela force l'action et fait avancer le tournoi.",
          "À partir d'un certain niveau s'ajoute souvent une « ante » : une petite mise obligatoire supplémentaire (payée par chaque joueur, ou en un seul bloc par la grosse blinde selon les formats) qui grossit le pot dès le départ. Passez d'un niveau à l'autre et regardez fondre la valeur relative de votre tapis, sans même jouer une main.",
        ],
        visual: {
          kind: 'levels',
          stack: 20000,
          levels: [
            { sb: 100, bb: 200, ante: 0 },
            { sb: 150, bb: 300, ante: 0 },
            { sb: 200, bb: 400, ante: 50 },
            { sb: 300, bb: 600, ante: 75 },
            { sb: 400, bb: 800, ante: 100 },
            { sb: 600, bb: 1200, ante: 150 },
          ],
        },
      },
      {
        title: 'Compter son tapis en grosses blindes',
        paragraphs: [
          "Le nombre de jetons seul ne veut rien dire : 20 000 jetons, c'est énorme quand la grosse blinde vaut 200, et très peu quand elle vaut 2 000.",
          "Divisez votre tapis par la grosse blinde pour obtenir votre profondeur en « BB » (big blinds, grosses blindes). C'est ce chiffre qui guide votre stratégie. Essayez avec vos propres valeurs.",
        ],
        visual: { kind: 'stack', bb: 30, calculator: { chips: 18000, bigBlind: 600 } },
      },
      {
        title: 'Plus de 40 BB : de la marge',
        paragraphs: [
          "Avec un tapis profond, vous avez le temps. Vous pouvez relancer, payer en position, jouer après le flop et utiliser les mains spéculatives (petites paires, cartes assorties qui se suivent) qui cherchent à toucher gros.",
          "C'est la phase où l'on joue le plus « normalement ». L'erreur classique consiste à se mettre en danger trop tôt dans de gros pots avec des mains moyennes.",
        ],
        visual: { kind: 'stack', bb: 55 },
      },
      {
        title: 'Entre 15 et 25 BB : simplifier',
        paragraphs: [
          "Avec un tapis moyen, une relance puis un paiement engagent déjà une grosse part de vos jetons. Payer des relances « pour voir » devient coûteux.",
          "On joue plus direct : relancer ou se coucher quand on ouvre, et face à une relance adverse, envisager de relancer à tapis avec les meilleures mains plutôt que de payer. Les mains spéculatives perdent de leur intérêt.",
        ],
        visual: { kind: 'stack', bb: 20 },
      },
      {
        title: 'Moins de 10 BB : tapis ou se coucher',
        paragraphs: [
          "Sous 10 grosses blindes, une relance normale engage presque tout votre tapis : vous ne pourrez plus vous coucher face à une relance. Mieux vaut alors pousser directement tapis ou se coucher.",
          "Partir à tapis en premier vous donne deux façons de gagner (tout le monde se couche, ou vous gagnez l'abattage). Attendre une main parfaite est risqué : chaque tour de table, les blindes et les antes grignotent vos jetons.",
        ],
        visual: {
          kind: 'decision',
          situation: "Il vous reste 8 grosses blindes. Tout le monde s'est couché jusqu'à vous, au bouton.",
          hero: ['Kd', '9c'],
          options: [
            { label: 'Relancer au minimum', correct: false, feedback: "Avec 8 BB, une petite relance engage déjà un quart de votre tapis : si on relance derrière, vous serez obligé de payer dans de mauvaises conditions. Autant partir à tapis." },
            { label: 'Partir à tapis', correct: true, feedback: "Oui : avec 8 BB au bouton, Roi-9 est une main suffisante pour partir à tapis. Les blindes doivent avoir une main forte pour payer, et vous gagnez souvent le pot tout de suite." },
            { label: 'Se coucher', correct: false, feedback: "Trop passif : à cette profondeur et à cette place, Roi-9 est largement assez fort. Attendre fait fondre votre tapis." },
          ],
        },
      },
      {
        title: 'La bulle, simplement',
        paragraphs: [
          "La « bulle » est le moment où il ne reste qu'un joueur de plus que le nombre de places payées : le prochain éliminé repart sans rien. Le jeu change alors souvent de rythme.",
          "Beaucoup de joueurs deviennent très prudents pour atteindre les places payées. Votre attitude dépend de votre tapis : dévoilez chaque situation.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Gros tapis', text: "Vous pouvez mettre la pression sur les tapis moyens, qui n'ont pas envie de risquer leur place. Sans jouer n'importe quoi : un gros tapis peut aussi fondre." },
            { term: 'Tapis moyen', text: "C'est souvent la position la plus délicate : évitez les gros affrontements contre les gros tapis, qui peuvent vous éliminer, sans pour autant tout jeter." },
            { term: 'Tapis court', text: "Votre priorité est de choisir le bon moment pour partir à tapis. Parfois, d'autres tapis courts vont sauter avant vous ; regardez la table." },
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Vous avez 24 000 jetons et la grosse blinde vaut 800. Combien de grosses blindes représentez-vous ?',
        options: ['24 BB', '30 BB', '80 BB'],
        answer: 1,
        explanation: '24 000 ÷ 800 = 30. Vous avez donc un tapis de 30 grosses blindes.',
      },
      {
        question: 'Avec moins de 10 grosses blindes, quelle approche est généralement recommandée quand vous ouvrez le coup ?',
        options: ['Suivre la grosse blinde pour voir le flop', 'Faire une petite relance', 'Partir à tapis ou se coucher'],
        answer: 2,
        explanation: "À cette profondeur, une relance engage presque tout votre tapis. Partir à tapis directement maximise vos chances de faire coucher les autres et vous évite les situations sans issue.",
      },
      {
        question: 'Que désigne la « bulle » dans un tournoi ?',
        options: [
          "La pause entre deux niveaux de blindes",
          "Le moment où il ne reste qu'un joueur de plus que le nombre de places payées",
          "La table finale",
        ],
        answer: 1,
        explanation: "À la bulle, le prochain joueur éliminé est le dernier à ne rien recevoir. La pression psychologique y est maximale.",
      },
    ],
  },

  // 5 ----------------------------------------------------------------------------
  {
    slug: 'progresser-en-tournoi',
    title: 'Progresser en tournoi : méthode et équilibre',
    summary: 'Une routine de travail, des notes utiles, la variance, des repères de bankroll prudents et le jeu responsable.',
    level: 'avance',
    levelLabel: 'Expert',
    order: 1,
    duration: 13,
    cover: ['Jh', 'Td'],
    steps: [
      {
        title: 'Revoir ses mains marquantes',
        paragraphs: [
          "Après une session, notez trois à cinq mains où vous avez hésité ou perdu un pot important. Rejouez-les à froid, tour par tour : quelles informations aviez-vous, quelles options s'offraient à vous ?",
          "L'objectif n'est pas de vous juger, mais d'identifier une ou deux situations récurrentes à travailler. Voici une grille de relecture.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Grille de relecture d’une main',
          items: [
            'Position, tapis effectifs (le plus petit des deux tapis) et niveau notés',
            'Action reconstituée à chaque tour : préflop, flop, turn, river',
            'Les mains que je prêtais à mon adversaire à chaque étape',
            'Une option alternative envisagée et ce qu’elle aurait changé',
            'Une conclusion en une phrase, à relire avant la prochaine session',
          ],
        },
      },
      {
        title: 'Prendre des notes utiles',
        paragraphs: [
          "Une bonne note est courte, factuelle et observable. Elle décrit un comportement que vous avez vu, pas une impression.",
          "Prenez aussi des notes sur vous-même : les situations où vous doutez sont votre meilleur programme de travail. Comparez une note vague et une note exploitable.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Note vague', text: "« Joueur bizarre, joue mal. » Impossible de s'en servir à la prochaine main." },
            { term: 'Note utile', text: "« Relance très souvent au bouton ; se couche face à une relance derrière. » Vous savez quoi tenter contre lui." },
            { term: 'Note sur soi', text: "« Hésitation sur la river avec une paire moyenne face à une grosse mise. » Un thème à étudier cette semaine." },
          ],
        },
      },
      {
        title: 'Séparer décision et résultat',
        paragraphs: [
          "Au poker, une bonne décision peut perdre et une mauvaise peut gagner. Sur une seule main, le résultat ne dit presque rien de la qualité du jeu.",
          "Ce qui compte, c'est de prendre des décisions qui gagnent en moyenne, sur des milliers de mains. Testez votre lecture.",
        ],
        visual: {
          kind: 'decision',
          situation: "Préflop, 30 BB chacun. Vous partez à tapis avec deux Rois, votre adversaire paie avec As-7. Un As tombe à la river et vous perdez.",
          hero: ['Kh', 'Ks'],
          options: [
            { label: 'Ma décision était mauvaise', correct: false, feedback: "Non : avant le tableau, deux Rois gagnent environ 7 fois sur 10 contre As-7. Vous avez fait le bon choix et le hasard a tranché contre vous cette fois-ci." },
            { label: 'Ma décision était bonne, le résultat non', correct: true, feedback: "Exactement : vous étiez largement favori (environ 70 %). Rejouée mille fois, cette situation vous rapporte des jetons." },
            { label: "On ne peut pas savoir sans connaître la river", correct: false, feedback: "Au contraire : la décision se prend avant que la river tombe. On l'évalue avec les informations disponibles à ce moment-là." },
          ],
        },
      },
      {
        title: 'La variance, compagne de route',
        paragraphs: [
          "La variance, ce sont les écarts entre vos résultats à court terme et ce que vaut réellement votre jeu. En tournoi, elle est particulièrement forte : peu de joueurs sont payés et l'essentiel des prix va aux toutes premières places.",
          "Même un joueur solide peut enchaîner de longues séries sans résultat. Les courbes ci-dessous sont fictives et illustrent des parcours très différents pour un même niveau de jeu.",
        ],
        visual: { kind: 'variance' },
      },
      {
        title: 'Bankroll : des repères prudents',
        paragraphs: [
          "Si vous jouez de l'argent, ne le faites qu'avec une somme dont vous pouvez vous passer, séparée de votre budget courant. Les tournois gratuits ou entre amis permettent aussi très bien de progresser.",
          "Un repère prudent souvent cité en tournoi : ne pas engager plus de 1 % de cette réserve sur un seul tournoi, soit au moins 100 droits d'entrée. Ce sont des garde-fous, jamais des garanties : même ainsi, une réserve peut fondre.",
        ],
        visual: { kind: 'bankroll', reserve: 500 },
      },
      {
        title: 'Gérer le temps et la fatigue',
        paragraphs: [
          "La qualité des décisions baisse avec la fatigue, la faim ou l'agacement. Les longues sessions sans pause sont l'un des pièges les plus courants.",
          "Fixez une durée avant de commencer, faites une courte pause chaque heure et arrêtez-vous dès que vous jouez par frustration (le « tilt »).",
        ],
        visual: {
          kind: 'checklist',
          title: 'Avant, pendant, après',
          items: [
            'Avant : je fixe une heure de fin et un budget, et je m’y tiens',
            'Pendant : je fais une pause de quelques minutes chaque heure',
            'Pendant : je m’arrête si je joue énervé ou pour « me refaire »',
            'Après : je note mes mains marquantes, puis je déconnecte',
          ],
        },
      },
      {
        title: 'Jouer de façon responsable',
        paragraphs: [
          "Le poker doit rester un loisir. Certains signes doivent alerter : jouer pour récupérer ses pertes, dépasser son budget, cacher son activité, emprunter pour jouer, ou ne plus penser qu'au jeu.",
          "Si vous vous reconnaissez dans l'un de ces signes, faites une pause et parlez-en. Joueurs Info Service répond au 09 74 75 13 13 (appel non surtaxé), 7 jours sur 7.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Ces derniers temps, il m’arrive de…',
          items: [
            'Rejouer tout de suite pour récupérer une perte',
            'Dépasser le budget ou la durée que je m’étais fixés',
            'Cacher à mes proches le temps ou l’argent consacré au jeu',
            'Emprunter ou utiliser l’argent du quotidien pour jouer',
          ],
          alert: {
            threshold: 1,
            message: "Un seul de ces signes mérite déjà qu'on y prête attention. Joueurs Info Service vous écoute, gratuitement et anonymement : 09 74 75 13 13 (appel non surtaxé).",
          },
        },
      },
    ],
    quiz: [
      {
        question: 'Quand vous revoyez une main, que faut-il évaluer en priorité ?',
        options: [
          "Le résultat : avez-vous gagné le pot ?",
          'La qualité de la décision avec les informations disponibles à ce moment-là',
          'La chance de votre adversaire',
        ],
        answer: 1,
        explanation: "Le résultat d'une main isolée dépend beaucoup du hasard. Seule la qualité de la décision, prise avec ce que vous saviez, permet de progresser.",
      },
      {
        question: 'Avec une réserve de 300 € dédiée aux tournois, quel est le droit d’entrée maximal selon le repère prudent de 1 % ?',
        options: ['3 €', '30 €', '1 €'],
        answer: 0,
        explanation: "1 % de 300 € donne 3 €, soit 100 droits d'entrée dans la réserve. C'est un garde-fou contre la variance, pas une garantie de gain.",
      },
      {
        question: 'Vous enchaînez les sessions pour récupérer vos pertes et dépassez votre budget. Quel est le bon réflexe ?',
        options: [
          'Augmenter les mises pour se refaire plus vite',
          'Faire une pause et en parler, par exemple à Joueurs Info Service (09 74 75 13 13)',
          'Changer de type de tournoi',
        ],
        answer: 1,
        explanation: "Chercher à se refaire est un signal d'alerte classique. S'arrêter et en parler est la bonne réponse ; Joueurs Info Service est joignable au 09 74 75 13 13 (appel non surtaxé).",
      },
    ],
  },
];

export function findLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

/** Leçons d'un niveau, triées par `order`. */
export function lessonsByLevel(level: LessonLevel): Lesson[] {
  return LESSONS.filter((l) => l.level === level).sort((a, b) => a.order - b.order);
}
