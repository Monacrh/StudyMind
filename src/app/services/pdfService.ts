// services/pdfService.ts

export interface PDFExtractionResult {
  success: boolean;
  text?: string;
  numPages?: number;
  error?: string;
  isScanned?: boolean;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
}

// Type definitions for PDF.js
interface TextItem {
  str: string;
  dir: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
}

interface TextContent {
  items: (TextItem | { str?: string })[];
  styles: Record<string, unknown>;
}

interface PDFInfo {
  Title?: string;
  Author?: string;
  Subject?: string;
  Keywords?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
}

interface PDFMetadataResult {
  info: PDFInfo;
  metadata: unknown;
}

class PDFService {
  private static instance: PDFService;
  private pdfjsLib: typeof import('pdfjs-dist') | null = null;
  private isInitialized = false;

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  /**
   * Initialize PDF.js (client-side only)
   */
  private async initPdfJs() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      // Dynamic import - only runs in browser
      const pdfjs = await import('pdfjs-dist');
      this.pdfjsLib = pdfjs;

      // Set worker path
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      
      this.isInitialized = true;
      console.log('PDF.js initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PDF.js:', error);
      throw new Error('PDF.js not available');
    }
  }

  /**
   * Extract text from PDF file
   * @param file - PDF File object
   * @param onProgress - Progress callback (0-100)
   * @returns Extracted text and metadata
   */
  async extractText(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<PDFExtractionResult> {
    try {
      // Initialize PDF.js if needed
      await this.initPdfJs();
      
      if (!this.pdfjsLib) {
        throw new Error('PDF.js not initialized');
      }

      // Validate file type
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('File is not a PDF');
      }

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const loadingTask = this.pdfjsLib.getDocument({ data: arrayBuffer });
      
      // Report initial progress
      if (onProgress) onProgress(10);

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      
      console.log(`PDF loaded: ${numPages} pages`);

      let fullText = '';
      let totalCharacters = 0;

      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent() as unknown as TextContent;
        
        // Combine text items with proper typing
        const pageText = textContent.items
          .map((item) => {
            return (item as TextItem).str || '';
          })
          .join(' ');
        
        fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
        totalCharacters += pageText.length;

        // Update progress
        if (onProgress) {
          const progress = 10 + Math.round((pageNum / numPages) * 85);
          onProgress(progress);
        }
      }

      // Check if PDF might be scanned (very little text)
      const avgCharsPerPage = totalCharacters / numPages;
      const isScanned = avgCharsPerPage < 50; // Less than 50 chars per page = likely scanned

      if (onProgress) onProgress(100);

      if (totalCharacters === 0) {
        return {
          success: false,
          error: 'No text found in PDF. This might be a scanned document that requires OCR.',
          numPages,
          isScanned: true
        };
      }

      console.log(`Extracted ${totalCharacters} characters from ${numPages} pages`);

      return {
        success: true,
        text: fullText.trim(),
        numPages,
        isScanned
      };

    } catch (error) {
      console.error('PDF extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during PDF extraction'
      };
    }
  }

  /**
   * Extract metadata from PDF
   */
  async extractMetadata(file: File): Promise<PDFMetadata | null> {
    try {
      await this.initPdfJs();
      
      if (!this.pdfjsLib) {
        throw new Error('PDF.js not initialized');
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = this.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const metadata = await pdf.getMetadata() as unknown as PDFMetadataResult;
      const info = metadata.info;
      
      return {
        title: info.Title,
        author: info.Author,
        subject: info.Subject,
        keywords: info.Keywords,
        creator: info.Creator,
        producer: info.Producer,
        creationDate: info.CreationDate,
        modificationDate: info.ModDate
      };
    } catch (error) {
      console.error('Error extracting PDF metadata:', error);
      return null;
    }
  }

  /**
   * Get PDF page count
   */
  async getPageCount(file: File): Promise<number> {
    try {
      await this.initPdfJs();
      
      if (!this.pdfjsLib) {
        throw new Error('PDF.js not initialized');
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = this.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      return pdf.numPages;
    } catch (error) {
      console.error('Error getting page count:', error);
      return 0;
    }
  }

  /**
   * Extract text from specific page range
   */
  async extractTextFromPages(
    file: File,
    startPage: number,
    endPage: number,
    onProgress?: (progress: number) => void
  ): Promise<PDFExtractionResult> {
    try {
      await this.initPdfJs();
      
      if (!this.pdfjsLib) {
        throw new Error('PDF.js not initialized');
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = this.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const numPages = pdf.numPages;
      
      // Validate page range
      if (startPage < 1 || endPage > numPages || startPage > endPage) {
        throw new Error(`Invalid page range. PDF has ${numPages} pages.`);
      }

      let fullText = '';
      const pageCount = endPage - startPage + 1;

      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent() as unknown as TextContent;
        
        const pageText = textContent.items
          .map((item) => {
            return (item as TextItem).str || '';
          })
          .join(' ');
        
        fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;

        if (onProgress) {
          const progress = Math.round(((pageNum - startPage + 1) / pageCount) * 100);
          onProgress(progress);
        }
      }

      return {
        success: true,
        text: fullText.trim(),
        numPages: pageCount
      };

    } catch (error) {
      console.error('PDF page extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check if PDF is text-based or scanned
   */
  async isTextBased(file: File): Promise<boolean> {
    try {
      const result = await this.extractText(file);
      
      if (!result.success || !result.text) {
        return false;
      }

      // If there's reasonable amount of text, it's text-based
      const textLength = result.text.length;
      const numPages = result.numPages || 1;
      const avgCharsPerPage = textLength / numPages;

      return avgCharsPerPage > 100; // More than 100 chars per page = text-based
    } catch (error) {
      console.error('Error checking PDF type:', error);
      return false;
    }
  }
}

export default PDFService;