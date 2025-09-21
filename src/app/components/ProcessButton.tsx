// components/ProcessButton.tsx
import React from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ProcessButtonProps {
  inputText: string;
  selectedFiles: File[];
  selectedActions: string[];
  isProcessing: boolean;
  onProcess: () => void;
}

export default function ProcessButton({ 
  inputText, 
  selectedFiles, 
  selectedActions, 
  isProcessing, 
  onProcess 
}: ProcessButtonProps) {
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