import type { CharacterMapping } from '../types/maps';

/**
 * Thai vowel → Latin character/combining mark mappings
 */
export const VOWEL_MAPPINGS: [string, CharacterMapping][] = [
    // Leading Vowels (spacing characters)
    ['เ', {
        thai: 'เ', codePoint: 0x0E40, name: 'Sara E', isCombining: false, replacements: [
            { replacement: 'b', confidence: 0.80, level: 'high', bestFontStyle: 'loopless' },
            { replacement: '6', confidence: 0.70, level: 'medium', bestFontStyle: 'any' },
            { replacement: 'l', confidence: 0.75, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['แ', {
        thai: 'แ', codePoint: 0x0E41, name: 'Sara Ae', isCombining: false, replacements: [
            { replacement: 'll', confidence: 0.85, level: 'high', bestFontStyle: 'loopless', notes: '1-to-2 mapping' },
        ]
    }],
    ['โ', {
        thai: 'โ', codePoint: 0x0E42, name: 'Sara O', isCombining: false, replacements: [
            { replacement: 'l', confidence: 0.70, level: 'medium', bestFontStyle: 'loopless' },
            { replacement: 'L', confidence: 0.65, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ใ', {
        thai: 'ใ', codePoint: 0x0E43, name: 'Sara Ai Maimuan', isCombining: false, replacements: [
            { replacement: 'j', confidence: 0.75, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ไ', {
        thai: 'ไ', codePoint: 0x0E44, name: 'Sara Ai Maimalai', isCombining: false, replacements: [
            { replacement: 'l', confidence: 0.80, level: 'high', bestFontStyle: 'loopless' },
            { replacement: 'T', confidence: 0.65, level: 'medium', bestFontStyle: 'any' },
        ]
    }],

    // Following Vowels (spacing characters)
    ['ะ', {
        thai: 'ะ', codePoint: 0x0E30, name: 'Sara A', isCombining: false, replacements: [
            { replacement: ':', confidence: 0.70, level: 'medium', bestFontStyle: 'any' },
        ]
    }],
    ['า', {
        thai: 'า', codePoint: 0x0E32, name: 'Sara Aa', isCombining: false, replacements: [
            { replacement: '1', confidence: 0.75, level: 'medium', bestFontStyle: 'loopless' },
            { replacement: '7', confidence: 0.65, level: 'medium', bestFontStyle: 'any' },
        ]
    }],
    ['ำ', { thai: 'ำ', codePoint: 0x0E33, name: 'Sara Am', isCombining: false, replacements: [] }],

    // Above Vowels (combining characters - DANGER ZONE)
    ['ั', {
        thai: 'ั', codePoint: 0x0E31, name: 'Mai Han-Akat', isCombining: true, replacements: [
            { replacement: '\u0306', confidence: 0.70, level: 'medium', bestFontStyle: 'any', notes: 'Combining Breve' },
        ]
    }],
    ['ิ', {
        thai: 'ิ', codePoint: 0x0E34, name: 'Sara I', isCombining: true, replacements: [
            { replacement: '\u0302', confidence: 0.70, level: 'medium', bestFontStyle: 'any', notes: 'Combining Circumflex' },
        ]
    }],
    ['ี', {
        thai: 'ี', codePoint: 0x0E35, name: 'Sara Ii', isCombining: true, replacements: [
            { replacement: '\u0302', confidence: 0.70, level: 'medium', bestFontStyle: 'any', notes: 'Combining Circumflex' },
        ]
    }],
    ['ึ', {
        thai: 'ึ', codePoint: 0x0E36, name: 'Sara Ue', isCombining: true, replacements: [
            { replacement: '\u0308', confidence: 0.70, level: 'medium', bestFontStyle: 'any', notes: 'Combining Diaeresis' },
        ]
    }],
    ['ื', {
        thai: 'ื', codePoint: 0x0E37, name: 'Sara Uee', isCombining: true, replacements: [
            { replacement: '\u0308', confidence: 0.70, level: 'medium', bestFontStyle: 'any', notes: 'Combining Diaeresis' },
        ]
    }],
    ['็', {
        thai: '็', codePoint: 0x0E47, name: 'Maitaikhu', isCombining: true, replacements: [
            { replacement: '\u0306', confidence: 0.70, level: 'medium', bestFontStyle: 'any', notes: 'Combining Breve' },
        ]
    }],

    // Below Vowels (combining characters)
    ['ุ', {
        thai: 'ุ', codePoint: 0x0E38, name: 'Sara U', isCombining: true, replacements: [
            { replacement: '\u0326', confidence: 0.70, level: 'medium', bestFontStyle: 'any', notes: 'Combining Comma Below' },
        ]
    }],
    ['ู', {
        thai: 'ู', codePoint: 0x0E39, name: 'Sara Uu', isCombining: true, replacements: [
            { replacement: '\u0328', confidence: 0.70, level: 'medium', bestFontStyle: 'any', notes: 'Combining Ogonek' },
        ]
    }],
];
