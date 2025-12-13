import { describe, it, expect } from 'vitest';
import { obfuscate } from '../../src/core/engine';
import { presets } from '../../src/presets';
import { createSeededRandom } from '../../src/utils/random';

describe('Obfuscation Engine', () => {
    it('obfuscates Thai text', () => {
        const result = obfuscate('ของกิน', { randomSeed: 12345 });
        expect(result.output).not.toBe('ของกิน');
        expect(result.stats.obfuscatedClusters).toBeGreaterThan(0);
    });

    it('produces reproducible output with seed', () => {
        const result1 = obfuscate('ทดสอบ', { randomSeed: 42 });
        const result2 = obfuscate('ทดสอบ', { randomSeed: 42 });
        expect(result1.output).toBe(result2.output);
    });

    it('respects density setting', () => {
        const full = obfuscate('กขคงจ', { density: 1.0, randomSeed: 1 });
        const half = obfuscate('กขคงจ', { density: 0.5, randomSeed: 1 });
        expect(full.stats.obfuscatedClusters).toBeGreaterThanOrEqual(
            half.stats.obfuscatedClusters
        );
    });

    it('preserves spaces by default', () => {
        const result = obfuscate('ก ข ค');
        expect(result.output).toContain(' ');
    });

    it('preserves newlines by default', () => {
        const result = obfuscate('ก\nข');
        expect(result.output).toContain('\n');
    });

    it('returns statistics', () => {
        const result = obfuscate('ทดสอบ');
        expect(result.stats.totalClusters).toBe(5);
        expect(result.stats.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
});

describe('Presets', () => {
    it('maximum preset obfuscates with high ratio', () => {
        const result = obfuscate('ทน', { ...presets.maximum, randomSeed: 1 });
        expect(result.stats.obfuscationRatio).toBeGreaterThan(0.5);
    });

    it('subtle preset has lower obfuscation', () => {
        const result = obfuscate('ทดสอบ', { ...presets.subtle, randomSeed: 1 });
        expect(result.stats.obfuscationRatio).toBeLessThanOrEqual(0.5);
    });

    it('invisible preset uses only zero-width', () => {
        const result = obfuscate('ทดสอบ', presets.invisible);
        expect(result.stats.strategyBreakdown['zeroWidth']).toBeGreaterThan(0);
        expect(result.stats.strategyBreakdown['simple'] || 0).toBe(0);
    });
});

describe('Seeded Random', () => {
    it('produces deterministic sequence', () => {
        const random1 = createSeededRandom(42);
        const random2 = createSeededRandom(42);

        for (let i = 0; i < 10; i++) {
            expect(random1()).toBe(random2());
        }
    });

    it('different seeds produce different sequences', () => {
        const random1 = createSeededRandom(1);
        const random2 = createSeededRandom(2);
        expect(random1()).not.toBe(random2());
    });
});
