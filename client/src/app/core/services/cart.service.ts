import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartItem, Product } from '../models';
import { environment } from '../../../environments/environment';

const CART_KEY = 'fo_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly _items = signal<CartItem[]>(
    JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  );

  items = this._items.asReadonly();
  total = computed(() =>
    this._items().reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  );
  count = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  addItem(
    product: Product,
    options: {
      sizeId?: number;
      sizeLabel?: string;
      addonIds?: number[];
      removedIngredients?: string[];
    } = {}
  ) {
    const existing = this._items().find(
      (i) =>
        i.productId === product.id &&
        i.sizeId === options.sizeId &&
        JSON.stringify(i.addonIds) === JSON.stringify(options.addonIds ?? [])
    );

    if (existing) {
      this.updateQuantity(existing, existing.quantity + 1);
    } else {
      const size = product.sizes?.find((s) => s.id === options.sizeId);
      const addonPrice =
        options.addonIds
          ?.map((id) => product.addons?.find((a) => a.id === id)?.price ?? 0)
          .reduce((a, b) => a + b, 0) ?? 0;

      const newItem: CartItem = {
        productId: product.id,
        product,
        sizeId: options.sizeId,
        sizeLabel: options.sizeLabel,
        addonIds: options.addonIds ?? [],
        removedIngredients: options.removedIngredients ?? [],
        quantity: 1,
        unitPrice: product.price + (size?.priceDelta ?? 0) + addonPrice,
      };

      this._items.update((items) => [...items, newItem]);
      this.persist();
    }
  }

  updateQuantity(item: CartItem, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(item);
      return;
    }
    this._items.update((items) =>
      items.map((i) => (i === item ? { ...i, quantity } : i))
    );
    this.persist();
  }

  removeItem(item: CartItem) {
    this._items.update((items) => items.filter((i) => i !== item));
    this.persist();
  }

  clear() {
    this._items.set([]);
    this.persist();
  }

  private persist() {
    localStorage.setItem(CART_KEY, JSON.stringify(this._items()));
  }
}
