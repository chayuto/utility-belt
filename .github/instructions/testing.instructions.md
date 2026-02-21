---
applyTo: "packages/**/tests/**/*.test.ts"
---

# Testing Instructions

- Use Vitest (imported globally via `globals: true` in vitest config)
- Place tests in `tests/unit/` within the package directory
- Use `describe` and `it` blocks with descriptive names
- Test files must match the `tests/**/*.test.ts` pattern
- Run a single package's tests with `pnpm --filter <package-name> run test`
- Verify tests pass before committing: `pnpm --recursive run test`
