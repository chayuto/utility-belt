/**
 * Custom Error Classes for Ruby Hash Parser
 */

/**
 * Base error class for all parser errors
 */
export class RubyHashParseError extends Error {
    constructor(
        message: string,
        public readonly line: number,
        public readonly column: number,
        public readonly found: string | null,
        public readonly expected: string[]
    ) {
        super(`${message} at line ${line}, column ${column}`);
        this.name = 'RubyHashParseError';
    }

    /**
     * Format error with context
     */
    format(input: string): string {
        const lines = input.split('\n');
        const errorLine = lines[this.line - 1] || '';
        const pointer = ' '.repeat(this.column - 1) + '^';

        return [
            `Parse Error: ${this.message}`,
            '',
            `  ${this.line} | ${errorLine}`,
            `    | ${pointer}`,
            '',
            `Expected: ${this.expected.join(', ')}`,
            `Found: ${this.found ?? 'end of input'}`,
        ].join('\n');
    }
}

/**
 * Thrown when nesting depth exceeds maxDepth option
 */
export class RecursionLimitExceeded extends Error {
    constructor(public readonly depth: number) {
        super(`Maximum nesting depth of ${depth} exceeded`);
        this.name = 'RecursionLimitExceeded';
    }
}

/**
 * Thrown when binary data cannot be handled with current strategy
 */
export class BinaryDataError extends Error {
    constructor(
        public readonly bytes: number[],
        public readonly strategy: string
    ) {
        super(`Cannot handle binary data with strategy '${strategy}'`);
        this.name = 'BinaryDataError';
    }
}

/**
 * Thrown when cyclic reference detected and strategy is 'error'
 */
export class CyclicReferenceError extends Error {
    constructor(public readonly refType: 'hash' | 'array') {
        super(`Cyclic ${refType} reference detected`);
        this.name = 'CyclicReferenceError';
    }
}
