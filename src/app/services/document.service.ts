import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DocumentModel {
  id_document: number;
  title: string;
  description: string | null;
  document_type: string;
  file_url: string;
  version: string;
  audience: string;
  requires_acceptance: boolean;
  is_active: boolean;
  id_folder: number | null;
  created_at: string;
  updated_at: string;
  folder_name?: string | null;
}
export interface DocumentFolder {
  id_folder: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  is_active?: boolean;
  document_count: number;
  created_at?: string;
  updated_at?: string;
}


@Injectable({
  providedIn: 'root'
})
export class DocumentService {

 // private apiUrl = 'http://localhost:3000/api/documents';
  private apiUrl = `${environment.apiUrl}/documents`;
  private folderApiUrl = `${environment.apiUrl}/document-folders`;

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // MY DOCUMENTS
  // ==========================================

  getMyDocuments(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/my`
    );

  }


  // ==========================================
  // ACCEPT DOCUMENT
  // ==========================================

  acceptDocument(
    idDocument: number
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/${idDocument}/accept`,
      {}
    );

  }

  // ==========================================
  // ADMIN
  // ==========================================

  getAllDocuments(): Observable<DocumentModel[]> {

    return this.http.get<DocumentModel[]>(
      `${this.apiUrl}/admin`
    );

  }

  uploadDocument(formData: FormData): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/admin/upload`,
      formData
    );

  }

  updateDocument(
    id: number,
    data: any
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/admin/${id}`,
      data
    );

  }

  updateDocumentStatus(
    id: number,
    is_active: boolean
  ): Observable<any> {

    return this.http.patch(
      `${this.apiUrl}/admin/${id}/status`,
      {
        is_active
      }
    );

  }

// =====================================================
  // FOLDERS - ADMIN
  // =====================================================

  getAllFolders(): Observable<{
    success: boolean;
    folders: DocumentFolder[];
  }> {
    return this.http.get<{
      success: boolean;
      folders: DocumentFolder[];
    }>(
      this.folderApiUrl
    );
  }

  createFolder(data: {
    name: string;
    description?: string;
    parent_id?: number | null;
  }): Observable<any> {
    return this.http.post(
      this.folderApiUrl,
      data
    );
  }

  updateFolder(
    id: number,
    data: {
      name: string;
      description?: string;
      parent_id?: number | null;
    }
  ): Observable<any> {
    return this.http.put(
      `${this.folderApiUrl}/${id}`,
      data
    );
  }

  updateFolderStatus(
    id: number,
    is_active: boolean
  ): Observable<any> {
    return this.http.patch(
      `${this.folderApiUrl}/${id}/status`,
      {
        is_active
      }
    );
  }

  deleteFolder(
    id: number
  ): Observable<any> {
    return this.http.delete(
      `${this.folderApiUrl}/${id}`
    );
  }


}
