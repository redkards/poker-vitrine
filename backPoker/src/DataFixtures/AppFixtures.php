<?php

namespace App\DataFixtures;

use App\Content\DefaultContent;
use App\Entity\Article;
use App\Entity\ForumCategory;
use App\Entity\ForumPost;
use App\Entity\ForumSubscription;
use App\Entity\ForumTopic;
use App\Entity\User;
use App\Entity\PremiumSubscription;
use App\Entity\Video;
use App\Enum\PremiumPlan;
use App\Enum\PremiumSubscriptionStatus;
use App\Enum\VideoLevel;
use App\Service\ArticleImporter;
use App\Service\GdprService;
use App\Service\TournamentImporter;
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
        private readonly TournamentImporter $tournamentImporter,
        #[Autowire('%kernel.project_dir%')]
        private readonly string $projectDir,
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        $accounts = [
            ['demo@pokervitrine.local', 'demo', []],
            ['admin@pokervitrine.local', 'admin', ['ROLE_ADMIN']],
            ['premium@pokervitrine.local', 'premium', []],
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
            if ('premium' === $pseudo) {
                // Compte de démo Premium (1 an) ; « demo » reste non premium
                $user->setPremiumUntil(new \DateTimeImmutable('+1 year'));
                $manager->persist((new PremiumSubscription($user, PremiumPlan::Annuel))
                    ->setStatus(PremiumSubscriptionStatus::Active)
                    ->setStartedAt(new \DateTimeImmutable())
                    ->setEndsAt($user->getPremiumUntil()));
            }

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

        foreach (DefaultContent::VIDEOS as $i => [$title, $url, $category, $level, $description]) {
            $manager->persist((new Video())
                ->setTitle($title)
                ->setYoutubeUrl($url)
                ->setCategory($category)
                ->setLevel($level)
                ->setPremium(VideoLevel::Avance === $level)
                ->setDescription($description)
                ->setPublishedAt(new \DateTimeImmutable(sprintf('-%d days', 1 + $i * 3))));
        }

        $manager->flush();

        // Vraies actualités sourcées (docs/actualites/*.json), absentes d'un déploiement sans le dossier docs
        foreach (glob($this->projectDir.'/../docs/actualites/*.json') ?: [] as $file) {
            $this->importer->importFile($file, $users['admin']);
        }
        // Calendrier des tournois vérifié (docs/calendrier/*.json)
        foreach (glob($this->projectDir.'/../docs/calendrier/*.json') ?: [] as $file) {
            $this->tournamentImporter->importFile($file);
        }
    }

    /**
     * @param array<string, User> $users
     */
    private function loadForum(ObjectManager $manager, array $users): void
    {
        $categories = [];
        foreach (DefaultContent::FORUM_CATEGORIES as $position => [$slug, $name, $description]) {
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
}
