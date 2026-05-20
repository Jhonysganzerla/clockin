import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const PIX_KEY = 'ac344236-c335-4f89-aee2-e671101d4619';
const PIX_PAYLOAD =
  '00020101021126580014br.gov.bcb.pix0136ac344236-c335-4f89-aee2-e671101d46195204000053039865802BR5915Jhony Sganzerla6008BRASILIA62070503***6304EEE4';

@Component({
  selector: 'app-support-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">favorite</mat-icon>
      {{ 'support.title' | translate }}
    </h2>

    <mat-dialog-content class="content">
      <p class="lead">{{ 'support.lead' | translate }}</p>

      <div class="pix-block">
        <img src="assets/pix-qr.png" alt="QR Code PIX" class="qr" />

        <div class="pix-info">
          <div class="pix-label">{{ 'support.pixKey' | translate }}</div>
          <div class="pix-value">{{ pixKey }}</div>
          <button mat-stroked-button color="primary" type="button" (click)="copy(pixKey, 'key')">
            <mat-icon>{{ copied() === 'key' ? 'check' : 'content_copy' }}</mat-icon>
            {{ (copied() === 'key' ? 'support.copied' : 'support.copyKey') | translate }}
          </button>

          <div class="pix-label" style="margin-top: 16px">{{ 'support.copyPaste' | translate }}</div>
          <button mat-flat-button color="primary" type="button" (click)="copy(payload, 'payload')">
            <mat-icon>{{ copied() === 'payload' ? 'check' : 'qr_code_2' }}</mat-icon>
            {{ (copied() === 'payload' ? 'support.copied' : 'support.copyPayload') | translate }}
          </button>

          <div class="beneficiary">
            <strong>Jhony Sganzerla</strong> · {{ 'support.freeAmount' | translate }}
          </div>
        </div>
      </div>

      <div class="sponsor">
        <a mat-button color="primary" href="https://github.com/sponsors/Jhonysganzerla" target="_blank" rel="noopener">
          <mat-icon>open_in_new</mat-icon>
          {{ 'support.sponsor' | translate }}
        </a>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'common.close' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .title-icon {
      color: #e91e63;
      vertical-align: middle;
      margin-right: 6px;
    }
    .content { min-width: 320px; max-width: 480px; }
    .lead {
      color: var(--c-text-muted);
      margin: 0 0 20px;
      line-height: 1.5;
    }
    .pix-block {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      padding: 16px;
      background: var(--c-surface-2);
      border-radius: var(--r-md);
      border: 1px solid var(--c-border);
    }
    .qr {
      width: 160px;
      height: 160px;
      border-radius: 8px;
      background: #fff;
      padding: 6px;
      flex-shrink: 0;
    }
    .pix-info { flex: 1 1 auto; min-width: 0; }
    .pix-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--c-text-soft);
      margin-bottom: 4px;
    }
    .pix-value {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.8rem;
      word-break: break-all;
      color: var(--c-text);
      margin-bottom: 8px;
      padding: 6px 8px;
      background: var(--c-surface);
      border-radius: var(--r-sm, 6px);
      border: 1px solid var(--c-border);
    }
    .beneficiary {
      margin-top: 16px;
      font-size: 0.85rem;
      color: var(--c-text-muted);
    }
    .sponsor {
      margin-top: 16px;
      text-align: center;
    }
    @media (max-width: 540px) {
      .pix-block { flex-direction: column; align-items: center; }
      .qr { width: 200px; height: 200px; }
    }
  `]
})
export class SupportDialogComponent {
  protected readonly pixKey = PIX_KEY;
  protected readonly payload = PIX_PAYLOAD;
  protected copied = signal<'key' | 'payload' | null>(null);

  constructor(
    private dialogRef: MatDialogRef<SupportDialogComponent>,
    private snack: MatSnackBar,
    private translate: TranslateService,
  ) {}

  async copy(value: string, kind: 'key' | 'payload'): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(kind);
      this.snack.open(this.translate.instant('support.copied'), '', { duration: 2000 });
      setTimeout(() => this.copied.set(null), 2500);
    } catch {
      this.snack.open(this.translate.instant('support.copyFailed'), '', { duration: 3000 });
    }
  }
}
