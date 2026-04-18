import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subject, combineLatest, of, switchMap, debounceTime, startWith, tap, catchError, EMPTY } from 'rxjs';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { LayoutService } from '../../core/services/layout.service';
import { OrderService, AddressDto } from '../../core/services/order.service';
import { Category, Product, ProductListItem, CartItem, PaymentMethod } from '../../core/models';

type DeliveryType = 'Delivery' | 'Pickup';
type TimeMode = 'asap' | 'scheduled';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly cartService = inject(CartService);
  private readonly layoutService = inject(LayoutService);
  private readonly orderService = inject(OrderService);

  // ── Menu state ──────────────────────────────────────────────────────────
  readonly selectedCategoryId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<ProductListItem[]>([]);
  readonly searchQuery = signal('');
  readonly skeletons = Array.from({ length: 10 }, (_, i) => i);

  readonly isDesktop = this.layoutService.isDesktop;
  readonly mobileDrawerOpen = signal(false);

  // ── Cart state ───────────────────────────────────────────────────────────
  readonly cartItems = this.cartService.items;
  readonly cartTotal = this.cartService.total;
  readonly cartCount = this.cartService.count;

  // ── Cart sidebar checkout state ──────────────────────────────────────────
  readonly deliveryType = signal<DeliveryType>('Pickup');
  readonly addresses = signal<AddressDto[]>([]);
  readonly selectedAddressId = signal<number | null>(null);
  readonly loadingAddresses = signal(false);
  readonly timeMode = signal<TimeMode>('asap');
  readonly selectedTime = signal<string | null>(null);
  readonly paymentMethod = signal<PaymentMethod>('SBP');
  readonly cutleryCount = signal(0);
  comment = '';

  readonly isDelivery = computed(() => this.deliveryType() === 'Delivery');
  readonly selectedAddress = computed(() =>
    this.addresses().find((a) => a.id === this.selectedAddressId())
  );

  private readonly searchInput$ = new Subject<string>();

  constructor() {
    this.menuService
      .getCategories()
      .pipe(catchError(() => of([] as Category[])), takeUntilDestroyed())
      .subscribe((cats) => this.categories.set(cats));

    combineLatest([
      toObservable(this.selectedCategoryId),
      this.searchInput$.pipe(debounceTime(400), startWith('')),
    ])
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap(([categoryId, search]) =>
          this.menuService
            .getProducts({ categoryId: categoryId ?? undefined, search: search || undefined })
            .pipe(catchError(() => of([] as ProductListItem[])))
        ),
        tap(() => this.loading.set(false)),
        takeUntilDestroyed()
      )
      .subscribe((products) => this.products.set(products));
  }

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
        if (list.length > 0) this.selectedAddressId.set(list[0].id);
        this.loadingAddresses.set(false);
      });
  }

  // ── Menu actions ─────────────────────────────────────────────────────────
  selectCategory(id: number | null): void {
    this.selectedCategoryId.set(id);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchInput$.next(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchInput$.next('');
  }

  toggleMobileDrawer(): void {
    this.mobileDrawerOpen.update((v) => !v);
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }

  openProduct(id: number): void {
    this.layoutService.navigate('product', { id });
  }

  openCart(): void {
    this.layoutService.navigate('cart');
  }

  openOrders(): void {
    this.layoutService.navigate('orders');
  }

  openProfile(): void {
    this.layoutService.navigate('profile');
  }

  openAddresses(): void {
    this.layoutService.navigate('addresses');
  }

  onAddToCart(event: Event, item: ProductListItem): void {
    event.stopPropagation();
    if (item.hasSizes) {
      this.openProduct(item.id);
      return;
    }
    const product: Product = {
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? '',
      imageUrl: item.imageUrl ?? '',
      price: item.price,
      weight: item.weightGrams ?? 0,
      calories: item.calories ?? 0,
      tags: item.tags,
      sizes: [],
      addons: [],
    };
    this.cartService.addItem(product);
  }

  // ── Cart sidebar actions ─────────────────────────────────────────────────
  setDeliveryType(type: DeliveryType): void {
    this.deliveryType.set(type);
  }

  setTimeMode(mode: TimeMode): void {
    this.timeMode.set(mode);
  }

  setPayment(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  incrementItem(item: CartItem): void {
    this.cartService.updateQuantity(item, item.quantity + 1);
  }

  decrementItem(item: CartItem): void {
    this.cartService.updateQuantity(item, item.quantity - 1);
  }

  incrementCutlery(): void {
    this.cutleryCount.update((n) => n + 1);
  }

  decrementCutlery(): void {
    this.cutleryCount.update((n) => Math.max(0, n - 1));
  }

  itemLabel(item: CartItem): string {
    return item.sizeLabel ?? '';
  }

  goToCheckout(): void {
    this.layoutService.navigate('checkout');
  }
}
