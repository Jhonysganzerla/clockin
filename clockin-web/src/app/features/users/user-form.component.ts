import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
    MatCheckboxModule, MatButtonModule, MatIconModule, MatCardModule, TranslateModule
  ],
  template: `
    <div class="page">
      <mat-card>
        <mat-card-content>
          <h1>{{ (isNew() ? 'common.new' : 'common.edit') | translate }} — {{ 'user.title' | translate }}</h1>
          <form [formGroup]="form" (ngSubmit)="submit()" class="col">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'user.login' | translate }}</mat-label>
              <input matInput formControlName="login" required>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'user.name' | translate }}</mat-label>
              <input matInput formControlName="nome">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ 'user.password' | translate }}</mat-label>
              <input matInput type="password" formControlName="senha" autocomplete="new-password">
              @if (!isNew()) { <mat-hint>{{ 'user.passwordHint' | translate }}</mat-hint> }
            </mat-form-field>
            <div class="row">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'user.monthlyHours' | translate }}</mat-label>
                <input matInput type="number" formControlName="horames" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'user.dailyHours' | translate }}</mat-label>
                <input matInput type="number" formControlName="horadia" required>
              </mat-form-field>
            </div>
            <mat-checkbox formControlName="admin">{{ 'user.admin' | translate }}</mat-checkbox>
            <div class="row">
              <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                {{ 'common.save' | translate }}
              </button>
              <a mat-stroked-button routerLink="/users">{{ 'common.cancel' | translate }}</a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  protected isNew = signal(true);

  protected form = this.fb.nonNullable.group({
    id: [null as number | null],
    login: ['', [Validators.required, Validators.maxLength(30)]],
    nome: ['', Validators.maxLength(50)],
    senha: [''],
    horames: [220, Validators.required],
    horadia: [800, Validators.required],
    admin: [false]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : 0;
    if (id > 0) {
      this.isNew.set(false);
      this.api.get(id).subscribe(u => this.form.patchValue(u));
    } else {
      this.form.controls.senha.addValidators(Validators.required);
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    if (!val.senha) delete (val as any).senha;
    this.api.save(val as any).subscribe(() => {
      this.snack.open(this.translate.instant('common.saved'), 'OK', { duration: 2000 });
      this.router.navigate(['/users']);
    });
  }
}
