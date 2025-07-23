'use client';

import { useState } from 'react';
import { TextAnalysis, GrammarSuggestion } from '@/types';
import { cn } from '@/utils/helpers';
import { LuMinimize2 } from 'react-icons/lu'
import { BsLightningChargeFill } from 'react-icons/bs';
import { CompactAnalysisHeader } from './CompactAnalysisHeader';
import BuyMeACoffeeButton from './BuyMeACoffeeButton';
import Footer from './footer';

interface CompactAnalysisPanelProps {
  analysis: TextAnalysis;
  grammarSuggestions: GrammarSuggestion[];
  translation: string;
  isLoading?: boolean;
  onToggleAi: (enabled: boolean) => void;
  onShowAiWarning: () => void;
  isMinimized: boolean;
  onToggleMinimize: (minimized: boolean) => void;
  apiRequestCount: number;
  apiRequestLimit: number;
}

export function CompactAnalysisPanel({
  analysis,
  grammarSuggestions,
  translation,
  isLoading,
  onToggleAi,
  onShowAiWarning,
  isMinimized,
  onToggleMinimize,
  apiRequestCount,
  apiRequestLimit,
}: CompactAnalysisPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false); // For detailed AI suggestions
  const [isExpandedNP, setIsExpandedNP] = useState(false); // For detailed non-standard phrases

  const grammarErrors = grammarSuggestions.filter(s => s.error);

  // Function to trigger AI analysis
  const handleAnalyzeClick = () => {

    // Call the global analyze function that's exposed by the TipTapTextEditor
    if (typeof window !== 'undefined' && window.requestAiAnalysis) {
      window.requestAiAnalysis();
    }
  };

  const handleExpandSuggestions = () => {
    setIsExpanded(!isExpanded);
  };

  const handleExpandNPhrases = () => {
    setIsExpandedNP(!isExpandedNP);
  };

  // Normal expanded state - integrated with flex layout
  return (
    <aside>
      <div className="w-full flex flex-col sm:w-60 sm:shrink-0 shadow-md bg-slate-200 dark:bg-slate-700">
        {/* Header */}
        <CompactAnalysisHeader
          isMinimized={isMinimized}
          isLoading={isLoading}
          apiRequestCount={apiRequestCount}
          apiRequestLimit={apiRequestLimit}
        />

        {/* Content area - more compact */}
        <div className="flex-1 overflow-y-auto text-sm">
          {/* AI Analysis Button */}
          <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={handleAnalyzeClick}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} transition-colors`}
            >
              {isLoading ? (
                <>
                  <span className="loader-small"></span>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <BsLightningChargeFill />
                  <span>Check</span>
                </>
              )}
            </button>
          </div>

          {/* AI Grammar Section */}
          <div
            className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b"
            style={{ borderColor: 'var(--border-color)' }}
            onClick={handleExpandSuggestions}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--panel-grammar-dot)' }}></div>
              <span className="font-medium">AI Suggestions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{grammarSuggestions.length}</span>
            </div>
          </div>

          {/* Expanded AI suggestions */}
          {isExpanded && (
            <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="ai-suggestions-scroll space-y-2 max-h-[200px] overflow-auto">
                {grammarSuggestions.length > 0 ? (
                  grammarSuggestions.map((item, index) => (
                    item.error ? (
                      <div key={index} className="text-xs p-2 rounded border-l-2" style={{
                        backgroundColor: 'var(--suggestion-bg)',
                        borderColor: 'var(--panel-grammar-dot)'
                      }}>
                        <div className="space-y-1" dir="ltr">
                          <div className="font-medium text-red-500 line-through text-right" dir="ltr">{item.error}</div>
                          <div className="text-xs italic text-gray-500 dark:text-gray-400 mt-1 text-right" dir="ltr">{item.explanation}</div>
                          <div className="text-green-600 dark:text-green-400 font-medium text-right" dir="rtl">{item.suggestion}</div>
                        </div>
                      </div>
                    ): null
                  ))
                ) : (
                  <div className="text-xs italic" style={{ color: 'var(--text-subtle)' }}>
                    {isLoading ? 'Analyzing...' : 'Click "Check" to get suggestions'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics in a more compact form */}
          <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              <div className="flex justify-between mb-1">
                <span>Words:</span>
                <span className="font-bold">{analysis.wordCount}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Sentences:</span>
                <span className="font-bold">{analysis.sentenceCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Characters:</span>
                <span className="font-bold">{analysis.charCount}</span>
              </div>
            </div>
          </div>

          {/* Translation Section */}
          <div className="p-3">
            <div className="text-xs font-bold mb-2">Translation (Google)</div>
            <div className="text-xs overflow-y-auto max-h-28 bg-gray-50 dark:bg-gray-800 p-2 rounded" dir="ltr">
              {isLoading ? 'Translating...' : translation || 'Click "Analyze Text" to translate'}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center px-2 py-2">
        <div className="mt-2 mb-2">
          <BuyMeACoffeeButton/>
        </div>
        <Footer/>
      </div>
    </aside>
  );
}

// Add TypeScript declaration for the global analyze function
declare global {
  interface Window {
    requestAiAnalysis?: () => void;
  }
}
