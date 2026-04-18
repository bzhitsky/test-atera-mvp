import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, switchMap, catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartItem, Product } from '../models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const CART_KEY = 'fo_cart';

interface CartItemSync {
  productId: number;
  sizeId?: number;
  addonIds: number[];
  removedIngredients: string[];
  quantity: number;
  unitPrice: number;
}

interface CartApiResponse {
  items: CartItemSync[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly _items = signal<CartItem[]>(
    JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  );

  readonly items = this._items.asReadonly();
  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  );
  readonly count = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  private readonly syncTrigger$ = new Subject<void>();

  constructor() {
    // Debounced sync to API on any cart change (only when authenticated)
    this.syncTrigger$
      .pipe(
        debounceTime(800),
        switchMap(() => {
          if (!this.auth.isAuthenticated()) return EMPTY;
          return this.http
            .put<CartApiResponse>(
              `${environment.apiUrl}/cart`,
              { items: this.toSyncPayload() }
            )
            .pipe(catchError(() => EMPTY));
        }),
        takeUntilDestroyed()
      )
      .subscribe();

    // Load server cart when user becomes authenticated
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.loadFromServer();
      }
    });
  }

  addItem(
    product: Product,
    options: {
      sizeId?: number;
      sizeLabel?: string;
      addonIds?: number[];
      removedIngredients?: string[];
    } = {}
  ): void {
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

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(item);
      return;
    }
    this._items.update((items) =>
      items.map((i) => (i === item ? { ...i, quantity } : i))
    );
    this.persist();
  }

  removeItem(item: CartItem): void {
    this._items.update((items) => items.filter((i) => i !== item));
    this.persist();
  }

  clear(): void {
    this._items.set([]);
    this.persist();
  }

  private loadFromServer(): void {
    this.http
      .get<CartApiResponse>(`${environment.apiUrl}/cart`)
      .pipe(catchError(() => EMPTY))
      .subscribe((res) => {
        if (res.items.length === 0) {
          // Server is empty — push local cart up
          if (this._items().length > 0) {
            this.syncTrigger$.next();
          }
          return;
        }

        // Merge: keep local items that exist in server, add server-only items
        const local = this._items();
        const merged = mergeCartItems(local, res.items);
        this._items.set(merged);
        this.persist();
      });
  }

  private persist(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(this._items()));
    this.syncTrigger$.next();
  }

  private toSyncPayload(): CartItemSync[] {
    return this._items().map((i) => ({
      productId: i.productId,
      sizeId: i.sizeId,
      addonIds: i.addonIds,
      removedIngredients: i.removedIngredients,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));
  }
}

function mergeCartItems(local: CartItem[], server: CartItemSync[]): CartItem[] {
  // Server items override local quantity when keys match; new server items are appended
  const result: CartItem[] = local.map((localItem) => {
    const serverMatch = server.find(
      (s) =>
        s.productId === localItem.productId &&
        s.sizeId === localItem.sizeId &&
        JSON.stringify(s.addonIds) === JSON.stringify(localItem.addonIds)
    );
    return serverMatch ? { ...localItem, quantity: serverMatch.quantity } : localItem;
  });

  // Append server items that aren't in local (can't reconstruct product obj, skip them)
  return result;
}
