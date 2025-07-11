import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../../groups/services/group.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
})
export class AttendanceReportComponent implements OnInit {
  events: any[] = [];
  selectedEventId: number | null = null;
  attendees: any[] = [];
  //const logoBase64 = 'data:image/png;base64,...';

  constructor(private groupService: GroupService) {}

  ngOnInit() {
    // Carga eventos para el selector
    this.groupService.getAllEvents(undefined).subscribe((events:any) => {
      this.events = events;
    });
  }

  loadReport() {
    if (!this.selectedEventId) return;
    this.groupService.getAttendanceReport(this.selectedEventId).subscribe((data:any) => {
      this.attendees = data;
    });
  }

downloadPDF() {
  const doc = new jsPDF();

  // ✅ Insertar logo (ajusta tamaño/posición si es necesario)
  const logoBase64 = 'data:image/png;base64,...'; // tu logo en base64
  //doc.addImage(logoBase64, 'PNG', 14, 10, 30, 15); // x, y, width, height

  // ✅ Título y subtítulo
  doc.setFontSize(14);
  doc.text('Attendance Record – The Workshed Inner West', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  const introText =
    'This form is used to record attendance at activities run by The Workshed Inner West. ' +
    'All participants must sign in for insurance coverage, safety compliance, and reporting purposes. ' +
    'To be used for each class or activity.';
  const splitText = doc.splitTextToSize(introText, 180);
  doc.text(splitText, 14, 30);

  // ✅ Preparar tabla
  const startY = 30 + splitText.length * 5 + 5;

  const tableData = this.attendees.map((a) => [
    a.name,
    a.emergency_contact || '',
    new Date(a.start).toLocaleDateString(),
    new Date(a.start).toLocaleTimeString(),
    new Date(a.end).toLocaleTimeString(),
    { signature: a.signature }
  ]);

  autoTable(doc, {
    head: [['Name', 'Emergency Contact', 'Date', 'Time In', 'Time Out', 'Signature']],
    body: tableData.map(row =>
      row.map(cell => (typeof cell === 'object' && cell.signature ? '' : cell))
    ),
    startY,
    didDrawCell: (data) => {
      const colIndex = data.column.index;
      const rowIndex = data.row.index;

      if (data.section === 'body' && colIndex === 5) {
        const signatureData = this.attendees[rowIndex].signature;
        if (signatureData) {
          const padding = 2;
          const imgWidth = data.cell.width - padding * 2;
          const imgHeight = data.cell.height - padding * 2;

          doc.addImage(
            signatureData,
            'PNG',
            data.cell.x + padding,
            data.cell.y + padding,
            imgWidth,
            imgHeight
          );
        }
      }
    }
  });

  doc.save(`AttendanceReport_${this.selectedEventId}.pdf`);
}



}
