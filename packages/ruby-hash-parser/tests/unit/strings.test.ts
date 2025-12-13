import { describe, it, expect } from 'vitest';
import { parse } from '../../src/index.js';

describe('Symbol Variations', () => {
    it('parses bare symbols', () => {
        expect(parse('{:name => "value"}')).toEqual({ name: 'value' });
    });

    it('parses JSON-style symbols', () => {
        expect(parse('{name: "value"}')).toEqual({ name: 'value' });
    });

    it('parses single-quoted symbols', () => {
        expect(parse("{:'complex-key' => 1}")).toEqual({ 'complex-key': 1 });
    });

    it('parses double-quoted symbols', () => {
        expect(parse('{:"key with spaces" => 1}')).toEqual({
            'key with spaces': 1,
        });
    });

    it('parses symbols with special chars', () => {
        expect(parse('{:name? => true}')).toEqual({ 'name?': true });
        expect(parse('{:save! => true}')).toEqual({ 'save!': true });
    });

    it('parses operator symbols', () => {
        expect(parse('{:+ => "plus"}')).toEqual({ '+': 'plus' });
        expect(parse('{:[] => "index"}')).toEqual({ '[]': 'index' });
        expect(parse('{:<=> => "spaceship"}')).toEqual({ '<=>': 'spaceship' });
    });

    it('handles symbol as value', () => {
        expect(parse('{status: :active}')).toEqual({ status: 'active' });
    });
});

describe('String Escape Sequences', () => {
    describe('Double-Quoted Strings', () => {
        describe('Simple Escapes', () => {
            it('handles newline', () => {
                expect(parse('{s: "a\\nb"}')).toEqual({ s: 'a\nb' });
            });

            it('handles tab', () => {
                expect(parse('{s: "a\\tb"}')).toEqual({ s: 'a\tb' });
            });

            it('handles carriage return', () => {
                expect(parse('{s: "a\\rb"}')).toEqual({ s: 'a\rb' });
            });

            it('handles backslash', () => {
                expect(parse('{s: "a\\\\b"}')).toEqual({ s: 'a\\b' });
            });

            it('handles quote', () => {
                expect(parse('{s: "a\\"b"}')).toEqual({ s: 'a"b' });
            });

            it('handles bell', () => {
                expect(parse('{s: "a\\ab"}')).toEqual({ s: 'a\u0007b' });
            });

            it('handles escape char', () => {
                expect(parse('{s: "a\\eb"}')).toEqual({ s: 'a\u001Bb' });
            });

            it('handles vertical tab', () => {
                expect(parse('{s: "a\\vb"}')).toEqual({ s: 'a\u000Bb' });
            });

            it('handles form feed', () => {
                expect(parse('{s: "a\\fb"}')).toEqual({ s: 'a\fb' });
            });

            it('handles space escape', () => {
                expect(parse('{s: "a\\sb"}')).toEqual({ s: 'a b' });
            });
        });

        describe('Numeric Escapes', () => {
            it('handles octal escape', () => {
                expect(parse('{s: "\\101"}')).toEqual({ s: 'A' }); // 65 = 'A'
            });

            it('handles octal escape max', () => {
                expect(parse('{s: "\\377"}')).toEqual({ s: '\xFF' }); // 255
            });

            it('handles hex escape', () => {
                expect(parse('{s: "\\x41"}')).toEqual({ s: 'A' });
            });

            it('handles hex escape lowercase', () => {
                expect(parse('{s: "\\xff"}')).toEqual({ s: '\xFF' });
            });

            it('handles unicode escape', () => {
                expect(parse('{s: "\\u0041"}')).toEqual({ s: 'A' });
            });

            it('handles unicode braced escape', () => {
                expect(parse('{s: "\\u{1F600}"}')).toEqual({ s: '😀' });
            });
        });

        describe('Control Characters', () => {
            it('handles \\C-x form', () => {
                expect(parse('{s: "\\C-a"}')).toEqual({ s: '\u0001' });
            });

            it('handles \\cx form', () => {
                expect(parse('{s: "\\ca"}')).toEqual({ s: '\u0001' });
            });

            it('handles \\M-x form', () => {
                const result = parse('{s: "\\M-a"}') as { s: string };
                expect(result.s.charCodeAt(0)).toBe(0xe1); // 'a' | 0x80
            });
        });
    });

    describe('Single-Quoted Strings', () => {
        it('only escapes backslash', () => {
            expect(parse("{s: 'a\\\\b'}")).toEqual({ s: 'a\\b' });
        });

        it("only escapes single quote", () => {
            expect(parse("{s: 'a\\'b'}")).toEqual({ s: "a'b" });
        });

        it('preserves other backslash sequences', () => {
            expect(parse("{s: 'a\\nb'}")).toEqual({ s: 'a\\nb' });
        });

        it('preserves \\t literally', () => {
            expect(parse("{s: 'a\\tb'}")).toEqual({ s: 'a\\tb' });
        });
    });
});
