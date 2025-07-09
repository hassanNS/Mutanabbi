'use client';

import { useState } from 'react';
import { TextEditor } from '@/components/TextEditor';
import { CompactAnalysisPanel } from '@/components/CompactAnalysisPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AiWarningModal } from '@/components/AiWarningModal';
import { TextAnalysis, GrammarSuggestion } from '@/types';

export default function Home() {
  const [analysis, setAnalysis] = useState<TextAnalysis>({
    wordCount: 0,
    sentenceCount: 0,
    charCount: 0,
    longSentenceCount: 0,
    veryLongSentenceCount: 0,
    adverbCount: 0,
    adverbs: [],
    passiveCount: 0,
    passives: [],
    weakPhraseCount: 0,
    weakPhrases: [],
    grammarCount: 0
  });

  const [grammarSuggestions, setGrammarSuggestions] = useState<GrammarSuggestion[]>([]);
  const [translation, setTranslation] = useState('...');
  const [isLoading, setIsLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [showAiWarning, setShowAiWarning] = useState(false);

  // Handle functional updates to grammar suggestions
  const handleGrammarSuggestionsChange = (suggestionsOrUpdater: GrammarSuggestion[] | ((prev: GrammarSuggestion[]) => GrammarSuggestion[])) => {
    if (typeof suggestionsOrUpdater === 'function') {
      setGrammarSuggestions(suggestionsOrUpdater);
    } else {
      setGrammarSuggestions(suggestionsOrUpdater);
    }
  };

  // Handle AI warning confirmation
  const handleAiWarningConfirm = () => {
    setShowAiWarning(false);
    setAiEnabled(true);
  };

  // Handle AI warning dismissal
  const handleAiWarningDismiss = () => {
    setShowAiWarning(false);
  };

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-body)' }}>
        <header className="relative text-center py-8">
          <h1 className="text-4xl font-bold mb-2">Arabic Text Enhancer with AI</h1>
          <p className="text-lg" style={{ color: 'var(--text-subtle)' }}>
            A tool to analyze, correct, and translate your texts for clarity and strength.
          </p>
          <div className="absolute top-8 left-8">
            <ThemeToggle />
          </div>
        </header>

        {/* Main editor area - with responsive padding for panel */}
        <div className="px-8 pb-8 transition-all duration-300" id="editor-container">
          <div className="max-w-4xl mx-auto">
            <TextEditor
              analysis={analysis}
              grammarSuggestions={grammarSuggestions}
              onAnalysisChange={setAnalysis}
              onGrammarSuggestionsChange={handleGrammarSuggestionsChange}
              onTranslationChange={setTranslation}
              onLoadingChange={setIsLoading}
              aiEnabled={aiEnabled}
            />
          </div>
        </div>

        {/* Compact Analysis Panel */}
        <CompactAnalysisPanel
          analysis={analysis}
          grammarSuggestions={grammarSuggestions}
          translation={translation}
          isLoading={isLoading}
          aiEnabled={aiEnabled}
          onToggleAi={setAiEnabled}
          onShowAiWarning={() => setShowAiWarning(true)}
        />
      </div>

      {/* AI Warning Modal */}
      {showAiWarning && (
        <AiWarningModal
          onConfirm={handleAiWarningConfirm}
          onDismiss={handleAiWarningDismiss}
        />
      )}
    </>
  );
}
