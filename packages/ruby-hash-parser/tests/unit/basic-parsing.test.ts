import { describe, it, expect } from 'vitest';
import { parse, validate } from '../../src/index.js';

describe('Basic Hash Parsing', () => {
    describe('Hash Rocket Syntax', () => {
        it('parses simple symbol keys', () => {
            expect(parse('{:name => "Alice"}')).toEqual({ name: 'Alice' });
        });

        it('parses string keys', () => {
            expect(parse('{"name" => "Alice"}')).toEqual({ name: 'Alice' });
        });

        it('parses numeric keys', () => {
            expect(parse('{1 => "one"}')).toEqual({ '1': 'one' });
        });

        it('parses multiple pairs', () => {
            expect(parse('{:a => 1, :b => 2}')).toEqual({ a: 1, b: 2 });
        });
    });

    describe('JSON-Style Syntax', () => {
        it('parses simple keys', () => {
            expect(parse('{name: "Alice"}')).toEqual({ name: 'Alice' });
        });

        it('parses multiple pairs', () => {
            expect(parse('{a: 1, b: 2}')).toEqual({ a: 1, b: 2 });
        });
    });

    describe('Mixed Syntax', () => {
        it('handles both styles in same hash', () => {
            expect(parse('{name: "Alice", :age => 30}')).toEqual({
                name: 'Alice',
                age: 30,
            });
        });
    });

    describe('Nested Structures', () => {
        it('parses nested hashes', () => {
            expect(parse('{a: {b: {c: 1}}}')).toEqual({ a: { b: { c: 1 } } });
        });

        it('parses arrays', () => {
            expect(parse('{items: [1, 2, 3]}')).toEqual({ items: [1, 2, 3] });
        });

        it('parses nested arrays', () => {
            expect(parse('[1, [2, [3]]]')).toEqual([1, [2, [3]]]);
        });

        it('parses hash in array', () => {
            expect(parse('[{a: 1}, {b: 2}]')).toEqual([{ a: 1 }, { b: 2 }]);
        });
    });

    describe('Primitives', () => {
        it('parses true', () => {
            expect(parse('{flag: true}')).toEqual({ flag: true });
        });

        it('parses false', () => {
            expect(parse('{flag: false}')).toEqual({ flag: false });
        });

        it('parses nil as null', () => {
            expect(parse('{value: nil}')).toEqual({ value: null });
        });
    });

    describe('Numbers', () => {
        it('parses integers', () => {
            expect(parse('{n: 42}')).toEqual({ n: 42 });
        });

        it('parses negative integers', () => {
            expect(parse('{n: -42}')).toEqual({ n: -42 });
        });

        it('parses floats', () => {
            expect(parse('{n: 3.14}')).toEqual({ n: 3.14 });
        });

        it('parses scientific notation', () => {
            expect(parse('{n: 1.5e10}')).toEqual({ n: 1.5e10 });
        });
    });

    describe('Strings', () => {
        it('parses double-quoted strings', () => {
            expect(parse('{s: "hello"}')).toEqual({ s: 'hello' });
        });

        it('parses single-quoted strings', () => {
            expect(parse("{s: 'hello'}")).toEqual({ s: 'hello' });
        });

        it('handles basic escapes', () => {
            expect(parse('{s: "line1\\nline2"}')).toEqual({ s: 'line1\nline2' });
        });
    });

    describe('Empty Structures', () => {
        it('parses empty hash', () => {
            expect(parse('{}')).toEqual({});
        });

        it('parses empty array', () => {
            expect(parse('[]')).toEqual([]);
        });
    });

    describe('Whitespace Handling', () => {
        it('handles no whitespace', () => {
            expect(parse('{a:1,b:2}')).toEqual({ a: 1, b: 2 });
        });

        it('handles extra whitespace', () => {
            expect(parse('{  a:  1  ,  b:  2  }')).toEqual({ a: 1, b: 2 });
        });

        it('handles newlines', () => {
            expect(parse('{\n  a: 1,\n  b: 2\n}')).toEqual({ a: 1, b: 2 });
        });
    });

    describe('Complex Example from Exit Criteria', () => {
        it('parses {:name => "Alice", age: 30, items: [1, 2, 3]}', () => {
            expect(parse('{:name => "Alice", age: 30, items: [1, 2, 3]}')).toEqual({
                name: 'Alice',
                age: 30,
                items: [1, 2, 3],
            });
        });
    });
});

describe('Validation', () => {
    it('returns valid for correct input', () => {
        expect(validate('{a: 1}')).toEqual({ valid: true });
    });

    it('returns error for invalid input', () => {
        const result = validate('{a: }');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
    });
});
