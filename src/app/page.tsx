'use client';

import { useState, useEffect } from 'react';
import { TipTapTextEditor } from '@/components/TipTapTextEditor';
import { CompactAnalysisPanel } from '@/components/CompactAnalysisPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AiWarningModal } from '@/components/AiWarningModal';
import { TextAnalysis, GrammarSuggestion } from '@/types/index';
import Image from 'next/image';
import Footer from '@/components/footer';
import BuyMeACoffeeButton from '@/components/BuyMeACoffeeButton';
import { getApiRequestCount } from '@/utils/helpers';
import App from 'next/app';
import AppHeader from '@/components/AppHeader';

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
  const [aiEnabled, setAiEnabled] = useState(true);
  const [showAiWarning, setShowAiWarning] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [apiRequestCount, setApiRequestCount] = useState(0);

  // Get the API request limit from environment variable
  const apiRequestLimit = parseInt(process.env.NEXT_PUBLIC_API_REQUEST_LIMIT || '300', 10);

  // Load API request count when component mounts or AI is enabled
  useEffect(() => {
    const count = getApiRequestCount();
    setApiRequestCount(count);
  });

  // Update the API request count at regular intervals when AI is enabled
  useEffect(() => {
    const intervalId = setInterval(() => {
      const count = getApiRequestCount();
      setApiRequestCount(count);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  });

  // Handle functional updates to grammar suggestions
  const handleGrammarSuggestionsChange = (suggestionsOrUpdater: GrammarSuggestion[] | ((prev: GrammarSuggestion[]) => GrammarSuggestion[])) => {
    if (typeof suggestionsOrUpdater === 'function') {
      setGrammarSuggestions(suggestionsOrUpdater);
    } else {
      setGrammarSuggestions(suggestionsOrUpdater);
    }
  };


  return (
    <>
      <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-body)' }}>
        <AppHeader />
        {/* Flex container for editor and analysis panel */}
        <section className="min-h-[55vh] flex w-screen sm:flex-grow sm:min-h-0">
          {/* Editor takes most of the space */}
            <TipTapTextEditor
              analysis={analysis}
              grammarSuggestions={grammarSuggestions}
              onAnalysisChange={setAnalysis}
              onGrammarSuggestionsChange={handleGrammarSuggestionsChange}
              onTranslationChange={setTranslation}
              onLoadingChange={setIsLoading}
            />
        </section>

        {/* Analysis panel - part of the same flex container */}
        <div className="h-full w-full sm:fixed right-5 top-20 sm:w-60 flex-shrink-0 mt-4 sm:mt-0 overflow-auto">
          <CompactAnalysisPanel
            analysis={analysis}
            grammarSuggestions={grammarSuggestions}
            translation={translation}
            isLoading={isLoading}
            onToggleAi={setAiEnabled}
            onShowAiWarning={() => setShowAiWarning(true)}
            isMinimized={isPanelMinimized}
            onToggleMinimize={setIsPanelMinimized}
            apiRequestCount={apiRequestCount}
            apiRequestLimit={apiRequestLimit}
          />
        </div>
      </div>
    </>
  );
}
