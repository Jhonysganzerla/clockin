import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HolidayService } from './holiday.service';

@Component({
  selector: 'app-holiday-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatButtonModule, MatCardModule, TranslateModule
  ],
  template: `
    <div class="page">
      <mat-card>
        <mat-card-content>
          <h1>{{ (isNew() ? 'common.new' : 'common.edit') | translate }} — {{ 'holiday.title' | translate }}</h1>
          <form [formGroup]="form" (ngSubmit)="submit()" class="col">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'holiday.date' | translate }}</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dataf" required>
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'holiday.description' | translate }}</mat-label>
              <input matInput formControlName="descricao" required maxlength="70">
            </mat-form-field>
            <div class="row">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                {{ 'common.save' | translate }}
              </button>
              <a mat-stroked-button routerLink="/holidays">{{ 'common.cancel' | translate }}</a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class HolidayFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(HolidayService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  protected isNew = signal(true);

  protected form = this.fb.nonNullable.group({
    id: [null as number | null],
    dataf: [null as Date | null, Validators.required],
    descricao: ['', [Validators.required, Validators.maxLength(70)]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.isNew.set(false);
      this.api.get(id).subscribe(h => {
        this.form.patchValue({ id: h.id, descricao: h.descricao, dataf: new Date(h.dataf) });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const payload = { ...val, dataf: this.toIso(val.dataf!) };
    this.api.save(payload as any).subscribe(() => {
      this.snack.open(this.translate.instant('common.saved'), 'OK', { duration: 2000 });
      this.router.navigate(['/holidays']);
    });
  }

  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
