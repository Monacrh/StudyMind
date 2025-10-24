// services/rewriterService.ts

export interface RewriterOptions {
  tone?: 'as-is' | 'more-formal' | 'more-casual';
  format?: 'as-is' | 'markdown' | 'plain-text';
  length?: 'as-is' | 'shorter' | 'longer';
  sharedContext?: string;
}

export interface RewriterResult {
  success: boolean;
  result?: string;
  error?: string;
}

// Type definitions for Chrome Rewriter API
interface RewriterCreateOptions {
  tone?: 'as-is' | 'more-formal' | 'more-casual';
  format?: 'as-is' | 'markdown' | 'plain-text';
  length?: 'as-is' | 'shorter' | 'longer';
  sharedContext?: string;
  signal?: AbortSignal;
  monitor?: (monitor: DownloadProgressMonitor) => void;
}

interface DownloadProgressMonitor {
  addEventListener(event: 'downloadprogress', callback: (event: DownloadProgressEvent) => void): void;
}

interface DownloadProgressEvent {
  loaded: number;
}

interface RewriterInstance {
  rewrite(text: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  rewriteStreaming(text: string, options?: { context?: string; signal?: AbortSignal }): AsyncIterable<string>;
  destroy?(): void;
}

type AvailabilityStatus = 'no' | 'available' | 'downloadable' | 'unavailable';

// Extend Window interface to include Rewriter
declare global {
  interface Window {
    Rewriter?: {
      availability(): Promise<AvailabilityStatus>;
      create(options?: RewriterCreateOptions): Promise<RewriterInstance>;
    };
  }
}

class RewriterService {
  private static instance: RewriterService;
  private rewriter: RewriterInstance | null = null;
  private isModelDownloading = false;

  static getInstance(): RewriterService {
    if (!RewriterService.instance) {
      RewriterService.instance = new RewriterService();
    }
    return RewriterService.instance;
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Rewriter' in window && typeof window.Rewriter?.create === 'function';
  }

  async checkAvailability(): Promise<string> {
    if (!this.isSupported()) {
      return 'unavailable';
    }

    try {
      const availability = await window.Rewriter!.availability();
      return availability;
    } catch (error) {
      console.error('Error checking rewriter availability:', error);
      return 'unavailable';
    }
  }

  async createRewriter(
    options: RewriterOptions, 
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Rewriter API not supported in this browser');
    }

    if (!navigator.userActivation?.isActive) {
      throw new Error('User activation required. Please click a button to trigger rewriter.');
    }

    if (this.rewriter) {
      return true;
    }

    try {
      const availability = await this.checkAvailability();
      
      if (availability === 'unavailable') {
        throw new Error('Rewriter API is not available on this device');
      }

      if (availability === 'downloadable' && !this.isModelDownloading) {
        this.isModelDownloading = true;
      }

      const rewriterOptions: RewriterCreateOptions = {
        tone: options.tone || 'as-is',
        format: options.format || 'as-is',
        length: options.length || 'as-is',
        sharedContext: options.sharedContext || 'Improve writing quality while maintaining the original meaning.',
        signal,
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

      this.rewriter = await window.Rewriter!.create(rewriterOptions);
      this.isModelDownloading = false;
      
      return true;
    } catch (error) {
      console.error('Error creating rewriter:', error);
      this.isModelDownloading = false;
      throw error;
    }
  }

  async rewriteText(
    text: string,
    context?: string,
    options?: RewriterOptions,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<RewriterResult> {
    try {
      if (!text || text.trim().length < 3) {
        throw new Error('Text too short for rewriting (minimum 3 characters)');
      }

      if (!this.rewriter) {
        const rewriterOptions = options || {
          tone: 'as-is',
          format: 'as-is',
          length: 'as-is'
        };
        await this.createRewriter(rewriterOptions, onProgress, signal);
      }

      if (!this.rewriter) {
        throw new Error('Failed to create rewriter');
      }

      const contextText = context || 'Improve the clarity, coherence, and overall quality of this text.';
      const result = await this.rewriter.rewrite(text, { context: contextText, signal });

      return { success: true, result };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Rewriting was cancelled' };
      }
      
      console.error('Error rewriting text:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async* rewriteTextStreaming(
    text: string,
    context?: string,
    options?: RewriterOptions,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    try {
      if (!text || text.trim().length < 3) {
        throw new Error('Text too short for rewriting (minimum 3 characters)');
      }

      if (!this.rewriter) {
        const rewriterOptions = options || {
          tone: 'as-is',
          format: 'as-is',
          length: 'as-is'
        };
        await this.createRewriter(rewriterOptions, onProgress, signal);
      }

      if (!this.rewriter) {
        throw new Error('Failed to create rewriter');
      }

      const contextText = context || 'Improve the clarity, coherence, and overall quality of this text.';
      const stream = this.rewriter.rewriteStreaming(text, { context: contextText, signal });

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Rewriting was cancelled');
      }
      console.error('Error streaming rewrite:', error);
      throw error;
    }
  }

  destroy(): void {
    if (this.rewriter) {
      try {
        this.rewriter.destroy?.();
      } catch (error) {
        console.error('Error destroying rewriter:', error);
      }
      this.rewriter = null;
    }
    this.isModelDownloading = false;
  }

  getSystemRequirements(): string[] {
    return [
      'Chrome 137+ with Rewriter API support',
      'Windows 10/11, macOS 13+, Linux, or ChromeOS',
      'At least 22 GB free storage space',
      'GPU with more than 4 GB VRAM',
      'Origin trial token or enabled flag'
    ];
  }
}

export default RewriterService;