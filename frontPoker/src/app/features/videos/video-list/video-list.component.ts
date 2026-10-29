import { Component, DestroyRef, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { apiErrorMessage } from '../../../core/api/api.service';
import { Video, VideoLevel, VideoPage } from '../../../core/api/content.models';
import { ContentService } from '../../../core/api/content.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

const LEVELS: VideoLevel[] = ['debutant', 'intermediaire', 'avance'];

/**
 * UC2 — Vidéos pédagogiques, filtrables par niveau et catégorie (?niveau=, ?categorie=, ?page=)
 */
@Component({
  selector: 'app-video-list',
  imports: [RouterLink, PaginationComponent],
  templateUrl: './video-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './video-list.component.scss',
})
export class VideoListComponent implements OnInit {
  private readonly content = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly videos = signal<Video[]>([]);
  protected readonly filters = signal<VideoPage['filters'] | null>(null);
  protected readonly level = signal<VideoLevel | null>(null);
  protected readonly category = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly pages = signal(1);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        tap((params) => {
          const level = params.get('niveau') as VideoLevel | null;
          this.level.set(level && LEVELS.includes(level) ? level : null);
          this.category.set(params.get('categorie'));
          this.page.set(Math.max(1, Number(params.get('page')) || 1));
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() => this.content.getVideos({ page: this.page(), level: this.level(), category: this.category() })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.videos.set(result.items);
          this.filters.set(result.filters);
          this.pages.set(result.pages);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(apiErrorMessage(err, 'Impossible de charger les vidéos.'));
          this.loading.set(false);
        },
      });
  }

  protected setLevel(level: VideoLevel | null): void {
    this.navigate({ niveau: level, page: null });
  }

  protected setCategory(category: string): void {
    this.navigate({ categorie: category || null, page: null });
  }

  protected goToPage(page: number): void {
    this.navigate({ page: page > 1 ? page : null });
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
