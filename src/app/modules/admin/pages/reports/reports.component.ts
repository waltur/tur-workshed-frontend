import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReportService } from './service/report.service';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {

summary: any = {
  total_members: 0,
  active_members: 0,
  inactive_members: 0,
  verified_members: 0,
  volunteers: 0,
  membership_revenue: 0
};
  constructor(private router: Router, private reportService: ReportService) {}

ngOnInit(): void {

  this.reportService.getMembersReport().subscribe({

    next: (response) => {

      this.summary = response.summary;

      console.log(this.summary);

    },

    error: (err) => {

      console.error(err);

    }

  });

}
  navigateTo(option: string): void {
    this.router.navigate(['/admin', option]);
  }

}
