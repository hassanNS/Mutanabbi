import { Extension } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { Node } from 'prosemirror-model'

interface Range {
  from: number;
  to: number;
  type: string;
}

// Add a function to find grammar errors from AI suggestions
function findIssues(doc: Node, suggestions: any[] = []): Range[] {
  const ranges: Range[] = [];

  // Process grammar suggestions
  suggestions.forEach(suggestion => {
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
    } else if (suggestion && suggestion.nonStandardPhrase) {
      // Find non-standard phrase in document
      doc.descendants((node, pos) => {
        if (!node.isText) return;

        const text = node.text || '';
        let index = text.indexOf(suggestion.nonStandardPhrase);

        // Find all instances of this phrase in the node
        while (index !== -1) {
          ranges.push({
            from: pos + index,
            to: pos + index + suggestion.nonStandardPhrase.length,
            type: 'non-standard-phrase'
          });

          index = text.indexOf(suggestion.nonStandardPhrase, index + 1);
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
      case 'grammar-error':
        className = 'highlight-grammar';
        break;
      case 'non-standard-phrase':
        className = 'highlight-non-standard';
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
            // Add grammar error highlights only
            const grammarSuggestions = extensionThis.editor?.storage?.hemingway?.grammarSuggestions || [];
            const issueRanges = findIssues(doc, grammarSuggestions);

            // Create decorations from the collected ranges
            const decorations = createDecorationsFromRanges(issueRanges);

            return DecorationSet.create(doc, decorations);
          },
          apply: (tr, old) => {
            // If the document changed OR our custom meta flag is set, re-calculate decorations.
            if (tr.docChanged || tr.getMeta('updatedGrammarSuggestions')) {
              // Add grammar error highlights only
              const grammarSuggestions = extensionThis.editor?.storage?.hemingway?.grammarSuggestions || [];
              const issueRanges = findIssues(tr.doc, grammarSuggestions);

              // Create decorations from the collected ranges
              const decorations = createDecorationsFromRanges(issueRanges);

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
