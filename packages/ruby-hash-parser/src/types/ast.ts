/**
 * AST Node Types for Ruby Hash Parser
 *
 * These types represent the intermediate syntax tree before
 * transformation to JavaScript objects.
 */

export type ASTNode =
    | HashNode
    | ArrayNode
    | StringNode
    | NumberNode
    | SymbolNode
    | BooleanNode
    | NilNode
    | ObjectInspectNode
    | RangeNode
    | SetNode
    | BigDecimalNode
    | TimestampNode
    | CyclicRefNode;

// -----------------------------------------------------------------------------
// Core Structures
// -----------------------------------------------------------------------------

export interface HashNode {
    type: 'hash';
    pairs: HashPair[];
    location?: SourceLocation;
}

export interface HashPair {
    key: ASTNode;
    value: ASTNode;
}

export interface ArrayNode {
    type: 'array';
    elements: ASTNode[];
    location?: SourceLocation;
}

// -----------------------------------------------------------------------------
// Scalar Types
// -----------------------------------------------------------------------------

export interface StringNode {
    type: 'string';
    value: string;
    quote: 'single' | 'double';
    location?: SourceLocation;
}

export interface NumberNode {
    type: 'number';
    value: number;
    raw: string;
    format: 'decimal' | 'binary' | 'octal' | 'hex' | 'float' | 'scientific';
    location?: SourceLocation;
}

export interface SymbolNode {
    type: 'symbol';
    value: string;
    quoted: boolean;
    location?: SourceLocation;
}

export interface BooleanNode {
    type: 'boolean';
    value: boolean;
    location?: SourceLocation;
}

export interface NilNode {
    type: 'nil';
    location?: SourceLocation;
}

// -----------------------------------------------------------------------------
// Ruby-Specific Types (Stages 3-4)
// -----------------------------------------------------------------------------

export interface ObjectInspectNode {
    type: 'object_inspect';
    className: string;
    address: string;
    instanceVars: Array<{ name: string; value: ASTNode }>;
    raw: string;
    location?: SourceLocation;
}

export interface RangeNode {
    type: 'range';
    begin: ASTNode;
    end: ASTNode;
    excludeEnd: boolean;
    location?: SourceLocation;
}

export interface SetNode {
    type: 'set';
    elements: ASTNode[];
    location?: SourceLocation;
}

export interface BigDecimalNode {
    type: 'bigdecimal';
    value: string;
    precision: number;
    location?: SourceLocation;
}

export interface TimestampNode {
    type: 'timestamp';
    value: string;
    timezone?: string;
    location?: SourceLocation;
}

export interface CyclicRefNode {
    type: 'cyclic_ref';
    refType: 'hash' | 'array';
    location?: SourceLocation;
}

// -----------------------------------------------------------------------------
// Source Location (for error reporting)
// -----------------------------------------------------------------------------

export interface SourceLocation {
    start: Position;
    end: Position;
}

export interface Position {
    offset: number;
    line: number;
    column: number;
}
