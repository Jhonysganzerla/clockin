import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from './user.service';
import { User } from './user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="page">
      <div class="row">
        <h1>{{ 'user.title' | translate }}</h1>
        <span class="spacer"></span>
        <a mat-flat-button color="primary" routerLink="/users/0">
          <mat-icon>add</mat-icon> {{ 'common.new' | translate }}
        </a>
      </div>

      <table mat-table [dataSource]="users()" class="full-width mat-elevation-z1">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>{{ 'common.id' | translate }}</th>
          <td mat-cell *matCellDef="let u">{{ u.id }}</td>
        </ng-container>
        <ng-container matColumnDef="login">
          <th mat-header-cell *matHeaderCellDef>{{ 'user.login' | translate }}</th>
          <td mat-cell *matCellDef="let u">{{ u.login }}</td>
        </ng-container>
        <ng-container matColumnDef="nome">
          <th mat-header-cell *matHeaderCellDef>{{ 'user.name' | translate }}</th>
          <td mat-cell *matCellDef="let u">{{ u.nome }}</td>
        </ng-container>
        <ng-container matColumnDef="admin">
          <th mat-header-cell *matHeaderCellDef>{{ 'user.admin' | translate }}</th>
          <td mat-cell *matCellDef="let u">{{ u.admin ? '✓' : '' }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="actions-cell">{{ 'common.actions' | translate }}</th>
          <td mat-cell *matCellDef="let u" class="actions-cell">
            <a mat-icon-button [routerLink]="['/users', u.id]"><mat-icon>edit</mat-icon></a>
            <button mat-icon-button (click)="remove(u)"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols;"></tr>
      </table>
    </div>
  `
})
export class UsersListComponent implements OnInit {
  private api = inject(UserService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  protected users = signal<User[]>([]);
  protected cols = ['id', 'login', 'nome', 'admin', 'actions'];

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.api.list().subscribe(v => this.users.set(v));
  }

  remove(u: User): void {
    if (!u.id) return;
    if (!confirm(this.translate.instant('common.confirmDelete'))) return;
    this.api.delete(u.id).subscribe(() => {
      this.snack.open(this.translate.instant('common.deleted'), 'OK', { duration: 2000 });
      this.load();
    });
  }
}
