// services/writerService.ts

export interface WriterOptions {
  tone: 'formal' | 'neutral' | 'casual';
  format: 'markdown' | 'plain-text';
  length: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

export interface WriterResult {
  success: boolean;
  result?: string;
  error?: string;
}

// Type definitions for Chrome Writer API (UPDATED)
interface WriterCreateOptions {
  tone?: 'formal' | 'neutral' | 'casual';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
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

interface WriterInstance {
  write(prompt: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  writeStreaming(prompt: string, options?: { context?: string; signal?: AbortSignal }): AsyncIterable<string>;
  destroy?(): void;
}

type AvailabilityStatus = 'no' | 'available' | 'downloadable' | 'unavailable'; // Adjusted based on Proofreader/Summarizer types

// Extend Window interface to include Writer (UPDATED)
declare global {
  interface Window {
    Writer?: {
      availability(): Promise<AvailabilityStatus>;
      create(options?: WriterCreateOptions): Promise<WriterInstance>;
    };
  }
}

class WriterService {
  private static instance: WriterService;
  private writer: WriterInstance | null = null;
  private isModelDownloading = false;

  static getInstance(): WriterService {
    if (!WriterService.instance) {
      WriterService.instance = new WriterService();
    }
    return WriterService.instance;
  }

  // Check if Writer API is supported (UPDATED)
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Writer' in window && typeof window.Writer?.create === 'function';
  }

  // Check model availability (UPDATED)
  async checkAvailability(): Promise<string> {
    if (!this.isSupported()) {
      return 'unavailable';
    }

    try {
      const availability = await window.Writer!.availability();
      return availability;
    } catch (error) {
      console.error('Error checking writer availability:', error);
      return 'unavailable';
    }
  }

  // Create writer with options (UPDATED)
  async createWriter(
    options: WriterOptions, 
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Writer API not supported in this browser');
    }

    if (!navigator.userActivation?.isActive) {
      throw new Error('User activation required. Please click a button to trigger writer.');
    }

    if (this.writer) {
      return true;
    }

    try {
      const availability = await this.checkAvailability();
      
      console.log('Writer availability:', availability);
      
      if (availability === 'unavailable') {
        throw new Error('Writer API is not available on this device');
      }

      if (availability === 'downloadable' && !this.isModelDownloading) {
        this.isModelDownloading = true;
        console.log('Model download will start...');
      }

      const writerOptions: WriterCreateOptions = {
        tone: options.tone || 'neutral',
        format: options.format || 'markdown',
        length: options.length || 'medium',
        sharedContext: options.sharedContext || 'Generate educational questions for learning and assessment purposes.',
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

      console.log('Creating writer with options:', writerOptions);
      
      // Call window.Writer.create() instead of window.ai.writer.create()
      this.writer = await window.Writer!.create(writerOptions);
      
      console.log('Writer created successfully');
      this.isModelDownloading = false;
      
      return true;
    } catch (error) {
      console.error('Error creating writer:', error);
      this.isModelDownloading = false;
      throw error;
    }
  }

  // Generate questions (non-streaming)
  async generateQuestions(
    topic: string,
    numberOfQuestions: number = 5,
    questionType: string = 'mixed',
    context?: string,
    options?: WriterOptions,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<WriterResult> {
    try {
      if (!this.writer) {
        const writerOptions = options || {
          tone: 'formal',
          format: 'markdown',
          length: 'medium',
          sharedContext: 'Generate educational questions for learning and assessment purposes.'
        };
        await this.createWriter(writerOptions, onProgress, signal);
      }

      if (!this.writer) {
        throw new Error('Failed to create writer');
      }

      const questionTypeText = this.getQuestionTypeText(questionType);
      const prompt = `Create ${numberOfQuestions} ${questionTypeText} about: ${topic}`;
      
      const contextText = context || 'These questions are for educational purposes to test understanding and knowledge.';

      console.log('Generating questions with prompt:', prompt);

      const result = await this.writer.write(prompt, {
        context: contextText,
        signal
      });

      return {
        success: true,
        result
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Question generation was cancelled'
        };
      }
      
      console.error('Error generating questions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Generate questions (streaming)
  async* generateQuestionsStreaming(
    topic: string,
    numberOfQuestions: number = 5,
    questionType: string = 'mixed',
    context?: string,
    options?: WriterOptions,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    try {
      if (!this.writer) {
        const writerOptions = options || {
          tone: 'formal',
          format: 'markdown',
          length: 'medium',
          sharedContext: 'Generate educational questions for learning and assessment purposes.'
        };
        await this.createWriter(writerOptions, onProgress, signal);
      }

      if (!this.writer) {
        throw new Error('Failed to create writer');
      }

      const questionTypeText = this.getQuestionTypeText(questionType);
      const prompt = `Create ${numberOfQuestions} ${questionTypeText} about: ${topic}`;
      
      const contextText = context || 'These questions are for educational purposes to test understanding and knowledge.';

      console.log('Streaming questions with prompt:', prompt);

      const stream = this.writer.writeStreaming(prompt, {
        context: contextText,
        signal
      });

      for await (const chunk of stream) {
        yield chunk;
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Question generation was cancelled');
      }
      console.error('Error streaming questions:', error);
      throw error;
    }
  }

  private getQuestionTypeText(questionType: string): string {
    const questionTypes: Record<string, string> = {
      'multiple-choice': 'multiple choice questions with 4 options each',
      'essay': 'essay questions that require detailed answers',
      'short-answer': 'short answer questions',
      'true-false': 'true/false questions',
      'mixed': 'a mix of different question types (multiple choice, essay, short answer, and true/false)'
    };
    return questionTypes[questionType] || questionTypes['mixed'];
  }

  destroy(): void {
    if (this.writer) {
      try {
        this.writer.destroy?.();
      } catch (error) {
        console.error('Error destroying writer:', error);
      }
      this.writer = null;
    }
    this.isModelDownloading = false;
  }

  getSystemRequirements(): string[] {
    return [
      'Chrome 137+ with Writer API support',
      'Windows 10/11, macOS 13+, Linux, or ChromeOS',
      'At least 22 GB free storage space',
      'GPU with more than 4 GB VRAM',
      'Unlimited or unmetered internet connection',
      'Origin trial token or enabled flag (chrome://flags/#writer-api-for-gemini-nano)'
    ];
  }
}

export default WriterService;