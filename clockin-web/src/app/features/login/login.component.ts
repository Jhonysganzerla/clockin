import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressBarModule, TranslateModule
  ],
  template: `
    <div class="login-wrap">
      <div class="login-card">
        @if (loading()) { <mat-progress-bar mode="indeterminate" class="login-card__bar"></mat-progress-bar> }

        <div class="login-card__brand">
          <span class="brand-mark">
            <span class="brand-mark__logo"><mat-icon>schedule</mat-icon></span>
            <span>Clockin</span>
          </span>
        </div>

        <h2 class="login-card__title">{{ 'login.title' | translate }}</h2>
        <p class="login-card__subtitle">{{ 'login.subtitle' | translate }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="col">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'login.username' | translate }}</mat-label>
            <input matInput formControlName="nome" autocomplete="username">
            <mat-icon matPrefix>person_outline</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ 'login.password' | translate }}</mat-label>
            <input matInput type="password" formControlName="senha" autocomplete="current-password">
            <mat-icon matPrefix>lock_outline</mat-icon>
          </mat-form-field>

          @if (error()) {
            <p class="login-card__error">
              <mat-icon>error_outline</mat-icon>
              {{ 'login.invalid' | translate }}
            </p>
          }

          <button mat-flat-button color="primary" type="submit"
                  class="login-card__submit"
                  [disabled]="form.invalid || loading()">
            {{ 'login.submit' | translate }}
            <mat-icon iconPositionEnd>arrow_forward</mat-icon>
          </button>
        </form>

        <div class="login-card__lang">
          <button mat-button (click)="setLang('en')">English</button>
          <span>·</span>
          <button mat-button (click)="setLang('pt-BR')">Português</button>
        </div>
      </div>

      <p class="login-foot">{{ 'login.foot' | translate }}</p>
    </div>
  `,
  styles: [`
    .login-wrap {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 24px;
      background:
        radial-gradient(1200px 500px at 10% -10%, rgba(124, 58, 237, 0.18), transparent 60%),
        radial-gradient(900px 500px at 110% 110%, rgba(245, 158, 11, 0.18), transparent 60%),
        var(--c-bg);
    }
    .login-card {
      position: relative;
      width: 100%;
      max-width: 420px;
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: var(--r-xl);
      box-shadow: var(--sh-lg);
      padding: 40px 36px 28px;
      overflow: hidden;
    }
    .login-card__bar {
      position: absolute; top: 0; left: 0; right: 0;
    }
    .login-card__brand {
      display: flex; justify-content: center;
      margin-bottom: 20px;
    }
    .login-card__title {
      text-align: center;
      margin: 0 0 4px;
      font-size: 1.5rem;
    }
    .login-card__subtitle {
      text-align: center;
      color: var(--c-text-muted);
      margin: 0 0 24px;
      font-size: 0.9375rem;
    }
    .login-card__error {
      display: flex; align-items: center; gap: 6px;
      color: var(--c-danger);
      background: rgb(239 68 68 / 0.08);
      padding: 8px 12px;
      border-radius: var(--r-md);
      margin: 0;
      font-size: 0.875rem;
    }
    .login-card__error mat-icon {
      font-size: 18px; width: 18px; height: 18px;
    }
    .login-card__submit.mat-mdc-unelevated-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 8px;
    }
    .login-card__lang {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-top: 16px;
      color: var(--c-text-soft);
    }
    .login-foot {
      margin-top: 24px;
      color: var(--c-text-soft);
      font-size: 0.8125rem;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  protected loading = signal(false);
  protected error = signal(false);

  protected form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    senha: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(false);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  setLang(lang: 'en' | 'pt-BR'): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }
}
