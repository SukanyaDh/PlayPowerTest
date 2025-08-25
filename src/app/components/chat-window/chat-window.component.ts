import { Component, ElementRef, Input, Output, SimpleChanges, ViewChild,EventEmitter } from '@angular/core';
import { ApiServiceService } from '../../service/api-service.service';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { MatIconModule } from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HelperService } from '../../service/helper.service';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
  citation: string;
  pageNumber:string;
}

@Component({
  selector: 'app-chat-window',
  imports: [MatIconModule,
    MatChipsModule,
    MarkdownModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})

export class ChatWindowComponent {

  files: File[] = [];
  pdfUrl: string | null = null; // Property to hold the safe URL for the PDF
  query:any;
  isResponded: Boolean = false;
  messages: Message[] = [];
  isLoading = false;
  uploadProgress: number = 0; // Property to hold the progress percentage
  isUploading: boolean = false;
  markdownText: string = '';
  objectUrl: string | null = null;
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  iframeKey = 0;
  @ViewChild(PdfViewerComponent) pdfViewer!: PdfViewerComponent;
  @Input() pdfSrc!: string | null;
  @Output() pageNumberChange = new EventEmitter<number>();

  @Output() clear = new EventEmitter<boolean>();
  constructor(
      private apiService: ApiServiceService,
      private helperService: HelperService
    ) 
      {}

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['pdfUrl']) {
        console.log('PDF URL changed:', this.pdfUrl);
        // Add any logic that needs to run when pdfUrl changes
      }
    }
  //Scroll to botto of the chat window
  scrollToBottom(): void {
    try {
      let timer = setTimeout(() => {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        clearTimeout(timer)
      }, 100)
    } catch (err) { }
  }


      //Send chat to the server
  sendchat(){
    console.log(this.query)

    this.messages.push({
      content: this.query,
      isUser: true,
      timestamp: new Date(),
      citation:'',
      pageNumber:''
    });
    this.scrollToBottom();
    const queryData = {
      query: this.query
    };
    this.isLoading = true;
    this.query='';
  
  this.apiService.chat(queryData).subscribe((response) => {
    console.log('File uploaded successfully:', response);
    this.markdownText= response.answer || 'No response from server';
    const citation=response.citations[0]['content_preview'];
    this.messages.push({
      content: response.answer || 'No response from server', // Adjust based on your API response structure
      isUser: false,
      timestamp: new Date(),
      citation: citation,
      pageNumber: response.citations[0]['page_number']
    });
    this.isLoading = false;

    this.isResponded = true;
    this.scrollToBottom();
  });
  this.scrollToBottom()

  }

  //Clear chat
  clearChat(){
    this.messages=[];
    this.isResponded=false;
    this.query='';
    this.markdownText='';
    this.isLoading=false;
    this.isUploading=false;
    this.uploadProgress=0;
    this.files=[];
    this.pdfUrl=null;
    this.objectUrl=null;
    this.iframeKey=0;
    this.scrollToBottom();
    this.clear.emit(true);
    this.helperService.changeData(1);

  }

  //Go to specific page of the PDF
  goToPage(pageNumber: any) {
    console.log(pageNumber,'page number')
    this.helperService.changeData(pageNumber);
  }

    //Get PDF url from child component
    getPdfUrl(pdfUrl: string) {
      this.pdfUrl = pdfUrl;
    }
  
}
