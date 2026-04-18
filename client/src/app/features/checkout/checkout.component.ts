import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="checkout-page"><h1>Оформление заказа</h1></div>`,
})
export class CheckoutComponent {}
