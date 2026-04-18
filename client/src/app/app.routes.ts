import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'menu',
    pathMatch: 'full',
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./features/menu/menu.component').then((m) => m.MenuComponent),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/product/product.component').then(
        (m) => m.ProductComponent
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then((m) => m.CartComponent),
    canActivate: [authGuard],
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'order-status/:id',
    loadComponent: () =>
      import('./features/order-status/order-status.component').then(
        (m) => m.OrderStatusComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/orders/orders.component').then(
        (m) => m.OrdersComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./features/orders/order-detail/order-detail.component').then(
        (m) => m.OrderDetailComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'orders/:id/rate',
    loadComponent: () =>
      import('./features/orders/order-rate/order-rate.component').then(
        (m) => m.OrderRateComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'addresses',
    loadComponent: () =>
      import('./features/addresses/addresses.component').then(
        (m) => m.AddressesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: '**',
    redirectTo: 'menu',
  },
];
