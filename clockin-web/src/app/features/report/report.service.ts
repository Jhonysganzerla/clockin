import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface ReportRequest {
  dataIni: string;
  dataFin: string;
  usuario: { id: number };
}

export interface ReportBatida {
  id: number | null;
  hora: string | null;
}

export interface ReportDia {
  dia: string;
  auxDia: string;
  pontos: ReportBatida[];
  hrtrab: number;
  extra: number;
  falta: number;
  shrtrab: string;
  sextra: string;
  sfalta: string;
}

export interface ReportResponse {
  pontosAgrupados: ReportDia[];
  consultotal: number;
  consultextra: number;
  consultfalta: number;
  totalMes: number;
  sconsultotal: string;
  sconsultextra: string;
  sconsultfalta: string;
  stotalMes: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cadponto`;

  search(req: ReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.base}/list`, req);
  }

  pdf(req: ReportRequest): Observable<Blob> {
    return this.http.post(`${this.base}/imprimir`, req, { responseType: 'blob' });
  }
}
