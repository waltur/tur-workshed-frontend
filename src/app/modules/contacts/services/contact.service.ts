import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Contact {
  id_contact?: number;
  name: string;
  email: string;
  phone_number?: string;
  type?: string;
}
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:3000/api/contacts';

  constructor(private http: HttpClient) {}

  createContact(contact: Contact): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, contact);
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }
  updateContact(id: number, contact: Contact): Observable<Contact> {
    return this.http.put<Contact>(`${this.apiUrl}/${id}`, contact);
  }

  disableContact(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getContactById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
