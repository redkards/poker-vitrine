import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LESSON_LEVELS, Lesson, lessonsByLevel } from '../lessons.data';
import { LessonProgressService } from '../lesson-progress.service';
import { PlayingCardComponent } from '../components/playing-card.component';

/**
 * Rubrique « Apprendre et se perfectionner » : /lecons
 */
@Component({
  selector: 'app-lesson-list',
  imports: [RouterLink, PlayingCardComponent],
  templateUrl: './lesson-list.component.html',
  styleUrl: './lesson-list.component.scss',
})
export class LessonListComponent {
  private readonly progress = inject(LessonProgressService);
  /** Leçons groupées par niveau (Débutant, Intermédiaire, Expert), triées par ordre */
  protected readonly sections = LESSON_LEVELS.map((level) => ({ ...level, lessons: lessonsByLevel(level.value) })).filter((s) => s.lessons.length > 0);

  protected status(lesson: Lesson): string {
    const p = this.progress.all()[lesson.slug];
    if (p?.done) {
      return `Terminée · quiz ${p.best ?? 0}/${lesson.quiz.length}`;
    }
    if (p && p.step > 0) {
      return p.step >= lesson.steps.length ? 'En cours · quiz' : `En cours · étape ${p.step + 1}/${lesson.steps.length}`;
    }
    return 'Nouvelle';
  }
}
