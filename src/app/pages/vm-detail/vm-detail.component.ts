import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VmService } from '../../services/vm.service';

@Component({
  selector: 'app-vm-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vm-detail.component.html',
  styleUrls: ['./vm-detail.component.css']
})
export class VmDetailComponent implements OnInit, OnDestroy {
  vmId: number | null = null;
  vmInfo: any = null;
  loading = true;
  error = '';
  pollingInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vmService: VmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.vmId = +idParam;
        this.loadVmInfo();
        this.startPolling();
      } else {
        this.error = 'Không tìm thấy ID máy ảo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadVmInfo() {
    if (!this.vmId) return;

    this.vmService.getVmById(this.vmId).subscribe({
      next: (data) => {
        this.vmInfo = data;
        this.loading = false;
        
        // Stop polling if VM is ACTIVE or ERROR
        if (this.vmInfo?.trangThai?.toUpperCase() === 'ACTIVE' || this.vmInfo?.trangThai?.toUpperCase() === 'ERROR') {
          this.stopPolling();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải thông tin VM', err);
        this.error = 'Không thể tải thông tin máy ảo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startPolling() {
    // Poll every 5 seconds
    this.pollingInterval = setInterval(() => {
      this.loadVmInfo();
    }, 5000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  goToList() {
    this.router.navigate(['/']); // Update this to your list route when created
  }

  get isProvisioning(): boolean {
    const status = this.vmInfo?.trangThai?.toUpperCase();
    return status === 'BUILD' || status === 'CREATING' || status === 'PENDING';
  }

  get isActive(): boolean {
    return this.vmInfo?.trangThai?.toUpperCase() === 'ACTIVE';
  }
}
