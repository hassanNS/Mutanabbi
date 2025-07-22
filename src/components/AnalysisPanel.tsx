'use client';

import { useState } from 'react';
import { TextAnalysis, GrammarSuggestion } from '@/types';

interface AnalysisPanelProps {
  analysis: TextAnalysis;
  grammarSuggestions: GrammarSuggestion[];
  translation: string;
  isLoading?: boolean;
  aiEnabled: boolean;
  onToggleAi: (enabled: boolean) => void;
  onShowAiWarning: () => void; // New prop to trigger warning modal
}

interface AnalysisItemProps {
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

function AnalysisItem({ label, count, color, bgColor }: AnalysisItemProps) {
  return (
    <div className="flex justify-between items-center p-3 rounded-md" style={{ backgroundColor: `var(${bgColor})` }}>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `var(${color})` }}></div>
        <span className="font-semibold">{label}</span>
      </div>
      <span className="font-bold text-xl">{count}</span>
    </div>
  );
}

interface GrammarSectionProps {
  count: number;
  suggestions: GrammarSuggestion[];
  isLoading: boolean;
}

function GrammarSection({ count, suggestions, isLoading, aiEnabled, onToggleAi, onShowAiWarning }: GrammarSectionProps & { aiEnabled: boolean, onToggleAi: (enabled: boolean) => void, onShowAiWarning: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle toggle click
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!aiEnabled) {
      onShowAiWarning(); // Trigger the warning modal at page level
    } else {
      onToggleAi(false);
    }
  };

  return (
    <>
      <div
        className="cursor-pointer p-3 rounded-md"
        style={{ backgroundColor: 'var(--panel-grammar-bg)' }}
        onClick={() => aiEnabled && setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--panel-grammar-dot)' }}></div>
            <span className="font-semibold">أخطاء محتملة (AI)</span>
            <button
              className={`text-xs px-2 py-1 rounded-full transition-colors ${aiEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
              onClick={handleToggleClick}
              title={aiEnabled ? "إيقاف تشغيل تحليل الذكاء الاصطناعي" : "تشغيل تحليل الذكاء الاصطناعي"}
            >
              {aiEnabled ? "مفعل" : "معطل"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">{aiEnabled ? count : 0}</span>
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-subtle)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className={`suggestions-panel pr-4 ${isExpanded && aiEnabled ? 'expanded' : ''}`}>
        {!aiEnabled ? (
          <p className="p-2 text-sm" style={{ color: 'var(--text-subtle)' }}>
            تحليل الذكاء الاصطناعي معطل حاليا. يرجى تشغيله للحصول على الاقتراحات.
          </p>
        ) : suggestions.length === 0 ? (
          <p className="p-2 text-sm" style={{ color: 'var(--text-subtle)' }}>
            لم يتم العثور على أخطاء. عمل رائع!
          </p>
        ) : (
          suggestions.map((item, index) => (
            <div
              key={index}
              className="mb-3 p-3 rounded-lg border-r-4"
              style={{
                backgroundColor: 'var(--suggestion-bg)',
                borderColor: item.error ? 'var(--suggestion-border)' : 'var(--hemingway-green)'
              }}
            >
              <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>{item.error ? 'الخطأ:' : 'عبارة غير قياسية:'}</p>
              <p className="font-semibold text-red-500 dark:text-red-400 line-through">{item.error || item.nonStandardPhrase}</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-subtle)' }}>الاقتراح:</p>
              <p className="font-semibold text-green-600 dark:text-green-400">{item.suggestion}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-subtle)' }}>{item.explanation}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export function AnalysisPanel({ analysis, grammarSuggestions, translation, isLoading, aiEnabled, onToggleAi, onShowAiWarning }: AnalysisPanelProps) {
  return (
    <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--bg-panel)' }}>
      <div className="flex justify-between items-center border-b pb-3 mb-4" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold">التحليل</h2>
        {isLoading && aiEnabled && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-subtle)' }}>
            <span className="loader"></span>
            <span>تحليل AI...</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <GrammarSection
          count={grammarSuggestions.length}
          suggestions={grammarSuggestions}
          isLoading={isLoading || false}
          aiEnabled={aiEnabled}
          onToggleAi={onToggleAi}
          onShowAiWarning={onShowAiWarning}
        />

        <AnalysisItem
          label="جمل طويلة"
          count={analysis.longSentenceCount}
          color="--panel-long-dot"
          bgColor="--panel-long-bg"
        />

        <AnalysisItem
          label="جمل طويلة جدًا"
          count={analysis.veryLongSentenceCount}
          color="--panel-verylong-dot"
          bgColor="--panel-verylong-bg"
        />

        <AnalysisItem
          label="الحال / الظرف"
          count={analysis.adverbCount}
          color="--panel-adverb-dot"
          bgColor="--panel-adverb-bg"
        />

        <AnalysisItem
          label="المبني للمجهول"
          count={analysis.passiveCount}
          color="--panel-passive-dot"
          bgColor="--panel-passive-bg"
        />

        <AnalysisItem
          label="عبارات ضعيفة"
          count={analysis.weakPhraseCount}
          color="--panel-weak-dot"
          bgColor="--panel-weak-bg"
        />
      </div>

      <div className="border-t mt-6 pt-4" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="text-xl font-bold mb-3">إحصائيات</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p style={{ color: 'var(--text-subtle)' }} className="text-sm">الكلمات</p>
            <p className="text-2xl font-bold">{analysis.wordCount}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-subtle)' }} className="text-sm">الجمل</p>
            <p className="text-2xl font-bold">{analysis.sentenceCount}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-subtle)' }} className="text-sm">الأحرف</p>
            <p className="text-2xl font-bold">{analysis.charCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}