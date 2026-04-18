import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="order-status-page"><h1>Статус заказа</h1></div>`,
})
export class OrderStatusComponent {}
