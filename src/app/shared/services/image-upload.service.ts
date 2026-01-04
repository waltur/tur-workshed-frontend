import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

  //private apiUrl = 'http://localhost:3000/api/upload';
  private apiUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File, folder: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
     //   const base64 = (reader.result as string).split(',')[1];
        const base64 = reader.result as string;

        this.http.post<any>(`${this.apiUrl}/profile-photo`, {
          imageBase64: base64,
          fileName: file.name,
          folder
        }).subscribe({
          next: res => resolve(res.imageUrl),
          error: err => {
            console.error(err);
            resolve(null);
          }
        });
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
}
