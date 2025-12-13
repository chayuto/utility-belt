import type { ObfuscationOptions } from './types/options';

/**
 * Preset configurations for common use cases
 */
export const presets = {
    /**
     * Maximum obfuscation - all possible substitutions
     * Use for: Anti-scraping, content protection
     */
    maximum: {
        density: 1.0,
        strategies: ['simple', 'composite', 'zeroWidth'],
        toneStrategy: 'latin',
        fontStyle: 'loopless',
        minConfidence: 0.5,
        injectZeroWidth: true,
    } as Partial<ObfuscationOptions>,

    /**
     * Balanced - good obfuscation with readability
     * Use for: General anti-bot protection
     */
    balanced: {
        density: 0.7,
        strategies: ['simple', 'composite'],
        toneStrategy: 'latin',
        fontStyle: 'loopless',
        minConfidence: 0.7,
        injectZeroWidth: false,
    } as Partial<ObfuscationOptions>,

    /**
     * Subtle - minimal visual impact
     * Use for: Light protection, A/B testing
     */
    subtle: {
        density: 0.3,
        strategies: ['simple'],
        toneStrategy: 'retain',
        fontStyle: 'loopless',
        minConfidence: 0.9,
        injectZeroWidth: false,
    } as Partial<ObfuscationOptions>,

    /**
     * Zero-width only - invisible changes
     * Use for: Breaking text search without visual change
     */
    invisible: {
        density: 1.0,
        strategies: ['zeroWidth'],
        toneStrategy: 'retain',
        fontStyle: 'any',
        minConfidence: 0,
        injectZeroWidth: true,
    } as Partial<ObfuscationOptions>,

    /**
     * Traditional fonts - optimized for looped Thai fonts
     * Use for: When using traditional Thai typography
     */
    traditional: {
        density: 0.5,
        strategies: ['simple', 'composite'],
        toneStrategy: 'latin',
        fontStyle: 'traditional',
        minConfidence: 0.8,
        injectZeroWidth: false,
    } as Partial<ObfuscationOptions>,

    /**
     * Native Thai - uses phonetic substitution only
     * Use for: Evading Thai-only NLP without Latin mixing
     * Text remains 100% Thai, just with different consonants that sound the same
     */
    nativeThai: {
        density: 0.6,
        strategies: ['phonetic', 'zeroWidth'],
        toneStrategy: 'retain',
        fontStyle: 'any',
        minConfidence: 0,
        injectZeroWidth: true,
    } as Partial<ObfuscationOptions>,

    /**
     * Anti-regex - optimized for breaking pattern matching
     * Use for: Defeating exact-match keyword filters
     */
    antiRegex: {
        density: 1.0,
        strategies: ['simple', 'zeroWidth'],
        toneStrategy: 'latin',
        fontStyle: 'loopless',
        minConfidence: 0.5,
        injectZeroWidth: true,
    } as Partial<ObfuscationOptions>,
} as const;

export type PresetName = keyof typeof presets;

/**
 * Get a preset by name
 */
export function getPreset(name: PresetName): Partial<ObfuscationOptions> {
    return presets[name];
}
