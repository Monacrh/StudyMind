// services/translatorService.ts

export interface TranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslatorResult {
  success: boolean;
  result?: string;
  error?: string;
  detectedLanguage?: string;
}

// Type definitions for Chrome Translator API
interface TranslatorCreateOptions {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: DownloadProgressMonitor) => void;
}

interface DownloadProgressMonitor {
  addEventListener(event: 'downloadprogress', callback: (event: DownloadProgressEvent) => void): void;
}

interface DownloadProgressEvent {
  loaded: number;
}

interface TranslatorInstance {
  translate(text: string): Promise<string>;
  translateStreaming(text: string): AsyncIterable<string>;
  destroy?(): void;
}

type AvailabilityStatus = 'no' | 'available' | 'downloadable' | 'unavailable';

interface LanguageDetectorInstance {
  detect(text: string): Promise<{ detectedLanguage: string; confidence: number }[]>;
  destroy?(): void;
}

// Extend Window interface to include Translator and LanguageDetector
declare global {
  interface Window {
    Translator?: {
      availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<AvailabilityStatus>;
      create(options: TranslatorCreateOptions): Promise<TranslatorInstance>;
    };
    LanguageDetector?: {
      availability(): Promise<AvailabilityStatus>;
      create(): Promise<LanguageDetectorInstance>;
    };
  }
}

class TranslatorService {
  private static instance: TranslatorService;
  private translators: Map<string, TranslatorInstance> = new Map();
  private languageDetector: LanguageDetectorInstance | null = null;
  private isModelDownloading = false;

  static getInstance(): TranslatorService {
    if (!TranslatorService.instance) {
      TranslatorService.instance = new TranslatorService();
    }
    return TranslatorService.instance;
  }

  // Check if Translator API is supported
  isSupported(): boolean {
    return 'Translator' in window;
  }

  // Check if Language Detector API is supported
  isLanguageDetectorSupported(): boolean {
    return 'LanguageDetector' in window;
  }

  // Check translation availability for specific language pair
  async checkTranslationAvailability(sourceLanguage: string, targetLanguage: string): Promise<string> {
    if (!this.isSupported()) {
      return 'unavailable';
    }

    try {
      const availability = await window.Translator!.availability({
        sourceLanguage,
        targetLanguage
      });
      return availability;
    } catch (error) {
      console.error('Error checking translation availability:', error);
      return 'unavailable';
    }
  }

  // Detect language if needed
  async detectLanguage(text: string): Promise<string | null> {
    if (!this.isLanguageDetectorSupported()) {
      console.warn('Language Detector API not supported');
      return null;
    }

    try {
      if (!this.languageDetector) {
        const availability = await window.LanguageDetector!.availability();
        if (availability === 'unavailable') {
          return null;
        }

        this.languageDetector = await window.LanguageDetector!.create();
      }

      const results = await this.languageDetector.detect(text);
      if (results && results.length > 0) {
        return results[0].detectedLanguage;
      }
    } catch (error) {
      console.error('Error detecting language:', error);
    }

    return null;
  }

  // Create translator for specific language pair
  async createTranslator(
    options: TranslatorOptions, 
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Translator API not supported in this browser');
    }

    // Check user activation
    if (!navigator.userActivation?.isActive) {
      throw new Error('User activation required. Please click a button to trigger translation.');
    }

    const translatorKey = `${options.sourceLanguage}-${options.targetLanguage}`;
    
    // Return existing translator if available
    if (this.translators.has(translatorKey)) {
      return true;
    }

    try {
      const availability = await this.checkTranslationAvailability(
        options.sourceLanguage, 
        options.targetLanguage
      );
      
      if (availability === 'unavailable') {
        throw new Error(`Translation from ${options.sourceLanguage} to ${options.targetLanguage} is not available`);
      }

      if (availability === 'downloadable' && !this.isModelDownloading) {
        this.isModelDownloading = true;
      }

      const translatorOptions: TranslatorCreateOptions = {
        sourceLanguage: options.sourceLanguage,
        targetLanguage: options.targetLanguage,
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

      const translator = await window.Translator!.create(translatorOptions);
      this.translators.set(translatorKey, translator);
      
      return true;
    } catch (error) {
      console.error('Error creating translator:', error);
      this.isModelDownloading = false;
      throw error;
    }
  }

  // Translate text
  async translate(
    text: string, 
    options: TranslatorOptions,
    onProgress?: (progress: number) => void
  ): Promise<TranslatorResult> {
    try {
      let { sourceLanguage } = options;
      const { targetLanguage } = options;

      // Auto-detect source language if needed
      if (sourceLanguage === 'auto') {
        const detected = await this.detectLanguage(text);
        if (detected) {
          sourceLanguage = detected;
        } else {
          // Fallback to English if detection fails
          sourceLanguage = 'en';
        }
      }

      // Don't translate if source and target are the same
      if (sourceLanguage === targetLanguage) {
        return {
          success: true,
          result: text,
          detectedLanguage: sourceLanguage
        };
      }

      // Create translator for this language pair
      await this.createTranslator({ sourceLanguage, targetLanguage }, onProgress);

      const translatorKey = `${sourceLanguage}-${targetLanguage}`;
      const translator = this.translators.get(translatorKey);

      if (!translator) {
        throw new Error('Failed to create translator');
      }

      // Perform translation
      const translatedText = await translator.translate(text);

      return {
        success: true,
        result: translatedText,
        detectedLanguage: options.sourceLanguage === 'auto' ? sourceLanguage : undefined
      };

    } catch (error) {
      console.error('Error during translation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown translation error'
      };
    }
  }

  // Streaming translation
  async* translateStreaming(
    text: string,
    options: TranslatorOptions,
    onProgress?: (progress: number) => void
  ): AsyncGenerator<string, void, unknown> {
    try {
      let { sourceLanguage } = options;
      const { targetLanguage } = options;

      // Auto-detect source language if needed
      if (sourceLanguage === 'auto') {
        const detected = await this.detectLanguage(text);
        sourceLanguage = detected || 'en';
      }

      // Create translator
      await this.createTranslator({ sourceLanguage, targetLanguage }, onProgress);
      
      const translatorKey = `${sourceLanguage}-${targetLanguage}`;
      const translator = this.translators.get(translatorKey);

      if (!translator) {
        throw new Error('Failed to create translator');
      }

      const stream = translator.translateStreaming(text);
      
      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      console.error('Error during streaming translation:', error);
      throw error;
    }
  }

  // Get supported language pairs (simplified list)
  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'en', name: '🇺🇸 English' },
      { code: 'id', name: '🇮🇩 Indonesian' },
      { code: 'es', name: '🇪🇸 Spanish' },
      { code: 'fr', name: '🇫🇷 French' },
      { code: 'de', name: '🇩🇪 German' },
      { code: 'ja', name: '🇯🇵 Japanese' },
      { code: 'ko', name: '🇰🇷 Korean' },
      { code: 'zh', name: '🇨🇳 Chinese' },
      { code: 'pt', name: '🇵🇹 Portuguese' },
      { code: 'ru', name: '🇷🇺 Russian' },
      { code: 'ar', name: '🇸🇦 Arabic' },
      { code: 'hi', name: '🇮🇳 Hindi' },
      { code: 'th', name: '🇹🇭 Thai' },
      { code: 'vi', name: '🇻🇳 Vietnamese' }
    ];
  }

  // Clean up resources
  destroy(): void {
    // Destroy all translators
    for (const [key, translator] of this.translators) {
      try {
        translator.destroy?.();
      } catch (error) {
        console.error(`Error destroying translator ${key}:`, error);
      }
    }
    this.translators.clear();

    // Destroy language detector
    if (this.languageDetector) {
      try {
        this.languageDetector.destroy?.();
      } catch (error) {
        console.error('Error destroying language detector:', error);
      }
      this.languageDetector = null;
    }

    this.isModelDownloading = false;
  }

  // Get system requirements info
  getSystemRequirements(): string[] {
    return [
      'Chrome 138+ with translation models support',
      'Windows 10/11, macOS 13+, Linux, or ChromeOS',
      'Sufficient storage space for language models',
      'Internet connection for initial model download'
    ];
  }
}

export default TranslatorService;