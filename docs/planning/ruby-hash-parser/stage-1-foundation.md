# Stage 1: Foundation & Core Grammar

**Document ID:** RHP-S1-2024-12-13  
**Parent:** [Main Plan](./2024-12-13-main.md)  
**Status:** Not Started  
**Duration:** 3-4 days  
**Dependencies:** None

---

## Objectives

1. Initialize package with proper tooling
2. Implement core PEG grammar for basic hash structures
3. Define AST type system
4. Establish testing infrastructure

---

## 1.1 Project Setup

### Package Initialization

```bash
# Create package directory
mkdir -p packages/ruby-hash-parser/src/{grammar,parser,transformer,types,errors}
mkdir -p packages/ruby-hash-parser/tests/{unit,integration,fixtures}
```

### package.json

```json
{
  "name": "@utility-belt/ruby-hash-parser",
  "version": "0.1.0",
  "description": "Parse Ruby Hash inspect output to JSON",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build:grammar": "peggy --plugin ts-pegjs -o src/parser/generated.ts src/grammar/ruby-hash.peggy",
    "build:ts": "tsup",
    "build": "pnpm build:grammar && pnpm build:ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "peggy": "^4.0.0",
    "ts-pegjs": "^4.2.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  },
  "peerDependencies": {
    "typescript": ">=5.0.0"
  }
}
```

### tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  treeshake: true,
});
```

### .gitignore additions

```gitignore
# Generated parser (rebuild from grammar)
src/parser/generated.ts
```

---

## 1.2 Core Grammar Definition

### File: `src/grammar/ruby-hash.peggy`

```peggy
{{
  // TypeScript header - types and helpers
  interface HashPair {
    key: unknown;
    value: unknown;
  }
}}

{
  // Parser initializer
  let depth = 0;
  const maxDepth = options.maxDepth ?? 500;
  
  function checkDepth() {
    if (++depth > maxDepth) {
      error(`Maximum nesting depth of ${maxDepth} exceeded`);
    }
  }
  
  function decrementDepth() {
    depth--;
  }
}

// =============================================================================
// ROOT RULES
// =============================================================================

Start
  = _ value:(Hash / ImplicitHash) _ { return value; }

ImplicitHash
  = !"{" head:Pair tail:(_ "," _ @Pair)* {
      return Object.fromEntries([head, ...tail]);
    }

// =============================================================================
// HASH STRUCTURE
// =============================================================================

Hash
  = "{" { checkDepth(); } _ pairs:PairList? _ "}" {
      decrementDepth();
      return Object.fromEntries(pairs ?? []);
    }

PairList
  = head:Pair tail:(_ "," _ @Pair)* { return [head, ...tail]; }

Pair
  = RocketPair
  / JsonStylePair

// Hash rocket: :key => value, "key" => value
RocketPair
  = key:KeyExpression _ "=>" _ value:Value {
      return [String(key), value];
    }

// JSON style: key: value (key becomes symbol)
JsonStylePair
  = key:BareIdentifier ":" !":"  _ value:Value {
      return [key, value];
    }

// =============================================================================
// KEY EXPRESSIONS
// =============================================================================

KeyExpression
  = Symbol
  / StringLiteral
  / NumberLiteral
  / Array
  / Hash

// =============================================================================
// VALUE EXPRESSIONS
// =============================================================================

Value
  = Hash
  / Array
  / StringLiteral
  / Symbol
  / NumberLiteral
  / Primitive

// =============================================================================
// ARRAYS
// =============================================================================

Array
  = "[" { checkDepth(); } _ elements:ElementList? _ "]" {
      decrementDepth();
      return elements ?? [];
    }

ElementList
  = head:Value tail:(_ "," _ @Value)* { return [head, ...tail]; }

// =============================================================================
// PRIMITIVES
// =============================================================================

Primitive
  = "true" !IdentifierChar { return true; }
  / "false" !IdentifierChar { return false; }
  / "nil" !IdentifierChar { return null; }

// =============================================================================
// SYMBOLS
// =============================================================================

Symbol
  = ":" name:BareIdentifier { return name; }
  / ":" str:StringLiteral { return str; }

// =============================================================================
// STRINGS (Basic - Stage 2 will expand)
// =============================================================================

StringLiteral
  = DoubleQuotedString
  / SingleQuotedString

DoubleQuotedString
  = '"' chars:DoubleQuotedChar* '"' { return chars.join(''); }

DoubleQuotedChar
  = !'"' !'\\' char:. { return char; }
  / '\\' escape:EscapeSequence { return escape; }

SingleQuotedString
  = "'" chars:SingleQuotedChar* "'" { return chars.join(''); }

SingleQuotedChar
  = !"'" !'\\' char:. { return char; }
  / "\\'" { return "'"; }
  / "\\\\" { return "\\"; }
  / '\\' char:. { return '\\' + char; }  // Literal backslash + char

// Basic escapes (Stage 2 will add full Ruby support)
EscapeSequence
  = 'n' { return '\n'; }
  / 't' { return '\t'; }
  / 'r' { return '\r'; }
  / '\\' { return '\\'; }
  / '"' { return '"'; }
  / "'" { return "'"; }
  / char:. { return char; }

// =============================================================================
// NUMBERS (Basic - Stage 3 will expand)
// =============================================================================

NumberLiteral
  = Float
  / Integer

Float
  = neg:"-"? int:IntegerPart "." frac:FractionalPart exp:ExponentPart? {
      return parseFloat((neg ?? '') + int + '.' + frac + (exp ?? ''));
    }

Integer
  = neg:"-"? digits:$[0-9]+ {
      return parseInt((neg ?? '') + digits, 10);
    }

IntegerPart
  = $[0-9]+

FractionalPart
  = $[0-9]+

ExponentPart
  = $([eE] [+-]? [0-9]+)

// =============================================================================
// IDENTIFIERS
// =============================================================================

BareIdentifier
  = $([a-zA-Z_] [a-zA-Z0-9_]*)

IdentifierChar
  = [a-zA-Z0-9_]

// =============================================================================
// WHITESPACE
// =============================================================================

_
  = [ \t\n\r]*
```

---

## 1.3 AST Type Definitions

### File: `src/types/ast.ts`

```typescript
/**
 * AST Node Types for Ruby Hash Parser
 * 
 * These types represent the intermediate syntax tree before
 * transformation to JavaScript objects.
 */

export type ASTNode =
  | HashNode
  | ArrayNode
  | StringNode
  | NumberNode
  | SymbolNode
  | BooleanNode
  | NilNode
  | ObjectInspectNode
  | RangeNode
  | SetNode
  | BigDecimalNode
  | TimestampNode
  | CyclicRefNode;

// -----------------------------------------------------------------------------
// Core Structures
// -----------------------------------------------------------------------------

export interface HashNode {
  type: 'hash';
  pairs: HashPair[];
  location?: SourceLocation;
}

export interface HashPair {
  key: ASTNode;
  value: ASTNode;
}

export interface ArrayNode {
  type: 'array';
  elements: ASTNode[];
  location?: SourceLocation;
}

// -----------------------------------------------------------------------------
// Scalar Types
// -----------------------------------------------------------------------------

export interface StringNode {
  type: 'string';
  value: string;
  quote: 'single' | 'double';
  location?: SourceLocation;
}

export interface NumberNode {
  type: 'number';
  value: number;
  raw: string;
  format: 'decimal' | 'binary' | 'octal' | 'hex' | 'float' | 'scientific';
  location?: SourceLocation;
}

export interface SymbolNode {
  type: 'symbol';
  value: string;
  quoted: boolean;
  location?: SourceLocation;
}

export interface BooleanNode {
  type: 'boolean';
  value: boolean;
  location?: SourceLocation;
}

export interface NilNode {
  type: 'nil';
  location?: SourceLocation;
}

// -----------------------------------------------------------------------------
// Ruby-Specific Types (Stages 3-4)
// -----------------------------------------------------------------------------

export interface ObjectInspectNode {
  type: 'object_inspect';
  className: string;
  address: string;
  instanceVars: Array<{ name: string; value: ASTNode }>;
  raw: string;
  location?: SourceLocation;
}

export interface RangeNode {
  type: 'range';
  begin: ASTNode;
  end: ASTNode;
  excludeEnd: boolean;
  location?: SourceLocation;
}

export interface SetNode {
  type: 'set';
  elements: ASTNode[];
  location?: SourceLocation;
}

export interface BigDecimalNode {
  type: 'bigdecimal';
  value: string;
  precision: number;
  location?: SourceLocation;
}

export interface TimestampNode {
  type: 'timestamp';
  value: string;
  timezone?: string;
  location?: SourceLocation;
}

export interface CyclicRefNode {
  type: 'cyclic_ref';
  refType: 'hash' | 'array';
  location?: SourceLocation;
}

// -----------------------------------------------------------------------------
// Source Location (for error reporting)
// -----------------------------------------------------------------------------

export interface SourceLocation {
  start: Position;
  end: Position;
}

export interface Position {
  offset: number;
  line: number;
  column: number;
}
```

### File: `src/types/options.ts`

```typescript
/**
 * Parser Configuration Options
 */

export interface ParserOptions {
  /**
   * Maximum nesting depth before throwing RecursionLimitExceeded.
   * @default 500
   */
  maxDepth: number;

  /**
   * Allow hash syntax without enclosing braces.
   * @default true
   */
  allowImplicitHash: boolean;

  /**
   * Strategy for handling Ruby Symbols.
   * - 'string': Convert :sym to "sym" (default)
   * - 'preserve': Keep as { __type__: 'symbol', value: 'sym' }
   * @default 'string'
   */
  symbolHandler: 'string' | 'preserve';

  /**
   * Handling of Infinity/NaN values.
   * - 'null': Convert to null (strict JSON)
   * - 'string': Convert to "Infinity", "NaN"
   * - 'literal': Keep as-is (JSON5 compatible)
   * - 'error': Throw an error
   * @default 'null'
   */
  nonFiniteNumbers: 'null' | 'string' | 'literal' | 'error';

  /**
   * Handling of #<Object...> inspect output.
   * - 'string': Return raw string
   * - 'object': Parse instance variables into object
   * @default 'string'
   */
  objectBehavior: 'string' | 'object';

  /**
   * Handling of binary data in strings.
   * - 'base64': Encode as base64 string
   * - 'array': Convert to byte array
   * - 'replacement': Replace with U+FFFD
   * - 'error': Throw an error
   * @default 'replacement'
   */
  binaryStrategy: 'base64' | 'array' | 'replacement' | 'error';

  /**
   * Handling of Range objects (1..10).
   * - 'object': { begin, end, exclude_end }
   * - 'string': "1..10"
   * - 'array': [1, 2, ..., 10] (dangerous for large ranges)
   * @default 'object'
   */
  rangeStrategy: 'object' | 'string' | 'array';

  /**
   * Handling of BigDecimal values.
   * - 'string': Return numeric string
   * - 'number': Convert to JS number (may lose precision)
   * - 'object': { __type__: 'bigdecimal', value: '...' }
   * @default 'string'
   */
  bigDecimalStrategy: 'string' | 'number' | 'object';

  /**
   * Handling of Set collections.
   * - 'array': Convert to array
   * - 'object': { __type__: 'set', values: [...] }
   * @default 'array'
   */
  setStrategy: 'array' | 'object';

  /**
   * Handling of cyclic references ({...}).
   * - 'sentinel': Return "[Circular]"
   * - 'null': Return null
   * - 'error': Throw an error
   * @default 'sentinel'
   */
  cyclicStrategy: 'sentinel' | 'null' | 'error';
}

/**
 * Default parser options
 */
export const DEFAULT_OPTIONS: ParserOptions = {
  maxDepth: 500,
  allowImplicitHash: true,
  symbolHandler: 'string',
  nonFiniteNumbers: 'null',
  objectBehavior: 'string',
  binaryStrategy: 'replacement',
  rangeStrategy: 'object',
  bigDecimalStrategy: 'string',
  setStrategy: 'array',
  cyclicStrategy: 'sentinel',
};

/**
 * Merge user options with defaults
 */
export function resolveOptions(
  userOptions?: Partial<ParserOptions>
): ParserOptions {
  return { ...DEFAULT_OPTIONS, ...userOptions };
}
```

---

## 1.4 Error Classes

### File: `src/errors/index.ts`

```typescript
/**
 * Custom Error Classes for Ruby Hash Parser
 */

/**
 * Base error class for all parser errors
 */
export class RubyHashParseError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column: number,
    public readonly found: string | null,
    public readonly expected: string[]
  ) {
    super(`${message} at line ${line}, column ${column}`);
    this.name = 'RubyHashParseError';
  }

  /**
   * Format error with context
   */
  format(input: string): string {
    const lines = input.split('\n');
    const errorLine = lines[this.line - 1] || '';
    const pointer = ' '.repeat(this.column - 1) + '^';
    
    return [
      `Parse Error: ${this.message}`,
      '',
      `  ${this.line} | ${errorLine}`,
      `    | ${pointer}`,
      '',
      `Expected: ${this.expected.join(', ')}`,
      `Found: ${this.found ?? 'end of input'}`,
    ].join('\n');
  }
}

/**
 * Thrown when nesting depth exceeds maxDepth option
 */
export class RecursionLimitExceeded extends Error {
  constructor(public readonly depth: number) {
    super(`Maximum nesting depth of ${depth} exceeded`);
    this.name = 'RecursionLimitExceeded';
  }
}

/**
 * Thrown when binary data cannot be handled with current strategy
 */
export class BinaryDataError extends Error {
  constructor(
    public readonly bytes: number[],
    public readonly strategy: string
  ) {
    super(`Cannot handle binary data with strategy '${strategy}'`);
    this.name = 'BinaryDataError';
  }
}

/**
 * Thrown when cyclic reference detected and strategy is 'error'
 */
export class CyclicReferenceError extends Error {
  constructor(public readonly refType: 'hash' | 'array') {
    super(`Cyclic ${refType} reference detected`);
    this.name = 'CyclicReferenceError';
  }
}
```

---

## 1.5 Public API (Initial)

### File: `src/index.ts`

```typescript
/**
 * @utility-belt/ruby-hash-parser
 * 
 * Parse Ruby Hash inspect output to JavaScript objects
 */

export { parse, toJSON, validate, parseToAST } from './parser';
export { ParserOptions, DEFAULT_OPTIONS } from './types/options';
export type { ASTNode } from './types/ast';
export {
  RubyHashParseError,
  RecursionLimitExceeded,
  BinaryDataError,
  CyclicReferenceError,
} from './errors';
```

### File: `src/parser/index.ts`

```typescript
import { parse as peggyParse } from './generated';
import { ParserOptions, DEFAULT_OPTIONS, resolveOptions } from '../types/options';
import { ASTNode } from '../types/ast';
import { RubyHashParseError } from '../errors';

/**
 * Parse Ruby Hash string to JavaScript object
 */
export function parse(
  input: string,
  options?: Partial<ParserOptions>
): unknown {
  const resolved = resolveOptions(options);
  
  try {
    return peggyParse(input, { ...resolved });
  } catch (err: unknown) {
    if (isPeggyError(err)) {
      throw new RubyHashParseError(
        err.message,
        err.location.start.line,
        err.location.start.column,
        err.found,
        err.expected.map((e: { description: string }) => e.description)
      );
    }
    throw err;
  }
}

/**
 * Parse and return JSON string
 */
export function toJSON(
  input: string,
  options?: Partial<ParserOptions>
): string {
  const result = parse(input, options);
  return JSON.stringify(result, null, 2);
}

/**
 * Validate input without full transformation
 */
export function validate(input: string): { valid: boolean; error?: string } {
  try {
    parse(input);
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Parse to AST (for debugging/advanced use)
 */
export function parseToAST(
  input: string,
  options?: Partial<ParserOptions>
): ASTNode {
  // TODO: Implement AST mode in grammar
  throw new Error('Not implemented - use parse() for now');
}

// Type guard for Peggy errors
function isPeggyError(err: unknown): err is {
  message: string;
  location: { start: { line: number; column: number } };
  found: string | null;
  expected: Array<{ description: string }>;
} {
  return (
    typeof err === 'object' &&
    err !== null &&
    'location' in err &&
    'expected' in err
  );
}
```

---

## 1.6 Test Suite Setup

### File: `tests/unit/basic-parsing.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { parse, validate } from '../../src';

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
```

---

## Deliverables Checklist

- [ ] Package initialized with pnpm workspace
- [ ] TypeScript configuration complete
- [ ] Peggy grammar compiles successfully
- [ ] Build pipeline: grammar → TypeScript → bundle
- [ ] All basic parsing tests pass
- [ ] Error handling with line/column info
- [ ] `parse()`, `toJSON()`, `validate()` exported
- [ ] Type definitions exported

---

## Exit Criteria

1. `pnpm build` succeeds without errors
2. `pnpm test` passes all Stage 1 tests
3. Can parse: `{:name => "Alice", age: 30, items: [1, 2, 3]}`
4. Errors include line/column information

---

## Next Stage

→ [Stage 2: Symbol & String Handling](./stage-2-strings.md)
