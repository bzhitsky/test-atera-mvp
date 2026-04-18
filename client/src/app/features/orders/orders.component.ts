import {
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import {
  STATUS_LABELS,
  STATUS_ICONS,
} from '../order-status/order-status.component';

interface OrderSummary {
  id: number;
  status: string;
  type: string;
  total: number;
  createdAt: string;
  itemCount: number;
  firstItemName: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  orders = signal<OrderSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly statusLabels = STATUS_LABELS;
  readonly statusIcons = STATUS_ICONS;

  ngOnInit(): void {
    this.orderService
      .getOrders()
      .pipe(
        catchError(() => {
          this.error.set('Не удалось загрузить заказы');
          this.loading.set(false);
          return EMPTY;
        })
      )
      .subscribe((orders: any[]) => {
        this.orders.set(
          orders.map((o) => ({
            id: o.id,
            status: o.status,
            type: o.type,
            total: o.total,
            createdAt: o.createdAt,
            itemCount: o.items?.length ?? 0,
            firstItemName: o.items?.[0]?.productName ?? '',
          }))
        );
        this.loading.set(false);
      });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'status--pending',
      Accepted: 'status--accepted',
      Preparing: 'status--preparing',
      OnTheWay: 'status--on-the-way',
      Delivered: 'status--delivered',
      Cancelled: 'status--cancelled',
      Delayed: 'status--delayed',
    };
    return map[status] ?? '';
  }

  goBack(): void {
    this.router.navigate(['/menu']);
  }

  openOrder(id: number): void {
    this.router.navigate(['/orders', id]);
  }
}
