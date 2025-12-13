import { describe, it, expect } from 'vitest';
import { analyzeCluster, categorizeCharacter, isThaiCodePoint } from '../../src/core/analyzer';

describe('categorizeCharacter', () => {
    it('identifies consonants', () => {
        expect(categorizeCharacter(0x0E01)).toBe('consonant'); // ก
        expect(categorizeCharacter(0x0E2E)).toBe('consonant'); // ฮ
    });

    it('identifies tone marks', () => {
        expect(categorizeCharacter(0x0E48)).toBe('tone_mark'); // ่
        expect(categorizeCharacter(0x0E49)).toBe('tone_mark'); // ้
    });

    it('identifies vowels by position', () => {
        expect(categorizeCharacter(0x0E40)).toBe('vowel_leading');  // เ
        expect(categorizeCharacter(0x0E32)).toBe('vowel_following'); // า
        expect(categorizeCharacter(0x0E34)).toBe('vowel_above');     // ิ
        expect(categorizeCharacter(0x0E38)).toBe('vowel_below');     // ุ
    });

    it('identifies numerals', () => {
        expect(categorizeCharacter(0x0E50)).toBe('numeral'); // ๐
        expect(categorizeCharacter(0x0E59)).toBe('numeral'); // ๙
    });

    it('returns unknown for non-Thai', () => {
        expect(categorizeCharacter(0x0041)).toBe('unknown'); // A
    });
});

describe('isThaiCodePoint', () => {
    it('returns true for Thai characters', () => {
        expect(isThaiCodePoint(0x0E01)).toBe(true);
        expect(isThaiCodePoint(0x0E7F)).toBe(true);
    });

    it('returns false for non-Thai characters', () => {
        expect(isThaiCodePoint(0x0041)).toBe(false); // A
        expect(isThaiCodePoint(0x0030)).toBe(false); // 0
    });
});

describe('analyzeCluster', () => {
    it('analyzes simple consonant', () => {
        const result = analyzeCluster('ก', [0x0E01]);
        expect(result.base?.char).toBe('ก');
        expect(result.isSimple).toBe(true);
        expect(result.combiningMarkCount).toBe(0);
    });

    it('analyzes consonant with tone', () => {
        const result = analyzeCluster('ก่', [0x0E01, 0x0E48]);
        expect(result.base?.char).toBe('ก');
        expect(result.toneMark?.char).toBe('่');
        expect(result.isSimple).toBe(false);
        expect(result.combiningMarkCount).toBe(1);
    });

    it('analyzes complex cluster', () => {
        const result = analyzeCluster('ที่', [0x0E17, 0x0E35, 0x0E48]);
        expect(result.base?.char).toBe('ท');
        expect(result.aboveVowel?.char).toBe('ี');
        expect(result.toneMark?.char).toBe('่');
        expect(result.combiningMarkCount).toBe(2);
    });

    it('detects non-pure Thai', () => {
        const result = analyzeCluster('A', [0x0041]);
        expect(result.isPureThai).toBe(false);
    });
});
