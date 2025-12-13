import { describe, it, expect } from 'vitest';
import {
    parse,
    toJSON,
    validate,
    RubyHashParseError,
} from '../../src/index.js';

describe('Error Handling', () => {
    describe('Parse Errors', () => {
        it('throws RubyHashParseError for invalid syntax', () => {
            expect(() => parse('{a: }')).toThrow(RubyHashParseError);
        });

        it('provides line number in error', () => {
            try {
                parse('{\n  a: 1,\n  b: \n}');
                expect.fail('Should have thrown');
            } catch (err) {
                expect(err).toBeInstanceOf(RubyHashParseError);
                expect((err as RubyHashParseError).line).toBeGreaterThan(0);
            }
        });

        it('provides column number in error', () => {
            try {
                parse('{a: @invalid}');
                expect.fail('Should have thrown');
            } catch (err) {
                expect(err).toBeInstanceOf(RubyHashParseError);
                expect((err as RubyHashParseError).column).toBeGreaterThan(0);
            }
        });

        it('handles unclosed brace', () => {
            expect(() => parse('{a: 1')).toThrow();
        });

        it('handles unclosed bracket', () => {
            expect(() => parse('[1, 2, 3')).toThrow();
        });

        it('handles unclosed string', () => {
            expect(() => parse('{a: "hello}')).toThrow();
        });

        it('handles invalid characters', () => {
            expect(() => parse('{a: @foo}')).toThrow();
        });
    });

    describe('Validation Function', () => {
        it('returns valid:true for valid input', () => {
            expect(validate('{a: 1}')).toEqual({ valid: true });
        });

        it('returns valid:false for invalid input', () => {
            const result = validate('{a: }');
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('error message includes location info', () => {
            const result = validate('{a: }');
            expect(result.error).toContain('line');
        });
        it('handles empty input gracefully', () => {
            // Empty input should be invalid - need at least a structure
            const result = validate('');
            expect(result.valid).toBe(false);
        });

        it('handles whitespace-only input', () => {
            const result = validate('   \n   ');
            expect(result.valid).toBe(false);
        });
    });

    describe('toJSON Function', () => {
        it('returns formatted JSON', () => {
            const json = toJSON('{a: 1, b: 2}');
            expect(json).toContain('"a"');
            expect(json).toContain('"b"');
        });

        it('returns pretty-printed JSON by default', () => {
            const json = toJSON('{a: 1}');
            expect(json).toContain('\n'); // Has newlines for formatting
        });

        it('produces valid JSON output', () => {
            const json = toJSON('{a: 1, b: "hello"}');
            const parsed = JSON.parse(json);
            expect(parsed).toEqual({ a: 1, b: 'hello' });
        });

        it('throws on invalid input', () => {
            expect(() => toJSON('{a: }')).toThrow();
        });
    });
});

describe('Edge Cases', () => {
    describe('Unicode Handling', () => {
        it('parses unicode in strings', () => {
            expect(parse('{s: "こんにちは"}')).toEqual({ s: 'こんにちは' });
        });

        it('parses emoji in strings', () => {
            expect(parse('{s: "Hello 👋 World"}')).toEqual({ s: 'Hello 👋 World' });
        });

        it('parses unicode in symbol keys', () => {
            expect(parse('{:"日本語" => 1}')).toEqual({ 日本語: 1 });
        });
    });

    describe('Special Key Names', () => {
        it('handles reserved words as keys', () => {
            expect(parse('{true: 1, false: 2, nil: 3}')).toEqual({
                true: 1,
                false: 2,
                nil: 3,
            });
        });

        it('handles numeric string keys', () => {
            expect(parse('{"123" => "value"}')).toEqual({ '123': 'value' });
        });

        it('handles empty string key', () => {
            expect(parse('{"" => "empty"}')).toEqual({ '': 'empty' });
        });
    });

    describe('Array Edge Cases', () => {
        it('handles deeply nested arrays', () => {
            expect(parse('[[[[1]]]]')).toEqual([[[[1]]]]);
        });

        it('handles mixed arrays', () => {
            expect(parse('[1, "two", :three, nil, true]')).toEqual([
                1,
                'two',
                'three',
                null,
                true,
            ]);
        });

        it('handles arrays of hashes', () => {
            expect(parse('[{a: 1}, {b: 2}, {c: 3}]')).toEqual([
                { a: 1 },
                { b: 2 },
                { c: 3 },
            ]);
        });
    });

    describe('Hash Edge Cases', () => {
        it('handles single-pair hash', () => {
            expect(parse('{a: 1}')).toEqual({ a: 1 });
        });

        it('handles many pairs', () => {
            const input = '{a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10}';
            const result = parse(input) as Record<string, number>;
            expect(Object.keys(result)).toHaveLength(10);
        });

        it('handles duplicate keys (last wins)', () => {
            // JavaScript object behavior - last value wins
            expect(parse('{a: 1, a: 2, a: 3}')).toEqual({ a: 3 });
        });
    });

    describe('Implicit Hash', () => {
        it('parses implicit hash (no braces)', () => {
            expect(parse('a: 1, b: 2')).toEqual({ a: 1, b: 2 });
        });

        it('parses single implicit pair', () => {
            expect(parse('name: "Alice"')).toEqual({ name: 'Alice' });
        });

        it('parses implicit hash with nested structures', () => {
            expect(parse('items: [1, 2], config: {x: 1}')).toEqual({
                items: [1, 2],
                config: { x: 1 },
            });
        });
    });

    describe('Numeric Edge Cases', () => {
        it('handles zero in various formats', () => {
            expect(parse('{a: 0, b: 0.0, c: 0x0, d: 0b0, e: 0o0}')).toEqual({
                a: 0,
                b: 0,
                c: 0,
                d: 0,
                e: 0,
            });
        });

        it('handles very small numbers', () => {
            expect(parse('{n: 1e-100}')).toEqual({ n: 1e-100 });
        });

        it('handles negative zero', () => {
            expect(parse('{n: -0}')).toEqual({ n: -0 });
        });
    });

    describe('String Edge Cases', () => {
        it('handles empty strings', () => {
            expect(parse('{s: ""}')).toEqual({ s: '' });
            expect(parse("{s: ''}")).toEqual({ s: '' });
        });

        it('handles strings with only whitespace', () => {
            expect(parse('{s: "   "}')).toEqual({ s: '   ' });
        });

        it('handles strings with colons', () => {
            expect(parse('{s: "key: value"}')).toEqual({ s: 'key: value' });
        });

        it('handles strings with arrows', () => {
            expect(parse('{s: "a => b"}')).toEqual({ s: 'a => b' });
        });

        it('handles strings with JSON-like content', () => {
            expect(parse('{s: "[1, 2, 3]"}')).toEqual({ s: '[1, 2, 3]' });
        });
    });
});

describe('Real-World Examples', () => {
    it('parses Rails controller params style', () => {
        const input = `{
      :controller => "users",
      :action => "show",
      :id => "123"
    }`;
        expect(parse(input)).toEqual({
            controller: 'users',
            action: 'show',
            id: '123',
        });
    });

    it('parses ActiveRecord inspect output style', () => {
        const input = `{id: 1, name: "Alice", email: "alice@example.com", created_at: "2024-01-01"}`;
        expect(parse(input)).toEqual({
            id: 1,
            name: 'Alice',
            email: 'alice@example.com',
            created_at: '2024-01-01',
        });
    });

    it('parses nested API response style', () => {
        const input = `{
      status: "success",
      data: {
        users: [
          {id: 1, name: "Alice"},
          {id: 2, name: "Bob"}
        ],
        meta: {
          total: 2,
          page: 1
        }
      }
    }`;
        expect(parse(input)).toEqual({
            status: 'success',
            data: {
                users: [
                    { id: 1, name: 'Alice' },
                    { id: 2, name: 'Bob' },
                ],
                meta: {
                    total: 2,
                    page: 1,
                },
            },
        });
    });

    it('parses config hash style', () => {
        const input = `{
      database: {
        host: "localhost",
        port: 5432,
        name: "myapp_dev"
      },
      cache: {
        enabled: true,
        ttl: 3600
      }
    }`;
        const result = parse(input) as { database: Record<string, unknown> };
        expect(result.database.host).toBe('localhost');
        expect(result.database.port).toBe(5432);
    });
});
