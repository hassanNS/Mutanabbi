'use client';

import { useState, useEffect } from 'react';
import { TipTapTextEditor } from '@/components/TipTapTextEditor';
import { CompactAnalysisPanel } from '@/components/CompactAnalysisPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AiWarningModal } from '@/components/AiWarningModal';
import { TextAnalysis, GrammarSuggestion } from '@/types';
import Image from 'next/image';
import Footer from '@/components/footer';
import BuyMeACoffeeButton from '@/components/BuyMeACoffeeButton';
import { getApiRequestCount } from '@/utils/helpers';

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
  const [apiRequestCount, setApiRequestCount] = useState(0);

  // Get the API request limit from environment variable
  const apiRequestLimit = parseInt(process.env.NEXT_PUBLIC_API_REQUEST_LIMIT || '300', 10);

  // Load API request count when component mounts or AI is enabled
  useEffect(() => {
    if (aiEnabled) {
      const count = getApiRequestCount();
      setApiRequestCount(count);
    }
  }, [aiEnabled]);

  // Update the API request count at regular intervals when AI is enabled
  useEffect(() => {
    if (!aiEnabled) return;

    const intervalId = setInterval(() => {
      const count = getApiRequestCount();
      setApiRequestCount(count);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [aiEnabled]);

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
      <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-body)' }}>
        <header className="relative text-center justify-center py-4 flex-shrink-0">
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
          <p className="text-md sm:-mt-[1rem] sm:ml-[4rem]" style={{ color: 'var(--text-subtle)'}}>
            Improve your Arabic composition by writing clear and correct Arabic prose.
          </p>
          <div className="absolute top-[1.5rem] left-10">
            <ThemeToggle />
          </div>
        </header>

        {/* Flex container for editor and analysis panel */}
        <section className="w-[95%] mx-auto px-4 pb-4 flex-grow flex flex-col sm:flex-row sm:gap-4 items-stretch overflow-hidden">
          {/* Editor takes most of the space */}
          <div className="flex-grow w-full flex flex-col min-h-0">
            <TipTapTextEditor
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
          <div className="w-full sm:w-60 flex-shrink-0 mt-4 sm:mt-0">
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
              apiRequestCount={apiRequestCount}
              apiRequestLimit={apiRequestLimit}
            />
          </div>
        </section>

        <div className="flex justify-center mb-2 mt-2 flex-shrink-0">
          <BuyMeACoffeeButton />
        </div>
        <Footer />
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
