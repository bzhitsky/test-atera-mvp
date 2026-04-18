import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { OrderService, CreateOrderPayload } from '../../core/services/order.service';
import { OrderDraftService } from '../../core/services/order-draft.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem } from '../../core/models';

type LocalPaymentMethod = 'SBP' | 'Card' | 'CardCourier' | 'Cash';
type TimeMode = 'asap' | 'scheduled';

const PICKUP_TIMES = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00',
];

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly draft = inject(OrderDraftService);
  private readonly authService = inject(AuthService);

  // ── Cart ──────────────────────────────────────────────────────────────────
  readonly items = this.cartService.items;
  readonly total = this.cartService.total;

  // ── Delivery (from shared draft) ───────────────────────────────────────────
  readonly deliveryType = this.draft.deliveryType;
  readonly selectedAddressId = this.draft.selectedAddressId;
  readonly isDelivery = computed(() => this.deliveryType() === 'Delivery');

  // ── Time ──────────────────────────────────────────────────────────────────
  readonly timeMode = signal<TimeMode>('asap');
  readonly selectedTime = signal<string>(PICKUP_TIMES[2]); // default 11:00
  readonly showTimePicker = signal(false);
  readonly pickupTimes = PICKUP_TIMES;

  // ── Payment ───────────────────────────────────────────────────────────────
  readonly paymentMethod = signal<LocalPaymentMethod>('SBP');

  // ── Comment ───────────────────────────────────────────────────────────────
  comment = '';

  // ── Submit state ──────────────────────────────────────────────────────────
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly canSubmit = computed(() => {
    if (this.items().length === 0) return false;
    if (this.submitting()) return false;
    if (this.isDelivery() && this.selectedAddressId() === null) return false;
    return true;
  });

  ngOnInit(): void {
    if (this.items().length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  setTimeMode(mode: TimeMode): void {
    this.timeMode.set(mode);
    if (mode === 'asap') {
      this.showTimePicker.set(false);
    }
  }

  selectQuickTime(time: string): void {
    this.timeMode.set('scheduled');
    this.selectedTime.set(time);
    this.showTimePicker.set(false);
  }

  openTimePicker(): void {
    this.timeMode.set('scheduled');
    this.showTimePicker.set(true);
  }

  setPayment(method: LocalPaymentMethod): void {
    this.paymentMethod.set(method);
  }

  submit(): void {
    if (!this.canSubmit()) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    let requestedAt: string | undefined;
    if (this.timeMode() === 'scheduled') {
      const [h, m] = this.selectedTime().split(':').map(Number);
      const dt = new Date();
      dt.setHours(h, m, 0, 0);
      requestedAt = dt.toISOString();
    }

    const method = this.paymentMethod();
    const apiPayment = method === 'CardCourier' ? 'Card' : method;

    const payload: CreateOrderPayload = {
      type: this.deliveryType(),
      paymentMethod: apiPayment as 'SBP' | 'Card' | 'Cash',
      addressId:
        this.isDelivery() ? (this.selectedAddressId() ?? undefined) : undefined,
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
