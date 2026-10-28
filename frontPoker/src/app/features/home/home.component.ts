import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { FEATURED_SLIDES, HOME_STATS, LATEST_NEWS } from './home.data';

const AUTOPLAY_MS = 6000;

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly slides = FEATURED_SLIDES;
  protected readonly stats = HOME_STATS;
  protected readonly news = LATEST_NEWS;

  protected readonly current = signal(0);
  protected readonly slide = computed(() => this.slides[this.current()]);

  /** Visuel fourni par le propriétaire du projet : public/images/hero.webp */
  protected readonly heroImageFailed = signal(false);

  private paused = false;

  ngOnInit(): void {
    const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return;
    }
    const timer = setInterval(() => !this.paused && this.next(), AUTOPLAY_MS);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  protected next(): void {
    this.current.update((i) => (i + 1) % this.slides.length);
  }

  protected prev(): void {
    this.current.update((i) => (i - 1 + this.slides.length) % this.slides.length);
  }

  protected goTo(index: number): void {
    this.current.set(index);
  }

  protected setPaused(paused: boolean): void {
    this.paused = paused;
  }

  protected pad(n: number): string {
    return String(n + 1).padStart(2, '0');
  }
}
