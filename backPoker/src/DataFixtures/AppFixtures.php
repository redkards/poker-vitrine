<?php

namespace App\DataFixtures;

use App\Entity\Article;
use App\Entity\ForumCategory;
use App\Entity\ForumPost;
use App\Entity\ForumSubscription;
use App\Entity\ForumTopic;
use App\Entity\User;
use App\Entity\Video;
use App\Enum\VideoLevel;
use App\Service\ArticleImporter;
use App\Service\GdprService;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
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
        private readonly ArticleImporter $importer,
        #[Autowire('%kernel.project_dir%')]
        private readonly string $projectDir,
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

        // Vraies actualités sourcées (docs/actualites/*.json), absentes d'un déploiement sans le dossier docs
        foreach (glob($this->projectDir.'/../docs/actualites/*.json') ?: [] as $file) {
            $this->importer->importFile($file, $users['admin']);
        }
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
            ['admin', "Une règle de prudence courante : au moins 20 à 30 caves pour le cash game, davantage en tournoi car la variance y est plus forte.\nLa leçon « Progresser en tournoi » de la rubrique Leçons détaille le sujet."],
        ]],
    ];





    /**
     * Vidéos de démonstration : uniquement des vidéos sous licence Creative Commons vérifiée
     * (les vidéos de chaînes tierces Kill Tilt et zChance44 ont été retirées à la demande du propriétaire).
     *
     * Licence CC BY vérifiée sur la page YouTube de chaque vidéo le 29/10/2026 : l'auteur et la licence
     * doivent rester crédités dans la description.
     *
     * @var list<array{string, string, string, VideoLevel, string}>
     */
    private const VIDEOS = [
        ['Poker Hand Rankings : quelle main bat quelle main ?', 'https://www.youtube.com/watch?v=FtPEAIV8STw', 'Règles', VideoLevel::Debutant, "Hiérarchie des combinaisons et lecture du tableau en Hold'em (en anglais, 28 min). Vidéo de Ryan Morales, licence Creative Commons Attribution (CC BY)."],
        ['Limit, No-Limit, Pot-Limit : quelles différences ?', 'https://www.youtube.com/watch?v=13tU6Jmyj5o', 'Règles', VideoLevel::Debutant, "Les trois structures d'enchères expliquées simplement (en anglais, 4 min). Vidéo d'AceHighTV, licence Creative Commons Attribution (CC BY)."],
        ['Bankroll management : bien gérer son capital', 'https://www.youtube.com/watch?v=c-p52T0t1O4', 'Gestion', VideoLevel::Debutant, "Gérer son capital de jeu avec un calculateur (en anglais, 38 min). Vidéo de WinnerInAWeek, licence Creative Commons Attribution (CC BY)."],
        ['Poker et probabilités : analyse combinatoire', 'https://www.youtube.com/watch?v=SU1EU529d_8', 'Stratégie', VideoLevel::Intermediaire, "Calculer la probabilité des mains grâce à la combinatoire (14 min). Vidéo de Patrick Anastasoglou, licence Creative Commons Attribution (CC BY)."],
        ['Cotes du pot et équité des tirages', 'https://www.youtube.com/watch?v=_X8Sy2bdZGo', 'Stratégie', VideoLevel::Intermediaire, "Pot odds, équité de seuil des tirages et bluff (en anglais, 8 min). Vidéo de WinnerInAWeek, licence Creative Commons Attribution (CC BY)."],
    ];
}
