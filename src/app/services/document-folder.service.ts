import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs';

export interface DocumentFolder {

  id_folder: number;

  name: string;

  description?: string | null;

  parent_id?: number | null;

  is_active: boolean;

  created_at?: string;

  updated_at?: string;

}

@Injectable({
  providedIn: 'root'
})
export class DocumentFolderService {

 // private apiUrl =
 //   'http://localhost:3000/api/document-folders';
    private apiUrl = `${environment.apiUrl}/document-folders`;

  constructor(
    private http: HttpClient
  ) {}

  // =====================================================
  // GET ALL
  // =====================================================

  getAllFolders(): Observable<{
    success: boolean;
    folders: DocumentFolder[];
  }> {

    return this.http.get<{
      success: boolean;
      folders: DocumentFolder[];
    }>(
      this.apiUrl
    );

  }


  // =====================================================
  // CREATE
  // =====================================================

  createFolder(
    data: {
      name: string;
      description?: string;
      parent_id?: number | null;
    }
  ): Observable<any> {

    return this.http.post(
      this.apiUrl,
      data
    );

  }


  // =====================================================
  // UPDATE
  // =====================================================

  updateFolder(
    id: number,
    data: {
      name: string;
      description?: string;
      parent_id?: number | null;
    }
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      data
    );

  }


  // =====================================================
  // STATUS
  // =====================================================

  updateFolderStatus(
    id: number,
    is_active: boolean
  ): Observable<any> {

    return this.http.patch(
      `${this.apiUrl}/${id}/status`,
      {
        is_active
      }
    );

  }


  // =====================================================
  // DELETE
  // =====================================================

  deleteFolder(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );

  }

}
