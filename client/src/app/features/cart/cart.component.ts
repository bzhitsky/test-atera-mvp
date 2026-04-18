import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="cart-page"><h1>Корзина</h1></div>`,
})
export class CartComponent {}
