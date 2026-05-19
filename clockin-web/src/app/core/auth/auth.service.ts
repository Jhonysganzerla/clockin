import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';

export interface LoginRequest {
  nome: string;
  senha: string;
}

export interface AuthSession {
  token: string;
  id: number;
  nome: string;
  admin: boolean;
}

const STORAGE_KEY = 'clockin.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly _session = signal<AuthSession | null>(this.readStorage());

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly isAdmin = computed(() => this._session()?.admin === true);

  login(req: LoginRequest): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${environment.apiUrl}/login/logar`, req).pipe(
      tap(s => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        this._session.set(s);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._session.set(null);
  }

  token(): string | null {
    return this._session()?.token ?? null;
  }

  private readStorage(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as AuthSession; } catch { return null; }
  }
}
