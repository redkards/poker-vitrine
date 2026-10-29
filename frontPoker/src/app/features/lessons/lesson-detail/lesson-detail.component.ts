import { Component, ElementRef, computed, effect, inject, input, linkedSignal, untracked, viewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { findLesson } from '../lessons.data';
import { LessonProgressService } from '../lesson-progress.service';
import { StepVisualComponent } from '../components/step-visual.component';
import { LessonQuizComponent } from '../components/lesson-quiz.component';

/**
 * Détail d'une leçon : /lecons/:slug — étapes interactives puis quiz.
 */
@Component({
  selector: 'app-lesson-detail',
  imports: [RouterLink, StepVisualComponent, LessonQuizComponent],
  templateUrl: './lesson-detail.component.html',
  styleUrl: './lesson-detail.component.scss',
})
export class LessonDetailComponent {
  private readonly progress = inject(LessonProgressService);
  private readonly title = inject(Title);

  readonly slug = input.required<string>();

  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly lesson = computed(() => findLesson(this.slug()));
  /** Nombre total d'écrans : les étapes + le quiz */
  protected readonly total = computed(() => (this.lesson()?.steps.length ?? 0) + 1);

  /** Écran courant, restauré depuis la progression mémorisée quand la leçon change */
  protected readonly index = linkedSignal(() => {
    const lesson = this.lesson();
    if (!lesson) {
      return 0;
    }
    const saved = untracked(() => this.progress.get(lesson.slug)?.step ?? 0);
    return Math.min(Math.max(0, saved), lesson.steps.length);
  });

  protected readonly isQuiz = computed(() => this.index() === this.total() - 1);
  protected readonly step = computed(() => this.lesson()?.steps[this.index()]);
  /** Tableau d'un élément : recrée les visuels à chaque étape (état interne remis à zéro) */
  protected readonly stepList = computed(() => {
    const s = this.step();
    return s ? [s] : [];
  });
  protected readonly percent = computed(() => Math.round(((this.index() + 1) / this.total()) * 100));
  protected readonly announce = computed(() => {
    const lesson = this.lesson();
    if (!lesson) {
      return '';
    }
    return this.isQuiz()
      ? `Quiz final, écran ${this.total()} sur ${this.total()}.`
      : `Étape ${this.index() + 1} sur ${lesson.steps.length} : ${this.step()?.title ?? ''}.`;
  });

  constructor() {
    effect(() => {
      const lesson = this.lesson();
      this.title.setTitle(lesson ? `${lesson.title} — Leçons PokerVitrine` : 'Leçon introuvable — PokerVitrine');
    });
  }

  protected go(delta: number): void {
    const lesson = this.lesson();
    if (!lesson) {
      return;
    }
    const next = Math.min(Math.max(0, this.index() + delta), lesson.steps.length);
    if (next === this.index()) {
      return;
    }
    this.index.set(next);
    this.progress.saveStep(lesson.slug, next);
    // Place le focus sur le titre du nouvel écran pour les lecteurs d'écran et le clavier
    setTimeout(() => this.heading()?.nativeElement.focus({ preventScroll: false }));
  }

  protected restartLesson(): void {
    this.go(-this.index());
  }

  protected onQuizDone(score: number): void {
    const lesson = this.lesson();
    if (lesson) {
      this.progress.complete(lesson.slug, score);
    }
  }
}
