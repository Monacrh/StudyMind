// components/InputSection.tsx
import React, { useRef } from 'react';
import { Upload, FileText, Image } from 'lucide-react';

interface InputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function InputSection({ 
  inputText, 
  setInputText, 
  selectedFiles, 
  setSelectedFiles
}: InputSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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