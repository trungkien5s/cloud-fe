import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Flavor, Keypair, Network, OperatingSystem, VmService, VolumeType } from '../../services/vm.service';

@Component({
  selector: 'app-vm-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzAlertModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzEmptyModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzRadioModule,
    NzSelectModule,
    NzSliderModule,
    NzSpinModule,
    NzSwitchModule,
    NzTableModule,
    NzTagModule
  ],
  templateUrl: './vm-create.component.html',
  styleUrl: './vm-create.component.css'
})
export class VmCreateComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  operatingSystems: OperatingSystem[] = [];
  flavors: Flavor[] = [];
  networks: Network[] = [];
  volumeTypes: VolumeType[] = [];
  keypairs: Keypair[] = [];

  selectedOsFamily: 'Windows' | 'Linux' = 'Linux';
  loadingOS = false;
  loadingFlavors = false;
  loadingNetworks = false;
  generatingKeypair = false;
  submitting = false;
  error = '';
  success = '';
  keypairName = '';
  keypairError = '';
  keypairSuccess = '';
  flavorPageIndex = 1;
  flavorPageSize = 10;
  selectedPriceTerm: 3 | 6 | 12 | 24 = 12;

  vmForm = {
    tenMayAo: '',
    region: 0,
    heDieuHanhId: null as number | null,
    cauHinhGiaId: null as number | null,
    keypairId: null as number | null,
    networkId: null as number | null,
    sizeGbVolume: 50,
    volumeTypeCode: 'SSD',
    useIpPublic: false,
    thoiGianSuDung: 12
  };

  constructor(
    private vmService: VmService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFormData();
    }
  }

  loadFormData(): void {
    this.loadOS();
    this.loadFlavors();
    this.loadNetworks();
    this.loadVolumeTypes();
    this.loadKeypairs();
  }

  private loadOS(): void {
    this.loadingOS = true;
    this.vmService.getOperatingSystems().subscribe({
      next: (data) => {
        this.operatingSystems = data ?? [];
        this.loadingOS = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[VmCreate] Failed to load OS:', err);
        this.loadingOS = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadFlavors(): void {
    this.loadingFlavors = true;
    this.vmService.getFlavors().subscribe({
      next: (data) => {
        this.flavors = data ?? [];
        this.loadingFlavors = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingFlavors = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadNetworks(): void {
    this.loadingNetworks = true;
    this.vmService.getMyNetworks().subscribe({
      next: (data: any) => {
        if (data?.content) {
          this.networks = data.content;
        } else if (Array.isArray(data)) {
          this.networks = data;
        }

        this.selectDefaultNetworkForRegion();

        this.loadingNetworks = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('[VmCreate] No networks loaded:', err);
        this.loadingNetworks = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadVolumeTypes(): void {
    this.vmService.getVolumeTypes().subscribe({
      next: (data) => {
        this.volumeTypes = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('[VmCreate] Failed to load volume types:', err)
    });
  }

  private loadKeypairs(): void {
    this.vmService.getMyKeypairs().subscribe({
      next: (data) => {
        this.keypairs = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => console.warn('[VmCreate] Failed to load keypairs:', err)
    });
  }

  get filteredOS(): OperatingSystem[] {
    return this.operatingSystems.filter(os => {
      const family = os.loaiHeDieuHanh?.ten?.toLowerCase() ?? '';
      const name = os.ten?.toLowerCase() ?? '';
      const selected = this.selectedOsFamily.toLowerCase();
      return family === selected || name.includes(selected);
    });
  }

  isWindowsFlavor(flavor: Flavor): boolean {
    if (flavor.osType && typeof flavor.osType === 'object') {
      const osCode = flavor.osType.ma?.toLowerCase() ?? '';
      const osName = flavor.osType.ten?.toLowerCase() ?? '';
      return osCode === 'windows' || osName.includes('windows');
    }

    if (typeof flavor.osType === 'string') {
      return flavor.osType.toLowerCase().includes('windows');
    }

    const code = (flavor.packageCode ?? flavor.tenGoiCauHinh ?? '').toLowerCase();
    return code.startsWith('win-') || code.startsWith('win_');
  }

  get currentFlavors(): Flavor[] {
    const isWindows = this.selectedOsFamily === 'Windows';
    return this.flavors.filter(f => {
      const matchesOs = isWindows ? this.isWindowsFlavor(f) : !this.isWindowsFlavor(f);
      return matchesOs && this.isFlavorInSelectedVolumeType(f);
    });
  }

  get currentNetworks(): Network[] {
    return this.networks.filter(network => this.isNetworkInCurrentRegion(network));
  }

  getFlavorSpec(flavor: Flavor, specCode: string): { soLuong: number; donVi: string } | null {
    return flavor.details?.find(d => d.thanhPhanMayAoMa === specCode) ?? null;
  }

  getFlavorName(flavor: Flavor): string {
    return flavor.tenGoiCauHinh?.split(' | ')[0] ?? flavor.tenCauHinh ?? '';
  }

  getFlavorVolumeTypeCode(flavor: Flavor): string {
    if (flavor.volumeType && typeof flavor.volumeType === 'object') {
      return flavor.volumeType.code ?? '';
    }
    return typeof flavor.volumeType === 'string' ? flavor.volumeType : '';
  }

  getFlavorVolumeTypeId(flavor: Flavor): number | null {
    if (flavor.volumeType && typeof flavor.volumeType === 'object') {
      return flavor.volumeType.id;
    }
    const code = this.getFlavorVolumeTypeCode(flavor).toUpperCase();
    if (code === 'SSD') return 1;
    if (code === 'HDD') return 2;
    return null;
  }

  isSupportedVolumeType(code: string | null | undefined): boolean {
    const normalizedCode = code?.toUpperCase();
    return normalizedCode === 'SSD' || normalizedCode === 'HDD';
  }

  isFlavorInSelectedVolumeType(flavor: Flavor): boolean {
  const selectedCode = this.vmForm.volumeTypeCode?.toUpperCase();
  const volumeTypeId = this.getFlavorVolumeTypeId(flavor);
  const volumeTypeCode = this.getFlavorVolumeTypeCode(flavor).toUpperCase();

  if (volumeTypeCode && !this.isSupportedVolumeType(volumeTypeCode)) {
    return false;
  }

  if (selectedCode === 'SSD') {
    return volumeTypeId === 1 || volumeTypeCode === 'SSD' || (!volumeTypeId && !volumeTypeCode);
  }

  if (selectedCode === 'HDD') {
    return volumeTypeId === 2 || volumeTypeCode === 'HDD';
  }

  return true;
}


  getFlavorPrice(flavor: Flavor): number | null {
    return this.getFlavorPriceByTerm(flavor, this.selectedPriceTerm);
  }

  getActivePriceTermLabel(): string {
    return `${this.selectedPriceTerm} tháng`;
  }

  getFlavorPriceLabel(flavor: Flavor): string {
    const price = this.getFlavorPrice(flavor);
    return this.formatPrice(price);
  }

  getFlavorPriceByTerm(flavor: Flavor, term: 3 | 6 | 12 | 24): number | null {
    if (term === 3) return flavor.gia3Thang ?? null;
    if (term === 6) return flavor.gia6Thang ?? null;
    if (term === 12) return flavor.gia12Thang ?? null;
    return flavor.gia24Thang ?? null;
  }

  formatPrice(price: number | null | undefined): string {
    return price == null ? '-' : `${price.toLocaleString('vi-VN')} đ`;
  }

  getSelectedOsName(): string {
    if (!this.vmForm.heDieuHanhId) return '';
    return this.operatingSystems.find(o => o.id === this.vmForm.heDieuHanhId)?.ten ?? '';
  }

  getSelectedFlavorName(): string {
    if (!this.vmForm.cauHinhGiaId) return '';
    const flavor = this.flavors.find(f => f.id === this.vmForm.cauHinhGiaId);
    return flavor ? this.getFlavorName(flavor) : '';
  }

  getSelectedFlavorSpec(code: string): string {
    if (!this.vmForm.cauHinhGiaId) return '-';
    const flavor = this.flavors.find(f => f.id === this.vmForm.cauHinhGiaId);
    return flavor ? String(this.getFlavorSpec(flavor, code)?.soLuong ?? '-') : '-';
  }

  getSelectedFlavorPriceLabel(): string {
    if (!this.vmForm.cauHinhGiaId) return '-';
    const flavor = this.flavors.find(f => f.id === this.vmForm.cauHinhGiaId);
    return flavor ? this.getFlavorPriceLabel(flavor) : '-';
  }

  getSelectedNetworkName(): string {
    if (!this.vmForm.networkId) return 'Mặc định';
    return this.networks.find(n => n.id === this.vmForm.networkId)?.name ?? 'Mặc định';
  }

  getSelectedNetwork(): Network | undefined {
    if (!this.vmForm.networkId) return undefined;
    return this.networks.find(n => n.id === this.vmForm.networkId);
  }

  getExpireDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + this.vmForm.thoiGianSuDung);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getRegionText(): string {
    return this.vmForm.region === 0 ? 'Hà Nội' : 'Hồ Chí Minh';
  }

  isFormValid(): boolean {
    return !!(
      this.vmForm.tenMayAo?.trim() &&
      this.vmForm.heDieuHanhId &&
      this.vmForm.cauHinhGiaId &&
      !this.hasNetworkRegionMismatch()
    );
  }

  selectOsFamily(family: 'Windows' | 'Linux'): void {
    this.selectedOsFamily = family;
    this.vmForm.heDieuHanhId = null;
    this.vmForm.cauHinhGiaId = null;
    this.flavorPageIndex = 1;
  }

  selectOs(os: OperatingSystem): void {
    this.vmForm.heDieuHanhId = os.id;
  }

  selectFlavor(flavor: Flavor): void {
    this.vmForm.cauHinhGiaId = flavor.id;
    const diskSpec = this.getFlavorSpec(flavor, 'DISK');
    if (diskSpec?.soLuong) {
      this.vmForm.sizeGbVolume = diskSpec.soLuong;
    }
  }

  selectVolumeType(code: string): void {
    this.vmForm.volumeTypeCode = code.toUpperCase();
    const selectedFlavor = this.flavors.find(f => f.id === this.vmForm.cauHinhGiaId);
    if (selectedFlavor && !this.isFlavorInSelectedVolumeType(selectedFlavor)) {
      this.vmForm.cauHinhGiaId = null;
    }
    this.flavorPageIndex = 1;
  }

  onRegionChange(): void {
    this.vmForm.heDieuHanhId = null;
    this.selectDefaultNetworkForRegion();
  }

  goBack(): void {
    this.router.navigate(['/vm']);
  }

  generateKeypair(): void {
    this.keypairError = '';
    this.keypairSuccess = '';
    const name = this.keypairName.trim();

    if (!name) {
      this.keypairError = 'Vui lòng nhập tên keypair.';
      return;
    }

    if (!/^[A-Za-z0-9_-]+$/.test(name)) {
      this.keypairError = 'Tên keypair chỉ được chứa chữ, số, dấu gạch ngang và gạch dưới.';
      return;
    }

    this.generatingKeypair = true;
    this.vmService.generateKeypair({
      name,
      region: this.vmForm.region,
      regionText: this.getRegionText()
    }).subscribe({
      next: (keypair) => {
        this.generatingKeypair = false;
        this.downloadPrivateKey(keypair);

        if (!this.keypairs.some(k => k.id === keypair.id)) {
          this.keypairs = [keypair, ...this.keypairs];
        }

        this.vmForm.keypairId = keypair.id;
        this.keypairName = '';
        this.keypairSuccess = `Đã tạo keypair ${keypair.name} và tải file PEM. Hãy lưu file này cẩn thận vì private key chỉ hiển thị một lần.`;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.generatingKeypair = false;
        this.keypairError = this.getErrorMessage(err, 'Không thể tạo keypair. Vui lòng thử lại.');
        this.cdr.detectChanges();
      }
    });
  }

  private downloadPrivateKey(keypair: Keypair): void {
    if (!isPlatformBrowser(this.platformId) || !keypair.privateKey) {
      return;
    }

    const fileName = keypair.privateKeyFileName || `${keypair.name}.pem`;
    const blob = new Blob([keypair.privateKey], { type: 'application/x-pem-file' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pem') ? fileName : `${fileName}.pem`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private isNetworkInCurrentRegion(network: Network): boolean {
    return network.region == null || Number(network.region) === Number(this.vmForm.region);
  }

  private selectDefaultNetworkForRegion(): void {
    const selectedNetwork = this.getSelectedNetwork();
    if (selectedNetwork && this.isNetworkInCurrentRegion(selectedNetwork)) {
      return;
    }

    this.vmForm.networkId = this.currentNetworks[0]?.id ?? null;
  }

  hasNetworkRegionMismatch(): boolean {
    const selectedNetwork = this.getSelectedNetwork();
    return !!selectedNetwork && !this.isNetworkInCurrentRegion(selectedNetwork);
  }

  getNetworkRegionMismatchMessage(): string {
    const selectedNetwork = this.getSelectedNetwork();
    if (!selectedNetwork) return '';

    const networkRegion = selectedNetwork.regionText ?? `region ${selectedNetwork.region}`;
    return `Network '${selectedNetwork.name}' thuộc ${networkRegion} nhưng VM yêu cầu ${this.getRegionText()}. Vui lòng chọn network cùng region.`;
  }

  private getErrorMessage(err: any, fallback: string): string {
    const errBody = err?.error;
    if (typeof errBody === 'string') return errBody;
    if (errBody?.errors?.length) {
      return errBody.errors.map((e: any) => `${e.field}: ${e.message}`).join('; ');
    }
    return errBody?.message ?? err?.message ?? fallback;
  }

  onSubmit(): void {
    this.error = '';

    if (!this.vmForm.tenMayAo?.trim()) {
      this.error = 'Vui lòng nhập tên máy ảo.';
      return;
    }

    if (!this.vmForm.heDieuHanhId) {
      this.error = 'Vui lòng chọn hệ điều hành.';
      return;
    }

    if (!this.vmForm.cauHinhGiaId) {
      this.error = 'Vui lòng chọn loại máy ảo (Instance Type).';
      return;
    }

    if (this.hasNetworkRegionMismatch()) {
      this.error = this.getNetworkRegionMismatchMessage();
      return;
    }

    this.submitting = true;

    const requestData = {
      tenMayAo: this.vmForm.tenMayAo.trim(),
      heDieuHanhId: this.vmForm.heDieuHanhId,
      cauHinhGiaId: this.vmForm.cauHinhGiaId,
      keypairId: this.vmForm.keypairId ?? null,
      networkId: this.vmForm.networkId ?? null,
      sizeGbVolume: this.vmForm.sizeGbVolume,
      volumeTypeCode: this.vmForm.volumeTypeCode,
      region: this.vmForm.region,
      regionText: this.getRegionText(),
      useIpPublic: this.vmForm.useIpPublic,
      securityGroupIds: null,
      thoiGianSuDung: this.vmForm.thoiGianSuDung
    };

    this.vmService.createVm(requestData).subscribe({
      next: (res) => {
        this.submitting = false;
        const createdVmId = res?.instanceId ?? res?.id;

        if (createdVmId) {
          this.success = 'Khởi tạo máy ảo thành công. Đang chuyển đến trang chi tiết...';
          setTimeout(() => this.router.navigate(['/vm/detail', createdVmId]), 1500);
        } else {
          this.success = 'Yêu cầu khởi tạo đã được gửi. Máy ảo đang được cấp phát và có thể mất vài phút.';
          setTimeout(() => this.router.navigate(['/vm']), 3000);
        }
      },
      error: (err) => {
        this.submitting = false;
        this.error = this.getErrorMessage(err, 'Có lỗi xảy ra khi tạo máy ảo. Vui lòng thử lại.');
        console.error('[VmCreate] Error creating VM:', err);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
