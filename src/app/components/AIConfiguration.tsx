// components/AIConfig.tsx
import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';

export interface AIConfigOptions {
  // Summarizer options
  summaryType: 'key-points' | 'tldr' | 'teaser' | 'headline';
  summaryLength: 'short' | 'medium' | 'long';
  summaryFormat: 'markdown' | 'plain-text';
  
  // Translator options
  translateTo: string;
  translateFrom: string; // 'auto' for auto-detect
  
  // Proofreader options
  proofreadLanguage: string;
  includeCorrectionTypes: boolean;
  includeCorrectionExplanation: boolean;
}

interface AIConfigProps {
  isVisible: boolean;
  onClose: () => void;
  config: AIConfigOptions;
  onConfigChange: (config: AIConfigOptions) => void;
}

export default function AIConfig({ isVisible, onClose, config, onConfigChange }: AIConfigProps) {
  const [localConfig, setLocalConfig] = useState<AIConfigOptions>(config);

  const languageOptions = [
    { code: 'auto', name: '🔍 Auto Detect' },
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

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  const handleReset = () => {
    const defaultConfig: AIConfigOptions = {
      summaryType: 'key-points',
      summaryLength: 'medium',
      summaryFormat: 'markdown',
      translateTo: 'id',
      translateFrom: 'auto',
      proofreadLanguage: 'en',
      includeCorrectionTypes: true,
      includeCorrectionExplanation: true
    };
    setLocalConfig(defaultConfig);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#F3DEBA] border-4 border-[#675D50] shadow-[8px_8px_0px_0px_#675D50] w-full max-w-4xl my-8">
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#F3DEBA] pb-4 border-b-2 border-[#675D50]">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-[#675D50]" />
              <h2 
                className="text-[#675D50] text-xl font-bold transform -skew-x-3"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
              >
                ⚙️ AI CONFIGURATION
              </h2>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-red-400 text-[#675D50] font-bold border-2 border-[#675D50] shadow-[2px_2px_0px_0px_#675D50] hover:shadow-[1px_1px_0px_0px_#675D50] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              CLOSE
            </button>
          </div>

          {/* Summarizer Configuration */}
          <div className="bg-[#ABC4AA] border-2 border-[#675D50] p-4 shadow-[3px_3px_0px_0px_#675D50] mb-4">
            <h3 className="font-bold text-[#675D50] mb-3 text-lg">📝 SUMMARIZER SETTINGS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Summary Type */}
              <div>
                <label className="block text-[#675D50] font-bold text-sm mb-2">Type:</label>
                <select
                  value={localConfig.summaryType}
                  onChange={(e) => setLocalConfig({...localConfig, summaryType: e.target.value as AIConfigOptions['summaryType']})}
                  className="w-full p-2 bg-[#F3DEBA] text-[#675D50] border-2 border-[#675D50] font-bold text-sm"
                >
                  <option value="key-points">KEY POINTS</option>
                  <option value="tldr">TL;DR</option>
                  <option value="teaser">TEASER</option>
                  <option value="headline">HEADLINE</option>
                </select>
              </div>

              {/* Summary Length */}
              <div>
                <label className="block text-[#675D50] font-bold text-sm mb-2">Length:</label>
                <select
                  value={localConfig.summaryLength}
                  onChange={(e) => setLocalConfig({...localConfig, summaryLength: e.target.value as AIConfigOptions['summaryLength']})}
                  className="w-full p-2 bg-[#F3DEBA] text-[#675D50] border-2 border-[#675D50] font-bold text-sm"
                >
                  <option value="short">SHORT</option>
                  <option value="medium">MEDIUM</option>
                  <option value="long">LONG</option>
                </select>
              </div>

              {/* Summary Format */}
              <div>
                <label className="block text-[#675D50] font-bold text-sm mb-2">Format:</label>
                <select
                  value={localConfig.summaryFormat}
                  onChange={(e) => setLocalConfig({...localConfig, summaryFormat: e.target.value as AIConfigOptions['summaryFormat']})}
                  className="w-full p-2 bg-[#F3DEBA] text-[#675D50] border-2 border-[#675D50] font-bold text-sm"
                >
                  <option value="markdown">MARKDOWN</option>
                  <option value="plain-text">PLAIN TEXT</option>
                </select>
              </div>
            </div>

            {/* Summary Type Descriptions */}
            <div className="mt-3 p-2 bg-[#F3DEBA] border border-dashed border-[#675D50]">
              <p className="text-[#675D50] text-xs">
                <strong>KEY POINTS:</strong> Bullet list of important points • 
                <strong>TL;DR:</strong> Quick overview • 
                <strong>TEASER:</strong> Most interesting parts • 
                <strong>HEADLINE:</strong> Single sentence summary
              </p>
            </div>
          </div>

          {/* Translator Configuration */}
          <div className="bg-[#ABC4AA] border-2 border-[#675D50] p-4 shadow-[3px_3px_0px_0px_#675D50] mb-4">
            <h3 className="font-bold text-[#675D50] mb-3 text-lg">🌐 TRANSLATOR SETTINGS</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Translate From */}
              <div>
                <label className="block text-[#675D50] font-bold text-sm mb-2">From Language:</label>
                <select
                  value={localConfig.translateFrom}
                  onChange={(e) => setLocalConfig({...localConfig, translateFrom: e.target.value})}
                  className="w-full p-2 bg-[#F3DEBA] text-[#675D50] border-2 border-[#675D50] font-bold text-sm"
                >
                  {languageOptions.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Translate To */}
              <div>
                <label className="block text-[#675D50] font-bold text-sm mb-2">To Language:</label>
                <select
                  value={localConfig.translateTo}
                  onChange={(e) => setLocalConfig({...localConfig, translateTo: e.target.value})}
                  className="w-full p-2 bg-[#F3DEBA] text-[#675D50] border-2 border-[#675D50] font-bold text-sm"
                >
                  {languageOptions.filter(lang => lang.code !== 'auto').map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 p-2 bg-[#F3DEBA] border border-dashed border-[#675D50]">
              <p className="text-[#675D50] text-xs">
                <strong>Auto Detect:</strong> Let AI detect the source language automatically • 
                <strong>Manual:</strong> Specify exact source language for better accuracy
              </p>
            </div>
          </div>

          {/* Proofreader Configuration */}
          <div className="bg-[#ABC4AA] border-2 border-[#675D50] p-4 shadow-[3px_3px_0px_0px_#675D50] mb-4">
            <h3 className="font-bold text-[#675D50] mb-3 text-lg">✏️ PROOFREADER SETTINGS</h3>
            
            <div className="space-y-4">
              {/* Proofread Language */}
              <div>
                <label className="block text-[#675D50] font-bold text-sm mb-2">Expected Language:</label>
                <select
                  value={localConfig.proofreadLanguage}
                  onChange={(e) => setLocalConfig({...localConfig, proofreadLanguage: e.target.value})}
                  className="w-full p-2 bg-[#F3DEBA] text-[#675D50] border-2 border-[#675D50] font-bold text-sm"
                >
                  <option value="en">🇺🇸 ENGLISH</option>
                  <option value="id">🇮🇩 INDONESIAN</option>
                  <option value="es">🇪🇸 SPANISH</option>
                  <option value="fr">🇫🇷 FRENCH</option>
                  <option value="de">🇩🇪 GERMAN</option>
                </select>
              </div>

              {/* Correction Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.includeCorrectionTypes}
                    onChange={(e) => setLocalConfig({...localConfig, includeCorrectionTypes: e.target.checked})}
                    className="w-4 h-4 border-2 border-[#675D50]"
                  />
                  <span className="text-[#675D50] font-bold text-sm">
                    📌 Include Correction Types
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.includeCorrectionExplanation}
                    onChange={(e) => setLocalConfig({...localConfig, includeCorrectionExplanation: e.target.checked})}
                    className="w-4 h-4 border-2 border-[#675D50]"
                  />
                  <span className="text-[#675D50] font-bold text-sm">
                    💡 Include Correction Explanations
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-3 p-2 bg-[#F3DEBA] border border-dashed border-[#675D50]">
              <p className="text-[#675D50] text-xs">
                <strong>Correction Types:</strong> Shows error categories (grammar, spelling, punctuation) • 
                <strong>Explanations:</strong> Provides reasons for each correction
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 sticky bottom-0 bg-[#F3DEBA] pt-4 border-t-2 border-[#675D50]">
            <button
              onClick={handleSave}
              className="flex-1 min-w-[150px] px-4 py-3 bg-green-400 text-[#675D50] font-bold border-2 border-[#675D50] shadow-[3px_3px_0px_0px_#675D50] hover:shadow-[1px_1px_0px_0px_#675D50] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              ✅ SAVE SETTINGS
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-orange-400 text-[#675D50] font-bold border-2 border-[#675D50] shadow-[3px_3px_0px_0px_#675D50] hover:shadow-[1px_1px_0px_0px_#675D50] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              🔄 RESET
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-400 text-[#675D50] font-bold border-2 border-[#675D50] shadow-[3px_3px_0px_0px_#675D50] hover:shadow-[1px_1px_0px_0px_#675D50] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              ❌ CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}