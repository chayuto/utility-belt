import type { CharacterMapping, HomoglyphMap } from '../types/maps';
import { CONSONANT_MAPPINGS } from './consonants';
import { VOWEL_MAPPINGS } from './vowels';
import { TONE_MARK_MAPPINGS, LATIN_COMBINING_MAP } from './tone-marks';
import { NUMERAL_MAPPINGS } from './numerals';

/**
 * Unified homoglyph map combining all character types
 */
export const HOMOGLYPH_MAP: HomoglyphMap = new Map([
    ...CONSONANT_MAPPINGS,
    ...VOWEL_MAPPINGS,
    ...TONE_MARK_MAPPINGS,
    ...NUMERAL_MAPPINGS,
]);

/**
 * Get mapping for a Thai character
 */
export function getMapping(char: string): CharacterMapping | undefined {
    return HOMOGLYPH_MAP.get(char);
}

/**
 * Get best replacement for a character given options
 */
export function getBestReplacement(
    char: string,
    options: {
        fontStyle: 'loopless' | 'traditional' | 'any';
        minConfidence: number;
    }
): string | null {
    const mapping = HOMOGLYPH_MAP.get(char);
    if (!mapping) return null;

    // Filter by confidence and font style
    const suitable = mapping.replacements.filter(r => {
        if (r.confidence < options.minConfidence) return false;
        if (options.fontStyle !== 'any' &&
            r.bestFontStyle !== 'any' &&
            r.bestFontStyle !== options.fontStyle) {
            return false;
        }
        return true;
    });

    if (suitable.length === 0) return null;

    // Return highest confidence match
    return suitable[0].replacement;
}

/**
 * Get random replacement from available options
 */
export function getRandomReplacement(
    char: string,
    options: {
        fontStyle: 'loopless' | 'traditional' | 'any';
        minConfidence: number;
    },
    random: () => number = Math.random
): string | null {
    const mapping = HOMOGLYPH_MAP.get(char);
    if (!mapping) return null;

    const suitable = mapping.replacements.filter(r => {
        if (r.confidence < options.minConfidence) return false;
        if (options.fontStyle !== 'any' &&
            r.bestFontStyle !== 'any' &&
            r.bestFontStyle !== options.fontStyle) {
            return false;
        }
        return true;
    });

    if (suitable.length === 0) return null;

    // Random selection weighted by confidence
    const totalWeight = suitable.reduce((sum, r) => sum + r.confidence, 0);
    let threshold = random() * totalWeight;

    for (const replacement of suitable) {
        threshold -= replacement.confidence;
        if (threshold <= 0) {
            return replacement.replacement;
        }
    }

    return suitable[0].replacement;
}

export { LATIN_COMBINING_MAP };
