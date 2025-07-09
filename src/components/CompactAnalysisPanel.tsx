'use client';

import { useState } from 'react';
import { TextAnalysis, GrammarSuggestion } from '@/types';

interface CompactAnalysisPanelProps {
  analysis: TextAnalysis;
  grammarSuggestions: GrammarSuggestion[];
  translation: string;
  isLoading?: boolean;
  aiEnabled: boolean;
  onToggleAi: (enabled: boolean) => void;
  onShowAiWarning: () => void;
}

export function CompactAnalysisPanel({
  analysis,
  grammarSuggestions,
  translation,
  isLoading,
  aiEnabled,
  onToggleAi,
  onShowAiWarning
}: CompactAnalysisPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!aiEnabled) {
      onShowAiWarning();
    } else {
      onToggleAi(false);
    }
  };

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Collapsed State - Bordered and clickable with color indicators */}
      {!isExpanded && (
        <div
          className="fixed right-4 top-1/2 transform -translate-y-1/2 cursor-pointer border-2 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          onClick={handleExpandClick}
          style={{
            zIndex: 50,
            backgroundColor: 'var(--bg-panel)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="space-y-2 text-right text-sm">
            <div className="flex items-center justify-end gap-2 hover:opacity-75 transition-opacity">
              <span className="font-medium">{aiEnabled ? grammarSuggestions.length : 0}</span>
              <span style={{ color: 'var(--text-subtle)' }}>AI:</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-grammar-dot)' }}></div>
            </div>
            <div className="flex items-center justify-end gap-2 hover:opacity-75 transition-opacity">
              <span className="font-medium">{analysis.longSentenceCount}</span>
              <span style={{ color: 'var(--text-subtle)' }}>Long:</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-long-dot)' }}></div>
            </div>
            <div className="flex items-center justify-end gap-2 hover:opacity-75 transition-opacity">
              <span className="font-medium">{analysis.veryLongSentenceCount}</span>
              <span style={{ color: 'var(--text-subtle)' }}>VLong:</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-verylong-dot)' }}></div>
            </div>
            <div className="flex items-center justify-end gap-2 hover:opacity-75 transition-opacity">
              <span className="font-medium">{analysis.adverbCount}</span>
              <span style={{ color: 'var(--text-subtle)' }}>Adv:</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-adverb-dot)' }}></div>
            </div>
            <div className="flex items-center justify-end gap-2 hover:opacity-75 transition-opacity">
              <span className="font-medium">{analysis.passiveCount}</span>
              <span style={{ color: 'var(--text-subtle)' }}>Pass:</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-passive-dot)' }}></div>
            </div>
            <div className="flex items-center justify-end gap-2 hover:opacity-75 transition-opacity">
              <span className="font-medium">{analysis.weakPhraseCount}</span>
              <span style={{ color: 'var(--text-subtle)' }}>Weak:</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-weak-dot)' }}></div>
            </div>
            <div className="hover:opacity-75 transition-opacity mt-4 pt-2 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
              <div style={{ color: 'var(--text-subtle)' }}>
                {analysis.wordCount}w {analysis.sentenceCount}s {analysis.charCount}c
              </div>
            </div>
            <div className="text-center text-xs mt-2" style={{ color: 'var(--text-subtle)' }}>
              Click to expand
            </div>
          </div>
        </div>
      )}

      {/* Expanded State - Fixed sidebar that doesn't overlap editor */}
      {isExpanded && (
        <>
          {/* Backdrop overlay to shift main content */}
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'transparent' }}
            onClick={handleExpandClick}
          />

          <div className="fixed right-0 top-0 h-full w-80 shadow-2xl z-50 compact-analysis-expanded" style={{ backgroundColor: 'var(--bg-panel)' }}>
            <div className="h-full overflow-y-auto p-6">
              <div className="flex justify-between items-center border-b pb-3 mb-4" style={{ borderColor: 'var(--border-color)' }}>
                <h2 className="text-xl font-bold">Analysis</h2>
                <button
                  onClick={handleExpandClick}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* AI Grammar Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--panel-grammar-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-grammar-dot)' }}></div>
                    <span className="font-semibold text-sm">AI Grammar: {aiEnabled ? grammarSuggestions.length : 0}</span>
                  </div>
                  <button
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${aiEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                    onClick={handleToggleClick}
                  >
                    {aiEnabled ? "ON" : "OFF"}
                  </button>
                </div>

                {/* Grammar suggestions */}
                {aiEnabled && grammarSuggestions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {grammarSuggestions.map((item, index) => (
                      <div key={index} className="text-xs p-3 rounded-lg border-l-4" style={{
                        backgroundColor: 'var(--suggestion-bg)',
                        borderColor: 'var(--panel-grammar-dot)'
                      }}>
                        <div className="space-y-1">
                          <div className="font-medium" style={{ color: 'var(--text-subtle)' }}>Error:</div>
                          <div className="line-through text-red-500 font-medium">{item.error}</div>
                          <div className="font-medium" style={{ color: 'var(--text-subtle)' }}>Suggestion:</div>
                          <div className="text-green-600 dark:text-green-400 font-medium">{item.suggestion}</div>
                          <div className="text-xs mt-2" style={{ color: 'var(--text-subtle)' }}>{item.explanation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!aiEnabled && (
                  <div className="text-xs p-3 rounded" style={{ backgroundColor: 'var(--suggestion-bg)', color: 'var(--text-subtle)' }}>
                    Enable AI analysis to see grammar suggestions
                  </div>
                )}
              </div>

              {/* Other metrics */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--panel-long-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-long-dot)' }}></div>
                    <span className="text-sm font-medium">Long Sentences</span>
                  </div>
                  <span className="text-sm font-bold">{analysis.longSentenceCount}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--panel-verylong-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-verylong-dot)' }}></div>
                    <span className="text-sm font-medium">Very Long</span>
                  </div>
                  <span className="text-sm font-bold">{analysis.veryLongSentenceCount}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--panel-adverb-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-adverb-dot)' }}></div>
                    <span className="text-sm font-medium">Adverbs</span>
                  </div>
                  <span className="text-sm font-bold">{analysis.adverbCount}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--panel-passive-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-passive-dot)' }}></div>
                    <span className="text-sm font-medium">Passive Voice</span>
                  </div>
                  <span className="text-sm font-bold">{analysis.passiveCount}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--panel-weak-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--panel-weak-dot)' }}></div>
                    <span className="text-sm font-medium">Weak Phrases</span>
                  </div>
                  <span className="text-sm font-bold">{analysis.weakPhraseCount}</span>
                </div>
              </div>

              {/* Statistics */}
              <div className="border-t pt-4 mb-6" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-bold mb-3">Statistics</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-bold">{analysis.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sentences:</span>
                    <span className="font-bold">{analysis.sentenceCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-bold">{analysis.charCount}</span>
                  </div>
                </div>
              </div>

              {/* Translation */}
              {aiEnabled && (
                <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                  <h3 className="text-sm font-bold mb-3">Translation</h3>
                  <div className="text-xs p-3 rounded-lg" style={{ backgroundColor: 'var(--suggestion-bg)', direction: 'ltr' }}>
                    {isLoading ? 'Translating...' : translation}
                  </div>
                </div>
              )}

              {isLoading && aiEnabled && (
                <div className="flex items-center justify-center gap-2 mt-4 text-sm" style={{ color: 'var(--text-subtle)' }}>
                  <span className="loader"></span>
                  <span>AI Analysis...</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
