import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VmService, OperatingSystem, Flavor, VolumeType, Network } from '../../services/vm.service';

@Component({
  selector: 'app-vm-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vm-create.component.html',
  styleUrl: './vm-create.component.css'
})
export class VmCreateComponent implements OnInit {
  currentStep = 1;

  operatingSystems: OperatingSystem[] = [];
  flavorsSSD: Flavor[] = [];
  flavorsHDD: Flavor[] = [];
  networks: Network[] = [];
  volumeTypes: VolumeType[] = [];

  selectedOsFamily: string = 'Windows';

  vmForm = {
    loaiMayAo: 'Boot Từ Volume',
    tenMayAo: '',
    heDieuHanhId: null as number | null,
    cauHinhGiaId: null as number | null,
    keypairId: null as number | null,
    networkId: '',
    sizeGbVolume: 50,
    volumeTypeCode: 'SSD',
    region: 0,
    regionText: 'Hà Nội',
    useIpPublic: false,
    useIpPrivate: true,
    thoiGianSuDung: 12,
    customCpu: 0,
    customRam: 0
  };

  loading = false;
  error = '';
  success = '';

  constructor(
    private vmService: VmService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFormData();
  }

  loadFormData() {
    this.loading = true;

    // 1. Get Operating Systems
    this.vmService.getOperatingSystems().subscribe({
      next: (data) => {
        console.log('[DEBUG] OS data loaded:', data);
        this.operatingSystems = data;
      },
      error: (err) => console.error('Failed to load OS', err)
    });

    // 2. Get Flavors (Filtered by DiskType from API)
    this.vmService.getFlavors('SSD').subscribe({
      next: (data) => this.flavorsSSD = data,
      error: (err) => console.error('Failed to load SSD Flavors', err)
    });

    this.vmService.getFlavors('HDD').subscribe({
      next: (data) => this.flavorsHDD = data,
      error: (err) => console.error('Failed to load HDD Flavors', err)
    });

    // 3. Get Volume Types
    this.vmService.getVolumeTypes().subscribe({
      next: (data) => this.volumeTypes = data,
      error: (err) => console.error('Failed to load Volume Types', err)
    });

    // 4. Get Customer Networks (gọi trực tiếp /networks/my)
    this.vmService.getMyNetworks().subscribe({
      next: (data) => {
        console.log('[DEBUG] Networks raw response:', data);
        if (data && data.content) {
          this.networks = data.content;
        } else if (Array.isArray(data)) {
          this.networks = data;
        }
        console.log('[DEBUG] Networks loaded:', this.networks.length, 'items', this.networks);
        if (this.networks.length > 0) {
          this.vmForm.networkId = this.networks[0].networkCloudId;
          console.log('[DEBUG] Auto-selected networkId:', this.vmForm.networkId);
        } else {
          console.warn('[DEBUG] Không có network nào! Cần tạo network trước qua module Network.');
        }
      },
      error: (err) => console.error('[DEBUG] Failed to load networks:', err)
    });

    this.loading = false;
  }

  get filteredOS() {
    return this.operatingSystems.filter(os => {
      const familyMatches = os.loaiHeDieuHanh?.ten?.toLowerCase() === this.selectedOsFamily.toLowerCase();
      const nameMatches = os.ten ? os.ten.toLowerCase().includes(this.selectedOsFamily.toLowerCase()) : false;
      return familyMatches || nameMatches;
    });
  }

  getFlavorSpec(flavor: Flavor, specCode: string): { soLuong: number, donVi: string } | null {
    if (!flavor.details) return null;
    const detail = flavor.details.find(d => d.thanhPhanMayAoMa === specCode);
    if (detail) return detail;
    return null;
  }

  getFlavorName(flavor: Flavor): string {
    return flavor.tenGoiCauHinh ? flavor.tenGoiCauHinh.split(' | ')[0] : flavor.tenCauHinh || '';
  }

  nextStep() {
    if (this.currentStep < 6) {
      // Basic validation before next
      if (this.currentStep === 2 && !this.vmForm.tenMayAo) {
        this.error = 'Vui lòng nhập tên máy ảo.';
        return;
      }
      if (this.currentStep === 2 && this.vmForm.useIpPrivate && !this.vmForm.networkId) {
        this.error = 'Vui lòng chọn mạng (Network) khi sử dụng IP Private.';
        return;
      }
      if (this.currentStep === 3 && !this.vmForm.cauHinhGiaId) {
        this.error = 'Vui lòng chọn cấu hình máy ảo.';
        return;
      }
      if (this.currentStep === 5 && !this.vmForm.heDieuHanhId) {
        this.error = 'Vui lòng chọn hệ điều hành.';
        return;
      }
      this.error = '';
      this.currentStep++;
    }
  }

  setStep(step: number) {
    if (step < this.currentStep || this.canNavigateTo(step)) {
      this.currentStep = step;
      this.error = '';
    }
  }

  canNavigateTo(step: number): boolean {
    if (step === 2) return true;
    if (step === 3) return !!this.vmForm.tenMayAo;
    if (step === 4) return !!this.vmForm.tenMayAo && !!this.vmForm.cauHinhGiaId;
    if (step === 5) return !!this.vmForm.tenMayAo && !!this.vmForm.cauHinhGiaId;
    if (step === 6) return !!this.vmForm.tenMayAo && !!this.vmForm.cauHinhGiaId && !!this.vmForm.heDieuHanhId;
    return false;
  }

  onSubmit() {
    if (!this.vmForm.tenMayAo || !this.vmForm.heDieuHanhId || !this.vmForm.cauHinhGiaId) {
      this.error = 'Vui lòng điền đầy đủ các thông tin bắt buộc.';
      return;
    }
    if (this.vmForm.useIpPrivate && !this.vmForm.networkId) {
      this.error = 'Vui lòng chọn mạng (Network) để sử dụng IP Private.';
      this.currentStep = 2; // Quay lại step 2
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // Transform form data to match CreateVmRequest
    const requestData = {
      tenMayAo: this.vmForm.tenMayAo,
      heDieuHanhId: this.vmForm.heDieuHanhId,
      cauHinhGiaId: this.vmForm.cauHinhGiaId,
      keypairId: this.vmForm.keypairId,
      networkId: this.vmForm.networkId,
      sizeGbVolume: this.vmForm.sizeGbVolume,
      volumeTypeCode: this.vmForm.volumeTypeCode,
      region: this.vmForm.region,
      regionText: this.vmForm.regionText,
      useIpPublic: this.vmForm.useIpPublic,
      thoiGianSuDung: this.vmForm.thoiGianSuDung
    };

    this.vmService.createVm(requestData).subscribe({
      next: (res) => {
        this.loading = false;
        // Response example: { success: true, data: { instanceId: 10, ... } }
        const createdVmId = res?.instanceId || res?.id;
        
        if (createdVmId) {
          this.success = 'Khởi tạo máy ảo thành công. Hệ thống đang chuyển đến trang chi tiết...';
          setTimeout(() => {
            this.router.navigate(['/vm/detail', createdVmId]);
          }, 1500);
        } else {
          this.success = 'Khởi tạo máy ảo thành công. Máy ảo đang được cấp phát.';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        }
      },
      error: (err) => {
        this.loading = false;
        // Extract detailed validation errors from backend
        const errBody = err.error;
        if (errBody?.errors && Array.isArray(errBody.errors) && errBody.errors.length > 0) {
          this.error = errBody.errors.map((e: any) => `${e.field}: ${e.message}`).join('; ');
        } else {
          this.error = errBody?.message || 'Có lỗi xảy ra khi tạo máy ảo.';
        }
        console.error('Error creating VM', err);
      }
    });
  }
}
