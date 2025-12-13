import type {
    GraphemeCluster,
    SegmentationResult,
    TextStats,
    ClusterComposition
} from '../types/cluster';
import { analyzeCluster } from './analyzer';

/**
 * Segments Thai text into grapheme clusters using Intl.Segmenter
 * 
 * This is critical for Thai because combining marks (vowels, tones)
 * must stay attached to their base consonants.
 */
export function segmentText(text: string): SegmentationResult {
    // Use Thai locale for proper grapheme boundary detection
    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const segments = segmenter.segment(text);

    const clusters: GraphemeCluster[] = [];

    for (const { segment, index } of segments) {
        const codePoints = [...segment].map(char => char.codePointAt(0)!);
        const composition = analyzeCluster(segment, codePoints);

        const cluster: GraphemeCluster = {
            segment,
            index,
            codePoints,
            composition,
            obfuscatable: determineObfuscatable(composition),
            recommendedStrategy: determineStrategy(composition),
        };

        clusters.push(cluster);
    }

    const stats = calculateStats(clusters);

    return {
        clusters,
        originalText: text,
        stats,
    };
}

/**
 * Determines if a cluster can be obfuscated
 */
function determineObfuscatable(composition: ClusterComposition): boolean {
    // Must have at least some Thai content
    if (!composition.isPureThai && !composition.base) {
        return false;
    }

    // Skip if it's just whitespace or punctuation
    if (!composition.base && !composition.leadingVowel) {
        return false;
    }

    return true;
}

/**
 * Determines the best obfuscation strategy for a cluster
 */
function determineStrategy(composition: ClusterComposition): GraphemeCluster['recommendedStrategy'] {
    // Simple single characters → simple substitution
    if (composition.isSimple) {
        return 'simple';
    }

    // Has combining marks → composite strategy
    if (composition.combiningMarkCount > 0) {
        return 'composite';
    }

    // Leading vowels are spacing characters → simple
    if (composition.leadingVowel && !composition.base) {
        return 'simple';
    }

    // Default to composite for complex clusters
    return 'composite';
}

/**
 * Calculates statistics about the segmented text
 */
function calculateStats(clusters: GraphemeCluster[]): TextStats {
    let obfuscatableClusters = 0;
    let simpleClusters = 0;
    let compositeClusters = 0;
    let clustersWithTones = 0;
    let thaiCharCount = 0;
    let totalCharCount = 0;

    for (const cluster of clusters) {
        totalCharCount += cluster.segment.length;

        if (cluster.obfuscatable) {
            obfuscatableClusters++;
        }

        if (cluster.composition.isSimple) {
            simpleClusters++;
        } else {
            compositeClusters++;
        }

        if (cluster.composition.toneMark) {
            clustersWithTones++;
        }

        if (cluster.composition.isPureThai) {
            thaiCharCount += cluster.segment.length;
        }
    }

    return {
        totalClusters: clusters.length,
        obfuscatableClusters,
        thaiRatio: totalCharCount > 0 ? thaiCharCount / totalCharCount : 0,
        simpleClusters,
        compositeClusters,
        clustersWithTones,
    };
}

/**
 * Re-export for convenience
 */
export { analyzeCluster } from './analyzer';
