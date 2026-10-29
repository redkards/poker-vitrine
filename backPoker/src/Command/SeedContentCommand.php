<?php

namespace App\Command;

use App\Content\DefaultContent;
use App\Entity\ForumCategory;
use App\Entity\Video;
use App\Service\ArticleImporter;
use App\Service\TournamentImporter;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Charge le contenu de base, sans aucun compte (utilisable en production, rejouable) :
 *   php bin/console app:content:seed
 * Catégories du forum, vidéos CC BY, actualités (docs/actualites) et calendrier (docs/calendrier).
 */
#[AsCommand(name: 'app:content:seed', description: 'Charge le contenu de base (forum, vidéos, actualités, calendrier)')]
class SeedContentCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ArticleImporter $articles,
        private readonly TournamentImporter $tournaments,
        #[Autowire('%kernel.project_dir%')]
        private readonly string $projectDir,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $categories = 0;
        foreach (DefaultContent::FORUM_CATEGORIES as $position => [$slug, $name, $description]) {
            if (null === $this->em->getRepository(ForumCategory::class)->findOneBy(['slug' => $slug])) {
                $this->em->persist((new ForumCategory())->setSlug($slug)->setName($name)->setDescription($description)->setPosition($position));
                ++$categories;
            }
        }

        $videos = 0;
        foreach (DefaultContent::VIDEOS as $i => [$title, $url, $category, $level, $description]) {
            if (null === $this->em->getRepository(Video::class)->findOneBy(['youtubeUrl' => $url])) {
                $this->em->persist((new Video())->setTitle($title)->setYoutubeUrl($url)->setCategory($category)->setLevel($level)
                    ->setDescription($description)->setPublishedAt(new \DateTimeImmutable(sprintf('-%d days', 1 + $i * 3))));
                ++$videos;
            }
        }
        $this->em->flush();
        $io->writeln(sprintf('Forum : %d catégorie(s) ajoutée(s) ; vidéos : %d ajoutée(s).', $categories, $videos));

        try {
            foreach (glob($this->projectDir.'/../docs/actualites/*.json') ?: [] as $file) {
                $r = $this->articles->importFile($file);
                $io->writeln(sprintf('Actualités %s : %d créée(s), %d ignorée(s).', basename($file), $r['created'] ?? 0, $r['skipped'] ?? 0));
            }
            foreach (glob($this->projectDir.'/../docs/calendrier/*.json') ?: [] as $file) {
                $r = $this->tournaments->importFile($file);
                $io->writeln(sprintf('Calendrier %s : %d créé(s), %d mis à jour.', basename($file), $r['created'] ?? 0, $r['updated'] ?? 0));
            }
        } catch (\JsonException|\RuntimeException $e) {
            $io->error($e->getMessage());

            return Command::FAILURE;
        }

        $io->success('Contenu de base chargé.');

        return Command::SUCCESS;
    }
}
