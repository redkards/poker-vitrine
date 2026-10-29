import { Component, computed, input, linkedSignal, output, ChangeDetectionStrategy } from '@angular/core';
import { QuizQuestion } from '../lessons.data';

/**
 * Quiz de fin de leçon : correction immédiate et expliquée, score final, recommencer.
 */
@Component({
  selector: 'app-lesson-quiz',
  templateUrl: './lesson-quiz.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './lesson-quiz.component.scss',
})
export class LessonQuizComponent {
  readonly questions = input.required<QuizQuestion[]>();
  readonly completed = output<number>();

  protected readonly current = linkedSignal(() => (this.questions(), 0));
  protected readonly answers = linkedSignal<(number | null)[]>(() => this.questions().map(() => null));
  protected readonly finished = linkedSignal(() => (this.questions(), false));

  protected readonly question = computed(() => this.questions()[this.current()]);
  protected readonly chosen = computed(() => this.answers()[this.current()]);
  protected readonly score = computed(() =>
    this.answers().reduce<number>((n, a, i) => (a === this.questions()[i].answer ? n + 1 : n), 0),
  );
  protected readonly isLast = computed(() => this.current() === this.questions().length - 1);
  protected readonly letters = ['A', 'B', 'C', 'D'];

  protected choose(index: number): void {
    if (this.chosen() !== null) {
      return;
    }
    this.answers.update((list) => list.map((a, i) => (i === this.current() ? index : a)));
  }

  protected next(): void {
    if (this.isLast()) {
      this.finished.set(true);
      this.completed.emit(this.score());
    } else {
      this.current.update((i) => i + 1);
    }
  }

  protected restart(): void {
    this.answers.set(this.questions().map(() => null));
    this.current.set(0);
    this.finished.set(false);
  }

  protected state(index: number): 'good' | 'bad' | null {
    const chosen = this.chosen();
    if (chosen === null) {
      return null;
    }
    if (index === this.question().answer) {
      return 'good';
    }
    return index === chosen ? 'bad' : null;
  }

  protected verdict(): string {
    const s = this.score();
    const n = this.questions().length;
    if (s === n) {
      return 'Sans faute, bravo !';
    }
    return s >= n - 1 ? 'Très bien, presque parfait.' : 'Relisez les étapes et retentez votre chance.';
  }
}
