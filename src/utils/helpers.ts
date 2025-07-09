import { TextAnalysis, GrammarSuggestion } from '@/types';
import { LONG_SENTENCE_THRESHOLD, VERY_LONG_SENTENCE_THRESHOLD } from '@/utils/constants';

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

function escapeRegex(string: string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function generateHighlights(text: string, analysis: TextAnalysis, grammarSuggestions: GrammarSuggestion[]): string {
  if (!text) return '';

  let highlightedHtml = text;

  // Highlight grammar errors
  const errorPhrases = grammarSuggestions.map(s => s.error).filter(Boolean);
  if (errorPhrases.length > 0) {
    const uniqueErrorPhrases = Array.from(new Set(errorPhrases));
    const grammarRegex = new RegExp(`(${uniqueErrorPhrases.map(escapeRegex).join('|')})`, 'g');
    highlightedHtml = highlightedHtml.replace(grammarRegex, '<span class="highlight-grammar">$&</span>');
  }

  // Highlight rule-based issues
  const { weakPhrases, passives, adverbs } = analysis;
  if (weakPhrases.length > 0) {
    const unique = Array.from(new Set(weakPhrases));
    const regex = new RegExp(`(${unique.map(escapeRegex).join('|')})`, 'g');
    highlightedHtml = highlightedHtml.replace(regex, '<span class="highlight-weak">$&</span>');
  }
  if (passives.length > 0) {
    const unique = Array.from(new Set(passives));
    const regex = new RegExp(`(${unique.map(escapeRegex).join('|')})`, 'g');
    highlightedHtml = highlightedHtml.replace(regex, '<span class="highlight-passive">$&</span>');
  }
  if (adverbs.length > 0) {
    const unique = Array.from(new Set(adverbs));
    const regex = new RegExp(`(${unique.map(escapeRegex).join('|')})`, 'g');
    highlightedHtml = highlightedHtml.replace(regex, '<span class="highlight-adverb">$&</span>');
  }

  // Highlight long sentences
  const parts = highlightedHtml.split(/([.؟!])/);
  let finalHtml = '';
  let currentSentenceHtml = '';

  for (let i = 0; i < parts.length; i++) {
    currentSentenceHtml += parts[i];
    if (i % 2 === 1 || (i === parts.length - 1 && currentSentenceHtml.trim().length > 0)) {
      try {
        // Use a more reliable way to check sentence length
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = currentSentenceHtml;
        const cleanText = tempDiv.textContent || tempDiv.innerText || "";
        const sentenceWords = cleanText.trim().split(/\s+/).filter(Boolean);

        let sentenceClass = '';
        if (sentenceWords.length > VERY_LONG_SENTENCE_THRESHOLD) {
          sentenceClass = 'highlight-very-long-sentence';
        } else if (sentenceWords.length > LONG_SENTENCE_THRESHOLD) {
          sentenceClass = 'highlight-long-sentence';
        }

        if (sentenceClass) {
          finalHtml += `<span class="${sentenceClass}">${currentSentenceHtml}</span>`;
        } else {
          finalHtml += currentSentenceHtml;
        }
      } catch (e) {
        // Fallback if DOM manipulation fails (e.g., in a server context)
        finalHtml += currentSentenceHtml;
        console.error('Error processing sentence highlighting:', e);
      }

      currentSentenceHtml = '';
    }
  }

  return finalHtml.replace(/\n/g, '<br>');
}

/**
 * Normalizes Arabic text for better comparison and caching
 */
export function normalizeArabicText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, '') // Remove Arabic diacritics (tashkeel)
    .replace(/[أإآ]/g, 'ا') // Normalize alif variations
    .replace(/[ىي]/g, 'ي') // Normalize yaa variations
    .replace(/ة/g, 'ه') // Normalize taa marbuta
    .replace(/\s+/g, ' '); // Normalize whitespace
}
