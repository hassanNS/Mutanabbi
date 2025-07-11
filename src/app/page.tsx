'use client';

import { useState, useEffect } from 'react';
import { TextEditor } from '@/components/TextEditor';
import { CompactAnalysisPanel } from '@/components/CompactAnalysisPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AiWarningModal } from '@/components/AiWarningModal';
import { TextAnalysis, GrammarSuggestion } from '@/types';
import Image from 'next/image';

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
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  // Track if we're on mobile for responsive layout
  const [isMobile, setIsMobile] = useState(false);

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

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-body)' }}>
        <header className="relative text-center justify-center py-8">
          <div className="flex items-center justify-center">
              <div className="flex flex-col -mt-8 sm:mt-0 sm:relative sm:h-20 sm:w-36 items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="Mutanabbi Logo"
                  width={112}
                  height={112}
                  quality={95}
                  priority={true}
                  className="-mb-5 sm:mb-0 sm:absolute sm:-top-8 sm:right-20 h-28 w-28 logo-image"
                />
                <h1 className="text-4xl font-bold sm:absolute sm:top-5 sm:left-[2.5rem]">Mutanabbi</h1>
              </div>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-subtle)', direction: 'ltr' }}>
            Improve your Arabic composition by writing clear and correct Arabic prose.
          </p>
          <div className="absolute top-8 left-10">
            <ThemeToggle />
          </div>
        </header>

        {/* Flex container for editor and analysis panel */}
        <div className={`container mx-auto px-4 pb-8 ${isMobile ? 'flex flex-col' : 'flex flex-row'}`}>
          {/* Editor takes most of the space */}
          <div className="flex-1 min-w-0">
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

          {/* Analysis panel - part of the same flex container */}
          <CompactAnalysisPanel
            analysis={analysis}
            grammarSuggestions={grammarSuggestions}
            translation={translation}
            isLoading={isLoading}
            aiEnabled={aiEnabled}
            onToggleAi={setAiEnabled}
            onShowAiWarning={() => setShowAiWarning(true)}
            isMinimized={isPanelMinimized}
            onToggleMinimize={setIsPanelMinimized}
            isMobile={isMobile}
          />
        </div>
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
