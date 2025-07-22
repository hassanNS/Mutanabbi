'use client';

import { useState } from 'react';
import { TextAnalysis, GrammarSuggestion } from '@/types';
import { cn } from '@/utils/helpers';
import { LuMinimize2 } from 'react-icons/lu'
import { CompactAnalysisHeader } from './CompactAnalysisHeader';
import BuyMeACoffeeButton from './BuyMeACoffeeButton';
import Footer from './footer';

interface CompactAnalysisPanelProps {
  analysis: TextAnalysis;
  grammarSuggestions: GrammarSuggestion[];
  translation: string;
  isLoading?: boolean;
  aiEnabled: boolean;
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
  aiEnabled,
  onToggleAi,
  onShowAiWarning,
  isMinimized,
  onToggleMinimize,
  apiRequestCount,
  apiRequestLimit,
}: CompactAnalysisPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false); // For detailed AI suggestions

  const grammarErrors = grammarSuggestions.filter(s => s.error);
  const nonStandardPhrases = grammarSuggestions.filter(s => s.nonStandardPhrase);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!aiEnabled) {
      onShowAiWarning();
    } else {
      onToggleAi(false);
    }
  };

  // Handle minimize/expand
  const handleMinimizeClick = () => {
    onToggleMinimize(!isMinimized);
  };

  const handleExpandSuggestions = () => {
    setIsExpanded(!isExpanded);
  };

  // If in minimized state, show the floating panel
  if (isMinimized) {
    return (
      <aside className="w-full mt-4 sm:mt-0 sm:w-60 sm:shrink-0 shadow-md rounded-lg" style={{ backgroundColor: 'var(--bg-panel)' }}>
        <CompactAnalysisHeader
          isMinimized={isMinimized}
          isLoading={isLoading}
          aiEnabled={aiEnabled}
          handleMinimizeClick={handleMinimizeClick}
          apiRequestCount={apiRequestCount}
          apiRequestLimit={apiRequestLimit}
        />
        <div className="py-4 px-4 text-left text-md">
          <div className="flex items-center justify-left gap-2 hover:opacity-75 transition-opacity">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-grammar-dot)' }}></div>
            {isLoading && aiEnabled && <span className="loader-small ml-1"></span>}
            <span style={{ color: 'var(--text-subtle)' }}>Grammar/Spelling:</span>
            <span className="font-medium">{aiEnabled ? grammarErrors.length : 0}</span>
          </div>
          <div className="flex items-center justify-left gap-2 hover:opacity-75 transition-opacity mt-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--hemingway-weak-dot)' }}></div>
            <span style={{ color: 'var(--text-subtle)' }}>Non-Standard:</span>
            <span className="font-medium">{aiEnabled ? nonStandardPhrases.length : 0}</span>
          </div>
          <div className="hover:opacity-75 transition-opacity mt-4 pt-2 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
            <div style={{ color: 'var(--text-subtle)' }}>
              {analysis.wordCount}w {analysis.sentenceCount}s
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // Normal expanded state - integrated with flex layout
  return (
    <aside>
      <div className="w-full flex flex-col sm:w-60 sm:shrink-0 shadow-md bg-slate-200 dark:bg-slate-700">
        {/* Header */}
        <CompactAnalysisHeader
          isMinimized={isMinimized}
          isLoading={isLoading}
          aiEnabled={aiEnabled}
          handleMinimizeClick={handleMinimizeClick}
          apiRequestCount={apiRequestCount}
          apiRequestLimit={apiRequestLimit}
        />

        {/* Content area - more compact */}
        <div className="flex-1 overflow-y-auto text-sm">
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
              <span className="font-bold">{aiEnabled ? grammarSuggestions.length : 0}</span>
              <button
                className={`ml-2 text-xs px-2 py-2 rounded transition-colors ${aiEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!aiEnabled) onShowAiWarning();
                  else onToggleAi(false);
                }}
              >
                {aiEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Expanded AI suggestions */}
          {isExpanded && aiEnabled && (
            <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="ai-suggestions-scroll space-y-2">
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
                    ) : item.nonStandardPhrase ? (
                      <div key={index} className="text-xs p-2 rounded border-l-2" style={{
                        backgroundColor: 'var(--suggestion-bg)',
                        borderColor: 'var(--hemingway-green)'
                      }}>
                        <div className="space-y-1" dir="ltr">
                          <div className="font-medium text-yellow-600 dark:text-yellow-400 line-through text-right" dir="ltr">{item.nonStandardPhrase}</div>
                          <div className="text-xs italic text-gray-500 dark:text-gray-400 mt-1 text-right" dir="ltr">{item.explanation}</div>
                          <div className="text-green-600 dark:text-green-400 font-medium text-right" dir="rtl">{item.suggestion}</div>
                        </div>
                      </div>
                    ) : null
                  ))
                ) : (
                  <div className="text-xs italic" style={{ color: 'var(--text-subtle)' }}>
                    No suggestions
                  </div>
                )}
              </div>
            </div>
          )}

          {isExpanded && aiEnabled && (
            <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--panel-weak-dot)' }}></div>
                <span className="font-medium">Non-Standard Phrases</span>
              </div>
              <span className="font-bold">{nonStandardPhrases.length}</span>
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
          {aiEnabled && (
            <div className="p-3">
              <div className="text-xs font-bold mb-2">Translation (Google)</div>
              <div className="text-xs overflow-y-auto max-h-28 bg-gray-50 dark:bg-gray-800 p-2 rounded" dir="ltr">
                {isLoading ? 'Translating...' : translation}
              </div>
            </div>
          )}
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
