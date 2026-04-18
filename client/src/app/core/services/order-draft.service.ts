import { Injectable, signal } from '@angular/core';

export type DeliveryType = 'Delivery' | 'Pickup';

@Injectable({ providedIn: 'root' })
export class OrderDraftService {
  readonly deliveryType = signal<DeliveryType>('Pickup');
  readonly selectedAddressId = signal<number | null>(null);
  readonly cutleryCount = signal(0);
}
