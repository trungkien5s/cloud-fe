import {
  Component, OnInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleService, ConsoleSession, ConsoleSessionSummary } from '../../services/console.service';
import { VmService } from '../../services/vm.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-vm-console',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule
  ],
  templateUrl: './vm-console.component.html',
  styleUrls: ['./vm-console.component.css']
})
export class VmConsoleComponent implements OnInit, OnDestroy {
  vmId!: number;
  vmName = '';

  // Session hiện tại vừa tạo
  session: ConsoleSession | null = null;
  // Cửa sổ noVNC đang mở
  consoleWindow: Window | null = null;

  // Lịch sử sessions
  history: ConsoleSessionSummary[] = [];

  // UI state
  phase: 'idle' | 'creating' | 'active' | 'error' = 'idle';
  historyLoading = false;
  errorMsg = '';
  showHistory = false;

  // Countdown timer
  private countdownTimer: any;
  timeLeft = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consoleSvc: ConsoleService,
    private vmService: VmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.vmId = +id;
        this.loadVmName();
        this.loadHistory();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  // ── VM meta ───────────────────────────────────────────────────────────────

  loadVmName(): void {
    this.vmService.getVmById(this.vmId).subscribe({
      next: vm => { this.vmName = vm?.ten ?? `VM #${this.vmId}`; this.cdr.detectChanges(); },
      error: () => { this.vmName = `VM #${this.vmId}`; }
    });
  }

  // ── Console Session ───────────────────────────────────────────────────────

  /**
   * Flow:
   *  1. POST /api/v1/vm/{vmId}/console-sessions  → nhận session.portalOpenUrl
   *  2. Mở portalOpenUrl trong POPUP WINDOW có kích thước cố định
   *     → BE: validate token, update status = OPENED
   *     → BE: redirect 302 → OpenStack noVNC URL thật
   *     → Popup hiện giao diện terminal noVNC
   *
   *  Tại sao popup thay vì tab?
   *  - Tab: user dễ mất, không thấy được cả 2 cùng lúc
   *  - Iframe: X-Frame-Options SAMEORIGIN từ noVNC server → bị block
   *  - Popup: UX chuẩn như OpenStack Horizon, kích thước tối ưu cho terminal
   */
  openConsole(): void {
    this.phase = 'creating';
    this.errorMsg = '';

    this.consoleSvc.createSession(this.vmId).subscribe({
      next: session => {
        this.session = session;
        this.phase = 'active';
        this.startCountdown();
        this.loadHistory();

        const url = session.portalOpenUrl ?? session.portalConsoleUrl;
        if (url) {
          this.openConsolePopup(url);
        } else {
          this.errorMsg = 'BE không trả về URL console. Kiểm tra log server.';
        }
        this.cdr.detectChanges();
      },
      error: err => {
        this.phase = 'error';
        this.errorMsg = err?.error?.message ?? 'Không thể tạo console session. Vui lòng thử lại.';
        this.cdr.detectChanges();
      }
    });
  }

  /** Mở popup console với kích thước tối ưu cho terminal noVNC */
  private openConsolePopup(url: string): void {
    const w = Math.min(1200, screen.availWidth - 80);
    const h = Math.min(780, screen.availHeight - 80);
    const left = Math.round((screen.availWidth - w) / 2);
    const top  = Math.round((screen.availHeight - h) / 2);

    const features = [
      `width=${w}`,
      `height=${h}`,
      `left=${left}`,
      `top=${top}`,
      'menubar=no',
      'toolbar=no',
      'location=no',
      'status=no',
      'scrollbars=no',
      'resizable=yes'
    ].join(',');

    this.consoleWindow = window.open(url, `vnc_vm_${this.vmId}`, features);

    if (!this.consoleWindow) {
      this.errorMsg = 'Trình duyệt đã chặn popup. Hãy bật popup cho trang này (biểu tượng khoá địa chỉ) và thử lại.';
      this.cdr.detectChanges();
    }
  }

  /** Mở lại popup console nếu popup bị đóng nhưng session vẫn còn */
  reopenConsole(): void {
    if (!this.session) return;
    const url = this.session.portalOpenUrl ?? this.session.portalConsoleUrl;
    if (url) this.openConsolePopup(url);
  }

  /** Focus popup console đang mở ra trước */
  focusConsole(): void {
    if (this.consoleWindow && !this.consoleWindow.closed) {
      this.consoleWindow.focus();
    } else {
      this.reopenConsole();
    }
  }

  get isPopupOpen(): boolean {
    return !!this.consoleWindow && !this.consoleWindow.closed;
  }

  revokeSession(id: number): void {
    this.consoleSvc.revokeSession(id).subscribe({
      next: () => {
        if (this.session?.id === id) {
          this.session = null;
          this.phase = 'idle';
          this.stopCountdown();
          this.consoleWindow?.close();
          this.consoleWindow = null;
        }
        this.loadHistory();
        this.cdr.detectChanges();
      },
      error: err => {
        this.errorMsg = err?.error?.message ?? 'Không thể revoke session.';
        this.cdr.detectChanges();
      }
    });
  }

  closeSession(id: number): void {
    this.consoleSvc.closeSession(id).subscribe({
      next: () => {
        if (this.session?.id === id) {
          this.session = null;
          this.phase = 'idle';
          this.stopCountdown();
          this.consoleWindow?.close();
          this.consoleWindow = null;
        }
        this.loadHistory();
        this.cdr.detectChanges();
      },
      error: err => {
        this.errorMsg = err?.error?.message ?? 'Không thể đóng session.';
        this.cdr.detectChanges();
      }
    });
  }

  closeCurrentSession(): void {
    if (this.session) this.closeSession(this.session.id);
  }

  // ── History ───────────────────────────────────────────────────────────────

  loadHistory(): void {
    this.historyLoading = true;
    this.consoleSvc.getSessions({ vmId: this.vmId, size: 20 }).subscribe({
      next: list => {
        this.history = list;
        this.historyLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historyLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) this.loadHistory();
  }

  // ── Countdown (dùng remainingSeconds từ BE) ───────────────────────────────

  private startCountdown(): void {
    this.stopCountdown();

    // Ưu tiên dùng remainingSeconds từ BE; fallback sang expiresAt
    let secondsLeft: number;
    if (this.session?.remainingSeconds != null) {
      secondsLeft = this.session.remainingSeconds;
    } else if (this.session?.expiresAt) {
      secondsLeft = Math.max(0, Math.floor(
        (new Date(this.session.expiresAt).getTime() - Date.now()) / 1000
      ));
    } else {
      return; // không có thông tin thời gian
    }

    const tick = () => {
      if (secondsLeft <= 0) {
        this.timeLeft = 'Đã hết hạn';
        this.stopCountdown();
        this.phase = 'idle';
        this.session = null;
        this.cdr.detectChanges();
        return;
      }
      const m = Math.floor(secondsLeft / 60);
      const s = secondsLeft % 60;
      this.timeLeft = `${m}:${s.toString().padStart(2, '0')}`;
      secondsLeft--;
      this.cdr.detectChanges();
    };

    tick();
    this.countdownTimer = setInterval(tick, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
      this.timeLeft = '';
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  goBack(): void { this.router.navigate(['/vm/detail', this.vmId]); }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'Chờ mở',
      OPENED:  'Đang dùng',
      EXPIRED: 'Đã hết hạn',
      REVOKED: 'Đã thu hồi',
      CLOSED:  'Đã đóng'
    };
    return map[s] ?? s;
  }

  statusClass(s: string): string {
    return ({
      PENDING: 'badge-pending',
      OPENED:  'badge-active',
      EXPIRED: 'badge-expired',
      REVOKED: 'badge-revoked',
      CLOSED:  'badge-closed'
    } as Record<string, string>)[s] ?? '';
  }

  get isSessionActive(): boolean {
    return this.session?.status === 'PENDING' || this.session?.status === 'OPENED';
  }
}
