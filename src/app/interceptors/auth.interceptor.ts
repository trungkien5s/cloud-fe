import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const authService = inject(AuthService);

    // Add token to request if user is logged in
    const currentUser = authService.currentUser;
    if (currentUser?.token) {
        req = addToken(req, currentUser.token);
    }

    // Pass the request along, but catch 401 errors
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Check if error is 401 Unauthorized
            if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
                return handle401Error(req, next, authService);
            }
            return throwError(() => error);
        })
    );
};

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        // Call the refresh token HTTP endpoint
        return authService.refreshToken().pipe(
            switchMap((tokenResponse: any) => {
                isRefreshing = false;
                // Update our logic based on LoginResponse structure
                const newToken = tokenResponse.accessToken || tokenResponse.token;
                if (newToken) {
                    refreshTokenSubject.next(newToken);
                    return next(addToken(request, newToken));
                }
                return throwError(() => new Error('Refresh failed, no token returned'));
            }),
            catchError((err) => {
                isRefreshing = false;
                authService.forceLogout(); // Show alert + redirect home
                return throwError(() => err);
            })
        );
    } else {
        // Wait until refresh is done then continue
        return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next(addToken(request, token!)))
        );
    }
}
