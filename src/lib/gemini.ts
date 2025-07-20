import { GrammarSuggestion } from '@/types';
import { getGrammarAnalysisPrompt } from '@/utils/aiPrompts';
import { getApiRequestCount, incrementApiRequestCount } from '@/utils/helpers';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_GEMINI_API_URL;
const apiPostfix = process.env.NEXT_PUBLIC_GEMINI_API_URL_POST_FIX;
const grammarModelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-flash";
const temperature = parseFloat(process.env.NEXT_PUBLIC_GEMINI_MODEL_TEMPERATURE || "0.5");
const apiRequestLimit = parseInt(process.env.NEXT_PUBLIC_API_REQUEST_LIMIT || "300", 10);

if (!apiKey || !apiUrl || !apiPostfix) {
  console.error("One or more Gemini API environment variables are not set. AI features will be disabled.");
}

// Simple cache implementation
const grammarCache = new Map<string, GrammarSuggestion[]>();

export async function analyzeGrammar(text: string, signal: AbortSignal): Promise<GrammarSuggestion[]> {
  if (!apiKey || !apiUrl || !apiPostfix) {
    console.error("Gemini client not initialized. Check environment variables.");
    return [];
  }

  // Check if the user has reached the API request limit
  const currentRequestCount = getApiRequestCount();
  if (currentRequestCount >= apiRequestLimit) {
    console.log("API request limit reached");
    throw new Error("API request limit reached");
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

    // Increment the API request count after a successful request
    incrementApiRequestCount();

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log(responseText);

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

// Export the API limit and current count for components to use
export const getApiRequestLimit = () => apiRequestLimit;