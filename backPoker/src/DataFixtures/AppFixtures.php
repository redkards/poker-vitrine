<?php

namespace App\DataFixtures;

use App\Entity\Article;
use App\Entity\ForumCategory;
use App\Entity\ForumPost;
use App\Entity\ForumSubscription;
use App\Entity\ForumTopic;
use App\Entity\User;
use App\Entity\Video;
use App\Enum\ArticleScope;
use App\Enum\VideoLevel;
use App\Service\GdprService;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Données de développement uniquement (php bin/console doctrine:fixtures:load).
 */
class AppFixtures extends Fixture
{
    public const DEMO_PASSWORD = 'Demo-Poker-2026!';

    public function __construct(
        private readonly UserPasswordHasherInterface $hasher,
        private readonly GdprService $gdpr,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        $accounts = [
            ['demo@pokervitrine.local', 'demo', []],
            ['admin@pokervitrine.local', 'admin', ['ROLE_ADMIN']],
        ];

        $users = [];
        foreach ($accounts as [$email, $pseudo, $roles]) {
            $user = (new User())
                ->setEmail($email)
                ->setPseudo($pseudo)
                ->setRoles($roles)
                ->setIsVerified(true);
            $user->setPassword($this->hasher->hashPassword($user, self::DEMO_PASSWORD));
            $this->gdpr->recordConsent($user, '127.0.0.1');

            $manager->persist($user);
            $users[$pseudo] = $user;
        }

        $articles = [
            ...array_map(static fn (array $a) => [...$a, ArticleScope::France], self::ARTICLES),
            ...array_map(static fn (array $a) => [...$a, ArticleScope::International], self::INTERNATIONAL_ARTICLES),
        ];
        foreach ($articles as $i => [$category, $title, $excerpt, $paragraphs, $scope]) {
            $content = implode('', array_map(static fn (string $p) => '<p>'.$p.'</p>', $paragraphs));
            $article = (new Article())
                ->setTitle($title)
                ->setCategory($category)
                ->setScope($scope)
                ->setExcerpt($excerpt)
                ->setContent($content)
                ->setAuthor($users['admin'])
                ->setPublishedAt(new \DateTimeImmutable(sprintf('-%d days', 2 + $i * 3)));
            $manager->persist($article);
        }

        $this->loadForum($manager, $users);

        // Brouillon : n'apparaît pas dans l'API publique
        $manager->persist((new Article())
            ->setTitle('Brouillon : bilan de la saison')
            ->setCategory('Actualité')
            ->setExcerpt('Article en cours de rédaction.')
            ->setContent('<p>À compléter.</p>')
            ->setAuthor($users['admin']));

        foreach (self::VIDEOS as $i => [$title, $url, $category, $level, $description]) {
            $manager->persist((new Video())
                ->setTitle($title)
                ->setYoutubeUrl($url)
                ->setCategory($category)
                ->setLevel($level)
                ->setDescription($description)
                ->setPublishedAt(new \DateTimeImmutable(sprintf('-%d days', 1 + $i * 3))));
        }

        $manager->flush();
    }

    /**
     * @param array<string, User> $users
     */
    private function loadForum(ObjectManager $manager, array $users): void
    {
        $categories = [];
        foreach (self::FORUM_CATEGORIES as $position => [$slug, $name, $description]) {
            $categories[$slug] = (new ForumCategory())
                ->setSlug($slug)
                ->setName($name)
                ->setDescription($description)
                ->setPosition($position);
            $manager->persist($categories[$slug]);
        }

        foreach (self::FORUM_TOPICS as $i => [$slug, $title, $pinned, $messages]) {
            $start = new \DateTimeImmutable(sprintf('-%d days', 1 + $i * 2));
            $topic = (new ForumTopic())
                ->setCategory($categories[$slug])
                ->setAuthor($users[$messages[0][0]])
                ->setTitle($title)
                ->setIsPinned($pinned)
                ->setCreatedAt($start);

            foreach ($messages as $j => [$pseudo, $content]) {
                $topic->addPost((new ForumPost())
                    ->setAuthor($users[$pseudo])
                    ->setContent($content)
                    ->setCreatedAt($start->modify(sprintf('+%d hours', $j * 3))));
            }

            $manager->persist($topic);
            $manager->persist(new ForumSubscription($users[$messages[0][0]], $topic));
        }
    }

    /**
     * @var list<array{string, string, string}>
     */
    private const FORUM_CATEGORIES = [
        ['debutants', 'Débutants', 'Règles, vocabulaire, premières questions : aucune question n’est bête.'],
        ['analyses-de-mains', 'Analyses de mains', 'Postez une main jouée et demandez l’avis de la communauté.'],
        ['tournois', 'Tournois', 'MTT, Sit & Go, tournois live : stratégie et retours d’expérience.'],
        ['cash-game', 'Cash game', 'Parties à blindes fixes, en ligne ou en club.'],
        ['mental-bankroll', 'Mental & bankroll', 'Tilt, gestion du capital, organisation des sessions.'],
        ['vie-du-site', 'Vie de la communauté', 'Présentations, suggestions et annonces.'],
    ];

    /**
     * [catégorie, titre, épinglé, [[pseudo, message], …]]
     *
     * @var list<array{string, string, bool, list<array{string, string}>}>
     */
    private const FORUM_TOPICS = [
        ['vie-du-site', 'Bienvenue sur le forum : à lire avant de poster', true, [
            ['admin', "Bienvenue à toutes et à tous !\n\nQuelques règles simples : on reste courtois, on ne partage pas de contenu illégal ni de liens vers des sites de jeu non agréés, et on évite les doublons.\n\nLa modération peut masquer un message qui ne respecte pas ces règles. Bon jeu !"],
        ]],
        ['debutants', 'Quelle est la différence entre une blinde et un ante ?', false, [
            ['demo', 'Je débute et je confonds encore blindes et antes. Quelqu’un peut m’expliquer simplement ?'],
            ['admin', "Les blindes (petite et grosse) sont des mises obligatoires payées par les deux joueurs à gauche du bouton.\nL’ante est une petite mise payée par tout le monde (ou par la grosse blinde seule en « big blind ante ») pour enrichir le pot."],
        ]],
        ['analyses-de-mains', 'AK en 3-bet hors de position, flop raté : continuer ?', false, [
            ['demo', "Tournoi, 40 grosses blindes. Je 3-bet AK depuis la grosse blinde, le bouton paie. Flop 7-7-2 arc-en-ciel.\nJe continue en c-bet petit ou je check ?"],
        ]],
        ['mental-bankroll', 'Combien de caves prévoir pour jouer sereinement ?', false, [
            ['demo', 'Vous gardez combien de caves d’avance pour votre limite habituelle ?'],
            ['admin', 'La vidéo de zChance44 sur le bankroll management dans la rubrique Vidéos répond très bien à cette question, je vous la conseille.'],
        ]],
    ];

    /**
     * Actualités internationales de démonstration
     *
     * @var list<array{string, string, string, list<string>}>
     */
    private const INTERNATIONAL_ARTICLES = [
        ['Tournois', 'Les grandes séries internationales : comment s’y préparer', 'Structures longues, field immense, fatigue : nos conseils avant de s’inscrire à un festival à l’étranger.', [
            'Les festivals internationaux proposent des structures plus lentes et des fields très larges. La préparation physique et l’organisation comptent autant que la technique.',
            'Prévoyez votre budget (inscriptions, voyage, hébergement), un planning de repos et des objectifs réalistes.',
        ]],
        ['Actualité', 'Jouer à l’étranger : ce qui change d’un pays à l’autre', 'Règles de maison, langue de table, pourboires : les différences à connaître avant de s’asseoir.', [
            'Chaque casino applique ses propres règles de maison : annonce des mises, gestion des all-in, temps de réflexion.',
            'Renseignez-vous aussi sur la législation locale et la fiscalité des gains avant de partir.',
        ]],
        ['Stratégie', 'Ce que les meilleurs joueurs du monde font différemment', 'Préparation, révision, gestion des émotions : des habitudes accessibles à tous.', [
            'Les joueurs les plus réguliers partagent des routines : échauffement avant session, révision des mains clés, pauses programmées.',
            'Rien de magique : c’est la constance de ces habitudes qui fait la différence sur le long terme.',
        ]],
    ];

    /**
     * Contenu éditorial de démonstration
     *
     * @var list<array{string, string, string, list<string>}>
     */
    private const ARTICLES = [
        ['Stratégie', 'Position au poker : pourquoi le bouton change tout', 'Jouer en dernier, c’est jouer avec plus d’informations. Nos conseils pour exploiter la position.', [
            'Au Texas Hold’em, la position désigne l’ordre de parole. Le joueur au bouton parle en dernier après le flop : il voit ce que font ses adversaires avant de décider.',
            'Concrètement, ouvrez une sélection de mains plus large au bouton et au cut-off, et resserrez-la sous le pistolet. Hors de position, privilégiez les mains qui jouent bien seules.',
            'Exercice : sur vos dix prochaines sessions, notez votre résultat par position. La différence vous convaincra vite.',
        ]],
        ['Débutant', 'Les 5 erreurs les plus fréquentes des nouveaux joueurs', 'Trop de mains jouées, tapis mal gérés… Apprenez à les repérer et à les corriger.', [
            'Jouer trop de mains, payer sans plan, ignorer la position, bluffer des joueurs qui ne se couchent jamais, et jouer au-dessus de sa bankroll : ces cinq erreurs coûtent cher.',
            'La bonne nouvelle : elles se corrigent toutes avec de la discipline. Fixez-vous une liste de mains de départ et tenez-la.',
        ]],
        ['Tournois', 'Gérer son tapis en tournoi : la règle des blinds', 'Combien de grosses blindes vous reste-t-il ? Cette question guide toutes vos décisions.', [
            'Au-delà de 40 grosses blindes, vous avez de la marge pour manœuvrer. Entre 15 et 25, les relances et les tapis deviennent vos meilleures armes.',
            'Sous 10 grosses blindes, c’est le mode « tapis ou couché » : chaque main doit être une décision franche.',
        ]],
        ['Mental', 'Le tilt : le reconnaître avant qu’il ne vous coûte cher', 'Agacement, impatience, envie de se refaire : les signaux d’alerte et comment réagir.', [
            'Le tilt, c’est jouer sous le coup de l’émotion. Il arrive après un bad beat, une série de pertes, ou simplement la fatigue.',
            'Fixez-vous des limites de pertes et de temps, faites des pauses, et rappelez-vous que le poker se joue sur le long terme.',
        ]],
        ['Communauté', 'Le forum d’entraide ouvre bientôt ses portes', 'Analyses de mains, questions de débutants, retours de tournois : un espace pour progresser ensemble.', [
            'Le forum arrive très prochainement. Vous pourrez y poster vos mains, demander conseil et partager vos expériences.',
            'Créez votre compte dès maintenant pour être prêt le jour de l’ouverture.',
        ]],
    ];

    /**
     * Vidéos pédagogiques des chaînes Kill Tilt et zChance44 (vérifiées via oEmbed le 29/10/2026)
     *
     * @var list<array{string, string, string, VideoLevel, string}>
     */
    private const VIDEOS = [
        ['Apprendre le poker : règles, combinaisons, tournois et cash game', 'https://www.youtube.com/watch?v=u73qYPvdNAA', 'Règles', VideoLevel::Debutant, 'Par Kill Tilt. Les règles, la force des mains et les différences entre tournois et cash game.'],
        ['Stratégie simple mais redoutable pour gagner au poker', 'https://www.youtube.com/watch?v=ZI43rck5pCE', 'Stratégie', VideoLevel::Debutant, 'Par Kill Tilt. Une ligne de jeu simple pour bien démarrer.'],
        ['Le bankroll management au poker', 'https://www.youtube.com/watch?v=eW8yhEe7QLo', 'Gestion', VideoLevel::Debutant, 'Par zChance44. Gérer son capital pour durer et progresser sans se ruiner.'],
        ['Stratégie préflop : évite cette erreur', 'https://www.youtube.com/watch?v=yqs2NoTIIuY', 'Préflop', VideoLevel::Intermediaire, 'Par Kill Tilt. Une erreur préflop fréquente et comment la corriger.'],
        ['Comment bien bluffer au poker', 'https://www.youtube.com/watch?v=54QJmea2jkQ', 'Stratégie', VideoLevel::Intermediaire, 'Par zChance44. Choisir ses spots de bluff.'],
        ['Construire ses ranges au poker', 'https://www.youtube.com/watch?v=e9GtkRUrV5w', 'Préflop', VideoLevel::Intermediaire, 'Par zChance44. Bâtir des ranges cohérentes selon la position.'],
        ['5 clés pour vraiment progresser en MTT', 'https://www.youtube.com/watch?v=jffknGENDCU', 'Tournoi', VideoLevel::Avance, 'Par Kill Tilt. Les priorités de travail pour les joueurs de tournois.'],
        ['Passer pro en tournois : la méthode étape par étape', 'https://www.youtube.com/watch?v=OJ3zCQV0L8A', 'Tournoi', VideoLevel::Avance, 'Par Kill Tilt. Méthode détaillée pour franchir les paliers en MTT.'],
    ];
}
