// Simple cache implementation
const translationCache = new Map<string, string>();

// Maximum characters per batch (Google Translate API limit is around 5000, using 1000 for safety)
const MAX_BATCH_SIZE = 1000;

/**
 * Split text into batches that don't exceed the maximum size
 * while trying to preserve sentence boundaries
 */
function splitIntoBatches(text: string): string[] {
  if (text.length <= MAX_BATCH_SIZE) {
    return [text];
  }

  const batches: string[] = [];
  let currentBatch = '';

  // Try to split on sentence boundaries (periods, question marks, exclamation points)
  const sentences = text.split(/([.!?]\s+)/);

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];

    // If adding this sentence would exceed the limit, start a new batch
    if (currentBatch.length + sentence.length > MAX_BATCH_SIZE && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = sentence;
    } else {
      currentBatch += sentence;
    }
  }

  // Add the last batch if it's not empty
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

/**
 * Translates text using Google Translate API
 * @param text - The text to translate
 * @param targetLanguage - The language code to translate to (e.g., 'English' for English)
 * @param signal - AbortSignal for cancelling the request
 */
export async function translateText(text: string, targetLanguage: string = 'English', signal?: AbortSignal): Promise<string> {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return '';
  }

  // Cache key combines text and target language
  const cacheKey = `${trimmedText}:${targetLanguage}`;

  // Check cache first
  if (translationCache.has(cacheKey)) {
    console.log("Translation cache hit!");
    return translationCache.get(cacheKey)!;
  }

  try {
    // Always use the public endpoint method which doesn't require OAuth2
    return await publicTranslation(trimmedText, targetLanguage, signal);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Translation request was aborted.');
    } else {
      console.error('Translation error:', error);
    }
    return 'Translation error';
  }
}

/**
 * Translation using the public Google Translate endpoint that doesn't require authentication
 */
async function publicTranslation(text: string, targetLanguage: string, signal?: AbortSignal): Promise<string> {
  try {
    // Split text into batches if it's too large
    const textBatches = splitIntoBatches(text);
    let translationResults: string[] = [];

    // Convert language names to language codes
    const targetLangCode = targetLanguage.toLowerCase() === 'english' ? 'en' : targetLanguage.toLowerCase();

    for (const batch of textBatches) {
      // Use a simple translation approach using Google Translate's public endpoint
      const params = new URLSearchParams({
        client: 'gtx',
        sl: 'ar', // Source language (Arabic)
        tl: targetLangCode,
        dt: 't',
        q: batch
      });

      const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`, {
        method: 'GET',
        signal: signal,
      });

      if (!response.ok) {
        throw new Error(`Translation failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Extract translation from response
      let translatedBatch = '';
      if (data && Array.isArray(data[0])) {
        translatedBatch = data[0]
          .filter(segment => segment && segment[0])
          .map(segment => segment[0])
          .join('');
      }

      translationResults.push(translatedBatch);
    }

    const translatedText = translationResults.join(' ');

    // Store in cache
    if (translatedText) {
      translationCache.set(`${text}:${targetLanguage}`, translatedText);

      // Limit cache size
      if (translationCache.size > 100) {
        const keysToDelete = Array.from(translationCache.keys()).slice(0, translationCache.size - 100);
        keysToDelete.forEach(key => translationCache.delete(key));
      }
    }

    return translatedText || 'Translation not available';
  } catch (error) {
    console.error('Public translation error:', error);
    return 'Translation not available';
  }
}
