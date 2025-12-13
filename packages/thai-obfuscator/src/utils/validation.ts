import type { ObfuscationOptions } from '../types/options';
import { DEFAULT_OPTIONS } from '../types/options';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validate input text
 */
export function validateInput(text: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof text !== 'string') {
        errors.push('Input must be a string');
        return { valid: false, errors, warnings };
    }

    if (text.length === 0) {
        warnings.push('Input is empty');
    }

    if (text.length > 1_000_000) {
        warnings.push('Input exceeds 1MB - performance may be affected');
    }

    // Check for Thai content
    const thaiPattern = /[\u0E00-\u0E7F]/;
    if (!thaiPattern.test(text)) {
        warnings.push('Input contains no Thai characters');
    }

    return { valid: errors.length === 0, errors, warnings };
}


/**
 * Validate and normalize options
 */
export function validateOptions(
    options: Partial<ObfuscationOptions>
): { options: ObfuscationOptions; warnings: string[] } {
    const warnings: string[] = [];
    const merged = { ...DEFAULT_OPTIONS, ...options };

    // Validate density
    if (merged.density < 0 || merged.density > 1) {
        warnings.push('Density clamped to 0-1 range');
        merged.density = Math.max(0, Math.min(1, merged.density));
    }

    // Validate minConfidence
    if (merged.minConfidence < 0 || merged.minConfidence > 1) {
        warnings.push('minConfidence clamped to 0-1 range');
        merged.minConfidence = Math.max(0, Math.min(1, merged.minConfidence));
    }

    // Validate strategies
    const validStrategies = ['simple', 'composite', 'zeroWidth'];
    merged.strategies = merged.strategies.filter(s => {
        if (!validStrategies.includes(s)) {
            warnings.push(`Unknown strategy "${s}" ignored`);
            return false;
        }
        return true;
    });

    if (merged.strategies.length === 0) {
        warnings.push('No valid strategies - using defaults');
        merged.strategies = DEFAULT_OPTIONS.strategies;
    }

    return { options: merged, warnings };
}
