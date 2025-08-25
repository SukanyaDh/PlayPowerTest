import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  constructor(private http:HttpClient) { }
  baseUrl = 'https://pdf-notebook.onrender.com/api';

  uploadFile(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/upload`, formData, {
      reportProgress: true,  // For tracking upload progress
      observe: 'response'    // To get full response including headers
    });
  }

  chat(formData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/chat`, formData,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }
}
