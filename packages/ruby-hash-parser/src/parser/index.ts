import { parse as peggyParse } from './generated.js';
import { ParserOptions, resolveOptions } from '../types/options.js';
import type { ASTNode } from '../types/ast.js';
import { RubyHashParseError } from '../errors/index.js';

/**
 * Parse Ruby Hash string to JavaScript object
 */
export function parse(
    input: string,
    options?: Partial<ParserOptions>
): unknown {
    const resolved = resolveOptions(options);

    try {
        return peggyParse(input, { ...resolved });
    } catch (err: unknown) {
        if (isPeggyError(err)) {
            throw new RubyHashParseError(
                err.message,
                err.location.start.line,
                err.location.start.column,
                err.found,
                err.expected.map((e: { description: string }) => e.description)
            );
        }
        throw err;
    }
}

/**
 * Parse and return JSON string
 */
export function toJSON(
    input: string,
    options?: Partial<ParserOptions>
): string {
    const result = parse(input, options);
    return JSON.stringify(result, null, 2);
}

/**
 * Validate input without full transformation
 */
export function validate(input: string): { valid: boolean; error?: string } {
    try {
        parse(input);
        return { valid: true };
    } catch (err) {
        return {
            valid: false,
            error: err instanceof Error ? err.message : String(err),
        };
    }
}

/**
 * Parse to AST (for debugging/advanced use)
 */
export function parseToAST(
    _input: string,
    _options?: Partial<ParserOptions>
): ASTNode {
    // TODO: Implement AST mode in grammar
    throw new Error('Not implemented - use parse() for now');
}

// Type guard for Peggy errors
function isPeggyError(err: unknown): err is {
    message: string;
    location: { start: { line: number; column: number } };
    found: string | null;
    expected: Array<{ description: string }>;
} {
    return (
        typeof err === 'object' &&
        err !== null &&
        'location' in err &&
        'expected' in err
    );
}
