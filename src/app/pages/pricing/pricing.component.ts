import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VmService, Flavor } from '../../services/vm.service';
import { CartService } from '../../services/cart.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzRadioModule,
    NzSpinModule
  ],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  activeTab: 'HDD' | 'SSD' = 'HDD';
  loading = true;

  hddPlans: any[] = [];
  ssdPlans: any[] = [];

  constructor(
    private router: Router,
    private vmService: VmService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.vmService.getFlavors().subscribe({
      next: (flavors) => {
        // volumeType từ BE hiện tại là null cho tất cả — hiển thị toàn bộ ở cả 2 tab
        // Lọc HDD: không phải SSD theo volumeType string hoặc null (default)
        this.hddPlans = flavors
          .filter(f => (f.volumeType as string | null) !== 'SSD') // Default to HDD if null
          .map(f => this.mapFlavor(f, 'HDD'));
          
        this.ssdPlans = flavors
          .filter(f => (f.volumeType as string | null) === 'SSD')
          .map(f => this.mapFlavor(f, 'SSD'));

        // Nếu BE không phân biệt SSD/HDD, show tất cả ở cả 2 tab
        if (this.ssdPlans.length === 0) {
          this.ssdPlans = flavors.map(f => this.mapFlavor(f, 'SSD'));
        }
          
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Không tải được gói cấu hình', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  mapFlavor(f: Flavor, defaultType: string): any {
    const cpuDetail = f.details?.find(d => d.thanhPhanMayAoMa === 'CPU');
    const ramDetail = f.details?.find(d => d.thanhPhanMayAoMa === 'RAM');
    const diskDetail = f.details?.find(d => d.thanhPhanMayAoMa === 'DISK');

    const cpu = cpuDetail?.soLuong || 1;
    // Map random price if API doesn't have it explicitly
    const fakePrice = cpu === 1 ? '190.000' : cpu === 2 ? '380.000' : cpu === 4 ? '770.000' : '1.130.000';
    const fallbackPrice = defaultType === 'SSD' ? (parseInt(fakePrice.replace('.','')) + 60000).toLocaleString('vi-VN') : fakePrice;

    return {
      id: f.id,
      name: f.tenGoiCauHinh ? f.tenGoiCauHinh.split(' | ')[0] : (f.tenCauHinh || 'CLOUD'),
      cpu: 'Intel® Xeon® Gold 6330', // CPU Name is usually fixed or comes from somewhere else
      core: cpu,
      disk: diskDetail?.soLuong || 20,
      ram: ramDetail?.soLuong || 1,
      ip: 1,
      price: (f as any).donGiaThang ? Number((f as any).donGiaThang).toLocaleString('vi-VN') : fallbackPrice,
      diskType: (f.volumeType as string | null) || defaultType
    };
  }

  setTab(tab: 'HDD' | 'SSD') {
    this.activeTab = tab;
  }

  buyPlan(plan: any) {
    // Parse numeric price from plan string (e.g. "770.000" -> 770000)
    let numericPrice = 0;
    if (typeof plan.price === 'string') {
        numericPrice = parseInt(plan.price.replace(/\./g, ''), 10);
    } else {
        numericPrice = plan.price;
    }

    this.cartService.addToCart({
        id: new Date().getTime(),
        name: plan.name,
        template: '',
        duration: 1, // default 1 month
        price: numericPrice,
        originalPlan: plan
    });
    this.router.navigate(['/cart']);
  }
}
