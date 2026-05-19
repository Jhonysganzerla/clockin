import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Holiday {
  id: number | null;
  dataf: string; // ISO yyyy-MM-dd
  descricao: string;
}

@Injectable({ providedIn: 'root' })
export class HolidayService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cadferiado`;

  list(): Observable<Holiday[]> { return this.http.get<Holiday[]>(`${this.base}/list`); }
  get(id: number): Observable<Holiday> { return this.http.get<Holiday>(`${this.base}/findOne/${id}`); }
  save(h: Holiday): Observable<Holiday> { return this.http.post<Holiday>(`${this.base}/save`, h); }
  delete(id: number): Observable<void> { return this.http.get<void>(`${this.base}/delete/${id}`); }
}
