import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

interface HelperRegistration {
  id_event: number;
  id_contact: number;
  helper_role?: string;
  comments?: string;
  assigned_by?: number;
}
@Injectable({ providedIn: 'root' })
export class GroupService {
  private apiUrl = `${environment.apiUrl}/groups`;
  private eventUrl = `${environment.apiUrl}/group-events`;
  private participationUrl = `${environment.apiUrl}/group-participation`;
   private timesheetsUrl = `${environment.apiUrl}/group-timesheets`;



  constructor(private http: HttpClient) {}

  getGroups() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getGroup(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createGroup(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateGroup(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteGroup(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
// Obtener miembros de un grupo
getGroupMembers(groupId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/${groupId}/members`);
}

// Agregar miembro
addGroupMember(groupId: number, data: { id_contact: number; role_in_group: string }) {
  return this.http.post(`${this.apiUrl}/${groupId}/members`, data);
}

// Eliminar miembro
removeGroupMember(groupId: number, memberId: number) {
  return this.http.delete(`${this.apiUrl}/${groupId}/members/${memberId}`);
}
// Eventos
getEventsByGroup(groupId: number) {
  //return this.http.get<any[]>(`${this.apiUrl}/group-events/group/${groupId}`);
  return this.http.get<any[]>(`${this.eventUrl}/group/${groupId}`);
}

createEvent(data: any) {
    return this.http.post(`${this.eventUrl}`, data);
}

// Timesheets
getTimesheetsByEvent(eventId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/group-timesheets/event/${eventId}`);
}

createTimesheet(data: any) {
  return this.http.post(`${this.timesheetsUrl}/`, data);
}
registerInstructor(data: { id_event: number; id_contact: number }) {
  return this.http.post(`${this.participationUrl}/instructor`, data);
}
  registerAttendee(data: { id_event: number; id_contact: number }) {
    return this.http.post(`${this.participationUrl}/attendee`, data);
  }
getAllEvents(contactId?: number) {
  let url = `${environment.apiUrl}/group-events`;
  if (contactId) {
    url += `?contactId=${contactId}`;
  }
  return this.http.get<any[]>(url);
}
registerHelper(data: HelperRegistration) {
  return this.http.post(`${this.participationUrl}/helper`, data);
}

}
