import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import {
  STATUS_LABELS,
  STATUS_ICONS,
  OrderApi,
  OrderApiItem,
} from '../../order-status/order-status.component';

const STATUS_STEPS = [
  'Pending',
  'Accepted',
  'Preparing',
  'OnTheWay',
  'Delivered',
] as const;
type StatusStep = (typeof STATUS_STEPS)[number];

const PAYMENT_LABELS: Record<string, string> = {
  SBP: 'СБП',
  Card: 'Банковская карта',
  Cash: 'Наличные',
};

const TYPE_LABELS: Record<string, string> = {
  Delivery: 'Доставка',
  Pickup: 'Самовывоз',
};

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  order = signal<OrderApi | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly statusSteps = STATUS_STEPS;
  readonly statusLabels = STATUS_LABELS;
  readonly statusIcons = STATUS_ICONS;
  readonly paymentLabels = PAYMENT_LABELS;
  readonly typeLabels = TYPE_LABELS;

  private orderId!: number;

  readonly currentStepIndex = computed(() => {
    const s = this.order()?.status;
    if (!s) return -1;
    return STATUS_STEPS.indexOf(s as StatusStep);
  });

  readonly isCancelled = computed(() => this.order()?.status === 'Cancelled');
  readonly isDelivered = computed(() => this.order()?.status === 'Delivered');

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrder();
  }

  stepState(step: string): 'done' | 'active' | 'upcoming' {
    const idx = STATUS_STEPS.indexOf(step as StatusStep);
    const cur = this.currentStepIndex();
    if (idx < cur) return 'done';
    if (idx === cur) return 'active';
    return 'upcoming';
  }

  addonsText(item: OrderApiItem): string {
    return item.addons.join(', ');
  }

  addressText(o: OrderApi): string {
    if (!o.address) return '';
    const parts = [o.address.street];
    if (o.address.apartment) parts.push(`кв. ${o.address.apartment}`);
    return parts.join(', ');
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  private loadOrder(): void {
    this.loading.set(true);
    this.orderService
      .getOrder(this.orderId)
      .pipe(
        catchError(() => {
          this.error.set('Не удалось загрузить заказ');
          this.loading.set(false);
          return EMPTY;
        })
      )
      .subscribe((order) => {
        this.order.set(order as unknown as OrderApi);
        this.loading.set(false);
      });
  }
}
