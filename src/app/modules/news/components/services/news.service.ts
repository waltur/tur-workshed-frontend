import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private baseUrl = `${environment.apiUrl}/news`;


 constructor(private http: HttpClient) {}

   getPosts() {
     return this.http.get<any[]>(`${this.baseUrl}`);
   }

 createPost(data: FormData) {
   return this.http.post(`${this.baseUrl}/`, data); // ajusta ruta si necesario
 }

   likePost(postId: number) {
     return this.http.post(`${this.baseUrl}/${postId}/like`, {});
   }

   addComment(postId: number, comment: string, id_contact: number, parentId?: number) {
     return this.http.post(`${this.baseUrl}/${postId}/comment`, { comment, id_contact,parentId });
   }
}
