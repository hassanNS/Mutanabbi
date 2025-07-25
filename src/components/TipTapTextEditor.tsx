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
}

// Named component export
export const TipTapTextEditor = ({
  analysis,
  grammarSuggestions,
  onAnalysisChange,
  onGrammarSuggestionsChange,
  onTranslationChange,
  onLoadingChange,
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

      // Save content to cookie (10 days)
      setCookie('editorContent', editor.getHTML(), 10);

      // No longer run AI analysis on text change
    },
    // Fix the SSR issue by setting immediatelyRender to false
    immediatelyRender: false,
  });

  // Full document analysis (for translation and consistency)
  const performFullAiAnalysis = useCallback(async (inputText: string, signal: AbortSignal) => {
    // Don't perform AI analysis if it's disabled or empty
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
  }, [onGrammarSuggestionsChange, onTranslationChange, onLoadingChange, editor]);

  // This will be called when the user clicks the analysis button
  const handleAnalysisButtonClick = useCallback(() => {
    if (editor) {
      const content = editor.getText();

      // Cancel any previous analysis
      if (fullAnalysisControllerRef.current) {
        fullAnalysisControllerRef.current.abort();
      }

      // Create a new controller for the new request
      fullAnalysisControllerRef.current = new AbortController();
      performFullAiAnalysis(content, fullAnalysisControllerRef.current.signal);
    }
  }, [editor, performFullAiAnalysis]);

  // Initialize with saved text from cookie or sample text
  useEffect(() => {
    if (editor) {
      try {
        const savedText = getCookie('editorContent');
        if (savedText && savedText.trim().length > 0) {
          editor.commands.setContent(savedText);
          console.log('Loaded content from cookie');
        } else {
          editor.commands.setContent(SAMPLE_TEXT);
          console.log('Using sample text');
        }

        // Initial analysis
        const content = editor.getText();
        const newAnalysis = analyzeText(content);
        if (onAnalysisChange) {
          onAnalysisChange(newAnalysis);
        }
      } catch (error) {
        console.error('Error loading saved content:', error);
        editor.commands.setContent(SAMPLE_TEXT);
      }
    }
  }, [editor, onAnalysisChange]);

  // Save content when the user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (editor) {
        setCookie('editorContent', editor.getHTML(), 10); // Save for 10 days
      }
    };

    // Add event listener for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Clean up the event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Also save when component unmounts
      if (editor) {
        setCookie('editorContent', editor.getHTML(), 10);
      }
    };
  }, [editor]);

  // Update grammar suggestions when they change
  useEffect(() => {
    if (editor && grammarSuggestions) {
      // Call the command directly.
      editor.commands.updateGrammarSuggestions(grammarSuggestions);
    }
  }, [editor, grammarSuggestions]);

  // Export the analyze function so it can be called from outside
  useEffect(() => {
    // Make the analysis function available to the parent component
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.requestAiAnalysis = handleAnalysisButtonClick;
    }

    return () => {
      // Clean up
      if (typeof window !== 'undefined') {
        // @ts-ignore
        delete window.requestAiAnalysis;
      }
    };
  }, [handleAnalysisButtonClick]);

  // Only render the editor when component has mounted (client-side only)
  if (!isMounted) {
    return <div className="editor-container">
      <div className="w-full sm:w-[95%] mx-auto px-2 sm:px-4 pb-8 flex flex-col justify-center border-black-500 border-2 rounded-lg h-[70vh]">
        <p className="text-center my-auto">Loading editor...</p>
      </div>
    </div>;
  }

  return (
    <section className="w-full flex flex-col mt-20">
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