import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VmService } from '../../services/vm.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-vm-detail',
  standalone: true,
  imports: [
    CommonModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzTagModule
  ],
  templateUrl: './vm-detail.component.html',
  styleUrls: ['./vm-detail.component.css']
})
export class VmDetailComponent implements OnInit, OnDestroy {
  vmId: number | null = null;
  vmInfo: any = null;
  loading = true;
  error = '';
  pollingSubscription: Subscription | null = null;
  private readonly terminalStatuses = ['ACTIVE', 'ERROR'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vmService: VmService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const vmId = Number(idParam);

      this.stopPolling();
      this.vmInfo = null;
      this.error = '';

      if (!idParam || !Number.isFinite(vmId) || vmId <= 0) {
        this.vmId = null;
        this.error = 'ID máy ảo không hợp lệ.';
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }

      this.vmId = vmId;
      this.loading = true;
      this.loadVmInfo();
      this.startPolling();
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadVmInfo(preserveStatus?: string) {
    if (!this.vmId) {
      this.error = 'ID máy ảo không hợp lệ.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.vmService.getVmById(this.vmId).subscribe({
      next: (data) => {
        this.zone.run(() => {
          const detailStatus = this.normalizeStatus(data?.trangThai);
          const preservedStatus = this.normalizeStatus(preserveStatus);

          this.vmInfo = {
            ...(data ?? {}),
            ...(preservedStatus && !this.isTerminalStatus(detailStatus) ? { trangThai: preservedStatus } : {})
          };
          this.loading = false;

          if (this.isTerminalStatus(detailStatus)) {
            this.stopPolling();
          }

          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error('Lỗi khi tải thông tin VM', err);
          this.error = 'Không thể tải thông tin máy ảo.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  startPolling() {
    if (!this.vmId || this.pollingSubscription) return;

    this.pollingSubscription = timer(0, 5000).subscribe(() => {
      this.pollVmStatus();
    });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  pollVmStatus() {
    if (!this.vmId) return;

    this.vmService.getVmStatus(this.vmId).subscribe({
      next: (statusData) => {
        this.zone.run(() => {
          this.mergeVmStatus(statusData);
          this.loading = false;

          if (this.isTerminalStatus(this.vmInfo?.trangThai)) {
            this.loadVmInfo(this.vmInfo.trangThai);
          }

          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error('Lỗi khi polling trạng thái VM', err);
          this.cdr.detectChanges();
        });
      }
    });
  }

  private mergeVmStatus(statusData: any) {
    const normalizedStatus = this.extractVmStatus(statusData);
    if (!normalizedStatus) return;

    this.vmInfo = {
      ...(this.vmInfo ?? {}),
      ...normalizedStatus
    };
  }

  private extractVmStatus(statusData: any) {
    const data = statusData?.data ?? statusData;

    if (typeof data === 'string') {
      return { trangThai: this.normalizeStatus(data) };
    }

    const trangThai = data?.trangThai ?? data?.status ?? data?.state;
    const stateWaiting = data?.stateWaiting ?? data?.message ?? data?.detail;

    return {
      ...data,
      ...(trangThai ? { trangThai: this.normalizeStatus(trangThai) } : {}),
      ...(stateWaiting ? { stateWaiting } : {})
    };
  }

  private normalizeStatus(status: string | undefined | null): string {
    return String(status ?? '').trim().toUpperCase();
  }

  private isTerminalStatus(status: string | undefined | null): boolean {
    return this.terminalStatuses.includes(this.normalizeStatus(status));
  }

  goToList() {
    this.router.navigate(['/']);
  }

  openConsole() {
    if (this.vmId) {
      this.router.navigate(['/vm/console', this.vmId]);
    }
  }

  get isProvisioning(): boolean {
    const status = this.vmInfo?.trangThai?.toUpperCase();
    return status === 'BUILD' || status === 'CREATING' || status === 'PENDING';
  }

  get isActive(): boolean {
    return this.vmInfo?.trangThai?.toUpperCase() === 'ACTIVE';
  }
}
