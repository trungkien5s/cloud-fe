import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile-modal.html',
  styleUrls: ['./user-profile-modal.css']
})
export class UserProfileModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

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

  closeModal() {
    this.close.emit();
  }

  logout() {
    this.authService.logout();
    this.closeModal();
  }
}
