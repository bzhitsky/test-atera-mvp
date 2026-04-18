import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { OrderService, AddressDto } from '../../core/services/order.service';
import { OrderDraftService, DeliveryType } from '../../core/services/order-draft.service';
import { CartItem } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly draft = inject(OrderDraftService);

  readonly items = this.cartService.items;
  readonly total = this.cartService.total;
  readonly count = this.cartService.count;

  // Delivery state (shared via OrderDraftService)
  readonly deliveryType = this.draft.deliveryType;
  readonly selectedAddressId = this.draft.selectedAddressId;
  readonly cutleryCount = this.draft.cutleryCount;

  readonly addresses = signal<AddressDto[]>([]);
  readonly loadingAddresses = signal(false);

  readonly selectedAddress = computed(() =>
    this.addresses().find((a) => a.id === this.selectedAddressId())
  );
  readonly isDelivery = computed(() => this.deliveryType() === 'Delivery');

  readonly itemsCount = computed(() =>
    this._pluralize(this.count(), ['товар', 'товара', 'товаров'])
  );

  ngOnInit(): void {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.loadingAddresses.set(true);
    this.orderService
      .getAddresses()
      .pipe(catchError(() => EMPTY))
      .subscribe((list) => {
        this.addresses.set(list);
        if (list.length > 0 && this.selectedAddressId() === null) {
          this.selectedAddressId.set(list[0].id);
        }
        this.loadingAddresses.set(false);
      });
  }

  setDeliveryType(type: DeliveryType): void {
    this.draft.deliveryType.set(type);
  }

  goBack(): void {
    this.router.navigate(['/menu']);
  }

  increment(item: CartItem): void {
    this.cartService.updateQuantity(item, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    this.cartService.updateQuantity(item, item.quantity - 1);
  }

  clearAll(): void {
    this.cartService.clear();
  }

  incrementCutlery(): void {
    this.draft.cutleryCount.update((n) => n + 1);
  }

  decrementCutlery(): void {
    this.draft.cutleryCount.update((n) => Math.max(0, n - 1));
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }

  itemLabel(item: CartItem): string {
    return item.sizeLabel ?? '';
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
