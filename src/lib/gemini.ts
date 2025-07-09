import { GrammarSuggestion } from '@/types';
import { getGrammarAnalysisPrompt, getTranslationPrompt } from '@/utils/aiPrompts';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_GEMINI_API_URL;
const apiPostfix = process.env.NEXT_PUBLIC_GEMINI_API_URL_POST_FIX;
const grammarModelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-flash";
const translationModelName = process.env.NEXT_PUBLIC_GEMINI_TRANSLATION_MODEL || grammarModelName;
const temperature = parseFloat(process.env.NEXT_PUBLIC_GEMINI_MODEL_TEMPERATURE || "0.5");

if (!apiKey || !apiUrl || !apiPostfix) {
  console.error("One or more Gemini API environment variables are not set. AI features will be disabled.");
}

// Simple cache implementations
const grammarCache = new Map<string, GrammarSuggestion[]>();
const translationCache = new Map<string, string>();

export async function analyzeGrammar(text: string, signal: AbortSignal): Promise<GrammarSuggestion[]> {
  if (!apiKey || !apiUrl || !apiPostfix) {
    console.error("Gemini client not initialized. Check environment variables.");
    return [];
  }

  const trimmedText = text.trim();

  // Simple cache lookup
  if (grammarCache.has(trimmedText)) {
    console.log("Grammar cache hit!");
    return grammarCache.get(trimmedText)!;
  }

  const fullApiUrl = `${apiUrl}/${grammarModelName}${apiPostfix}?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: getGrammarAnalysisPrompt(trimmedText) }] }],
    generationConfig: {
      temperature: temperature,
      responseMimeType: "application/json",
    },
  };

  try {
    const response = await fetch(fullApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
        console.error("Error analyzing grammar: No response text from API", data);
        return [];
    }

    try {
        const suggestions: GrammarSuggestion[] = JSON.parse(responseText);

        // Store in cache
        grammarCache.set(trimmedText, suggestions);

        // Limit cache size to prevent memory leaks (keep most recent 100 entries)
        if (grammarCache.size > 100) {
          const keysToDelete = Array.from(grammarCache.keys()).slice(0, grammarCache.size - 100);
          keysToDelete.forEach(key => grammarCache.delete(key));
        }

        return suggestions;
    } catch (e) {
        console.error("Error parsing grammar analysis JSON:", e, "Received:", responseText);
        return [];
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Grammar analysis request was aborted.');
    } else {
      console.error('Error analyzing grammar:', error);
    }
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string, signal: AbortSignal): Promise<string> {
  if (!apiKey || !apiUrl || !apiPostfix) {
      console.error("Gemini client not initialized. Check environment variables.");
      return "Translation Error: Missing API Key.";
  }

  const cacheKey = `${text}:${targetLanguage}`;

  // Simple cache lookup
  if (translationCache.has(cacheKey)) {
    console.log("Translation cache hit!");
    return translationCache.get(cacheKey)!;
  }

  const fullApiUrl = `${apiUrl}/${translationModelName}${apiPostfix}?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: getTranslationPrompt(text, targetLanguage) }] }],
  };

  try {
    const response = await fetch(fullApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const translation = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!translation) {
        console.error("Error translating text: No response text from API", data);
        return "Translation Error.";
    }

    // Store in cache
    translationCache.set(cacheKey, translation);

    // Limit cache size to prevent memory leaks (keep most recent 100 entries)
    if (translationCache.size > 100) {
      const keysToDelete = Array.from(translationCache.keys()).slice(0, translationCache.size - 100);
      keysToDelete.forEach(key => translationCache.delete(key));
    }

    return translation;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Translation request was aborted.');
    } else {
      console.error(`Error translating text to ${targetLanguage}:`, error);
    }
    throw error;
  }
}