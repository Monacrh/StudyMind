// services/summarizerService.ts

export interface SummarizerOptions {
  type: 'key-points' | 'tldr' | 'teaser' | 'headline';
  format: 'markdown' | 'plain-text';
  length: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

export interface SummarizerResult {
  success: boolean;
  result?: string;
  error?: string;
}

// Type definitions for Chrome Summarizer API
interface SummarizerCreateOptions {
  sharedContext?: string;
  type: 'key-points' | 'tldr' | 'teaser' | 'headline';
  format: 'markdown' | 'plain-text';
  length: 'short' | 'medium' | 'long';
  monitor?: (monitor: DownloadProgressMonitor) => void;
}

interface DownloadProgressMonitor {
  addEventListener(event: 'downloadprogress', callback: (event: DownloadProgressEvent) => void): void;
}

interface DownloadProgressEvent {
  loaded: number;
}

interface SummarizerInstance {
  summarize(text: string, options?: { context?: string }): Promise<string>;
  summarizeStreaming(text: string, options?: { context?: string }): AsyncIterable<string>;
  destroy?(): void;
}

type AvailabilityStatus = 'no' | 'available' | 'downloadable' | 'unavailable';

// Extend Window interface to include Summarizer
declare global {
  interface Window {
    Summarizer?: {
      availability(): Promise<AvailabilityStatus>;
      create(options?: SummarizerCreateOptions): Promise<SummarizerInstance>;
    };
  }
}

class SummarizerService {
  private static instance: SummarizerService;
  private summarizer: SummarizerInstance | null = null;
  private isModelDownloading = false;

  static getInstance(): SummarizerService {
    if (!SummarizerService.instance) {
      SummarizerService.instance = new SummarizerService();
    }
    return SummarizerService.instance;
  }

  // Check if Summarizer API is supported
  isSupported(): boolean {
    return 'Summarizer' in window;
  }

  // Check model availability
  async checkAvailability(): Promise<string> {
    if (!this.isSupported()) {
      return 'unavailable';
    }

    try {
      const availability = await window.Summarizer!.availability();
      return availability;
    } catch (error) {
      console.error('Error checking availability:', error);
      return 'unavailable';
    }
  }

  // Create summarizer with options
  async createSummarizer(options: SummarizerOptions, onProgress?: (progress: number) => void): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Summarizer API not supported in this browser');
    }

    // Check user activation
    if (!navigator.userActivation?.isActive) {
      throw new Error('User activation required. Please click a button to trigger summarization.');
    }

    try {
      const availability = await this.checkAvailability();
      
      if (availability === 'unavailable') {
        throw new Error('Summarizer API is not available on this device');
      }

      if (availability === 'downloadable' && !this.isModelDownloading) {
        this.isModelDownloading = true;
      }

      const summarizerOptions: SummarizerCreateOptions = {
        sharedContext: options.sharedContext || '',
        type: options.type,
        format: options.format,
        length: options.length,
        monitor: onProgress ? (monitor: DownloadProgressMonitor) => {
          monitor.addEventListener('downloadprogress', (event: DownloadProgressEvent) => {
            const progress = Math.round(event.loaded * 100);
            onProgress(progress);
            if (progress >= 100) {
              this.isModelDownloading = false;
            }
          });
        } : undefined
      };

      this.summarizer = await window.Summarizer!.create(summarizerOptions);
      return true;
    } catch (error) {
      console.error('Error creating summarizer:', error);
      this.isModelDownloading = false;
      throw error;
    }
  }

  // Batch summarization
  async summarize(text: string, context?: string): Promise<SummarizerResult> {
    if (!this.summarizer) {
      return {
        success: false,
        error: 'Summarizer not initialized. Please create a summarizer first.'
      };
    }

    try {
      const result = await this.summarizer.summarize(text, context ? { context } : undefined);
      return {
        success: true,
        result
      };
    } catch (error) {
      console.error('Error during summarization:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Streaming summarization
  async* summarizeStreaming(text: string, context?: string): AsyncGenerator<string, void, unknown> {
    if (!this.summarizer) {
      throw new Error('Summarizer not initialized. Please create a summarizer first.');
    }

    try {
      const stream = this.summarizer.summarizeStreaming(text, context ? { context } : undefined);
      
      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      console.error('Error during streaming summarization:', error);
      throw error;
    }
  }

  // Clean up resources
  destroy(): void {
    if (this.summarizer) {
      try {
        this.summarizer.destroy?.();
      } catch (error) {
        console.error('Error destroying summarizer:', error);
      }
      this.summarizer = null;
    }
    this.isModelDownloading = false;
  }

  // Get system requirements info
  getSystemRequirements(): string[] {
    return [
      'Chrome 138+ with Gemini Nano support',
      'Windows 10/11, macOS 13+, Linux, or ChromeOS',
      'At least 22 GB free storage space',
      'GPU with more than 4 GB VRAM',
      'Unlimited or unmetered internet connection'
    ];
  }
}

export default SummarizerService;