import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="product-page"><h1>Карточка товара</h1></div>`,
})
export class ProductComponent {}
