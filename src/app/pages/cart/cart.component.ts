import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzStepsModule } from 'ng-zorro-antd/steps';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzStepsModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  discountCode = '';
  discountAmount = 0;
  
  templates = [
    { id: '1', name: 'Ubuntu 20.04' },
    { id: '2', name: 'Ubuntu 22.04' },
    { id: '3', name: 'CentOS 7' },
    { id: '4', name: 'Windows Server 2019' }
  ];

  durations = [
    { value: 1, label: '1 Tháng' },
    { value: 3, label: '3 Tháng' },
    { value: 6, label: '6 Tháng' },
    { value: 12, label: '12 Tháng' }
  ];

  constructor(public cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.items = items;
    });
  }

  updateTemplate(id: number, template: string) {
    this.cartService.updateItem(id, { template });
  }

  updateDuration(id: number, duration: number) {
    this.cartService.updateItem(id, { duration });
  }

  removeItem(id: number) {
    this.cartService.removeItem(id);
  }

  clearCart() {
    this.cartService.clear();
  }

  applyDiscount() {
    if (this.discountCode.toLowerCase() === 'khuyenmai10') {
      this.discountAmount = this.getSubtotal() * 0.1; // 10%
      alert('Áp dụng mã thành công!');
    } else {
      this.discountAmount = 0;
      alert('Mã ưu đãi không hợp lệ.');
    }
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.duration), 0);
  }

  getVat() {
    return this.getSubtotal() * 0.1; // 10% VAT
  }

  getTotal() {
    return this.getSubtotal() + this.getVat() - this.discountAmount;
  }

  checkout() {
    if (this.items.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }
    // Navigate to next step (Thông tin)
    // We can use vm/create as step 2, or a new component. For now, navigate to vm/create with first item's params
    const item = this.items[0];
    this.router.navigate(['/vm/create'], { queryParams: { flavorId: item.originalPlan.id, duration: item.duration } });
  }
}
