import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  template: string;
  duration: number; // in months
  price: number;
  originalPlan: any;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (!this.isBrowser) {
      return;
    }

    const saved = localStorage.getItem('cloud_cart');
    if (saved) {
      try {
        this.itemsSubject.next(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
  }

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  addToCart(item: CartItem) {
    const current = this.items;
    // For cloud services, we could allow multiple items, or force singular if it's wizard-based.
    // Let's allow multiple as it's a "cart"
    const next = [...current, item];
    this.save(next);
  }

  updateItem(id: number, changes: Partial<CartItem>) {
    const next = this.items.map(item => item.id === id ? { ...item, ...changes } : item);
    this.save(next);
  }

  removeItem(id: number) {
    const next = this.items.filter(item => item.id !== id);
    this.save(next);
  }

  clear() {
    this.save([]);
  }

  private save(items: CartItem[]) {
    this.itemsSubject.next(items);
    if (this.isBrowser) {
      localStorage.setItem('cloud_cart', JSON.stringify(items));
    }
  }
}
