# Copilot Instructions - Utility Belt Monorepo

## Repository Overview

TypeScript monorepo of developer utilities using pnpm workspaces. Contains shared library packages consumed by a React web dashboard.

## Project Layout

```
/ (root)
  package.json              # Root monorepo scripts (build, lint, dev, format)
  pnpm-workspace.yaml       # Workspace: apps/* and packages/*
  tsconfig.base.json        # Shared TS config (ES2020, strict, DOM, bundler resolution)
  tsconfig.json             # Root project references

  apps/
    web/                    # React 19 + Vite 7 + Tailwind CSS 4 dashboard
      eslint.config.js      # Flat ESLint config (only lint target in monorepo)
      vite.config.ts
      src/
        config/tools-registry.ts  # Tool discovery and routing
        tools/                    # One directory per tool (lazy-loaded)
        layout/                   # Dashboard shell
        pages/                    # Route pages

  packages/
    ruby-hash-parser/       # PEG-based Ruby Hash to JSON parser
      src/grammar/ruby-hash.peggy  # Peggy grammar (source of truth)
      src/parser/generated.js      # Generated parser (committed, regenerated on build)
      tests/unit/                  # 171 Vitest tests
      vitest.config.ts

    thai-obfuscator/        # Thai text obfuscation library
      src/                  # core/, maps/, strategies/, utils/, accessibility/
      tests/unit/           # 35 Vitest tests
      vitest.config.ts

    thai-text-modifier/     # Lightweight Thai text utilities (no tests)
      src/index.ts
```

## Prerequisites

- Node.js 20+
- pnpm 9+ (install with `npm install -g pnpm@9`)

## Build, Test, and Lint Commands

Always run `pnpm install` before any other command.

### Build all packages and the web app

```bash
pnpm install
pnpm run build
```

Build order is handled automatically by pnpm. The `ruby-hash-parser` package runs `build:grammar` (Peggy) before `build:ts` (tsup).

### Run all tests

```bash
pnpm --recursive run test
```

Tests exist in `packages/ruby-hash-parser` and `packages/thai-obfuscator` only. Both use Vitest with `tests/**/*.test.ts` pattern.

### Run tests for a single package

```bash
pnpm --filter @utility-belt/ruby-hash-parser run test
pnpm --filter @utility-belt/thai-obfuscator run test
```

### Lint

```bash
pnpm run lint
```

Only `apps/web` has a lint script (ESLint 9 flat config with TypeScript and React plugins). The root `pnpm run lint` delegates to all workspaces that define a `lint` script.

### Dev server

```bash
pnpm dev
```

Starts the Vite dev server for the web app on `http://localhost:5173`.

## CI Pipeline

The GitHub Actions CI workflow (`.github/workflows/ci.yml`) runs on push/PR to `main`:

1. `pnpm install --frozen-lockfile`
2. `pnpm run lint`
3. `pnpm run build`

Always verify your changes pass lint and build before submitting.

## Adding a New Web Tool

1. Create a new directory at `apps/web/src/tools/YourToolName/index.tsx`
2. Register it in `apps/web/src/config/tools-registry.ts` with a slug, name, description, icon (from Lucide), and lazy-imported component

## Adding a New Library Package

1. Create a directory under `packages/your-package/`
2. Include `package.json` with `"type": "module"`, `tsup.config.ts` for build, and `vitest.config.ts` for tests
3. The workspace config (`pnpm-workspace.yaml`) already includes `packages/*`
4. Export dual ESM/CJS via tsup with `format: ['esm', 'cjs']`, `dts: true`, `sourcemap: true`, target `es2020`

## Coding Conventions

- TypeScript strict mode for all source files
- No emojis in documentation, code comments, or commit messages
- Conventional commit format (e.g., `feat:`, `fix:`, `chore:`)
- JSDoc comments for public API functions
- Descriptive test names
- Prefer bullet points over numbered lists in documentation unless order matters
- Follow existing patterns in the codebase

## Key Technical Details

- All packages use tsup for ESM + CJS dual builds with TypeScript declarations
- The `ruby-hash-parser` has a Peggy grammar at `src/grammar/ruby-hash.peggy` that generates `src/parser/generated.js` -- always run `pnpm run build:grammar` in that package after grammar changes
- The web app uses React Router for routing, Tailwind CSS v4 for styling, and Lucide React for icons
- Workspace dependencies use `"workspace:*"` protocol in package.json
