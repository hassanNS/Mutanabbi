/**
 * Fast and efficient text similarity utilities for Arabic text
 * Uses optimized algorithms for better performance than naive Levenshtein
 */

/**
 * Normalizes Arabic text for better comparison
 * Removes diacritics, normalizes common variations, and cleans whitespace
 */
export function normalizeArabicText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    // Remove Arabic diacritics (tashkeel)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    // Normalize alif variations
    .replace(/[أإآا]/g, 'ا')
    // Normalize yaa variations
    .replace(/[ىي]/g, 'ي')
    // Normalize taa marbuta
    .replace(/ة/g, 'ه')
    // Normalize hamza variations
    .replace(/[ؤئء]/g, 'ء')
    // Remove extra whitespace and punctuation for comparison
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fast Jaccard similarity using character n-grams
 * More efficient than Levenshtein for longer texts
 */
function jaccardSimilarity(text1: string, text2: string, ngramSize: number = 3): number {
  if (text1 === text2) return 1;
  if (!text1 || !text2) return 0;

  const getNgrams = (str: string, n: number): Set<string> => {
    const ngrams = new Set<string>();
    const paddedStr = ' '.repeat(n - 1) + str + ' '.repeat(n - 1);
    for (let i = 0; i <= paddedStr.length - n; i++) {
      ngrams.add(paddedStr.substring(i, i + n));
    }
    return ngrams;
  };

  const ngrams1 = getNgrams(text1, ngramSize);
  const ngrams2 = getNgrams(text2, ngramSize);

  const intersection = new Set(Array.from(ngrams1).filter(x => ngrams2.has(x)));
  const union = new Set(Array.from(ngrams1).concat(Array.from(ngrams2)));

  return intersection.size / union.size;
}

/**
 * Fast cosine similarity using character frequency vectors
 * Efficient for semantic similarity detection
 */
function cosineSimilarity(text1: string, text2: string): number {
  if (text1 === text2) return 1;
  if (!text1 || !text2) return 0;

  const getCharFrequency = (str: string): Map<string, number> => {
    const freq = new Map<string, number>();
    for (const char of str) {
      freq.set(char, (freq.get(char) || 0) + 1);
    }
    return freq;
  };

  const freq1 = getCharFrequency(text1);
  const freq2 = getCharFrequency(text2);

  const allChars = new Set<string>(Array.from(freq1.keys()).concat(Array.from(freq2.keys())));

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const char of Array.from(allChars)) {
    const f1 = freq1.get(char) || 0;
    const f2 = freq2.get(char) || 0;

    dotProduct += f1 * f2;
    norm1 += f1 * f1;
    norm2 += f2 * f2;
  }

  if (norm1 === 0 || norm2 === 0) return 0;

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Optimized Levenshtein distance with early termination
 * Uses space optimization and early exit for large differences
 */
function optimizedLevenshteinDistance(str1: string, str2: string, maxDistance?: number): number {
  if (str1 === str2) return 0;
  if (!str1 || !str2) return Math.max(str1.length, str2.length);

  const len1 = str1.length;
  const len2 = str2.length;

  // Early exit if difference is too large
  if (maxDistance && Math.abs(len1 - len2) > maxDistance) {
    return maxDistance + 1;
  }

  // Use only two rows instead of full matrix for space optimization
  let previousRow = Array.from({ length: len2 + 1 }, (_, i) => i);
  let currentRow = new Array(len2 + 1);

  for (let i = 1; i <= len1; i++) {
    currentRow[0] = i;
    let minInRow = i;

    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(
        currentRow[j - 1] + 1,      // insertion
        previousRow[j] + 1,         // deletion
        previousRow[j - 1] + cost   // substitution
      );
      minInRow = Math.min(minInRow, currentRow[j]);
    }

    // Early termination if minimum distance in row exceeds threshold
    if (maxDistance && minInRow > maxDistance) {
      return maxDistance + 1;
    }

    [previousRow, currentRow] = [currentRow, previousRow];
  }

  return previousRow[len2];
}

/**
 * Combined similarity score using multiple algorithms
 * Weights different similarity measures for optimal results
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  if (text1 === text2) return 1;
  if (!text1 || !text2) return 0;

  const normalized1 = normalizeArabicText(text1);
  const normalized2 = normalizeArabicText(text2);

  if (normalized1 === normalized2) return 1;

  // For very short texts, use Levenshtein
  if (Math.max(normalized1.length, normalized2.length) < 50) {
    const maxLength = Math.max(normalized1.length, normalized2.length);
    const distance = optimizedLevenshteinDistance(normalized1, normalized2, Math.floor(maxLength * 0.5));
    return Math.max(0, 1 - distance / maxLength);
  }

  // For longer texts, combine Jaccard and Cosine similarity
  const jaccardScore = jaccardSimilarity(normalized1, normalized2, 3);
  const cosineScore = cosineSimilarity(normalized1, normalized2);

  // Weighted combination: 60% Jaccard, 40% Cosine
  return jaccardScore * 0.6 + cosineScore * 0.4;
}

/**
 * Fast similarity check that returns early if below threshold
 * Optimized for cache lookup scenarios
 */
export function isTextSimilar(text1: string, text2: string, threshold: number): boolean {
  if (text1 === text2) return true;
  if (!text1 || !text2) return false;

  const normalized1 = normalizeArabicText(text1);
  const normalized2 = normalizeArabicText(text2);

  if (normalized1 === normalized2) return true;

  // Quick length-based pre-filter
  const maxLength = Math.max(normalized1.length, normalized2.length);
  const minLength = Math.min(normalized1.length, normalized2.length);

  if (minLength / maxLength < threshold * 0.7) {
    return false; // Length difference too large
  }

  return calculateTextSimilarity(text1, text2) >= threshold;
}
