import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-otp-step',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="step">
      <div class="step__icon">💬</div>
      <h2 class="step__title">Введите код из SMS</h2>
      <p class="step__desc">
        Отправили код на <strong>{{ phone() }}</strong>
      </p>

      <div class="otp-boxes" [class.otp-boxes--error]="!!error()">
        @for (digit of digits(); track $index) {
          <input
            class="otp-box"
            type="text"
            inputmode="numeric"
            maxlength="1"
            [value]="digit"
            (input)="onInput($event, $index)"
            (keydown)="onKeydown($event, $index)"
            (paste)="onPaste($event)"
            (focus)="onFocus($event)"
            [disabled]="loading()"
            autocomplete="one-time-code"
            #otpInput
          />
        }
      </div>

      @if (error()) {
        <p class="step__error">{{ error() }}</p>
      }

      <div class="resend">
        @if (countdown() > 0) {
          <span class="resend__timer">
            Отправить повторно через {{ countdown() }}&nbsp;сек
          </span>
        } @else {
          <button
            mat-button
            class="resend__btn"
            (click)="resend()"
            [disabled]="loading()"
          >
            Отправить код повторно
          </button>
        }
      </div>

      <button
        mat-flat-button
        class="step__btn"
        (click)="submit()"
        [disabled]="loading() || !allFilled()"
      >
        @if (loading()) {
          <mat-spinner diameter="20" class="step__spinner" />
        } @else {
          Подтвердить
        }
      </button>

      <button
        mat-button
        class="step__back"
        (click)="back.emit()"
        [disabled]="loading()"
      >
        ← Изменить номер
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

    .otp-boxes {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;

      &--error .otp-box {
        border-color: var(--fo-error);
        color: var(--fo-error);
      }
    }

    .otp-box {
      width: 46px;
      height: 56px;
      border: 2px solid var(--fo-border);
      border-radius: 12px;
      font-size: 24px;
      font-weight: 700;
      text-align: center;
      color: var(--fo-text);
      background: var(--fo-surface);
      outline: none;
      transition: border-color 0.15s ease;
      caret-color: transparent;

      &:focus {
        border-color: var(--fo-primary);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .step__error {
      margin: 4px 0 8px;
      font-size: 13px;
      color: var(--fo-error);
      text-align: center;
    }

    .resend {
      height: 36px;
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .resend__timer {
      font-size: 13px;
      color: var(--fo-text-secondary);
    }

    .resend__btn {
      font-size: 14px;
      color: var(--fo-primary) !important;
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

    .step__back {
      margin-top: 8px;
      color: var(--fo-text-secondary) !important;
      font-size: 13px;
    }

    .step__spinner {
      display: inline-block;
    }
  `],
})
export class OtpStepComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);

  phone = input.required<string>();

  readonly verified = output<boolean>();
  readonly back = output<void>();

  protected digits = signal<string[]>(['', '', '', '', '', '']);
  protected loading = signal(false);
  protected error = signal('');
  protected countdown = signal(60);

  protected allFilled = computed(() => this.digits().every((d) => d !== ''));

  private inputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');
  private timerId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startTimer();
    this.focusInput(0);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const char = raw.slice(-1);

    this.updateDigit(index, char);
    input.value = char;

    if (char && index < 5) {
      this.focusInput(index + 1);
    }
    if (this.allFilled()) {
      setTimeout(() => this.submit());
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      if (!this.digits()[index] && index > 0) {
        this.updateDigit(index - 1, '');
        this.focusInput(index - 1);
      } else {
        this.updateDigit(index, '');
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    const chars = text.slice(0, 6).split('');

    this.digits.update(() => {
      const next = ['', '', '', '', '', ''];
      chars.forEach((c, i) => (next[i] = c));
      return next;
    });

    const focusIdx = Math.min(chars.length, 5);
    this.focusInput(focusIdx);

    if (chars.length === 6) {
      setTimeout(() => this.submit());
    }
  }

  onFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  resend(): void {
    this.digits.set(['', '', '', '', '', '']);
    this.error.set('');
    this.auth.sendOtp(this.phone()).subscribe({
      next: () => this.startTimer(),
      error: () => this.error.set('Не удалось отправить код'),
    });
    this.focusInput(0);
  }

  submit(): void {
    if (!this.allFilled() || this.loading()) return;

    const code = this.digits().join('');
    this.loading.set(true);
    this.error.set('');

    this.auth.verifyOtp(this.phone(), code).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.verified.emit(res.isNewUser);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Неверный код. Попробуйте ещё раз');
        this.digits.set(['', '', '', '', '', '']);
        this.focusInput(0);
      },
    });
  }

  private updateDigit(index: number, value: string): void {
    this.digits.update((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  private focusInput(index: number): void {
    setTimeout(() => this.inputs()[index]?.nativeElement?.focus());
  }

  private startTimer(): void {
    this.clearTimer();
    this.countdown.set(60);
    this.timerId = setInterval(() => {
      const c = this.countdown();
      if (c > 0) {
        this.countdown.set(c - 1);
      } else {
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
