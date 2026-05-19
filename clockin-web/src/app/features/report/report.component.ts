import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { ReportResponse, ReportService } from './report.service';
import { UserService } from '../users/user.service';
import { User } from '../users/user.model';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-report',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatCardModule, TranslateModule
  ],
  template: `
    <div class="page">
      <h1>{{ 'report.title' | translate }}</h1>

      <mat-card>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="search()" class="row" style="flex-wrap:wrap">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'report.from' | translate }}</mat-label>
              <input matInput [matDatepicker]="p1" formControlName="dataIni" required>
              <mat-datepicker-toggle matIconSuffix [for]="p1"></mat-datepicker-toggle>
              <mat-datepicker #p1></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>{{ 'report.to' | translate }}</mat-label>
              <input matInput [matDatepicker]="p2" formControlName="dataFin" required>
              <mat-datepicker-toggle matIconSuffix [for]="p2"></mat-datepicker-toggle>
              <mat-datepicker #p2></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>{{ 'report.user' | translate }}</mat-label>
              <mat-select formControlName="usuarioId" required>
                @for (u of users(); track u.id) {
                  <mat-option [value]="u.id">{{ u.nome || u.login }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
              <mat-icon>search</mat-icon> {{ 'report.search' | translate }}
            </button>
            <button mat-stroked-button type="button" (click)="download()" [disabled]="form.invalid">
              <mat-icon>picture_as_pdf</mat-icon> {{ 'report.print' | translate }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      @if (result(); as r) {
        <mat-card style="margin-top:16px">
          <mat-card-content>
            <table class="report-table">
              <thead>
                <tr>
                  <th>{{ 'report.day' | translate }}</th>
                  @for (i of columnPairs(); track i) {
                    <th>{{ (i % 2 === 0 ? 'report.in' : 'report.out') | translate }}</th>
                  }
                  <th>{{ 'report.extra' | translate }}</th>
                  <th>{{ 'report.missing' | translate }}</th>
                  <th>{{ 'report.worked' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (d of r.pontosAgrupados; track d.dia) {
                  <tr [class.weekend]="d.auxDia === 'S' || d.auxDia === 'D'"
                      [class.holiday]="d.auxDia === 'F'"
                      [class.incomplete]="d.auxDia === '*'">
                    <td>{{ d.auxDia }} {{ d.dia | date:'shortDate' }}</td>
                    @for (b of d.pontos; track $index) {
                      <td>{{ b.hora || '—' }}</td>
                    }
                    <td>{{ d.sextra }}</td>
                    <td>{{ d.sfalta }}</td>
                    <td>{{ d.shrtrab }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td [attr.colspan]="columnPairs().length + 1"><strong>{{ 'report.totals' | translate }}</strong></td>
                  <td>{{ r.sconsultextra }}</td>
                  <td>{{ r.sconsultfalta }}</td>
                  <td>{{ r.sconsultotal }}</td>
                </tr>
                <tr>
                  <td [attr.colspan]="columnPairs().length + 3" style="text-align:right">
                    <strong>{{ 'report.monthBalance' | translate }} —
                      {{ (r.totalMes > 0 ? 'report.missingLabel' : 'report.overLabel') | translate }}:</strong>
                  </td>
                  <td><strong>{{ r.stotalMes }}h</strong></td>
                </tr>
              </tfoot>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .report-table { width: 100%; border-collapse: collapse; }
    .report-table th, .report-table td { border: 1px solid #ddd; padding: 6px 10px; text-align: center; }
    .report-table thead th { background: #f5f5f5; }
    tr.weekend { background: #fafafa; }
    tr.holiday { background: #fff3e0; }
    tr.incomplete { background: #ffebee; }
  `]
})
export class ReportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ReportService);
  private usersApi = inject(UserService);
  private auth = inject(AuthService);

  protected users = signal<User[]>([]);
  protected result = signal<ReportResponse | null>(null);

  protected columnPairs = computed(() => {
    const r = this.result();
    if (!r || !r.pontosAgrupados.length) return [];
    const max = Math.max(...r.pontosAgrupados.map(d => d.pontos.length));
    return Array.from({ length: max }, (_, i) => i);
  });

  protected form = this.fb.nonNullable.group({
    dataIni: [null as Date | null, Validators.required],
    dataFin: [null as Date | null, Validators.required],
    usuarioId: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    this.usersApi.list().subscribe(v => {
      this.users.set(v);
      const me = this.auth.session();
      if (me && v.find(u => u.id === me.id)) {
        this.form.patchValue({ usuarioId: me.id });
      }
    });
  }

  search(): void {
    const req = this.payload();
    if (!req) return;
    this.api.search(req).subscribe(r => this.result.set(r));
  }

  download(): void {
    const req = this.payload();
    if (!req) return;
    this.api.pdf(req).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clockin-${req.dataIni}-${req.dataFin}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  private payload() {
    if (this.form.invalid) return null;
    const v = this.form.getRawValue();
    return {
      dataIni: this.toIso(v.dataIni!),
      dataFin: this.toIso(v.dataFin!),
      usuario: { id: v.usuarioId! }
    };
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
