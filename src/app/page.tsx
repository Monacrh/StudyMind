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
import WriterService, { WriterOptions } from './services/writerService';
import RewriterService, { RewriterOptions } from './services/rewriterService';
import PromptService, { PromptOptions } from './services/promptService';
import PDFService from './services/pdfService';
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
  const [writerSupported, setWriterSupported] = useState(false);
  const [rewriterSupported, setRewriterSupported] = useState(false);
  const [promptSupported, setPromptSupported] = useState(false);
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
    includeCorrectionExplanation: true,
    correctionExplanationLanguage: "en",
    writerTone: 'formal',
    writerFormat: 'markdown',
    writerLength: 'medium',
    numberOfQuestions: 5,
    questionType: 'mixed',
    rewriterTone: 'as-is',
    rewriterFormat: 'as-is',
    rewriterLength: 'as-is',
    explainStyle: 'simple',
    explainTemperature: 0.8,
    explainTopK: 3
  });

  const summarizerService = SummarizerService.getInstance();
  const translatorService = TranslatorService.getInstance();
  const proofreaderService = ProofreaderService.getInstance();
  const writerService = WriterService.getInstance();
  const rewriterService = RewriterService.getInstance();
  const promptService = PromptService.getInstance();
  const pdfService = PDFService.getInstance();

  useEffect(() => {
    const checkSupport = async () => {
      const summarizerSupport = summarizerService.isSupported();
      const translatorSupport = translatorService.isSupported();
      const proofreaderSupport = proofreaderService.isSupported();
      const writerSupport = writerService.isSupported();
      const rewriterSupport = rewriterService.isSupported();
      const promptSupport = promptService.isSupported();
      
      setSummarizerSupported(summarizerSupport);
      setTranslatorSupported(translatorSupport);
      setProofreaderSupported(proofreaderSupport);
      setWriterSupported(writerSupport);
      setRewriterSupported(rewriterSupport);
      setPromptSupported(promptSupport);
      
      if (summarizerSupport) {
        const availability = await summarizerService.checkAvailability();
        console.log('Summarizer availability:', availability);
      }
      
      if (translatorSupport) {
        console.log('Translator API supported');
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
          const fullOptions: ProofreaderOptions = {
            expectedInputLanguages: ['en'],
            correctionExplanationLanguage: 'en',
            includeCorrectionTypes: true,
            includeCorrectionExplanations: true
          };
          const proofreaderAvailability = await proofreaderService.checkAvailability(fullOptions);
          console.log('Proofreader availability:', proofreaderAvailability);
        } catch (error) {
          console.warn('Could not check proofreader availability:', error);
        }
      }
      
      if (writerSupport) {
        console.log('Writer API supported');
        try {
          const writerAvailability = await writerService.checkAvailability();
          console.log('Writer availability:', writerAvailability);
        } catch (error) {
          console.warn('Could not check writer availability:', error);
        }
      }
      
      if (rewriterSupport) {
        console.log('Rewriter API supported');
        try {
          const rewriterAvailability = await rewriterService.checkAvailability();
          console.log('Rewriter availability:', rewriterAvailability);
        } catch (error) {
          console.warn('Could not check rewriter availability:', error);
        }
      }
      
      if (promptSupport) {
        console.log('Prompt API supported');
        try {
          const promptAvailability = await promptService.checkAvailability();
          console.log('Prompt API availability:', promptAvailability);
          
          const capabilities = await promptService.getCapabilities();
          console.log('Prompt API capabilities:', capabilities);
        } catch (error) {
          console.warn('Could not check prompt availability:', error);
        }
      }
    };

    checkSupport();
  }, []);

  // Process uploaded files to extract text
  const processFiles = async (): Promise<string> => {
    if (selectedFiles.length === 0) {
      return '';
    }

    let extractedText = '';
    
    for (const file of selectedFiles) {
      try {
        console.log(`Processing file: ${file.name}`);
        
        // Handle PDF files
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          setIsDownloading(true);
          
          const result = await pdfService.extractText(file, (progress) => {
            setModelDownloadProgress(progress);
          });
          
          if (result.success && result.text) {
            extractedText += `\n\n--- Content from ${file.name} (${result.numPages} pages) ---\n${result.text}\n`;
            
            if (result.isScanned) {
              console.warn(`${file.name} might be scanned, text extraction may be incomplete`);
            }
          } else {
            extractedText += `\n\n--- Error processing ${file.name} ---\n${result.error}\n`;
          }
          
          setIsDownloading(false);
        }
        // Handle images (placeholder for future OCR implementation)
        else if (file.type.startsWith('image/')) {
          extractedText += `\n\n--- ${file.name} ---\n[Image file detected - OCR not yet implemented]\n`;
        }
        // Handle audio (placeholder for future transcription)
        else if (file.type.startsWith('audio/')) {
          extractedText += `\n\n--- ${file.name} ---\n[Audio file detected - Transcription not yet implemented]\n`;
        }
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        extractedText += `\n\n--- Error processing ${file.name} ---\n${error instanceof Error ? error.message : 'Unknown error'}\n`;
      }
    }
    
    return extractedText;
  };

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

  const processQuestionGeneration = async (text: string): Promise<string> => {
    try {
      setIsDownloading(true);
      setModelDownloadProgress(0);
      
      if (!text || text.trim().length < 10) {
        throw new Error('Text too short for question generation (minimum 10 characters)');
      }
      
      const writerOptions: WriterOptions = {
        tone: 'formal',
        format: 'markdown',
        length: 'medium',
        sharedContext: 'Generate educational questions for learning and assessment purposes.'
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      let fullResult = '';
      
      const stream = writerService.generateQuestionsStreaming(
        text,
        aiConfig.numberOfQuestions,
        aiConfig.questionType,
        'These questions should test understanding and knowledge of the content provided.',
        writerOptions,
        (progress) => {
          setModelDownloadProgress(progress);
          if (progress >= 100) {
            setIsDownloading(false);
          }
        }
      );

      for await (const chunk of stream) {
        fullResult += chunk;
      }
      
      if (fullResult) {
        return `❓ AI-GENERATED QUESTIONS:\n\n${fullResult}\n\n✨ Generated using Chrome's Built-in Writer API (Gemini Nano)`;
      } else {
        throw new Error('No questions generated');
      }
      
    } catch (error) {
      console.error('AI question generation error:', error);
      setIsDownloading(false);
      
      let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('not supported')) {
        errorMessage = 'Writer API not available in your Chrome version.';
      } else if (errorMessage.includes('User activation')) {
        errorMessage = 'User interaction required for Writer API';
      }
      
      return `❌ AI QUESTION GENERATION FAILED:\n\n${errorMessage}\n\n💡 FALLBACK: Using mock response instead.\n\n${processWithMockAI('questions')}`;
    }
  };

  const processTranslation = async (text: string): Promise<string> => {
    try {
      setIsDownloading(true);
      setModelDownloadProgress(0);
      
      if (!text || text.trim().length < 3) {
        throw new Error('Text too short for translation (minimum 3 characters)');
      }

      if (aiConfig.translateFrom !== 'auto' && aiConfig.translateFrom === aiConfig.translateTo) {
        return `🌐 TRANSLATION RESULT:\n\nNo translation needed - source and target languages are the same.\n\nOriginal text: ${text}`;
      }
      
      const translatorOptions: TranslatorOptions = {
        sourceLanguage: aiConfig.translateFrom,
        targetLanguage: aiConfig.translateTo
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      const translationResult = await translatorService.translate(text, translatorOptions, (progress) => {
        setModelDownloadProgress(progress);
        if (progress >= 100) {
          setIsDownloading(false);
        }
      });
      
      if (translationResult.success && translationResult.result) {
        const fromLang = translationResult.detectedLanguage || aiConfig.translateFrom;
        const toLang = aiConfig.translateTo;
        
        return `🌐 AI-POWERED TRANSLATION:\n\nFrom: ${fromLang.toUpperCase()}\nTo: ${toLang.toUpperCase()}\n\n${translationResult.result}\n\n✨ Generated using Chrome's Built-in AI Translation`;
      } else {
        throw new Error(translationResult.error || 'Unknown translation error');
      }
    } catch (error) {
      console.error('AI translation error:', error);
      setIsDownloading(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return `❌ AI TRANSLATION FAILED:\n\n${errorMessage}\n\n💡 FALLBACK: Using mock response instead.\n\n${processWithMockAI('translate')}`;
    }
  };

  const processProofreading = async (text: string): Promise<string> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    
    try {
      setIsDownloading(true);
      setModelDownloadProgress(0);
      
      if (!text || text.trim().length < 3) {
        throw new Error('Text too short for proofreading (minimum 3 characters)');
      }
      
      const proofreaderOptions: ProofreaderOptions = {
        expectedInputLanguages: [aiConfig.proofreadLanguage],
        correctionExplanationLanguage: aiConfig.proofreadLanguage,
        includeCorrectionTypes: aiConfig.includeCorrectionTypes,
        includeCorrectionExplanations: aiConfig.includeCorrectionExplanation
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Proofreading timeout (5 minutes)'));
        }, 300000);
      });

      const proofreadResult = await Promise.race([
        proofreaderService.proofread(text, proofreaderOptions, (progress) => {
          setModelDownloadProgress(progress);
          setIsDownloading(progress < 100);
        }),
        timeoutPromise
      ]);
      
      if (proofreadResult.success && proofreadResult.result) {
        const { correctedInput, corrections } = proofreadResult.result;
                
        if (!corrections || corrections.length === 0) {
          return `✏️ AI-POWERED PROOFREAD:\n\n✅ No corrections needed!\n\nYour text is already well-written.\n\n✨ Generated using Chrome's Built-in AI Proofreader`;
        }
        
        let resultText = `✏️ AI-POWERED PROOFREAD:\n\nFound ${corrections.length} correction${corrections.length > 1 ? 's' : ''}:\n\n`;
        
        corrections.forEach((correction, index) => {
          resultText += `${index + 1}. `;
          if (aiConfig.includeCorrectionTypes && correction.type) {
            resultText += `[${correction.type.toUpperCase()}] `;
          }
          resultText += `"${correction.correction}"\n`;
          if (aiConfig.includeCorrectionExplanation && correction.explanation) {
            resultText += `   💡 ${correction.explanation}\n`;
          }
          resultText += '\n';
        });
        
        resultText += `\n📝 CORRECTED TEXT:\n${correctedInput}\n\n✨ Generated using Chrome's Built-in AI Proofreader`;
        return resultText;
      } else {
        throw new Error(proofreadResult.error || 'Unknown proofreading error');
      }
    } catch (error) {
      console.error('AI proofreading error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return `❌ AI PROOFREADING FAILED:\n\n${errorMessage}\n\n💡 FALLBACK: Using mock response instead.\n\n${processWithMockAI('proofread')}`;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setIsDownloading(false);
    }
  };

  const processImprove = async (text: string): Promise<string> => {
    try {
      setIsDownloading(true);
      setModelDownloadProgress(0);
      
      if (!text || text.trim().length < 3) {
        throw new Error('Text too short for improving (minimum 3 characters)');
      }
      
      const rewriterOptions: RewriterOptions = {
        tone: aiConfig.rewriterTone,
        format: aiConfig.rewriterFormat,
        length: aiConfig.rewriterLength,
        sharedContext: 'Improve writing quality while maintaining the original meaning.'
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      let fullResult = '';
      
      const stream = rewriterService.rewriteTextStreaming(
        text,
        'Enhance clarity, coherence, grammar, and overall writing quality.',
        rewriterOptions,
        (progress) => {
          setModelDownloadProgress(progress);
          if (progress >= 100) {
            setIsDownloading(false);
          }
        }
      );

      for await (const chunk of stream) {
        fullResult += chunk;
      }
      
      if (fullResult) {
        return `🚀 AI-IMPROVED TEXT:\n\n${fullResult}\n\n✨ Generated using Chrome's Built-in Rewriter API (Gemini Nano)`;
      } else {
        throw new Error('No improved text generated');
      }
      
    } catch (error) {
      console.error('AI text improvement error:', error);
      setIsDownloading(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return `❌ AI TEXT IMPROVEMENT FAILED:\n\n${errorMessage}\n\n💡 FALLBACK: Using mock response instead.\n\n${processWithMockAI('improve')}`;
    }
  };

  const processExplain = async (text: string): Promise<string> => {
    try {
      setIsDownloading(true);
      setModelDownloadProgress(0);
      
      if (!text || text.trim().length < 3) {
        throw new Error('Text too short for explanation (minimum 3 characters)');
      }
      
      const promptOptions: PromptOptions = {
        temperature: aiConfig.explainTemperature,
        topK: aiConfig.explainTopK
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      let fullResult = '';
      
      const stream = promptService.explainStreaming(
        text,
        aiConfig.explainStyle,
        'Provide a clear and helpful explanation.',
        promptOptions,
        (progress) => {
          setModelDownloadProgress(progress);
          if (progress >= 100) {
            setIsDownloading(false);
          }
        }
      );

      for await (const chunk of stream) {
        fullResult += chunk;
      }
      
      if (fullResult) {
        const styleEmoji: Record<string, string> = {
          'simple': '💬',
          'eli5': '👶',
          'analogy': '🔄',
          'step-by-step': '📋',
          'examples': '📚'
        };
        
        const styleName: Record<string, string> = {
          'simple': 'SIMPLE EXPLANATION',
          'eli5': 'ELI5 EXPLANATION',
          'analogy': 'ANALOGY EXPLANATION',
          'step-by-step': 'STEP-BY-STEP EXPLANATION',
          'examples': 'EXPLANATION WITH EXAMPLES'
        };
        
        return `${styleEmoji[aiConfig.explainStyle]} AI ${styleName[aiConfig.explainStyle]}:\n\n${fullResult}\n\n✨ Generated using Chrome's Built-in Prompt API (Gemini Nano)`;
      } else {
        throw new Error('No explanation generated');
      }
      
    } catch (error) {
      console.error('AI explanation error:', error);
      setIsDownloading(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return `❌ AI EXPLANATION FAILED:\n\n${errorMessage}\n\n💡 FALLBACK: Using mock response instead.\n\n${processWithMockAI('explain')}`;
    }
  };

  const processWithMockAI = (action: string): string => {
    const mocks: Record<string, string> = {
      summarize: '📝 SUMMARY (MOCK):\n\nThis is a mock summary. The main points have been condensed into key takeaways.\n\n• Key Point 1\n• Key Point 2\n• Key Point 3',
      questions: '❓ QUESTIONS GENERATED (MOCK):\n\n1. What are the key concepts mentioned?\n2. How does this relate to the main topic?\n3. What examples support the main points?',
      translate: `🌐 TRANSLATION RESULT (MOCK):\n\n[${aiConfig.translateTo === 'id' ? 'Indonesian' : 'English'}] Mock translation result.`,
      proofread: '✏️ PROOFREAD COMPLETE (MOCK):\n\n✅ Grammar: No errors\n✅ Spelling: Correct\n✅ Punctuation: Proper',
      improve: '🚀 WRITING IMPROVED (MOCK):\n\nYour content has been enhanced for clarity and engagement.',
      explain: '🤔 SIMPLE EXPLANATION (MOCK):\n\nHere\'s a simplified breakdown of the concept.'
    };
    return mocks[action] || 'Unknown action requested.';
  };

  const handleProcess = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return;
    if (selectedActions.length === 0) return;

    setIsProcessing(true);
    setModelDownloadProgress(0);
    setIsDownloading(false);
    
    try {
      // Process files first to extract text
      const fileText = await processFiles();
      
      // Combine input text with extracted file text
      const combinedText = `${inputText}\n${fileText}`.trim();
      
      console.log('Combined text length:', combinedText.length);
      console.log('Combined text preview:', combinedText.substring(0, 200));
      
      if (!combinedText) {
        setResult('❌ No content to process. Please provide text or upload files.');
        setIsProcessing(false);
        return;
      }
      
      let finalResult = '';
      
      console.log('=== DEBUG INFO ===');
      console.log('Selected actions:', selectedActions);
      console.log('Actions length:', selectedActions.length);
      console.log('Combined text length:', combinedText.length);
      console.log('Translator supported:', translatorSupported);
      console.log('==================');
      
      // COMBINED OPERATIONS (Multiple actions)
      if (selectedActions.length > 1) {
        finalResult = `🔄 COMBINED OPERATIONS COMPLETED:\n\n`;
        
        for (let i = 0; i < selectedActions.length; i++) {
          const action = selectedActions[i];
          finalResult += `${i + 1}. `;
          
          try {
            if (i > 0) await new Promise(resolve => setTimeout(resolve, 1000));
            
            const processors: Record<string, () => Promise<string>> = {
              summarize: () => processSummarization(combinedText),
              questions: () => processQuestionGeneration(combinedText),
              translate: () => processTranslation(combinedText),
              proofread: () => processProofreading(combinedText),
              improve: () => processImprove(combinedText),
              explain: () => processExplain(combinedText)
            };
            
            const supported: Record<string, boolean> = {
              summarize: summarizerSupported,
              questions: writerSupported,
              translate: translatorSupported,
              proofread: proofreaderSupported,
              improve: rewriterSupported,
              explain: promptSupported
            };
            
            console.log(`Processing action: ${action}`);
            console.log(`Action supported: ${supported[action]}`);
            console.log(`Has combinedText: ${!!combinedText}`);
            
            if (supported[action] && combinedText) {
              const aiResult = await processors[action]();
              finalResult += `${action.toUpperCase()}:\n${aiResult.split('\n\n').slice(1).join('\n\n')}\n\n`;
            } else {
              const mockResult = processWithMockAI(action);
              finalResult += `${action.toUpperCase()}: ${mockResult.split('\n\n').slice(1).join('\n\n')}\n\n`;
            }
          } catch (error) {
            console.error(`Error processing ${action}:`, error);
            const mockResult = processWithMockAI(action);
            finalResult += `${action.toUpperCase()} (FALLBACK): ${mockResult.split('\n\n').slice(1).join('\n\n')}\n\n`;
          }
        }
        finalResult += `✨ All ${selectedActions.length} operations completed!`;
      } 
      // SINGLE OPERATION
      else {
        const action = selectedActions[0];
        
        console.log('=== SINGLE ACTION MODE ===');
        console.log('Action:', action);
        console.log('Has combined text:', !!combinedText);
        console.log('Combined text length:', combinedText.length);
        console.log('========================');
        
        const processors: Record<string, () => Promise<string>> = {
          summarize: () => processSummarization(combinedText),
          questions: () => processQuestionGeneration(combinedText),
          translate: () => processTranslation(combinedText),
          proofread: () => processProofreading(combinedText),
          improve: () => processImprove(combinedText),
          explain: () => processExplain(combinedText)
        };
        
        const supported: Record<string, boolean> = {
          summarize: summarizerSupported,
          questions: writerSupported,
          translate: translatorSupported,
          proofread: proofreaderSupported,
          improve: rewriterSupported,
          explain: promptSupported
        };
        
        console.log('Is action supported?', supported[action]);
        
        if (supported[action] && combinedText) {
          console.log('✅ Calling REAL AI processor for:', action);
          finalResult = await processors[action]();
          console.log('✅ Processor completed successfully');
        } else {
          console.log('❌ Using mock - supported:', supported[action], ', has text:', !!combinedText);
          finalResult = processWithMockAI(action);
        }
      }
      
      setResult(finalResult);
    } catch (error) {
      console.error('Processing error:', error);
      setResult(`❌ PROCESSING ERROR:\n\n${error instanceof Error ? error.message : 'Unknown error'}`);
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
      
      {(summarizerSupported || translatorSupported || proofreaderSupported || writerSupported || rewriterSupported || promptSupported) && (
        <div className="container mx-auto px-6 pt-4">
          <div className="bg-green-200 border-2 border-[#675D50] p-2 shadow-[2px_2px_0px_0px_#675D50]">
            <p className="text-[#675D50] text-sm font-bold text-center">
              🤖 CHROME AI ENABLED - 
              {summarizerSupported && ' Summarization'}
              {summarizerSupported && (translatorSupported || proofreaderSupported || writerSupported || rewriterSupported || promptSupported) && ' +'}
              {translatorSupported && ' Translation'}
              {translatorSupported && (proofreaderSupported || writerSupported || rewriterSupported || promptSupported) && ' +'}
              {proofreaderSupported && ' Proofreading'}
              {proofreaderSupported && (writerSupported || rewriterSupported || promptSupported) && ' +'}
              {writerSupported && ' Question Generation'}
              {writerSupported && (rewriterSupported || promptSupported) && ' +'}
              {rewriterSupported && ' Text Improvement'}
              {rewriterSupported && promptSupported && ' +'}
              {promptSupported && ' AI Explanations'} available!
            </p>
          </div>
        </div>
      )}
      
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
        
        <ResultSection result={result} />
      </div>

      <footer 
        className="text-center text-[#675D50] font-bold p-4 bg-[#F3DEBA] border-t-4 border-[#675D50] mt-8"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        STUDYMIND AI - YOUR VINTAGE STUDY COMPANION
        {(summarizerSupported || translatorSupported || proofreaderSupported || writerSupported || rewriterSupported || promptSupported) && (
          <div className="text-xs mt-1 opacity-75">
            🤖 Powered by Chrome&apos;s Built-in AI (Gemini Nano)
          </div>
        )}
      </footer>
    </div>
  );
}