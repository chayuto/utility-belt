# Stage 6: Public API & Documentation

**Duration:** 2 days  
**Prerequisites:** Stage 1-5  
**Outputs:** Final public API, TypeScript exports, comprehensive documentation

---

## Objectives

1. Finalize and document the public API
2. Create TypeScript type exports
3. Write comprehensive README documentation
4. Add JSDoc comments to all public functions

---

## 6.1 Public API Design

### src/index.ts

```typescript
/**
 * Thai Text Obfuscator
 * 
 * A library for transforming Thai text into visually identical but
 * machine-unreadable variants using homoglyph substitution.
 * 
 * @packageDocumentation
 */

// Core functionality
export { obfuscate } from './core/engine';
export type { ObfuscationResult, ObfuscationStats } from './core/engine';

// Configuration
export { DEFAULT_OPTIONS } from './types/options';
export type { 
  ObfuscationOptions, 
  ToneStrategy, 
  FontStyle, 
  ObfuscationStrategy as StrategyType 
} from './types/options';

// Presets
export { presets, getPreset } from './presets';
export type { PresetName } from './presets';

// Analysis
export { analyzeText, estimateThreatResistance } from './utils/analysis';
export type { TextAnalysis } from './utils/analysis';

// Accessibility
export { 
  wrapWithAriaLabel, 
  generateScreenReaderText,
  getScreenReaderOnlyCSS 
} from './accessibility/aria';
export type { AriaOptions } from './accessibility/aria';

// Font utilities
export { 
  RECOMMENDED_FONTS,
  generateFontStack,
  generateGoogleFontsUrl,
  generateObfuscatedTextCSS 
} from './utils/fonts';
export type { FontRecommendation } from './utils/fonts';

// Validation
export { validateInput, validateOptions } from './utils/validation';
export type { ValidationResult } from './utils/validation';

// Debug utilities (not for production)
export { generateDiff, formatDiff, attemptDeobfuscation } from './utils/deobfuscate';
export type { ObfuscationDiff } from './utils/deobfuscate';

// Low-level access (advanced users)
export { segmentText } from './core/segmenter';
export { analyzeCluster, categorizeCharacter } from './core/analyzer';
export { getMapping, getBestReplacement, getRandomReplacement } from './maps';
export type { 
  GraphemeCluster, 
  ClusterComposition, 
  CharacterInfo,
  ThaiCharacterCategory 
} from './types/cluster';
export type { CharacterMapping, HomoglyphEntry } from './types/maps';
```


---

## 6.2 API Reference

### Core Functions

#### `obfuscate(text, options?)`

Main obfuscation function.

```typescript
function obfuscate(
  text: string,
  options?: Partial<ObfuscationOptions>
): ObfuscationResult;
```

**Parameters:**
- `text` - Thai text to obfuscate
- `options` - Optional configuration (see ObfuscationOptions)

**Returns:** `ObfuscationResult` containing:
- `output` - Obfuscated text
- `original` - Original input
- `stats` - Processing statistics
- `warnings` - Any warnings generated

**Example:**
```typescript
import { obfuscate } from '@utility-belt/thai-obfuscator';

const result = obfuscate('ของกิน', { density: 0.8 });
console.log(result.output); // "ขoงnิu" (varies)
console.log(result.stats.obfuscationRatio); // 0.8
```

---

#### `analyzeText(text)`

Analyze text for obfuscation suitability.

```typescript
function analyzeText(text: string): TextAnalysis;
```

**Returns:** Analysis including:
- `suitable` - Whether text is good for obfuscation
- `thaiRatio` - Ratio of Thai characters
- `estimatedEffectiveness` - Expected obfuscation quality
- `recommendations` - Suggestions for improvement

**Example:**
```typescript
import { analyzeText } from '@utility-belt/thai-obfuscator';

const analysis = analyzeText('สวัสดี');
if (analysis.suitable) {
  // Proceed with obfuscation
}
```

---

### Configuration

#### `ObfuscationOptions`

```typescript
interface ObfuscationOptions {
  density: number;              // 0.0-1.0, default: 1.0
  strategies: StrategyType[];   // ['simple', 'composite', 'zeroWidth']
  toneStrategy: ToneStrategy;   // 'latin' | 'remove' | 'retain'
  fontStyle: FontStyle;         // 'loopless' | 'traditional' | 'any'
  randomSeed?: number;          // For reproducible output
  preserveSpaces: boolean;      // default: true
  preserveNewlines: boolean;    // default: true
  minConfidence: number;        // 0.0-1.0, default: 0.6
  injectZeroWidth: boolean;     // default: false
  preserveCharacters: string[]; // Characters to skip
}
```

---

#### Presets

```typescript
import { obfuscate, presets } from '@utility-belt/thai-obfuscator';

// Maximum protection
obfuscate(text, presets.maximum);

// Balanced (recommended)
obfuscate(text, presets.balanced);

// Subtle changes
obfuscate(text, presets.subtle);

// Invisible (zero-width only)
obfuscate(text, presets.invisible);

// For traditional fonts
obfuscate(text, presets.traditional);
```

---

### Accessibility

#### `wrapWithAriaLabel(obfuscated, original, options?)`

Wrap obfuscated text with accessibility label.

```typescript
import { wrapWithAriaLabel } from '@utility-belt/thai-obfuscator';

const html = wrapWithAriaLabel('ขoง', 'ของ');
// <span aria-label="ของ">ขoง</span>
```

**Warning:** aria-label exposes original text to sophisticated scrapers.

---

### Font Utilities

#### `generateObfuscatedTextCSS(className?)`

Generate CSS for obfuscated text containers.

```typescript
import { generateObfuscatedTextCSS } from '@utility-belt/thai-obfuscator';

const css = generateObfuscatedTextCSS('protected-text');
// Includes Google Fonts import and font-family declaration
```

---

## 6.3 README Documentation

### README.md Structure

```markdown
# @utility-belt/thai-obfuscator

Transform Thai text into visually identical but machine-unreadable variants.

## Features

- 🔒 Defeats web scrapers and keyword filters
- 👁️ Visually identical to original text
- 🎯 Optimized for modern "loopless" Thai fonts
- ⚡ Fast grapheme-aware processing
- 🎛️ Configurable density and strategies
- ♿ Accessibility helpers included

## Installation

\`\`\`bash
npm install @utility-belt/thai-obfuscator
# or
pnpm add @utility-belt/thai-obfuscator
\`\`\`

## Quick Start

\`\`\`typescript
import { obfuscate } from '@utility-belt/thai-obfuscator';

const result = obfuscate('ของกิน');
console.log(result.output); // Looks like "ของกิน" but isn't
\`\`\`

## How It Works

Thai obfuscation exploits visual similarity between Thai and Latin characters
in modern sans-serif fonts:

| Thai | Latin | Confidence |
|------|-------|------------|
| ท | n | 95% |
| น | u | 95% |
| อ | o | 98% |
| พ | w | 95% |
| ร | s | 95% |

## Configuration

\`\`\`typescript
obfuscate(text, {
  density: 0.8,           // Obfuscate 80% of eligible characters
  toneStrategy: 'latin',  // Convert tone marks to Latin diacritics
  fontStyle: 'loopless',  // Optimize for Kanit, Sarabun, etc.
});
\`\`\`

## Presets

- `maximum` - Full protection, all strategies
- `balanced` - Good protection with readability
- `subtle` - Minimal changes
- `invisible` - Zero-width injection only

## Font Requirements

For best results, use loopless Thai fonts:

\`\`\`css
.obfuscated {
  font-family: 'Kanit', 'Sarabun', sans-serif;
}
\`\`\`

## Accessibility

⚠️ Obfuscated text is problematic for screen readers.

\`\`\`typescript
import { wrapWithAriaLabel } from '@utility-belt/thai-obfuscator';

const html = wrapWithAriaLabel(obfuscated, original);
// <span aria-label="ของ">ขoง</span>
\`\`\`

## Limitations

- **SEO Impact**: Search engines cannot index obfuscated text
- **Copy/Paste**: Copied text will be obfuscated
- **Accessibility**: Screen readers struggle without aria-label
- **OCR**: High-quality OCR may still read the text

## License

MIT
```


---

## 6.4 JSDoc Standards

All public functions must include JSDoc comments:

```typescript
/**
 * Obfuscates Thai text by replacing characters with visually similar
 * Latin equivalents and/or injecting zero-width characters.
 * 
 * @param text - The Thai text to obfuscate
 * @param options - Configuration options for obfuscation
 * @returns Result containing obfuscated text and statistics
 * 
 * @example
 * ```typescript
 * const result = obfuscate('สวัสดี', { density: 0.8 });
 * console.log(result.output);
 * ```
 * 
 * @remarks
 * For best visual results, display obfuscated text using loopless
 * Thai fonts like Kanit or Sarabun.
 * 
 * @see {@link analyzeText} for checking text suitability
 * @see {@link presets} for common configurations
 */
export function obfuscate(
  text: string,
  options?: Partial<ObfuscationOptions>
): ObfuscationResult;
```

---

## 6.5 Test Cases

```typescript
import { describe, it, expect } from 'vitest';
import * as ThaiObfuscator from '../../src/index';

describe('Public API', () => {
  it('exports obfuscate function', () => {
    expect(typeof ThaiObfuscator.obfuscate).toBe('function');
  });
  
  it('exports presets', () => {
    expect(ThaiObfuscator.presets).toBeDefined();
    expect(ThaiObfuscator.presets.maximum).toBeDefined();
    expect(ThaiObfuscator.presets.balanced).toBeDefined();
  });
  
  it('exports analysis functions', () => {
    expect(typeof ThaiObfuscator.analyzeText).toBe('function');
    expect(typeof ThaiObfuscator.estimateThreatResistance).toBe('function');
  });
  
  it('exports accessibility helpers', () => {
    expect(typeof ThaiObfuscator.wrapWithAriaLabel).toBe('function');
    expect(typeof ThaiObfuscator.generateScreenReaderText).toBe('function');
  });
  
  it('exports font utilities', () => {
    expect(ThaiObfuscator.RECOMMENDED_FONTS).toBeDefined();
    expect(typeof ThaiObfuscator.generateFontStack).toBe('function');
  });
  
  it('exports types', () => {
    // TypeScript compilation will verify type exports
    const options: ThaiObfuscator.ObfuscationOptions = {
      density: 1,
      strategies: ['simple'],
      toneStrategy: 'latin',
      fontStyle: 'loopless',
      preserveSpaces: true,
      preserveNewlines: true,
      minConfidence: 0.6,
      injectZeroWidth: false,
      preserveCharacters: [],
    };
    expect(options).toBeDefined();
  });
});

describe('API Usability', () => {
  it('works with minimal configuration', () => {
    const result = ThaiObfuscator.obfuscate('ทดสอบ');
    expect(result.output).toBeDefined();
    expect(result.stats).toBeDefined();
  });
  
  it('works with presets', () => {
    const result = ThaiObfuscator.obfuscate('ทดสอบ', ThaiObfuscator.presets.balanced);
    expect(result.output).toBeDefined();
  });
  
  it('provides useful analysis', () => {
    const analysis = ThaiObfuscator.analyzeText('ทดสอบ');
    expect(analysis.suitable).toBe(true);
    expect(analysis.recommendations).toBeInstanceOf(Array);
  });
});
```

---

## Deliverables Checklist

- [ ] Final `src/index.ts` with all exports
- [ ] JSDoc comments on all public functions
- [ ] TypeScript type exports
- [ ] README.md with:
  - [ ] Installation instructions
  - [ ] Quick start example
  - [ ] Configuration reference
  - [ ] Preset documentation
  - [ ] Font requirements
  - [ ] Accessibility warnings
  - [ ] Limitations section
- [ ] CHANGELOG.md
- [ ] API reference documentation
- [ ] Unit tests for public API surface
- [ ] Example code snippets

---

## Notes

1. **Semantic Versioning:** Follow semver. Breaking changes = major version bump.

2. **Tree Shaking:** Ensure exports are tree-shakeable for bundlers.

3. **Type Safety:** All public functions must have complete TypeScript types.

4. **Documentation:** Keep README concise. Link to detailed docs for advanced topics.
