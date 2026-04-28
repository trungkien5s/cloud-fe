<div align="center">

# ☁️ ClouDC Portal — Frontend

**Portal quản lý dịch vụ đám mây dành cho doanh nghiệp**

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![NG-ZORRO](https://img.shields.io/badge/NG--ZORRO-21-1890FF?style=for-the-badge&logo=ant-design&logoColor=white)](https://ng.ant.design)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Angular SSR](https://img.shields.io/badge/SSR-Enabled-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/guide/ssr)

</div>

---

## 📖 Giới thiệu

**ClouDC Portal Frontend** là giao diện người dùng của hệ thống quản lý Cloud Server, xây dựng trên nền tảng **Angular 21** với UI component library **NG-ZORRO Ant Design**. Hệ thống cho phép khách hàng:

- 🖥️ **Tạo & quản lý máy ảo** (Virtual Machine) trên nền tảng OpenStack
- 🖱️ **Truy cập console VM** qua giao diện noVNC web
- 💰 **Xem bảng giá** và đặt mua gói dịch vụ đám mây
- 🔐 **Xác thực 2 lớp (2FA)** với OTP qua Email / SMS
- 👤 **Quản lý tài khoản** — đổi mật khẩu, thông tin cá nhân

---

## 🛠️ Tech Stack

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| [Angular](https://angular.dev) | 21.x | Framework chính, Standalone Components |
| [NG-ZORRO Ant Design](https://ng.ant.design) | 21.x | UI Component Library |
| [RxJS](https://rxjs.dev) | 7.8 | Reactive programming |
| [Angular SSR](https://angular.dev/guide/ssr) | 21.x | Server-Side Rendering với Express.js |
| [TypeScript](https://www.typescriptlang.org) | 5.9 | Type safety |
| [Vitest](https://vitest.dev) | 4.x | Unit testing |
| [Prettier](https://prettier.io) | 3.x | Code formatting |

---

## ⚙️ Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| [Node.js](https://nodejs.org) | `>= 20.x` |
| [npm](https://www.npmjs.com) | `>= 11.x` |
| [Angular CLI](https://angular.dev/tools/cli) | `>= 21.x` |

> **Backend API** phải đang chạy tại `http://localhost:8082` (xem cấu hình bên dưới).

---

## 🚀 Hướng dẫn cài đặt & chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd portal_cloud_fe
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment

Mở file `src/environments/environment.development.ts` và cập nhật URL backend:

```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8082/api/v1'  // ← Thay đổi nếu backend chạy ở port khác
};
```

> **Lưu ý:** File `environment.ts` (production) cũng cần được cập nhật khi deploy.

### 4. Khởi động Development Server

```bash
npm start
# hoặc
ng serve
```

Truy cập ứng dụng tại: **[http://localhost:4200](http://localhost:4200)**

> Ứng dụng sẽ tự động reload khi bạn sửa source code.

---

## 📋 Danh sách lệnh

| Lệnh | Mô tả |
|------|-------|
| `npm start` | Khởi động dev server tại `localhost:4200` |
| `npm run build` | Build production bundle vào thư mục `dist/` |
| `npm run watch` | Build liên tục (watch mode) cho development |
| `npm test` | Chạy unit tests với Vitest |
| `npm run serve:ssr:portal_cloud_fe` | Chạy SSR server (sau khi build) |

---

## 📁 Cấu trúc thư mục

```
portal_cloud_fe/
├── src/
│   ├── app/
│   │   ├── components/          # Shared UI components
│   │   │   ├── auth-modal/      # Modal đăng nhập / đăng ký / 2FA
│   │   │   ├── header/          # Navigation header
│   │   │   ├── footer/          # Footer
│   │   │   └── user-profile-modal/
│   │   │
│   │   ├── layout/
│   │   │   └── main-layout/     # Layout wrapper (header + router-outlet + footer)
│   │   │
│   │   ├── pages/               # Feature pages (lazy-loaded)
│   │   │   ├── home/            # Trang chủ & landing page
│   │   │   ├── pricing/         # Bảng giá dịch vụ
│   │   │   ├── cart/            # Giỏ hàng
│   │   │   ├── profile/         # Thông tin tài khoản
│   │   │   ├── change-password/ # Đổi mật khẩu
│   │   │   ├── vm-create/       # Tạo máy ảo mới
│   │   │   ├── vm-detail/       # Chi tiết & quản lý VM
│   │   │   └── vm-console/      # Console noVNC
│   │   │
│   │   ├── services/            # Business logic & API calls
│   │   │   ├── auth.service.ts  # Xác thực, 2FA, JWT
│   │   │   ├── vm.service.ts    # Quản lý VM, flavor, keypair
│   │   │   ├── console.service.ts # Console session
│   │   │   ├── cart.service.ts  # Giỏ hàng (localStorage)
│   │   │   └── cookie.service.ts
│   │   │
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts  # Tự động gắn Bearer token & refresh
│   │   │
│   │   ├── app.routes.ts        # Định nghĩa routes
│   │   ├── app.config.ts        # Application providers & NG-ZORRO config
│   │   └── app.routes.server.ts # SSR rendering modes
│   │
│   ├── environments/
│   │   ├── environment.ts           # Production config
│   │   └── environment.development.ts # Development config
│   │
│   └── styles.css               # Global styles
│
├── public/                      # Static assets
├── angular.json                 # Angular CLI config
├── tsconfig.json                # TypeScript config
└── package.json
```

---

## 🗺️ Routes

| Path | Component | Mô tả |
|------|-----------|-------|
| `/` | `HomeComponent` | Trang chủ |
| `/pricing` | `PricingComponent` | Bảng giá dịch vụ |
| `/cart` | `CartComponent` | Giỏ hàng |
| `/profile` | `ProfileComponent` | Thông tin tài khoản |
| `/change-password` | `ChangePasswordComponent` | Đổi mật khẩu |
| `/vm/create` | `VmCreateComponent` | Tạo máy ảo mới |
| `/vm/detail/:id` | `VmDetailComponent` | Chi tiết & điều khiển VM |
| `/vm/console/:id` | `VmConsoleComponent` | Console noVNC |

---

## 🔐 Authentication Flow

```
Đăng nhập
    │
    ▼
POST /auth/login
    │
    ├─► twoFactorRequired = true ──► Chọn phương thức 2FA (Email / SMS)
    │                                        │
    │                                        ▼
    │                               POST /auth/2fa/send
    │                                        │
    │                                        ▼
    │                               POST /auth/2fa/verify
    │                                        │
    └─► twoFactorRequired = false ◄──────────┘
                │
                ▼
        Lưu accessToken → localStorage
        Refresh token → HttpOnly Cookie
                │
                ▼
        HTTP Interceptor tự gắn Bearer token
        Tự động refresh khi 401 Unauthorized
```

---

## 🖥️ Tính năng VM Console

Hệ thống tích hợp **noVNC Web Console** với flow sau:

1. **Tạo console session** → `POST /api/v1/vm/{vmId}/console-sessions`
2. Backend trả về `portalOpenUrl` (đã nhúng auth token)
3. Frontend mở **popup window** tối ưu kích thước cho terminal
4. Backend validate token → redirect 302 → OpenStack noVNC thật
5. Session có **countdown timer** và có thể **revoke/close** thủ công

---

## 🏗️ Build Production

```bash
# Build production bundle
npm run build

# Chạy SSR server (Node.js + Express)
npm run serve:ssr:portal_cloud_fe
```

> Build output sẽ nằm ở `dist/portal_cloud_fe/`

### Cấu hình environment production

Cập nhật `src/environments/environment.ts` với URL backend production:

```typescript
export const environment = {
    production: true,
    apiUrl: 'https://api.yourdomain.com/api/v1'
};
```

---

## 🧪 Testing

```bash
# Chạy tất cả unit tests
npm test

# Chạy với coverage report
npm test -- --coverage
```

---

## 🎨 Code Style

Dự án sử dụng **Prettier** để format code tự động.

```bash
# Format toàn bộ code
npx prettier --write "src/**/*.{ts,html,css,json}"

# Kiểm tra format (không sửa)
npx prettier --check "src/**/*.{ts,html,css,json}"
```

Cấu hình Prettier nằm tại `.prettierrc`.

---

## 🤝 Hướng dẫn đóng góp

### Tạo component mới

```bash
# Tạo page mới
ng generate component pages/ten-page --standalone

# Tạo service mới
ng generate service services/ten-service

# Tạo interceptor mới
ng generate interceptor interceptors/ten-interceptor
```

### Git workflow

```bash
# Tạo feature branch
git checkout -b feature/ten-tinh-nang

# Commit
git add .
git commit -m "feat: mô tả tính năng"

# Push & tạo PR
git push origin feature/ten-tinh-nang
```

### Commit message convention

| Prefix | Ý nghĩa |
|--------|---------|
| `feat:` | Tính năng mới |
| `fix:` | Sửa bug |
| `refactor:` | Refactor code |
| `style:` | Thay đổi CSS/UI |
| `docs:` | Cập nhật tài liệu |
| `chore:` | Cấu hình, build |

---

## 🐛 Troubleshooting

### Lỗi `CORS` khi gọi API

Kiểm tra backend đã cấu hình CORS cho `http://localhost:4200`. Thêm vào Spring Boot:
```java
@CrossOrigin(origins = "http://localhost:4200")
```

### Lỗi `Cannot find module 'ng-zorro-antd/...'`

```bash
npm install ng-zorro-antd@latest --save
```

### Popup noVNC bị trình duyệt chặn

Bật popup cho `localhost:4200` trong cài đặt trình duyệt (biểu tượng khoá trên thanh địa chỉ).

### Token hết hạn liên tục

Kiểm tra backend đã cấu hình `SameSite=None; Secure` cho refresh token cookie khi deploy HTTPS.

---

## 📞 Liên hệ & Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo **Issue** trên repository hoặc liên hệ team phát triển.

---

<div align="center">

Made with ❤️ by **ClouDC Development Team**

</div>
