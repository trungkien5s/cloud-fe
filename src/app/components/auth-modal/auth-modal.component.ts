import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

export type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'TWO_FACTOR';

@Component({
    selector: 'app-auth-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './auth-modal.component.html',
    styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {
    @Output() close = new EventEmitter<void>();

    mode: AuthMode = 'LOGIN';
    errorMessage: string = '';
    isLoading: boolean = false;

    // Form Data Models based on BE DTOs
    loginForm = {
        username: '',
        password: '',
    };

    registerForm = {
        username: '',
        fullname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        province: '',
        address: '',
        verifyByEmail: false,
        verifyBySMS: false,
        captchaInput: '',
        agreeTerms: false
    };

    forgotPasswordForm = {
        email: ''
    };

    resetPasswordForm = {
        resetToken: '',
        otpCode: '',
        newPassword: '',
        confirmPassword: ''
    };

    twoFactorForm = {
        sessionToken: '',
        otpCode: '',
        rememberDevice: false
    };

    // 2FA Methods choice state
    available2FaMethods: string[] = [];
    selected2FaMethod: string = '';
    step2Fa: 'CHOOSE_METHOD' | 'ENTER_OTP' = 'ENTER_OTP';

    captchaData = {
        captchaId: '',
        captchaImageBase64: ''
    };

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadCaptcha();
    }

    loadCaptcha() {
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
            error: (err) => {
                console.error('Failed to load captcha', err);
                this.errorMessage = 'Lỗi tải mã captcha. Vui lòng kiểm tra lại CORS ở Backend (Spring Boot) hoặc Network!';
            }
        });
    }

    getTitle(): string {
        switch (this.mode) {
            case 'LOGIN': return 'Đăng nhập';
            case 'REGISTER': return 'Đăng ký';
            case 'FORGOT_PASSWORD': return 'Quên mật khẩu';
            case 'RESET_PASSWORD': return 'Tạo mật khẩu mới';
            case 'TWO_FACTOR': return 'Xác thực 2 bước (2FA)';
            default: return 'Xác thực';
        }
    }

    getSubmitText(): string {
        if (this.isLoading) return 'Đang xử lý...';
        switch (this.mode) {
            case 'LOGIN': return 'Đăng nhập';
            case 'REGISTER': return 'Đăng ký';
            case 'FORGOT_PASSWORD': return 'Gửi OTP';
            case 'RESET_PASSWORD': return 'Đổi mật khẩu';
            case 'TWO_FACTOR': return this.step2Fa === 'CHOOSE_METHOD' ? 'Gửi mã OTP' : 'Xác nhận OTP';
            default: return 'Tiếp tục';
        }
    }

    setMode(newMode: AuthMode) {
        this.mode = newMode;
        this.errorMessage = '';
        if (newMode === 'REGISTER' || newMode === 'LOGIN') {
            this.loadCaptcha();
        }
    }

    submitForm() {
        console.log('Button Clicked! submitForm triggered. Mode:', this.mode);
        this.errorMessage = '';
        this.isLoading = true;

        switch (this.mode) {
            case 'LOGIN':
                const loginPayload = {
                    ...this.loginForm,
                    captchaId: this.captchaData.captchaId
                };
                console.log('Login Payload prepared:', loginPayload);
                this.authService.login(loginPayload).subscribe({
                    next: (res) => {
                        console.log('Login success handler called, res:', res);
                        this.isLoading = false;
                        if (res && res.twoFactorRequired) {
                            this.twoFactorForm.sessionToken = res.sessionToken || '';
                            this.check2FaMethods(this.loginForm.username);
                        } else {
                            // Successfully logged in (global state already updated via service)
                            this.closeModal();
                        }
                    },
                    error: (err) => {
                        console.error('Login error handler caught an error:', err);
                        this.isLoading = false;
                        this.errorMessage = err?.error?.message || err?.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin!';
                        this.loadCaptcha(); // Reload captcha on error
                        this.cdr.detectChanges();
                    }
                });
                break;

            case 'REGISTER':
                const payload = {
                    ...this.registerForm,
                    captchaId: this.captchaData.captchaId
                };
                this.authService.register(payload).subscribe({
                    next: () => {
                        this.isLoading = false;
                        alert('Đăng ký thành công!');
                        this.setMode('LOGIN');
                    },
                    error: (err) => {
                        this.isLoading = false;
                        this.errorMessage = err.error?.message || 'Đăng ký thất bại, vui lòng thử lại';
                        this.loadCaptcha(); // Reload captcha on fail
                    }
                });
                break;

            case 'FORGOT_PASSWORD':
                this.authService.forgotPassword(this.forgotPasswordForm).subscribe({
                    next: (res) => {
                        this.isLoading = false;
                        this.resetPasswordForm.resetToken = res.resetToken || 'TOKEN_FROM_HEADER_OR_BODY';
                        this.setMode('RESET_PASSWORD');
                    },
                    error: (err) => {
                        this.isLoading = false;
                        this.errorMessage = err.error?.message || 'Có lỗi xảy ra khi yêu cầu gửi OTP';
                    }
                });
                break;

            case 'RESET_PASSWORD':
                this.authService.resetPassword(this.resetPasswordForm).subscribe({
                    next: () => {
                        this.isLoading = false;
                        alert('Đổi mật khẩu thành công!');
                        this.setMode('LOGIN');
                    },
                    error: (err) => {
                        this.isLoading = false;
                        this.errorMessage = err.error?.message || 'Đổi mật khẩu thất bại';
                    }
                });
                break;

            case 'TWO_FACTOR':
                if (this.step2Fa === 'CHOOSE_METHOD') {
                    this.authService.send2FaOtp(this.twoFactorForm.sessionToken, this.selected2FaMethod).subscribe({
                        next: () => {
                            this.isLoading = false;
                            this.step2Fa = 'ENTER_OTP';
                        },
                        error: (err) => {
                            this.isLoading = false;
                            this.errorMessage = err.error?.message || 'Không thể gửi mã OTP';
                        }
                    });
                } else {
                    this.authService.verify2Fa(this.twoFactorForm).subscribe({
                        next: () => {
                            this.isLoading = false;
                            alert('Xác thực 2 bước thành công!');
                            this.closeModal();
                        },
                        error: (err) => {
                            this.isLoading = false;
                            this.errorMessage = err.error?.message || 'Mã OTP không đúng hoặc đã hết hạn';
                        }
                    });
                }
                break;
        }
    }

    check2FaMethods(username: string) {
        this.isLoading = true;
        this.authService.get2FaMethods(username).subscribe({
            next: (methods) => {
                this.isLoading = false;
                this.available2FaMethods = methods;
                this.setMode('TWO_FACTOR');
                if (methods && methods.length > 0) {
                    this.step2Fa = 'CHOOSE_METHOD';
                    this.selected2FaMethod = methods[0];
                } else {
                    this.step2Fa = 'ENTER_OTP';
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = 'Không thể lấy phương thức 2FA';
            }
        });
    }

    closeModal() {
        this.close.emit();
    }
}
