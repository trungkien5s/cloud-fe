import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from './auth.service';

// DTOs based on BE structure
export interface OperatingSystem {
  id: number;
  ten: string;
  code: string;
  loaiHeDieuHanh?: { id: number, ten: string, ma: string };
}

export interface FlavorDetail {
  thanhPhanMayAoMa: string;
  soLuong: number;
  donVi: string;
}

export interface Flavor {
  id: number;
  tenCauHinh?: string;
  tenGoiCauHinh?: string;
  volumeType?: { id: number, code: string };
  details?: FlavorDetail[];
}

export interface VolumeType {
  id: number;
  code: string;
  tenLoai: string;
}

export interface Network {
  id: number;
  networkCloudId: string;
  name: string;
}

export interface CreateVmRequest {
  tenMayAo: string;
  heDieuHanhId: number;
  cauHinhGiaId: number;
  keypairId?: number | null;
  networkId: string;
  sizeGbVolume: number;
  volumeTypeCode: string;
  region: number;
  regionText: string;
  useIpPublic: boolean;
  thoiGianSuDung: number;
}

@Injectable({
  providedIn: 'root'
})
export class VmService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // 1. Lấy thông tin khách hàng đang đăng nhập (để lấy customerId)
  getCustomerProfile(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/customers/by-user`)
      .pipe(map(res => res.data));
  }

  // 2. Lấy danh sách hệ điều hành
  getOperatingSystems(): Observable<OperatingSystem[]> {
    const url = `${this.apiUrl}/catalog/operating-systems`;
    return this.http.get<ApiResponse<OperatingSystem[]>>(url)
      .pipe(map(res => res.data));
  }

  // 3. Lấy danh sách cấu hình (Flavor)
  getFlavors(diskType?: string): Observable<Flavor[]> {
    const url = diskType ? `${this.apiUrl}/catalog/flavors?diskType=${diskType}` : `${this.apiUrl}/catalog/flavors`;
    return this.http.get<ApiResponse<Flavor[]>>(url)
      .pipe(map(res => res.data));
  }

  // 4. Lấy danh sách loại ổ đĩa (Volume Types)
  getVolumeTypes(): Observable<VolumeType[]> {
    return this.http.get<ApiResponse<VolumeType[]>>(`${this.apiUrl}/catalog/volume-types`)
      .pipe(map(res => res.data));
  }

  // 5. Lấy danh sách mạng của khách hàng (gọi API /networks/my)
  getMyNetworks(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/networks/my`)
      .pipe(map(res => res.data));
  }

  // 6. Tạo máy ảo
  createVm(data: CreateVmRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/vm/create`, data)
      .pipe(map(res => res.data));
  }

  // 7. Lấy thông tin chi tiết máy ảo
  getVmById(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/vm/${id}`)
      .pipe(map(res => res.data));
  }

  // 8. Lấy danh sách máy ảo của TÔI
  getMyVMs(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/vm/my`)
      .pipe(map(res => res.data));
  }
}
