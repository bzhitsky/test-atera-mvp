import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly user = this.authService.user;

  editing = signal(false);
  saving = signal(false);
  saveError = signal<string | null>(null);
  saveSuccess = signal(false);

  editName = '';
  editEmail = '';

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    const name = u.name?.trim();
    if (name) {
      return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
    }
    return u.phone.slice(-2);
  });

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.editName = u.name ?? '';
      this.editEmail = u.email ?? '';
    }
  }

  startEdit(): void {
    const u = this.user();
    if (u) {
      this.editName = u.name ?? '';
      this.editEmail = u.email ?? '';
    }
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.saveError.set(null);
  }

  save(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);

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
        this.editing.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
