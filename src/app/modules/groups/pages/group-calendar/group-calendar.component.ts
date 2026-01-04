import { Component, ChangeDetectionStrategy, TemplateRef, ViewChild, OnInit  } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GroupService } from '../../services/group.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { parse } from 'date-fns';
import { map } from 'rxjs/operators';


interface EventTask {
                   task_name: string;
                   time_range: string;
                   volunteer_needed: number;
                 }
@Component({
  selector: 'app-group-calendar',
  templateUrl: './group-calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class GroupCalendarComponent {
  CalendarView = CalendarView; // exponer enum para template
  @ViewChild('eventDetails') eventDetailsModal!: TemplateRef<any>;
  @ViewChild('eventModal') eventModal!: TemplateRef<any>;
  @ViewChild('signatureModal') signatureModal!: TemplateRef<any>;
  selectedEvent: any;
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  activeDayIsOpen = false;
  selectedGroupId: number | null = null;
  refresh: Subject<void> = new Subject();
  selectedDate: Date = new Date();
  newEvent = {
    id_event: null,
    title: '',
    description: '',
    start: '',
    end: '',
    id_group: null,
    location:''
  };
groups: any[] = [];
eventTasks: EventTask[] = [];
loading = false;
events: CalendarEvent[] = [];
isLogged = false;
coordinatorGroupIds: number[] = [];
isAdmin: boolean = true;
isEditing: boolean = false;
editingEventId: number | null = null;
repeatType: '' | 'weekly' | 'monthly' = '';
repeatCount: number = 1;
repeatOption: 'once' | 'weekly' | 'monthly' = 'once';
attendees: any[] = [];
selectedAttendee: any = null;
showAttendees = false;
attendeeSearch = '';
coordinator:any;
loadingEvents = false;


constructor(private modalService: NgbModal, private groupService:GroupService, private route: ActivatedRoute,private authService: AuthService) {}


  ngOnInit(): void {
    this.loadGroups();
    this.loadAllEvents();
    this.isLogged = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }

loadEventsByGroup(groupId: number): void {
  this.groupService.getEventsByGroup(groupId).subscribe({
    next: (eventsData: any[]) => {
      const eventCalls = eventsData.map(event => {
        return this.groupService.getGroupMembers(event.id_group).pipe(
          map((members: any[]) => {
            const coordinator = members.find((m: any) => m.name_role === 'Coordinator');
            return {
              title: event.title,
              start: this.parseDateTimeRaw(event.start),
              end: this.parseDateTimeRaw(event.end),
              meta: {
                id_event: event.id_event,
                description: event.description,
                group: event.group_name || '',
                location: event.location,
                id_group: event.id_group,
                tasks: event.tasks || [],
                coordinator: coordinator?.name || 'N/A',
               // attended: event.attended || false,
              },
              color: {
                primary: '#EA580C',
                secondary: '#F97316'
              },
              allDay: false
            };
          })
        );
      });

      forkJoin(eventCalls).subscribe((events: CalendarEvent[]) => {
        this.events = events;
        this.refresh.next();
      });
    },
    error: (err) => {
      console.error('Error loading events for group:', err);
    }
  });
}
shouldShowSignature(e: CalendarEvent): boolean {
  return e.meta?.registration_roles?.includes('Attendant') && !e.meta?.signature;
}

saveSignature(dataUrl: string, event: CalendarEvent) {
  const contactId = this.authService.getContactId();
  const id_event = event.meta.id_event;

  this.groupService.saveSignature({ id_event, id_contact: contactId!, signature: dataUrl }).subscribe({
    next: () => {
      Swal.fire('Success', 'Signature saved successfully', 'success');
      this.loadAllEvents(); // refrescar para que desaparezca
    },
    error: () => {
      Swal.fire('Error', 'Failed to save signature', 'error');
    }
  });
}
toggleAttendees() {
  this.showAttendees = !this.showAttendees;
}

onToggleAttendance(attendee: any) {
  const newStatus = !attendee.attended;
  this.groupService.updateAttendance(this.selectedEvent.meta.id_event, attendee.id_contact, newStatus)
    .subscribe({
      next: () => {
        attendee.attended = newStatus;
        Swal.fire('Updated', 'Attendance updated successfully', 'success');
      },
      error: () => {
        Swal.fire('Error', 'Could not update attendance', 'error');
      }
    });
}
nextMonth() {
  const next = new Date(this.viewDate);
  next.setMonth(next.getMonth() + 1);
  this.viewDate = next;
}


prevMonth() {
  const prev = new Date(this.viewDate);
  prev.setMonth(prev.getMonth() - 1);
  this.viewDate = prev;
}
loadAllEvents(): void {
  this.loadingEvents = true;
   const contactId = this.authService.getContactId() ?? undefined;

   this.groupService.getAllEvents(contactId).subscribe({
     next: (eventsData: any[]) => {
       const eventCalls = eventsData.map(event =>
         this.groupService.getGroupMembers(event.id_group).pipe(
           map((members: any[]) => {
             const coordinator = members.find((m: any) => m.name_role === 'Coordinator');
             return {
               title: event.title,
               start: this.parseDateTimeRaw(event.start),
               end: this.parseDateTimeRaw(event.end),
               meta: {
                 id_event: event.id_event,
                 description: event.description,
                 group: event.group_name || '',
                 registration_roles: event.registration_roles || [],
                 location: event.location,
                 id_group: event.id_group,
                 tasks: event.tasks || [],
                 coordinator: coordinator?.name || 'N/A',
                 attended: event.attended || false,
                 signature: event.signature || null,
               },
               color: {
                 primary: '#10B981',
                 secondary: '#D1FAE5'
               },
               allDay: false
             };
           })
         )
       );

       forkJoin(eventCalls).subscribe((events: CalendarEvent[]) => {
         this.events = events;
         this.refresh.next();
          this.loadingEvents = false;
       });
     },

     error: () =>{ this.loadingEvents = false; console.error('Failed to load events')}
   });
 }
loadGroups(): void {
  console.log("loadGroups");
  this.groupService.getGroups().subscribe(groups => {
    this.groups = groups;

    const myContactId = this.authService.getContactId(); // Asegúrate de tener esto implementado

    this.coordinatorGroupIds = [];

    groups.forEach(group => {
      group.members?.forEach((member:any) => {
        if (member.id_contact === myContactId && member.role_name === 'Coordinator') {
          this.coordinatorGroupIds.push(group.id_group);
          this.selectGroup(group.id_group);
        }
      });
    });
  });
}
selectGroup(id_group: any): void {
  console.log("selectGroup");
  this.groupService.getGroupMembers(id_group).subscribe(members => {
    // Filtrar al coordinador
    const coordinator = members.find(m => m.name_role === 'Coordinator');
    if (coordinator) {
      this.coordinator = coordinator;
    }
  });
}
onGroupChange(): void {
  if (this.selectedGroupId) {
    this.loadEventsByGroup(this.selectedGroupId);
  } else {
    this.loadAllEvents();
  }
}


getRegistrationLabel(type: string): string {
  console.log("getRegistrationLabel");
  switch (type) {
    case 'attendee':
      return 'attendant';
    case 'coordinator':
      return 'coordinator';
    case 'support':
      return 'general support';
    default:
      return 'participant';
  }
}
dayClicked(day: { date: Date; events: CalendarEvent[] }): void {
  if (this.isEditing) return;
  this.selectedDate = day.date;
  this.newEvent.start = day.date.toISOString().split('T')[0];
  this.newEvent.end = this.newEvent.start;
  this.newEvent.title = "";
  this.newEvent.description = "";
  this.newEvent.location = "";


  // SI haces clic en el mismo día activo Y no hay eventos, cerrar
  if (
    this.view === CalendarView.Month &&
    this.activeDayIsOpen &&
    day.date.getTime() === this.viewDate.getTime()
  ) {
    this.activeDayIsOpen = false;
  } else {
    this.activeDayIsOpen = true;
    this.viewDate = day.date;
  }
}
openNewEventModal(event?: any): void {
  console.log("openNewEventModal");
  this.isEditing = !!event;

  if (event) {
    this.editingEventId = event.meta?.id_event;
     this.newEvent = {
       id_event: event.meta?.id_event || null,  // 👈 agrega esta línea
       title: event.title,
       description: event.meta?.description || '',
      start: this.formatDateTimeLocal(event.start),
      end: this.formatDateTimeLocal(event.end),
       id_group: event.meta?.id_group || null,
       location: event.meta?.location || ''
     };

    this.eventTasks = event.meta?.tasks || [];
  } else {
    this.editingEventId = null;
    this.newEvent = {
      id_event: null,
      title: '',
      description: '',
      start: '',
      end: '',
      id_group: null,
      location: ''
    };
    this.eventTasks = [];
  }

  this.modalService.open(this.eventModal); // asegúrate que tienes el @ViewChild
}
formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 16); // formato compatible con input[type="datetime-local"]
}


private parseDateTime(dateString?: string | null): Date {
  if (!dateString) {
    console.warn('parseDateTime recibió un valor inválido:', dateString);
    return new Date(); // o el valor que prefieras usar por defecto
  }
  const [datePart, timePart] = dateString.split(' ');
  if (!datePart || !timePart) {
    console.warn('parseDateTime formato inesperado:', dateString);
    return new Date(dateString); // intenta crear Date con lo que venga
  }
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}
private parseDateTimeRaw(dateString?: string | null): Date {
  console.log("parseDateTimeRaw");
  if (!dateString || typeof dateString !== 'string') {
    console.warn('parseDateTimeRaw recibió valor inválido:', dateString);
    return new Date();
  }

  const [datePart, timePart] = dateString.split(' ');
  if (!datePart || !timePart) {
    console.warn('Formato inesperado en parseDateTimeRaw:', dateString);
    return new Date(dateString);
  }

  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  // 👇 Aquí creamos un string ISO local sin zona horaria
  const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

  return new Date(isoString); // Esto conserva la hora exacta sin ajustar a la zona local
}
parseDateTimeLocal(dateString: string): Date {
  // dateString ejemplo: "2025-07-04 21:41:00"
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  // Construir fecha local sin conversión
  return new Date(year, month - 1, day, hour, minute, second);
}
formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

addTask() {
  this.eventTasks.push({ task_name: '', time_range: '', volunteer_needed: 1 });
}

removeTask(index: number) {
  this.eventTasks.splice(index, 1);
}
createEvent(): void {
  console.log("createEvent");
  this.loading = true;

  if (!this.newEvent.title || !this.newEvent.id_group || !this.newEvent.start) {
    this.loading = false;
    Swal.fire('Missing data', 'Please select a group and enter a title/date', 'warning');
    return;
  }
 const startDate = new Date(this.newEvent.start);
  const endDate = new Date(this.newEvent.end);
  if (endDate < startDate) {
    this.loading = false;
    Swal.fire('Invalid dates', 'End date cannot be before start date', 'error');
    return;
  }
  const baseStart = new Date(this.newEvent.start);
  const baseEnd = new Date(this.newEvent.end || this.newEvent.start);
  const repeatCount = this.repeatOption === 'once' ? 1 : this.repeatCount;

  const eventsToCreate = [];



    eventsToCreate.push({
      title: this.newEvent.title,
      description: this.newEvent.description,
     start: this.newEvent.start, // convierte a UTC
      end: this.newEvent.end,    // convierte a UTC
      id_group: this.newEvent.id_group,
      location: this.newEvent.location,
      repeatType: this.repeatOption || '',   // 'weekly' o 'monthly'
      repeatCount: repeatCount || 1,
    });


  // Crear todos los eventos en paralelo
  const eventCalls = eventsToCreate.map(eventData =>
    this.groupService.createEvent(eventData)
  );

  forkJoin(eventCalls).subscribe({
    next: (createdEvents: any[]) => {
      const allTaskCalls = createdEvents.flatMap((event: any) =>
        this.eventTasks.map(task =>
          this.groupService.createEventTask({
            id_event: event.id_event,
            task_name: task.task_name,
            time_range: task.time_range,
            volunteer_needed: task.volunteer_needed
          })
        )
      );

      if (allTaskCalls.length === 0) {
        this.loading = false;
        Swal.fire('Success', 'Event(s) created successfully (no tasks)', 'success');
        this.loadAllEvents();
        this.modalService.dismissAll();
        return;
      }

      forkJoin(allTaskCalls).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire('Success', 'Event(s) and tasks created successfully', 'success');
          this.loadAllEvents();
          this.modalService.dismissAll();
        },
        error: () => {
          this.loading = false;
          Swal.fire('Error', 'Failed to create tasks', 'error');
        }
      });
    },
    error: () => {
      this.loading = false;
      Swal.fire('Error', 'Failed to create events', 'error');
    }
  });
}
formatLocalDateTimeString(dateStr: string): string {
  // Recibe "2025-07-17T22:55" y devuelve "2025-07-17 22:55:00"
  return dateStr.replace('T', ' ') + ':00';
}
canCreateEvent(): boolean {
  return this.authService.isAdmin() ||
         this.authService.hasJobRole('Class/Group leaders');
         //||this.authService.hasJobRole('General support');
         }
 handleEvent(event: CalendarEvent): void {
   console.log("handleEvent");
   this.selectedEvent = event;
   const id_event = event.meta?.id_event;

   if (this.isAdmin || this.coordinatorGroupIds.includes(event.meta?.id_group)) {
     this.groupService.getEventAttendees(id_event).subscribe({
       next: (data) => {
         this.attendees = data;
       },
       error: () => {
         console.error('Failed to load attendees');
       }
     });
   }

   this.modalService.open(this.eventDetailsModal, { size: 'md' });
 }

  getEventsForSelectedDay(): CalendarEvent[] {
    console.log("getEventsForSelectedDay");
    return this.events.filter(
      (event) =>
        event.start.toDateString() === this.viewDate.toDateString()
    );
  }

registerAsAttendee(event: CalendarEvent): void {
  const eventId = event.meta?.id_event;
  const contactId = this.authService.getContactId();

  if (!eventId || !contactId) {
    Swal.fire('Error', 'Missing event or contact information', 'warning');
    return;
  }

  Swal.fire({
    title: 'Confirm Registration',
    text: 'Do you want to register as an attendee for this event?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    confirmButtonText: 'Yes, register me',
    cancelButtonText: 'Cancel'
  }).then(result => {
    if (result.isConfirmed) {
      this.groupService.registerAttendee({ id_event: eventId, id_contact: contactId }).subscribe({
        next: () => {
          this.loadAllEvents(); // recarga para marcar visualmente el registro si lo aplicas
          Swal.fire('Registered', 'You have been registered as an attendee', 'success');
        },
        error: (err) => {
          if (err.status === 409) {
            Swal.fire('Info', 'You are already registered for this event.', 'info');
          } else {
            Swal.fire('Error', 'Failed to register as an attendee', 'error');
          }
        }
      });
    }
  });
}
registerAsInstructor(event: CalendarEvent): void {
  const eventId = event.meta?.id_event;
  const contactId = this.authService.getContactId();

  if (!eventId || !contactId) {
    Swal.fire('Error', 'Missing event or contact information', 'warning');
    return;
  }

  Swal.fire({
    title: 'Confirm Registration',
    text: 'Do you want to register as an coordinator for this event?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    confirmButtonText: 'Yes, register me',
    cancelButtonText: 'Cancel'
  }).then(result => {
    if (result.isConfirmed) {
      this.groupService.registerInstructor({ id_event: eventId, id_contact: contactId }).subscribe({
        next: () => {
          this.loadAllEvents();
          Swal.fire('Registered', 'You are now listed as an coordinator', 'success');
          this.openTimesheetModal(eventId, contactId);
        },
        error: () => {
          Swal.fire('Error', 'Failed to register as an coordinator', 'error');
        }
      });
    }
  });
}
registerAsHelper(event: CalendarEvent): void {
  const eventId = event.meta?.id_event;
  const contactId = this.authService.getContactId();

  if (!eventId || !contactId) {
    Swal.fire({
      icon: 'error',
      title: 'Missing information',
      text: 'Event or contact information is missing.',
    });
    return;
  }

  Swal.fire({
    title: 'Confirm Support Registration',
    text: 'Would you like to register as general support for this event?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10B981', // Tailwind green-500
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, I want to help',
    cancelButtonText: 'Cancel'
  }).then(result => {
    if (result.isConfirmed) {
      const payload = { id_event: eventId, id_contact: contactId };

      this.groupService.registerHelper(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Registered',
            text: 'You have been registered as a helper.',
          });
          this.openTimesheetModal(eventId, contactId);
          this.loadAllEvents(); // Reload to reflect updated status
        },
        error: (err) => {
          const message =
            err.status === 409
              ? 'You are already registered as a helper for this event.'
              : 'There was a problem registering your support. Please try again.';

          Swal.fire({
            icon: err.status === 409 ? 'info' : 'error',
            title: err.status === 409 ? 'Already Registered' : 'Error',
            text: message,
          });
        }
      });
    }
  });
}

openTimesheetModal(eventId: number, contactId: number) {
  Swal.fire({
    title: 'Log your volunteer hours',
    html:
      `<input id="ts-hours" type="number" min="0" placeholder="Hours worked" class="swal2-input">
       <input id="ts-activity" placeholder="Activity (e.g., teaching, cleanup)" class="swal2-input">`,
    confirmButtonText: 'Save',
    showCancelButton: true,
    preConfirm: () => {
      const hours = parseFloat((document.getElementById('ts-hours') as HTMLInputElement).value);
      const activity = (document.getElementById('ts-activity') as HTMLInputElement).value;

      if (!hours || !activity) {
        Swal.showValidationMessage('Please enter both hours and activity');
        return;
      }

      return { hours, activity };
    }
  }).then(result => {
    if (result.isConfirmed) {
      const { hours, activity } = result.value!;
      this.groupService.createTimesheet({ id_event: eventId, id_contact: contactId, hours, activity }).subscribe({
        next: () => Swal.fire('Saved', 'Timesheet submitted successfully', 'success'),
        error: () => Swal.fire('Error', 'Failed to save timesheet', 'error')
      });
    }
  });
}

isMember(): boolean {
  // Por ejemplo, si tener rol 'Member' significa ser miembro
  return this.authService.isMember();
}

// Checks if user is a volunteer with 'General Support' role
isGeneralSupportVolunteer(): boolean {
  // Asumiendo que 'General Support' es el nombre exacto del rol de voluntario
  return this.authService.hasJobRole('General support');
}
canTeach(): boolean {
   console.log("Verificando si puede enseñar canTeach");
  return this.authService.hasJobRole('Class/Group leaders');
}

today() {
  this.viewDate = new Date();
}

prev() {
  this.viewDate = this.adjustDate(-1);
}

next() {
  this.viewDate = this.adjustDate(1);
}

private adjustDate(amount: number): Date {
  const date = new Date(this.viewDate);
  switch (this.view) {
    case CalendarView.Month:
      date.setMonth(date.getMonth() + amount);
      break;
    case CalendarView.Week:
      date.setDate(date.getDate() + 7 * amount);
      break;
    case CalendarView.Day:
      date.setDate(date.getDate() + amount);
      break;
  }
  return date;
}
confirmDeleteEvent(event: any): void {
  if (confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
    this.deleteEvent(event.id); // Llama al servicio que elimina el evento
  }
}

deleteEvent(eventId: number): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This will permanently delete the event.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.groupService.deleteEvent(eventId).subscribe({
        next: () => {
          this.loadAllEvents();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'The event has been deleted.'
          });
        },
        error: (error) => {
          if (error.status === 409) {
            Swal.fire({
              icon: 'warning',
              title: 'Associated timesheets found',
              text: 'This event has timesheets linked to it. Do you want to delete everything?',
              showCancelButton: true,
              confirmButtonText: 'Yes, delete all',
              cancelButtonText: 'Cancel'
            }).then(confirmCascade => {
              if (confirmCascade.isConfirmed) {
                // Llama a delete cascade
                this.groupService.deleteEventCascade(eventId).subscribe(() => {
                  this.loadAllEvents();
                  Swal.fire('Deleted!', 'Event and timesheets deleted.', 'success');
                });
              }
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'There was a problem deleting the event.'
            });
          }
        }
      });
    }
  });
}
editEvent(id_event: number): void {
  if (!id_event) {
    Swal.fire('Error', 'Missing event ID for update', 'error');
    return;
  }

  if (!this.newEvent.title || !this.newEvent.id_group || !this.newEvent.start) {
    Swal.fire('Missing data', 'Please complete all required fields', 'warning');
    return;
  }
  const startDate = new Date(this.newEvent.start);
  const endDate = new Date(this.newEvent.end);
  if (endDate < startDate) {
    Swal.fire('Invalid dates', 'End date cannot be before start date', 'error');
    return;
  }

  const updatedData = {
    title: this.newEvent.title,
    description: this.newEvent.description,
    start: this.newEvent.start,
    end: this.newEvent.end,
    id_group: this.newEvent.id_group,
    location: this.newEvent.location
  };

  this.groupService.updateEvent(id_event, updatedData).subscribe({
    next: () => {
      // Si no hay tareas, cerrar directamente
      if (!this.eventTasks || this.eventTasks.length === 0) {
        this.loadAllEvents();
        this.modalService.dismissAll();
        Swal.fire('Success', 'Event updated successfully (no tasks)', 'success');
        return;
      }

      // ✅ Borrar tareas existentes y luego crear nuevas
      this.groupService.deleteTasksByEventId(id_event).subscribe({
        next: () => {
          const taskCalls = this.eventTasks.map(task =>
            this.groupService.createEventTask({
              id_event,
              task_name: task.task_name,
              time_range: task.time_range,
              volunteer_needed: task.volunteer_needed
            })
          );

          forkJoin(taskCalls).subscribe({
            next: () => {
              this.loadAllEvents();
              this.modalService.dismissAll();
              Swal.fire('Success', 'Event and tasks updated successfully', 'success');
            },
            error: () => {
              Swal.fire('Error', 'Event updated but failed to create tasks', 'error');
            }
          });
        },
        error: () => {
          Swal.fire('Error', 'Failed to delete previous tasks', 'error');
        }
      });
    },
    error: () => {
      Swal.fire('Error', 'Failed to update event', 'error');
    }
  });
}
openSignatureModal(event: any): void {
  this.selectedEvent = event;
  this.modalService.open(this.signatureModal);
}

onSignatureCompleted(dataUrl: string, event: any, modal: any) {
  const contactId = Number(this.authService.getContactId());
  const id_event = event.meta?.id_event;

  if (!contactId || !id_event) {
    console.error('Invalid contactId or id_event');
    Swal.fire('Error', 'No se puede confirmar asistencia: faltan datos', 'error');
    return;
  }

  this.groupService.saveSignature({
    id_event: id_event,
    id_contact: contactId!,
    signature: dataUrl
  }).subscribe({
    next: () => {
      Swal.fire('Asistencia confirmada', 'Firma registrada con éxito', 'success');
      modal.close();
      this.loadAllEvents();
    },
    error: () => {
      Swal.fire('Error', 'No se pudo guardar la firma', 'error');
    }
  });
}


}
