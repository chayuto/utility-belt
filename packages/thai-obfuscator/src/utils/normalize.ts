import { HOMOGLYPH_MAP } from '../maps';

/**
 * Zero-width characters used in obfuscation
 */
const ZERO_WIDTH_REGEX = /[\u200B\u200C\u200D\u2060\uFEFF]/g;

/**
 * Build reverse mapping (Latin → Thai)
 */
function buildReverseHomoglyphMap(): Map<string, string> {
    const reverseMap = new Map<string, string>();

    for (const [thai, mapping] of HOMOGLYPH_MAP) {
        for (const replacement of mapping.replacements) {
            // If multiple Thai chars map to same Latin, prefer highest confidence
            const existing = reverseMap.get(replacement.replacement);
            if (!existing) {
                reverseMap.set(replacement.replacement, thai);
            }
        }
    }

    return reverseMap;
}

/**
 * Exported reverse map for user customization
 */
export const REVERSE_HOMOGLYPH_MAP = buildReverseHomoglyphMap();

/**
 * Check if text is predominantly Thai
 */
function isPredominantlyThai(text: string): boolean {
    const thaiRegex = /[\u0E00-\u0E7F]/g;
    const thaiMatches = text.match(thaiRegex) || [];
    const nonSpaceChars = text.replace(/\s/g, '').length;

    return nonSpaceChars > 0 && thaiMatches.length / nonSpaceChars > 0.3;
}

/**
 * Options for normalization
 */
export interface NormalizeOptions {
    /** Strip zero-width characters (default: true) */
    stripZeroWidth?: boolean;

    /** Apply NFKC Unicode normalization (default: true) */
    applyNfkc?: boolean;

    /** Reverse homoglyph substitutions (default: true) */
    reverseHomoglyphs?: boolean;

    /** Only reverse if text is predominantly Thai (default: true) */
    detectThaiContext?: boolean;
}

const DEFAULT_OPTIONS: Required<NormalizeOptions> = {
    stripZeroWidth: true,
    applyNfkc: true,
    reverseHomoglyphs: true,
    detectThaiContext: true,
};

/**
 * Normalize obfuscated Thai text back to standard form
 * 
 * This reverses common obfuscation techniques:
 * 1. Strips zero-width characters (ZWSP, ZWNJ, ZWJ, WJ)
 * 2. Applies NFKC Unicode normalization
 * 3. Reverses homoglyph substitutions (Latin → Thai)
 * 
 * @param text - The potentially obfuscated text
 * @param options - Normalization options
 * @returns Normalized text
 * 
 * @example
 * ```typescript
 * const obfuscated = "sวัsดี"; // with Latin 's' for Thai 'ร'
 * const normalized = normalizeThaiObfuscation(obfuscated);
 * // Returns: "รวัรดี" (or close approximation)
 * ```
 */
export function normalizeThaiObfuscation(
    text: string,
    options: NormalizeOptions = {}
): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let result = text;

    // Step 1: Strip zero-width characters
    if (opts.stripZeroWidth) {
        result = result.replace(ZERO_WIDTH_REGEX, '');
    }

    // Step 2: NFKC normalization (normalizes compatible characters)
    if (opts.applyNfkc) {
        result = result.normalize('NFKC');
    }

    // Step 3: Reverse homoglyph substitutions
    if (opts.reverseHomoglyphs) {
        // Only apply if text appears to be Thai
        if (!opts.detectThaiContext || isPredominantlyThai(result)) {
            for (const [latin, thai] of REVERSE_HOMOGLYPH_MAP) {
                // Use a regex to handle multi-char replacements
                result = result.split(latin).join(thai);
            }
        }
    }

    return result;
}

/**
 * Strip only zero-width characters from text
 * 
 * Useful for quick cleaning without full normalization.
 */
export function stripZeroWidth(text: string): string {
    return text.replace(ZERO_WIDTH_REGEX, '');
}

/**
 * Detect if text likely contains obfuscation
 * 
 * Checks for common obfuscation markers:
 * - Zero-width characters
 * - Latin characters mixed with Thai
 * - Unusual Unicode points
 */
export function detectObfuscation(text: string): {
    hasZeroWidth: boolean;
    hasLatinMix: boolean;
    suspicionScore: number;
} {
    const hasZeroWidth = ZERO_WIDTH_REGEX.test(text);
    // Reset regex lastIndex after test
    ZERO_WIDTH_REGEX.lastIndex = 0;

    // Check for Latin chars in predominantly Thai text
    const thaiChars = (text.match(/[\u0E00-\u0E7F]/g) || []).length;
    const latinChars = (text.match(/[a-zA-Z0-9]/g) || []).length;
    const hasLatinMix = thaiChars > 0 && latinChars > 0 && latinChars / (thaiChars + latinChars) > 0.1;

    let suspicionScore = 0;
    if (hasZeroWidth) suspicionScore += 0.5;
    if (hasLatinMix) suspicionScore += 0.5;

    return {
        hasZeroWidth,
        hasLatinMix,
        suspicionScore: Math.min(1, suspicionScore),
    };
}
