'use client';

import { useState } from 'react';
import { TextAnalysis, GrammarSuggestion } from '@/types';

interface AnalysisPanelProps {
  analysis: TextAnalysis;
  grammarSuggestions: GrammarSuggestion[];
  translation: string;
  isLoading?: boolean;
}

interface AnalysisItemProps {
  label: string;
  count: number;
  color: string;
  bgColor: string;
}

function AnalysisItem({ label, count, color, bgColor }: AnalysisItemProps) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-md ${bgColor}`}>
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full ${color}`}></div>
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

function GrammarSection({ count, suggestions, isLoading }: GrammarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div
        className="cursor-pointer p-3 rounded-md"
        style={{ backgroundColor: 'var(--highlight-grammar)'}}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--panel-grammar)' }}></div>
            <span className="font-semibold">أخطاء محتملة (AI)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">{count}</span>
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

      <div className={`suggestions-panel pr-4 ${isExpanded ? 'expanded' : ''}`}>
        {suggestions.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
            لم يتم العثور على أخطاء. عمل رائع!
          </p>
        ) : (
          suggestions.map((item, index) => (
            <div
              key={index}
              className="mb-3 p-3 rounded-lg border-r-4"
              style={{
                backgroundColor: 'var(--suggestion-bg)',
                borderColor: 'var(--suggestion-border)'
              }}
            >
              <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>الخطأ:</p>
              <p className="font-semibold line-through" style={{ color: 'var(--panel-red)' }}>{item.error}</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-subtle)' }}>الاقتراح:</p>
              <p className="font-semibold" style={{ color: 'var(--panel-green)' }}>
                {item.suggestion}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-subtle)' }}>
                {/* Check if explanation contains English text and set direction accordingly */}
                <span style={{
                  display: 'block',
                  direction: /[a-zA-Z]/.test(item.explanation) ? 'ltr' : 'rtl',
                  textAlign: /[a-zA-Z]/.test(item.explanation) ? 'left' : 'right'
                }}>
                  {item.explanation}
                </span>
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export function AnalysisPanel({ analysis, grammarSuggestions, translation, isLoading }: AnalysisPanelProps) {
  return (
    <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '0.25rem' }}>
      <div className="flex justify-between items-center border-b pb-3 mb-4" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-2xl font-bold">التحليل</h2>
        {isLoading && (
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
        />

        <AnalysisItem
          label="جمل طويلة"
          count={analysis.longSentenceCount}
          color="bg-[var(--panel-yellow)]"
          bgColor="bg-[var(--highlight-yellow)]"
        />

        <AnalysisItem
          label="جمل طويلة جدًا"
          count={analysis.veryLongSentenceCount}
          color="bg-[var(--panel-red)]"
          bgColor="bg-[var(--highlight-red)]"
        />

        <AnalysisItem
          label="الحال / الظرف"
          count={analysis.adverbCount}
          color="bg-[var(--panel-blue)]"
          bgColor="bg-[var(--highlight-blue)]"
        />

        <AnalysisItem
          label="المبني للمجهول"
          count={analysis.passiveCount}
          color="bg-[var(--panel-green)]"
          bgColor="bg-[var(--highlight-green)]"
        />

        <AnalysisItem
          label="عبارات ضعيفة"
          count={analysis.weakPhraseCount}
          color="bg-[var(--panel-purple)]"
          bgColor="bg-[var(--highlight-purple)]"
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
