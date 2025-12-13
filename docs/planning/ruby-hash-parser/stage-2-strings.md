# Stage 2: Symbol & String Handling

**Document ID:** RHP-S2-2024-12-13  
**Parent:** [Main Plan](./2024-12-13-main.md)  
**Status:** Not Started  
**Duration:** 3-4 days  
**Dependencies:** Stage 1

---

## Objectives

1. Complete Ruby symbol syntax support
2. Implement full escape sequence processing
3. Handle single vs double quote semantics
4. Configure binary data strategies

---

## 2.1 Symbol Variations

Ruby symbols have multiple syntactic forms that must all be recognized and normalized.

### Syntax Matrix

| Syntax | Example | Context | Output |
|--------|---------|---------|--------|
| Bare symbol | `:name` | Hash rocket key/value | `"name"` |
| JSON-style | `name:` | Hash key only | `"name"` |
| Single-quoted | `:'complex-key'` | Special characters | `"complex-key"` |
| Double-quoted | `:"key with spaces"` | Spaces, escapes | `"key with spaces"` |
| Operator symbols | `:+`, `:[]`, `:<<` | Method names | `"+"`, `"[]"`, `"<<"` |

### Grammar Updates

```peggy
// =============================================================================
// SYMBOLS (Complete)
// =============================================================================

Symbol
  = ":" name:OperatorSymbol { return name; }
  / ":" name:BareSymbolName { return name; }
  / ":" str:SingleQuotedString { return str; }
  / ":" str:DoubleQuotedString { return str; }

BareSymbolName
  = $([a-zA-Z_] [a-zA-Z0-9_!?]*)

OperatorSymbol
  = $("<=>" / "===" / "==" / "=~" / "!~" / "!=" 
     / "<<" / ">>" / "<=" / ">=" / "<=>"
     / "[]=" / "[]" / "**"
     / "+" / "-" / "*" / "/" / "%" / "&" / "|" / "^" / "~"
     / "<" / ">" / "`")
```

### Test Cases

```typescript
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
    expect(parse('{:"key with spaces" => 1}')).toEqual({ 'key with spaces': 1 });
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
```

---

## 2.2 String Escape Sequences

Ruby has extensive escape sequence support that differs between single and double quotes.

### Double-Quoted String Escapes

| Escape | Description | Code Point | JSON Output |
|--------|-------------|------------|-------------|
| `\n` | Newline | 0x0A | `\n` |
| `\t` | Tab | 0x09 | `\t` |
| `\r` | Carriage return | 0x0D | `\r` |
| `\\` | Backslash | 0x5C | `\\` |
| `\"` | Double quote | 0x22 | `"` |
| `\a` | Bell/Alert | 0x07 | `\u0007` |
| `\b` | Backspace | 0x08 | `\b` |
| `\e` | Escape | 0x1B | `\u001B` |
| `\f` | Form feed | 0x0C | `\f` |
| `\v` | Vertical tab | 0x0B | `\u000B` |
| `\s` | Space | 0x20 | ` ` |
| `\0` | Null | 0x00 | `\u0000` |

### Numeric Escapes

| Format | Example | Description |
|--------|---------|-------------|
| Octal | `\377` | 1-3 octal digits (0-377) |
| Hex | `\xFF` | 2 hex digits |
| Unicode | `\u0041` | 4 hex digits |
| Unicode (braced) | `\u{1F600}` | 1-6 hex digits |

### Control Character Escapes

| Format | Example | Calculation |
|--------|---------|-------------|
| `\C-x` | `\C-a` | `char.charCodeAt(0) & 0x1F` |
| `\cx` | `\ca` | Same as `\C-x` |
| `\M-x` | `\M-a` | `char.charCodeAt(0) | 0x80` |
| `\M-\C-x` | `\M-\C-a` | Combined meta + control |

### Implementation

#### File: `src/transformer/escape-handler.ts`

```typescript
/**
 * Ruby Escape Sequence Handler
 * 
 * Processes Ruby string escape sequences and converts them
 * to valid JavaScript/JSON strings.
 */

// Standard escape mappings
const SIMPLE_ESCAPES: Record<string, string> = {
  'n': '\n',
  't': '\t',
  'r': '\r',
  '\\': '\\',
  '"': '"',
  "'": "'",
  'a': '\u0007',  // Bell
  'b': '\b',      // Backspace
  'e': '\u001B',  // Escape
  'f': '\f',      // Form feed
  'v': '\u000B',  // Vertical tab
  's': ' ',       // Space
  '0': '\0',      // Null
};

/**
 * Process escape sequences in a double-quoted Ruby string
 */
export function processDoubleQuotedEscapes(content: string): string {
  let result = '';
  let i = 0;

  while (i < content.length) {
    if (content[i] === '\\' && i + 1 < content.length) {
      const next = content[i + 1];
      
      // Simple escapes
      if (next in SIMPLE_ESCAPES) {
        result += SIMPLE_ESCAPES[next];
        i += 2;
        continue;
      }

      // Octal escape: \0 to \377
      if (/[0-7]/.test(next)) {
        const match = content.slice(i + 1).match(/^[0-7]{1,3}/);
        if (match) {
          const code = parseInt(match[0], 8);
          result += String.fromCharCode(code);
          i += 1 + match[0].length;
          continue;
        }
      }

      // Hex escape: \xNN
      if (next === 'x') {
        const match = content.slice(i + 2).match(/^[0-9a-fA-F]{1,2}/);
        if (match) {
          const code = parseInt(match[0], 16);
          result += String.fromCharCode(code);
          i += 2 + match[0].length;
          continue;
        }
      }

      // Unicode escape: \uNNNN
      if (next === 'u') {
        // Braced form: \u{NNNNNN}
        if (content[i + 2] === '{') {
          const endBrace = content.indexOf('}', i + 3);
          if (endBrace !== -1) {
            const hex = content.slice(i + 3, endBrace);
            const code = parseInt(hex, 16);
            result += String.fromCodePoint(code);
            i = endBrace + 1;
            continue;
          }
        }
        // Standard form: \uNNNN
        const match = content.slice(i + 2).match(/^[0-9a-fA-F]{4}/);
        if (match) {
          const code = parseInt(match[0], 16);
          result += String.fromCharCode(code);
          i += 6;
          continue;
        }
      }

      // Control character: \C-x or \cx
      if (next === 'C' && content[i + 2] === '-') {
        const char = content[i + 3];
        if (char) {
          result += String.fromCharCode(char.charCodeAt(0) & 0x1F);
          i += 4;
          continue;
        }
      }
      if (next === 'c') {
        const char = content[i + 2];
        if (char) {
          result += String.fromCharCode(char.charCodeAt(0) & 0x1F);
          i += 3;
          continue;
        }
      }

      // Meta character: \M-x
      if (next === 'M' && content[i + 2] === '-') {
        const char = content[i + 3];
        if (char) {
          result += String.fromCharCode(char.charCodeAt(0) | 0x80);
          i += 4;
          continue;
        }
      }

      // Unknown escape - keep as-is
      result += content[i + 1];
      i += 2;
    } else {
      result += content[i];
      i++;
    }
  }

  return result;
}

/**
 * Process escape sequences in a single-quoted Ruby string
 * Only \\ and \' are processed
 */
export function processSingleQuotedEscapes(content: string): string {
  let result = '';
  let i = 0;

  while (i < content.length) {
    if (content[i] === '\\' && i + 1 < content.length) {
      const next = content[i + 1];
      if (next === '\\' || next === "'") {
        result += next;
        i += 2;
        continue;
      }
    }
    result += content[i];
    i++;
  }

  return result;
}

/**
 * Check if string contains non-UTF8 binary data
 */
export function containsBinaryData(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Check for invalid UTF-8 sequences or control chars
    if (code > 0x7F && code < 0xA0) {
      return true;
    }
  }
  return false;
}

/**
 * Handle binary data according to strategy
 */
export function handleBinaryData(
  str: string,
  strategy: 'base64' | 'array' | 'replacement' | 'error'
): string | number[] {
  switch (strategy) {
    case 'base64':
      // Convert to base64
      const bytes = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
      }
      return btoa(String.fromCharCode(...bytes));

    case 'array':
      // Return byte array
      return Array.from(str).map(c => c.charCodeAt(0));

    case 'replacement':
      // Replace invalid sequences with U+FFFD
      return str.replace(/[\x80-\x9F]/g, '\uFFFD');

    case 'error':
      throw new Error('Binary data encountered');
  }
}
```

### Grammar Updates for Strings

```peggy
// =============================================================================
// STRINGS (Complete)
// =============================================================================

StringLiteral
  = DoubleQuotedString
  / SingleQuotedString

DoubleQuotedString
  = '"' chars:DoubleQuotedChar* '"' {
      return processDoubleQuotedEscapes(chars.join(''));
    }

DoubleQuotedChar
  = !'"' !'\\' char:. { return char; }
  / '\\' char:. { return '\\' + char; }  // Keep escape for processing

SingleQuotedString
  = "'" chars:SingleQuotedChar* "'" {
      return processSingleQuotedEscapes(chars.join(''));
    }

SingleQuotedChar
  = !"'" !'\\' char:. { return char; }
  / '\\' char:. { return '\\' + char; }  // Keep escape for processing
```

---

## 2.3 Test Suite

### File: `tests/unit/strings.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { parse } from '../../src';
import {
  processDoubleQuotedEscapes,
  processSingleQuotedEscapes,
} from '../../src/transformer/escape-handler';

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

      it('handles escape', () => {
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
        const result = parse('{s: "\\M-a"}');
        expect(result.s.charCodeAt(0)).toBe(0xE1); // 'a' | 0x80
      });
    });
  });

  describe('Single-Quoted Strings', () => {
    it('only escapes backslash', () => {
      expect(parse("{s: 'a\\\\b'}")).toEqual({ s: 'a\\b' });
    });

    it('only escapes single quote', () => {
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

describe('Escape Handler Functions', () => {
  describe('processDoubleQuotedEscapes', () => {
    it('processes multiple escapes', () => {
      expect(processDoubleQuotedEscapes('\\n\\t\\r')).toBe('\n\t\r');
    });

    it('handles mixed content', () => {
      expect(processDoubleQuotedEscapes('hello\\nworld')).toBe('hello\nworld');
    });
  });

  describe('processSingleQuotedEscapes', () => {
    it('only processes \\\\ and \\\'', () => {
      expect(processSingleQuotedEscapes("a\\\\'b")).toBe("a\\'b");
    });

    it('preserves other escapes', () => {
      expect(processSingleQuotedEscapes('a\\nb')).toBe('a\\nb');
    });
  });
});
```

---

## 2.4 Binary Data Handling

### Configuration

```typescript
interface ParserOptions {
  binaryStrategy: 'base64' | 'array' | 'replacement' | 'error';
}
```

### Test Cases

```typescript
describe('Binary Data Handling', () => {
  it('replaces invalid bytes with replacement char by default', () => {
    // \x80-\x9F are invalid in UTF-8
    const result = parse('{s: "\\x80\\x90"}');
    expect(result.s).toBe('\uFFFD\uFFFD');
  });

  it('converts to base64 with base64 strategy', () => {
    const result = parse('{s: "\\xFF\\xFE"}', { binaryStrategy: 'base64' });
    expect(typeof result.s).toBe('string');
    // Base64 of [255, 254]
  });

  it('converts to array with array strategy', () => {
    const result = parse('{s: "\\xFF\\xFE"}', { binaryStrategy: 'array' });
    expect(result.s).toEqual([255, 254]);
  });

  it('throws with error strategy', () => {
    expect(() => {
      parse('{s: "\\x80"}', { binaryStrategy: 'error' });
    }).toThrow();
  });
});
```

---

## Deliverables Checklist

- [ ] All symbol syntax variations supported
- [ ] Complete escape sequence processor
- [ ] Single/double quote differentiation
- [ ] Binary data strategies implemented
- [ ] Comprehensive test coverage
- [ ] Documentation updated

---

## Exit Criteria

1. All symbol forms parse correctly
2. All Ruby escape sequences handled
3. Binary data strategies work as configured
4. Test coverage > 90% for string handling

---

## Navigation

← [Stage 1: Foundation](./stage-1-foundation.md) | [Stage 3: Numerics](./stage-3-numerics.md) →
