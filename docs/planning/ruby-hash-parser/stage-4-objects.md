# Stage 4: Complex Object Structures

**Document ID:** RHP-S4-2024-12-13  
**Parent:** [Main Plan](./2024-12-13-main.md)  
**Status:** Not Started  
**Duration:** 4-5 days  
**Dependencies:** Stages 2, 3

---

## Objectives

1. Parse `#<Object>` inspect notation with instance variables
2. Handle Set, Struct, Time, Date classes
3. Implement Range object conversion
4. Detect and handle cyclic references

---

## 4.1 Object Inspect Notation

Ruby objects that don't override `inspect` produce a standard format showing class name, memory address, and instance variables.

### Format Analysis

```ruby
class User
  def initialize(name, age)
    @name = name
    @age = age
  end
end

User.new("Alice", 30).inspect
# => "#<User:0x00007f9a1234 @name=\"Alice\", @age=30>"
```

### Variations

| Format | Example | Notes |
|--------|---------|-------|
| Basic | `#<User:0x7f9a>` | No instance vars |
| With ivars | `#<User:0x7f9a @name="Alice">` | Space-separated |
| With commas | `#<User:0x7f9a @name="Alice", @age=30>` | Comma-separated |
| Nested | `#<Order:0x1 @user=#<User:0x2 @name="Bob">>` | Recursive |
| Custom | `#<User name="Alice">` | No address (custom inspect) |

### Grammar Rules

```peggy
// =============================================================================
// OBJECT INSPECT NOTATION
// =============================================================================

ObjectInspect
  = "#<" content:ObjectInspectContent ">" {
      return content;
    }

ObjectInspectContent
  = StructInspect
  / SetInspect
  / BigDecimalInspect
  / GenericObjectInspect

// Generic object: #<ClassName:address @ivar=value ...>
GenericObjectInspect
  = className:ClassName address:(":" @HexAddress)? _ ivars:InstanceVarList? {
      return {
        type: 'object_inspect',
        className,
        address: address ?? null,
        instanceVars: ivars ?? [],
        raw: text(),
      };
    }

ClassName
  = $("::"? [A-Z] [a-zA-Z0-9_]* ("::" [A-Z] [a-zA-Z0-9_]*)*)

HexAddress
  = $("0x"? [0-9a-fA-F]+)

InstanceVarList
  = head:InstanceVar tail:(InstanceVarSep @InstanceVar)* {
      return [head, ...tail];
    }

InstanceVarSep
  = _ "," _
  / _

InstanceVar
  = "@" name:BareIdentifier "=" value:Value {
      return { name, value };
    }
```

### Configuration Options

```typescript
interface ParserOptions {
  /**
   * Handling of #<Object...> inspect output.
   * - 'string': Return raw string "#<...>"
   * - 'object': Parse instance variables into object
   * @default 'string'
   */
  objectBehavior: 'string' | 'object';
}
```

### Transformer Logic

```typescript
export function coerceObjectInspect(
  node: ObjectInspectNode,
  strategy: 'string' | 'object'
): unknown {
  if (strategy === 'string') {
    return `#<${node.raw}>`;
  }

  // Build object from instance variables
  const result: Record<string, unknown> = {
    __class__: node.className,
  };

  if (node.address) {
    result.__address__ = node.address;
  }

  for (const ivar of node.instanceVars) {
    result[ivar.name] = ivar.value;
  }

  return result;
}
```

### Test Cases

```typescript
describe('Object Inspect Notation', () => {
  describe('String Strategy (default)', () => {
    it('returns raw string', () => {
      const input = '{user: #<User:0x7f9a @name="Alice">}';
      expect(parse(input)).toEqual({
        user: '#<User:0x7f9a @name="Alice">',
      });
    });
  });

  describe('Object Strategy', () => {
    const opts = { objectBehavior: 'object' as const };

    it('extracts class name', () => {
      const result = parse('{obj: #<User:0x7f9a>}', opts);
      expect(result.obj.__class__).toBe('User');
    });

    it('extracts address', () => {
      const result = parse('{obj: #<User:0x7f9a>}', opts);
      expect(result.obj.__address__).toBe('0x7f9a');
    });

    it('extracts instance variables', () => {
      const result = parse('{obj: #<User:0x7f9a @name="Alice" @age=30>}', opts);
      expect(result.obj.name).toBe('Alice');
      expect(result.obj.age).toBe(30);
    });

    it('handles comma-separated ivars', () => {
      const result = parse('{obj: #<User:0x7f9a @name="Alice", @age=30>}', opts);
      expect(result.obj.name).toBe('Alice');
      expect(result.obj.age).toBe(30);
    });

    it('handles nested objects', () => {
      const input = '{order: #<Order:0x1 @user=#<User:0x2 @name="Bob">>}';
      const result = parse(input, opts);
      expect(result.order.user.__class__).toBe('User');
      expect(result.order.user.name).toBe('Bob');
    });

    it('handles namespaced classes', () => {
      const result = parse('{obj: #<Admin::User:0x1>}', opts);
      expect(result.obj.__class__).toBe('Admin::User');
    });
  });
});
```

---

## 4.2 Set Class

Ruby's `Set` class has a distinctive inspect format.

### Format

```ruby
require 'set'
Set.new([1, 2, 3]).inspect
# => "#<Set: {1, 2, 3}>"
```

### Grammar Rule

```peggy
SetInspect
  = "Set:" _ "{" _ elements:ElementList? _ "}" {
      return {
        type: 'set',
        elements: elements ?? [],
      };
    }
```

### Configuration

```typescript
interface ParserOptions {
  /**
   * Handling of Set collections.
   * - 'array': Convert to array [1, 2, 3]
   * - 'object': { __type__: 'set', values: [1, 2, 3] }
   * @default 'array'
   */
  setStrategy: 'array' | 'object';
}
```

### Test Cases

```typescript
describe('Set Class', () => {
  it('converts to array by default', () => {
    expect(parse('{items: #<Set: {1, 2, 3}>}')).toEqual({
      items: [1, 2, 3],
    });
  });

  it('converts to object with object strategy', () => {
    expect(parse('{items: #<Set: {1, 2, 3}>}', { setStrategy: 'object' }))
      .toEqual({
        items: { __type__: 'set', values: [1, 2, 3] },
      });
  });

  it('handles empty set', () => {
    expect(parse('{items: #<Set: {}>}')).toEqual({ items: [] });
  });

  it('handles nested values', () => {
    expect(parse('{items: #<Set: {{a: 1}, {b: 2}}>}')).toEqual({
      items: [{ a: 1 }, { b: 2 }],
    });
  });
});
```

---

## 4.3 Struct Objects

Ruby Struct has a unique inspect format.

### Format

```ruby
User = Struct.new(:name, :age)
User.new("Alice", 30).inspect
# => "#<struct User name=\"Alice\", age=30>"
```

### Grammar Rule

```peggy
StructInspect
  = "struct" _ name:ClassName _ members:StructMemberList {
      return {
        type: 'struct',
        name,
        members,
      };
    }

StructMemberList
  = head:StructMember tail:(_ "," _ @StructMember)* {
      return [head, ...tail];
    }

StructMember
  = name:BareIdentifier "=" value:Value {
      return { name, value };
    }
```

### Transformer

```typescript
export function coerceStruct(
  node: { type: 'struct'; name: string; members: Array<{ name: string; value: unknown }> }
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    __struct__: node.name,
  };

  for (const member of node.members) {
    result[member.name] = member.value;
  }

  return result;
}
```

### Test Cases

```typescript
describe('Struct Objects', () => {
  it('parses struct with members', () => {
    const input = '{user: #<struct User name="Alice", age=30>}';
    expect(parse(input)).toEqual({
      user: {
        __struct__: 'User',
        name: 'Alice',
        age: 30,
      },
    });
  });

  it('handles anonymous struct', () => {
    const input = '{point: #<struct x=10, y=20>}';
    expect(parse(input)).toEqual({
      point: {
        __struct__: null,
        x: 10,
        y: 20,
      },
    });
  });
});
```

---

## 4.4 Range Objects

Ruby ranges use `..` (inclusive) or `...` (exclusive) syntax.

### Format

```ruby
(1..10).inspect   # => "1..10"
(1...10).inspect  # => "1...10"
('a'..'z').inspect # => "\"a\"..\"z\""
```

### Grammar Rule

```peggy
RangeLiteral
  = begin:RangeEndpoint ".." exclude:"."? end:RangeEndpoint {
      return {
        type: 'range',
        begin,
        end,
        excludeEnd: exclude !== null,
      };
    }

RangeEndpoint
  = NumberLiteral
  / StringLiteral
  / Symbol
```

### Configuration

```typescript
interface ParserOptions {
  /**
   * Handling of Range objects (1..10).
   * - 'object': { begin: 1, end: 10, exclude_end: false }
   * - 'string': "1..10"
   * - 'array': [1, 2, ..., 10] (dangerous for large ranges)
   * @default 'object'
   */
  rangeStrategy: 'object' | 'string' | 'array';
}
```

### Transformer Logic

```typescript
export function coerceRange(
  node: RangeNode,
  strategy: 'object' | 'string' | 'array'
): unknown {
  switch (strategy) {
    case 'object':
      return {
        begin: node.begin,
        end: node.end,
        exclude_end: node.excludeEnd,
      };

    case 'string':
      const op = node.excludeEnd ? '...' : '..';
      return `${node.begin}${op}${node.end}`;

    case 'array':
      // Only safe for numeric ranges
      if (typeof node.begin !== 'number' || typeof node.end !== 'number') {
        throw new Error('Array expansion only supported for numeric ranges');
      }
      const result: number[] = [];
      const limit = node.excludeEnd ? node.end : node.end + 1;
      if (limit - node.begin > 10000) {
        throw new Error('Range too large for array expansion (max 10000)');
      }
      for (let i = node.begin; i < limit; i++) {
        result.push(i);
      }
      return result;
  }
}
```

### Test Cases

```typescript
describe('Range Objects', () => {
  describe('Object Strategy (default)', () => {
    it('parses inclusive range', () => {
      expect(parse('{r: 1..10}')).toEqual({
        r: { begin: 1, end: 10, exclude_end: false },
      });
    });

    it('parses exclusive range', () => {
      expect(parse('{r: 1...10}')).toEqual({
        r: { begin: 1, end: 10, exclude_end: true },
      });
    });

    it('parses string range', () => {
      expect(parse('{r: "a".."z"}')).toEqual({
        r: { begin: 'a', end: 'z', exclude_end: false },
      });
    });
  });

  describe('String Strategy', () => {
    it('returns string representation', () => {
      expect(parse('{r: 1..10}', { rangeStrategy: 'string' }))
        .toEqual({ r: '1..10' });
    });

    it('preserves exclusive marker', () => {
      expect(parse('{r: 1...10}', { rangeStrategy: 'string' }))
        .toEqual({ r: '1...10' });
    });
  });

  describe('Array Strategy', () => {
    it('expands inclusive range', () => {
      expect(parse('{r: 1..5}', { rangeStrategy: 'array' }))
        .toEqual({ r: [1, 2, 3, 4, 5] });
    });

    it('expands exclusive range', () => {
      expect(parse('{r: 1...5}', { rangeStrategy: 'array' }))
        .toEqual({ r: [1, 2, 3, 4] });
    });

    it('throws for large ranges', () => {
      expect(() => parse('{r: 1..100000}', { rangeStrategy: 'array' }))
        .toThrow('Range too large');
    });

    it('throws for non-numeric ranges', () => {
      expect(() => parse('{r: "a".."z"}', { rangeStrategy: 'array' }))
        .toThrow('only supported for numeric');
    });
  });
});
```

---

## 4.5 Time/Date Objects

Time objects may appear without quotes in some inspect contexts.

### Formats

```ruby
Time.now.inspect
# => "2024-12-13 15:30:45 +0000"

Date.today.inspect
# => "#<Date: 2024-12-13 ...>"
```

### Grammar Rule

```peggy
// Unquoted timestamp (from pp or custom inspect)
Timestamp
  = year:Year "-" month:Month "-" day:Day 
    " " hour:Hour ":" minute:Minute ":" second:Second
    tz:(" " @Timezone)? {
      return {
        type: 'timestamp',
        value: `${year}-${month}-${day}T${hour}:${minute}:${second}`,
        timezone: tz,
      };
    }

Year = $[0-9]{4}
Month = $[0-9]{2}
Day = $[0-9]{2}
Hour = $[0-9]{2}
Minute = $[0-9]{2}
Second = $[0-9]{2}
Timezone = $([+-] [0-9]{4})
```

### Transformer

```typescript
export function coerceTimestamp(
  node: TimestampNode
): string {
  // Convert to ISO 8601 format
  let iso = node.value;
  
  if (node.timezone) {
    // Convert +0000 to +00:00
    const tz = node.timezone;
    iso += `${tz.slice(0, 3)}:${tz.slice(3)}`;
  } else {
    iso += 'Z';
  }
  
  return iso;
}
```

---

## 4.6 Cyclic Reference Detection

Ruby's inspect detects cycles and outputs `{...}` or `[...]`.

### Format

```ruby
h = {}
h[:self] = h
h.inspect
# => "{:self=>{...}}"

a = []
a << a
a.inspect
# => "[[...]]"
```

### Grammar Rule

```peggy
CyclicHashRef
  = "{" _ "..." _ "}" {
      return { type: 'cyclic_ref', refType: 'hash' };
    }

CyclicArrayRef
  = "[" _ "..." _ "]" {
      return { type: 'cyclic_ref', refType: 'array' };
    }
```

### Configuration

```typescript
interface ParserOptions {
  /**
   * Handling of cyclic references ({...}).
   * - 'sentinel': Return "[Circular]" string
   * - 'null': Return null
   * - 'error': Throw CyclicReferenceError
   * @default 'sentinel'
   */
  cyclicStrategy: 'sentinel' | 'null' | 'error';
}
```

### Test Cases

```typescript
describe('Cyclic References', () => {
  describe('Sentinel Strategy (default)', () => {
    it('returns sentinel for hash cycle', () => {
      expect(parse('{self: {...}}')).toEqual({
        self: '[Circular]',
      });
    });

    it('returns sentinel for array cycle', () => {
      expect(parse('{items: [[...]]}')).toEqual({
        items: [['[Circular]']],
      });
    });
  });

  describe('Null Strategy', () => {
    it('returns null for cycles', () => {
      expect(parse('{self: {...}}', { cyclicStrategy: 'null' }))
        .toEqual({ self: null });
    });
  });

  describe('Error Strategy', () => {
    it('throws for cycles', () => {
      expect(() => parse('{self: {...}}', { cyclicStrategy: 'error' }))
        .toThrow('Cyclic');
    });
  });
});
```

---

## Deliverables Checklist

- [ ] Object inspect parser with instance variables
- [ ] Set class conversion
- [ ] Struct parsing
- [ ] Range object handling (all strategies)
- [ ] Time/Date recognition
- [ ] Cyclic reference detection
- [ ] Comprehensive test suite

---

## Exit Criteria

1. All complex object types parse correctly
2. Configuration strategies work as documented
3. Nested complex objects handled recursively
4. Test coverage > 90%

---

## Navigation

← [Stage 3: Numerics](./stage-3-numerics.md) | [Stage 5: Robustness](./stage-5-robustness.md) →
