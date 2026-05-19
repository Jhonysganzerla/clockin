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
      <mat-card class="login-card">
        @if (loading()) { <mat-progress-bar mode="indeterminate"></mat-progress-bar> }
        <mat-card-content>
          <h2>{{ 'login.title' | translate }}</h2>
          <form [formGroup]="form" (ngSubmit)="submit()" class="col">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'login.username' | translate }}</mat-label>
              <input matInput formControlName="nome" autocomplete="username">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'login.password' | translate }}</mat-label>
              <input matInput type="password" formControlName="senha" autocomplete="current-password">
            </mat-form-field>
            @if (error()) { <p class="error">{{ 'login.invalid' | translate }}</p> }
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              {{ 'login.submit' | translate }}
            </button>
          </form>
          <div class="lang-row">
            <button mat-button (click)="setLang('en')">English</button>
            <button mat-button (click)="setLang('pt-BR')">Português</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrap { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f5f5f5; }
    .login-card { width: 360px; }
    .error { color: #b00020; margin: 4px 0; }
    .lang-row { display:flex; justify-content:center; margin-top: 8px; gap: 8px; }
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
