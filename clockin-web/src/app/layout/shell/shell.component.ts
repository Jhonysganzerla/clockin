import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@app/core/auth/auth.service';
import { SupportDialogComponent } from '@app/features/support/support-dialog.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatDividerModule, MatDialogModule, TranslateModule
  ],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav mode="side" opened class="sidebar">
        <a routerLink="/home" class="sidebar__brand" [attr.aria-label]="'nav.home' | translate">
          <span class="brand-mark">
            <span class="brand-mark__logo"><mat-icon>schedule</mat-icon></span>
            <span>Clockin</span>
          </span>
        </a>

        <mat-nav-list class="sidebar__nav">
          <a mat-list-item routerLink="/home" routerLinkActive="is-active">
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>{{ 'nav.home' | translate }}</span>
          </a>
          <a mat-list-item routerLink="/entries" routerLinkActive="is-active">
            <mat-icon matListItemIcon>schedule</mat-icon>
            <span matListItemTitle>{{ 'nav.timeEntries' | translate }}</span>
          </a>
          <a mat-list-item routerLink="/report" routerLinkActive="is-active">
            <mat-icon matListItemIcon>assessment</mat-icon>
            <span matListItemTitle>{{ 'nav.report' | translate }}</span>
          </a>

          @if (auth.isAdmin()) {
            <div class="sidebar__section">{{ 'nav.admin' | translate }}</div>
            <a mat-list-item routerLink="/users" routerLinkActive="is-active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>{{ 'nav.users' | translate }}</span>
            </a>
            <a mat-list-item routerLink="/holidays" routerLinkActive="is-active">
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>{{ 'nav.holidays' | translate }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidebar__footer">
          <button type="button" class="sidebar__user" [matMenuTriggerFor]="userMenu">
            <span class="avatar">{{ initials() }}</span>
            <span class="sidebar__user-info">
              <span class="sidebar__user-name">{{ auth.session()?.nome }}</span>
              <span class="sidebar__user-role">
                {{ auth.isAdmin() ? ('user.admin' | translate) : ('user.member' | translate) }}
              </span>
            </span>
            <mat-icon class="sidebar__user-caret">expand_more</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu" xPosition="after" yPosition="above">
            <button mat-menu-item [matMenuTriggerFor]="langMenu">
              <mat-icon>language</mat-icon>
              <span>{{ 'app.language' | translate }}</span>
            </button>
            <button mat-menu-item (click)="openSupport()">
              <mat-icon style="color:#e91e63">favorite</mat-icon>
              <span>{{ 'support.menu' | translate }}</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>{{ 'app.logout' | translate }}</span>
            </button>
          </mat-menu>
          <mat-menu #langMenu="matMenu">
            <button mat-menu-item (click)="setLang('en')">English</button>
            <button mat-menu-item (click)="setLang('pt-BR')">Português (BR)</button>
          </mat-menu>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <router-outlet />
        <button
          type="button"
          class="coffee-fab"
          (click)="openSupport()"
          [attr.aria-label]="'support.menu' | translate"
          [title]="'support.menu' | translate">
          <span class="coffee-fab__icon">☕</span>
          <span class="coffee-fab__label">{{ 'support.fab' | translate }}</span>
        </button>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell { height: 100vh; background: var(--c-bg); }

    .sidebar {
      width: 256px;
      background: var(--c-surface);
      border-right: 1px solid var(--c-border);
      display: flex;
      flex-direction: column;
    }
    .sidebar__brand {
      display: block;
      padding: 20px 20px 8px;
      text-decoration: none;
      color: inherit;
      border-radius: var(--r-md);
      transition: opacity 0.15s ease;
    }
    .sidebar__brand:hover { opacity: 0.85; }
    .sidebar__brand:focus-visible {
      outline: 2px solid var(--c-primary);
      outline-offset: 2px;
    }
    .sidebar__nav { flex: 1 1 auto; padding: 8px; }
    .sidebar__section {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--c-text-soft);
      padding: 16px 12px 4px;
    }

    :host ::ng-deep .sidebar .mat-mdc-list-item {
      border-radius: var(--r-md);
      margin: 2px 0;
      color: var(--c-text-muted);
    }
    :host ::ng-deep .sidebar .mat-mdc-list-item mat-icon {
      color: var(--c-text-soft);
    }
    :host ::ng-deep .sidebar .mat-mdc-list-item:hover {
      background: var(--c-surface-2);
    }
    :host ::ng-deep .sidebar .mat-mdc-list-item.is-active {
      background: var(--c-primary-soft);
      color: var(--c-primary);
    }
    :host ::ng-deep .sidebar .mat-mdc-list-item.is-active mat-icon,
    :host ::ng-deep .sidebar .mat-mdc-list-item.is-active .mdc-list-item__primary-text {
      color: var(--c-primary);
      font-weight: 600;
    }

    .sidebar__footer {
      padding: 12px;
      border-top: 1px solid var(--c-border);
    }
    .sidebar__user {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      padding: 8px 10px;
      border-radius: var(--r-md);
      background: transparent;
      border: none;
      cursor: pointer;
      font: inherit;
      color: inherit;
      text-align: left;
      transition: background 0.15s ease;
    }
    .sidebar__user:hover { background: var(--c-surface-2); }
    .sidebar__user:focus-visible {
      outline: 2px solid var(--c-primary);
      outline-offset: 2px;
    }
    .avatar {
      width: 36px; height: 36px;
      border-radius: var(--r-full);
      background: var(--g-brand);
      color: #fff;
      display: inline-flex;
      align-items: center; justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    .sidebar__user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
      flex: 1 1 auto;
      overflow: hidden;
    }
    .sidebar__user-name {
      font-weight: 600;
      color: var(--c-text);
      font-size: 0.875rem;
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sidebar__user-role {
      color: var(--c-text-soft);
      font-size: 0.75rem;
    }
    .sidebar__user-caret {
      color: var(--c-text-soft);
      flex-shrink: 0;
    }

    .content {
      background: var(--c-bg);
      overflow-y: auto;
      position: relative;
    }

    .coffee-fab {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 100;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px 8px 10px;
      border: 1px solid var(--c-border);
      background: var(--c-surface);
      color: var(--c-text-muted);
      border-radius: var(--r-full, 999px);
      font: inherit;
      font-size: 0.8rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      opacity: 0.7;
      transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
    }
    .coffee-fab:hover {
      opacity: 1;
      color: var(--c-text);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
    }
    .coffee-fab:focus-visible {
      outline: 2px solid var(--c-primary);
      outline-offset: 2px;
      opacity: 1;
    }
    .coffee-fab__icon { font-size: 1rem; line-height: 1; }
    .coffee-fab__label { white-space: nowrap; }

    @media (max-width: 600px) {
      .coffee-fab__label { display: none; }
      .coffee-fab { padding: 10px; }
    }
  `]
})
export class ShellComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  openSupport(): void {
    this.dialog.open(SupportDialogComponent, { panelClass: 'support-dialog' });
  }

  protected initials = computed(() => {
    const name = this.auth.session()?.nome ?? '';
    return name.trim().split(/\s+/).map(p => p[0] ?? '').slice(0, 2).join('').toUpperCase() || '?';
  });

  setLang(lang: 'en' | 'pt-BR'): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
