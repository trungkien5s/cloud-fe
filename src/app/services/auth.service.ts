import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface CaptchaResponse {
    captchaId: string;
    captchaImageBase64: string;
}

export interface LoginResponse {
    accessToken: string;
    permissions?: string[];
    roles?: string[];
    username?: string;
    refreshToken?: string;
    twoFactorRequired?: boolean;
    sessionToken?: string;
    expiresIn?: number;
}

// User context stored after authentication
export interface AuthUser {
    token: string;
    username?: string; // Add any standard token claims if needed
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    // Equivalent to React's AuthContext state:
    private authUserSubject = new BehaviorSubject<AuthUser | null>(null);
    public authUser$ = this.authUserSubject.asObservable(); // Components can subscribe to this or read value directly

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        // Initialize state from local storage on startup (only in Browser, not SSR)
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('access_token');
            const username = localStorage.getItem('username');
            if (token) {
                this.authUserSubject.next({ token, username: username || undefined });
            }
        }
    }

    // Check if user is currently logged in
    get isLoggedIn(): boolean {
        return this.authUserSubject.value !== null;
    }

    // Get current user data
    get currentUser(): AuthUser | null {
        return this.authUserSubject.value;
    }

    // Save token globally on successful login/2fa
    private setSession(authResult: LoginResponse) {
        if (!authResult) {
            console.warn('setSession: authResult is null or undefined', authResult);
            return;
        }
        if (!authResult.twoFactorRequired && authResult.accessToken) {
            let finalUsername = authResult.username;
            if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem('access_token', authResult.accessToken);
                if (finalUsername) {
                    localStorage.setItem('username', finalUsername);
                } else {
                    finalUsername = localStorage.getItem('username') || undefined;
                }
                // Optionally store refresh token
                if (authResult.refreshToken) {
                    localStorage.setItem('refresh_token', authResult.refreshToken);
                }
            }
            this.authUserSubject.next({ token: authResult.accessToken, username: finalUsername });
        }
    }

    logout() {
        this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
            next: () => console.log('Logged out of backend'),
            error: (err) => console.error('Logout error', err)
        });

        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('username');
        }
        this.authUserSubject.next(null);
    }

    getCaptcha(): Observable<CaptchaResponse> {
        return this.http.get<ApiResponse<CaptchaResponse>>(`${this.apiUrl}/auth/register/captcha`)
            .pipe(map(res => res.data));
    }

    register(data: any): Observable<any> {
        console.log('API calling /auth/register', data);
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/register`, data)
            .pipe(
                tap(res => console.log('Register Response:', res)),
                map(res => res.data)
            );
    }

    login(data: any): Observable<LoginResponse> {
        console.log('API calling /auth/login with data:', data);
        return this.http.post<any>(`${this.apiUrl}/auth/login`, data)
            .pipe(
                tap(res => console.log('Raw Login API Response:', res)),
                map(res => res.data !== undefined ? res.data : res), // Fallback if BE didn't wrap in data
                tap(resData => {
                    // Inject username from request data if not provided by backend
                    if (resData && !resData.username && data.username) {
                        resData.username = data.username;
                    }
                    this.setSession(resData);
                }) // Automatically intercept successful login to update global state
            );
    }

    get2FaMethods(username: string): Observable<string[]> {
        return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/auth/2fa/methods`, { params: { username } })
            .pipe(map(res => res.data));
    }

    send2FaOtp(sessionToken: string, method: string): Observable<any> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/2fa/send`, { sessionToken, method })
            .pipe(map(res => res.data));
    }

    verify2Fa(data: any): Observable<LoginResponse> {
        // Assuming verify returns the final access token
        return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/2fa/verify`, data)
            .pipe(
                map(res => res.data),
                tap((data) => {
                    // Force the token handling assuming verify outputs same format as standard login
                    if (data && data.accessToken) this.setSession(data);
                })
            );
    }

    forgotPassword(data: any): Observable<any> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/forgot-password`, data)
            .pipe(map(res => res.data));
    }

    resetPassword(data: any): Observable<any> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/auth/reset-password`, data)
            .pipe(map(res => res.data));
    }

    refreshToken(): Observable<LoginResponse> {
        // Send request with credentials so the browser includes the HttpOnly refresh_token cookie
        return this.http.post<any>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
            .pipe(
                map(res => res.data !== undefined ? res.data : res),
                tap(data => this.setSession(data))
            );
    }

    getUserByUsername(username: string): Observable<any> {
        // Assuming interceptor handles Bearer token, otherwise we pass it here headers
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/users/by-username`, { params: { username } })
            .pipe(map(res => res.data));
    }

    changePassword(id: string, data: any): Observable<any> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/users/${id}/change-password`, data);
    }
}
