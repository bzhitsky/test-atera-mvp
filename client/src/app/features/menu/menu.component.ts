import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Subject, combineLatest, of, switchMap, debounceTime, startWith, tap, catchError } from 'rxjs';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { LayoutService } from '../../core/services/layout.service';
import { Category, Product, ProductListItem } from '../../core/models';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  private readonly menuService = inject(MenuService);
  private readonly cartService = inject(CartService);
  private readonly layoutService = inject(LayoutService);

  readonly selectedCategoryId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly categories = signal<Category[]>([]);
  readonly products = signal<ProductListItem[]>([]);
  readonly searchQuery = signal('');
  readonly skeletons = Array.from({ length: 6 }, (_, i) => i);

  readonly cartCount = this.cartService.count;

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

  openProduct(id: number): void {
    this.layoutService.navigate('product', { id });
  }

  openCart(): void {
    this.layoutService.navigate('cart');
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
}
