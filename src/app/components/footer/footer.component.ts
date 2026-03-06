import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    standalone: true,
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent {
    assets = {
        footerCertMinistry: '/assets/figma/footer_cert_ministry.png',
        logo: '/logo.svg'
    };

    footerCerts = [
        '/assets/figma/footer_cert_1.png',
        '/assets/figma/footer_cert_2.png',
        '/assets/figma/footer_cert_3.png',
        '/assets/figma/footer_cert_4.png',
        '/assets/figma/footer_cert_5.png'
    ];

    socialIcons = [
        '/assets/figma/social_1.png',
        '/assets/figma/social_2.png',
        '/assets/figma/social_3.png',
        '/assets/figma/social_4.png',
        '/assets/figma/social_5.png'
    ];

    footerAbout = [
        'Giới thiệu ClouDC',
        'Quy chế hoạt động website/ứng dụng thương mại điện tử bán hàng',
        'Quy chế hoạt động website/ứng dụng thương mại điện tử bán hàng',
        'Chính sách bảo mật dữ liệu cá nhân khách hàng',
    ];

    footerHighlights = ['Danh mục dịch vụ', 'Tin công nghệ', 'Bảng giá', 'Liên hệ'];
    footerLearnMore = ['Tin khuyến mãi', 'Đăng ký cấu hình dùng thử', 'Trung tâm hỗ trợ'];
}
