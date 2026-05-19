import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Holiday, HolidayService } from './holiday.service';

@Component({
  selector: 'app-holidays-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <div class="page">
      <div class="row">
        <h1>{{ 'holiday.title' | translate }}</h1>
        <span class="spacer"></span>
        <a mat-flat-button color="primary" routerLink="/holidays/0">
          <mat-icon>add</mat-icon> {{ 'common.new' | translate }}
        </a>
      </div>
      <table mat-table [dataSource]="rows()" class="full-width mat-elevation-z1">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>{{ 'common.id' | translate }}</th>
          <td mat-cell *matCellDef="let h">{{ h.id }}</td>
        </ng-container>
        <ng-container matColumnDef="dataf">
          <th mat-header-cell *matHeaderCellDef>{{ 'holiday.date' | translate }}</th>
          <td mat-cell *matCellDef="let h">{{ h.dataf | date:'shortDate' }}</td>
        </ng-container>
        <ng-container matColumnDef="descricao">
          <th mat-header-cell *matHeaderCellDef>{{ 'holiday.description' | translate }}</th>
          <td mat-cell *matCellDef="let h">{{ h.descricao }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="actions-cell">{{ 'common.actions' | translate }}</th>
          <td mat-cell *matCellDef="let h" class="actions-cell">
            <a mat-icon-button [routerLink]="['/holidays', h.id]"><mat-icon>edit</mat-icon></a>
            <button mat-icon-button (click)="remove(h)"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols;"></tr>
      </table>
    </div>
  `
})
export class HolidaysListComponent implements OnInit {
  private api = inject(HolidayService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  protected rows = signal<Holiday[]>([]);
  protected cols = ['id', 'dataf', 'descricao', 'actions'];

  ngOnInit(): void { this.load(); }
  private load(): void { this.api.list().subscribe(v => this.rows.set(v)); }

  remove(h: Holiday): void {
    if (!h.id || !confirm(this.translate.instant('common.confirmDelete'))) return;
    this.api.delete(h.id).subscribe(() => {
      this.snack.open(this.translate.instant('common.deleted'), 'OK', { duration: 2000 });
      this.load();
    });
  }
}
