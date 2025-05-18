import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Volunteer {
  idVolunter?: number;
  id_contact: number;
  role: string;
  skills: string[];
  availability: string;
  status: string;
  startDate?: string;
  endDate?: string | null;
  backgroundCheck: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private apiUrl = 'http://localhost:3000/api/volunteers';

  constructor(private http: HttpClient) {}

   getVolunteers(): Observable<Volunteer[]> {
      return this.http.get<Volunteer[]>(this.apiUrl);
    }
   createVolunteer(volunteer: Volunteer): Observable<Volunteer> {
      return this.http.post<Volunteer>(this.apiUrl, volunteer);
    }
}
