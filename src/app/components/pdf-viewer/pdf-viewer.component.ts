import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements OnInit, OnDestroy {
  @ViewChild('pdfCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() pdfSrc: string = '';
  @Input() pageNumber: number = 1;
  
  private pdfjsLib: any;
  private pdfDoc: any = null;
  private pageRendering = false;
  private pageNumPending: number | null = null;
  public pageNum = 1;
  public pageCount = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      // Dynamically import the PDF.js library
      const pdfjs = await import('pdfjs-dist');
      this.pdfjsLib = pdfjs;

      // Set the worker source after the import
      this.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.54/build/pdf.worker.mjs`;

      this.loadPdf();

      console.log(this.pageNum)
    }
  }




  ngOnDestroy(): void {
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
    }
  }

  async loadPdf(): Promise<void> {
    try {
      this.pdfDoc = await this.pdfjsLib.getDocument(this.pdfSrc).promise;
      this.pageCount = this.pdfDoc.numPages;
      this.pageNum=this.pageNumber
      this.renderPage(this.pageNumber);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  public async renderPage(num: number): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.pageRendering = true;
    const canvas: HTMLCanvasElement = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      this.pageRendering = false;
      return;
    }

    try {
      const page = await this.pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      this.pageNumber=num
      console.log(this.pageNumber)
      this.pageNum=this.pageNumber

      await page.render(renderContext).promise;
      this.pageRendering = false;
      if (this.pageNumPending !== null) {
        this.renderPage(this.pageNumPending);
        this.pageNumPending = null;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      this.pageRendering = false;
    }
  }
  
  nextPage(): void {
    if (this.pageNum >= this.pageCount) {
      return;
    }

    this.pageNum++;
    this.pageNumber=this.pageNum

    this.queueRenderPage(this.pageNum);
  }

  prevPage(): void {
    console.log(this.pageNum)
    if (this.pageNum <= 1) {
      return;
    }
    this.pageNum--;
    this.pageNumber=this.pageNum

    this.queueRenderPage(this.pageNum);
  }

  queueRenderPage(num: number): void {

    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }
}