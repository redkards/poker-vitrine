<?php

namespace App\DataFixtures;

use App\Entity\Article;
use App\Entity\User;
use App\Entity\Video;
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

        foreach (self::ARTICLES as $i => [$category, $title, $excerpt, $paragraphs]) {
            $content = implode('', array_map(static fn (string $p) => '<p>'.$p.'</p>', $paragraphs));
            $article = (new Article())
                ->setTitle($title)
                ->setCategory($category)
                ->setExcerpt($excerpt)
                ->setContent($content)
                ->setAuthor($users['admin'])
                ->setPublishedAt(new \DateTimeImmutable(sprintf('-%d days', 2 + $i * 4)));
            $manager->persist($article);
        }

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
