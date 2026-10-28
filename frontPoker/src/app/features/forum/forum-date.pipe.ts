import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Date d'activité du forum : relative si récente (« il y a 5 min »), formatée sinon.
 */
@Pipe({ name: 'forumDate' })
export class ForumDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    const diff = Date.now() - date.getTime();

    if (Number.isNaN(diff)) {
      return '';
    }
    if (diff < MINUTE) {
      return "à l'instant";
    }
    if (diff < HOUR) {
      return `il y a ${Math.floor(diff / MINUTE)} min`;
    }
    if (diff < DAY) {
      const hours = Math.floor(diff / HOUR);
      return `il y a ${hours} h`;
    }
    if (diff < 2 * DAY) {
      return `hier à ${formatDate(date, 'HH:mm', 'fr')}`;
    }
    return formatDate(date, "d MMM y 'à' HH:mm", 'fr');
  }
}
