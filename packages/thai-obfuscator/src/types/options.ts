/**
 * Strategy for handling tone marks during obfuscation
 */
export type ToneStrategy =
    | 'latin'   // Replace with Latin combining diacritics
    | 'remove'  // Remove tone marks entirely
    | 'retain'; // Keep original Thai tone marks (risky)

/**
 * Target font style for optimization
 */
export type FontStyle =
    | 'loopless'     // Modern sans-serif (Kanit, Sarabun)
    | 'traditional'  // Traditional looped fonts
    | 'any';         // No font-specific optimization

/**
 * Available obfuscation strategies
 */
export type ObfuscationStrategy =
    | 'simple'          // 1-to-1 character replacement
    | 'composite'       // Base + combining mark replacement
    | 'zeroWidth'       // Zero-width character injection
    | 'phonetic'        // Same-sound Thai consonant substitution
    | 'symbolInjection'; // Insert symbols between characters

/**
 * Main configuration options for obfuscation
 */
export interface ObfuscationOptions {
    /**
     * Probability of obfuscating each eligible character (0.0 - 1.0)
     * @default 1.0
     */
    density: number;

    /**
     * Which strategies to use (in order of preference)
     * @default ['simple', 'composite', 'zeroWidth']
     */
    strategies: ObfuscationStrategy[];

    /**
     * How to handle tone marks
     * @default 'latin'
     */
    toneStrategy: ToneStrategy;

    /**
     * Target font style for mapping optimization
     * @default 'loopless'
     */
    fontStyle: FontStyle;

    /**
     * Seed for reproducible random selection
     * @default undefined (truly random)
     */
    randomSeed?: number;

    /**
     * Preserve space characters without modification
     * @default true
     */
    preserveSpaces: boolean;

    /**
     * Preserve newline characters without modification
     * @default true
     */
    preserveNewlines: boolean;

    /**
     * Minimum confidence threshold for mappings (0.0 - 1.0)
     * @default 0.6
     */
    minConfidence: number;

    /**
     * Enable zero-width character injection between clusters
     * @default false
     */
    injectZeroWidth: boolean;

    /**
     * Characters to never obfuscate
     * @default []
     */
    preserveCharacters: string[];
}

/**
 * Default options
 */
export const DEFAULT_OPTIONS: ObfuscationOptions = {
    density: 1.0,
    strategies: ['simple', 'composite', 'zeroWidth'],
    toneStrategy: 'latin',
    fontStyle: 'loopless',
    preserveSpaces: true,
    preserveNewlines: true,
    minConfidence: 0.6,
    injectZeroWidth: false,
    preserveCharacters: [],
};
