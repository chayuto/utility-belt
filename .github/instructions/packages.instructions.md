---
applyTo: "packages/**/src/**/*.ts"
---

# Package Development Instructions

- All packages use tsup for building with ESM + CJS dual output
- Export public API from `src/index.ts` only
- Use TypeScript strict mode (configured in tsconfig)
- Include JSDoc comments on all exported functions and types
- Build config is in `tsup.config.ts` at the package root
- Target ES2020 for all package builds
- After making changes, build with `pnpm --filter <package-name> run build` and run tests with `pnpm --filter <package-name> run test`
