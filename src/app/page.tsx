'use client';

import { useState } from 'react';
import { TextEditor } from '@/components/TextEditor';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
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

  // Handle functional updates to grammar suggestions
  const handleGrammarSuggestionsChange = (suggestionsOrUpdater: GrammarSuggestion[] | ((prev: GrammarSuggestion[]) => GrammarSuggestion[])) => {
    if (typeof suggestionsOrUpdater === 'function') {
      setGrammarSuggestions(suggestionsOrUpdater);
    } else {
      setGrammarSuggestions(suggestionsOrUpdater);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="relative text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">مُحسِّن النص العربي بالذكاء الاصطناعي</h1>
        <p className="text-lg" style={{ color: 'var(--text-subtle)' }}>
          أداة لتحليل نصوصك، تصحيحها، وترجمتها لجعلها أكثر قوة ووضوحًا.
        </p>
        <div className="absolute top-0 left-0">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-3/5">
          <TextEditor
            analysis={analysis}
            grammarSuggestions={grammarSuggestions}
            onAnalysisChange={setAnalysis}
            onGrammarSuggestionsChange={handleGrammarSuggestionsChange}
            onTranslationChange={setTranslation}
            onLoadingChange={setIsLoading}
          />
        </div>

        <aside className="w-full lg:w-2/5">
          <div className="sticky top-8">
            <AnalysisPanel
              analysis={analysis}
              grammarSuggestions={grammarSuggestions}
              translation={translation}
              isLoading={isLoading}
            />
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '0.25rem' }}>
          <h2 className="text-2xl font-bold mb-4">الترجمة الفورية (إلى الإنجليزية)</h2>
          <div
            id="translation-output"
            className="text-lg min-h-[50px] transition-colors duration-300"
            style={{ color: 'var(--text-subtle)', direction: 'ltr' }}
          >
            {isLoading ? 'جارٍ الترجمة...' : translation}
          </div>
        </div>
      </div>
    </div>
  );
}
