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
