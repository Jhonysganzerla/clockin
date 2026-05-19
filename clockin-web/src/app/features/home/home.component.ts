import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
    <div class="page home">
      <h1>{{ 'app.title' | translate }}</h1>
      @if (auth.session(); as s) {
        <p class="hello">👋 {{ s.nome }}</p>
      }
      <div class="clockin-wrap">
        <button
          mat-flat-button
          color="primary"
          class="clockin-btn"
          (click)="clockIn()"
          [disabled]="loading()">
          <mat-icon>schedule</mat-icon>
          <span>{{ 'home.clockIn' | translate }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .home { display: flex; flex-direction: column; align-items: center; }
    .hello { font-size: 1.1rem; margin-bottom: 2rem; }
    .clockin-wrap {
      display: flex; justify-content: center; align-items: center;
      width: 100%; margin-top: 2rem;
    }
    .clockin-btn {
      min-width: 280px;
      min-height: 120px;
      font-size: 1.6rem;
      padding: 0 3rem;
      border-radius: 16px;
      display: inline-flex;
      gap: 0.75rem;
      align-items: center;
    }
    .clockin-btn mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }
  `]
})
export class HomeComponent {
  protected auth = inject(AuthService);
  private entries = inject(EntryService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  protected loading = signal(false);

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
