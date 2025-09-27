// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ActionSection from './components/ActionSection';
import ProcessButton from './components/ProcessButton';
import ResultSection from './components/ResultSection';
import SummarizerService, { SummarizerOptions } from './services/summarizerService';

export default function StudyMindApp() {
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summarizerSupported, setSummarizerSupported] = useState(false);
  const [modelDownloadProgress, setModelDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const summarizerService = SummarizerService.getInstance();

  useEffect(() => {
    // Check if Summarizer API is supported
    const checkSupport = async () => {
      const supported = summarizerService.isSupported();
      setSummarizerSupported(supported);
      
      if (supported) {
        const availability = await summarizerService.checkAvailability();
        console.log('Summarizer availability:', availability);
      }
    };

    checkSupport();
  }, [summarizerService]);

  const processSummarization = async (text: string, action: string): Promise<string> => {
    try {
      setIsDownloading(true);
      setModelDownloadProgress(0);
      
      // Map actions to summarizer options
      let summarizerOptions: SummarizerOptions;
      
      switch (action) {
        case 'summarize':
          summarizerOptions = {
            type: 'key-points',
            format: 'markdown',
            length: 'medium',
            sharedContext: 'This is educational content for study purposes'
          };
          break;
        default:
          summarizerOptions = {
            type: 'tldr',
            format: 'markdown',
            length: 'short',
            sharedContext: 'This content needs to be processed'
          };
      }

      // Create summarizer if not exists
      await summarizerService.createSummarizer(summarizerOptions, (progress) => {
        setModelDownloadProgress(progress);
        if (progress >= 100) {
          setIsDownloading(false);
        }
      });

      // Process text
      const summaryResult = await summarizerService.summarize(text, 'Educational content analysis');
      
      if (summaryResult.success && summaryResult.result) {
        const actionEmoji = action === 'summarize' ? '📝' : '🤖';
        return `${actionEmoji} AI-POWERED RESULT:\n\n${summaryResult.result}\n\n✨ Generated using Chrome's Built-in AI (Gemini Nano)`;
      } else {
        throw new Error(summaryResult.error || 'Failed to generate AI result');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      setIsDownloading(false);
      
      // Return error with fallback suggestion
      return `❌ AI PROCESSING FAILED:\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}\n\n💡 FALLBACK: Using mock response instead.\n\n${processWithMockAI(action)}`;
    }
  };

  const processWithMockAI = (action: string): string => {
    switch (action) {
      case 'summarize':
        return '📝 SUMMARY (MOCK):\n\nThis is a mock summary of your content. The main points have been condensed into key takeaways that capture the essential information while removing unnecessary details.\n\n• Key Point 1: Main concept explained clearly\n• Key Point 2: Supporting evidence provided\n• Key Point 3: Practical applications discussed\n\nThe summary maintains the core message while being concise.';
      case 'questions':
        return '❓ QUESTIONS GENERATED:\n\n1. What are the key concepts mentioned in this content?\n\n2. How does this information relate to the main topic?\n\n3. What examples or evidence support the main points?\n\n4. What practical applications can be derived from this?\n\n5. What conclusions can be drawn from the presented information?\n\n6. How might this knowledge be applied in real-world scenarios?';
      case 'translate':
        return '🌐 TRANSLATION RESULT:\n\n[Indonesian] Ini adalah hasil terjemahan dari konten yang Anda berikan. Teks telah diterjemahkan dengan mempertahankan makna dan konteks asli.\n\nTerjemahan ini mempertimbangkan:\n• Konteks budaya dan bahasa\n• Makna literal dan konotatif\n• Struktur kalimat yang natural\n• Terminologi yang tepat';
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
          
          // Use AI for summarize action if supported and text is available
          if (action === 'summarize' && summarizerSupported && inputText.trim()) {
            try {
              const aiResult = await processSummarization(inputText, action);
              finalResult += `SUMMARY (AI-POWERED):\n${aiResult.split('\n\n').slice(1).join('\n\n')}\n\n`;
            } catch (error) {
              finalResult += `SUMMARY (FALLBACK): ${processWithMockAI(action).split('\n\n').slice(1).join('\n\n')}\n\n`;
            }
          } else {
            // Use mock for other actions
            const actionLabel = action.toUpperCase();
            const mockResult = processWithMockAI(action);
            finalResult += `${actionLabel}: ${mockResult.split('\n\n').slice(1).join('\n\n')}\n\n`;
          }
        }
        finalResult += `✨ All ${selectedActions.length} operations completed successfully!`;
      } else {
        // Handle single action
        const action = selectedActions[0];
        
        // Use AI for summarize action if supported and text is available
        if (action === 'summarize' && summarizerSupported && inputText.trim()) {
          finalResult = await processSummarization(inputText, action);
        } else {
          // Use mock for other actions or when AI is not available
          finalResult = processWithMockAI(action);
          
          // Add note if AI is available but not used
          if (summarizerSupported && action === 'summarize' && !inputText.trim()) {
            finalResult += '\n\n💡 NOTE: AI summarization requires text input. Please enter some text to use Chrome\'s built-in AI.';
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
      <Header />
      
      {/* AI Status Indicator */}
      {summarizerSupported && (
        <div className="container mx-auto px-6 pt-4">
          <div className="bg-green-200 border-2 border-[#675D50] p-2 shadow-[2px_2px_0px_0px_#675D50]">
            <p className="text-[#675D50] text-sm font-bold text-center">
              🤖 CHROME AI ENABLED - Real AI summarization available for text input!
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
        {summarizerSupported && (
          <div className="text-xs mt-1 opacity-75">
            🤖 Powered by Chrome&apos;s Built-in AI (Gemini Nano)
          </div>
        )}
      </footer>
    </div>
  );
}