# **Title: Advanced Obfuscation Architectures for Thai Orthography: A Technical and Linguistic Framework for Visual Spoofing**

## **1\. Introduction: The Divergence of Human and Machine Perception**

The digital landscape is increasingly patrolled by automated agents—web scrapers, censorship algorithms, sentiment analyzers, and Large Language Model (LLM) training bots. These systems rely on the predictability of character encoding to extract meaning from text. When a machine encounters the Thai word "ของ" (meaning "of" or "thing"), it reads a sequence of specific Unicode code points: U+0E02 (Kho Khai), U+0E2D (O Ang), and U+0E07 (Ngo Ngu). Conversely, a human reader relies on pattern recognition, shape, and context. If that sequence is visually rendered as "ขoง"—substituting the Thai vowel อ with the Latin letter o—the machine sees a corrupted, mixed-script string U+0E02 \+ U+006F \+ U+0E07. The semantic link is broken for the algorithm, yet the visual pattern remains intact for the human eye.  
This report details the research and implementation plan for a TypeScript/JavaScript library designed to automate this "visual spoofing" for the Thai language. Unlike Latin script obfuscation, which is relatively straightforward due to the linear nature of the alphabet, Thai presents a formidable challenge. It is an abugida script with a complex vertical hierarchy, where vowels, tone marks, and diacritics stack above and below consonants. This verticality means that simple character substitution is often technically invalid and visually disruptive.  
The research indicates that a robust solution must transcend simple mapping tables. It requires a deep integration of linguistic phonology, typography (specifically the "loopless" font evolution), and browser rendering logic (OpenType shaping). The proposed library, henceforth referred to as ThaiObfuscator, aims to leverage the "Uncanny Valley" of Thai typography—specifically the modern sans-serif styles that intentionally mimic Latin letterforms—to create text that is semantically opaque to machines but typographically coherent to humans. This document outlines the technical specifications, linguistic mappings, and rendering strategies required to build such a system, targeting a professional development audience.

## **2\. Linguistic and Typographic Foundations of Thai Obfuscation**

To architect an effective obfuscation engine, one must first deconstruct the target. Thai script is not merely a sequence of letters; it is a system of spatial relationships. Understanding these relationships is critical to avoiding "rendering artifacts"—visual glitches like the dotted circle (◌)—that reveal the manipulation or render the text unreadable.

### **2.1 The Structure of the Thai Abugida**

Thai script belongs to the Brahmic family. Its orthography is segmental, but unlike the linear Latin alphabet, units are organized around a "base consonant". A single visual "cell" or grapheme cluster in Thai can consist of up to four vertically stacked elements:

1. **The Base Consonant:** (e.g., ป \- Po Pla).  
2. **The Subscript Vowel:** (e.g., ู \- Sara Uu) positioned below the base.  
3. **The Superscript Vowel:** (e.g., ิ \- Sara I) positioned above the base.  
4. **The Tone Mark:** (e.g., ้ \- Mai Tho) positioned above the superscript vowel or directly above the consonant.

This structure creates a dependency chain. The rendering of the tone mark depends on the presence of the superscript vowel, and the rendering of both depends on the base consonant.

* **The Obfuscation Challenge:** If ThaiObfuscator simply replaces the base consonant ป (U+0E1B) with a visually similar Latin U (U+0055), the connection to the floating tone mark ้ is severed. The browser's font rendering engine (typically HarfBuzz or similar) may not know how to position a Thai tone mark above a Latin letter. The result is often a "dotted circle" ◌้ drawn next to the U, breaking the visual illusion.

Therefore, the library cannot simply iterate through string indices. It must utilize a **Grapheme Cluster Segmenter** to treat stacks as atomic units, or employ advanced "Normalization Spoofing" to replace the entire stack with a Latin equivalent that includes its own diacritics.

### **2.2 The "Loopless" Typographic Convergance**

The most significant finding in the feasibility of Thai obfuscation is the stylistic evolution of Thai fonts. Traditional Thai script is "looped" (having small circles at the start of strokes). However, modern advertising and digital interfaces heavily favor "loopless" (Thai: แบบไม่มีหัว) typefaces. These fonts were historically influenced by Western Letraset and transfer type in the 1970s and 80s, specifically designed to harmonize with Latin sans-serifs like Helvetica.  
In loopless typography, the visual distinction between Thai and Latin characters collapses:

* **น (No Nu)** loses its loop and becomes visually identical to a Latin **u** (or inverted **n**).  
* **ร (Ro Rua)** loses its loop and jagged head, smoothing into an **S** shape.  
* **ห (Ho Hip)** loses its complex header loops, resembling a Latin **K** or **H**.  
* **ไ (Sara Ai)** simplifies into a form resembling a Latin **l** or **I**.

**Strategic Insight:** The efficacy of ThaiObfuscator is font-dependent. In a traditional font (like "Angsana New"), replacing น with u is noticeable because น has a loop and u does not. In a modern font (like "Kanit" or "Sukhumvit"), they are virtually indistinguishable. The implementation plan must therefore recommend or inject CSS that prefers loopless fonts to maximize the "stealth" of the obfuscation.

### **2.3 The Absence of Word Boundaries**

Thai is written without spaces between words. Spaces are used to separate sentences or clauses. This characteristic essentially defeats "word-boundary" detection used in simple English obfuscators.

* **Implication for Obfuscation:** We do not need to worry about preserving word shapes for the sake of recognition in the same way one might for English. The continuous flow of text allows for "intra-cluster" substitution without disrupting the macro-structure of the paragraph. However, it also means that automated re-tokenization (detecting where one word ends and another begins) is computationally expensive for scrapers. By injecting homoglyphs, we exponentially increase the difficulty for any NLP model trying to segment the text, as the "dictionary words" no longer exist in the string.

### **2.4 Tone Rules and Visual Redundancy**

Thai is a tonal language, and the tone is determined by a complex interaction of the consonant class, vowel length, and tone mark. While crucial for spoken language, the visual representation of tones (the marks ่, ้, ๊, ๋) offers a prime vector for obfuscation.

* **Visual Similarity:** The tone marks are small and float above the text. They bear a strong resemblance to Latin diacritics (acute, grave, circumflex) and even superscript digits.  
* **Ancient Roots:** It is noted in research that Thai tone marks and numbers share common roots or at least visual cognates with ancient numerals. For instance, Mai Tho ( ้) visually resembles the number 2 or a circumflex ^.  
* **Obfuscation Strategy:** Replacing Thai tone marks with Latin diacritics or superscript symbols allows us to break the Unicode sequence while maintaining the "visual texture" of the tone. A reader sees a mark above the letter and processes it as a tone, even if the computer sees a Latin "Combining Circumflex" (U+0302).

## **3\. Comprehensive Homoglyph Analysis**

To build the replacement map for the library, we must categorize Thai characters based on their visual correlation to Latin (or other script) characters. This analysis prioritizes "Loopless" forms as the target aesthetic.

### **3.1 Consonant Mappings (The "Base" Layer)**

The following table details the primary consonant mappings. These are selected based on visual overlap in modern sans-serif typefaces.

| Thai Character | Name | Phonetic Class | Visual Match (Latin/Symbol) | Visual Confidence (Loopless) | Notes & Nuance |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **ก** | Ko Kai | Mid | **n** (inverted), **A** (stylized) | Medium | n is best in rounded fonts; A works in angular fonts. ก lacks the loop, making it look like an upside-down U. |
| **ข** | Kho Khai | High | **v**, **u**, **9** (stylized) | High | Resembles a v with a curled tail or a u. In some handwriting, looks like 9\. |
| **ค** | Kho Khwai | Low | **a**, **P** (reversed) | High | The loopless form is nearly identical to a single-story a or a reversed P. |
| **ง** | Ngo Ngu | Low | **J**, **j** | High | Almost a perfect mirror or rotation of J. The bottom curve gives it away. |
| **จ** | Cho Chan | Mid | **c**, **0**, **∂** | High | Resembles a cursive c or a 0 with a tail. |
| **ช** | Cho Chang | Low | **d** (stylized), **&** | Low | Hard to map perfectly. Often left unobfuscated to preserve readability. |
| **ด** | Do Dek | Mid | **a**, **o** (with tail) | High | Very similar to a or d in handwriting. Intra-script spoof: ค (loop direction difference). |
| **ต** | To Tao | Mid | **m**, **๓** (digit) | Medium | Resembles a jagged m. Intra-script spoof: ฅ (obsolete letter). |
| **ท** | Tho Thahan | Low | **n** | **Critical** | In loopless fonts, ท is often pixel-perfect identical to Latin n. |
| **ธ** | Tho Thong | Low | **b**, **5** | Medium | Resembles a b with a flag or the number 5\. |
| **น** | No Nu | Low | **u** | **Critical** | In loopless fonts, น is effectively identical to Latin u. |
| **บ** | Bo Baimai | Mid | **U**, **u** | High | A boxier U. Very strong homoglyph. |
| **ป** | Po Pla | Mid | **U** (long tail), **y** | Medium | Like บ but with a tail. Can be mapped to U \+ diacritic or y in some fonts. |
| **พ** | Pho Phan | Low | **w**, **W** | **Critical** | Perfect match for w\[span\_2\](start\_span)\[span\_2\](end\_span). |
| **ฟ** | Fo Fan | Low | **w** (long tail), **W** | Medium | Like พ but with a tail. |
| **ม** | Mo Ma | Low | **H**, **N** | Medium | In loopless, the complexity reduces to an N or H shape. |
| **ย** | Yo Yak | Low | **u**, **y** | Medium | Phonetically y, visually u or y. |
| **ร** | Ro Rua | Low | **s**, **S**, **5** | **Critical** | In loopless, ร smooths into an S shape. |
| **ล** | Lo Ling | Low | **a**, **@** | Medium | Resembles a or a simplified @. |
| **ว** | Wo Waen | Low | **c** (reversed), **3** | High | Looks like a c facing backwards or the top of a 3\. |
| **ส** | So Sua | High | **a** (with tail), **d** | Medium | Like ล but with a tail. |
| **ห** | Ho Hip | High | **H**, **K** | High | Resembles H or K when loops are removed. |
| **อ** | O Ang | Mid | **o**, **O**, **0** | **Critical** | The universal homoglyph. Identical to o. |
| **ฮ** | Ho Nokhuk | Low | **e** (stylized) | Low | Looks like อ with a roof. |

### **3.2 Vowel Mappings (The "Floater" and "Flanker" Layer)**

Thai vowels are unique because they can appear left, right, above, or below the consonant. This positional diversity requires distinct mapping strategies.

#### **3.2.1 Preposed Vowels (Left of Consonant)**

These are standard spacing characters, making them easiest to obfuscate.

* **เ (Sara E):** Looks like a tall vertical bar with a loop.  
  * *Mapping:* b, 6, l, I (Latin I). In many fonts, 6 is a strong match.  
* **แ (Sara Ae):** Visually two เs.  
  * *Mapping:* ll, 11, u. Replacing แ with ll (double L) is extremely effective visually.  
* **โ (Sara O):** Taller than เ, with a curled top.  
  * *Mapping:* S (rotated), F (rotated), \[ (bracket \- weak). Often mapped to L or l for simplicity.  
* **ไ (Sara Ai Maimalai):** Similar to l or T with a jagged top.  
  * *Mapping:* l, T, 7\.  
* **ใ (Sara Ai Maimuan):** Similar to j or q (reversed).  
  * *Mapping:* j, q.

#### **3.2.2 Postposed Vowels (Right of Consonant)**

* **ะ (Sara A):** Two vertically stacked loops/dots.  
  * *Mapping:* :, \=, z (weak). The colon : is the best machine-readable breaker.  
* **า (Sara Aa):** A walking stick curve.  
  * *Mapping:* 1, 7, ), \]. The digit 1 or 7 is effective.

#### **3.2.3 Superscript/Subscript Vowels (The Danger Zone)**

These are non-spacing marks. Replacing them with spacing characters (like Latin letters) will break the word layout.

* \*\* ิ (Sara I):\*\* An arch above.  
  * *Mapping:* Latin Combining Circumflex ( ̂ \- U+0302) or Breve ( ̆ \- U+0306).  
* \*\* ี (Sara Ii):\*\* Arch with a vertical line.  
  * *Mapping:* Latin Combining Circumflex ( ̂) \+???. Ideally, replace with a Latin character that *has* a built-in accent if the base is also Latin. E.g., ท+ ี \-\> ñ (conceptually) or n \+ ̂.  
* \*\* ุ (Sara U \- below):\*\* A drop shape below.  
  * *Mapping:* Latin Comma Below ( ̦ \- U+0326) or Cedilla ( ̧ \- U+0327).  
* \*\* ู (Sara Uu \- below):\*\* A drawn-out drop.  
  * *Mapping:* Latin Ogonek ( ̨ \- U+0328).

### **3.3 Tone Mark Mappings (The "Diacritic" Layer)**

Tone marks are the most frequent modifiers in Thai. Obfuscating them is high-value for breaking string matching.

| Thai Tone Mark | Name | Latin/Symbol Equivalent (Visual) | Unicode Replacement Strategy |
| :---- | :---- | :---- | :---- |
| \*\* ่\*\* | Mai Ek | Apostrophe ', Digit 1, Grave Accent \` | Use **Combining Grave (U+0300)** if base is Latin. Use ' if replacing with spacing char. |
| \*\* ้\*\* | Mai Tho | Circumflex ^, Digit 2 | Use **Combining Acute (U+0301)** or **Circumflex (U+0302)**. |
| \*\* ๊\*\* | Mai Tri | Tilde \~, Digit 3 | Use **Combining Tilde (U+0303)**. |
| \*\* ๋\*\* | Mai Chattawa | Plus \+, Digit 4 | Use **Combining Plus Sign Below** (inverted) or just \+. |

## **4\. Technical Implementation Architecture**

The ThaiObfuscator library must operate as a pipeline: **Segmentation** \-\> **Analysis** \-\> **Mapping** \-\> **Reassembly**.

### **4.1 Dependency and Environment**

* **Language:** TypeScript (transpiled to JS).  
* **Runtime:** Node.js (v14+), Browsers (Chrome 87+, Firefox 84+, Safari 14.1+).  
* **Core API:** Intl.Segmenter (ECMA-402 Standard) is non-negotiable for correct Thai text processing.  
  * *Why?* Standard string splitting (str.split('')) breaks Thai tone marks away from their consonants, resulting in isolated combining characters that render incorrectly (dotted circles). Intl.Segmenter with { granularity: 'grapheme' } correctly keeps the base and its marks together as a single unit.

### **4.2 The "Obfuscation Engine" Logic**

The engine iterates through the text one grapheme cluster at a time. For each cluster, it decides on a replacement strategy based on the cluster's complexity.

#### **4.2.1 Segmentation Handling**

`// Core Segmentation Logic`  
`const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });`  
`const segments = segmenter.segment(inputText);`

`for (const { segment, index, input } of segments) {`  
    `// 'segment' is a complete grapheme cluster (e.g., "ที่", "ก", "ป")`  
    `processCluster(segment);`  
`}`

#### **4.2.2 Replacement Strategies**

We define three internal strategies for handling a cluster:  
**Strategy A: Simple Substitution (1-to-1)**

* **Applicability:** The cluster is a single character (e.g., ก, เ, า) with no attached marks.  
* **Action:** Look up the character in the HomoglyphMap and replace it with a Latin equivalent.  
  * ก \-\> n  
  * อ \-\> o

**Strategy B: Composite Substitution (Base \+ Mark)**

* **Applicability:** The cluster is a Consonant \+ Vowel/Tone (e.g., ที่, บ่).  
* **Action:** Decompose the cluster into its code points.  
  1. Identify Base: ท.  
  2. Identify Marks: ี, ่.  
  3. **Attempt Latin Mimicry:** Replace the base ท with n. Replace the marks with *Latin compatible* combining marks.  
     * ี (Thai vowel) \-\> ̂ (Latin Circumflex).  
     * ่ (Thai Tone) \-\> ̀ (Latin Grave).  
     * Result: n \+ ̂ \+ ̀ (renders as n with stacked accents).  
* **Fallback:** If the specific combination of marks is too complex (e.g., น้ำ), drop the obfuscation for this specific cluster or only obfuscate the base *if* the font rendering allows.  
* **Risk:** "Dotted Circle" generation.  
  * *Solution:* Use a "Safe Map." Only map Thai marks to Latin marks if the Base has also been mapped to a Latin letter. Never put a Thai mark on a Latin letter, and never put a Latin mark on a Thai letter (unless testing confirms safety).

**Strategy C: Invisible Injection (Zero-Width)**

* **Applicability:** Any cluster.  
* **Action:** Insert U+200B (Zero Width Space) or U+200C (Zero Width Non-Joiner) *inside* the cluster or immediately after it.  
* **Result:** ข \+ ZWSP \+ อ \+ ZWSP \+ ง.  
* **Effect:** Visually identical. Breaks text search (Ctrl+F) and keyword filtering.

### **4.3 Handling Specialized Thai Features**

#### **4.3.1 Preposed Vowels (Logical vs. Visual)**

Thai preposed vowels (e.g., เ, แ, โ, ไ) are typed *before* the consonant they modify phonetically.

* *Input:* เ (Vowel) \+ ก (Consonant) \= "Ke".  
* *Obfuscation:* Since the segmenter treats เ as a distinct grapheme (usually) or part of the cluster depending on the engine, we must ensure we replace เ with a character that stands alone (like 6 or b). We do *not* need to reorder them.  
* *Map:* เ \-\> b. ก \-\> n.  
* *Result:* bn (Looks like เก).

#### **4.3.2 Digraphs and Ligatures**

Certain Thai characters are digraphs (e.g., ฤ, ฦ). These act as vowels but look like consonants.

* *Action:* Treat them as distinct base characters. Map ฤ to R or 5..

## **5\. Security Analysis: Strengths and Limitations**

### **5.1 Evasion of Automated Detection**

* **Keyword Scraping:** Highly Effective. A scraper looking for "ขาย" (sell) will fail to match "ข1ย" or "vาย". The edit distance is small, but exact match fails.  
* **OCR (Optical Character Recognition):** Moderately Effective. High-end OCR (Google Vision) is trained on standard fonts. By using Latin homoglyphs (n for ก), we force the OCR to predict "Latin" instead of "Thai," confusing the language model context.  
* **Machine Translation:** Highly Effective. "ขoง" will likely not translate or will be treated as a proper noun/garbage string.

### **5.2 The "Red Team" View: De-obfuscation**

A dedicated adversary could defeat this library by:

1. **Normalization:** Converting all o, 0, O to อ based on context. This requires a specialized "Thai De-obfuscator" model, which is not standard in generic scraping tools.  
2. **Visual AI:** Using a Vision Transformer (ViT) trained specifically on "mixed script" Thai.  
3. **Confusable Tables:** Using Unicode TR39 data to map Latin characters back to their likely Thai counterparts.  
   * *Counter-measure:* The library should support **Randomized Mapping**. Instead of always ก \-\> n, occasionally use A or ∩. This increases the entropy required to reverse-map.

## **6\. Implementation Specifications (The Data Structures)**

To ensure the library is extensible, the mapping data should be separated from the logic.

### **6.1 The Interface ThaiHomoglyphMap**

`export interface HomoglyphConfig {`  
  `/**`  
   `* Probability of replacement (0.0 to 1.0).`  
   `* 1.0 = Obfuscate everything possible.`  
   `* 0.1 = Subtle noise injection.`  
   `*/`  
  `density: number;`

  `/**`  
   `* Preferred strategy for Tone Marks.`  
   `* 'remove': Delete tone marks (highest readability risk, highest obfuscation).`  
   `* 'latin': Replace with Latin diacritics (e.g., ^).`  
   `* 'retain': Keep original Thai tone marks (rendering risk on Latin bases).`  
   `*/`  
  `toneStrategy: 'remove' | 'latin' | 'retain';`  
`}`

`export const BASE_CONSONANT_MAP: Record<string, string> = {`  
  `// Key: Thai Char, Value: Array of Latin/Symbol replacements`  
  `'ก': ['n', 'A', 'Ω'],`   
  `'ข': ['v', 'u', 'V'],`  
  `'ค':,`  
  `'ง': ['J', 'j', 'I'],`  
  `'จ': ['c', '0', 'C'],`  
  `'ท': ['n', 'm'],`  
  `'น': ['u', 'v'],`  
  `'บ': ['U', 'u'],`  
  `'ป': ['U', 'y'],`  
  `'พ':,`  
  `'ฟ':,`  
  `'ม': ['H', 'N', 'M'],`  
  `'ย':,`  
  `'ร':,`  
  `'ล': ['a', '@'],`  
  `'ว': ['c', '3'],`  
  `'ส': ['a', 'd', 'df'],`  
  `'ห': ['K', 'H', 'h'],`  
  `'อ': ['o', 'O', '0'],`  
  `'ฮ': ['e', 'C']`  
`};`

`export const VOWEL_MAP: Record<string, string> = {`  
  `'ะ': [':', '=', 'z'],`  
  `'า': ['1', '7', 'l', ')'],`  
  `'เ': ['b', '6', 'l', '|'],`  
  `'แ': ['ll', '11', 'u'],`  
  `'โ':,`  
  `'ไ':,`  
  `'ใ': ['j', 'q']`  
`};`

## **7\. Rendering and Layout Engine Considerations**

The success of this library depends heavily on the rendering environment.

### **7.1 The Font Stack Strategy**

The library documentation must explicitly advise the developer to use a **Loopless Thai Font** in their CSS font stack.

* **Recommended CSS:** font-family: 'Kanit', 'Sarabun', 'Sukhumvit Set', sans-serif;  
* **Reasoning:** In these fonts, the glyphs for ก and n are designed to be geometrically similar. In a traditional Serif Thai font, the ก has a "beak" and the n does not, making the substitution look "ransom note" style—messy, though still readable.

### **7.2 Handling "Dotted Circles"**

The dotted circle (U+25CC) appears when a combining mark is placed on an invalid base.

* **Problem:** n (Latin) \+ ้ (Thai Tone). Some engines allow this; others (like old Android or strict OpenType implementations) reject it.  
* **Solution (The "Latin-Only" Rule):** The library should enforce a rule: *If the base consonant is obfuscated to Latin, the attached vowels/tones MUST also be obfuscated to Latin combining marks or removed.*  
  * **Incorrect:** n \+ ้ (Thai Mai Tho)  
  * **Correct:** n \+ ̂ (Latin Combining Circumflex \- U+0302)

## **8\. Limitations and Ethical Implications**

### **8.1 Accessibility (A11y)**

This library poses a **severe barrier** to screen readers.

* **Impact:** A screen reader encountering "ขoง" will likely read "Kho \- English letter O \- Ngo". It may switch voice synthesizers mid-word.  
* **Mitigation:** The library should provide a helper to inject the *original* text in an aria-label or hidden element while displaying the obfuscated text.  
  * Example: \<span aria-label="ของ"\>ขoง\</span\>  
  * *Note:* Sophisticated scrapers read aria-label, so this defeats the anti-scraping purpose. This is a fundamental trade-off: Accessibility vs. Obfuscation.

### **8.2 Search Engine Optimization (SEO)**

Content obfuscated with this library is invisible to search engines. Google will index "ขoง" as a nonsense string.

* **Use Case:** This is desirable for "gatekeeping" content (e.g., preventing price scraping, protecting member-only lists) but catastrophic for public blog posts intended to rank on Google.

## **9\. Conclusion**

The ThaiObfuscator library represents a specialized application of homoglyph obfuscation tailored to the unique architectural constraints of the Thai abugida. By leveraging the visual convergence of modern "loopless" Thai fonts and Latin sans-serifs, we can achieve a high degree of visual similarity (ก ≈ n, อ ≈ o) while completely altering the underlying byte stream.  
The technical implementation relies on Intl.Segmenter for accurate grapheme clustering, a robust replacement map prioritized by visual fidelity, and a rendering strategy that avoids invalid Unicode sequences (dotted circles). While highly effective against current generation scrapers and filters, developers must weigh the security benefits against the significant accessibility and SEO penalties.

## **10\. Appendix: Quick Reference Implementation Guide**

**Step 1: Installation** (Theoretical) npm install thai-obfuscator  
**Step 2: Basic Usage**  
`import { obfuscate } from 'thai-obfuscator';`

`const cleanText = "ของกิน";`  
`const obscure = obfuscate(cleanText, {`   
  `density: 1.0,`   
  `fontStyle: 'loopless' // Optimizes mapping for sans-serif`  
`});`

`console.log(obscure); // Output: "ขoงnิu" (or similar)`

**Step 3: Integration** Ensure your frontend serves the text with a compatible font:  
`.obfuscated-text {`  
  `font-family: 'Kanit', sans-serif;`  
`}`

#### **Works cited**

1\. Thai script \- Wikipedia, https://en.wikipedia.org/wiki/Thai\_script 2\. Thai Script Shaping, https://linux.thai.net/\~thep/th-otf/shaping.html 3\. How to render combining marks consistently across platforms: a long story, https://marc.durdin.net/2015/01/how-to-rendering-combining-marks-consistently-across-platforms-a-long-story/ 4\. Get the correct graphical representation of Thai combination characters \- Stack Overflow, https://stackoverflow.com/questions/35128542/get-the-correct-graphical-representation-of-thai-combination-characters 5\. Why does the Thai writing system look similar to Latin lowercase? \- Quora, https://www.quora.com/Why-does-the-Thai-writing-system-look-similar-to-Latin-lowercase 6\. Inversion of Thai Latinized \- ATypI, https://atypi.org/presentation/inversion-of-thai-latinized/ 7\. How does the Chrome browser know where the word boundaries are in Thai text?, https://stackoverflow.com/questions/38958234/how-does-the-chrome-browser-know-where-the-word-boundaries-are-in-thai-text 8\. Character-based Thai Word Segmentation with Multiple Attentions \- ACL Anthology, https://aclanthology.org/2021.ranlp-1.31.pdf 9\. Your Ultimate Guide to Learning Thai Tones \- ThaiPod101, https://www.thaipod101.com/blog/2021/01/18/thai-tones/ 10\. Do Thai words always mark their tone when writing in Thai script? If sometimes, what are the tone markers and do they accurately capture the full range of tones in Thai language? \- Quora, https://www.quora.com/Do-Thai-words-always-mark-their-tone-when-writing-in-Thai-script-If-sometimes-what-are-the-tone-markers-and-do-they-accurately-capture-the-full-range-of-tones-in-Thai-language 11\. Noticed that the Thai tone markers are cognate with the numbers 1-4. Anyone who also realized this? : r/Thailand \- Reddit, https://www.reddit.com/r/Thailand/comments/18v8snc/noticed\_that\_the\_thai\_tone\_markers\_are\_cognate/ 12\. Funfact: The Thai tonemarkers ่ ้ ๊ ๋ are cognate to the numbers 1, 2, 3, 4 : r/learnthai \- Reddit, https://www.reddit.com/r/learnthai/comments/18v8qlr/funfact\_the\_thai\_tonemarkers\_are\_cognate\_to\_the/ 13\. Difference between ื and เ ิ vowels in thai : r/learnthai \- Reddit, https://www.reddit.com/r/learnthai/comments/1np7ov7/difference\_between\_and\_%E0%B9%80\_vowels\_in\_thai/ 14\. แ and เ vowel sounds depends on the ending, right? : r/learnthai \- Reddit, https://www.reddit.com/r/learnthai/comments/1d0y40d/%E0%B9%81\_and\_%E0%B9%80\_vowel\_sounds\_depends\_on\_the\_ending\_right/ 15\. Difference between อ and โ : r/learnthai \- Reddit, https://www.reddit.com/r/learnthai/comments/lf9wrq/difference\_between\_%E0%B8%AD\_and\_%E0%B9%82/ 16\. Difference in pronunciation of ใ , ไ : r/thai \- Reddit, https://www.reddit.com/r/thai/comments/twmz0e/difference\_in\_pronunciation\_of\_%E0%B9%83\_%E0%B9%84/ 17\. Why does Thai have two symbols for 'ai'? ไ and ใ. \- Quora, https://www.quora.com/Why-does-Thai-have-two-symbols-for-ai-%E0%B9%84-and-%E0%B9%83 18\. Form-changing Vowels in Thai – BananaThai Language School, https://www.bananathaischool.com/blog/form-changing-vowels-in-thai/ 19\. Thai Vowels: \#1 Best Guide To Understanding The Complexities \- ling-app.com, https://ling-app.com/blog/thai-vowels/ 20\. Intl.Segmenter() constructor \- JavaScript \- MDN Web Docs, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Intl/Segmenter/Segmenter 21\. The Intl.Segmenter object is now part of Baseline | Blog \- web.dev, https://web.dev/blog/intl-segmenter 22\. Thai Alphabet, https://thai-alphabet.com/ 23\. UTS \#39: Unicode Security Mechanisms, http://www.unicode.org/reports/tr39/tr39-22.html