import { Injectable, signal } from '@angular/core';

export interface LessonProgress {
  /** Index de l'étape en cours (steps.length = quiz) */
  step: number;
  /** Leçon terminée (quiz achevé au moins une fois) */
  done: boolean;
  /** Meilleur score au quiz */
  best: number | null;
}

const KEY = 'pv_lessons_progress';

/**
 * Progression des leçons, mémorisée dans le localStorage quand il est disponible.
 * Sans stockage (navigation privée, blocage…), la progression reste en mémoire.
 */
@Injectable({ providedIn: 'root' })
export class LessonProgressService {
  private readonly state = signal<Record<string, LessonProgress>>(this.read());

  readonly all = this.state.asReadonly();

  get(slug: string): LessonProgress | undefined {
    return this.state()[slug];
  }

  saveStep(slug: string, step: number): void {
    this.patch(slug, { step });
  }

  complete(slug: string, score: number): void {
    const prev = this.get(slug);
    this.patch(slug, { done: true, best: Math.max(score, prev?.best ?? 0) });
  }

  private patch(slug: string, change: Partial<LessonProgress>): void {
    const current = this.state()[slug] ?? { step: 0, done: false, best: null };
    this.state.update((s) => ({ ...s, [slug]: { ...current, ...change } }));
    this.write();
  }

  private read(): Record<string, LessonProgress> {
    try {
      const raw = localStorage.getItem(KEY);
      const data: unknown = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, LessonProgress>) : {};
    } catch {
      return {};
    }
  }

  private write(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state()));
    } catch {
      // Stockage indisponible : la progression reste en mémoire.
    }
  }
}
