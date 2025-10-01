// services/proofreaderService.ts

export interface ProofreaderOptions {
  expectedInputLanguages: string[];
  correctionExplanationLanguage?: string;
  includeCorrectionTypes?: boolean;
  includeCorrectionExplanations?: boolean;
}

export interface Correction {
  startIndex: number;
  endIndex: number;
  correction: string;
  type?: string;
  explanation?: string;
}

export interface ProofreadResult {
  correctedInput: string;
  corrections: Correction[];
}

export interface ProofreaderServiceResult {
  success: boolean;
  result?: ProofreadResult;
  error?: string;
}

// Type definitions for Chrome Proofreader API
interface ProofreaderCreateOptions {
  expectedInputLanguages: string[];
  correctionExplanationLanguage?: string;
  includeCorrectionTypes?: boolean;
  includeCorrectionExplanations?: boolean;
  monitor?: (monitor: DownloadProgressMonitor) => void;
}

interface DownloadProgressMonitor {
  addEventListener(event: 'downloadprogress', callback: (event: DownloadProgressEvent) => void): void;
}

interface DownloadProgressEvent {
  loaded: number;
}

interface ProofreaderInstance {
  proofread(text: string): Promise<ProofreadResult>;
  ready?: Promise<void>; // Important: wait for model to be ready
  destroy?(): void;
}

type AvailabilityStatus = 'no' | 'available' | 'downloadable' | 'unavailable';

// Extend Window interface to include Proofreader
declare global {
  interface Window {
    Proofreader?: {
      availability(options?: { expectedInputLanguages?: string[] }): Promise<AvailabilityStatus>;
      create(options: ProofreaderCreateOptions): Promise<ProofreaderInstance>;
    };
  }
}

class ProofreaderService {
  private static instance: ProofreaderService;
  private proofreader: ProofreaderInstance | null = null;
  private isModelDownloading = false;

  static getInstance(): ProofreaderService {
    if (!ProofreaderService.instance) {
      ProofreaderService.instance = new ProofreaderService();
    }
    return ProofreaderService.instance;
  }

  // Check if Proofreader API is supported
  isSupported(): boolean {
    return 'Proofreader' in window;
  }

  // Check model availability - Now accepts full options
  async checkAvailability(options?: ProofreaderOptions): Promise<string> {
    if (!this.isSupported()) {
      return 'unavailable';
    }

    try {
      const checkOptions = options ? {
        expectedInputLanguages: options.expectedInputLanguages,
        correctionExplanationLanguage: options.correctionExplanationLanguage,
        includeCorrectionTypes: options.includeCorrectionTypes,
        includeCorrectionExplanations: options.includeCorrectionExplanations
      } : undefined;
      
      console.log('Checking availability with options:', checkOptions);
      const availability = await window.Proofreader!.availability(checkOptions);
      return availability;
    } catch (error) {
      console.error('Error checking proofreader availability:', error);
      return 'unavailable';
    }
  }

  // Create proofreader with options
  async createProofreader(
    options: ProofreaderOptions,
    onProgress?: (progress: number) => void,
    retry: number = 0
  ): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Proofreader API not supported in this browser');
    }

    // Check user activation
    if (!navigator.userActivation?.isActive) {
      throw new Error('User activation required. Please click a button to trigger proofreading.');
    }

    // Return existing proofreader if available and not retrying
    if (this.proofreader && retry === 0) {
      console.log('Reusing existing proofreader instance');
      return true;
    }

    // Destroy old instance if retrying
    if (retry > 0 && this.proofreader) {
      console.log(`Retry attempt ${retry}: Destroying old instance...`);
      try {
        this.proofreader.destroy?.();
      } catch (e) {
        console.warn('Error destroying old instance:', e);
      }
      this.proofreader = null;
    }

    try {
      const availability = await this.checkAvailability(options);
      
      console.log('Proofreader availability check:', availability);
      
      if (availability === 'unavailable') {
        throw new Error('Proofreader API is not available on this device');
      }

      if (availability === 'downloadable' && !this.isModelDownloading) {
        this.isModelDownloading = true;
        console.log('Model download will start...');
      }

      console.log('Creating proofreader with options:', options);

      const proofreaderOptions: ProofreaderCreateOptions = {
        expectedInputLanguages: options.expectedInputLanguages,
        correctionExplanationLanguage: options.correctionExplanationLanguage || options.expectedInputLanguages[0],
        includeCorrectionTypes: options.includeCorrectionTypes !== undefined ? options.includeCorrectionTypes : true,
        includeCorrectionExplanations: options.includeCorrectionExplanations !== undefined ? options.includeCorrectionExplanations : true,
        monitor: onProgress ? (monitor: DownloadProgressMonitor) => {
          console.log('Monitor registered, setting up progress listener...');
          monitor.addEventListener('downloadprogress', (event: DownloadProgressEvent) => {
            const progress = Math.round(event.loaded * 100);
            console.log(`Download progress event: ${progress}%`);
            onProgress(progress);
            if (progress >= 100) {
              this.isModelDownloading = false;
              console.log('Download completed!');
            }
          });
        } : undefined
      };

      console.log('Full proofreader options:', proofreaderOptions);

      console.log('Calling Proofreader.create()...');
      
      // Add timeout specifically for create() call
      const createTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Proofreader.create() timeout after 60 seconds'));
        }, 60000);
      });

      this.proofreader = await Promise.race([
        window.Proofreader!.create(proofreaderOptions),
        createTimeout
      ]);
      
      console.log('Proofreader.create() completed successfully');
      
      // CRITICAL: Wait for ready signal before using
      if (this.proofreader.ready) {
        console.log('Waiting for proofreader to be ready...');
        
        const readyTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Proofreader.ready timeout after 30 seconds'));
          }, 30000);
        });
        
        await Promise.race([
          this.proofreader.ready,
          readyTimeout
        ]);
        
        console.log('Proofreader is ready!');
      } else {
        console.log('No ready promise, proofreader should be immediately available');
      }
      
      this.isModelDownloading = false;
      return true;
    } catch (error) {
      console.error('Error creating proofreader:', error);
      this.isModelDownloading = false;
      
      // Retry once if timeout
      if (retry === 0 && error instanceof Error && error.message.includes('timeout')) {
        console.warn('Proofreader creation timeout, retrying once...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.createProofreader(options, onProgress, 1);
      }
      
      throw error;
    }
  }

  // Proofread text with timeout
  async proofread(text: string, options: ProofreaderOptions, onProgress?: (progress: number) => void): Promise<ProofreaderServiceResult> {
    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        return {
          success: false,
          error: 'Text is required for proofreading'
        };
      }

      // Create proofreader if not exists
      if (!this.proofreader) {
        console.log('No existing proofreader, creating new one...');
        await this.createProofreader(options, onProgress);
      }

      if (!this.proofreader) {
        throw new Error('Failed to create proofreader');
      }

      console.log('Proofreader instance ready, starting proofread...');

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Proofreading timeout after 30 seconds')), 30000);
      });

      // Perform proofreading with timeout
      const proofreadResult = await Promise.race([
        this.proofreader.proofread(text),
        timeoutPromise
      ]);
      
      console.log('Raw proofread result:', proofreadResult);

      // Validate result structure
      if (!proofreadResult || typeof proofreadResult !== 'object') {
        throw new Error('Invalid proofread result structure');
      }

      return {
        success: true,
        result: proofreadResult
      };

    } catch (error) {
      console.error('Error during proofreading:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown proofreading error'
      };
    }
  }

  // Format corrections for display
  formatCorrections(result: ProofreadResult): string {
    if (!result.corrections || result.corrections.length === 0) {
      return 'No corrections needed! Your text is already well-written.';
    }

    let output = `Found ${result.corrections.length} correction${result.corrections.length > 1 ? 's' : ''}:\n\n`;

    result.corrections.forEach((correction, index) => {
      output += `${index + 1}. `;
      
      // Show the error type if available
      if (correction.type) {
        output += `[${correction.type}] `;
      }
      
      output += `"${correction.correction}"\n`;
      
      // Show explanation if available
      if (correction.explanation) {
        output += `   → ${correction.explanation}\n`;
      }
      
      output += '\n';
    });

    return output;
  }

  // Get supported languages
  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'en', name: '🇺🇸 English' },
      { code: 'id', name: '🇮🇩 Indonesian' },
      { code: 'es', name: '🇪🇸 Spanish' },
      { code: 'fr', name: '🇫🇷 French' },
      { code: 'de', name: '🇩🇪 German' },
      { code: 'ja', name: '🇯🇵 Japanese' },
      { code: 'pt', name: '🇵🇹 Portuguese' }
    ];
  }

  // Clean up resources
  destroy(): void {
    if (this.proofreader) {
      try {
        this.proofreader.destroy?.();
      } catch (error) {
        console.error('Error destroying proofreader:', error);
      }
      this.proofreader = null;
    }
    this.isModelDownloading = false;
  }

  // Get system requirements info
  getSystemRequirements(): string[] {
    return [
      'Chrome 141+ with Proofreader API support',
      'Windows 10/11, macOS 13+, Linux, or ChromeOS',
      'At least 22 GB free storage space',
      'GPU with more than 4 GB VRAM',
      'Origin trial token or enabled flag'
    ];
  }
}

export default ProofreaderService;