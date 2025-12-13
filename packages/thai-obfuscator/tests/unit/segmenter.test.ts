import { describe, it, expect } from 'vitest';
import { segmentText } from '../../src/core/segmenter';

describe('segmentText', () => {
    it('segments simple Thai text', () => {
        const result = segmentText('กขค');
        expect(result.clusters).toHaveLength(3);
        expect(result.clusters[0].segment).toBe('ก');
        expect(result.clusters[1].segment).toBe('ข');
        expect(result.clusters[2].segment).toBe('ค');
    });

    it('keeps consonant + tone mark together', () => {
        const result = segmentText('ก่');
        expect(result.clusters).toHaveLength(1);
        expect(result.clusters[0].segment).toBe('ก่');
        expect(result.clusters[0].composition.toneMark).not.toBeNull();
    });

    it('handles complex cluster with vowel and tone', () => {
        const result = segmentText('ที่');
        expect(result.clusters).toHaveLength(1);
        expect(result.clusters[0].segment).toBe('ที่');
        expect(result.clusters[0].composition.base?.char).toBe('ท');
        expect(result.clusters[0].composition.aboveVowel?.char).toBe('ี');
        expect(result.clusters[0].composition.toneMark?.char).toBe('่');
    });

    it('handles leading vowels', () => {
        const result = segmentText('เก');
        expect(result.clusters.length).toBeGreaterThanOrEqual(1);
    });

    it('handles mixed Thai and Latin', () => {
        const result = segmentText('ก A ข');
        expect(result.stats.thaiRatio).toBeLessThan(1);
    });

    it('calculates correct statistics', () => {
        const result = segmentText('ก่ข้ค');
        expect(result.stats.totalClusters).toBe(3);
        expect(result.stats.clustersWithTones).toBe(2);
    });
});
