import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get(name: string): string {
    if (isPlatformBrowser(this.platformId)) {
      const match = this.document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
    }
    return '';
  }

  set(name: string, value: string, days: number = 7) {
    if (isPlatformBrowser(this.platformId)) {
      const d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      this.document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
    }
  }

  delete(name: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  }
}
