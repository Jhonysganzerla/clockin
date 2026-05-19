import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule,
    MatButtonModule, MatMenuModule, TranslateModule
  ],
  template: `
    <mat-sidenav-container style="height:100vh">
      <mat-sidenav mode="side" opened style="width:220px">
        <mat-nav-list>
          <a mat-list-item routerLink="/home" routerLinkActive="active">
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>{{ 'nav.home' | translate }}</span>
          </a>
          <a mat-list-item routerLink="/entries" routerLinkActive="active">
            <mat-icon matListItemIcon>schedule</mat-icon>
            <span matListItemTitle>{{ 'nav.timeEntries' | translate }}</span>
          </a>
          <a mat-list-item routerLink="/report" routerLinkActive="active">
            <mat-icon matListItemIcon>assessment</mat-icon>
            <span matListItemTitle>{{ 'nav.report' | translate }}</span>
          </a>
          @if (auth.isAdmin()) {
            <a mat-list-item routerLink="/users" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>{{ 'nav.users' | translate }}</span>
            </a>
            <a mat-list-item routerLink="/holidays" routerLinkActive="active">
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>{{ 'nav.holidays' | translate }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>{{ 'app.title' | translate }}</span>
          <span class="spacer"></span>

          <button mat-icon-button [matMenuTriggerFor]="langMenu" [attr.aria-label]="'app.language' | translate">
            <mat-icon>language</mat-icon>
          </button>
          <mat-menu #langMenu="matMenu">
            <button mat-menu-item (click)="setLang('en')">English</button>
            <button mat-menu-item (click)="setLang('pt-BR')">Português (BR)</button>
          </mat-menu>

          <button mat-icon-button (click)="logout()" [attr.aria-label]="'app.logout' | translate">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .active { background: rgba(0,0,0,0.08); }
    .spacer { flex: 1 1 auto; }
  `]
})
export class ShellComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  setLang(lang: 'en' | 'pt-BR'): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
