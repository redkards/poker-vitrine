import { Component, Injector, afterNextRender, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { apiErrorMessage, apiViolations } from '../../../core/api/api.service';
import { FORUM_LIMITS, ForumPost, ForumTopicDetail } from '../../../core/api/forum.models';
import { ForumService } from '../../../core/api/forum.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

/**
 * UC3/UC7 — Fil d'un sujet (/forum/sujet/:id?page=), réponse et abonnement
 */
@Component({
  selector: 'app-forum-topic',
  imports: [RouterLink, DatePipe, ReactiveFormsModule, PaginationComponent],
  templateUrl: './forum-topic.component.html',
  styleUrl: './forum-topic.component.scss',
})
export class ForumTopicComponent {
  private readonly forum = inject(ForumService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly injector = inject(Injector);
  protected readonly auth = inject(AuthService);

  readonly id = input.required<string>();
  /** Query param ?page= (lié par withComponentInputBinding) */
  readonly page = input<string>();

  protected readonly limits = FORUM_LIMITS;
  protected readonly topicId = computed(() => Number(this.id()));
  protected readonly currentPage = computed(() => Math.max(1, Number(this.page()) || 1));

  protected readonly topic = signal<ForumTopicDetail | null>(null);
  protected readonly posts = signal<ForumPost[]>([]);
  protected readonly pages = signal(1);
  protected readonly total = signal(0);
  protected readonly limit = signal(20);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly subscribing = signal(false);
  protected readonly subscriptionError = signal<string | null>(null);

  protected readonly submitting = signal(false);
  protected readonly replyError = signal<string | null>(null);
  protected readonly contentError = signal<string | null>(null);
  /** Annonce lue par les lecteurs d'écran (aria-live) */
  protected readonly announcement = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    content: ['', [Validators.required, Validators.minLength(FORUM_LIMITS.contentMin), Validators.maxLength(FORUM_LIMITS.contentMax)]],
  });

  private loadSub?: Subscription;
  /** Message à mettre en focus après rechargement (réponse publiée) */
  private focusPostId: number | null = null;

  constructor() {
    effect(() => this.load(this.topicId(), this.currentPage()));
  }

  protected get returnUrl(): string {
    return this.router.url;
  }

  /** Le premier message (ouverture du sujet) n'existe qu'en page 1 */
  protected isOpening(index: number): boolean {
    return this.currentPage() === 1 && index === 0;
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], { queryParams: { page: page > 1 ? page : null }, queryParamsHandling: 'merge' });
  }

  protected toggleSubscription(): void {
    const topic = this.topic();
    if (!topic || this.subscribing()) {
      return;
    }
    this.subscribing.set(true);
    this.subscriptionError.set(null);

    const request$ = topic.isSubscribed ? this.forum.unsubscribe(topic.id) : this.forum.subscribe(topic.id);
    request$.subscribe({
      next: ({ isSubscribed }) => {
        this.topic.update((t) => (t ? { ...t, isSubscribed } : t));
        this.subscribing.set(false);
        this.announcement.set(
          isSubscribed ? 'Vous suivez ce sujet : vous serez prévenu des nouvelles réponses.' : 'Vous ne suivez plus ce sujet.',
        );
      },
      error: (err: unknown) => {
        this.subscribing.set(false);
        this.subscriptionError.set(apiErrorMessage(err, 'Impossible de modifier le suivi du sujet.'));
      },
    });
  }

  protected contentFieldError(): string | null {
    const server = this.contentError();
    if (server) {
      return server;
    }
    const control = this.form.controls.content;
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Le message est obligatoire.';
    }
    if (control.hasError('minlength')) {
      return `Le message doit contenir au moins ${FORUM_LIMITS.contentMin} caractères.`;
    }
    return `Le message ne peut dépasser ${FORUM_LIMITS.contentMax} caractères.`;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.replyError.set(null);
    this.contentError.set(null);
    this.announcement.set('');

    this.forum.reply(this.topicId(), this.form.controls.content.value).subscribe({
      next: (post) => {
        this.submitting.set(false);
        this.form.reset();
        this.announcement.set('Votre réponse a été publiée.');
        this.focusPostId = post.id;
        // L'auteur est abonné automatiquement côté serveur
        this.topic.update((t) => (t ? { ...t, isSubscribed: true } : t));

        const lastPage = Math.max(1, Math.ceil((this.total() + 1) / this.limit()));
        if (lastPage === this.currentPage()) {
          this.load(this.topicId(), lastPage);
        } else {
          this.goToPage(lastPage);
        }
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        if (status === 422) {
          const violations = apiViolations(err);
          this.contentError.set(violations['content'] ?? null);
          this.replyError.set(violations['content'] ? 'Votre réponse n’a pas pu être publiée : corrigez le message.' : apiErrorMessage(err));
        } else if (status === 403) {
          this.replyError.set(apiErrorMessage(err, 'Ce sujet est verrouillé : il n’accepte plus de réponses.'));
          this.topic.update((t) => (t ? { ...t, isLocked: true } : t));
        } else if (status === 429) {
          this.replyError.set(apiErrorMessage(err, 'Vous publiez trop vite : patientez une minute.'));
        } else if (status === 401) {
          this.replyError.set('Votre session a expiré : reconnectez-vous pour répondre.');
        } else {
          this.replyError.set(apiErrorMessage(err, 'Impossible de publier votre réponse.'));
        }
      },
    });
  }

  private load(id: number, page: number): void {
    this.loadSub?.unsubscribe();
    this.loading.set(true);
    this.notFound.set(false);
    this.error.set(null);

    if (!Number.isInteger(id) || id <= 0) {
      this.showNotFound();
      return;
    }

    this.loadSub = this.forum.getTopic(id, page).subscribe({
      next: (result) => {
        this.topic.set(result.topic);
        this.posts.set(result.items);
        this.pages.set(result.pages);
        this.total.set(result.total);
        this.limit.set(result.limit || 20);
        this.loading.set(false);
        this.title.setTitle(`${result.topic.title} — Forum — Poker Winners`);
        this.focusNewPost();
      },
      error: (err: unknown) => {
        this.loading.set(false);
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.showNotFound();
          return;
        }
        this.error.set(apiErrorMessage(err, 'Impossible de charger le sujet.'));
      },
    });
  }

  private showNotFound(): void {
    this.loading.set(false);
    this.topic.set(null);
    this.notFound.set(true);
    this.title.setTitle('Sujet introuvable — Poker Winners');
  }

  /** Après publication : amène le focus (et la vue) sur le nouveau message */
  private focusNewPost(): void {
    const postId = this.focusPostId;
    if (postId === null) {
      return;
    }
    this.focusPostId = null;
    afterNextRender(
      () => {
        const el = document.getElementById(`post-${postId}`);
        el?.focus();
        el?.scrollIntoView({ block: 'center' });
      },
      { injector: this.injector },
    );
  }
}
