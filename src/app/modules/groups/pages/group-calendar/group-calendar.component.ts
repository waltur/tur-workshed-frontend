import { Component, ChangeDetectionStrategy, TemplateRef, ViewChild, OnInit  } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GroupService } from '../../services/group.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

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
  @ViewChild('newEventModal') newEventModal!: TemplateRef<any>;
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
constructor(private modalService: NgbModal, private groupService:GroupService, private route: ActivatedRoute,private authService: AuthService) {}


  ngOnInit(): void {
    this.loadGroups();
    this.loadAllEvents();
    this.isLogged = this.authService.isLoggedIn();
  }

loadEventsByGroup(groupId: number): void {
  console.log("loadEventsByGroup");
  this.groupService.getEventsByGroup(groupId).subscribe({
    next: (data) => {
      this.events = data.map(event => ({
        title: event.title,

        start: new Date(event.start),
        end: new Date(event.end),
        meta: {
          id_event: event.id_event,
          description: event.description,
          group: event.group_name || '',
          location: event.location,
        },
        color: {
          primary: '#EC4899',
          secondary: '#FCE7F3'
        },
        allDay: false
      }));
      this.refresh.next();
    },
    error: (err) => {
      console.error('Error loading events for group:', err);
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
  console.log("loadAllEvents");
 const contactId = this.authService.getContactId() ?? undefined;

  this.groupService.getAllEvents(contactId).subscribe({
    next: (data) => {
      this.events = data.map(event => ({
        title: event.title,

        start: new Date(event.start),
        end: new Date(event.end),
        meta: {
          id_event: event.id_event,
          description: event.description,
          group: event.group_name || '',
          registration_roles: event.registration_roles || [],
          location: event.location,
        },
        color: {
          primary: '#10B981',
          secondary: '#D1FAE5'
        },
        allDay: false
      }));
      this.refresh.next();
    },
    error: () => console.error('Failed to load events')
  });
}
loadGroups(): void {
  this.groupService.getGroups().subscribe({
    next: (data) => this.groups = data,
    error: () => console.error('Failed to load groups')
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
openNewEventModal(): void {
  this.modalService.open(this.newEventModal, { size: 'lg' });
}
addTask() {
  this.eventTasks.push({ task_name: '', time_range: '', volunteer_needed: 1 });
}

removeTask(index: number) {
  this.eventTasks.splice(index, 1);
}
createEvent(): void {
  this.loading = true;

  if (!this.newEvent.title || !this.newEvent.id_group || !this.newEvent.start) {
    this.loading = false;
    Swal.fire('Missing data', 'Please select a group and enter a title/date', 'warning');
    return;
  }

  const data = {
    title: this.newEvent.title,
    description: this.newEvent.description,
    start: this.newEvent.start,
    end: this.newEvent.end,
    id_group: this.newEvent.id_group,
    location:this.newEvent.location,
  };

  this.groupService.createEvent(data).subscribe({
    next: (createdEvent) => {
      const id_event = createdEvent.id_event;

      // ✅ Si no hay tareas, finalizar directamente
      if (!this.eventTasks || this.eventTasks.length === 0) {
        this.loading = false;
        Swal.fire('Success', 'Event created successfully (no tasks)', 'success');
        this.loadAllEvents();
        this.modalService.dismissAll();
        return;
      }

      // ✅ Si hay tareas, hacer forkJoin
      const taskCalls = this.eventTasks.map((task: any) =>
        this.groupService.createEventTask({
          id_event,
          task_name: task.task_name,
          time_range: task.time_range,
          volunteer_needed: task.volunteer_needed
        })
      );

      forkJoin(taskCalls).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire('Success', 'Event and tasks created successfully', 'success');
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
      Swal.fire('Error', 'Failed to create event', 'error');
    }
  });
}
canCreateEvent(): boolean {
  return this.authService.isAdmin() ||
         this.authService.hasJobRole('Class/Group leaders');
         //||this.authService.hasJobRole('General support');
         }
  handleEvent(event: CalendarEvent): void {
    console.log("handleEvent");
    this.selectedEvent = event;
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
  console.log("delete event");
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
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was a problem deleting the event.'
          });
        }
      });
    }
  });
}
editEvent(): void {
  const id_event = this.newEvent.id_event;

  if (!id_event) {
    Swal.fire('Error', 'Missing event ID for update', 'error');
    return;
  }

  const updatedData = {
    title: this.newEvent.title,
    description: this.newEvent.description,
    start: this.newEvent.start,
    end: this.newEvent.end,
    id_group: this.newEvent.id_group
  };

  this.groupService.updateEvent(id_event, updatedData).subscribe({
    next: () => {
      Swal.fire('Success', 'Event updated successfully', 'success');
      this.loadAllEvents();
      this.modalService.dismissAll();
    },
    error: () => {
      Swal.fire('Error', 'Failed to update event', 'error');
    }
  });
}

}
