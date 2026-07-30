import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {

  private api = `${environment.apiUrl}/volunteers`;

  constructor(
    private http: HttpClient
  ) {}

  getCatalogs(): Observable<any> {

    return this.http.get(

      `${this.api}/catalogs`

    );

  }
  getAvailabilityTypes(){

      return this.http.get<any[]>(

          `${environment.apiUrl}/volunteers/availability-types`

      );

  }

}
