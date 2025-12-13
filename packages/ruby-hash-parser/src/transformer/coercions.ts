/**
 * Type Coercion Functions for Ruby Hash Parser
 *
 * Handles conversion of Ruby-specific types to JavaScript/JSON values
 * based on parser configuration options.
 */

import type { ParserOptions } from '../types/options.js';

/**
 * Non-finite number representation from parser
 */
export interface NonFiniteValue {
    type: 'infinity' | 'nan';
    negative?: boolean;
}

/**
 * BigDecimal representation from parser
 */
export interface BigDecimalValue {
    type: 'bigdecimal';
    value: string;
    precision: number;
    address?: string;
}

/**
 * Coerce non-finite numbers (Infinity, NaN) based on strategy
 */
export function coerceNonFinite(
    value: NonFiniteValue,
    strategy: ParserOptions['nonFiniteNumbers']
): unknown {
    switch (strategy) {
        case 'null':
            return null;

        case 'string':
            if (value.type === 'nan') return 'NaN';
            return value.negative ? '-Infinity' : 'Infinity';

        case 'literal':
            if (value.type === 'nan') return NaN;
            return value.negative ? -Infinity : Infinity;

        case 'error':
            throw new Error(
                `Non-finite number '${value.type}' not allowed with 'error' strategy`
            );
    }
}

/**
 * Coerce BigDecimal values based on strategy
 */
export function coerceBigDecimal(
    node: BigDecimalValue,
    strategy: ParserOptions['bigDecimalStrategy']
): unknown {
    // Parse the scientific notation to a decimal string
    const decimalValue = parseScientificToDecimal(node.value);

    switch (strategy) {
        case 'string':
            return decimalValue;

        case 'number':
            return parseFloat(node.value);

        case 'object':
            return {
                __type__: 'bigdecimal',
                value: decimalValue,
                precision: node.precision,
            };
    }
}

/**
 * Convert scientific notation string to decimal string
 * e.g., '0.123456E3' -> '123.456'
 */
export function parseScientificToDecimal(sci: string): string {
    const match = sci.match(/^(-?)(\d+)\.?(\d*)E([+-]?\d+)$/i);
    if (!match) return sci;

    const [, sign, intPart, fracPart, expStr] = match;
    const exp = parseInt(expStr, 10);
    const digits = intPart + fracPart;
    const decimalPos = intPart.length + exp;

    if (decimalPos <= 0) {
        return sign + '0.' + '0'.repeat(-decimalPos) + digits;
    } else if (decimalPos >= digits.length) {
        return sign + digits + '0'.repeat(decimalPos - digits.length);
    } else {
        return sign + digits.slice(0, decimalPos) + '.' + digits.slice(decimalPos);
    }
}

/**
 * Coerce Range values based on strategy
 */
export function coerceRange(
    begin: unknown,
    end: unknown,
    excludeEnd: boolean,
    strategy: ParserOptions['rangeStrategy']
): unknown {
    switch (strategy) {
        case 'object':
            return {
                begin,
                end,
                exclude_end: excludeEnd,
            };

        case 'string':
            return `${begin}${excludeEnd ? '...' : '..'}${end}`;

        case 'array': {
            // Only works for numeric ranges
            if (typeof begin === 'number' && typeof end === 'number') {
                const result: number[] = [];
                const actualEnd = excludeEnd ? end : end + 1;
                for (let i = begin; i < actualEnd; i++) {
                    result.push(i);
                }
                return result;
            }
            // Fall back to object for non-numeric
            return { begin, end, exclude_end: excludeEnd };
        }
    }
}

/**
 * Coerce Set values based on strategy
 */
export function coerceSet(
    elements: unknown[],
    strategy: ParserOptions['setStrategy']
): unknown {
    switch (strategy) {
        case 'array':
            return elements;

        case 'object':
            return {
                __type__: 'set',
                values: elements,
            };
    }
}

/**
 * Coerce cyclic reference based on strategy
 */
export function coerceCyclicRef(
    refType: 'hash' | 'array',
    strategy: ParserOptions['cyclicStrategy']
): unknown {
    switch (strategy) {
        case 'sentinel':
            return '[Circular]';

        case 'null':
            return null;

        case 'error':
            throw new Error(`Cyclic ${refType} reference detected`);
    }
}
