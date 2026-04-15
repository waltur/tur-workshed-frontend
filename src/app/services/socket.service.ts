import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;

  constructor() {
   this.socket = io(environment.socketUrl);
  }

listen(eventName: string): Observable<any> {
  return new Observable<any>((observer) => {
    this.socket.on(eventName, (data: any) => {
      observer.next(data);
    });

    return () => {
      this.socket.off(eventName);
    };
  });
}
}
