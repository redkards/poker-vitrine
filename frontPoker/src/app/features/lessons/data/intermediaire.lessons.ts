import type { Lesson, CardCode } from '../lessons.data';

/*
 * Niveau Intermédiaire — leçons 3 à 15.
 * Contenu original Poker Winners : connaissances générales du Texas Hold'em No-Limit,
 * exemples de mains et formulations propres. Les repères chiffrés sont des ordres de grandeur.
 */

/** Main d'exemple de la leçon « Méthode pour analyser une main après coup » */
const ANALYSE_BOARD: CardCode[] = ['Qc', '9h', '5s', '8h', '2d'];
/** Tableau de la leçon sur la river (mise de valeur fine) */
const RIVER_VALUE_BOARD: CardCode[] = ['Js', '8c', '4d', '2h', '2c'];

/** Leçons du niveau (rédigées en complément des leçons fondatrices de lessons.data.ts) */
export const INTERMEDIAIRE_LESSONS: Lesson[] = [
  // 3 ----------------------------------------------------------------------------
  {
    slug: 'ranges-par-position',
    title: "Construire ses ranges d'ouverture par position",
    summary: "Raisonner en fourchettes de mains, et ouvrir plus ou moins large selon le nombre de joueurs qui parlent après vous.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 3,
    duration: 14,
    cover: ['As', 'Ts'],
    steps: [
      {
        title: 'Penser en fourchettes plutôt qu’en mains',
        paragraphs: [
          "Un joueur régulier ne se demande pas seulement « est-ce que je joue cette main ? », mais « quelles mains est-ce que j'ouvre depuis cette place ? ». Cet ensemble de mains s'appelle une fourchette, ou « range » en anglais.",
          "Raisonner ainsi vous rend plus cohérent et plus difficile à lire : vos adversaires ne savent pas quelle main précise vous tenez, seulement la famille de mains que vous représentez. Pour construire une range, il faut d'abord savoir compter les combinaisons. Dévoilez chaque notion.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Range (fourchette)', text: "L'ensemble des mains qu'un joueur joue d'une certaine manière dans une situation donnée : par exemple, toutes les mains qu'il ouvre au cut-off." },
            { term: 'Paire servie : 6 combinaisons', text: "Avec quatre 8 dans le paquet, on peut former 6 paires de 8 différentes (pique-cœur, pique-carreau, etc.)." },
            { term: 'Main assortie : 4 combinaisons', text: "As-Roi assorti n'existe qu'en quatre exemplaires, un par couleur. On le note « AKs » (s pour « suited », assorti)." },
            { term: 'Main dépareillée : 12 combinaisons', text: "As-Roi dépareillé (« AKo », o pour « offsuit ») : 4 × 4 = 16 associations possibles, moins les 4 assorties, soit 12. As-Roi au total représente donc 16 combinaisons." },
            { term: 'La notation « + »', text: "« 77+ » signifie 7-7 et toutes les paires supérieures ; « ATs+ » désigne A-10, A-V, A-D et A-R assortis. C'est une écriture abrégée très courante." },
          ],
        },
      },
      {
        title: 'Pourquoi ouvrir plus large en fin de parole',
        paragraphs: [
          "Sous le pistolet (UTG), cinq joueurs parlent encore derrière vous à une table de six. Plus il reste de joueurs, plus il est probable que l'un d'eux ait une très bonne main, et vous serez souvent hors de position après le flop.",
          "Au cut-off (CO) et au bouton (BTN), il ne reste que deux ou trois adversaires, et le bouton est assuré de parler en dernier après le flop. Vous pouvez donc ouvrir beaucoup plus de mains : elles affrontent moins de joueurs et se jouent avec l'avantage de la position.",
          "Touchez les places mises en valeur pour revoir leur rôle.",
        ],
        visual: { kind: 'positions', highlight: ['CO', 'BTN'], selected: 'CO' },
      },
      {
        title: 'Des repères par position',
        paragraphs: [
          "Voici des ordres de grandeur pour une table à 6 joueurs, avec des tapis d'environ 100 grosses blindes et personne d'entré avant vous. Ce ne sont pas des tableaux exacts : ils servent de point de départ que vous ajusterez à vos adversaires.",
          "Remarquez la logique : chaque position reprend toute la range de la position précédente et y ajoute de nouvelles mains. On commence par les paires et les cartes hautes, puis on ajoute les mains assorties, enfin les mains dépareillées plus faibles.",
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            {
              title: 'Sous le pistolet (≈ 15 à 18 %)',
              description: "Paires moyennes et hautes, As assortis forts, As-Valet et mieux dépareillés, figures assorties et quelques connecteurs assortis hauts.",
              hands: [['7s', '7d'], ['Ah', 'Th'], ['Kd', 'Qd'], ['Ac', 'Jd'], ['Ks', 'Js'], ['Tc', '9c']],
            },
            {
              title: 'Cut-off (≈ 25 à 30 %)',
              description: "On ajoute toutes les petites paires, les As assortis faibles, davantage de figures dépareillées et de connecteurs assortis.",
              hands: [['2c', '2h'], ['As', '4s'], ['Kc', 'Td'], ['Qh', 'Jc'], ['9s', '8s'], ['Jh', '9h']],
            },
            {
              title: 'Bouton (≈ 40 à 50 %)',
              description: "La range la plus large : presque tous les As, beaucoup de Rois et de Dames assortis, des cartes moyennes dépareillées qui se suivent.",
              hands: [['Ad', '3c'], ['Kh', '5h'], ['Qc', '8c'], ['Ts', '8h'], ['6d', '5d'], ['Qs', '9d']],
            },
          ],
        },
      },
      {
        title: 'Même main, place différente (1)',
        paragraphs: [
          "As-4 dépareillé a l'air attirant à cause de l'As. Mais quand il est payé ou relancé par une range forte, il est souvent dominé par un As avec un meilleur kicker.",
          "Mettez-vous en première position.",
        ],
        visual: {
          kind: 'decision',
          situation: "Table à 6, tapis de 100 BB. Vous êtes sous le pistolet, premier à parler avant le flop.",
          hero: ['Ac', '4d'],
          options: [
            { label: 'Relancer à 2,5 BB', correct: false, feedback: "Trop large pour cette place : cinq joueurs parlent derrière vous, et ceux qui continueront auront souvent un As plus fort ou une paire." },
            { label: 'Suivre la grosse blinde', correct: false, feedback: "Le limp cumule les défauts : main faible, pas d'initiative, et de nombreux joueurs encore à parler." },
            { label: 'Se coucher', correct: true, feedback: "Exactement : As-4 dépareillé ne fait pas partie d'une range d'ouverture solide sous le pistolet à 6 joueurs." },
          ],
        },
      },
      {
        title: 'Même main, place différente (2)',
        paragraphs: [
          "Reprenons exactement la même main, mais cette fois tout le monde s'est couché jusqu'à vous, au bouton. Seules la petite et la grosse blinde peuvent encore vous résister, et vous aurez la position sur elles après le flop.",
          "La main n'a pas changé ; c'est le contexte qui change sa valeur.",
        ],
        visual: {
          kind: 'decision',
          situation: "Table à 6, tapis de 100 BB. Tout le monde s'est couché jusqu'à vous, au bouton.",
          hero: ['Ac', '4d'],
          options: [
            { label: 'Relancer à environ 2,5 BB', correct: true, feedback: "Oui : au bouton, As-4 dépareillé est une ouverture standard. Les blindes se couchent souvent, et vous jouerez en position quand elles paient." },
            { label: 'Suivre seulement', correct: false, feedback: "En suivant, vous renoncez à gagner les blindes tout de suite. Si la main mérite d'être jouée, relancez." },
            { label: 'Se coucher par prudence', correct: false, feedback: "Trop serré : face à deux joueurs seulement, et avec la position, cette main gagne de l'argent en ouverture." },
          ],
        },
      },
      {
        title: 'Adapter sa grille à la table',
        paragraphs: [
          "Une range d'ouverture n'est pas un dogme. Elle s'élargit quand les joueurs derrière vous sont passifs, et se resserre quand ils relancent souvent.",
          "La taille d'ouverture reste en général stable : environ 2 à 2,5 grosses blindes en fin de parole, un peu plus depuis la petite blinde ou face à des joueurs qui paient beaucoup. Dévoilez les ajustements courants.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Blindes très passives', text: "Si les blindes se couchent souvent ou jouent mal après le flop, élargissez un peu vos ouvertures au cut-off et au bouton." },
            { term: 'Joueurs qui relancent beaucoup derrière', text: "Face à des adversaires qui sur-relancent souvent (le « 3-bet », vu dans la leçon suivante), retirez les mains les plus faibles de votre range : elles devraient trop souvent abandonner." },
            { term: 'Petite blinde', text: "Seule la grosse blinde reste à parler, mais vous serez hors de position après le flop. On ouvre assez large, souvent avec une relance un peu plus grosse (environ 3 BB)." },
            { term: 'Tapis courts', text: "Avec moins de 40 BB environ, les mains spéculatives (petites paires, connecteurs assortis) perdent de leur intérêt ; les cartes hautes en gagnent." },
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Combien de combinaisons existe-t-il pour une paire servie donnée, par exemple 8-8 ?',
        options: ['4', '6', '12', '16'],
        answer: 1,
        explanation: "Avec quatre 8 dans le paquet, on forme 4 × 3 ÷ 2 = 6 paires différentes.",
      },
      {
        question: 'Combien de combinaisons d’As-Roi (assortis et dépareillés confondus) existe-t-il ?',
        options: ['4', '12', '16', '24'],
        answer: 2,
        explanation: "4 As × 4 Rois = 16 combinaisons : 4 assorties et 12 dépareillées.",
      },
      {
        question: "Que désigne la notation « ATs+ » ?",
        options: [
          "As-10 assorti uniquement",
          "As-10, As-Valet, As-Dame et As-Roi assortis",
          "Tous les As accompagnés d'une carte de 10 ou plus, assortis ou non",
          "As-10 et toutes les paires supérieures",
        ],
        answer: 1,
        explanation: "Le « + » augmente la seconde carte jusqu'à la plus haute possible, ici le Roi ; le « s » limite aux mains assorties.",
      },
      {
        question: 'Pourquoi peut-on ouvrir beaucoup plus de mains au bouton que sous le pistolet ?',
        options: [
          "Parce que les cartes sont meilleures au bouton",
          "Parce qu'il reste moins d'adversaires à parler et que vous aurez la position après le flop",
          "Parce que le bouton paie moins de blindes",
          "Parce que la règle interdit de relancer sous le pistolet",
        ],
        answer: 1,
        explanation: "Moins de joueurs derrière vous signifie moins de risques de tomber sur une main forte, et la position vous avantage sur tous les tours suivants.",
      },
      {
        question: 'Les deux blindes de votre table se couchent très souvent face aux ouvertures. Quel ajustement est le plus logique ?',
        options: [
          'Resserrer toutes vos ranges',
          'Élargir un peu vos ouvertures au cut-off et au bouton',
          'Suivre la grosse blinde plutôt que relancer',
          'Ne rien changer, une range ne s’adapte jamais',
        ],
        answer: 1,
        explanation: "Chaque ouverture qui fait coucher les blindes rapporte immédiatement 1,5 BB : face à des blindes qui abandonnent trop, voler plus souvent est rentable.",
      },
    ],
  },

  // 4 ----------------------------------------------------------------------------
  {
    slug: 'le-3-bet',
    title: 'Le 3-bet : pour la valeur et en semi-bluff',
    summary: "Sur-relancer une ouverture avec vos meilleures mains et avec quelques mains choisies pour leurs qualités de bluff.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 4,
    duration: 15,
    cover: ['Qs', 'Qh'],
    steps: [
      {
        title: 'Le vocabulaire des relances',
        paragraphs: [
          "Avant le flop, la grosse blinde compte comme la première mise. L'ouverture d'un joueur (« open » en anglais) est donc la deuxième mise, et la relance qui suit s'appelle le « 3-bet » (troisième mise). Une nouvelle relance sur ce 3-bet est un « 4-bet ».",
          "Face à une ouverture, vous avez trois choix : vous coucher, payer, ou 3-bet. Bien utiliser le 3-bet est l'un des grands pas entre un jeu débutant et un jeu solide.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Ouverture (open)', text: "Première relance du tour préflop, par exemple 2,5 BB au cut-off quand personne n'est entré avant." },
            { term: '3-bet', text: "Sur-relance d'une ouverture. Exemple : le cut-off ouvre à 2,5 BB, le bouton relance à 7,5 BB." },
            { term: '4-bet', text: "Relance d'un 3-bet. À ce stade, les ranges sont en général très fortes, ou volontairement composées de quelques bluffs." },
            { term: 'Payer (call)', text: "Suivre l'ouverture sans relancer. On parle aussi de « flat call ». Plus intéressant en position qu'hors de position." },
            { term: 'Squeeze', text: "3-bet effectué après une ouverture ET un ou plusieurs paiements. Il met la pression sur l'ouvreur et sur ceux qui ont seulement payé." },
          ],
        },
      },
      {
        title: 'Deux raisons de faire un 3-bet',
        paragraphs: [
          "Pour la valeur : avec vos meilleures mains, vous voulez grossir le pot tant que des mains moins fortes peuvent payer. Contre une ouverture tardive, plus large, cette catégorie s'élargit (Valet-Valet, As-Dame assorti).",
          "En semi-bluff : avec des mains qui ne sont pas assez fortes pour la valeur, mais qui gardent de bonnes possibilités si l'on est payé (quintes, couleurs), vous gagnez souvent le pot immédiatement. Les autres mains jouables, on les paie ou on les jette. Parcourez les trois familles.",
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            {
              title: '3-bet pour la valeur',
              description: "Les paires hautes et As-Roi, plus Valet-Valet et quelques As forts face à une ouverture en fin de parole.",
              hands: [['Ad', 'Ac'], ['Kh', 'Ks'], ['Qd', 'Qc'], ['As', 'Kd'], ['Jh', 'Jd']],
            },
            {
              title: '3-bet en semi-bluff',
              description: "Des mains assorties qui ne craignent pas d'être payées : As faibles assortis, Rois assortis, connecteurs assortis.",
              hands: [['Ah', '5h'], ['Kc', '9c'], ['7s', '6s'], ['6d', '5d']],
            },
            {
              title: 'Plutôt payer (en position) ou se coucher',
              description: "Des mains solides mais qui jouent bien dans un pot plus petit : paires moyennes, figures assorties.",
              hands: [['9h', '9d'], ['8c', '8s'], ['Jc', 'Tc'], ['Qs', 'Js']],
            },
          ],
        },
      },
      {
        title: 'Les bloqueurs : pourquoi As-5 assorti ?',
        paragraphs: [
          "Tenir une carte réduit le nombre de combinaisons que l'adversaire peut avoir avec cette même carte : on dit qu'elle « bloque » ces mains. Un As en main rend moins probables les As et As-Roi adverses, donc les 4-bets pour la valeur.",
          "As-5 assorti cumule plusieurs qualités : il bloque les meilleures mains adverses, il peut toucher la couleur max et la quinte basse (A-2-3-4-5), et il n'a pas besoin d'être payé pour être rentable. Comparez les chiffres.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Sans As en main', text: "L'adversaire peut avoir 6 combinaisons d'As-As et 16 d'As-Roi." },
            { term: 'Avec un As en main', text: "Il ne reste que 3 combinaisons d'As-As (3 As restants pris deux à deux) et 12 d'As-Roi (3 As × 4 Rois). Les mains les plus fortes adverses deviennent nettement moins probables." },
            { term: 'Avec Roi-9 dépareillé', text: "Pas d'As bloqué, pas de couleur possible, et une main souvent dominée par les Rois meilleurs quand on est payé : un mauvais candidat au bluff." },
          ],
        },
      },
      {
        title: 'Une taille de 3-bet cohérente',
        paragraphs: [
          "Un repère courant : en position, faites un 3-bet d'environ 3 fois l'ouverture ; hors de position, environ 4 fois, car vous jouerez le reste du coup avec un désavantage. Si un joueur a déjà payé l'ouverture, ajoutez à peu près une ouverture de plus.",
          "Utilisez la même taille avec vos mains de valeur et vos semi-bluffs : sinon, la taille trahit votre main.",
        ],
        visual: {
          kind: 'decision',
          situation: "Tapis de 100 BB. Le cut-off ouvre à 2,5 BB. Vous êtes au bouton.",
          hero: ['Kh', 'Kd'],
          options: [
            { label: 'Payer 2,5 BB', correct: false, feedback: "Payer avec Roi-Roi laisse les blindes entrer à bon prix et garde le pot petit avec l'une des meilleures mains possibles. Il faut grossir le pot." },
            { label: '3-bet à environ 7,5 BB', correct: true, feedback: "C'est le choix standard : environ trois fois l'ouverture en position. Vous êtes payé par de nombreuses mains moins fortes et vous isolez l'ouvreur." },
            { label: 'Partir à tapis (100 BB)', correct: false, feedback: "Beaucoup trop gros : seules les mains qui vous battent ou font presque jeu égal (As-As, parfois As-Roi) paieront. Vous perdez toute la valeur des mains moyennes." },
          ],
        },
      },
      {
        title: 'Le semi-bluff en pratique',
        paragraphs: [
          "Depuis la petite blinde, payer une ouverture est souvent inconfortable : vous serez hors de position, et la grosse blinde peut encore relancer derrière vous. Beaucoup de joueurs solides y préfèrent une stratégie « 3-bet ou se coucher ».",
          "Mettez-vous en situation avec une main typique de semi-bluff.",
        ],
        visual: {
          kind: 'decision',
          situation: "Tapis de 100 BB. Le bouton ouvre à 2,5 BB. Vous êtes à la petite blinde ; la grosse blinde parle après vous.",
          hero: ['As', '5s'],
          options: [
            { label: 'Payer', correct: false, feedback: "Payer vous laisse hors de position, avec la grosse blinde derrière qui peut relancer. Votre main joue mal dans ce scénario." },
            { label: '3-bet à environ 10-11 BB', correct: true, feedback: "Bon choix : votre As bloque les meilleures mains adverses, vous gagnez souvent le pot tout de suite, et si vous êtes payé, la main garde de belles possibilités." },
            { label: 'Se coucher', correct: false, feedback: "Ce n'est pas une catastrophe, mais As-5 assorti est l'une des meilleures mains pour un 3-bet en semi-bluff face à une ouverture au bouton." },
          ],
        },
      },
      {
        title: 'Avant de cliquer sur « relancer »',
        paragraphs: [
          "Un 3-bet se prépare : savoir pourquoi vous le faites, et ce que vous ferez face à un 4-bet, évite les décisions improvisées. Avec un semi-bluff, la réponse au 4-bet est en général de vous coucher ; avec une main de valeur, de continuer.",
          "Passez en revue ces questions avant chaque 3-bet.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Ma vérification avant un 3-bet',
          items: [
            "Depuis quelle position l'adversaire a-t-il ouvert ? Sa range est-elle large ou serrée ?",
            'Ma main est-elle un 3-bet de valeur ou un semi-bluff ?',
            'Ma taille est-elle la même avec mes deux types de mains ?',
            'Que ferai-je si l’adversaire relance à nouveau (4-bet) ?',
            'Serai-je en position ou hors de position après le flop ?',
          ],
        },
      },
    ],
    quiz: [
      {
        question: "Que désigne un « 3-bet » avant le flop ?",
        options: [
          "La troisième mise du coup, c'est-à-dire la sur-relance d'une ouverture",
          'Une mise de trois grosses blindes',
          'Le troisième joueur à payer',
          'Une relance faite au troisième tour d’enchères',
        ],
        answer: 0,
        explanation: "La grosse blinde compte comme première mise, l'ouverture comme deuxième : la relance suivante est la troisième, d'où « 3-bet ».",
      },
      {
        question: 'Le cut-off ouvre à 2,5 BB et vous êtes au bouton. Quelle taille de 3-bet est la plus cohérente ?',
        options: ['5 BB', 'Environ 7,5 à 8 BB', '15 BB', '25 BB'],
        answer: 1,
        explanation: "En position, un 3-bet vaut en général environ trois fois l'ouverture : 2,5 × 3 = 7,5 BB.",
      },
      {
        question: 'Si vous tenez un As, combien de combinaisons d’As-As votre adversaire peut-il encore avoir ?',
        options: ['1', '3', '4', '6'],
        answer: 1,
        explanation: "Il ne reste que 3 As dans le paquet ; on peut en former 3 paires (3 × 2 ÷ 2).",
      },
      {
        question: 'Pourquoi As-5 assorti est-il un meilleur 3-bet en semi-bluff que Roi-9 dépareillé ?',
        options: [
          'Parce qu’As-5 assorti est toujours la meilleure main',
          'Parce qu’il bloque les As adverses et peut toucher couleur ou quinte quand il est payé',
          'Parce que Roi-9 dépareillé gagne plus souvent à l’abattage',
          'Parce que les bluffs doivent toujours contenir un 5',
        ],
        answer: 1,
        explanation: "As-5 assorti réduit les combinaisons d'As-As et d'As-Roi adverses, et garde un vrai potentiel (couleur max, quinte basse) quand il est payé.",
      },
      {
        question: 'Vous avez fait un 3-bet en semi-bluff avec 7-6 assorti et l’adversaire vous relance (4-bet). Quelle est la réaction la plus courante ?',
        options: ['Partir à tapis', 'Payer pour voir le flop', 'Se coucher', 'Relancer au minimum'],
        answer: 2,
        explanation: "Face à un 4-bet, la range adverse est très forte. Un semi-bluff a rempli son rôle s'il a souvent fait coucher l'ouvreur ; quand ce n'est pas le cas, on abandonne en général.",
      },
    ],
  },

  // 5 ----------------------------------------------------------------------------
  {
    slug: 'position-et-initiative',
    title: "Jouer en position et hors de position, l'initiative",
    summary: "Comprendre ce que rapporte le fait de parler en dernier, et pourquoi le dernier relanceur préflop garde un avantage.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 5,
    duration: 13,
    cover: ['Kc', 'Jc'],
    steps: [
      {
        title: 'Une position toujours relative',
        paragraphs: [
          "Être « en position », c'est parler après son adversaire sur les tours du flop, de la turn et de la river. C'est une notion relative : le cut-off est en position face à la grosse blinde, mais hors de position face au bouton.",
          "Le bouton est la seule place assurée d'être en position sur tous ses adversaires après le flop. Les blindes sont, au contraire, presque toujours hors de position.",
        ],
        visual: { kind: 'positions', highlight: ['BTN', 'CO'], selected: 'BTN' },
      },
      {
        title: 'Ce que la position rapporte',
        paragraphs: [
          "Parler en dernier, c'est décider en connaissant déjà l'action de l'adversaire sur ce tour. Ce petit avantage se répète à chaque tour d'enchères et finit par peser lourd.",
          "Dévoilez les quatre bénéfices principaux.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: "L'information", text: "Un check adverse indique souvent une main moyenne ou faible ; une mise vous renseigne aussi. Vous agissez avec un coup d'avance." },
            { term: 'Le contrôle du pot', text: "Avec une main moyenne, vous pouvez checker derrière pour voir la carte suivante gratuitement et garder le pot petit." },
            { term: "Réaliser son équité", text: "L'équité est votre part du pot « en moyenne ». Hors de position, on est souvent poussé à se coucher avant l'abattage et on n'en récupère qu'une partie ; en position, on la réalise beaucoup mieux." },
            { term: 'Le dernier mot à la river', text: "Vous voyez si l'adversaire mise ou checke avant de choisir entre miser pour la valeur, bluffer ou montrer vos cartes." },
          ],
        },
      },
      {
        title: "L'initiative : l'avantage du relanceur",
        paragraphs: [
          "Le joueur qui a fait la dernière relance préflop a « l'initiative ». Sa range contient les mains les plus fortes (As-As, Roi-Roi, As-Roi), tandis que celui qui a seulement payé les aurait souvent relancées : sa range est dite « plafonnée », c'est-à-dire privée de ses meilleures mains.",
          "Exemple : vous ouvrez au bouton, la grosse blinde paie. Le flop R♠ 7♦ 2♣ favorise nettement votre range : vous avez bien plus de Rois forts et de paires hautes qu'elle. Même avec As-Dame sans paire, une petite mise est crédible et fait coucher beaucoup de mains.",
        ],
        visual: { kind: 'table', hero: ['Ah', 'Qh'], board: ['Ks', '7d', '2c', '9h', '4s'], revealed: 3 },
      },
      {
        title: 'Hors de position face à une mise',
        paragraphs: [
          "Vous avez payé l'ouverture du bouton (2,5 BB) depuis la grosse blinde ; la petite blinde s'est couchée. Le pot fait 5,5 BB. Au flop, vous checkez et le bouton mise 2 BB.",
          "Pour payer, vous mettez 2 BB pour un pot final de 9,5 BB : il vous faut environ 2 ÷ 9,5 ≈ 21 % d'équité. Avec un tirage quinte par les deux bouts (un 7 ou une Dame), vous avez 8 outs, soit environ 31,5 % de toucher d'ici la river.",
        ],
        visual: {
          kind: 'decision',
          situation: "Grosse blinde contre le bouton, 100 BB de tapis. Pot de 5,5 BB, vous avez checké et le bouton mise 2 BB.",
          hero: ['Jh', 'Th'],
          board: ['9c', '8d', '2s'],
          options: [
            { label: 'Se coucher', correct: false, feedback: "Trop prudent : le prix demandé (environ 21 %) est faible et votre tirage par les deux bouts, plus vos deux cartes hautes, vous donnent largement de quoi continuer." },
            { label: 'Payer', correct: true, feedback: "Oui : le prix est bon, votre tirage est solide et vous pourrez encore gagner gros si une Dame ou un 7 tombe. Une relance (check-raise) serait aussi envisageable, mais payer est un choix sain." },
            { label: 'Partir à tapis (environ 97 BB)', correct: false, feedback: "Beaucoup trop gros pour un pot de 7,5 BB : vous ne ferez coucher que les mains faibles et risquez tout votre tapis contre les mains fortes." },
          ],
        },
      },
      {
        title: 'Hors de position : simplifier',
        paragraphs: [
          "Hors de position, on ne peut pas tout jouer. Les bonnes habitudes consistent à entrer dans moins de coups, et à jouer de façon plus directe ceux que l'on joue.",
          "Dévoilez les principes clés.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Resserrer avant le flop', text: "Les mains moyennes qui seraient rentables en position deviennent marginales hors de position : retirez les plus faibles." },
            { term: "Checker souvent vers l'agresseur", text: "Quand l'adversaire a l'initiative, le laisser miser est souvent plus simple que de miser dans sa direction." },
            { term: 'Le check-raise', text: "Checker puis relancer la mise adverse. C'est l'arme principale du joueur hors de position, avec ses mains fortes comme avec ses meilleurs tirages." },
            { term: 'Garder les pots petits', text: "Avec une main moyenne, évitez de gonfler le pot : vous aurez du mal à savoir où vous en êtes sur les tours suivants." },
          ],
        },
      },
      {
        title: 'Votre routine de position',
        paragraphs: [
          "Avant chaque coup, demandez-vous qui aura la position après le flop et qui aura l'initiative. Ces deux questions orientent déjà la plupart de vos décisions.",
          "Cochez-les à chaque main jouée.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Position et initiative',
          items: [
            'Serai-je en position ou hors de position après le flop ?',
            "Qui a fait la dernière relance préflop, donc qui a l'initiative ?",
            "Le flop favorise-t-il plutôt la range du relanceur ou celle du payeur ?",
            "Hors de position, ma main mérite-t-elle d'être jouée, ou vaut-il mieux l'abandonner ?",
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Le cut-off et la grosse blinde voient le flop ensemble. Qui est en position ?',
        options: ['La grosse blinde', 'Le cut-off', 'Celui qui a le plus gros tapis', 'Personne, cela dépend des cartes'],
        answer: 1,
        explanation: "Après le flop, la parole commence à gauche du bouton : la grosse blinde parle avant le cut-off, qui est donc en position.",
      },
      {
        question: "Que désigne « l'initiative » ?",
        options: [
          'Le fait de parler en premier',
          'Le fait d’avoir fait la dernière relance du tour précédent',
          'Le plus gros tapis de la table',
          'Le droit de montrer ses cartes en premier',
        ],
        answer: 1,
        explanation: "Le dernier relanceur préflop a l'initiative : sa range contient les mains fortes, ce qui rend ses mises crédibles au flop.",
      },
      {
        question: 'Pourquoi dit-on que la range d’un joueur qui a seulement payé une ouverture est « plafonnée » ?',
        options: [
          'Parce qu’il ne peut plus miser',
          'Parce qu’il aurait souvent relancé avec ses meilleures mains, qui manquent donc à sa range',
          'Parce qu’il a un tapis limité',
          'Parce qu’il ne peut jouer que des paires',
        ],
        answer: 1,
        explanation: "Avec As-As ou Roi-Roi, on fait en général un 3-bet. Une range qui paie contient donc peu de ces mains : elle a un « plafond ».",
      },
      {
        question: 'Le pot fait 5,5 BB et l’adversaire mise 2 BB. Quelle équité minimale vous faut-il pour payer ?',
        options: ['Environ 15 %', 'Environ 21 %', 'Environ 27 %', 'Environ 33 %'],
        answer: 1,
        explanation: "Vous payez 2 pour un pot final de 5,5 + 2 + 2 = 9,5 : 2 ÷ 9,5 ≈ 21 %.",
      },
      {
        question: 'Hors de position avec une main moyenne, quelle approche est généralement la plus saine ?',
        options: [
          'Miser gros pour savoir où vous en êtes',
          'Garder le pot petit et éviter de le gonfler',
          'Relancer à chaque tour',
          'Partir à tapis pour mettre la pression',
        ],
        answer: 1,
        explanation: "Une main moyenne gagne surtout de petits pots. Hors de position, la gonfler vous expose à des décisions difficiles sur les tours suivants.",
      },
    ],
  },

  // 6 ----------------------------------------------------------------------------
  {
    slug: 'continuation-bet',
    title: 'Le continuation bet : quand miser après le flop',
    summary: "Miser de nouveau au flop après avoir relancé avant : quand c'est rentable, quand il vaut mieux s'abstenir, et quelle taille choisir.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 6,
    duration: 14,
    cover: ['Ah', 'Kd'],
    steps: [
      {
        title: "Qu'est-ce qu'un continuation bet ?",
        paragraphs: [
          "Le « continuation bet », abrégé « c-bet », est la mise faite au flop par le joueur qui avait relancé avant le flop. Il « continue » l'histoire d'une main forte, qu'il ait touché le tableau ou non.",
          "Il fonctionne parce que le flop rate souvent : une main non appariée ne touche une paire ou mieux au flop qu'environ une fois sur trois (≈ 32 %). Dévoilez le vocabulaire associé.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'C-bet', text: "Mise au flop du dernier relanceur préflop. Elle exploite l'initiative et le fait que l'adversaire a souvent raté le flop." },
            { term: 'Check derrière', text: "Renoncer au c-bet en position. Utile avec une main moyenne qui veut voir la turn gratuitement, ou sur un tableau défavorable." },
            { term: 'Second barrel', text: "Miser de nouveau à la turn après un c-bet payé. On le réserve aux bonnes cartes de turn et aux mains qui ont de la valeur ou du potentiel." },
            { term: 'Bluff pur et semi-bluff', text: "Un bluff pur n'a presque aucune chance de gagner s'il est payé ; un semi-bluff peut encore s'améliorer (tirage, cartes hautes)." },
          ],
        },
      },
      {
        title: 'Les facteurs qui décident',
        paragraphs: [
          "Un c-bet systématique est facile à exploiter : un adversaire attentif finira par relancer ou par payer plus souvent. La bonne question n'est pas « ai-je relancé avant ? », mais « cette mise a-t-elle de bonnes raisons de réussir ? ».",
          "Voici les critères à passer en revue.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Faut-il faire un c-bet ?',
          items: [
            "Combien d'adversaires ? Un seul, c'est l'idéal ; à trois ou plus, beaucoup moins.",
            'Le tableau favorise-t-il ma range de relanceur ou celle du payeur ?',
            'Suis-je en position ou hors de position ?',
            'Si je suis payé, ma main garde-t-elle des chances de gagner ?',
            "L'adversaire se couche-t-il souvent au flop, ou paie-t-il tout ?",
          ],
        },
      },
      {
        title: 'Un c-bet évident',
        paragraphs: [
          "Vous ouvrez au cut-off, la grosse blinde paie. Le flop R♠ 8♦ 3♣ est sec : peu de tirages, et la grosse blinde, qui aurait souvent relancé avec ses meilleurs Rois, a rarement touché fort.",
          "Vous n'avez pas de paire, mais un As ou une Dame à venir peut encore vous donner la meilleure main. Que faites-vous quand la grosse blinde checke ?",
        ],
        visual: {
          kind: 'decision',
          situation: "Cut-off contre grosse blinde, pot de 5,5 BB. La grosse blinde checke.",
          hero: ['Ad', 'Qc'],
          board: ['Ks', '8d', '3c'],
          options: [
            { label: 'Miser environ 2 BB (un tiers du pot)', correct: true, feedback: "Oui : ce tableau favorise votre range, une petite mise fait coucher beaucoup de mains et ne coûte pas cher quand elle échoue." },
            { label: 'Checker derrière', correct: false, feedback: "Ce n'est pas une faute grave, mais vous laissez passer une situation idéale : un seul adversaire, un tableau sec qui vous favorise." },
            { label: 'Miser 12 BB (plus de deux fois le pot)', correct: false, feedback: "Beaucoup trop gros : vous risquez 12 BB pour en gagner 5,5, alors qu'une petite mise obtient presque autant d'abandons." },
          ],
        },
      },
      {
        title: 'Savoir renoncer',
        paragraphs: [
          "Changez maintenant le décor : vous ouvrez sous le pistolet, le bouton et la grosse blinde paient. Le flop 9♥ 8♥ 7♠ est très coordonné et correspond parfaitement aux mains qui paient : connecteurs, paires moyennes, tirages à cœur.",
          "Face à deux adversaires, la probabilité que l'un d'eux ait touché quelque chose est très élevée. Avec As-Roi sans paire ni tirage, que faites-vous ?",
        ],
        visual: {
          kind: 'decision',
          situation: "Pot à trois joueurs. Vous avez ouvert sous le pistolet ; la grosse blinde checke, le bouton parle après vous.",
          hero: ['Ac', 'Kd'],
          board: ['9h', '8h', '7s'],
          options: [
            { label: 'C-bet de la moitié du pot', correct: false, feedback: "Contre deux joueurs sur ce tableau, votre mise sera payée ou relancée très souvent, et votre main a peu de chances de s'améliorer suffisamment." },
            { label: 'Checker', correct: true, feedback: "C'est la décision raisonnable : ce tableau favorise les ranges adverses. Checker limite les pertes avec une main qui n'a ni paire ni vrai tirage." },
            { label: 'Partir à tapis', correct: false, feedback: "Vous ne seriez payé que par les mains qui vous battent ou ont beaucoup d'équité : c'est une mise qui perd beaucoup en moyenne." },
          ],
        },
      },
      {
        title: 'La turn : continuer ou pas ?',
        paragraphs: [
          "Vous avez misé petit sur le flop 10♥ 6♣ 2♠ avec Dame-Valet de cœur (deux cartes hautes et des possibilités de couleur et de quinte par la porte arrière), et vous avez été payé.",
          "La turn A♦ est une bonne carte pour un second barrel : elle favorise votre range de relanceur, qui contient beaucoup plus d'As, et elle vous donne un tirage ventral au Roi (A-R-D-V-10), soit 4 outs ≈ 8,7 % sur la river. Une carte qui aide le payeur (un 7 ou un 5, par exemple) incite au contraire à ralentir.",
        ],
        visual: { kind: 'table', hero: ['Qh', 'Jh'], board: ['Th', '6c', '2s', 'Ad', '8h'], revealed: 4 },
      },
      {
        title: 'Quelle taille choisir ?',
        paragraphs: [
          "Sur un tableau sec qui vous favorise, une petite mise (un quart à un tiers du pot) suffit : elle est rentable même avec une partie de votre range sans valeur. Sur un tableau coordonné, les mains adverses ont plus d'équité : misez plus gros, mais moins souvent.",
          "Dévoilez les repères.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Tableau sec, un adversaire', text: "Petite mise, environ 25 à 33 % du pot, avec une grande partie de votre range." },
            { term: 'Tableau coordonné', text: "Mise plus grosse, environ 50 à 75 % du pot, plutôt réservée aux mains fortes et aux bons tirages." },
            { term: 'Plusieurs adversaires', text: "C-bet beaucoup moins fréquent, avec des mains qui ont réellement de la valeur." },
            { term: 'Tableau qui favorise le payeur', text: "Checker souvent, y compris avec certaines bonnes mains, pour ne pas jouer un gros pot dans de mauvaises conditions." },
          ],
        },
      },
    ],
    quiz: [
      {
        question: "Qu'est-ce qu'un continuation bet (c-bet) ?",
        options: [
          'Une mise faite à la river par le joueur en position',
          'Une mise faite au flop par le dernier relanceur préflop',
          "Le paiement d'une mise au flop",
          "Une relance faite après avoir checké",
        ],
        answer: 1,
        explanation: "Le c-bet prolonge l'initiative prise avant le flop : c'est le relanceur préflop qui mise de nouveau au flop.",
      },
      {
        question: 'Avec deux cartes non appariées, à quelle fréquence touche-t-on au moins une paire au flop ?',
        options: ['Environ 10 %', 'Environ 32 %', 'Environ 50 %', 'Environ 70 %'],
        answer: 1,
        explanation: "Environ une fois sur trois. Le reste du temps, la main n'a rien touché, ce qui explique l'efficacité des c-bets.",
      },
      {
        question: 'Vous misez 2 BB dans un pot de 6 BB avec une main sans valeur. Quelle fréquence d’abandon adverse rend ce bluff immédiatement rentable ?',
        options: ['25 %', '33 %', '50 %', '75 %'],
        answer: 0,
        explanation: "Vous risquez 2 pour gagner 6 : il faut réussir 2 ÷ (2 + 6) = 25 % du temps pour être à l'équilibre.",
      },
      {
        question: 'Vous avez ouvert sous le pistolet, deux joueurs ont payé. Flop 9♥ 8♥ 7♠, vous avez As-Roi dépareillé. Quelle option est la plus raisonnable ?',
        options: ['Miser gros', 'Checker', 'Partir à tapis', 'Miser au minimum'],
        answer: 1,
        explanation: "Plusieurs adversaires et un tableau qui correspond à leurs ranges : un c-bet réussirait trop rarement. Checker est plus sain.",
      },
      {
        question: 'Sur un flop sec comme R♠ 8♦ 3♣, face à un seul adversaire, quelle taille de c-bet est la plus courante ?',
        options: ['Environ un tiers du pot', 'Deux fois le pot', 'Tapis', 'Exactement le pot'],
        answer: 0,
        explanation: "Sur un tableau sec qui favorise le relanceur, une petite mise suffit à faire coucher beaucoup de mains et coûte peu quand elle échoue.",
      },
    ],
  },

  // 7 ----------------------------------------------------------------------------
  {
    slug: 'textures-de-tableau',
    title: 'Textures de tableau : sec, coordonné, apparié',
    summary: "Lire un flop en un coup d'œil : quels tirages il permet, quelle range il favorise et comment adapter vos mises.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 7,
    duration: 14,
    cover: ['9h', '8h'],
    steps: [
      {
        title: 'Les grandes familles de tableaux',
        paragraphs: [
          "La « texture » d'un tableau décrit à quel point ses cartes se relient entre elles : cartes proches qui permettent des quintes, cartes de même couleur, cartes appariées.",
          "Plus un tableau est relié, plus les mains changent de valeur d'une carte à l'autre. Dévoilez chaque famille.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Sec', text: "Cartes éloignées et de couleurs différentes, comme R♠ 7♦ 2♣. Peu de tirages : la main en tête au flop le reste souvent." },
            { term: 'Coordonné', text: "Cartes proches, souvent avec deux cartes de la même couleur, comme 9♥ 8♥ 6♣. Beaucoup de tirages et de mains qui progressent." },
            { term: 'Apparié', text: "Deux cartes de même valeur, comme 8♠ 8♦ 3♥. Peu de combinaisons touchent fort ce tableau." },
            { term: 'Monotone', text: "Trois cartes de la même couleur, comme D♦ 9♦ 4♦. Une couleur est peut-être déjà faite." },
            { term: 'Deux couleurs', text: "Deux cartes de la même couleur au flop : un tirage couleur est possible pour l'adversaire." },
          ],
        },
      },
      {
        title: 'Des exemples à reconnaître',
        paragraphs: [
          "Entraînez votre œil : parcourez les familles et, pour chaque tableau, demandez-vous quelles mains l'ont bien touché.",
          "Sur les tableaux secs, ce sont surtout les paires hautes et les cartes hautes ; sur les tableaux coordonnés, les cartes moyennes assorties ou qui se suivent.",
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            { title: 'Secs', description: 'Cartes éloignées, couleurs différentes : peu de tirages.', hands: [['Ks', '7d', '2c'], ['Ah', '8s', '3d'], ['Qc', '6h', '2s']] },
            { title: 'Coordonnés', description: 'Cartes proches, tirages quinte et couleur nombreux.', hands: [['9h', '8h', '6c'], ['Js', 'Ts', '8d'], ['7c', '6d', '5c']] },
            { title: 'Appariés', description: 'Une paire au tableau : peu de mains ont touché fort.', hands: [['4s', '4h', 'Kh'], ['Td', 'Tc', '3h'], ['5h', '5s', 'Jc']] },
            { title: 'Monotones', description: 'Trois cartes de la même couleur.', hands: [['Qd', '9d', '4d'], ['Jh', '7h', '2h'], ['Kc', '9c', '3c']] },
          ],
        },
      },
      {
        title: 'Le tableau sec',
        paragraphs: [
          "Sur un flop comme R♥ 7♦ 2♣, peu de cartes à venir peuvent renverser la situation. Le relanceur préflop y a l'avantage : il détient plus de Rois forts et de paires hautes.",
          "Comme l'adversaire a rarement de quoi continuer, une petite mise fréquente est efficace, y compris avec vos meilleures mains : elles craignent peu de cartes et gagnent à être payées par des mains moyennes.",
        ],
        visual: {
          kind: 'decision',
          situation: "Vous avez ouvert au bouton, la grosse blinde a payé et checke. Pot de 5,5 BB.",
          hero: ['As', 'Kd'],
          board: ['Kh', '7d', '2c'],
          options: [
            { label: 'Petite mise (environ un tiers du pot)', correct: true, feedback: "Oui : avec la paire de Rois et le meilleur kicker, vous voulez être payé par les Rois plus faibles, les 7 et certaines paires. Une petite mise le permet." },
            { label: 'Partir à tapis', correct: false, feedback: "Seules les mains qui vous battent (brelans) paieraient : vous gaspillez une main de valeur." },
            { label: 'Checker puis se coucher face à une mise', correct: false, feedback: "Vous avez l'une des meilleures mains possibles sur ce tableau : la jeter serait une erreur majeure." },
          ],
        },
      },
      {
        title: 'Le tableau coordonné',
        paragraphs: [
          "Sur V♥ 10♥ 8♦, même une paire d'As est vulnérable : de nombreuses mains ont des tirages quinte ou couleur. Il faut faire payer ces tirages, avec des mises plus grosses.",
          "Dévoilez la turn : avec le 9♣, le tableau V-10-9-8 offre une quinte à quiconque possède une seule Dame ou un seul 7. Dévoilez ensuite la river : un troisième cœur rend aussi la couleur possible.",
        ],
        visual: { kind: 'table', hero: ['As', 'Ac'], board: ['Jh', 'Th', '8d', '9c', '2h'], revealed: 3, interactive: true },
      },
      {
        title: 'Le tableau apparié',
        paragraphs: [
          "Sur 8♠ 8♦ 3♥, il ne reste que deux 8 dans le paquet : peu de mains contiennent un brelan. Le relanceur peut souvent miser petit, car l'adversaire a rarement touché fort.",
          "Quand deux joueurs ont le brelan, ce sont les kickers qui décident. Dévoilez l'abattage.",
        ],
        visual: {
          kind: 'showdown',
          board: ['8s', '8d', '3h', 'Kc', '6d'],
          players: [
            { label: 'Vous', cards: ['Ah', '8c'], result: 'Brelan de 8, kickers As et Roi' },
            { label: 'Adversaire', cards: ['8h', 'Ts'], result: 'Brelan de 8, kickers Roi et 10' },
          ],
          winner: 0,
          note: "Même brelan de 8 : on compare les deux cartes restantes. 8-8-8-A-R bat 8-8-8-R-10.",
        },
      },
      {
        title: 'Lire un tableau en quatre questions',
        paragraphs: [
          "Sur un flop monotone, une couleur est peut-être déjà faite et toute quatrième carte de la couleur change tout : on mise moins souvent, surtout sans carte de la couleur en main.",
          "Quelle que soit la texture, la même courte analyse s'applique. Faites-en un réflexe à chaque flop.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Ma lecture du flop',
          items: [
            'Le tableau est-il sec, coordonné, apparié ou monotone ?',
            'Quels tirages sont possibles, et combien de cartes à venir changent la situation ?',
            'Quelle range, la mienne ou celle de l’adversaire, a le plus de mains fortes ici ?',
            'En conséquence : miser petit, miser gros, ou checker ?',
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Comment qualifie-t-on le flop D♦ 9♦ 4♦ ?',
        options: ['Sec', 'Apparié', 'Monotone', 'Arc-en-ciel'],
        answer: 2,
        explanation: "Trois cartes de la même couleur forment un tableau monotone.",
      },
      {
        question: 'Lequel de ces flops est le plus coordonné ?',
        options: ['R♠ 7♦ 2♣', 'A♥ 8♠ 3♦', '9♥ 8♥ 6♣', 'R♣ R♥ 5♠'],
        answer: 2,
        explanation: "9-8-6 avec deux cœurs permet de nombreuses quintes et un tirage couleur : c'est le plus relié des quatre.",
      },
      {
        question: 'Le tableau est V♥ 10♥ 8♦ 9♣. Quelle carte suffit, seule, à donner une quinte à un adversaire ?',
        options: ['Une Dame ou un 7', 'Un As', 'Un Roi', 'Un 2'],
        answer: 0,
        explanation: "Avec V-10-9-8 au tableau, une Dame forme D-V-10-9-8 et un 7 forme V-10-9-8-7.",
      },
      {
        question: 'Tableau 8♠ 8♦ 3♥ R♣ 6♦. Vous avez A♥ 8♣, l’adversaire 8♥ 10♠. Qui gagne ?',
        options: ['Vous', "L'adversaire", 'Le pot est partagé', 'Celui qui a misé en dernier'],
        answer: 0,
        explanation: "Les deux joueurs ont un brelan de 8. Vos kickers As et Roi battent les kickers Roi et 10 de l'adversaire.",
      },
      {
        question: 'Sur un tableau sec qui favorise le relanceur préflop, quelle stratégie de c-bet est la plus courante ?',
        options: ['Miser petit et souvent', 'Miser très gros et rarement', 'Ne jamais miser', 'Toujours partir à tapis'],
        answer: 0,
        explanation: "Peu de cartes menacent la main en tête et l'adversaire a rarement touché : une petite mise fréquente suffit.",
      },
    ],
  },

  // 8 ----------------------------------------------------------------------------
  {
    slug: 'cotes-implicites',
    title: 'Cotes implicites et jeu des tirages',
    summary: "Compter ses outs, comparer ses chances au prix demandé, et tenir compte de ce que vous gagnerez ensuite quand le tirage rentre.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 8,
    duration: 16,
    cover: ['Ks', 'Js'],
    steps: [
      {
        title: 'Rappel : les cotes du pot',
        paragraphs: [
          "Avant de payer une mise, comparez ce que vous devez mettre à la taille du pot final. La formule : montant à payer ÷ (pot actuel, mise adverse comprise + montant à payer). Le résultat est l'équité minimale dont vous avez besoin.",
          "Si vos chances de gagner dépassent ce seuil, payer est rentable sur le long terme ; sinon, il faut une raison supplémentaire. Faites le calcul.",
        ],
        visual: {
          kind: 'decision',
          situation: "Le pot contient 150 jetons, mise adverse comprise, et vous devez payer 50 jetons. Quelle équité minimale vous faut-il ?",
          options: [
            { label: '25 %', correct: true, feedback: "Exact : 50 ÷ (150 + 50) = 50 ÷ 200 = 25 %. Il vous faut gagner au moins une fois sur quatre." },
            { label: '33 %', correct: false, feedback: "C'est le rapport 50 ÷ 150 : il oublie d'ajouter votre propre paiement au pot final. Le bon calcul est 50 ÷ 200." },
            { label: '50 %', correct: false, feedback: "Non : vous n'avez pas besoin d'être favori. Le pot vous offre 150 pour 50, il suffit de gagner 25 % du temps." },
          ],
        },
      },
      {
        title: 'Compter ses outs',
        paragraphs: [
          "Les « outs » sont les cartes qui vous donnent très probablement la meilleure main. Avec A♥ 10♥ sur R♥ 7♥ 2♣, il reste 9 cœurs : vous avez 9 outs pour la couleur max.",
          "Approximation : outs × 4 au flop pour deux cartes à venir (≈ 35 % en réalité pour 9 outs), outs × 2 pour une seule carte (≈ 19 à 20 % ; 19,6 % de la turn à la river). Dévoilez la turn et la river pour suivre la main.",
        ],
        visual: { kind: 'table', hero: ['Ah', 'Th'], board: ['Kh', '7h', '2c', '9s', '4d'], revealed: 3, interactive: true },
      },
      {
        title: 'Les tirages courants',
        paragraphs: [
          "Mémorisez ces quelques valeurs : elles couvrent la grande majorité des situations. La règle ×4 surestime les gros tirages (15 × 4 = 60 %, alors que la vraie valeur est d'environ 54 %).",
          "Attention aux outs « sales » : une carte qui complète votre tirage mais donne une meilleure main à l'adversaire ne compte pas vraiment.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Tirage couleur : 9 outs', text: "≈ 35 % du flop à la river, ≈ 19,6 % sur une seule carte (turn → river)." },
            { term: 'Quinte par les deux bouts : 8 outs', text: "≈ 31,5 % du flop à la river, ≈ 17,4 % sur une seule carte. Exemple : V-10 sur 9-8-2." },
            { term: 'Quinte ventrale : 4 outs', text: "≈ 16,5 % du flop à la river, ≈ 8,7 % sur une seule carte. Exemple : V-10 sur 8-7-2 (seul un 9 complète)." },
            { term: 'Couleur + quinte par les deux bouts : 15 outs', text: "≈ 54 % du flop à la river : vous êtes favori, même contre une paire haute." },
            { term: 'Deux cartes hautes : 6 outs', text: "≈ 24 % du flop à la river, mais ces outs sont rarement « propres » : une paire haute ne suffit pas toujours." },
          ],
        },
      },
      {
        title: 'Les cotes implicites',
        paragraphs: [
          "Les cotes du pot ne regardent que l'argent déjà présent. Les cotes implicites ajoutent ce que vous espérez gagner sur les tours suivants quand votre tirage rentre. Elles dépendent des tapis restants et de la capacité de l'adversaire à payer.",
          "Exemple : à la turn, pot de 10 BB, l'adversaire mise 5 BB. Il vous faut 5 ÷ 20 = 25 %, et votre tirage couleur n'a que 19,6 %. Mais si vous gagnez en moyenne environ 5,5 BB de plus à la river quand la couleur tombe, le paiement redevient rentable.",
        ],
        visual: {
          kind: 'decision',
          situation: "Turn, 90 BB de tapis effectif restant. Pot de 10 BB ; un adversaire qui paie volontiers avec une paire d'As mise 5 BB.",
          hero: ['Ks', 'Js'],
          board: ['As', '8s', '3d', '6c'],
          options: [
            { label: 'Se coucher : 19,6 % est inférieur à 25 %', correct: false, feedback: "Le calcul est juste, mais incomplet : avec 90 BB derrière et un adversaire qui paie, vous gagnerez bien plus que 5,5 BB en moyenne quand la couleur max rentre." },
            { label: 'Payer : les cotes implicites compensent', correct: true, feedback: "Oui : votre couleur au Roi serait la meilleure possible (l'As de pique est au tableau), les tapis sont profonds et l'adversaire paie volontiers : vous récupérerez le manque à la river." },
            { label: 'Payer : vous êtes favori', correct: false, feedback: "Non, vous n'êtes pas favori : vous gagnez environ une fois sur cinq. C'est le gain futur espéré qui justifie le paiement." },
          ],
        },
      },
      {
        title: 'Quand les cotes implicites fondent',
        paragraphs: [
          "Les cotes implicites ne sont pas un prétexte pour payer tous les tirages. Elles se réduisent fortement dans certaines situations.",
          "Dévoilez les cas les plus fréquents.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Tapis courts', text: "S'il ne reste presque rien à gagner derrière, seules les cotes du pot comptent." },
            { term: 'Tirage trop visible', text: "Quand la troisième carte d'une couleur tombe au tableau, un adversaire attentif ralentit avec sa paire : vous gagnez moins que prévu." },
            { term: 'Tirage qui n’est pas max', text: "Une petite couleur peut perdre contre une couleur supérieure : vous touchez… et perdez un gros pot." },
            { term: 'Cotes implicites inversées', text: "C'est ce dernier cas : quand votre main s'améliore mais reste battue, vous perdez davantage qu'en manquant votre tirage." },
          ],
        },
      },
      {
        title: 'Le cas des petites paires',
        paragraphs: [
          "Une paire servie touche un brelan ou mieux au flop environ une fois sur 8,5 (≈ 11,8 %). Payer une relance pour « chasser » le brelan n'est rentable que si vous pouvez gagner beaucoup quand il arrive.",
          "Un repère prudent : les tapis effectifs (le plus petit des deux tapis en jeu) devraient représenter au moins 15 à 20 fois le montant à payer. Pour payer 3 BB, comptez donc 45 à 60 BB au minimum. Faites varier la jauge.",
        ],
        visual: { kind: 'stack', bb: 60 },
      },
    ],
    quiz: [
      {
        question: 'Le pot contient 150 jetons (mise adverse comprise) et vous devez payer 50. Quelle équité minimale faut-il ?',
        options: ['20 %', '25 %', '33 %', '50 %'],
        answer: 1,
        explanation: "50 ÷ (150 + 50) = 25 %.",
      },
      {
        question: 'Au flop, avec un tirage couleur (9 outs), quelle est votre probabilité approximative de compléter d’ici la river ?',
        options: ['Environ 19 %', 'Environ 25 %', 'Environ 35 %', 'Environ 50 %'],
        answer: 2,
        explanation: "9 × 4 = 36 % selon l'approximation ; la valeur exacte est d'environ 35 %.",
      },
      {
        question: 'À la turn, avec un tirage quinte par les deux bouts, quelle est votre probabilité de compléter à la river ?',
        options: ['Environ 8,7 %', 'Environ 17,4 %', 'Environ 31,5 %', 'Environ 35 %'],
        answer: 1,
        explanation: "8 outs sur 46 cartes inconnues : 8 ÷ 46 ≈ 17,4 %.",
      },
      {
        question: 'Que désignent les cotes implicites ?',
        options: [
          'Les gains supplémentaires espérés sur les tours suivants si votre main s’améliore',
          'Le montant des blindes',
          'La probabilité de toucher un brelan',
          'La mise minimale autorisée',
        ],
        answer: 0,
        explanation: "Elles complètent les cotes du pot en tenant compte de ce que l'adversaire pourra encore payer quand votre tirage rentre.",
      },
      {
        question: 'Avec 3-3 et des tapis effectifs de 20 BB, faut-il payer une relance à 3 BB pour chercher un brelan ?',
        options: [
          'Oui, toujours',
          "Plutôt non : 20 BB ne représentent qu'environ 7 fois la relance, trop peu pour compenser les flops ratés",
          'Oui, car le brelan arrive une fois sur deux',
          'Cela ne dépend que de la couleur des cartes',
        ],
        answer: 1,
        explanation: "Le brelan n'arrive qu'environ une fois sur 8,5. Avec des tapis aussi courts, vous ne gagnerez pas assez quand il tombe.",
      },
    ],
  },

  // 9 ----------------------------------------------------------------------------
  {
    slug: 'tailles-de-mises-postflop',
    title: 'Choisir ses tailles de mises après le flop',
    summary: "Ce que chaque taille de mise offre à l'adversaire, quand miser petit ou gros, et comment planifier son tapis sur trois tours.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 9,
    duration: 15,
    cover: ['Jc', 'Jd'],
    steps: [
      {
        title: 'Ce que coûte et rapporte chaque taille',
        paragraphs: [
          "Chaque taille de mise envoie un prix à l'adversaire. Pour une mise M dans un pot P, il doit payer M pour un pot final de P + 2M : son équité requise vaut M ÷ (P + 2M). De votre côté, un bluff doit réussir M ÷ (P + M) du temps.",
          "Le complément de ce dernier chiffre, P ÷ (P + M), est la « fréquence minimale de défense » (MDF) : la part de sa range que l'adversaire doit continuer pour ne pas vous laisser bluffer avec profit. C'est un repère théorique, qui s'applique à toute une range, pas à une main isolée.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Un tiers du pot', text: "L'adversaire a besoin de 20 % d'équité pour payer. Votre bluff doit réussir 25 % du temps (MDF : 75 %)." },
            { term: 'La moitié du pot', text: "Équité requise : 25 %. Le bluff doit réussir 33 % du temps (MDF : 67 %)." },
            { term: 'Deux tiers du pot', text: "Équité requise : 28,6 %. Le bluff doit réussir 40 % du temps (MDF : 60 %)." },
            { term: 'Le pot', text: "Équité requise : 33 %. Le bluff doit réussir 50 % du temps (MDF : 50 %)." },
            { term: 'Deux fois le pot (overbet)', text: "Équité requise : 40 %. Le bluff doit réussir 67 % du temps (MDF : 33 %)." },
          ],
        },
      },
      {
        title: 'Miser petit sur un tableau sec',
        paragraphs: [
          "Sur un tableau sec, l'adversaire a peu de tirages : inutile de lui faire payer cher la carte suivante. Une petite mise vous permet de miser avec beaucoup de mains, fortes comme faibles, sans risquer gros.",
          "Vous avez ouvert au bouton, la grosse blinde a payé et checke. Le pot fait 5,5 BB.",
        ],
        visual: {
          kind: 'decision',
          situation: "Pot de 5,5 BB, la grosse blinde checke. Que misez-vous ?",
          hero: ['Qh', 'Qc'],
          board: ['9s', '5d', '2c'],
          options: [
            { label: 'Environ un tiers du pot (2 BB)', correct: true, feedback: "Oui : les mains qui peuvent payer (paires de 9, de 5, petites paires servies) sont nombreuses mais faibles ; une petite mise les garde dans le coup." },
            { label: 'Deux fois le pot (11 BB)', correct: false, feedback: "Une telle mise ne serait payée presque que par les brelans qui vous battent : toutes les mains moins fortes se coucheraient." },
            { label: 'Partir à tapis', correct: false, feedback: "Vous transformez une main de valeur en bluff : seules les mains meilleures paieront." },
          ],
        },
      },
      {
        title: 'Miser gros sur un tableau coordonné',
        paragraphs: [
          "Sur 10♥ 9♥ 4♣, une paire de Valets est souvent en tête, mais de nombreuses cartes peuvent la dépasser : tirages couleur, quintes, cartes hautes. Faites payer ces tirages.",
          "Une mise de deux tiers à trois quarts du pot leur offre un prix médiocre, tout en étant payée par de nombreuses mains moins fortes.",
        ],
        visual: {
          kind: 'decision',
          situation: "Vous avez ouvert au cut-off, la grosse blinde a payé et checke. Pot de 5,5 BB.",
          hero: ['Jc', 'Jd'],
          board: ['Th', '9h', '4c'],
          options: [
            { label: 'Un quart du pot', correct: false, feedback: "Trop petit : vous offrez un prix idéal à tous les tirages, qui ont souvent 30 % d'équité ou plus." },
            { label: 'Deux tiers à trois quarts du pot', correct: true, feedback: "Oui : vous faites payer cher les tirages et vous êtes payé par les paires de 10 et de 9. C'est une mise de valeur et de protection." },
            { label: 'Checker systématiquement', correct: false, feedback: "Vous laissez les tirages voir la turn gratuitement avec une main vulnérable : une occasion manquée." },
          ],
        },
      },
      {
        title: 'Ranges polarisées et ranges fusionnées',
        paragraphs: [
          "Les grosses mises vont de pair avec une range « polarisée » : très fortes mains et bluffs, sans grand-chose entre les deux. Les petites mises conviennent à une range « fusionnée » (ou linéaire), qui mise aussi des mains moyennes.",
          "Dévoilez les définitions.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Range polarisée', text: "Composée de mains très fortes et de bluffs. Une mise importante (pot ou plus) lui correspond : les mains fortes veulent un gros pot, les bluffs veulent faire coucher." },
            { term: 'Range fusionnée', text: "Composée de mains fortes et moyennes qui veulent toutes être payées par pire. Une mise petite ou moyenne lui correspond." },
            { term: 'Overbet', text: "Mise supérieure au pot. Efficace quand votre range contient des mains très fortes que l'adversaire ne peut presque jamais avoir (sa range est « plafonnée »)." },
          ],
        },
      },
      {
        title: 'Planifier son tapis sur trois tours',
        paragraphs: [
          "Le rapport tapis/pot (SPR, « stack-to-pot ratio ») divise le tapis effectif restant par le pot au flop. Plus il est faible, plus il est facile d'engager tout son tapis avec une bonne main.",
          "Exemple : pot de 10 BB au flop et 45 BB de tapis effectif (SPR de 4,5). Pour mettre tous les jetons au milieu d'ici la river avec une main très forte, il suffit de deux mises d'environ deux tiers du pot puis d'un tapis à la river. Dévoilez chaque tour.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Flop : mise de 7 BB', text: "Environ 70 % du pot de 10 BB. Après paiement, le pot passe à 24 BB et il reste 38 BB à chacun." },
            { term: 'Turn : mise de 16 BB', text: "Environ deux tiers du pot. Après paiement, le pot passe à 56 BB et il reste 22 BB à chacun." },
            { term: 'River : tapis de 22 BB', text: "Moins de la moitié du pot : une mise facile à payer pour l'adversaire, qui a déjà beaucoup investi." },
          ],
        },
      },
      {
        title: 'Choisir sa taille, à chaque fois',
        paragraphs: [
          "Évitez la taille « réflexe » identique dans toutes les situations, mais évitez aussi les tailles qui trahissent votre main (grosse avec les bluffs, petite avec les mains fortes, ou l'inverse). Pour une même texture, utilisez la même taille avec toute la partie de range qui mise.",
          "Gardez ces questions à l'esprit.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Choisir ma taille de mise',
          items: [
            'Le tableau est-il sec (petite mise) ou coordonné (mise plus grosse) ?',
            'Ma range qui mise est-elle polarisée ou fusionnée ?',
            'Quel prix j’offre aux tirages adverses ?',
            'Combien de tours restent pour engager mon tapis si je suis payé ?',
            'Ma taille serait-elle la même avec mes bluffs et mes mains de valeur ?',
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Pot de 9 BB, votre adversaire mise 6 BB. Quelle équité vous faut-il pour payer ?',
        options: ['20 %', '25 %', 'Environ 28,6 %', '40 %'],
        answer: 2,
        explanation: "6 ÷ (9 + 6 + 6) = 6 ÷ 21 ≈ 28,6 %.",
      },
      {
        question: 'Vous bluffez de la taille du pot. À quelle fréquence le bluff doit-il réussir pour être à l’équilibre ?',
        options: ['25 %', '33 %', '50 %', '67 %'],
        answer: 2,
        explanation: "Vous risquez M pour gagner un pot P égal à M : il faut réussir M ÷ (P + M) = 50 % du temps.",
      },
      {
        question: 'Face à une mise d’un tiers du pot, quelle est la fréquence minimale de défense (MDF) théorique ?',
        options: ['33 %', '50 %', '67 %', '75 %'],
        answer: 3,
        explanation: "MDF = P ÷ (P + M) = 1 ÷ (1 + 1/3) = 75 %. C'est un repère pour une range entière, pas une règle main par main.",
      },
      {
        question: 'Pot de 10 BB au flop, tapis effectif de 45 BB. Quel est le SPR ?',
        options: ['2,2', '4,5', '10', '45'],
        answer: 1,
        explanation: "SPR = tapis effectif ÷ pot = 45 ÷ 10 = 4,5.",
      },
      {
        question: 'Avec Valet-Valet sur 10♥ 9♥ 4♣, pourquoi préférer une mise plutôt grosse ?',
        options: [
          'Pour faire coucher les mains moins fortes',
          'Pour faire payer cher les nombreux tirages tout en étant payé par des paires plus faibles',
          'Parce que les grosses mises sont toujours meilleures',
          "Parce qu'une paire de Valets ne peut pas perdre",
        ],
        answer: 1,
        explanation: "Sur un tableau coordonné, votre main est vulnérable : une mise conséquente offre un mauvais prix aux tirages tout en gardant de la valeur.",
      },
    ],
  },

  // 10 ---------------------------------------------------------------------------
  {
    slug: 'jouer-la-river',
    title: 'La river : mise de valeur fine et paiement d’un bluff',
    summary: "Au dernier tour, chaque mise est soit pour la valeur, soit un bluff : apprenez à miser des mains moyennes et à payer au bon prix.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 10,
    duration: 15,
    cover: ['Ah', 'Jd'],
    steps: [
      {
        title: 'Un tour pas comme les autres',
        paragraphs: [
          "À la river, plus aucune carte ne viendra : il n'y a plus de tirage, chaque main est soit gagnante, soit perdante. Une mise ne peut donc servir qu'à deux choses : être payée par une main moins forte (valeur), ou faire coucher une main plus forte (bluff).",
          "Dévoilez le vocabulaire indispensable.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Mise de valeur (value bet)', text: "Mise faite pour être payée par des mains moins fortes que la vôtre." },
            { term: 'Mise de valeur fine (thin value)', text: "Mise de valeur avec une main moyenne : elle n'est payée que par une partie étroite de mains moins fortes, mais reste rentable." },
            { term: 'Bluff', text: "Mise faite avec une main qui perd presque toujours si elle est payée, pour faire coucher mieux." },
            { term: 'Bluff catcher', text: "Main qui ne bat que les bluffs adverses (« attrape-bluff ») : elle ne mise pas pour la valeur, mais peut payer une mise si l'adversaire bluffe assez souvent." },
          ],
        },
      },
      {
        title: 'La mise de valeur fine',
        paragraphs: [
          "La règle : misez pour la valeur si, quand vous êtes payé, vous êtes devant plus d'une fois sur deux. Peu importe que de nombreuses mains se couchent : seules comptent celles qui paient.",
          "Vous avez ouvert au bouton, la grosse blinde a payé. Elle a payé votre mise au flop, puis la turn a été checkée par les deux joueurs. À la river, elle checke de nouveau. Le tableau est V♠ 8♣ 4♦ 2♥ 2♣.",
        ],
        visual: {
          kind: 'decision',
          situation: "River. La grosse blinde, plutôt passive, checke. Le pot fait environ 10 BB.",
          hero: ['Ah', 'Jd'],
          board: RIVER_VALUE_BOARD,
          options: [
            { label: 'Miser environ la moitié du pot', correct: true, feedback: "Oui : les Valets plus faibles, les paires de 8 et certaines paires servies paient, alors que peu de mains vous battent. C'est une mise de valeur fine typique." },
            { label: 'Checker derrière', correct: false, feedback: "Vous ne perdrez pas grand-chose, mais vous renoncez à la valeur des nombreux Valets et 8 qui auraient payé." },
            { label: 'Partir à tapis', correct: false, feedback: "Seules les mains qui vous battent (fulls, brelans) paieraient une mise aussi grosse : la valeur disparaît." },
          ],
        },
      },
      {
        title: 'Qui paie, qui vous bat ?',
        paragraphs: [
          "Avec As-Valet sur V♠ 8♣ 4♦ 2♥ 2♣, votre main est une double paire Valets et 2 avec un kicker As. Classez les mains plausibles de l'adversaire en trois familles.",
          "Si, parmi les mains qui paient, la première famille est plus fournie que la deuxième, la mise est rentable.",
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            {
              title: 'Vous paient et perdent',
              description: "Valets avec un kicker plus faible, paires de 8, paires servies inférieures aux Valets.",
              hands: [['Kh', 'Jh'], ['Qc', 'Jc'], ['9d', '8d'], ['7h', '7c']],
            },
            {
              title: 'Vous battent',
              description: "Fulls (8-8, 4-4), brelans de 2 et la paire d'As servie : souvent jouées plus agressivement plus tôt, elles sont rares ici.",
              hands: [['8h', '8s'], ['4h', '4s'], ['Ad', '2d'], ['As', 'Ac']],
            },
            {
              title: 'Ne paieront pas',
              description: "Tirages manqués et cartes hautes : ils se couchent face à n'importe quelle mise.",
              hands: [['Qs', 'Ts'], ['6h', '5h'], ['Kd', 'Qd']],
            },
          ],
        },
      },
      {
        title: 'Payer avec un bluff catcher',
        paragraphs: [
          "Face à une mise à la river, comparez le prix aux chances que l'adversaire bluffe. Une mise de la moitié du pot exige 25 % d'équité ; une mise du pot, 33 %.",
          "Vous avez payé depuis la grosse blinde l'ouverture d'un joueur très agressif au bouton. Il a misé au flop et à la turn, vous avez payé deux fois. Le tableau est R♥ 9♠ 4♣ 2♦ 2♠, et il mise maintenant la moitié du pot.",
        ],
        visual: {
          kind: 'decision',
          situation: "River. Un adversaire agressif mise la moitié du pot. Il vous faut 25 % d'équité.",
          hero: ['Kc', 'Td'],
          board: ['Kh', '9s', '4c', '2d', '2s'],
          options: [
            { label: 'Payer', correct: true, feedback: "Oui : vous battez tous ses bluffs (Dame-Valet, Valet-10, cartes hautes manquées) et certaines mises de valeur plus faibles. Un joueur aussi agressif bluffe bien plus d'une fois sur quatre." },
            { label: 'Se coucher', correct: false, feedback: "Trop prudent face à ce profil : avec une paire de Rois, vous n'avez besoin d'avoir raison qu'une fois sur quatre." },
            { label: 'Relancer à tapis', correct: false, feedback: "Votre main est un bluff catcher : en relançant, vous faites coucher tous ses bluffs et n'êtes payé que par mieux." },
          ],
        },
      },
      {
        title: 'Choisir ses bluffs',
        paragraphs: [
          "Un bon bluff à la river se fait avec une main qui ne gagnerait presque jamais à l'abattage, et qui raconte une histoire cohérente avec vos mises précédentes.",
          "Dévoilez les critères.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Bon candidat', text: "Un tirage manqué sans valeur d'abattage : s'il ne mise pas, il perd presque à coup sûr." },
            { term: 'Mauvais candidat', text: "Une paire moyenne : elle gagne parfois en checkant, et une mise ne ferait coucher que des mains qu'elle bat déjà." },
            { term: 'Les bloqueurs', text: "Préférez bluffer avec des cartes qui rendent moins probables les mains adverses capables de payer." },
            { term: 'Une histoire cohérente', text: "Votre mise doit correspondre à une main forte que vous pourriez réellement avoir, vu vos actions aux tours précédents." },
          ],
        },
      },
      {
        title: 'Votre routine à la river',
        paragraphs: [
          "La river concentre souvent les plus gros pots : prenez le temps de raisonner, même brièvement.",
          "Appliquez cette routine à chaque décision importante.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Ma décision à la river',
          items: [
            "Quelles mains l'adversaire peut-il encore avoir, vu toute l'action ?",
            'Si je mise : qui me paie avec moins bien, qui me paie avec mieux ?',
            'Si je bluffe : ma main a-t-elle une valeur d’abattage à préserver ?',
            "Face à une mise : quelle équité le prix exige-t-il, et l'adversaire bluffe-t-il assez ?",
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Quand une mise de valeur à la river est-elle rentable ?',
        options: [
          'Quand votre main est la meilleure possible',
          'Quand, si vous êtes payé, vous êtes devant plus d’une fois sur deux',
          'Quand l’adversaire a checké',
          'Toujours, dès que vous avez une paire',
        ],
        answer: 1,
        explanation: "Seules comptent les mains qui paient : si la majorité d'entre elles sont moins fortes que la vôtre, la mise gagne de l'argent.",
      },
      {
        question: 'Face à une mise de la taille du pot à la river, quelle équité vous faut-il pour payer ?',
        options: ['25 %', '33 %', '50 %', '66 %'],
        answer: 1,
        explanation: "Vous payez M pour un pot final de 3M : M ÷ 3M ≈ 33 %.",
      },
      {
        question: 'Tableau V♠ 8♣ 4♦ 2♥ 2♣, vous avez A♥ V♦. Laquelle de ces mains vous bat ?',
        options: ['Roi-Valet', 'Dame-Valet', '8-8', '7-7'],
        answer: 2,
        explanation: "8-8 forme un full (8-8-8-2-2). Roi-Valet et Dame-Valet perdent au kicker, 7-7 forme une double paire inférieure.",
      },
      {
        question: 'Pourquoi une paire moyenne est-elle souvent un mauvais bluff à la river ?',
        options: [
          'Parce qu’elle gagne parfois à l’abattage et qu’une mise ne ferait coucher que des mains qu’elle bat déjà',
          'Parce qu’elle est toujours la meilleure main',
          'Parce que les règles interdisent de bluffer avec une paire',
          'Parce qu’elle fait toujours une couleur',
        ],
        answer: 0,
        explanation: "Bluffer avec une main qui a une valeur d'abattage transforme une main qui gagne parfois en mise qui ne fait coucher que des mains plus faibles.",
      },
      {
        question: "Qu'est-ce qu'un « bluff catcher » ?",
        options: [
          'Une main qui bluffe à chaque river',
          'Une main qui ne bat que les bluffs adverses et sert à payer, pas à miser',
          'La meilleure main possible',
          'Un tirage couleur',
        ],
        answer: 1,
        explanation: "Un bluff catcher ne gagne que contre les bluffs : il ne mise pas pour la valeur mais peut payer au bon prix contre un adversaire qui bluffe.",
      },
    ],
  },

  // 11 ---------------------------------------------------------------------------
  {
    slug: 'profils-adversaires',
    title: "Reconnaître les profils d'adversaires (serré/large, passif/agressif)",
    summary: "Classer rapidement vos adversaires selon deux axes simples, et adapter vos mises de valeur, vos bluffs et vos paiements.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 11,
    duration: 13,
    cover: ['Td', 'Tc'],
    steps: [
      {
        title: 'Deux axes, quatre profils',
        paragraphs: [
          "Le premier axe mesure le nombre de mains jouées : un joueur « serré » en joue peu, un joueur « large » beaucoup. Le second mesure la manière : un joueur « passif » suit et checke, un joueur « agressif » mise et relance.",
          "En croisant les deux, on obtient quatre profils types. Ce sont des simplifications utiles, pas des étiquettes définitives. Dévoilez-les.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Serré-agressif', text: "Joue peu de mains, mais les joue en relançant. Le profil des joueurs réguliers solides : respectez ses relances, attaquez-le moins souvent." },
            { term: 'Large-agressif', text: "Joue beaucoup de mains et mise souvent. Dangereux, mais il bluffe beaucoup : on le laisse miser et on paie plus souvent." },
            { term: 'Serré-passif', text: "Joue peu et suit plus qu'il ne relance. Quand il se met soudain à relancer, il a presque toujours une main très forte." },
            { term: 'Large-passif', text: "Joue beaucoup de mains et paie volontiers jusqu'à l'abattage. On le bluffe peu, mais on mise souvent pour la valeur contre lui." },
          ],
        },
      },
      {
        title: 'Ce qu’il faut observer',
        paragraphs: [
          "Les outils de suivi parlent de VPIP (part des mains où le joueur met volontairement de l'argent dans le pot) et de PFR (part des mains qu'il relance avant le flop). Un grand écart entre les deux signale un joueur passif.",
          "À une table réelle, quelques observations simples suffisent. Cochez celles que vous faites déjà.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Mes observations sur un adversaire',
          items: [
            'Voit-il souvent le flop, ou rarement ?',
            'Entre-t-il dans les coups en relançant, ou en suivant ?',
            'Quelles mains a-t-il montrées à l’abattage, et comment les avait-il jouées ?',
            'Mise-t-il presque toujours quand on checke vers lui ?',
            'Change-t-il de style après avoir perdu un gros pot ?',
          ],
        },
      },
      {
        title: 'Contre le joueur large-passif',
        paragraphs: [
          "Ce joueur paie trop souvent : c'est le profil le plus rentable, à condition de ne pas essayer de le bluffer. Miser pour la valeur, y compris avec des mains moyennes, rapporte beaucoup.",
          "À la river, vous avez manqué votre tirage. Il a payé au flop et à la turn et checke maintenant.",
        ],
        visual: {
          kind: 'decision',
          situation: "River contre un joueur large-passif qui paie très souvent. Il checke.",
          hero: ['7c', '6c'],
          board: ['Ah', 'Kd', '9s', '3h', '2c'],
          options: [
            { label: 'Bluffer de la taille du pot', correct: false, feedback: "Ce joueur paie avec n'importe quelle paire : votre bluff a peu de chances de réussir et coûte cher." },
            { label: 'Checker et abandonner le pot', correct: true, feedback: "C'est la décision la plus rentable contre ce profil : vous perdez le pot, mais vous ne gaspillez pas de jetons dans un bluff qui sera payé." },
            { label: 'Petite mise de bluff', correct: false, feedback: "Une petite mise est encore plus facile à payer pour lui. Contre ce profil, gardez vos jetons pour vos mains de valeur." },
          ],
        },
      },
      {
        title: 'Contre le joueur serré-passif',
        paragraphs: [
          "Ce joueur se couche souvent : vous pouvez lui voler ses blindes plus fréquemment. En revanche, quand il se met à relancer après le flop, il a presque toujours une main très forte.",
          "Vous avez une paire de Dames avec le kicker As. Il paie votre mise au flop, puis fait un check-raise important à la turn.",
        ],
        visual: {
          kind: 'decision',
          situation: "Turn contre un joueur très serré et passif, qui n'a pas relancé une seule fois depuis une heure. Il relance fortement votre mise.",
          hero: ['Ad', 'Qc'],
          board: ['Qh', '8s', '4d', 'Jc'],
          options: [
            { label: 'Payer pour voir', correct: false, feedback: "Contre ce profil, une relance à la turn représente presque toujours une double paire, un brelan ou une quinte (10-9). Payer vous coûte cher." },
            { label: 'Relancer à tapis', correct: false, feedback: "Vous ne serez payé que par des mains qui vous battent : c'est la pire option." },
            { label: 'Se coucher', correct: true, feedback: "Oui : contre ce profil précis, une paire, même très bonne, ne suffit plus. Contre un joueur agressif, la réponse serait différente." },
          ],
        },
      },
      {
        title: 'Contre le joueur large-agressif',
        paragraphs: [
          "Ce profil met une pression constante, mais sa range de mises contient beaucoup de bluffs. Le contrer demande du sang-froid plutôt que de l'agressivité.",
          "Dévoilez les ajustements les plus efficaces.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Le laisser miser', text: "Avec vos mains fortes, checkez plus souvent : il misera à votre place avec ses bluffs." },
            { term: 'Payer plus souvent', text: "Vos bluff catchers (paires moyennes, paires hautes avec kicker moyen) prennent de la valeur face à lui." },
            { term: 'Bluffer moins', text: "Il se couche peu et relance souvent : vos bluffs ont moins de chances de réussir." },
            { term: 'Choisir sa place', text: "Si possible, asseyez-vous à sa gauche : vous parlerez après lui et réagirez à ses mises." },
          ],
        },
      },
      {
        title: 'Les limites des étiquettes',
        paragraphs: [
          "Une étiquette posée après dix mains est souvent fausse. Commencez par une hypothèse, et révisez-la à chaque nouvelle information, notamment les mains montrées à l'abattage.",
          "Contre un joueur inconnu, jouez votre stratégie de base solide : vous ajusterez au fil des observations.",
        ],
        visual: {
          kind: 'checklist',
          title: "Avant d'exploiter un profil",
          items: [
            'Mon observation repose-t-elle sur suffisamment de mains ?',
            'Ai-je vu des mains à l’abattage qui la confirment ?',
            'Le joueur a-t-il pu changer de style (fatigue, gros gain, grosse perte) ?',
            'Mon ajustement reste-t-il raisonnable si je me trompe ?',
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Un joueur voit presque tous les flops mais ne relance presque jamais. Quel est son profil ?',
        options: ['Serré-agressif', 'Large-passif', 'Serré-passif', 'Large-agressif'],
        answer: 1,
        explanation: "Beaucoup de mains jouées (large), peu de relances (passif).",
      },
      {
        question: 'Contre un joueur large-passif, quel ajustement est le plus rentable ?',
        options: [
          'Bluffer plus souvent',
          'Miser plus souvent pour la valeur et bluffer moins',
          'Ne jamais miser',
          'Partir à tapis à chaque main',
        ],
        answer: 1,
        explanation: "Il paie trop : vos mises de valeur rapportent, vos bluffs échouent.",
      },
      {
        question: 'Un joueur serré-passif relance soudainement votre mise à la turn. Qu’en conclure le plus souvent ?',
        options: [
          'Qu’il bluffe',
          'Qu’il a très probablement une main très forte',
          'Qu’il veut voir la river gratuitement',
          'Rien, ses actions sont aléatoires',
        ],
        answer: 1,
        explanation: "Chez un joueur qui relance rarement, une relance après le flop correspond presque toujours à une main très forte.",
      },
      {
        question: 'Contre un joueur large-agressif, que deviennent vos mains moyennes du type « bluff catcher » ?',
        options: [
          'Elles perdent toute valeur',
          'Elles prennent de la valeur, car il bluffe souvent',
          'Elles doivent toujours relancer',
          'Il faut toujours les jeter',
        ],
        answer: 1,
        explanation: "Plus l'adversaire bluffe, plus une main qui ne bat que des bluffs devient rentable à payer.",
      },
      {
        question: 'Vous avez observé un joueur pendant une dizaine de mains seulement. Quelle attitude adopter ?',
        options: [
          'Lui attribuer une étiquette définitive',
          'Poser une hypothèse provisoire et rester sur une stratégie de base solide',
          'Le bluffer systématiquement',
          'Changer de table immédiatement',
        ],
        answer: 1,
        explanation: "Dix mains ne suffisent pas pour juger un style : partez d'une hypothèse et affinez-la au fil des observations.",
      },
    ],
  },

  // 12 ---------------------------------------------------------------------------
  {
    slug: 'defendre-la-grosse-blinde',
    title: 'Défendre sa grosse blinde',
    summary: "Profiter du prix avantageux offert à la grosse blinde, sans oublier le handicap de jouer hors de position.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 12,
    duration: 15,
    cover: ['9c', '7c'],
    steps: [
      {
        title: 'Un prix avantageux',
        paragraphs: [
          "En grosse blinde, vous avez déjà mis 1 BB dans le pot et vous parlez en dernier avant le flop : personne ne pourra relancer derrière vous. Face à une ouverture, le prix pour voir le flop est donc souvent très attractif.",
          "Exemple sans ante : le bouton ouvre à 2,5 BB, la petite blinde se couche. Le pot contient 0,5 + 1 + 2,5 = 4 BB ; vous payez 1,5 BB pour un pot final de 5,5 BB, soit environ 27 % d'équité requise. Dévoilez les autres tailles.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Ouverture à 2 BB', text: "Vous payez 1 BB pour un pot final de 4,5 BB : environ 22 % d'équité requise." },
            { term: 'Ouverture à 2,5 BB', text: "Vous payez 1,5 BB pour un pot final de 5,5 BB : environ 27 %." },
            { term: 'Ouverture à 3 BB', text: "Vous payez 2 BB pour un pot final de 6,5 BB : environ 31 %." },
            { term: 'Avec des antes', text: "Le pot est plus gros d'emblée : le prix devient encore plus favorable et la défense s'élargit." },
          ],
        },
      },
      {
        title: 'Le prix ne fait pas tout',
        paragraphs: [
          "Avoir 27 % d'équité contre la range adverse ne suffit pas : hors de position, vous ne réaliserez pas toute cette équité. Vous serez parfois contraint de vous coucher face à une mise alors que vous auriez gagné à l'abattage.",
          "C'est pourquoi les mains qui « jouent bien » (assorties, connectées, cartes hautes) se défendent mieux que les mains dépareillées et décousues, à équité égale.",
        ],
        visual: { kind: 'positions', highlight: ['BB'], selected: 'BB' },
      },
      {
        title: "Selon la position de l'ouvreur",
        paragraphs: [
          "Une ouverture au bouton couvre souvent 40 % des mains ou plus : vous pouvez défendre très large. Une ouverture sous le pistolet est bien plus forte : votre défense doit se resserrer nettement.",
          "Parcourez ces exemples, donnés à titre indicatif pour une ouverture à 2,5 BB à 6 joueurs.",
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            {
              title: 'À défendre contre le bouton',
              description: "Mains assorties, cartes hautes moyennes, As faibles : jouables face à une ouverture large.",
              hands: [['Kc', '7d'], ['Qs', '8h'], ['Td', '8d'], ['6s', '4s'], ['Ah', '3c'], ['Jc', '6c']],
            },
            {
              title: 'Même contre le bouton : se coucher',
              description: "Mains dépareillées, faibles et décousues : même au bon prix, elles réalisent trop peu de leur équité.",
              hands: [['8c', '2d'], ['7h', '3s'], ['Tc', '2h'], ['6h', '2c']],
            },
            {
              title: 'Contre une ouverture sous le pistolet',
              description: "Ces mains, défendables contre le bouton, sont le plus souvent à jeter face à une range d'ouverture précoce, bien plus forte.",
              hands: [['Kh', '9c'], ['Qd', 'Th'], ['As', '5d'], ['8s', '6d']],
            },
          ],
        },
      },
      {
        title: 'Une défense typique',
        paragraphs: [
          "Mettez-vous en situation. Le bouton, joueur régulier, ouvre à 2,5 BB ; la petite blinde se couche. Il vous faut environ 27 % d'équité, et votre main a de bonnes possibilités après le flop.",
        ],
        visual: {
          kind: 'decision',
          situation: "Tapis de 100 BB. Le bouton ouvre à 2,5 BB, la petite blinde se couche. Vous êtes en grosse blinde.",
          hero: ['9c', '7c'],
          options: [
            { label: 'Se coucher', correct: false, feedback: "Trop serré : 9-7 assorti a largement l'équité nécessaire contre une ouverture au bouton, et se joue bien après le flop." },
            { label: 'Payer', correct: true, feedback: "Oui : le prix est bon et la main touche des tirages et des paires jouables. C'est une défense standard." },
            { label: 'Partir à tapis (100 BB)', correct: false, feedback: "Démesuré : vous risquez 100 BB pour en gagner 4, et vous ne serez payé que par des mains qui vous dominent." },
          ],
        },
      },
      {
        title: 'Après le flop : ne pas abandonner trop vite',
        paragraphs: [
          "Le défenseur commet souvent la même erreur : se coucher face à chaque c-bet. Face à une mise d'un tiers du pot, la fréquence minimale de défense théorique est de 75 % : si vous abandonnez bien plus souvent, l'adversaire peut miser avec n'importe quelle main.",
          "Ici, avec 8-7 sur 9-6-2, vous avez un tirage quinte par les deux bouts (un 5 ou un 10) : 8 outs, environ 31,5 % d'ici la river. Face à une petite mise qui demande environ 20 %, vous continuez sans hésiter, en payant ou en relançant (check-raise).",
        ],
        visual: { kind: 'table', hero: ['8d', '7d'], board: ['9s', '6h', '2c', 'Kd', '4s'], revealed: 3 },
      },
      {
        title: 'Votre routine en grosse blinde',
        paragraphs: [
          "Défendre sa blinde est une source de petits gains réguliers, ou de pertes lentes si on le fait mal. Une courte vérification suffit.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Défendre ma grosse blinde',
          items: [
            "Depuis quelle position l'adversaire a-t-il ouvert ?",
            'Quel prix me fait-il (taille de l’ouverture, antes) ?',
            'Ma main joue-t-elle bien hors de position (assortie, connectée, cartes hautes) ?',
            'Faut-il plutôt relancer (3-bet) avec mes meilleures mains ?',
            'Après le flop, est-ce que je défends assez souvent face aux petites mises ?',
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Le bouton ouvre à 2,5 BB, la petite blinde se couche (sans ante). Quelle équité vous faut-il pour payer en grosse blinde ?',
        options: ['Environ 17 %', 'Environ 22 %', 'Environ 27 %', 'Environ 40 %'],
        answer: 2,
        explanation: "Vous payez 1,5 BB pour un pot final de 0,5 + 1 + 2,5 + 1,5 = 5,5 BB : 1,5 ÷ 5,5 ≈ 27 %.",
      },
      {
        question: 'Pourquoi défendre plus large contre une ouverture au bouton que contre une ouverture sous le pistolet ?',
        options: [
          'Parce que le bouton ouvre une range bien plus large, donc plus faible en moyenne',
          'Parce que le bouton mise toujours moins',
          'Parce que la grosse blinde parle en dernier après le flop',
          'Parce que les règles l’imposent',
        ],
        answer: 0,
        explanation: "Votre main a plus d'équité contre une range large. Contre une ouverture précoce, très serrée, beaucoup de mains sont dominées.",
      },
      {
        question: 'Pourquoi ne pas défendre toutes les mains qui ont 27 % d’équité contre la range adverse ?',
        options: [
          'Parce que l’équité est toujours mal calculée',
          'Parce que hors de position, on ne réalise pas toute son équité',
          'Parce que la grosse blinde ne peut pas payer',
          'Parce qu’il faut toujours relancer',
        ],
        answer: 1,
        explanation: "Hors de position, on est souvent poussé à abandonner avant l'abattage : les mains peu jouables réalisent bien moins que leur équité brute.",
      },
      {
        question: 'Face à un c-bet d’un tiers du pot, quelle est la fréquence minimale de défense théorique ?',
        options: ['25 %', '50 %', '67 %', '75 %'],
        answer: 3,
        explanation: "MDF = pot ÷ (pot + mise) = 1 ÷ (1 + 1/3) = 75 %. C'est un repère pour l'ensemble de votre range.",
      },
      {
        question: 'Vous avez 8♦ 7♦ sur le flop 9♠ 6♥ 2♣. Combien d’outs avez-vous pour la quinte ?',
        options: ['4', '6', '8', '9'],
        answer: 2,
        explanation: "Quatre 5 (5-6-7-8-9) et quatre 10 (6-7-8-9-10) : 8 outs, un tirage par les deux bouts.",
      },
    ],
  },

  // 13 ---------------------------------------------------------------------------
  {
    slug: 'tapis-courts',
    title: 'Jouer à tapis court : tapis ou se coucher (« push/fold »), bases',
    summary: "Sous une dizaine de grosses blindes, simplifier son jeu : partir à tapis au bon moment, et payer un tapis avec la bonne main.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 13,
    duration: 14,
    cover: ['5s', '5d'],
    steps: [
      {
        title: 'Quand le tapis devient court',
        paragraphs: [
          "Avec environ 10 à 12 grosses blindes ou moins, une relance classique de 2 à 2,5 BB engage déjà 20 % de votre tapis ou plus. Si un adversaire relance derrière, vous serez presque obligé de payer, souvent dans de mauvaises conditions.",
          "On adopte alors une stratégie « push/fold » : quand on entre dans le coup, c'est directement à tapis (« push ») ; sinon, on se couche (« fold »). Faites varier la jauge.",
        ],
        visual: { kind: 'stack', bb: 9 },
      },
      {
        title: 'Les notions clés',
        paragraphs: [
          "Partir à tapis en premier vous donne deux façons de gagner ; payer un tapis adverse ne vous en laisse qu'une. C'est toute la logique du jeu à tapis court.",
          "Dévoilez chaque notion.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Push/fold', text: "Stratégie où l'on choisit uniquement entre partir à tapis et se coucher, sans relance intermédiaire." },
            { term: 'Équité de fold (fold equity)', text: "La part de gains que vous apporte le fait que l'adversaire se couche. Elle n'existe que si vous misez ou relancez." },
            { term: 'Tapis effectif', text: "Le plus petit des tapis en jeu. Avec 8 BB face à un joueur qui en a 50, vous jouez un coup à 8 BB." },
            { term: 'Deux façons de gagner', text: "Tout le monde se couche et vous ramassez les blindes et antes ; ou vous êtes payé et vous gagnez l'abattage." },
          ],
        },
      },
      {
        title: 'La position compte encore plus',
        paragraphs: [
          "Plus il reste de joueurs derrière vous, plus il est probable que l'un d'eux ait une main assez forte pour payer. On pousse donc plus large en fin de parole qu'en début de parole.",
          "Depuis la petite blinde, quand tout le monde s'est couché, un seul adversaire peut payer : c'est là que l'on pousse le plus de mains.",
        ],
        visual: { kind: 'positions', highlight: ['CO', 'BTN', 'SB'], selected: 'SB' },
      },
      {
        title: 'Des repères prudents à 10 BB',
        paragraphs: [
          "Ces familles sont des ordres de grandeur pour un tapis d'environ 10 BB à 6 joueurs, quand personne n'est entré avant vous. Il existe des tableaux calculés, mais ils dépendent des tapis, des antes et du nombre de joueurs : ne les appliquez jamais à l'aveugle.",
          "Retenez surtout la logique : les paires, les As et les grosses figures presque partout ; davantage de mains en fin de parole ; les mains faibles et dépareillées jamais.",
        ],
        visual: {
          kind: 'handGroups',
          groups: [
            {
              title: 'Tapis depuis presque toutes les places',
              description: 'Paires moyennes et hautes, As forts, grosses figures.',
              hands: [['9s', '9d'], ['Ah', 'Jc'], ['Kd', 'Qd'], ['As', 'Td'], ['6c', '6h']],
            },
            {
              title: 'À ajouter en fin de parole',
              description: 'Au cut-off, au bouton et en petite blinde : petites paires, As faibles, figures moyennes, connecteurs assortis.',
              hands: [['5h', '5c'], ['Kc', '9h'], ['Qs', 'Th'], ['Ad', '4c'], ['Jh', '8h'], ['8c', '7c']],
            },
            {
              title: 'Se coucher, même au bouton',
              description: 'Cartes faibles, dépareillées et éloignées : trop peu d’équité quand elles sont payées.',
              hands: [['8d', '3c'], ['6d', '2c'], ['9c', '2s'], ['7h', '2d']],
            },
          ],
        },
      },
      {
        title: 'Pousser au bon moment',
        paragraphs: [
          "Vous êtes au cut-off avec 9 BB. Personne n'est entré dans le coup avant vous ; il reste le bouton et les deux blindes.",
        ],
        visual: {
          kind: 'decision',
          situation: "Tournoi, il vous reste 9 BB. Tout le monde s'est couché jusqu'à vous, au cut-off.",
          hero: ['5s', '5d'],
          options: [
            { label: 'Partir à tapis', correct: true, feedback: "Oui : 5-5 est une poussée standard à cette profondeur. Vous gagnez souvent les blindes tout de suite, et vous êtes rarement très mal en point si vous êtes payé." },
            { label: 'Relancer à 2 BB', correct: false, feedback: "Avec 9 BB, cette relance engage plus de 20 % de votre tapis : face à un tapis adverse, vous devrez payer sans plus aucune équité de fold." },
            { label: 'Se coucher', correct: false, feedback: "Trop prudent : attendre une meilleure main laisse les blindes grignoter un tapis déjà court." },
          ],
        },
      },
      {
        title: 'Payer un tapis : plus exigeant',
        paragraphs: [
          "Quand vous payez un tapis, vous perdez l'équité de fold : il faut gagner l'abattage. La main nécessaire pour payer est donc nettement plus forte que celle qui suffit pour pousser.",
          "Un joueur serré pousse 10 BB sous le pistolet. Vous êtes au bouton avec 30 BB. Pour payer 10 BB dans un pot de 11,5 BB, il vous faut 10 ÷ 21,5 ≈ 46,5 % d'équité, et les blindes parlent encore après vous.",
        ],
        visual: {
          kind: 'decision',
          situation: "Un joueur serré pousse 10 BB sous le pistolet. Vous êtes au bouton avec 30 BB.",
          hero: ['Kc', 'Jd'],
          options: [
            { label: 'Payer', correct: false, feedback: "Contre une range de poussée serrée (paires moyennes et hautes, As forts, Roi-Dame), Roi-Valet dépareillé est souvent dominé et n'atteint pas les 46,5 % nécessaires." },
            { label: 'Se coucher', correct: true, feedback: "Oui : Roi-Valet dépareillé est une poussée correcte dans de nombreux cas, mais un paiement trop faible face à une poussée précoce." },
            { label: 'Relancer pour isoler', correct: false, feedback: "L'adversaire est déjà à tapis : relancer revient à payer, tout en engageant davantage de jetons face aux blindes. Même problème, en pire." },
          ],
        },
      },
      {
        title: 'Recompter à chaque niveau',
        paragraphs: [
          "Votre tapis en grosses blindes change à chaque nouveau niveau, même sans jouer une main. Avec les antes, le pot de départ grossit : les poussées deviennent encore plus rentables et peuvent s'élargir.",
          "Prenez l'habitude de recompter votre tapis à chaque changement de niveau. Essayez avec ces valeurs.",
        ],
        visual: { kind: 'stack', bb: 9, calculator: { chips: 7200, bigBlind: 800 } },
      },
    ],
    quiz: [
      {
        question: 'À partir de quelle profondeur, environ, la stratégie « tapis ou se coucher » devient-elle la norme ?',
        options: ['Sous 40 BB', 'Sous 25 BB', 'Sous 10 à 12 BB', 'Sous 2 BB seulement'],
        answer: 2,
        explanation: "Sous une dizaine de grosses blindes, une relance classique engage une trop grande part du tapis : on simplifie en poussant ou en se couchant.",
      },
      {
        question: "Que désigne l'équité de fold ?",
        options: [
          'La probabilité de toucher au flop',
          "Le gain apporté par le fait que l'adversaire se couche face à votre mise",
          'Le montant des blindes',
          'La part du pot qui revient au donneur',
        ],
        answer: 1,
        explanation: "C'est l'avantage de miser en premier : l'adversaire peut abandonner, et vous gagnez sans abattage.",
      },
      {
        question: 'Pourquoi faut-il une main plus forte pour payer un tapis que pour pousser ?',
        options: [
          'Parce que payer coûte toujours plus cher',
          "Parce qu'en payant, vous n'avez plus d'équité de fold : vous devez gagner l'abattage",
          'Parce que la règle l’impose',
          'Parce que celui qui pousse a toujours une paire',
        ],
        answer: 1,
        explanation: "En poussant, vous gagnez aussi quand l'adversaire se couche. En payant, seule la force de votre main compte.",
      },
      {
        question: 'Tout le monde s’est couché. Depuis quelle place peut-on pousser le plus de mains ?',
        options: ['Sous le pistolet', 'Milieu de parole', 'Cut-off', 'Petite blinde'],
        answer: 3,
        explanation: "En petite blinde, seule la grosse blinde peut encore payer : c'est la place où l'on pousse le plus large.",
      },
      {
        question: 'Vous avez 7 200 jetons et la grosse blinde vaut 800. Combien de grosses blindes avez-vous ?',
        options: ['7,2 BB', '9 BB', '12 BB', '72 BB'],
        answer: 1,
        explanation: "7 200 ÷ 800 = 9 BB : vous êtes en zone de « tapis ou se coucher ».",
      },
    ],
  },

  // 14 ---------------------------------------------------------------------------
  {
    slug: 'sit-and-go',
    title: 'Stratégie de base en Sit & Go',
    summary: "Les phases d'un tournoi à une table, la pression de la bulle et l'agressivité nécessaire en fin de partie.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 14,
    duration: 15,
    cover: ['Ac', 'Kc'],
    steps: [
      {
        title: 'Un tournoi en miniature',
        paragraphs: [
          "Un Sit & Go est un petit tournoi qui démarre dès que la table est complète, souvent à 6 ou 9 joueurs. Il n'y a qu'une table, les niveaux montent vite, et seules les toutes premières places reçoivent un prix.",
          "Dévoilez les caractéristiques du format.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Le départ', text: "Le tournoi commence dès que toutes les places sont prises : pas d'horaire fixe." },
            { term: 'Les places payées', text: "À 9 joueurs, on récompense souvent les trois premiers, par exemple selon une répartition 50 % / 30 % / 20 %." },
            { term: 'Le rythme', text: "Les blindes montent rapidement : on passe en quelques dizaines de minutes de tapis profonds à des tapis courts." },
            { term: 'La bulle', text: "À 9 joueurs avec 3 places payées, elle survient à 4 joueurs : le prochain éliminé ne reçoit rien." },
          ],
        },
      },
      {
        title: 'Des niveaux qui montent vite',
        paragraphs: [
          "Avec un tapis de départ de 1 500 jetons, vous commencez avec 75 grosses blindes. Quelques niveaux plus tard, sans avoir rien perdu, vous n'en avez plus qu'une dizaine.",
          "Passez d'un niveau à l'autre pour voir votre profondeur fondre.",
        ],
        visual: {
          kind: 'levels',
          stack: 1500,
          levels: [
            { sb: 10, bb: 20, ante: 0 },
            { sb: 15, bb: 30, ante: 0 },
            { sb: 25, bb: 50, ante: 0 },
            { sb: 50, bb: 100, ante: 0 },
            { sb: 75, bb: 150, ante: 0 },
            { sb: 100, bb: 200, ante: 25 },
          ],
        },
      },
      {
        title: 'Le début : solide et patient',
        paragraphs: [
          "Dans les premiers niveaux, les blindes sont petites par rapport aux tapis : il y a peu à gagner à les voler, et beaucoup à perdre dans un gros pot avec une main moyenne. Jouez une sélection serrée, et misez pour la valeur avec vos bonnes mains.",
          "Vos adversaires vont souvent s'éliminer entre eux : conserver votre tapis pour la suite est déjà un objectif.",
        ],
        visual: {
          kind: 'decision',
          situation: "Premier niveau, 9 joueurs, 75 BB. Vous êtes premier à parler.",
          hero: ['Kh', 'Td'],
          options: [
            { label: 'Relancer', correct: false, feedback: "À 9 joueurs, avec huit adversaires derrière, Roi-10 dépareillé est trop faible et souvent dominé quand il est payé." },
            { label: 'Suivre la grosse blinde', correct: false, feedback: "Le limp avec une main moyenne mène à des pots à plusieurs joueurs difficiles à jouer, sans initiative." },
            { label: 'Se coucher', correct: true, feedback: "Oui : en première position, en début de Sit & Go, cette main ne justifie aucun risque. La patience paie dans ce format." },
          ],
        },
      },
      {
        title: 'La bulle et la valeur des jetons',
        paragraphs: [
          "En tournoi, les jetons que vous perdez valent plus que ceux que vous gagnez : perdre votre tapis vous élimine sans rien, alors que le doubler ne double pas vos gains attendus. Ce principe est modélisé par l'« ICM » (Independent Chip Model), un calcul qui convertit les tapis en part de la dotation.",
          "Conséquence pratique : à la bulle, payer un tapis exige une main nettement plus forte qu'en cash game, surtout face à un joueur qui vous couvre. Dévoilez les effets.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Payer plus serré', text: "Face à un tapis adverse qui peut vous éliminer, beaucoup de paiements rentables en jetons deviennent des abandons." },
            { term: 'Pousser quand on couvre', text: "Le joueur qui couvre les autres peut mettre la pression : ses adversaires ne peuvent pas se permettre de payer large." },
            { term: 'Profiter des tapis très courts', text: "Si un joueur n'a presque plus de jetons, laissez-le souvent s'éliminer plutôt que de risquer votre propre tournoi." },
          ],
        },
      },
      {
        title: 'Un paiement tentant à la bulle',
        paragraphs: [
          "Il reste quatre joueurs pour trois places payées. Le plus gros tapis, qui pousse très souvent, part à tapis au bouton. Vous êtes en grosse blinde avec 15 BB ; un autre joueur n'a plus que 3 BB.",
          "En cash game, As-9 contre une range de poussée large serait un paiement correct. Ici ?",
        ],
        visual: {
          kind: 'decision',
          situation: "Bulle : 4 joueurs, 3 payés. Le gros tapis (qui vous couvre) pousse au bouton. Vous êtes en grosse blinde avec 15 BB ; un joueur n'a que 3 BB.",
          hero: ['Ah', '9c'],
          options: [
            { label: 'Payer : As-9 est devant une range large', correct: false, feedback: "Même devant en moyenne, vous risquez une élimination sans aucun prix, alors qu'un joueur à 3 BB est tout proche de sortir. Le gain en jetons ne compense pas ce risque." },
            { label: 'Se coucher : le risque d’élimination est trop coûteux', correct: true, feedback: "Oui : à la bulle, face à un joueur qui vous couvre et avec un tapis très court à la table, se coucher préserve une grande partie de la valeur de votre tournoi." },
            { label: 'Payer pour ne pas paraître faible', correct: false, feedback: "L'image n'a aucune importance ici : seule compte la valeur de votre décision." },
          ],
        },
      },
      {
        title: 'La fin : agressivité',
        paragraphs: [
          "Une fois dans les places payées, à trois ou deux joueurs, les blindes reviennent très vite et les tapis sont souvent courts. Il faut ouvrir et pousser beaucoup plus de mains : en tête-à-tête, la grande majorité des mains méritent d'être jouées au bouton.",
          "Les repères de la leçon « tapis ou se coucher » s'appliquent alors pleinement. Faites varier la jauge pour revoir les zones.",
        ],
        visual: { kind: 'stack', bb: 12 },
      },
      {
        title: 'Votre plan de Sit & Go',
        paragraphs: [
          "Un Sit & Go se joue en phases : votre stratégie doit changer avec elles. Gardez ce plan en tête.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Mes repères en Sit & Go',
          items: [
            'Début : sélection serrée, mises de valeur, peu de bluffs',
            'Milieu : je recompte mon tapis à chaque niveau et je commence à voler les blindes',
            'Bulle : je paie les tapis plus serré, je mets la pression si je couvre',
            'Places payées : j’augmente nettement mon agressivité',
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Dans un Sit & Go à 9 joueurs avec 3 places payées, quand survient la bulle ?',
        options: ['À 9 joueurs', 'À 5 joueurs', 'À 4 joueurs', 'À 3 joueurs'],
        answer: 2,
        explanation: "La bulle survient quand il reste un joueur de plus que le nombre de places payées : 3 + 1 = 4.",
      },
      {
        question: "Selon l'idée résumée par l'ICM, que valent les jetons perdus par rapport aux jetons gagnés ?",
        options: [
          'Exactement la même chose',
          'Plus : perdre son tapis élimine, alors que le doubler ne double pas les gains attendus',
          'Moins : on peut toujours se recaver',
          'Rien : seuls les jetons gagnés comptent',
        ],
        answer: 1,
        explanation: "Les prix sont fixes et répartis entre plusieurs places : chaque jeton supplémentaire vaut un peu moins que le précédent.",
      },
      {
        question: 'Quelle approche convient le mieux aux premiers niveaux d’un Sit & Go ?',
        options: [
          'Pousser tapis très souvent',
          'Jouer une sélection serrée et miser pour la valeur',
          'Payer toutes les relances',
          'Bluffer à chaque main',
        ],
        answer: 1,
        explanation: "Les blindes sont petites face aux tapis : il y a peu à gagner à voler et beaucoup à perdre dans de gros pots marginaux.",
      },
      {
        question: 'Avec 1 500 jetons au niveau 75/150, combien de grosses blindes avez-vous ?',
        options: ['5 BB', '10 BB', '15 BB', '20 BB'],
        answer: 1,
        explanation: "1 500 ÷ 150 = 10 BB : vous approchez de la zone « tapis ou se coucher ».",
      },
      {
        question: 'En tête-à-tête, en fin de Sit & Go, quelle tendance générale adopter ?',
        options: [
          'Jouer encore plus serré qu’au début',
          'Ouvrir et pousser beaucoup plus de mains',
          'Ne jouer que les paires',
          'Attendre que l’adversaire s’élimine seul',
        ],
        answer: 1,
        explanation: "À deux joueurs, vous payez une blinde à chaque main : attendre coûte très cher, et les mains moyennes prennent beaucoup de valeur.",
      },
    ],
  },

  // 15 ---------------------------------------------------------------------------
  {
    slug: 'analyser-une-main',
    title: 'Méthode pour analyser une main après coup',
    summary: "Une méthode simple pour revoir une main à froid : faits, fourchettes à chaque tour, calculs, puis une conclusion utile.",
    level: 'intermediaire',
    levelLabel: 'Intermédiaire',
    order: 15,
    duration: 16,
    cover: ['Ah', 'Qh'],
    steps: [
      {
        title: 'Une méthode en cinq temps',
        paragraphs: [
          "Analyser une main n'est utile que si l'on suit toujours la même démarche, à froid, de préférence après la session. À chaud, on cherche surtout à se rassurer ou à blâmer la chance.",
          "Voici la grille que nous allons appliquer à une main d'exemple.",
        ],
        visual: {
          kind: 'checklist',
          title: 'Ma méthode d’analyse',
          items: [
            'Les faits : format, positions, tapis effectifs, actions et tailles de mises',
            'La range de l’adversaire à chaque tour, au vu de ses actions',
            'Les calculs : cotes du pot, équité, nombre d’outs',
            'Les alternatives : quelle autre action était possible, et qu’aurait-elle changé ?',
            'Une conclusion en une phrase, sans tenir compte du résultat',
          ],
        },
      },
      {
        title: 'Les faits',
        paragraphs: [
          "Cash game, 100 BB effectifs. Vous ouvrez à 2,5 BB au cut-off avec A♥ D♥, le bouton paie, les blindes se couchent : pot de 6,5 BB. Au flop D♣ 9♥ 5♠, vous misez 2 BB, le bouton paie (pot de 10,5 BB).",
          "À la turn 8♥, avec top paire meilleur kicker et le tirage couleur max, vous misez 7 BB et le bouton paie (pot de 24,5 BB). La river est le 2♦ : vous checkez, le bouton mise 16 BB. Dévoilez le tableau tour par tour.",
        ],
        visual: { kind: 'table', hero: ['Ah', 'Qh'], board: ANALYSE_BOARD, revealed: 0, interactive: true },
      },
      {
        title: 'La range adverse, tour par tour',
        paragraphs: [
          "Plutôt que de deviner une main précise, demandez-vous quelles familles de mains restent possibles à chaque étape, et lesquelles disparaissent.",
          "Dévoilez chaque tour.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Préflop', text: "Le bouton paie au lieu de relancer : peu d'As-As ou de Roi-Roi, beaucoup de paires moyennes, de figures assorties et de connecteurs." },
            { term: 'Flop D♣ 9♥ 5♠', text: "Il paie : Dames moins bonnes, 9, paires moyennes, tirages quinte (V-10, 10-8, 8-7, 7-6) et quelques mains qui « flottent » (paient pour bluffer plus tard)." },
            { term: 'Turn 8♥', text: "Il paie encore : Dames, doubles paires, brelans, mais aussi V-10, qui a fait la quinte, et des tirages à cœur ou à la quinte." },
            { term: 'River 2♦', text: "Rien ne change au tableau. Sa mise de 16 BB représente les quintes, les doubles paires, les brelans, ou des tirages manqués qui bluffent." },
          ],
        },
      },
      {
        title: 'Les calculs',
        paragraphs: [
          "À la river, le bouton mise 16 BB dans un pot de 24,5 BB. Avant toute intuition, posez le prix : combien vous faut-il d'équité pour payer ?",
          "Notez aussi un détail important : vous tenez l'As de cœur. Le bouton ne peut donc pas avoir le tirage couleur max, ce qui retire une partie des tirages manqués qui auraient pu bluffer.",
        ],
        visual: {
          kind: 'decision',
          situation: "Pot de 24,5 BB à la river. Le bouton mise 16 BB. Quelle équité minimale vous faut-il pour payer ?",
          hero: ['Ah', 'Qh'],
          board: ANALYSE_BOARD,
          options: [
            { label: 'Environ 28 %', correct: true, feedback: "Exact : 16 ÷ (24,5 + 16 + 16) = 16 ÷ 56,5 ≈ 28 %. Il faut que le bouton bluffe ou mise une main plus faible un peu plus d'une fois sur quatre." },
            { label: 'Environ 40 %', correct: false, feedback: "C'est la part de la mise dans le pot avant votre paiement (16 ÷ 40,5). N'oubliez pas d'ajouter votre propre paiement au pot final." },
            { label: 'Environ 65 %', correct: false, feedback: "Ce rapport (16 ÷ 24,5) compare la mise au pot initial : ce n'est pas l'équité requise." },
          ],
        },
      },
      {
        title: "L'abattage… et ce qu'il ne dit pas",
        paragraphs: [
          "Vous payez, et le bouton montre Valet-10 de cœur : il avait fait la quinte dès la turn. Dévoilez l'abattage.",
          "Le résultat ne dit pas, à lui seul, si votre paiement était bon ou mauvais. Il vous rappelle en revanche qu'une range qui paie au flop et à la turn sur ce tableau contient beaucoup de mains fortes, et que votre As de cœur réduit le nombre de bluffs possibles.",
        ],
        visual: {
          kind: 'showdown',
          board: ANALYSE_BOARD,
          players: [
            { label: 'Vous', cards: ['Ah', 'Qh'], result: 'Paire de Dames, kicker As' },
            { label: 'Bouton', cards: ['Jh', 'Th'], result: 'Quinte à la Dame (D-V-10-9-8)' },
          ],
          winner: 1,
          note: "La quinte du bouton bat votre paire de Dames. Une seule main ne suffit pas à juger la décision : c'est la range entière qu'il faut évaluer.",
        },
      },
      {
        title: 'Les pièges de l’analyse',
        paragraphs: [
          "Même avec une bonne méthode, quelques biais faussent souvent les conclusions. Les reconnaître suffit déjà à les limiter.",
          "Dévoilez-les.",
        ],
        visual: {
          kind: 'reveal',
          items: [
            { term: 'Juger au résultat', text: "Conclure qu'une décision était mauvaise parce qu'elle a perdu. Une bonne décision perd régulièrement." },
            { term: 'Le biais de confirmation', text: "Ne retenir que les éléments qui confirment l'idée que l'on avait déjà de la main." },
            { term: 'La main unique', text: "Raisonner contre la main montrée plutôt que contre toutes les mains que l'adversaire pouvait avoir." },
            { term: 'La recherche du coupable', text: "Accuser la chance ou l'adversaire empêche de voir ce que vous pouviez améliorer." },
          ],
        },
      },
      {
        title: 'La conclusion',
        paragraphs: [
          "Une analyse se termine par une phrase courte, qui vous servira lors des prochaines sessions. Elle doit porter sur la décision, jamais sur le résultat.",
          "Quelle conclusion retiendriez-vous ici ?",
        ],
        visual: {
          kind: 'decision',
          situation: "Après la main : quelle conclusion est la plus utile pour progresser ?",
          options: [
            { label: "J'ai perdu, donc j'ai mal joué", correct: false, feedback: "C'est le biais du résultat : la conclusion doit porter sur la décision, prise avec ce que vous saviez." },
            { label: 'Paiement river serré : revoir la part de bluffs du bouton, en tenant compte de mon As de cœur', correct: true, feedback: "Oui : une conclusion précise, qui porte sur la range adverse et sur un détail concret (le bloqueur), et qui donne un thème de travail." },
            { label: 'Le bouton a eu de la chance', correct: false, feedback: "Il avait la quinte dès la turn : aucune chance ici. Et même si c'était le cas, ce constat n'apprend rien." },
          ],
        },
      },
    ],
    quiz: [
      {
        question: 'Quelle est la première étape d’une analyse de main ?',
        options: [
          'Regarder si l’on a gagné le pot',
          'Reconstituer les faits : positions, tapis effectifs, actions et tailles de mises',
          'Chercher la carte qui a tout changé',
          'Demander à l’adversaire ce qu’il avait',
        ],
        answer: 1,
        explanation: "Sans les faits précis, toute analyse repose sur des souvenirs déformés. On commence donc par reconstituer la main.",
      },
      {
        question: 'Le pot fait 24,5 BB à la river et l’adversaire mise 16 BB. Quelle équité vous faut-il pour payer ?',
        options: ['Environ 20 %', 'Environ 28 %', 'Environ 40 %', 'Environ 65 %'],
        answer: 1,
        explanation: "16 ÷ (24,5 + 16 + 16) = 16 ÷ 56,5 ≈ 28 %.",
      },
      {
        question: "Vous tenez l'As de cœur et le tableau montre deux cœurs. Quel effet sur la range de bluffs de l'adversaire ?",
        options: [
          'Aucun',
          'Il ne peut pas avoir le tirage couleur max, ce qui réduit ses tirages manqués',
          'Il a forcément une couleur',
          'Il bluffe forcément plus souvent',
        ],
        answer: 1,
        explanation: "Votre As de cœur est un bloqueur : les tirages couleur max, souvent utilisés pour bluffer, disparaissent de sa range.",
      },
      {
        question: "Que signifie « juger au résultat » ?",
        options: [
          'Évaluer une décision selon qu’elle a gagné ou perdu',
          'Compter les jetons à la fin de la session',
          'Calculer les cotes du pot',
          'Comparer deux mains à l’abattage',
        ],
        answer: 0,
        explanation: "C'est le biais le plus courant : une bonne décision peut perdre et une mauvaise gagner. On évalue la décision, pas le résultat.",
      },
      {
        question: 'Quand vaut-il mieux analyser une main difficile ?',
        options: [
          'Immédiatement, pendant la partie',
          'À froid, après la session, avec une méthode fixe',
          'Seulement si on a perdu',
          'Jamais : il vaut mieux oublier',
        ],
        answer: 1,
        explanation: "À chaud, l'émotion biaise le raisonnement. Une analyse à froid, avec toujours la même grille, est bien plus fiable.",
      },
    ],
  },
];
