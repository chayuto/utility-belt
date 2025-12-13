import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult } from '../strategies/types';
import { segmentText } from './segmenter';
import { applyStrategy } from '../strategies';
import { createRandom } from '../utils/random';
import { validateInput, validateOptions } from '../utils/validation';

/**
 * Result of obfuscation operation
 */
export interface ObfuscationResult {
    /** The obfuscated text */
    output: string;

    /** Original input text */
    original: string;

    /** Statistics about the operation */
    stats: ObfuscationStats;

    /** Any warnings generated */
    warnings: string[];
}

/**
 * Statistics about the obfuscation
 */
export interface ObfuscationStats {
    /** Total grapheme clusters processed */
    totalClusters: number;

    /** Clusters that were obfuscated */
    obfuscatedClusters: number;

    /** Obfuscation ratio */
    obfuscationRatio: number;

    /** Average confidence of transformations */
    averageConfidence: number;

    /** Breakdown by strategy */
    strategyBreakdown: Record<string, number>;

    /** Processing time in milliseconds */
    processingTimeMs: number;
}

/**
 * Main obfuscation engine
 * 
 * Transforms Thai text into visually identical but
 * machine-unreadable variants using homoglyph substitution.
 * 
 * @param text - The Thai text to obfuscate
 * @param options - Configuration options for obfuscation
 * @returns Result containing obfuscated text and statistics
 * 
 * @example
 * ```typescript
 * const result = obfuscate('สวัสดี', { density: 0.8 });
 * console.log(result.output);
 * ```
 */
export function obfuscate(
    text: string,
    options: Partial<ObfuscationOptions> = {}
): ObfuscationResult {
    const startTime = performance.now();
    const warnings: string[] = [];

    // Validate input
    const inputValidation = validateInput(text);
    warnings.push(...inputValidation.warnings);

    if (!inputValidation.valid) {
        throw new Error(`Invalid input: ${inputValidation.errors.join(', ')}`);
    }

    // Validate and merge options
    const { options: mergedOptions, warnings: optionWarnings } = validateOptions(options);
    warnings.push(...optionWarnings);

    // Create random function
    const random = createRandom(mergedOptions.randomSeed);

    // Segment the text
    const segmentation = segmentText(text);

    // Process each cluster
    const results: StrategyResult[] = [];
    const outputParts: string[] = [];

    for (const cluster of segmentation.clusters) {
        // Handle whitespace preservation
        if (mergedOptions.preserveSpaces && cluster.segment === ' ') {
            outputParts.push(' ');
            results.push({
                output: ' ',
                wasObfuscated: false,
                strategy: 'none',
                confidence: 0,
            });
            continue;
        }

        if (mergedOptions.preserveNewlines && /[\n\r]/.test(cluster.segment)) {
            outputParts.push(cluster.segment);
            results.push({
                output: cluster.segment,
                wasObfuscated: false,
                strategy: 'none',
                confidence: 0,
            });
            continue;
        }

        // Apply obfuscation strategy
        const result = applyStrategy(cluster, mergedOptions, random);
        results.push(result);
        outputParts.push(result.output);

        if (result.warnings) {
            warnings.push(...result.warnings);
        }
    }

    // Calculate statistics
    const obfuscatedCount = results.filter(r => r.wasObfuscated).length;
    const totalConfidence = results
        .filter(r => r.wasObfuscated)
        .reduce((sum, r) => sum + r.confidence, 0);

    const strategyBreakdown: Record<string, number> = {};
    for (const result of results) {
        strategyBreakdown[result.strategy] = (strategyBreakdown[result.strategy] || 0) + 1;
    }

    const processingTimeMs = performance.now() - startTime;

    return {
        output: outputParts.join(''),
        original: text,
        stats: {
            totalClusters: segmentation.clusters.length,
            obfuscatedClusters: obfuscatedCount,
            obfuscationRatio: segmentation.clusters.length > 0
                ? obfuscatedCount / segmentation.clusters.length
                : 0,
            averageConfidence: obfuscatedCount > 0
                ? totalConfidence / obfuscatedCount
                : 0,
            strategyBreakdown,
            processingTimeMs,
        },
        warnings,
    };
}
