import type { GraphemeCluster } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult, ObfuscationStrategyFn } from './types';
import { simpleStrategy } from './simple';
import { compositeStrategy } from './composite';
import { zeroWidthStrategy } from './zero-width';

/**
 * Strategy registry
 */
const STRATEGIES: Record<string, ObfuscationStrategyFn> = {
    simple: simpleStrategy,
    composite: compositeStrategy,
    zeroWidth: zeroWidthStrategy,
};

/**
 * Apply the best strategy for a cluster
 */
export function applyStrategy(
    cluster: GraphemeCluster,
    options: ObfuscationOptions,
    random: () => number
): StrategyResult {
    // Check density - should we obfuscate at all?
    if (random() > options.density) {
        return {
            output: cluster.segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
        };
    }

    // Check if cluster is obfuscatable
    if (!cluster.obfuscatable) {
        return {
            output: cluster.segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
        };
    }

    // Check preserve list
    if (options.preserveCharacters.includes(cluster.segment)) {
        return {
            output: cluster.segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
        };
    }

    // Try strategies in order of preference
    for (const strategyName of options.strategies) {
        // Skip if strategy doesn't match cluster type
        if (strategyName === 'simple' && !cluster.composition.isSimple) {
            continue;
        }
        if (strategyName === 'composite' && cluster.composition.isSimple) {
            continue;
        }

        const strategy = STRATEGIES[strategyName];
        if (!strategy) continue;

        const result = strategy(cluster, options, random);

        if (result.wasObfuscated) {
            // Optionally add zero-width injection
            if (options.injectZeroWidth && strategyName !== 'zeroWidth') {
                const zwResult = zeroWidthStrategy(
                    { ...cluster, segment: result.output },
                    options,
                    random
                );
                return {
                    ...result,
                    output: zwResult.output,
                };
            }
            return result;
        }
    }

    // No strategy worked
    return {
        output: cluster.segment,
        wasObfuscated: false,
        strategy: 'none',
        confidence: 0,
    };
}

export { simpleStrategy, compositeStrategy, zeroWidthStrategy };
export type { StrategyResult, ObfuscationStrategyFn };
