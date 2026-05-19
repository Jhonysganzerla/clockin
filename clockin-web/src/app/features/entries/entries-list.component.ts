import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Entry, EntryService } from './entry.service';

@Component({
  selector: 'app-entries-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="page">
      <div class="row">
        <h1>{{ 'entry.title' | translate }}</h1>
        <span class="spacer"></span>
        <a mat-flat-button color="primary" routerLink="/entries/0">
          <mat-icon>add</mat-icon> {{ 'common.new' | translate }}
        </a>
      </div>
      <table mat-table [dataSource]="rows()" class="full-width mat-elevation-z1">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>{{ 'common.id' | translate }}</th>
          <td mat-cell *matCellDef="let e">{{ e.id }}</td>
        </ng-container>
        <ng-container matColumnDef="data">
          <th mat-header-cell *matHeaderCellDef>{{ 'entry.date' | translate }}</th>
          <td mat-cell *matCellDef="let e">{{ e.data | date:'shortDate' }}</td>
        </ng-container>
        <ng-container matColumnDef="hora">
          <th mat-header-cell *matHeaderCellDef>{{ 'entry.time' | translate }}</th>
          <td mat-cell *matCellDef="let e">{{ e.hora }}</td>
        </ng-container>
        <ng-container matColumnDef="usuario">
          <th mat-header-cell *matHeaderCellDef>{{ 'entry.user' | translate }}</th>
          <td mat-cell *matCellDef="let e">{{ e.usuario?.id }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="actions-cell">{{ 'common.actions' | translate }}</th>
          <td mat-cell *matCellDef="let e" class="actions-cell">
            <a mat-icon-button [routerLink]="['/entries', e.id]"><mat-icon>edit</mat-icon></a>
            <button mat-icon-button (click)="remove(e)"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols;"></tr>
      </table>
    </div>
  `
})
export class EntriesListComponent implements OnInit {
  private api = inject(EntryService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  protected rows = signal<Entry[]>([]);
  protected cols = ['id', 'data', 'hora', 'usuario', 'actions'];

  ngOnInit(): void { this.load(); }
  private load(): void { this.api.list().subscribe(v => this.rows.set(v)); }

  remove(e: Entry): void {
    if (!e.id || !confirm(this.translate.instant('common.confirmDelete'))) return;
    this.api.delete(e.id).subscribe(() => {
      this.snack.open(this.translate.instant('common.deleted'), 'OK', { duration: 2000 });
      this.load();
    });
  }
}
