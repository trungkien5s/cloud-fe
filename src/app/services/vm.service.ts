import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from './auth.service';

// ── DTOs — khớp với BE portal_cloud ──────────────────────────────────────

export interface OperatingSystem {
  id: number;
  ten: string;
  code: string;
  imageId?: string;
  loaiHeDieuHanh?: { id: number; ten: string; ma: string };
}

export interface FlavorDetail {
  id?: number;
  thanhPhanMayAoId?: number;
  thanhPhanMayAoMa: string;   // 'CPU' | 'RAM' | 'DISK' | 'BANDWIDTH'
  thanhPhanMayAoTen?: string;
  soLuong: number;
  donVi: string;
  gia?: number | null;
}

export interface Flavor {
  id: number;
  tenCauHinh?: string;
  tenGoiCauHinh?: string;     // Display name (same as packageCode)
  maCloud?: string;           // Nova Flavor UUID
  packageCode?: string;       // e.g. "r3-16", "win-b3-640" — prefix "win-" = Windows flavor
  gia3Thang?: number | null;
  gia6Thang?: number | null;
  gia12Thang?: number | null;
  gia24Thang?: number | null;
  osType?: { id: number; ten: string; ma: string } | string | null;
  volumeType?: { id: number; code: string; name?: string } | string | null;
  isBasic?: number;
  region?: number;
  regionText?: string;
  isTrial?: number;
  timeTrial?: number | null;
  details?: FlavorDetail[];
}

export interface VolumeType {
  id: number;
  code: string;
  tenLoai?: string;
  name?: string;
}

/**
 * Network — Portal DB record (id là Long dùng cho CreateVmRequest)
 * networkCloudId là Neutron UUID chỉ dùng để display / debug
 */
export interface Network {
  id: number;               // ← Portal DB ID — gửi lên BE
  networkCloudId: string;   // ← Neutron UUID (chỉ hiển thị)
  name: string;
  region?: number;
  regionText?: string;
}

/**
 * Keypair — SSH Key Pair của user
 */
export interface Keypair {
  id: number;
  name: string;
  keyType?: string;
  publicKey?: string;
  fingerprint?: string;
  region?: number;
  regionText?: string;
  customerId?: number;
  privateKeyFileName?: string;
  privateKeyFileFormat?: string;
  privateKey?: string;
}

export interface GenerateKeypairRequest {
  name: string;
  region: number;
  regionText: string;
}

/**
 * CreateVmRequest — khớp với record CreateVmRequest.java bên BE
 *
 * networkId: Long (Portal DB ID). Null → BE tự chọn default network.
 * securityGroupIds: List<String> (OVH Security Group names). Null = dùng default behavior.
 * keypairId: Long (Portal DB ID). Null = không dùng key pair.
 */
export interface CreateVmRequest {
  tenMayAo: string;
  heDieuHanhId: number;
  cauHinhGiaId: number;
  keypairId?: number | null;
  networkId?: number | null;        // Portal Network DB ID (Long), NOT Neutron UUID
  sizeGbVolume: number;
  volumeTypeCode: string;
  region?: number;
  regionText?: string;
  useIpPublic?: boolean;
  securityGroupIds?: string[] | null;
  thoiGianSuDung?: number;
}

// ── Service ───────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class VmService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Catalog ──────────────────────────────────────────────────────────────

  /** Lấy danh sách hệ điều hành từ Catalog (Glance images) */
  getOperatingSystems(region?: number): Observable<OperatingSystem[]> {
    const url = region != null
      ? `${this.apiUrl}/catalog/operating-systems?region=${region}`
      : `${this.apiUrl}/catalog/operating-systems`;
    return this.http.get<ApiResponse<OperatingSystem[]>>(url).pipe(map(r => r.data));
  }

  /** Lấy toàn bộ danh sách Flavor (lọc theo region nếu cần) */
  getFlavors(region?: number): Observable<Flavor[]> {
    const q = region != null ? `?region=${region}` : '';
    return this.http.get<ApiResponse<Flavor[]>>(`${this.apiUrl}/catalog/flavors${q}`)
      .pipe(map(r => r.data ?? []));
  }

  /** Lấy danh sách loại volume (SSD, HDD…) */
  getVolumeTypes(): Observable<VolumeType[]> {
    return this.http.get<ApiResponse<VolumeType[]>>(`${this.apiUrl}/catalog/volume-types`)
      .pipe(map(r => r.data));
  }

  // ── Network ──────────────────────────────────────────────────────────────

  /** Lấy danh sách private network của user đang đăng nhập */
  getMyNetworks(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/networks/my`)
      .pipe(map(r => r.data));
  }

  // ── Keypair ──────────────────────────────────────────────────────────────

  /** Lấy danh sách key pair của user (trả về List<KeypairResponse>) */
  getMyKeypairs(): Observable<Keypair[]> {
    return this.http.get<ApiResponse<Keypair[]>>(`${this.apiUrl}/keypairs/my`)
      .pipe(map(r => r.data ?? []));
  }

  /** Tạo keypair mới. Private key PEM chỉ trả về một lần trong response. */
  generateKeypair(data: GenerateKeypairRequest): Observable<Keypair> {
    return this.http.post<ApiResponse<Keypair>>(`${this.apiUrl}/keypairs/generate`, data)
      .pipe(map(r => r.data));
  }

  // ── VM CRUD ──────────────────────────────────────────────────────────────

  /**
   * Tạo máy ảo mới (POST /api/v1/vm/create).
   * Backend trả 202 Accepted ngay, provisioning chạy async qua OVHCloud API.
   */
  createVm(data: CreateVmRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/vm/create`, data)
      .pipe(map(r => r.data));
  }

  /** Polling trạng thái VM (dùng sau khi tạo để biết BUILD → ACTIVE) */
  getVmStatus(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/vm/${id}/status`)
      .pipe(map(r => r.data));
  }

  /** Chi tiết máy ảo đầy đủ */
  getVmById(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/vm/${id}`)
      .pipe(map(r => r.data));
  }

  /** Danh sách VM của user đang đăng nhập */
  getMyVMs(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/vm/my`)
      .pipe(map(r => r.data));
  }

  // ── Power Actions ─────────────────────────────────────────────────────────

  stopVm(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/vm/${id}/stop`, {})
      .pipe(map(r => r.data));
  }

  startVm(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/vm/${id}/start`, {})
      .pipe(map(r => r.data));
  }

  rebootVm(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/vm/${id}/reboot`, {})
      .pipe(map(r => r.data));
  }

  deleteVm(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/vm/${id}`)
      .pipe(map(r => r.data));
  }

  // ── Customer ──────────────────────────────────────────────────────────────

  getCustomerProfile(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/customers/by-user`)
      .pipe(map(r => r.data));
  }
}
