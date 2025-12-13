/**
 * Parser Configuration Options
 */

export interface ParserOptions {
    /**
     * Maximum nesting depth before throwing RecursionLimitExceeded.
     * @default 500
     */
    maxDepth: number;

    /**
     * Allow hash syntax without enclosing braces.
     * @default true
     */
    allowImplicitHash: boolean;

    /**
     * Strategy for handling Ruby Symbols.
     * - 'string': Convert :sym to "sym" (default)
     * - 'preserve': Keep as { __type__: 'symbol', value: 'sym' }
     * @default 'string'
     */
    symbolHandler: 'string' | 'preserve';

    /**
     * Handling of Infinity/NaN values.
     * - 'null': Convert to null (strict JSON)
     * - 'string': Convert to "Infinity", "NaN"
     * - 'literal': Keep as-is (JSON5 compatible)
     * - 'error': Throw an error
     * @default 'null'
     */
    nonFiniteNumbers: 'null' | 'string' | 'literal' | 'error';

    /**
     * Handling of #<Object...> inspect output.
     * - 'string': Return raw string
     * - 'object': Parse instance variables into object
     * @default 'string'
     */
    objectBehavior: 'string' | 'object';

    /**
     * Handling of binary data in strings.
     * - 'base64': Encode as base64 string
     * - 'array': Convert to byte array
     * - 'replacement': Replace with U+FFFD
     * - 'error': Throw an error
     * @default 'replacement'
     */
    binaryStrategy: 'base64' | 'array' | 'replacement' | 'error';

    /**
     * Handling of Range objects (1..10).
     * - 'object': { begin, end, exclude_end }
     * - 'string': "1..10"
     * - 'array': [1, 2, ..., 10] (dangerous for large ranges)
     * @default 'object'
     */
    rangeStrategy: 'object' | 'string' | 'array';

    /**
     * Handling of BigDecimal values.
     * - 'string': Return numeric string
     * - 'number': Convert to JS number (may lose precision)
     * - 'object': { __type__: 'bigdecimal', value: '...' }
     * @default 'string'
     */
    bigDecimalStrategy: 'string' | 'number' | 'object';

    /**
     * Handling of Set collections.
     * - 'array': Convert to array
     * - 'object': { __type__: 'set', values: [...] }
     * @default 'array'
     */
    setStrategy: 'array' | 'object';

    /**
     * Handling of cyclic references ({...}).
     * - 'sentinel': Return "[Circular]"
     * - 'null': Return null
     * - 'error': Throw an error
     * @default 'sentinel'
     */
    cyclicStrategy: 'sentinel' | 'null' | 'error';
}

/**
 * Default parser options
 */
export const DEFAULT_OPTIONS: ParserOptions = {
    maxDepth: 500,
    allowImplicitHash: true,
    symbolHandler: 'string',
    nonFiniteNumbers: 'null',
    objectBehavior: 'string',
    binaryStrategy: 'replacement',
    rangeStrategy: 'object',
    bigDecimalStrategy: 'string',
    setStrategy: 'array',
    cyclicStrategy: 'sentinel',
};

/**
 * Merge user options with defaults
 */
export function resolveOptions(
    userOptions?: Partial<ParserOptions>
): ParserOptions {
    return { ...DEFAULT_OPTIONS, ...userOptions };
}
