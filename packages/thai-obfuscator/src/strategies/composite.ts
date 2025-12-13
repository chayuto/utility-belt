import type { GraphemeCluster, CharacterInfo } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult } from './types';
import { getRandomReplacement, getMapping, LATIN_COMBINING_MAP } from '../maps';

/**
 * Composite strategy for base + combining marks
 * 
 * THE LATIN-ONLY RULE:
 * If base → Latin, then ALL marks → Latin combining diacritics
 * Never mix Thai marks on Latin bases (causes dotted circles)
 */
export function compositeStrategy(
    cluster: GraphemeCluster,
    options: ObfuscationOptions,
    random: () => number
): StrategyResult {
    const { composition, segment } = cluster;

    // Must have a base to work with
    if (!composition.base) {
        return {
            output: segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
            warnings: ['Composite strategy requires base character'],
        };
    }

    // Try to replace the base consonant
    const baseReplacement = getRandomReplacement(composition.base.char, {
        fontStyle: options.fontStyle,
        minConfidence: options.minConfidence,
    }, random);

    // If base can't be replaced, we can't safely obfuscate
    if (!baseReplacement) {
        return {
            output: segment,
            wasObfuscated: false,
            strategy: 'none',
            confidence: 0,
        };
    }

    // Build the obfuscated cluster
    let result = '';
    let totalConfidence = 0;
    let markCount = 0;
    const warnings: string[] = [];

    // Handle leading vowel (if present, it comes before base)
    if (composition.leadingVowel) {
        const vowelReplacement = getRandomReplacement(
            composition.leadingVowel.char,
            { fontStyle: options.fontStyle, minConfidence: options.minConfidence },
            random
        );
        result += vowelReplacement ?? composition.leadingVowel.char;
    }

    // Add the base replacement
    result += baseReplacement;
    const baseMapping = getMapping(composition.base.char);
    totalConfidence += baseMapping?.replacements[0]?.confidence ?? 0;

    // Handle combining marks based on tone strategy
    const combiningMarks = [
        composition.aboveVowel,
        composition.belowVowel,
        composition.toneMark,
        ...composition.diacritics,
    ].filter((m): m is CharacterInfo => m !== null);

    for (const mark of combiningMarks) {
        markCount++;

        if (mark.category === 'tone_mark') {
            // Apply tone strategy
            switch (options.toneStrategy) {
                case 'remove':
                    // Skip the tone mark entirely
                    continue;

                case 'latin': {
                    // Replace with Latin combining diacritic
                    const latinMark = LATIN_COMBINING_MAP[mark.char];
                    if (latinMark) {
                        result += latinMark;
                    } else {
                        warnings.push(`No Latin equivalent for tone mark ${mark.char}`);
                    }
                    break;
                }

                case 'retain':
                    // Keep Thai mark (risky - may cause dotted circle)
                    result += mark.char;
                    warnings.push('Retaining Thai tone mark on Latin base - rendering risk');
                    break;
            }
        } else {
            // Vowel marks - always convert to Latin when base is Latin
            const latinMark = LATIN_COMBINING_MAP[mark.char];
            if (latinMark) {
                result += latinMark;
            } else {
                warnings.push(`No Latin equivalent for mark ${mark.char}`);
                // Skip the mark to avoid dotted circle
            }
        }
    }

    // Handle following vowel (comes after base)
    if (composition.followingVowel) {
        const vowelReplacement = getRandomReplacement(
            composition.followingVowel.char,
            { fontStyle: options.fontStyle, minConfidence: options.minConfidence },
            random
        );
        result += vowelReplacement ?? composition.followingVowel.char;
    }

    const avgConfidence = markCount > 0
        ? totalConfidence / (markCount + 1)
        : totalConfidence;

    return {
        output: result,
        wasObfuscated: true,
        strategy: 'composite',
        confidence: avgConfidence,
        warnings: warnings.length > 0 ? warnings : undefined,
    };
}
