import type { CharacterMapping } from '../types/maps';

/**
 * Thai consonant → Latin character mappings
 * Prioritizing high-confidence mappings for loopless fonts
 */
export const CONSONANT_MAPPINGS: [string, CharacterMapping][] = [
    ['ก', {
        thai: 'ก', codePoint: 0x0E01, name: 'Ko Kai', isCombining: false, replacements: [
            { replacement: 'n', confidence: 0.70, level: 'medium', bestFontStyle: 'loopless' },
            { replacement: 'A', confidence: 0.50, level: 'low', bestFontStyle: 'any' },
        ]
    }],
    ['ข', {
        thai: 'ข', codePoint: 0x0E02, name: 'Kho Khai', isCombining: false, replacements: [
            { replacement: 'v', confidence: 0.85, level: 'high', bestFontStyle: 'loopless' },
            { replacement: 'u', confidence: 0.75, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฃ', {
        thai: 'ฃ', codePoint: 0x0E03, name: 'Kho Khuat', isCombining: false, replacements: [
            { replacement: 'v', confidence: 0.80, level: 'high', bestFontStyle: 'loopless', notes: 'Obsolete' },
        ]
    }],
    ['ค', {
        thai: 'ค', codePoint: 0x0E04, name: 'Kho Khwai', isCombining: false, replacements: [
            { replacement: 'a', confidence: 0.85, level: 'high', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฅ', {
        thai: 'ฅ', codePoint: 0x0E05, name: 'Kho Khon', isCombining: false, replacements: [
            { replacement: 'a', confidence: 0.80, level: 'high', bestFontStyle: 'loopless', notes: 'Obsolete' },
        ]
    }],
    ['ฆ', { thai: 'ฆ', codePoint: 0x0E06, name: 'Kho Rakhang', isCombining: false, replacements: [] }],
    ['ง', {
        thai: 'ง', codePoint: 0x0E07, name: 'Ngo Ngu', isCombining: false, replacements: [
            { replacement: 'J', confidence: 0.85, level: 'high', bestFontStyle: 'loopless' },
            { replacement: 'j', confidence: 0.80, level: 'high', bestFontStyle: 'loopless' },
        ]
    }],
    ['จ', {
        thai: 'จ', codePoint: 0x0E08, name: 'Cho Chan', isCombining: false, replacements: [
            { replacement: 'c', confidence: 0.85, level: 'high', bestFontStyle: 'loopless' },
            { replacement: '0', confidence: 0.70, level: 'medium', bestFontStyle: 'any' },
        ]
    }],
    ['ฉ', { thai: 'ฉ', codePoint: 0x0E09, name: 'Cho Ching', isCombining: false, replacements: [] }],
    ['ช', {
        thai: 'ช', codePoint: 0x0E0A, name: 'Cho Chang', isCombining: false, replacements: [
            { replacement: 'd', confidence: 0.55, level: 'low', bestFontStyle: 'loopless' },
        ]
    }],
    ['ซ', {
        thai: 'ซ', codePoint: 0x0E0B, name: 'So So', isCombining: false, replacements: [
            { replacement: 'n', confidence: 0.70, level: 'medium', bestFontStyle: 'loopless' },
            { replacement: 'u', confidence: 0.65, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฌ', { thai: 'ฌ', codePoint: 0x0E0C, name: 'Cho Choe', isCombining: false, replacements: [] }],
    ['ญ', { thai: 'ญ', codePoint: 0x0E0D, name: 'Yo Ying', isCombining: false, replacements: [] }],
    ['ฎ', {
        thai: 'ฎ', codePoint: 0x0E0E, name: 'Do Chada', isCombining: false, replacements: [
            { replacement: 'a', confidence: 0.65, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฏ', {
        thai: 'ฏ', codePoint: 0x0E0F, name: 'To Patak', isCombining: false, replacements: [
            { replacement: 'm', confidence: 0.60, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฐ', {
        thai: 'ฐ', codePoint: 0x0E10, name: 'Tho Than', isCombining: false, replacements: [
            { replacement: '5', confidence: 0.65, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฑ', {
        thai: 'ฑ', codePoint: 0x0E11, name: 'Tho Montho', isCombining: false, replacements: [
            { replacement: 'b', confidence: 0.60, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฒ', { thai: 'ฒ', codePoint: 0x0E12, name: 'Tho Phuthao', isCombining: false, replacements: [] }],
    ['ณ', { thai: 'ณ', codePoint: 0x0E13, name: 'No Nen', isCombining: false, replacements: [] }],
    ['ด', {
        thai: 'ด', codePoint: 0x0E14, name: 'Do Dek', isCombining: false, replacements: [
            { replacement: 'a', confidence: 0.85, level: 'high', bestFontStyle: 'loopless' },
            { replacement: 'o', confidence: 0.75, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ต', {
        thai: 'ต', codePoint: 0x0E15, name: 'To Tao', isCombining: false, replacements: [
            { replacement: 'm', confidence: 0.65, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ถ', {
        thai: 'ถ', codePoint: 0x0E16, name: 'Tho Thung', isCombining: false, replacements: [
            { replacement: 'n', confidence: 0.70, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ท', {
        thai: 'ท', codePoint: 0x0E17, name: 'Tho Thahan', isCombining: false, replacements: [
            { replacement: 'n', confidence: 0.95, level: 'critical', bestFontStyle: 'loopless' },
            { replacement: 'm', confidence: 0.80, level: 'high', bestFontStyle: 'loopless' },
        ]
    }],
    ['ธ', {
        thai: 'ธ', codePoint: 0x0E18, name: 'Tho Thong', isCombining: false, replacements: [
            { replacement: 'b', confidence: 0.70, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['น', {
        thai: 'น', codePoint: 0x0E19, name: 'No Nu', isCombining: false, replacements: [
            { replacement: 'u', confidence: 0.95, level: 'critical', bestFontStyle: 'loopless' },
            { replacement: 'v', confidence: 0.85, level: 'high', bestFontStyle: 'loopless' },
        ]
    }],
    ['บ', {
        thai: 'บ', codePoint: 0x0E1A, name: 'Bo Baimai', isCombining: false, replacements: [
            { replacement: 'U', confidence: 0.85, level: 'high', bestFontStyle: 'loopless' },
            { replacement: 'u', confidence: 0.80, level: 'high', bestFontStyle: 'loopless' },
        ]
    }],
    ['ป', {
        thai: 'ป', codePoint: 0x0E1B, name: 'Po Pla', isCombining: false, replacements: [
            { replacement: 'U', confidence: 0.75, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ผ', { thai: 'ผ', codePoint: 0x0E1C, name: 'Pho Phung', isCombining: false, replacements: [] }],
    ['ฝ', { thai: 'ฝ', codePoint: 0x0E1D, name: 'Fo Fa', isCombining: false, replacements: [] }],
    ['พ', {
        thai: 'พ', codePoint: 0x0E1E, name: 'Pho Phan', isCombining: false, replacements: [
            { replacement: 'w', confidence: 0.95, level: 'critical', bestFontStyle: 'loopless' },
            { replacement: 'W', confidence: 0.90, level: 'high', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฟ', {
        thai: 'ฟ', codePoint: 0x0E1F, name: 'Fo Fan', isCombining: false, replacements: [
            { replacement: 'w', confidence: 0.80, level: 'high', bestFontStyle: 'loopless' },
        ]
    }],
    ['ภ', { thai: 'ภ', codePoint: 0x0E20, name: 'Pho Sampao', isCombining: false, replacements: [] }],
    ['ม', {
        thai: 'ม', codePoint: 0x0E21, name: 'Mo Ma', isCombining: false, replacements: [
            { replacement: 'H', confidence: 0.70, level: 'medium', bestFontStyle: 'loopless' },
            { replacement: 'N', confidence: 0.65, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ย', {
        thai: 'ย', codePoint: 0x0E22, name: 'Yo Yak', isCombining: false, replacements: [
            { replacement: 'u', confidence: 0.70, level: 'medium', bestFontStyle: 'loopless' },
            { replacement: 'y', confidence: 0.65, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ร', {
        thai: 'ร', codePoint: 0x0E23, name: 'Ro Rua', isCombining: false, replacements: [
            { replacement: 's', confidence: 0.95, level: 'critical', bestFontStyle: 'loopless' },
            { replacement: 'S', confidence: 0.90, level: 'high', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฤ', { thai: 'ฤ', codePoint: 0x0E24, name: 'Ru', isCombining: false, replacements: [] }],
    ['ล', {
        thai: 'ล', codePoint: 0x0E25, name: 'Lo Ling', isCombining: false, replacements: [
            { replacement: 'a', confidence: 0.75, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฦ', { thai: 'ฦ', codePoint: 0x0E26, name: 'Lu', isCombining: false, replacements: [] }],
    ['ว', {
        thai: 'ว', codePoint: 0x0E27, name: 'Wo Waen', isCombining: false, replacements: [
            { replacement: 'c', confidence: 0.80, level: 'high', bestFontStyle: 'loopless' },
            { replacement: '3', confidence: 0.70, level: 'medium', bestFontStyle: 'any' },
        ]
    }],
    ['ศ', { thai: 'ศ', codePoint: 0x0E28, name: 'So Sala', isCombining: false, replacements: [] }],
    ['ษ', { thai: 'ษ', codePoint: 0x0E29, name: 'So Rusi', isCombining: false, replacements: [] }],
    ['ส', {
        thai: 'ส', codePoint: 0x0E2A, name: 'So Sua', isCombining: false, replacements: [
            { replacement: 'a', confidence: 0.70, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ห', {
        thai: 'ห', codePoint: 0x0E2B, name: 'Ho Hip', isCombining: false, replacements: [
            { replacement: 'H', confidence: 0.80, level: 'high', bestFontStyle: 'loopless' },
            { replacement: 'h', confidence: 0.75, level: 'medium', bestFontStyle: 'loopless' },
        ]
    }],
    ['ฬ', { thai: 'ฬ', codePoint: 0x0E2C, name: 'Lo Chula', isCombining: false, replacements: [] }],
    ['อ', {
        thai: 'อ', codePoint: 0x0E2D, name: 'O Ang', isCombining: false, replacements: [
            { replacement: 'o', confidence: 0.98, level: 'critical', bestFontStyle: 'loopless' },
            { replacement: 'O', confidence: 0.95, level: 'critical', bestFontStyle: 'loopless' },
            { replacement: '0', confidence: 0.90, level: 'high', bestFontStyle: 'any' },
        ]
    }],
    ['ฮ', {
        thai: 'ฮ', codePoint: 0x0E2E, name: 'Ho Nokhuk', isCombining: false, replacements: [
            { replacement: 'e', confidence: 0.55, level: 'low', bestFontStyle: 'loopless' },
        ]
    }],
];
