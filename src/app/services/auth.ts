import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUser {
  id: string;
  email: string;
  nombre: string;
}

interface LoginResponse {
  token: string;
  admin: AdminUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly SESSION_KEY = 'tdea_jwt';
  private readonly USER_KEY = 'tdea_admin';

  currentUser = signal<AdminUser | null>(this.loadUser());
  private token = signal<string | null>(this.loadToken());

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
    );
    sessionStorage.setItem(this.SESSION_KEY, res.token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(res.admin));
    this.token.set(res.token);
    this.currentUser.set(res.admin);
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.token() !== null;
  }

  getToken(): string | null {
    return this.token();
  }

  private loadToken(): string | null {
    return sessionStorage.getItem(this.SESSION_KEY);
  }

  private loadUser(): AdminUser | null {
    const stored = sessionStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}
