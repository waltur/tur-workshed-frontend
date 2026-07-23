import { Component, OnInit } from '@angular/core';
import { ReportService } from './../service/report.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';
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
  constructor(
    private reportsService: ReportService
  ) {}

  ngOnInit(): void {

    this.loadReport();

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

        Name: member.name,

        Username: member.username,

        Email: member.email,

        Phone: member.phone_number,

        Roles: member.roles?.join(', '),

        Active: member.is_active ? 'Yes' : 'No',

        Verified: member.is_verified ? 'Yes' : 'No',

        Membership: member.membership_year ?? '-',

        Amount: member.membership_amount
          ? `${member.currency} ${member.membership_amount}`
          : '-',

        Payment: member.payment_status ?? 'Pending',

        PaidAt: member.paid_at
          ? new Date(member.paid_at).toLocaleDateString()
          : '-'

      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);

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

    exportPDF() {

      console.log('Export PDF');

    }
}
