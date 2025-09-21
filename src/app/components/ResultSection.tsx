// components/ResultSection.tsx
import React, { useState } from 'react';
import { Copy, Check, Volume2 } from 'lucide-react';

interface ResultSectionProps {
  result: string;
}

export default function ResultSection({ result }: ResultSectionProps) {
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