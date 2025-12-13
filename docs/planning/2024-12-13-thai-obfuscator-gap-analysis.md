# Thai Obfuscator: Gap Analysis Report

**Date:** December 13, 2025  
**Based on:** [Thai Text Obfuscation Use Cases Research](../research/Thai%20Text%20Obfuscation%20Use%20Cases%20Research.md)  
**Reviewed:** `@utility-belt/thai-obfuscator` current implementation

---

## Executive Summary

The current implementation provides a solid foundation for Thai text obfuscation with grapheme-aware processing, homoglyph substitution, and zero-width injection. However, comparing against the comprehensive research document reveals **significant gaps** in coverage, particularly around:

1. **Incomplete homoglyph mappings** (missing critical characters from Appendix A)
2. **No deobfuscation/normalization pipeline** (research Section 5.2, Appendix B)
3. **Missing semantic obfuscation** (code words, platform deflection)
4. **No orthographic perturbation** (Phasa Wibat legacy techniques)
5. **Limited detection resistance testing**

---

## Gap Analysis by Research Section

### 1. Homoglyph Mappings (Research Section 3.2, Appendix A)

| Research Mapping | Current Status | Gap |
|------------------|----------------|-----|
| **ร → S/s** | ✅ Implemented (0.95 confidence) | None |
| **ล → a/C** | ⚠️ Partial (only `a` at 0.75) | Missing `C` variant |
| **บ → U/u** | ✅ Implemented | None |
| **ป → J/U** | ⚠️ Partial (only `U` at 0.75) | Missing reversed `J` |
| **พ → W/w** | ✅ Implemented (0.95 confidence) | None |
| **ท → n** | ✅ Implemented (0.95 confidence) | None |
| **ห → H/h** | ✅ Implemented | None |
| **เ → l/I/\|** | ⚠️ Partial (has `b`, `6`, `l`) | Missing `I` and `\|` (pipe) |
| **แ → ll/II** | ⚠️ Partial (only `ll`) | Missing `II` variant |
| **อ → O/o/0** | ✅ Implemented (0.98 confidence) | None |
| **ย → y** | ✅ Implemented | None |
| **ข → v** | ✅ Implemented | None |

**Missing from Research Table:**
- `น → u` is implemented but research shows it as `น → u` (visual match in loopless) ✅
- Research mentions `ฟ → w` which is implemented ✅

**Critical Gaps:**
```typescript
// Missing mappings that should be added:
'เ': [
  { replacement: 'I', confidence: 0.80 },  // Capital I
  { replacement: '|', confidence: 0.75 },  // Pipe character
]
'ป': [
  { replacement: 'J', confidence: 0.70, notes: 'Reversed J visual' }
]
```

### 2. Zero-Width Character Strategy (Research Section 3.3)

| Technique | Current Status | Gap |
|-----------|----------------|-----|
| ZWSP (U+200B) | ✅ Implemented | None |
| ZWNJ (U+200C) | ✅ Implemented | None |
| ZWJ (U+200D) | ✅ Implemented | None |
| Word Joiner (U+2060) | ✅ Implemented | None |
| Intra-cluster injection | ✅ Implemented (`intraClusterZeroWidth`) | None |

**Status:** Fully covered ✅

### 3. Orthographic Perturbation - "Phasa Wibat" (Research Section 3.1)

| Technique | Current Status | Gap |
|-----------|----------------|-----|
| Consonant class substitution | ❌ Not implemented | **HIGH PRIORITY** |
| Vowel length manipulation | ❌ Not implemented | Medium priority |
| Tone marker manipulation | ⚠️ Partial (remove/retain/latin) | Missing "symbol replacement" |
| Truncation/reduction | ❌ Not implemented | Low priority (semantic) |

**Critical Gap:** The research describes substituting consonants with same-sound alternatives:
- ต/ฏ (both /t/)
- ท/ฑ/ฒ (all /th/)
- ส/ศ/ษ (all /s/)

This is a **native Thai obfuscation** technique that doesn't rely on Latin homoglyphs.

**Recommended Addition:**
```typescript
// New strategy: phonetic-substitution.ts
const PHONETIC_EQUIVALENTS: Record<string, string[]> = {
  'ต': ['ฏ'],           // /t/ class
  'ท': ['ฑ', 'ฒ'],      // /th/ class  
  'ส': ['ศ', 'ษ'],      // /s/ class
  'ค': ['ฅ'],           // /kh/ class (obsolete but valid)
  // etc.
};
```

### 4. Semantic Obfuscation (Research Section 3.4)

| Technique | Current Status | Gap |
|-----------|----------------|-----|
| Platform deflection codes | ❌ Not implemented | Out of scope (dictionary) |
| Industry-specific lexicons | ❌ Not implemented | Out of scope (dictionary) |
| Code word substitution | ❌ Not implemented | Out of scope |

**Assessment:** These are **semantic-level** transformations requiring domain-specific dictionaries. They are outside the scope of a character-level obfuscation library but could be a separate module.

**Recommendation:** Document as "not in scope" but provide hooks for users to supply custom word-level mappings.

### 5. Detection/Normalization Pipeline (Research Section 5.2, Appendix B)

| Component | Current Status | Gap |
|-----------|----------------|-----|
| ZWSP/ZWNJ/ZWJ stripping | ❌ Not implemented | **HIGH PRIORITY** |
| NFKC normalization | ❌ Not implemented | **HIGH PRIORITY** |
| Homoglyph resolution (Latin→Thai) | ❌ Not implemented | **HIGH PRIORITY** |
| Reverse mapping | ⚠️ Partial (`attemptDeobfuscation` exists) | Needs enhancement |

**Critical Gap:** The research provides pseudocode for a normalization pipeline (Appendix B) that the library should implement for:
1. **Testing effectiveness** - Can we defeat our own obfuscation?
2. **User utility** - Allow users to normalize suspicious text

**Recommended Addition:**
```typescript
// New module: utils/normalize.ts
export function normalizeThaiObfuscation(text: string): string {
  // 1. Strip zero-width characters
  text = text.replace(/[\u200B\u200C\u200D\u2060]/g, '');
  
  // 2. NFKC normalization
  text = text.normalize('NFKC');
  
  // 3. Homoglyph resolution (reverse of our mappings)
  const REVERSE_MAP: Record<string, string> = {
    's': 'ร', 'S': 'ร',
    'v': 'ข', 'V': 'ข',
    'n': 'ท',
    'u': 'น',
    'U': 'บ',
    'w': 'พ', 'W': 'พ',
    'o': 'อ', 'O': 'อ', '0': 'อ',
    // ... etc
  };
  
  // Apply if text is predominantly Thai
  if (isPredominantlyThai(text)) {
    for (const [latin, thai] of Object.entries(REVERSE_MAP)) {
      text = text.replaceAll(latin, thai);
    }
  }
  
  return text;
}
```

### 6. Leetspeak Adaptation (Research Section 3.2.2)

| Technique | Current Status | Gap |
|-----------|----------------|-----|
| "Inw" phenomenon (เทพ → Inw) | ❌ Not implemented | Medium priority |
| Symbol injection (ข-า-ย) | ❌ Not implemented | Low priority |

**Assessment:** The "Inw" technique is a **full-word** Latin keyboard mapping, not character-level. Symbol injection is simple but effective.

**Recommendation:** Add symbol injection as a strategy option:
```typescript
// strategies/symbol-injection.ts
export function symbolInjectionStrategy(
  cluster: GraphemeCluster,
  options: { symbols: string[] }
): StrategyResult {
  // Insert symbols between characters: ขาย → ข-า-ย or ข.า.ย
}
```

### 7. Font-Specific Considerations (Research Section 2.3)

| Aspect | Current Status | Gap |
|--------|----------------|-----|
| Loopless font awareness | ✅ Implemented (`fontStyle` option) | None |
| Font recommendation | ✅ Implemented (`RECOMMENDED_FONTS`) | None |
| CSS helpers | ✅ Implemented (`generateObfuscatedTextCSS`) | None |
| Traditional font mappings | ⚠️ Partial | Lower confidence scores needed |

**Status:** Well covered ✅

### 8. Effectiveness Testing (Research Section 5)

| Test Type | Current Status | Gap |
|-----------|----------------|-----|
| Tokenizer defeat testing | ❌ Not implemented | **HIGH PRIORITY** |
| Regex bypass testing | ❌ Not implemented | Medium priority |
| OCR resistance testing | ❌ Not implemented | Low priority (visual) |
| Translation API testing | ❌ Not implemented | Medium priority |

**Recommendation:** Add integration tests that verify obfuscated text:
1. Fails PyThaiNLP/DeepCut tokenization
2. Bypasses common regex patterns
3. Breaks Google Translate (manual verification)

---

## Priority Fixes

### P0 - Critical (Implement Immediately)

1. **Add Normalization Pipeline**
   - File: `src/utils/normalize.ts`
   - Implements research Appendix B pseudocode
   - Essential for testing and user utility

2. **Complete Homoglyph Mappings**
   - Add missing `เ → I, |` mappings
   - Add `ป → J` mapping
   - Review all Appendix A entries

3. **Add Phonetic Substitution Strategy**
   - File: `src/strategies/phonetic.ts`
   - Thai consonant class substitution
   - Native obfuscation without Latin mixing

### P1 - High Priority (Next Sprint)

4. **Add Symbol Injection Strategy**
   - File: `src/strategies/symbol-injection.ts`
   - Insert `-`, `.`, `_` between characters
   - Simple but effective against exact-match

5. **Effectiveness Test Suite**
   - File: `tests/integration/effectiveness.test.ts`
   - Test against tokenizers, regex patterns
   - Document expected defeat rates

6. **Reverse Mapping Export**
   - Export `REVERSE_HOMOGLYPH_MAP` for detection use
   - Allow users to build their own normalizers

### P2 - Medium Priority (Backlog)

7. **Word-Level Mapping Hooks**
   - Allow users to supply semantic dictionaries
   - Support "App Fah" → "Facebook" type mappings

8. **Leetspeak Full-Word Support**
   - Support "เทพ" → "Inw" type transformations
   - Requires word-level processing

9. **Enhanced Tone Strategy**
   - Add "symbol" option (replace with `'`, `"`, etc.)
   - More aggressive tone removal

### P3 - Low Priority (Future)

10. **OCR Resistance Mode**
    - Optimize for visual similarity over byte-level
    - May require different mapping priorities

11. **CSS/DOM Obfuscation Helpers**
    - `unicode-bidi` tricks
    - Font mapping obfuscation

---

## Implementation Recommendations

### New File Structure

```
src/
├── strategies/
│   ├── phonetic.ts          # NEW: Thai consonant class substitution
│   └── symbol-injection.ts  # NEW: Insert symbols between chars
├── utils/
│   ├── normalize.ts         # NEW: Deobfuscation/normalization
│   └── reverse-map.ts       # NEW: Reverse homoglyph mappings
└── maps/
    └── phonetic-equivalents.ts  # NEW: Same-sound consonant groups
```

### Updated Presets

```typescript
// Add to presets.ts
export const presets = {
  // ... existing presets ...
  
  /**
   * Native Thai - uses phonetic substitution only
   * Use for: Evading Thai-only NLP without Latin mixing
   */
  nativeThai: {
    density: 0.6,
    strategies: ['phonetic', 'zeroWidth'],
    toneStrategy: 'retain',
    fontStyle: 'any',
    minConfidence: 0,
    injectZeroWidth: true,
  },
  
  /**
   * Anti-regex - optimized for breaking pattern matching
   */
  antiRegex: {
    density: 1.0,
    strategies: ['simple', 'symbolInjection', 'zeroWidth'],
    toneStrategy: 'latin',
    fontStyle: 'loopless',
    minConfidence: 0.5,
    injectZeroWidth: true,
    symbolInjectionRate: 0.3,
  },
};
```

---

## Conclusion

The current implementation covers approximately **60-65%** of the techniques documented in the research. The major gaps are:

1. **Normalization/detection pipeline** - Critical for testing and utility
2. **Phonetic substitution** - Native Thai technique completely missing
3. **Symbol injection** - Simple but effective technique missing
4. **Effectiveness testing** - No verification against real NLP tools

The library is well-architected and these additions fit naturally into the existing strategy pattern. Estimated effort for P0+P1 items: **3-5 days**.

---

## Appendix: Quick Reference - Missing Mappings

```typescript
// Add to consonants.ts
['เ', { /* existing */ replacements: [
  // ADD:
  { replacement: 'I', confidence: 0.80, level: 'high', bestFontStyle: 'loopless' },
  { replacement: '|', confidence: 0.75, level: 'medium', bestFontStyle: 'any' },
]}],

['ป', { /* existing */ replacements: [
  // ADD:
  { replacement: 'J', confidence: 0.70, level: 'medium', bestFontStyle: 'loopless', notes: 'Reversed J' },
]}],

['แ', { /* existing */ replacements: [
  // ADD:
  { replacement: 'II', confidence: 0.80, level: 'high', bestFontStyle: 'loopless' },
]}],
```
