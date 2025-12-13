import { segmentText } from '../core/segmenter';
import { getMapping } from '../maps';

/**
 * Analysis result for input text
 */
export interface TextAnalysis {
    /** Whether the text is suitable for obfuscation */
    suitable: boolean;

    /** Ratio of Thai characters */
    thaiRatio: number;

    /** Estimated obfuscation effectiveness (0-1) */
    estimatedEffectiveness: number;

    /** Number of high-confidence mappable characters */
    highConfidenceCount: number;

    /** Number of characters that cannot be mapped */
    unmappableCount: number;

    /** Recommendations for improvement */
    recommendations: string[];

    /** Character breakdown */
    breakdown: {
        consonants: number;
        vowels: number;
        toneMarks: number;
        numerals: number;
        other: number;
    };
}

/**
 * Analyze text for obfuscation suitability
 */
export function analyzeText(text: string): TextAnalysis {
    const segmentation = segmentText(text);
    const recommendations: string[] = [];

    let highConfidenceCount = 0;
    let unmappableCount = 0;
    let totalConfidence = 0;
    let mappableCount = 0;

    const breakdown = {
        consonants: 0,
        vowels: 0,
        toneMarks: 0,
        numerals: 0,
        other: 0,
    };

    for (const cluster of segmentation.clusters) {
        const { composition } = cluster;

        // Count character types
        if (composition.base) {
            if (composition.base.category === 'consonant') breakdown.consonants++;
            else if (composition.base.category === 'numeral') breakdown.numerals++;
        }
        if (composition.leadingVowel || composition.followingVowel ||
            composition.aboveVowel || composition.belowVowel) {
            breakdown.vowels++;
        }
        if (composition.toneMark) breakdown.toneMarks++;
        if (!composition.isPureThai) breakdown.other++;

        // Check mappability
        if (composition.base) {
            const mapping = getMapping(composition.base.char);
            if (mapping && mapping.replacements.length > 0) {
                const bestConfidence = mapping.replacements[0].confidence;
                totalConfidence += bestConfidence;
                mappableCount++;

                if (bestConfidence >= 0.9) {
                    highConfidenceCount++;
                }
            } else {
                unmappableCount++;
            }
        }
    }

    const thaiRatio = segmentation.stats.thaiRatio;
    const estimatedEffectiveness = mappableCount > 0
        ? totalConfidence / mappableCount
        : 0;

    // Generate recommendations
    if (thaiRatio < 0.5) {
        recommendations.push('Text has low Thai content. Obfuscation may be less effective.');
    }

    if (unmappableCount > mappableCount * 0.3) {
        recommendations.push('Many characters cannot be mapped. Consider using zero-width strategy.');
    }

    if (highConfidenceCount < mappableCount * 0.5) {
        recommendations.push('Few high-confidence mappings available. Use loopless fonts for best results.');
    }

    if (breakdown.toneMarks > breakdown.consonants * 0.5) {
        recommendations.push('High tone mark density. Consider "latin" tone strategy.');
    }

    return {
        suitable: thaiRatio > 0.3 && estimatedEffectiveness > 0.5,
        thaiRatio,
        estimatedEffectiveness,
        highConfidenceCount,
        unmappableCount,
        recommendations,
        breakdown,
    };
}

/**
 * Estimate effectiveness against specific threats
 */
export function estimateThreatResistance(text: string): Record<string, number> {
    const analysis = analyzeText(text);

    return {
        /** Resistance to keyword search (Ctrl+F) */
        keywordSearch: analysis.estimatedEffectiveness * 0.95,

        /** Resistance to regex pattern matching */
        regexMatching: analysis.estimatedEffectiveness * 0.90,

        /** Resistance to machine translation */
        machineTranslation: analysis.estimatedEffectiveness * 0.85,

        /** Resistance to OCR */
        ocr: analysis.estimatedEffectiveness * 0.60,

        /** Resistance to NLP tokenization */
        nlpTokenization: analysis.estimatedEffectiveness * 0.80,
    };
}
