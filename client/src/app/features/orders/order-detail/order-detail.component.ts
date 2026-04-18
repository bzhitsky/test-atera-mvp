import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="order-detail-page"><h1>Детали заказа</h1></div>`,
})
export class OrderDetailComponent {}
