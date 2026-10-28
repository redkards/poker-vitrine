import { Component, ElementRef, afterNextRender, computed, effect, inject, Injector, input, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { apiErrorMessage, apiViolations } from '../../../core/api/api.service';
import { FORUM_LIMITS, ForumCategoryRef, ForumTopicSummary } from '../../../core/api/forum.models';
import { ForumService } from '../../../core/api/forum.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ForumDatePipe } from '../forum-date.pipe';

/**
 * UC3/UC7 — Sujets d'une catégorie (/forum/:slug?page=) et création d'un sujet
 */
@Component({
  selector: 'app-forum-category',
  imports: [RouterLink, ReactiveFormsModule, PaginationComponent, ForumDatePipe],
  templateUrl: './forum-category.component.html',
  styleUrl: './forum-category.component.scss',
})
export class ForumCategoryComponent {
  private readonly forum = inject(ForumService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly injector = inject(Injector);
  protected readonly auth = inject(AuthService);

  readonly slug = input.required<string>();
  /** Query param ?page= (lié par withComponentInputBinding) */
  readonly page = input<string>();

  protected readonly limits = FORUM_LIMITS;
  protected readonly currentPage = computed(() => Math.max(1, Number(this.page()) || 1));

  protected readonly category = signal<ForumCategoryRef | null>(null);
  protected readonly topics = signal<ForumTopicSummary[]>([]);
  /** Sujets épinglés en tête (tri stable, l'ordre serveur est conservé sinon) */
  protected readonly sortedTopics = computed(() => [...this.topics()].sort((a, b) => Number(b.isPinned) - Number(a.isPinned)));
  protected readonly pages = signal(1);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formOpen = signal(false);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly serverErrors = signal<Record<string, string>>({});

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', [Validators.required, Validators.minLength(FORUM_LIMITS.titleMin), Validators.maxLength(FORUM_LIMITS.titleMax)]],
    content: ['', [Validators.required, Validators.minLength(FORUM_LIMITS.contentMin), Validators.maxLength(FORUM_LIMITS.contentMax)]],
  });

  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');
  private loadSub?: Subscription;

  constructor() {
    effect(() => this.load(this.slug(), this.currentPage()));
  }

  /** URL courante, pour revenir ici après connexion */
  protected get returnUrl(): string {
    return this.router.url;
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], { queryParams: { page: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }

  protected toggleForm(): void {
    this.formOpen.update((open) => !open);
    if (this.formOpen()) {
      afterNextRender(() => this.titleInput()?.nativeElement.focus(), { injector: this.injector });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.formError.set(null);
    this.serverErrors.set({});

    const { title, content } = this.form.getRawValue();
    this.forum.createTopic(this.slug(), title.trim(), content).subscribe({
      next: (topic) => void this.router.navigate(['/forum/sujet', topic.id]),
      error: (err: unknown) => {
        this.submitting.set(false);
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        if (status === 422) {
          this.serverErrors.set(apiViolations(err));
          this.formError.set('Le sujet n’a pas pu être publié : corrigez les champs signalés.');
        } else if (status === 401) {
          this.formError.set('Votre session a expiré : reconnectez-vous pour publier.');
        } else if (status === 429) {
          this.formError.set(apiErrorMessage(err, 'Vous publiez trop vite : patientez une minute.'));
        } else {
          this.formError.set(apiErrorMessage(err, 'Impossible de publier le sujet.'));
        }
      },
    });
  }

  /** Erreur à afficher pour un champ : serveur en priorité, sinon validation locale */
  protected fieldError(field: 'title' | 'content'): string | null {
    const server = this.serverErrors()[field];
    if (server) {
      return server;
    }
    const control = this.form.controls[field];
    if (!control.touched || control.valid) {
      return null;
    }
    const label = field === 'title' ? 'Le titre' : 'Le message';
    const min = field === 'title' ? FORUM_LIMITS.titleMin : FORUM_LIMITS.contentMin;
    const max = field === 'title' ? FORUM_LIMITS.titleMax : FORUM_LIMITS.contentMax;
    if (control.hasError('required')) {
      return `${label} est obligatoire.`;
    }
    if (control.hasError('minlength')) {
      return `${label} doit contenir au moins ${min} caractères.`;
    }
    return `${label} ne peut dépasser ${max} caractères.`;
  }

  protected clearServerError(field: 'title' | 'content'): void {
    if (this.serverErrors()[field]) {
      this.serverErrors.update(({ [field]: _removed, ...rest }) => rest);
    }
  }

  private load(slug: string, page: number): void {
    this.loadSub?.unsubscribe();
    this.loading.set(true);
    this.notFound.set(false);
    this.error.set(null);

    this.loadSub = this.forum.getCategoryTopics(slug, page).subscribe({
      next: (result) => {
        this.category.set(result.category);
        this.topics.set(result.items);
        this.pages.set(result.pages);
        this.total.set(result.total);
        this.loading.set(false);
        this.title.setTitle(`${result.category.name} — Forum — PokerVitrine`);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.notFound.set(true);
          this.category.set(null);
          this.title.setTitle('Catégorie introuvable — PokerVitrine');
          return;
        }
        this.error.set(apiErrorMessage(err, 'Impossible de charger les sujets.'));
      },
    });
  }
}
