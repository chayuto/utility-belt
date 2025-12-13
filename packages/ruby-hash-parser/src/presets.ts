import type { ParserOptions } from './types/options.js';

/**
 * Preset configurations for common use cases.
 *
 * @example
 * ```typescript
 * import { parse, presets } from '@utility-belt/ruby-hash-parser';
 *
 * // Strict JSON output
 * parse(input, presets.strict);
 *
 * // Maximum data preservation
 * parse(input, presets.preserving);
 * ```
 */
export const presets = {
    /**
     * Strict JSON compliance.
     * - Non-finite numbers become null
     * - Cycles become null
     * - Ranges become strings
     *
     * Use when output must be valid JSON.
     */
    strict: {
        nonFiniteNumbers: 'null',
        cyclicStrategy: 'null',
        rangeStrategy: 'string',
        bigDecimalStrategy: 'string',
        setStrategy: 'array',
    } as Partial<ParserOptions>,

    /**
     * Maximum data preservation.
     * - Non-finite numbers become strings
     * - Ranges become objects with begin/end
     * - BigDecimals become objects with precision
     *
     * Use when you need to preserve Ruby type information.
     */
    preserving: {
        nonFiniteNumbers: 'string',
        rangeStrategy: 'object',
        bigDecimalStrategy: 'object',
        setStrategy: 'object',
        cyclicStrategy: 'sentinel',
    } as Partial<ParserOptions>,

    /**
     * JSON5 compatible output.
     * - Infinity and NaN kept as literals
     *
     * Use when target consumer supports JSON5.
     */
    json5: {
        nonFiniteNumbers: 'literal',
    } as Partial<ParserOptions>,

    /**
     * Lenient parsing for console logs.
     * - Allows implicit hashes
     * - High recursion limit
     * - Replaces binary data
     *
     * Use for parsing raw console/debug output.
     */
    lenient: {
        allowImplicitHash: true,
        maxDepth: 1000,
        binaryStrategy: 'replacement',
        cyclicStrategy: 'sentinel',
    } as Partial<ParserOptions>,

    /**
     * Strict parsing with errors.
     * - Throws on non-finite numbers
     * - Throws on binary data
     * - Throws on cycles
     *
     * Use when you want to catch all edge cases.
     */
    pedantic: {
        nonFiniteNumbers: 'error',
        binaryStrategy: 'error',
        cyclicStrategy: 'error',
        allowImplicitHash: false,
    } as Partial<ParserOptions>,
} as const;

export type PresetName = keyof typeof presets;
