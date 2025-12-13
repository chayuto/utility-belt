/**
 * Thai Text Obfuscator
 * 
 * A library for transforming Thai text into visually identical but
 * machine-unreadable variants using homoglyph substitution.
 * 
 * @packageDocumentation
 */

// Core functionality
export { obfuscate } from './core/engine';
export type { ObfuscationResult, ObfuscationStats } from './core/engine';

// Segmentation and analysis
export { segmentText, analyzeCluster, categorizeCharacter, isThaiCodePoint, THAI_RANGES } from './core';

// Configuration
export { DEFAULT_OPTIONS } from './types/options';
export type {
    ObfuscationOptions,
    ToneStrategy,
    FontStyle,
    ObfuscationStrategy as StrategyType
} from './types/options';

// Types
export type {
    GraphemeCluster,
    ClusterComposition,
    CharacterInfo,
    ThaiCharacterCategory,
    SegmentationResult,
    TextStats
} from './types/cluster';
export type { CharacterMapping, HomoglyphEntry, ConfidenceLevel, HomoglyphMap } from './types/maps';

// Presets
export { presets, getPreset } from './presets';
export type { PresetName } from './presets';

// Analysis
export { analyzeText, estimateThreatResistance } from './utils/analysis';
export type { TextAnalysis } from './utils/analysis';

// Accessibility
export {
    wrapWithAriaLabel,
    generateScreenReaderText,
    getScreenReaderOnlyCSS
} from './accessibility';
export type { AriaOptions } from './accessibility';

// Font utilities
export {
    RECOMMENDED_FONTS,
    generateFontStack,
    generateGoogleFontsUrl,
    generateObfuscatedTextCSS
} from './utils/fonts';
export type { FontRecommendation } from './utils/fonts';

// Validation
export { validateInput, validateOptions } from './utils/validation';
export type { ValidationResult } from './utils/validation';

// Debug utilities (not for production)
export { generateDiff, formatDiff, attemptDeobfuscation } from './utils/deobfuscate';
export type { ObfuscationDiff } from './utils/deobfuscate';

// Low-level access (advanced users)
export { getMapping, getBestReplacement, getRandomReplacement, HOMOGLYPH_MAP } from './maps';

// Normalization/detection (for testing and cleanup)
export {
    normalizeThaiObfuscation,
    stripZeroWidth,
    detectObfuscation,
    REVERSE_HOMOGLYPH_MAP
} from './utils/normalize';
export type { NormalizeOptions } from './utils/normalize';
