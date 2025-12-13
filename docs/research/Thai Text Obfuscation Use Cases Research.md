# **Thai Text Obfuscation 'Phasa Wibat': A Comprehensive Computational Linguistic Analysis of Adversarial Text Generation and Algorithmic Evasion Mechanisms in the Digital Age**

## **1\. Introduction: The Sociolinguistic and Computational Genesis of Thai Text Obfuscation**

The digital ecosystem of Thailand presents a unique and highly complex case study in the global phenomenon of adversarial text generation. While the practice of altering text to bypass censorship filters is observed worldwide—from "Leetspeak" in English to homophonic substitutions in Mandarin—the Thai context is distinguished by the interaction between its intricate orthographic system and a rigid, multi-layered regulatory environment. This report provides an exhaustive analysis of *Phasa Wibat* (ภาษาวิบัติ), or "Language of Ruin," tracing its evolution from a sociolinguistic subculture of adolescent expression to a sophisticated, utilitarian toolkit employed by gray-market actors to evade Natural Language Processing (NLP) algorithms, Optical Character Recognition (OCR) systems, and keyword-based content moderation filters on platforms such as Facebook, TikTok, and Line.

### **1.1 Defining *Phasa Wibat*: From Aesthetic Deviation to Functional Weaponization**

The term *Phasa Wibat* historically denotes a deviation from the prescriptive norms of the Thai language. Traditionally, this encompassed orthographic modifications driven by ease of typing, emotional expression, or stylistic rebellion among Thai youth.1 For instance, a standard word like *ther* (เธอ \- you) might be altered to *ter* (เทอ) or *te* (เตง) to convey cuteness or intimacy.2 In the early 2000s, these deviations were largely viewed through a prescriptive lens as a degradation of national heritage, sparking debates among educators and linguists regarding the erosion of Thai literacy.3

However, the contemporary application of *Phasa Wibat* has undergone a radical functional shift. It is no longer merely a marker of social identity but has become a primary mechanism for algorithmic survival. As social media platforms integrated automated Content Moderation Systems (CMS) driven by machine learning and keyword blacklists, Thai users—particularly those in the e-commerce, gambling, and political spheres—repurposed *Phasa Wibat* as a form of manual adversarial attack.4 By systematically perturbing the input text, these actors introduce noise that is intelligible to human readers (who rely on phonetic and contextual cues) but opaque to machine detection systems that rely on rigid tokenization and dictionary matching.

### **1.2 The Adversarial Landscape: Algorithms vs. Human Ingenuity**

The driving force behind this phenomenon is the economic and political necessity of visibility. Social media algorithms, particularly those governing Facebook Ads and TikTok Shop, enforce strict policies against specific categories of content, including exaggerated health claims (e.g., "whitening," "slim"), gambling, weapons, and political dissent.5 When an algorithm detects a banned token, the penalties range from reduced organic reach (shadowbanning) to immediate account suspension.8

This creates an evolutionary pressure where users must constantly innovate their linguistic obfuscation techniques to stay ahead of increasingly capable AI models. The result is a dynamic arms race. On one side are the platforms employing regex matching, semantic analysis, and OCR.10 On the other are users employing zero-width character injection, cross-script homoglyphs, and semantic fragmentation to dismantle these filters.12 This report dissects these techniques, offering a deep dive into the specific mechanisms that render Thai text particularly susceptible to—and effective at—obfuscation.

## ---

**2\. Structural Vulnerabilities in Thai Orthography**

To understand the efficacy of Thai text obfuscation, one must first analyze the unique characteristics of the Thai script (an Abugida system) that differentiate it from the Latin alphabets typically used to train foundational NLP models. These structural features provide a broad attack surface for obfuscation.

### **2.1 The Abugida Architecture and Tokenization Challenges**

Unlike English, which uses explicit whitespace to delimit words, Thai is written as a continuous stream of characters (*scriptio continua*). Word boundaries are implicit and must be inferred by the reader or the tokenizer.14 Standard Thai NLP libraries, such as PyThaiNLP or DeepCut, rely on probabilistic models or dictionary lookups to segment text into meaningful tokens.15

Obfuscation exploits this dependency. By inserting non-printing characters or breaking the visual continuity of a word without destroying its legibility, adversaries can force the tokenizer to segment a banned word into nonsensical syllables. For example, the word *karn phanan* (การพนัน \- gambling) might be tokenized correctly as \['การ', 'พนัน'\]. However, if a zero-width space is inserted, or if a vowel is visually mimicked by a different symbol, the tokenizer may fail to recognize the compound, treating it as unknown tokens or effectively "blind" data, while the human eye glosses over the imperfection.17

### **2.2 Vowel and Tone Marker Redundancy**

Thai orthography allows for significant vertical complexity. Vowels can appear above, below, before, or after the consonant they modify. Additionally, tone markers (mai ek, mai tho, etc.) are placed above consonants.19 This verticality allows for "stacking" attacks and substitution strategies that are impossible in linear scripts.

Research into Thai steganography has demonstrated that the redundancy in Thai character composition—specifically the ability to compose visually identical glyphs using different Unicode sequences—can be exploited to hide information or evade filters.17 For instance, certain vowels and diacritics can be substituted or reordered in ways that rendering engines correct for display, but which remain distinct at the byte level, thereby bypassing string-matching algorithms.

### **2.3 The "Loopless" Font Phenomenon and Visual Ambiguity**

A critical development in modern Thai typography is the popularization of "loopless" fonts (such as the *Manoptica* style or modern system fonts like Apple’s *Thonburi*). Traditional Thai characters have distinct "heads" or loops. Loopless fonts remove these, effectively stylizing Thai characters to resemble Latin sans-serif letters.20

This stylistic shift has inadvertently weaponized the script. In a loopless font:

* The Thai letter **ร** (Ro Rua) becomes visually indistinguishable from the English letter **S**.  
* The Thai letter **บ** (Bo Baimai) resembles the English **U**.  
* The Thai letter **ล** (Lo Ling) resembles a lowercase **a** or inverted **v**.  
* The Thai vowel **เ** (Sara E) resembles the English **l** or **I**.22

Adversaries leverage this visual ambiguity to construct "Frankenstein" words—strings that mix Thai and Latin characters. To an algorithm trained on standard Thai fonts, the string "sาคา" (intended to mean *rakha* \- price) appears as a nonsensical mix of the English 's' and Thai vowels. To a human reader accustomed to modern typography, it is effortlessly read as "price".23

## ---

**3\. Taxonomy of Thai Obfuscation Techniques**

The analysis of the provided research material reveals a distinct taxonomy of obfuscation techniques employed in the Thai digital sphere. These can be categorized into Orthographic, Visual/Homoglyph, Technical, and Semantic obfuscation.

### **3.1 Orthographic Perturbation (The "Phasa Wibat" Legacy)**

This category includes techniques that alter the spelling of a word based on phonology, tone rules, or deliberate misspelling to avoid exact keyword matches.

#### **3.1.1 Consonant and Vowel Substitution**

Thai contains multiple consonants that share the same phonetic sound (e.g., /t/ can be represented by ต, ฏ, but they belong to different consonant classes). Adversaries swap these characters to create phonetically identical but orthographically distinct words.

* **Target Word:** *Mai* (ไม่ \- No/Not)  
* **Obfuscated:** *Maii* (ม่าย). This variation changes the vowel length and form, bypassing rigid filters while retaining meaning in a colloquial context.25  
* **Target Word:** *Chai* (ใช่ \- Yes/Correct)  
* **Obfuscated:** *Chaii* (ช่าย). Similar to above, this mimics a drawn-out pronunciation often used in chat.2

#### **3.1.2 Tone Marker Manipulation**

Users often omit tone markers or replace them with symbols that look similar but have no linguistic function in that position.

* **Target Word:** *Na* (น่า \- worth/very)  
* **Obfuscated:** *Naa* (นร้า). Here, the addition of **ร** (Ro Rua) and **้** (Mai Tho) creates a stylized version that conveys an "imploring" or "cute" tone, frequently used by sellers to soften sales pitches, but simultaneously breaking keyword detection for "spam" classifiers.1

#### **3.1.3 Truncation and Reduction**

Common in digital slang to increase typing speed, this technique also serves to evade filters looking for formal terminology.

* *Mahawithayalai* (University) becomes *Mahalai* (มหาลัย) or even *Maha'lai* (มหา'ลัย).25  
* *Witsawakakam* (Engineering) becomes *Vidva* (วิดวะ), using a phonetic spelling that deviates entirely from the Sanskrit root.25

### **3.2 Visual Obfuscation and Homoglyph Attacks**

This category represents the most advanced frontier of evasion, relying on the visual processing capabilities of the human brain to decode information that is computationally obfuscated.

#### **3.2.1 Cross-Script Homoglyphs (Thai-Latin Mixing)**

As established in the discussion on loopless fonts, users mix scripts to construct words that evade OCR and text filters. This is particularly prevalent in the sale of restricted goods.

| Banned Concept | Thai Word | Obfuscated Form | Mechanism |
| :---- | :---- | :---- | :---- |
| **Price** | ราคา (Rakha) | **s**าคา | Replaces **ร** with Latin **s** (visual match in loopless fonts). |
| **Baht (Currency)** | บาท (Baht) | **U**าท | Replaces **บ** with Latin **U**. |
| **Sale** | ขาย (Khai) | **v**าย | Replaces **ข** with Latin **v** (visual approximation). |
| **Line (App)** | ไลน์ (Line) | **l**ลน์ / **l**J**u** | Uses Latin **l** to mimic Thai **ไ** or **เ**, and **J** to mimic **ย**. |
| **Shipping** | ส่ง (Song) | **s**่ง | Replaces **ส** with Latin **s**. |

Table 1: Common Thai-Latin Homoglyph Substitutions.21

This technique creates a severe challenge for detection systems. A regex filter looking for "ราคา" will fail against "sาคา". Furthermore, because "s" and "า" are from different Unicode blocks (Basic Latin vs. Thai), standard normalization algorithms typically do not map them to a common base unless specifically trained on this adversarial dataset.13

#### **3.2.2 Leetspeak Adaptation**

Thai users have adapted the concept of "Leetspeak" (replacing letters with numbers/symbols) to their own script.

* **The "Inw" Phenomenon:** The Thai word for "God" or "Pro" (in gaming contexts) is *Thep* (เทพ). In Thai Leetspeak, this is written as **Inw**. The Latin **I** resembles the vowel **เ**, **n** resembles **ท**, and **w** resembles **พ** (in some fonts). This allows users to type Thai words using an English keyboard layout, or to evade filters blocking "Thep" in gaming contexts.28  
* **Symbol Injection:** Words are often interspersed with unrelated symbols to break continuity. E.g., *Khai* (Sell) becomes *Khai* (ข-า-ย) or *Khai* (ข.า.ย). While simple, this remains effective against exact-match keywords.1

### **3.3 Technical Obfuscation: The Invisible Layer**

Technical obfuscation involves the manipulation of the digital encoding of text in ways that are invisible to the user but disruptive to the machine.

#### **3.3.1 Zero-Width Space (ZWSP) Injection**

The Zero-Width Space (U+200B) is a non-printing character used to indicate line breaks. Adversaries weaponize this by inserting it between characters of banned words.

* **Banned:** การพนัน (Gambling)  
* **Obfuscated:** ก \+ ​ (ZWSP) \+ า \+ ​ (ZWSP) \+ ร...  
* **Result:** The text renders perfectly as การพนัน, but the byte sequence is entirely different. This defeats keyword matching and can confuse tokenizers into treating the sequence as separate, meaningless letters rather than a compound word.12

#### **3.3.2 Zero-Width Non-Joiner (ZWNJ) and Joiner (ZWJ)**

Similar to ZWSP, U+200C (ZWNJ) and U+200D (ZWJ) are used. These characters are intended for scripts like Arabic or Indic languages to control ligature formation. In Thai, they are functionally invisible garbage data that breaks string contiguity without altering the visual rendering in most browsers.29

### **3.4 Semantic Obfuscation and Code Words**

When technical evasion fails, users turn to semantic shifts—using code words, metaphors, or platform-specific slang that humans understand but algorithms (lacking cultural context) miss.

* **Platform Deflection:** To avoid bans on cross-platform promotion (e.g., mentioning Line on TikTok), users employ color-coded metaphors.  
  * **Facebook:** "App Fah" (แอปฟ้า \- Blue App).  
  * **YouTube:** "App Daeng" (แอปแดง \- Red App).  
  * **Line:** "App Khiao" (แอปเขียว \- Green App) or "Ban Khiao" (Green House).7  
* **Gambling Slang:** Instead of "Bet" (*Len Panan*), users say "Joom" (จุ่ม \- to dip/dunk) or "Woon" (วุ้น \- jelly, rhyming with *Lun* \- to win/risk). "Joom" implies taking a risk or buying a "blind box," effectively masking the gambling intent.32

## ---

**4\. Sector-Specific Use Cases and Evasion Protocols**

The application of these obfuscation techniques is highly sector-specific, driven by the unique policy constraints of different industries.

### **4.1 The Weight Loss and Supplement Industry ("Sai Khao" / "Sai Thao")**

This sector faces the most granular policing from platforms like Facebook and TikTok, which prohibit "Before/After" images, unrealistic claims ("overnight results"), and specific trigger words related to body image.6

#### **4.1.1 Keyword Substitution Strategy**

Sellers adhere to a strict lexicon of safe alternatives to avoid the "Health and Beauty" policy flags.

| Banned/High-Risk Keyword | Safe/Evasion Alternative | Rationale |
| :---- | :---- | :---- |
| **ลดน้ำหนัก** (Lose Weight) | **ลดหุ่น** (Reduce Figure), **ล ด น น.** | "Weight loss" is a specific policy trigger. "Reduce figure" is generic. |
| **อ้วน** (Fat) | **น้องหมู** (Little Pig), **ไซส์ใหญ่** (Big Size) | Avoids body shaming policies. Anthropomorphizes the condition. |
| **ขาว** (White/Whitening) | **กระจ่างใส** (Bright/Clear), **ออร่า** (Aura) | "Whitening" implies chemical alteration (banned). "Bright" is cosmetic. |
| **ยา** (Medicine/Drug) | **วิตามิน** (Vitamin), **น้อง** (Nong) | "Drug" triggers FDA compliance checks. "Vitamin" is less regulated. |
| **เห็นผลทันที** (Instant Results) | **รู้เรื่อง** (Know the story/It works) | Avoids "unrealistic claims" flags by using vague colloquialisms. |

Table 2: Weight Loss Industry Evasion Lexicon.5

#### **4.1.2 Narrative Obfuscation**

Beyond keywords, sellers use narrative structures that imply results without stating them. Instead of saying "This pill makes you thin," they might post a caption saying, "I used to wear size XL, now I wear M," often with the product visible but not explicitly referenced in the text to avoid text-based product association.6

### **4.2 The Gambling and Gray Market Sector**

The online gambling industry in Thailand is illegal, necessitating aggressive obfuscation to survive. This sector ("Sai Thao" \- Grey Line) employs the highest density of cross-script and visual obfuscation.

#### **4.2.1 The "Sia" and "Ploi" Economy**

To facilitate money transfers or credit purchasing without triggering financial fraud filters, specific verbs are mutated.

* **Transfer/Pay:** *Oan* (โอน) $\\rightarrow$ *O n* or *โ-อ-น*.  
* **Credit/Money:** *Kredits* $\\rightarrow$ *C r e d i t* or *Krai-dit*.  
* **Selling Accounts:** Selling game accounts or "shells" often uses "Ploi" (ปล่อย \- release) instead of "Sell" (*Khai*) to sound like a casual exchange rather than a commercial transaction.35

#### **4.2.2 Visual Cloaking in Gambling Ads**

Gambling ads often use images containing the text "UFA" or "Bet" written in distorted fonts or using *emoji-text* (e.g., 🅱️accarat) to defeat OCR. They also use the "Platform Deflection" technique heavily, directing users to Line (@lineid) using ZWSP-injected IDs to prevent the platform from detecting and breaking the hyperlink.5

### **4.3 Political Discourse and Censorship Evasion**

In the realm of politics, particularly regarding the Lèse-majesté law (Article 112), obfuscation is a tool for safety and dissent.

* **Pali/Sanskrit synonyms:** Using archaic royal vocabulary in ironic contexts, which modern NLP classifiers (trained on standard Thai) may not correctly associate with the intended subversive meaning.  
* **Abbreviation and Nicknames:** Political figures are referred to by initials (e.g., "P." for a Prime Minister) or coded nicknames (e.g., "Uncle" for Prayut Chan-o-cha). While human moderators eventually catch these, they provide a window of operation before the term is added to the blacklist.37  
* **Karaoke Language:** Writing Thai political slogans using the Latin alphabet (Karaoke Thai). This bypasses Thai-script keyword filters entirely. For example, a banned Thai phrase might be written phonetically in English characters, legible only to those who speak Thai.37

## ---

**5\. Technical Countermeasures: The Detection Arms Race**

The effectiveness of *Phasa Wibat* highlights significant gaps in current NLP and Content Moderation technologies. This section analyzes why detection fails and the emerging countermeasures.

### **5.1 The Failure of Standard Tokenizers**

Standard Thai tokenizers (e.g., DeepCut, PyThaiNLP) rely on statistical models (CRFs or Deep Learning) trained on clean corpora like Wikipedia or news articles.15 They are fundamentally ill-equipped to handle:

1. **Code-Mixing:** The "sาคา" (s-rakha) example mixes Latin and Thai. A tokenizer might split this into \['s', 'าคา'\] or fail to tokenize it entirely, treating it as an unknown entity (\<UNK\>).  
2. **Zero-Width Injection:** The presence of U+200B changes the vector representation of the word. If the model's vocabulary does not include the ZWSP-infused variant (which it won't), the semantic meaning is lost.

### **5.2 Regex and Normalization Limitations**

Regular Expressions (Regex) are the first line of defense but are brittle.

* **Attack:** A regex contains("ขาย") fails against ข า ย or vาย.  
* **Countermeasure:** Security researchers recommend "canonicalization" or "normalization" before analysis. This involves:  
  * Stripping all non-alphanumeric characters (including ZWSP).  
  * Mapping confusing characters (Homoglyphs) to a base character.  
* **Limitation:** Thai-specific homoglyph libraries are scarce. Most existing libraries (e.g., homoglyph-search) focus on Latin/Cyrillic confusion.38 There is a lack of robust open-source libraries that map Thai ร to Latin S or เ to l, creating a blind spot in automated detection.40

### **5.3 OCR and Vision-Language Models**

To counter text-in-image obfuscation, platforms use OCR. However, Thai "loopless" fonts present a specific adversarial challenge to OCR.

* **Challenge:** OCR models trained on standard Thai fonts expect loops to distinguish characters (e.g., differentiating **น** from **บ**). Loopless fonts remove these features, causing OCR models to misclassify Thai text as Latin garbage or generic shapes.41  
* **Evolution:** Newer benchmarks like **ThaiOCRBench** are being developed to test Vision-Language Models (VLMs) against these diverse and stylized fonts, acknowledging that standard OCR is insufficient for the Thai web.42

## ---

**6\. Advanced Technical Implementation of Obfuscation (Analysis)**

To fully grasp the sophistication of these attacks, we must examine the technical implementation available to users, often through web-based tools or simple scripts.

### **6.1 Homoglyph Generators and Obfuscation Libraries**

Tools such as homoglyph-attack-generator and text-obfuscator libraries are widely available. While often designed for security testing, they are repurposed for evasion.43

* **Mechanism:** These tools operate by mapping input characters to a database of "confusables." For Thai users, custom mappings are manually created or shared in communities.  
* **Javascript Implementation:** A simple script might iterate through a string and replace every instance of "ขาย" with "vาย" using a predefined dictionary. More advanced scripts inject U+200B at random intervals to defeat hash-based detection.45

### **6.2 The "Text-to-Speech" Loophole**

A novel evasion technique on video platforms involves using Text-to-Speech (TTS) to vocalize banned words that are *not* written in the caption.

* **Technique:** The user types a safe caption (e.g., "See results fast\!") but uses the TTS feature to say "Whitening and Slimming" in the audio track.  
* **Gap:** While platforms perform Automatic Speech Recognition (ASR) for moderation, ASR models for Thai dialect/slang are less robust than text classifiers. Furthermore, users often distort the audio speed or pitch to evade audio fingerprinting.47

### **6.3 CSS and Layout Obfuscation (Web-Based)**

For websites (e.g., gray market landing pages), obfuscation moves to the DOM level.

* **CSS Masking:** Using CSS to overlay text or reverse the rendering direction (unicode-bidi: bidi-override) allows text to appear normal to the user but backwards or jumbled to the scraper.49  
* **Font Obfuscation:** Custom web fonts can be mapped incorrectly (e.g., the character code for 'A' renders as the glyph for 'B'). To a bot reading the source code, the text is gibberish; to a user with the font loaded, it reads clearly. This is a patent-level anti-scraping technique now seeing use in evasion.50

## ---

**7\. Future Outlook and Conclusions**

The phenomenon of *Phasa Wibat* has transcended its origins as "ruined language" to become a "language of resistance" and "language of commerce." It represents a functional evolution of Thai orthography under the pressure of algorithmic surveillance.

### **7.1 The Inevitable Rise of Contextual AI**

As platform detection shifts from keyword matching to contextual AI (Transformers/BERT), simple obfuscation (e.g., vาย) will become less effective. Contextual models can infer that "vาย" means "Sell" based on the surrounding vector space of words like "Price," "Shipping," and "DM."

* **Future Evasion:** This will likely drive users toward **Semantic Obfuscation**—using entirely coded language (metaphors, memes, slang) that requires deep cultural knowledge to decode, moving the cat-and-mouse game from the syntax level to the semantic level.51

### **7.2 Recommendations for Analysis and Detection**

For professionals tasked with analyzing or moderating Thai content, reliance on standard tools is a liability. Effective strategies must include:

1. **Custom Normalization Pipelines:** Developing pre-processing steps that specifically target Thai-Latin homoglyphs (mapping s $\\rightarrow$ ร, v $\\rightarrow$ ข) before tokenization.  
2. **Visual-First Analysis:** utilizing OCR-based detection even for raw text fields to catch visual mimicry that bypasses byte-level filters.  
3. **Cultural Lexicons:** Maintaining dynamic, human-curated dictionaries of slang (e.g., "Joom," "App Fah") to update stop-word lists in real-time.

In conclusion, Thai text obfuscation is not merely a technical nuisance but a testament to the adaptability of language users. As algorithms tighten their grip, the Thai script's complexity ensures it will remain a fertile ground for linguistic innovation and evasion for the foreseeable future.

## ---

**Appendix A: Detailed Taxonomy of Thai-Latin Visual Homoglyphs (Loopless Context)**

The following table details the specific mappings used in "Loopless" font obfuscation, a critical vulnerability in current OCR and text filters.

| Thai Character | Visual Equivalent (Latin) | Usage Example (Obfuscated) | Intended Meaning |
| :---- | :---- | :---- | :---- |
| **ร** (Ro Rua) | **S**, **s** | **s**าคา | ราคา (Price) |
| **ล** (Lo Ling) | **a**, **C** (rotated) | **a**ด | ลด (Reduce/Discount) |
| **บ** (Bo Baimai) | **U**, **u** | **U**าท | บาท (Baht) |
| **ป** (Po Pla) | **J** (reversed), **U** | **J**ลา | ปลา (Fish) |
| **พ** (Pho Phan) | **W**, **w** | **W**ร | พร (Blessing) |
| **ท** (Tho Thahan) | **n** | **n**าง | ทาง (Way/Path) |
| **ห** (Ho Hip) | **H**, **h** | **h**มด | หมด (Finished/All) |
| **เ** (Sara E) | **l**, **I**, \*\* | \*\* | **l**กม |
| **แ** (Sara Ae) | **ll**, **II** | **ll**ก้ | แก้ (Fix/Solve) |
| **อ** (O Ang) | **O**, **o** | **o**ย่า | อย่า (Don't) |
| **ย** (Yo Yak) | **y** (visual approx) | ขา**y** | ขาย (Sell) |

*Note: These mappings rely heavily on "Sans Serif" or "Loopless" font styles where the distinguishing heads of Thai characters are removed.*

## **Appendix B: Technical Detection Strategy (Pseudocode)**

To detect sophisticated Thai obfuscation, a standard NLP pipeline is insufficient. A proposed robust normalization pipeline is as follows:

Python

def normalize\_thai\_obfuscation(text):  
    \# 1\. De-noise: Remove invisible characters  
    \# Removes Zero Width Space, Non-Joiner, Joiner  
    text \= re.sub(r'', '', text)  
      
    \# 2\. Compatibility Normalization  
    \# Resolves decomposed vowels/tone marks to canonical forms  
    text \= unicodedata.normalize('NFKC', text)  
      
    \# 3\. Homoglyph Resolution (Custom Thai Map)  
    \# Maps Latin look-alikes back to Thai script based on context density  
    \# (Simplified logic: if string is \>50% Thai, enforce Thai mapping)  
    if is\_predominantly\_thai(text):  
        mapping \= {  
            's': 'ร', 'S': 'ร',  
            'v': 'ข', 'V': 'ข',  
            'n': 'ท',   
            'l': 'เ', '|': 'เ',  
            'U': 'บ', 'u': 'บ'  
        }  
        for latin, thai in mapping.items():  
            text \= text.replace(latin, thai)  
              
    \# 4\. Tokenization (Post-Cleaning)  
    \# Now safe to pass to DeepCut or PyThaiNLP  
    tokens \= deepcut.tokenize(text)  
      
    return tokens

This structured approach addresses the specific vulnerabilities—invisible characters and visual homoglyphs—that define the current state of *Phasa Wibat*.

#### **Works cited**

1. ภาษาวิบัติของวัยรุ่นไทย \- ครูรวงรัตน์ วัฒนเสาวลักษณ์, accessed December 13, 2025, [https://ruangrat.wordpress.com/%E0%B8%9A%E0%B8%97%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%A7%E0%B8%B4%E0%B8%8A%E0%B8%B2%E0%B8%81%E0%B8%B2%E0%B8%A3-2/%E0%B8%A0%E0%B8%B2%E0%B8%A9%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%9A%E0%B8%B1%E0%B8%95%E0%B8%B4%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%A7%E0%B8%B1%E0%B8%A2%E0%B8%A3%E0%B8%B8%E0%B9%88%E0%B8%99%E0%B9%84%E0%B8%97/](https://ruangrat.wordpress.com/%E0%B8%9A%E0%B8%97%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%A7%E0%B8%B4%E0%B8%8A%E0%B8%B2%E0%B8%81%E0%B8%B2%E0%B8%A3-2/%E0%B8%A0%E0%B8%B2%E0%B8%A9%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%9A%E0%B8%B1%E0%B8%95%E0%B8%B4%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%A7%E0%B8%B1%E0%B8%A2%E0%B8%A3%E0%B8%B8%E0%B9%88%E0%B8%99%E0%B9%84%E0%B8%97/)  
2. การเปลี่ยนแปลงตามกาลเวลาของภาษาไทย \- Thai for Communacation, accessed December 13, 2025, [https://thaiforcommunication.weebly.com/3585363436193648361136213637365636183609364936113621359136053634361735853634362136483623362136343586362935913616363436253634365236073618.html](https://thaiforcommunication.weebly.com/3585363436193648361136213637365636183609364936113621359136053634361735853634362136483623362136343586362935913616363436253634365236073618.html)  
3. น้องน้ำหวานสงสัยว่า นิยามของคำว่า "ภาษาวิบัติ" ของแต่ละท่าน เป็นอย่างไรกันบ้างคะ ? \- Pantip, accessed December 13, 2025, [https://pantip.com/topic/34014502](https://pantip.com/topic/34014502)  
4. A Multifaceted Framework to Evaluate Evasion, Content Preservation, and Misattribution in Authorship Obfuscation Techniques \- ACL Anthology, accessed December 13, 2025, [https://aclanthology.org/2022.emnlp-main.153.pdf](https://aclanthology.org/2022.emnlp-main.153.pdf)  
5. เช็กก่อนใช้ คำต้องห้าม Facebook เสี่ยงโดนปิดเพจ | ADME, accessed December 13, 2025, [https://www.admeadme.co/blog/facebook-ig/facebook-banned-words-avoid-page-closure/](https://www.admeadme.co/blog/facebook-ig/facebook-banned-words-avoid-page-closure/)  
6. คำต้องห้ามที่ Facebook ไม่ให้ใช้ อัปเดตใหม่ปี 2025 \- Sunnysideup Digital Agency, accessed December 13, 2025, [https://sunnysideupstudio.net/%E0%B8%84%E0%B8%B3%E0%B8%95%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%AB%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B8%97%E0%B8%B5%E0%B9%88-facebook-%E0%B8%9B%E0%B8%B5-2022/](https://sunnysideupstudio.net/%E0%B8%84%E0%B8%B3%E0%B8%95%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%AB%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B8%97%E0%B8%B5%E0%B9%88-facebook-%E0%B8%9B%E0%B8%B5-2022/)  
7. อัปเดต\! คําต้องห้าม TikTok ปี 2025 ห้ามพลาด ถ้าไม่อยากโดนแบน\! | ADME, accessed December 13, 2025, [https://www.admeadme.co/blog/tiktok/tiktok-banned-words-2025/](https://www.admeadme.co/blog/tiktok/tiktok-banned-words-2025/)  
8. โดนปิดการมองเห็น ไม่ต้องกลัว\! รวมวิธีแก้ไขเมื่อโดนเฟซบุ๊กปิดกั้นการมองเห็น \- Exvention, accessed December 13, 2025, [https://exvention.co.th/facebookblock/](https://exvention.co.th/facebookblock/)  
9. รวมคำต้องห้าม Facebook ทุกธุรกิจ เช็กให้ชัวร์ก่อนใช้ 2025 \- Adchariya, accessed December 13, 2025, [https://adchariya.co.th/news/facebook-ads-news/bans-words-on-facebook-ads](https://adchariya.co.th/news/facebook-ads-news/bans-words-on-facebook-ads)  
10. 7 Anti-Scraping Techniques (And How to Bypass Them) | Medium, accessed December 13, 2025, [https://medium.com/@datajournal/anti-scraping-techniques-2cba92f700a6](https://medium.com/@datajournal/anti-scraping-techniques-2cba92f700a6)  
11. Data obfuscation expressions \- IBM, accessed December 13, 2025, [https://www.ibm.com/docs/SSKMKU/com.ibm.qradar.doc/c\_qradar\_adm\_data\_obfuscation\_expressions.html](https://www.ibm.com/docs/SSKMKU/com.ibm.qradar.doc/c_qradar_adm_data_obfuscation_expressions.html)  
12. Obfuscating Data | ALTCHA, accessed December 13, 2025, [https://altcha.org/docs/v2/obfuscation/](https://altcha.org/docs/v2/obfuscation/)  
13. Unicode Character Look-Alikes \- GitHub Gist, accessed December 13, 2025, [https://gist.github.com/StevenACoffman/a5f6f682d94e38ed804182dc2693ed4b](https://gist.github.com/StevenACoffman/a5f6f682d94e38ed804182dc2693ed4b)  
14. Thai line breaking: how to break Thai text effectively \- Stack Overflow, accessed December 13, 2025, [https://stackoverflow.com/questions/8492763/thai-line-breaking-how-to-break-thai-text-effectively](https://stackoverflow.com/questions/8492763/thai-line-breaking-how-to-break-thai-text-effectively)  
15. rkcosmos/deepcut: A Thai word tokenization library using Deep Neural Network \- GitHub, accessed December 13, 2025, [https://github.com/rkcosmos/deepcut](https://github.com/rkcosmos/deepcut)  
16. PyThaiNLP/pythainlp: Thai natural language processing in Python \- GitHub, accessed December 13, 2025, [https://github.com/PyThaiNLP/pythainlp](https://github.com/PyThaiNLP/pythainlp)  
17. Steganography in Thai Text \- ResearchGate, accessed December 13, 2025, [https://www.researchgate.net/profile/Matthew-Dailey/publication/220295274\_Steganography\_in\_Thai\_Text/links/0c960523b733a7fb10000000/Steganography-in-Thai-Text.pdf?origin=scientificContributions](https://www.researchgate.net/profile/Matthew-Dailey/publication/220295274_Steganography_in_Thai_Text/links/0c960523b733a7fb10000000/Steganography-in-Thai-Text.pdf?origin=scientificContributions)  
18. Zero-width space \- Wikipedia, accessed December 13, 2025, [https://en.wikipedia.org/wiki/Zero-width\_space](https://en.wikipedia.org/wiki/Zero-width_space)  
19. Thai script \- Wikipedia, accessed December 13, 2025, [https://en.wikipedia.org/wiki/Thai\_script](https://en.wikipedia.org/wiki/Thai_script)  
20. Why does the Thai writing system look similar to Latin lowercase? \- Quora, accessed December 13, 2025, [https://www.quora.com/Why-does-the-Thai-writing-system-look-similar-to-Latin-lowercase](https://www.quora.com/Why-does-the-Thai-writing-system-look-similar-to-Latin-lowercase)  
21. On loops and Latinisation | The Fontpad, accessed December 13, 2025, [https://www.fontpad.co.uk/loops-and-latinisation/](https://www.fontpad.co.uk/loops-and-latinisation/)  
22. Lay's in Thailand has managed to transliterate their logo into Thai (เลย์) while still keeping it legible in English. : r/graphic\_design \- Reddit, accessed December 13, 2025, [https://www.reddit.com/r/graphic\_design/comments/ahmlpb/lays\_in\_thailand\_has\_managed\_to\_transliterate/](https://www.reddit.com/r/graphic_design/comments/ahmlpb/lays_in_thailand_has_managed_to_transliterate/)  
23. Because of the way the font was designed, this sign can be read both in Latin alphabet and Thai script (ไทยแลนด์). Credit: Monta Paowattanasuk \- Reddit, accessed December 13, 2025, [https://www.reddit.com/r/DesignPorn/comments/s3lixz/because\_of\_the\_way\_the\_font\_was\_designed\_this/](https://www.reddit.com/r/DesignPorn/comments/s3lixz/because_of_the_way_the_font_was_designed_this/)  
24. Examples of Roman-like Thai typefaces. | Download Scientific Diagram \- ResearchGate, accessed December 13, 2025, [https://www.researchgate.net/figure/Examples-of-Roman-like-Thai-typefaces\_fig1\_329335972](https://www.researchgate.net/figure/Examples-of-Roman-like-Thai-typefaces_fig1_329335972)  
25. ภาษาวิบัติ \- krujad \- WordPress.com, accessed December 13, 2025, [https://krujad.wordpress.com/2011/03/23/%E0%B8%A0%E0%B8%B2%E0%B8%A9%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%9A%E0%B8%B1%E0%B8%95%E0%B8%B4/](https://krujad.wordpress.com/2011/03/23/%E0%B8%A0%E0%B8%B2%E0%B8%A9%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%9A%E0%B8%B1%E0%B8%95%E0%B8%B4/)  
26. What are the reasons for adding English alphabets in a middle of Thai words? (Examples: mาย, เสีeชีวิm, บาดเจ็u, sาคา, vาย) : r/Thailand \- Reddit, accessed December 13, 2025, [https://www.reddit.com/r/Thailand/comments/1jpdqjy/what\_are\_the\_reasons\_for\_adding\_english\_alphabets/](https://www.reddit.com/r/Thailand/comments/1jpdqjy/what_are_the_reasons_for_adding_english_alphabets/)  
27. Regular Expression to accept all Thai characters and English letters in python, accessed December 13, 2025, [https://stackoverflow.com/questions/38615740/regular-expression-to-accept-all-thai-characters-and-english-letters-in-python](https://stackoverflow.com/questions/38615740/regular-expression-to-accept-all-thai-characters-and-english-letters-in-python)  
28. ภาษา วิบัติ \- WordPress.com, accessed December 13, 2025, [https://gosonggo.wordpress.com/](https://gosonggo.wordpress.com/)  
29. Zero Width Characters Inside Text And Their Uses \- Ayodesk, accessed December 13, 2025, [https://ayodesk.com/blog/zero-width-characters/](https://ayodesk.com/blog/zero-width-characters/)  
30. How to Use Zero-Width Characters to Hide Secret Messages in Text (& Even Reveal Leaks), accessed December 13, 2025, [https://null-byte.wonderhowto.com/how-to/use-zero-width-characters-hide-secret-messages-text-even-reveal-leaks-0198692/](https://null-byte.wonderhowto.com/how-to/use-zero-width-characters-hide-secret-messages-text-even-reveal-leaks-0198692/)  
31. อัปเดต \#คำต้องห้าม TikTok ห้ามพูดในคลิปและไลฟ์ \- ข่าวสด, accessed December 13, 2025, [https://www.khaosod.co.th/sentangsedtee/featured/article\_285829](https://www.khaosod.co.th/sentangsedtee/featured/article_285829)  
32. ต้องรู้\! 20 ศัพท์ซื้อขายของออนไลน์ที่ TikTok นิยมใช้ 2024 \- สมหวัง เงินสั่งได้, accessed December 13, 2025, [https://www.somwang.co.th/article/20glossary-tiktok/](https://www.somwang.co.th/article/20glossary-tiktok/)  
33. ทำอย่างไรล่ะทีนี้ คำที่ห้ามใช้ในการโฆษณาอาหาร แถม\! ไอเดียคำโฆษณา \- Primal, accessed December 13, 2025, [https://www.primal.co.th/th/ppc/forbidden-words-food-advertising/](https://www.primal.co.th/th/ppc/forbidden-words-food-advertising/)  
34. กฎใหม่ TikTok คำต้องห้ามที่ควรรู้ เมื่อรีวิวอาหารเสริมและสกินแคร์ \- Motive Influence, accessed December 13, 2025, [https://www.motiveinfluence.com/blog/marketing/%E0%B8%81%E0%B8%8E%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88-tiktok-%E0%B8%84%E0%B8%B3%E0%B8%95%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%AB%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%84%E0%B8%A7%E0%B8%A3%E0%B8%A3%E0%B8%B9%E0%B9%89-%E0%B9%80%E0%B8%A1%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%A3%E0%B8%B5%E0%B8%A7%E0%B8%B4%E0%B8%A7%E0%B8%AD%E0%B8%B2%E0%B8%AB%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%AA%E0%B8%A3%E0%B8%B4%E0%B8%A1%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%AA%E0%B8%81%E0%B8%B4%E0%B8%99%E0%B9%81%E0%B8%84%E0%B8%A3%E0%B9%8C/735](https://www.motiveinfluence.com/blog/marketing/%E0%B8%81%E0%B8%8E%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88-tiktok-%E0%B8%84%E0%B8%B3%E0%B8%95%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%AB%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%84%E0%B8%A7%E0%B8%A3%E0%B8%A3%E0%B8%B9%E0%B9%89-%E0%B9%80%E0%B8%A1%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%A3%E0%B8%B5%E0%B8%A7%E0%B8%B4%E0%B8%A7%E0%B8%AD%E0%B8%B2%E0%B8%AB%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%AA%E0%B8%A3%E0%B8%B4%E0%B8%A1%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%AA%E0%B8%81%E0%B8%B4%E0%B8%99%E0%B9%81%E0%B8%84%E0%B8%A3%E0%B9%8C/735)  
35. SpyLoan: A Global Threat Exploiting Social Engineering | McAfee Blog, accessed December 13, 2025, [https://www.mcafee.com/blogs/other-blogs/mcafee-labs/spyloan-a-global-threat-exploiting-social-engineering/](https://www.mcafee.com/blogs/other-blogs/mcafee-labs/spyloan-a-global-threat-exploiting-social-engineering/)  
36. What's HTML character code 8203? \- unicode \- Stack Overflow, accessed December 13, 2025, [https://stackoverflow.com/questions/2973698/whats-html-character-code-8203](https://stackoverflow.com/questions/2973698/whats-html-character-code-8203)  
37. Internet Censorship in Thailand: User Practices and Potential Threats \- ResearchGate, accessed December 13, 2025, [https://www.researchgate.net/publication/318191162\_Internet\_Censorship\_in\_Thailand\_User\_Practices\_and\_Potential\_Threats](https://www.researchgate.net/publication/318191162_Internet_Censorship_in_Thailand_User_Practices_and_Potential_Threats)  
38. A big list of homoglyphs and some code to detect them \- GitHub, accessed December 13, 2025, [https://github.com/codebox/homoglyph](https://github.com/codebox/homoglyph)  
39. unhomoglyph CDN by jsDelivr \- A CDN for npm and GitHub, accessed December 13, 2025, [https://www.jsdelivr.com/package/npm/unhomoglyph](https://www.jsdelivr.com/package/npm/unhomoglyph)  
40. nodeca/unhomoglyph: Replace all homoglyphs with base characters. Useful to detect similar strings. \- GitHub, accessed December 13, 2025, [https://github.com/nodeca/unhomoglyph](https://github.com/nodeca/unhomoglyph)  
41. Recognition of Thai Characters and Text from Document Templates \- Stanford University, accessed December 13, 2025, [https://web.stanford.edu/class/ee368/Project\_Autumn\_1617/Reports/report\_asavareongchai\_giarta.pdf](https://web.stanford.edu/class/ee368/Project_Autumn_1617/Reports/report_asavareongchai_giarta.pdf)  
42. ThaiOCRBench: A Task-Diverse Benchmark for Vision-Language Understanding in Thai, accessed December 13, 2025, [https://www.researchgate.net/publication/397365798\_ThaiOCRBench\_A\_Task-Diverse\_Benchmark\_for\_Vision-Language\_Understanding\_in\_Thai](https://www.researchgate.net/publication/397365798_ThaiOCRBench_A_Task-Diverse_Benchmark_for_Vision-Language_Understanding_in_Thai)  
43. Homoglyph Attack Generator and Punycode Converter \- Irongeek.com, accessed December 13, 2025, [http://www.irongeek.com/homoglyph-attack-generator.php](http://www.irongeek.com/homoglyph-attack-generator.php)  
44. text-obfuscator \- NPM, accessed December 13, 2025, [https://www.npmjs.com/package/text-obfuscator?activeTab=code](https://www.npmjs.com/package/text-obfuscator?activeTab=code)  
45. Customized Input Masking Using Plain Javascript | by Jo IE \- Medium, accessed December 13, 2025, [https://medium.com/@joie.software/customized-input-masking-using-plain-javascript-cd98b08eb378](https://medium.com/@joie.software/customized-input-masking-using-plain-javascript-cd98b08eb378)  
46. Simple algorithm to quickly obfuscate a string in javascript. \- GitHub Gist, accessed December 13, 2025, [https://gist.github.com/olastor/54c78a3d29c69806c57a32eff32f191a](https://gist.github.com/olastor/54c78a3d29c69806c57a32eff32f191a)  
47. อัปเดต \#คำต้องห้าม TikTok ห้ามพูดในคลิป และ ในไลฟ์ ถ้าไม่อยากโดนปิดกั้น | เส้นทางเศรษฐี | LINE TODAY, accessed December 13, 2025, [https://today.line.me/th/v3/article/JPrjQRy](https://today.line.me/th/v3/article/JPrjQRy)  
48. Free Thai Text to Speech & AI Voice Generator \- ElevenLabs, accessed December 13, 2025, [https://elevenlabs.io/text-to-speech/thai](https://elevenlabs.io/text-to-speech/thai)  
49. 10 Code Snippets for Creating Stunning Text Masking Effects \- Speckyboy, accessed December 13, 2025, [https://speckyboy.com/text-masking/](https://speckyboy.com/text-masking/)  
50. prevention of web scraping and copy and paste of content by font obfuscation \- Scholars' Mine, accessed December 13, 2025, [https://scholarsmine.mst.edu/comsci\_facwork/2102/](https://scholarsmine.mst.edu/comsci_facwork/2102/)  
51. Robust Neural Machine Translation for Abugidas by Glyph Perturbation \- ACL Anthology, accessed December 13, 2025, [https://aclanthology.org/2024.eacl-short.27.pdf](https://aclanthology.org/2024.eacl-short.27.pdf)  
52. Attributable Visual Similarity Learning \- CVF Open Access, accessed December 13, 2025, [https://openaccess.thecvf.com/content/CVPR2022/papers/Zhang\_Attributable\_Visual\_Similarity\_Learning\_CVPR\_2022\_paper.pdf](https://openaccess.thecvf.com/content/CVPR2022/papers/Zhang_Attributable_Visual_Similarity_Learning_CVPR_2022_paper.pdf)