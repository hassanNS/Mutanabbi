export interface GrammarSuggestion {
  error?: string;
  nonStandardPhrase?: string;
  explanation: string;
  suggestion: string;
}

export interface TextAnalysis {
  wordCount: number;
  sentenceCount: number;
  charCount: number;
  longSentenceCount: number;
  veryLongSentenceCount: number;
  adverbCount: number;
  adverbs: string[];
  passiveCount: number;
  passives: string[];
  weakPhraseCount: number;
  weakPhrases: string[];
  grammarCount: number;
}

export interface EditorState {
  text: string;
  analysis: TextAnalysis;
  grammarSuggestions: GrammarSuggestion[];
  translation: string;
  isAnalyzing: boolean;
}

export interface Theme {
  isDark: boolean;
}
