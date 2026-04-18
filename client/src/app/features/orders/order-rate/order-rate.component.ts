import {
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-rate',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './order-rate.component.html',
  styleUrl: './order-rate.component.scss',
})
export class OrderRateComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  orderId!: number;
  rating = signal(0);
  hovered = signal(0);
  comment = '';
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  readonly stars = [1, 2, 3, 4, 5];

  readonly ratingLabels: Record<number, string> = {
    1: 'Очень плохо',
    2: 'Плохо',
    3: 'Нормально',
    4: 'Хорошо',
    5: 'Отлично!',
  };

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
  }

  setRating(r: number): void {
    this.rating.set(r);
  }

  setHover(r: number): void {
    this.hovered.set(r);
  }

  clearHover(): void {
    this.hovered.set(0);
  }

  starFilled(star: number): boolean {
    const h = this.hovered();
    return star <= (h > 0 ? h : this.rating());
  }

  submit(): void {
    if (this.rating() === 0 || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);

    this.orderService
      .submitReview(this.orderId, {
        rating: this.rating(),
        comment: this.comment.trim() || undefined,
      })
      .pipe(
        catchError((err) => {
          this.error.set(
            err?.error?.error ?? 'Не удалось отправить отзыв'
          );
          this.submitting.set(false);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.success.set(true);
        setTimeout(() => {
          this.router.navigate(['/orders', this.orderId]);
        }, 1800);
      });
  }

  goBack(): void {
    this.router.navigate(['/orders', this.orderId]);
  }
}
