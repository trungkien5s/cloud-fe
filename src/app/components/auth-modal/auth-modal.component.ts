import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

// NG-ZORRO imports
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzNotificationService } from 'ng-zorro-antd/notification';

export type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'TWO_FACTOR';

@Component({
    selector: 'app-auth-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NzModalModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzCheckboxModule,
        NzSelectModule,
        NzAlertModule,
        NzSpinModule,
        NzRadioModule,
        NzIconModule,
        NzDividerModule,
        NzTooltipModule,
        NzGridModule,
    ],
    templateUrl: './auth-modal.component.html',
    styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {
    @Output() close = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private notification = inject(NzNotificationService);
    private cdr = inject(ChangeDetectorRef);

    mode: AuthMode = 'LOGIN';
    isLoading = false;
    errorMessage = '';
    isModalVisible = true;

    // ── Reactive Forms ──────────────────────────────────────────────────────
    loginForm: FormGroup = this.fb.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });

    registerForm: FormGroup = this.fb.group({
        username: ['', [Validators.required, Validators.maxLength(20)]],
        fullname: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(11)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        province: ['', [Validators.required]],
        address: [''],
        captchaInput: ['', [Validators.required]],
        verifyByEmail: [false],
        verifyBySMS: [false],
        agreeTerms: [false],
    });

    forgotPasswordForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
    });

    resetPasswordForm: FormGroup = this.fb.group({
        resetToken: [''],
        otpCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
    });

    twoFactorForm: FormGroup = this.fb.group({
        sessionToken: [''],
        otpCode: ['', [Validators.required]],
        rememberDevice: [false],
    });

    // 2FA state
    available2FaMethods: string[] = [];
    selected2FaMethod = '';
    step2Fa: 'CHOOSE_METHOD' | 'ENTER_OTP' = 'ENTER_OTP';

    // Captcha
    captchaData = { captchaId: '', captchaImageBase64: '' };

    // Provinces & Terms
    provinces: any[] = [];
    terms: any = null;
    showTermsPopup = false;

    ngOnInit(): void {
        this.loadCaptcha();
    }

    // ── Captcha ───────────────────────────────────────────────────────────────
    loadCaptcha(): void {
        this.authService.getCaptcha().subscribe({
            next: (res) => {
                this.captchaData.captchaId = res.captchaId;
                let base64 = res.captchaImageBase64;
                if (base64 && !base64.startsWith('data:image')) {
                    base64 = 'data:image/png;base64,' + base64;
                }
                this.captchaData.captchaImageBase64 = base64;
                this.errorMessage = '';
            },
            error: () => {
                this.errorMessage = 'Lỗi tải mã captcha. Vui lòng thử lại!';
            },
        });
    }

    // ── Mode switching ────────────────────────────────────────────────────────
    setMode(newMode: AuthMode): void {
        this.mode = newMode;
        this.errorMessage = '';
        if (newMode === 'REGISTER' || newMode === 'LOGIN') {
            this.loadCaptcha();
        }
        if (newMode === 'REGISTER') {
            if (this.provinces.length === 0) {
                this.authService.getProvinces().subscribe({
                    next: (data) => (this.provinces = data),
                    error: (err) => console.error('Failed to load provinces', err)
                });
            }
            if (!this.terms) {
                this.authService.getTermsOfService().subscribe({
                    next: (data) => (this.terms = data),
                    error: (err) => console.error('Failed to load terms', err)
                });
            }
        }
    }

    // ── Title & Button Text ─────────────────────────────────────────────────
    getTitle(): string {
        const map: Record<AuthMode, string> = {
            LOGIN: 'Đăng nhập',
            REGISTER: 'Đăng ký tài khoản',
            FORGOT_PASSWORD: 'Quên mật khẩu',
            RESET_PASSWORD: 'Tạo mật khẩu mới',
            TWO_FACTOR: 'Xác thực 2 bước (2FA)',
        };
        return map[this.mode];
    }

    getSubmitText(): string {
        if (this.isLoading) return 'Đang xử lý...';
        const map: Record<AuthMode, string> = {
            LOGIN: 'Đăng nhập',
            REGISTER: 'Đăng ký',
            FORGOT_PASSWORD: 'Gửi OTP',
            RESET_PASSWORD: 'Đổi mật khẩu',
            TWO_FACTOR: this.step2Fa === 'CHOOSE_METHOD' ? 'Gửi mã OTP' : 'Xác nhận OTP',
        };
        return map[this.mode];
    }

    getModalWidth(): number {
        return this.mode === 'REGISTER' ? 580 : 440;
    }

    // ── Form validation helper ──────────────────────────────────────────────
    private markFormDirty(form: FormGroup): void {
        Object.values(form.controls).forEach((c) => {
            c.markAsDirty();
            c.updateValueAndValidity();
        });
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    submitForm(): void {
        this.errorMessage = '';

        switch (this.mode) {
            case 'LOGIN':
                if (this.loginForm.invalid) {
                    this.markFormDirty(this.loginForm);
                    return;
                }
                this.isLoading = true;
                const loginPayload = {
                    ...this.loginForm.value,
                    captchaId: this.captchaData.captchaId,
                };
                this.authService.login(loginPayload).subscribe({
                    next: (res) => {
                        this.isLoading = false;
                        if (res?.twoFactorRequired) {
                            this.twoFactorForm.patchValue({ sessionToken: res.sessionToken || '' });
                            this.check2FaMethods(this.loginForm.value.username);
                        } else {
                            this.notification.success('Thành công', 'Đăng nhập thành công!');
                            this.closeModal();
                        }
                    },
                    error: (err) => {
                        this.isLoading = false;
                        this.errorMessage = err?.error?.message || err?.message || 'Đăng nhập thất bại!';
                        this.loadCaptcha();
                        this.cdr.detectChanges();
                    },
                });
                break;

            case 'REGISTER':
                if (this.registerForm.invalid) {
                    this.markFormDirty(this.registerForm);
                    return;
                }
                if (!this.registerForm.value.agreeTerms) {
                    this.errorMessage = 'Bạn phải đồng ý với điều khoản sử dụng dịch vụ';
                    return;
                }
                this.isLoading = true;
                const regPayload = {
                    ...this.registerForm.value,
                    captchaId: this.captchaData.captchaId,
                };
                this.authService.register(regPayload).subscribe({
                    next: () => {
                        this.isLoading = false;
                        this.notification.success(
                            'Đăng ký thành công',
                            'Vui lòng kiểm tra email để kích hoạt tài khoản.'
                        );
                        this.loginForm.patchValue({ username: this.registerForm.value.username });
                        this.setMode('LOGIN');
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        this.isLoading = false;
                        this.errorMessage = err.error?.message || err?.message || 'Đăng ký thất bại';
                        this.loadCaptcha();
                        this.cdr.detectChanges();
                    },
                });
                break;

            case 'FORGOT_PASSWORD':
                if (this.forgotPasswordForm.invalid) {
                    this.markFormDirty(this.forgotPasswordForm);
                    return;
                }
                this.isLoading = true;
                this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
                    next: (res) => {
                        this.isLoading = false;
                        this.resetPasswordForm.patchValue({ resetToken: res.resetToken || 'TOKEN_FROM_HEADER_OR_BODY' });
                        this.setMode('RESET_PASSWORD');
                    },
                    error: (err) => {
                        this.isLoading = false;
                        this.errorMessage = err.error?.message || err?.message || 'Có lỗi xảy ra';
                        this.cdr.detectChanges();
                    },
                });
                break;

            case 'RESET_PASSWORD':
                if (this.resetPasswordForm.invalid) {
                    this.markFormDirty(this.resetPasswordForm);
                    return;
                }
                this.isLoading = true;
                this.authService.resetPassword(this.resetPasswordForm.value).subscribe({
                    next: () => {
                        this.isLoading = false;
                        this.notification.success('Thành công', 'Đổi mật khẩu thành công!');
                        this.setMode('LOGIN');
                    },
                    error: (err) => {
                        this.isLoading = false;
                        this.errorMessage = err.error?.message || err?.message || 'Đổi mật khẩu thất bại';
                        this.cdr.detectChanges();
                    },
                });
                break;

            case 'TWO_FACTOR':
                if (this.step2Fa === 'CHOOSE_METHOD') {
                    this.isLoading = true;
                    this.authService.send2FaOtp(this.twoFactorForm.value.sessionToken, this.selected2FaMethod).subscribe({
                        next: () => {
                            this.isLoading = false;
                            this.step2Fa = 'ENTER_OTP';
                        },
                        error: (err) => {
                            this.isLoading = false;
                            this.errorMessage = err.error?.message || err?.message || 'Không thể gửi mã OTP';
                            this.cdr.detectChanges();
                        },
                    });
                } else {
                    if (this.twoFactorForm.invalid) {
                        this.markFormDirty(this.twoFactorForm);
                        return;
                    }
                    this.isLoading = true;
                    this.authService.verify2Fa(this.twoFactorForm.value).subscribe({
                        next: () => {
                            this.isLoading = false;
                            this.notification.success('Thành công', 'Xác thực 2 bước thành công!');
                            this.closeModal();
                        },
                        error: (err) => {
                            this.isLoading = false;
                            this.errorMessage = err.error?.message || err?.message || 'Mã OTP không đúng';
                            this.cdr.detectChanges();
                        },
                    });
                }
                break;
        }
    }

    check2FaMethods(username: string): void {
        this.isLoading = true;
        this.authService.get2FaMethods(username).subscribe({
            next: (methods) => {
                this.isLoading = false;
                this.available2FaMethods = methods;
                this.setMode('TWO_FACTOR');
                if (methods?.length > 0) {
                    this.step2Fa = 'CHOOSE_METHOD';
                    this.selected2FaMethod = methods[0];
                } else {
                    this.step2Fa = 'ENTER_OTP';
                }
            },
            error: () => {
                this.isLoading = false;
                this.errorMessage = 'Không thể lấy phương thức 2FA';
                this.cdr.detectChanges();
            },
        });
    }

    closeModal(): void {
        this.isModalVisible = false;
        this.close.emit();
    }

    showTermsInfo(): void {
        this.showTermsPopup = true;
    }

    closeTermsInfo(): void {
        this.showTermsPopup = false;
    }
}
