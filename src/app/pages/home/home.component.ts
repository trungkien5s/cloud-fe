import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthUser } from '../../services/auth.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
// ─── Figma asset URLs (served by Figma Desktop MCP server on localhost:3845)
const BASE = '/assets/figma';
const A = {
    // Hero
    heroFrame: `${BASE}/hero_frame.png`,
    heroFrameLeft: `${BASE}/hero_frame_left.png`,
    heroFrameRight: `${BASE}/hero_frame_right.png`,
    heroBanner: `${BASE}/hero_banner.png`,
    heroHeadline: `${BASE}/hero_headline.png`,
    // Logos
    logoClouDC: `${BASE}/logo_clouddc.png`,
    logoMobiFone: `${BASE}/logo_mobifone.svg`,
    // Header icons
    userIcon: `${BASE}/user_icon.svg`,
    // USP icons
    uspTech: `${BASE}/usp_tech.png`,
    uspSecurity: `${BASE}/usp_security.png`,
    uspQuality: `${BASE}/usp_quality.png`,
    uspSupport: `${BASE}/usp_support.png`,
    // Why ClouDC
    whyVideo: `${BASE}/why_video.png`,
    // Services
    serviceCardBg: `${BASE}/service_card_bg.png`,
    // Menu banner
    menuBanner: `${BASE}/usp_tech.png`,
    // Popup banner (consultation modal)
    popupBanner: `${BASE}/hero_banner.png`,
    // Menu service card icons
    menuCard1: `${BASE}/usp_tech.png`,
    menuCard2: `${BASE}/usp_security.png`,
    menuCard3: `${BASE}/usp_quality.png`,
    // Solutions
    solutionCloud: `${BASE}/solution_cloud.png`,
    solutionDatabase: `${BASE}/solution_database.png`,
    solutionHosting: `${BASE}/solution_hosting.png`,
    // Success illustration
    successVector: `${BASE}/2588ba8a285864f6aaa8a4a17bdf33ca8c961336.svg`,
    successGroup: `${BASE}/d7707a8636034e0fab3f86fe8a7d0d32d1320c9f.svg`,
    successGroup1: `${BASE}/46d1678f3fe39c7fc3aad2a829891fa79d31c4f3.svg`,
    // Brand / video
    brandVideo: `${BASE}/brand_video.png`,
    // Cert logos (brand section)
    cert1: `${BASE}/cert_1.png`,
    cert2: `${BASE}/cert_2.png`,
    cert3: `${BASE}/cert_3.png`,
    cert4: `${BASE}/cert_4.png`,
    cert5: `${BASE}/cert_5.png`,
    // News
    newsFeatured: `${BASE}/news_featured.png`,
    newsArticle1: `${BASE}/news_article1.png`,
    newsArticle2: `${BASE}/hero_frame_right.png`,
    newsArticle3: `${BASE}/news_article3.png`,
    // Partners
    partner1: `${BASE}/partner_1.png`,
    partner2: `${BASE}/partner_2.png`,
    partner3: `${BASE}/partner_3.png`,
    partner4: `${BASE}/partner_4.png`,
    partner5: `${BASE}/partner_5.png`,
    partner6: `${BASE}/partner_6.png`,
    partner7: `${BASE}/partner_7.png`,
    partner8: `${BASE}/partner_8.png`,
    // Clients
    client1: `${BASE}/client_1.png`,
    client2: `${BASE}/client_2.png`,
    client3: `${BASE}/client_3.png`,
    client4: `${BASE}/client_4.png`,
    client5: `${BASE}/client_5.png`,
    client6: `${BASE}/client_6.png`,
    client7: `${BASE}/client_7.png`,
    client8: `${BASE}/client_8.png`,
    // Footer certs
    footerCertMinistry: `${BASE}/footer_cert_ministry.png`,
    footerCert1: `${BASE}/footer_cert_1.png`,
    footerCert2: `${BASE}/footer_cert_2.png`,
    footerCert3: `${BASE}/footer_cert_3.png`,
    footerCert4: `${BASE}/footer_cert_4.png`,
    footerCert5: `${BASE}/footer_cert_5.png`,
    // Social icons
    social1: `${BASE}/social_1.png`,
    social2: `${BASE}/social_2.png`,
    social3: `${BASE}/social_3.png`,
    social4: `${BASE}/social_4.png`,
    social5: `${BASE}/social_5.png`,
};

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NzButtonModule,
        NzCardModule,
        NzCollapseModule,
        NzIconModule,
        NzInputModule,
        NzModalModule,
        NzRadioModule
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
    currentUser = signal<AuthUser | null>(null);

    activeTab = signal<string>('cloud');
    activeNewsTab = signal<string>('tech');
    activeFaq = signal<number>(0);
    showConsultPopup = signal<boolean>(false);
    consultSubmitted = signal<boolean>(false);

    consultForm = {
        name: '',
        phone: '',
        company: '',
        note: '',
    };

    // Hero Banner Carousel
    heroBanners = [
        { 
            isHtml: false,
            img: A.heroBanner, 
            headline: A.heroHeadline,
            bg: 'linear-gradient(108.46deg, #020202 0.38%, #1D0535 46.21%, #004D54 99.16%)'
        },
        { 
            isHtml: true,
            title: 'CLOUD SERVER',
            subtitle: 'LINH HOẠT & HIỆU NĂNG CAO',
            desc: 'Khởi tạo máy ảo ảo hoá mạnh mẽ chỉ trong vài giây. Mở rộng tài nguyên không giới hạn, đảm bảo hoạt động liên tục 99.99%.',
            tags: ['Bảo mật tuyệt đối', 'Uptime 99.99%', 'Hạ tầng mạnh mẽ', 'Tối ưu chi phí'],
            cta: 'Khởi tạo VM ngay',
            img: `${BASE}/solution_cloud.png`,
            bg: 'linear-gradient(108.46deg, #0d121c 0%, #152238 50%, #0a1f2e 100%)'
        },
        { 
            isHtml: true,
            title: 'VIRTUAL PRIVATE CLOUD',
            subtitle: 'HẠ TẦNG MẠNH MẼ, RIÊNG BIỆT',
            desc: 'Thiết lập mạng lưới ảo nội bộ VPC dành riêng cho doanh nghiệp với chuẩn bảo mật quốc tế và kết nối MPLS/VPN linh hoạt.',
            tags: ['Kết nối an toàn', 'Kiểm soát truy cập', 'Mạng lưới tốc độ cao', 'Dễ dàng tích hợp'],
            cta: 'Tìm hiểu VPC',
            img: `${BASE}/Private_Cloud.png`,
            bg: 'linear-gradient(120deg, #090e17 0%, #2f1d43 60%, #111b2b 100%)'
        },
        { 
            isHtml: true,
            title: 'CLOUD DATABASE',
            subtitle: 'QUẢN LÝ DỮ LIỆU TOÀN DIỆN',
            desc: 'Hệ quản trị cơ sở dữ liệu hoàn toàn tự động, tự động sao lưu và dễ dàng theo dõi hiệu năng (MySQL, PostgreSQL, MongoDB).',
            tags: ['Auto Backup', 'High Availability', 'Bảo mật dữ liệu', 'Mở rộng linh hoạt'],
            cta: 'Xem Bảng Giá',
            img: `${BASE}/solution_database.png`,
            bg: 'linear-gradient(90deg, #0b151e 0%, #062b33 100%)'
        }
    ];
    activeBannerIndex = signal<number>(0);
    private bannerInterval: any;

    getSlideClass(index: number): string {
        const active = this.activeBannerIndex();
        const total = this.heroBanners.length;
        
        if (index === active) return 'hero__slide--active';
        
        let prev = active - 1;
        if (prev < 0) prev = total - 1;
        
        let next = active + 1;
        if (next >= total) next = 0;
        
        if (index === prev) return 'hero__slide--prev';
        if (index === next) return 'hero__slide--next';
        
        const diff = (index - active + total) % total;
        if (diff < total / 2) return 'hero__slide--hidden-right';
        else return 'hero__slide--hidden-left';
    }

    onSlideClick(index: number) {
        const slideClass = this.getSlideClass(index);
        if (slideClass === 'hero__slide--prev') {
            this.prevBanner();
        } else if (slideClass === 'hero__slide--next') {
            this.nextBanner();
        }
    }

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
        { title: 'Cloud Server', subtitle: 'Máy chủ ảo trên đám mây', img: A.menuCard1 },
        { title: 'Web Hosting', subtitle: 'Máy chủ ảo trên đám mây', img: A.menuCard2 },
        { title: 'Database Service', subtitle: 'Máy chủ ảo trên đám mây', img: A.menuCard3 },
        { title: 'Web Hosting', subtitle: 'Máy chủ ảo trên đám mây', img: A.menuCard2 },
    ];

    serviceTabs = [
        { id: 'cloud', label: 'Hạ tầng đám mây' },
        { id: 'storage', label: 'Lưu trữ & Sao lưu' },
        { id: 'network', label: 'Mạng & Bảo mật' },
        { id: 'web', label: 'Dịch vụ Web & Email' },
        { id: 'datacenter', label: 'Dịch vụ Trung tâm dữ liệu' },
        { id: 'platform', label: 'Nền tảng & Ứng dụng' },
    ];

    uspItems = [
        { img: A.uspTech, title: 'Công nghệ hiện đại', desc: 'OpenStack, Self-service, triển khai linh hoạt.', link: 'Xem giới thiệu công nghệ' },
        { img: A.uspSecurity, title: 'An toàn & tin cậy', desc: 'Data Center chuẩn quốc tế, bảo mật đa lớp.', link: null },
        { img: A.uspQuality, title: 'Chất lượng cao', desc: 'Hạ tầng tối ưu tốc độ và hiệu suất.', link: null },
        { img: A.uspSupport, title: 'Hỗ trợ chuyên nghiệp', desc: 'Kỹ thuật 24/7, xử lý nhanh mọi yêu cầu.', link: null },
    ];

    faqItems = [
        {
            question: 'Hệ sinh thái dịch vụ đám mây toàn diện',
            answer:
                'Cung cấp đa dạng dịch vụ: máy chủ ảo, lưu trữ, mạng, bảo mật, sao lưu và khôi phục dữ liệu, cùng các giải pháp chuyên biệt cho từng ngành nghề.',
        },
        {
            question: 'Cộng đồng khách hàng và đối tác lớn nhất',
            answer: '',
        },
        {
            question: 'Bảo mật tuyệt đối',
            answer: '',
        },
        {
            question: 'Đổi mới để tăng tốc chuyển đổi số',
            answer: '',
        },
        {
            question: 'Kinh nghiệm vận hành đã được kiểm chứng',
            answer: '',
        },
    ];

    serviceCards = [
        { title: 'MobiFone Cloud Managed Services', link: 'Yêu cầu tư vấn', img: A.serviceCardBg },
        { title: 'MobiFone Kubernetes Engine', link: 'Yêu cầu tư vấn', img: A.serviceCardBg },
        { title: 'MobiFone Virtual Private Cloud', link: 'Yêu cầu tư vấn', img: A.serviceCardBg },
    ];

    landingServices = [
        {
            title: 'Dịch vụ Co-Location',
            desc: 'Dịch vụ cho thuê chỗ đặt thiết bị cho các cá nhân, tổ chức, doanh nghiệp tại các Trung tâm dữ liệu (Data Center – DC) của MobiFone...',
            img: `${BASE}/Co-Location.png`
        },
        {
            title: 'Dịch vụ Cloud Server',
            desc: 'Cung cấp máy chủ ảo cam kết IOPS duy nhất tại Việt Nam, hệ thống quản lý tự động, mở rộng tài nguyên linh hoạt và tối ưu theo nhu cầu sử dụng...',
            img: `${BASE}/Cloud_Server.png`
        },
        {
            title: 'Dịch vụ MobiFone Cloud Managed Service',
            desc: 'Dịch vụ cung cấp công cụ giám sát 24/24 tài nguyên tải CPU, tải RAM, Disk IO, Network của toàn bộ các máy ảo mà khách hàng quản lý thông qua giao diện đồ họa...',
            img: `${BASE}/Cloud_Managed_Service.png`
        },
        {
            title: 'Dịch vụ MobiFone Kubernetes Engine',
            desc: 'Cung cấp một nền tảng mạnh mẽ và linh hoạt cho phép người dùng triển khai và quản lý các ứng dụng dưới dạng container trên cơ sở hạ tầng đám mây...',
            img: `${BASE}/Kubernetes_Engine.png`
        },
        {
            title: 'Dịch vụ MobiFone Block Storage',
            desc: 'Dịch vụ cung cấp không gian lưu trữ dạng block cung cấp volume cho các máy ảo để sử dụng để lưu trữ dữ liệu...',
            img: `${BASE}/Block_Storage.png`
        },
        {
            title: 'Dịch vụ MobiFone File Storage',
            desc: 'Dịch vụ cung cấp giải pháp lưu trữ dữ liệu dạng cấu trúc phân cấp cho khách hàng đáp ứng nhu cầu sử dụng các giao thức phổ biến như CIFS, NFS ...',
            img: `${BASE}/File_Storage.png`
        },
        {
            title: 'Dịch vụ MobiFone Object Storage',
            desc: 'Dịch vụ cung cấp giải pháp lưu trữ dạng object trên nền tảng đám mây với không gian lưu trữ lớn, đáp ứng lưu trữ đa dạng kiểu dữ liệu đảm bảo an toàn bảo mật cho khách hàng.',
            img: `${BASE}/Object_Storage.png`
        },
        {
            title: 'Dịch vụ MobiFone Load Balancer',
            desc: 'Dịch vụ phân phối lưu lượng truy cập an toàn và nhanh chóng khi có quá nhiều request cùng một lúc.',
            img: `${BASE}/Load_Balancer.png`
        },
        {
            title: 'Dịch vụ MobiFone Private Cloud',
            desc: 'Dịch vụ cung cấp một không gian tài nguyên độc lập bao gồm các thành phần: máy ảo, dung lượng lưu trữ, mạng',
            img: `${BASE}/Private_Cloud.png`
        },
        {
            title: 'Dịch vụ MobiFone Cloud Firewall',
            desc: 'Dịch vụ cung cấp một công cụ quan trọng để quản lý và kiểm soát lưu lượng mạng đến và đi từ máy ảo trên Public Cloud.',
            img: `${BASE}/Cloud_Firewall.png`
        },
        {
            title: 'Dịch vụ MobiFone CDN',
            desc: 'Cung cấp dịch vụ mạng phân phối nội dung (Content Delivery Network) giúp phân phối các tài nguyên như hình ảnh, video và ứng dụng...',
            img: `${BASE}/CDN.png`
        },
        {
            title: 'Dịch vụ Web Hosting',
            desc: 'Dịch vụ cung cấp không gian lưu trữ Website trên internet để các Website có thể vận hành.',
            img: `${BASE}/Web_Hosting.png`
        },
        {
            title: 'Dịch vụ Email Hosting',
            desc: 'Dịch vụ cung cấp máy chủ được cấu hình sử dụng tên miền doanh nghiệp để thực hiện quá trình gửi và nhận thư điện tử.',
            img: `${BASE}/Email_Hosting.png`
        },
        {
            title: 'Dịch vụ MobiFone Cloud Martket',
            desc: 'Cung cấp dịch vụ mạng phân phối nội dung (Content Delivery Network) giúp phân phối các tài nguyên như hình ảnh, video và ứng dụng...',
            img: `${BASE}/Cloud_Martket.png`
        }
    ];

    // Search icon
    landingSearchIcon = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Ccircle cx=%2711%27 cy=%2711%27 r=%278%27/%3E%3Cline x1=%2721%27 y1=%2721%27 x2=%2716.65%27 y2=%2716.65%27/%3E%3C/svg%3E';

    // Arrow icon
    landingArrowIcon = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23666%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M9 18l6-6-6-6%27/%3E%3C/svg%3E';

    solutions = [
        { title: 'Cloud Server', img: A.solutionCloud },
        { title: 'Database Service', img: A.solutionDatabase },
        { title: 'Web Hosting', img: A.solutionHosting },
    ];

    newsTabs = [
        { id: 'tech', label: 'Tin công nghệ' },
        { id: 'promo', label: 'Tin khuyến mãi' },
    ];

    newsArticles = [
        { title: 'An toàn thông tin trong môi trường giao dục: Từ nhận thức dén thực thi', featured: true, img: A.newsFeatured },
        { title: 'Bí quyết tăng tốc website nhanh chóng và dễ dàng', featured: false, img: A.newsArticle1 },
        { title: '9 lý do doanh nghiệp cần chuyển từ VPS lên Cloud Server', featured: false, img: A.newsArticle2 },
        { title: 'Ảo hóa máy chủ là gì? Tìm hiểu về ảo hóa VMWare', featured: false, img: A.newsArticle3 },
    ];

    partners = [
        { img: A.partner1 }, { img: A.partner2 }, { img: A.partner3 }, { img: A.partner4 },
        { img: A.partner5 }, { img: A.partner6 }, { img: A.partner7 }, { img: A.partner8 },
        { img: A.client1 }, { img: A.client2 }, { img: A.client3 }, { img: A.client4 },
        { img: A.client5 }, { img: A.client6 }, { img: A.client7 }, { img: A.client8 },
    ];

    certLogos = [A.cert1, A.cert2, A.cert3, A.cert4, A.cert5];
    footerCerts = [A.footerCert1, A.footerCert2, A.footerCert3, A.footerCert4, A.footerCert5];
    socialIcons = [A.social1, A.social2, A.social3, A.social4, A.social5];

    readonly assets = A;

    footerAbout = [
        'Giới thiệu ClouDC',
        'Quy chế hoạt động website/ứng dụng thương mại điện tử bán hàng',
        'Quy chế hoạt động website/ứng dụng thương mại điện tử bán hàng',
        'Chính sách bảo mật dữ liệu cá nhân khách hàng',
    ];

    footerHighlights = ['Danh mục dịch vụ', 'Tin công nghệ', 'Bảng giá', 'Liên hệ'];
    footerLearnMore = ['Tin khuyến mãi', 'Đăng ký cấu hình dùng thử', 'Trung tâm hỗ trợ'];

    constructor(private authService: AuthService) { }

    ngOnInit() {
        this.authService.authUser$.subscribe(user => {
            this.currentUser.set(user);
        });
        
        // Auto rotate banners
        this.startBannerAutoRotate();
    }
    
    ngOnDestroy() {
        if (this.bannerInterval) {
            clearInterval(this.bannerInterval);
        }
    }

    startBannerAutoRotate() {
        this.bannerInterval = setInterval(() => {
            this.nextBanner();
        }, 5000);
    }

    setBannerIndex(index: number) {
        this.activeBannerIndex.set(index);
        // Reset interval when user clicks manually
        clearInterval(this.bannerInterval);
        this.startBannerAutoRotate();
    }

    nextBanner() {
        this.activeBannerIndex.update(idx => (idx + 1) % this.heroBanners.length);
    }

    prevBanner() {
        this.activeBannerIndex.update(idx => (idx - 1 + this.heroBanners.length) % this.heroBanners.length);
    }

    openConsultPopup() {
        this.showConsultPopup.set(true);
    }

    closeConsultPopup() {
        this.showConsultPopup.set(false);
        this.consultSubmitted.set(false);
        this.consultForm = { name: '', phone: '', company: '', note: '' };
    }

    submitConsultForm() {
        // Handle form submission
        console.log('Consultation form submitted:', this.consultForm);
        this.consultSubmitted.set(true);
    }

    setTab(tab: string) {
        this.activeTab.set(tab);
    }

    setNewsTab(tab: string) {
        this.activeNewsTab.set(tab);
    }



    toggleFaq(index: number) {
        this.activeFaq.set(this.activeFaq() === index ? -1 : index);
    }

    onPageClick(event: Event) {
        // Kept for structure, we can remove header click logic since header is no longer here
    }
}
