import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  message: string = '';
  status: 'success' | 'error' | 'loading' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
      const token = this.route.snapshot.paramMap.get('token');
      if (token) {
        this.authService.verifyEmailToken(token).subscribe({
          next: (res) => {
            this.status = 'success';
            this.message = res.message;
          },
          error: (err) => {
            this.status = 'error';
            this.message = err.error.message || 'Verification failed. Please try again later.';
          }
        });
      } else {
        this.status = 'error';
        this.message = 'No token provided.';
      }
  }
}
