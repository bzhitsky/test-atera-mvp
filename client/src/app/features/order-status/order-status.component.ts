import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import { SignalRService } from '../../core/services/signalr.service';

export interface StatusHistoryEntry {
  status: string;
  note: string | null;
  occurredAt: string;
}

export interface OrderApiItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  sizeLabel?: string;
  quantity: number;
  unitPrice: number;
  addons: string[];
  removedIngredients: string[];
}

export interface OrderApi {
  id: number;
  status: string;
  type: string;
  paymentMethod: string;
  address?: {
    id: number;
    label?: string;
    street: string;
    apartment?: string;
  };
  requestedAt?: string;
  total: number;
  comment?: string;
  createdAt: string;
  items: OrderApiItem[];
  review?: { id: number; rating: number; comment?: string; createdAt: string };
  statusHistory: StatusHistoryEntry[];
}

const STATUS_STEPS = [
  'Pending',
  'Accepted',
  'Preparing',
  'OnTheWay',
  'Delivered',
] as const;
type StatusStep = (typeof STATUS_STEPS)[number];

export const STATUS_LABELS: Record<string, string> = {
  Pending: 'Принят',
  Accepted: 'Подтверждён',
  Preparing: 'Готовится',
  OnTheWay: 'В пути',
  Delivered: 'Доставлен',
  Cancelled: 'Отменён',
  Delayed: 'Задержан',
};

export const STATUS_ICONS: Record<string, string> = {
  Pending: '🕐',
  Accepted: '✅',
  Preparing: '👨‍🍳',
  OnTheWay: '🛵',
  Delivered: '🎉',
  Cancelled: '❌',
  Delayed: '⏳',
};

const PAYMENT_LABELS: Record<string, string> = {
  SBP: 'СБП',
  Card: 'Карта',
  Cash: 'Наличные',
};

const TYPE_LABELS: Record<string, string> = {
  Delivery: 'Доставка',
  Pickup: 'Самовывоз',
};

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './order-status.component.html',
  styleUrl: './order-status.component.scss',
})
export class OrderStatusComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly signalR = inject(SignalRService);

  order = signal<OrderApi | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  liveUpdated = signal(false);

  readonly statusSteps = STATUS_STEPS;
  readonly statusLabels = STATUS_LABELS;
  readonly statusIcons = STATUS_ICONS;
  readonly paymentLabels = PAYMENT_LABELS;
  readonly typeLabels = TYPE_LABELS;

  private orderId!: number;
  private unsubscribeHub?: () => void;

  readonly currentStepIndex = computed(() => {
    const s = this.order()?.status;
    if (!s) return -1;
    return STATUS_STEPS.indexOf(s as StatusStep);
  });

  readonly isCancelled = computed(() => this.order()?.status === 'Cancelled');
  readonly isDelayed = computed(() => this.order()?.status === 'Delayed');
  readonly isDelivered = computed(() => this.order()?.status === 'Delivered');

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrder();
    this.connectHub();
  }

  ngOnDestroy(): void {
    this.unsubscribeHub?.();
    this.signalR.leaveOrderGroup(this.orderId);
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

  goToOrders(): void {
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

  private connectHub(): void {
    this.unsubscribeHub = this.signalR.onOrderStatusUpdated((data) => {
      this.order.set(data as OrderApi);
      this.liveUpdated.set(true);
      setTimeout(() => this.liveUpdated.set(false), 3000);
    });
    this.signalR.joinOrderGroup(this.orderId).catch(console.error);
  }
}
