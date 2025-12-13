import type { GraphemeCluster } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult } from './types';

/**
 * Zero-width characters for injection
 */
const ZERO_WIDTH_CHARS = {
    ZWSP: '\u200B',  // Zero Width Space
    ZWNJ: '\u200C',  // Zero Width Non-Joiner
    ZWJ: '\u200D',   // Zero Width Joiner
    WJ: '\u2060',    // Word Joiner
};

/**
 * Zero-width injection strategy
 * 
 * Injects invisible characters that:
 * - Break Ctrl+F text search
 * - Defeat keyword filtering
 * - Maintain visual appearance
 * 
 * Can be combined with other strategies
 */
export function zeroWidthStrategy(
    cluster: GraphemeCluster,
    _options: ObfuscationOptions,
    random: () => number
): StrategyResult {
    const { segment } = cluster;

    // Select a zero-width character
    const zwChars = Object.values(ZERO_WIDTH_CHARS);
    const selectedZW = zwChars[Math.floor(random() * zwChars.length)];

    // Inject after the cluster
    const output = segment + selectedZW;

    return {
        output,
        wasObfuscated: true,
        strategy: 'zeroWidth',
        confidence: 1.0, // Always "works" visually
    };
}

/**
 * Inject zero-width characters between code points within a cluster
 * More aggressive but may affect rendering
 */
export function intraClusterZeroWidth(
    cluster: GraphemeCluster,
    random: () => number
): string {
    const chars = [...cluster.segment];
    if (chars.length <= 1) {
        return cluster.segment;
    }

    const zwChars = Object.values(ZERO_WIDTH_CHARS);
    let result = chars[0];

    for (let i = 1; i < chars.length; i++) {
        // 50% chance to inject between each character
        if (random() < 0.5) {
            result += zwChars[Math.floor(random() * zwChars.length)];
        }
        result += chars[i];
    }

    return result;
}
