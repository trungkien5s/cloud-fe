import { Component, EventEmitter, Output, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { VmService } from '../../services/vm.service';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';

const BASE = '/assets/figma';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        AuthModalComponent,
        NzAvatarModule,
        NzButtonModule,
        NzEmptyModule,
        NzIconModule,
        NzInputModule,
        NzSpinModule,
        NzTagModule
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    @Output() openConsultPopup = new EventEmitter<void>();

    currentUser = signal<AuthUser | null>(null);

    showAuthModal = signal<boolean>(false);
    showUserDropdown = signal<boolean>(false);
    showVmDropdown = signal<boolean>(false);
    showConsultPopup = signal<boolean>(false);
    consultSubmitted = signal<boolean>(false);

    consultForm = {
        name: '',
        phone: '',
        company: '',
        note: '',
    };

    myVMs = signal<any[]>([]);
    isLoadingVMs = signal<boolean>(false);

    activeNav = signal<string>('');

    navLinks = [
        { label: 'Dịch vụ', id: 'services' },
        { label: 'Giải pháp', id: 'solutions' },
        { label: 'Bảng giá', id: 'pricing' },
        { label: 'Tin tức', id: 'news' },
        { label: 'Tài liệu', id: 'docs' },
        { label: 'Liên hệ', id: 'contact' },
    ];

    assets = {
        logoClouDC: `${BASE}/logo_clouddc.png`,
        userIcon: `${BASE}/user_icon.svg`,
        popupBanner: `${BASE}/hero_banner.png`,
        successVector: `${BASE}/2588ba8a285864f6aaa8a4a17bdf33ca8c961336.svg`,
        successGroup: `${BASE}/d7707a8636034e0fab3f86fe8a7d0d32d1320c9f.svg`,
        successGroup1: `${BASE}/46d1678f3fe39c7fc3aad2a829891fa79d31c4f3.svg`
    };

    constructor(
        private authService: AuthService,
        private vmService: VmService,
        private router: Router
    ) { }

    ngOnInit() {
        this.authService.authUser$.subscribe(user => {
            this.currentUser.set(user);
            if (user) {
                this.loadMyVMs();
            } else {
                this.myVMs.set([]);
            }
        });
        
        // Match active tab on load or router navigation
        const currentUrl = this.router.url;
        if (currentUrl.includes('/pricing')) {
             this.activeNav.set('pricing');
        } else if (currentUrl === '/' || currentUrl === '/#services') {
             // Home page.
        }
    }

    loadMyVMs() {
        this.isLoadingVMs.set(true);
        this.vmService.getMyVMs().subscribe({
            next: (data) => {
                if (data && data.content) {
                    this.myVMs.set(data.content);
                } else if (Array.isArray(data)) {
                    this.myVMs.set(data);
                }
                this.isLoadingVMs.set(false);
            },
            error: () => {
                console.error('Không thể tải danh sách VM');
                this.isLoadingVMs.set(false);
            }
        });
    }

    toggleVmDropdown(event: Event) {
        event.stopPropagation();
        this.showVmDropdown.set(!this.showVmDropdown());
        if (this.showVmDropdown() && this.myVMs().length === 0) {
            this.loadMyVMs();
        }
        this.showUserDropdown.set(false);
    }

    closeVmDropdown() {
        this.showVmDropdown.set(false);
    }

    openAuthModal() {
        if (!this.currentUser()) {
            this.showAuthModal.set(true);
        }
    }

    closeAuthModal() {
        this.showAuthModal.set(false);
    }

    toggleUserDropdown(event: Event) {
        event.stopPropagation();
        this.showUserDropdown.set(!this.showUserDropdown());
        this.showVmDropdown.set(false);
    }

    closeUserDropdown() {
        this.showUserDropdown.set(false);
    }

    onLogout() {
        this.authService.logout();
        this.showUserDropdown.set(false);
    }

    onOpenConsultPopup() {
        this.showConsultPopup.set(true);
    }

    closeConsultPopup() {
        this.showConsultPopup.set(false);
        this.consultSubmitted.set(false);
        this.consultForm = { name: '', phone: '', company: '', note: '' };
    }

    submitConsultForm() {
        console.log('Consultation form submitted:', this.consultForm);
        this.consultSubmitted.set(true);
    }

    scrollToSection(id: string, event: Event) {
        if (id) {
            event.preventDefault();
            this.activeNav.set(id);
            
            // Redirect to pricing page
            if (id === 'pricing') {
                this.router.navigate(['/pricing']);
                return;
            }

            const element = document.getElementById(id);
            if (element) {
                const headerOffset = 80;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }
        }
    }

    @HostListener('document:click', ['$event'])
    onPageClick(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-dropdown-container')) {
            this.showUserDropdown.set(false);
        }
        if (!target.closest('.vm-dropdown-container')) {
            this.showVmDropdown.set(false);
        }
    }
}
