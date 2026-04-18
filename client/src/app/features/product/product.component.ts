import { Component, DestroyRef, Input, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe, Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { catchError, of } from 'rxjs';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { LayoutService } from '../../core/services/layout.service';
import { Product, ProductDetail } from '../../core/models';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly cartService = inject(CartService);
  private readonly layoutService = inject(LayoutService);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogData = inject<{ id: number } | null>(DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject<DialogRef>(DialogRef, { optional: true });

  /** Bound from route param via withComponentInputBinding() */
  @Input() id?: string;

  readonly product = signal<ProductDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly addedToCart = signal(false);

  readonly selectedSizeId = signal<number | null>(null);
  readonly selectedAddonIds = signal<Set<number>>(new Set());
  readonly removedIngredientIds = signal<Set<number>>(new Set());

  readonly selectedSize = computed(() =>
    this.product()?.sizes.find((s) => s.id === this.selectedSizeId()) ?? null
  );

  readonly addonsTotal = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return [...this.selectedAddonIds()].reduce(
      (sum, id) => sum + (p.addons.find((a) => a.id === id)?.price ?? 0),
      0
    );
  });

  readonly totalPrice = computed(
    () => (this.product()?.price ?? 0) + (this.selectedSize()?.priceDelta ?? 0) + this.addonsTotal()
  );

  ngOnInit(): void {
    const productId = Number(this.dialogData?.id ?? this.id);
    if (!productId || isNaN(productId)) {
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    this.menuService
      .getProductDetail(productId)
      .pipe(
        catchError(() => {
          this.error.set(true);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((p) => {
        this.product.set(p);
        this.loading.set(false);
        if (p?.sizes.length) {
          this.selectedSizeId.set(p.sizes[0].id);
        }
      });
  }

  selectSize(id: number): void {
    this.selectedSizeId.set(id);
  }

  toggleAddon(id: number): void {
    this.selectedAddonIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleIngredient(id: number): void {
    this.removedIngredientIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    const size = this.selectedSize();
    const cartProduct: Product = {
      id: p.id,
      categoryId: p.categoryId,
      name: p.name,
      description: p.description ?? '',
      imageUrl: p.imageUrl ?? '',
      price: p.price,
      weight: p.weightGrams ?? 0,
      calories: p.calories ?? 0,
      tags: p.tags,
      sizes: p.sizes,
      addons: p.addons,
    };

    this.cartService.addItem(cartProduct, {
      sizeId: size?.id,
      sizeLabel: size?.label,
      addonIds: [...this.selectedAddonIds()],
      removedIngredients: [...this.removedIngredientIds()]
        .map((id) => p.ingredients.find((i) => i.id === id)?.name ?? '')
        .filter(Boolean),
    });

    this.addedToCart.set(true);
    setTimeout(() => this.goBack(), 600);
  }

  goBack(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.location.back();
    }
  }

  openProduct(id: number): void {
    this.layoutService.navigate('product', { id });
  }
}
