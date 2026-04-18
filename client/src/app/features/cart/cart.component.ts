import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);

  readonly items = this.cartService.items;
  readonly total = this.cartService.total;
  readonly count = this.cartService.count;

  readonly itemsCount = computed(() =>
    this._pluralize(this.count(), ['товар', 'товара', 'товаров'])
  );

  goBack(): void {
    this.router.navigate(['/menu']);
  }

  increment(item: CartItem): void {
    this.cartService.updateQuantity(item, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    this.cartService.updateQuantity(item, item.quantity - 1);
  }

  remove(item: CartItem): void {
    this.cartService.removeItem(item);
  }

  clearAll(): void {
    this.cartService.clear();
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }

  itemLabel(item: CartItem): string {
    const parts: string[] = [];
    if (item.sizeLabel) parts.push(item.sizeLabel);
    return parts.join(' · ');
  }

  private _pluralize(n: number, forms: [string, string, string]): string {
    const abs = Math.abs(n) % 100;
    const mod10 = abs % 10;
    if (abs > 10 && abs < 20) return `${n} ${forms[2]}`;
    if (mod10 === 1) return `${n} ${forms[0]}`;
    if (mod10 >= 2 && mod10 <= 4) return `${n} ${forms[1]}`;
    return `${n} ${forms[2]}`;
  }
}
