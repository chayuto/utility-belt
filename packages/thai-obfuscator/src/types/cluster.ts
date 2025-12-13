/**
 * Unicode categories for Thai characters
 */
export type ThaiCharacterCategory =
    | 'consonant'           // ก-ฮ (U+0E01-U+0E2E)
    | 'vowel_leading'       // เ แ โ ไ ใ (preposed vowels)
    | 'vowel_following'     // ะ า ำ (postposed vowels)
    | 'vowel_above'         // ิ ี ึ ื (superscript vowels)
    | 'vowel_below'         // ุ ู (subscript vowels)
    | 'tone_mark'           // ่ ้ ๊ ๋ (tone marks)
    | 'diacritic'           // ์ ็ ๆ ฯ (other diacritics)
    | 'numeral'             // ๐-๙ (Thai digits)
    | 'punctuation'         // Thai punctuation
    | 'unknown';            // Non-Thai or unrecognized

/**
 * Represents a single grapheme cluster from Thai text
 */
export interface GraphemeCluster {
    /** The original string segment */
    segment: string;

    /** Starting index in original text */
    index: number;

    /** Decomposed code points */
    codePoints: number[];

    /** Analyzed composition */
    composition: ClusterComposition;

    /** Whether this cluster is obfuscatable */
    obfuscatable: boolean;

    /** Recommended obfuscation strategy */
    recommendedStrategy: 'simple' | 'composite' | 'zeroWidth' | 'skip';
}

/**
 * Detailed breakdown of a grapheme cluster's components
 */
export interface ClusterComposition {
    /** Base consonant (if present) */
    base: CharacterInfo | null;

    /** Leading vowel (if present, e.g., เ แ โ) */
    leadingVowel: CharacterInfo | null;

    /** Following vowel (if present, e.g., ะ า) */
    followingVowel: CharacterInfo | null;

    /** Above vowel (if present, e.g., ิ ี) */
    aboveVowel: CharacterInfo | null;

    /** Below vowel (if present, e.g., ุ ู) */
    belowVowel: CharacterInfo | null;

    /** Tone mark (if present) */
    toneMark: CharacterInfo | null;

    /** Other diacritics */
    diacritics: CharacterInfo[];

    /** Total number of combining marks */
    combiningMarkCount: number;

    /** Whether cluster contains only Thai characters */
    isPureThai: boolean;

    /** Whether cluster is a simple single character */
    isSimple: boolean;
}

/**
 * Information about a single character
 */
export interface CharacterInfo {
    /** The character itself */
    char: string;

    /** Unicode code point */
    codePoint: number;

    /** Character category */
    category: ThaiCharacterCategory;

    /** Unicode name (for debugging) */
    unicodeName?: string;
}

/**
 * Result of segmenting Thai text
 */
export interface SegmentationResult {
    /** Array of grapheme clusters */
    clusters: GraphemeCluster[];

    /** Original input text */
    originalText: string;

    /** Statistics about the text */
    stats: TextStats;
}

/**
 * Statistics about analyzed text
 */
export interface TextStats {
    /** Total grapheme clusters */
    totalClusters: number;

    /** Clusters that can be obfuscated */
    obfuscatableClusters: number;

    /** Ratio of Thai content */
    thaiRatio: number;

    /** Number of simple (single-char) clusters */
    simpleClusters: number;

    /** Number of composite (multi-char) clusters */
    compositeClusters: number;

    /** Number of clusters with tone marks */
    clustersWithTones: number;
}
