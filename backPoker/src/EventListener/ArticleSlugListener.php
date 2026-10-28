<?php

namespace App\EventListener;

use App\Entity\Article;
use App\Repository\ArticleRepository;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Contracts\Service\ResetInterface;

/**
 * Slug généré depuis le titre quand il est laissé vide, dédoublonné (-2, -3…).
 * preFlush (et non preUpdate) : les changements y sont bien pris en compte par Doctrine.
 * Un slug saisi à la main est contrôlé par UniqueEntity.
 */
#[AsEntityListener(event: Events::prePersist, entity: Article::class)]
#[AsEntityListener(event: Events::preFlush, entity: Article::class)]
class ArticleSlugListener implements ResetInterface
{
    /**
     * Slugs attribués à des articles pas encore écrits en base (même flush)
     *
     * @var array<string, true>
     */
    private array $reserved = [];

    public function __construct(
        private readonly SluggerInterface $slugger,
        private readonly ArticleRepository $articles,
    ) {
    }

    public function prePersist(Article $article): void
    {
        $this->ensureSlug($article);
    }

    public function preFlush(Article $article): void
    {
        $this->ensureSlug($article);
    }

    public function reset(): void
    {
        $this->reserved = [];
    }

    private function ensureSlug(Article $article): void
    {
        if ('' !== trim((string) $article->getSlug())) {
            return;
        }

        $base = mb_substr($this->slugger->slug((string) $article->getTitle())->lower()->toString(), 0, 190) ?: 'article';

        $slug = $base;
        for ($i = 2; isset($this->reserved[$slug]) || $this->articles->slugExists($slug, $article->getId()); ++$i) {
            $slug = $base.'-'.$i;
        }

        $this->reserved[$slug] = true;
        $article->setSlug($slug);
    }
}
