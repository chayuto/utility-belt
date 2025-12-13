/**
 * Confidence level for visual similarity in loopless fonts
 */
export type ConfidenceLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * A single homoglyph mapping entry
 */
export interface HomoglyphEntry {
    /** The replacement character(s) */
    replacement: string;

    /** Visual similarity confidence (0.0 - 1.0) */
    confidence: number;

    /** Confidence category */
    level: ConfidenceLevel;

    /** Best font style for this mapping */
    bestFontStyle: 'loopless' | 'traditional' | 'any';

    /** Notes about this mapping */
    notes?: string;
}

/**
 * Complete mapping for a Thai character
 */
export interface CharacterMapping {
    /** Original Thai character */
    thai: string;

    /** Unicode code point */
    codePoint: number;

    /** Character name */
    name: string;

    /** Available replacements (ordered by confidence) */
    replacements: HomoglyphEntry[];

    /** Whether this is a combining character */
    isCombining: boolean;
}

/**
 * Complete homoglyph map structure
 */
export type HomoglyphMap = Map<string, CharacterMapping>;
