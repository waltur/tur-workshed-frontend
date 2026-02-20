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
import { v4 as uuidv4 } from 'uuid';


interface EventTask {
                   task_name: string;
                   time_range: string;
                   volunteer_needed: number;
                 }
               interface NewEvent {
                 id_event: number | null;
                 title: string;
                 description: string;
                 start: string;
                 end: string;

                 id_group: number | null;
                 location: string;
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
newEvent: NewEvent = {
  id_event: null,
  title: '',
  description: '',
  start: '',
  end: '',
  id_group: null,
  location: ''
};
groups: any[] = [];
eventTasks: EventTask[] = [];
loading = false;
//events: CalendarEvent[] = [];
isLogged = false;
coordinatorGroupIds: number[] = [];
isAdmin: boolean = true;
isEditing: boolean = false;
editingEventId: number | null = null;
repeatType: '' | 'weekly' | 'monthly' = '';
repeatCount: number = 1;
repeatOption: 'once' | 'weekly' | 'monthly' = 'once';
recurrence = {

  frequency: 'once', // once | daily | weekly | monthly
  interval: 1,

  // semanal
  daysOfWeek: [] as number[],

  // mensual avanzado
  monthlyWeekCount: 1, // 👈 NUEVO: 1..4
  monthlyDaysOfWeek: [] as number[], // 👈 NUEVO

  endType: 'count',
  count: 1,
  until: null as string | null
};
weekDays = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];


attendees: any[] = [];
selectedAttendee: any = null;
showAttendees = false;
attendeeSearch = '';
coordinator:any;
loadingEvents = false;
selectedDay: Date | null = null;
selectedDayEvents: CalendarEvent[] = [];
events: CalendarEvent<any>[] = [];
isLoadingBooking = false;



constructor(private modalService: NgbModal, private groupService:GroupService, private route: ActivatedRoute,private authService: AuthService) {}


  ngOnInit(): void {
    this.loadGroups();
    this.loadAllEvents();
    this.isLogged = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }
toggleWeekDay(day: number) {
  const idx = this.recurrence.daysOfWeek.indexOf(day);
  if (idx >= 0) {
    this.recurrence.daysOfWeek.splice(idx, 1);
  } else {
    this.recurrence.daysOfWeek.push(day);
  }
}
/*isRegistered(event: any): boolean {
  return event.meta?.registration_roles?.includes('Attendant');
}
hasEventStarted(event: any): boolean {
  const now = new Date();
  const start = new Date(event.start);
  return now >= start;
}
toggleBooking(event: any) {

  if (this.hasEventStarted(event)) {
    alert('Event already started. You cannot modify booking.');
    return;
  }

  if (this.isRegistered(event)) {
    this.confirmCancel(event);
  } else {
    this.bookEvent(event);
  }
}
*/
loadEventsByGroup(groupId: number): void {
  console.log('ENTRÓ A loadEventsByGroup', groupId);
  this.loading = true;

  this.groupService.getEventsByGroup(groupId).subscribe({
    next: (eventsData: any[]) => {

      // ✅ CASO 1: No hay eventos
      if (!eventsData || eventsData.length === 0) {
        this.events = [];
        this.refresh.next();
        this.loading = false;
        return;
      }

      // ✅ CASO 2: Hay eventos
      const eventCalls = eventsData.map(event => {
        return this.groupService.getGroupMembers(event.id_group).pipe(
          map((members: any[]) => {
            const coordinator = members.find(
              (m: any) => m.name_role === 'Coordinator'
            );

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

      forkJoin(eventCalls).subscribe({
        next: (events: CalendarEvent[]) => {
          this.events = events;
          this.refresh.next();
          this.loading = false;
        },
        error: err => {
          console.error('Error building events:', err);
          this.loading = false;
        }
      });
    },
    error: (err) => {
      console.error('Error loading events for group:', err);
      this.loading = false;
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

      // 🔥 CASO CLAVE: no hay eventos
      if (!eventsData || eventsData.length === 0) {
        this.events = [];
        this.refresh.next();
        this.loadingEvents = false;
        return;
      }

      const eventCalls = eventsData.map(event =>
        this.groupService.getGroupMembers(event.id_group).pipe(
          map((members: any[]) => {
            const coordinator = members.find(
              (m: any) => m.name_role === 'Coordinator'
            );

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

      forkJoin(eventCalls).subscribe({
        next: (events: CalendarEvent[]) => {
          this.events = events;
          this.refresh.next();
          this.loadingEvents = false;
        },
        error: () => {
          this.loadingEvents = false;
        }
      });
    },

    error: () => {
      this.loadingEvents = false;
      console.error('Failed to load events');
    }
  });
}
toggleDay(day: number): void {
   if (this.recurrence.frequency === 'monthly') {
      const idx = this.recurrence.monthlyDaysOfWeek.indexOf(day);

      if (idx >= 0) {
        this.recurrence.monthlyDaysOfWeek.splice(idx, 1);
      } else {
        this.recurrence.monthlyDaysOfWeek = [day]; // mensual = solo uno
      }
      return;
    }

  const index = this.recurrence.daysOfWeek.indexOf(day);

  if (index > -1) {
    this.recurrence.daysOfWeek.splice(index, 1);
  } else {
    this.recurrence.daysOfWeek.push(day);
  }
}
getNthWeekdayOfMonth(
  year: number,
  month: number,      // 0–11
  weekday: number,    // 0=Sunday … 6=Saturday
  n: number           // 1=First, 2=Second, 3=Third, 4=Fourth
): Date | null {

  let count = 0;

  // empezar desde el día 1 del mes
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    if (date.getDay() === weekday) {
      count++;

      if (count === n) {
        return new Date(date);
      }
    }
    date.setDate(date.getDate() + 1);
  }

  return null;
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
/*dayClicked(day: { date: Date; events: CalendarEvent[] }): void {
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
*/
dayClicked(day: { date: Date; events: CalendarEvent[] }): void {
  if (this.isEditing) return;

  this.selectedDay = day.date;
  this.selectedDayEvents = day.events;

  // preparar datos para crear evento rápido
  this.selectedDate = day.date;
  const dateStr = day.date.toISOString().split('T')[0];
  this.newEvent.start = dateStr;
  this.newEvent.end = dateStr;
}

openNewEventModal(event?: any): void {
  console.log("openNewEventModal");
  this.isEditing = !!event;


  if (event) {
    this.editingEventId = event.meta?.id_event;
     this.newEvent = {
     id_event: event.meta?.id_event || null,
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
    this.recurrence.frequency = 'once';
    this.recurrence.interval = 1;
    this.recurrence.daysOfWeek = [];
    this.recurrence.monthlyWeekCount = 1;
    this.recurrence.monthlyDaysOfWeek = [];
    this.recurrence.count = 1;
    this.recurrence.until = null;

    this.eventTasks = [];
  }

  this.modalService.open(this.eventModal); // asegúrate que tienes el @ViewChild

}
toggleMonthlyDay(day: number) {
  const index = this.recurrence.monthlyDaysOfWeek.indexOf(day);
  if (index >= 0) {
    this.recurrence.monthlyDaysOfWeek.splice(index, 1);
  } else {
    this.recurrence.monthlyDaysOfWeek.push(day);
  }
}
generateRecurringDates(): { start: Date; end: Date | null }[] {
  const baseStart = new Date(this.newEvent.start);
  const baseEnd = this.newEvent.end ? new Date(this.newEvent.end) : null;

  if (this.recurrence.frequency === 'once') {
    return [{ start: baseStart, end: baseEnd }];
  }

  /*if (this.recurrence.frequency === 'weekly') {
    return this.generateWeeklyDates();
  }*/

  if (this.recurrence.frequency === 'monthly') {
    // 👇 luego conectamos aquí la lógica mensual limpia
    return [];
  }

  return [];
}
generateWeeklyDates(
  rangeStart: Date,
  rangeEnd: Date,
  daysOfWeek: number[],
  durationMs: number
): { start: Date; end: Date }[] {

  const results: { start: Date; end: Date }[] = [];
  const cursor = new Date(rangeStart);
  const daysSet = new Set(daysOfWeek);

  while (cursor <= rangeEnd) {
    if (daysSet.has(cursor.getDay())) {

      const start = new Date(cursor);
      start.setHours(
        rangeStart.getHours(),
        rangeStart.getMinutes(),
        0,
        0
      );

      const end = new Date(start.getTime() + durationMs);

      results.push({ start, end });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return results;
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
  this.loading = true;

  if (!this.newEvent.title || !this.newEvent.id_group || !this.newEvent.start) {
    this.loading = false;
    Swal.fire('Missing data', 'Please select a group and enter a title/date', 'warning');
    return;
  }
const eventStart = new Date(this.newEvent.start);

const eventEnd = this.newEvent.end
  ? new Date(this.newEvent.end)
  : new Date(this.newEvent.start);
const startDate = eventStart;
const endDate = eventEnd;
const eventDuration = eventEnd.getTime() - eventStart.getTime();


// 👉 duración fija (1 hora por ahora)
//const DURATION_MS = 60 * 60 * 1000;

// 👉 rango de recurrencia (fecha SOLA, sin hora)
const rangeStart = new Date(this.newEvent.start);
let rangeEnd = this.newEvent.end
  ? new Date(this.newEvent.end)
  : new Date(this.newEvent.start);
rangeEnd.setHours(23, 59, 59, 999);

const start = new Date(this.newEvent.start);
const end = new Date(this.newEvent.end);

let diffHours = end.getHours() - start.getHours();
let diffMinutes = end.getMinutes() - start.getMinutes();

const DURATION_MS =
  (diffHours * 60 + diffMinutes) * 60 * 1000;

console.log('DURATION_MS', DURATION_MS);

if (!this.newEvent.end) {
  if (this.recurrence.frequency === 'monthly') {
    rangeEnd.setMonth(rangeEnd.getMonth() + 3);
  }

  if (this.recurrence.frequency === 'weekly') {
    rangeEnd.setMonth(rangeEnd.getMonth() + 1);
  }
}



if (endDate < startDate) {
  this.loading = false;
  Swal.fire('Invalid dates', 'End date cannot be before start date', 'error');
  return;
}

const duration = endDate.getTime() - startDate.getTime();

  // 🧠 GENERAR FECHAS CORRECTAS
  let dates: { start: Date; end: Date }[] = [];

// 🟢 Recurrente semanal
if (this.recurrence.frequency === 'weekly') {
  if (!this.recurrence.daysOfWeek.length) {
    this.loading = false;
    Swal.fire('Invalid recurrence', 'Please select at least one weekday', 'warning');
    return;
  }

  dates = this.generateWeeklyDates(
    rangeStart,
    rangeEnd,
    this.recurrence.daysOfWeek,
    DURATION_MS
  );

}else if (this.recurrence.frequency === 'monthly') {
 console.log('MONTHLY INPUT', {
    rangeStart,
    rangeEnd,
    days: this.recurrence.monthlyDaysOfWeek,
    week: this.recurrence.monthlyWeekCount
  });
  dates = this.generateMonthlyNthWeekdayDates(
    rangeStart,   // 👈 mismo rango que weekly
    rangeEnd,
    this.recurrence.monthlyDaysOfWeek,
    Number(this.recurrence.monthlyWeekCount),
    DURATION_MS
  );

// 🟢 Evento único
} else {
  dates.push({ start: startDate, end: endDate });
}

  /*if (!dates.length) {
    this.loading = false;
    Swal.fire('Invalid recurrence', 'Please select valid days for recurrence', 'warning');
    return;
  }*/

  const seriesId =
    this.recurrence.frequency !== 'once'
      ? uuidv4()
      : null;

const eventsToCreate = dates.map(d => ({
  title: this.newEvent.title,
  description: this.newEvent.description,
  start: this.formatLocalDateTimeString(
    this.formatDateTimeLocal(d.start)
  ),
  end: this.formatLocalDateTimeString(
    this.formatDateTimeLocal(d.end)
  ),
  id_group: this.newEvent.id_group,
  location: this.newEvent.location,
  series_id: seriesId
}));
console.log("eventsToCreate", eventsToCreate);
  const eventCalls = eventsToCreate.map(e =>
    this.groupService.createEvent(e)
  );
// 🔥 FIX CRÍTICO
if (!eventCalls.length) {
  this.loading = false;
  Swal.fire(
    'Invalid recurrence',
    'Please select at least one weekday for monthly recurrence',
    'warning'
  );
  return;
}
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

      if (!allTaskCalls.length) {
        this.loading = false;
        Swal.fire('Success', 'Event(s) created successfully', 'success');
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
cancelBooking(event: any) {
  console.log("cancelBooking", event);
    Swal.fire({
      title: 'Confirm cancel booking',
      text: 'Do you want to cancel your attendance at this event??',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Yes, cancel me',
      cancelButtonText: 'Cancel'
    }).then(result => {
        this.groupService.cancelBooking(event.meta.id_event).subscribe({
        next: () => {
        Swal.fire('Success', 'Cancel booking successfully', 'success');
        // actualizar UI sin recargar
        event.meta.registration_roles =
        event.meta.registration_roles.filter((r: string) => r !== 'Attendant');

      event.meta.attended = false;
    },
    error: (err) => {
       Swal.fire('Error', 'Canceling booking', 'error');
      console.error('Error canceling booking', err);
    }
  })});
}

generateMonthlyNthWeekdayDates(
  rangeStart: Date,
  rangeEnd: Date,
  daysOfWeek: number[],   // 0..6
  weekCount: number,      // 1..4
  durationMs: number
): { start: Date; end: Date }[] {

  const results: { start: Date; end: Date }[] = [];

  const current = new Date(rangeStart);
  current.setDate(1); // empezar desde el inicio del mes

  while (current <= rangeEnd) {
    const year = current.getFullYear();
    const month = current.getMonth();

    for (const dayOfWeek of daysOfWeek) {
      let count = 0;

      // recorrer días del mes
      for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month, day);

        if (date.getMonth() !== month) break;

        if (date.getDay() === dayOfWeek) {
          count++;

          if (count === weekCount) {
            const start = new Date(date);
            start.setHours(
              rangeStart.getHours(),
              rangeStart.getMinutes(),
              0,
              0
            );

            const end = new Date(start.getTime() + durationMs);

           if (start <= rangeEnd) {
              results.push({ start, end });
            }
            break;
          }
        }
      }
    }

    current.setMonth(current.getMonth() + 1);
  }
  console.log('MONTHLY GENERATED', results);
  return results;
}



generateDailyDates(): { start: Date; end: Date }[] {
  const results: { start: Date; end: Date }[] = [];

  const start = new Date(this.newEvent.start);
  const endLimit = new Date(this.newEvent.end!);
  const duration = this.getEventDuration();

  let current = new Date(start);

  while (current <= endLimit) {
    const startDate = new Date(current);
    const endDate = new Date(startDate.getTime() + duration);
    results.push({ start: startDate, end: endDate });

    current.setDate(current.getDate() + this.recurrence.interval);
  }

  return results;
}
generateOnceDate(): { start: Date; end: Date }[] {
  const start = new Date(this.newEvent.start);
  const end = new Date(this.newEvent.end || this.newEvent.start);
  return [{ start, end }];
}
getEventDuration(): number {
  const start = new Date(this.newEvent.start);
  const end = new Date(this.newEvent.end || this.newEvent.start);
  return end.getTime() - start.getTime();
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
isRecurring(event: any): boolean {
  return !!event.series_id;
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
 // 🔥 ACTUALIZAR EL EVENTO LOCAL
            if (!event.meta) {
              event.meta = {};
            }

            event.meta.registration_roles = [
              ...(event.meta.registration_roles || []),
              'Attendant'
            ];

            event.meta.attended = false; // queda en espera de confirmación

            // 🔄 refrescar vista
            this.refresh.next();
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
  console.log("confirmDeleteEvent", event);
    this.deleteEvent(event.meta.id_event); // Llama al servicio que elimina el evento

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
          this.modalService.dismissAll();
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
                  this.modalService.dismissAll();
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

  const selectedEvent = this.selectedEvent;
  const isRecurring = !!selectedEvent?.series_id;

  // 🔁 Reutilizable: tareas + cerrar modal
  const updateTasksAndFinish = () => {
    if (!this.eventTasks || this.eventTasks.length === 0) {
      this.loadAllEvents();
      this.modalService.dismissAll();
      Swal.fire('Success', 'Event updated successfully', 'success');
      return;
    }

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
  };

  // 🟢 EVENTO NO RECURRENTE (NO CAMBIA)
  if (!isRecurring) {
    this.groupService.updateEvent(id_event, updatedData).subscribe({
      next: () => updateTasksAndFinish(),
      error: () => Swal.fire('Error', 'Failed to update event', 'error')
    });
    return;
  }

  // 🔁 EVENTO RECURRENTE
  Swal.fire({
    title: 'Edit recurring event',
    text: 'Which events do you want to update?',
    icon: 'question',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Only this event',
    denyButtonText: 'This and following',
    cancelButtonText: 'All events'
  }).then(result => {

    // 🔹 SOLO ESTE EVENTO
    if (result.isConfirmed) {
      this.groupService.updateEvent(id_event, updatedData).subscribe({
        next: () => updateTasksAndFinish(),
        error: () => Swal.fire('Error', 'Failed to update event', 'error')
      });
    }

    // 🔹 ESTE Y LOS SIGUIENTES
    else if (result.isDenied) {
      this.groupService.updateSeries(
        selectedEvent.series_id,
        {
          scope: 'from',
          fromDate: selectedEvent.start,
          ...updatedData
        }
      ).subscribe({
        next: () => {
          this.loadAllEvents();
          this.modalService.dismissAll();
          Swal.fire('Success', 'Future events updated successfully', 'success');
        },
        error: () => Swal.fire('Error', 'Failed to update future events', 'error')
      });
    }

    // 🔹 TODOS LOS EVENTOS
    else if (result.dismiss === Swal.DismissReason.cancel) {
      this.groupService.updateSeries(
        selectedEvent.series_id,
        {
          scope: 'all',
          ...updatedData
        }
      ).subscribe({
        next: () => {
          this.loadAllEvents();
          this.modalService.dismissAll();
          Swal.fire('Success', 'All events updated successfully', 'success');
        },
        error: () => Swal.fire('Error', 'Failed to update event series', 'error')
      });
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
    Swal.fire('Error', 'Attendance cannot be confirmed: data is missing', 'error');
    return;
  }

  this.groupService.saveSignature({
    id_event: id_event,
    id_contact: contactId!,
    signature: dataUrl
  }).subscribe({
   next: () => {

     // 🔥 ACTUALIZAR EVENTO LOCAL
     if (!event.meta) {
       event.meta = {};
     }

     event.meta.signature = dataUrl;
     event.meta.attended = true;

     // 🔄 refrescar vista
     this.refresh.next();

     Swal.fire(
       'Confirmed attendance',
       'Signature successfully registered',
       'success'
     );

     modal.close();

     // ❌ NO loadAllEvents() aquí
   },




    error: () => {
      Swal.fire('Error', 'No se pudo guardar la firma', 'error');
    }
  });
}


}
