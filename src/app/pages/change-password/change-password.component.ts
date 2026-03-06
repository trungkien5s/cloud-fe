import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
    userInfo: any = null;
    isLoading = true;
    errorMessage = '';

    passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };
    isChangingPassword = false;
    passwordMessage = '';
    passwordError = '';

    constructor(private authService: AuthService) { }

    ngOnInit() {
        const currentUser = this.authService.currentUser;
        if (currentUser && currentUser.username) {
            this.authService.getUserByUsername(currentUser.username).subscribe({
                next: (res) => {
                    this.userInfo = res;
                    this.isLoading = false;
                },
                error: (err) => {
                    this.errorMessage = 'Không thể tải thông tin người dùng.';
                    this.isLoading = false;
                }
            });
        } else {
            this.errorMessage = 'Chưa đăng nhập.';
            this.isLoading = false;
        }
    }

    onChangePassword() {
        this.passwordMessage = '';
        this.passwordError = '';

        if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
            this.passwordError = 'Vui lòng nhập đầy đủ thông tin.';
            return;
        }

        if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
            this.passwordError = 'Mật khẩu xác nhận không khớp.';
            return;
        }

        if (this.userInfo && this.userInfo.id) {
            this.isChangingPassword = true;
            this.authService.changePassword(this.userInfo.id, this.passwordData).subscribe({
                next: (res) => {
                    this.isChangingPassword = false;
                    if (res && res.success !== false) {
                        this.passwordMessage = res?.message || 'Đổi mật khẩu thành công.';
                        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
                    } else {
                        this.passwordError = res?.message || 'Đổi mật khẩu thất bại.';
                    }
                },
                error: (err) => {
                    this.isChangingPassword = false;
                    this.passwordError = err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
                }
            });
        } else {
            this.passwordError = 'Không xác định được ID người dùng.';
        }
    }
}
