import { useState, useEffect, useCallback, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { TextStyleKit } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { MenuBar } from './TipTapMenuBar'
import { Hemingway } from '../lib/hemingwayAnalysis'
import { analyzeGrammar } from '../lib/gemini'
import { translateText } from '../lib/translation'
import { TextAnalysis, GrammarSuggestion } from '@/types'
import { analyzeText } from '@/lib/textAnalysis'
import { debounce, setCookie, getCookie } from '@/utils/helpers'
import { SAMPLE_TEXT } from '@/utils/constants'

// Define extensions array with Highlight extension added
const extensions = [
  TextStyleKit,
  StarterKit,
  Hemingway,
  Highlight.configure({
    multicolor: true, // Enable different highlight colors
  })
]

interface TipTapTextEditorProps {
  analysis: TextAnalysis;
  grammarSuggestions: GrammarSuggestion[];
  onAnalysisChange?: (analysis: TextAnalysis) => void;
  onGrammarSuggestionsChange?: (suggestions: GrammarSuggestion[] | ((prev: GrammarSuggestion[]) => GrammarSuggestion[])) => void;
  onTranslationChange?: (translation: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  aiEnabled: boolean;
}

// Named component export
export const TipTapTextEditor = ({
  analysis,
  grammarSuggestions,
  onAnalysisChange,
  onGrammarSuggestionsChange,
  onTranslationChange,
  onLoadingChange,
  aiEnabled
}: TipTapTextEditorProps) => {
  // AbortController to manage API requests
  const fullAnalysisControllerRef = useRef<AbortController | null>(null);

  // Track if component is mounted (for client-side only rendering)
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true after initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: {
        class: 'prose prose-zinc dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl m-5 focus:outline-none',
        dir: 'rtl',
      },
    },
    content: '',
    onUpdate: ({ editor }) => {
      const content = editor.getText();

      // Analyze text and update state (always run)
      const newAnalysis = analyzeText(content);
      if (onAnalysisChange) {
        onAnalysisChange(newAnalysis);
      }

      // Save content to cookie
      setCookie('editorContent', editor.getHTML(), 30);

      // Tier 2 & 3: Debounced AI Analysis (if enabled)
      if (aiEnabled) {
        debouncedFullAiAnalysis(content);
      } else {
        // Clear AI suggestions when disabling
        onGrammarSuggestionsChange?.([]);
        onTranslationChange?.('...');
      }
    },
    // Fix the SSR issue by setting immediatelyRender to false
    immediatelyRender: false,
  });

  // Full document analysis (for translation and consistency)
  const performFullAiAnalysis = useCallback(async (inputText: string, signal: AbortSignal) => {
    // Don't perform AI analysis if it's disabled
    if (!aiEnabled) {
      onGrammarSuggestionsChange?.([]);
      onTranslationChange?.('...');
      if (editor) {
        editor.chain().clearGrammarHighlights().run();
      }
      return;
    }

    const trimmedText = inputText.trim();
    if (trimmedText.length < 10) {
      onGrammarSuggestionsChange?.([]);
      onTranslationChange?.('...');
      if (editor) {
        editor.chain().clearGrammarHighlights().run();
      }
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

          // Update the editor's grammar suggestions for highlighting
          if (editor) {
            // Call the command directly. It will handle its own transaction.
            editor.commands.updateGrammarSuggestions(grammarSuggestionsResult);
          }
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
          if (editor) {
            // Call the command directly.
            editor.commands.clearGrammarHighlights();
          }
        }
      }
    } finally {
      if (!signal.aborted) {
        onLoadingChange?.(false);
      }
    }
  }, [onGrammarSuggestionsChange, onTranslationChange, onLoadingChange, aiEnabled, editor]);

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

  // Initialize with saved text from cookie or sample text
  useEffect(() => {
    if (editor) {
      const savedText = getCookie('editorContent');
      if (savedText) {
        editor.commands.setContent(savedText);
      } else {
        editor.commands.setContent(SAMPLE_TEXT);
      }

      // Initial analysis
      const content = editor.getText();
      const newAnalysis = analyzeText(content);
      if (onAnalysisChange) {
        onAnalysisChange(newAnalysis);
      }
    }
  }, [editor, onAnalysisChange]);

  // Update grammar suggestions when they change
  useEffect(() => {
    if (editor && grammarSuggestions) {
      // Call the command directly.
      editor.commands.updateGrammarSuggestions(grammarSuggestions);
    }
  }, [editor, grammarSuggestions]);

  // Only render the editor when component has mounted (client-side only)
  if (!isMounted) {
    return <div className="editor-container">
      <div className="w-full sm:w-[95%] mx-auto px-2 sm:px-4 pb-8 flex flex-col justify-center border-black-500 border-2 rounded-lg h-[70vh]">
        <p className="text-center my-auto">Loading editor...</p>
      </div>
    </div>;
  }

  return (
    <section className="w-full flex flex-col justify-center mt-20">
      <div className="fixed w-full top-[4rem]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center flex-shrink-0">
          <MenuBar editor={editor} />
        </div>
      </div>
      <div className="editor-container flex justify-center overflow-auto">
          <EditorContent editor={editor}/>
      </div>
    </section>
  )
}

// Add default export that exports the TipTapTextEditor component
export default TipTapTextEditor;