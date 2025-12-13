/**
 * @utility-belt/ruby-hash-parser
 *
 * Parse Ruby Hash inspect output to JavaScript objects
 */

export { parse, toJSON, validate, parseToAST } from './parser/index.js';
export { DEFAULT_OPTIONS, resolveOptions } from './types/options.js';
export type { ParserOptions } from './types/options.js';
export type {
    ASTNode,
    HashNode,
    ArrayNode,
    StringNode,
    NumberNode,
    SymbolNode,
    BooleanNode,
    NilNode,
} from './types/ast.js';
export {
    RubyHashParseError,
    RecursionLimitExceeded,
    BinaryDataError,
    CyclicReferenceError,
} from './errors/index.js';
export { presets } from './presets.js';
export type { PresetName } from './presets.js';
