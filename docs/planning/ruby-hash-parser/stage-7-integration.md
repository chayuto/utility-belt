# Stage 7: Web UI Integration

**Document ID:** RHP-S7-2024-12-13  
**Parent:** [Main Plan](./2024-12-13-main.md)  
**Status:** Not Started  
**Duration:** 2 days  
**Dependencies:** Stage 6

---

## Objectives

1. Replace regex-based RubyToJSON tool with new parser
2. Add configuration UI for parser options
3. Implement real-time validation
4. Enhance error display with source highlighting
5. Add preset selector

---

## 7.1 Updated Component Architecture

### Component Structure

```
apps/web/src/tools/RubyToJSON/
├── index.tsx              # Main component (updated)
├── components/
│   ├── OptionsPanel.tsx   # Parser options UI
│   ├── PresetSelector.tsx # Preset dropdown
│   ├── ErrorDisplay.tsx   # Enhanced error view
│   └── InputEditor.tsx    # Input with highlighting
├── hooks/
│   ├── useParser.ts       # Parser hook with debounce
│   └── useOptions.ts      # Options state management
└── types.ts               # Local type definitions
```

---

## 7.2 Main Component Update

### File: `apps/web/src/tools/RubyToJSON/index.tsx`

```tsx
import { useState, useCallback } from 'react';
import { Copy, Check, Settings, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useParser } from './hooks/useParser';
import { useOptions } from './hooks/useOptions';
import { OptionsPanel } from './components/OptionsPanel';
import { PresetSelector } from './components/PresetSelector';
import { ErrorDisplay } from './components/ErrorDisplay';

export default function RubyToJSON() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const { options, updateOption, setPreset, resetOptions } = useOptions();
  const { output, error, isValid, isProcessing } = useParser(input, options);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [output]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ruby to JSON Converter
          </h1>
          <p className="text-gray-600 mt-1">
            Convert Ruby hash syntax to valid JSON format
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PresetSelector onSelect={setPreset} />
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showOptions
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-100 text-gray-600'
            )}
            title="Parser options"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Options Panel */}
      {showOptions && (
        <OptionsPanel
          options={options}
          onChange={updateOption}
          onReset={resetOptions}
        />
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="ruby-input"
              className="block text-sm font-medium text-gray-700"
            >
              Ruby Hash
            </label>
            {input && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  isValid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                )}
              >
                {isValid ? 'Valid' : 'Invalid'}
              </span>
            )}
          </div>
          <textarea
            id="ruby-input"
            className={cn(
              'w-full h-64 p-3 border rounded-lg resize-none font-mono text-sm',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              error && 'border-red-300 bg-red-50'
            )}
            placeholder={`{ :name => "Alice", age: 30, items: [1, 2, 3] }`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          
          {/* Error Display */}
          {error && <ErrorDisplay error={error} input={input} />}
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="json-output"
              className="block text-sm font-medium text-gray-700"
            >
              JSON Output
            </label>
            <button
              onClick={copyToClipboard}
              disabled={!output}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                output
                  ? 'hover:bg-gray-200 text-gray-600'
                  : 'text-gray-300 cursor-not-allowed'
              )}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <textarea
            id="json-output"
            className="w-full h-64 p-3 border border-gray-300 rounded-lg bg-gray-50 resize-none font-mono text-sm"
            readOnly
            value={output}
            placeholder="Converted JSON will appear here..."
          />
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="text-sm text-gray-500 text-center">
          Processing...
        </div>
      )}
    </div>
  );
}
```

---

## 7.3 Parser Hook

### File: `apps/web/src/tools/RubyToJSON/hooks/useParser.ts`

```typescript
import { useState, useEffect, useMemo } from 'react';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import {
  parse,
  toJSON,
  validate,
  RubyHashParseError,
  type ParserOptions,
} from '@utility-belt/ruby-hash-parser';

interface ParseResult {
  output: string;
  error: RubyHashParseError | null;
  isValid: boolean;
  isProcessing: boolean;
}

export function useParser(
  input: string,
  options: Partial<ParserOptions>
): ParseResult {
  const [output, setOutput] = useState('');
  const [error, setError] = useState<RubyHashParseError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Debounce input for performance
  const debouncedInput = useDebouncedValue(input, 150);

  // Memoize options to prevent unnecessary re-parses
  const optionsKey = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    setIsProcessing(true);

    // Use requestIdleCallback for non-blocking parsing
    const handle = requestIdleCallback(() => {
      try {
        const json = toJSON(debouncedInput, options);
        setOutput(json);
        setError(null);
      } catch (err) {
        setOutput('');
        if (err instanceof RubyHashParseError) {
          setError(err);
        } else {
          setError(
            new RubyHashParseError(
              err instanceof Error ? err.message : 'Unknown error',
              1,
              1,
              0,
              null,
              []
            )
          );
        }
      } finally {
        setIsProcessing(false);
      }
    });

    return () => cancelIdleCallback(handle);
  }, [debouncedInput, optionsKey]);

  const isValid = useMemo(() => {
    if (!input.trim()) return true;
    return validate(input, options).valid;
  }, [input, optionsKey]);

  return { output, error, isValid, isProcessing };
}
```

---

## 7.4 Options Hook

### File: `apps/web/src/tools/RubyToJSON/hooks/useOptions.ts`

```typescript
import { useState, useCallback } from 'react';
import {
  DEFAULT_OPTIONS,
  presets,
  type ParserOptions,
  type PresetName,
} from '@utility-belt/ruby-hash-parser';

interface UseOptionsReturn {
  options: Partial<ParserOptions>;
  updateOption: <K extends keyof ParserOptions>(
    key: K,
    value: ParserOptions[K]
  ) => void;
  setPreset: (preset: PresetName) => void;
  resetOptions: () => void;
}

export function useOptions(): UseOptionsReturn {
  const [options, setOptions] = useState<Partial<ParserOptions>>({});

  const updateOption = useCallback(
    <K extends keyof ParserOptions>(key: K, value: ParserOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setPreset = useCallback((preset: PresetName) => {
    setOptions(presets[preset]);
  }, []);

  const resetOptions = useCallback(() => {
    setOptions({});
  }, []);

  return { options, updateOption, setPreset, resetOptions };
}
```

---

## 7.5 Options Panel Component

### File: `apps/web/src/tools/RubyToJSON/components/OptionsPanel.tsx`

```tsx
import type { ParserOptions } from '@utility-belt/ruby-hash-parser';

interface OptionsPanelProps {
  options: Partial<ParserOptions>;
  onChange: <K extends keyof ParserOptions>(
    key: K,
    value: ParserOptions[K]
  ) => void;
  onReset: () => void;
}

export function OptionsPanel({ options, onChange, onReset }: OptionsPanelProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Parser Options</h3>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Reset to defaults
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Non-Finite Numbers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Infinity/NaN
          </label>
          <select
            value={options.nonFiniteNumbers ?? 'null'}
            onChange={(e) =>
              onChange('nonFiniteNumbers', e.target.value as any)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="null">Convert to null</option>
            <option value="string">Convert to string</option>
            <option value="literal">Keep literal (JSON5)</option>
            <option value="error">Throw error</option>
          </select>
        </div>

        {/* Object Behavior */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Object Inspect
          </label>
          <select
            value={options.objectBehavior ?? 'string'}
            onChange={(e) => onChange('objectBehavior', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="string">Keep as string</option>
            <option value="object">Parse to object</option>
          </select>
        </div>

        {/* Range Strategy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Range Objects
          </label>
          <select
            value={options.rangeStrategy ?? 'object'}
            onChange={(e) => onChange('rangeStrategy', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="object">Object (begin/end)</option>
            <option value="string">String ("1..10")</option>
            <option value="array">Expand to array</option>
          </select>
        </div>

        {/* BigDecimal Strategy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BigDecimal
          </label>
          <select
            value={options.bigDecimalStrategy ?? 'string'}
            onChange={(e) =>
              onChange('bigDecimalStrategy', e.target.value as any)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="string">String (preserves precision)</option>
            <option value="number">Number (may lose precision)</option>
            <option value="object">Object with metadata</option>
          </select>
        </div>

        {/* Set Strategy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Set Collections
          </label>
          <select
            value={options.setStrategy ?? 'array'}
            onChange={(e) => onChange('setStrategy', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="array">Convert to array</option>
            <option value="object">Object with type</option>
          </select>
        </div>

        {/* Cyclic Strategy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cyclic References
          </label>
          <select
            value={options.cyclicStrategy ?? 'sentinel'}
            onChange={(e) => onChange('cyclicStrategy', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="sentinel">[Circular] marker</option>
            <option value="null">Convert to null</option>
            <option value="error">Throw error</option>
          </select>
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-4 flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={options.allowImplicitHash ?? true}
            onChange={(e) => onChange('allowImplicitHash', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-gray-700">Allow implicit hash (no braces)</span>
        </label>
      </div>
    </div>
  );
}
```

---

## 7.6 Error Display Component

### File: `apps/web/src/tools/RubyToJSON/components/ErrorDisplay.tsx`

```tsx
import { AlertCircle } from 'lucide-react';
import type { RubyHashParseError } from '@utility-belt/ruby-hash-parser';

interface ErrorDisplayProps {
  error: RubyHashParseError;
  input: string;
}

export function ErrorDisplay({ error, input }: ErrorDisplayProps) {
  const lines = input.split('\n');
  const errorLine = lines[error.line - 1] || '';
  const startLine = Math.max(0, error.line - 2);
  const endLine = Math.min(lines.length, error.line + 1);

  return (
    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">Parse Error</p>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>

          {/* Source Context */}
          <div className="mt-3 font-mono text-xs bg-red-100 rounded p-2 overflow-x-auto">
            {lines.slice(startLine, endLine).map((line, i) => {
              const lineNum = startLine + i + 1;
              const isErrorLine = lineNum === error.line;
              return (
                <div key={lineNum}>
                  <div
                    className={
                      isErrorLine ? 'text-red-900 font-bold' : 'text-red-700'
                    }
                  >
                    <span className="inline-block w-8 text-right mr-2 opacity-50">
                      {lineNum}
                    </span>
                    {line || ' '}
                  </div>
                  {isErrorLine && (
                    <div className="text-red-500">
                      <span className="inline-block w-8 mr-2" />
                      {' '.repeat(Math.max(0, error.column - 1))}^
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expected/Found */}
          {error.expected.length > 0 && (
            <p className="text-xs text-red-600 mt-2">
              Expected: {error.expected.slice(0, 5).join(', ')}
              {error.expected.length > 5 && '...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 7.7 Preset Selector Component

### File: `apps/web/src/tools/RubyToJSON/components/PresetSelector.tsx`

```tsx
import { presets, type PresetName } from '@utility-belt/ruby-hash-parser';

interface PresetSelectorProps {
  onSelect: (preset: PresetName) => void;
}

const PRESET_LABELS: Record<PresetName, { label: string; description: string }> = {
  strict: {
    label: 'Strict JSON',
    description: 'Valid JSON output, null for special values',
  },
  preserving: {
    label: 'Preserving',
    description: 'Maximum data preservation with type info',
  },
  json5: {
    label: 'JSON5',
    description: 'JSON5 compatible with Infinity/NaN',
  },
  lenient: {
    label: 'Lenient',
    description: 'For parsing console/debug output',
  },
  pedantic: {
    label: 'Pedantic',
    description: 'Throws on any edge case',
  },
};

export function PresetSelector({ onSelect }: PresetSelectorProps) {
  return (
    <select
      onChange={(e) => onSelect(e.target.value as PresetName)}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
      defaultValue=""
    >
      <option value="" disabled>
        Load preset...
      </option>
      {Object.entries(PRESET_LABELS).map(([key, { label, description }]) => (
        <option key={key} value={key} title={description}>
          {label}
        </option>
      ))}
    </select>
  );
}
```

---

## 7.8 Package Integration

### Update `apps/web/package.json`

```json
{
  "dependencies": {
    "@utility-belt/ruby-hash-parser": "workspace:*"
  }
}
```

### Update workspace root

```bash
pnpm install
```

---

## Deliverables Checklist

- [ ] RubyToJSON component updated
- [ ] Parser hook with debouncing
- [ ] Options panel with all settings
- [ ] Preset selector dropdown
- [ ] Enhanced error display
- [ ] Real-time validation indicator
- [ ] Package dependency added
- [ ] Manual testing complete

---

## Exit Criteria

1. Tool uses new parser library
2. All parser options accessible via UI
3. Errors display with source context
4. Presets work correctly
5. Performance acceptable (no lag on typing)
6. Existing functionality preserved

---

## Testing Checklist

### Functional Tests

- [ ] Basic hash parsing works
- [ ] Mixed syntax (rocket + JSON-style) works
- [ ] Nested structures work
- [ ] All presets apply correctly
- [ ] Options persist during session
- [ ] Copy to clipboard works
- [ ] Error messages are helpful

### Edge Cases

- [ ] Empty input shows no error
- [ ] Invalid input shows error with location
- [ ] Very large input doesn't freeze UI
- [ ] Special characters handled
- [ ] Unicode strings work

### Performance

- [ ] Typing doesn't lag
- [ ] Large inputs parse within 1 second
- [ ] Memory usage reasonable

---

## Navigation

← [Stage 6: API](./stage-6-api.md) | [Main Plan](./2024-12-13-main.md)
