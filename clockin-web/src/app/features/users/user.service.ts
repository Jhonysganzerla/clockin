import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cadusuario`;

  list(): Observable<User[]> { return this.http.get<User[]>(`${this.base}/list`); }
  get(id: number): Observable<User> { return this.http.get<User>(`${this.base}/findOne/${id}`); }
  save(u: User): Observable<User> { return this.http.post<User>(`${this.base}/save`, u); }
  delete(id: number): Observable<void> { return this.http.get<void>(`${this.base}/delete/${id}`); }
}
