/**
 * Thai consonant phonetic equivalents for same-sound substitution
 * 
 * These are consonants that produce the same sound in Thai,
 * allowing substitution that defeats NLP tokenizers while
 * remaining completely readable.
 */
export const PHONETIC_EQUIVALENTS: Record<string, string[]> = {
    // /k/ class (low frequency consonants to high frequency)
    'ค': ['ฅ'],           // /kh/ obsolete but valid

    // /t/ class  
    'ต': ['ฏ'],           // /t/ class

    // /th/ class
    'ท': ['ฑ', 'ฒ'],      // All produce /th/
    'ฑ': ['ท', 'ฒ'],
    'ฒ': ['ท', 'ฑ'],

    // /s/ class
    'ส': ['ศ', 'ษ'],      // All produce /s/
    'ศ': ['ส', 'ษ'],
    'ษ': ['ส', 'ศ'],

    // /ch/ class
    'จ': ['ฉ'],           // /ch/ initial
    'ช': ['ฌ'],           // /ch/ class

    // /n/ class ending
    'น': ['ณ'],           // Both produce /n/ ending
    'ณ': ['น'],

    // /p/ class
    'พ': ['ภ'],           // /ph/ class
    'ภ': ['พ'],

    // /l/ class  
    'ล': ['ฬ'],           // Both produce /l/
    'ฬ': ['ล'],
};

/**
 * Get phonetic equivalents for a Thai character
 */
export function getPhoneticEquivalents(char: string): string[] {
    return PHONETIC_EQUIVALENTS[char] || [];
}

/**
 * Check if a character has phonetic equivalents
 */
export function hasPhoneticEquivalents(char: string): boolean {
    return char in PHONETIC_EQUIVALENTS;
}
