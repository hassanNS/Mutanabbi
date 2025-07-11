// Simple cache implementation
const translationCache = new Map<string, string>();

/**
 * Translates text using the Google Translate API
 * @param text - The text to translate
 * @param targetLanguage - The language code to translate to (e.g., 'en' for English)
 * @param signal - AbortSignal for cancelling the request
 */
export async function translateText(text: string, targetLanguage: string = 'en', signal?: AbortSignal): Promise<string> {
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
    // Use Google Translate API - Client-side approach
    const params = new URLSearchParams({
      client: 'gtx', // Using unofficial API
      sl: 'auto', // Source language auto-detect
      tl: targetLanguage, // Target language
      dt: 't', // Translation type
      q: trimmedText // Text to translate
    });

    // Using Google Translate API
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`, {
      method: 'GET',
      signal: signal,
    });

    if (!response.ok) {
      throw new Error(`Translation failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Extract translation from response
    // Google Translate returns a nested array structure
    let translatedText = '';
    if (data && Array.isArray(data[0])) {
      // Combine all translation segments
      translatedText = data[0]
        .filter(segment => segment && segment[0])
        .map(segment => segment[0])
        .join('');
    }

    // Store in cache
    if (translatedText) {
      translationCache.set(cacheKey, translatedText);

      // Limit cache size
      if (translationCache.size > 100) {
        const keysToDelete = Array.from(translationCache.keys()).slice(0, translationCache.size - 100);
        keysToDelete.forEach(key => translationCache.delete(key));
      }
    }

    return translatedText || 'Translation error';
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Translation request was aborted.');
    } else {
      console.error('Translation error:', error);
    }
    throw error;
  }
}
