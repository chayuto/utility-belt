# Stage 5: Robustness & Security

**Document ID:** RHP-S5-2024-12-13  
**Parent:** [Main Plan](./2024-12-13-main.md)  
**Status:** Not Started  
**Duration:** 3-4 days  
**Dependencies:** Stage 4

---

## Objectives

1. Implement implicit hash support (brace-less syntax)
2. Enhance error reporting with context
3. Add recursion depth limiting (DoS protection)
4. Optimize performance for large inputs
5. Ensure whitespace resilience

---

## 5.1 Implicit Hash Support

Ruby allows omitting braces when a hash is the last method argument.

### Examples

```ruby
# These are equivalent:
method({key: "value", other: 123})
method(key: "value", other: 123)

# Console output may show:
# key: "value", other: 123
```

### Grammar Update

```peggy
Start
  = _ value:(Hash / Array / ImplicitHash) _ { return value; }

ImplicitHash
  = !("{" / "[") head:Pair tail:(_ "," _ @Pair)+ {
      // Require at least 2 pairs to distinguish from other expressions
      return Object.fromEntries([head, ...tail]);
    }
  / !("{" / "[") pair:Pair &{ return options.allowImplicitHash; } {
      // Single pair only if explicitly allowed
      return Object.fromEntries([pair]);
    }
```

### Configuration

```typescript
interface ParserOptions {
  /**
   * Allow hash syntax without enclosing braces.
   * @default true
   */
  allowImplicitHash: boolean;
}
```

### Test Cases

```typescript
describe('Implicit Hash', () => {
  it('parses brace-less hash with multiple pairs', () => {
    expect(parse('key: "value", other: 123')).toEqual({
      key: 'value',
      other: 123,
    });
  });

  it('parses mixed syntax without braces', () => {
    expect(parse('name: "Alice", :age => 30')).toEqual({
      name: 'Alice',
      age: 30,
    });
  });

  it('can be disabled', () => {
    expect(() => parse('key: "value"', { allowImplicitHash: false }))
      .toThrow();
  });

  it('still requires braces for nested hashes', () => {
    expect(parse('outer: {inner: 1}')).toEqual({
      outer: { inner: 1 },
    });
  });
});
```

---

## 5.2 Enhanced Error Reporting

Provide actionable error messages with source context.

### Error Class Enhancement

```typescript
// src/errors/index.ts

export class RubyHashParseError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column: number,
    public readonly offset: number,
    public readonly found: string | null,
    public readonly expected: string[]
  ) {
    super(message);
    this.name = 'RubyHashParseError';
  }

  /**
   * Format error with source context
   */
  format(input: string, contextLines: number = 2): string {
    const lines = input.split('\n');
    const errorLineIndex = this.line - 1;
    
    // Build context window
    const startLine = Math.max(0, errorLineIndex - contextLines);
    const endLine = Math.min(lines.length - 1, errorLineIndex + contextLines);
    
    const contextParts: string[] = [];
    
    for (let i = startLine; i <= endLine; i++) {
      const lineNum = String(i + 1).padStart(4, ' ');
      const marker = i === errorLineIndex ? '>' : ' ';
      contextParts.push(`${marker}${lineNum} | ${lines[i]}`);
      
      if (i === errorLineIndex) {
        // Add pointer line
        const pointer = ' '.repeat(this.column - 1) + '^';
        contextParts.push(`      | ${pointer}`);
      }
    }
    
    return [
      `RubyHashParseError: ${this.message}`,
      '',
      ...contextParts,
      '',
      `Expected: ${this.expected.slice(0, 5).join(', ')}${this.expected.length > 5 ? '...' : ''}`,
      `Found: ${this.found ?? 'end of input'}`,
      `Location: line ${this.line}, column ${this.column}`,
    ].join('\n');
  }
}
```

### Example Output

```
RubyHashParseError: Unexpected token

   1 | {
   2 |   name: "Alice",
>  3 |   age = 30
      |       ^
   4 | }

Expected: '=>', ':'
Found: '='
Location: line 3, column 7
```

### Parser Integration

```typescript
// src/parser/index.ts

export function parse(input: string, options?: Partial<ParserOptions>): unknown {
  const resolved = resolveOptions(options);
  
  try {
    return peggyParse(input, { ...resolved });
  } catch (err: unknown) {
    if (isPeggyError(err)) {
      const parseError = new RubyHashParseError(
        buildErrorMessage(err),
        err.location.start.line,
        err.location.start.column,
        err.location.start.offset,
        err.found,
        err.expected.map(e => e.description)
      );
      
      // Attach formatted output for convenience
      parseError.message = parseError.format(input);
      throw parseError;
    }
    throw err;
  }
}

function buildErrorMessage(err: PeggyError): string {
  if (err.found === null) {
    return 'Unexpected end of input';
  }
  
  const found = JSON.stringify(err.found);
  if (err.expected.length === 1) {
    return `Expected ${err.expected[0].description} but found ${found}`;
  }
  
  return `Unexpected ${found}`;
}
```

---

## 5.3 Recursion Depth Limiting

Prevent stack overflow from deeply nested structures.

### Implementation

```peggy
{
  // Parser initializer
  let currentDepth = 0;
  const maxDepth = options.maxDepth ?? 500;
  
  function enterNesting() {
    currentDepth++;
    if (currentDepth > maxDepth) {
      error(`Maximum nesting depth of ${maxDepth} exceeded`);
    }
  }
  
  function exitNesting() {
    currentDepth--;
  }
}

Hash
  = "{" { enterNesting(); } _ pairs:PairList? _ "}" {
      exitNesting();
      return Object.fromEntries(pairs ?? []);
    }

Array
  = "[" { enterNesting(); } _ elements:ElementList? _ "]" {
      exitNesting();
      return elements ?? [];
    }
```

### Custom Error

```typescript
export class RecursionLimitExceeded extends Error {
  constructor(
    public readonly depth: number,
    public readonly limit: number
  ) {
    super(`Maximum nesting depth of ${limit} exceeded at depth ${depth}`);
    this.name = 'RecursionLimitExceeded';
  }
}
```

### Test Cases

```typescript
describe('Recursion Limiting', () => {
  it('allows reasonable nesting', () => {
    const nested = '{a: {b: {c: {d: {e: 1}}}}}';
    expect(() => parse(nested)).not.toThrow();
  });

  it('throws at default limit (500)', () => {
    // Generate deeply nested structure
    let input = '1';
    for (let i = 0; i < 501; i++) {
      input = `{a: ${input}}`;
    }
    expect(() => parse(input)).toThrow('Maximum nesting depth');
  });

  it('respects custom limit', () => {
    let input = '1';
    for (let i = 0; i < 11; i++) {
      input = `{a: ${input}}`;
    }
    expect(() => parse(input, { maxDepth: 10 })).toThrow();
    expect(() => parse(input, { maxDepth: 20 })).not.toThrow();
  });

  it('counts arrays in depth', () => {
    let input = '1';
    for (let i = 0; i < 11; i++) {
      input = `[${input}]`;
    }
    expect(() => parse(input, { maxDepth: 10 })).toThrow();
  });
});
```

---

## 5.4 Performance Optimization

### Benchmarking Setup

```typescript
// tests/performance/benchmark.ts

import { bench, describe } from 'vitest';
import { parse } from '../../src';

describe('Parser Performance', () => {
  // Generate test data
  const smallHash = generateHash(10, 2);      // ~500 bytes
  const mediumHash = generateHash(100, 3);    // ~50KB
  const largeHash = generateHash(1000, 3);    // ~500KB
  const hugeHash = generateHash(5000, 2);     // ~1MB

  bench('small hash (500B)', () => {
    parse(smallHash);
  });

  bench('medium hash (50KB)', () => {
    parse(mediumHash);
  });

  bench('large hash (500KB)', () => {
    parse(largeHash);
  });

  bench('huge hash (1MB)', () => {
    parse(hugeHash);
  });
});

function generateHash(keys: number, depth: number): string {
  if (depth === 0) {
    return '"value"';
  }
  
  const pairs = Array.from({ length: keys }, (_, i) => 
    `key${i}: ${generateHash(Math.floor(keys / 10), depth - 1)}`
  );
  
  return `{${pairs.join(', ')}}`;
}
```

### Performance Targets

| Input Size | Target Time | Notes |
|------------|-------------|-------|
| 500 bytes | < 1ms | Typical single hash |
| 50 KB | < 10ms | Large API response |
| 500 KB | < 100ms | Debug log dump |
| 1 MB | < 1 second | Maximum practical size |

### Optimization Strategies

1. **Avoid Backtracking**
   - Use ordered choice carefully
   - Prefer greedy matching

2. **Minimize String Operations**
   - Use `text()` instead of joining arrays
   - Avoid intermediate string concatenation

3. **Lazy Transformation**
   - Parse to AST first
   - Transform only when needed

```peggy
// Optimized: use text() for identifiers
BareIdentifier
  = $([a-zA-Z_] [a-zA-Z0-9_]*)

// Instead of:
// = first:[a-zA-Z_] rest:[a-zA-Z0-9_]* { return first + rest.join(''); }
```

---

## 5.5 Whitespace Resilience

Handle various formatting styles gracefully.

### Test Cases

```typescript
describe('Whitespace Handling', () => {
  describe('Compact Format', () => {
    it('handles no spaces', () => {
      expect(parse('{a:1,b:2}')).toEqual({ a: 1, b: 2 });
    });

    it('handles no space after colon', () => {
      expect(parse('{a:1}')).toEqual({ a: 1 });
    });
  });

  describe('Expanded Format', () => {
    it('handles newlines', () => {
      const input = `{
        a: 1,
        b: 2
      }`;
      expect(parse(input)).toEqual({ a: 1, b: 2 });
    });

    it('handles tabs', () => {
      expect(parse('{\ta:\t1\t}')).toEqual({ a: 1 });
    });
  });

  describe('Irregular Format', () => {
    it('handles mixed spacing', () => {
      expect(parse('{  a:   1  ,  b:2}')).toEqual({ a: 1, b: 2 });
    });

    it('handles trailing comma', () => {
      expect(parse('{a: 1, b: 2,}')).toEqual({ a: 1, b: 2 });
    });

    it('handles leading/trailing whitespace', () => {
      expect(parse('  {a: 1}  ')).toEqual({ a: 1 });
    });
  });

  describe('Pretty Print Format', () => {
    it('handles Ruby pp output', () => {
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
});
```

### Grammar for Trailing Comma

```peggy
PairList
  = head:Pair tail:(_ "," _ @Pair)* (_ ",")? {
      return [head, ...tail];
    }

ElementList
  = head:Value tail:(_ "," _ @Value)* (_ ",")? {
      return [head, ...tail];
    }
```

---

## 5.6 Security Considerations

### No eval() Policy

The parser MUST NOT use `eval()` or `Function()` constructor.

```typescript
// ❌ NEVER DO THIS
function naiveParse(input: string): unknown {
  // Security vulnerability!
  return eval(`(${input.replace(/=>/g, ':')})`);
}

// ✅ CORRECT: Use PEG parser
function parse(input: string): unknown {
  return peggyParse(input, options);
}
```

### Input Validation

```typescript
export function parse(input: string, options?: Partial<ParserOptions>): unknown {
  // Validate input type
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }
  
  // Validate input size (prevent memory exhaustion)
  const maxSize = options?.maxInputSize ?? 10 * 1024 * 1024; // 10MB default
  if (input.length > maxSize) {
    throw new Error(`Input exceeds maximum size of ${maxSize} bytes`);
  }
  
  // ... parse
}
```

### Security Test Cases

```typescript
describe('Security', () => {
  it('does not execute code in input', () => {
    // This should parse as a string, not execute
    const malicious = '{cmd: "$(rm -rf /)"}';
    const result = parse(malicious);
    expect(result.cmd).toBe('$(rm -rf /)');
  });

  it('handles prototype pollution attempts', () => {
    const input = '{__proto__: {admin: true}}';
    const result = parse(input);
    // Should not pollute Object.prototype
    expect(({} as any).admin).toBeUndefined();
  });

  it('rejects oversized input', () => {
    const huge = '{a: "' + 'x'.repeat(20 * 1024 * 1024) + '"}';
    expect(() => parse(huge)).toThrow('exceeds maximum size');
  });
});
```

---

## Deliverables Checklist

- [ ] Implicit hash parsing
- [ ] Enhanced error messages with context
- [ ] Recursion depth limiting
- [ ] Performance benchmarks passing
- [ ] Whitespace resilience tests
- [ ] Security hardening
- [ ] Documentation updated

---

## Exit Criteria

1. Implicit hash syntax works correctly
2. Errors include line/column and context
3. Recursion limit prevents stack overflow
4. 1MB input parses in < 1 second
5. All whitespace variations handled
6. Security tests pass

---

## Navigation

← [Stage 4: Objects](./stage-4-objects.md) | [Stage 6: API](./stage-6-api.md) →
