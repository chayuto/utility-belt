---
description: Documentation, code style, and development workflow guidelines for this repository
---

# Style Guidelines

## Documentation

- Do not use emojis in documentation, READMEs, or code comments
- Keep documentation professional and concise
- Use markdown formatting appropriately (headers, code blocks, tables)
- Prefer bullet points over numbered lists unless order matters

## Code Style

- Use TypeScript strict mode for all source files
- Follow existing patterns in the codebase
- Include JSDoc comments for public APIs
- Write descriptive test names
- Export public API only from `src/index.ts` in each package

## Commit Messages

- Use conventional commit format when applicable (e.g., `feat:`, `fix:`, `chore:`, `docs:`)
- Keep messages clear and descriptive
- Do not use emojis in commit messages

## Validation Workflow

- Always run `pnpm install` before building, testing, or linting
- Run `pnpm run lint` and `pnpm run build` to verify changes pass CI checks
- Run `pnpm --recursive run test` to verify all tests pass (206 tests across 2 packages)
- For package-scoped work, use `pnpm --filter <package-name> run test` to run targeted tests
