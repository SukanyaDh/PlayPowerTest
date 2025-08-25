import { CommonModule } from '@angular/common';
import { Component, ElementRef, SimpleChanges, ViewChild, inject } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';

import { ApiServiceService } from './service/api-service.service';
import {MatButtonModule} from '@angular/material/button';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ChatWindowComponent } from "./components/chat-window/chat-window.component";
import { HelperService } from './service/helper.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatGridListModule,
    MatButtonModule,
    PdfViewerComponent,
    FileUploadComponent,
    ChatWindowComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent  {
  title = 'Assessment';
  pdfUrl: string | null = null; // Property to hold the safe URL for the PDF
  isUploading = false;
  pageNumber!: number;
    @ViewChild(PdfViewerComponent) pdfViewer!: PdfViewerComponent;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private helperService: HelperService
  ) 
    {}

    ngOnInit(): void {
      console.log('AppComponent: Subscribing to page number changes');
      this.subscription = this.helperService.currentData.subscribe({
        next: (pageNumber) => {
          console.log('AppComponent: Received new page number:', pageNumber);
          this.pageNumber = pageNumber;

          if (this.pdfUrl && this.pdfViewer && typeof this.pdfViewer.renderPage === 'function') {
            this.pdfViewer.renderPage(pageNumber);
          }
          // Trigger change detection if needed
          // this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('AppComponent: Error in page number subscription:', error);
        }
      });
    }
  


  //Get PDF url from child component
  getPdfUrl(pdfUrl: string) {
    this.pdfUrl = pdfUrl;
    console.log(this.pdfUrl,'pdf');
  }

  clearChat(){
    this.pdfUrl=null;
    this.isUploading=false;
    this.pageNumber=0;
    this.pdfViewer.loadPdf();
    
    //this.pdfViewer.loadPdf();
  }

}
