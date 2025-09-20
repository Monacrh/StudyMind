'use client'

import React, { useState, useRef } from 'react';
import { Upload, Mic, MicOff, FileText, Image, Volume2, Send, Loader2, Copy, Check } from 'lucide-react';

// Header Component
function Header() {
  const pixelButtonStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    textShadow: '1px 1px 0 #000',
    boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.3), 2px 2px 0 #000',
    imageRendering: 'pixelated' as const
  };

  return (
    <header className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white relative overflow-hidden" style={{
      background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #581c87 75%, #6b21a8 100%)',
      boxShadow: 'inset 0 -4px 0 #0f0f23, 0 4px 0 #000',
      imageRendering: 'pixelated'
    }}>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 4px 4px',
          imageRendering: 'pixelated'
        }}
      />
      
      <div className="container mx-auto flex items-center justify-between p-4 relative z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 bg-yellow-400 relative"
            style={{
              clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)',
              boxShadow: 'inset -2px -2px 0 #d97706, 2px 2px 0 #000',
              imageRendering: 'pixelated'
            }}
          >
            <div 
              className="absolute top-1 left-1 w-4 h-5 bg-white"
              style={{
                clipPath: 'polygon(0 0, 80% 0, 100% 20%, 100% 100%, 0 100%)',
                boxShadow: 'inset 1px 1px 0 #e5e7eb'
              }}
            />
            <div className="absolute top-2 left-2 w-2 h-1 bg-gray-800" />
            <div className="absolute top-3.5 left-2 w-2 h-1 bg-gray-800" />
          </div>
          
          <h1 
            className="text-2xl font-bold tracking-wider"
            style={{
              fontFamily: 'monospace',
              textShadow: '2px 2px 0 #000, -1px -1px 0 #fff',
              letterSpacing: '2px'
            }}
          >
            StudyMind AI
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div 
            className="px-3 py-1 bg-green-500 text-white text-sm font-bold border-2 border-green-300"
            style={pixelButtonStyle}
          >
            PRIVACY-FIRST
          </div>
          
          <div 
            className="px-3 py-1 bg-cyan-500 text-white text-sm font-bold border-2 border-cyan-300"
            style={pixelButtonStyle}
          >
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
  
  const pixelButtonStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    textShadow: '1px 1px 0 #000',
    boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.3), 2px 2px 0 #000',
    imageRendering: 'pixelated' as const
  };

  const pixelInputStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    boxShadow: 'inset 2px 2px 0 #333, inset -2px -2px 0 #fff, 2px 2px 0 #000',
    imageRendering: 'pixelated' as const
  };

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
    <div className="bg-gray-900 border-4 border-gray-700 rounded-none" style={pixelInputStyle}>
      <div className="p-4">
        <h2 className="text-white text-xl font-bold mb-4" style={{ fontFamily: 'monospace' }}>
          📝 INPUT YOUR CONTENT
        </h2>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your text here, or upload files below..."
          className="w-full h-32 p-3 bg-gray-800 text-white border-2 border-gray-600 rounded-none resize-none"
          style={pixelInputStyle}
        />

        <div className="flex flex-wrap gap-4 mt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold border-2 border-blue-400 hover:bg-blue-700 transition-colors"
            style={pixelButtonStyle}
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
            className={`flex items-center gap-2 px-4 py-2 font-bold border-2 transition-colors ${
              isRecording 
                ? 'bg-red-600 border-red-400 text-white animate-pulse' 
                : 'bg-purple-600 border-purple-400 text-white hover:bg-purple-700'
            }`}
            style={pixelButtonStyle}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-white font-bold mb-2" style={{ fontFamily: 'monospace' }}>UPLOADED FILES:</h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-2 border border-gray-600">
                  <div className="flex items-center gap-2 text-white">
                    {file.type.startsWith('image/') ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    <span style={{ fontFamily: 'monospace' }}>{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="px-2 py-1 bg-red-600 text-white text-xs font-bold border border-red-400"
                    style={pixelButtonStyle}
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
  selectedAction: string;
  setSelectedAction: (action: string) => void;
}

function ActionSection({ selectedAction, setSelectedAction }: ActionSectionProps) {
  const pixelButtonStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    textShadow: '1px 1px 0 #000',
    boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.3), 2px 2px 0 #000',
    imageRendering: 'pixelated' as const
  };

  const pixelInputStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    boxShadow: 'inset 2px 2px 0 #333, inset -2px -2px 0 #fff, 2px 2px 0 #000',
    imageRendering: 'pixelated' as const
  };

  const actions = [
    { id: 'summarize', label: 'SUMMARIZE', color: 'bg-blue-500 border-blue-300' },
    { id: 'questions', label: 'MAKE QUESTIONS', color: 'bg-purple-500 border-purple-300' },
    { id: 'translate', label: 'TRANSLATE', color: 'bg-green-500 border-green-300' },
    { id: 'proofread', label: 'PROOFREAD', color: 'bg-red-500 border-red-300' },
    { id: 'improve', label: 'IMPROVE WRITING', color: 'bg-orange-500 border-orange-300' },
    { id: 'explain', label: 'EXPLAIN SIMPLY', color: 'bg-cyan-500 border-cyan-300' }
  ];

  return (
    <div className="bg-gray-900 border-4 border-gray-700 rounded-none" style={pixelInputStyle}>
      <div className="p-4">
        <h2 className="text-white text-xl font-bold mb-4" style={{ fontFamily: 'monospace' }}>
          🎯 CHOOSE ACTION
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className={`px-4 py-3 text-white font-bold border-2 transition-all ${
                selectedAction === action.id 
                  ? `${action.color} scale-95` 
                  : `${action.color} hover:scale-105`
              }`}
              style={pixelButtonStyle}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Process Button Component
interface ProcessButtonProps {
  inputText: string;
  selectedFiles: File[];
  selectedAction: string;
  isProcessing: boolean;
  onProcess: () => void;
}

function ProcessButton({ inputText, selectedFiles, selectedAction, isProcessing, onProcess }: ProcessButtonProps) {
  const pixelButtonStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    textShadow: '1px 1px 0 #000',
    boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.3), 2px 2px 0 #000',
    imageRendering: 'pixelated' as const
  };

  return (
    <div className="text-center">
      <button
        onClick={onProcess}
        disabled={(!inputText.trim() && selectedFiles.length === 0) || !selectedAction || isProcessing}
        className="px-8 py-4 bg-yellow-500 text-black font-bold text-xl border-4 border-yellow-300 hover:bg-yellow-400 disabled:bg-gray-600 disabled:border-gray-500 disabled:text-gray-400 transition-all"
        style={pixelButtonStyle}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            PROCESSING...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-6 h-6" />
            PROCESS WITH AI
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
  
  const pixelButtonStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    textShadow: '1px 1px 0 #000',
    boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.3), 2px 2px 0 #000',
    imageRendering: 'pixelated' as const
  };

  const pixelInputStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    boxShadow: 'inset 2px 2px 0 #333, inset -2px -2px 0 #fff, 2px 2px 0 #000',
    imageRendering: 'pixelated' as const
  };

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
      <div className="bg-gray-900 border-4 border-gray-700 rounded-none" style={pixelInputStyle}>
        <div className="p-4 text-center">
          <h2 className="text-white text-xl font-bold mb-4" style={{ fontFamily: 'monospace' }}>
            ✨ RESULT
          </h2>
          <div className="text-gray-400" style={{ fontFamily: 'monospace' }}>
            Results will appear here after processing...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border-4 border-gray-700 rounded-none" style={pixelInputStyle}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold" style={{ fontFamily: 'monospace' }}>
            ✨ RESULT
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1 text-white text-sm font-bold border-2 transition-all ${
                copied 
                  ? 'bg-green-600 border-green-400' 
                  : 'bg-blue-600 border-blue-400 hover:bg-blue-700'
              }`}
              style={pixelButtonStyle}
            >
              {copied ? <Check className="w-4 h-4 inline mr-1" /> : <Copy className="w-4 h-4 inline mr-1" />}
              {copied ? 'COPIED!' : 'COPY'}
            </button>
            <button
              onClick={handleSpeak}
              className="px-3 py-1 bg-purple-600 text-white text-sm font-bold border-2 border-purple-400 hover:bg-purple-700 transition-colors"
              style={pixelButtonStyle}
            >
              <Volume2 className="w-4 h-4 inline mr-1" />
              SPEAK
            </button>
          </div>
        </div>
        
        <div 
          className="bg-gray-800 border-2 border-gray-600 p-4 text-white whitespace-pre-line max-h-80 overflow-y-auto"
          style={{ fontFamily: 'monospace', lineHeight: '1.6' }}
        >
          {result}
        </div>
      </div>
    </div>
  );
}

// Main App Component - Bottom Layout
export default function StudyMindApp() {
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [result, setResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return;
    if (!selectedAction) return;

    setIsProcessing(true);
    
    setTimeout(() => {
      let mockResult = '';
      switch (selectedAction) {
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
      setResult(mockResult);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f0f23 0%, #1e1b4b 25%, #312e81 50%, #4c1d95 75%, #581c87 100%)'
    }}>
      <Header />
      
      <div className="container mx-auto p-6 max-w-6xl">
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
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
          />
        </div>
        
        <div className="mb-6">
          <ProcessButton 
            inputText={inputText}
            selectedFiles={selectedFiles}
            selectedAction={selectedAction}
            isProcessing={isProcessing}
            onProcess={handleProcess}
          />
        </div>
        
        {/* Bottom Section - Results */}
        <ResultSection result={result} />
      </div>

      <footer className="text-center text-white/70 p-4" style={{ fontFamily: 'monospace' }}>
        StudyMind AI - Your Privacy-First Study Companion
      </footer>
    </div>
  );
}