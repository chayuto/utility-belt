{
  // Parser initializer
  let depth = 0;
  const maxDepth = options.maxDepth ?? 500;
  const nonFiniteNumbers = options.nonFiniteNumbers ?? 'null';
  const rangeStrategy = options.rangeStrategy ?? 'object';
  const cyclicStrategy = options.cyclicStrategy ?? 'sentinel';
  
  function checkDepth() {
    if (++depth > maxDepth) {
      error(`Maximum nesting depth of ${maxDepth} exceeded`);
    }
  }
  
  function decrementDepth() {
    depth--;
  }

  // Escape sequence processing (embedded for performance)
  const SIMPLE_ESCAPES = {
    'n': '\n', 't': '\t', 'r': '\r', '\\': '\\', '"': '"', "'": "'",
    'a': '\u0007', 'b': '\b', 'e': '\u001B', 'f': '\f', 'v': '\u000B', 's': ' ', '0': '\0'
  };

  function processEscapes(content) {
    let result = '';
    let i = 0;
    while (i < content.length) {
      if (content[i] === '\\' && i + 1 < content.length) {
        const next = content[i + 1];
        if (next in SIMPLE_ESCAPES) {
          result += SIMPLE_ESCAPES[next];
          i += 2;
          continue;
        }
        // Octal: \0 to \377
        if (/[0-7]/.test(next)) {
          const match = content.slice(i + 1).match(/^[0-7]{1,3}/);
          if (match) {
            result += String.fromCharCode(parseInt(match[0], 8));
            i += 1 + match[0].length;
            continue;
          }
        }
        // Hex: \xNN
        if (next === 'x') {
          const match = content.slice(i + 2).match(/^[0-9a-fA-F]{1,2}/);
          if (match) {
            result += String.fromCharCode(parseInt(match[0], 16));
            i += 2 + match[0].length;
            continue;
          }
        }
        // Unicode: \uNNNN or \u{...}
        if (next === 'u') {
          if (content[i + 2] === '{') {
            const endBrace = content.indexOf('}', i + 3);
            if (endBrace !== -1) {
              result += String.fromCodePoint(parseInt(content.slice(i + 3, endBrace), 16));
              i = endBrace + 1;
              continue;
            }
          }
          const match = content.slice(i + 2).match(/^[0-9a-fA-F]{4}/);
          if (match) {
            result += String.fromCharCode(parseInt(match[0], 16));
            i += 6;
            continue;
          }
        }
        // Control: \C-x or \cx
        if (next === 'C' && content[i + 2] === '-' && content[i + 3]) {
          result += String.fromCharCode(content.charCodeAt(i + 3) & 0x1F);
          i += 4;
          continue;
        }
        if (next === 'c' && content[i + 2]) {
          result += String.fromCharCode(content.charCodeAt(i + 2) & 0x1F);
          i += 3;
          continue;
        }
        // Meta: \M-x
        if (next === 'M' && content[i + 2] === '-' && content[i + 3]) {
          result += String.fromCharCode(content.charCodeAt(i + 3) | 0x80);
          i += 4;
          continue;
        }
        result += content[i + 1];
        i += 2;
      } else {
        result += content[i];
        i++;
      }
    }
    return result;
  }

  function processSingleEscapes(content) {
    let result = '';
    let i = 0;
    while (i < content.length) {
      if (content[i] === '\\' && i + 1 < content.length) {
        const next = content[i + 1];
        if (next === '\\' || next === "'") {
          result += next;
          i += 2;
          continue;
        }
      }
      result += content[i];
      i++;
    }
    return result;
  }

  function handleNonFinite(value) {
    switch (nonFiniteNumbers) {
      case 'null': return null;
      case 'string': return value.type === 'nan' ? 'NaN' : (value.negative ? '-Infinity' : 'Infinity');
      case 'literal': return value.type === 'nan' ? NaN : (value.negative ? -Infinity : Infinity);
      case 'error': throw new Error(`Non-finite number '${value.type}' not allowed`);
    }
  }

  function handleRange(begin, end, excludeEnd) {
    switch (rangeStrategy) {
      case 'object':
        return { begin, end, exclude_end: excludeEnd };
      case 'string':
        return `${begin}${excludeEnd ? '...' : '..'}${end}`;
      case 'array':
        if (typeof begin !== 'number' || typeof end !== 'number') {
          return { begin, end, exclude_end: excludeEnd };
        }
        const limit = excludeEnd ? end : end + 1;
        if (limit - begin > 10000) {
          throw new Error('Range too large for array expansion (max 10000)');
        }
        const result = [];
        for (let i = begin; i < limit; i++) {
          result.push(i);
        }
        return result;
    }
  }

  function handleCyclicRef(refType) {
    switch (cyclicStrategy) {
      case 'sentinel': return '[Circular]';
      case 'null': return null;
      case 'error': throw new Error(`Cyclic ${refType} reference detected`);
    }
  }
}

// =============================================================================
// ROOT RULES
// =============================================================================

Start
  = _ value:(Hash / Array / ImplicitHash) _ { return value; }

ImplicitHash
  = !"{" !"[" head:Pair tail:(_ "," _ @Pair)* {
      return Object.fromEntries([head, ...tail]);
    }

// =============================================================================
// HASH STRUCTURE
// =============================================================================

Hash
  = "{" _ "..." _ "}" { return handleCyclicRef('hash'); }
  / "{" _ pairs:PairList? _ "}" {
      checkDepth();
      const result = Object.fromEntries(pairs ?? []);
      decrementDepth();
      return result;
    }

PairList
  = head:Pair tail:(_ "," _ @Pair)* (_ ",")? { return [head, ...tail]; }

Pair
  = RocketPair
  / JsonStylePair

RocketPair
  = key:KeyExpression _ "=>" _ value:Value {
      return [String(key), value];
    }

JsonStylePair
  = key:BareSymbolName ":" !":"  _ value:Value {
      return [key, value];
    }

// =============================================================================
// KEY EXPRESSIONS
// =============================================================================

KeyExpression
  = Symbol
  / StringLiteral
  / NumberLiteral
  / Array
  / Hash

// =============================================================================
// VALUE EXPRESSIONS
// =============================================================================

Value
  = Hash
  / Array
  / RangeLiteral
  / StringLiteral
  / Symbol
  / NumberLiteral
  / Primitive

// =============================================================================
// ARRAYS
// =============================================================================

Array
  = "[" _ "..." _ "]" { return handleCyclicRef('array'); }
  / "[" _ elements:ElementList? _ "]" {
      checkDepth();
      const result = elements ?? [];
      decrementDepth();
      return result;
    }

ElementList
  = head:Value tail:(_ "," _ @Value)* (_ ",")? { return [head, ...tail]; }

// =============================================================================
// RANGE LITERALS
// =============================================================================

RangeLiteral
  = begin:RangeEndpoint "..." end:RangeEndpoint {
      return handleRange(begin, end, true);
    }
  / begin:RangeEndpoint ".." end:RangeEndpoint {
      return handleRange(begin, end, false);
    }

RangeEndpoint
  = Float
  / Integer
  / StringLiteral

// =============================================================================
// PRIMITIVES
// =============================================================================

Primitive
  = "true" !IdentifierChar { return true; }
  / "false" !IdentifierChar { return false; }
  / "nil" !IdentifierChar { return null; }

// =============================================================================
// SYMBOLS (Complete)
// =============================================================================

Symbol
  = ":" name:OperatorSymbol { return name; }
  / ":" name:BareSymbolName { return name; }
  / ":" str:SingleQuotedString { return str; }
  / ":" str:DoubleQuotedString { return str; }

BareSymbolName
  = $([a-zA-Z_] [a-zA-Z0-9_!?]*)

OperatorSymbol
  = $("<=>" / "===" / "==" / "=~" / "!~" / "!=" 
     / "<<" / ">>" / "<=" / ">=" 
     / "[]=" / "[]" / "**"
     / "+" / "-" / "*" / "/" / "%" / "&" / "|" / "^" / "~"
     / "<" / ">" / "`")

// =============================================================================
// STRINGS (Complete with escapes)
// =============================================================================

StringLiteral
  = DoubleQuotedString
  / SingleQuotedString

DoubleQuotedString
  = '"' chars:DoubleQuotedChar* '"' {
      return processEscapes(chars.join(''));
    }

DoubleQuotedChar
  = !'"' !'\\' char:. { return char; }
  / '\\' char:. { return '\\' + char; }

SingleQuotedString
  = "'" chars:SingleQuotedChar* "'" {
      return processSingleEscapes(chars.join(''));
    }

SingleQuotedChar
  = !"'" !'\\' char:. { return char; }
  / '\\' char:. { return '\\' + char; }

// =============================================================================
// NUMBERS (Complete with all formats)
// =============================================================================

NumberLiteral
  = NonFiniteNumber
  / Float
  / Integer

NonFiniteNumber
  = neg:"-"? "Infinity" { 
      return handleNonFinite({ type: 'infinity', negative: neg !== null }); 
    }
  / "NaN" { 
      return handleNonFinite({ type: 'nan' }); 
    }

Float
  = neg:"-"? int:IntegerDigits "." frac:FractionalDigits exp:ExponentPart? {
      const numStr = (neg ?? '') + int + '.' + frac + (exp ?? '');
      return parseFloat(numStr.replace(/_/g, ''));
    }
  / neg:"-"? int:IntegerDigits exp:ExponentPart {
      const numStr = (neg ?? '') + int + exp;
      return parseFloat(numStr.replace(/_/g, ''));
    }

Integer
  = BinaryInteger
  / HexInteger
  / OctalInteger
  / DecimalInteger

BinaryInteger
  = neg:"-"? "0" [bB] digits:$[01_]+ {
      return parseInt((neg ?? '') + digits.replace(/_/g, ''), 2);
    }

HexInteger
  = neg:"-"? "0" [xX] digits:$[0-9a-fA-F_]+ {
      return parseInt((neg ?? '') + digits.replace(/_/g, ''), 16);
    }

OctalInteger
  = neg:"-"? "0" [oO] digits:$[0-7_]+ {
      return parseInt((neg ?? '') + digits.replace(/_/g, ''), 8);
    }
  / neg:"-"? "0" digits:$[0-7_]+ !("." / [89]) {
      return parseInt((neg ?? '') + digits.replace(/_/g, ''), 8);
    }

DecimalInteger
  = neg:"-"? digits:$([1-9] [0-9_]* / "0") {
      return parseInt((neg ?? '') + digits.replace(/_/g, ''), 10);
    }

IntegerDigits
  = $([0-9] [0-9_]*)

FractionalDigits
  = $[0-9_]+

ExponentPart
  = $([eE] [+-]? [0-9_]+)

// =============================================================================
// IDENTIFIERS
// =============================================================================

BareIdentifier
  = $([a-zA-Z_] [a-zA-Z0-9_]*)

IdentifierChar
  = [a-zA-Z0-9_]

// =============================================================================
// WHITESPACE
// =============================================================================

_
  = [ \t\n\r]*
