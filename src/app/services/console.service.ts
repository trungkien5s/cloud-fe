import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from './auth.service';

// ── Console Session DTOs ─────────────────────────────────────────────────────
// Khớp với ConsoleSessionResponse Java record từ BE

export type ConsoleSessionStatus = 'PENDING' | 'OPENED' | 'EXPIRED' | 'REVOKED' | 'CLOSED';

/**
 * Khớp với ConsoleSessionResponse record trong BE.
 *
 * Flow mở console:
 *   1. createSession(vmId)  →  nhận ConsoleSession có portalOpenUrl
 *   2. window.open(portalOpenUrl, '_blank')
 *      → BE validate token, update status = OPENED
 *      → BE redirect 302 → OpenStack noVNC URL thật
 *      → Tab mới hiện giao diện console QEMU
 */
export interface ConsoleSession {
  id: number;
  vmId: number;
  vmName?: string;
  consoleType?: string;          // 'novnc' | 'xvpvnc' | ...
  portalConsoleUrl?: string;     // BE launcher page URL (có token)
  portalOpenUrl?: string;        // BE open-redirect → noVNC thật (mở tab mới)
  requestedBy?: string;          // username của người tạo
  vmOwnerUsername?: string;
  status: ConsoleSessionStatus;
  createdAt: string;             // ISO-8601 Instant
  openedAt?: string;
  expiresAt?: string;
  lastAccessAt?: string;
  remainingSeconds?: number;     // giây còn lại đến hết hạn
  launchCount?: number;
  revokedReason?: string;
}

/** ConsoleSessionSummaryResponse từ GET /api/v1/console-sessions (Page) */
export interface ConsoleSessionSummary {
  id: number;
  vmId: number;
  vmName?: string;
  requestedBy?: string;
  vmOwnerUsername?: string;
  consoleType?: string;
  status: ConsoleSessionStatus;
  createdAt: string;
  openedAt?: string;
  closedAt?: string;
  expiresAt?: string;
  lastAccessAt?: string;
  launchCount?: number;
  clientIp?: string;
  userAgent?: string;
  revokedReason?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ConsoleSessionHistoryParams {
  vmId?: number;
  status?: ConsoleSessionStatus;
  page?: number;
  size?: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/v1/vm/{vmId}/console-sessions
   * Tạo console session → nhận portalOpenUrl để mở tab mới.
   */
  createSession(vmId: number): Observable<ConsoleSession> {
    return this.http
      .post<ApiResponse<ConsoleSession>>(
        `${this.apiUrl}/vm/${vmId}/console-sessions`,
        {}
      )
      .pipe(map(r => r.data));
  }

  /**
   * GET /api/v1/console-sessions
   * Lịch sử sessions (Spring Page response với field "content").
   */
  getSessions(params?: ConsoleSessionHistoryParams): Observable<ConsoleSessionSummary[]> {
    let httpParams = new HttpParams();
    if (params?.vmId != null)  httpParams = httpParams.set('vmId',  String(params.vmId));
    if (params?.status)        httpParams = httpParams.set('status', params.status);
    if (params?.page != null)  httpParams = httpParams.set('page',  String(params.page));
    if (params?.size != null)  httpParams = httpParams.set('size',  String(params.size));

    return this.http
      .get<ApiResponse<PageResponse<ConsoleSessionSummary>>>(
        `${this.apiUrl}/console-sessions`,
        { params: httpParams }
      )
      .pipe(map(r => r.data?.content ?? []));
  }

  /**
   * GET /api/v1/console-sessions/{id}
   * Lấy metadata của một console session.
   */
  getSession(id: number): Observable<ConsoleSession> {
    return this.http
      .get<ApiResponse<ConsoleSession>>(`${this.apiUrl}/console-sessions/${id}`)
      .pipe(map(r => r.data));
  }

  /**
   * POST /api/v1/console-sessions/{id}/revoke
   * Revoke console session.
   */
  revokeSession(id: number, reason?: string): Observable<void> {
    const params = reason ? new HttpParams().set('reason', reason) : undefined;
    return this.http
      .post<ApiResponse<void>>(
        `${this.apiUrl}/console-sessions/${id}/revoke`,
        {},
        { params }
      )
      .pipe(map(() => undefined));
  }

  /**
   * DELETE /api/v1/console-sessions/{id}
   * Đóng console session.
   */
  closeSession(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/console-sessions/${id}`)
      .pipe(map(() => undefined));
  }
}
