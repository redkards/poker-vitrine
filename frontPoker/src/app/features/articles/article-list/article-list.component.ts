import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api.service';
import { ArticleSummary } from '../../../core/api/content.models';
import { ContentService } from '../../../core/api/content.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

/**
 * UC1 — Liste des actualités (?page=, ?categorie=)
 */
@Component({
  selector: 'app-article-list',
  imports: [RouterLink, DatePipe, PaginationComponent],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
})
export class ArticleListComponent implements OnInit {
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly articles = signal<ArticleSummary[]>([]);
  protected readonly page = signal(1);
  protected readonly pages = signal(1);
  protected readonly total = signal(0);
  protected readonly category = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        tap((params) => {
          this.page.set(Math.max(1, Number(params.get('page')) || 1));
          this.category.set(params.get('categorie'));
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() => this.content.getArticles(this.page(), 9, this.category())),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.articles.set(result.items);
          this.pages.set(result.pages);
          this.total.set(result.total);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(apiErrorMessage(err, 'Impossible de charger les actualités.'));
          this.loading.set(false);
        },
      });
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], { queryParams: { page: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }
}
