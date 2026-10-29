import type { Lesson, CardCode } from '../lessons.data';

/**
 * Leçons du niveau Débutant (orders 3 à 15), en complément des leçons fondatrices de lessons.data.ts.
 * Contenu 100 % original PokerVitrine.
 */

const VOCAB_BOARD: CardCode[] = ['Ac', '8s', '4d', 'Jh', '2c'];
const OUTS_BOARD: CardCode[] = ['Kh', '9h', '3c', 'Jd', '2h'];
const BLUFF_BOARD: CardCode[] = ['Tc', '7c', '2h', 'Kd', '6s'];

export const DEBUTANT_LESSONS: Lesson[] = [
  // 3 ----------------------------------------------------------------------------
  {
    slug: 'vocabulaire-de-la-table',
    title: 'Le vocabulaire de la table',
    summary: 'Parole, pot, tableau, checker, suivre, relancer, tapis : les mots indispensables pour suivre une main sans hésiter.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 3,
    duration: 9,
    cover: ['Jc', 'Jd'],
    steps: [
      {
        title: 'Les mots du décor',
        paragraphs: [
          "Avant de parler d'actions, il faut nommer ce qui se trouve sur la table. Le poker a son propre lexique, en partie emprunté à l'anglais : vous entendrez souvent les deux versions.",
          'Dévoilez chaque terme : ce sont ceux que vous croiserez dans toutes les leçons suivantes.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Le pot', text: "L'ensemble des jetons misés pendant la main, au centre de la table. Le gagnant le remporte en entier (ou le partage en cas d'égalité)." },
            { term: 'Le tableau', text: "Les cinq cartes communes, retournées face visible au centre et utilisables par tous les joueurs. En anglais : le « board »." },
            { term: 'Le tapis', text: "Les jetons qu'un joueur a devant lui (« stack » en anglais). Être « à tapis », c'est avoir misé tous ses jetons." },
            { term: 'La parole', text: "Le droit d'agir. « Avoir la parole », c'est être le joueur dont c'est le tour. On n'agit jamais avant son tour." },
            { term: 'Les blindes', text: 'Les deux mises obligatoires posées avant la distribution par les deux joueurs à gauche du bouton : la petite blinde et la grosse blinde.' },
          ],
        },
      },
      {
        title: 'Les cinq actions',
        paragraphs: [
          "Quand vous avez la parole, vous n'avez qu'un petit nombre de choix possibles. Lesquels exactement ? Cela dépend d'une seule question : quelqu'un a-t-il déjà misé sur ce tour d'enchères ?",
          "S'il n'y a encore aucune mise, vous pouvez checker ou miser. S'il y a une mise, vous pouvez vous coucher, suivre ou relancer. Dévoilez chaque action et son équivalent anglais.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Checker (« check »)', text: "Passer la parole sans mettre de jetons. Uniquement possible si personne n'a misé avant vous sur ce tour." },
            { term: 'Miser (« bet »)', text: "Mettre des jetons le premier sur un tour d'enchères. Les autres devront au moins payer ce montant pour rester dans le coup." },
            { term: 'Suivre (« call »)', text: 'Payer exactement la mise en cours. On dit aussi « payer ».' },
            { term: 'Relancer (« raise »)', text: "Augmenter une mise déjà faite. L'augmentation doit être au moins égale à la mise ou à la relance précédente." },
            { term: 'Se coucher (« fold »)', text: 'Abandonner la main en rendant ses cartes. Les jetons déjà misés restent dans le pot.' },
          ],
        },
      },
      {
        title: 'Mettez-vous en situation',
        paragraphs: [
          "Vous êtes au flop et c'est à vous de parler en premier : personne n'a encore mis de jetons sur ce tour. Le tableau R♦ 7♣ 2♥ ne vous a pas aidé, vous n'avez qu'As haut.",
          'Quelle action est à la fois autorisée par la règle et raisonnable ici ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Flop, vous parlez en premier, aucune mise devant vous. Vous avez As-9 sans paire ni tirage.',
          hero: ['Ah', '9s'],
          board: ['Kd', '7c', '2h'],
          options: [
            { label: 'Suivre', correct: false, feedback: "Impossible : il n'y a aucune mise à suivre. Sans mise devant vous, vos choix sont checker ou miser." },
            { label: 'Checker', correct: true, feedback: "Oui : checker est autorisé puisque personne n'a misé, et c'est un choix sensé avec As haut sur ce tableau. Vous verrez la suite sans rien ajouter." },
            { label: 'Relancer', correct: false, feedback: "Impossible : on ne peut relancer qu'une mise existante. Ici, il faudrait d'abord que quelqu'un mise." },
          ],
        },
      },
      {
        title: 'Préflop, flop, turn, river',
        paragraphs: [
          "Une main se découpe en quatre tours d'enchères, que l'on appelle aussi des « rues » (« streets ») : le préflop avant toute carte commune, le flop (trois cartes), la turn (la quatrième) et la river (la cinquième).",
          "Faites défiler cette main : avec deux 8 en main, le flop vous donne un brelan, c'est-à-dire trois cartes de même valeur. Un brelan formé grâce à une paire en main s'appelle un « set » en anglais.",
        ],
        visual: { kind: 'table', hero: ['8h', '8d'], board: VOCAB_BOARD, revealed: 0, interactive: true },
      },
      {
        title: 'Votre tapis se mesure en grosses blindes',
        paragraphs: [
          "Dire « j'ai 3 000 jetons » ne renseigne sur rien si l'on ne connaît pas la grosse blinde. Les joueurs comptent donc leur tapis en grosses blindes, abrégées « BB » (de l'anglais « big blind »).",
          "Faites varier la jauge : on parle de tapis « profond » au-delà d'une quarantaine de grosses blindes et de tapis « court » en dessous d'une quinzaine.",
        ],
        visual: { kind: 'stack', bb: 100 },
      },
      {
        title: "Le vocabulaire de l'abattage",
        paragraphs: [
          "S'il reste au moins deux joueurs après la river, on passe à l'abattage (« showdown ») : les mains sont montrées et comparées. Un joueur qui sait avoir perdu peut rendre ses cartes face cachée sans les montrer.",
          'Ici, les deux joueurs ont une paire de Dames : la carte suivante, le « kicker », fait la différence. Révélez la main adverse.',
        ],
        visual: {
          kind: 'showdown',
          board: ['Qh', '9c', '5d', '3s', '2h'],
          players: [
            { label: 'Vous', cards: ['Qd', 'Ts'], result: 'Paire de Dames, kicker 10' },
            { label: 'Adversaire', cards: ['Qc', '7c'], result: 'Paire de Dames, kicker 9 (du tableau)' },
          ],
          winner: 0,
          note: "Vos cinq meilleures cartes sont D-D-10-9-5, celles de l'adversaire D-D-9-7-5 : votre 10 l'emporte.",
        },
      },
    ],
    quiz: [
      {
        question: 'Que signifie « checker » ?',
        options: [
          'Miser le minimum autorisé',
          "Passer la parole sans miser, quand personne n'a misé sur ce tour",
          'Abandonner la main',
          'Payer la mise en cours',
        ],
        answer: 1,
        explanation: "Checker, c'est parler sans mettre de jetons. Ce n'est possible que si aucune mise n'a été faite sur le tour en cours.",
      },
      {
        question: 'Un adversaire mise 20 jetons devant vous. Que faites-vous si vous « suivez » ?',
        options: ['Vous mettez 20 jetons', 'Vous mettez 40 jetons', 'Vous checkez', 'Vous misez tout votre tapis'],
        answer: 0,
        explanation: "Suivre, c'est payer exactement la mise en cours, ici 20 jetons. Mettre davantage serait une relance.",
      },
      {
        question: 'Que désigne « le tableau » ?',
        options: [
          'Le tableau des gains affiché au mur',
          'Les deux cartes privées de chaque joueur',
          'Les cinq cartes communes au centre de la table',
          'La liste des niveaux de blindes',
        ],
        answer: 2,
        explanation: 'Le tableau (« board ») regroupe les cartes communes : trois au flop, puis une à la turn et une à la river.',
      },
      {
        question: 'Comment appelle-t-on la quatrième et la cinquième carte commune ?',
        options: ['Le flop et la turn', 'La turn et la river', 'La river et le kicker', "Le flop et l'abattage"],
        answer: 1,
        explanation: 'La quatrième carte est la turn, la cinquième la river. Le flop désigne les trois premières, retournées ensemble.',
      },
      {
        question: 'Que signifie « relancer » ?',
        options: [
          'Miser le premier sur un tour',
          'Augmenter une mise déjà faite par un adversaire',
          'Redistribuer les cartes après une erreur',
          'Suivre la grosse blinde',
        ],
        answer: 1,
        explanation: "On ne relance qu'une mise existante. Mettre des jetons le premier sur un tour, c'est miser ; payer la mise, c'est suivre.",
      },
    ],
  },

  // 4 ----------------------------------------------------------------------------
  {
    slug: 'les-positions',
    title: "Les positions à table et l'ordre de parole",
    summary: 'Qui parle en premier, qui parle en dernier, et pourquoi votre place change la valeur de vos cartes.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 4,
    duration: 11,
    cover: ['Ks', 'Qs'],
    steps: [
      {
        title: 'Le bouton, point de repère',
        paragraphs: [
          "Toutes les positions se définissent par rapport au bouton, le jeton qui désigne le donneur fictif. Après chaque main, il avance d'une place dans le sens des aiguilles d'une montre : chacun occupe donc toutes les positions à tour de rôle.",
          'Nous prenons ici une table à six joueurs, le format le plus courant en ligne. Touchez chaque place pour lire son rôle.',
        ],
        visual: { kind: 'positions', highlight: ['BTN'], selected: 'BTN' },
      },
      {
        title: 'Les deux blindes',
        paragraphs: [
          'Juste à gauche du bouton se trouve la petite blinde (PB), puis la grosse blinde (GB). Ces deux joueurs ont déjà des jetons engagés avant même de voir leurs cartes.',
          'Contrepartie de cette mise forcée : avant le flop, ils parlent en dernier. Mais dès le flop, ce sont eux qui parlent en premier, ce qui les place hors de position pour toute la suite du coup.',
        ],
        visual: { kind: 'positions', highlight: ['SB', 'BB'], selected: 'SB' },
      },
      {
        title: "L'ordre de parole, tour par tour",
        paragraphs: [
          "Avant le flop, la parole commence au joueur situé à gauche de la grosse blinde, la place « sous le pistolet » (« under the gun », UTG). Elle tourne ensuite dans le sens des aiguilles d'une montre et la grosse blinde parle en dernier.",
          'Au flop, à la turn et à la river, la parole commence au premier joueur encore en jeu à gauche du bouton. Le bouton, s’il est toujours dans le coup, parle donc en dernier. Dévoilez les deux ordres.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Avant le flop', text: 'Sous le pistolet → milieu de parole (HJ) → cut-off (CO) → bouton → petite blinde → grosse blinde.' },
            { term: 'Flop, turn et river', text: 'Petite blinde → grosse blinde → sous le pistolet → milieu de parole → cut-off → bouton.' },
            { term: "Si un joueur s'est couché", text: "On le saute simplement : la parole passe au joueur suivant encore en jeu, toujours dans le sens des aiguilles d'une montre." },
          ],
        },
      },
      {
        title: 'Qui parle après vous ?',
        paragraphs: [
          "Le réflexe à prendre avant chaque décision préflop : compter les joueurs qui parlent encore derrière vous. Plus ils sont nombreux, plus il est probable que l'un d'eux ait une très bonne main.",
          'Testez-vous sur cette situation.',
        ],
        visual: {
          kind: 'decision',
          situation: 'Table à 6. Les joueurs sous le pistolet et au milieu de parole se sont couchés. Vous êtes au cut-off. Qui doit encore parler après vous avant le flop ?',
          options: [
            { label: 'Le bouton, la petite blinde et la grosse blinde', correct: true, feedback: "Exact : seuls trois joueurs restent à parler derrière vous. C'est pour cela que le cut-off est une bonne place pour ouvrir le coup." },
            { label: 'Personne, vous parlez en dernier', correct: false, feedback: "Non : avant le flop, c'est la grosse blinde qui parle en dernier. Le bouton et les deux blindes agissent encore après vous." },
            { label: 'Sous le pistolet et le milieu de parole', correct: false, feedback: 'Ces deux joueurs ont déjà parlé en se couchant : ils ne sont plus dans le coup.' },
          ],
        },
      },
      {
        title: 'En position, hors de position',
        paragraphs: [
          "Être « en position » face à un adversaire, c'est parler après lui sur les tours qui suivent le flop. Vous voyez ce qu'il a fait avant de décider : s'il checke, vous pouvez checker aussi pour voir la carte suivante gratuitement, ou miser ; s'il mise, vous connaissez déjà le prix à payer.",
          "Être « hors de position », c'est l'inverse : vous décidez sans savoir ce que l'autre va faire, à chaque tour. Les places de fin de parole (cut-off et bouton) sont donc les plus confortables.",
        ],
        visual: { kind: 'positions', highlight: ['CO', 'BTN'], selected: 'CO' },
      },
      {
        title: 'À une table de neuf joueurs',
        paragraphs: [
          'À neuf ou dix joueurs, le principe est identique ; il y a simplement plus de places en début et en milieu de parole. Les noms varient un peu selon les joueurs, mais la logique ne change pas.',
          "Dévoilez les groupes de positions d'une table complète.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Positions précoces', text: 'Sous le pistolet et les une ou deux places suivantes (UTG+1, UTG+2). Beaucoup de joueurs parlent derrière : sélection très serrée.' },
            { term: 'Positions intermédiaires', text: 'Les places du milieu, souvent appelées « lojack » et « hijack » en anglais. On commence à élargir légèrement.' },
            { term: 'Positions tardives', text: "Le cut-off et le bouton : les meilleures places, où l'on joue le plus de mains." },
            { term: 'Les blindes', text: 'Petite et grosse blinde, comme à six joueurs : dernières à parler avant le flop, premières ensuite.' },
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Avant le flop, quel joueur parle en premier ?',
        options: ['La petite blinde', 'Le joueur à gauche de la grosse blinde', 'Le bouton', 'La grosse blinde'],
        answer: 1,
        explanation: 'Avant le flop, les blindes ont déjà misé : la parole commence au joueur à leur gauche, sous le pistolet.',
      },
      {
        question: 'Après le flop, qui parle en premier si tout le monde est encore en jeu ?',
        options: ['Sous le pistolet', 'Le bouton', 'La petite blinde', 'La grosse blinde'],
        answer: 2,
        explanation: "Après le flop, la parole commence au premier joueur actif à gauche du bouton, c'est-à-dire la petite blinde si elle est encore dans le coup.",
      },
      {
        question: 'Quelle place parle en dernier avant le flop ?',
        options: ['Le bouton', 'Le cut-off', 'La petite blinde', 'La grosse blinde'],
        answer: 3,
        explanation: "La grosse blinde ferme le tour d'enchères préflop. Si personne n'a relancé, elle peut même checker.",
      },
      {
        question: 'Au flop, il reste trois joueurs : sous le pistolet, le cut-off et le bouton. Qui parle en premier ?',
        options: ['Le bouton', 'Le cut-off', 'Sous le pistolet', 'Celui qui a relancé avant le flop'],
        answer: 2,
        explanation: 'Les blindes se sont couchées : le premier joueur encore en jeu à gauche du bouton est celui sous le pistolet. Le bouton parlera en dernier.',
      },
      {
        question: 'Pourquoi le bouton est-il considéré comme la meilleure place ?',
        options: [
          "Parce qu'il ne paie pas de blinde et parle en dernier après le flop",
          'Parce que le bouton reçoit de meilleures cartes',
          "Parce qu'il parle en premier sur tous les tours",
          "Parce qu'il gagne les égalités",
        ],
        answer: 0,
        explanation: 'Le bouton ne pose pas de blinde sur cette main et, après le flop, il voit agir tous ses adversaires avant de décider. Les cartes, elles, sont distribuées au hasard pour tout le monde.',
      },
    ],
  },

  // 5 ----------------------------------------------------------------------------
  {
    slug: 'mains-de-depart',
    title: 'Les mains de départ selon la position',
    summary: 'Quelles mains jouer, depuis quelle place, et pourquoi la même main peut se jeter en début de parole et se relancer au bouton.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 5,
    duration: 13,
    cover: ['Ac', 'Qc'],
    steps: [
      {
        title: '1 326 combinaisons, 169 mains',
        paragraphs: [
          "Avec un paquet de 52 cartes, on peut recevoir 1 326 combinaisons de deux cartes. Si l'on ignore les enseignes précises pour ne garder que les valeurs et le fait d'être assorti (même enseigne) ou dépareillé, il reste 169 mains de départ distinctes.",
          'Dévoilez les trois familles pour voir comment se répartissent ces combinaisons.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Les paires (13 mains)', text: "De 2-2 à A-A. Chaque paire existe en 6 combinaisons d'enseignes, soit 78 au total : vous en recevez une environ une fois sur 17 (5,9 %). Une paire précise, comme deux As, ne tombe qu'une fois sur 221." },
            { term: 'Les mains assorties (78 mains)', text: 'Deux valeurs différentes de la même enseigne, comme Roi-Dame de cœur. 4 combinaisons chacune, soit 312 au total.' },
            { term: 'Les mains dépareillées (78 mains)', text: "Deux valeurs différentes d'enseignes différentes. 12 combinaisons chacune, soit 936 au total : c'est de loin la famille la plus fréquente." },
            { term: 'Assortie : un petit bonus', text: "Être assorti n'ajoute qu'environ 2 à 3 points de pourcentage de chances de gagner. Une main faible ne devient pas jouable parce qu'elle est assortie." },
          ],
        },
      },
      {
        title: 'Une sélection qui s’élargit avec la position',
        paragraphs: [
          "Plus vous parlez tôt, plus votre sélection doit être serrée. Voici des repères simples pour une table à six joueurs, quand personne n'est encore entré dans le coup : à chaque place, on garde les mains de la place précédente et on en ajoute.",
          'Ces listes sont des exemples représentatifs, pas des tableaux exhaustifs. Elles suffisent pour vos premières centaines de mains.',
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            {
              title: 'Sous le pistolet',
              description: 'Paires à partir de 9-9, As-Roi à As-Valet, Roi-Dame, et quelques mains assorties fortes comme As-10 ou Roi-Valet de même enseigne.',
              hands: [['As', 'Ah'], ['Td', 'Tc'], ['9h', '9s'], ['Ad', 'Kc'], ['Ah', 'Jc'], ['Ks', 'Js']],
            },
            {
              title: 'Cut-off',
              description: 'On ajoute les paires plus petites, les As assortis, les figures assorties et les meilleures cartes assorties qui se suivent (les « connecteurs »).',
              hands: [['5d', '5c'], ['2h', '2s'], ['Ac', '5c'], ['Qh', 'Th'], ['Jd', 'Td'], ['9s', '8s']],
            },
            {
              title: 'Bouton',
              description: 'Encore plus large : As dépareillés moyens, figures dépareillées, connecteurs assortis plus bas. Seules les deux blindes restent à battre.',
              hands: [['Ah', '8d'], ['Kc', 'Td'], ['Qs', '9d'], ['7h', '6h'], ['Kd', '8d'], ['Jc', '9c']],
            },
          ],
        },
      },
      {
        title: 'Moins de joueurs derrière, plus de mains jouables',
        paragraphs: [
          "Deux raisons expliquent cet élargissement. D'abord, moins il reste de joueurs à parler, moins il est probable que l'un d'eux ait une main supérieure à la vôtre. Ensuite, au cut-off et au bouton, vous jouerez presque toujours en position après le flop.",
          'Les places mises en valeur sont celles où vous pouvez ouvrir le plus largement.',
        ],
        visual: { kind: 'positions', highlight: ['CO', 'BTN'], selected: 'BTN' },
      },
      {
        title: 'Dame-9 sous le pistolet',
        paragraphs: [
          "Mettons ces repères à l'épreuve avec une main moyenne : Dame-9 dépareillé. Vous êtes le premier à parler, cinq joueurs agiront après vous.",
          'Que faites-vous ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Table à 6, 100 grosses blindes. Vous êtes sous le pistolet, premier à parler avant le flop.',
          hero: ['Qh', '9c'],
          options: [
            { label: 'Relancer', correct: false, feedback: "Trop large : Dame-9 dépareillé ne fait pas partie d'une sélection de début de parole. Les joueurs qui vous paieront ou relanceront auront souvent Dame-Valet, Roi-Dame ou As-Dame, qui vous dominent." },
            { label: 'Suivre la grosse blinde', correct: false, feedback: "C'est l'option la moins bonne : vous entrez sans initiative, avec une main faible, et cinq joueurs peuvent encore relancer derrière vous." },
            { label: 'Se coucher', correct: true, feedback: "Oui : en début de parole, cette main perd de l'argent à long terme. Se coucher ne vous coûte rien." },
          ],
        },
      },
      {
        title: 'La même main au bouton',
        paragraphs: [
          "Changeons un seul paramètre : tout le monde se couche jusqu'à vous, et vous êtes au bouton avec exactement la même main.",
          'Seules les deux blindes peuvent encore vous résister, et vous aurez la position sur elles pendant tout le coup.',
        ],
        visual: {
          kind: 'decision',
          situation: "Table à 6, 100 grosses blindes. Tout le monde s'est couché jusqu'à vous, au bouton.",
          hero: ['Qh', '9c'],
          options: [
            { label: 'Relancer', correct: true, feedback: 'Bon choix : face à deux mains aléatoires et avec la position, Dame-9 est une ouverture standard. Vous gagnerez souvent les blindes immédiatement.' },
            { label: 'Suivre la grosse blinde', correct: false, feedback: 'Suivre laisse les blindes voir le flop à bas prix et vous retire la possibilité de gagner le pot tout de suite. Si la main se joue, relancez.' },
            { label: 'Se coucher', correct: false, feedback: 'Trop prudent : au bouton, sans relance devant, Dame-9 est assez forte pour ouvrir.' },
          ],
        },
      },
      {
        title: 'Face à une relance, resserrez-vous',
        paragraphs: [
          "Les repères précédents valent quand personne n'est entré avant vous. Si un joueur a déjà relancé, il annonce une main plutôt forte : il faut une main nettement meilleure pour continuer.",
          "Le danger principal s'appelle la domination : votre main partage une carte avec celle de l'adversaire, mais votre seconde carte est plus faible.",
        ],
        visual: {
          kind: 'decision',
          situation: 'Un joueur relance sous le pistolet. Tout le monde se couche jusqu’à vous, au bouton.',
          hero: ['Ks', 'Jd'],
          options: [
            { label: 'Relancer à nouveau', correct: false, feedback: "Risqué : une relance d'un joueur en début de parole contient beaucoup d'As-Roi, de Roi-Dame et de grosses paires. Vous ne serez payé que par des mains qui vous battent." },
            { label: 'Payer', correct: false, feedback: 'Tentant grâce à la position, mais Roi-Valet dépareillé est souvent dominé par Roi-Dame ou As-Valet. Quand vous toucherez votre Roi, vous perdrez parfois un gros pot.' },
            { label: 'Se coucher', correct: true, feedback: "C'est le repère le plus sûr pour débuter : face à une ouverture en début de parole, Roi-Valet dépareillé est trop souvent dominé." },
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Combien existe-t-il de mains de départ distinctes au Texas Hold’em ?',
        options: ['52', '169', '1 326', '2 652'],
        answer: 1,
        explanation: 'Il y a 1 326 combinaisons de deux cartes, mais seulement 169 mains distinctes une fois les enseignes regroupées : 13 paires, 78 mains assorties et 78 dépareillées.',
      },
      {
        question: 'À quelle fréquence recevez-vous une paire servie (n’importe laquelle) ?',
        options: ['Environ 1 fois sur 6', 'Environ 1 fois sur 17', 'Environ 1 fois sur 50', 'Environ 1 fois sur 221'],
        answer: 1,
        explanation: "78 combinaisons de paires sur 1 326, soit 5,9 % : environ une fois sur 17. Une fois sur 221, c'est la fréquence d'une paire précise, comme deux As.",
      },
      {
        question: 'Combien de combinaisons d’enseignes existe-t-il pour une paire précise, comme deux Rois ?',
        options: ['4', '6', '12', '16'],
        answer: 1,
        explanation: 'Avec quatre Rois dans le paquet, on peut former 6 paires différentes (pique-cœur, pique-carreau, pique-trèfle, cœur-carreau, cœur-trèfle, carreau-trèfle).',
      },
      {
        question: 'Pourquoi peut-on jouer plus de mains au bouton que sous le pistolet ?',
        options: [
          'Parce que les cartes distribuées au bouton sont meilleures',
          "Parce qu'il reste moins de joueurs à parler et que l'on sera en position après le flop",
          "Parce que le bouton n'a pas le droit de se coucher",
          'Parce que les blindes sont obligées de payer',
        ],
        answer: 1,
        explanation: "Moins de joueurs derrière, c'est moins de risques de tomber sur une grosse main ; et la position après le flop rend les mains moyennes plus faciles à jouer.",
      },
      {
        question: 'Que vaut le fait d’être assorti (deux cartes de même enseigne) ?',
        options: [
          'Il transforme n’importe quelle main en main jouable',
          'Il double les chances de gagner',
          'Il ajoute un peu de valeur, environ 2 à 3 points de pourcentage',
          "Il n'a aucune influence",
        ],
        answer: 2,
        explanation: "Être assorti aide à faire des couleurs, mais l'effet reste modeste. C'est un bonus, pas une raison suffisante pour jouer une main faible.",
      },
    ],
  },

  // 6 ----------------------------------------------------------------------------
  {
    slug: 'lire-le-tableau',
    title: 'Lire le tableau et repérer les « nuts »',
    summary: 'Identifier rapidement les combinaisons possibles sur un tableau et trouver la meilleure main possible.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 6,
    duration: 12,
    cover: ['Th', 'Jh'],
    steps: [
      {
        title: 'Sept cartes, cinq retenues',
        paragraphs: [
          'Votre main finale est la meilleure combinaison de cinq cartes parmi vos deux cartes privées et les cinq cartes du tableau. Vous pouvez utiliser deux, une ou aucune de vos cartes.',
          "Suivez cette main avec deux 7 : au flop, un 7 vous donne un brelan. Quand un second Roi arrive au tableau à la river, vous obtenez un full : 7-7-7-R-R, « full aux 7 par les Rois ».",
        ],
        visual: { kind: 'table', hero: ['7c', '7d'], board: ['Kh', '7s', '2d', '9c', 'Kc'], revealed: 3, interactive: true },
      },
      {
        title: 'Une méthode en quatre questions',
        paragraphs: [
          "Chaque fois qu'une carte tombe, prenez quelques secondes pour analyser le tableau lui-même, avant de penser à votre main. Quatre questions suffisent pour savoir ce qui est possible.",
          'Une quinte est possible dès que trois cartes du tableau tiennent dans un intervalle de cinq valeurs (par exemple 5, 7 et 8). Une couleur nécessite au moins trois cartes de la même enseigne au tableau.',
        ],
        visual: {
          kind: 'checklist',
          title: 'Lire le tableau',
          items: [
            'Le tableau est-il apparié ? Si oui, full et carré deviennent possibles.',
            'Y a-t-il au moins trois cartes de la même enseigne ? Si oui, une couleur est possible.',
            'Trois cartes tiennent-elles dans un intervalle de cinq valeurs ? Si oui, une quinte est possible.',
            'Compte tenu de tout cela, quelle est la meilleure main possible ?',
          ],
        },
      },
      {
        title: 'Les « nuts », la meilleure main possible',
        paragraphs: [
          "On appelle « nuts » (de l'anglais, sans traduction usuelle) la meilleure main possible sur un tableau donné. Celui qui la détient ne peut pas perdre : au pire, il partage.",
          "Appliquez la méthode : le tableau n'est pas apparié, il compte trois cœurs, et aucune quinte flush n'est possible car les cœurs sont trop éloignés les uns des autres.",
        ],
        visual: {
          kind: 'decision',
          situation: 'Tableau final : R♥ 10♥ 6♥ 3♣ 2♦. Quelle est la meilleure main possible ?',
          board: ['Kh', 'Th', '6h', '3c', '2d'],
          options: [
            { label: 'Un brelan de Rois', correct: false, feedback: 'Un brelan de Rois est une bonne main, mais trois cœurs au tableau rendent la couleur possible, et la couleur bat le brelan.' },
            { label: 'Une couleur à l’As', correct: true, feedback: "Exact : l'As de cœur accompagné d'un autre cœur donne la couleur la plus haute. Sans paire au tableau, ni full ni carré ne sont possibles." },
            { label: 'Un full', correct: false, feedback: 'Impossible : sans paire au tableau, vos deux cartes privées ne suffisent pas à former à la fois un brelan et une paire.' },
            { label: 'Une quinte', correct: false, feedback: "Une quinte est bien possible (5-4 en main donne 6-5-4-3-2), mais la couleur la bat : ce n'est pas la meilleure main possible." },
          ],
        },
      },
      {
        title: 'Un tableau apparié change tout',
        paragraphs: [
          'Dès que le tableau contient une paire, il faut se méfier des fulls et des carrés. Une double paire qui paraît solide peut alors être largement battue.',
          "Ici, votre adversaire a une petite paire servie : révélez l'abattage.",
        ],
        visual: {
          kind: 'showdown',
          board: ['9s', '9d', '5c', 'Kh', '2s'],
          players: [
            { label: 'Vous', cards: ['Ks', 'Qd'], result: 'Double paire, Rois et 9, kicker Dame' },
            { label: 'Adversaire', cards: ['5h', '5d'], result: 'Full aux 5 par les 9' },
          ],
          winner: 1,
          note: 'Avec un 5 au tableau, la paire de 5 devient un brelan, et la paire de 9 du tableau complète le full : 5-5-5-9-9 bat largement votre double paire.',
        },
      },
      {
        title: 'Les quintes, de la roue à la plus haute',
        paragraphs: [
          "L'As peut jouer en haut (10-V-D-R-A, la quinte la plus haute) ou en bas (A-2-3-4-5, surnommée « la roue », la plus petite). Mais une quinte ne « tourne » jamais : D-R-A-2-3 n'est pas une quinte.",
          "Entre deux quintes, c'est la carte la plus haute qui décide. Sélectionnez chaque exemple.",
        ],
        visual: {
          kind: 'ranking',
          hands: [
            { name: 'Quinte à l’As', cards: ['Ad', 'Kc', 'Qh', 'Js', 'Tc'], description: 'As, Roi, Dame, Valet, 10 : la plus haute quinte possible (hors quinte flush).' },
            { name: 'Quinte au 9', cards: ['9h', '8d', '7c', '6s', '5h'], description: 'Elle bat toutes les quintes inférieures, de la roue à la quinte au 8.' },
            { name: 'La roue', cards: ['5d', '4c', '3h', '2s', 'Ah'], description: "A-2-3-4-5 : l'As joue le rôle du 1. C'est une quinte au 5, la plus petite de toutes." },
          ],
        },
      },
      {
        title: 'Avez-vous les nuts ?',
        paragraphs: [
          "Savoir si l'on détient la meilleure main possible permet de miser sans crainte pour être payé. Vérifiez d'abord qu'aucune combinaison supérieure n'est réalisable sur ce tableau.",
          'Le tableau compte trois cœurs, aucune paire, et ses cœurs sont trop espacés pour une quinte flush.',
        ],
        visual: {
          kind: 'decision',
          situation: 'River. Vous avez A♥ 4♥ et le tableau est V♥ 8♥ 2♣ 5♥ R♦. Avez-vous la meilleure main possible ?',
          hero: ['Ah', '4h'],
          board: ['Jh', '8h', '2c', '5h', 'Kd'],
          options: [
            { label: 'Oui, la couleur à l’As est imbattable ici', correct: true, feedback: "Exact : sans paire au tableau, pas de full ni de carré, et aucune quinte flush n'est possible. Votre couleur à l'As est la meilleure main possible." },
            { label: 'Non, une quinte flush est possible', correct: false, feedback: 'Il faudrait trois cœurs du tableau dans un intervalle de cinq valeurs : V, 8 et 5 sont trop espacés.' },
            { label: 'Non, un full est possible', correct: false, feedback: "Un full nécessite une paire au tableau. Ici, aucune carte du tableau n'est appariée." },
            { label: 'Non, une couleur au Roi vous bat', correct: false, feedback: 'Entre deux couleurs, la carte la plus haute décide : votre As bat tout autre cœur, et le Roi visible au tableau est un carreau.' },
          ],
        },
      },
      {
        title: 'Quand le tableau joue tout seul',
        paragraphs: [
          "Parfois, les cinq cartes communes forment à elles seules la meilleure main de plusieurs joueurs : on dit qu'ils « jouent le tableau ». Leurs cartes privées ne servent alors à rien.",
          "Ici, la quinte à l'As du tableau ne peut être améliorée par personne (pas de couleur possible avec seulement deux trèfles au tableau) : le pot est partagé.",
        ],
        visual: {
          kind: 'showdown',
          board: ['Ac', 'Kd', 'Qs', 'Jh', 'Tc'],
          players: [
            { label: 'Vous', cards: ['2d', '3h'], result: 'Quinte à l’As (le tableau)' },
            { label: 'Adversaire', cards: ['8s', '8c'], result: 'Quinte à l’As (le tableau)' },
          ],
          winner: null,
          note: 'Les deux joueurs ont la même main de cinq cartes, A-R-D-V-10 : le pot est partagé à parts égales.',
        },
      },
    ],
    quiz: [
      {
        question: 'Tableau : R♣ 9♦ 4♠ 2♥ 7♣. Quelle est la meilleure main possible ?',
        options: ['Un brelan de Rois', 'Une quinte', 'Une couleur', "Une paire d'As"],
        answer: 0,
        explanation: "Le tableau n'est pas apparié, ne compte que deux trèfles et aucun groupe de trois cartes ne tient dans cinq valeurs : ni full, ni couleur, ni quinte. La meilleure main est donc un brelan de Rois (une paire de Rois en main).",
      },
      {
        question: 'Combien de cartes de la même enseigne faut-il pour former une couleur ?',
        options: ['Trois', 'Quatre', 'Cinq', 'Six'],
        answer: 2,
        explanation: 'Une couleur se compose de cinq cartes de la même enseigne, prises parmi vos cartes privées et le tableau.',
      },
      {
        question: 'Laquelle de ces suites n’est PAS une quinte ?',
        options: ['A-2-3-4-5', '10-V-D-R-A', 'D-R-A-2-3', '6-7-8-9-10'],
        answer: 2,
        explanation: "L'As peut être en haut ou en bas, mais une quinte ne passe pas de l'As au 2 : D-R-A-2-3 n'est qu'une carte haute As.",
      },
      {
        question: 'Le tableau contient une paire. Quelles combinaisons deviennent possibles ?',
        options: ['Uniquement la couleur', 'Le full et le carré', 'Uniquement la quinte', 'Aucune nouvelle combinaison'],
        answer: 1,
        explanation: 'Un tableau apparié permet les fulls (un brelan plus une paire) et les carrés. Sans paire au tableau, ces mains sont impossibles.',
      },
      {
        question: 'Que désignent les « nuts » ?',
        options: [
          'Une main avec deux cartes assorties',
          'La meilleure main possible compte tenu du tableau',
          'Un bluff réussi',
          'La plus mauvaise main de départ',
        ],
        answer: 1,
        explanation: 'Les nuts sont la main imbattable sur un tableau donné. Les identifier permet de savoir quand miser sans crainte.',
      },
    ],
  },

  // 7 ----------------------------------------------------------------------------
  {
    slug: 'kicker-et-partage',
    title: 'Kicker, partage du pot et pots annexes',
    summary: 'Départager deux mains de même combinaison, savoir quand le pot est partagé et comprendre les pots annexes en cas de tapis.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 7,
    duration: 13,
    cover: ['Ad', 'Qc'],
    steps: [
      {
        title: 'Le kicker départage',
        paragraphs: [
          "Quand deux joueurs ont la même combinaison, on compare les cartes qui complètent la main de cinq cartes : ce sont les « kickers » (de l'anglais, « cartes d'accompagnement »).",
          "Ici, les deux joueurs ont une paire de Rois. Révélez l'abattage pour voir quelle carte fait la différence.",
        ],
        visual: {
          kind: 'showdown',
          board: ['Kh', '8c', '5d', '3s', '2h'],
          players: [
            { label: 'Vous', cards: ['Kd', 'Js'], result: 'Paire de Rois, kickers V-8-5' },
            { label: 'Adversaire', cards: ['Kc', 'Th'], result: 'Paire de Rois, kickers 10-8-5' },
          ],
          winner: 0,
          note: 'R-R-V-8-5 contre R-R-10-8-5 : à paire égale, on compare le premier kicker, et le Valet bat le 10.',
        },
      },
      {
        title: 'Combien de kickers comptent ?',
        paragraphs: [
          'Une main fait toujours exactement cinq cartes. Le nombre de kickers dépend donc de la combinaison : plus elle utilise de cartes, moins il reste de place pour les kickers.',
          "Dévoilez chaque cas. On compare les kickers un par un, du plus haut au plus bas, jusqu'à trouver une différence.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Carte haute', text: "La plus haute carte, puis quatre kickers à comparer dans l'ordre." },
            { term: 'Paire', text: "D'abord la valeur de la paire, puis trois kickers." },
            { term: 'Double paire', text: 'La paire haute, puis la paire basse, puis un seul kicker.' },
            { term: 'Brelan', text: 'La valeur du brelan, puis deux kickers.' },
            { term: 'Carré', text: 'La valeur du carré, puis un seul kicker.' },
            { term: 'Quinte, couleur, full', text: 'Pas de kicker à proprement parler : on compare la carte haute de la quinte, les cinq cartes de la couleur une à une, ou le brelan puis la paire du full.' },
          ],
        },
      },
      {
        title: 'À vous de trancher',
        paragraphs: [
          'Même paire de Dames pour les deux joueurs. Construisez la meilleure main de cinq cartes de chacun avant de répondre.',
          'Votre adversaire montre D♥ 5♥.',
        ],
        visual: {
          kind: 'decision',
          situation: 'Tableau final : D♦ 9♥ 6♣ 4♠ 2♦. Vous avez D♠ 7♣, votre adversaire D♥ 5♥. Qui gagne ?',
          hero: ['Qs', '7c'],
          board: ['Qd', '9h', '6c', '4s', '2d'],
          options: [
            { label: 'Vous', correct: true, feedback: "Oui : vous jouez D-D-9-7-6, l'adversaire D-D-9-6-5. Le 9 est commun, puis votre 7 bat son 6." },
            { label: 'Votre adversaire', correct: false, feedback: "Non : comparez carte par carte après la paire : 9 contre 9, puis 7 contre 6. Votre 7 l'emporte." },
            { label: 'Le pot est partagé', correct: false, feedback: "Pas ici : vos kickers diffèrent. Le pot n'est partagé que si les cinq cartes retenues ont exactement les mêmes valeurs." },
          ],
        },
      },
      {
        title: 'Le partage du pot',
        paragraphs: [
          "Si les deux meilleures mains de cinq cartes ont exactement les mêmes valeurs, le pot est partagé. Les enseignes ne départagent jamais : un pique ne vaut pas plus qu'un cœur.",
          "Piège fréquent : un kicker trop bas ne compte pas. Ici, le 4 et le 2 sont plus faibles que les cartes retenues du tableau. Si le pot ne se divise pas exactement, le jeton restant revient, selon la règle la plus répandue, au premier gagnant à gauche du bouton.",
        ],
        visual: {
          kind: 'showdown',
          board: ['Js', 'Jd', '8h', '5c', '3s'],
          players: [
            { label: 'Vous', cards: ['Ah', '4d'], result: 'Paire de Valets, kickers A-8-5' },
            { label: 'Adversaire', cards: ['Ac', '2h'], result: 'Paire de Valets, kickers A-8-5' },
          ],
          winner: null,
          note: 'Les deux joueurs jouent V-V-A-8-5 : votre 4 ne compte pas, car il est plus faible que le 5 du tableau. Pot partagé.',
        },
      },
      {
        title: 'Payer avec un tapis plus petit',
        paragraphs: [
          "Une règle fondamentale protège les petits tapis : on ne peut jamais perdre plus que ce que l'on a devant soi. Si un adversaire mise plus que votre tapis, vous pouvez quand même payer « à tapis » avec la totalité de vos jetons.",
          'Que se passe-t-il dans cette situation à deux joueurs ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Il ne vous reste que 50 jetons. Votre unique adversaire mise 200. Vous voulez continuer.',
          options: [
            { label: 'Vous ne pouvez pas suivre, il faut se coucher', correct: false, feedback: "Si : vous avez toujours le droit de payer avec la totalité de votre tapis, même s'il est inférieur à la mise." },
            { label: 'Vous payez à tapis pour 50, les 150 en trop lui sont rendus', correct: true, feedback: "Exact : vous ne jouez que pour 50 jetons de sa mise. Comme personne d'autre ne peut payer l'excédent, les 150 restants lui sont restitués." },
            { label: 'Vous devez ajouter des jetons pendant la main pour payer 200', correct: false, feedback: 'Non : on ne rajoute jamais de jetons en cours de main. Votre tapis au début du coup est votre limite.' },
          ],
        },
      },
      {
        title: 'Pot principal et pot annexe',
        paragraphs: [
          "Quand un joueur est à tapis et que d'autres continuent à miser, on crée un pot annexe (« side pot ») auquel le joueur à tapis ne participe pas. Il ne peut gagner que ce qu'il a pu égaler.",
          'Exemple : A est à tapis avec 100 jetons, B et C ont chacun 300 jetons et vont tous les deux à tapis. Dévoilez la répartition.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Pot principal : 300 jetons', text: '100 jetons de chacun des trois joueurs. A, B et C peuvent tous le gagner.' },
            { term: 'Pot annexe : 400 jetons', text: "Les 200 jetons supplémentaires de B et de C. Seuls B et C peuvent le gagner, A n'y a pas contribué." },
            { term: "À l'abattage", text: 'On attribue chaque pot séparément : le pot annexe à la meilleure main entre B et C, le pot principal à la meilleure main des trois.' },
          ],
        },
      },
      {
        title: 'Un abattage à trois',
        paragraphs: [
          "Reprenons l'exemple précédent avec de vraies cartes. A a la meilleure main, mais il n'était à tapis que pour 100 jetons.",
          'Révélez les mains et suivez la distribution des deux pots.',
        ],
        visual: {
          kind: 'showdown',
          board: ['Td', '7s', '4c', 'Kd', '2h'],
          players: [
            { label: 'Joueur A (tapis de 100)', cards: ['As', 'Ah'], result: "Paire d'As" },
            { label: 'Joueur B (tapis de 300)', cards: ['Kh', 'Qc'], result: 'Paire de Rois' },
            { label: 'Joueur C (tapis de 300)', cards: ['Jc', 'Jd'], result: 'Paire de Valets' },
          ],
          winner: 0,
          note: 'A remporte le pot principal de 300 jetons. Le pot annexe de 400 jetons, auquel A ne participe pas, revient à B, qui bat C grâce à sa paire de Rois.',
        },
      },
    ],
    quiz: [
      {
        question: 'Tableau : A♣ 9♦ 7♥ 4♠ 3♣. Vous avez A♦ 6♠, votre adversaire A♥ 5♠. Qui gagne ?',
        options: ['Vous', 'Votre adversaire', 'Le pot est partagé', 'Celui qui a misé en dernier'],
        answer: 0,
        explanation: "Personne ne fait de quinte. Vous jouez A-A-9-7-6, l'adversaire A-A-9-7-5 : votre 6 bat son 5 au troisième kicker.",
      },
      {
        question: 'Avec une double paire, combien de kickers sont comparés ?',
        options: ['Aucun', 'Un', 'Deux', 'Trois'],
        answer: 1,
        explanation: "Une double paire utilise quatre cartes : il ne reste qu'une place pour un kicker.",
      },
      {
        question: 'Deux joueurs ont exactement les mêmes cinq valeurs, l’un en pique, l’autre en cœur. Que se passe-t-il ?',
        options: ['Le pique gagne', 'Le cœur gagne', 'Le pot est partagé', 'On redistribue la river'],
        answer: 2,
        explanation: "Au Texas Hold'em, les enseignes n'ont aucune hiérarchie. À valeurs identiques, le pot est partagé.",
      },
      {
        question: 'A est à tapis pour 50 jetons ; B et C continuent à miser entre eux. Qui peut gagner le pot annexe ?',
        options: ['Uniquement A', 'B ou C uniquement', 'Les trois joueurs', 'Personne, il est remis en jeu'],
        answer: 1,
        explanation: "Le pot annexe est formé des jetons que A n'a pas pu égaler : seuls les joueurs qui y ont contribué, B et C, peuvent le gagner.",
      },
      {
        question: 'Vous avez 80 jetons et un adversaire mise 300. Pouvez-vous payer ?',
        options: [
          'Non, il faut avoir au moins 300 jetons',
          'Oui, à tapis pour 80 jetons',
          'Oui, mais seulement en relançant',
          'Oui, en ajoutant des jetons pendant la main',
        ],
        answer: 1,
        explanation: "On peut toujours payer avec la totalité de son tapis. Vous jouez alors pour 80 jetons de la mise adverse ; l'excédent forme un pot annexe ou est rendu.",
      },
    ],
  },

  // 8 ----------------------------------------------------------------------------
  {
    slug: 'tailles-de-mises',
    title: 'Les tailles de mises de base',
    summary: 'Ouvrir en grosses blindes, miser en proportion du pot et adapter sa taille au tableau.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 8,
    duration: 12,
    cover: ['Kc', 'Qd'],
    steps: [
      {
        title: "L'unité de mesure : la grosse blinde",
        paragraphs: [
          'Pour parler de mises indépendamment des montants réels, on les exprime en grosses blindes (BB). Une relance « à 3 BB » vaut 150 jetons si la grosse blinde est de 50, et 3 000 si elle est de 1 000.',
          "Entrez votre tapis et la grosse blinde : la calculatrice donne votre profondeur. Un tapis de 100 BB est la référence habituelle en cash game (partie où les jetons ont une valeur fixe et où l'on peut quitter la table à tout moment).",
        ],
        visual: { kind: 'stack', bb: 100, calculator: { chips: 5000, bigBlind: 50 } },
      },
      {
        title: 'Les repères avant le flop',
        paragraphs: [
          'Avant le flop, les tailles se comptent en grosses blindes. Les valeurs ci-dessous sont des repères courants pour une partie à 100 BB ; en tournoi, avec des tapis plus courts, les ouvertures sont souvent un peu plus petites (2 à 2,5 BB).',
          'Dévoilez chaque situation.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Ouverture, personne avant vous', text: 'Environ 2,5 à 3 BB. Assez pour faire payer cher les mains faibles, sans risquer trop quand on est relancé.' },
            { term: 'Des joueurs ont suivi avant vous', text: 'Ajoutez environ 1 BB par joueur qui a simplement suivi (on les appelle des « limpers »). Exemple : un suiveur, relance à 4 BB.' },
            { term: 'Relancer une ouverture (« 3-bet »)', text: 'Environ 3 fois la relance adverse en position, un peu plus (3,5 à 4 fois) hors de position.' },
            { term: 'Depuis la petite blinde', text: 'Un peu plus gros, autour de 3 BB, car vous serez hors de position après le flop.' },
          ],
        },
      },
      {
        title: 'Deux suiveurs devant vous',
        paragraphs: [
          'Partie à 100 BB. Deux joueurs ont simplement suivi la grosse blinde avant vous et vous avez une main forte.',
          'Quelle taille de relance choisissez-vous ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Deux joueurs ont suivi la grosse blinde. Vous êtes au cut-off avec 100 BB.',
          hero: ['As', 'Qd'],
          options: [
            { label: 'Relancer à 2,5 BB', correct: false, feedback: 'Trop petit : avec déjà deux grosses blindes de suiveurs au centre en plus des blindes, tout le monde a un excellent prix pour payer et vous jouerez à quatre ou cinq.' },
            { label: 'Relancer à environ 5 BB', correct: true, feedback: "Oui : 3 BB plus 1 BB par suiveur. Cette taille fait coucher une partie des mains faibles et vous laisse souvent face à un seul adversaire." },
            { label: 'Suivre à votre tour', correct: false, feedback: "Avec As-Dame, une main nettement meilleure que celles des suiveurs, vous gagnez à grossir le pot et à prendre l'initiative." },
            { label: 'Partir à tapis', correct: false, feedback: 'Disproportionné : vous risquez 100 BB pour en gagner moins de 4, et seules de meilleures mains vous paieront.' },
          ],
        },
      },
      {
        title: 'Après le flop : en proportion du pot',
        paragraphs: [
          'Après le flop, on ne parle plus en grosses blindes mais en fraction du pot. Une mise de la moitié du pot dans un pot de 40 jetons vaut 20 jetons.',
          'Chaque taille a ses usages typiques. Dévoilez-les.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Petite : 25 à 33 % du pot', text: "Bon marché, souvent utilisée sur les tableaux qui offrent peu de tirages (tableaux « secs »), où l'adversaire a rarement touché." },
            { term: 'Moyenne : 50 à 66 % du pot', text: 'La taille polyvalente. Elle fait payer les tirages et les mains moyennes.' },
            { term: 'Grosse : 75 à 100 % du pot', text: 'Sur les tableaux coordonnés, pour faire payer cher les tirages, ou à la river pour maximiser la valeur.' },
            { term: 'Surmise : plus de 100 %', text: "Une mise supérieure au pot (« overbet »), réservée à des situations particulières. À éviter tant que vous débutez." },
          ],
        },
      },
      {
        title: 'Calculez votre mise',
        paragraphs: [
          'Vous avez touché la paire de Rois avec le meilleur kicker possible. Vous voulez miser pour être payé par des mains moins fortes, comme Roi-Valet, Roi-10 ou une paire de 8.',
          'Le pot contient 60 jetons. Combien misez-vous pour les deux tiers du pot ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Flop, pot de 60 jetons. Vous voulez miser les deux tiers du pot.',
          hero: ['Ac', 'Kh'],
          board: ['Kd', '8s', '3c'],
          options: [
            { label: '20 jetons', correct: false, feedback: "20, c'est un tiers du pot. Une taille possible, mais pas celle que vous visiez." },
            { label: '40 jetons', correct: true, feedback: 'Exact : 60 × 2/3 = 40. Votre adversaire devra payer 40 pour un pot qui en contiendra alors 140.' },
            { label: '60 jetons', correct: false, feedback: '60 jetons correspondent à une mise de la taille du pot, plus grosse que prévu.' },
            { label: '90 jetons', correct: false, feedback: "90 jetons, c'est une surmise d'une fois et demie le pot : beaucoup trop pour cet objectif." },
          ],
        },
      },
      {
        title: 'Adapter la taille au tableau',
        paragraphs: [
          "Un tableau « sec » contient des cartes éloignées les unes des autres et d'enseignes différentes : peu de tirages possibles, une petite mise suffit. Un tableau « coordonné » offre beaucoup de quintes et de couleurs possibles : misez plus gros avec vos mains fortes pour faire payer les tirages.",
          'Comparez les deux familles de flops ci-dessous.',
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            {
              title: 'Tableaux secs',
              description: "Cartes espacées, enseignes différentes : l'adversaire a rarement un tirage. Une mise d'un tiers du pot suffit souvent.",
              hands: [['Kc', '7d', '2h'], ['Ah', '8c', '3s'], ['Qd', '6s', '2c']],
            },
            {
              title: 'Tableaux coordonnés',
              description: 'Cartes proches, deux ou trois de la même enseigne : de nombreux tirages existent. Préférez une mise des deux tiers du pot ou plus avec vos mains fortes.',
              hands: [['9h', '8h', '6c'], ['Jd', 'Td', '7s'], ['8s', '7s', '5s']],
            },
          ],
        },
      },
      {
        title: 'Une même taille pour toutes vos mains',
        paragraphs: [
          'Si vous misez gros avec vos mains fortes et petit avec vos bluffs, un adversaire attentif lira votre jeu comme un livre ouvert. Dans une situation donnée, choisissez une taille et gardez-la, quelle que soit votre main.',
          'Gardez cette liste en tête avant de mettre des jetons au centre.',
        ],
        visual: {
          kind: 'checklist',
          title: 'Avant de miser',
          items: [
            'Combien y a-t-il dans le pot ?',
            'Pourquoi je mise : pour être payé, pour faire coucher, ou les deux ?',
            'Le tableau est-il sec ou coordonné ?',
            'Utiliserais-je la même taille avec une main plus forte ou plus faible ?',
          ],
        },
      },
    ],
    quiz: [
      {
        question: "Personne n'est entré avant vous. Quelle taille d'ouverture est un repère standard à 100 BB ?",
        options: ['1 BB', 'Environ 2,5 à 3 BB', '10 BB', 'Tout le tapis'],
        answer: 1,
        explanation: "Une ouverture de 2,5 à 3 BB est la norme : elle met la pression sur les blindes sans engager trop de jetons.",
      },
      {
        question: 'Le pot contient 90 jetons. Combien vaut une mise de la moitié du pot ?',
        options: ['30 jetons', '45 jetons', '60 jetons', '90 jetons'],
        answer: 1,
        explanation: "La moitié de 90, c'est 45 jetons.",
      },
      {
        question: 'Un joueur a suivi la grosse blinde avant vous et vous voulez relancer. Quel repère suivre ?',
        options: ['2 BB', 'Environ 4 BB (3 BB + 1 BB par suiveur)', '15 BB', 'Exactement 1 BB de plus que lui'],
        answer: 1,
        explanation: "On ajoute environ une grosse blinde par joueur qui a suivi, pour ne pas lui offrir un prix trop attractif.",
      },
      {
        question: 'Sur quel flop une petite mise (environ un tiers du pot) est-elle la plus adaptée ?',
        options: ['9♥ 8♥ 6♣', 'V♦ 10♦ 7♠', 'R♣ 7♦ 2♥', '8♠ 7♠ 5♠'],
        answer: 2,
        explanation: "R-7-2 d'enseignes différentes est un tableau sec : peu de tirages possibles. Les trois autres flops sont coordonnés et appellent des mises plus grosses avec les mains fortes.",
      },
      {
        question: 'Pourquoi garder la même taille de mise avec vos mains fortes et vos bluffs ?',
        options: [
          'Parce que la règle l’impose',
          'Pour ne pas renseigner vos adversaires sur la force de votre main',
          'Parce que les petites mises sont interdites',
          'Pour gagner du temps',
        ],
        answer: 1,
        explanation: 'Si votre taille de mise varie selon la force de votre main, elle devient une information gratuite pour vos adversaires.',
      },
    ],
  },

  // 9 ----------------------------------------------------------------------------
  {
    slug: 'compter-ses-outs',
    title: 'Compter ses outs',
    summary: 'Repérer les cartes qui améliorent votre main et estimer rapidement vos chances de toucher grâce à la règle du 4 et du 2.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 9,
    duration: 13,
    cover: ['8h', '7h'],
    steps: [
      {
        title: "Qu'est-ce qu'un out ?",
        paragraphs: [
          "Un « out » (de l'anglais, « porte de sortie ») est une carte encore inconnue qui transformerait votre main en main probablement gagnante. Une main qui a besoin d'une carte pour se compléter s'appelle un « tirage ».",
          'Ici, avec deux cœurs en main et deux cœurs au flop, il vous manque un cœur pour la couleur. 13 cœurs existent, 4 sont visibles : il en reste 9, ce sont vos 9 outs. Dévoilez la suite.',
        ],
        visual: { kind: 'table', hero: ['Ah', '6h'], board: OUTS_BOARD, revealed: 3, interactive: true },
      },
      {
        title: 'Les tirages les plus fréquents',
        paragraphs: [
          "Inutile de recompter à chaque fois : quelques tirages reviennent sans cesse, et leur nombre d'outs est toujours le même.",
          'Dévoilez-les ; retenez surtout 9, 8 et 4.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Tirage couleur : 9 outs', text: 'Quatre cartes de la même enseigne : il reste 9 cartes de cette enseigne dans le paquet.' },
            { term: 'Quinte par les deux bouts : 8 outs', text: 'Quatre cartes consécutives, comme 9-8-7-6 : un 10 ou un 5 complètent la quinte, soit 2 × 4 cartes.' },
            { term: 'Quinte « ventrale » : 4 outs', text: "Il manque une carte au milieu, comme 9-8-6-5 qui attend un 7 : seulement 4 cartes. En anglais, « gutshot »." },
            { term: 'Deux cartes plus hautes que le tableau : 6 outs', text: "Avec As-Dame sur 9-6-2, chacun des 3 As et des 3 Dames restants vous donne une paire plus haute que les cartes du tableau (sans garantie qu'elle gagne)." },
            { term: 'Couleur + quinte par les deux bouts : 15 outs', text: "9 + 8 = 17, mais deux cartes complètent les deux tirages à la fois : on ne les compte qu'une fois." },
          ],
        },
      },
      {
        title: 'Comptez vos outs',
        paragraphs: [
          'Vous avez 8-7 et le flop apporte 6 et 5 : vous avez quatre cartes qui se suivent.',
          'Combien de cartes complètent votre quinte ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Flop R♥ 6♦ 5♣. Vous avez 8♠ 7♠. Combien avez-vous d’outs pour la quinte ?',
          hero: ['8s', '7s'],
          board: ['Kh', '6d', '5c'],
          options: [
            { label: '4 outs', correct: false, feedback: "Ce serait le cas d'une quinte ventrale. Ici, vos quatre cartes sont consécutives : le tirage est ouvert des deux côtés." },
            { label: '8 outs', correct: true, feedback: "Exact : quatre 9 (pour 9-8-7-6-5) et quatre 4 (pour 8-7-6-5-4). C'est une quinte par les deux bouts." },
            { label: '9 outs', correct: false, feedback: "9 outs correspondent au tirage couleur. Ici, il n'y en a pas : aucun pique n'est tombé au tableau." },
            { label: '15 outs', correct: false, feedback: "15 outs, c'est un tirage couleur combiné à une quinte par les deux bouts. Vous n'avez que le second." },
          ],
        },
      },
      {
        title: 'La règle du 4 et du 2',
        paragraphs: [
          "Pour convertir des outs en pourcentage, une règle approximative suffit à table : au flop, multipliez vos outs par 4 si vous êtes sûr de voir la turn et la river (par exemple parce que tout le monde est à tapis). À la turn, multipliez par 2 pour la seule river.",
          "C'est une approximation : 9 outs au flop donnent 36 % par la règle, 35 % en réalité ; 8 outs, 32 % contre 31,5 %. Au-delà de 8 à 9 outs, la règle du 4 surestime : retirez l'écart entre vos outs et 8 (15 outs : 60 − 7 = 53 %, pour 54 % réels).",
        ],
        visual: {
          kind: 'decision',
          situation: 'Turn. En ne comptant que votre tirage couleur à trèfle, quelle est votre chance approximative de le compléter à la river ?',
          hero: ['Kc', 'Qc'],
          board: ['Jc', '7c', '3d', '2s'],
          options: [
            { label: 'Environ 9 %', correct: false, feedback: "C'est le nombre d'outs, pas un pourcentage. Multipliez-le par 2 pour une seule carte à venir." },
            { label: 'Environ 18 %', correct: true, feedback: 'Oui : 9 outs × 2 = 18 %. Le chiffre exact est 9 sur 46 cartes inconnues, soit 19,6 %.' },
            { label: 'Environ 36 %', correct: false, feedback: "36 %, c'est la règle du 4, valable au flop avec deux cartes à venir. À la turn, il n'en reste qu'une." },
            { label: 'Environ 50 %', correct: false, feedback: 'Beaucoup trop optimiste : avec une seule carte à venir, un tirage couleur échoue environ quatre fois sur cinq.' },
          ],
        },
      },
      {
        title: 'Les outs qui ne sont pas propres',
        paragraphs: [
          "Un out n'est vraiment utile que s'il vous donne la meilleure main. Sur un tableau apparié, la carte qui complète votre couleur ne suffit pas si l'adversaire a un full ; une carte qui complète votre quinte peut aussi donner une couleur à quelqu'un d'autre.",
          "Révélez l'abattage : votre couleur est arrivée, mais elle ne suffit pas.",
        ],
        visual: {
          kind: 'showdown',
          board: ['Jd', 'Jc', '5d', '8h', '2d'],
          players: [
            { label: 'Vous', cards: ['Ad', '7d'], result: 'Couleur à l’As' },
            { label: 'Adversaire', cards: ['Js', '8s'], result: 'Full aux Valets par les 8' },
          ],
          winner: 1,
          note: "Le 2♦ de la river vous donne la couleur, mais l'adversaire avait un brelan de Valets dès le flop, devenu full avec le 8 de la turn. Sur un tableau apparié, vos outs couleur sont moins fiables.",
        },
      },
      {
        title: 'Votre méthode en cinq étapes',
        paragraphs: [
          "Avec un peu d'entraînement, ce calcul prend quelques secondes. L'important est de le faire systématiquement, sans tricher avec soi-même.",
          'Cochez chaque étape lors de vos prochaines mains avec un tirage.',
        ],
        visual: {
          kind: 'checklist',
          title: 'Compter ses outs',
          items: [
            'J’identifie mes tirages : couleur, quinte, cartes plus hautes que le tableau',
            'Je compte les outs de chaque tirage',
            'Je retire les cartes comptées deux fois',
            'J’écarte les outs douteux (tableau apparié, couleur adverse possible)',
            'Je convertis : outs × 4 au flop (deux cartes à venir), outs × 2 à la turn',
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Combien d’outs a un tirage couleur au flop ?',
        options: ['4', '8', '9', '13'],
        answer: 2,
        explanation: '13 cartes par enseigne, dont 4 déjà visibles (vos deux cartes et deux au tableau) : il en reste 9.',
      },
      {
        question: 'Vous avez V-10 sur un flop 9-8-2 de trois enseignes différentes. Combien d’outs pour la quinte ?',
        options: ['4', '6', '8', '9'],
        answer: 2,
        explanation: 'V-10-9-8 est une quinte par les deux bouts : quatre Dames et quatre 7 la complètent, soit 8 outs.',
      },
      {
        question: 'Vous avez 9-8 sur un flop R-6-5. Combien d’outs pour la quinte ?',
        options: ['2', '4', '8', '9'],
        answer: 1,
        explanation: "9-8-6-5 attend un 7 au milieu : c'est une quinte ventrale (« gutshot »), seulement 4 outs.",
      },
      {
        question: 'Au flop, avec 8 outs et deux cartes à venir, quelle est votre chance approximative de toucher ?',
        options: ['Environ 8 %', 'Environ 16 %', 'Environ 32 %', 'Environ 50 %'],
        answer: 2,
        explanation: 'Règle du 4 : 8 × 4 = 32 %. Le chiffre exact est 31,5 %. Avec une seule carte à venir, ce serait environ 16 % (17,4 % exactement).',
      },
      {
        question: 'Vous avez à la fois un tirage couleur et une quinte par les deux bouts. Combien d’outs au total ?',
        options: ['9', '15', '17', '21'],
        answer: 1,
        explanation: '9 + 8 = 17, mais deux cartes (celles de votre enseigne qui complètent aussi la quinte) sont comptées deux fois : il reste 15 outs distincts.',
      },
    ],
  },

  // 10 ---------------------------------------------------------------------------
  {
    slug: 'cotes-du-pot',
    title: 'Les cotes du pot : première approche',
    summary: "Comparer le prix d'un paiement à vos chances de gagner pour savoir si suivre avec un tirage est rentable.",
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 10,
    duration: 13,
    cover: ['6s', '5s'],
    steps: [
      {
        title: 'Payer pour voir une carte',
        paragraphs: [
          "Avec un tirage, vous n'avez pas encore la meilleure main : vous payez pour voir la carte suivante. La question n'est pas « vais-je toucher ? » mais « le prix demandé est-il justifié par mes chances ? ».",
          'Gardez cette main en tête : au flop, vous avez un tirage couleur à pique. Dévoilez la turn et la river.',
        ],
        visual: { kind: 'table', hero: ['6s', '5s'], board: ['As', '9s', '2d', 'Kc', '8h'], revealed: 3, interactive: true },
      },
      {
        title: 'Le calcul en une ligne',
        paragraphs: [
          "Les cotes du pot (« pot odds ») comparent ce que vous devez payer à ce que vous pouvez gagner. Le plus simple est de les exprimer en pourcentage : la part de chances de gagner dont vous avez besoin pour que suivre soit rentable.",
          "Formule : montant à payer ÷ pot total après votre paiement. Dévoilez chaque élément sur un exemple : pot de 100 jetons, l'adversaire mise 50.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: '1. Le montant à payer', text: '50 jetons : la mise adverse que vous devez égaler.' },
            { term: '2. Le pot total après paiement', text: '100 (pot de départ) + 50 (mise adverse) + 50 (votre paiement) = 200 jetons.' },
            { term: '3. Le pourcentage requis', text: '50 ÷ 200 = 25 %. Il vous faut au moins 25 % de chances de gagner pour que payer soit rentable à long terme.' },
            { term: '4. La comparaison', text: 'Si vos chances dépassent 25 %, payer est rentable ; si elles sont inférieures, se coucher est préférable (hors gains futurs, voir plus loin).' },
          ],
        },
      },
      {
        title: 'À vous de calculer',
        paragraphs: [
          'Le pot contient 80 jetons et votre adversaire mise 40.',
          'Quel pourcentage de chances de gagner vous faut-il au minimum pour payer ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Pot de 80 jetons. Votre adversaire mise 40. Quelle part de chances de gagner vous faut-il pour payer ?',
          options: [
            { label: '20 %', correct: false, feedback: 'Recalculez le pot final : 80 + 40 + 40 = 160 jetons, et vous payez 40.' },
            { label: '25 %', correct: true, feedback: 'Exact : 40 ÷ (80 + 40 + 40) = 40 ÷ 160 = 25 %. Une mise de la moitié du pot demande toujours 25 %.' },
            { label: '33 %', correct: false, feedback: '33 % correspond à une mise de la taille du pot. Ici, la mise ne vaut que la moitié du pot.' },
            { label: '50 %', correct: false, feedback: "50 % est le rapport entre la mise et le pot de départ, mais ce n'est pas le bon calcul : il faut diviser par le pot total après votre paiement." },
          ],
        },
      },
      {
        title: 'Les repères à retenir',
        paragraphs: [
          "Comme les mises s'expriment en fraction du pot, quelques chiffres reviennent tout le temps. Les connaître par cœur évite tout calcul à table.",
          'Cochez-les au fur et à mesure que vous les retenez.',
        ],
        visual: {
          kind: 'checklist',
          title: 'Chances de gagner nécessaires pour payer',
          items: [
            'Mise d’un tiers du pot : 20 %',
            'Mise de la moitié du pot : 25 %',
            'Mise des deux tiers du pot : environ 29 %',
            'Mise de la taille du pot : environ 33 %',
            'Mise de deux fois le pot : 40 %',
          ],
        },
      },
      {
        title: 'Un prix trop élevé',
        paragraphs: [
          "Turn. Votre tirage couleur n'est pas encore arrivé, il ne reste qu'une carte. Votre adversaire mise la taille du pot : 100 jetons dans un pot de 100.",
          'Avec 9 outs et une carte à venir, vos chances sont d’environ 20 % (9 sur 46). Payer est-il rentable ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Turn. Pot de 100 jetons, l’adversaire mise 100. Vous n’avez qu’un tirage couleur.',
          hero: ['6s', '5s'],
          board: ['As', '9s', '2d', 'Kc'],
          options: [
            { label: 'Payer', correct: false, feedback: "Il vous faudrait 33 % de chances (100 ÷ 300) et vous n'en avez qu'environ 20 %. À long terme, ce paiement perd des jetons." },
            { label: 'Se coucher', correct: true, feedback: "Oui : le prix demande 33 %, votre tirage n'offre qu'environ 20 %. Se coucher est le bon repère, même si la couleur arrive parfois." },
            { label: 'Relancer à tapis', correct: false, feedback: "Avec un simple tirage et une seule carte à venir, une relance a peu de chances de faire coucher un adversaire qui vient de miser la taille du pot." },
          ],
        },
      },
      {
        title: 'Un prix attractif',
        paragraphs: [
          "Autre situation à la turn : vous avez une quinte par les deux bouts, 8 outs, soit environ 17 % de chances pour la river. Cette fois, l'adversaire mise petit : 20 jetons dans un pot de 120.",
          'Calculez le prix : 20 ÷ (120 + 20 + 20) = 12,5 %.',
        ],
        visual: {
          kind: 'decision',
          situation: 'Turn. Pot de 120 jetons, l’adversaire mise 20. Vous avez une quinte par les deux bouts.',
          hero: ['Jh', 'Th'],
          board: ['9c', '8d', '2s', '3h'],
          options: [
            { label: 'Payer', correct: true, feedback: 'Bon choix : il vous faut 12,5 % et vous en avez environ 17 %. Le prix est favorable, payer est rentable.' },
            { label: 'Se coucher', correct: false, feedback: 'Trop prudent : le pot vous offre un excellent prix. Se coucher ici abandonne un paiement rentable.' },
            { label: 'Relancer à tapis', correct: false, feedback: 'Inutile de risquer tout votre tapis : un simple paiement est déjà rentable et vous laisse décider à la river.' },
          ],
        },
      },
      {
        title: 'Les limites de ce calcul',
        paragraphs: [
          'Les cotes du pot sont un point de départ, pas une vérité absolue. Plusieurs éléments peuvent modifier la décision.',
          'Dévoilez les trois principaux.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Les cotes implicites', text: "Les jetons que vous espérez gagner en plus sur les tours suivants si votre tirage arrive (« implied odds »). Elles peuvent justifier un paiement un peu cher, surtout avec des tapis profonds." },
            { term: 'Les outs douteux', text: "Si certains de vos outs risquent de donner une main encore meilleure à l'adversaire, vos vraies chances sont plus faibles que le calcul brut." },
            { term: 'Une ou deux cartes à venir', text: "Au flop, la règle du 4 n'est valable que si vous êtes sûr de voir les deux cartes. Si l'adversaire peut encore miser à la turn, raisonnez carte par carte (règle du 2)." },
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Pot de 60 jetons, votre adversaire mise 30. Quelle part de chances vous faut-il pour payer ?',
        options: ['20 %', '25 %', '33 %', '50 %'],
        answer: 1,
        explanation: '30 ÷ (60 + 30 + 30) = 30 ÷ 120 = 25 %.',
      },
      {
        question: 'Votre adversaire mise la taille du pot. Quelle part de chances vous faut-il pour payer ?',
        options: ['Environ 20 %', 'Environ 25 %', 'Environ 33 %', '50 %'],
        answer: 2,
        explanation: 'Pot de 100, mise de 100 : vous payez 100 pour un pot final de 300, soit 33 %.',
      },
      {
        question: 'À la turn, avec 9 outs, quelle est votre chance approximative de toucher à la river ?',
        options: ['Environ 9 %', 'Environ 20 %', 'Environ 35 %', 'Environ 50 %'],
        answer: 1,
        explanation: 'Règle du 2 : 9 × 2 = 18 %, pour 19,6 % exactement (9 cartes sur 46 inconnues). Les 35 % concernent le flop avec deux cartes à venir.',
      },
      {
        question: 'À la turn, pot de 50, mise adverse de 50. Vous n’avez qu’un tirage couleur. Quel est le repère ?',
        options: [
          'Payer, la couleur arrive souvent',
          'Se coucher : il faut 33 % et vous en avez environ 20 %',
          'Payer, car vous avez déjà misé dans ce pot',
          'Relancer obligatoirement',
        ],
        answer: 1,
        explanation: "Le prix exige 33 % de chances, votre tirage n'en offre qu'environ 20 %. Les jetons déjà misés ne vous appartiennent plus et ne doivent pas influencer la décision.",
      },
      {
        question: 'Que désignent les « cotes implicites » ?',
        options: [
          'Les jetons déjà présents dans le pot',
          'Les jetons supplémentaires que vous espérez gagner plus tard si votre tirage arrive',
          'La commission prélevée sur le pot',
          'Le nombre de cartes restant dans le paquet',
        ],
        answer: 1,
        explanation: 'Les cotes implicites tiennent compte des gains futurs possibles. Elles peuvent rendre un paiement rentable même si les cotes du pot seules sont un peu insuffisantes.',
      },
    ],
  },

  // 11 ---------------------------------------------------------------------------
  {
    slug: 'jouer-une-paire-servie',
    title: 'Jouer une paire servie',
    summary: 'Petites, moyennes ou grosses paires : un plan de jeu simple pour chaque famille, avant et après le flop.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 11,
    duration: 13,
    cover: ['Ts', 'Th'],
    steps: [
      {
        title: 'Trois familles de paires',
        paragraphs: [
          'Une paire servie (deux cartes de même valeur dès la distribution) arrive environ une fois sur 17. Toutes les paires ne se jouent pas de la même façon : leur valeur dépend surtout du nombre de cartes plus hautes qui peuvent tomber au tableau.',
          'Parcourez les trois familles.',
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            {
              title: 'Grosses paires',
              description: 'De V-V à A-A. Elles sont souvent la meilleure main avant le flop : on cherche à faire grossir le pot.',
              hands: [['As', 'Ad'], ['Kh', 'Kc'], ['Qs', 'Qh'], ['Jd', 'Jc']],
            },
            {
              title: 'Paires moyennes',
              description: 'De 7-7 à 10-10. Solides, mais souvent menacées par une ou plusieurs cartes plus hautes au flop.',
              hands: [['Th', 'Tc'], ['9s', '9d'], ['8c', '8h'], ['7d', '7s']],
            },
            {
              title: 'Petites paires',
              description: 'De 2-2 à 6-6. Elles comptent surtout sur un brelan au flop pour gagner un gros pot.',
              hands: [['6h', '6c'], ['4s', '4d'], ['3c', '3h'], ['2d', '2s']],
            },
          ],
        },
      },
      {
        title: 'Les grosses paires : prendre l’initiative',
        paragraphs: [
          "Avec une grosse paire, le pire est de la jouer passivement : vous laissez les autres voir le flop à bas prix, avec des mains qui peuvent vous dépasser. Relancez, et relancez de nouveau si quelqu'un a ouvert avant vous.",
          'Un joueur a ouvert devant vous. Que faites-vous avec deux Dames ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Un joueur ouvre à 2,5 BB sous le pistolet. Vous êtes au cut-off avec deux Dames et 100 BB.',
          hero: ['Qh', 'Qc'],
          options: [
            { label: 'Payer', correct: false, feedback: 'Payer est jouable, mais vous laissez les joueurs suivants entrer à bon prix et le pot reste petit alors que vous êtes souvent devant.' },
            { label: 'Relancer à environ 7 à 8 BB', correct: true, feedback: "Oui : deux Dames sont devant la grande majorité des mains qui ouvrent sous le pistolet. Relancer construit le pot et isole souvent un seul adversaire." },
            { label: 'Se coucher', correct: false, feedback: 'Beaucoup trop prudent : deux Dames font partie des toutes meilleures mains de départ.' },
          ],
        },
      },
      {
        title: 'Les petites paires : chercher le brelan',
        paragraphs: [
          "Une petite paire n'a souvent plus grand-chose au flop : la plupart du temps, une ou plusieurs cartes plus hautes tombent. Sa vraie force, c'est le brelan : quand il arrive, il est très difficile à deviner pour l'adversaire.",
          'Dévoilez les repères de ce plan de jeu.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Toucher un brelan au flop', text: 'Avec une paire servie, vous faites un brelan (ou mieux) au flop environ une fois sur 8,5, soit 11,8 %.' },
            { term: 'La règle des tapis', text: "Payer une relance pour chercher le brelan n'est rentable que si vous pouvez gagner beaucoup quand il arrive : repère courant, des tapis d'au moins 15 à 20 fois le montant à payer." },
            { term: 'Brelan manqué', text: "Sans brelan, avec des cartes plus hautes au tableau et un adversaire qui mise, se coucher est souvent la bonne décision. Ne vous accrochez pas." },
            { term: 'Tapis courts', text: 'En tournoi avec peu de grosses blindes, chercher le brelan devient peu rentable : on préfère relancer, voire partir à tapis, ou se coucher.' },
          ],
        },
      },
      {
        title: 'Le brelan qui rapporte',
        paragraphs: [
          'Vous avez payé une relance avec deux 5, et le flop vous apporte un troisième 5. Votre adversaire, qui a peut-être un Roi, a toutes les raisons de continuer à miser.',
          'Dévoilez la turn et la river. Un brelan formé avec une paire servie est très bien caché : c’est ce qui rend les petites paires rentables quand les tapis sont profonds.',
        ],
        visual: { kind: 'table', hero: ['5c', '5d'], board: ['Kh', '5s', '9d', '2c', 'Jh'], revealed: 3, interactive: true },
      },
      {
        title: 'Quand le flop tourne mal',
        paragraphs: [
          "Avec une paire moyenne, un flop qui apporte deux cartes plus hautes et de l'action de plusieurs joueurs est un signal clair. Votre paire n'est plus qu'une main d'abattage modeste.",
          'Quatre joueurs voient le flop. Le premier mise, le deuxième relance.',
        ],
        visual: {
          kind: 'decision',
          situation: 'Flop A♣ R♦ 4♥ à quatre joueurs. Une mise, puis une relance devant vous.',
          hero: ['8s', '8h'],
          board: ['Ac', 'Kd', '4h'],
          options: [
            { label: 'Relancer à nouveau', correct: false, feedback: 'Une mise et une relance sur un tableau avec As et Roi : vous ne serez payé que par des mains qui vous battent largement.' },
            { label: 'Payer', correct: false, feedback: "Vous n'avez que deux outs pour le brelan et deux adversaires qui montrent de la force. Payer coûte cher pour peu d'espoir." },
            { label: 'Se coucher', correct: true, feedback: "Oui : votre paire de 8 est sous l'As et le Roi, et deux joueurs ont montré de la force. Se coucher est la décision raisonnable." },
          ],
        },
      },
      {
        title: 'La force de la surpaire',
        paragraphs: [
          "On parle de « surpaire » quand votre paire servie est plus haute que toutes les cartes du tableau. C'est souvent la meilleure main au flop, surtout sur un tableau bas.",
          "Misez pour être payé par les paires inférieures et pour faire payer les tirages. Révélez l'abattage.",
        ],
        visual: {
          kind: 'showdown',
          board: ['9s', '6c', '2h', '4d', '8h'],
          players: [
            { label: 'Vous', cards: ['Jd', 'Jc'], result: 'Paire de Valets (surpaire)' },
            { label: 'Adversaire', cards: ['9h', 'Td'], result: 'Paire de 9' },
          ],
          winner: 0,
          note: "Votre paire de Valets bat la paire de 9 que l'adversaire a touchée au flop : c'est exactement le scénario qu'espère une surpaire.",
        },
      },
      {
        title: 'Votre plan avec une paire servie',
        paragraphs: [
          'Avant de vous engager, situez votre paire dans sa famille et vérifiez les conditions qui la rendent rentable.',
          'Cette courte liste vous évitera la plupart des erreurs coûteuses.',
        ],
        visual: {
          kind: 'checklist',
          title: 'Ma paire servie',
          items: [
            'Grosse, moyenne ou petite paire ?',
            'Quelqu’un a-t-il relancé avant moi, et depuis quelle position ?',
            'Les tapis sont-ils assez profonds pour chercher un brelan ?',
            'Au flop : ma paire est-elle une surpaire ou y a-t-il des cartes plus hautes ?',
            'Combien d’adversaires montrent de la force ?',
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Avec une paire servie, à quelle fréquence faites-vous un brelan ou mieux au flop ?',
        options: ['Environ 1 fois sur 3', 'Environ 1 fois sur 8,5', 'Environ 1 fois sur 17', 'Environ 1 fois sur 50'],
        answer: 1,
        explanation: "Environ 11,8 % des flops, soit une fois sur 8,5. Une fois sur 17, c'est la fréquence à laquelle on reçoit une paire servie.",
      },
      {
        question: 'Un joueur ouvre devant vous et vous avez deux Rois. Quel est le repère ?',
        options: ['Se coucher', 'Payer pour cacher sa force', 'Relancer', 'Attendre le flop pour décider'],
        answer: 2,
        explanation: "Avec une grosse paire, relancer construit le pot quand vous êtes très souvent devant et réduit le nombre d'adversaires.",
      },
      {
        question: 'Pourquoi les petites paires perdent-elles de la valeur avec des tapis courts ?',
        options: [
          'Parce qu’elles font moins souvent des brelans',
          'Parce que les gains possibles quand le brelan arrive ne compensent plus le coût des fois où il manque',
          'Parce que la règle interdit de les jouer',
          'Parce qu’elles sont dominées par les As',
        ],
        answer: 1,
        explanation: "La fréquence du brelan ne change pas (environ 12 %). Ce qui change, c'est ce que vous pouvez gagner : avec peu de jetons derrière, le brelan ne rapporte pas assez.",
      },
      {
        question: 'Que désigne une « surpaire » ?',
        options: [
          'Une paire formée avec une carte du tableau',
          'Une paire servie plus haute que toutes les cartes du tableau',
          'Deux paires',
          'Une paire d’As uniquement',
        ],
        answer: 1,
        explanation: 'Par exemple deux Valets sur un tableau 9-6-2 : votre paire est au-dessus de toutes les cartes communes.',
      },
      {
        question: 'Vous avez deux 7. Le flop est A-D-9, une mise et une relance devant vous. Que faire ?',
        options: ['Relancer', 'Payer', 'Se coucher', 'Partir à tapis'],
        answer: 2,
        explanation: 'Trois cartes plus hautes que votre paire, deux adversaires qui montrent de la force et seulement deux outs pour le brelan : se coucher est le bon repère.',
      },
    ],
  },

  // 12 ---------------------------------------------------------------------------
  {
    slug: 'as-roi-et-grosses-mains',
    title: 'As-Roi et les grosses mains non appariées',
    summary: 'As-Roi, As-Dame, Roi-Dame : des mains puissantes avant le flop, à manier avec méthode quand le tableau ne les aide pas.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 12,
    duration: 12,
    cover: ['As', 'Kd'],
    steps: [
      {
        title: 'Pourquoi As-Roi est si fort',
        paragraphs: [
          "As-Roi est la meilleure main non appariée. Elle n'a pourtant rien de fait : tant que le tableau ne l'aide pas, ce n'est qu'une carte haute As. Sa force vient d'ailleurs.",
          'Dévoilez ses atouts et sa limite.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Elle domine', text: "As-Dame, As-Valet, Roi-Dame, Roi-Valet : quand l'une de ces mains touche sa paire en même temps que vous, votre kicker l'emporte. Contre As-Dame, As-Roi gagne environ trois fois sur quatre." },
            { term: 'Elle bloque les grosses paires', text: 'Tenir un As et un Roi réduit les combinaisons adverses de deux As de 6 à 3, et de même pour deux Rois.' },
            { term: 'Elle touche une fois sur trois', text: 'As-Roi fait au moins une paire au flop environ 32 % du temps. Les deux tiers du temps, il faudra jouer sans paire.' },
            { term: 'Sa limite', text: "Face à une paire servie, même petite, As-Roi est légèrement derrière avant le flop : c'est presque un pile ou face." },
          ],
        },
      },
      {
        title: 'Une hiérarchie à respecter',
        paragraphs: [
          "Toutes les belles cartes hautes ne se valent pas. Plus votre seconde carte est faible, plus vous risquez d'être dominé quand un adversaire relance.",
          'Comparez les trois familles.',
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            {
              title: 'Les meilleures',
              description: "As-Roi et As-Dame : à relancer en ouverture de toutes les places. As-Roi se relance aussi presque toujours face à une ouverture.",
              hands: [['Ah', 'Kc'], ['As', 'Ks'], ['Ad', 'Qh'], ['Ac', 'Qc']],
            },
            {
              title: 'Fortes',
              description: "As-Valet, Roi-Dame, As-10 assorti : à ouvrir sans hésiter, mais prudence face à une relance d'un joueur sélectif.",
              hands: [['Ah', 'Jd'], ['Ks', 'Qd'], ['Ad', 'Td'], ['Kh', 'Qh']],
            },
            {
              title: 'Pièges fréquents',
              description: 'Roi-Valet, Dame-Valet, As-10 dépareillé : jolies, mais souvent dominées face à une relance. À jouer surtout en fin de parole.',
              hands: [['Kd', 'Jc'], ['Qs', 'Jh'], ['Ac', 'Th'], ['Ks', 'Td']],
            },
          ],
        },
      },
      {
        title: 'Face à une ouverture',
        paragraphs: [
          'Un joueur ouvre en début de parole et vous recevez As-Roi au bouton. Vous êtes en position et votre main est devant la plupart des mains qui ouvrent.',
          'Quelle est la meilleure option ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Un joueur ouvre à 2,5 BB sous le pistolet. Tout le monde se couche jusqu’à vous, au bouton, avec 100 BB.',
          hero: ['Ac', 'Kh'],
          options: [
            { label: 'Relancer à environ 7 à 8 BB', correct: true, feedback: 'Oui : As-Roi domine une grande partie des mains qui ouvrent, et la relance construit le pot tout en faisant coucher les blindes.' },
            { label: 'Payer', correct: false, feedback: "Jouable, mais vous laissez les blindes entrer à bon prix et vous renoncez à l'initiative avec l'une des meilleures mains." },
            { label: 'Se coucher', correct: false, feedback: 'Beaucoup trop prudent : As-Roi fait partie des toutes meilleures mains de départ.' },
          ],
        },
      },
      {
        title: 'Le flop vous aide',
        paragraphs: [
          "Vous touchez la paire la plus haute du tableau avec le meilleur kicker possible : en anglais, « top pair, top kicker ». C'est une main de valeur, sur laquelle vous misez pour être payé.",
          'Dévoilez la suite : surveillez les cartes qui pourraient compléter un tirage adverse.',
        ],
        visual: { kind: 'table', hero: ['Ah', 'Kc'], board: ['Ks', '8d', '3h', 'Tc', '5s'], revealed: 3, interactive: true },
      },
      {
        title: 'Le flop vous rate',
        paragraphs: [
          'Deux fois sur trois, As-Roi ne touche rien au flop. Pas de panique : vous avez souvent encore la meilleure main, ou deux cartes plus hautes que le tableau.',
          'Vous avez relancé avant le flop, seule la grosse blinde a payé. Le flop est sec, et elle checke.',
        ],
        visual: {
          kind: 'decision',
          situation: 'Flop D♣ 7♥ 2♦, un seul adversaire (la grosse blinde), qui checke. Vous êtes en position.',
          hero: ['Ad', 'Ks'],
          board: ['Qc', '7h', '2d'],
          options: [
            { label: 'Miser petit, environ un tiers du pot', correct: true, feedback: "Bon choix : ce tableau sec a rarement aidé l'adversaire, et vous avez relancé avant le flop. Cette « mise de continuation » gagne souvent le pot tout de suite, et vous gardez 6 outs si elle est payée." },
            { label: 'Partir à tapis', correct: false, feedback: 'Disproportionné : vous risquez tout votre tapis pour un petit pot, et seules les mains qui vous battent paieront.' },
            { label: 'Checker, puis abandonner si l’adversaire mise à la turn', correct: false, feedback: "Trop passif : vous renoncez à l'initiative sur l'un des tableaux les plus favorables pour miser." },
          ],
        },
      },
      {
        title: 'Rester lucide face à une paire',
        paragraphs: [
          "As-Roi est une main de domination, pas une main imbattable. Face à une paire servie, même modeste, elle n'est pas favorite : contre deux Dames, elle gagne environ 43 % du temps avant le flop.",
          "En tournoi, avec un tapis court, ces affrontements sont fréquents et acceptables. Avec 100 BB, en revanche, mettre tout son tapis avec As-Roi face à un joueur très sélectif qui relance plusieurs fois est souvent une erreur. Révélez cet abattage.",
        ],
        visual: {
          kind: 'showdown',
          board: ['Jd', '8c', '4s', '2h', '9c'],
          players: [
            { label: 'Vous', cards: ['As', 'Kh'], result: 'Carte haute As' },
            { label: 'Adversaire', cards: ['Qc', 'Qd'], result: 'Paire de Dames' },
          ],
          winner: 1,
          note: "Aucun As ni Roi n'est venu : la paire de Dames l'emporte. Sur un grand nombre de mains, ce duel tourne environ 57 % contre 43 % en faveur de la paire.",
        },
      },
    ],
    quiz: [
      {
        question: 'À quelle fréquence As-Roi fait-il au moins une paire au flop ?',
        options: ['Environ 10 %', 'Environ 32 %', 'Environ 50 %', 'Environ 75 %'],
        answer: 1,
        explanation: 'As-Roi touche une paire ou mieux au flop environ une fois sur trois (32,4 %). Il faut donc savoir jouer les deux autres fois.',
      },
      {
        question: 'As-Roi dépareillé contre deux 2 avant le flop : quelle est la situation ?',
        options: [
          'As-Roi est largement favori',
          'C’est presque un pile ou face, avec un léger avantage pour la paire',
          'As-Roi n’a que 10 % de chances',
          'As-Roi gagne toujours grâce à ses cartes hautes',
        ],
        answer: 1,
        explanation: "La plus petite paire reste légèrement favorite (environ 53 % contre 47 %) : As-Roi doit toucher pour gagner, alors que la paire gagne si rien ne tombe.",
      },
      {
        question: 'Pourquoi dit-on qu’As-Roi « domine » As-Dame ?',
        options: [
          'Parce que les deux mains partagent un As et que le Roi bat la Dame comme kicker',
          'Parce qu’As-Roi est toujours assorti',
          'Parce qu’As-Dame ne peut pas faire de quinte',
          'Parce qu’As-Roi gagne 100 % du temps',
        ],
        answer: 0,
        explanation: "Quand l'As tombe, les deux joueurs ont une paire d'As et le Roi l'emporte comme kicker. As-Roi gagne ce duel environ trois fois sur quatre.",
      },
      {
        question: 'Vous tenez As-Roi. Combien reste-t-il de combinaisons possibles de deux As chez vos adversaires ?',
        options: ['6', '4', '3', '1'],
        answer: 2,
        explanation: "Il ne reste que trois As dans le paquet, ce qui ne permet de former que 3 paires d'As au lieu de 6.",
      },
      {
        question: 'Vous avez relancé avec As-Roi, un seul adversaire a payé. Le flop D-7-2 d’enseignes différentes ne vous aide pas, et il checke. Quel repère ?',
        options: [
          'Partir à tapis',
          'Miser petit, environ un tiers du pot',
          'Se coucher',
          'Checker et abandonner dès la moindre mise',
        ],
        answer: 1,
        explanation: "Sur un tableau sec, après avoir relancé avant le flop, une petite mise de continuation est efficace : l'adversaire a souvent raté, et vous gardez des outs.",
      },
    ],
  },

  // 13 ---------------------------------------------------------------------------
  {
    slug: 'le-bluff-bases',
    title: 'Le bluff : quand, pourquoi, et quand s’abstenir',
    summary: 'Comprendre à quoi sert le bluff, choisir les bons contextes et éviter les situations où il ne peut pas fonctionner.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 13,
    duration: 12,
    cover: ['9c', '8c'],
    steps: [
      {
        title: 'Bluff, semi-bluff et mise de valeur',
        paragraphs: [
          "Au poker, on mise pour deux raisons : être payé par une main moins bonne (la « mise de valeur ») ou faire coucher une main meilleure (le bluff). Le bluff n'est pas un coup de bravoure, c'est un outil qui a ses conditions.",
          'Dévoilez les termes essentiels.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Mise de valeur', text: 'Vous pensez avoir la meilleure main et vous voulez être payé par des mains plus faibles.' },
            { term: 'Bluff', text: "Vous avez probablement la moins bonne main et vous misez pour que l'adversaire se couche." },
            { term: 'Semi-bluff', text: "Vous misez avec un tirage : l'adversaire peut se coucher tout de suite, et s'il paie, vous pouvez encore toucher la meilleure main." },
            { term: 'Pourquoi bluffer ?', text: 'Si vous ne bluffez jamais, vos adversaires se coucheront chaque fois que vous misez, et vos grosses mains ne vous rapporteront presque rien.' },
          ],
        },
      },
      {
        title: 'Le semi-bluff, le bluff le plus sûr',
        paragraphs: [
          "Avec 9-8 de trèfle sur un flop 10♣ 7♣ 2♥, vous n'avez encore rien, mais vous avez un tirage couleur et une quinte par les deux bouts : 15 outs, environ 54 % de chances de compléter l'une des deux d'ici la river.",
          "Miser ici, c'est se donner deux façons de gagner : l'adversaire se couche, ou vous touchez. Dévoilez la turn et la river.",
        ],
        visual: { kind: 'table', hero: ['9c', '8c'], board: BLUFF_BOARD, revealed: 3, interactive: true },
      },
      {
        title: 'Les conditions favorables',
        paragraphs: [
          "Un bluff réussit quand l'histoire que racontent vos mises est crédible et que l'adversaire est capable de se coucher. Plus vous cochez de cases, plus le bluff a de chances de fonctionner.",
          "À l'inverse, si vous n'en cochez qu'une ou deux, abstenez-vous.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Bluffer est raisonnable si…',
          items: [
            'Je n’ai qu’un seul adversaire, ou deux au maximum',
            'Mes mises depuis le préflop racontent une histoire cohérente',
            'Le tableau est plus favorable aux mains que je représente qu’à celles de l’adversaire',
            'Mon adversaire est capable de se coucher (il n’est pas du genre à tout payer)',
            'Ma main a encore des outs si je suis payé (semi-bluff)',
          ],
        },
      },
      {
        title: 'Combien de fois doit-il réussir ?',
        paragraphs: [
          "Un bluff a un prix : la mise que vous risquez. Il est rentable si l'adversaire se couche suffisamment souvent. Le seuil se calcule ainsi : mise ÷ (pot + mise).",
          "Une mise de la taille du pot doit faire coucher l'adversaire au moins une fois sur deux ; une mise d'un tiers du pot, une fois sur quatre seulement. Testez-vous.",
        ],
        visual: {
          kind: 'decision',
          situation: 'Pot de 100 jetons. Vous bluffez en misant 50. À partir de quelle fréquence de couchers adverses ce bluff est-il rentable ?',
          options: [
            { label: 'Environ 25 %', correct: false, feedback: "25 % correspond à une mise d'un tiers du pot. Ici, vous risquez 50 pour gagner 100." },
            { label: 'Environ 33 %', correct: true, feedback: "Exact : 50 ÷ (100 + 50) = 33 %. Si l'adversaire se couche plus d'une fois sur trois, le bluff rapporte à long terme." },
            { label: '50 %', correct: false, feedback: "50 % serait le seuil d'une mise de la taille du pot (100 ÷ 200)." },
            { label: 'Environ 66 %', correct: false, feedback: 'Beaucoup trop : vous risquez la moitié de ce que vous pouvez gagner, le seuil est donc bien plus bas.' },
          ],
        },
      },
      {
        title: 'Quand s’abstenir',
        paragraphs: [
          "Le bluff perd de son efficacité à chaque adversaire supplémentaire : il faut que tous se couchent, et la probabilité que l'un d'eux ait quelque chose augmente vite.",
          "Quatre joueurs voient le flop. Les deux premiers checkent, vous n'avez rien du tout.",
        ],
        visual: {
          kind: 'decision',
          situation: 'Flop 9♦ 8♦ 6♣ à quatre joueurs. Deux checks devant vous, un joueur parle après vous. Vous n’avez que Dame haute, sans tirage.',
          hero: ['Qs', '3h'],
          board: ['9d', '8d', '6c'],
          options: [
            { label: 'Bluffer de la taille du pot', correct: false, feedback: "Sur ce tableau très coordonné, à quatre joueurs, quelqu'un a très souvent une paire ou un tirage qui paiera. Votre bluff a peu de chances de passer." },
            { label: 'Checker', correct: true, feedback: "Oui : trop d'adversaires, un tableau qui touche beaucoup de mains et aucune chance d'amélioration pour vous. Checker, et abandonner si l'on mise, est le repère sage." },
            { label: 'Partir à tapis', correct: false, feedback: "C'est risquer tout votre tapis dans la pire configuration possible pour un bluff." },
          ],
        },
      },
      {
        title: 'Contre qui bluffer ?',
        paragraphs: [
          "Certains joueurs paient presque toutes les mises dès qu'ils ont une paire ou un tirage ; on les surnomme parfois « calling stations » en anglais. Contre eux, bluffer est une erreur : misez plutôt pour la valeur quand vous avez une main.",
          "Révélez l'abattage : votre bluff à la river a été payé par une simple paire.",
        ],
        visual: {
          kind: 'showdown',
          board: ['Ks', 'Jd', '6h', '3c', '2s'],
          players: [
            { label: 'Vous', cards: ['8h', '7h'], result: 'Carte haute Roi (bluff raté)' },
            { label: 'Adversaire', cards: ['Jc', 'Tc'], result: 'Paire de Valets' },
          ],
          winner: 1,
          note: "Face à un joueur qui ne se couche pas avec une paire, un bluff à la river est voué à l'échec. Gardez vos bluffs pour les adversaires capables de lâcher leur main.",
        },
      },
    ],
    quiz: [
      {
        question: 'Qu’est-ce qu’un semi-bluff ?',
        options: [
          'Une mise avec la meilleure main possible',
          'Une mise avec un tirage, qui peut gagner si l’adversaire se couche ou si le tirage arrive',
          'Un bluff avec une demi-mise',
          'Un bluff à la river uniquement',
        ],
        answer: 1,
        explanation: "Le semi-bluff combine deux façons de gagner : l'abandon adverse immédiat, et l'amélioration de votre main sur les cartes suivantes.",
      },
      {
        question: 'Vous bluffez en misant la taille du pot. À partir de quelle fréquence de couchers adverses est-ce rentable ?',
        options: ['20 %', '33 %', '50 %', '75 %'],
        answer: 2,
        explanation: 'Vous risquez 100 pour gagner 100 : mise ÷ (pot + mise) = 100 ÷ 200 = 50 %.',
      },
      {
        question: 'Dans quelle situation un bluff a-t-il le plus de chances de réussir ?',
        options: [
          'À cinq joueurs sur un tableau très coordonné',
          'Face à un seul adversaire prudent, sur un tableau qui favorise les mains que vous représentez',
          'Face à un joueur qui paie toutes les mises',
          'Juste après avoir perdu un gros pot, pour se refaire',
        ],
        answer: 1,
        explanation: 'Un seul adversaire, capable de se coucher, et une histoire crédible : ce sont les conditions idéales.',
      },
      {
        question: 'Face à un joueur qui paie presque toutes les mises, que faut-il faire ?',
        options: ['Bluffer davantage', 'Bluffer moins et miser pour la valeur avec vos bonnes mains', 'Ne jamais miser', 'Toujours partir à tapis'],
        answer: 1,
        explanation: 'Un adversaire qui paie trop rend vos bluffs perdants, mais vos mises de valeur très rentables.',
      },
      {
        question: 'Pourquoi un joueur qui ne bluffe jamais gagne-t-il moins avec ses grosses mains ?',
        options: [
          'Parce que les règles pénalisent ce comportement',
          'Parce que ses adversaires finissent par se coucher dès qu’il mise',
          'Parce qu’il reçoit moins de bonnes cartes',
          'Il ne gagne pas moins',
        ],
        answer: 1,
        explanation: 'Si chaque mise signale une grosse main, les adversaires attentifs se couchent : vos meilleures mains ne sont plus payées.',
      },
    ],
  },

  // 14 ---------------------------------------------------------------------------
  {
    slug: 'etiquette-et-regles',
    title: 'Étiquette et règles de table',
    summary: 'Agir à son tour, annoncer clairement, protéger ses cartes, respecter les autres : les règles de conduite en live et en ligne.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 14,
    duration: 9,
    cover: ['Qh', 'Jd'],
    steps: [
      {
        title: 'Agir à son tour, et clairement',
        paragraphs: [
          "La plupart des litiges en partie réelle (« live », par opposition au jeu en ligne) viennent d'actions ambiguës. Une annonce verbale faite à votre tour vous engage : si vous dites « relance », vous devez relancer.",
          'Dévoilez les règles de base des annonces.',
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Agir à son tour', text: "Attendez que la parole vous revienne. Agir avant son tour donne une information injuste aux joueurs qui parlent avant vous, et l'action annoncée peut vous être imposée ensuite." },
            { term: "L'annonce verbale engage", text: '« Je suis », « relance à 300 », « tapis » : dite à votre tour, une annonce claire est définitive.' },
            { term: 'Miser en un seul geste', text: "Poussez vos jetons en une fois, ou annoncez le montant d'abord. Revenir chercher des jetons après avoir observé la réaction des autres n'est pas autorisé : la mise est alors limitée au premier geste." },
            { term: 'Garder ses jetons visibles', text: 'Votre tapis doit rester visible et empilé lisiblement, les plus grosses valeurs bien en vue.' },
          ],
        },
      },
      {
        title: 'Le jeton unique',
        paragraphs: [
          'Une règle surprend souvent les débutants : poser silencieusement un seul jeton plus gros que la mise ne compte pas comme une relance.',
          'Testez-vous.',
        ],
        visual: {
          kind: 'decision',
          situation: 'Votre adversaire mise 200. Sans rien dire, vous posez devant vous un seul jeton de 500.',
          options: [
            { label: 'C’est un simple paiement de 200', correct: true, feedback: 'Exact : sans annonce, un jeton unique plus gros que la mise vaut paiement. Pour relancer, il faut annoncer « relance » avant ou en posant le jeton.' },
            { label: 'C’est une relance à 500', correct: false, feedback: 'Non : un jeton unique, sans annonce, est considéré comme un paiement. On vous rendra la monnaie.' },
            { label: 'C’est une relance minimum, à 400', correct: false, feedback: "Non : il n'y a relance que si vous l'annoncez. Ici, c'est un paiement." },
          ],
        },
      },
      {
        title: 'Protéger ses cartes, respecter le coup',
        paragraphs: [
          'Vos cartes sont votre responsabilité. Si elles sont mélangées aux cartes jetées, elles sont perdues, même si votre main était gagnante.',
          'Cochez les bons réflexes que vous appliquez déjà.',
        ],
        visual: {
          kind: 'checklist',
          title: 'Bons réflexes à la table',
          items: [
            'Je laisse mes cartes sur la table, protégées par un jeton',
            'Je ne montre pas mes cartes à un voisin pendant le coup',
            'Je ne commente pas une main en cours, même couché',
            'Je ne lance pas mes jetons dans le pot : je les pose devant moi',
            'Je reste courtois avec les joueurs et le croupier, que je gagne ou que je perde',
          ],
        },
      },
      {
        title: "L'abattage : « les cartes parlent »",
        paragraphs: [
          "À l'abattage, c'est le dernier joueur à avoir misé ou relancé sur la river qui montre en premier ; si personne n'a misé à la river, c'est le premier joueur encore en jeu à gauche du bouton. Pour gagner le pot, il faut montrer ses deux cartes.",
          "Et surtout : « les cartes parlent ». Votre main vaut ce qu'elle vaut, quoi que vous annonciez. Imaginez que vous n'ayez pas remarqué votre couleur : révélez l'abattage.",
        ],
        visual: {
          kind: 'showdown',
          board: ['9d', '8d', '7s', '2c', 'Kd'],
          players: [
            { label: 'Vous', cards: ['Ad', '4d'], result: 'Couleur à l’As' },
            { label: 'Adversaire', cards: ['Kh', 'Ks'], result: 'Brelan de Rois' },
          ],
          winner: 0,
          note: "Avec trois carreaux au tableau, l'As et le 4 de carreau forment une couleur, qui bat le brelan. Ne jetez jamais vos cartes sans les avoir vérifiées : montrez-les et laissez le croupier lire les mains.",
        },
      },
      {
        title: 'Un joueur par main',
        paragraphs: [
          'Quand vous êtes couché, vous ne participez plus au coup. Commenter, conseiller ou réagir à une carte peut influencer les joueurs encore en jeu et fausser la partie.',
          'Que faites-vous dans cette situation ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Vous vous êtes couché. Deux joueurs sont encore en jeu. Vous aviez jeté un cœur et vous voyez trois cœurs arriver au tableau.',
          options: [
            { label: 'Signaler à voix haute que la couleur est possible', correct: false, feedback: "À proscrire : vous donnez une information aux joueurs encore en jeu. C'est une faute d'étiquette, voire une infraction aux règles." },
            { label: 'Rester silencieux jusqu’à la fin du coup', correct: true, feedback: 'Oui : un seul joueur par main. Vous pourrez en parler, avec tact, une fois le coup terminé.' },
            { label: 'Montrer la carte que vous avez jetée', correct: false, feedback: "Montrer une carte couchée pendant le coup donne une information aux joueurs en jeu : c'est interdit." },
          ],
        },
      },
      {
        title: 'En ligne aussi, des règles',
        paragraphs: [
          "Le jeu en ligne a ses propres usages. Il n'y a pas de croupier à qui parler, mais les règles de respect et d'équité s'appliquent tout autant.",
          'Vérifiez vos habitudes.',
        ],
        visual: {
          kind: 'checklist',
          title: 'Bonnes pratiques en ligne',
          items: [
            'Je joue à un rythme raisonnable et n’utilise pas mon temps de réflexion pour faire attendre',
            'Je reste poli dans la messagerie de la table, ou je la désactive',
            'Je n’utilise qu’un seul compte, que je ne prête à personne',
            'Je ne partage jamais d’informations sur mes cartes avec un autre joueur (c’est de la collusion)',
            'Je n’utilise aucun logiciel d’aide à la décision interdit par le règlement',
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Votre adversaire mise 100. Vous posez sans rien dire un seul jeton de 500. Que se passe-t-il ?',
        options: ['C’est une relance à 500', 'C’est un paiement de 100', 'C’est une relance à 200', 'Le coup est annulé'],
        answer: 1,
        explanation: "Un jeton unique plus gros que la mise, posé sans annonce, compte comme un paiement. Pour relancer, il faut l'annoncer.",
      },
      {
        question: 'Il y a eu une mise à la river, et elle a été payée. Qui montre ses cartes en premier ?',
        options: ['Celui qui a payé', 'Celui qui a misé en dernier à la river', 'Le bouton', 'Le croupier décide au hasard'],
        answer: 1,
        explanation: "Le dernier joueur à avoir misé ou relancé sur la dernière rue montre en premier. Sans mise à la river, c'est le premier joueur encore en jeu à gauche du bouton.",
      },
      {
        question: 'Pourquoi agir avant son tour est-il un problème ?',
        options: [
          'Parce que cela ralentit le jeu',
          'Parce que cela donne une information injuste aux joueurs qui doivent parler avant vous',
          'Parce que c’est interdit seulement en ligne',
          'Ce n’est pas un problème',
        ],
        answer: 1,
        explanation: 'Les joueurs qui devaient parler avant vous connaissent alors votre intention, ce qui fausse leur décision.',
      },
      {
        question: 'Vous êtes couché. Pouvez-vous commenter la main en cours ?',
        options: [
          'Oui, librement',
          'Non : un seul joueur par main, on attend la fin du coup',
          'Oui, mais seulement à voix basse',
          'Oui, si vous connaissez bien les joueurs',
        ],
        answer: 1,
        explanation: 'Tout commentaire pendant le coup peut influencer les joueurs encore en jeu. On attend que la main soit terminée.',
      },
      {
        question: 'À votre tour, vous dites clairement « relance ». Pouvez-vous ensuite simplement payer ?',
        options: [
          'Oui, tant que vous n’avez pas posé de jetons',
          'Non, une annonce verbale faite à votre tour vous engage',
          'Oui, si l’adversaire est d’accord',
          'Oui, à condition de le dire rapidement',
        ],
        answer: 1,
        explanation: 'En live, une annonce claire faite à son tour est définitive : vous devez relancer, au moins du minimum autorisé.',
      },
    ],
  },

  // 15 ---------------------------------------------------------------------------
  {
    slug: 'bankroll-debutant',
    title: 'Bankroll et jeu responsable pour débuter',
    summary: 'Définir une réserve dédiée, choisir des enjeux prudents, accepter la variance et reconnaître les signes d’alerte.',
    level: 'debutant',
    levelLabel: 'Débutant',
    order: 15,
    duration: 11,
    cover: ['Kh', 'Kc'],
    steps: [
      {
        title: 'Commencer sans argent',
        paragraphs: [
          "Vous n'avez pas besoin de jouer de l'argent pour apprendre. Les parties entre amis avec des jetons sans valeur, les tables gratuites et les exercices de ce site suffisent largement pour vos premiers mois.",
          "Si un jour vous décidez de jouer de l'argent (ce qui est réservé aux personnes majeures), quelques notions protègent votre budget. Dévoilez-les.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'La bankroll', text: "De l'anglais, « réserve de jeu » : la somme réservée au poker, séparée de votre budget courant, et dont la perte ne changerait rien à votre quotidien." },
            { term: 'La cave', text: "Le montant avec lequel on s'assoit à une table de cash game (« buy-in »), généralement 100 grosses blindes." },
            { term: "Le droit d'entrée", text: "Le prix d'inscription à un tournoi, fixé à l'avance. On ne peut pas perdre davantage dans ce tournoi, sauf recave." },
            { term: 'La limite', text: "Le niveau d'enjeux d'une table ou d'un tournoi. Choisir sa limite en fonction de sa réserve, c'est le cœur de la gestion de bankroll." },
          ],
        },
      },
      {
        title: 'La variance : même bien joué, on perd',
        paragraphs: [
          'Au poker, le hasard pèse lourd à court terme. Un joueur qui prend de bonnes décisions peut perdre pendant des semaines, et un joueur faible gagner une soirée.',
          "Les courbes ci-dessous, fictives, montrent des parcours très différents pour un même niveau de jeu. C'est pour absorber ces écarts qu'on garde une réserve bien plus grande que l'enjeu d'une partie.",
        ],
        visual: { kind: 'variance' },
      },
      {
        title: 'Un repère prudent pour les tournois',
        paragraphs: [
          "Repère souvent cité : ne pas engager plus de 1 % de votre réserve dans un seul tournoi, soit au moins 100 droits d'entrée d'avance.",
          "Saisissez une somme pour voir le droit d'entrée correspondant. Ce sont des garde-fous, jamais une garantie : même ainsi, une réserve peut fondre.",
        ],
        visual: { kind: 'bankroll', reserve: 200 },
      },
      {
        title: 'Et pour le cash game ?',
        paragraphs: [
          "En cash game, les écarts sont un peu moins violents qu'en tournoi. Un repère prudent pour débuter : au moins 30 à 40 caves pour la limite jouée.",
          'Appliquez ce repère : votre réserve est de 400 € et vous visez 40 caves.',
        ],
        visual: {
          kind: 'decision',
          situation: 'Réserve dédiée de 400 €. Repère choisi : 40 caves. Quelle cave maximale pouvez-vous prendre ?',
          options: [
            { label: '4 €', correct: false, feedback: "C'est le repère des tournois (1 %). En cash game, avec 40 caves, la cave maximale est de 400 ÷ 40." },
            { label: '10 €', correct: true, feedback: "Exact : 400 ÷ 40 = 10 €. Soit des tables où une cave de 100 grosses blindes vaut 10 €, avec une grosse blinde de 0,10 €." },
            { label: '40 €', correct: false, feedback: 'Ce serait seulement 10 caves : quelques mauvaises séances suffiraient à vider la réserve.' },
            { label: '100 €', correct: false, feedback: 'Une cave représenterait le quart de la réserve : beaucoup trop risqué.' },
          ],
        },
      },
      {
        title: 'Des règles à fixer à l’avance',
        paragraphs: [
          'Les bonnes décisions de gestion se prennent à froid, avant de jouer, et non pendant une séance difficile.',
          'Cochez les règles que vous vous engagez à respecter.',
        ],
        visual: {
          kind: 'checklist',
          title: 'Mes règles de jeu',
          items: [
            'Je fixe un budget mensuel et je ne le dépasse jamais',
            'Je redescends de limite si ma réserve passe sous mon seuil',
            'Je ne renfloue jamais la réserve avec l’argent du quotidien',
            'Je fixe une durée de séance et je m’y tiens',
            'J’utilise les outils de limitation de dépôts et de temps de jeu proposés par les sites agréés',
          ],
        },
      },
      {
        title: 'Reconnaître les signes d’alerte',
        paragraphs: [
          'Le jeu doit rester un loisir. Certains signes doivent alerter, quel que soit votre niveau ou votre expérience.',
          "Soyez honnête avec vous-même. Si l'un de ces signes vous parle, Joueurs Info Service répond au 09 74 75 13 13 (appel non surtaxé), 7 jours sur 7.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Ces derniers temps, il m’arrive de…',
          items: [
            'Jouer plus longtemps ou plus cher que prévu',
            'Rejouer aussitôt pour « me refaire » après une perte',
            'Penser au jeu pendant le travail, les études ou en famille',
            'Jouer pour oublier mes soucis ou mon stress',
            'Emprunter de l’argent ou cacher mes pertes à mes proches',
          ],
          alert: {
            threshold: 1,
            message: "Un seul de ces signes mérite déjà votre attention. Faites une pause et parlez-en : Joueurs Info Service vous écoute gratuitement et anonymement au 09 74 75 13 13 (appel non surtaxé).",
          },
        },
      },
      {
        title: 'Par où commencer ?',
        paragraphs: [
          'Vous connaissez maintenant les bases du jeu. Reste à choisir comment pratiquer sans mettre votre budget en danger.',
          'Quelle est la démarche la plus sage ?',
        ],
        visual: {
          kind: 'decision',
          situation: 'Vous débutez et ne connaissez pas encore votre niveau réel. Comment pratiquer ?',
          options: [
            { label: 'Jouer gratuitement ou entre amis, puis, éventuellement, à très petits enjeux avec un budget fixe', correct: true, feedback: "C'est la démarche la plus sage : vous progressez sans pression financière, et si vous jouez de l'argent un jour, c'est dans un cadre que vous maîtrisez." },
            { label: 'Commencer à des enjeux élevés pour apprendre plus vite', correct: false, feedback: "Les enjeux élevés n'accélèrent pas l'apprentissage : ils ajoutent du stress et exposent à de grosses pertes face à des joueurs expérimentés." },
            { label: 'Utiliser une partie de son épargne pour avoir une grosse réserve', correct: false, feedback: "Non : la réserve de jeu ne doit contenir que de l'argent dont vous pouvez vous passer, jamais votre épargne." },
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Avec une réserve de 200 € réservée aux tournois, quel droit d’entrée maximal donne le repère prudent de 1 % ?',
        options: ['2 €', '10 €', '20 €', '50 €'],
        answer: 0,
        explanation: "1 % de 200 € = 2 €, soit 100 droits d'entrée d'avance. C'est un garde-fou contre la variance, sans garantie de résultat.",
      },
      {
        question: 'Pourquoi garder une réserve bien plus grande que l’enjeu d’une partie ?',
        options: [
          'Pour pouvoir jouer plus cher dès que possible',
          'Pour absorber les séries de pertes dues à la variance',
          'Parce que les règles l’imposent',
          'Pour impressionner les autres joueurs',
        ],
        answer: 1,
        explanation: "Même un bon joueur traverse de longues séries négatives. Une réserve large évite qu'une mauvaise passe ne vide tout votre budget.",
      },
      {
        question: 'Vous venez de perdre une grosse somme. Quel est le bon réflexe ?',
        options: [
          'Rejouer immédiatement pour vous refaire',
          'Monter de limite pour récupérer plus vite',
          'Arrêter la séance et faire une pause',
          'Emprunter pour reconstituer la réserve',
        ],
        answer: 2,
        explanation: "Chercher à « se refaire » est l'un des signaux d'alerte les plus classiques. S'arrêter permet de reprendre ses décisions à froid.",
      },
      {
        question: 'Lequel de ces comportements est un signe d’alerte ?',
        options: [
          'Fixer un budget mensuel',
          'Faire des pauses régulières',
          'Emprunter de l’argent pour jouer',
          'Jouer gratuitement entre amis',
        ],
        answer: 2,
        explanation: 'Emprunter pour jouer est un signal sérieux. Dans ce cas, parlez-en : Joueurs Info Service répond au 09 74 75 13 13 (appel non surtaxé).',
      },
      {
        question: 'Comment joindre Joueurs Info Service ?',
        options: [
          'Au 09 74 75 13 13, appel non surtaxé',
          'Uniquement par courrier postal',
          "Il n'existe pas de service d'aide dédié",
          'Uniquement via un site de jeu',
        ],
        answer: 0,
        explanation: 'Joueurs Info Service est joignable au 09 74 75 13 13, appel non surtaxé, 7 jours sur 7, de manière anonyme.',
      },
    ],
  },
];
