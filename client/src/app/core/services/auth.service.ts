import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models';

const TOKEN_KEY = 'fo_token';
const USER_KEY = 'fo_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<User | null>(
    JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  );

  token = this._token.asReadonly();
  user = this._user.asReadonly();
  isAuthenticated = computed(() => !!this._token());

  sendOtp(phone: string) {
    return this.http.post(`${environment.apiUrl}/auth/send-otp`, { phone });
  }

  verifyOtp(phone: string, code: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/verify-otp`, { phone, code })
      .pipe(tap((res) => this.setSession(res)));
  }

  updateProfile(data: Partial<User>) {
    return this.http
      .put<User>(`${environment.apiUrl}/profile`, data)
      .pipe(tap((user) => this.saveUser(user)));
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    this.saveUser(res.user);
    this._token.set(res.token);
  }

  private saveUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }
}
