// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ActionSection from './components/ActionSection';
import ProcessButton from './components/ProcessButton';
import ResultSection from './components/ResultSection';
import SummarizerService, { SummarizerOptions } from './services/summarizerService';
import TranslatorService, { TranslatorOptions } from './services/TranslatorService';
import ProofreaderService, { ProofreaderOptions } from './services/proofreaderService';
import { AIConfigOptions } from './components/AIConfiguration';

export default function StudyMindApp() {
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summarizerSupported, setSummarizerSupported] = useState(false);
  const [translatorSupported, setTranslatorSupported] = useState(false);
  const [proofreaderSupported, setProofreaderSupported] = useState(false);
  const [modelDownloadProgress, setModelDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // AI Configuration state
  const [aiConfig, setAiConfig] = useState<AIConfigOptions>({
    summaryType: 'key-points',
    summaryLength: 'medium',
    summaryFormat: 'markdown',
    translateTo: 'id',
    translateFrom: 'auto',
    proofreadLanguage: 'en',
    includeCorrectionTypes: true,
    includeCorrectionExplanation: true
  });

  const summarizerService = SummarizerService.getInstance();
  const translatorService = TranslatorService.getInstance();
  const proofreaderService = ProofreaderService.getInstance();

  useEffect(() => {
    // Check if AI APIs are supported
    const checkSupport = async () => {
      const summarizerSupport = summarizerService.isSupported();
      const translatorSupport = translatorService.isSupported();
      const proofreaderSupport = proofreaderService.isSupported();
      
      setSummarizerSupported(summarizerSupport);
      setTranslatorSupported(translatorSupport);
      setProofreaderSupported(proofreaderSupport);
      
      if (summarizerSupport) {
        const availability = await summarizerService.checkAvailability();
        console.log('Summarizer availability:', availability);
      }
      
      if (translatorSupport) {
        console.log('Translator API supported');
        // Test if we can check availability for a common language pair
        try {
          const translatorAvailability = await translatorService.checkTranslationAvailability('en', 'id');
          console.log('Translator availability (en->id):', translatorAvailability);
        } catch (error) {
          console.warn('Could not check translator availability:', error);
        }
      }
      
      if (proofreaderSupport) {
        console.log('Proofreader API supported');
        try {
          const proofreaderAvailability = await proofreaderService.checkAvailability(['en']);
          console.log('Proofreader availability:', proofreaderAvailability);
          
          if (proofreaderAvailability === 'downloadable') {
            console.warn('⚠️ Proofreader model needs to be downloaded. It will download on first use.');
          } else if (proofreaderAvailability === 'unavailable') {
            console.warn('❌ Proofreader API unavailable. Please check:');
            console.warn('1. Chrome version 141+ required');
            console.warn('2. Enable chrome://flags/#proofreader-api-for-gemini-nano');
            console.warn('3. Restart Chrome after enabling flags');
            console.warn('4. May require Origin Trial token');
          } else if (proofreaderAvailability === 'available') {
            console.log('✅ Proofreader model ready to use!');
          }
        } catch (error) {
          console.warn('Could not check proofreader availability:', error);
        }
      } else {
        console.warn('❌ Proofreader API not supported. Chrome 141+ with flags enabled required.');
      }
    };

    checkSupport();
  }, []);

  const processSummarization = async (text: string): Promise<string> => {
    try {
      setIsDownloading(true);
      setModelDownloadProgress(0);
      
      const summarizerOptions: SummarizerOptions = {
        type: aiConfig.summaryType,
        format: aiConfig.summaryFormat,
        length: aiConfig.summaryLength,
        sharedContext: 'This is educational content for study purposes'
      };

      await summarizerService.createSummarizer(summarizerOptions, (progress) => {
        setModelDownloadProgress(progress);
        if (progress >= 100) {
          setIsDownloading(false);
        }
      });

      const summaryResult = await summarizerService.summarize(text, 'Educational content analysis');
      
      if (summaryResult.success && summaryResult.result) {
        return `📝 AI-POWERED SUMMARY:\n\n${summaryResult.result}\n\n✨ Generated using Chrome's Built-in AI (Gemini Nano)`;
      } else {
        throw new Error(summaryResult.error || 'Failed to generate AI summary');
      }
    } catch (error) {
      console.error('AI summarization error:', error);
      setIsDownloading(false);
      
      return `❌ AI SUMMARIZATION FAILED:\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}\n\n💡 FALLBACK: Using mock response instead.\n\n${processWithMockAI('summarize')}`;
    }
  };

  const processTranslation = async (text: string): Promise<string> => {
    try {
      setIsDownloading(true);
      setModelDownloadProgress(0);
      
      // Check if text is too short or empty
      if (!text || text.trim().length < 3) {
        throw new Error('Text too short for translation (minimum 3 characters)');
      }

      // Check if translation is needed (same language)
      if (aiConfig.translateFrom !== 'auto' && aiConfig.translateFrom === aiConfig.translateTo) {
        return `🌐 TRANSLATION RESULT:\n\nNo translation needed - source and target languages are the same.\n\nOriginal text: ${text}`;
      }
      
      const translatorOptions: TranslatorOptions = {
        sourceLanguage: aiConfig.translateFrom,
        targetLanguage: aiConfig.translateTo
      };

      // Add delay between API calls to prevent conflicts
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Starting translation with options:', translatorOptions);

      const translationResult = await translatorService.translate(text, translatorOptions, (progress) => {
        setModelDownloadProgress(progress);
        if (progress >= 100) {
          setIsDownloading(false);
        }
      });
      
      console.log('Translation result:', translationResult);
      
      if (translationResult.success && translationResult.result) {
        const fromLang = translationResult.detectedLanguage || aiConfig.translateFrom;
        const toLang = aiConfig.translateTo;
        
        // Check if translation actually happened (sometimes API returns same text)
        if (translationResult.result === text && fromLang !== toLang) {
          return `🌐 TRANSLATION RESULT:\n\nFrom: ${fromLang.toUpperCase()}\nTo: ${toLang.toUpperCase()}\n\n${translationResult.result}\n\n⚠️ Note: Translation model may not support this language pair yet. Showing original text.`;
        }
        
        return `🌐 AI-POWERED TRANSLATION:\n\nFrom: ${fromLang.toUpperCase()}\nTo: ${toLang.toUpperCase()}\n\n${translationResult.result}\n\n✨ Generated using Chrome's Built-in AI Translation`;
      } else {
        const errorMsg = translationResult.error || 'Unknown translation error';
        console.error('Translation failed:', errorMsg);
        throw new Error(`Translation failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('AI translation error:', error);
      setIsDownloading(false);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Provide more specific error messages
      if (errorMessage.includes('not available')) {
        errorMessage = `Translation from ${aiConfig.translateFrom} to ${aiConfig.translateTo} is not supported yet`;
      } else if (errorMessage.includes('User activation')) {
        errorMessage = 'User interaction required for translation API';
      }
      
      return `❌ AI TRANSLATION FAILED:\n\n${errorMessage}\n\n💡 FALLBACK: Using mock response instead.\n\n${processWithMockAI('translate')}`;
    }
  };

  const processProofreading = async (text: string): Promise<string> => {
    try {
      setIsDownloading(true);
      setModelDownloadProgress(0);
      
      // Check if text is too short or empty
      if (!text || text.trim().length < 3) {
        throw new Error('Text too short for proofreading (minimum 3 characters)');
      }
      
      const proofreaderOptions: ProofreaderOptions = {
        expectedInputLanguages: [aiConfig.proofreadLanguage]
      };

      // Add delay between API calls to prevent conflicts
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Starting proofreading with options:', proofreaderOptions);
      console.log('Calling proofread API with progress tracking...');

      // Add overall timeout for the entire process (5 minutes for large download)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.error('Overall proofreading timeout after 5 minutes');
          reject(new Error('Proofreading timeout (5 minutes) - Model download may still be in progress. Check chrome://on-device-internals/ for download status.'));
        }, 300000); // 5 minutes = 300000ms
      });

      // Call proofread with timeout protection
      const proofreadResult = await Promise.race([
        proofreaderService.proofread(text, proofreaderOptions, (progress) => {
          console.log(`Proofreader progress callback: ${progress}%`);
          setModelDownloadProgress(progress);
          setIsDownloading(progress < 100);
        }),
        timeoutPromise
      ]);
      
      console.log('Proofread completed, result:', proofreadResult);
      setIsDownloading(false);
      
      if (proofreadResult.success && proofreadResult.result) {
        const { corrected, corrections } = proofreadResult.result;
        
        console.log('Corrections found:', corrections?.length || 0);
        console.log('Corrected text:', corrected);
        
        // No corrections needed
        if (!corrections || corrections.length === 0) {
          return `✏️ AI-POWERED PROOFREAD:\n\n✅ No corrections needed!\n\nYour text is already well-written with no grammar, spelling, or punctuation errors detected.\n\n✨ Generated using Chrome's Built-in AI Proofreader`;
        }
        
        // Build result with corrections
        let resultText = `✏️ AI-POWERED PROOFREAD:\n\n`;
        resultText += `Found ${corrections.length} correction${corrections.length > 1 ? 's' : ''}:\n\n`;
        
        corrections.forEach((correction, index) => {
          resultText += `${index + 1}. `;
          
          // Show correction type if enabled
          if (aiConfig.includeCorrectionTypes && correction.type) {
            resultText += `[${correction.type.toUpperCase()}] `;
          }
          
          resultText += `"${correction.correction}"\n`;
          
          // Show explanation if enabled
          if (aiConfig.includeCorrectionExplanation && correction.explanation) {
            resultText += `   💡 ${correction.explanation}\n`;
          }
          
          resultText += '\n';
        });
        
        resultText += `\n📝 CORRECTED TEXT:\n${corrected}\n\n✨ Generated using Chrome's Built-in AI Proofreader`;
        
        return resultText;
      } else {
        const errorMsg = proofreadResult.error || 'Unknown proofreading error';
        console.error('Proofreading failed:', errorMsg);
        throw new Error(`Proofreading failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('AI proofreading error:', error);
      setIsDownloading(false);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Provide more specific error messages
      if (errorMessage.includes('not available')) {
        errorMessage = `Proofreading for ${aiConfig.proofreadLanguage} is not supported yet`;
      } else if (errorMessage.includes('User activation')) {
        errorMessage = 'User interaction required for proofreading API';
      } else if (errorMessage.includes('not supported')) {
        errorMessage = 'Proofreader API not available in your Chrome version. Please enable chrome://flags/#proofreader-api-for-gemini-nano';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Proofreading timeout - This is likely due to:\n• Model still downloading (22GB+)\n• API still experimental\n• Chrome needs restart after flag change';
      }
      
      return `❌ AI PROOFREADING FAILED:\n\n${errorMessage}\n\n💡 NOTE: Proofreader API is still in Origin Trial (experimental) and may not work consistently.\n\n💡 FALLBACK: Using mock response instead.\n\n${processWithMockAI('proofread')}`;
    }
  };

  const processWithMockAI = (action: string): string => {
    switch (action) {
      case 'summarize':
        return '📝 SUMMARY (MOCK):\n\nThis is a mock summary of your content. The main points have been condensed into key takeaways that capture the essential information while removing unnecessary details.\n\n• Key Point 1: Main concept explained clearly\n• Key Point 2: Supporting evidence provided\n• Key Point 3: Practical applications discussed\n\nThe summary maintains the core message while being concise.';
      case 'questions':
        return '❓ QUESTIONS GENERATED:\n\n1. What are the key concepts mentioned in this content?\n\n2. How does this information relate to the main topic?\n\n3. What examples or evidence support the main points?\n\n4. What practical applications can be derived from this?\n\n5. What conclusions can be drawn from the presented information?\n\n6. How might this knowledge be applied in real-world scenarios?';
      case 'translate':
        const targetLang = aiConfig.translateTo === 'id' ? 'Indonesian' : 'English';
        return `🌐 TRANSLATION RESULT (MOCK):\n\n[${targetLang}] ${aiConfig.translateTo === 'id' ? 'Ini adalah hasil terjemahan dari konten yang Anda berikan. Teks telah diterjemahkan dengan mempertahankan makna dan konteks asli.' : 'This is the translation result of the content you provided. The text has been translated while maintaining the original meaning and context.'}\n\nTranslation considers:\n• Cultural and linguistic context\n• Literal and connotative meaning\n• Natural sentence structure\n• Appropriate terminology`;
      case 'proofread':
        return '✏️ PROOFREAD COMPLETE:\n\n✅ Grammar: No errors found\n✅ Spelling: All correct\n✅ Punctuation: Properly used\n✅ Sentence Structure: Well-formed\n\n📝 SUGGESTIONS:\n• Consider varying sentence structure for better flow\n• Some paragraphs could be shortened for clarity\n• Add transition words to improve coherence\n\nOverall Score: 95/100 - Excellent writing quality!';
      case 'improve':
        return '🚀 WRITING IMPROVED:\n\nYour content has been enhanced for clarity, flow, and engagement. Here are the key improvements made:\n\n📈 ENHANCEMENTS:\n• Clearer sentence structure\n• More engaging vocabulary\n• Better paragraph organization\n• Improved transitions\n• Enhanced readability\n\nThe improved version maintains your original message while making it more impactful, professional, and easier to understand.';
      case 'explain':
        return '🤔 SIMPLE EXPLANATION:\n\nHere\'s a simplified breakdown of the concept:\n\n🎯 MAIN IDEA:\nThe core concept explained in simple, everyday language that anyone can understand.\n\n💡 WHY IT MATTERS:\nThis is important because it affects how we think about and approach similar problems or situations.\n\n📖 EASY EXAMPLE:\nThink of it like riding a bicycle - once you understand the basic balance and pedaling, the complex physics becomes natural.\n\n🔑 KEY TAKEAWAY:\nRemember this simple rule that captures the essence of the entire concept.';
      default:
        return 'Unknown action requested.';
    }
  };

  const handleProcess = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return;
    if (selectedActions.length === 0) return;

    setIsProcessing(true);
    setModelDownloadProgress(0);
    setIsDownloading(false);
    
    try {
      let finalResult = '';
      
      // Handle multiple actions
      if (selectedActions.length > 1) {
        finalResult = `🔄 COMBINED OPERATIONS COMPLETED:\n\n`;
        
        for (let i = 0; i < selectedActions.length; i++) {
          const action = selectedActions[i];
          finalResult += `${i + 1}. `;
          
          try {
            // Add delay between operations to prevent API conflicts
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Use AI for summarize action if supported and text is available
            if (action === 'summarize' && summarizerSupported && inputText.trim()) {
              const aiResult = await processSummarization(inputText);
              finalResult += `SUMMARY (AI-POWERED):\n${aiResult.split('\n\n').slice(1).join('\n\n')}\n\n`;
            }
            // Use AI for translate action if supported and text is available
            else if (action === 'translate' && translatorSupported && inputText.trim()) {
              const aiResult = await processTranslation(inputText);
              finalResult += `TRANSLATION (AI-POWERED):\n${aiResult.split('\n\n').slice(1).join('\n\n')}\n\n`;
            }
            // Use AI for proofread action if supported and text is available
            else if (action === 'proofread' && proofreaderSupported && inputText.trim()) {
              const aiResult = await processProofreading(inputText);
              finalResult += `PROOFREAD (AI-POWERED):\n${aiResult.split('\n\n').slice(1).join('\n\n')}\n\n`;
            } else {
              // Use mock for other actions
              const actionLabel = action.toUpperCase();
              const mockResult = processWithMockAI(action);
              finalResult += `${actionLabel}: ${mockResult.split('\n\n').slice(1).join('\n\n')}\n\n`;
            }
          } catch (error) {
            console.error(`Error processing action ${action}:`, error);
            const actionLabel = action.toUpperCase();
            const mockResult = processWithMockAI(action);
            finalResult += `${actionLabel} (FALLBACK): ${mockResult.split('\n\n').slice(1).join('\n\n')}\n\n`;
          }
        }
        finalResult += `✨ All ${selectedActions.length} operations completed successfully!`;
      } else {
        // Handle single action
        const action = selectedActions[0];
        
        // Use AI for summarize action if supported and text is available
        if (action === 'summarize' && summarizerSupported && inputText.trim()) {
          finalResult = await processSummarization(inputText);
        }
        // Use AI for translate action if supported and text is available
        else if (action === 'translate' && translatorSupported && inputText.trim()) {
          finalResult = await processTranslation(inputText);
        }
        // Use AI for proofread action if supported and text is available
        else if (action === 'proofread' && proofreaderSupported && inputText.trim()) {
          finalResult = await processProofreading(inputText);
        } else {
          // Use mock for other actions or when AI is not available
          finalResult = processWithMockAI(action);
          
          // Add note if AI is available but not used
          if (action === 'summarize' && summarizerSupported && !inputText.trim()) {
            finalResult += '\n\n💡 NOTE: AI summarization requires text input. Please enter some text to use Chrome\'s built-in AI.';
          } else if (action === 'translate' && translatorSupported && !inputText.trim()) {
            finalResult += '\n\n💡 NOTE: AI translation requires text input. Please enter some text to use Chrome\'s built-in AI.';
          } else if (action === 'proofread' && proofreaderSupported && !inputText.trim()) {
            finalResult += '\n\n💡 NOTE: AI proofreading requires text input. Please enter some text to use Chrome\'s built-in AI.';
          }
        }
      }
      
      setResult(finalResult);
    } catch (error) {
      console.error('Processing error:', error);
      setResult(`❌ PROCESSING ERROR:\n\nAn error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or check the AI Status for more information.`);
    } finally {
      setIsProcessing(false);
      setIsDownloading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#ABC4AA]"
      style={{
        backgroundImage: `
          radial-gradient(circle at 25% 25%, #F3DEBA 2px, transparent 2px),
          radial-gradient(circle at 75% 75%, #675D50 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px, 25px 25px',
        backgroundPosition: '0 0, 25px 25px'
      }}
    >
      <Header 
        aiConfig={aiConfig}
        onConfigChange={setAiConfig}
      />
      
      {/* AI Status Indicators */}
      {(summarizerSupported || translatorSupported || proofreaderSupported) && (
        <div className="container mx-auto px-6 pt-4">
          <div className="bg-green-200 border-2 border-[#675D50] p-2 shadow-[2px_2px_0px_0px_#675D50]">
            <p className="text-[#675D50] text-sm font-bold text-center">
              🤖 CHROME AI ENABLED - 
              {summarizerSupported && ' Summarization'}
              {summarizerSupported && (translatorSupported || proofreaderSupported) && ' +'}
              {translatorSupported && ' Translation'}
              {translatorSupported && proofreaderSupported && ' +'}
              {proofreaderSupported && ' Proofreading'} available for text input!
            </p>
          </div>
        </div>
      )}
      
      {/* Model Download Progress */}
      {isDownloading && (
        <div className="container mx-auto px-6 pt-2">
          <div className="bg-[#F3DEBA] border-2 border-[#675D50] p-3 shadow-[2px_2px_0px_0px_#675D50]">
            <p className="text-[#675D50] text-sm font-bold mb-2">
              🔄 Downloading AI model... {modelDownloadProgress}%
            </p>
            <div className="bg-[#ABC4AA] border border-[#675D50] h-2">
              <div 
                className="bg-[#675D50] h-full transition-all duration-300"
                style={{ width: `${modelDownloadProgress}%` }}
              />
            </div>
            <p className="text-[#675D50] text-xs mt-1 opacity-75">
              This only happens once. Please wait...
            </p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Top Section - Input and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InputSection 
            inputText={inputText}
            setInputText={setInputText}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
          />
          
          <ActionSection 
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
          />
        </div>
        
        <ProcessButton 
          inputText={inputText}
          selectedFiles={selectedFiles}
          selectedActions={selectedActions}
          isProcessing={isProcessing}
          onProcess={handleProcess}
        />
        
        {/* Bottom Section - Results */}
        <ResultSection result={result} />
      </div>

      <footer 
        className="text-center text-[#675D50] font-bold p-4 bg-[#F3DEBA] border-t-4 border-[#675D50] mt-8"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        STUDYMIND AI - YOUR VINTAGE STUDY COMPANION
        {(summarizerSupported || translatorSupported || proofreaderSupported) && (
          <div className="text-xs mt-1 opacity-75">
            🤖 Powered by Chrome&apos;s Built-in AI (Gemini Nano)
          </div>
        )}
      </footer>
    </div>
  );
}