import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobRoleService {
  private apiUrl = `${environment.apiUrl}/job-roles`;

  constructor(private http: HttpClient) { }
  getVolunteerFunctions(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(`${this.apiUrl}`);
  }

}
