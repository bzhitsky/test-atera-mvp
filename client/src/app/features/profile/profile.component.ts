import {
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DialogRef } from '@angular/cdk/dialog';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

const LOCAL_PROFILE_KEY = 'fo_local_profile';

interface LocalProfile {
  gender: string;
  birthday: string;
  agreeOffer: boolean;
  agreePrivacy: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly dialogRef = inject(DialogRef, { optional: true });
  readonly authService = inject(AuthService);

  readonly user = this.authService.user;

  saving = signal(false);
  saveError = signal<string | null>(null);
  saveSuccess = signal(false);

  editName = '';
  editEmail = '';
  editGender = '';
  editBirthday = '';
  agreeOffer = false;
  agreePrivacy = false;

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.editName = u.name ?? '';
      this.editEmail = u.email ?? '';
    }
    const local = this.loadLocal();
    this.editGender = local.gender;
    this.editBirthday = local.birthday;
    this.agreeOffer = local.agreeOffer;
    this.agreePrivacy = local.agreePrivacy;
  }

  close(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.location.back();
    }
  }

  save(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);

    this.saveLocal();

    this.authService
      .updateProfile({
        name: this.editName.trim() || undefined,
        email: this.editEmail.trim() || undefined,
      })
      .pipe(
        catchError((err) => {
          this.saveError.set(err?.error?.message ?? 'Не удалось сохранить');
          this.saving.set(false);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      });
  }

  deleteProfile(): void {
    if (!confirm('Удалить профиль? Это действие необратимо.')) return;
    this.authService.logout();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.router.navigate(['/auth']);
  }

  logout(): void {
    this.authService.logout();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.router.navigate(['/auth']);
  }

  private loadLocal(): LocalProfile {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY) ?? 'null') ?? {
        gender: '',
        birthday: '',
        agreeOffer: false,
        agreePrivacy: false,
      };
    } catch {
      return { gender: '', birthday: '', agreeOffer: false, agreePrivacy: false };
    }
  }

  private saveLocal(): void {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify({
      gender: this.editGender,
      birthday: this.editBirthday,
      agreeOffer: this.agreeOffer,
      agreePrivacy: this.agreePrivacy,
    }));
  }
}
