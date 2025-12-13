# Utility Belt - Developer Toolkit Monorepo

A high-performance monorepo for developer utilities, built with TypeScript, pnpm workspaces, React, and Vite.

## 📁 Project Structure

```text
/ (Root)
├── package.json            # Root package with monorepo scripts
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── tsconfig.base.json      # Shared TypeScript configuration
│
├── /apps
│   └── /web                # Main Dashboard (Vite + React + TailwindCSS)
│       ├── package.json    # Web app dependencies
│       ├── vite.config.ts  # Vite configuration
│       └── /src
│           ├── /layout     # Sidebar, Header components
│           └── /tools      # Individual tool components
│               ├── /RubyToJSON       # Ruby to JSON converter
│               ├── /ThaiModifier     # Thai text modifier (uses shared library)
│               └── /StringCaseConverter  # String case converter
│
└── /packages
    └── /thai-text-modifier # Shared Library (npm-ready)
        ├── package.json    # Package config with ESM/CJS exports
        ├── tsup.config.ts  # Bundle configuration
        └── /src
            └── index.ts    # Exports Thai text utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 9+

### Installation

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm@9

# Install dependencies
pnpm install
```

### Development

```bash
# Start the dev server
pnpm dev

# Build all packages and apps
pnpm build

# Lint all packages and apps
pnpm lint

# Format code
pnpm format
```

## 📦 Workspaces

### Apps

- **@utility-belt/web**: Main web dashboard built with Vite, React, and TailwindCSS

### Packages

- **@my-toolkit/thai-text-modifier**: Shared library for Thai text manipulation
  - Exports ESM and CJS formats
  - Includes TypeScript definitions
  - Ready for npm publishing

## 🛠️ Adding New Tools

1. Create a new directory under `apps/web/src/tools/YourToolName`
2. Add your tool component as `index.tsx`
3. Register the tool in `apps/web/src/config/tools-registry.ts`

Example:
```typescript
{
  slug: "your-tool",
  name: "Your Tool Name",
  description: "Tool description",
  icon: "IconName", // Lucide icon name
  component: lazy(() => import("../tools/YourToolName")),
}
```

## 🔧 Tech Stack

- **Package Manager**: pnpm (v9+ with workspaces)
- **Web Framework**: Vite + React + TypeScript
- **Styling**: TailwindCSS v4
- **Library Build Tool**: tsup (ESM/CJS bundling)
- **Icons**: Lucide React
- **Router**: React Router DOM

## 📝 Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server for web app |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Run ESLint on all packages |
| `pnpm format` | Format code with Prettier |

## 🏗️ Building for Production

```bash
# Build everything
pnpm build

# The web app will be in apps/web/dist
# The library will be in packages/thai-text-modifier/dist
```

## 📄 License

MIT

