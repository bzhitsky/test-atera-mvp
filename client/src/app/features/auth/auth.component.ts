import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@angular/cdk/dialog';
import { PhoneStepComponent } from './steps/phone-step.component';
import { OtpStepComponent } from './steps/otp-step.component';
import { QuestionnaireStepComponent } from './steps/questionnaire-step.component';

type AuthStep = 'phone' | 'otp' | 'questionnaire';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [PhoneStepComponent, OtpStepComponent, QuestionnaireStepComponent],
  template: `
    <div class="auth-card">
      <!-- step indicator dots -->
      <div class="auth-steps">
        <span class="auth-steps__dot" [class.auth-steps__dot--active]="step() === 'phone'"></span>
        <span class="auth-steps__dot" [class.auth-steps__dot--active]="step() === 'otp'"></span>
        <span class="auth-steps__dot" [class.auth-steps__dot--active]="step() === 'questionnaire'"></span>
      </div>

      @switch (step()) {
        @case ('phone') {
          <app-phone-step (submitted)="onPhone($event)" />
        }
        @case ('otp') {
          <app-otp-step
            [phone]="phone()"
            (verified)="onVerified($event)"
            (back)="step.set('phone')"
          />
        }
        @case ('questionnaire') {
          <app-questionnaire-step (completed)="finish()" />
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .auth-card {
      background: var(--fo-surface);
      border-radius: var(--fo-radius);
      width: 380px;
      max-width: 100vw;
      overflow: hidden;

      // Full-screen on mobile (when used as a route, not dialog)
      @media (max-width: 480px) {
        width: 100%;
        min-height: 100vh;
        border-radius: 0;
      }
    }

    .auth-steps {
      display: flex;
      justify-content: center;
      gap: 6px;
      padding: 16px 0 0;
    }

    .auth-steps__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--fo-border);
      transition: background 0.2s ease, transform 0.2s ease;

      &--active {
        background: var(--fo-primary);
        transform: scale(1.3);
      }
    }
  `],
})
export class AuthComponent {
  private router = inject(Router);
  // optional: only present when opened as a CDK Dialog
  private dialogRef = inject(DialogRef, { optional: true });

  protected step = signal<AuthStep>('phone');
  protected phone = signal('');

  onPhone(phone: string): void {
    this.phone.set(phone);
    this.step.set('otp');
  }

  onVerified(isNewUser: boolean): void {
    if (isNewUser) {
      this.step.set('questionnaire');
    } else {
      this.finish();
    }
  }

  finish(): void {
    if (this.dialogRef) {
      this.dialogRef.close({ authenticated: true });
    } else {
      this.router.navigate(['/menu']);
    }
  }
}
