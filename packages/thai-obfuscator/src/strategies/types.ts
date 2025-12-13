import type { GraphemeCluster } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';

/**
 * Result of applying a strategy to a cluster
 */
export interface StrategyResult {
    /** The obfuscated output string */
    output: string;

    /** Whether obfuscation was applied */
    wasObfuscated: boolean;

    /** Strategy that was used */
    strategy: 'simple' | 'composite' | 'zeroWidth' | 'phonetic' | 'symbolInjection' | 'none';

    /** Confidence of the transformation */
    confidence: number;

    /** Any warnings generated */
    warnings?: string[];
}

/**
 * Strategy function signature
 */
export type ObfuscationStrategyFn = (
    cluster: GraphemeCluster,
    options: ObfuscationOptions,
    random: () => number
) => StrategyResult;
