import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-phone-step',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="step">
      <div class="step__icon">🍕</div>
      <h2 class="step__title">Войти или зарегистрироваться</h2>
      <p class="step__desc">
        Введите номер телефона — мы&nbsp;отправим код подтверждения
      </p>

      <mat-form-field appearance="outline" class="step__field">
        <mat-label>Номер телефона</mat-label>
        <input
          matInput
          type="tel"
          placeholder="+7 (999) 123-45-67"
          autocomplete="tel"
          [(ngModel)]="phone"
          (keydown.enter)="submit()"
          [disabled]="loading()"
        />
      </mat-form-field>

      @if (error()) {
        <p class="step__error">{{ error() }}</p>
      }

      <button
        mat-flat-button
        class="step__btn"
        (click)="submit()"
        [disabled]="loading() || !phone.trim()"
      >
        @if (loading()) {
          <mat-spinner diameter="20" class="step__spinner" />
        } @else {
          Получить код
        }
      </button>
    </div>
  `,
  styles: [`
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 32px 32px;
      width: 100%;
    }

    .step__icon {
      font-size: 48px;
      margin-bottom: 16px;
      line-height: 1;
    }

    .step__title {
      margin: 0 0 8px;
      font-size: 22px;
      font-weight: 700;
      color: var(--fo-text);
      text-align: center;
    }

    .step__desc {
      margin: 0 0 28px;
      font-size: 14px;
      color: var(--fo-text-secondary);
      text-align: center;
      line-height: 1.5;
    }

    .step__field {
      width: 100%;
      margin-bottom: 4px;
    }

    .step__error {
      margin: 0 0 12px;
      font-size: 13px;
      color: var(--fo-error);
      text-align: center;
    }

    .step__btn {
      width: 100%;
      height: 52px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 12px !important;
      background-color: var(--fo-primary) !important;
      color: #fff !important;
      margin-top: 8px;

      &[disabled] {
        opacity: 0.6;
      }
    }

    .step__spinner {
      display: inline-block;
    }
  `],
})
export class PhoneStepComponent {
  private auth = inject(AuthService);

  protected phone = '';
  protected loading = signal(false);
  protected error = signal('');

  readonly submitted = output<string>();

  submit(): void {
    const phone = this.phone.trim();
    if (!phone || this.loading()) return;

    this.loading.set(true);
    this.error.set('');

    this.auth.sendOtp(phone).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.emit(phone);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Не удалось отправить код. Попробуйте позже');
      },
    });
  }
}
