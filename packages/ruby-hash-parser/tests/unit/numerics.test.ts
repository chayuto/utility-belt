import { describe, it, expect } from 'vitest';
import { parse } from '../../src/index.js';

describe('Numeric Types', () => {
    describe('Decimal Integers', () => {
        it('parses positive integers', () => {
            expect(parse('{n: 42}')).toEqual({ n: 42 });
        });

        it('parses negative integers', () => {
            expect(parse('{n: -42}')).toEqual({ n: -42 });
        });

        it('parses zero', () => {
            expect(parse('{n: 0}')).toEqual({ n: 0 });
        });

        it('parses large integers', () => {
            expect(parse('{n: 9007199254740991}')).toEqual({ n: 9007199254740991 });
        });
    });

    describe('Integers with Underscores', () => {
        it('parses underscored integers', () => {
            expect(parse('{n: 1_000_000}')).toEqual({ n: 1000000 });
        });

        it('handles multiple underscores', () => {
            expect(parse('{n: 1__000}')).toEqual({ n: 1000 });
        });
    });

    describe('Binary Integers', () => {
        it('parses binary with 0b prefix', () => {
            expect(parse('{n: 0b1010}')).toEqual({ n: 10 });
        });

        it('parses binary with 0B prefix', () => {
            expect(parse('{n: 0B1111}')).toEqual({ n: 15 });
        });

        it('parses binary with underscores', () => {
            expect(parse('{n: 0b1111_0000}')).toEqual({ n: 240 });
        });

        it('parses negative binary', () => {
            expect(parse('{n: -0b1010}')).toEqual({ n: -10 });
        });
    });

    describe('Octal Integers', () => {
        it('parses octal with 0o prefix', () => {
            expect(parse('{n: 0o755}')).toEqual({ n: 493 });
        });

        it('parses octal with 0O prefix', () => {
            expect(parse('{n: 0O777}')).toEqual({ n: 511 });
        });

        it('parses legacy octal (leading zero)', () => {
            expect(parse('{n: 0755}')).toEqual({ n: 493 });
        });

        it('parses octal with underscores', () => {
            expect(parse('{n: 0o7_5_5}')).toEqual({ n: 493 });
        });

        it('does not confuse 0.5 as octal', () => {
            expect(parse('{n: 0.5}')).toEqual({ n: 0.5 });
        });
    });

    describe('Hexadecimal Integers', () => {
        it('parses hex with 0x prefix', () => {
            expect(parse('{n: 0xFF}')).toEqual({ n: 255 });
        });

        it('parses hex with 0X prefix', () => {
            expect(parse('{n: 0XFF}')).toEqual({ n: 255 });
        });

        it('parses hex lowercase', () => {
            expect(parse('{n: 0xabcdef}')).toEqual({ n: 11259375 });
        });

        it('parses hex with underscores', () => {
            expect(parse('{n: 0xFF_FF}')).toEqual({ n: 65535 });
        });

        it('parses negative hex', () => {
            expect(parse('{n: -0xFF}')).toEqual({ n: -255 });
        });
    });

    describe('Floating Point', () => {
        it('parses simple floats', () => {
            expect(parse('{n: 3.14}')).toEqual({ n: 3.14 });
        });

        it('parses negative floats', () => {
            expect(parse('{n: -3.14}')).toEqual({ n: -3.14 });
        });

        it('parses floats starting with zero', () => {
            expect(parse('{n: 0.5}')).toEqual({ n: 0.5 });
        });

        it('parses floats with underscores', () => {
            expect(parse('{n: 1_000.50}')).toEqual({ n: 1000.5 });
        });
    });

    describe('Scientific Notation', () => {
        it('parses positive exponent', () => {
            expect(parse('{n: 1.5e10}')).toEqual({ n: 1.5e10 });
        });

        it('parses negative exponent', () => {
            expect(parse('{n: 1.5e-10}')).toEqual({ n: 1.5e-10 });
        });

        it('parses uppercase E', () => {
            expect(parse('{n: 1.5E10}')).toEqual({ n: 1.5e10 });
        });

        it('parses explicit positive exponent', () => {
            expect(parse('{n: 1.5e+10}')).toEqual({ n: 1.5e10 });
        });

        it('parses integer with exponent', () => {
            expect(parse('{n: 5e3}')).toEqual({ n: 5000 });
        });
    });
});

describe('Non-Finite Numbers', () => {
    describe('Infinity', () => {
        it('converts to null by default', () => {
            expect(parse('{n: Infinity}')).toEqual({ n: null });
        });

        it('converts to string with string strategy', () => {
            expect(parse('{n: Infinity}', { nonFiniteNumbers: 'string' })).toEqual({
                n: 'Infinity',
            });
        });

        it('keeps literal with literal strategy', () => {
            expect(parse('{n: Infinity}', { nonFiniteNumbers: 'literal' })).toEqual({
                n: Infinity,
            });
        });

        it('throws with error strategy', () => {
            expect(() =>
                parse('{n: Infinity}', { nonFiniteNumbers: 'error' })
            ).toThrow();
        });

        it('handles negative infinity', () => {
            expect(parse('{n: -Infinity}', { nonFiniteNumbers: 'string' })).toEqual({
                n: '-Infinity',
            });
        });
    });

    describe('NaN', () => {
        it('converts to null by default', () => {
            expect(parse('{n: NaN}')).toEqual({ n: null });
        });

        it('converts to string with string strategy', () => {
            expect(parse('{n: NaN}', { nonFiniteNumbers: 'string' })).toEqual({
                n: 'NaN',
            });
        });

        it('keeps literal with literal strategy', () => {
            const result = parse('{n: NaN}', { nonFiniteNumbers: 'literal' }) as {
                n: number;
            };
            expect(Number.isNaN(result.n)).toBe(true);
        });
    });
});
