<?php

namespace App\Service;

use App\Entity\Article;
use App\Entity\User;
use App\Enum\ArticleScope;
use App\Repository\ArticleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

/**
 * Import d'actualités depuis un fichier JSON (docs/actualites/*.json).
 * Format : [{ scope, category, title, excerpt, paragraphs[], publishedAt, sources[{name, url}] }]
 * Un article dont le slug existe déjà est ignoré : l'import est rejouable sans doublon.
 */
class ArticleImporter
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ArticleRepository $articles,
        private readonly SluggerInterface $slugger,
    ) {
    }

    /**
     * @return array{created: int, skipped: int, warnings: list<string>}
     *
     * @throws \JsonException|\RuntimeException
     */
    public function importFile(string $file, ?User $author = null, bool $draft = false): array
    {
        if (!is_file($file)) {
            throw new \RuntimeException(sprintf('Fichier introuvable : %s', $file));
        }

        $items = json_decode((string) file_get_contents($file), true, 512, \JSON_THROW_ON_ERROR);
        $created = $skipped = 0;
        $warnings = [];
        $seen = [];

        foreach ($items as $i => $item) {
            $scope = ArticleScope::tryFrom((string) ($item['scope'] ?? ''));
            $title = trim((string) ($item['title'] ?? ''));
            if (!$scope || '' === $title || empty($item['paragraphs'])) {
                $warnings[] = sprintf('Élément %d ignoré : rubrique, titre ou paragraphes manquants.', $i + 1);
                ++$skipped;
                continue;
            }

            $slug = mb_substr($this->slugger->slug($title)->lower()->toString(), 0, 190);
            if (isset($seen[$slug]) || $this->articles->findOneBy(['slug' => $slug])) {
                ++$skipped;
                continue;
            }
            $seen[$slug] = true;

            $this->em->persist((new Article())
                ->setTitle($title)
                ->setSlug($slug)
                ->setScope($scope)
                ->setCategory(mb_substr((string) ($item['category'] ?? ''), 0, 50) ?: null)
                ->setExcerpt(mb_substr((string) ($item['excerpt'] ?? ''), 0, 400))
                ->setContent($this->renderContent($item['paragraphs'], $item['sources'] ?? []))
                ->setAuthor($author)
                ->setPublishedAt($draft ? null : $this->date($item['publishedAt'] ?? null)));
            ++$created;
        }

        $this->em->flush();

        return ['created' => $created, 'skipped' => $skipped, 'warnings' => $warnings];
    }

    /**
     * Texte brut échappé + liste des sources (liens externes sans transmission de référent).
     *
     * @param list<string>                             $paragraphs
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
