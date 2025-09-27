// components/AIStatus.tsx
import React, { useState, useEffect } from 'react';
import { Info, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import SummarizerService from '../services/summarizerService';

interface AIStatusProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AIStatus({ isVisible, onClose }: AIStatusProps) {
  const [availability, setAvailability] = useState<string>('checking');
  const [supported, setSupported] = useState(false);
  const [requirements, setRequirements] = useState<string[]>([]);

  const summarizerService = SummarizerService.getInstance();

  useEffect(() => {
    const checkStatus = async () => {
      const isSupported = summarizerService.isSupported();
      setSupported(isSupported);
      setRequirements(summarizerService.getSystemRequirements());

      if (isSupported) {
        const status = await summarizerService.checkAvailability();
        setAvailability(status);
      } else {
        setAvailability('unavailable');
      }
    };

    if (isVisible) {
      checkStatus();
    }
  }, [isVisible]);

  const getStatusInfo = () => {
    switch (availability) {
      case 'available':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          title: 'AI Ready',
          message: 'Chrome\'s built-in AI is ready to use!',
          color: 'bg-green-100 border-green-500'
        };
      case 'downloadable':
        return {
          icon: <Download className="w-5 h-5 text-blue-600" />,
          title: 'AI Downloadable',
          message: 'AI model will be downloaded when first used.',
          color: 'bg-blue-100 border-blue-500'
        };
      case 'unavailable':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          title: 'AI Unavailable',
          message: supported ? 'Your device doesn\'t meet the requirements.' : 'Browser not supported.',
          color: 'bg-red-100 border-red-500'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-gray-600" />,
          title: 'Checking...',
          message: 'Checking AI availability...',
          color: 'bg-gray-100 border-gray-500'
        };
    }
  };

  if (!isVisible) return null;

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F3DEBA] border-4 border-[#675D50] shadow-[8px_8px_0px_0px_#675D50] max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-[#675D50] text-xl font-bold transform -skew-x-3"
              style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
            >
              🤖 AI STATUS
            </h2>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#675D50] text-[#F3DEBA] font-bold border-2 border-[#675D50] shadow-[2px_2px_0px_0px_#ABC4AA] hover:shadow-[1px_1px_0px_0px_#ABC4AA] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              CLOSE
            </button>
          </div>

          {/* Status Card */}
          <div className={`p-4 border-2 ${statusInfo.color} shadow-[3px_3px_0px_0px_#675D50] mb-4`}>
            <div className="flex items-center gap-3 mb-2">
              {statusInfo.icon}
              <h3 className="font-bold text-[#675D50]">{statusInfo.title}</h3>
            </div>
            <p className="text-[#675D50] text-sm">{statusInfo.message}</p>
          </div>

          {/* System Requirements */}
          <div className="bg-[#ABC4AA] border-2 border-[#675D50] p-4 shadow-[2px_2px_0px_0px_#675D50] mb-4">
            <h3 className="font-bold text-[#675D50] mb-2">System Requirements:</h3>
            <ul className="text-[#675D50] text-xs space-y-1">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#675D50]">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="bg-[#F3DEBA] border-2 border-dashed border-[#675D50] p-3">
            <p className="text-[#675D50] text-xs">
              <strong>Note:</strong> When AI is unavailable, StudyMind will use fallback mock responses. For real AI summarization, ensure your Chrome browser meets the requirements above.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => window.open('chrome://on-device-internals', '_blank')}
              className="flex-1 px-3 py-2 bg-[#ABC4AA] text-[#675D50] font-bold text-sm border-2 border-[#675D50] shadow-[2px_2px_0px_0px_#675D50] hover:shadow-[1px_1px_0px_0px_#675D50] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              CHECK CHROME AI
            </button>
            <button
              onClick={() => window.open('https://developer.chrome.com/docs/ai/summarizer-api', '_blank')}
              className="flex-1 px-3 py-2 bg-[#675D50] text-[#F3DEBA] font-bold text-sm border-2 border-[#675D50] shadow-[2px_2px_0px_0px_#ABC4AA] hover:shadow-[1px_1px_0px_0px_#ABC4AA] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              LEARN MORE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}