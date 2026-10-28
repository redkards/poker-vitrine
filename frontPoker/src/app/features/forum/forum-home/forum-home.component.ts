import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../../core/api/api.service';
import { ForumCategory } from '../../../core/api/forum.models';
import { ForumService } from '../../../core/api/forum.service';
import { ForumDatePipe } from '../forum-date.pipe';

/**
 * UC3 — Accueil du forum : liste des catégories
 */
@Component({
  selector: 'app-forum-home',
  imports: [RouterLink, ForumDatePipe],
  templateUrl: './forum-home.component.html',
  styleUrl: './forum-home.component.scss',
})
export class ForumHomeComponent implements OnInit {
  private readonly forum = inject(ForumService);

  protected readonly categories = signal<ForumCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.forum.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(apiErrorMessage(err, 'Impossible de charger le forum.'));
        this.loading.set(false);
      },
    });
  }
}
