// components/Header.tsx
import React, { useState } from 'react';
import AIStatus from './AIStatus';

export default function Header() {
  const [showAIStatus, setShowAIStatus] = useState(false);

  return (
    <>
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
            <button
              onClick={() => setShowAIStatus(true)}
              className="px-3 py-1 bg-blue-400 text-[#675D50] font-bold text-sm border-2 border-[#675D50] shadow-[3px_3px_0px_0px_#F3DEBA] hover:-translate-y-0.5 transition-transform"
            >
              🤖 AI STATUS
            </button>
            
            <div className="px-3 py-1 bg-[#ABC4AA] text-[#675D50] font-bold text-sm border-2 border-[#675D50] shadow-[3px_3px_0px_0px_#F3DEBA] hover:-translate-y-0.5 transition-transform">
              PRIVACY-FIRST
            </div>
            
            <div className="px-3 py-1 bg-[#F3DEBA] text-[#675D50] font-bold text-sm border-2 border-[#675D50] shadow-[3px_3px_0px_0px_#ABC4AA] hover:-translate-y-0.5 transition-transform">
              OFFLINE READY
            </div>
          </div>
        </div>
      </header>

      <AIStatus 
        isVisible={showAIStatus}
        onClose={() => setShowAIStatus(false)}
      />
    </>
  );
}