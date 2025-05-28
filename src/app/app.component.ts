import { Component, OnInit  } from '@angular/core';
import { AuthService } from './modules/auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
   constructor(private authService: AuthService) {}
  title = 'workshed-web';

    ngOnInit(): void {
      this.authService.updateUserInfo(); // ✅ Actualiza el estado al iniciar
    }
}
