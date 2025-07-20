import { Extension } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Node } from 'prosemirror-model'
import { WEAK_PHRASES, ADVERBS, PASSIVE_VOICE_INDICATORS } from '../utils/constants'


const LONG_SENTENCE_THRESHOLD = 15;
const VERY_LONG_SENTENCE_THRESHOLD = 20;

interface Range {
  from: number;
  to: number;
  type: string;
}

// Function to find weak phrases - updated for better detection
function findWeakPhrases(doc: Node): Range[] {
  const ranges: Range[] = [];
  // Remove word boundary requirements for better matching in Arabic text
  const regex = new RegExp(`(${WEAK_PHRASES.join('|')})`, 'gi');

  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const text = node.text || '';

    // Reset lastIndex to ensure we start from the beginning
    regex.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      ranges.push({
        from: pos + match.index,
        to: pos + match.index + match[0].length,
        type: 'weak-phrase'
      });
    }
  });

  return ranges;
}

// Function to find adverbs - updated for better detection
function findAdverbs(doc: Node): Range[] {
  const ranges: Range[] = [];
  // Remove word boundary requirements for better matching in Arabic text
  const regex = new RegExp(`(${ADVERBS.join('|')})`, 'gi');

  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const text = node.text || '';

    // Reset lastIndex to ensure we start from the beginning
    regex.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      ranges.push({
        from: pos + match.index,
        to: pos + match.index + match[0].length,
        type: 'adverb'
      });
    }
  });

  return ranges;
}

// Function to find passive voice - updated for better detection
function findPassiveVoice(doc: Node): Range[] {
  const ranges: Range[] = [];
  // Remove word boundary requirements for better matching in Arabic text
  const regex = new RegExp(`(${PASSIVE_VOICE_INDICATORS.join('|')})`, 'gi');

  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const text = node.text || '';

    // Reset lastIndex to ensure we start from the beginning
    regex.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      ranges.push({
        from: pos + match.index,
        to: pos + match.index + match[0].length,
        type: 'passive-voice'
      });
    }
  });

  return ranges;
}

// Function to find long and very long sentences
function findLongSentences(doc: Node): Range[] {
  const ranges: Range[] = [];

  // First, let's gather all text content
  let textNodes: {node: Node, pos: number}[] = [];
  doc.descendants((node, pos) => {
    if (node.isText) textNodes.push({node, pos});
  });

  // Extract text and positions
  let text = '';
  let positions: number[] = [];

  textNodes.forEach(({node, pos}) => {
    const nodeText = node.text || '';
    for (let i = 0; i < nodeText.length; i++) {
      text += nodeText[i];
      positions.push(pos + i);
    }
  });

  // Split into sentences and analyze
  const sentenceParts = text.split(/([.؟!،])/);
  let currentSentence = '';
  let startPos = 0;

  for (let i = 0; i < sentenceParts.length; i++) {
    currentSentence += sentenceParts[i];

    // Check if this part is a punctuation that ends a sentence
    if (i % 2 === 1 && ['.', '؟', '!'].includes(sentenceParts[i])) {
      const wordCount = currentSentence.trim().split(/\s+/).filter(Boolean).length;

      if (wordCount > VERY_LONG_SENTENCE_THRESHOLD) {
        if (startPos < positions.length && startPos + currentSentence.length - 1 < positions.length) {
          ranges.push({
            from: positions[startPos],
            to: positions[startPos + currentSentence.length - 1] + 1,
            type: 'very-long-sentence'
          });
        }
      } else if (wordCount > LONG_SENTENCE_THRESHOLD) {
        if (startPos < positions.length && startPos + currentSentence.length - 1 < positions.length) {
          ranges.push({
            from: positions[startPos],
            to: positions[startPos + currentSentence.length - 1] + 1,
            type: 'long-sentence'
          });
        }
      }

      startPos += currentSentence.length;
      currentSentence = '';
    }
  }

  // Handle any remaining text as a sentence if it has content
  if (currentSentence.trim().length > 0) {
    const wordCount = currentSentence.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount > VERY_LONG_SENTENCE_THRESHOLD) {
      if (startPos < positions.length && startPos + currentSentence.length - 1 < positions.length) {
        ranges.push({
          from: positions[startPos],
          to: positions[startPos + currentSentence.length - 1] + 1,
          type: 'very-long-sentence'
        });
      }
    } else if (wordCount > LONG_SENTENCE_THRESHOLD) {
      if (startPos < positions.length && startPos + currentSentence.length - 1 < positions.length) {
        ranges.push({
          from: positions[startPos],
          to: positions[startPos + currentSentence.length - 1] + 1,
          type: 'long-sentence'
        });
      }
    }
  }

  return ranges;
}

// Add a function to find grammar errors from AI suggestions
function findGrammarErrors(doc: Node, grammarSuggestions: any[] = []): Range[] {
  const ranges: Range[] = [];

  // Process grammar suggestions
  grammarSuggestions.forEach(suggestion => {
    if (suggestion && suggestion.error) {
      // Find error text in document
      doc.descendants((node, pos) => {
        if (!node.isText) return;

        const text = node.text || '';
        let index = text.indexOf(suggestion.error);

        // Find all instances of this error in the node
        while (index !== -1) {
          ranges.push({
            from: pos + index,
            to: pos + index + suggestion.error.length,
            type: 'grammar-error'
          });

          index = text.indexOf(suggestion.error, index + 1);
        }
      });
    }
  });

  return ranges;
}

// Helper function to create decorations while preserving multiple highlights
function createDecorationsFromRanges(ranges: Range[]): Decoration[] {
  const decorations: Decoration[] = [];

  // Process each range and create appropriate decorations
  ranges.forEach(range => {
    let className;
    switch(range.type) {
      case 'weak-phrase':
        className = 'hemingway-weak';
        break;
      case 'adverb':
        className = 'hemingway-adverb';
        break;
      case 'passive-voice':
        className = 'hemingway-passive';
        break;
      case 'long-sentence':
        className = 'hemingway-long-sentence';
        break;
      case 'very-long-sentence':
        className = 'hemingway-very-long-sentence';
        break;
      case 'grammar-error':
        className = 'highlight-grammar';
        break;
      default:
        className = '';
    }

    if (className) {
      decorations.push(Decoration.inline(range.from, range.to, { class: className }));
    }
  });

  return decorations;
}

// Add TypeScript module declarations for the commands AND storage
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hemingway: {
      /**
       * Update grammar suggestions for highlighting
       */
      updateGrammarSuggestions: (suggestions: any[]) => ReturnType,
      /**
       * Highlight a specific grammar error
       */
      highlightGrammarError: (error: string) => ReturnType,
      /**
       * Clear all grammar highlights
       */
      clearGrammarHighlights: () => ReturnType,
    }
  }

  // Add this to declare the storage structure
  interface Storage {
    hemingway: {
      grammarSuggestions: any[]
    }
  }
}

export const Hemingway = Extension.create({
  name: 'hemingway',

  addOptions() {
    return {
      grammarSuggestions: []
    };
  },

  addStorage() {
    return {
      grammarSuggestions: []
    };
  },

  addCommands() {
    return {
      updateGrammarSuggestions:
        (suggestions: any[]) =>
        ({ editor }) => {
          // 1. Update the suggestions in storage
          editor.storage.hemingway.grammarSuggestions = suggestions;

          // 2. Force a re-render by dispatching a dummy transaction
          // that has our meta flag. This is the key to an immediate update.
          const { tr } = editor.state;
          tr.setMeta('updatedGrammarSuggestions', true);
          editor.view.dispatch(tr);

          return true;
        },

      highlightGrammarError:
        (error: string) =>
        ({ editor, commands }) => {
          const doc = editor.state.doc;
          let found = false;

          doc.descendants((node, pos) => {
            if (!node.isText || found) return;

            const text = node.text || '';
            const index = text.indexOf(error);

            if (index !== -1) {
              found = true;
              commands.setTextSelection({ from: pos + index, to: pos + index + error.length });
              return false; // Stop traversal once found
            }
          });

          return found;
        },

      clearGrammarHighlights:
        () =>
        ({ editor }) => {
          // This command can also be simplified to ensure updates.
          editor.storage.hemingway.grammarSuggestions = [];
          const { tr } = editor.state;
          tr.setMeta('updatedGrammarSuggestions', true);
          editor.view.dispatch(tr);
          return true;
        }
    };
  },

  addProseMirrorPlugins() {
    // Store a reference to the editor for use in plugins
    const extensionThis = this;

    return [
      new Plugin({
        state: {
          init(_, { doc }) {
            // Step 1: Collect all ranges first
            const sentenceRanges = findLongSentences(doc);
            const styleRanges: Range[] = [
              ...findWeakPhrases(doc),
              ...findAdverbs(doc),
              ...findPassiveVoice(doc)
            ];

            // Step 2: Add grammar error highlights
            const grammarSuggestions = extensionThis.editor?.storage?.hemingway?.grammarSuggestions || [];
            const grammarRanges = findGrammarErrors(doc, grammarSuggestions);

            // Combine all ranges in the correct order for layering:
            const allRanges: Range[] = [
              ...sentenceRanges,  // Base layer
              ...styleRanges,     // Middle layer
              ...grammarRanges    // Top layer
            ];

            // Create decorations from the collected ranges
            const decorations = createDecorationsFromRanges(allRanges);

            return DecorationSet.create(doc, decorations);
          },
          apply: (tr, old) => {
            // If the document changed OR our custom meta flag is set, re-calculate decorations.
            if (tr.docChanged || tr.getMeta('updatedGrammarSuggestions')) {
              // Step 1: Collect all ranges first
              const sentenceRanges = findLongSentences(tr.doc);
              const styleRanges: Range[] = [
                ...findWeakPhrases(tr.doc),
                ...findAdverbs(tr.doc),
                ...findPassiveVoice(tr.doc)
              ];

              // Step 2: Add grammar error highlights
              const grammarSuggestions = extensionThis.editor?.storage?.hemingway?.grammarSuggestions || [];
              const grammarRanges = findGrammarErrors(tr.doc, grammarSuggestions);

              // Combine all ranges in the correct order for layering:
              const allRanges: Range[] = [
                ...sentenceRanges,  // Base layer
                ...styleRanges,     // Middle layer
                ...grammarRanges    // Top layer
              ];

              // Create decorations from the collected ranges
              const decorations = createDecorationsFromRanges(allRanges);

              return DecorationSet.create(tr.doc, decorations);
            }

            // Otherwise, just map the old decorations.
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
