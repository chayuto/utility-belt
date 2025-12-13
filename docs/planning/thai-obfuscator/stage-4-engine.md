# Stage 4: Engine & Configuration

**Duration:** 2-3 days  
**Prerequisites:** Stage 1-3  
**Outputs:** Main obfuscation engine, configuration system, randomization

---

## Objectives

1. Build the main obfuscation engine that orchestrates all components
2. Implement seeded randomization for reproducible output
3. Create configuration presets for common use cases
4. Add validation and error handling

---

## 4.1 Random Number Generator

### src/utils/random.ts

```typescript
/**
 * Seeded pseudo-random number generator (Mulberry32)
 * Provides reproducible randomness for testing and consistency
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed;
  
  return function(): number {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Create a random function - seeded or Math.random
 */
export function createRandom(seed?: number): () => number {
  if (seed !== undefined) {
    return createSeededRandom(seed);
  }
  return Math.random;
}
```

---

## 4.2 Input Validation

### src/utils/validation.ts

```typescript
import type { ObfuscationOptions } from '../types/options';
import { DEFAULT_OPTIONS } from '../types/options';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate input text
 */
export function validateInput(text: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (typeof text !== 'string') {
    errors.push('Input must be a string');
    return { valid: false, errors, warnings };
  }
  
  if (text.length === 0) {
    warnings.push('Input is empty');
  }
  
  if (text.length > 1_000_000) {
    warnings.push('Input exceeds 1MB - performance may be affected');
  }
  
  // Check for Thai content
  const thaiPattern = /[\u0E00-\u0E7F]/;
  if (!thaiPattern.test(text)) {
    warnings.push('Input contains no Thai characters');
  }
  
  return { valid: errors.length === 0, errors, warnings };
}


/**
 * Validate and normalize options
 */
export function validateOptions(
  options: Partial<ObfuscationOptions>
): { options: ObfuscationOptions; warnings: string[] } {
  const warnings: string[] = [];
  const merged = { ...DEFAULT_OPTIONS, ...options };
  
  // Validate density
  if (merged.density < 0 || merged.density > 1) {
    warnings.push('Density clamped to 0-1 range');
    merged.density = Math.max(0, Math.min(1, merged.density));
  }
  
  // Validate minConfidence
  if (merged.minConfidence < 0 || merged.minConfidence > 1) {
    warnings.push('minConfidence clamped to 0-1 range');
    merged.minConfidence = Math.max(0, Math.min(1, merged.minConfidence));
  }
  
  // Validate strategies
  const validStrategies = ['simple', 'composite', 'zeroWidth'];
  merged.strategies = merged.strategies.filter(s => {
    if (!validStrategies.includes(s)) {
      warnings.push(`Unknown strategy "${s}" ignored`);
      return false;
    }
    return true;
  });
  
  if (merged.strategies.length === 0) {
    warnings.push('No valid strategies - using defaults');
    merged.strategies = DEFAULT_OPTIONS.strategies;
  }
  
  return { options: merged, warnings };
}
```

---

## 4.3 Main Engine

### src/core/engine.ts

```typescript
import type { ObfuscationOptions } from '../types/options';
import type { SegmentationResult, GraphemeCluster } from '../types/cluster';
import type { StrategyResult } from '../strategies/types';
import { DEFAULT_OPTIONS } from '../types/options';
import { segmentText } from './segmenter';
import { applyStrategy } from '../strategies';
import { createRandom } from '../utils/random';
import { validateInput, validateOptions } from '../utils/validation';

/**
 * Result of obfuscation operation
 */
export interface ObfuscationResult {
  /** The obfuscated text */
  output: string;
  
  /** Original input text */
  original: string;
  
  /** Statistics about the operation */
  stats: ObfuscationStats;
  
  /** Any warnings generated */
  warnings: string[];
}

/**
 * Statistics about the obfuscation
 */
export interface ObfuscationStats {
  /** Total grapheme clusters processed */
  totalClusters: number;
  
  /** Clusters that were obfuscated */
  obfuscatedClusters: number;
  
  /** Obfuscation ratio */
  obfuscationRatio: number;
  
  /** Average confidence of transformations */
  averageConfidence: number;
  
  /** Breakdown by strategy */
  strategyBreakdown: Record<string, number>;
  
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Main obfuscation engine
 */
export function obfuscate(
  text: string,
  options: Partial<ObfuscationOptions> = {}
): ObfuscationResult {
  const startTime = performance.now();
  const warnings: string[] = [];
  
  // Validate input
  const inputValidation = validateInput(text);
  warnings.push(...inputValidation.warnings);
  
  if (!inputValidation.valid) {
    throw new Error(`Invalid input: ${inputValidation.errors.join(', ')}`);
  }
  
  // Validate and merge options
  const { options: mergedOptions, warnings: optionWarnings } = validateOptions(options);
  warnings.push(...optionWarnings);
  
  // Create random function
  const random = createRandom(mergedOptions.randomSeed);
  
  // Segment the text
  const segmentation = segmentText(text);
  
  // Process each cluster
  const results: StrategyResult[] = [];
  let outputParts: string[] = [];
  
  for (const cluster of segmentation.clusters) {
    // Handle whitespace preservation
    if (mergedOptions.preserveSpaces && cluster.segment === ' ') {
      outputParts.push(' ');
      results.push({
        output: ' ',
        wasObfuscated: false,
        strategy: 'none',
        confidence: 0,
      });
      continue;
    }
    
    if (mergedOptions.preserveNewlines && /[\n\r]/.test(cluster.segment)) {
      outputParts.push(cluster.segment);
      results.push({
        output: cluster.segment,
        wasObfuscated: false,
        strategy: 'none',
        confidence: 0,
      });
      continue;
    }
    
    // Apply obfuscation strategy
    const result = applyStrategy(cluster, mergedOptions, random);
    results.push(result);
    outputParts.push(result.output);
    
    if (result.warnings) {
      warnings.push(...result.warnings);
    }
  }
  
  // Calculate statistics
  const obfuscatedCount = results.filter(r => r.wasObfuscated).length;
  const totalConfidence = results
    .filter(r => r.wasObfuscated)
    .reduce((sum, r) => sum + r.confidence, 0);
  
  const strategyBreakdown: Record<string, number> = {};
  for (const result of results) {
    strategyBreakdown[result.strategy] = (strategyBreakdown[result.strategy] || 0) + 1;
  }
  
  const processingTimeMs = performance.now() - startTime;
  
  return {
    output: outputParts.join(''),
    original: text,
    stats: {
      totalClusters: segmentation.clusters.length,
      obfuscatedClusters: obfuscatedCount,
      obfuscationRatio: segmentation.clusters.length > 0 
        ? obfuscatedCount / segmentation.clusters.length 
        : 0,
      averageConfidence: obfuscatedCount > 0 
        ? totalConfidence / obfuscatedCount 
        : 0,
      strategyBreakdown,
      processingTimeMs,
    },
    warnings,
  };
}
```


---

## 4.4 Configuration Presets

### src/presets.ts

```typescript
import type { ObfuscationOptions } from './types/options';

/**
 * Preset configurations for common use cases
 */
export const presets = {
  /**
   * Maximum obfuscation - all possible substitutions
   * Use for: Anti-scraping, content protection
   */
  maximum: {
    density: 1.0,
    strategies: ['simple', 'composite', 'zeroWidth'],
    toneStrategy: 'latin',
    fontStyle: 'loopless',
    minConfidence: 0.5,
    injectZeroWidth: true,
  } as Partial<ObfuscationOptions>,
  
  /**
   * Balanced - good obfuscation with readability
   * Use for: General anti-bot protection
   */
  balanced: {
    density: 0.7,
    strategies: ['simple', 'composite'],
    toneStrategy: 'latin',
    fontStyle: 'loopless',
    minConfidence: 0.7,
    injectZeroWidth: false,
  } as Partial<ObfuscationOptions>,
  
  /**
   * Subtle - minimal visual impact
   * Use for: Light protection, A/B testing
   */
  subtle: {
    density: 0.3,
    strategies: ['simple'],
    toneStrategy: 'retain',
    fontStyle: 'loopless',
    minConfidence: 0.9,
    injectZeroWidth: false,
  } as Partial<ObfuscationOptions>,
  
  /**
   * Zero-width only - invisible changes
   * Use for: Breaking text search without visual change
   */
  invisible: {
    density: 1.0,
    strategies: ['zeroWidth'],
    toneStrategy: 'retain',
    fontStyle: 'any',
    minConfidence: 0,
    injectZeroWidth: true,
  } as Partial<ObfuscationOptions>,
  
  /**
   * Traditional fonts - optimized for looped Thai fonts
   * Use for: When using traditional Thai typography
   */
  traditional: {
    density: 0.5,
    strategies: ['simple', 'composite'],
    toneStrategy: 'latin',
    fontStyle: 'traditional',
    minConfidence: 0.8,
    injectZeroWidth: false,
  } as Partial<ObfuscationOptions>,
} as const;

export type PresetName = keyof typeof presets;

/**
 * Get a preset by name
 */
export function getPreset(name: PresetName): Partial<ObfuscationOptions> {
  return presets[name];
}
```

---

## 4.5 Test Cases

```typescript
import { describe, it, expect } from 'vitest';
import { obfuscate } from '../../src/core/engine';
import { presets } from '../../src/presets';
import { createSeededRandom } from '../../src/utils/random';

describe('Obfuscation Engine', () => {
  it('obfuscates Thai text', () => {
    const result = obfuscate('ของกิน', { randomSeed: 12345 });
    expect(result.output).not.toBe('ของกิน');
    expect(result.stats.obfuscatedClusters).toBeGreaterThan(0);
  });
  
  it('produces reproducible output with seed', () => {
    const result1 = obfuscate('ทดสอบ', { randomSeed: 42 });
    const result2 = obfuscate('ทดสอบ', { randomSeed: 42 });
    expect(result1.output).toBe(result2.output);
  });
  
  it('respects density setting', () => {
    const full = obfuscate('กขคงจ', { density: 1.0, randomSeed: 1 });
    const half = obfuscate('กขคงจ', { density: 0.5, randomSeed: 1 });
    expect(full.stats.obfuscatedClusters).toBeGreaterThan(
      half.stats.obfuscatedClusters
    );
  });
  
  it('preserves spaces by default', () => {
    const result = obfuscate('ก ข ค');
    expect(result.output).toContain(' ');
  });
  
  it('preserves newlines by default', () => {
    const result = obfuscate('ก\nข');
    expect(result.output).toContain('\n');
  });
  
  it('returns statistics', () => {
    const result = obfuscate('ทดสอบ');
    expect(result.stats.totalClusters).toBe(5);
    expect(result.stats.processingTimeMs).toBeGreaterThanOrEqual(0);
  });
});

describe('Presets', () => {
  it('maximum preset obfuscates everything', () => {
    const result = obfuscate('ทน', presets.maximum);
    expect(result.stats.obfuscationRatio).toBeGreaterThan(0.8);
  });
  
  it('subtle preset has lower obfuscation', () => {
    const result = obfuscate('ทดสอบ', { ...presets.subtle, randomSeed: 1 });
    expect(result.stats.obfuscationRatio).toBeLessThan(0.5);
  });
  
  it('invisible preset uses only zero-width', () => {
    const result = obfuscate('ทดสอบ', presets.invisible);
    expect(result.stats.strategyBreakdown['zeroWidth']).toBeGreaterThan(0);
    expect(result.stats.strategyBreakdown['simple'] || 0).toBe(0);
  });
});

describe('Seeded Random', () => {
  it('produces deterministic sequence', () => {
    const random1 = createSeededRandom(42);
    const random2 = createSeededRandom(42);
    
    for (let i = 0; i < 10; i++) {
      expect(random1()).toBe(random2());
    }
  });
  
  it('different seeds produce different sequences', () => {
    const random1 = createSeededRandom(1);
    const random2 = createSeededRandom(2);
    expect(random1()).not.toBe(random2());
  });
});
```

---

## Deliverables Checklist

- [ ] Seeded PRNG implementation (`createSeededRandom`)
- [ ] Input validation utilities
- [ ] Options validation and normalization
- [ ] Main `obfuscate()` function
- [ ] `ObfuscationResult` with statistics
- [ ] Configuration presets (maximum, balanced, subtle, invisible, traditional)
- [ ] Unit tests for engine
- [ ] Unit tests for presets
- [ ] Unit tests for randomization
- [ ] Performance benchmarks

---

## Performance Targets

| Input Size | Target Time |
|------------|-------------|
| 1 KB | < 10ms |
| 10 KB | < 50ms |
| 100 KB | < 100ms |
| 1 MB | < 1000ms |

---

## Notes

1. **Performance:** Use `performance.now()` for timing. Consider lazy evaluation for large inputs.

2. **Memory:** Avoid creating intermediate strings. Use array join at the end.

3. **Error Handling:** Throw on invalid input, warn on suboptimal options.

4. **Reproducibility:** Seeded random is critical for testing and debugging.
