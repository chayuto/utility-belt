// Type declarations for generated Peggy parser

export interface ParseOptions {
    maxDepth?: number;
    allowImplicitHash?: boolean;
    symbolHandler?: 'string' | 'preserve';
    nonFiniteNumbers?: 'null' | 'string' | 'literal' | 'error';
    objectBehavior?: 'string' | 'object';
    binaryStrategy?: 'base64' | 'array' | 'replacement' | 'error';
    rangeStrategy?: 'object' | 'string' | 'array';
    bigDecimalStrategy?: 'string' | 'number' | 'object';
    setStrategy?: 'array' | 'object';
    cyclicStrategy?: 'sentinel' | 'null' | 'error';
}

export function parse(input: string, options?: ParseOptions): unknown;
