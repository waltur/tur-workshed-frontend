import { Component, OnInit } from '@angular/core';
import { ReportService } from './../service/report.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
Chart.register(...registerables);

@Component({
  selector: 'app-members-report',
  templateUrl: './members-report.component.html',
  styleUrls: ['./members-report.component.css']
})
export class MembersReportComponent implements OnInit {

  loading = false;

  summary: any = {};

  members: any[] = [];

  filteredMembers: any[] = [];

  search = '';

  ageChart!: Chart;

  communityChart!: Chart;

  paymentChart!: Chart;

  revenueChart!: Chart;

  expandedMember: number | null = null;
  constructor(
    private reportsService: ReportService
  ) {}

  ngOnInit(): void {

    this.loadReport();

  }
  toggleMember(member: any): void {

      this.expandedMember =
          this.expandedMember === member.id_user
              ? null
              : member.id_user;

  }

  loadReport(): void {
console.log("loadReport");
    this.loading = true;

    this.reportsService.getMembersReport().subscribe({

      next: (response) => {
      console.log(response);
        this.summary = response.summary;

        this.members = response.members;

        this.filteredMembers = [...this.members];

        this.createCharts(response.charts);

        this.loading = false;

      },

      error: (err) => {

        console.error(err);

        this.loading = false;

      }

    });

  }

 createCharts(charts:any){
      if(this.ageChart){

          this.ageChart.destroy();

      }

      if(this.communityChart){

          this.communityChart.destroy();

      }

      if(this.paymentChart){

          this.paymentChart.destroy();

      }

      if(this.revenueChart){

          this.revenueChart.destroy();

      }

      //-----------------------------
      // AGE
      //-----------------------------

      this.ageChart=this.buildBarChart(

          'ageChart',

          'Members',

          charts.ageDistribution.map((x:any)=>x.name),

          charts.ageDistribution.map((x:any)=>x.value),

          '#f97316'

      );

      //-----------------------------
      // COMMUNITY
      //-----------------------------

      this.communityChart=this.buildPieChart(

          'communityChart',

          charts.communityPreference.map((x:any)=>x.name),

          charts.communityPreference.map((x:any)=>x.value)

      );

      //-----------------------------
      // PAYMENT
      //-----------------------------

      this.paymentChart=this.buildPieChart(

          'paymentChart',

          charts.paymentStatus.map((x:any)=>x.name),

          charts.paymentStatus.map((x:any)=>x.value)

      );

      this.revenueChart = this.buildBarChart(

        'revenueChart',

        'Revenue (AUD)',

        charts.revenueByYear.map((x:any)=>x.name),

        charts.revenueByYear.map((x:any)=>Number(x.value)),

        '#16a34a'

      );

 }
 buildBarChart(
   id: string,
   label: string,
   labels: string[],
   data: number[],
   color: string
 ): Chart {

   return new Chart(id, {

     type: 'bar',

     data: {

       labels,

       datasets: [

         {

           label,

           data,

           backgroundColor: color,

           borderRadius: 8,

           borderSkipped: false

         }

       ]

     },

     options: {

       responsive: true,

       maintainAspectRatio: false,

       plugins: {

         legend: {

           display: false

         }

       },

       scales: {

         x: {

           grid: {

             display: false

           }

         },

         y: {

           beginAtZero: true,

           grid: {

             color: '#eeeeee'

           }

         }

       }

     }

   });

 }
 buildPieChart(
   id:string,
   labels:string[],
   data:number[]
 ):Chart{

     return new Chart(id,{

         type:'doughnut',

         data:{

             labels,

             datasets:[{

                 data,

                 backgroundColor:[

                     '#f97316',

                     '#3b82f6',

                     '#10b981',

                     '#a855f7',

                     '#ef4444',

                     '#14b8a6'

                 ],

                 borderWidth:0

             }]

         },

         options:{

             responsive:true,

             maintainAspectRatio:false,

             cutout:'65%',

             plugins:{

                 legend:{

                     position:'bottom'

                 }

             }

         }

     });

 }

  filterMembers(): void {

    const text = this.search.toLowerCase();

    this.filteredMembers = this.members.filter(member =>

      (member.name || '').toLowerCase().includes(text)

      ||

      (member.username || '').toLowerCase().includes(text)

      ||

      (member.email || '').toLowerCase().includes(text)

    );

  }
   exportExcel(): void {

     const rows = this.filteredMembers.map((member: any) => ({

       //====================================================
       // GENERAL
       //====================================================

       Name: member.name,

       Username: member.username,

       Email: member.email,

       Phone: member.phone_number,

       Roles: member.roles?.join(', ') || '',

       Active: member.is_active ? 'Yes' : 'No',

       Verified: member.is_verified ? 'Yes' : 'No',

       //====================================================
       // MEMBERSHIP
       //====================================================

       'Membership Status': member.membership_status ?? '-',

       'Membership Start': member.membership_start
         ? new Date(member.membership_start).toLocaleDateString()
         : '-',

       'Membership End': member.membership_end
         ? new Date(member.membership_end).toLocaleDateString()
         : '-',

       'Payment Status': member.payment_status ?? 'Pending',

       'Membership Amount': member.membership_amount ?? '-',

       Currency: member.currency ?? '-',

       'Paid Date': member.paid_at
         ? new Date(member.paid_at).toLocaleDateString()
         : '-',

       //====================================================
       // VOLUNTEER PROFILE
       //====================================================

       Occupation: member.occupation ?? '',

       Organisation: member.organisation ?? '',

       Languages: member.languages ?? '',

       'Own Vehicle': member.own_vehicle ? 'Yes' : 'No',

       //====================================================
       // VOLUNTEER
       //====================================================

       Skills:
         member.skills?.length
           ? member.skills.join(', ')
           : '',

       Interests:
         member.interests?.length
           ? member.interests.join(', ')
           : '',

       Certifications:
         member.certifications?.length
           ? member.certifications.join(', ')
           : '',

       Availability:
         member.availability?.length
           ? member.availability.join(', ')
           : '',

       //====================================================
       // EXTRA INFORMATION
       //====================================================

       'Volunteer Experience':
         member.volunteer_experience ?? '',

       'Medical Conditions':
         member.medical_conditions ?? '',

       'Emergency Notes':
         member.emergency_notes ?? '',

       'Additional Information':
         member.additional_information ?? ''

     }));


     const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [

        { wch: 22 }, // Name
        { wch: 18 }, // Username
        { wch: 35 }, // Email
        { wch: 18 }, // Phone
        { wch: 35 }, // Roles
        { wch: 10 }, // Active
        { wch: 10 }, // Verified

        { wch: 18 }, // Membership Status
        { wch: 15 }, // Membership Start
        { wch: 15 }, // Membership End
        { wch: 18 }, // Payment Status
        { wch: 18 }, // Membership Amount
        { wch: 10 }, // Currency
        { wch: 15 }, // Paid Date

        { wch: 28 }, // Occupation
        { wch: 28 }, // Organisation
        { wch: 20 }, // Languages
        { wch: 12 }, // Own Vehicle

        { wch: 40 }, // Skills
        { wch: 40 }, // Interests
        { wch: 35 }, // Certifications
        { wch: 35 }, // Availability

        { wch: 45 }, // Experience
        { wch: 35 }, // Medical
        { wch: 35 }, // Emergency
        { wch: 45 }  // Additional

      ];

     const workbook = XLSX.utils.book_new();

     XLSX.utils.book_append_sheet(
         workbook,
         worksheet,
         'Members'
     );

     const excelBuffer = XLSX.write(workbook, {
         bookType: 'xlsx',
         type: 'array'
     });

     const blob = new Blob(
         [excelBuffer],
         {
           type:
           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
         }
     );

     const today = new Date();

     saveAs(
         blob,
         `Members_Report_${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}.xlsx`
     );

   }
   exportPDF(): void {

     const doc = new jsPDF('p','mm','a4');

     const pageWidth = doc.internal.pageSize.getWidth();
     const today = new Date();

     //-------------------------------------------------------
     // PORTADA
     //-------------------------------------------------------

     doc.setFillColor(242,102,34);
     doc.rect(0,0,pageWidth,40,'F');

     doc.setTextColor(255,255,255);
     doc.setFontSize(24);
     doc.text('The Workshed',15,20);

     doc.setFontSize(18);
     doc.text('Members & Volunteers Report',15,32);

     doc.setTextColor(0,0,0);

     doc.setFontSize(11);

     doc.text(
         `Generated: ${today.toLocaleString()}`,
         15,
         55
     );

     doc.text(
         `Total Members: ${this.summary.total_members}`,
         15,
         65
     );

     doc.text(
         `Active Members: ${this.summary.active_members}`,
         15,
         72
     );

     doc.text(
         `Volunteers: ${this.summary.volunteers}`,
         15,
         79
     );

     doc.text(
         `Membership Revenue: AUD ${this.summary.membership_revenue}`,
         15,
         86
     );
doc.addPage();
doc.setFontSize(18);

doc.text(
    'Executive Summary',
    14,
    20
);
autoTable(doc,{

    startY:30,

    theme:'grid',

    head:[['Metric','Value']],

    body:[

        ['Total Members',this.summary.total_members],

        ['Active Members',this.summary.active_members],

        ['Inactive Members',this.summary.inactive_members],

        ['Verified',this.summary.verified_members],

        ['Volunteers',this.summary.volunteers],

        ['Paid Members',this.summary.paid_members],

        ['Revenue',`AUD ${this.summary.membership_revenue}`],

        ['Newsletter',this.summary.newsletter_members],

        ['WhatsApp',this.summary.whatsapp_members],

        ['Photo Permission',this.summary.photo_permission]

    ]

});
doc.addPage('a4','landscape');

doc.setFontSize(18);
doc.setTextColor(242,102,34);
doc.text('Members & Volunteers',14,18);
doc.setTextColor(0,0,0);

doc.setFontSize(10);

doc.text(
    'Complete membership database',
    14,
    25
);
autoTable(doc,{

    startY:30,

    theme:'striped',

    head:[[

        'Name',

        'Roles',

        'Occupation',

        'Skills',

        'Interests',

        'Membership',

        'Payment'

    ]],

    body:this.filteredMembers.map((m:any)=>([

        m.name,

        (m.roles || []).join(', '),

        m.occupation || '-',

        (m.skills || []).join(', '),

        (m.interests || []).join(', '),

        m.membership_status || '-',

        m.payment_status || '-'

    ])),

    styles:{

        fontSize:7,

        cellPadding:2,

        overflow:'linebreak',

        valign:'middle'

    },

    headStyles:{

        fillColor:[242,102,34],

        textColor:[255,255,255],

        fontStyle:'bold'

    },

    alternateRowStyles:{

        fillColor:[248,248,248]

    },

    columnStyles:{

        0:{cellWidth:28},

        1:{cellWidth:35},

        2:{cellWidth:30},

        3:{cellWidth:45},

        4:{cellWidth:45},

        5:{cellWidth:22},

        6:{cellWidth:20}

    }

});
doc.save(
  `Members_Report_${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}.pdf`
);
}
}
