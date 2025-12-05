import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://hcm-api-dev.a4b.vn/api';
  private readonly TOKEN_KEY = 'id_token';
  
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.API_URL}/authenticate`,
      credentials,
      { headers }
    ).pipe(
      tap(response => {
        if (response.id_token) {
          this.setToken(response.id_token);
        }
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.tokenSubject.next(null);
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    
    if (!tokenToCheck) {
      return true;
    }

    const decoded = this.decodeToken(tokenToCheck);
    
    if (!decoded || !decoded.exp) {
      return true;
    }

    // JWT exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    
    return expirationTime < currentTime;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      // Token is expired, remove it
      this.removeToken();
      return false;
    }

    return true;
  }

  getTokenExpirationDate(token?: string): Date | null {
    const tokenToCheck = token || this.getToken();
    
    if (!tokenToCheck) {
      return null;
    }

    const decoded = this.decodeToken(tokenToCheck);
    
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  }

  logout(): void {
    console.log('Logout successful');
    this.removeToken();
  }
}
