import { Component, EventEmitter, Output, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { VmService } from '../../services/vm.service';

const BASE = '/assets/figma';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule, AuthModalComponent],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    @Output() openConsultPopup = new EventEmitter<void>();

    currentUser = signal<AuthUser | null>(null);

    showServiceMenu = signal<boolean>(false);
    showAuthModal = signal<boolean>(false);
    showUserDropdown = signal<boolean>(false);
    showVmDropdown = signal<boolean>(false);

    myVMs = signal<any[]>([]);
    isLoadingVMs = signal<boolean>(false);

    menuCategory = signal<string>('featured');
    activeNav = signal<string>('');

    navLinks = [
        { label: 'Dịch vụ', id: 'services' },
        { label: 'Giải pháp', id: 'solutions' },
        { label: 'Bảng giá', id: 'pricing' },
        { label: 'Tin tức', id: 'news' },
        { label: 'Tài liệu', id: 'docs' },
        { label: 'Liên hệ', id: 'contact' },
    ];

    serviceCategories = [
        { id: 'cloud', label: 'Hạ tầng đám mây' },
        { id: 'storage', label: 'Lưu trữ & Sao lưu' },
        { id: 'network', label: 'Mạng & Bảo mật' },
        { id: 'specialized', label: 'Giải pháp chuyên biệt' },
    ];

    menuServiceCards = [
        { title: 'Cloud Server', subtitle: 'Máy chủ ảo trên đám mây', img: `${BASE}/usp_tech.png` },
        { title: 'Web Hosting', subtitle: 'Máy chủ ảo trên đám mây', img: `${BASE}/usp_security.png` },
        { title: 'Database Service', subtitle: 'Máy chủ ảo trên đám mây', img: `${BASE}/usp_quality.png` },
        { title: 'Web Hosting', subtitle: 'Máy chủ ảo trên đám mây', img: `${BASE}/usp_security.png` },
    ];

    assets = {
        logoClouDC: `${BASE}/logo_clouddc.png`,
        userIcon: `${BASE}/user_icon.svg`,
        menuBanner: `${BASE}/usp_tech.png`
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
        this.showServiceMenu.set(false);
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
        this.openConsultPopup.emit();
    }

    onServiceNavClick(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.showServiceMenu.set(!this.showServiceMenu());
    }

    closeServiceMenu() {
        this.showServiceMenu.set(false);
    }

    setMenuCategory(id: string) {
        this.menuCategory.set(id);
    }

    scrollToSection(id: string, event: Event) {
        if (id) {
            event.preventDefault();
            this.activeNav.set(id);
            this.closeServiceMenu();
            
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
        if (!target.closest('[data-menu]') && !target.closest('[data-nav]')) {
            this.showServiceMenu.set(false);
        }
        if (!target.closest('.user-dropdown-container')) {
            this.showUserDropdown.set(false);
        }
        if (!target.closest('.vm-dropdown-container')) {
            this.showVmDropdown.set(false);
        }
    }
}
