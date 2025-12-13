import type { GraphemeCluster } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult } from './types';
import { PHONETIC_EQUIVALENTS } from '../maps/phonetic-equivalents';

/**
 * Phonetic substitution strategy - "Phasa Wibat" style
 * 
 * Substitutes Thai consonants with same-sound equivalents.
 * This is a native Thai obfuscation technique that:
 * - Defeats Thai NLP tokenizers (trained on standard spelling)
 * - Remains 100% readable by Thai speakers
 * - Uses no Latin characters at all
 * 
 * @example
 * สวัสดี → สวัศดี (ส→ศ)
 * ทำไม → ฑำไม (ท→ฑ)
 */
export function phoneticStrategy(
    cluster: GraphemeCluster,
    options: ObfuscationOptions,
    random: () => number
): StrategyResult {
    const { segment, composition } = cluster;

    // Get the base consonant character (composition.base is CharacterInfo, we need the char)
    const baseChar = composition.base?.char || segment[0];

    const equivalents = PHONETIC_EQUIVALENTS[baseChar];

    if (!equivalents || equivalents.length === 0) {
        return {
            output: segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
        };
    }

    // Check density
    if (random() > (options.density ?? 0.7)) {
        return {
            output: segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
        };
    }

    // Pick a random equivalent
    const replacement = equivalents[Math.floor(random() * equivalents.length)];

    // Replace base and keep the rest of the cluster
    const output = segment.replace(baseChar, replacement);

    return {
        output,
        wasObfuscated: true,
        strategy: 'phonetic',
        confidence: 0.95, // High confidence - same sound
    };
}
