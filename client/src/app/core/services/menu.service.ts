import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category, ProductDetail, ProductListItem } from '../models';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  getCategories() {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }

  getProducts(filter?: { categoryId?: number; search?: string }) {
    let params = new HttpParams();
    if (filter?.categoryId != null) params = params.set('categoryId', filter.categoryId);
    if (filter?.search) params = params.set('search', filter.search);
    return this.http.get<ProductListItem[]>(`${environment.apiUrl}/products`, { params });
  }

  getProductDetail(id: number) {
    return this.http.get<ProductDetail>(`${environment.apiUrl}/products/${id}`);
  }
}
