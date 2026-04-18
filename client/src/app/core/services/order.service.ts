import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models';

export interface CreateOrderItemPayload {
  productId: number;
  sizeId?: number;
  sizeLabel?: string;
  addonIds: number[];
  removedIngredients: string[];
  quantity: number;
}

export interface CreateOrderPayload {
  type: 'Delivery' | 'Pickup';
  paymentMethod: 'SBP' | 'Card' | 'Cash';
  addressId?: number;
  requestedAt?: string;
  comment?: string;
  items: CreateOrderItemPayload[];
}

export interface AddressPayload {
  label?: string;
  street: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  comment?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddressDto {
  id: number;
  label?: string;
  street: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  comment?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
}

export interface ReviewDto {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${id}`);
  }

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/orders`, payload);
  }

  submitReview(orderId: number, payload: CreateReviewPayload): Observable<ReviewDto> {
    return this.http.post<ReviewDto>(`${environment.apiUrl}/orders/${orderId}/review`, payload);
  }

  getAddresses(): Observable<AddressDto[]> {
    return this.http.get<AddressDto[]>(`${environment.apiUrl}/addresses`);
  }

  createAddress(payload: AddressPayload): Observable<AddressDto> {
    return this.http.post<AddressDto>(`${environment.apiUrl}/addresses`, payload);
  }

  updateAddress(id: number, payload: AddressPayload): Observable<AddressDto> {
    return this.http.put<AddressDto>(`${environment.apiUrl}/addresses/${id}`, payload);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/addresses/${id}`);
  }
}
