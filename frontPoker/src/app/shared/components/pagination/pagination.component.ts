import { Component, computed, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    @if (pages() > 1) {
      <nav class="pager" aria-label="Pagination">
        <button type="button" class="round" [disabled]="page() <= 1" (click)="change.emit(page() - 1)" aria-label="Page précédente">←</button>
        @for (p of numbers(); track p) {
          <button
            type="button"
            class="num"
            [class.is-active]="p === page()"
            [attr.aria-current]="p === page() ? 'page' : null"
            (click)="change.emit(p)"
          >
            {{ p }}
          </button>
        }
        <button type="button" class="round" [disabled]="page() >= pages()" (click)="change.emit(page() + 1)" aria-label="Page suivante">→</button>
      </nav>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    .pager {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.4rem;
      margin-top: 2.5rem;
    }
    button {
      display: grid;
      place-items: center;
      min-width: 44px;
      height: 44px;
      border: 1.5px solid var(--pv-line);
      border-radius: 999px;
      background: var(--pv-card);
      color: var(--pv-ink);
      font: 600 0.92rem var(--pv-font-body);
      cursor: pointer;
    }
    button:hover:not(:disabled) {
      border-color: var(--pv-ink);
    }
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .num.is-active {
      border-color: var(--pv-red);
      background: var(--pv-red);
      color: #fff;
    }
  `,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pages = input.required<number>();
  readonly change = output<number>();

  protected readonly numbers = computed(() => Array.from({ length: this.pages() }, (_, i) => i + 1));
}
