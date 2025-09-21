'use client'

import React, { useState, useRef } from 'react';
import { Upload, Mic, MicOff, FileText, Image, Volume2, Send, Loader2, Copy, Check } from 'lucide-react';

// Header Component
function Header() {
  return (
    <header className="bg-[#675D50] text-[#F3DEBA] relative border-b-4 border-[#ABC4AA]">
      <div className="container mx-auto flex items-center justify-between p-4 relative z-10">
        <div className="flex items-center gap-3">
          {/* Vintage geometric logo */}
          <div className="relative">
            <div className="w-8 h-8 bg-[#F3DEBA] border-2 border-[#675D50] transform rotate-12 shadow-[3px_3px_0px_0px_#ABC4AA]" />
            <div className="absolute top-1 left-1 w-4 h-4 bg-[#ABC4AA] border border-[#675D50] transform -rotate-45" />
          </div>
          
          <h1 
            className="text-2xl font-bold tracking-tight transform -skew-x-6"
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              textShadow: '2px 2px 0 #ABC4AA',
              color: '#F3DEBA'
            }}
          >
            STUDYMIND
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#ABC4AA] text-[#675D50] font-bold text-sm border-2 border-[#675D50] shadow-[3px_3px_0px_0px_#F3DEBA] hover:-translate-y-0.5 transition-transform">
            PRIVACY-FIRST
          </div>
          
          <div className="px-3 py-1 bg-[#F3DEBA] text-[#675D50] font-bold text-sm border-2 border-[#675D50] shadow-[3px_3px_0px_0px_#ABC4AA] hover:-translate-y-0.5 transition-transform">
            OFFLINE READY
          </div>
        </div>
      </div>
    </header>
  );
}

// Input Component
interface InputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

function InputSection({ inputText, setInputText, selectedFiles, setSelectedFiles, isRecording, setIsRecording }: InputSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="bg-[#F3DEBA] border-4 border-[#675D50] shadow-[6px_6px_0px_0px_#ABC4AA] hover:-translate-y-1 transition-transform">
      <div className="p-4">
        <h2 
          className="text-[#675D50] text-xl font-bold mb-4 transform -skew-x-3"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
        >
          📝 INPUT YOUR CONTENT
        </h2>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your text here, or upload files below..."
          className="w-full h-28 p-3 bg-[#ABC4AA] text-[#675D50] border-3 border-[#675D50] rounded-none resize-none font-medium shadow-[inset_2px_2px_0px_0px_#675D50] focus:bg-[#F3DEBA] focus:outline-none placeholder-[#675D50]/60"
          style={{ fontFamily: 'monospace' }}
        />

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-[#ABC4AA] text-[#675D50] font-bold border-2 border-[#675D50] shadow-[4px_4px_0px_0px_#675D50] hover:shadow-[2px_2px_0px_0px_#675D50] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Upload className="w-4 h-4" />
            UPLOAD FILE
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.mp3,.wav"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-4 py-2 font-bold border-2 border-[#675D50] transition-all ${
              isRecording 
                ? 'bg-red-400 shadow-[4px_4px_0px_0px_#675D50] animate-pulse text-[#675D50]' 
                : 'bg-[#675D50] text-[#F3DEBA] shadow-[4px_4px_0px_0px_#ABC4AA] hover:shadow-[2px_2px_0px_0px_#ABC4AA] hover:translate-x-0.5 hover:translate-y-0.5'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 
              className="text-[#675D50] font-bold mb-2 transform -skew-x-2"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              UPLOADED FILES:
            </h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-[#ABC4AA] p-2 border-2 border-[#675D50] shadow-[2px_2px_0px_0px_#675D50]">
                  <div className="flex items-center gap-2 text-[#675D50]">
                    {file.type.startsWith('image/') ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    <span className="font-medium" style={{ fontFamily: 'monospace' }}>{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="px-2 py-1 bg-red-400 text-[#675D50] font-bold text-xs border border-[#675D50] shadow-[1px_1px_0px_0px_#675D50] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    REMOVE
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Action Selection Component
interface ActionSectionProps {
  selectedActions: string[];
  setSelectedActions: React.Dispatch<React.SetStateAction<string[]>>;
}

function ActionSection({ selectedActions, setSelectedActions }: ActionSectionProps) {
  const actions = [
    { id: 'summarize', label: 'SUMMARIZE', color: 'bg-[#ABC4AA]', shadow: 'shadow-[4px_4px_0px_0px_#675D50]' },
    { id: 'questions', label: 'QUESTIONS', color: 'bg-[#F3DEBA]', shadow: 'shadow-[4px_4px_0px_0px_#ABC4AA]' },
    { id: 'translate', label: 'TRANSLATE', color: 'bg-[#675D50]', shadow: 'shadow-[4px_4px_0px_0px_#F3DEBA]', textColor: 'text-[#F3DEBA]' },
    { id: 'proofread', label: 'PROOFREAD', color: 'bg-[#ABC4AA]', shadow: 'shadow-[4px_4px_0px_0px_#675D50]' },
    { id: 'improve', label: 'IMPROVE', color: 'bg-[#F3DEBA]', shadow: 'shadow-[4px_4px_0px_0px_#ABC4AA]' },
    { id: 'explain', label: 'EXPLAIN', color: 'bg-[#675D50]', shadow: 'shadow-[4px_4px_0px_0px_#F3DEBA]', textColor: 'text-[#F3DEBA]' }
  ];

  const toggleAction = (actionId: string) => {
    setSelectedActions((prev: string[]) => 
      prev.includes(actionId) 
        ? prev.filter((id: string) => id !== actionId)
        : [...prev, actionId]
    );
  };

  return (
    <div className="bg-[#F3DEBA] border-4 border-[#675D50] shadow-[6px_6px_0px_0px_#ABC4AA] hover:-translate-y-1 transition-transform">
      <div className="p-4">
        <h2 
          className="text-[#675D50] text-xl font-bold mb-2 transform -skew-x-3"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
        >
          🎯 CHOOSE ACTIONS
        </h2>
        <p className="text-[#675D50] text-xs font-medium mb-4 opacity-75">
          Select multiple actions to combine operations
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => {
            const isSelected = selectedActions.includes(action.id);
            return (
              <button
                key={action.id}
                onClick={() => toggleAction(action.id)}
                className={`px-3 py-2 font-bold border-2 border-[#675D50] transition-all text-sm relative ${
                  action.textColor || 'text-[#675D50]'
                } ${
                  isSelected
                    ? `${action.color} shadow-[2px_2px_0px_0px_#675D50] translate-x-0.5 translate-y-0.5 scale-95` 
                    : `${action.color} ${action.shadow} hover:shadow-[2px_2px_0px_0px_#675D50] hover:translate-x-0.5 hover:translate-y-0.5 hover:scale-105`
                }`}
              >
                {action.label}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border border-[#675D50] rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-[#675D50]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selectedActions.length > 0 && (
          <div className="mt-3 p-2 bg-[#ABC4AA] border-2 border-[#675D50] shadow-[2px_2px_0px_0px_#675D50]">
            <p className="text-[#675D50] text-xs font-bold">
              SELECTED: {selectedActions.length} action{selectedActions.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Process Button Component
interface ProcessButtonProps {
  inputText: string;
  selectedFiles: File[];
  selectedActions: string[];
  isProcessing: boolean;
  onProcess: () => void;
}

function ProcessButton({ inputText, selectedFiles, selectedActions, isProcessing, onProcess }: ProcessButtonProps) {
  return (
    <div className="text-center my-6">
      <button
        onClick={onProcess}
        disabled={(!inputText.trim() && selectedFiles.length === 0) || selectedActions.length === 0 || isProcessing}
        className="px-8 py-3 bg-[#ABC4AA] text-[#675D50] font-black text-lg border-4 border-[#675D50] shadow-[8px_8px_0px_0px_#F3DEBA] hover:shadow-[4px_4px_0px_0px_#F3DEBA] hover:translate-x-1 hover:translate-y-1 disabled:bg-gray-400 disabled:shadow-[4px_4px_0px_0px_#999] disabled:translate-x-0 disabled:translate-y-0 transition-all transform hover:scale-105 disabled:hover:scale-100"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        {isProcessing ? (
          <span className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            PROCESSING...
          </span>
        ) : (
          <span className="flex items-center gap-3">
            <Send className="w-5 h-5" />
            PROCESS WITH AI ({selectedActions.length})
          </span>
        )}
      </button>
    </div>
  );
}

// Result Component
interface ResultSectionProps {
  result: string;
}

function ResultSection({ result }: ResultSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(result);
    speechSynthesis.speak(utterance);
  };

  if (!result) {
    return (
      <div className="bg-[#F3DEBA] border-4 border-[#675D50] shadow-[6px_6px_0px_0px_#ABC4AA]">
        <div className="p-6 text-center">
          <h2 
            className="text-[#675D50] text-xl font-bold mb-4 transform -skew-x-3"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            ✨ RESULT
          </h2>
          <div 
            className="text-[#675D50]/60 font-medium bg-[#ABC4AA] p-6 border-2 border-dashed border-[#675D50] transform skew-x-2"
            style={{ fontFamily: 'monospace' }}
          >
            Results will appear here after processing...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F3DEBA] border-4 border-[#675D50] shadow-[6px_6px_0px_0px_#ABC4AA] hover:-translate-y-1 transition-transform">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-[#675D50] text-xl font-bold transform -skew-x-3"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            ✨ RESULT
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1 text-[#675D50] font-bold border-2 border-[#675D50] transition-all text-sm transform hover:scale-110 ${
                copied 
                  ? 'bg-green-300 shadow-[3px_3px_0px_0px_#675D50]' 
                  : 'bg-[#ABC4AA] shadow-[3px_3px_0px_0px_#675D50] hover:shadow-[1px_1px_0px_0px_#675D50] hover:translate-x-0.5 hover:translate-y-0.5'
              }`}
            >
              {copied ? <Check className="w-4 h-4 inline mr-1" /> : <Copy className="w-4 h-4 inline mr-1" />}
              {copied ? 'COPIED!' : 'COPY'}
            </button>
            <button
              onClick={handleSpeak}
              className="px-3 py-1 bg-[#675D50] text-[#F3DEBA] font-bold border-2 border-[#675D50] shadow-[3px_3px_0px_0px_#ABC4AA] hover:shadow-[1px_1px_0px_0px_#ABC4AA] hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-sm transform hover:scale-110"
            >
              <Volume2 className="w-4 h-4 inline mr-1" />
              SPEAK
            </button>
          </div>
        </div>
        
        <div 
          className="bg-[#675D50] border-2 border-[#675D50] p-4 text-[#F3DEBA] whitespace-pre-line max-h-72 overflow-y-auto shadow-[inset_4px_4px_0px_0px_#000] font-medium"
          style={{ fontFamily: 'monospace', lineHeight: '1.6' }}
        >
          {result}
        </div>
      </div>
    </div>
  );
}

// Main App Component - Vintage Neobrutalism Bottom Layout
export default function StudyMindApp() {
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return;
    if (selectedActions.length === 0) return;

    setIsProcessing(true);
    
    setTimeout(() => {
      let mockResult = '';
      
      // Handle multiple actions
      if (selectedActions.length > 1) {
        mockResult = `🔄 COMBINED OPERATIONS COMPLETED:\n\n`;
        selectedActions.forEach((action, index) => {
          mockResult += `${index + 1}. `;
          switch (action) {
            case 'summarize':
              mockResult += 'SUMMARY: Main points condensed into key takeaways capturing essential information.\n\n';
              break;
            case 'questions':
              mockResult += 'QUESTIONS: Generated study questions based on content analysis.\n\n';
              break;
            case 'translate':
              mockResult += 'TRANSLATION: Content translated while maintaining original meaning and context.\n\n';
              break;
            case 'proofread':
              mockResult += 'PROOFREAD: Grammar, spelling, and structure checked and corrected.\n\n';
              break;
            case 'improve':
              mockResult += 'IMPROVED: Writing enhanced for clarity, flow, and engagement.\n\n';
              break;
            case 'explain':
              mockResult += 'SIMPLIFIED: Complex concepts broken down into easy-to-understand explanations.\n\n';
              break;
          }
        });
        mockResult += `✨ All ${selectedActions.length} operations have been successfully applied to your content!`;
      } else {
        // Handle single action
        const action = selectedActions[0];
        switch (action) {
          case 'summarize':
            mockResult = '📝 SUMMARY GENERATED:\n\nThis is a mock summary of your content. The main points have been condensed into key takeaways that capture the essential information while removing unnecessary details.\n\n• Key Point 1: Main concept explained clearly\n• Key Point 2: Supporting evidence provided\n• Key Point 3: Practical applications discussed\n\nThe summary maintains the core message while being 70% shorter than the original content.';
            break;
          case 'questions':
            mockResult = '❓ QUESTIONS GENERATED:\n\n1. What are the key concepts mentioned in this content?\n\n2. How does this information relate to the main topic?\n\n3. What examples or evidence support the main points?\n\n4. What practical applications can be derived from this?\n\n5. What conclusions can be drawn from the presented information?\n\n6. How might this knowledge be applied in real-world scenarios?';
            break;
          case 'translate':
            mockResult = '🌐 TRANSLATION RESULT:\n\n[Indonesian] Ini adalah hasil terjemahan dari konten yang Anda berikan. Teks telah diterjemahkan dengan mempertahankan makna dan konteks asli.\n\nTerjemahan ini mempertimbangkan:\n• Konteks budaya dan bahasa\n• Makna literal dan konotatif\n• Struktur kalimat yang natural\n• Terminologi yang tepat';
            break;
          case 'proofread':
            mockResult = '✏️ PROOFREAD COMPLETE:\n\n✅ Grammar: No errors found\n✅ Spelling: All correct\n✅ Punctuation: Properly used\n✅ Sentence Structure: Well-formed\n\n📝 SUGGESTIONS:\n• Consider varying sentence structure for better flow\n• Some paragraphs could be shortened for clarity\n• Add transition words to improve coherence\n\nOverall Score: 95/100 - Excellent writing quality!';
            break;
          case 'improve':
            mockResult = '🚀 WRITING IMPROVED:\n\nYour content has been enhanced for clarity, flow, and engagement. Here are the key improvements made:\n\n📈 ENHANCEMENTS:\n• Clearer sentence structure\n• More engaging vocabulary\n• Better paragraph organization\n• Improved transitions\n• Enhanced readability\n\nThe improved version maintains your original message while making it more impactful, professional, and easier to understand.';
            break;
          case 'explain':
            mockResult = '🤔 SIMPLE EXPLANATION:\n\nHere\'s a simplified breakdown of the concept:\n\n🎯 MAIN IDEA:\nThe core concept explained in simple, everyday language that anyone can understand.\n\n💡 WHY IT MATTERS:\nThis is important because it affects how we think about and approach similar problems or situations.\n\n📖 EASY EXAMPLE:\nThink of it like riding a bicycle - once you understand the basic balance and pedaling, the complex physics becomes natural.\n\n🔑 KEY TAKEAWAY:\nRemember this simple rule that captures the essence of the entire concept.';
            break;
        }
      }
      
      setResult(mockResult);
      setIsProcessing(false);
    }, 2000);
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
      
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Top Section - Input and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InputSection 
            inputText={inputText}
            setInputText={setInputText}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
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
      </footer>
    </div>
  );
}