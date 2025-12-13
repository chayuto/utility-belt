import type { GraphemeCluster } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult } from './types';
import { getRandomReplacement, getMapping } from '../maps';


/**
 * Simple 1-to-1 character substitution
 * 
 * Best for:
 * - Single consonants without marks
 * - Leading vowels (เ, แ, โ, ไ, ใ)
 * - Following vowels (ะ, า)
 * - Numerals
 */
export function simpleStrategy(
    cluster: GraphemeCluster,
    options: ObfuscationOptions,
    random: () => number
): StrategyResult {
    const { composition, segment } = cluster;

    // Only works for simple clusters
    if (!composition.isSimple) {
        return {
            output: segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
            warnings: ['Simple strategy requires single-character cluster'],
        };
    }

    const char = segment;
    const replacement = getRandomReplacement(char, {
        fontStyle: options.fontStyle,
        minConfidence: options.minConfidence,
    }, random);

    if (!replacement) {
        return {
            output: segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
        };
    }

    const mapping = getMapping(char);
    const confidence = mapping?.replacements[0]?.confidence ?? 0;

    return {
        output: replacement,
        wasObfuscated: true,
        strategy: 'simple',
        confidence,
    };
}
