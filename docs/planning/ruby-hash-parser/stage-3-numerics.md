# Stage 3: Numeric Types & Edge Cases

**Document ID:** RHP-S3-2024-12-13  
**Parent:** [Main Plan](./2024-12-13-main.md)  
**Status:** Not Started  
**Duration:** 2-3 days  
**Dependencies:** Stage 1

---

## Objectives

1. Support all Ruby integer formats (binary, octal, hex, underscores)
2. Handle floating-point with scientific notation
3. Implement non-finite value strategies (Infinity, NaN)
4. Parse BigDecimal inspect output

---

## 3.1 Integer Formats

Ruby supports multiple integer literal formats that must be normalized to decimal.

### Format Matrix

| Format | Example | Decimal Value | Notes |
|--------|---------|---------------|-------|
| Decimal | `123` | 123 | Standard |
| Negative | `-42` | -42 | Standard |
| Underscores | `1_000_000` | 1000000 | Readability separators |
| Binary | `0b1010` | 10 | Prefix `0b` or `0B` |
| Octal | `0o755` | 493 | Prefix `0o`, `0O`, or leading `0` |
| Octal (legacy) | `0755` | 493 | Leading zero (Ruby 1.8 style) |
| Hexadecimal | `0xFF` | 255 | Prefix `0x` or `0X` |

### Grammar Updates

```peggy
// =============================================================================
// NUMBERS (Complete)
// =============================================================================

NumberLiteral
  = NonFiniteNumber
  / Float
  / Integer

// Non-finite values (handled by transformer based on options)
NonFiniteNumber
  = "-"? "Infinity" { return { type: 'infinity', negative: text().startsWith('-') }; }
  / "NaN" { return { type: 'nan' }; }

// Floating point
Float
  = neg:"-"? int:IntegerDigits "." frac:FractionalDigits exp:ExponentPart? {
      const numStr = (neg ?? '') + int + '.' + frac + (exp ?? '');
      return parseFloat(numStr.replace(/_/g, ''));
    }
  / neg:"-"? int:IntegerDigits exp:ExponentPart {
      const numStr = (neg ?? '') + int + exp;
      return parseFloat(numStr.replace(/_/g, ''));
    }

// Integer with all formats
Integer
  = BinaryInteger
  / HexInteger
  / OctalInteger
  / DecimalInteger

BinaryInteger
  = neg:"-"? "0" [bB] digits:$[01_]+ {
      return parseInt((neg ?? '') + digits.replace(/_/g, ''), 2);
    }

HexInteger
  = neg:"-"? "0" [xX] digits:$[0-9a-fA-F_]+ {
      return parseInt((neg ?? '') + digits.replace(/_/g, ''), 16);
    }

OctalInteger
  = neg:"-"? "0" [oO] digits:$[0-7_]+ {
      return parseInt((neg ?? '') + digits.replace(/_/g, ''), 8);
    }
  / neg:"-"? "0" digits:$[0-7_]+ !("." / [89]) {
      // Legacy octal: 0755 (but not 0.5 or 089)
      return parseInt((neg ?? '') + digits.replace(/_/g, ''), 8);
    }

DecimalInteger
  = neg:"-"? digits:$([1-9] [0-9_]* / "0") {
      return parseInt((neg ?? '') + digits.replace(/_/g, ''), 10);
    }

// Helper rules
IntegerDigits
  = $([0-9] [0-9_]*)

FractionalDigits
  = $[0-9_]+

ExponentPart
  = $([eE] [+-]? [0-9_]+)
```

---

## 3.2 Non-Finite Values

JSON does not support `Infinity` or `NaN`. The parser must handle these based on configuration.

### Configuration Options

```typescript
interface ParserOptions {
  /**
   * Handling of Infinity/NaN values.
   * - 'null': Convert to null (strict JSON)
   * - 'string': Convert to "Infinity", "NaN", "-Infinity"
   * - 'literal': Keep as JavaScript Infinity/NaN (not valid JSON)
   * - 'error': Throw an error
   * @default 'null'
   */
  nonFiniteNumbers: 'null' | 'string' | 'literal' | 'error';
}
```

### Transformer Logic

```typescript
// src/transformer/coercions.ts

export function coerceNonFinite(
  value: { type: 'infinity' | 'nan'; negative?: boolean },
  strategy: 'null' | 'string' | 'literal' | 'error'
): unknown {
  switch (strategy) {
    case 'null':
      return null;

    case 'string':
      if (value.type === 'nan') return 'NaN';
      return value.negative ? '-Infinity' : 'Infinity';

    case 'literal':
      if (value.type === 'nan') return NaN;
      return value.negative ? -Infinity : Infinity;

    case 'error':
      throw new Error(
        `Non-finite number '${value.type}' not allowed with 'error' strategy`
      );
  }
}
```

### Test Cases

```typescript
describe('Non-Finite Numbers', () => {
  describe('Infinity', () => {
    it('converts to null by default', () => {
      expect(parse('{n: Infinity}')).toEqual({ n: null });
    });

    it('converts to string with string strategy', () => {
      expect(parse('{n: Infinity}', { nonFiniteNumbers: 'string' }))
        .toEqual({ n: 'Infinity' });
    });

    it('keeps literal with literal strategy', () => {
      expect(parse('{n: Infinity}', { nonFiniteNumbers: 'literal' }))
        .toEqual({ n: Infinity });
    });

    it('throws with error strategy', () => {
      expect(() => parse('{n: Infinity}', { nonFiniteNumbers: 'error' }))
        .toThrow();
    });

    it('handles negative infinity', () => {
      expect(parse('{n: -Infinity}', { nonFiniteNumbers: 'string' }))
        .toEqual({ n: '-Infinity' });
    });
  });

  describe('NaN', () => {
    it('converts to null by default', () => {
      expect(parse('{n: NaN}')).toEqual({ n: null });
    });

    it('converts to string with string strategy', () => {
      expect(parse('{n: NaN}', { nonFiniteNumbers: 'string' }))
        .toEqual({ n: 'NaN' });
    });

    it('keeps literal with literal strategy', () => {
      const result = parse('{n: NaN}', { nonFiniteNumbers: 'literal' });
      expect(Number.isNaN(result.n)).toBe(true);
    });
  });
});
```

---

## 3.3 BigDecimal Support

Ruby's `BigDecimal` class produces a distinctive inspect output that must be parsed.

### Inspect Format

```ruby
require 'bigdecimal'
BigDecimal("123.456").inspect
# => "#<BigDecimal:7f8c1234,'0.123456E3',18(27)>"
```

### Format Analysis

```
#<BigDecimal:ADDRESS,'MANTISSA_E_EXPONENT',PRECISION(SIZE)>
```

| Component | Example | Description |
|-----------|---------|-------------|
| Address | `7f8c1234` | Memory address (hex) |
| Value | `'0.123456E3'` | Scientific notation string |
| Precision | `18` | Significant digits |
| Size | `27` | Internal storage size |

### Grammar Rule

```peggy
BigDecimalInspect
  = "#<BigDecimal:" address:HexAddress "," 
    "'" value:BigDecimalValue "'" ","
    precision:Integer "(" size:Integer ")" ">" {
      return {
        type: 'bigdecimal',
        value: value,
        precision: precision,
        address: address,
      };
    }

BigDecimalValue
  = $("-"? [0-9]+ "." [0-9]* [eE] [+-]? [0-9]+)
  / $("-"? [0-9]+ "." [0-9]*)
  / $("-"? [0-9]+)

HexAddress
  = $[0-9a-fA-F]+
```

### Configuration Options

```typescript
interface ParserOptions {
  /**
   * Handling of BigDecimal values.
   * - 'string': Return numeric string (preserves precision)
   * - 'number': Convert to JS number (may lose precision)
   * - 'object': { __type__: 'bigdecimal', value: '...', precision: N }
   * @default 'string'
   */
  bigDecimalStrategy: 'string' | 'number' | 'object';
}
```

### Transformer Logic

```typescript
export function coerceBigDecimal(
  node: { type: 'bigdecimal'; value: string; precision: number },
  strategy: 'string' | 'number' | 'object'
): unknown {
  // Parse the scientific notation to a decimal string
  const decimalValue = parseScientificToDecimal(node.value);

  switch (strategy) {
    case 'string':
      return decimalValue;

    case 'number':
      return parseFloat(node.value);

    case 'object':
      return {
        __type__: 'bigdecimal',
        value: decimalValue,
        precision: node.precision,
      };
  }
}

function parseScientificToDecimal(sci: string): string {
  // Convert '0.123456E3' to '123.456'
  const match = sci.match(/^(-?)(\d+)\.?(\d*)E([+-]?\d+)$/i);
  if (!match) return sci;

  const [, sign, intPart, fracPart, expStr] = match;
  const exp = parseInt(expStr, 10);
  const digits = intPart + fracPart;
  const decimalPos = intPart.length + exp;

  if (decimalPos <= 0) {
    return sign + '0.' + '0'.repeat(-decimalPos) + digits;
  } else if (decimalPos >= digits.length) {
    return sign + digits + '0'.repeat(decimalPos - digits.length);
  } else {
    return sign + digits.slice(0, decimalPos) + '.' + digits.slice(decimalPos);
  }
}
```

### Test Cases

```typescript
describe('BigDecimal', () => {
  const input = "{amount: #<BigDecimal:7f8c,'0.12345E3',18(27)>}";

  it('returns string by default', () => {
    expect(parse(input)).toEqual({ amount: '123.45' });
  });

  it('returns number with number strategy', () => {
    expect(parse(input, { bigDecimalStrategy: 'number' }))
      .toEqual({ amount: 123.45 });
  });

  it('returns object with object strategy', () => {
    expect(parse(input, { bigDecimalStrategy: 'object' }))
      .toEqual({
        amount: {
          __type__: 'bigdecimal',
          value: '123.45',
          precision: 18,
        },
      });
  });

  it('handles negative values', () => {
    const neg = "{n: #<BigDecimal:abc,'-0.5E2',9(18)>}";
    expect(parse(neg)).toEqual({ n: '-50' });
  });

  it('handles very small values', () => {
    const small = "{n: #<BigDecimal:abc,'0.1E-10',9(18)>}";
    expect(parse(small)).toEqual({ n: '0.00000000001' });
  });
});
```

---

## 3.4 Complete Numeric Test Suite

### File: `tests/unit/numerics.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { parse } from '../../src';

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

    it('handles trailing underscore', () => {
      expect(parse('{n: 100_}')).toEqual({ n: 100 });
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
```

---

## Deliverables Checklist

- [ ] All integer formats (binary, octal, hex, underscores)
- [ ] Floating-point with scientific notation
- [ ] Non-finite value strategies (Infinity, NaN)
- [ ] BigDecimal parsing and conversion
- [ ] Comprehensive test coverage
- [ ] Documentation updated

---

## Exit Criteria

1. All Ruby numeric formats parse correctly
2. Non-finite values handled per configuration
3. BigDecimal precision preserved (string strategy)
4. Test coverage > 90% for numeric handling

---

## Navigation

← [Stage 2: Strings](./stage-2-strings.md) | [Stage 4: Objects](./stage-4-objects.md) →
