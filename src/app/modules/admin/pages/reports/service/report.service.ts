import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;
  constructor(private http: HttpClient) { }

  getMembersReport() {
    return this.http.get<any>(
      `${environment.apiUrl}/reports/members`
    );
  }
}
