import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Entry {
  id: number | null;
  data: string; // yyyy-MM-dd
  hora: string; // HH:mm:ss
  usuario: { id: number };
}

@Injectable({ providedIn: 'root' })
export class EntryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cadponto`;

  list(): Observable<Entry[]> { return this.http.get<Entry[]>(`${this.base}/listconsulta`); }
  get(id: number): Observable<Entry> { return this.http.get<Entry>(`${this.base}/findOne/${id}`); }
  save(e: Entry): Observable<Entry> { return this.http.post<Entry>(`${this.base}/save`, e); }
  delete(id: number): Observable<void> { return this.http.get<void>(`${this.base}/delete/${id}`); }
}
