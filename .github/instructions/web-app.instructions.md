---
applyTo: "apps/web/src/**/*.tsx,apps/web/src/**/*.ts"
---

# Web App Development Instructions

- Built with React 19, Vite 7, and Tailwind CSS v4
- Use functional components with TypeScript
- Lint with `pnpm --filter @utility-belt/web run lint` (ESLint 9 flat config)
- New tools go in `apps/web/src/tools/<ToolName>/index.tsx` and must be registered in `apps/web/src/config/tools-registry.ts`
- Use lazy imports for tool components in the registry
- Icons come from Lucide React (`lucide-react`)
- Use `clsx` and `tailwind-merge` (via `lib/utils.ts`) for conditional class names
