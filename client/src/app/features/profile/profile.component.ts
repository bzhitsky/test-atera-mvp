import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="profile-page"><h1>Профиль</h1></div>`,
})
export class ProfileComponent {}
