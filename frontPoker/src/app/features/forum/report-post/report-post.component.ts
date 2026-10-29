import { Component, ElementRef, Injector, afterNextRender, inject, input, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiErrorMessage, apiViolations } from '../../../core/api/api.service';
import { REPORT_COMMENT_MAX, REPORT_REASONS, ReportReason } from '../../../core/api/forum.models';
import { ForumService } from '../../../core/api/forum.service';

type ReportState = 'idle' | 'open' | 'done';

/**
 * v1.1 — Signalement d'un message du forum à la modération.
 * Affiché uniquement pour un membre connecté, sur les messages des autres (contrôlé par le parent).
 */
@Component({
  selector: 'app-report-post',
  imports: [ReactiveFormsModule],
  templateUrl: './report-post.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './report-post.component.scss',
})
export class ReportPostComponent {
  private readonly forum = inject(ForumService);
  private readonly injector = inject(Injector);

  readonly postId = input.required<number>();

  protected readonly reasons = REPORT_REASONS;
  protected readonly commentMax = REPORT_COMMENT_MAX;
  protected readonly state = signal<ReportState>('idle');
  protected readonly sending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly confirmation = signal<string | null>(null);

  private readonly firstReason = viewChild<ElementRef<HTMLInputElement>>('firstReason');
  private readonly toggleButton = viewChild<ElementRef<HTMLButtonElement>>('toggle');

  protected readonly form = inject(NonNullableFormBuilder).group({
    reason: ['' as ReportReason | '', Validators.required],
    comment: ['', Validators.maxLength(REPORT_COMMENT_MAX)],
  });

  protected open(): void {
    this.state.set('open');
    this.error.set(null);
    afterNextRender(() => this.firstReason()?.nativeElement.focus(), { injector: this.injector });
  }

  protected cancel(): void {
    this.state.set('idle');
    this.form.reset();
    this.error.set(null);
    afterNextRender(() => this.toggleButton()?.nativeElement.focus(), { injector: this.injector });
  }

  protected submit(): void {
    const { reason, comment } = this.form.getRawValue();
    if (this.form.invalid || !reason) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending.set(true);
    this.error.set(null);
    this.forum.reportPost(this.postId(), reason, comment).subscribe({
      next: (report) => {
        this.sending.set(false);
        this.state.set('done');
        this.confirmation.set(report.message || 'Merci, le message a été signalé à l’équipe de modération.');
      },
      error: (err: unknown) => {
        this.sending.set(false);
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        if (status === 409) {
          // Déjà signalé ou déjà masqué : inutile de laisser le formulaire ouvert
          this.state.set('done');
          this.confirmation.set(apiErrorMessage(err, 'Vous avez déjà signalé ce message.'));
        } else if (status === 429) {
          this.error.set(apiErrorMessage(err, 'Trop de signalements : réessayez plus tard.'));
        } else if (status === 422) {
          const violations = apiViolations(err);
          this.error.set(violations['comment'] ?? violations['reason'] ?? apiErrorMessage(err, 'Signalement invalide.'));
        } else if (status === 401) {
          this.error.set('Votre session a expiré : reconnectez-vous pour signaler ce message.');
        } else {
          this.error.set(apiErrorMessage(err, 'Impossible d’envoyer le signalement.'));
        }
      },
    });
  }
}
