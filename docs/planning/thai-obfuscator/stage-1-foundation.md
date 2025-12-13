# Stage 1: Foundation & Segmentation

**Duration:** 2-3 days  
**Prerequisites:** None  
**Outputs:** Project structure, grapheme segmenter, cluster analyzer

---

## Objectives

1. Initialize package with proper TypeScript/build configuration
2. Implement grapheme-aware text segmentation
3. Build cluster composition analyzer
4. Establish type system foundation

---

## 1.1 Project Setup

### Directory Structure

```
packages/thai-obfuscator/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src/
│   ├── index.ts
│   ├── core/
│   │   ├── segmenter.ts
│   │   └── analyzer.ts
│   └── types/
│       ├── cluster.ts
│       └── options.ts
└── tests/
    └── unit/
        ├── segmenter.test.ts
        └── analyzer.test.ts
```

### package.json

```json
{
  "name": "@utility-belt/thai-obfuscator",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "~5.9.3",
    "vitest": "^1.0.0"
  },
  "files": ["dist"],
  "keywords": [
    "thai",
    "obfuscation",
    "homoglyph",
    "unicode",
    "text-processing",
    "anti-scraping"
  ]
}
```

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  target: 'es2020',
});
```

---

## 1.2 Core Type Definitions

### src/types/cluster.ts

```typescript
/**
 * Unicode categories for Thai characters
 */
export type ThaiCharacterCategory =
  | 'consonant'           // ก-ฮ (U+0E01-U+0E2E)
  | 'vowel_leading'       // เ แ โ ไ ใ (preposed vowels)
  | 'vowel_following'     // ะ า ำ (postposed vowels)
  | 'vowel_above'         // ิ ี ึ ื (superscript vowels)
  | 'vowel_below'         // ุ ู (subscript vowels)
  | 'tone_mark'           // ่ ้ ๊ ๋ (tone marks)
  | 'diacritic'           // ์ ็ ๆ ฯ (other diacritics)
  | 'numeral'             // ๐-๙ (Thai digits)
  | 'punctuation'         // Thai punctuation
  | 'unknown';            // Non-Thai or unrecognized

/**
 * Represents a single grapheme cluster from Thai text
 */
export interface GraphemeCluster {
  /** The original string segment */
  segment: string;
  
  /** Starting index in original text */
  index: number;
  
  /** Decomposed code points */
  codePoints: number[];
  
  /** Analyzed composition */
  composition: ClusterComposition;
  
  /** Whether this cluster is obfuscatable */
  obfuscatable: boolean;
  
  /** Recommended obfuscation strategy */
  recommendedStrategy: 'simple' | 'composite' | 'zeroWidth' | 'skip';
}

/**
 * Detailed breakdown of a grapheme cluster's components
 */
export interface ClusterComposition {
  /** Base consonant (if present) */
  base: CharacterInfo | null;
  
  /** Leading vowel (if present, e.g., เ แ โ) */
  leadingVowel: CharacterInfo | null;
  
  /** Following vowel (if present, e.g., ะ า) */
  followingVowel: CharacterInfo | null;
  
  /** Above vowel (if present, e.g., ิ ี) */
  aboveVowel: CharacterInfo | null;
  
  /** Below vowel (if present, e.g., ุ ู) */
  belowVowel: CharacterInfo | null;
  
  /** Tone mark (if present) */
  toneMark: CharacterInfo | null;
  
  /** Other diacritics */
  diacritics: CharacterInfo[];
  
  /** Total number of combining marks */
  combiningMarkCount: number;
  
  /** Whether cluster contains only Thai characters */
  isPureThai: boolean;
  
  /** Whether cluster is a simple single character */
  isSimple: boolean;
}

/**
 * Information about a single character
 */
export interface CharacterInfo {
  /** The character itself */
  char: string;
  
  /** Unicode code point */
  codePoint: number;
  
  /** Character category */
  category: ThaiCharacterCategory;
  
  /** Unicode name (for debugging) */
  unicodeName?: string;
}

/**
 * Result of segmenting Thai text
 */
export interface SegmentationResult {
  /** Array of grapheme clusters */
  clusters: GraphemeCluster[];
  
  /** Original input text */
  originalText: string;
  
  /** Statistics about the text */
  stats: TextStats;
}

/**
 * Statistics about analyzed text
 */
export interface TextStats {
  /** Total grapheme clusters */
  totalClusters: number;
  
  /** Clusters that can be obfuscated */
  obfuscatableClusters: number;
  
  /** Ratio of Thai content */
  thaiRatio: number;
  
  /** Number of simple (single-char) clusters */
  simpleClusters: number;
  
  /** Number of composite (multi-char) clusters */
  compositeClusters: number;
  
  /** Number of clusters with tone marks */
  clustersWithTones: number;
}
```

### src/types/options.ts

```typescript
/**
 * Strategy for handling tone marks during obfuscation
 */
export type ToneStrategy = 
  | 'latin'   // Replace with Latin combining diacritics
  | 'remove'  // Remove tone marks entirely
  | 'retain'; // Keep original Thai tone marks (risky)

/**
 * Target font style for optimization
 */
export type FontStyle = 
  | 'loopless'     // Modern sans-serif (Kanit, Sarabun)
  | 'traditional'  // Traditional looped fonts
  | 'any';         // No font-specific optimization

/**
 * Available obfuscation strategies
 */
export type ObfuscationStrategy = 
  | 'simple'      // 1-to-1 character replacement
  | 'composite'   // Base + combining mark replacement
  | 'zeroWidth';  // Zero-width character injection

/**
 * Main configuration options for obfuscation
 */
export interface ObfuscationOptions {
  /**
   * Probability of obfuscating each eligible character (0.0 - 1.0)
   * @default 1.0
   */
  density: number;
  
  /**
   * Which strategies to use (in order of preference)
   * @default ['simple', 'composite', 'zeroWidth']
   */
  strategies: ObfuscationStrategy[];
  
  /**
   * How to handle tone marks
   * @default 'latin'
   */
  toneStrategy: ToneStrategy;
  
  /**
   * Target font style for mapping optimization
   * @default 'loopless'
   */
  fontStyle: FontStyle;
  
  /**
   * Seed for reproducible random selection
   * @default undefined (truly random)
   */
  randomSeed?: number;
  
  /**
   * Preserve space characters without modification
   * @default true
   */
  preserveSpaces: boolean;
  
  /**
   * Preserve newline characters without modification
   * @default true
   */
  preserveNewlines: boolean;
  
  /**
   * Minimum confidence threshold for mappings (0.0 - 1.0)
   * @default 0.6
   */
  minConfidence: number;
  
  /**
   * Enable zero-width character injection between clusters
   * @default false
   */
  injectZeroWidth: boolean;
  
  /**
   * Characters to never obfuscate
   * @default []
   */
  preserveCharacters: string[];
}

/**
 * Default options
 */
export const DEFAULT_OPTIONS: ObfuscationOptions = {
  density: 1.0,
  strategies: ['simple', 'composite', 'zeroWidth'],
  toneStrategy: 'latin',
  fontStyle: 'loopless',
  preserveSpaces: true,
  preserveNewlines: true,
  minConfidence: 0.6,
  injectZeroWidth: false,
  preserveCharacters: [],
};
```

---

## 1.3 Grapheme Segmenter

### src/core/segmenter.ts

```typescript
import type { GraphemeCluster, SegmentationResult, TextStats } from '../types/cluster';
import { analyzeCluster } from './analyzer';

/**
 * Segments Thai text into grapheme clusters using Intl.Segmenter
 * 
 * This is critical for Thai because combining marks (vowels, tones)
 * must stay attached to their base consonants.
 */
export function segmentText(text: string): SegmentationResult {
  // Use Thai locale for proper grapheme boundary detection
  const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
  const segments = segmenter.segment(text);
  
  const clusters: GraphemeCluster[] = [];
  
  for (const { segment, index } of segments) {
    const codePoints = [...segment].map(char => char.codePointAt(0)!);
    const composition = analyzeCluster(segment, codePoints);
    
    const cluster: GraphemeCluster = {
      segment,
      index,
      codePoints,
      composition,
      obfuscatable: determineObfuscatable(composition),
      recommendedStrategy: determineStrategy(composition),
    };
    
    clusters.push(cluster);
  }
  
  const stats = calculateStats(clusters);
  
  return {
    clusters,
    originalText: text,
    stats,
  };
}

/**
 * Determines if a cluster can be obfuscated
 */
function determineObfuscatable(composition: ClusterComposition): boolean {
  // Must have at least some Thai content
  if (!composition.isPureThai && !composition.base) {
    return false;
  }
  
  // Skip if it's just whitespace or punctuation
  if (!composition.base && !composition.leadingVowel) {
    return false;
  }
  
  return true;
}

/**
 * Determines the best obfuscation strategy for a cluster
 */
function determineStrategy(composition: ClusterComposition): GraphemeCluster['recommendedStrategy'] {
  // Simple single characters → simple substitution
  if (composition.isSimple) {
    return 'simple';
  }
  
  // Has combining marks → composite strategy
  if (composition.combiningMarkCount > 0) {
    return 'composite';
  }
  
  // Leading vowels are spacing characters → simple
  if (composition.leadingVowel && !composition.base) {
    return 'simple';
  }
  
  // Default to composite for complex clusters
  return 'composite';
}

/**
 * Calculates statistics about the segmented text
 */
function calculateStats(clusters: GraphemeCluster[]): TextStats {
  let obfuscatableClusters = 0;
  let simpleClusters = 0;
  let compositeClusters = 0;
  let clustersWithTones = 0;
  let thaiCharCount = 0;
  let totalCharCount = 0;
  
  for (const cluster of clusters) {
    totalCharCount += cluster.segment.length;
    
    if (cluster.obfuscatable) {
      obfuscatableClusters++;
    }
    
    if (cluster.composition.isSimple) {
      simpleClusters++;
    } else {
      compositeClusters++;
    }
    
    if (cluster.composition.toneMark) {
      clustersWithTones++;
    }
    
    if (cluster.composition.isPureThai) {
      thaiCharCount += cluster.segment.length;
    }
  }
  
  return {
    totalClusters: clusters.length,
    obfuscatableClusters,
    thaiRatio: totalCharCount > 0 ? thaiCharCount / totalCharCount : 0,
    simpleClusters,
    compositeClusters,
    clustersWithTones,
  };
}

/**
 * Re-export for convenience
 */
export { analyzeCluster } from './analyzer';
```

---

## 1.4 Cluster Analyzer

### src/core/analyzer.ts

```typescript
import type { 
  ClusterComposition, 
  CharacterInfo, 
  ThaiCharacterCategory 
} from '../types/cluster';

/**
 * Thai Unicode ranges
 */
const THAI_RANGES = {
  consonants: { start: 0x0E01, end: 0x0E2E },      // ก-ฮ
  vowelsLeading: [0x0E40, 0x0E41, 0x0E42, 0x0E43, 0x0E44], // เ แ โ ไ ใ
  vowelsFollowing: [0x0E30, 0x0E32, 0x0E33],       // ะ า ำ
  vowelsAbove: [0x0E31, 0x0E34, 0x0E35, 0x0E36, 0x0E37, 0x0E47], // ั ิ ี ึ ื ็
  vowelsBelow: [0x0E38, 0x0E39],                   // ุ ู
  toneMarks: [0x0E48, 0x0E49, 0x0E4A, 0x0E4B],     // ่ ้ ๊ ๋
  diacritics: [0x0E3A, 0x0E4C, 0x0E4D, 0x0E4E],    // ฺ ์ ํ ๎
  numerals: { start: 0x0E50, end: 0x0E59 },        // ๐-๙
  punctuation: [0x0E2F, 0x0E46, 0x0E4F, 0x0E5A, 0x0E5B], // ฯ ๆ ๏ ๚ ๛
};

/**
 * Categorizes a Thai character by its Unicode code point
 */
export function categorizeCharacter(codePoint: number): ThaiCharacterCategory {
  // Consonants
  if (codePoint >= THAI_RANGES.consonants.start && 
      codePoint <= THAI_RANGES.consonants.end) {
    return 'consonant';
  }
  
  // Leading vowels
  if (THAI_RANGES.vowelsLeading.includes(codePoint)) {
    return 'vowel_leading';
  }
  
  // Following vowels
  if (THAI_RANGES.vowelsFollowing.includes(codePoint)) {
    return 'vowel_following';
  }
  
  // Above vowels
  if (THAI_RANGES.vowelsAbove.includes(codePoint)) {
    return 'vowel_above';
  }
  
  // Below vowels
  if (THAI_RANGES.vowelsBelow.includes(codePoint)) {
    return 'vowel_below';
  }
  
  // Tone marks
  if (THAI_RANGES.toneMarks.includes(codePoint)) {
    return 'tone_mark';
  }
  
  // Other diacritics
  if (THAI_RANGES.diacritics.includes(codePoint)) {
    return 'diacritic';
  }
  
  // Numerals
  if (codePoint >= THAI_RANGES.numerals.start && 
      codePoint <= THAI_RANGES.numerals.end) {
    return 'numeral';
  }
  
  // Punctuation
  if (THAI_RANGES.punctuation.includes(codePoint)) {
    return 'punctuation';
  }
  
  return 'unknown';
}

/**
 * Checks if a code point is within Thai Unicode block
 */
export function isThaiCodePoint(codePoint: number): boolean {
  return codePoint >= 0x0E00 && codePoint <= 0x0E7F;
}

/**
 * Creates CharacterInfo for a single character
 */
function createCharInfo(char: string, codePoint: number): CharacterInfo {
  return {
    char,
    codePoint,
    category: categorizeCharacter(codePoint),
  };
}

/**
 * Analyzes a grapheme cluster and breaks it into components
 */
export function analyzeCluster(
  segment: string, 
  codePoints: number[]
): ClusterComposition {
  const composition: ClusterComposition = {
    base: null,
    leadingVowel: null,
    followingVowel: null,
    aboveVowel: null,
    belowVowel: null,
    toneMark: null,
    diacritics: [],
    combiningMarkCount: 0,
    isPureThai: true,
    isSimple: codePoints.length === 1,
  };
  
  const chars = [...segment];
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const codePoint = codePoints[i];
    const category = categorizeCharacter(codePoint);
    const charInfo = createCharInfo(char, codePoint);
    
    // Check if non-Thai
    if (!isThaiCodePoint(codePoint)) {
      composition.isPureThai = false;
    }
    
    switch (category) {
      case 'consonant':
        // First consonant becomes base
        if (!composition.base) {
          composition.base = charInfo;
        }
        break;
        
      case 'vowel_leading':
        composition.leadingVowel = charInfo;
        break;
        
      case 'vowel_following':
        composition.followingVowel = charInfo;
        break;
        
      case 'vowel_above':
        composition.aboveVowel = charInfo;
        composition.combiningMarkCount++;
        break;
        
      case 'vowel_below':
        composition.belowVowel = charInfo;
        composition.combiningMarkCount++;
        break;
        
      case 'tone_mark':
        composition.toneMark = charInfo;
        composition.combiningMarkCount++;
        break;
        
      case 'diacritic':
        composition.diacritics.push(charInfo);
        composition.combiningMarkCount++;
        break;
        
      case 'numeral':
        // Treat numerals as base if no consonant
        if (!composition.base) {
          composition.base = charInfo;
        }
        break;
        
      default:
        // Unknown characters don't affect structure
        break;
    }
  }
  
  return composition;
}

/**
 * Exports Thai ranges for use in other modules
 */
export { THAI_RANGES };
```

---

## 1.5 Test Cases

### tests/unit/segmenter.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { segmentText } from '../../src/core/segmenter';

describe('segmentText', () => {
  it('segments simple Thai text', () => {
    const result = segmentText('กขค');
    expect(result.clusters).toHaveLength(3);
    expect(result.clusters[0].segment).toBe('ก');
    expect(result.clusters[1].segment).toBe('ข');
    expect(result.clusters[2].segment).toBe('ค');
  });
  
  it('keeps consonant + tone mark together', () => {
    const result = segmentText('ก่');
    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0].segment).toBe('ก่');
    expect(result.clusters[0].composition.toneMark).not.toBeNull();
  });
  
  it('handles complex cluster with vowel and tone', () => {
    const result = segmentText('ที่');
    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0].segment).toBe('ที่');
    expect(result.clusters[0].composition.base?.char).toBe('ท');
    expect(result.clusters[0].composition.aboveVowel?.char).toBe('ี');
    expect(result.clusters[0].composition.toneMark?.char).toBe('่');
  });
  
  it('handles leading vowels', () => {
    const result = segmentText('เก');
    // Leading vowel + consonant may be 1 or 2 clusters depending on segmenter
    expect(result.clusters.length).toBeGreaterThanOrEqual(1);
  });
  
  it('handles mixed Thai and Latin', () => {
    const result = segmentText('ก A ข');
    expect(result.stats.thaiRatio).toBeLessThan(1);
  });
  
  it('calculates correct statistics', () => {
    const result = segmentText('ก่ข้ค');
    expect(result.stats.totalClusters).toBe(3);
    expect(result.stats.clustersWithTones).toBe(2);
  });
});
```

### tests/unit/analyzer.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { analyzeCluster, categorizeCharacter, isThaiCodePoint } from '../../src/core/analyzer';

describe('categorizeCharacter', () => {
  it('identifies consonants', () => {
    expect(categorizeCharacter(0x0E01)).toBe('consonant'); // ก
    expect(categorizeCharacter(0x0E2E)).toBe('consonant'); // ฮ
  });
  
  it('identifies tone marks', () => {
    expect(categorizeCharacter(0x0E48)).toBe('tone_mark'); // ่
    expect(categorizeCharacter(0x0E49)).toBe('tone_mark'); // ้
  });
  
  it('identifies vowels by position', () => {
    expect(categorizeCharacter(0x0E40)).toBe('vowel_leading');  // เ
    expect(categorizeCharacter(0x0E32)).toBe('vowel_following'); // า
    expect(categorizeCharacter(0x0E34)).toBe('vowel_above');     // ิ
    expect(categorizeCharacter(0x0E38)).toBe('vowel_below');     // ุ
  });
  
  it('identifies numerals', () => {
    expect(categorizeCharacter(0x0E50)).toBe('numeral'); // ๐
    expect(categorizeCharacter(0x0E59)).toBe('numeral'); // ๙
  });
  
  it('returns unknown for non-Thai', () => {
    expect(categorizeCharacter(0x0041)).toBe('unknown'); // A
  });
});

describe('isThaiCodePoint', () => {
  it('returns true for Thai characters', () => {
    expect(isThaiCodePoint(0x0E01)).toBe(true);
    expect(isThaiCodePoint(0x0E7F)).toBe(true);
  });
  
  it('returns false for non-Thai characters', () => {
    expect(isThaiCodePoint(0x0041)).toBe(false); // A
    expect(isThaiCodePoint(0x0030)).toBe(false); // 0
  });
});

describe('analyzeCluster', () => {
  it('analyzes simple consonant', () => {
    const result = analyzeCluster('ก', [0x0E01]);
    expect(result.base?.char).toBe('ก');
    expect(result.isSimple).toBe(true);
    expect(result.combiningMarkCount).toBe(0);
  });
  
  it('analyzes consonant with tone', () => {
    const result = analyzeCluster('ก่', [0x0E01, 0x0E48]);
    expect(result.base?.char).toBe('ก');
    expect(result.toneMark?.char).toBe('่');
    expect(result.isSimple).toBe(false);
    expect(result.combiningMarkCount).toBe(1);
  });
  
  it('analyzes complex cluster', () => {
    const result = analyzeCluster('ที่', [0x0E17, 0x0E35, 0x0E48]);
    expect(result.base?.char).toBe('ท');
    expect(result.aboveVowel?.char).toBe('ี');
    expect(result.toneMark?.char).toBe('่');
    expect(result.combiningMarkCount).toBe(2);
  });
  
  it('detects non-pure Thai', () => {
    const result = analyzeCluster('A', [0x0041]);
    expect(result.isPureThai).toBe(false);
  });
});
```

---

## Deliverables Checklist

- [ ] Package initialized with pnpm workspace
- [ ] TypeScript and tsup configured
- [ ] Vitest test framework set up
- [ ] Type definitions for clusters and options
- [ ] `segmentText()` function using Intl.Segmenter
- [ ] `analyzeCluster()` function for composition breakdown
- [ ] `categorizeCharacter()` for Thai character classification
- [ ] Unit tests for segmenter (>90% coverage)
- [ ] Unit tests for analyzer (>90% coverage)
- [ ] Basic index.ts exporting core functions

---

## Notes for Implementation

1. **Intl.Segmenter Behavior:** The Thai locale segmenter may behave differently across browsers. Test in Chrome, Firefox, and Safari.

2. **Leading Vowel Handling:** Some segmenters treat leading vowel + consonant as one cluster, others as two. The analyzer should handle both cases.

3. **Edge Cases to Consider:**
   - Empty strings
   - Strings with only combining marks (invalid but possible)
   - Mixed scripts (Thai + Latin + emoji)
   - Thai numerals
   - Rare characters (ฃ, ฅ - obsolete consonants)

4. **Performance:** Segmentation should be O(n) where n is string length. Avoid creating unnecessary intermediate objects.
