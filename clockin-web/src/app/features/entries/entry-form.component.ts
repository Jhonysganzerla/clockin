import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EntryService } from './entry.service';
import { UserService } from '../users/user.service';
import { User } from '../users/user.model';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-entry-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatSelectModule, MatButtonModule, MatCardModule, TranslateModule
  ],
  template: `
    <div class="page">
      <mat-card>
        <mat-card-content>
          <h1>{{ (isNew() ? 'common.new' : 'common.edit') | translate }} — {{ 'entry.title' | translate }}</h1>
          <form [formGroup]="form" (ngSubmit)="submit()" class="col">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'entry.date' | translate }}</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="data" required>
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>{{ 'entry.time' | translate }}</mat-label>
              <input matInput type="time" step="1" formControlName="hora" required>
            </mat-form-field>
            @if (isAdmin()) {
              <mat-form-field appearance="outline">
                <mat-label>{{ 'entry.user' | translate }}</mat-label>
                <mat-select formControlName="usuarioId" required>
                  @for (u of users(); track u.id) {
                    <mat-option [value]="u.id">{{ u.nome || u.login }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
            <div class="row">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                {{ 'common.save' | translate }}
              </button>
              <a mat-stroked-button routerLink="/entries">{{ 'common.cancel' | translate }}</a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class EntryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(EntryService);
  private usersApi = inject(UserService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  protected isNew = signal(true);
  protected users = signal<User[]>([]);
  protected isAdmin = this.auth.isAdmin;

  protected form = this.fb.nonNullable.group({
    id: [null as number | null],
    data: [null as Date | null, Validators.required],
    hora: ['', Validators.required],
    usuarioId: [null as number | null, Validators.required]
  });

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.usersApi.list().subscribe(v => this.users.set(v));
    } else {
      const uid = this.auth.session()?.id ?? null;
      this.form.patchValue({ usuarioId: uid });
    }
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.isNew.set(false);
      this.api.get(id).subscribe(e => {
        this.form.patchValue({
          id: e.id,
          data: new Date(e.data),
          hora: e.hora,
          usuarioId: e.usuario.id
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      id: v.id,
      data: this.toIso(v.data!),
      hora: v.hora.length === 5 ? v.hora + ':00' : v.hora,
      usuario: { id: v.usuarioId! }
    };
    this.api.save(payload as any).subscribe(() => {
      this.snack.open(this.translate.instant('common.saved'), 'OK', { duration: 2000 });
      this.router.navigate(['/entries']);
    });
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
