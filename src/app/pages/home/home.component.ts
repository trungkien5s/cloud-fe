import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthUser } from '../../services/auth.service';
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
    imports: [CommonModule, FormsModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
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
