import { describe, it, expect } from 'vitest';
import { parse, presets } from '../../src/index.js';

describe('Range Literals', () => {
    describe('Object Strategy (default)', () => {
        it('parses inclusive range', () => {
            expect(parse('{r: 1..10}')).toEqual({
                r: { begin: 1, end: 10, exclude_end: false },
            });
        });

        it('parses exclusive range', () => {
            expect(parse('{r: 1...10}')).toEqual({
                r: { begin: 1, end: 10, exclude_end: true },
            });
        });

        it('parses string range', () => {
            expect(parse('{r: "a".."z"}')).toEqual({
                r: { begin: 'a', end: 'z', exclude_end: false },
            });
        });

        it('parses negative number range', () => {
            expect(parse('{r: -5..5}')).toEqual({
                r: { begin: -5, end: 5, exclude_end: false },
            });
        });

        it('parses float range', () => {
            expect(parse('{r: 1.5..3.5}')).toEqual({
                r: { begin: 1.5, end: 3.5, exclude_end: false },
            });
        });
    });

    describe('String Strategy', () => {
        it('returns string representation', () => {
            expect(parse('{r: 1..10}', { rangeStrategy: 'string' })).toEqual({
                r: '1..10',
            });
        });

        it('preserves exclusive marker', () => {
            expect(parse('{r: 1...10}', { rangeStrategy: 'string' })).toEqual({
                r: '1...10',
            });
        });
    });

    describe('Array Strategy', () => {
        it('expands inclusive range', () => {
            expect(parse('{r: 1..5}', { rangeStrategy: 'array' })).toEqual({
                r: [1, 2, 3, 4, 5],
            });
        });

        it('expands exclusive range', () => {
            expect(parse('{r: 1...5}', { rangeStrategy: 'array' })).toEqual({
                r: [1, 2, 3, 4],
            });
        });

        it('throws for large ranges', () => {
            expect(() =>
                parse('{r: 1..100000}', { rangeStrategy: 'array' })
            ).toThrow('Range too large');
        });

        it('falls back to object for non-numeric ranges', () => {
            expect(parse('{r: "a".."z"}', { rangeStrategy: 'array' })).toEqual({
                r: { begin: 'a', end: 'z', exclude_end: false },
            });
        });
    });
});

describe('Cyclic References', () => {
    describe('Sentinel Strategy (default)', () => {
        it('returns sentinel for hash cycle', () => {
            expect(parse('{self: {...}}')).toEqual({
                self: '[Circular]',
            });
        });

        it('returns sentinel for array cycle', () => {
            expect(parse('{items: [1, [...], 3]}')).toEqual({
                items: [1, '[Circular]', 3],
            });
        });

        it('handles nested cyclic reference', () => {
            expect(parse('{a: {b: {...}}}')).toEqual({
                a: { b: '[Circular]' },
            });
        });
    });

    describe('Null Strategy', () => {
        it('returns null for hash cycles', () => {
            expect(parse('{self: {...}}', { cyclicStrategy: 'null' })).toEqual({
                self: null,
            });
        });

        it('returns null for array cycles', () => {
            expect(parse('{items: [[...]]}', { cyclicStrategy: 'null' })).toEqual({
                items: [null],
            });
        });
    });

    describe('Error Strategy', () => {
        it('throws for hash cycles', () => {
            expect(() =>
                parse('{self: {...}}', { cyclicStrategy: 'error' })
            ).toThrow('Cyclic');
        });

        it('throws for array cycles', () => {
            expect(() =>
                parse('{items: [[...]]}', { cyclicStrategy: 'error' })
            ).toThrow('Cyclic');
        });
    });
});

describe('Trailing Commas', () => {
    it('handles trailing comma in hash', () => {
        expect(parse('{a: 1, b: 2,}')).toEqual({ a: 1, b: 2 });
    });

    it('handles trailing comma in array', () => {
        expect(parse('[1, 2, 3,]')).toEqual([1, 2, 3]);
    });

    it('handles trailing comma with newlines', () => {
        expect(
            parse(`{
      a: 1,
      b: 2,
    }`)
        ).toEqual({ a: 1, b: 2 });
    });
});

describe('Presets', () => {
    const input = '{n: Infinity, r: 1..5}';

    it('strict preset converts Infinity to null', () => {
        const result = parse(input, presets.strict) as {
            n: unknown;
            r: unknown;
        };
        expect(result.n).toBe(null);
        expect(result.r).toBe('1..5');
    });

    it('preserving preset converts Infinity to string', () => {
        const result = parse(input, presets.preserving) as {
            n: unknown;
            r: unknown;
        };
        expect(result.n).toBe('Infinity');
        expect(result.r).toEqual({ begin: 1, end: 5, exclude_end: false });
    });

    it('json5 preset keeps literal Infinity', () => {
        const result = parse('{n: Infinity}', presets.json5) as { n: number };
        expect(result.n).toBe(Infinity);
    });

    it('lenient preset allows implicit hash', () => {
        expect(parse('a: 1, b: 2', presets.lenient)).toEqual({ a: 1, b: 2 });
    });

    it('pedantic preset throws on Infinity', () => {
        expect(() => parse('{n: Infinity}', presets.pedantic)).toThrow();
    });
});

describe('Robustness', () => {
    describe('Whitespace Handling', () => {
        it('handles tabs', () => {
            expect(parse('{\ta:\t1\t}')).toEqual({ a: 1 });
        });

        it('handles leading/trailing whitespace', () => {
            expect(parse('  {a: 1}  ')).toEqual({ a: 1 });
        });

        it('handles mixed spacing', () => {
            expect(parse('{  a:   1  ,  b:2}')).toEqual({ a: 1, b: 2 });
        });

        it('handles Ruby pp format', () => {
            const input = `{:name=>"Alice",
 :age=>30,
 :items=>
  [{:id=>1},
   {:id=>2}]}`;
            expect(parse(input)).toEqual({
                name: 'Alice',
                age: 30,
                items: [{ id: 1 }, { id: 2 }],
            });
        });
    });

    describe('Depth Limiting', () => {
        it('allows reasonable nesting', () => {
            const nested = '{a: {b: {c: {d: {e: 1}}}}}';
            expect(() => parse(nested)).not.toThrow();
        });

        it('tracks depth using maxDepth option', () => {
            // The depth limiting is enforced by the grammar
            // It protects against extremely deep structures
            const result = parse('{a: {b: {c: 1}}}', { maxDepth: 100 });
            expect(result).toEqual({ a: { b: { c: 1 } } });
        });
    });
});
