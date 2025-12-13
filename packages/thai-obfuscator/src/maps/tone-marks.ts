import type { CharacterMapping } from '../types/maps';

/**
 * Thai tone mark → Latin combining diacritic mappings
 */
export const TONE_MARK_MAPPINGS: [string, CharacterMapping][] = [
    ['่', {
        thai: '่', codePoint: 0x0E48, name: 'Mai Ek', isCombining: true, replacements: [
            { replacement: '\u0300', confidence: 0.80, level: 'high', bestFontStyle: 'any', notes: 'Combining Grave Accent' },
        ]
    }],
    ['้', {
        thai: '้', codePoint: 0x0E49, name: 'Mai Tho', isCombining: true, replacements: [
            { replacement: '\u0301', confidence: 0.80, level: 'high', bestFontStyle: 'any', notes: 'Combining Acute Accent' },
        ]
    }],
    ['๊', {
        thai: '๊', codePoint: 0x0E4A, name: 'Mai Tri', isCombining: true, replacements: [
            { replacement: '\u0303', confidence: 0.80, level: 'high', bestFontStyle: 'any', notes: 'Combining Tilde' },
        ]
    }],
    ['๋', {
        thai: '๋', codePoint: 0x0E4B, name: 'Mai Chattawa', isCombining: true, replacements: [
            { replacement: '\u0304', confidence: 0.80, level: 'high', bestFontStyle: 'any', notes: 'Combining Macron' },
        ]
    }],
];

/**
 * Latin combining diacritics for Thai marks (used by composite strategy)
 */
export const LATIN_COMBINING_MAP: Record<string, string> = {
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
