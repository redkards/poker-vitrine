import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LESSON_LEVELS, LessonSummary, lessonsByLevel } from '../lessons.data';
import { AuthService } from '../../../core/auth/auth.service';
import { LessonProgressService } from '../lesson-progress.service';
import { PlayingCardComponent } from '../components/playing-card.component';

/**
 * Rubrique « Apprendre et se perfectionner » : /lecons
 */
@Component({
  selector: 'app-lesson-list',
  imports: [RouterLink, PlayingCardComponent],
  templateUrl: './lesson-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './lesson-list.component.scss',
})
export class LessonListComponent {
  private readonly progress = inject(LessonProgressService);
  private readonly auth = inject(AuthService);
  /** Leçons groupées par niveau (Débutant, Intermédiaire, Expert), triées par ordre */
  protected readonly sections = LESSON_LEVELS.map((level) => ({ ...level, lessons: lessonsByLevel(level.value) })).filter((s) => s.lessons.length > 0);

  /** Leçon Premium inaccessible au visiteur courant (anonyme ou membre non abonné) */
  protected isLocked(lesson: LessonSummary): boolean {
    return lesson.premium && !this.auth.user()?.premium;
  }

  protected status(lesson: LessonSummary): string {
    const p = this.progress.all()[lesson.slug];
    if (p?.done) {
      return `Terminée · quiz ${p.best ?? 0}/${lesson.quizCount}`;
    }
    if (p && p.step > 0) {
      return p.step >= lesson.stepCount ? 'En cours · quiz' : `En cours · étape ${p.step + 1}/${lesson.stepCount}`;
    }
    return 'Nouvelle';
  }
}
