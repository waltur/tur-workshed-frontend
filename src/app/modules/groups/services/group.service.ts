import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { forkJoin } from 'rxjs';
import { Observable } from 'rxjs';

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
  private tasksUrl  = `${environment.apiUrl}/group-tasks`;




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
cancelBooking(eventId: number) {
  return this.http.delete( `${this.apiUrl}/${eventId}/booking`);
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

createEvent(data: any): Observable<{ id_event: number } | { id_event: number }[]> {
  return this.http.post<{ id_event: number } | { id_event: number }[]>(`${this.eventUrl}`, data);
}
getEventAttendees(id_event: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.eventUrl}/${id_event}/attendees`);
}
updateAttendance(id_event: number, id_contact: number, attended: boolean): Observable<any> {
  return this.http.patch(`${this.eventUrl}/${id_event}/attendees/${id_contact}`, { attended });
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
createEventTask(task: {
  id_event: number;
  task_name: string;
  time_range: string;
  volunteer_needed: number;
}) {
  return this.http.post(`${this.tasksUrl}`, task);
}

getTasksByEvent(id_event: number) {
  return this.http.get<any[]>(`${this.tasksUrl}/events/${id_event}`);
}
deleteEvent(id: number): Observable<any> {
  return this.http.delete(`${this.eventUrl}/events/${id}`);
}
updateEvent(id: number, eventData: any): Observable<any> {
  return this.http.put(`${this.eventUrl}/events/${id}`, eventData);
}
getGroupRoles(): Observable<any[]> {
  return this.http.get<any[]>(`${this.participationUrl}/group-roles`);
}
deleteTasksByEventId(id_event: number): Observable<any> {
  return this.http.delete(`${this.eventUrl}/events/${id_event}/tasks`);
}
saveSignature(data: { id_event: number; id_contact: number; signature: string }) {
  return this.http.post(`${this.eventUrl}/confirm-attendance/`, data);
}
getAttendanceReport(id_event: number) {
  return this.http.get<any[]>(`${this.apiUrl}/${id_event}/attendance-report`);

}
deleteEventCascade(id: number): Observable<any> {
  return this.http.delete(`${this.eventUrl}/events/cascade/${id}`);
}
// 🔁 Actualizar TODA la serie
updateSeries(seriesId: string, eventData: any): Observable<any> {
  return this.http.put(
    `${this.eventUrl}/series/${seriesId}`,
    eventData
  );
}


}
