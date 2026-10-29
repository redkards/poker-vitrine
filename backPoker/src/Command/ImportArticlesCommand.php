<?php

namespace App\Command;

use App\Entity\Article;
use App\Enum\ArticleScope;
use App\Repository\ArticleRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\String\Slugger\SluggerInterface;

/**
 * Importe des actualités depuis un fichier JSON (docs/actualites/*.json), en local ou en production :
 *   php bin/console app:articles:import ../docs/actualites/actualites-2026-10.json --author=admin@pokervitrine.local
 *
 * Format : [{ scope, category, title, excerpt, paragraphs[], publishedAt, sources[{name, url}] }]
 * Un article dont le slug existe déjà est ignoré (import rejouable sans doublon).
 */
#[AsCommand(name: 'app:articles:import', description: 'Importe des actualités depuis un fichier JSON')]
class ImportArticlesCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ArticleRepository $articles,
        private readonly UserRepository $users,
        private readonly SluggerInterface $slugger,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('file', InputArgument::REQUIRED, 'Chemin du fichier JSON')
            ->addOption('author', null, InputOption::VALUE_REQUIRED, 'Email du compte auteur (facultatif)')
            ->addOption('draft', null, InputOption::VALUE_NONE, 'Importer en brouillon (sans date de publication) pour relecture');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $file = (string) $input->getArgument('file');

        if (!is_file($file)) {
            $io->error(sprintf('Fichier introuvable : %s', $file));

            return Command::FAILURE;
        }

        try {
            $items = json_decode((string) file_get_contents($file), true, 512, \JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            $io->error('JSON invalide : '.$e->getMessage());

            return Command::FAILURE;
        }

        $author = null;
        if ($email = $input->getOption('author')) {
            $author = $this->users->findOneBy(['email' => mb_strtolower((string) $email)]);
            if (!$author) {
                $io->error(sprintf('Aucun compte avec l’email %s.', $email));

                return Command::FAILURE;
            }
        }

        $created = $skipped = 0;
        foreach ($items as $i => $item) {
            $scope = ArticleScope::tryFrom((string) ($item['scope'] ?? ''));
            $title = trim((string) ($item['title'] ?? ''));
            if (!$scope || '' === $title || empty($item['paragraphs'])) {
                $io->warning(sprintf('Élément %d ignoré : scope, titre ou paragraphes manquants.', $i + 1));
                ++$skipped;
                continue;
            }

            $slug = mb_substr($this->slugger->slug($title)->lower()->toString(), 0, 190);
            if ($this->articles->findOneBy(['slug' => $slug])) {
                ++$skipped;
                continue;
            }

            $article = (new Article())
                ->setTitle($title)
                ->setSlug($slug)
                ->setScope($scope)
                ->setCategory(mb_substr((string) ($item['category'] ?? ''), 0, 50) ?: null)
                ->setExcerpt(mb_substr((string) ($item['excerpt'] ?? ''), 0, 400))
                ->setContent($this->renderContent($item['paragraphs'], $item['sources'] ?? []))
                ->setAuthor($author)
                ->setPublishedAt($input->getOption('draft') ? null : $this->date($item['publishedAt'] ?? null));

            $this->em->persist($article);
            ++$created;
        }

        $this->em->flush();
        $io->success(sprintf('%d actualité(s) importée(s), %d ignorée(s).', $created, $skipped));

        return Command::SUCCESS;
    }

    /**
     * Texte brut échappé + liste des sources (liens externes sans transmission de référent).
     *
     * @param list<string>                         $paragraphs
     * @param list<array{name?: string, url?: string}> $sources
     */
    private function renderContent(array $paragraphs, array $sources): string
    {
        $html = implode('', array_map(
            static fn ($p) => '<p>'.htmlspecialchars((string) $p, \ENT_QUOTES).'</p>',
            $paragraphs,
        ));

        $links = [];
        foreach ($sources as $source) {
            $url = (string) ($source['url'] ?? '');
            if (!preg_match('#^https?://#', $url)) {
                continue;
            }
            $links[] = sprintf(
                '<li><a href="%s" target="_blank" rel="noopener noreferrer nofollow">%s</a></li>',
                htmlspecialchars($url, \ENT_QUOTES),
                htmlspecialchars((string) ($source['name'] ?? $url), \ENT_QUOTES),
            );
        }

        return $links ? $html.'<h3>Sources</h3><ul>'.implode('', $links).'</ul>' : $html;
    }

    private function date(mixed $value): \DateTimeImmutable
    {
        $date = \is_string($value) ? \DateTimeImmutable::createFromFormat('!Y-m-d', $value) : false;
        $now = new \DateTimeImmutable();

        // Date invalide ou future : publication immédiate
        return $date && $date <= $now ? $date->setTime(9, 0) : $now;
    }
}
