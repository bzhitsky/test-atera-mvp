import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="auth-page"><h1>Авторизация</h1></div>`,
})
export class AuthComponent {}
