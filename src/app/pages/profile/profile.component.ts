import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    userInfo: any = null;
    isLoading = true;
    errorMessage = '';

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
}
