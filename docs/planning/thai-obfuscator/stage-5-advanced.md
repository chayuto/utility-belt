# Stage 5: Advanced Features

**Duration:** 2-3 days  
**Prerequisites:** Stage 1-4  
**Outputs:** Accessibility helpers, font recommendations, deobfuscation hints, analysis tools

---

## Objectives

1. Implement accessibility helpers (aria-label generation)
2. Create font recommendation system
3. Build text analysis and effectiveness estimation
4. Add deobfuscation hint generation for debugging

---

## 5.1 Accessibility Helpers

### src/accessibility/aria.ts

```typescript
/**
 * Accessibility utilities for obfuscated text
 * 
 * IMPORTANT: Screen readers will struggle with obfuscated text.
 * These helpers provide the original text via aria-label.
 * 
 * TRADE-OFF: Sophisticated scrapers may read aria-label,
 * defeating the obfuscation purpose. Use judiciously.
 */

export interface AriaOptions {
  /** HTML tag to use */
  tag: 'span' | 'div' | 'p';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Additional attributes */
  attributes?: Record<string, string>;
}

const DEFAULT_ARIA_OPTIONS: AriaOptions = {
  tag: 'span',
};

/**
 * Wrap obfuscated text with aria-label containing original
 */
export function wrapWithAriaLabel(
  obfuscated: string,
  original: string,
  options: Partial<AriaOptions> = {}
): string {
  const opts = { ...DEFAULT_ARIA_OPTIONS, ...options };
  
  const attrs = [
    `aria-label="${escapeHtml(original)}"`,
    opts.className ? `class="${opts.className}"` : '',
    ...Object.entries(opts.attributes || {}).map(
      ([key, value]) => `${key}="${escapeHtml(value)}"`
    ),
  ].filter(Boolean).join(' ');
  
  return `<${opts.tag} ${attrs}>${escapeHtml(obfuscated)}</${opts.tag}>`;
}

/**
 * Generate hidden original text for screen readers
 * Uses visually-hidden CSS pattern
 */
export function generateScreenReaderText(
  obfuscated: string,
  original: string
): string {
  return `
<span aria-hidden="true">${escapeHtml(obfuscated)}</span>
<span class="sr-only">${escapeHtml(original)}</span>
  `.trim();
}

/**
 * Generate CSS for screen-reader-only class
 */
export function getScreenReaderOnlyCSS(): string {
  return `
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
  `.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```


---

## 5.2 Font Recommendations

### src/utils/fonts.ts

```typescript
/**
 * Font recommendation system for optimal obfuscation
 */

export interface FontRecommendation {
  /** Font family name */
  family: string;
  
  /** Font style category */
  style: 'loopless' | 'traditional';
  
  /** Effectiveness score (0-1) */
  effectiveness: number;
  
  /** Google Fonts URL (if available) */
  googleFontsUrl?: string;
  
  /** Notes about the font */
  notes: string;
}

/**
 * Recommended fonts for Thai obfuscation
 * Ordered by effectiveness for loopless style
 */
export const RECOMMENDED_FONTS: FontRecommendation[] = [
  {
    family: 'Kanit',
    style: 'loopless',
    effectiveness: 0.95,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Kanit',
    notes: 'Excellent Latin-Thai convergence. Best for obfuscation.',
  },
  {
    family: 'Sarabun',
    style: 'loopless',
    effectiveness: 0.92,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Sarabun',
    notes: 'Clean sans-serif with good homoglyph support.',
  },
  {
    family: 'Prompt',
    style: 'loopless',
    effectiveness: 0.90,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Prompt',
    notes: 'Modern geometric sans-serif.',
  },
  {
    family: 'Sukhumvit Set',
    style: 'loopless',
    effectiveness: 0.88,
    notes: 'Apple system font for Thai. macOS/iOS only.',
  },
  {
    family: 'Noto Sans Thai',
    style: 'loopless',
    effectiveness: 0.85,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Thai',
    notes: 'Google Noto family. Wide Unicode support.',
  },
  {
    family: 'IBM Plex Sans Thai',
    style: 'loopless',
    effectiveness: 0.85,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai',
    notes: 'IBM corporate font with Thai support.',
  },
  {
    family: 'Angsana New',
    style: 'traditional',
    effectiveness: 0.50,
    notes: 'Traditional looped font. Lower obfuscation effectiveness.',
  },
  {
    family: 'Cordia New',
    style: 'traditional',
    effectiveness: 0.55,
    notes: 'Traditional font. Windows system font.',
  },
];

/**
 * Generate CSS font-family declaration
 */
export function generateFontStack(style: 'loopless' | 'traditional' = 'loopless'): string {
  const fonts = RECOMMENDED_FONTS
    .filter(f => f.style === style)
    .sort((a, b) => b.effectiveness - a.effectiveness)
    .map(f => `'${f.family}'`);
  
  return `font-family: ${fonts.join(', ')}, sans-serif;`;
}

/**
 * Generate Google Fonts import URL
 */
export function generateGoogleFontsUrl(
  families: string[] = ['Kanit', 'Sarabun']
): string {
  const params = families
    .map(f => `family=${encodeURIComponent(f)}`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/**
 * Generate complete CSS for obfuscated text container
 */
export function generateObfuscatedTextCSS(className: string = 'obfuscated-text'): string {
  return `
@import url('${generateGoogleFontsUrl()}');

.${className} {
  ${generateFontStack('loopless')}
  /* Prevent text selection to deter copy-paste */
  user-select: none;
  -webkit-user-select: none;
}

/* Allow selection on hover for usability */
.${className}:hover {
  user-select: text;
  -webkit-user-select: text;
}
  `.trim();
}
```

---

## 5.3 Effectiveness Analysis

### src/utils/analysis.ts

```typescript
import { segmentText } from '../core/segmenter';
import { getMapping } from '../maps';

/**
 * Analysis result for input text
 */
export interface TextAnalysis {
  /** Whether the text is suitable for obfuscation */
  suitable: boolean;
  
  /** Ratio of Thai characters */
  thaiRatio: number;
  
  /** Estimated obfuscation effectiveness (0-1) */
  estimatedEffectiveness: number;
  
  /** Number of high-confidence mappable characters */
  highConfidenceCount: number;
  
  /** Number of characters that cannot be mapped */
  unmappableCount: number;
  
  /** Recommendations for improvement */
  recommendations: string[];
  
  /** Character breakdown */
  breakdown: {
    consonants: number;
    vowels: number;
    toneMarks: number;
    numerals: number;
    other: number;
  };
}

/**
 * Analyze text for obfuscation suitability
 */
export function analyzeText(text: string): TextAnalysis {
  const segmentation = segmentText(text);
  const recommendations: string[] = [];
  
  let highConfidenceCount = 0;
  let unmappableCount = 0;
  let totalConfidence = 0;
  let mappableCount = 0;
  
  const breakdown = {
    consonants: 0,
    vowels: 0,
    toneMarks: 0,
    numerals: 0,
    other: 0,
  };
  
  for (const cluster of segmentation.clusters) {
    const { composition } = cluster;
    
    // Count character types
    if (composition.base) {
      if (composition.base.category === 'consonant') breakdown.consonants++;
      else if (composition.base.category === 'numeral') breakdown.numerals++;
    }
    if (composition.leadingVowel || composition.followingVowel || 
        composition.aboveVowel || composition.belowVowel) {
      breakdown.vowels++;
    }
    if (composition.toneMark) breakdown.toneMarks++;
    if (!composition.isPureThai) breakdown.other++;
    
    // Check mappability
    if (composition.base) {
      const mapping = getMapping(composition.base.char);
      if (mapping && mapping.replacements.length > 0) {
        const bestConfidence = mapping.replacements[0].confidence;
        totalConfidence += bestConfidence;
        mappableCount++;
        
        if (bestConfidence >= 0.9) {
          highConfidenceCount++;
        }
      } else {
        unmappableCount++;
      }
    }
  }
  
  const thaiRatio = segmentation.stats.thaiRatio;
  const estimatedEffectiveness = mappableCount > 0 
    ? totalConfidence / mappableCount 
    : 0;
  
  // Generate recommendations
  if (thaiRatio < 0.5) {
    recommendations.push('Text has low Thai content. Obfuscation may be less effective.');
  }
  
  if (unmappableCount > mappableCount * 0.3) {
    recommendations.push('Many characters cannot be mapped. Consider using zero-width strategy.');
  }
  
  if (highConfidenceCount < mappableCount * 0.5) {
    recommendations.push('Few high-confidence mappings available. Use loopless fonts for best results.');
  }
  
  if (breakdown.toneMarks > breakdown.consonants * 0.5) {
    recommendations.push('High tone mark density. Consider "latin" tone strategy.');
  }
  
  return {
    suitable: thaiRatio > 0.3 && estimatedEffectiveness > 0.5,
    thaiRatio,
    estimatedEffectiveness,
    highConfidenceCount,
    unmappableCount,
    recommendations,
    breakdown,
  };
}

/**
 * Estimate effectiveness against specific threats
 */
export function estimateThreatResistance(text: string): Record<string, number> {
  const analysis = analyzeText(text);
  
  return {
    /** Resistance to keyword search (Ctrl+F) */
    keywordSearch: analysis.estimatedEffectiveness * 0.95,
    
    /** Resistance to regex pattern matching */
    regexMatching: analysis.estimatedEffectiveness * 0.90,
    
    /** Resistance to machine translation */
    machineTranslation: analysis.estimatedEffectiveness * 0.85,
    
    /** Resistance to OCR */
    ocr: analysis.estimatedEffectiveness * 0.60,
    
    /** Resistance to NLP tokenization */
    nlpTokenization: analysis.estimatedEffectiveness * 0.80,
  };
}
```


---

## 5.4 Deobfuscation Hints

### src/utils/deobfuscate.ts

```typescript
/**
 * Deobfuscation utilities for debugging and testing
 * 
 * NOTE: These are NOT meant for production use.
 * They help developers verify obfuscation is working correctly.
 */

import { HOMOGLYPH_MAP } from '../maps';

/**
 * Build reverse mapping (Latin → Thai)
 */
function buildReverseMap(): Map<string, string[]> {
  const reverseMap = new Map<string, string[]>();
  
  for (const [thai, mapping] of HOMOGLYPH_MAP) {
    for (const replacement of mapping.replacements) {
      const existing = reverseMap.get(replacement.replacement) || [];
      existing.push(thai);
      reverseMap.set(replacement.replacement, existing);
    }
  }
  
  return reverseMap;
}

const REVERSE_MAP = buildReverseMap();

/**
 * Attempt to reverse obfuscation (best effort)
 * 
 * WARNING: This is lossy and ambiguous.
 * Multiple Thai characters may map to the same Latin character.
 */
export function attemptDeobfuscation(obfuscated: string): string[] {
  // Remove zero-width characters first
  const cleaned = obfuscated.replace(/[\u200B-\u200D\u2060]/g, '');
  
  // This is a simplified approach - real deobfuscation would need
  // context-aware disambiguation
  const possibilities: string[][] = [];
  
  for (const char of cleaned) {
    const thaiOptions = REVERSE_MAP.get(char);
    if (thaiOptions && thaiOptions.length > 0) {
      possibilities.push(thaiOptions);
    } else {
      possibilities.push([char]);
    }
  }
  
  // Generate first possibility (most likely based on mapping order)
  const firstGuess = possibilities.map(opts => opts[0]).join('');
  
  return [firstGuess];
}

/**
 * Generate a diff showing what was changed
 */
export interface ObfuscationDiff {
  original: string;
  obfuscated: string;
  changes: Array<{
    position: number;
    original: string;
    replacement: string;
    type: 'substitution' | 'injection' | 'removal';
  }>;
}

/**
 * Compare original and obfuscated text to show changes
 */
export function generateDiff(original: string, obfuscated: string): ObfuscationDiff {
  const changes: ObfuscationDiff['changes'] = [];
  
  // Simple character-by-character comparison
  // Note: This doesn't handle length changes well
  const maxLen = Math.max(original.length, obfuscated.length);
  
  let origIdx = 0;
  let obfIdx = 0;
  
  while (origIdx < original.length || obfIdx < obfuscated.length) {
    const origChar = original[origIdx];
    const obfChar = obfuscated[obfIdx];
    
    // Check for zero-width injection
    if (obfChar && /[\u200B-\u200D\u2060]/.test(obfChar)) {
      changes.push({
        position: obfIdx,
        original: '',
        replacement: obfChar,
        type: 'injection',
      });
      obfIdx++;
      continue;
    }
    
    if (origChar !== obfChar) {
      changes.push({
        position: origIdx,
        original: origChar || '',
        replacement: obfChar || '',
        type: origChar && obfChar ? 'substitution' : 
              origChar ? 'removal' : 'injection',
      });
    }
    
    origIdx++;
    obfIdx++;
  }
  
  return { original, obfuscated, changes };
}

/**
 * Format diff for display
 */
export function formatDiff(diff: ObfuscationDiff): string {
  const lines = [
    `Original:    "${diff.original}"`,
    `Obfuscated:  "${diff.obfuscated}"`,
    `Changes (${diff.changes.length}):`,
  ];
  
  for (const change of diff.changes) {
    const typeIcon = {
      substitution: '↔',
      injection: '+',
      removal: '-',
    }[change.type];
    
    lines.push(
      `  ${typeIcon} [${change.position}] "${change.original}" → "${change.replacement}"`
    );
  }
  
  return lines.join('\n');
}
```

---

## 5.5 Test Cases

```typescript
import { describe, it, expect } from 'vitest';
import { wrapWithAriaLabel, generateScreenReaderText } from '../../src/accessibility/aria';
import { analyzeText, estimateThreatResistance } from '../../src/utils/analysis';
import { generateDiff, formatDiff } from '../../src/utils/deobfuscate';
import { generateFontStack, RECOMMENDED_FONTS } from '../../src/utils/fonts';

describe('Accessibility', () => {
  it('wraps text with aria-label', () => {
    const result = wrapWithAriaLabel('ขoง', 'ของ');
    expect(result).toContain('aria-label="ของ"');
    expect(result).toContain('ขoง');
  });
  
  it('generates screen reader text', () => {
    const result = generateScreenReaderText('ขoง', 'ของ');
    expect(result).toContain('aria-hidden="true"');
    expect(result).toContain('sr-only');
  });
});

describe('Text Analysis', () => {
  it('analyzes Thai text', () => {
    const result = analyzeText('ทดสอบ');
    expect(result.thaiRatio).toBe(1);
    expect(result.suitable).toBe(true);
  });
  
  it('detects low Thai content', () => {
    const result = analyzeText('Hello World ก');
    expect(result.thaiRatio).toBeLessThan(0.5);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
  
  it('estimates threat resistance', () => {
    const result = estimateThreatResistance('ทดสอบ');
    expect(result.keywordSearch).toBeGreaterThan(0);
    expect(result.ocr).toBeLessThan(result.keywordSearch);
  });
});

describe('Font Recommendations', () => {
  it('generates font stack', () => {
    const stack = generateFontStack('loopless');
    expect(stack).toContain('Kanit');
    expect(stack).toContain('font-family');
  });
  
  it('has effectiveness scores', () => {
    for (const font of RECOMMENDED_FONTS) {
      expect(font.effectiveness).toBeGreaterThan(0);
      expect(font.effectiveness).toBeLessThanOrEqual(1);
    }
  });
});

describe('Deobfuscation', () => {
  it('generates diff', () => {
    const diff = generateDiff('ของ', 'ขoง');
    expect(diff.changes.length).toBeGreaterThan(0);
  });
  
  it('formats diff for display', () => {
    const diff = generateDiff('ของ', 'ขoง');
    const formatted = formatDiff(diff);
    expect(formatted).toContain('Original');
    expect(formatted).toContain('Obfuscated');
  });
});
```

---

## Deliverables Checklist

- [ ] `wrapWithAriaLabel()` function
- [ ] `generateScreenReaderText()` function
- [ ] Screen-reader-only CSS generator
- [ ] Font recommendation data structure
- [ ] `generateFontStack()` function
- [ ] `generateGoogleFontsUrl()` function
- [ ] `analyzeText()` function
- [ ] `estimateThreatResistance()` function
- [ ] `attemptDeobfuscation()` function (debug only)
- [ ] `generateDiff()` and `formatDiff()` functions
- [ ] Unit tests for all utilities
- [ ] Documentation for accessibility trade-offs

---

## Notes

1. **Accessibility Trade-off:** Using aria-label exposes original text to scrapers that read accessibility attributes. Document this clearly.

2. **Font Loading:** Google Fonts URLs should use `display=swap` for better performance.

3. **Deobfuscation Limitations:** Reverse mapping is inherently ambiguous. Multiple Thai characters map to the same Latin character.

4. **Threat Resistance:** OCR resistance is lower because visual appearance is preserved. This is by design.
