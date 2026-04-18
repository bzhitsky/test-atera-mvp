import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { OrderService, AddressDto, CreateOrderPayload } from '../../core/services/order.service';
import { CartItem } from '../../core/models';

type DeliveryType = 'Delivery' | 'Pickup';
type PaymentMethod = 'SBP' | 'Card';
type TimeMode = 'asap' | 'scheduled';

const PICKUP_TIMES = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);

  // ── Cart ──────────────────────────────────────────────────────────────────
  readonly items = this.cartService.items;
  readonly total = this.cartService.total;

  // ── Delivery type ─────────────────────────────────────────────────────────
  deliveryType = signal<DeliveryType>('Delivery');

  // ── Addresses ─────────────────────────────────────────────────────────────
  addresses = signal<AddressDto[]>([]);
  selectedAddressId = signal<number | null>(null);
  loadingAddresses = signal(false);

  // ── New address form ───────────────────────────────────────────────────────
  showAddressForm = signal(false);
  newStreet = '';
  newApartment = '';
  newEntrance = '';
  newFloor = '';
  newIntercom = '';
  savingAddress = signal(false);

  // ── Time ──────────────────────────────────────────────────────────────────
  timeMode = signal<TimeMode>('asap');
  readonly pickupTimes = PICKUP_TIMES;
  selectedTime = signal<string>(PICKUP_TIMES[0]);

  // ── Payment ───────────────────────────────────────────────────────────────
  paymentMethod = signal<PaymentMethod>('SBP');

  // ── Comment ───────────────────────────────────────────────────────────────
  comment = '';

  // ── Submit state ──────────────────────────────────────────────────────────
  submitting = signal(false);
  submitError = signal<string | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly isDelivery = computed(() => this.deliveryType() === 'Delivery');

  readonly canSubmit = computed(() => {
    if (this.items().length === 0) return false;
    if (this.submitting()) return false;
    if (this.isDelivery() && this.selectedAddressId() === null) return false;
    return true;
  });

  ngOnInit(): void {
    if (this.items().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    this.loadAddresses();
  }

  // ── Delivery type ─────────────────────────────────────────────────────────
  setDeliveryType(type: DeliveryType): void {
    this.deliveryType.set(type);
  }

  // ── Addresses ─────────────────────────────────────────────────────────────
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

  selectAddress(id: number): void {
    this.selectedAddressId.set(id);
    this.showAddressForm.set(false);
  }

  openAddressForm(): void {
    this.showAddressForm.set(true);
    this.selectedAddressId.set(null);
    this.newStreet = '';
    this.newApartment = '';
    this.newEntrance = '';
    this.newFloor = '';
    this.newIntercom = '';
  }

  cancelAddressForm(): void {
    this.showAddressForm.set(false);
    const list = this.addresses();
    if (list.length > 0) this.selectedAddressId.set(list[0].id);
  }

  saveNewAddress(): void {
    if (!this.newStreet.trim()) return;
    this.savingAddress.set(true);
    this.orderService
      .createAddress({
        street: this.newStreet.trim(),
        apartment: this.newApartment.trim() || undefined,
        entrance: this.newEntrance.trim() || undefined,
        floor: this.newFloor.trim() || undefined,
        intercom: this.newIntercom.trim() || undefined,
      })
      .pipe(catchError(() => { this.savingAddress.set(false); return EMPTY; }))
      .subscribe((addr) => {
        this.addresses.update((list) => [...list, addr]);
        this.selectedAddressId.set(addr.id);
        this.showAddressForm.set(false);
        this.savingAddress.set(false);
      });
  }

  addressLabel(addr: AddressDto): string {
    const parts = [addr.street];
    if (addr.apartment) parts.push(`кв. ${addr.apartment}`);
    return parts.join(', ');
  }

  // ── Time ──────────────────────────────────────────────────────────────────
  setTimeMode(mode: TimeMode): void {
    this.timeMode.set(mode);
  }

  // ── Payment ───────────────────────────────────────────────────────────────
  setPayment(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit(): void {
    if (!this.canSubmit()) return;

    this.submitting.set(true);
    this.submitError.set(null);

    let requestedAt: string | undefined;
    if (this.timeMode() === 'scheduled') {
      const [h, m] = this.selectedTime().split(':').map(Number);
      const dt = new Date();
      dt.setHours(h, m, 0, 0);
      requestedAt = dt.toISOString();
    }

    const payload: CreateOrderPayload = {
      type: this.deliveryType(),
      paymentMethod: this.paymentMethod(),
      addressId: this.isDelivery() ? (this.selectedAddressId() ?? undefined) : undefined,
      requestedAt,
      comment: this.comment.trim() || undefined,
      items: this.items().map((item: CartItem) => ({
        productId: item.productId,
        sizeId: item.sizeId,
        sizeLabel: item.sizeLabel,
        addonIds: item.addonIds,
        removedIngredients: item.removedIngredients,
        quantity: item.quantity,
      })),
    };

    this.orderService
      .createOrder(payload)
      .pipe(
        catchError((err) => {
          const msg =
            err?.error?.error ?? 'Не удалось оформить заказ. Попробуйте снова.';
          this.submitError.set(msg);
          this.submitting.set(false);
          return EMPTY;
        })
      )
      .subscribe((order) => {
        this.cartService.clear();
        this.router.navigate(['/order-status', order.id]);
      });
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}
