import type { CharacterMapping } from '../types/maps';

/**
 * Thai numeral → Arabic numeral mappings
 */
export const NUMERAL_MAPPINGS: [string, CharacterMapping][] = [
    ['๐', {
        thai: '๐', codePoint: 0x0E50, name: 'Thai Digit Zero', isCombining: false, replacements: [
            { replacement: '0', confidence: 0.95, level: 'critical', bestFontStyle: 'any' },
        ]
    }],
    ['๑', {
        thai: '๑', codePoint: 0x0E51, name: 'Thai Digit One', isCombining: false, replacements: [
            { replacement: '1', confidence: 0.90, level: 'high', bestFontStyle: 'any' },
        ]
    }],
    ['๒', {
        thai: '๒', codePoint: 0x0E52, name: 'Thai Digit Two', isCombining: false, replacements: [
            { replacement: '2', confidence: 0.85, level: 'high', bestFontStyle: 'any' },
        ]
    }],
    ['๓', {
        thai: '๓', codePoint: 0x0E53, name: 'Thai Digit Three', isCombining: false, replacements: [
            { replacement: '3', confidence: 0.85, level: 'high', bestFontStyle: 'any' },
        ]
    }],
    ['๔', {
        thai: '๔', codePoint: 0x0E54, name: 'Thai Digit Four', isCombining: false, replacements: [
            { replacement: '4', confidence: 0.80, level: 'high', bestFontStyle: 'any' },
        ]
    }],
    ['๕', {
        thai: '๕', codePoint: 0x0E55, name: 'Thai Digit Five', isCombining: false, replacements: [
            { replacement: '5', confidence: 0.85, level: 'high', bestFontStyle: 'any' },
        ]
    }],
    ['๖', {
        thai: '๖', codePoint: 0x0E56, name: 'Thai Digit Six', isCombining: false, replacements: [
            { replacement: '6', confidence: 0.85, level: 'high', bestFontStyle: 'any' },
        ]
    }],
    ['๗', {
        thai: '๗', codePoint: 0x0E57, name: 'Thai Digit Seven', isCombining: false, replacements: [
            { replacement: '7', confidence: 0.80, level: 'high', bestFontStyle: 'any' },
        ]
    }],
    ['๘', {
        thai: '๘', codePoint: 0x0E58, name: 'Thai Digit Eight', isCombining: false, replacements: [
            { replacement: '8', confidence: 0.85, level: 'high', bestFontStyle: 'any' },
        ]
    }],
    ['๙', {
        thai: '๙', codePoint: 0x0E59, name: 'Thai Digit Nine', isCombining: false, replacements: [
            { replacement: '9', confidence: 0.90, level: 'high', bestFontStyle: 'any' },
        ]
    }],
];
