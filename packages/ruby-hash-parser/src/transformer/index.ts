/**
 * Transformer Module
 *
 * Exports all transformation utilities for converting Ruby types to JavaScript.
 */

export {
    processDoubleQuotedEscapes,
    processSingleQuotedEscapes,
    containsBinaryData,
    handleBinaryData,
} from './escape-handler.js';

export {
    coerceNonFinite,
    coerceBigDecimal,
    coerceRange,
    coerceSet,
    coerceCyclicRef,
    parseScientificToDecimal,
} from './coercions.js';

export type { NonFiniteValue, BigDecimalValue } from './coercions.js';
