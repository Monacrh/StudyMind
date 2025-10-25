// services/promptService.ts

export interface PromptOptions {
  temperature?: number;
  topK?: number;
  systemPrompt?: string;
}

export interface PromptResult {
  success: boolean;
  result?: string;
  error?: string;
}

export type ExplainStyle = 'simple' | 'eli5' | 'analogy' | 'step-by-step' | 'examples';

// Type definitions for Chrome Prompt API
interface AICreateOptions {
  temperature?: number;
  topK?: number;
  systemPrompt?: string;
  signal?: AbortSignal;
  monitor?: (monitor: DownloadProgressMonitor) => void;
}

interface DownloadProgressMonitor {
  addEventListener(event: 'downloadprogress', callback: (event: DownloadProgressEvent) => void): void;
}

interface DownloadProgressEvent {
  loaded: number;
  total: number;
}

interface AISession {
  prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
  promptStreaming(input: string, options?: { signal?: AbortSignal }): AsyncIterable<string>;
  destroy(): void;
  clone?(): Promise<AISession>;
}

type AvailabilityStatus = 'no' | 'readily' | 'after-download';

// Extend Window interface to include LanguageModel
declare global {
  interface Window {
    LanguageModel?: {
      availability(): Promise<AvailabilityStatus>;
      create(options?: AICreateOptions): Promise<AISession>;
    };
  }
}

class PromptService {
  private static instance: PromptService;
  private session: AISession | null = null;
  private isModelDownloading = false;

  static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  // Check if Prompt API is supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'LanguageModel' in window && !!window.LanguageModel;
  }

  // Check model availability
  async checkAvailability(): Promise<string> {
    if (!this.isSupported()) {
      return 'unavailable';
    }

    try {
      const availability = await window.LanguageModel!.availability();
      return availability;
    } catch (error) {
      console.error('Error checking prompt API availability:', error);
      return 'unavailable';
    }
  }

  // Get API capabilities (no longer exists in Prompt API, kept for compatibility)
  async getCapabilities() {
    if (!this.isSupported()) {
      return null;
    }

    try {
      const availability = await window.LanguageModel!.availability();
      return {
        available: availability,
        // Default values based on Chrome documentation
        defaultTemperature: 0.8,
        defaultTopK: 3,
        maxTopK: 8
      };
    } catch (error) {
      console.error('Error getting capabilities:', error);
      return null;
    }
  }

  // Create AI session
  async createSession(
    options?: PromptOptions,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Prompt API not supported in this browser');
    }

    // Reuse existing session if available
    if (this.session) {
      console.log('Reusing existing prompt session');
      return true;
    }

    try {
      const availability = await this.checkAvailability();
      
      console.log('Prompt API availability:', availability);
      
      if (availability === 'no') {
        throw new Error('Prompt API is not available on this device');
      }

      if (availability === 'after-download' && !this.isModelDownloading) {
        this.isModelDownloading = true;
        console.log('Model download will start...');
      }

      const sessionOptions: AICreateOptions = {
        temperature: options?.temperature ?? 0.8,
        topK: options?.topK ?? 3,
        systemPrompt: options?.systemPrompt || 'You are a helpful AI assistant.',
        signal,
        monitor: onProgress ? (monitor: DownloadProgressMonitor) => {
          monitor.addEventListener('downloadprogress', (event: DownloadProgressEvent) => {
            const progress = event.total > 0 ? Math.round((event.loaded / event.total) * 100) : 0;
            onProgress(progress);
            if (progress >= 100) {
              this.isModelDownloading = false;
            }
          });
        } : undefined
      };

      console.log('Creating prompt session with options:', sessionOptions);
      
      this.session = await window.LanguageModel!.create(sessionOptions);
      
      console.log('Prompt session created successfully');
      this.isModelDownloading = false;
      
      return true;
    } catch (error) {
      console.error('Error creating prompt session:', error);
      this.isModelDownloading = false;
      throw error;
    }
  }

  // Generate explanation with different styles
  async explain(
    text: string,
    style: ExplainStyle = 'simple',
    context?: string,
    options?: PromptOptions,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<PromptResult> {
    try {
      if (!text || text.trim().length < 3) {
        throw new Error('Text too short for explanation (minimum 3 characters)');
      }

      // Create session if not exists
      if (!this.session) {
        const systemPrompt = this.getSystemPromptForStyle(style);
        await this.createSession(
          { ...options, systemPrompt },
          onProgress,
          signal
        );
      }

      if (!this.session) {
        throw new Error('Failed to create prompt session');
      }

      const prompt = this.buildPrompt(text, style, context);
      console.log('Sending prompt:', prompt);

      const result = await this.session.prompt(prompt, { signal });

      return {
        success: true,
        result
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Explanation was cancelled'
        };
      }
      
      console.error('Error generating explanation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Generate explanation with streaming
  async* explainStreaming(
    text: string,
    style: ExplainStyle = 'simple',
    context?: string,
    options?: PromptOptions,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    try {
      if (!text || text.trim().length < 3) {
        throw new Error('Text too short for explanation (minimum 3 characters)');
      }

      // Create session if not exists
      if (!this.session) {
        const systemPrompt = this.getSystemPromptForStyle(style);
        await this.createSession(
          { ...options, systemPrompt },
          onProgress,
          signal
        );
      }

      if (!this.session) {
        throw new Error('Failed to create prompt session');
      }

      const prompt = this.buildPrompt(text, style, context);
      console.log('Streaming prompt:', prompt);

      const stream = this.session.promptStreaming(prompt, { signal });

      for await (const chunk of stream) {
        yield chunk;
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Explanation was cancelled');
      }
      console.error('Error streaming explanation:', error);
      throw error;
    }
  }

  // Get system prompt based on explanation style
  private getSystemPromptForStyle(style: ExplainStyle): string {
    const prompts: Record<ExplainStyle, string> = {
      'simple': 'You are a helpful teacher who explains complex topics using simple, everyday language. Avoid jargon and technical terms.',
      
      'eli5': 'You are a patient teacher explaining things to a 5-year-old child. Use very simple words, short sentences, and relatable examples from a child\'s daily life.',
      
      'analogy': 'You are a creative teacher who explains concepts through relatable analogies from everyday life. Use comparisons to familiar activities like cooking, sports, driving, shopping, or household tasks.',
      
      'step-by-step': 'You are a methodical instructor who breaks down complex topics into clear, numbered steps. Make each step actionable and easy to follow.',
      
      'examples': 'You are an engaging teacher who explains concepts through concrete, real-world examples. Use diverse scenarios that people encounter in their daily lives.'
    };

    return prompts[style];
  }

  // Build prompt based on style
  private buildPrompt(text: string, style: ExplainStyle, context?: string): string {
    const contextText = context ? `Context: ${context}\n\n` : '';
    
    const stylePrompts: Record<ExplainStyle, string> = {
      'simple': `${contextText}Explain the following in simple, easy-to-understand language:\n\n${text}`,
      
      'eli5': `${contextText}Explain the following like I'm 5 years old, using very simple words:\n\n${text}`,
      
      'analogy': `${contextText}Explain the following using an analogy from everyday life (like cooking, sports, shopping, or daily activities):\n\n${text}\n\nStart with: "Think of it like..."`,
      
      'step-by-step': `${contextText}Break down and explain the following step by step:\n\n${text}\n\nNumber each step clearly.`,
      
      'examples': `${contextText}Explain the following with concrete, real-world examples from daily life:\n\n${text}`
    };

    return stylePrompts[style];
  }

  // Clean up resources
  destroy(): void {
    if (this.session) {
      try {
        this.session.destroy();
      } catch (error) {
        console.error('Error destroying prompt session:', error);
      }
      this.session = null;
    }
    this.isModelDownloading = false;
  }

  // Get system requirements
  getSystemRequirements(): string[] {
    return [
      'Chrome 127+ with Prompt API support',
      'Windows 10/11, macOS 13+, Linux, or ChromeOS',
      'At least 22 GB free storage space',
      'GPU with more than 4 GB VRAM',
      'Gemini Nano model (downloads automatically)'
    ];
  }
}

export default PromptService;