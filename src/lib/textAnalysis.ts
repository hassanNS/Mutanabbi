import { TextAnalysis } from '@/types';
import {
  LONG_SENTENCE_THRESHOLD,
  VERY_LONG_SENTENCE_THRESHOLD,
  ADVERBS,
  PASSIVE_VOICE_INDICATORS,
  WEAK_PHRASES
} from '@/utils/constants';

export function analyzeText(text: string): TextAnalysis {
  let longSentenceCount = 0;
  let veryLongSentenceCount = 0;

  const trimmedText = text.trim();
  const words = trimmedText.length > 0 ? trimmedText.split(/\s+/).filter(Boolean) : [];

  // Create regex patterns
  const weakPhraseRegex = new RegExp(`\\b(${WEAK_PHRASES.join('|')})\\b`, 'g');
  const passiveRegex = new RegExp(`\\b(${PASSIVE_VOICE_INDICATORS.join('|')})\\b`, 'g');
  const adverbRegex = new RegExp(`\\b(${ADVERBS.join('|')})\\b`, 'g');

  // Count matches
  const weakPhrases = text.match(weakPhraseRegex) || [];
  const passives = text.match(passiveRegex) || [];
  const adverbs = text.match(adverbRegex) || [];

  const weakPhraseCount = weakPhrases.length;
  const passiveCount = passives.length;
  const adverbCount = adverbs.length;

  // Analyze sentences
  const parts = text.split(/([.؟!])/);
  let sentenceCount = 0;
  let currentSentence = '';

  for (let i = 0; i < parts.length; i++) {
    currentSentence += parts[i];

    if (i % 2 === 1 || (i === parts.length - 1 && currentSentence.trim().length > 0)) {
      sentenceCount++;
      const sentenceWords = currentSentence.trim().split(/\s+/).filter(Boolean);

      if (sentenceWords.length > VERY_LONG_SENTENCE_THRESHOLD) {
        veryLongSentenceCount++;
      } else if (sentenceWords.length > LONG_SENTENCE_THRESHOLD) {
        longSentenceCount++;
      }

      currentSentence = '';
    }
  }

  if (sentenceCount === 0 && text.trim().length > 0) {
    sentenceCount = 1;
  }

  return {
    wordCount: words.length,
    sentenceCount,
    charCount: text.length,
    longSentenceCount,
    veryLongSentenceCount,
    adverbCount,
    adverbs,
    passiveCount,
    passives,
    weakPhraseCount,
    weakPhrases,
    grammarCount: 0 // This will be updated by the grammar analysis
  };
}
