import { describe, it, expect } from 'vitest';
import { getMapping, getBestReplacement } from '../../src/maps';

describe('Homoglyph Maps', () => {
    describe('Critical Mappings', () => {
        it('maps ท to n with high confidence', () => {
            const mapping = getMapping('ท');
            expect(mapping).toBeDefined();
            expect(mapping!.replacements[0].replacement).toBe('n');
            expect(mapping!.replacements[0].confidence).toBeGreaterThanOrEqual(0.95);
        });

        it('maps อ to o with critical confidence', () => {
            const mapping = getMapping('อ');
            expect(mapping!.replacements[0].confidence).toBeGreaterThanOrEqual(0.95);
        });

        it('maps น to u with high confidence', () => {
            const mapping = getMapping('น');
            expect(mapping!.replacements[0].replacement).toBe('u');
            expect(mapping!.replacements[0].confidence).toBeGreaterThanOrEqual(0.95);
        });
    });

    describe('getBestReplacement', () => {
        it('returns highest confidence match', () => {
            const result = getBestReplacement('น', {
                fontStyle: 'loopless',
                minConfidence: 0.6
            });
            expect(result).toBe('u');
        });

        it('returns null for no mappings', () => {
            const result = getBestReplacement('ฆ', {
                fontStyle: 'loopless',
                minConfidence: 0.9
            });
            expect(result).toBeNull();
        });
    });

    describe('Combining Marks', () => {
        it('marks tone marks as combining', () => {
            const mapping = getMapping('่');
            expect(mapping?.isCombining).toBe(true);
        });

        it('marks above vowels as combining', () => {
            const mapping = getMapping('ิ');
            expect(mapping?.isCombining).toBe(true);
        });
    });
});
