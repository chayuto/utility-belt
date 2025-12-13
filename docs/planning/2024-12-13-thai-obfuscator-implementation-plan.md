# Thai Text Obfuscator - Implementation Plan

**Date:** December 13, 2024  
**Status:** Planning  
**Based on:** [Thai Text Obfuscation Research Plan](../research/Thai%20Text%20Obfuscation%20Research%20Plan.md)

---

## Executive Summary

This document outlines a staged implementation plan for building a production-grade TypeScript library (`@utility-belt/thai-obfuscator`) that transforms Thai text into visually identical but machine-unreadable variants. The library exploits the visual convergence between modern "loopless" Thai fonts and Latin sans-serifs to create text that defeats automated scraping, censorship, and NLP systems while remaining human-readable.

## Core Challenge

Thai is an abugida script with vertical stacking (consonant + vowel + tone marks). Simple character substitution breaks rendering because:
1. Combining marks (vowels/tones) require valid base characters
2. Invalid sequences produce "dotted circles" (◌)
3. Grapheme clusters must be treated atomically

**Solution:** Use `Intl.Segmenter` for grapheme-aware processing, enforce "Latin-only" rule for combined substitutions, and leverage loopless font aesthetics.

## Architecture Overview

```
packages/
└── thai-obfuscator/
    ├── package.json
    ├── tsconfig.json
    ├── tsup.config.ts
    ├── src/
    │   ├── index.ts                    # Public API
    │   ├── core/
    │   │   ├── segmenter.ts            # Grapheme cluster segmentation
    │   │   ├── analyzer.ts             # Cluster composition analysis
    │   │   └── engine.ts               # Main obfuscation engine
    │   ├── maps/
    │   │   ├── consonants.ts           # Thai consonant → Latin mappings
    │   │   ├── vowels.ts               # Thai vowel → Latin mappings
    │   │   ├── tone-marks.ts           # Thai tone → Latin diacritic mappings
    │   │   ├── numerals.ts             # Thai numeral mappings
    │   │   └── index.ts                # Unified map exports
    │   ├── strategies/
    │   │   ├── simple.ts               # 1-to-1 character substitution
    │   │   ├── composite.ts            # Base + mark substitution
    │   │   ├── zero-width.ts           # Invisible character injection
    │   │   └── index.ts                # Strategy exports
    │   ├── utils/
    │   │   ├── unicode.ts              # Unicode utilities
    │   │   ├── random.ts               # Randomization helpers
    │   │   └── validation.ts           # Input validation
    │   ├── types/
    │   │   ├── options.ts              # Configuration types
    │   │   ├── cluster.ts              # Grapheme cluster types
    │   │   └── maps.ts                 # Mapping type definitions
    │   └── accessibility/
    │       └── aria.ts                 # Accessibility helpers
    └── tests/
        ├── unit/
        ├── integration/
        └── fixtures/
```

## Implementation Stages

| Stage | Focus | Duration | Deliverables |
|-------|-------|----------|--------------|
| 1 | Foundation & Segmentation | 2-3 days | Project setup, grapheme segmenter, cluster analyzer |
| 2 | Homoglyph Maps | 2-3 days | Complete consonant/vowel/tone mappings |
| 3 | Obfuscation Strategies | 3-4 days | Simple, composite, zero-width strategies |
| 4 | Engine & Configuration | 2-3 days | Main engine, density control, randomization |
| 5 | Advanced Features | 2-3 days | Deobfuscation hints, accessibility, font recommendations |
| 6 | Public API & Documentation | 2 days | Final API, presets, comprehensive docs |
| 7 | Web UI Integration | 2 days | ThaiModifier tool update, options UI |

**Total Estimated Duration:** 15-21 days (3-4 weeks)

---

## Stage Details

See individual stage documents for detailed specifications:

| Stage | Document | Key Deliverables |
|-------|----------|------------------|
| 1 | [Foundation & Segmentation](./thai-obfuscator/stage-1-foundation.md) | Project setup, `Intl.Segmenter` wrapper, cluster analyzer |
| 2 | [Homoglyph Maps](./thai-obfuscator/stage-2-homoglyph-maps.md) | Consonant/vowel/tone mappings with confidence scores |
| 3 | [Obfuscation Strategies](./thai-obfuscator/stage-3-strategies.md) | Simple, composite, zero-width strategies |
| 4 | [Engine & Configuration](./thai-obfuscator/stage-4-engine.md) | Main engine, presets, seeded randomization |
| 5 | [Advanced Features](./thai-obfuscator/stage-5-advanced.md) | Accessibility, fonts, analysis, deobfuscation hints |
| 6 | [Public API & Documentation](./thai-obfuscator/stage-6-api.md) | Final exports, JSDoc, README |
| 7 | [Web UI Integration](./thai-obfuscator/stage-7-integration.md) | ThaiObfuscator tool component, options UI |

---

## Key Design Decisions

### 1. Grapheme-First Processing

All text processing uses `Intl.Segmenter` to ensure combining marks stay attached to their bases:

```typescript
const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
// "ที่" → single segment, not ['ท', 'ี', '่']
```

### 2. The "Latin-Only" Rule

When obfuscating a cluster with combining marks:
- If base → Latin, then marks → Latin combining diacritics
- Never mix Thai marks on Latin bases (causes dotted circles)

### 3. Font-Aware Confidence Scoring

Each mapping includes a confidence score for loopless fonts:
- **Critical (0.95+):** Nearly identical (ท→n, น→u, อ→o)
- **High (0.8-0.94):** Very similar in sans-serif
- **Medium (0.6-0.79):** Acceptable with right font
- **Low (<0.6):** Noticeable difference, use sparingly

### 4. Randomized Mapping

To defeat reverse-mapping attacks, each character can map to multiple alternatives:
```typescript
'ก': ['n', 'A', 'Ω']  // Randomly selected per instance
```

### 5. Density Control

Configurable obfuscation intensity:
- `1.0` = Maximum obfuscation (all possible substitutions)
- `0.5` = Moderate (50% of characters)
- `0.1` = Subtle noise injection

---

## Public API Preview

```typescript
import { obfuscate, deobfuscateHint, validate } from '@utility-belt/thai-obfuscator';

// Basic usage
const result = obfuscate('ของกิน', { density: 1.0 });
// → "ขoงnิu" (or similar)

// With full options
const result = obfuscate(text, {
  density: 0.8,
  strategies: ['simple', 'composite', 'zeroWidth'],
  toneStrategy: 'latin',      // 'latin' | 'remove' | 'retain'
  fontStyle: 'loopless',      // 'loopless' | 'traditional' | 'any'
  randomSeed: 12345,          // For reproducible output
  preserveSpaces: true,
  preserveNewlines: true,
});

// Accessibility helper
const html = deobfuscateHint('ขoง', 'ของ');
// → '<span aria-label="ของ">ขoง</span>'

// Validation
const isValid = validate(text);
// → { valid: true, thaiRatio: 0.85, estimatedEffectiveness: 0.92 }
```

---

## Testing Strategy

### Unit Tests
- Individual mapping correctness
- Segmenter behavior with complex clusters
- Strategy isolation tests
- Edge cases (empty strings, pure Latin, mixed scripts)

### Visual Regression Tests
- Render obfuscated text in target fonts
- Screenshot comparison for visual similarity
- Cross-browser rendering validation

### Effectiveness Tests
- Run obfuscated text through:
  - Google Translate API
  - Thai word segmentation libraries
  - Common regex patterns
- Measure detection/translation failure rate

### Performance Benchmarks
- Process 100KB Thai text in < 100ms
- Memory usage profiling
- Segmenter performance across browsers

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dotted circle rendering | High | Strict Latin-only rule, pre-render validation |
| Font dependency | Medium | Document recommended fonts, provide CSS helpers |
| Accessibility barriers | High | aria-label helpers, screen reader guidance |
| SEO destruction | Medium | Clear documentation, use-case warnings |
| Reverse-mapping attacks | Low | Randomized mappings, multiple alternatives |
| Browser compatibility | Medium | Intl.Segmenter polyfill for older browsers |

---

## Success Criteria

1. **Visual Fidelity:** Obfuscated text indistinguishable from original in Kanit/Sarabun fonts
2. **Machine Opacity:** 95%+ failure rate for Google Translate on obfuscated text
3. **Performance:** < 100ms for 100KB input
4. **Zero Dotted Circles:** No rendering artifacts in supported fonts
5. **Accessibility:** Working aria-label helper for screen readers
6. **Developer Experience:** Clear API, comprehensive TypeScript types, good docs

---

## Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsup": "^8.0.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    // None - uses native Intl.Segmenter
  }
}
```

**Browser Requirements:**
- Chrome 87+
- Firefox 84+
- Safari 14.1+
- Edge 87+

For older browsers, recommend `@formatjs/intl-segmenter` polyfill.

---

## Next Steps

1. Review and approve this plan
2. Create `packages/thai-obfuscator` directory structure
3. Begin Stage 1: Foundation & Segmentation
4. Set up visual regression testing infrastructure
