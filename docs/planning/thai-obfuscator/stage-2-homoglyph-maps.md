# Stage 2: Homoglyph Maps

**Duration:** 2-3 days  
**Prerequisites:** Stage 1 (Foundation)  
**Outputs:** Complete mapping tables for consonants, vowels, tone marks, numerals

---

## Objectives

1. Implement comprehensive Thai → Latin/Symbol homoglyph mappings
2. Add confidence scoring for font-style optimization
3. Support multiple alternatives per character for randomization
4. Create mapping lookup utilities

---

## 2.1 Mapping Type Definitions

### src/types/maps.ts

```typescript
/**
 * Confidence level for visual similarity in loopless fonts
 */
export type ConfidenceLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * A single homoglyph mapping entry
 */
export interface HomoglyphEntry {
  /** The replacement character(s) */
  replacement: string;
  
  /** Visual similarity confidence (0.0 - 1.0) */
  confidence: number;
  
  /** Confidence category */
  level: ConfidenceLevel;
  
  /** Best font style for this mapping */
  bestFontStyle: 'loopless' | 'traditional' | 'any';
  
  /** Notes about this mapping */
  notes?: string;
}

/**
 * Complete mapping for a Thai character
 */
export interface CharacterMapping {
  /** Original Thai character */
  thai: string;
  
  /** Unicode code point */
  codePoint: number;
  
  /** Character name */
  name: string;
  
  /** Available replacements (ordered by confidence) */
  replacements: HomoglyphEntry[];
  
  /** Whether this is a combining character */
  isCombining: boolean;
}


/**
 * Complete homoglyph map structure
 */
export type HomoglyphMap = Map<string, CharacterMapping>;
```

---

## 2.2 Consonant Mappings

### src/maps/consonants.ts

Based on research analysis, prioritizing "Critical" and "High" confidence mappings for loopless fonts:

| Thai | Name | Code | Primary | Confidence | Alternatives |
|------|------|------|---------|------------|--------------|
| ก | Ko Kai | U+0E01 | `n` | 0.70 | `A`, `Ω` |
| ข | Kho Khai | U+0E02 | `v` | 0.85 | `u`, `V` |
| ฃ | Kho Khuat | U+0E03 | `v` | 0.80 | (obsolete) |
| ค | Kho Khwai | U+0E04 | `a` | 0.85 | `P` (reversed) |
| ฅ | Kho Khon | U+0E05 | `a` | 0.80 | (obsolete) |
| ฆ | Kho Rakhang | U+0E06 | - | 0.40 | (skip) |
| ง | Ngo Ngu | U+0E07 | `J` | 0.85 | `j`, `I` |
| จ | Cho Chan | U+0E08 | `c` | 0.85 | `0`, `C` |
| ฉ | Cho Ching | U+0E09 | - | 0.40 | (skip) |
| ช | Cho Chang | U+0E0A | `d` | 0.55 | `&` |
| ซ | So So | U+0E0B | `n` | 0.70 | `u` |
| ฌ | Cho Choe | U+0E0C | - | 0.35 | (skip) |
| ญ | Yo Ying | U+0E0D | - | 0.40 | (skip) |
| ฎ | Do Chada | U+0E0E | `a` | 0.65 | `d` |
| ฏ | To Patak | U+0E0F | `m` | 0.60 | |
| ฐ | Tho Than | U+0E10 | `5` | 0.65 | `S` |
| ฑ | Tho Montho | U+0E11 | `b` | 0.60 | |
| ฒ | Tho Phuthao | U+0E12 | - | 0.35 | (skip) |
| ณ | No Nen | U+0E13 | - | 0.40 | (skip) |
| ด | Do Dek | U+0E14 | `a` | 0.85 | `o` |
| ต | To Tao | U+0E15 | `m` | 0.65 | `๓` |
| ถ | Tho Thung | U+0E16 | `n` | 0.70 | |
| **ท** | **Tho Thahan** | U+0E17 | **`n`** | **0.95** | `m` |
| ธ | Tho Thong | U+0E18 | `b` | 0.70 | `5` |
| **น** | **No Nu** | U+0E19 | **`u`** | **0.95** | `v` |
| บ | Bo Baimai | U+0E1A | `U` | 0.85 | `u` |
| ป | Po Pla | U+0E1B | `U` | 0.75 | `y` |
| ผ | Pho Phung | U+0E1C | - | 0.40 | (skip) |
| ฝ | Fo Fa | U+0E1D | - | 0.40 | (skip) |
| **พ** | **Pho Phan** | U+0E1E | **`w`** | **0.95** | `W` |
| ฟ | Fo Fan | U+0E1F | `w` | 0.80 | `W` |
| ภ | Pho Sampao | U+0E20 | - | 0.40 | (skip) |
| ม | Mo Ma | U+0E21 | `H` | 0.70 | `N`, `M` |
| ย | Yo Yak | U+0E22 | `u` | 0.70 | `y` |
| **ร** | **Ro Rua** | U+0E23 | **`s`** | **0.95** | `S`, `5` |
| ล | Lo Ling | U+0E25 | `a` | 0.75 | `@` |
| ว | Wo Waen | U+0E27 | `c` | 0.80 | `3` |
| ศ | So Sala | U+0E28 | - | 0.40 | (skip) |
| ษ | So Rusi | U+0E29 | - | 0.40 | (skip) |
| ส | So Sua | U+0E2A | `a` | 0.70 | `d` |
| ห | Ho Hip | U+0E2B | `H` | 0.80 | `K`, `h` |
| ฬ | Lo Chula | U+0E2C | - | 0.40 | (skip) |
| **อ** | **O Ang** | U+0E2D | **`o`** | **0.98** | `O`, `0` |
| ฮ | Ho Nokhuk | U+0E2E | `e` | 0.55 | `C` |

**Critical Mappings (0.95+):** ท→n, น→u, พ→w, ร→s, อ→o

These are nearly pixel-perfect in loopless fonts like Kanit.


---

## 2.3 Vowel Mappings

### src/maps/vowels.ts

#### Leading Vowels (Spacing Characters)

| Thai | Name | Code | Primary | Confidence | Notes |
|------|------|------|---------|------------|-------|
| เ | Sara E | U+0E40 | `b` | 0.80 | Also: `6`, `l`, `\|` |
| แ | Sara Ae | U+0E41 | `ll` | 0.85 | Double L very effective |
| โ | Sara O | U+0E42 | `l` | 0.70 | Also: `L`, `\|` |
| ไ | Sara Ai Maimalai | U+0E44 | `l` | 0.80 | Also: `T`, `7` |
| ใ | Sara Ai Maimuan | U+0E43 | `j` | 0.75 | Also: `q` |

#### Following Vowels (Spacing Characters)

| Thai | Name | Code | Primary | Confidence | Notes |
|------|------|------|---------|------------|-------|
| ะ | Sara A | U+0E30 | `:` | 0.70 | Colon breaks search |
| า | Sara Aa | U+0E32 | `1` | 0.75 | Also: `7`, `)`, `]` |
| ำ | Sara Am | U+0E33 | `1ำ` | 0.50 | Complex, often skip |

#### Above Vowels (Combining Characters - DANGER ZONE)

| Thai | Name | Code | Latin Combining | Notes |
|------|------|------|-----------------|-------|
| ั | Mai Han-Akat | U+0E31 | `̆` (U+0306 Breve) | |
| ิ | Sara I | U+0E34 | `̂` (U+0302 Circumflex) | |
| ี | Sara Ii | U+0E35 | `̂` (U+0302) | |
| ึ | Sara Ue | U+0E36 | `̈` (U+0308 Diaeresis) | |
| ื | Sara Uee | U+0E37 | `̈` (U+0308) | |
| ็ | Maitaikhu | U+0E47 | `̆` (U+0306 Breve) | |

#### Below Vowels (Combining Characters)

| Thai | Name | Code | Latin Combining | Notes |
|------|------|------|-----------------|-------|
| ุ | Sara U | U+0E38 | `̦` (U+0326 Comma Below) | |
| ู | Sara Uu | U+0E39 | `̨` (U+0328 Ogonek) | |

**Critical Rule:** Above/below vowels MUST only be replaced with Latin combining marks when the base consonant is ALSO replaced with a Latin character.

---

## 2.4 Tone Mark Mappings

### src/maps/tone-marks.ts

| Thai | Name | Code | Latin Combining | Visual Match | Notes |
|------|------|------|-----------------|--------------|-------|
| ่ | Mai Ek | U+0E48 | `̀` (U+0300 Grave) | `'`, `1` | |
| ้ | Mai Tho | U+0E49 | `́` (U+0301 Acute) | `^`, `2` | |
| ๊ | Mai Tri | U+0E4A | `̃` (U+0303 Tilde) | `~`, `3` | |
| ๋ | Mai Chattawa | U+0E4B | `̄` (U+0304 Macron) | `+`, `4` | |

**Strategy Options:**
- `'latin'`: Replace with Latin combining diacritics
- `'remove'`: Delete tone marks entirely (highest obfuscation, readability risk)
- `'retain'`: Keep Thai marks (rendering risk on Latin bases)

---

## 2.5 Numeral Mappings

### src/maps/numerals.ts

| Thai | Arabic | Code | Confidence |
|------|--------|------|------------|
| ๐ | 0 | U+0E50 | 0.95 |
| ๑ | 1 | U+0E51 | 0.90 |
| ๒ | 2 | U+0E52 | 0.85 |
| ๓ | 3 | U+0E53 | 0.85 |
| ๔ | 4 | U+0E54 | 0.80 |
| ๕ | 5 | U+0E55 | 0.85 |
| ๖ | 6 | U+0E56 | 0.85 |
| ๗ | 7 | U+0E57 | 0.80 |
| ๘ | 8 | U+0E58 | 0.85 |
| ๙ | 9 | U+0E59 | 0.90 |

Thai numerals are highly effective for obfuscation as they're visually similar to Arabic numerals but have different code points.


---

## 2.6 Implementation Structure

### src/maps/index.ts

```typescript
import type { CharacterMapping, HomoglyphMap } from '../types/maps';
import { CONSONANT_MAPPINGS } from './consonants';
import { VOWEL_MAPPINGS } from './vowels';
import { TONE_MARK_MAPPINGS } from './tone-marks';
import { NUMERAL_MAPPINGS } from './numerals';

/**
 * Unified homoglyph map combining all character types
 */
export const HOMOGLYPH_MAP: HomoglyphMap = new Map([
  ...CONSONANT_MAPPINGS,
  ...VOWEL_MAPPINGS,
  ...TONE_MARK_MAPPINGS,
  ...NUMERAL_MAPPINGS,
]);

/**
 * Get mapping for a Thai character
 */
export function getMapping(char: string): CharacterMapping | undefined {
  return HOMOGLYPH_MAP.get(char);
}

/**
 * Get best replacement for a character given options
 */
export function getBestReplacement(
  char: string,
  options: {
    fontStyle: 'loopless' | 'traditional' | 'any';
    minConfidence: number;
  }
): string | null {
  const mapping = HOMOGLYPH_MAP.get(char);
  if (!mapping) return null;
  
  // Filter by confidence and font style
  const suitable = mapping.replacements.filter(r => {
    if (r.confidence < options.minConfidence) return false;
    if (options.fontStyle !== 'any' && 
        r.bestFontStyle !== 'any' && 
        r.bestFontStyle !== options.fontStyle) {
      return false;
    }
    return true;
  });
  
  if (suitable.length === 0) return null;
  
  // Return highest confidence match
  return suitable[0].replacement;
}

/**
 * Get random replacement from available options
 */
export function getRandomReplacement(
  char: string,
  options: {
    fontStyle: 'loopless' | 'traditional' | 'any';
    minConfidence: number;
  },
  random: () => number = Math.random
): string | null {
  const mapping = HOMOGLYPH_MAP.get(char);
  if (!mapping) return null;
  
  const suitable = mapping.replacements.filter(r => {
    if (r.confidence < options.minConfidence) return false;
    if (options.fontStyle !== 'any' && 
        r.bestFontStyle !== 'any' && 
        r.bestFontStyle !== options.fontStyle) {
      return false;
    }
    return true;
  });
  
  if (suitable.length === 0) return null;
  
  // Random selection weighted by confidence
  const totalWeight = suitable.reduce((sum, r) => sum + r.confidence, 0);
  let threshold = random() * totalWeight;
  
  for (const replacement of suitable) {
    threshold -= replacement.confidence;
    if (threshold <= 0) {
      return replacement.replacement;
    }
  }
  
  return suitable[0].replacement;
}
```

---

## 2.7 Test Cases

```typescript
import { describe, it, expect } from 'vitest';
import { getMapping, getBestReplacement, getRandomReplacement } from '../../src/maps';

describe('Homoglyph Maps', () => {
  describe('Critical Mappings', () => {
    it('maps ท to n with high confidence', () => {
      const mapping = getMapping('ท');
      expect(mapping).toBeDefined();
      expect(mapping!.replacements[0].replacement).toBe('n');
      expect(mapping!.replacements[0].confidence).toBeGreaterThanOrEqual(0.95);
    });
    
    it('maps อ to o with critical confidence', () => {
      const mapping = getMapping('อ');
      expect(mapping!.replacements[0].confidence).toBeGreaterThanOrEqual(0.95);
    });
  });
  
  describe('getBestReplacement', () => {
    it('returns highest confidence match', () => {
      const result = getBestReplacement('น', { 
        fontStyle: 'loopless', 
        minConfidence: 0.6 
      });
      expect(result).toBe('u');
    });
    
    it('returns null for low confidence threshold', () => {
      const result = getBestReplacement('ฆ', { 
        fontStyle: 'loopless', 
        minConfidence: 0.9 
      });
      expect(result).toBeNull();
    });
  });
  
  describe('Combining Marks', () => {
    it('marks tone marks as combining', () => {
      const mapping = getMapping('่');
      expect(mapping?.isCombining).toBe(true);
    });
    
    it('marks above vowels as combining', () => {
      const mapping = getMapping('ิ');
      expect(mapping?.isCombining).toBe(true);
    });
  });
});
```

---

## Deliverables Checklist

- [ ] Type definitions for mappings (`src/types/maps.ts`)
- [ ] Consonant mappings with confidence scores
- [ ] Vowel mappings (leading, following, above, below)
- [ ] Tone mark mappings with Latin combining alternatives
- [ ] Numeral mappings
- [ ] Unified map export with lookup utilities
- [ ] `getBestReplacement()` function
- [ ] `getRandomReplacement()` function with weighted selection
- [ ] Unit tests for all critical mappings
- [ ] Documentation of confidence scoring methodology

---

## Notes

1. **Confidence Calibration:** Scores are based on visual analysis in Kanit font. May need adjustment after visual testing.

2. **Obsolete Characters:** ฃ (Kho Khuat) and ฅ (Kho Khon) are obsolete but included for completeness.

3. **Skip Characters:** Characters with confidence < 0.5 should be skipped by default to maintain readability.

4. **Multi-Character Replacements:** แ → `ll` is a 1-to-2 mapping. The engine must handle length changes.
