import { Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../../core/api/api.service';
import { Article } from '../../../core/api/content.models';
import { ContentService } from '../../../core/api/content.service';

/**
 * Détail d'une actualité : /actualites/:slug
 */
@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
})
export class ArticleDetailComponent {
  private readonly content = inject(ContentService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly slug = input.required<string>();

  protected readonly article = signal<Article | null>(null);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => this.load(this.slug()));
  }

  private load(slug: string): void {
    this.article.set(null);
    this.notFound.set(false);
    this.error.set(null);

    this.content.getArticle(slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.title.setTitle(`${article.title} — Poker Winners`);
        this.meta.updateTag({ name: 'description', content: article.excerpt });
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.notFound.set(true);
          this.title.setTitle('Article introuvable — Poker Winners');
          return;
        }
        this.error.set(apiErrorMessage(err, "Impossible de charger l'article."));
      },
    });
  }
}
