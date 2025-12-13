/**
 * Thai Text Modifier Library
 * Provides utilities for modifying Thai text
 */

/**
 * Removes all tone marks from Thai text
 */
export function removeToneMarks(text: string): string {
  // Thai tone marks: ◌่ ◌้ ◌๊ ◌๋
  const toneMarks = /[\u0E48-\u0E4B]/g;
  return text.replace(toneMarks, '');
}

/**
 * Removes all vowels from Thai text
 */
export function removeVowels(text: string): string {
  // Thai vowels
  const vowels = /[\u0E30-\u0E3A\u0E40-\u0E44\u0E47]/g;
  return text.replace(vowels, '');
}

/**
 * Converts Thai numerals to Arabic numerals
 */
export function thaiToArabicNumerals(text: string): string {
  const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  let result = text;
  thaiNumerals.forEach((thaiNum, index) => {
    result = result.replace(new RegExp(thaiNum, 'g'), index.toString());
  });
  return result;
}

/**
 * Converts Arabic numerals to Thai numerals
 */
export function arabicToThaiNumerals(text: string): string {
  const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  let result = text;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(i.toString(), 'g'), thaiNumerals[i]);
  }
  return result;
}

/**
 * Adds spaces between Thai and English text
 */
export function addSpacesBetweenThaiEnglish(text: string): string {
  // Add space before English text that follows Thai
  let result = text.replace(/([ก-๙])([a-zA-Z0-9])/g, '$1 $2');
  // Add space before Thai text that follows English
  result = result.replace(/([a-zA-Z0-9])([ก-๙])/g, '$1 $2');
  return result;
}

/**
 * Counts Thai characters in text
 */
export function countThaiCharacters(text: string): number {
  const thaiChars = text.match(/[ก-๙]/g);
  return thaiChars ? thaiChars.length : 0;
}

/**
 * Checks if text contains Thai characters
 */
export function hasThaiCharacters(text: string): boolean {
  return /[ก-๙]/.test(text);
}

export default {
  removeToneMarks,
  removeVowels,
  thaiToArabicNumerals,
  arabicToThaiNumerals,
  addSpacesBetweenThaiEnglish,
  countThaiCharacters,
  hasThaiCharacters,
};
