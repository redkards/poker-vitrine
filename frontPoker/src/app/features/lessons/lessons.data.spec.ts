import expertContent from '../../../../../backPoker/resources/lessons/expert.json';
import { LESSONS, LESSON_LEVELS, LESSON_SUMMARIES, findLesson } from './lessons.data';

describe('Parcours de leçons', () => {
  it('a des identifiants (slug) uniques', () => {
    const slugs = LESSON_SUMMARIES.map((l) => l.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('compte 15 leçons par niveau, numérotées de 1 à 15', () => {
    for (const { value } of LESSON_LEVELS) {
      const orders = LESSON_SUMMARIES.filter((l) => l.level === value)
        .map((l) => l.order)
        .sort((a, b) => a - b);

      expect(orders).withContext(value).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    }
  });

  it('réserve exactement le niveau Expert aux membres Premium', () => {
    for (const lesson of LESSON_SUMMARIES) {
      expect(lesson.premium).withContext(lesson.slug).toBe(lesson.level === 'avance');
    }
  });

  it("n'embarque aucun contenu Expert dans le front", () => {
    const expert = LESSON_SUMMARIES.filter((l) => l.premium);

    expect(LESSONS.some((l) => l.level === 'avance')).toBeFalse();
    expect(expert.every((l) => findLesson(l.slug) === undefined)).toBeTrue();
    expect(expert.every((l) => !('steps' in l) && !('quiz' in l))).toBeTrue();
  });

  it("décrit les leçons Expert comme l'API les sert (backPoker/resources/lessons/expert.json)", () => {
    const front = LESSON_SUMMARIES.filter((l) => l.premium).map(({ slug, title, order, stepCount, quizCount }) => ({
      slug,
      title,
      order,
      stepCount,
      quizCount,
    }));
    const api = expertContent.map(({ slug, title, order, steps, quiz }) => ({
      slug,
      title,
      order,
      stepCount: steps.length,
      quizCount: quiz.length,
    }));

    expect(front).toEqual(api);
  });

  it('propose des quiz dont la bonne réponse existe', () => {
    for (const lesson of LESSONS) {
      for (const q of lesson.quiz) {
        expect(q.options[q.answer]).withContext(`${lesson.slug} : ${q.question}`).toBeDefined();
      }
    }
  });
});
