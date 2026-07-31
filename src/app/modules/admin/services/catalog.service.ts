import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private api = environment.apiUrl + '/catalogs';

  constructor(private http: HttpClient) {}

  getCatalog(catalog: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${catalog}`);
  }

  create(catalog: string, data: any) {
    return this.http.post(`${this.api}/${catalog}`, data);
  }

  update(catalog: string, id: number, data: any) {
    return this.http.put(`${this.api}/${catalog}/${id}`, data);
  }

  delete(catalog: string, id: number) {
    return this.http.delete(`${this.api}/${catalog}/${id}`);
  }

}
