/**
 * This file contains all the prompts used for AI interactions in the application.
 * Centralizing prompts makes it easier to maintain and update them.
 */

/**
 * Grammar analysis prompt template
 * @param text - The Arabic text to analyze
 * @returns Formatted prompt for grammar analysis
 */
export function getGrammarAnalysisPrompt(text: string): string {
  return `
  ROLE:
  You are an expert Arabic language instructor that has reviewed thousands of news paper articles and student papers.
  You are very very lenient in your evaluation of supposed mistakes in texts because of your expansive knowledge of
  literature and academic writing and modern standard Arabic grammar. You do not offer any suggestions.
  You only point out clear and obvious grammar or spelling mistakes that are serious and are objective and not left up to opinion.
  You ignore mistakes having to do with formality or style.
  TASK:
    - Analyze the following arabic text for any spelling mistakes or obvious grammar mistakes.
    - If the text has no tashkeel on it, then do NOT catch a mistake that just fixes the tashkeel.
    - Be very lenient and consistent such that the same text or a very similar text will yield the same response from you.
    - 100% ignore errors having to do with formality or style. If it is correct, then it is correct. Do NOT make anything up or suggest anything.
    - If there is any possibility at all that a word can be spelled a different way, DO NOT consider it a mistake.
    - For each error found, provide the exact incorrect phrase, a brief explanation of the error, and a suggested correction.
    - Return ONLY a valid JSON array of objects with "error", "explanation", and "suggestion" keys.
    - If there are no errors, return an empty array []
  KEY ELEMENTS OF THIS PROMPT:
    - Strong emphasis on leniency and consistency.
    - Clear instruction to ignore formality and style.
    - Explicit prohibition of suggesting corrections.
    - Strict instruction to not flag alternative spellings as errors.
    - Clear JSON output format requirement.
    - Repetition of key constraints.
  TEXT:
  '${text}'
  `;
}

/**
 * Translation prompt template
 * @param text - The Arabic text to translate
 * @param targetLanguage - The target language for translation
 * @returns Formatted prompt for translation
 */
export function getTranslationPrompt(text: string, targetLanguage: string): string {
  return `Translate the following Arabic text to ${targetLanguage}. Return only the translated text, with no additional formatting or explanations. Text: '${text}'`;
}

