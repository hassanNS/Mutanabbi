'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { TextAnalysis, GrammarSuggestion } from '@/types';
import { analyzeText } from '@/lib/textAnalysis';
import { analyzeGrammar, translateText } from '@/lib/gemini';
import { debounce, generateHighlights } from '@/utils/helpers';
import { SAMPLE_TEXT } from '@/utils/constants';

interface TextEditorProps {
  analysis: TextAnalysis;
  grammarSuggestions: GrammarSuggestion[];
  onAnalysisChange?: (analysis: TextAnalysis) => void;
  onGrammarSuggestionsChange?: (suggestions: GrammarSuggestion[] | ((prev: GrammarSuggestion[]) => GrammarSuggestion[])) => void;
  onTranslationChange?: (translation: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  aiEnabled: boolean; // New prop for AI toggle
}

export function TextEditor({
  analysis,
  grammarSuggestions,
  onAnalysisChange,
  onGrammarSuggestionsChange,
  onTranslationChange,
  onLoadingChange,
  aiEnabled
}: TextEditorProps) {
  const [text, setText] = useState('');
  const [highlights, setHighlights] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // AbortController to manage API requests
  const fullAnalysisControllerRef = useRef<AbortController | null>(null);

  // Full document analysis (for translation and consistency)
  const performFullAiAnalysis = useCallback(async (inputText: string, signal: AbortSignal) => {
    // Don't perform AI analysis if it's disabled
    if (!aiEnabled) {
      onGrammarSuggestionsChange?.([]);
      onTranslationChange?.('...');
      return;
    }

    const trimmedText = inputText.trim();
    if (trimmedText.length < 10) {
      onGrammarSuggestionsChange?.([]);
      onTranslationChange?.('...');
      return;
    }

    onLoadingChange?.(true);

    try {
      const [grammarSuggestionsResult, translationResult] = await Promise.all([
        analyzeGrammar(trimmedText, signal),
        translateText(trimmedText, 'English', signal)
      ]);

      // Only update state if the request was not aborted
      if (!signal.aborted) {
        if (typeof onGrammarSuggestionsChange === 'function') {
          onGrammarSuggestionsChange(grammarSuggestionsResult);
        }
        onTranslationChange?.(translationResult);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Full analysis request was aborted.');
      } else {
        console.error('AI analysis error:', error);
        if (!signal.aborted) {
          onGrammarSuggestionsChange?.([]);
          onTranslationChange?.('Error during analysis.');
        }
      }
    } finally {
      if (!signal.aborted) {
        onLoadingChange?.(false);
      }
    }
  }, [onGrammarSuggestionsChange, onTranslationChange, onLoadingChange, aiEnabled]); // Add aiEnabled to dependencies

  // Debounced version of the full analysis
  const debouncedFullAiAnalysis = useCallback(
    debounce((currentText: string) => {
      // Cancel any previous full analysis before starting a new one
      if (fullAnalysisControllerRef.current) {
        fullAnalysisControllerRef.current.abort();
      }
      // Create a new controller for the new request
      fullAnalysisControllerRef.current = new AbortController();
      performFullAiAnalysis(currentText, fullAnalysisControllerRef.current.signal);
    }, 1500), // A slightly longer debounce for the full sync
    [performFullAiAnalysis]
  );

  // High-priority sentence analysis
  const analyzeJustCompletedSentence = useCallback(async (sentence: string) => {
    // Skip if AI is disabled
    if (!aiEnabled) return;

    console.log("Analyzing sentence:", sentence);
    try {
      const controller = new AbortController();
      const newSuggestions = await analyzeGrammar(sentence, controller.signal);

      // Intelligently merge new suggestions with existing ones
      if (typeof onGrammarSuggestionsChange === 'function') {
        onGrammarSuggestionsChange((prevSuggestions) => {
          // Filter out old suggestions that were for the same (now edited) sentence
          const otherSuggestions = prevSuggestions.filter(s => !sentence.includes(s.error));
          return [...otherSuggestions, ...newSuggestions];
        });
      }
    } catch (error) {
      console.error('Sentence analysis error:', error);
    }
  }, [onGrammarSuggestionsChange, aiEnabled]); // Add aiEnabled to dependencies

  const handleTextChange = useCallback((value: string) => {
    const previousText = text;
    setText(value);

    // Tier 1: Instant Rule-Based Analysis (always enabled)
    const newAnalysis = analyzeText(value);
    onAnalysisChange?.(newAnalysis);

    // Tier 2 & 3: AI Analysis (only when enabled)
    if (aiEnabled) {
      // Extract and analyze recently completed sentence
      const newChar = value.length > previousText.length ? value[value.length - 1] : null;
      if (newChar && ['.', '؟', '!'].includes(newChar)) {
        const sentences = value.split(/([.؟!])/g);
        const lastSentence = sentences[sentences.length - 2] + sentences[sentences.length - 1];
        if (lastSentence.trim().length > 5) {
          analyzeJustCompletedSentence(lastSentence.trim());
        }
      }

      // Full document analysis with debounce
      debouncedFullAiAnalysis(value);
    } else if (!aiEnabled && previousText) {
      // Clear AI suggestions when disabling
      onGrammarSuggestionsChange?.([]);
      onTranslationChange?.('...');
    }
  }, [text, aiEnabled, onAnalysisChange, debouncedFullAiAnalysis, analyzeJustCompletedSentence, onGrammarSuggestionsChange, onTranslationChange]); // Add dependencies

  // Update highlights when text or analysis changes
  useEffect(() => {
    const newHighlights = generateHighlights(text, analysis, grammarSuggestions);
    setHighlights(newHighlights);
  }, [text, analysis, grammarSuggestions]);

  // Sync scroll between textarea and highlights
  const handleScroll = () => {
    if (textareaRef.current && highlightsRef.current) {
      highlightsRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightsRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Initialize with sample text
  useEffect(() => {
    handleTextChange(SAMPLE_TEXT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <div ref={editorContainerRef} className="editor-container rounded-lg shadow-lg relative">
      <div
        ref={highlightsRef}
        className="editor-highlights"
        dangerouslySetInnerHTML={{ __html: highlights }}
        style={{
          margin: 0,
          padding: '1.5rem',
          border: 'none',
          fontSize: '1.375rem',
          lineHeight: '2.1',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          letterSpacing: 'normal',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          fontFamily: "'Noto Naskh Arabic', 'Tajawal', sans-serif",
        }}
      />
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        onScroll={handleScroll}
        className="editor-textarea"
        style={{
          margin: 0,
          padding: '1.5rem',
          border: 'none',
          fontSize: '1.375rem',
          lineHeight: '2.1',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          letterSpacing: 'normal',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          backgroundColor: 'transparent',
          color: 'var(--text-default)',
          caretColor: 'var(--caret-color)',
          resize: 'none',
          fontFamily: "'Noto Naskh Arabic', 'Tajawal', sans-serif"
        }}
        spellCheck={false}
        placeholder="ابدأ الكتابة هنا..."
      />
    </div>
  );
}

