import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@app/core/auth/auth.service';
import { EntryService } from '@app/features/entries/entry.service';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="home">
      <header class="hero">
        <p class="hero__greeting">
          {{ greeting() | translate }},
          <strong>{{ auth.session()?.nome }}</strong> 👋
        </p>
        <h1 class="hero__title">{{ 'home.heroTitle' | translate }}</h1>

        <div class="clock">
          <div class="clock__time">{{ timeStr() }}</div>
          <div class="clock__date">{{ dateStr() }}</div>
        </div>
      </header>

      <section class="cta">
        <button
          class="cta__btn"
          mat-flat-button
          color="primary"
          (click)="clockIn()"
          [disabled]="loading()">
          <mat-icon>fingerprint</mat-icon>
          <span>{{ 'home.clockIn' | translate }}</span>
        </button>
        <p class="cta__hint">{{ 'home.clockInHint' | translate }}</p>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .home {
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 24px 64px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
    }

    /* Hero */
    .hero {
      width: 100%;
      background: var(--g-hero);
      border-radius: var(--r-xl);
      padding: 40px 32px 32px;
      text-align: center;
      box-shadow: var(--sh-md);
      border: 1px solid var(--c-border);
    }
    .hero__greeting {
      font-size: 1rem;
      color: var(--c-text-muted);
      margin: 0 0 4px;
    }
    .hero__greeting strong { color: var(--c-text); font-weight: 600; }
    .hero__title {
      font-size: 1.5rem;
      margin: 0 0 24px;
      color: var(--c-text);
    }

    .clock {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .clock__time {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: clamp(3rem, 8vw, 5rem);
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1;
      background: var(--g-brand);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-variant-numeric: tabular-nums;
    }
    .clock__date {
      font-size: 0.9375rem;
      color: var(--c-text-muted);
      text-transform: capitalize;
      letter-spacing: 0.01em;
    }

    /* CTA */
    .cta {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .cta__btn.mat-mdc-unelevated-button {
      min-width: 320px;
      height: 88px;
      font-size: 1.375rem;
      font-weight: 600;
      padding: 0 40px;
      border-radius: var(--r-full) !important;
      display: inline-flex;
      gap: 14px;
      align-items: center;
      justify-content: center;
      box-shadow: var(--sh-lg);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .cta__btn.mat-mdc-unelevated-button:not([disabled]):hover {
      transform: translateY(-2px);
      box-shadow: 0 18px 36px -10px rgb(79 70 229 / 0.5);
    }
    .cta__btn.mat-mdc-unelevated-button:not([disabled]):active {
      transform: translateY(0);
    }
    .cta__btn mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }
    .cta__hint {
      color: var(--c-text-soft);
      font-size: 0.875rem;
      margin: 0;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  protected auth = inject(AuthService);
  private entries = inject(EntryService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  protected loading = signal(false);
  protected now = signal(new Date());

  private tickHandle?: number;

  protected timeStr = computed(() => {
    const d = this.now();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  });

  protected dateStr = computed(() => {
    const d = this.now();
    const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
    return d.toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : 'en-US', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  });

  protected greeting = computed(() => {
    const h = this.now().getHours();
    if (h < 12) return 'home.morning';
    if (h < 18) return 'home.afternoon';
    return 'home.evening';
  });

  ngOnInit(): void {
    this.tickHandle = window.setInterval(() => this.now.set(new Date()), 1000);
  }

  ngOnDestroy(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
  }

  clockIn(): void {
    const uid = this.auth.session()?.id;
    if (!uid) return;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    this.loading.set(true);
    this.entries.save({
      id: null,
      data: `${y}-${m}-${d}`,
      hora: `${hh}:${mm}:${ss}`,
      usuario: { id: uid }
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open(
          `${this.translate.instant('home.clockedIn')} ${hh}:${mm}:${ss}`,
          'OK',
          { duration: 3000 }
        );
      },
      error: () => {
        this.loading.set(false);
        this.snack.open(this.translate.instant('common.error'), 'OK', { duration: 3000 });
      }
    });
  }
}
