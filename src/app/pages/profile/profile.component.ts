import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        NzAlertModule,
        NzAvatarModule,
        NzCardModule,
        NzDescriptionsModule,
        NzIconModule,
        NzSpinModule,
        NzTagModule
    ],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    userInfo: any = null;
    isLoading = true;
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const currentUser = this.authService.currentUser;
        if (currentUser && currentUser.username) {
            this.authService.getUserByUsername(currentUser.username).subscribe({
                next: (res) => {
                    this.userInfo = res;
                    this.isLoading = false;
                    this.cdr.detectChanges(); // Bắt buộc Angular cập nhật giao diện
                },
                error: (err) => {
                    this.errorMessage = 'Không thể tải thông tin người dùng.';
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            this.errorMessage = 'Chưa đăng nhập.';
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }
}
