import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="menu-page">
      <h1>Меню</h1>
      <p>Каталог блюд — в разработке</p>
    </div>
  `,
  styles: [`
    .menu-page { padding: 24px; }
  `]
})
export class MenuComponent {}
