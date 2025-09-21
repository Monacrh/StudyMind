// components/ActionSection.tsx
import React from 'react';
import { Check } from 'lucide-react';

interface ActionSectionProps {
  selectedActions: string[];
  setSelectedActions: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ActionSection({ selectedActions, setSelectedActions }: ActionSectionProps) {
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