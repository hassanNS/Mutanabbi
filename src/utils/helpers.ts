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
  const errorPhrases = grammarSuggestions.map(s => s.error).filter(Boolean) as string[];
  if (errorPhrases.length > 0) {
    const uniqueErrorPhrases = Array.from(new Set(errorPhrases));
    const grammarRegex = new RegExp(`(${uniqueErrorPhrases.map(escapeRegex).join('|')})`, 'g');
    highlightedHtml = highlightedHtml.replace(grammarRegex, '<span class="highlight-grammar">$&</span>');
  }

  // Highlight non-standard phrases
  const nonStandardPhrases = grammarSuggestions.map(s => s.nonStandardPhrase).filter(Boolean) as string[];
  if (nonStandardPhrases.length > 0) {
    const uniqueNonStandardPhrases = Array.from(new Set(nonStandardPhrases));
    const nonStandardRegex = new RegExp(`(${uniqueNonStandardPhrases.map(escapeRegex).join('|')})`, 'g');
    highlightedHtml = highlightedHtml.replace(nonStandardRegex, '<span class="highlight-non-standard">$&</span>');
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

/**
 * Sets a browser cookie.
 * @param name - The name of the cookie.
 * @param value - The value of the cookie.
 * @param days - The number of days until the cookie expires.
 */
export function setCookie(name: string, value: string, days: number) {
  try {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }

    // Encode the value to handle special characters
    const encodedValue = encodeURIComponent(value);

    document.cookie = name + "=" + encodedValue + expires + "; path=/; SameSite=Lax";
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
}

/**
 * Gets a browser cookie by name.
 * @param name - The name of the cookie to retrieve.
 * @returns The cookie value or null if not found.
 */
export function getCookie(name: string): string | null {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        // Get the raw value and decode it
        const rawValue = c.substring(nameEQ.length, c.length);
        return decodeURIComponent(rawValue);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
}

// Helper functions for API request tracking
export const getApiRequestCount = (): number => {
  const count = parseInt(getCookie('apiRequestCount') || '0', 10);
  return isNaN(count) ? 0 : count;
};

export const incrementApiRequestCount = (): number => {
  const currentCount = getApiRequestCount();
  const newCount = currentCount + 1;
  setCookie('apiRequestCount', newCount.toString(), 10); // Store for 10 days
  return newCount;
};