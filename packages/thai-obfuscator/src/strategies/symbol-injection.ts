import type { GraphemeCluster } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult } from './types';

const INJECTION_SYMBOLS = ['-', '.', '_', '·', '‧'];

/**
 * Symbol injection strategy
 * 
 * Inserts visible but ignorable symbols within text.
 * Defeats exact-match regex and keyword detection.
 * 
 * @example
 * ขาย → ข-าย or ข.าย
 */
export function symbolInjectionStrategy(
    cluster: GraphemeCluster,
    options: ObfuscationOptions,
    random: () => number,
    isLastCluster: boolean = false
): StrategyResult {
    const { segment } = cluster;

    // Don't inject after the last cluster
    if (isLastCluster) {
        return {
            output: segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
        };
    }

    const rate = 'symbolInjectionRate' in options
        ? (options as { symbolInjectionRate?: number }).symbolInjectionRate ?? 0.3
        : 0.3;

    if (random() > rate) {
        return {
            output: segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
        };
    }

    // Pick a random symbol
    const symbol = INJECTION_SYMBOLS[Math.floor(random() * INJECTION_SYMBOLS.length)];

    return {
        output: segment + symbol,
        wasObfuscated: true,
        strategy: 'symbolInjection',
        confidence: 0.85,
    };
}
