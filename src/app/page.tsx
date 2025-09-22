// app/page.tsx
'use client';

import React, { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ActionSection from './components/ActionSection';
import ProcessButton from './components/ProcessButton';
import ResultSection from './components/ResultSection';

export default function StudyMindApp() {
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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