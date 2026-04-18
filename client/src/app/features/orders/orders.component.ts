import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="orders-page"><h1>История заказов</h1></div>`,
})
export class OrdersComponent {}
