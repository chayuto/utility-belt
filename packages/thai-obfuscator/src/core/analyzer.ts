import type {
    ClusterComposition,
    CharacterInfo,
    ThaiCharacterCategory
} from '../types/cluster';

/**
 * Thai Unicode ranges
 */
export const THAI_RANGES = {
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
