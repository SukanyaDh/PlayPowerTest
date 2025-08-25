import { Component, Output,EventEmitter } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { ApiServiceService } from '../../service/api-service.service';
import { HttpEventType } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-file-upload',
  imports: [MatCardModule, CommonModule,MatProgressBarModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {
  isLoading = false;
  uploadProgress: number = 0; // Property to hold the progress percentage
  isUploading: boolean = false;
  files: File[] = [];
  pdfUrl!: string ; // Property to hold the safe URL for the PDF
  objectUrl: string | null = null;

  @Output() pdfUrlChange = new EventEmitter<string>();

  constructor(
    private apiService: ApiServiceService) {}


  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const fileList: FileList | null = event.dataTransfer?.files || null;
    if (fileList && fileList.length > 0) {
      this.handleFile(fileList[0]);
    }
  }

  onFileSelected(event: any): void {
    const fileList: FileList | null = event.target.files || null;
    if (fileList && fileList.length > 0) {
      this.handleFile(fileList[0]);
    }
  }

  private handleFile(file: File): void {
    // 1. Validate file type
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      this.files = []; // Clear any previously selected files
      this.pdfUrl =   '';
      return;
    }
    console.log(file)

    this.uploadFile(file);
    // 2. Set the file for display
    this.files = [file];

    // 3. Create a safe URL for previewing the PDF
     this.objectUrl = URL.createObjectURL(file);
    const urlWithParams = `${this.objectUrl}#toolbar=0&navpanes=0`;

   // this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlWithParams);
    this.pdfUrl=this.objectUrl;

    console.log('PDF file:', file);
  }

  uploadFile(file: File): void {
    console.log('here',file);
    const formData = new FormData();
    formData.append('file', file, file.name); // 'file' is the parameter name expected by the API
    this.isUploading = true;
    this.uploadProgress = 0; 

    this.apiService.uploadFile(formData).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress) {
        // Calculate the percentage
        this.uploadProgress = Math.round(100 * (event.loaded / event.total));
        console.log(`Upload progress: ${this.uploadProgress}%`);
      } else if (event.type === HttpEventType.Response) {
        // Upload is complete, handle the final response
        console.log('File uploaded successfully:', event.body);
        this.pdfUrlChange.emit(this.pdfUrl);

        this.isUploading = false;
        this.uploadProgress = 100; // Set to 100% on completion
      }
    }, (error) => {
      // Handle upload error
      console.error('File upload failed:', error);
      this.isUploading = false;
    });

  }
}
