import { Injectable, signal, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './auth.service';

export type NavigationTarget =
  | 'product'
  | 'cart'
  | 'checkout'
  | 'profile'
  | 'orders'
  | 'order-detail'
  | 'order-rate'
  | 'order-status'
  | 'addresses'
  | 'auth';

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly authService = inject(AuthService);

  private readonly PROTECTED: NavigationTarget[] = [
    'cart', 'checkout', 'profile', 'orders',
    'order-detail', 'order-rate', 'order-status', 'addresses',
  ];

  readonly isDesktop = signal(false);

  constructor() {
    this.breakpointObserver
      .observe(DESKTOP_BREAKPOINT)
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.isDesktop.set(result.matches);
      });
  }

  async navigate(target: NavigationTarget, params?: Record<string, unknown>) {
    if (this.isDesktop()) {
      await this.openModal(target, params);
    } else {
      await this.navigateMobile(target, params);
    }
  }

  private async navigateMobile(
    target: NavigationTarget,
    params?: Record<string, unknown>
  ) {
    switch (target) {
      case 'product':
        await this.router.navigate(['/product', params?.['id']]);
        break;
      case 'cart':
        await this.router.navigate(['/cart']);
        break;
      case 'checkout':
        await this.router.navigate(['/checkout']);
        break;
      case 'profile':
        await this.router.navigate(['/profile']);
        break;
      case 'orders':
        await this.router.navigate(['/orders']);
        break;
      case 'order-detail':
        await this.router.navigate(['/orders', params?.['id']]);
        break;
      case 'order-rate':
        await this.router.navigate(['/orders', params?.['id'], 'rate']);
        break;
      case 'order-status':
        await this.router.navigate(['/order-status', params?.['id']]);
        break;
      case 'addresses':
        await this.router.navigate(['/addresses']);
        break;
      case 'auth':
        await this.router.navigate(['/auth']);
        break;
    }
  }

  private async openModal(
    target: NavigationTarget,
    params?: Record<string, unknown>
  ) {
    if (this.PROTECTED.includes(target) && !this.authService.isAuthenticated()) {
      const { AuthComponent } = await import('../../features/auth/auth.component');
      this.dialog.open(AuthComponent, {
        panelClass: 'fo-dialog',
        backdropClass: 'fo-backdrop',
      });
      return;
    }

    let component: any;

    switch (target) {
      case 'product': {
        const m = await import(
          '../../features/product/product.component'
        );
        component = m.ProductComponent;
        break;
      }
      case 'cart': {
        const m = await import('../../features/cart/cart.component');
        component = m.CartComponent;
        break;
      }
      case 'checkout': {
        const m = await import(
          '../../features/checkout/checkout.component'
        );
        component = m.CheckoutComponent;
        break;
      }
      case 'profile': {
        const m = await import(
          '../../features/profile/profile.component'
        );
        component = m.ProfileComponent;
        break;
      }
      case 'orders': {
        const m = await import('../../features/orders/orders.component');
        component = m.OrdersComponent;
        break;
      }
      case 'order-detail': {
        const m = await import(
          '../../features/orders/order-detail/order-detail.component'
        );
        component = m.OrderDetailComponent;
        break;
      }
      case 'order-rate': {
        const m = await import(
          '../../features/orders/order-rate/order-rate.component'
        );
        component = m.OrderRateComponent;
        break;
      }
      case 'order-status': {
        const m = await import(
          '../../features/order-status/order-status.component'
        );
        component = m.OrderStatusComponent;
        break;
      }
      case 'addresses': {
        const m = await import(
          '../../features/addresses/addresses.component'
        );
        component = m.AddressesComponent;
        break;
      }
      case 'auth': {
        const m = await import('../../features/auth/auth.component');
        component = m.AuthComponent;
        break;
      }
    }

    if (component) {
      this.dialog.open(component, {
        data: params,
        panelClass: 'fo-dialog',
        backdropClass: 'fo-backdrop',
      });
    }
  }
}
