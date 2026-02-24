# Utility Belt - Developer Toolkit Monorepo

A high-performance monorepo for developer utilities, built with TypeScript, pnpm workspaces, React, and Vite.

## Packages

### [@utility-belt/ruby-hash-parser](./packages/ruby-hash-parser)

Industrial-grade TypeScript parser for Ruby Hash `inspect` output.

- Full Ruby Hash syntax support (1.8 - 3.x)
- Hash rocket (`=>`) and JSON-style (`:`) syntax
- All escape sequences and numeric formats
- Range literals, cyclic references, trailing commas
- Configurable presets (strict, preserving, json5, lenient, pedantic)
- 171 comprehensive tests

```typescript
import { parse, toJSON, presets } from '@utility-belt/ruby-hash-parser';

parse('{:name => "Alice", age: 30}');
// => { name: "Alice", age: 30 }
```

---

### [@utility-belt/thai-obfuscator](./packages/thai-obfuscator)

Thai text obfuscation library with multiple strategies for anti-scraping and text protection.

- Multiple obfuscation strategies (homoglyph, zero-width, composite)
- Analysis and deobfuscation utilities
- Debug tools for examining obfuscated text

```typescript
import { obfuscate, analyze, deobfuscate } from '@utility-belt/thai-obfuscator';

const result = obfuscate('สวัสดี');
const analysis = analyze(result.text);
```

---

### [@my-toolkit/thai-text-modifier](./packages/thai-text-modifier)

Shared library for Thai text manipulation utilities.

- ESM and CJS exports
- TypeScript definitions
- Ready for npm publishing

---

## Web App

### [@utility-belt/web](./apps/web)

Main dashboard built with Vite, React, and TailwindCSS.

**Available Tools:**
- **Ruby to JSON Converter** - Parse Ruby hash syntax to JSON with real-time parsing
- **Thai Text Modifier** - Thai text manipulation tools
- **String Case Converter** - Convert between different string cases

---

## Project Structure

```text
/ (Root)
├── package.json            # Root package with monorepo scripts
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── tsconfig.base.json      # Shared TypeScript configuration
│
├── /apps
│   └── /web                # Main Dashboard (Vite + React + TailwindCSS)
│       └── /src/tools      # Individual tool components
│
└── /packages
    ├── /ruby-hash-parser   # Ruby Hash → JSON parser (PEG-based)
    ├── /thai-obfuscator    # Thai text obfuscation library
    └── /thai-text-modifier # Thai text utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 10+

### Installation

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm@10

# Install dependencies
pnpm install
```

### Development

```bash
# Start the dev server
pnpm dev

# Build all packages and apps
pnpm build

# Run all tests
pnpm test

# Type check all packages
pnpm typecheck
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server for web app |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run tests across all packages |
| `pnpm lint` | Run ESLint on all packages |

## Adding New Tools

1. Create a new directory under `apps/web/src/tools/YourToolName`
2. Add your tool component as `index.tsx`
3. Register the tool in `apps/web/src/config/tools-registry.ts`

## Tech Stack

- **Package Manager**: pnpm (v10+ with workspaces)
- **Web Framework**: Vite + React + TypeScript
- **Styling**: TailwindCSS v4
- **Library Build Tool**: tsup (ESM/CJS bundling)
- **Parser Generator**: Peggy (PEG.js successor)
- **Testing**: Vitest
- **Icons**: Lucide React

## License

MIT
