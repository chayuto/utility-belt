# @utility-belt/ruby-hash-parser

Industrial-grade TypeScript parser for Ruby Hash `inspect` output.

## Features

- ✅ Full Ruby Hash syntax support (1.8 - 3.x)
- ✅ Hash rocket (`=>`) and JSON-style (`:`) syntax
- ✅ All Ruby escape sequences
- ✅ All numeric formats: binary, octal, hex, underscores
- ✅ Range literals (`1..10`, `1...10`)
- ✅ Cyclic reference detection (`{...}`, `[...]`)
- ✅ Configurable type coercion strategies
- ✅ Detailed error messages with source location
- ✅ DoS protection (recursion limits)
- ✅ Preset configurations for common use cases

## Installation

```bash
npm install @utility-belt/ruby-hash-parser
# or
pnpm add @utility-belt/ruby-hash-parser
```

## Quick Start

```typescript
import { parse, toJSON, validate } from '@utility-belt/ruby-hash-parser';

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
parse(input, presets.json5);       // JSON5 compatible
parse(input, presets.lenient);     // For console logs
parse(input, presets.pedantic);    // Throws on edge cases

// Custom options
parse(input, {
  nonFiniteNumbers: 'string',  // Infinity → "Infinity"
  rangeStrategy: 'array',      // 1..5 → [1, 2, 3, 4, 5]
  cyclicStrategy: 'null',      // {...} → null
});
```

## Supported Syntax

| Ruby Syntax | Example | Output |
|-------------|---------|--------|
| Hash rocket | `{:key => "value"}` | `{ key: "value" }` |
| JSON-style | `{key: "value"}` | `{ key: "value" }` |
| Mixed | `{:a => 1, b: 2}` | `{ a: 1, b: 2 }` |
| Symbols | `:name`, `:'key'` | `"name"`, `"key"` |
| Operators | `:+`, `:[]`, `:<=>` | `"+"`, `"[]"`, `"<=>"` |
| Nil | `nil` | `null` |
| Infinity | `Infinity` | `null` (configurable) |
| Range | `1..10` | `{ begin: 1, end: 10, ... }` |
| Cyclic | `{...}` | `"[Circular]"` |
| Binary | `0b1010` | `10` |
| Octal | `0o755` | `493` |
| Hex | `0xFF` | `255` |
| Underscores | `1_000_000` | `1000000` |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `maxDepth` | `500` | Maximum nesting depth |
| `allowImplicitHash` | `true` | Parse `key: value` without braces |
| `nonFiniteNumbers` | `'null'` | Handle Infinity/NaN: `null`, `string`, `literal`, `error` |
| `rangeStrategy` | `'object'` | Handle ranges: `object`, `string`, `array` |
| `cyclicStrategy` | `'sentinel'` | Handle cycles: `sentinel`, `null`, `error` |

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
  }
}
```

## License

MIT
