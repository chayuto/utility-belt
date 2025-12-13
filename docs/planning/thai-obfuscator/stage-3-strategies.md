# Stage 3: Obfuscation Strategies

**Duration:** 3-4 days  
**Prerequisites:** Stage 1 (Foundation), Stage 2 (Homoglyph Maps)  
**Outputs:** Simple, Composite, and Zero-Width obfuscation strategies

---

## Objectives

1. Implement three distinct obfuscation strategies
2. Handle the "Latin-Only Rule" for combining marks
3. Create strategy selection logic based on cluster composition
4. Ensure zero dotted-circle artifacts

---

## 3.1 Strategy Interface

### src/strategies/types.ts

```typescript
import type { GraphemeCluster } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';

/**
 * Result of applying a strategy to a cluster
 */
export interface StrategyResult {
  /** The obfuscated output string */
  output: string;
  
  /** Whether obfuscation was applied */
  wasObfuscated: boolean;
  
  /** Strategy that was used */
  strategy: 'simple' | 'composite' | 'zeroWidth' | 'none';
  
  /** Confidence of the transformation */
  confidence: number;
  
  /** Any warnings generated */
  warnings?: string[];
}

/**
 * Strategy function signature
 */
export type ObfuscationStrategy = (
  cluster: GraphemeCluster,
  options: ObfuscationOptions,
  random: () => number
) => StrategyResult;
```

---

## 3.2 Simple Substitution Strategy

For single-character clusters or spacing characters (leading/following vowels).

### src/strategies/simple.ts

```typescript
import type { GraphemeCluster } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult } from './types';
import { getRandomReplacement } from '../maps';


/**
 * Simple 1-to-1 character substitution
 * 
 * Best for:
 * - Single consonants without marks
 * - Leading vowels (เ, แ, โ, ไ, ใ)
 * - Following vowels (ะ, า)
 * - Numerals
 */
export function simpleStrategy(
  cluster: GraphemeCluster,
  options: ObfuscationOptions,
  random: () => number
): StrategyResult {
  const { composition, segment } = cluster;
  
  // Only works for simple clusters
  if (!composition.isSimple) {
    return {
      output: segment,
      wasObfuscated: false,
      strategy: 'none',
      confidence: 0,
      warnings: ['Simple strategy requires single-character cluster'],
    };
  }
  
  const char = segment;
  const replacement = getRandomReplacement(char, {
    fontStyle: options.fontStyle,
    minConfidence: options.minConfidence,
  }, random);
  
  if (!replacement) {
    return {
      output: segment,
      wasObfuscated: false,
      strategy: 'none',
      confidence: 0,
    };
  }
  
  return {
    output: replacement,
    wasObfuscated: true,
    strategy: 'simple',
    confidence: getMapping(char)?.replacements[0]?.confidence ?? 0,
  };
}
```

---

## 3.3 Composite Substitution Strategy

For clusters with base consonant + combining marks (vowels/tones).

### src/strategies/composite.ts

```typescript
import type { GraphemeCluster, CharacterInfo } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult } from './types';
import { getRandomReplacement, getMapping } from '../maps';

/**
 * Latin combining diacritics for Thai marks
 */
const LATIN_COMBINING_MAP: Record<string, string> = {
  // Above vowels
  '\u0E31': '\u0306', // ั → Combining Breve
  '\u0E34': '\u0302', // ิ → Combining Circumflex
  '\u0E35': '\u0302', // ี → Combining Circumflex
  '\u0E36': '\u0308', // ึ → Combining Diaeresis
  '\u0E37': '\u0308', // ื → Combining Diaeresis
  '\u0E47': '\u0306', // ็ → Combining Breve
  
  // Below vowels
  '\u0E38': '\u0326', // ุ → Combining Comma Below
  '\u0E39': '\u0328', // ู → Combining Ogonek
  
  // Tone marks
  '\u0E48': '\u0300', // ่ → Combining Grave
  '\u0E49': '\u0301', // ้ → Combining Acute
  '\u0E4A': '\u0303', // ๊ → Combining Tilde
  '\u0E4B': '\u0304', // ๋ → Combining Macron
};

/**
 * Composite strategy for base + combining marks
 * 
 * THE LATIN-ONLY RULE:
 * If base → Latin, then ALL marks → Latin combining diacritics
 * Never mix Thai marks on Latin bases (causes dotted circles)
 */
export function compositeStrategy(
  cluster: GraphemeCluster,
  options: ObfuscationOptions,
  random: () => number
): StrategyResult {
  const { composition, segment } = cluster;
  
  // Must have a base to work with
  if (!composition.base) {
    return {
      output: segment,
      wasObfuscated: false,
      strategy: 'none',
      confidence: 0,
      warnings: ['Composite strategy requires base character'],
    };
  }
  
  // Try to replace the base consonant
  const baseReplacement = getRandomReplacement(composition.base.char, {
    fontStyle: options.fontStyle,
    minConfidence: options.minConfidence,
  }, random);
  
  // If base can't be replaced, we can't safely obfuscate
  if (!baseReplacement) {
    return {
      output: segment,
      wasObfuscated: false,
      strategy: 'none',
      confidence: 0,
    };
  }
  
  // Build the obfuscated cluster
  let result = '';
  let totalConfidence = 0;
  let markCount = 0;
  const warnings: string[] = [];
  
  // Handle leading vowel (if present, it comes before base)
  if (composition.leadingVowel) {
    const vowelReplacement = getRandomReplacement(
      composition.leadingVowel.char,
      { fontStyle: options.fontStyle, minConfidence: options.minConfidence },
      random
    );
    result += vowelReplacement ?? composition.leadingVowel.char;
  }
  
  // Add the base replacement
  result += baseReplacement;
  totalConfidence += getMapping(composition.base.char)?.replacements[0]?.confidence ?? 0;
  
  // Handle combining marks based on tone strategy
  const combiningMarks = [
    composition.aboveVowel,
    composition.belowVowel,
    composition.toneMark,
    ...composition.diacritics,
  ].filter((m): m is CharacterInfo => m !== null);
  
  for (const mark of combiningMarks) {
    markCount++;
    
    if (mark.category === 'tone_mark') {
      // Apply tone strategy
      switch (options.toneStrategy) {
        case 'remove':
          // Skip the tone mark entirely
          continue;
          
        case 'latin':
          // Replace with Latin combining diacritic
          const latinMark = LATIN_COMBINING_MAP[mark.char];
          if (latinMark) {
            result += latinMark;
          } else {
            warnings.push(`No Latin equivalent for tone mark ${mark.char}`);
          }
          break;
          
        case 'retain':
          // Keep Thai mark (risky - may cause dotted circle)
          result += mark.char;
          warnings.push('Retaining Thai tone mark on Latin base - rendering risk');
          break;
      }
    } else {
      // Vowel marks - always convert to Latin when base is Latin
      const latinMark = LATIN_COMBINING_MAP[mark.char];
      if (latinMark) {
        result += latinMark;
      } else {
        warnings.push(`No Latin equivalent for mark ${mark.char}`);
        // Skip the mark to avoid dotted circle
      }
    }
  }
  
  // Handle following vowel (comes after base)
  if (composition.followingVowel) {
    const vowelReplacement = getRandomReplacement(
      composition.followingVowel.char,
      { fontStyle: options.fontStyle, minConfidence: options.minConfidence },
      random
    );
    result += vowelReplacement ?? composition.followingVowel.char;
  }
  
  const avgConfidence = markCount > 0 
    ? totalConfidence / (markCount + 1) 
    : totalConfidence;
  
  return {
    output: result,
    wasObfuscated: true,
    strategy: 'composite',
    confidence: avgConfidence,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
```


---

## 3.4 Zero-Width Injection Strategy

Injects invisible characters to break text matching without visual change.

### src/strategies/zero-width.ts

```typescript
import type { GraphemeCluster } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult } from './types';

/**
 * Zero-width characters for injection
 */
const ZERO_WIDTH_CHARS = {
  ZWSP: '\u200B',  // Zero Width Space
  ZWNJ: '\u200C',  // Zero Width Non-Joiner
  ZWJ: '\u200D',   // Zero Width Joiner
  WJ: '\u2060',    // Word Joiner
};

/**
 * Zero-width injection strategy
 * 
 * Injects invisible characters that:
 * - Break Ctrl+F text search
 * - Defeat keyword filtering
 * - Maintain visual appearance
 * 
 * Can be combined with other strategies
 */
export function zeroWidthStrategy(
  cluster: GraphemeCluster,
  options: ObfuscationOptions,
  random: () => number
): StrategyResult {
  const { segment } = cluster;
  
  // Select a zero-width character
  const zwChars = Object.values(ZERO_WIDTH_CHARS);
  const selectedZW = zwChars[Math.floor(random() * zwChars.length)];
  
  // Inject after the cluster
  const output = segment + selectedZW;
  
  return {
    output,
    wasObfuscated: true,
    strategy: 'zeroWidth',
    confidence: 1.0, // Always "works" visually
  };
}

/**
 * Inject zero-width characters between code points within a cluster
 * More aggressive but may affect rendering
 */
export function intraClusterZeroWidth(
  cluster: GraphemeCluster,
  random: () => number
): string {
  const chars = [...cluster.segment];
  if (chars.length <= 1) {
    return cluster.segment;
  }
  
  const zwChars = Object.values(ZERO_WIDTH_CHARS);
  let result = chars[0];
  
  for (let i = 1; i < chars.length; i++) {
    // 50% chance to inject between each character
    if (random() < 0.5) {
      result += zwChars[Math.floor(random() * zwChars.length)];
    }
    result += chars[i];
  }
  
  return result;
}
```

---

## 3.5 Strategy Selector

### src/strategies/index.ts

```typescript
import type { GraphemeCluster } from '../types/cluster';
import type { ObfuscationOptions } from '../types/options';
import type { StrategyResult, ObfuscationStrategy } from './types';
import { simpleStrategy } from './simple';
import { compositeStrategy } from './composite';
import { zeroWidthStrategy } from './zero-width';

/**
 * Strategy registry
 */
const STRATEGIES: Record<string, ObfuscationStrategy> = {
  simple: simpleStrategy,
  composite: compositeStrategy,
  zeroWidth: zeroWidthStrategy,
};

/**
 * Apply the best strategy for a cluster
 */
export function applyStrategy(
  cluster: GraphemeCluster,
  options: ObfuscationOptions,
  random: () => number
): StrategyResult {
  // Check density - should we obfuscate at all?
  if (random() > options.density) {
    return {
      output: cluster.segment,
      wasObfuscated: false,
      strategy: 'none',
      confidence: 0,
    };
  }
  
  // Check if cluster is obfuscatable
  if (!cluster.obfuscatable) {
    return {
      output: cluster.segment,
      wasObfuscated: false,
      strategy: 'none',
      confidence: 0,
    };
  }
  
  // Check preserve list
  if (options.preserveCharacters.includes(cluster.segment)) {
    return {
      output: cluster.segment,
      wasObfuscated: false,
      strategy: 'none',
      confidence: 0,
    };
  }
  
  // Try strategies in order of preference
  for (const strategyName of options.strategies) {
    // Skip if strategy doesn't match cluster type
    if (strategyName === 'simple' && !cluster.composition.isSimple) {
      continue;
    }
    if (strategyName === 'composite' && cluster.composition.isSimple) {
      continue;
    }
    
    const strategy = STRATEGIES[strategyName];
    if (!strategy) continue;
    
    const result = strategy(cluster, options, random);
    
    if (result.wasObfuscated) {
      // Optionally add zero-width injection
      if (options.injectZeroWidth && strategyName !== 'zeroWidth') {
        const zwResult = zeroWidthStrategy(
          { ...cluster, segment: result.output },
          options,
          random
        );
        return {
          ...result,
          output: zwResult.output,
        };
      }
      return result;
    }
  }
  
  // No strategy worked
  return {
    output: cluster.segment,
    wasObfuscated: false,
    strategy: 'none',
    confidence: 0,
  };
}

export { simpleStrategy, compositeStrategy, zeroWidthStrategy };
export type { StrategyResult, ObfuscationStrategy };
```

---

## 3.6 Test Cases

```typescript
import { describe, it, expect } from 'vitest';
import { simpleStrategy, compositeStrategy, zeroWidthStrategy } from '../../src/strategies';
import { segmentText } from '../../src/core/segmenter';
import { DEFAULT_OPTIONS } from '../../src/types/options';

describe('Simple Strategy', () => {
  const mockRandom = () => 0.5;
  
  it('replaces simple consonant', () => {
    const [cluster] = segmentText('ท').clusters;
    const result = simpleStrategy(cluster, DEFAULT_OPTIONS, mockRandom);
    expect(result.wasObfuscated).toBe(true);
    expect(result.output).toBe('n');
  });
  
  it('replaces leading vowel', () => {
    const [cluster] = segmentText('เ').clusters;
    const result = simpleStrategy(cluster, DEFAULT_OPTIONS, mockRandom);
    expect(result.wasObfuscated).toBe(true);
  });
  
  it('skips complex clusters', () => {
    const [cluster] = segmentText('ที่').clusters;
    const result = simpleStrategy(cluster, DEFAULT_OPTIONS, mockRandom);
    expect(result.wasObfuscated).toBe(false);
  });
});

describe('Composite Strategy', () => {
  const mockRandom = () => 0.5;
  
  it('handles consonant + tone mark', () => {
    const [cluster] = segmentText('ก่').clusters;
    const result = compositeStrategy(cluster, DEFAULT_OPTIONS, mockRandom);
    expect(result.wasObfuscated).toBe(true);
    expect(result.strategy).toBe('composite');
  });
  
  it('applies Latin-only rule', () => {
    const [cluster] = segmentText('ที่').clusters;
    const result = compositeStrategy(cluster, DEFAULT_OPTIONS, mockRandom);
    // Should not contain Thai combining marks
    expect(result.output).not.toMatch(/[\u0E48-\u0E4B]/);
  });
  
  it('removes tone marks when strategy is remove', () => {
    const [cluster] = segmentText('ก่').clusters;
    const options = { ...DEFAULT_OPTIONS, toneStrategy: 'remove' as const };
    const result = compositeStrategy(cluster, options, mockRandom);
    // Output should not contain any tone mark
    expect(result.output.length).toBeLessThan(cluster.segment.length);
  });
});

describe('Zero-Width Strategy', () => {
  it('injects invisible character', () => {
    const [cluster] = segmentText('ก').clusters;
    const result = zeroWidthStrategy(cluster, DEFAULT_OPTIONS, () => 0);
    expect(result.output.length).toBeGreaterThan(cluster.segment.length);
    expect(result.output).toContain('\u200B'); // ZWSP
  });
});
```

---

## Deliverables Checklist

- [ ] Strategy type definitions
- [ ] `simpleStrategy()` for single-character clusters
- [ ] `compositeStrategy()` with Latin-only rule enforcement
- [ ] `zeroWidthStrategy()` for invisible injection
- [ ] `applyStrategy()` selector function
- [ ] Latin combining diacritic mapping table
- [ ] Unit tests for each strategy
- [ ] Integration tests for strategy selection
- [ ] Documentation of Latin-only rule

---

## Critical Implementation Notes

1. **Dotted Circle Prevention:** The composite strategy MUST convert all combining marks to Latin equivalents when the base is Latin. Test rendering in multiple browsers.

2. **Order Matters:** In Thai, the visual order is: leading vowel → base → above/below marks → tone → following vowel. Maintain this order in output.

3. **Fallback Behavior:** If a combining mark has no Latin equivalent, skip it rather than risk a dotted circle.

4. **Zero-Width Placement:** ZWSP after clusters is safest. Intra-cluster injection may affect rendering in some fonts.
