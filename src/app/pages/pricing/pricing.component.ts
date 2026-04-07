import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { VmService, Flavor } from '../../services/vm.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.vmService.getFlavors().subscribe({
      next: (flavors) => {
        this.hddPlans = flavors
          .filter(f => f.volumeType?.code === 'HDD' || !f.volumeType?.code) // Default to HDD if missing
          .map(f => this.mapFlavor(f, 'HDD'));
          
        this.ssdPlans = flavors
          .filter(f => f.volumeType?.code === 'SSD')
          .map(f => this.mapFlavor(f, 'SSD'));
          
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
      diskType: f.volumeType?.code || defaultType
    };
  }

  setTab(tab: 'HDD' | 'SSD') {
    this.activeTab = tab;
  }

  buyPlan(plan: any) {
    this.router.navigate(['/vm/create'], { queryParams: { flavorId: plan.id } });
  }
}
