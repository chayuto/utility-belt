# Stage 6: Public API & Documentation

**Document ID:** RHP-S6-2024-12-13  
**Parent:** [Main Plan](./2024-12-13-main.md)  
**Status:** Not Started  
**Duration:** 2-3 days  
**Dependencies:** Stage 5

---

## Objectives

1. Finalize public API surface
2. Create preset configurations
3. Write comprehensive documentation
4. Ensure TypeScript types are complete
5. Prepare for npm publication

---

## 6.1 Final API Design

### File: `src/index.ts`

```typescript
/**
 * @utility-belt/ruby-hash-parser
 * 
 * Industrial-grade parser for Ruby Hash inspect output.
 * Converts Ruby Hash strings to JavaScript objects/JSON.
 * 
 * @example
 * ```typescript
 * import { parse, toJSON } from '@utility-belt/ruby-hash-parser';
 * 
 * const result = parse('{:name => "Alice", age: 30}');
 * // => { name: "Alice", age: 30 }
 * 
 * const json = toJSON('{items: [1, 2, 3]}');
 * // => '{\n  "items": [1, 2, 3]\n}'
 * ```
 * 
 * @packageDocumentation
 */

// Core functions
export { parse, toJSON, validate, parseToAST } from './parser';

// Types
export type { ParserOptions } from './types/options';
export type { ASTNode, HashNode, ArrayNode, SymbolNode } from './types/ast';
export type { ParseResult, ValidationResult } from './types/results';

// Configuration
export { DEFAULT_OPTIONS, resolveOptions } from './types/options';
export { presets } from './presets';

// Errors
export {
  RubyHashParseError,
  RecursionLimitExceeded,
  BinaryDataError,
  CyclicReferenceError,
} from './errors';

// Version
export const VERSION = '1.0.0';
```

### Core Functions

```typescript
// src/parser/index.ts

/**
 * Parse a Ruby Hash inspect string to a JavaScript value.
 * 
 * @param input - Ruby Hash string (e.g., '{:name => "Alice"}')
 * @param options - Parser configuration options
 * @returns Parsed JavaScript value
 * @throws {RubyHashParseError} If input cannot be parsed
 * @throws {RecursionLimitExceeded} If nesting exceeds maxDepth
 * 
 * @example
 * ```typescript
 * // Basic usage
 * parse('{name: "Alice"}')
 * // => { name: "Alice" }
 * 
 * // With options
 * parse('{n: Infinity}', { nonFiniteNumbers: 'string' })
 * // => { n: "Infinity" }
 * 
 * // Using presets
 * parse('{...}', presets.strict)
 * ```
 */
export function parse(
  input: string,
  options?: Partial<ParserOptions>
): unknown;

/**
 * Parse Ruby Hash string and return formatted JSON.
 * 
 * @param input - Ruby Hash string
 * @param options - Parser configuration options
 * @param indent - JSON indentation (default: 2)
 * @returns Formatted JSON string
 * 
 * @example
 * ```typescript
 * toJSON('{a: 1, b: 2}')
 * // => '{\n  "a": 1,\n  "b": 2\n}'
 * 
 * toJSON('{a: 1}', {}, 0)
 * // => '{"a":1}'
 * ```
 */
export function toJSON(
  input: string,
  options?: Partial<ParserOptions>,
  indent?: number
): string;

/**
 * Validate if input is parseable without full transformation.
 * 
 * @param input - Ruby Hash string to validate
 * @param options - Parser configuration options
 * @returns Validation result with error details if invalid
 * 
 * @example
 * ```typescript
 * validate('{a: 1}')
 * // => { valid: true }
 * 
 * validate('{a: }')
 * // => { valid: false, error: "Unexpected...", line: 1, column: 5 }
 * ```
 */
export function validate(
  input: string,
  options?: Partial<ParserOptions>
): ValidationResult;

/**
 * Parse to Abstract Syntax Tree for advanced processing.
 * 
 * @param input - Ruby Hash string
 * @param options - Parser configuration options
 * @returns AST root node
 * 
 * @example
 * ```typescript
 * const ast = parseToAST('{a: 1}');
 * // => { type: 'hash', pairs: [...] }
 * ```
 */
export function parseToAST(
  input: string,
  options?: Partial<ParserOptions>
): ASTNode;
```

### Result Types

```typescript
// src/types/results.ts

/**
 * Result of parse operation
 */
export interface ParseResult<T = unknown> {
  success: true;
  value: T;
}

/**
 * Result of validation operation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
  expected?: string[];
  found?: string | null;
}
```

---

## 6.2 Preset Configurations

### File: `src/presets.ts`

```typescript
import type { ParserOptions } from './types/options';

/**
 * Preset configurations for common use cases.
 * 
 * @example
 * ```typescript
 * import { parse, presets } from '@utility-belt/ruby-hash-parser';
 * 
 * // Strict JSON output
 * parse(input, presets.strict);
 * 
 * // Maximum data preservation
 * parse(input, presets.preserving);
 * ```
 */
export const presets = {
  /**
   * Strict JSON compliance.
   * - Non-finite numbers become null
   * - Objects become strings
   * - Cycles become null
   * 
   * Use when output must be valid JSON.
   */
  strict: {
    nonFiniteNumbers: 'null',
    objectBehavior: 'string',
    cyclicStrategy: 'null',
    rangeStrategy: 'string',
    bigDecimalStrategy: 'string',
    setStrategy: 'array',
  } as Partial<ParserOptions>,

  /**
   * Maximum data preservation.
   * - Non-finite numbers become strings
   * - Objects are parsed to structured objects
   * - Ranges become objects with begin/end
   * - BigDecimals become objects with precision
   * 
   * Use when you need to preserve Ruby type information.
   */
  preserving: {
    nonFiniteNumbers: 'string',
    objectBehavior: 'object',
    rangeStrategy: 'object',
    bigDecimalStrategy: 'object',
    setStrategy: 'object',
    cyclicStrategy: 'sentinel',
  } as Partial<ParserOptions>,

  /**
   * JSON5 compatible output.
   * - Infinity and NaN kept as literals
   * 
   * Use when target consumer supports JSON5.
   */
  json5: {
    nonFiniteNumbers: 'literal',
  } as Partial<ParserOptions>,

  /**
   * Lenient parsing for console logs.
   * - Allows implicit hashes
   * - High recursion limit
   * - Replaces binary data
   * 
   * Use for parsing raw console/debug output.
   */
  lenient: {
    allowImplicitHash: true,
    maxDepth: 1000,
    binaryStrategy: 'replacement',
    cyclicStrategy: 'sentinel',
  } as Partial<ParserOptions>,

  /**
   * Strict parsing with errors.
   * - Throws on non-finite numbers
   * - Throws on binary data
   * - Throws on cycles
   * 
   * Use when you want to catch all edge cases.
   */
  pedantic: {
    nonFiniteNumbers: 'error',
    binaryStrategy: 'error',
    cyclicStrategy: 'error',
    allowImplicitHash: false,
  } as Partial<ParserOptions>,
} as const;

export type PresetName = keyof typeof presets;
```

---

## 6.3 Complete Options Interface

```typescript
// src/types/options.ts

/**
 * Configuration options for the Ruby Hash parser.
 * 
 * All options have sensible defaults. Use presets for common configurations.
 */
export interface ParserOptions {
  // ─────────────────────────────────────────────────────────────────────────
  // Parsing Behavior
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Allow hash syntax without enclosing braces.
   * 
   * When true, parses `key: "value", other: 123` as a hash.
   * 
   * @default true
   */
  allowImplicitHash: boolean;

  /**
   * Maximum nesting depth before throwing RecursionLimitExceeded.
   * 
   * Protects against stack overflow from deeply nested structures.
   * 
   * @default 500
   */
  maxDepth: number;

  /**
   * Maximum input size in bytes.
   * 
   * Protects against memory exhaustion from huge inputs.
   * 
   * @default 10485760 (10MB)
   */
  maxInputSize: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Type Coercion
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Strategy for handling Ruby Symbols.
   * 
   * - `'string'`: Convert `:sym` to `"sym"` (default)
   * - `'preserve'`: Keep as `{ __type__: 'symbol', value: 'sym' }`
   * 
   * @default 'string'
   */
  symbolHandler: 'string' | 'preserve';

  /**
   * Handling of Infinity/NaN values.
   * 
   * - `'null'`: Convert to `null` (strict JSON)
   * - `'string'`: Convert to `"Infinity"`, `"NaN"`
   * - `'literal'`: Keep as JavaScript `Infinity`/`NaN` (JSON5)
   * - `'error'`: Throw an error
   * 
   * @default 'null'
   */
  nonFiniteNumbers: 'null' | 'string' | 'literal' | 'error';

  /**
   * Handling of `#<Object...>` inspect output.
   * 
   * - `'string'`: Return raw string `"#<User:0x...>"`
   * - `'object'`: Parse instance variables into object
   * 
   * @default 'string'
   */
  objectBehavior: 'string' | 'object';

  /**
   * Handling of binary data in strings.
   * 
   * - `'base64'`: Encode as base64 string
   * - `'array'`: Convert to byte array `[255, 254, ...]`
   * - `'replacement'`: Replace with U+FFFD
   * - `'error'`: Throw BinaryDataError
   * 
   * @default 'replacement'
   */
  binaryStrategy: 'base64' | 'array' | 'replacement' | 'error';

  /**
   * Handling of Range objects (`1..10`).
   * 
   * - `'object'`: `{ begin: 1, end: 10, exclude_end: false }`
   * - `'string'`: `"1..10"`
   * - `'array'`: `[1, 2, ..., 10]` (max 10000 elements)
   * 
   * @default 'object'
   */
  rangeStrategy: 'object' | 'string' | 'array';

  /**
   * Handling of BigDecimal values.
   * 
   * - `'string'`: Return numeric string (preserves precision)
   * - `'number'`: Convert to JS number (may lose precision)
   * - `'object'`: `{ __type__: 'bigdecimal', value: '...', precision: N }`
   * 
   * @default 'string'
   */
  bigDecimalStrategy: 'string' | 'number' | 'object';

  /**
   * Handling of Set collections.
   * 
   * - `'array'`: Convert to array `[1, 2, 3]`
   * - `'object'`: `{ __type__: 'set', values: [1, 2, 3] }`
   * 
   * @default 'array'
   */
  setStrategy: 'array' | 'object';

  /**
   * Handling of cyclic references (`{...}`).
   * 
   * - `'sentinel'`: Return `"[Circular]"` string
   * - `'null'`: Return `null`
   * - `'error'`: Throw CyclicReferenceError
   * 
   * @default 'sentinel'
   */
  cyclicStrategy: 'sentinel' | 'null' | 'error';
}
```

---

## 6.4 README Documentation

### File: `packages/ruby-hash-parser/README.md`

```markdown
# @utility-belt/ruby-hash-parser

Industrial-grade TypeScript parser for Ruby Hash `inspect` output.

## Features

- ✅ Full Ruby Hash syntax support (1.8 - 3.x)
- ✅ Hash rocket (`=>`) and JSON-style (`:`) syntax
- ✅ All Ruby escape sequences
- ✅ Complex types: BigDecimal, Set, Range, Struct
- ✅ Configurable type coercion strategies
- ✅ Detailed error messages with source location
- ✅ DoS protection (recursion limits)
- ✅ Zero dependencies (except Peggy for build)

## Installation

```bash
npm install @utility-belt/ruby-hash-parser
# or
pnpm add @utility-belt/ruby-hash-parser
```

## Quick Start

```typescript
import { parse, toJSON } from '@utility-belt/ruby-hash-parser';

// Basic parsing
const result = parse('{:name => "Alice", age: 30}');
// => { name: "Alice", age: 30 }

// Get JSON string
const json = toJSON('{items: [1, 2, 3]}');
// => '{\n  "items": [1, 2, 3]\n}'

// Validate without parsing
const { valid, error } = validate('{a: }');
// => { valid: false, error: "Unexpected..." }
```

## Configuration

```typescript
import { parse, presets } from '@utility-belt/ruby-hash-parser';

// Use presets
parse(input, presets.strict);      // Strict JSON output
parse(input, presets.preserving);  // Maximum data preservation
parse(input, presets.lenient);     // For console logs

// Custom options
parse(input, {
  nonFiniteNumbers: 'string',  // Infinity → "Infinity"
  objectBehavior: 'object',    // Parse #<Object> instance vars
  rangeStrategy: 'array',      // 1..5 → [1, 2, 3, 4, 5]
});
```

## Supported Syntax

| Ruby Syntax | Example | Output |
|-------------|---------|--------|
| Hash rocket | `{:key => "value"}` | `{ key: "value" }` |
| JSON-style | `{key: "value"}` | `{ key: "value" }` |
| Mixed | `{:a => 1, b: 2}` | `{ a: 1, b: 2 }` |
| Nested | `{a: {b: 1}}` | `{ a: { b: 1 } }` |
| Arrays | `[1, 2, 3]` | `[1, 2, 3]` |
| Symbols | `:name`, `:'key'` | `"name"`, `"key"` |
| Nil | `nil` | `null` |
| Infinity | `Infinity` | `null` (configurable) |
| BigDecimal | `#<BigDecimal:...>` | `"123.45"` |
| Range | `1..10` | `{ begin: 1, end: 10, ... }` |
| Set | `#<Set: {1, 2}>` | `[1, 2]` |

## Error Handling

```typescript
import { parse, RubyHashParseError } from '@utility-belt/ruby-hash-parser';

try {
  parse('{invalid: }');
} catch (err) {
  if (err instanceof RubyHashParseError) {
    console.log(err.line);    // 1
    console.log(err.column);  // 10
    console.log(err.format(input));
    // RubyHashParseError: Unexpected end of input
    // 
    // > 1 | {invalid: }
    //     |           ^
  }
}
```

## API Reference

See [API Documentation](./docs/api.md) for complete reference.

## License

MIT
```

---

## 6.5 TypeScript Declaration Verification

Ensure all types are properly exported:

```typescript
// tests/types/exports.test-d.ts

import { expectType } from 'tsd';
import {
  parse,
  toJSON,
  validate,
  parseToAST,
  ParserOptions,
  ASTNode,
  RubyHashParseError,
  presets,
  VERSION,
} from '@utility-belt/ruby-hash-parser';

// Function signatures
expectType<unknown>(parse('{a: 1}'));
expectType<unknown>(parse('{a: 1}', {}));
expectType<unknown>(parse('{a: 1}', { nonFiniteNumbers: 'string' }));

expectType<string>(toJSON('{a: 1}'));
expectType<string>(toJSON('{a: 1}', {}, 4));

expectType<{ valid: boolean; error?: string }>(validate('{a: 1}'));

expectType<ASTNode>(parseToAST('{a: 1}'));

// Presets
expectType<Partial<ParserOptions>>(presets.strict);
expectType<Partial<ParserOptions>>(presets.preserving);

// Error class
const err = new RubyHashParseError('msg', 1, 1, 0, null, []);
expectType<number>(err.line);
expectType<number>(err.column);
expectType<string>(err.format('input'));

// Version
expectType<string>(VERSION);
```

---

## Deliverables Checklist

- [ ] Final API exported from index.ts
- [ ] All functions have JSDoc comments
- [ ] Preset configurations defined
- [ ] README with quick start guide
- [ ] TypeScript types verified
- [ ] API reference documentation
- [ ] Changelog initialized

---

## Exit Criteria

1. All public API functions documented
2. TypeScript types compile without errors
3. README provides clear getting started guide
4. Presets cover common use cases
5. Package ready for npm publish

---

## Navigation

← [Stage 5: Robustness](./stage-5-robustness.md) | [Stage 7: Integration](./stage-7-integration.md) →
